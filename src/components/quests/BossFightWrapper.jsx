import React, { useMemo, useState } from 'react';
import { useQuests } from '../../hooks/useQuests';

/**
 * BossFightWrapper
 * Resolves a quest boss and applies aggregated boss modifiers to produce an adapted monster.
 * Integration note: This component does NOT render the fight UI itself. It prepares the boss.
 * You can pass the resulting monster to your existing flow (e.g., set as current monster, then start fight).
 */
export default function BossFightWrapper({ questId, selectedChallenge, onPrepared, onCancel }) {
  const { getQuestById, getBossDefinition, aggregateBossMods, getProgress } = useQuests();
  const quest = getQuestById(questId);
  const bossDef = getBossDefinition(quest?.bossRef);
  const bossMods = aggregateBossMods(questId);
  const [error, setError] = useState(null);
  const progress = getProgress(questId);

  const adaptedMonster = useMemo(() => {
    if (!bossDef) return null;
    try {
      // Base from template id or overrides; for now, rely on overrides as complete
      const base = { name: `${bossDef.name} (Quest Boss)`, ...(bossDef.overrides || {}) };
      const monster = { ...base };
      monster.__questBoss = true;
      monster.__questId = questId;

      // Compute HP from boss overrides.hp hit die and difficulty scaling
      // overrides.hp may be a string like "d8" or a number like 8
      const hpSpec = bossDef?.overrides?.hp;
      let dieFaces = 0;
      if (typeof hpSpec === 'string') {
        // Accept formats like "d8" or just "8"
        const mDie = hpSpec.match(/d\s*(\d+)/i);
        if (mDie) dieFaces = parseInt(mDie[1], 10);
        else if (/^\d+$/.test(hpSpec.trim())) dieFaces = parseInt(hpSpec.trim(), 10);
      } else if (typeof hpSpec === 'number') {
        dieFaces = Math.max(0, Math.floor(hpSpec));
      }
      // Fallback if missing or invalid
      if (!dieFaces || Number.isNaN(dieFaces)) dieFaces = 6; // sensible default

      // Quest difficulty mapping
      const questDiffScaleMap = {
        easy: 0.75,
        standard: 1.0,
        hard: 1.25,
        deadly: 1.5
      };
      const questScale = questDiffScaleMap[String(quest?.difficulty || 'standard')] || 1.0;

      // Challenge difficulty numeric mapping (from ChallengeSelector)
      const challengeNumericMap = {
        patheticCreatures: 1,
        veryWeakCreatures: 2,
        weakCreatures: 3,
        standardCreatures: 4,
        strongCreatures: 5,
        veryStrongCreatures: 6,
        extremeCreatures: 7
      };
      const challengeKey = selectedChallenge || 'standardCreatures';
      const challengeFactor = challengeNumericMap[challengeKey] || 4;

      const baseHpCalc = Math.ceil(dieFaces * questScale * challengeFactor);
      let finalHp = Math.max(1, baseHpCalc);

      if (typeof bossMods.bossHpDelta === 'number') {
        finalHp = Math.max(0, finalHp + Number(bossMods.bossHpDelta || 0));
      }
      monster.hp = finalHp;
      monster.maxHp = finalHp;

      // Apply simple deltas
      if (typeof bossMods.bossACDelta === 'number') {
        const ac = Number(monster['Armor Class'] ?? monster.AC ?? 10);
        monster['Armor Class'] = ac + bossMods.bossACDelta;
      }
      // HP is already computed from formula above; keep hp/maxHp in sync

      // Attack bonus delta: bake into the Attack string (e.g., "+3" -> "+4")
      if (typeof bossMods.bossAttackBonusDelta === 'number') {
        const atkStr = String(monster.Attack || '+0');
        const match = atkStr.match(/([+-]?)(\d+)/);
        if (match) {
          const sign = match[1] === '-' ? -1 : 1;
          const base = parseInt(match[2], 10) * sign;
          const adj = base + bossMods.bossAttackBonusDelta;
          const newStr = `${adj >= 0 ? '+' : ''}${adj}`;
          monster.Attack = atkStr.replace(/^[^0-9+-]*[+-]?\d+/, newStr);
        } else {
          const adj = bossMods.bossAttackBonusDelta;
          monster.Attack = `${atkStr} ${adj >= 0 ? '+' : ''}${adj}`.trim();
        }
      }

      // Damage adjustments
      if (bossMods.damageOverride) {
        monster.Damage = bossMods.damageOverride;
      } else if (bossMods.bossDamageDice) {
        const baseDmg = monster.Damage || monster.damage || '1d4';
        monster.Damage = `${baseDmg}${bossMods.bossDamageDice}`;
      }

      // Status effects omitted in MVP; integrate with combat state if needed later.

      return monster;
    } catch (e) {
      setError(e);
      return null;
    }
  }, [bossDef, bossMods]);

  if (!quest) return <div>Quest not found.</div>;
  if (!bossDef) return <div>Boss not found.</div>;
  if (error) return <div style={{ color: 'salmon' }}>Failed to adapt boss.</div>;

  return (
    <div className="boss-fight-wrapper" style={{ border: '1px solid #444', padding: 12, borderRadius: 8 }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>Preparing Boss Fight</div>
      <div>Boss: {bossDef.name} <span style={{ color: '#9cf' }}>(Quest Boss)</span></div>

      {/* Modifiers Preview */}
      <div style={{ marginTop: 8 }}>
        <div style={{ fontWeight: 600 }}>Applied Modifiers</div>
        <ul style={{ margin: '6px 0 0 18px' }}>
          {typeof bossMods.bossACDelta === 'number' && <li>Boss Monster AC: {bossMods.bossACDelta >= 0 ? '+' : ''}{bossMods.bossACDelta}</li>}
          {typeof bossMods.bossHpDelta === 'number' && <li>Boss Monster HP: {bossMods.bossHpDelta >= 0 ? '+' : ''}{bossMods.bossHpDelta}</li>}
          {typeof bossMods.bossAttackBonusDelta === 'number' && <li>Boss Monster Attack Bonus: {bossMods.bossAttackBonusDelta >= 0 ? '+' : ''}{bossMods.bossAttackBonusDelta}</li>}
          {bossMods.damageOverride && <li>Boss Damage set to: {bossMods.damageOverride}</li>}
          {!bossMods.damageOverride && bossMods.bossDamageDice && <li>Boss monster damage increased by: {bossMods.bossDamageDice}</li>}
          {!bossMods || (Object.keys(bossMods).length === 0) ? <li>No modifiers</li> : null}
        </ul>
      </div>

      {/* Quest Log */}
      {progress?.outcomes?.length ? (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontWeight: 600 }}>Quest Log</div>
          <ul style={{ margin: '6px 0 0 18px' }}>
            {progress.outcomes.map((o, idx) => {
              const ch = quest?.challenges?.find(c => c.id === o.challengeId);
              return (
                <li key={idx}>
                  {ch?.title || o.challengeId}: {o.success ? 'Success' : 'Failure'}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
      <div style={{ marginTop: 8 }}>
        <button onClick={() => onPrepared?.(adaptedMonster, { bossMods })} disabled={!adaptedMonster}>Use This Boss</button>
        <button style={{ marginLeft: 8 }} onClick={() => onCancel?.()}>Cancel</button>
      </div>
    </div>
  );
}

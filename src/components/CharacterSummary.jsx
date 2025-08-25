import React from 'react';
import { formatGp } from '../utils/currency';
import { useGearEffects } from '../hooks/useGearEffects';
import InfoIcon from './InfoIcon';
// import birthAugers from '../data/birth_augers.json';

const CharacterSummary = ({ character }) => {
  if (!character) return null;
  // Monster summary logic
  const monster = character.monster || null;
  const abilityList = [
    'Strength',
    'Agility',
    'Stamina',
    'Personality',
    'Intelligence',
    'Luck'
  ];
  // Use gear-aware AC calculation
  const gearEffects = useGearEffects(character);
  const AC = gearEffects.totalArmorClass;
  const speed = 20;
  const init = character.modifiers ? character.modifiers['Agility'] : 0;
  const ref = character.modifiers ? character.modifiers['Agility'] : 0;
  const fort = character.modifiers ? character.modifiers['Stamina'] : 0;
  const will = character.modifiers ? character.modifiers['Personality'] : 0;
  // Equipment and Trade Goods from occupation
  const equipment = character.occupation?.['Trained Weapon'] || '';
  const tradeGood = character.occupation?.['Trade Goods'] || '';
  const startingFunds = character.startingFunds;
  const luckySign = character.luckySign;
  const languages = character.languages;
  const racialTraits = character.racialTraits || 'None';

  // HP bar logic
  const maxHp = character.maxHp || character.hp;
  const currentHp = character.hp;
  const hpPercent = Math.max(0, Math.min(100, Math.round((currentHp / maxHp) * 100)));
  const acText = gearEffects?.acBreakdown
    ? `10 + Agi ${gearEffects.acBreakdown.agilityMod >= 0 ? '+' : ''}${gearEffects.acBreakdown.agilityMod}` +
      ` + Armor ${gearEffects.acBreakdown.armorBonus}` +
      (gearEffects.acBreakdown.gearACBonus ? ` + Gear ${gearEffects.acBreakdown.gearACBonus}` : '') +
      ` = ${gearEffects.acBreakdown.total}`
    : '';

  return (
    <div style={{border: '1px solid #ccc', padding: '1em', margin: '1em 0'}}>
      <h3>Character Summary</h3>
      <div><strong>Name:</strong> {character.name || 'Unknown'}</div>
      <div><strong>Alignment:</strong> {character.alignment || 'Unknown'}</div>
      <div><strong>Battles Won:</strong> {character.battlesWon || 0}</div>
      {character.battlesWonByLevel && Object.entries(character.battlesWonByLevel).filter(([level, count]) => count > 0).length > 0 && (
        <div style={{ margin: '0.5em 0' }}>
          <strong>Battles Won by Challenge Level:</strong>
          <ul style={{ margin: 0 }}>
            {Object.entries(character.battlesWonByLevel)
              .filter(([level, count]) => count > 0)
              .map(([level, count]) => (
                <li key={level}>{level.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}: {count}</li>
              ))}
          </ul>
        </div>
      )}
      <div><strong>0-level Occupation:</strong> {character.occupation?.Occupation || 'Unknown'}</div>
      {abilityList.map(ab => {
        const mod = character.modifiers ? character.modifiers[ab] : 0;
        const modStr = mod > 0 ? `+${mod}` : `${mod}`;
        // Show updated Luck value
        if (ab === 'Luck') {
          return <div key={ab}>{ab}: {character.Luck} ({modStr})</div>;
        }
        return <div key={ab}>{ab}: {character[ab]} ({modStr})</div>;
      })}
      <br />
      <div>
        AC: {AC}
        {gearEffects?.acBreakdown && <span style={{ marginLeft: 6 }}><InfoIcon text={acText} /></span>}
      </div>
      {gearEffects?.acBreakdown && (
        <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
          {`10 + Agi ${gearEffects.acBreakdown.agilityMod >= 0 ? '+' : ''}${gearEffects.acBreakdown.agilityMod}`}
          {` + Armor ${gearEffects.acBreakdown.armorBonus}`}
          {gearEffects.acBreakdown.gearACBonus ? ` + Gear ${gearEffects.acBreakdown.gearACBonus}` : ''}
          {` = ${gearEffects.acBreakdown.total}`}
        </div>
      )}
      {(gearEffects?.checkPenaltyTotal || gearEffects?.armorFumbleDie) && (
        <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
          {typeof gearEffects.checkPenaltyTotal === 'number' ? `Check Penalty: ${gearEffects.checkPenaltyTotal}` : ''}
          {gearEffects.armorFumbleDie ? `${typeof gearEffects.checkPenaltyTotal === 'number' ? ' • ' : ''}Fumble: ${gearEffects.armorFumbleDie}` : ''}
        </div>
      )}
      <div style={{ margin: '0.5em 0' }}>
        <strong>HP:</strong> {currentHp} / {maxHp}
        <div style={{ background: '#eee', borderRadius: '6px', height: '18px', width: '100%', marginTop: '4px', boxShadow: 'inset 0 1px 2px #aaa' }}>
          <div style={{ width: `${hpPercent}%`, height: '100%', background: hpPercent > 50 ? '#4caf50' : hpPercent > 20 ? '#ff9800' : '#f44336', borderRadius: '6px', transition: 'width 0.3s' }} />
        </div>
      </div>
      <div>Weapon: {character.weapon?.name} +0 ({character.weapon?.damage})</div>
      <div>Speed: {speed}; Init: {init}; Ref: {ref}; Fort: {fort}; Will: {will}</div>
      {/* Monster summary section */}
      {monster && (
        <div className="monster-summary" style={{marginTop: '1em', borderTop: '1px solid #aaa', paddingTop: '1em'}}>
          <h3>Monster Summary</h3>
          <div><strong>HP:</strong> {`${Number(monster.hp ?? 0)} / ${Number(monster.maxHp ?? monster.hp ?? 0)}`}</div>
          <div><strong>AC:</strong> {monster["Armor Class"] || monster.armor}</div>
          <div><strong>Attack Type:</strong> {monster.AttackType ? monster.AttackType : (monster.attack ? 'Weapon' : '')}</div>
          <div><strong>Attack Bonus:</strong> {typeof monster.Attack === 'string' ? monster.Attack : (monster.attack || '')}</div>
          <div><strong>Damage:</strong> {monster.Damage || monster.damage}</div>
        </div>
      )}
      <br />
  <div>Trained Weapon: {equipment}</div>
      <div>Trade good: {tradeGood}</div>
      <div>Starting Funds: {startingFunds}</div>
      <div>Current Funds: {formatGp(character.funds_cp || 0)}</div>
      <div>Lucky sign: {luckySign}</div>
      <div>Languages: {languages}</div>
      <div>Racial Traits: {racialTraits}</div>
    </div>
  );
};

export default CharacterSummary;

import React from 'react';
import AchievementBadge from './AchievementBadge';
import CharacterUrlShare from './CharacterUrlShare';
import GearSlots from './GearSlots';
import { useGearEffects, getModifiedAbilities, getModifiedWeaponDamage } from '../hooks/useGearEffects';
import InfoIcon from './InfoIcon';

const EnhancedCharacterSummary = ({ character, charHp, achievements = [], stats = {}, onCharacterChange }) => {
  if (!character) return null;

  // Calculate gear effects
  const gearEffects = useGearEffects(character);
  const modifiedStats = getModifiedAbilities(character, gearEffects);
  const modifiedWeaponDamage = getModifiedWeaponDamage(character, gearEffects);

  const abilityList = ['Strength', 'Agility', 'Stamina', 'Personality', 'Intelligence', 'Luck'];
  const AC = gearEffects.totalArmorClass;
  const maxHp = character.maxHp || character.hp;
  const currentHp = charHp !== null ? charHp : character.hp;
  const hpPercent = Math.max(0, Math.min(100, Math.round((currentHp / maxHp) * 100)));

  const cardStyle = {
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    borderRadius: '12px',
    padding: '20px',
    margin: '16px 0',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  };

  // Determine currently equipped weapon from gear slots (fallback to legacy character.weapon)
  const meleeWeapon = character.gearSlots?.meleeWeapon;
  const rangedWeapon = character.gearSlots?.rangedWeapon;
  const rightHand = character.gearSlots?.rightHand;
  const equippedWeapon = meleeWeapon || rangedWeapon || rightHand || null;
  const equippedWeaponName = equippedWeapon?.name || character.weapon?.name || 'Unarmed';
  const baseWeaponDamage = (equippedWeapon && equippedWeapon.effects && equippedWeapon.effects.damage)
    ? equippedWeapon.effects.damage
    : (character.weapon && character.weapon.damage) ? character.weapon.damage : '1d4';

  const sectionStyle = {
    background: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '8px',
    padding: '12px',
    margin: '8px 0',
    border: '1px solid rgba(0, 0, 0, 0.1)'
  };

  const statGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '8px',
    margin: '8px 0'
  };

  const statItemStyle = {
    background: 'rgba(255, 255, 255, 0.9)',
    padding: '8px',
    borderRadius: '6px',
    textAlign: 'center',
    border: '1px solid rgba(0, 0, 0, 0.1)'
  };

  const combatStatStyle = {
    ...statItemStyle,
    background: 'rgba(76, 175, 80, 0.1)',
    border: '1px solid rgba(76, 175, 80, 0.3)',
    fontWeight: 'bold',
    position: 'relative'
  };

  const abilityStyle = {
    ...statItemStyle,
    background: 'rgba(52, 152, 219, 0.1)',
    border: '1px solid rgba(52, 152, 219, 0.3)',
    textAlign: 'center'
  };

  // Helper to build AC breakdown text
  const acText = gearEffects?.acBreakdown
    ? `10 + Agi ${gearEffects.acBreakdown.agilityMod >= 0 ? '+' : ''}${gearEffects.acBreakdown.agilityMod}` +
      ` + Armor ${gearEffects.acBreakdown.armorBonus}` +
      (gearEffects.acBreakdown.gearACBonus ? ` + Gear ${gearEffects.acBreakdown.gearACBonus}` : '') +
      ` = ${gearEffects.acBreakdown.total}`
    : '';

  return (
    <div className="character-summary-card" style={cardStyle}>
      {/* Header Section */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '24px' }}>
          {character.name || 'Unknown Hero'}
        </h2>
        <div style={{ color: '#7f8c8d', fontSize: '16px' }}>
          {character.alignment || 'Unknown'} • {character.occupation?.Occupation || 'Adventurer'}
        </div>
        {(character.battlesWon || 0) > 0 && (
          <div style={{ 
            background: 'rgba(255, 193, 7, 0.2)', 
            padding: '4px 12px', 
            borderRadius: '20px', 
            display: 'inline-block', 
            marginTop: '8px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            🏆 {character.battlesWon} Victories
          </div>
        )}
      </div>

      {/* Combat Stats - Most Important */}
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 12px 0', color: '#e74c3c', fontSize: '18px' }}>⚔️ Combat Stats</h3>
        <div style={statGridStyle}>
          <div 
            style={combatStatStyle}
          >
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#e74c3c' }}>{AC}</div>
            <div style={{ fontSize: '12px', color: '#7f8c8d', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <span>Armor Class</span>
              {gearEffects?.acBreakdown && (
                <InfoIcon text={acText} />
              )}
            </div>
            {gearEffects?.acBreakdown && (
              <div style={{ fontSize: '10px', color: '#7f8c8d', marginTop: '4px' }}>
                {`10 + Agi ${gearEffects.acBreakdown.agilityMod >= 0 ? '+' : ''}${gearEffects.acBreakdown.agilityMod}`}
                {` + Armor ${gearEffects.acBreakdown.armorBonus}`}
                {gearEffects.acBreakdown.gearACBonus ? ` + Gear ${gearEffects.acBreakdown.gearACBonus}` : ''}
                {` = ${gearEffects.acBreakdown.total}`}
              </div>
            )}
            {(gearEffects?.checkPenaltyTotal || gearEffects?.armorFumbleDie) && (
              <div style={{ fontSize: '10px', color: '#7f8c8d', marginTop: '2px' }}>
                {typeof gearEffects.checkPenaltyTotal === 'number' ? `Check Penalty: ${gearEffects.checkPenaltyTotal}` : ''}
                {gearEffects.armorFumbleDie ? `${typeof gearEffects.checkPenaltyTotal === 'number' ? ' • ' : ''}Fumble: ${gearEffects.armorFumbleDie}` : ''}
              </div>
            )}
          </div>
          <div style={combatStatStyle}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#e74c3c' }}>
              {currentHp}/{maxHp}
            </div>
            <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Hit Points</div>
            <div style={{ 
              background: '#eee', 
              borderRadius: '10px', 
              height: '6px', 
              marginTop: '4px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: `${hpPercent}%`, 
                height: '100%', 
                background: hpPercent > 50 ? '#4caf50' : hpPercent > 20 ? '#ff9800' : '#f44336',
                borderRadius: '10px',
                transition: 'width 0.3s'
              }} />
            </div>
            {/* Status Text */}
            <div style={{ 
              fontSize: '10px', 
              marginTop: '4px',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              {currentHp <= 0 ? (
                <span style={{ color: '#f44336' }}>💀 DEFEATED</span>
              ) : hpPercent < 25 ? (
                <span style={{ color: '#f44336' }}>⚠️ CRITICALLY WOUNDED</span>
              ) : hpPercent < 50 ? (
                <span style={{ color: '#ff9800' }}>🩸 BADLY INJURED</span>
              ) : hpPercent < 75 ? (
                <span style={{ color: '#ff9800' }}>⚔️ WOUNDED</span>
              ) : (
                <span style={{ color: '#4caf50' }}>💪 FIGHTING STRONG</span>
              )}
            </div>
          </div>
          <div style={combatStatStyle}>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {equippedWeaponName}
            </div>
            <div style={{ fontSize: '12px', color: '#7f8c8d', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <span>{modifiedWeaponDamage} damage</span>
              {/* Damage breakdown tooltip */}
              {(() => {
                const baseStrMod = character?.modifiers?.Strength || 0;
                const gearDmgBonus = gearEffects?.damageBonus || 0;
                const gearStrBonus = gearEffects?.abilityModifiers?.Strength || 0;
                const totalDmgBonus = gearEffects?.totalDamageBonus || (baseStrMod + gearDmgBonus + gearStrBonus);
                const dmgText = `${baseWeaponDamage}` +
                  ` + STR ${baseStrMod >= 0 ? '+' : ''}${baseStrMod}` +
                  (gearDmgBonus ? ` + Gear DMG ${gearDmgBonus >= 0 ? '+' : ''}${gearDmgBonus}` : '') +
                  (gearStrBonus ? ` + Gear STR ${gearStrBonus >= 0 ? '+' : ''}${gearStrBonus}` : '') +
                  ` = ${baseWeaponDamage}${totalDmgBonus !== 0 ? (totalDmgBonus > 0 ? `+${totalDmgBonus}` : `${totalDmgBonus}`) : ''}`;
                return <InfoIcon text={dmgText} />;
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Ability Scores */}
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 12px 0', color: '#3498db', fontSize: '18px' }}>📊 Abilities</h3>
        <div style={statGridStyle}>
          {abilityList.map(ability => {
            const baseScore = character.abilities ? character.abilities[ability] : character[ability];
            const modifiedScore = modifiedStats?.abilities ? modifiedStats.abilities[ability] : baseScore;
            const modifier = modifiedStats?.modifiers ? modifiedStats.modifiers[ability] : Math.floor((baseScore - 10) / 2);
            const modifierStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
            const gearBonus = gearEffects?.abilityModifiers ? gearEffects.abilityModifiers[ability] : 0;
            const hasGearEffect = gearBonus !== 0;
            
            return (
              <div key={ability} style={abilityStyle}>
                <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#2c3e50' }}>{ability}</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: hasGearEffect ? '#27ae60' : '#34495e' }}>
                  {modifiedScore}
                  {hasGearEffect && (
                    <span style={{ fontSize: '12px', color: '#7f8c8d', marginLeft: '4px' }}>
                      ({baseScore}{gearBonus > 0 ? '+' : ''}{gearBonus})
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: '#7f8c8d' }}>({modifierStr})</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Equipment & Background */}
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 12px 0', color: '#9b59b6', fontSize: '18px' }}>🎒 Equipment & Background</h3>
        <div className="equipment-background-grid" style={{ fontSize: '14px' }}>
          <div>
            <strong>Weapon:</strong> {equippedWeaponName}
            {modifiedWeaponDamage && (
              <span style={{ color: '#27ae60', marginLeft: '8px' }}>
                ({modifiedWeaponDamage})
              </span>
            )}
          </div>
          <div>
            <strong>Trade Good:</strong> {character.occupation?.['Trade Goods'] || 'None'}
          </div>
          <div>
            <strong>Funds:</strong> {character.startingFunds || 'None'}
          </div>
          <div>
            <strong>Languages:</strong> {character.languages || 'Common'}
          </div>
        </div>
        {character.racialTraits && (
          <div style={{ 
            marginTop: '8px', 
            padding: '8px', 
            background: 'rgba(155, 89, 182, 0.1)', 
            borderRadius: '6px',
            fontSize: '14px'
          }}>
            <strong>🧬 Racial Traits:</strong> {character.racialTraits}
          </div>
        )}
        {character.luckySign && (
          <div style={{ 
            marginTop: '8px', 
            padding: '8px', 
            background: 'rgba(255, 215, 0, 0.1)', 
            borderRadius: '6px',
            fontSize: '14px'
          }}>
            <strong>🍀 Lucky Sign:</strong> {character.luckySign}
          </div>
        )}
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div style={sectionStyle}>
          <h3 style={{ margin: '0 0 12px 0', color: '#9b59b6', fontSize: '18px' }}>🏅 Achievements</h3>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '8px',
            justifyContent: 'flex-start'
          }}>
            {achievements.slice(0, 8).map(achievement => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                size="small"
              />
            ))}
            {achievements.length > 8 && (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(155, 89, 182, 0.1)',
                border: '2px solid rgba(155, 89, 182, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#9b59b6'
              }}>
                +{achievements.length - 8}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Battle History */}
      {character.battlesWonByLevel && Object.keys(character.battlesWonByLevel).length > 0 && (
        <div style={sectionStyle}>
          <h3 style={{ margin: '0 0 12px 0', color: '#f39c12', fontSize: '18px' }}>🏆 Battle History</h3>
          <div style={{ fontSize: '14px' }}>
            {Object.entries(character.battlesWonByLevel)
              .filter(([level, count]) => count > 0)
              .map(([level, count]) => (
                <div key={level} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '4px 0',
                  borderBottom: '1px solid rgba(0,0,0,0.1)'
                }}>
                  <span>{level.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                  <span style={{ fontWeight: 'bold', color: '#27ae60' }}>{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}
      
      {/* Gear Slots */}
      <GearSlots 
        character={character} 
        onCharacterChange={onCharacterChange}
      />  
      {/* Character URL Sharing */}
      <div style={sectionStyle}>
        <CharacterUrlShare 
          character={character} 
          achievements={achievements} 
          stats={stats}
        />
      </div>
    </div>
  );
};

export default EnhancedCharacterSummary;

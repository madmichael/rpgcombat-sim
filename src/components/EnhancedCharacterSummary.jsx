import React from 'react';

const EnhancedCharacterSummary = ({ character, charHp }) => {
  if (!character) return null;

  const abilityList = ['Strength', 'Agility', 'Stamina', 'Personality', 'Intelligence', 'Luck'];
  const AC = 10 + (character.modifiers ? character.modifiers['Agility'] : 0);
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
    fontWeight: 'bold'
  };

  return (
    <div style={cardStyle}>
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
          <div style={combatStatStyle}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#e74c3c' }}>{AC}</div>
            <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Armor Class</div>
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
              {character.weapon?.name || 'Unarmed'}
            </div>
            <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
              {character.weapon?.damage || '1d3'} damage
            </div>
          </div>
        </div>
      </div>

      {/* Ability Scores */}
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 12px 0', color: '#3498db', fontSize: '18px' }}>📊 Abilities</h3>
        <div style={statGridStyle}>
          {abilityList.map(ability => {
            const score = ability === 'Luck' ? character.Luck : character[ability];
            const mod = character.modifiers ? character.modifiers[ability] : 0;
            const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
            
            // Highlight Luck if it's changed
            const isLuckChanged = ability === 'Luck' && character.originalLuck && character.Luck !== character.originalLuck;
            const itemStyle = isLuckChanged ? 
              { ...statItemStyle, background: 'rgba(243, 156, 18, 0.2)', border: '1px solid rgba(243, 156, 18, 0.5)' } : 
              statItemStyle;
            
            return (
              <div key={ability} style={itemStyle}>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{score}</div>
                <div style={{ fontSize: '12px', color: '#7f8c8d' }}>{ability}</div>
                <div style={{ fontSize: '12px', color: mod >= 0 ? '#27ae60' : '#e74c3c' }}>
                  {modStr}
                </div>
                {isLuckChanged && (
                  <div style={{ fontSize: '10px', color: '#f39c12', fontWeight: 'bold' }}>
                    (was {character.originalLuck})
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Equipment & Background */}
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 12px 0', color: '#9b59b6', fontSize: '18px' }}>🎒 Equipment & Background</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
          <div>
            <strong>Weapon:</strong> {character.occupation?.['Trained Weapon'] || 'None'}
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
    </div>
  );
};

export default EnhancedCharacterSummary;

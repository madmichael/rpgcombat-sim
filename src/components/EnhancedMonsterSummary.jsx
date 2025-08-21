import React, { useState } from 'react';

function EnhancedMonsterSummary({ monster, monsterHp, monsterACRevealed }) {
  if (!monster) return null;

  const [imageError, setImageError] = useState(false);

  const getHealthPercentage = () => {
    const hitPointsStr = monster['Hit Points'];
    const maxHp = hitPointsStr && typeof hitPointsStr === 'string' 
      ? parseInt(hitPointsStr.match(/\d+/)?.[0] || '0')
      : parseInt(monster.maxHp || monster.hp || '0');
    const currentHp = monsterHp !== null ? monsterHp : monster.hp;
    return maxHp > 0 ? (currentHp / maxHp) * 100 : 0;
  };

  const maxHp = monster.maxHp || monster["Hit Points"] || monster.hp;
  const currentHp = monsterHp !== null ? monsterHp : monster.hp;
  const hpPercent = getHealthPercentage();
  const AC = monsterACRevealed ? (monster["Armor Class"] || monster.armor || 'N/A') : '?';
  const attackType = monster.AttackType ? monster.AttackType : (monster.attack ? 'Weapon' : '');
  const attackBonus = typeof monster.Attack === 'string' ? monster.Attack : (monster.attack || '');
  const damage = monster.Damage || monster.damage || '';

  const cardStyle = {
    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
    borderRadius: '12px',
    padding: '20px',
    margin: '16px 0',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
    color: 'white',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    border: '2px solid #e74c3c'
  };

  const statGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '12px',
    margin: '12px 0'
  };

  const statBoxStyle = {
    background: 'rgba(231, 76, 60, 0.2)',
    borderRadius: '8px',
    padding: '12px',
    textAlign: 'center',
    border: '1px solid rgba(231, 76, 60, 0.4)',
    backdropFilter: 'blur(10px)'
  };

  const criticalStatStyle = {
    ...statBoxStyle,
    background: 'rgba(231, 76, 60, 0.3)',
    border: '2px solid rgba(231, 76, 60, 0.6)',
    fontWeight: 'bold'
  };

  return (
    <div style={cardStyle}>
      {/* Monster Header with Image */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '16px' }}>
        {/* Monster Image */}
        {monster.img_url && !imageError && (
          <div style={{ 
            flexShrink: 0,
            width: '80px',
            height: '80px',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '2px solid #e74c3c',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            <img 
              src={monster.img_url}
              alt={monster.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={() => setImageError(true)}
            />
          </div>
        )}
        
        {/* Monster Name and Title */}
        <div style={{ flex: 1, textAlign: monster.img_url && !imageError ? 'left' : 'center' }}>
          <h3 style={{ 
            margin: '0', 
            fontSize: '24px', 
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            fontWeight: 'bold',
            color: '#e74c3c'
          }}>
            👹 {monster.name}
          </h3>
          <div style={{ 
            fontSize: '14px', 
            opacity: 0.8,
            marginTop: '4px'
          }}>
            Enemy Combatant
          </div>
        </div>
      </div>

      {/* HP Bar - Most Critical */}
      <div style={{
        background: 'rgba(231, 76, 60, 0.2)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '16px',
        border: '1px solid rgba(231, 76, 60, 0.4)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '16px' }}>💀 Health</span>
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
            {currentHp} / {maxHp}
          </span>
        </div>
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          borderRadius: '10px',
          height: '10px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${hpPercent}%`,
            height: '100%',
            background: hpPercent > 50 ? '#27ae60' : hpPercent > 20 ? '#f39c12' : '#e74c3c',
            borderRadius: '10px',
            transition: 'width 0.5s ease',
            boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.2)'
          }} />
        </div>
        
        {/* Status Text */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '8px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {currentHp <= 0 ? (
            <span style={{ color: '#95a5a6' }}>💀 DEFEATED</span>
          ) : hpPercent < 25 ? (
            <span style={{ color: '#e74c3c' }}>⚠️ CRITICALLY WOUNDED</span>
          ) : hpPercent < 50 ? (
            <span style={{ color: '#f39c12' }}>🩸 BADLY INJURED</span>
          ) : hpPercent < 75 ? (
            <span style={{ color: '#e67e22' }}>⚔️ WOUNDED</span>
          ) : (
            <span style={{ color: '#27ae60' }}>💪 FIGHTING STRONG</span>
          )}
        </div>
      </div>

      {/* Combat Stats Grid */}
      <div style={statGridStyle}>
        <div style={criticalStatStyle}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px', color: '#e74c3c' }}>
            {AC}
          </div>
          <div style={{ fontSize: '11px', opacity: 0.9 }}>Armor Class</div>
        </div>

        <div style={statBoxStyle}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
            {damage || '?'}
          </div>
          <div style={{ fontSize: '11px', opacity: 0.9 }}>Damage</div>
        </div>

        <div style={statBoxStyle}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
            {attackType || 'Melee'}
          </div>
          <div style={{ fontSize: '11px', opacity: 0.9 }}>Attack Type</div>
        </div>

        {attackBonus && (
          <div style={statBoxStyle}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
              {attackBonus}
            </div>
            <div style={{ fontSize: '11px', opacity: 0.9 }}>Attack Bonus</div>
          </div>
        )}
      </div>

      {/* Threat Level Indicator */}
      <div style={{
        textAlign: 'center',
        marginTop: '12px',
        padding: '8px',
        background: 'rgba(231, 76, 60, 0.3)',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }}>
        ⚔️ HOSTILE ENEMY ⚔️
      </div>
    </div>
  );
};

export default EnhancedMonsterSummary;

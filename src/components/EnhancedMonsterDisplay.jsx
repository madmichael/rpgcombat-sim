import React from 'react';

const EnhancedMonsterDisplay = ({ monster, challengeLabel, monsterHp, maxHp }) => {
  if (!monster) return null;

  const hpPercent = maxHp ? Math.max(0, Math.min(100, Math.round((monsterHp / maxHp) * 100))) : 100;
  const currentHp = monsterHp !== null ? monsterHp : monster.hp;
  const totalHp = maxHp || monster.hp || monster["Hit Points"];

  const cardStyle = {
    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
    borderRadius: '12px',
    padding: '20px',
    margin: '16px 0',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
    color: 'white',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  };

  const statGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '12px',
    margin: '12px 0'
  };

  const statBoxStyle = {
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    padding: '12px',
    textAlign: 'center',
    backdropFilter: 'blur(10px)'
  };

  const threatLevelColor = {
    'Pathetic': '#95a5a6',
    'Very Weak': '#3498db', 
    'Weak': '#2ecc71',
    'Standard': '#f39c12',
    'Strong': '#e67e22',
    'Very Strong': '#e74c3c',
    'Extreme': '#8e44ad'
  };

  const threatColor = threatLevelColor[challengeLabel] || '#e74c3c';

  return (
    <div style={cardStyle}>
      {/* Monster Header */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ 
          background: threatColor,
          padding: '4px 12px',
          borderRadius: '20px',
          display: 'inline-block',
          fontSize: '12px',
          fontWeight: 'bold',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {challengeLabel} Threat
        </div>
        <h2 style={{ 
          margin: '0', 
          fontSize: '28px', 
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          fontWeight: 'bold'
        }}>
          💀 {monster.name}
        </h2>
      </div>

      {/* HP Bar - Most Important */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '18px' }}>❤️ Health</span>
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
            {currentHp} / {totalHp}
          </span>
        </div>
        <div style={{
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '10px',
          height: '12px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${hpPercent}%`,
            height: '100%',
            background: hpPercent > 50 ? '#27ae60' : hpPercent > 20 ? '#f39c12' : '#e74c3c',
            borderRadius: '10px',
            transition: 'width 0.5s ease',
            boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3)'
          }} />
        </div>
      </div>

      {/* Combat Stats */}
      <div style={statGridStyle}>
        <div style={statBoxStyle}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>
            {monster["Armor Class"] || monster.armor || '?'}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>Armor Class</div>
        </div>

        <div style={statBoxStyle}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
            {monster.damage || monster.Damage || '?'}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>Damage</div>
        </div>

        <div style={statBoxStyle}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
            {monster.AttackType || 'Weapon'}
          </div>
          <div style={{ fontSize: '12px', opacity: 0.9 }}>Attack Type</div>
        </div>

        {monster.Movement && (
          <div style={statBoxStyle}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
              {monster.Movement}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>Movement</div>
          </div>
        )}
      </div>

      {/* Status Indicator */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '12px',
        fontSize: '14px',
        opacity: 0.9
      }}>
        {currentHp <= 0 ? (
          <span style={{ color: '#95a5a6' }}>💀 Defeated</span>
        ) : currentHp < totalHp * 0.25 ? (
          <span style={{ color: '#f39c12' }}>⚠️ Badly Wounded</span>
        ) : currentHp < totalHp * 0.75 ? (
          <span style={{ color: '#e67e22' }}>🩸 Injured</span>
        ) : (
          <span style={{ color: '#27ae60' }}>💪 Healthy</span>
        )}
      </div>
    </div>
  );
};

export default EnhancedMonsterDisplay;

import React, { useState } from 'react';
import { useVictoryTracking } from '../hooks/useVictoryTracking';

const VictoryStats = ({ isOpen, onClose, victoryTracking }) => {
  const { 
    victories, 
    getWinRate, 
    getMostDefeatedMonster, 
    getBestCharacter, 
    clearAllData 
  } = victoryTracking || useVictoryTracking();
  
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  if (!isOpen) return null;

  const totalBattles = victories.totalWins + victories.totalLosses;
  const overallWinRate = getWinRate();
  const mostDefeated = getMostDefeatedMonster();
  const bestCharacter = getBestCharacter();

  const handleClearData = () => {
    clearAllData();
    setShowConfirmClear(false);
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString();
  };

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  };

  const contentStyle = {
    backgroundColor: '#2c3e50',
    color: '#ecf0f1',
    padding: '24px',
    borderRadius: '12px',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflowY: 'auto',
    border: '2px solid #34495e',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '2px solid #34495e',
    paddingBottom: '12px'
  };

  const statGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '20px'
  };

  const statCardStyle = {
    backgroundColor: '#34495e',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #4a5f7a',
    textAlign: 'center'
  };

  const buttonStyle = {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: '16px'
  };

  const closeButtonStyle = {
    backgroundColor: 'transparent',
    color: '#bdc3c7',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '4px 8px'
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0, color: '#3498db' }}>🏆 Victory Statistics</h2>
          <button style={closeButtonStyle} onClick={onClose}>×</button>
        </div>

        {totalBattles === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
            <h3>No battles recorded yet!</h3>
            <p>Start fighting to see your statistics here.</p>
          </div>
        ) : (
          <>
            <div style={statGridStyle}>
              <div style={statCardStyle}>
                <h4 style={{ margin: '0 0 8px 0', color: '#27ae60' }}>Total Victories</h4>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{victories.totalWins}</div>
              </div>
              
              <div style={statCardStyle}>
                <h4 style={{ margin: '0 0 8px 0', color: '#e74c3c' }}>Total Defeats</h4>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{victories.totalLosses}</div>
              </div>
              
              <div style={statCardStyle}>
                <h4 style={{ margin: '0 0 8px 0', color: '#3498db' }}>Win Rate</h4>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{overallWinRate}%</div>
              </div>
              
              <div style={statCardStyle}>
                <h4 style={{ margin: '0 0 8px 0', color: '#f39c12' }}>Total Battles</h4>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalBattles}</div>
              </div>
            </div>

            {mostDefeated && (
              <div style={statCardStyle}>
                <h4 style={{ margin: '0 0 8px 0', color: '#9b59b6' }}>Most Defeated Monster</h4>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  {mostDefeated.name} ({mostDefeated.count} times)
                </div>
                {mostDefeated.challengeLabel && (
                  <div style={{ fontSize: '14px', color: '#bdc3c7', marginTop: '4px' }}>
                    Challenge: {mostDefeated.challengeLabel}
                  </div>
                )}
              </div>
            )}

            {bestCharacter && bestCharacter.name && (
              <div style={{ ...statCardStyle, marginTop: '16px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#1abc9c' }}>Best Character</h4>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  {bestCharacter.name}
                </div>
                <div style={{ fontSize: '14px', color: '#bdc3c7' }}>
                  {bestCharacter.stats.wins}W - {bestCharacter.stats.losses}L 
                  ({Math.round(bestCharacter.stats.wins / (bestCharacter.stats.wins + bestCharacter.stats.losses) * 100)}% win rate)
                </div>
              </div>
            )}

            <div style={{ marginTop: '20px' }}>
              <h4 style={{ color: '#3498db', marginBottom: '12px' }}>Character Records</h4>
              {Object.entries(victories.characterStats).length === 0 ? (
                <p style={{ color: '#7f8c8d' }}>No character data available</p>
              ) : (
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {Object.entries(victories.characterStats).map(([name, stats]) => (
                    <div key={name} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      padding: '8px 12px',
                      backgroundColor: '#34495e',
                      marginBottom: '4px',
                      borderRadius: '4px'
                    }}>
                      <div>
                        <strong>{name}</strong>
                        <div style={{ fontSize: '12px', color: '#bdc3c7' }}>
                          {typeof stats.occupation === 'string' ? stats.occupation : stats.occupation?.Occupation || 'Unknown'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div>{stats.wins}W - {stats.losses}L</div>
                        <div style={{ fontSize: '12px', color: '#bdc3c7' }}>
                          {Math.round(stats.wins / (stats.wins + stats.losses) * 100)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: '20px' }}>
              <h4 style={{ color: '#3498db', marginBottom: '12px' }}>Recent Battles</h4>
              {victories.recentBattles.length === 0 ? (
                <p style={{ color: '#7f8c8d' }}>No recent battles</p>
              ) : (
                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  {victories.recentBattles.slice(0, 10).map((battle) => (
                    <div key={battle.id} style={{ 
                      padding: '6px 12px',
                      backgroundColor: battle.result === 'victory' ? 'rgba(39, 174, 96, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                      marginBottom: '2px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      borderLeft: `3px solid ${battle.result === 'victory' ? '#27ae60' : '#e74c3c'}`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>
                          {battle.result === 'victory' ? '🏆' : '💀'} {battle.character.name} vs {battle.monster.name}
                          {battle.monster.challengeLabel && (
                            <span style={{ color: '#95a5a6', fontSize: '12px', marginLeft: '8px' }}>
                              ({battle.monster.challengeLabel})
                            </span>
                          )}
                        </span>
                        <span style={{ color: '#7f8c8d', fontSize: '12px' }}>
                          {formatDate(battle.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px', borderTop: '1px solid #34495e', paddingTop: '16px' }}>
              {!showConfirmClear ? (
                <button 
                  style={buttonStyle}
                  onClick={() => setShowConfirmClear(true)}
                >
                  Clear All Data
                </button>
              ) : (
                <div>
                  <p style={{ color: '#e74c3c', marginBottom: '12px' }}>
                    Are you sure? This cannot be undone!
                  </p>
                  <button 
                    style={{ ...buttonStyle, marginRight: '8px' }}
                    onClick={handleClearData}
                  >
                    Yes, Clear All
                  </button>
                  <button 
                    style={{ ...buttonStyle, backgroundColor: '#7f8c8d' }}
                    onClick={() => setShowConfirmClear(false)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VictoryStats;

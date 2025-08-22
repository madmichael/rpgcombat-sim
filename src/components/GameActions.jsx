import React from 'react';

const GameActions = ({ 
  fightStatus, 
  summary, 
  character, 
  monster,
  selectedChallenge,
  onFindAnotherMonster, 
  onRestartFight,
  onAdjustChallenge,
  playSound,
  onShowVictoryStats 
}) => {
  const handleFindAnotherMonster = () => {
    if (playSound) {
      playSound('swoosh');
    }
    onFindAnotherMonster();
  };

  return (
    <>
      {/* Victory Stats Button */}
      <div style={{ 
        position: 'fixed', 
        top: '20px', 
        right: '20px', 
        zIndex: 100 
      }}>
        <button 
          onClick={onShowVictoryStats}
          style={{
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            padding: '12px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#2980b9';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#3498db';
            e.target.style.transform = 'translateY(0)';
          }}
          title="View victory statistics and battle history"
        >
          🏆 Stats
        </button>
      </div>
    </>
  );
};

export default GameActions;

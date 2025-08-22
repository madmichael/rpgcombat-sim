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
  onShowVictoryStats,
  onShowAchievements,
  onShowCredits 
}) => {
  const handleFindAnotherMonster = () => {
    if (playSound) {
      playSound('swoosh');
    }
    onFindAnotherMonster();
  };

  return (
    <>
      {/* Action Buttons */}
      <div style={{ 
        position: 'fixed', 
        top: '20px', 
        right: '20px', 
        zIndex: 100,
        display: 'flex',
        gap: '10px'
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
        
        <button 
          onClick={onShowAchievements}
          style={{
            backgroundColor: '#f39c12',
            color: 'white',
            border: 'none',
            padding: '12px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(243, 156, 18, 0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#e67e22';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#f39c12';
            e.target.style.transform = 'translateY(0)';
          }}
          title="View achievements and combat milestones"
        >
          🏅 Achievements
        </button>
        
        <button 
          onClick={onShowCredits}
          style={{
            backgroundColor: '#9b59b6',
            color: 'white',
            border: 'none',
            padding: '12px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(155, 89, 182, 0.3)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#8e44ad';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#9b59b6';
            e.target.style.transform = 'translateY(0)';
          }}
          title="View credits and resources used to build this app"
        >
          📚 Credits
        </button>
      </div>
    </>
  );
};

export default GameActions;

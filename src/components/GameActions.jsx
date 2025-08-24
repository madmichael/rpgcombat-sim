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
  onShowCredits,
  onShowTutorial
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
      <div className="top-actions" aria-label="Top action buttons">
        <button 
          onClick={onShowVictoryStats}
          className="top-action-btn btn-stats"
          title="View victory statistics and battle history"
        >
          🏆 Stats
        </button>
        
        <button 
          onClick={onShowAchievements}
          className="top-action-btn btn-achievements"
          title="View achievements and combat milestones"
        >
          🏅 Achievements
        </button>

        <button 
          onClick={onShowTutorial}
          className="top-action-btn btn-help"
          title="Open welcome and tutorial"
        >
          ❓ Help
        </button>
        
        <button 
          onClick={onShowCredits}
          className="top-action-btn btn-credits"
          title="View credits and resources used to build this app"
        >
          📚 Credits
        </button>
      </div>
    </>
  );
};

export default GameActions;


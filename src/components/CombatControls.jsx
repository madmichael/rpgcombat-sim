import React from 'react';

const CombatControls = ({ status, onStart, onContinue, onRun, onFindAnother, onRestartFight, onMightyDeed, onAdjustChallenge, onReset, character, summary, buttonStyles = {}, isActionInProgress = false }) => {
  const handleKeyDown = (event, action) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  return (
    <div className="combat-controls-card">
      <div className="combat-controls-header">
        <h3 className="combat-controls-title">⚔️ Combat Actions</h3>
        <div className="combat-status-indicator">
          <span className={`status-badge status-${status.replace(' ', '-')}`}>
            {status === 'not started' ? '🛡️ Ready' : 
             status === 'in progress' ? '⚡ Fighting' : 
             '✅ Complete'}
          </span>
        </div>
      </div>
      
      <div className="combat-controls-content">
        {status === 'not started' && (
          <div className="action-buttons-grid">
            <button 
              className="combat-btn combat-btn-primary"
              onClick={onStart}
              onKeyDown={(e) => handleKeyDown(e, onStart)}
              aria-label="Start the combat encounter"
              aria-describedby="start-fight-help"
            >
              <span className="btn-icon">⚔️</span>
              <span className="btn-text">Start Fight</span>
            </button>
            
            <button 
              className="combat-btn combat-btn-secondary"
              onClick={onFindAnother}
              onKeyDown={(e) => handleKeyDown(e, onFindAnother)}
              aria-label="Find a different monster to fight"
              aria-describedby="find-another-help"
            >
              <span className="btn-icon">🔄</span>
              <span className="btn-text">Find Another</span>
            </button>
            
            <button 
              className="combat-btn combat-btn-warning"
              onClick={onRun}
              onKeyDown={(e) => handleKeyDown(e, onRun)}
              aria-label="Flee from combat and end the encounter"
              aria-describedby="run-away-help"
            >
              <span className="btn-icon">🏃</span>
              <span className="btn-text">Run Away</span>
            </button>
            
            <button 
              className="combat-btn combat-btn-info"
              onClick={onReset}
              onKeyDown={(e) => handleKeyDown(e, onReset)}
              aria-label="Roll up a new character"
              title="Roll up a new character"
              aria-describedby="new-character-help"
            >
              <span className="btn-icon">🎲</span>
              <span className="btn-text">New Character</span>
            </button>
          </div>
        )}
        
        {status === 'in progress' && (
          <div className="action-buttons-grid in-progress">
            <button 
              className="combat-btn combat-btn-success combat-btn-large"
              onClick={onContinue}
              onKeyDown={(e) => handleKeyDown(e, onContinue)}
              aria-label="Continue fighting and make next attack"
              aria-describedby="continue-fight-help"
              disabled={isActionInProgress}
            >
              <span className="btn-icon">⚡</span>
              <span className="btn-text">Continue Fighting</span>
            </button>
            
            {character?.tradeGood && (
              <button 
                className="combat-btn combat-btn-secondary"
                onClick={onMightyDeed}
                onKeyDown={(e) => handleKeyDown(e, onMightyDeed)}
                aria-label="Attempt a Mighty Deed with your trade good"
                title={`Use ${character.tradeGood} for a Mighty Deed`}
                disabled={isActionInProgress}
              >
                <span className="btn-icon">🎭</span>
                <span className="btn-text">Mighty Deed</span>
              </button>
            )}
            
            <button 
              className="combat-btn combat-btn-warning"
              onClick={onRun}
              onKeyDown={(e) => handleKeyDown(e, onRun)}
              aria-label="Flee from combat and end the encounter"
              aria-describedby="run-away-help"
              disabled={isActionInProgress}
            >
              <span className="btn-icon">🏃</span>
              <span className="btn-text">Run Away!</span>
            </button>
          </div>
        )}
        
        {status === 'finished' && summary && summary.includes('vanguished') && (
          <div className="action-buttons-grid">
            <button 
              className="combat-btn combat-btn-primary combat-btn-large"
              onClick={onRestartFight}
              onKeyDown={(e) => handleKeyDown(e, onRestartFight)}
              aria-label="Restart the fight after defeat"
              aria-describedby="restart-fight-help"
            >
              <span className="btn-icon">🔄</span>
              <span className="btn-text">Call Do Overs</span>
            </button>
          </div>
        )}
        
        {status === 'finished' && summary && summary.includes('defeated') && (
          <div className="action-buttons-grid">
            <button 
              className="combat-btn combat-btn-secondary combat-btn-large"
              onClick={onFindAnother}
              onKeyDown={(e) => handleKeyDown(e, onFindAnother)}
              aria-label="Find a different monster to fight"
              aria-describedby="find-another-help"
            >
              <span className="btn-icon">🔍</span>
              <span className="btn-text">Find Another Monster</span>
            </button>
            
            {onAdjustChallenge && (
              <>
                <button 
                  className="combat-btn combat-btn-tertiary combat-btn-medium"
                  onClick={() => onAdjustChallenge('down')}
                  onKeyDown={(e) => handleKeyDown(e, () => onAdjustChallenge('down'))}
                  aria-label="Decrease monster challenge level"
                  aria-describedby="challenge-down-help"
                >
                  <span className="btn-icon">📉</span>
                  <span className="btn-text">Challenge ↓</span>
                </button>
                
                <button 
                  className="combat-btn combat-btn-tertiary combat-btn-medium"
                  onClick={() => onAdjustChallenge('up')}
                  onKeyDown={(e) => handleKeyDown(e, () => onAdjustChallenge('up'))}
                  aria-label="Increase monster challenge level"
                  aria-describedby="challenge-up-help"
                >
                  <span className="btn-icon">📈</span>
                  <span className="btn-text">Challenge ↑</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
      
      <div className="sr-only">
        <div id="start-fight-help">Begin combat with your selected monster</div>
        <div id="continue-fight-help">Make your next attack roll in the ongoing combat</div>
        <div id="run-away-help">Escape from combat - you will lose the encounter</div>
        <div id="find-another-help">Search for a different monster at the same challenge level</div>
        <div id="restart-fight-help">Restart the current fight from the beginning</div>
        <div id="challenge-down-help">Decrease the challenge level and find a weaker monster</div>
        <div id="challenge-up-help">Increase the challenge level and find a stronger monster</div>
        <div id="new-character-help">Roll up a completely new character with new stats and abilities</div>
      </div>
    </div>
  );
};

export default CombatControls;

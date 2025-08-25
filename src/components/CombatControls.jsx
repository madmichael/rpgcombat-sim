import React, { useEffect, useRef, useState } from 'react';
import Modal from './Modal.jsx';

const CombatControls = ({ status, onStart, onContinue, onRun, onFindAnother, onRestartFight, onMightyDeed, onAdjustChallenge, onReset, character, summary, buttonStyles = {}, isActionInProgress = false, onShowTutorialAtStep }) => {
  const handleKeyDown = (event, action) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  // Derive end-of-fight result from summary text more robustly (avoid typos like 'vanguished')
  const lowerSummary = (summary || '').toLowerCase();
  const didWin = lowerSummary.includes('has defeated') || lowerSummary.includes('defeats') || lowerSummary.includes('victory');
  const didLose = lowerSummary.includes('vanquished') || lowerSummary.includes('vanguished') || lowerSummary.includes('defeated by') || lowerSummary.includes('defeat') || lowerSummary.includes('died') || lowerSummary.includes('killed by');

  // Focus management for main CTAs
  const startRef = useRef(null);
  const continueRef = useRef(null);
  const retryRef = useRef(null);
  const findAnotherRef = useRef(null);

  useEffect(() => {
    if (status === 'not started') {
      startRef.current?.focus();
    } else if (status === 'in progress') {
      continueRef.current?.focus();
    } else if (status === 'finished') {
      if (didLose) {
        retryRef.current?.focus();
      } else if (didWin) {
        findAnotherRef.current?.focus();
      }
    }
  }, [status, didWin, didLose]);

  // Run Away confirmation modal
  const [showRunConfirm, setShowRunConfirm] = useState(false);
  const requestRun = () => setShowRunConfirm(true);
  const cancelRun = () => setShowRunConfirm(false);
  const confirmRun = () => {
    setShowRunConfirm(false);
    onRun?.();
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
        <div className="sr-only" role="status" aria-live="polite">
          {status === 'not started' ? 'Ready to begin combat' : status === 'in progress' ? 'Combat in progress' : 'Combat complete'}
        </div>
      </div>
      
      <div className="combat-controls-content">
        {status === 'not started' && (
          <div className="action-buttons-grid" role="group" aria-labelledby="combat-actions-not-started">
            <h4 id="combat-actions-not-started" className="sr-only">Actions before combat starts</h4>
            <button 
              className="combat-btn combat-btn-primary"
              onClick={onStart}
              onKeyDown={(e) => handleKeyDown(e, onStart)}
              aria-label="Start the combat encounter"
              aria-describedby="start-fight-help"
              type="button"
              ref={startRef}
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
              type="button"
            >
              <span className="btn-icon">🔄</span>
              <span className="btn-text">Find Another</span>
            </button>
            
            <button 
              className="combat-btn combat-btn-warning"
              onClick={requestRun}
              onKeyDown={(e) => handleKeyDown(e, requestRun)}
              aria-label="Flee from combat and end the encounter"
              aria-describedby="run-away-help"
              type="button"
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
              type="button"
            >
              <span className="btn-icon">🎲</span>
              <span className="btn-text">New Character</span>
            </button>
          </div>
        )}
        
        {status === 'in progress' && (
          <div className="action-buttons-grid in-progress" role="group" aria-labelledby="combat-actions-in-progress">
            <h4 id="combat-actions-in-progress" className="sr-only">Actions during combat</h4>
            <button 
              className="combat-btn combat-btn-success combat-btn-large"
              onClick={onContinue}
              onKeyDown={(e) => handleKeyDown(e, onContinue)}
              aria-label="Continue fighting and make next attack"
              aria-describedby="continue-fight-help"
              disabled={isActionInProgress}
              aria-disabled={isActionInProgress}
              type="button"
              ref={continueRef}
            >
              <span className="btn-icon">⚡</span>
              <span className="btn-text">{isActionInProgress ? 'Rolling…' : 'Continue Fighting'}</span>
            </button>
            
            {character?.tradeGood && (
              <div className="btn-with-help" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <button 
                  className="combat-btn combat-btn-secondary"
                  onClick={onMightyDeed}
                  onKeyDown={(e) => handleKeyDown(e, onMightyDeed)}
                  aria-label="Attempt a Mighty Deed with your trade good"
                  title={`Use ${character.tradeGood} for a Mighty Deed`}
                  disabled={isActionInProgress}
                  aria-disabled={isActionInProgress}
                  type="button"
                >
                  <span className="btn-icon">🎭</span>
                  <span className="btn-text">Mighty Deed</span>
                </button>
                <button
                  className="combat-btn combat-btn-tertiary"
                  type="button"
                  onClick={() => onShowTutorialAtStep && onShowTutorialAtStep(2)}
                  aria-label="What is a Mighty Deed? Open the tutorial to the Mighty Deed section"
                  title="What is a Mighty Deed?"
                  style={{ padding: '8px 10px', minWidth: 'auto' }}
                >
                  <span aria-hidden="true">❓</span>
                </button>
              </div>
            )}
            
            <button 
              className="combat-btn combat-btn-warning"
              onClick={requestRun}
              onKeyDown={(e) => handleKeyDown(e, requestRun)}
              aria-label="Flee from combat and end the encounter"
              aria-describedby="run-away-help"
              disabled={isActionInProgress}
              aria-disabled={isActionInProgress}
              type="button"
            >
              <span className="btn-icon">🏃</span>
              <span className="btn-text">Run Away!</span>
            </button>
          </div>
        )}
        
        {status === 'finished' && didLose && (
          <div className="action-buttons-grid single" role="group" aria-labelledby="combat-actions-defeat">
            <h4 id="combat-actions-defeat" className="sr-only">Actions after defeat</h4>
            <button 
              className="combat-btn combat-btn-primary combat-btn-large"
              onClick={onRestartFight}
              onKeyDown={(e) => handleKeyDown(e, onRestartFight)}
              aria-label="Restart the fight after defeat"
              aria-describedby="restart-fight-help"
              type="button"
              ref={retryRef}
            >
              <span className="btn-icon">🔄</span>
              <span className="btn-text">Retry Fight</span>
            </button>
          </div>
        )}
        
        {status === 'finished' && didWin && (
          <div className="action-buttons-grid" role="group" aria-labelledby="combat-actions-victory">
            <h4 id="combat-actions-victory" className="sr-only">Actions after victory</h4>
            <button 
              className="combat-btn combat-btn-secondary combat-btn-large"
              onClick={onFindAnother}
              onKeyDown={(e) => handleKeyDown(e, onFindAnother)}
              aria-label="Find a different monster to fight"
              aria-describedby="find-another-help"
              type="button"
              ref={findAnotherRef}
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
                  type="button"
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
                  type="button"
                >
                  <span className="btn-icon">📈</span>
                  <span className="btn-text">Challenge ↑</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* Fallback: finished but result not parsed, show Retry to avoid empty UI */}
        {status === 'finished' && !didWin && !didLose && (
          <div className="action-buttons-grid single" role="group" aria-labelledby="combat-actions-finished-fallback">
            <h4 id="combat-actions-finished-fallback" className="sr-only">Actions after fight finished</h4>
            <button 
              className="combat-btn combat-btn-primary combat-btn-large"
              onClick={onRestartFight}
              onKeyDown={(e) => handleKeyDown(e, onRestartFight)}
              aria-label="Restart the fight"
              aria-describedby="restart-fight-help"
              type="button"
            >
              <span className="btn-icon">🔄</span>
              <span className="btn-text">Retry Fight</span>
            </button>
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

      {showRunConfirm && (
        <Modal onClose={cancelRun}>
          <div className="modal-content">
            <h2>Confirm Flee</h2>
            <p>Are you sure you want to run away? You will forfeit this encounter.</p>
            <div className="modal-actions">
              <button className="combat-btn combat-btn-warning" type="button" onClick={confirmRun} autoFocus>
                Yes, Run Away
              </button>
              <button className="combat-btn combat-btn-secondary" type="button" onClick={cancelRun}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CombatControls;

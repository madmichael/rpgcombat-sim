import React from 'react';
import Modal from './Modal';

const LuckConfirmModal = ({ 
  show, 
  onClose, 
  attackRoll,
  character,
  onYes,
  onNo
}) => {
  if (!show) return null;

  return (
    <Modal onClose={onClose}>
      <div className="luck-confirm-modal" role="dialog" aria-labelledby="luck-confirm-title">
        <div className="luck-confirm-header">
          <div className="luck-icon">🎲</div>
          <h2 id="luck-confirm-title">Your Attack Missed!</h2>
          <p className="luck-subtitle">But luck might be on your side...</p>
        </div>

        <div className="modal-content luck-confirm-content">
          <div className="attack-summary">
            <div className="attack-info">
              <div className="detail-item">
                <span className="detail-label">Your Attack Roll:</span>
                <span className="detail-value attack-roll">{attackRoll}</span>
              </div>
            </div>
          </div>

          <div className="luck-opportunity">
            <div className="luck-status">
              <h3>🍀 Luck Available</h3>
              <div className="luck-display">
                <div className="luck-current">
                  <span className="luck-label">Current Luck:</span>
                  <span className="luck-value">{character.Luck}</span>
                </div>
              </div>
            </div>

            <div className="luck-question">
              <h3>🤔 Are you happy with your roll?</h3>
              <p className="question-text">
                Your attack missed, but burning some Luck could potentially turn this around.
              </p>

            </div>
          </div>

          <div className="luck-warning">
            <p>💡 <em>If you choose to try your luck, you'll need to guess how much Luck to burn!</em></p>
          </div>
        </div>

        <div className="modal-actions luck-actions">
          <button 
            onClick={onNo}
            className="btn btn-large btn-secondary luck-no-btn"
            aria-describedby="no-help"
          >
            <span className="btn-icon">😔</span>
            <span className="btn-text">Let the dice fall as they may.</span>
          </button>
          <button 
            onClick={onYes}
            className="btn btn-large btn-primary luck-yes-btn"
            aria-describedby="yes-help"
          >
            <span className="btn-icon">🍀</span>
            <span className="btn-text">No, I want to burn some Luck!</span>
          </button>
        </div>

        <div className="sr-only">
          <div id="no-help">Accept the missed attack and continue with combat</div>
          <div id="yes-help">Proceed to burn Luck points to try to hit</div>
        </div>
      </div>
    </Modal>
  );
};

export default LuckConfirmModal;

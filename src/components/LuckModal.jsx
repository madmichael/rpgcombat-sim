import React from 'react';
import Modal from './Modal';
import InfoIcon from './InfoIcon.jsx';
import { useGearEffects } from '../hooks/useGearEffects';

const LuckModal = ({ 
  show, 
  onClose, 
  pendingAttack, 
  character, 
  luckToBurn, 
  setLuckToBurn, 
  onBurnLuck, 
  onKeepRoll 
}) => {
  if (!show || !pendingAttack) return null;

  const gearEffects = useGearEffects(character);
  const abilityType = pendingAttack.abilityType || 'Strength';
  const abilityMod = (character?.modifiers && character.modifiers[abilityType]) || 0;
  const gearAtkBonus = gearEffects?.attackBonus || 0;
  const atkBreakdown = `d20 ${pendingAttack.rawAttackRoll} + ${abilityType} ${abilityMod >= 0 ? '+' : ''}${abilityMod}` +
    (gearAtkBonus ? ` + Gear ATK ${gearAtkBonus >= 0 ? '+' : ''}${gearAtkBonus}` : '') +
    ` = ${pendingAttack.charAttackRoll}`;

  const maxLuck = character.Luck;

  return (
    <Modal onClose={onClose}>
      <div className="luck-modal" role="dialog" aria-labelledby="luck-modal-title" aria-describedby="luck-modal-description">
        <div className="modal-header luck-modal-header">
          <div className="luck-icon">🍀</div>
          <h2 id="luck-modal-title">Burn Luck to Improve Attack</h2>
          <p className="luck-subtitle">Make your guess and hope luck is with you!</p>
        </div>

        <div className="modal-content luck-modal-content">
          <div className="attack-summary">
            <div className="attack-info">
              <div className="info-section">
                <h3>🎯 Current Situation</h3>
                <div className="attack-details">
                  <div className="detail-item">
                    <span className="detail-label">Your Attack Roll:</span>
                    <span className="detail-value attack-roll" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      {pendingAttack?.charAttackRoll}
                      <InfoIcon text={atkBreakdown} />
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Result:</span>
                    <span className="detail-value missed">Missed</span>
                  </div>
                </div>
              </div>

              <div className="luck-status">
                <h3>🌟 Luck Available</h3>
                <div className="luck-display">
                  <div className="luck-current">
                    <span className="luck-label">Current Luck:</span>
                    <span className="luck-value">{character.Luck}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="luck-controls">
            <div className="luck-input-section">
              <label htmlFor="luck-amount" className="luck-input-label">
                💫 How much Luck do you want to burn?
              </label>
              <div className="luck-input-container">
                <input 
                  id="luck-amount"
                  type="number" 
                  min="1" 
                  max={maxLuck} 
                  value={luckToBurn} 
                  onChange={e => setLuckToBurn(Number(e.target.value))}
                  className="luck-input"
                  aria-describedby="luck-input-help"
                  aria-required="true"
                />
                <div className="luck-slider-container">
                  <input
                    type="range"
                    min="1"
                    max={maxLuck}
                    value={luckToBurn}
                    onChange={e => setLuckToBurn(Number(e.target.value))}
                    className="luck-slider"
                    aria-label="Luck amount slider"
                  />
                </div>
              </div>
              <div id="luck-input-help" className="form-help">
                Choose between 1 and {maxLuck} - you won't know if it's enough until you try!
              </div>
            </div>

            <div className="guess-section">
              <h4>🎲 Take Your Chance</h4>
              <p className="guess-text">
                You don't know how much the monster's armor can deflect. 
                Burning more Luck gives you a better chance, but you might waste it if you burn too much!
              </p>
            </div>
          </div>

          <div className="luck-warning">
            <p>⚠️ <em>Burned Luck is permanently lost until you rest!</em></p>
          </div>
        </div>

        <div className="modal-actions luck-actions">
          <button 
            onClick={() => onBurnLuck(luckToBurn)}
            className="btn btn-large luck-burn-btn btn-primary"
            aria-describedby="burn-luck-help"
            disabled={luckToBurn < 1 || luckToBurn > maxLuck}
          >
            🔥 Burn {luckToBurn} Luck
          </button>
          <button 
            onClick={onKeepRoll}
            className="btn btn-large btn-secondary luck-keep-btn"
            aria-describedby="keep-roll-help"
          >
            🎲 Keep Roll
          </button>
        </div>

        <div className="sr-only">
          <div id="burn-luck-help">Spend {luckToBurn} Luck points to add to your attack roll</div>
          <div id="keep-roll-help">Keep your current attack roll of {pendingAttack?.charAttackRoll} without spending Luck</div>
        </div>
      </div>
    </Modal>
  );
};

export default LuckModal;

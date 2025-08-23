import React from 'react';
import EnhancedCharacterSummary from './EnhancedCharacterSummary';
import EnhancedMonsterSummary from './EnhancedMonsterSummary';

function CombatDashboard({ character, monster, weapon, fightStatus, charHp, monsterHp, combatLog, monsterACRevealed, selectedChallenge, getChallengeLabel, achievements = [], stats = {} }) {
  const [showCharacterDetails, setShowCharacterDetails] = React.useState(false);
  const [showMonsterDetails, setShowMonsterDetails] = React.useState(false);
  const getHealthPercentage = (current, max) => {
    return Math.max(0, (current / max) * 100);
  };

  const getHealthColor = (percentage) => {
    if (percentage > 60) return '#28a745';
    if (percentage > 30) return '#ffc107';
    return '#dc3545';
  };

  const charMaxHp = character?.hp || 0;
  const monsterMaxHp = monster?.["Hit Points"] || 0;
  const charHealthPercent = getHealthPercentage(charHp, charMaxHp);
  const monsterHealthPercent = getHealthPercentage(monsterHp, monsterMaxHp);

  return (
    <div className="combat-dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">⚔️ Combat Dashboard</h2>
        <div className="challenge-badge">
          {getChallengeLabel && selectedChallenge ? getChallengeLabel(selectedChallenge) : 'Unknown'} Threat Level
        </div>
      </div>
      
      <div className="dashboard-content">
        {/* Character Status */}
        <div className="combatant-status character-status">
          <div className="combatant-header">
            <div className="combatant-info">
              <span className="combatant-icon">🛡️</span>
              <div className="combatant-details">
                <h3 className="combatant-name">{character?.name || 'Character'}</h3>
                <div className="combatant-class">{character?.occupation?.Occupation || 'Adventurer'}</div>
              </div>
            </div>
            <div className="essential-stats">
              <div className="stat-item">
                <span className="stat-label">AC</span>
                <span className="stat-value">{character?.ac || 10}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">ATK</span>
                <span className="stat-value">+{character?.modifiers?.Strength || 0}</span>
              </div>
              <div className="stat-item">
                <button 
                  className="details-toggle-btn"
                  onClick={() => setShowCharacterDetails(!showCharacterDetails)}
                  aria-label="Toggle character details"
                >
                  {showCharacterDetails ? '▼' : '▶'} Details
                </button>
              </div>
            </div>
          </div>
          
          <div className="health-display">
            <div className="health-bar-container">
              <div className="health-label">
                <span>Hit Points</span>
                <span className="health-numbers">{charHp} / {charMaxHp}</span>
              </div>
              <div className="health-bar">
                <div 
                  className="health-fill character-health"
                  style={{ 
                    width: `${charHealthPercent}%`,
                    backgroundColor: getHealthColor(charHealthPercent)
                  }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Expandable Character Details */}
          {showCharacterDetails && (
            <div className="character-details-expanded">
              <EnhancedCharacterSummary 
                character={character} 
                charHp={charHp}
                achievements={achievements}
                stats={stats}
              />
            </div>
          )}
        </div>

        {/* VS Indicator */}
        <div className="vs-indicator">
          <div className="vs-text">VS</div>
          <div className="combat-status">{fightStatus}</div>
        </div>

        {/* Monster Status */}
        <div className="combatant-status monster-status">
          <div className="combatant-header">
            <div className="combatant-info">
              <span className="combatant-icon">👹</span>
              <div className="combatant-details">
                <h3 className="combatant-name">{monster?.name || 'Monster'}</h3>
                <div className="combatant-class">Challenge Level {getChallengeLabel ? getChallengeLabel() : selectedChallenge}</div>
              </div>
            </div>
            <div className="essential-stats">
              <div className="stat-item">
                <span className="stat-label">AC</span>
                <span className="stat-value">{monsterACRevealed ? (monster?.["Armor Class"] || 10) : '?'}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">HD</span>
                <span className="stat-value">{monster?.["Hit Die"] || 'N/A'}</span>
              </div>
              <div className="stat-item">
                <button 
                  className="details-toggle-btn"
                  onClick={() => setShowMonsterDetails(!showMonsterDetails)}
                  aria-label="Toggle monster details"
                >
                  {showMonsterDetails ? '▼' : '▶'} Details
                </button>
              </div>
            </div>
          </div>
          
          <div className="health-display">
            <div className="health-bar-container">
              <div className="health-label">
                <span>Hit Points</span>
                <span className="health-numbers">{monsterHp} / {monsterMaxHp}</span>
              </div>
              <div className="health-bar">
                <div 
                  className="health-fill monster-health"
                  style={{ 
                    width: `${monsterHealthPercent}%`,
                    backgroundColor: getHealthColor(monsterHealthPercent)
                  }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Expandable Monster Details */}
          {showMonsterDetails && (
            <div className="monster-details-expanded">
              <EnhancedMonsterSummary monster={monster} monsterHp={monsterHp} monsterACRevealed={monsterACRevealed} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CombatDashboard;

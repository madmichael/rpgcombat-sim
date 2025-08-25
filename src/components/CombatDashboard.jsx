import React from 'react';
import EnhancedCharacterSummary from './EnhancedCharacterSummary';
import EnhancedMonsterSummary from './EnhancedMonsterSummary';
import { useGearEffects } from '../hooks/useGearEffects';
import InfoIcon from './InfoIcon';

function CombatDashboard({ character, monster, weapon, fightStatus, charHp, monsterHp, combatLog, monsterACRevealed, selectedChallenge, getChallengeLabel, achievements = [], stats = {}, onCharacterChange, onFindAnother, focusTrigger }) {
  const [showCharacterDetails, setShowCharacterDetails] = React.useState(false);
  const [showMonsterDetails, setShowMonsterDetails] = React.useState(false);
  const [isHeaderStuck, setIsHeaderStuck] = React.useState(false);
  const headerRef = React.useRef(null);
  const monsterNameRef = React.useRef(null);
  const gearEffects = useGearEffects(character || {});
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

  // Build AC breakdown text for tooltip
  const acText = gearEffects?.acBreakdown
    ? `10 + Agi ${gearEffects.acBreakdown.agilityMod >= 0 ? '+' : ''}${gearEffects.acBreakdown.agilityMod}` +
      ` + Armor ${gearEffects.acBreakdown.armorBonus}` +
      (gearEffects.acBreakdown.gearACBonus ? ` + Gear ${gearEffects.acBreakdown.gearACBonus}` : '') +
      ` = ${gearEffects.acBreakdown.total}`
    : '';

  // Build ATK breakdown text and value
  const baseStrMod = character?.modifiers?.Strength || 0;
  const gearAtkBonus = gearEffects?.attackBonus || 0;
  const gearStrBonus = gearEffects?.abilityModifiers?.Strength || 0;
  const totalAtk = gearEffects?.totalAttackBonus || (baseStrMod + gearAtkBonus + gearStrBonus);
  const atkText = `STR ${baseStrMod >= 0 ? '+' : ''}${baseStrMod}` +
    (gearAtkBonus ? ` + Gear ATK ${gearAtkBonus >= 0 ? '+' : ''}${gearAtkBonus}` : '') +
    (gearStrBonus ? ` + Gear STR ${gearStrBonus >= 0 ? '+' : ''}${gearStrBonus}` : '') +
    ` = ${totalAtk >= 0 ? '+' : ''}${totalAtk}`;

  // Observe header stickiness to toggle shadow only when stuck
  React.useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the header's top crosses the viewport top, it becomes sticky
        setIsHeaderStuck(entry.intersectionRatio < 1 && entry.boundingClientRect.top <= (parseInt(getComputedStyle(header).top) || 0));
      },
      { threshold: [1] }
    );
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  // Move keyboard focus to the monster name when focusTrigger changes (i.e., new encounter)
  React.useEffect(() => {
    if (monsterNameRef.current && focusTrigger) {
      // slight delay to ensure element is in DOM and layout settled
      const id = setTimeout(() => {
        try {
          monsterNameRef.current.focus({ preventScroll: true });
        } catch {}
      }, 0);
      return () => clearTimeout(id);
    }
  }, [focusTrigger]);

  return (
    <div className="combat-dashboard">
      <div ref={headerRef} className={`dashboard-header${isHeaderStuck ? ' stuck' : ''}`}>
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
                <span className="stat-value" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {gearEffects?.totalArmorClass || 10}
                  {gearEffects?.acBreakdown && <InfoIcon text={acText} />}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">ATK</span>
                <span className="stat-value" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  {totalAtk >= 0 ? `+${totalAtk}` : totalAtk}
                  <InfoIcon text={atkText} />
                </span>
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
                onCharacterChange={onCharacterChange}
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
                <div className="monster-name-row" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <h3
                    className="combatant-name"
                    style={{ margin: 0 }}
                    ref={monsterNameRef}
                    tabIndex="-1"
                  >
                    {monster?.name || 'Monster'}
                  </h3>
                  {onFindAnother && (
                    <button
                      type="button"
                      className="btn-small"
                      onClick={onFindAnother}
                      aria-label="Find a new monster"
                      title="Find another monster"
                      style={{ padding: '4px 8px', fontSize: 12 }}
                    >
                      Find Another
                    </button>
                  )}
                </div>
                <div className="combatant-class">Challenge Level {getChallengeLabel && selectedChallenge ? getChallengeLabel(selectedChallenge) : selectedChallenge}</div>
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

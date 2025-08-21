import React from 'react';
import EnhancedCharacterSummary from './EnhancedCharacterSummary';
import EnhancedMonsterSummary from './EnhancedMonsterSummary';
import CombatLogEntry from './CombatLogEntry';

const CombatLog = ({ log, character, monster, charHp, monsterHp, onReset }) => {
  // Reverse the log order so most recent entries appear at the top
  const reversedLog = [...log].reverse();
  
  return (
    <div className="combat-log">
      <div className="combat-log-header">
        <h2>Combat Log</h2>
        <button 
          onClick={onReset} 
          className="reset-button"
        >
          Reset
        </button>
      </div>
      <div className="combat-log-content">
        <ul className="combat-log-list">
          {reversedLog.map((entry, idx) => (
            <CombatLogEntry 
              key={log.length - 1 - idx} 
              entry={entry} 
              index={log.length - 1 - idx} 
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CombatLog;

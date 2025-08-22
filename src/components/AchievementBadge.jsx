import React from 'react';

const AchievementBadge = ({ achievement, size = 'medium', showTooltip = true }) => {
  return (
    <div className={`achievement-badge ${size} ${achievement.rarity} ${achievement.unlocked ? 'unlocked' : 'locked'}`}>
      <div className="badge-icon">
        <span>{achievement.icon}</span>
      </div>
      
      {showTooltip && (
        <div className="achievement-tooltip">
          <div className="tooltip-name">{achievement.name}</div>
          <div className="tooltip-description">{achievement.description}</div>
          <div className="tooltip-rarity">{achievement.rarity}</div>
          {achievement.unlockedAt && (
            <div className="tooltip-date">
              Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
            </div>
          )}
          <div className="tooltip-arrow"></div>
        </div>
      )}
    </div>
  );
};

export default AchievementBadge;

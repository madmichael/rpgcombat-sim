import React, { useState } from 'react';
import AchievementBadge from './AchievementBadge';

const AchievementPanel = ({ isOpen, onClose, achievementTracking }) => {
  const [selectedRarity, setSelectedRarity] = useState('all');
  
  if (!isOpen) return null;
  
  const rarityFilters = [
    { key: 'all', label: 'All', color: 'bg-gray-500' },
    { key: 'common', label: 'Common', color: 'bg-gray-400' },
    { key: 'uncommon', label: 'Uncommon', color: 'bg-green-500' },
    { key: 'rare', label: 'Rare', color: 'bg-blue-500' },
    { key: 'legendary', label: 'Legendary', color: 'bg-purple-500' }
  ];

  const achievements = achievementTracking?.achievements || [];
  const stats = achievementTracking?.stats || {};
  const totalAchievements = achievements.length;
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const filteredAchievements = selectedRarity === 'all' 
    ? achievements 
    : achievements.filter(a => a.rarity === selectedRarity);

  const completionPercentage = totalAchievements > 0 ? Math.round((unlockedCount / totalAchievements) * 100) : 0;

  return (
    <div className="modal-overlay">
      <div className="modal-container achievement-modal">
        <div className="modal-header achievement-header">
          <h3>Achievements</h3>
          <div className="completion-stats">
            {unlockedCount} / {totalAchievements} ({completionPercentage}%)
          </div>
          <button 
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Close achievements panel"
          >
            ×
          </button>
        </div>

        <div className="modal-content achievement-content">
          {/* Progress Bar */}
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>

          {/* Rarity Filters */}
          <div className="rarity-filters">
            {rarityFilters.map(filter => (
              <button
                key={filter.key}
                onClick={() => setSelectedRarity(filter.key)}
                className={`rarity-filter ${selectedRarity === filter.key ? 'active' : ''} ${filter.key}`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Achievement Grid */}
          <div className="achievement-grid">
            {filteredAchievements.map(achievement => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                size="medium"
              />
            ))}
          </div>

          {filteredAchievements.length === 0 && (
            <div className="no-achievements">
              {selectedRarity === 'all' 
                ? 'No achievements unlocked yet. Start fighting to earn your first badge!'
                : `No ${selectedRarity} achievements unlocked yet.`
              }
            </div>
          )}

          {/* Stats Summary */}
          <div className="stats-summary">
            <h4>Combat Statistics</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value victories">{stats.victories || 0}</div>
                <div className="stat-label">Victories</div>
              </div>
              <div className="stat-item">
                <div className="stat-value fumbles">{stats.fumbles_survived || 0}</div>
                <div className="stat-label">Fumbles Survived</div>
              </div>
              <div className="stat-item">
                <div className="stat-value criticals">{stats.critical_hits || 0}</div>
                <div className="stat-label">Critical Hits</div>
              </div>
              <div className="stat-item">
                <div className="stat-value streaks">{stats.consecutive_nat20s || 0}</div>
                <div className="stat-label">Best Nat20 Streak</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementPanel;

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Achievements</h3>
          <div className="text-sm text-gray-600">
            {unlockedCount} / {totalAchievements} ({completionPercentage}%)
          </div>
        </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${completionPercentage}%` }}
        ></div>
      </div>

      {/* Rarity Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {rarityFilters.map(filter => (
          <button
            key={filter.key}
            onClick={() => setSelectedRarity(filter.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
              selectedRarity === filter.key
                ? `${filter.color} text-white`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3">
        {filteredAchievements.map(achievement => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            size="medium"
          />
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          {selectedRarity === 'all' 
            ? 'No achievements unlocked yet. Start fighting to earn your first badge!'
            : `No ${selectedRarity} achievements unlocked yet.`
          }
        </div>
      )}

      {/* Stats Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="font-semibold text-gray-700 mb-2">Combat Statistics</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="font-bold text-lg text-blue-600">{stats.victories}</div>
            <div className="text-gray-600">Victories</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-red-600">{stats.fumbles_survived}</div>
            <div className="text-gray-600">Fumbles Survived</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-yellow-600">{stats.critical_hits}</div>
            <div className="text-gray-600">Critical Hits</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-purple-600">{stats.consecutive_nat20s}</div>
            <div className="text-gray-600">Best Nat20 Streak</div>
          </div>
        </div>
      </div>
      
        {/* Close Button */}
        <div className="flex justify-end mt-4">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AchievementPanel;

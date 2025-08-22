import React from 'react';

const AchievementBadge = ({ achievement, size = 'medium', showTooltip = true }) => {
  const sizeClasses = {
    small: 'w-8 h-8 text-xs',
    medium: 'w-12 h-12 text-sm',
    large: 'w-16 h-16 text-base'
  };

  const rarityColors = {
    common: 'bg-gray-100 border-gray-300 text-gray-700',
    uncommon: 'bg-green-100 border-green-300 text-green-700',
    rare: 'bg-blue-100 border-blue-300 text-blue-700',
    legendary: 'bg-purple-100 border-purple-300 text-purple-700'
  };

  const rarityGlow = {
    common: '',
    uncommon: 'shadow-green-200',
    rare: 'shadow-blue-200 shadow-md',
    legendary: 'shadow-purple-200 shadow-lg animate-pulse'
  };

  return (
    <div className="relative group">
      <div className={`
        ${sizeClasses[size]} 
        ${rarityColors[achievement.rarity]}
        ${rarityGlow[achievement.rarity]}
        rounded-full border-2 flex items-center justify-center
        font-bold cursor-pointer transition-all duration-200
        hover:scale-110 hover:shadow-lg
      `}>
        <span className="text-lg">{achievement.icon}</span>
      </div>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200
                        bg-gray-800 text-white text-xs rounded py-2 px-3 whitespace-nowrap
                        z-10 pointer-events-none">
          <div className="font-semibold">{achievement.name}</div>
          <div className="text-gray-300">{achievement.description}</div>
          <div className="text-xs text-gray-400 capitalize mt-1">{achievement.rarity}</div>
          {achievement.unlockedAt && (
            <div className="text-xs text-gray-400 mt-1">
              Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
            </div>
          )}
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 
                          border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

export default AchievementBadge;

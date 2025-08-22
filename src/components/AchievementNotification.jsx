import React, { useState, useEffect } from 'react';
import AchievementBadge from './AchievementBadge';

const AchievementNotification = ({ achievements, onDismiss }) => {
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (achievements.length > 0) {
      setVisible(true);
      setCurrentIndex(0);
    }
  }, [achievements]);

  useEffect(() => {
    if (visible && achievements.length > 0) {
      const timer = setTimeout(() => {
        if (currentIndex < achievements.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setVisible(false);
          setTimeout(() => onDismiss(), 300);
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible, currentIndex, achievements.length, onDismiss]);

  if (!visible || achievements.length === 0) return null;

  const achievement = achievements[currentIndex];

  return (
    <div className={`
      fixed top-4 right-4 z-50 
      bg-white rounded-lg shadow-2xl border-2 border-purple-200
      p-4 min-w-80 max-w-sm
      transform transition-all duration-300 ease-out
      ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <div className="flex items-center space-x-3">
        <AchievementBadge 
          achievement={achievement} 
          size="large" 
          showTooltip={false}
        />
        <div className="flex-1">
          <div className="text-lg font-bold text-gray-800">
            Achievement Unlocked!
          </div>
          <div className="text-purple-600 font-semibold">
            {achievement.name}
          </div>
          <div className="text-sm text-gray-600">
            {achievement.description}
          </div>
        </div>
      </div>
      
      {achievements.length > 1 && (
        <div className="mt-3 flex justify-center space-x-1">
          {achievements.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                index === currentIndex ? 'bg-purple-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
      
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => onDismiss(), 300);
        }}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl leading-none"
      >
        ×
      </button>
    </div>
  );
};

export default AchievementNotification;

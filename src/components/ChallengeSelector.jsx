import React from 'react';

const challengeLevels = [
  { 
    value: 'patheticCreatures', 
    label: 'Pathetic Creatures', 
    description: 'Weakest foes for beginners',
    icon: '🐭',
    difficulty: 1,
    arrayIndex: 0
  },
  { 
    value: 'veryWeakCreatures', 
    label: 'Very Weak Creatures', 
    description: 'Still learning the ropes',
    icon: '🐰',
    difficulty: 2,
    arrayIndex: 1
  },
  { 
    value: 'weakCreatures', 
    label: 'Weak Creatures', 
    description: 'Getting more challenging',
    icon: '🐺',
    difficulty: 3,
    arrayIndex: 2
  },
  { 
    value: 'standardCreatures', 
    label: 'Standard Creatures', 
    description: 'Balanced encounters',
    icon: '🐻',
    difficulty: 4,
    arrayIndex: 3
  },
  { 
    value: 'strongCreatures', 
    label: 'Strong Creatures', 
    description: 'Serious threats',
    icon: '🦁',
    difficulty: 5,
    arrayIndex: 4
  },
  { 
    value: 'veryStrongCreatures', 
    label: 'Very Strong Creatures', 
    description: 'Dangerous adversaries',
    icon: '🐉',
    difficulty: 6,
    arrayIndex: 5
  },
  { 
    value: 'extremeCreatures', 
    label: 'Legendary Creatures', 
    description: 'Only for the bravest heroes',
    icon: '💀',
    difficulty: 7,
    arrayIndex: 6
  }
];

const ChallengeSelector = ({ selectedChallenge, onChallengeChange }) => {
  const getDifficultyStars = (difficulty) => {
    return '⭐'.repeat(difficulty) + '☆'.repeat(7 - difficulty);
  };

  return (
    <section className="challenge-selector" aria-labelledby="challenge-heading">
      <div className="challenge-header">
        <p className="challenge-subtitle">Select the difficulty level for your dungeon encounter</p>
      </div>
      
      <div className="challenge-grid" role="radiogroup" aria-labelledby="challenge-heading">
        {challengeLevels.map(level => (
          <div
            key={level.value}
            className={`challenge-card ${selectedChallenge === level.value ? 'selected' : ''}`}
            onClick={() => onChallengeChange(level.value)}
            role="radio"
            aria-checked={selectedChallenge === level.value}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onChallengeChange(level.value);
              }
            }}
          >
            <div className="challenge-icon">{level.icon}</div>
            <div className="challenge-content">
              <h4 className="challenge-title">{level.label}</h4>
              <p className="challenge-description">{level.description}</p>
              <div className="challenge-difficulty" aria-label={`Difficulty: ${level.difficulty} out of 7 stars`}>
                {getDifficultyStars(level.difficulty)}
              </div>
            </div>
            <div className="challenge-selector-indicator">
              {selectedChallenge === level.value && <span>✓</span>}
            </div>
          </div>
        ))}
      </div>
      
      <div className="challenge-info">
        <div className="selected-challenge-display">
          <strong>Selected: </strong>
          {challengeLevels.find(l => l.value === selectedChallenge)?.label || 'None'}
        </div>
      </div>
    </section>
  );
};

export default ChallengeSelector;

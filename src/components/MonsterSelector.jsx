import React from 'react';

const MonsterSelector = ({ monsters, onSelect }) => {
  // TODO: Add monster selection UI
  return (
    <div>
      <h2>Choose a Monster</h2>
      {/* Monster list goes here */}
      <button onClick={() => onSelect({ name: 'Goblin', hp: 6, str: 8 })}>
        Select Goblin
      </button>
    </div>
  );
};

export default MonsterSelector;

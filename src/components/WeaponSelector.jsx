import React from 'react';

const WeaponSelector = ({ weapons, onSelect }) => {
  // TODO: Add weapon selection UI
  return (
    <div>
      <h2>Choose a Weapon or Item</h2>
      {/* Weapon list goes here */}
      <button onClick={() => onSelect({ name: 'Club', dmg: '1d4' })}>
        Select Club
      </button>
    </div>
  );
};

export default WeaponSelector;

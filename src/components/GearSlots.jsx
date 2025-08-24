import React, { useState } from 'react';
import gearData from '../data/gear.json';
import GearManagementModal from './GearManagementModal';
import useGearManagement from '../hooks/useGearManagement';
import './GearSlots.css';

const GearSlots = ({ character, onCharacterChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!character || !character.gearSlots) return null;

  const { gearSlots, gearTypes } = gearData;
  
  const handleSlotClick = (slotName) => {
    setIsModalOpen(true);
  };

  const handleEquipItem = (item, slotName) => {
    console.log('handleEquipItem called:', { item, slotName });
    if (!item || !slotName || !onCharacterChange) {
      console.log('Missing required parameters:', { item: !!item, slotName: !!slotName, onCharacterChange: !!onCharacterChange });
      return;
    }
    
    const updatedCharacter = { ...character };
    const currentlyEquipped = updatedCharacter.gearSlots[slotName];
    console.log('Current equipped item in slot:', currentlyEquipped);
    
    // If there's already an item in the slot, move it to backpack
    if (currentlyEquipped) {
      updatedCharacter.backpack = [...(updatedCharacter.backpack || []), currentlyEquipped];
    }
    
    // Equip the new item
    updatedCharacter.gearSlots = {
      ...updatedCharacter.gearSlots,
      [slotName]: item
    };
    
    // Remove item from backpack if it was there
    const originalBackpackLength = (updatedCharacter.backpack || []).length;
    updatedCharacter.backpack = (updatedCharacter.backpack || []).filter(backpackItem => 
      backpackItem.id !== item.id
    );
    console.log('Backpack length before/after removal:', originalBackpackLength, updatedCharacter.backpack.length);
    
    console.log('Updated character:', updatedCharacter);
    onCharacterChange(updatedCharacter);
  };

  const handleUnequipItem = (slotName) => {
    if (!slotName || !onCharacterChange) return;
    
    const updatedCharacter = { ...character };
    const itemToUnequip = updatedCharacter.gearSlots[slotName];
    
    if (!itemToUnequip) return; // Nothing to unequip
    
    // Move item to backpack
    updatedCharacter.backpack = [...(updatedCharacter.backpack || []), itemToUnequip];
    
    // Clear the slot
    updatedCharacter.gearSlots = {
      ...updatedCharacter.gearSlots,
      [slotName]: null
    };
    
    onCharacterChange(updatedCharacter);
  };

  const handleMoveToBackpack = (item) => {
    if (!item || !onCharacterChange) return;
    
    const updatedCharacter = { ...character };
    
    // Add to backpack if not already there
    const isAlreadyInBackpack = (updatedCharacter.backpack || []).some(
      backpackItem => backpackItem.id === item.id
    );
    
    if (!isAlreadyInBackpack) {
      updatedCharacter.backpack = [...(updatedCharacter.backpack || []), item];
      onCharacterChange(updatedCharacter);
    }
  };

  const renderGearSlot = (slotName) => {
    const slotInfo = gearTypes[slotName];
    const equippedItem = character.gearSlots[slotName];
    
    return (
      <div 
        key={slotName}
        className="gear-slot"
        onClick={() => handleSlotClick(slotName)}
        title={slotInfo.description}
      >
        <div className="gear-slot-header">
          <span className="gear-slot-icon">{slotInfo.icon}</span>
          <span className="gear-slot-name">{slotInfo.name}</span>
        </div>
        <div className="gear-slot-content">
          {equippedItem ? (
            <div className="equipped-item">
              <span className="item-icon">{equippedItem.icon || '📦'}</span>
              <span className="item-name">{equippedItem.name}</span>
            </div>
          ) : (
            <div className="empty-slot">
              <span className="empty-text">Empty</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="gear-slots-container">
      <div className="gear-header">
        <h3 className="gear-title">⚔️ Equipment</h3>
        <button 
          className="manage-gear-btn"
          onClick={() => setIsModalOpen(true)}
          title="Manage Equipment"
        >
          🎒 Manage
        </button>
      </div>
      <div className="gear-grid">
        {gearSlots.map(slotName => renderGearSlot(slotName))}
      </div>
      
      <GearManagementModal
        character={character}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEquipItem={handleEquipItem}
        onUnequipItem={handleUnequipItem}
        onMoveToBackpack={handleMoveToBackpack}
        onCharacterChange={onCharacterChange}
      />
    </div>
  );
};

export default GearSlots;

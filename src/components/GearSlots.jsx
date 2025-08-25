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

  // Normalize potential slot aliases
  const normalizeSlotName = (slot) => {
    if (!slot) return slot;
    const s = String(slot).toLowerCase();
    const map = {
      armor: 'body',
      chest: 'body',
      torso: 'body',
      helm: 'head',
      helmet: 'head',
      ring: 'rightFingers',
      finger: 'rightFingers',
      hand_right: 'rightHand',
      hand_left: 'leftHand'
    };
    return map[s] || slot;
  };

  const handleEquipItem = (item, slotName) => {
    console.log('handleEquipItem called:', { item, slotName });
    const normalizedSlot = normalizeSlotName(slotName);
    // Validate slot against known slots
    const validSlots = gearData.gearSlots || [];
    const finalSlot = validSlots.includes(normalizedSlot) ? normalizedSlot : slotName;
    if (!item || !finalSlot || !onCharacterChange) {
      console.log('Missing required parameters:', { item: !!item, slotName: !!slotName, onCharacterChange: !!onCharacterChange });
      return;
    }
    
    const updatedCharacter = { ...character };
    const currentlyEquipped = updatedCharacter.gearSlots[finalSlot];
    console.log('Current equipped item in slot:', currentlyEquipped);
    
    // If there's already an item in the slot, move it to backpack
    if (currentlyEquipped) {
      updatedCharacter.backpack = [...(updatedCharacter.backpack || []), currentlyEquipped];
    }
    
    // If item occupies both hands, equip to both with a shared pairId
    if (finalSlot === 'hands') {
      // Move any existing hand items to backpack
      const rightEquipped = updatedCharacter.gearSlots.rightHand;
      const leftEquipped = updatedCharacter.gearSlots.leftHand;
      if (rightEquipped) updatedCharacter.backpack = [...(updatedCharacter.backpack || []), rightEquipped];
      if (leftEquipped) updatedCharacter.backpack = [...(updatedCharacter.backpack || []), leftEquipped];

      const pairId = `hands_${item.id || item.name || 'gloves'}_${Date.now()}`;
      const rightCopy = { ...item, slot: 'rightHand', pairId };
      const leftCopy = { ...item, slot: 'leftHand', pairId };
      updatedCharacter.gearSlots = {
        ...updatedCharacter.gearSlots,
        rightHand: rightCopy,
        leftHand: leftCopy
      };
    } else {
      // Create an equipped copy with normalized slot for persistence/UX
      const equippedCopy = { ...item, slot: finalSlot };
      // Equip the new item
      updatedCharacter.gearSlots = {
        ...updatedCharacter.gearSlots,
        [finalSlot]: equippedCopy
      };
    }
    
    // Remove item from backpack safely (works even if item.id is missing)
    const originalBackpackLength = (updatedCharacter.backpack || []).length;
    if (Array.isArray(updatedCharacter.backpack) && updatedCharacter.backpack.length > 0) {
      const idx = updatedCharacter.backpack.findIndex(bi => {
        if (item && bi === item) return true; // same reference
        if (item?.id != null && bi?.id != null) return bi.id === item.id; // fallback to id if available
        // As a last resort, match by name+slot to remove only one instance
        return bi?.name === item?.name && bi?.slot === item?.slot;
      });
      if (idx >= 0) {
        updatedCharacter.backpack = [
          ...updatedCharacter.backpack.slice(0, idx),
          ...updatedCharacter.backpack.slice(idx + 1)
        ];
      }
    }
    console.log('Backpack length before/after removal:', originalBackpackLength, updatedCharacter.backpack?.length);
    
    console.log('Updated character:', updatedCharacter);
    onCharacterChange(updatedCharacter);
  };

  const handleUnequipItem = (slotName) => {
    if (!slotName || !onCharacterChange) return;
    
    const updatedCharacter = { ...character };
    const itemToUnequip = updatedCharacter.gearSlots[slotName];
    
    if (!itemToUnequip) return; // Nothing to unequip
    
    // If this item is part of a gloves pair, remove both hands together
    if (itemToUnequip.pairId && (slotName === 'rightHand' || slotName === 'leftHand')) {
      const otherSlot = slotName === 'rightHand' ? 'leftHand' : 'rightHand';
      const otherItem = updatedCharacter.gearSlots[otherSlot];
      // Move both to backpack (avoid duplicating if references are same)
      const newBackpack = [...(updatedCharacter.backpack || []), itemToUnequip];
      if (otherItem && otherItem.pairId === itemToUnequip.pairId) {
        newBackpack.push(otherItem);
      }
      updatedCharacter.backpack = newBackpack;
      // Clear both hands
      updatedCharacter.gearSlots = {
        ...updatedCharacter.gearSlots,
        rightHand: otherItem && otherItem.pairId === itemToUnequip.pairId ? null : updatedCharacter.gearSlots.rightHand,
        leftHand: otherItem && otherItem.pairId === itemToUnequip.pairId ? null : updatedCharacter.gearSlots.leftHand,
      };
      // Ensure the actual slot cleared as well
      updatedCharacter.gearSlots[slotName] = null;
      updatedCharacter.gearSlots[otherSlot] = null;
    } else {
      // Move item to backpack
      updatedCharacter.backpack = [...(updatedCharacter.backpack || []), itemToUnequip];
      // Clear the slot
      updatedCharacter.gearSlots = {
        ...updatedCharacter.gearSlots,
        [slotName]: null
      };
    }
    
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

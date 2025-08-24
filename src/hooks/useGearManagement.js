import { useState, useCallback } from 'react';

const useGearManagement = (initialCharacter) => {
  const [character, setCharacter] = useState(initialCharacter);

  const equipItem = useCallback((item, slotName) => {
    if (!item || !slotName) return false;
    
    setCharacter(prevChar => {
      const newChar = { ...prevChar };
      const currentlyEquipped = newChar.gearSlots[slotName];
      
      // If there's already an item in the slot, move it to backpack
      if (currentlyEquipped) {
        newChar.backpack = [...(newChar.backpack || []), currentlyEquipped];
      }
      
      // Equip the new item
      newChar.gearSlots = {
        ...newChar.gearSlots,
        [slotName]: item
      };
      
      // Remove item from backpack if it was there
      newChar.backpack = (newChar.backpack || []).filter(backpackItem => 
        backpackItem.id !== item.id
      );
      
      return newChar;
    });
    
    return true;
  }, []);

  const unequipItem = useCallback((slotName) => {
    if (!slotName) return false;
    
    setCharacter(prevChar => {
      const newChar = { ...prevChar };
      const itemToUnequip = newChar.gearSlots[slotName];
      
      if (!itemToUnequip) return prevChar; // Nothing to unequip
      
      // Move item to backpack
      newChar.backpack = [...(newChar.backpack || []), itemToUnequip];
      
      // Clear the slot
      newChar.gearSlots = {
        ...newChar.gearSlots,
        [slotName]: null
      };
      
      return newChar;
    });
    
    return true;
  }, []);

  const moveToBackpack = useCallback((item) => {
    if (!item) return false;
    
    setCharacter(prevChar => {
      const newChar = { ...prevChar };
      
      // Add to backpack if not already there
      const isAlreadyInBackpack = (newChar.backpack || []).some(
        backpackItem => backpackItem.id === item.id
      );
      
      if (!isAlreadyInBackpack) {
        newChar.backpack = [...(newChar.backpack || []), item];
      }
      
      return newChar;
    });
    
    return true;
  }, []);

  const removeFromBackpack = useCallback((itemId) => {
    if (!itemId) return false;
    
    setCharacter(prevChar => {
      const newChar = { ...prevChar };
      newChar.backpack = (newChar.backpack || []).filter(
        item => item.id !== itemId
      );
      return newChar;
    });
    
    return true;
  }, []);

  const canEquipItem = useCallback((item, slotName) => {
    if (!item || !slotName) return false;
    
    // Check if item can be equipped in this slot
    return item.slot === slotName || 
           (item.slot === 'weapon' && (slotName === 'rightHand' || slotName === 'leftHand')) ||
           (item.slot === 'meleeWeapon' && slotName === 'meleeWeapon') ||
           (item.slot === 'rangedWeapon' && slotName === 'rangedWeapon');
  }, []);

  const getSlotItem = useCallback((slotName) => {
    return character?.gearSlots?.[slotName] || null;
  }, [character]);

  const getBackpackItems = useCallback(() => {
    return character?.backpack || [];
  }, [character]);

  return {
    character,
    setCharacter,
    equipItem,
    unequipItem,
    moveToBackpack,
    removeFromBackpack,
    canEquipItem,
    getSlotItem,
    getBackpackItems
  };
};

export default useGearManagement;

import { useState } from 'react';
import { generateLootItems } from '../utils/itemGenerator';

/**
 * Custom hook for managing loot generation and rewards
 */
export const useLoot = () => {
  const [pendingLoot, setPendingLoot] = useState([]);
  const [lootHistory, setLootHistory] = useState([]);

  /**
   * Generate loot based on monster defeat
   * @param {Object} monster - The defeated monster
   * @param {Object} character - The victorious character
   * @returns {Array} Generated loot items
   */
  const generateMonsterLoot = (monster, character) => {
    // Determine loot count and difficulty based on monster
    const monsterLevel = monster.level || 1;
    const itemCount = Math.max(1, Math.floor(monsterLevel / 2) + Math.floor(Math.random() * 3));
    
    // Determine difficulty based on monster challenge
    let difficulty = 'normal';
    if (monsterLevel >= 8) difficulty = 'boss';
    else if (monsterLevel >= 5) difficulty = 'hard';
    else if (monsterLevel <= 2) difficulty = 'easy';
    
    // Generate items
    const lootItems = generateLootItems(itemCount, difficulty);
    
    // Add to pending loot for display
    const lootDrop = {
      id: `loot_${Date.now()}`,
      monsterId: monster.id || monster.name,
      monsterName: monster.name,
      items: lootItems,
      timestamp: new Date(),
      claimed: false
    };
    
    setPendingLoot(prev => [...prev, lootDrop]);
    setLootHistory(prev => [...prev, lootDrop]);
    
    return lootItems;
  };

  /**
   * Claim all pending loot and add to character's backpack
   * @param {Object} character - The character to claim loot for
   * @param {Function} onCharacterChange - Callback to update character
   */
  const claimLoot = (character, onCharacterChange) => {
    if (pendingLoot.length === 0) return;
    
    // Collect all items from pending loot
    const allItems = pendingLoot.flatMap(loot => loot.items);
    
    const updatedCharacter = {
      ...character,
      backpack: [...(character.backpack || []), ...allItems]
    };
    
    onCharacterChange(updatedCharacter);
    
    // Mark all as claimed in history
    setLootHistory(prev => prev.map(loot => 
      pendingLoot.some(pending => pending.id === loot.id) 
        ? { ...loot, claimed: true, claimedAt: new Date().toISOString() }
        : loot
    ));
    
    // Clear pending loot
    setPendingLoot([]);
    
    return allItems;
  };

  /**
   * Generate currency loot (coins)
   * @param {Object} monster - The defeated monster
   * @returns {Object} Currency amounts
   */
  const generateCurrencyLoot = (monster) => {
    const monsterLevel = monster.level || 1;
    
    // Grimdark economy - very low currency rewards
    let copper = Math.floor(Math.random() * 3) + 1; // 1-3 copper base
    
    // Scale with monster level but keep it low
    copper += Math.floor(monsterLevel / 2);
    
    // Very rare chance for silver (only for higher level monsters)
    let silver = 0;
    if (monsterLevel >= 4 && Math.random() < 0.1) {
      silver = 1;
    }
    
    // Extremely rare gold (only for very high level monsters)
    let gold = 0;
    if (monsterLevel >= 7 && Math.random() < 0.05) {
      gold = 1;
    }
    
    // Return total copper value for simplicity
    return copper + (silver * 10) + (gold * 100);
  };

  /**
   * Clear all pending loot
   */
  const clearPendingLoot = () => {
    setPendingLoot([]);
  };

  /**
   * Get loot summary for display
   */
  const getLootSummary = (lootId) => {
    const lootDrop = lootHistory.find(loot => loot.id === lootId);
    if (!lootDrop) return null;

    const itemsByRarity = lootDrop.items.reduce((acc, item) => {
      acc[item.rarity] = (acc[item.rarity] || 0) + 1;
      return acc;
    }, {});

    return {
      ...lootDrop,
      itemCount: lootDrop.items.length,
      itemsByRarity
    };
  };

  return {
    pendingLoot,
    lootHistory,
    generateMonsterLoot,
    generateCurrencyLoot,
    claimLoot,
    clearPendingLoot,
    getLootSummary
  };
};

export default useLoot;

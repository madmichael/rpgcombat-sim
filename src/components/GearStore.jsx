import React, { useState } from 'react';
import gearData from '../data/gear.json';
import weaponsData from '../data/weapons.json';
import { formatGp, formatCoins } from '../utils/currency';
import './GearStore.css';

const GearStore = ({ character, isOpen, onClose, onPurchaseItem }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');

  if (!isOpen || !character) return null;

  // Derive funds_cp for older character payloads
  const parseFundsStringToCp = (str) => {
    if (!str || typeof str !== 'string') return 0;
    let cp = 0;
    const lower = str.toLowerCase();
    const match = (re) => {
      const m = lower.match(re);
      return m ? parseInt(m[1], 10) || 0 : 0;
    };
    cp += match(/(\d+)\s*pp/)*10000;
    cp += match(/(\d+)\s*ep/)*1000;
    cp += match(/(\d+)\s*gp/)*100;
    cp += match(/(\d+)\s*sp/)*10;
    cp += match(/(\d+)\s*cp/);
    return cp;
  };

  const getFundsCp = () => {
    if (typeof character.funds_cp === 'number') return character.funds_cp;
    if (typeof character.funds === 'number') return Math.round(character.funds * 100);
    if (character.startingFunds) return parseFundsStringToCp(character.startingFunds);
    return 0;
  };

  const currentFundsCp = getFundsCp();

  // Convert weapons data to store format
  const convertWeaponsToStoreItems = () => {
    const weaponItems = [];
    
    // Convert melee weapons
    weaponsData.melee_weapons.forEach(weapon => {
      const costValue = weapon.cost ? parseFloat(weapon.cost.replace(/[^\d.]/g, '')) : 5;
      const costCp = Math.round(costValue * 100);
      const rarity = costValue >= 30 ? 'epic' : 
                   costValue >= 20 ? 'rare' : 
                   costValue >= 10 ? 'uncommon' : 'common';
      
      weaponItems.push({
        id: `melee_${weapon.weapon.toLowerCase().replace(/\s+/g, '_')}`,
        name: weapon.weapon,
        slot: "meleeWeapon",
        cost_cp: costCp,
        rarity: rarity,
        effects: {
          damage: weapon.damage,
          attackBonus: rarity === 'epic' ? 3 : rarity === 'rare' ? 2 : rarity === 'uncommon' ? 1 : 0
        },
        description: weapon.notes || `A ${weapon.weapon.toLowerCase()} that deals ${weapon.damage} damage.`,
        icon: "⚔️"
      });
    });
    
    // Convert ranged weapons
    weaponsData.ranged_weapons.forEach(weapon => {
      const costValue = weapon.cost ? parseFloat(weapon.cost.replace(/[^\d.]/g, '')) : 5;
      const costCp = Math.round(costValue * 100);
      const rarity = costValue >= 40 ? 'epic' : 
                   costValue >= 25 ? 'rare' : 
                   costValue >= 10 ? 'uncommon' : 'common';
      
      weaponItems.push({
        id: `ranged_${weapon.weapon.toLowerCase().replace(/\s+/g, '_')}`,
        name: weapon.weapon,
        slot: "rangedWeapon",
        cost_cp: costCp,
        rarity: rarity,
        effects: {
          damage: weapon.damage,
          range: weapon.range,
          attackBonus: rarity === 'epic' ? 3 : rarity === 'rare' ? 2 : rarity === 'uncommon' ? 1 : 0
        },
        description: weapon.notes || `A ${weapon.weapon.toLowerCase()} with ${weapon.range} range that deals ${weapon.damage} damage.`,
        icon: "🏹"
      });
    });
    
    return weaponItems;
  };

  // Expanded store inventory with weapons and gear
  const storeInventory = [
    // Existing sample gear (convert legacy cost gp -> cost_cp)
    ...gearData.sampleGear.map(g => ({
      ...g,
      cost_cp: Math.round(((g.cost || 0)) * 100)
    })),
    
    // All weapons from weapons.json
    ...convertWeaponsToStoreItems(),
    
    // Armor pieces
    {
      id: "leather_armor",
      name: "Leather Armor",
      slot: "body",
      cost_cp: 3000,
      rarity: "common",
      effects: {
        armorClass: 2
      },
      description: "Flexible leather armor providing decent protection.",
      icon: "🛡️"
    },
    {
      id: "iron_helm",
      name: "Iron Helm",
      slot: "head",
      cost_cp: 2500,
      rarity: "common",
      effects: {
        armorClass: 2
      },
      description: "A solid iron helmet with good coverage.",
      icon: "⛑️"
    },
    
    // Accessories
    {
      id: "strength_ring",
      name: "Ring of Strength",
      slot: "rightFingers",
      cost_cp: 10000,
      rarity: "rare",
      effects: {
        strengthBonus: 2
      },
      description: "A magical ring that enhances physical power.",
      icon: "💍"
    },
    {
      id: "agility_boots",
      name: "Boots of Agility",
      slot: "feet",
      cost_cp: 7500,
      rarity: "uncommon",
      effects: {
        agilityBonus: 1,
        movementBonus: 10
      },
      description: "Light boots that enhance speed and dexterity.",
      icon: "👢"
    },
    
    // Utility items
    {
      id: "healing_potion",
      name: "Healing Potion",
      slot: "belt",
      cost_cp: 2500,
      rarity: "common",
      effects: {
        healingAmount: "1d4+1"
      },
      description: "A red potion that restores health when consumed.",
      icon: "🧪"
    }
  ];

  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'weapons', name: 'Weapons' },
    { id: 'armor', name: 'Armor' },
    { id: 'accessories', name: 'Accessories' },
    { id: 'consumables', name: 'Consumables' }
  ];

  const rarities = [
    { id: 'all', name: 'All Rarities' },
    { id: 'common', name: 'Common' },
    { id: 'uncommon', name: 'Uncommon' },
    { id: 'rare', name: 'Rare' },
    { id: 'epic', name: 'Epic' }
  ];

  const getItemCategory = (item) => {
    if (['meleeWeapon', 'rangedWeapon', 'rightHand', 'leftHand'].includes(item.slot)) {
      return 'weapons';
    }
    if (['head', 'body', 'arms', 'legs'].includes(item.slot)) {
      return 'armor';
    }
    if (['neck', 'rightFingers', 'leftFingers', 'feet', 'cloak'].includes(item.slot)) {
      return 'accessories';
    }
    if (['belt'].includes(item.slot)) {
      return 'consumables';
    }
    return 'other';
  };

  const filteredItems = storeInventory.filter(item => {
    const categoryMatch = selectedCategory === 'all' || getItemCategory(item) === selectedCategory;
    const rarityMatch = selectedRarity === 'all' || item.rarity === selectedRarity;
    return categoryMatch && rarityMatch;
  });

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return '#6c757d';
      case 'uncommon': return '#28a745';
      case 'rare': return '#007bff';
      case 'epic': return '#6f42c1';
      default: return '#6c757d';
    }
  };

  const canAfford = (item) => {
    return currentFundsCp >= (item.cost_cp || 0);
  };

  const handlePurchase = (item) => {
    if (canAfford(item) && onPurchaseItem) {
      onPurchaseItem(item);
    }
  };

  const renderEffects = (effects) => {
    if (!effects) return null;
    
    return Object.entries(effects).map(([key, value]) => {
      let displayText = '';
      switch (key) {
        case 'armorClass': displayText = `+${value} AC`; break;
        case 'attackBonus': displayText = `+${value} Attack`; break;
        case 'damageBonus': displayText = `+${value} Damage`; break;
        case 'strengthBonus': displayText = `+${value} Strength`; break;
        case 'agilityBonus': displayText = `+${value} Agility`; break;
        case 'staminaBonus': displayText = `+${value} Stamina`; break;
        case 'personalityBonus': displayText = `+${value} Personality`; break;
        case 'intelligenceBonus': displayText = `+${value} Intelligence`; break;
        case 'luckBonus': displayText = `+${value} Luck`; break;
        case 'movementBonus': displayText = `+${value} Movement`; break;
        case 'damage': displayText = `${value} damage`; break;
        case 'healingAmount': displayText = `Heals ${value}`; break;
        default: displayText = `${key}: ${value}`;
      }
      
      return (
        <span key={key} className="item-effect">
          {displayText}
        </span>
      );
    });
  };

  return (
    <div className="store-overlay">
      <div className="store-container">
        <div className="store-header">
          <h2>🏪 Gear Store</h2>
          <div className="character-funds">
            💰 {formatCoins(currentFundsCp)}
          </div>
          <button className="store-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="store-filters">
          <div className="filter-group">
            <label>Category:</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Rarity:</label>
            <select 
              value={selectedRarity} 
              onChange={(e) => setSelectedRarity(e.target.value)}
            >
              {rarities.map(rarity => (
                <option key={rarity.id} value={rarity.id}>{rarity.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="store-inventory">
          {filteredItems.length === 0 ? (
            <div className="no-items">
              <p>No items match your filters</p>
            </div>
          ) : (
            <div className="store-grid">
              {filteredItems.map((item) => (
                <div key={item.id} className="store-item-card">
                  <div className="item-header">
                    <span className="item-icon">{item.icon || '📦'}</span>
                    <div className="item-title">
                      <span 
                        className="item-name"
                        style={{ color: getRarityColor(item.rarity) }}
                      >
                        {item.name}
                      </span>
                      <span className="item-rarity">{item.rarity}</span>
                    </div>
                  </div>
                  
                  <div className="item-details">
                    <div className="item-slot">
                      <span className="slot-label">Slot:</span>
                      <span className="slot-value">
                        {gearData.gearTypes[item.slot]?.name || item.slot}
                      </span>
                    </div>
                    
                    {item.effects && (
                      <div className="item-effects">
                        {renderEffects(item.effects)}
                      </div>
                    )}
                  </div>

                  <div className="item-description">
                    {item.description}
                  </div>

                  <div className="item-footer">
                    <div className="item-cost">
                      💰 {formatGp(item.cost_cp || 0)}
                    </div>
                    <button 
                      className={`purchase-btn ${!canAfford(item) ? 'disabled' : ''}`}
                      onClick={() => handlePurchase(item)}
                      disabled={!canAfford(item)}
                      title={!canAfford(item) ? 'Not enough gold' : 'Purchase item'}
                    >
                      {canAfford(item) ? '🛒 Buy' : '💸 Too Expensive'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GearStore;

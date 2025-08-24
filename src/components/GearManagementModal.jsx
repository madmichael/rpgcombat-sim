import React, { useState } from 'react';
import { formatGp, formatCoins } from '../utils/currency';
import gearData from '../data/gear.json';
import GearStore from './GearStore';
import ConfirmationDialog from './ConfirmationDialog';
import { ToastContainer } from './ToastNotification';
import GearTooltip from './GearTooltip';
import useToast from '../hooks/useToast';
import './GearManagementModal.css';

const GearManagementModal = ({ 
  character, 
  isOpen, 
  onClose, 
  onEquipItem, 
  onUnequipItem, 
  onMoveToBackpack,
  onCharacterChange 
}) => {
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [activeTab, setActiveTab] = useState('equipped'); // 'equipped' or 'backpack'
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: '', data: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [slotFilter, setSlotFilter] = useState('all');
  const { toasts, removeToast, showSuccess, showError, showWarning } = useToast();

  if (!isOpen || !character) return null;

  const { gearSlots, gearTypes } = gearData;
  const backpackItems = character.backpack || [];

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

  // Filter backpack items based on search and filters
  const filteredBackpackItems = backpackItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRarity = rarityFilter === 'all' || 
                         (item.rarity && item.rarity.toLowerCase() === rarityFilter) ||
                         (rarityFilter === 'common' && !item.rarity);
    
    const matchesSlot = slotFilter === 'all' || item.slot === slotFilter;
    
    return matchesSearch && matchesRarity && matchesSlot;
  });

  const availableRarities = ['all', 'common', 'uncommon', 'rare', 'epic', 'legendary'];
  const availableSlots = ['all', ...gearSlots];

  const handleEquipFromBackpack = (item) => {
    let targetSlot = item.slot;
    
    // Fallback for items without slot property (legacy weapons)
    if (!targetSlot && item.name && item.damage) {
      // This is likely a weapon - determine if ranged or melee
      const rangedWeapons = ['shortbow', 'sling', 'dart', 'crossbow'];
      const isRanged = rangedWeapons.some(ranged => item.name.toLowerCase().includes(ranged));
      targetSlot = isRanged ? 'rangedWeapon' : 'meleeWeapon';
    }
    
    if (targetSlot && onEquipItem) {
      onEquipItem(item, targetSlot);
      showSuccess(`Equipped ${item.name} to ${gearTypes[targetSlot]?.name || targetSlot}`);
    } else {
      showError('Cannot equip item - invalid slot or missing function');
    }
  };

  const handleUnequipToBackpack = (slotName) => {
    const equippedItem = character.gearSlots?.[slotName];
    if (equippedItem) {
      setConfirmDialog({
        isOpen: true,
        type: 'unequip',
        data: { slotName, itemName: equippedItem.name },
        title: 'Unequip Item',
        message: `Are you sure you want to unequip "${equippedItem.name}"? It will be moved to your backpack.`,
        confirmText: 'Unequip',
        onConfirm: () => {
          if (onUnequipItem) {
            onUnequipItem(slotName);
            showSuccess(`Unequipped ${equippedItem.name} to backpack`);
          }
          setConfirmDialog({ isOpen: false });
        }
      });
    }
  };

  const handleSellItem = (item) => {
    // Work entirely in cp
    const baseValueCp = item.cost_cp || Math.round((item.cost || item.value || 1) * 100);
    const baseOfferCp = Math.floor(baseValueCp * 0.6); // 60% of value
    
    setConfirmDialog({
      isOpen: true,
      type: 'sell',
      data: { item, baseValue: baseValueCp, baseOffer: baseOfferCp },
      title: '💰 Sell Item',
      message: `"I'll give you ${formatCoins(baseOfferCp)} for that ${item.name}. Take it or leave it!" - Grumpy Shopkeeper`,
      confirmText: `Sell for ${formatCoins(baseOfferCp)}`,
      cancelText: '🗣️ Try to Haggle',
      onConfirm: () => {
        // Sell at base offer (60%)
        const updatedCharacter = {
          ...character,
          funds_cp: currentFundsCp + baseOfferCp,
          backpack: character.backpack.filter(backpackItem => backpackItem.id !== item.id)
        };
        onCharacterChange(updatedCharacter);
        showSuccess(`Sold ${item.name} for ${formatCoins(baseOfferCp)}`);
        setConfirmDialog({ isOpen: false });
      },
      onCancel: () => {
        setConfirmDialog({ isOpen: false });
        handleHaggle(item, baseValueCp, baseOfferCp);
      }
    });
  };

  const handleHaggle = (item, baseValue, baseOffer) => {
    // Character rolls 1d20 + Personality modifier
    const characterRoll = Math.floor(Math.random() * 20) + 1;
    const personalityMod = character.modifiers?.Personality || 0;
    const characterTotal = characterRoll + personalityMod;
    
    // Shopkeeper rolls 1d20
    const shopkeeperRoll = Math.floor(Math.random() * 20) + 1;
    
    let finalOffer, resultMessage, shopkeeperQuote;
    
    if (characterRoll === 1) {
      // Natural 1 - 50% value
      finalOffer = Math.floor(baseValue * 0.5);
      shopkeeperQuote = `"Ha! You rolled a 1! That's what you get for trying to outsmart me. ${formatCoins(finalOffer)}, final offer!"`;
      resultMessage = `Haggle Failed! (Nat 1) vs ${shopkeeperRoll}`;
    } else if (characterTotal > shopkeeperRoll) {
      // Character wins - 100% value
      finalOffer = baseValue;
      shopkeeperQuote = `"Fine, fine... you drive a hard bargain. ${formatCoins(finalOffer)} it is. Don't expect this generosity again!"`;
      resultMessage = `Haggle Success! (${characterRoll}+${personalityMod}=${characterTotal}) vs ${shopkeeperRoll}`;
    } else {
      // Character loses - stick with 60%
      finalOffer = baseOffer;
      shopkeeperQuote = `"Nice try, but I've been doing this longer than you've been alive. ${formatCoins(finalOffer)}, as I said."`;
      resultMessage = `Haggle Failed! (${characterRoll}+${personalityMod}=${characterTotal}) vs ${shopkeeperRoll}`;
    }
    
    setConfirmDialog({
      isOpen: true,
      type: 'haggle_result',
      data: { item, finalOffer, resultMessage, shopkeeperQuote },
      title: '🗣️ Haggling Result',
      message: `${resultMessage}\n\n${shopkeeperQuote}`,
      confirmText: `Accept ${formatCoins(finalOffer)}`,
      cancelText: 'Keep Item',
      onConfirm: () => {
        const updatedCharacter = {
          ...character,
          funds_cp: currentFundsCp + finalOffer,
          backpack: character.backpack.filter(backpackItem => backpackItem.id !== item.id)
        };
        onCharacterChange(updatedCharacter);
        showSuccess(`Sold ${item.name} for ${formatCoins(finalOffer)}`);
        setConfirmDialog({ isOpen: false });
      }
    });
  };

  const handlePurchaseItem = (item) => {
    const itemCostCp = item.cost_cp || Math.round((item.cost || 0) * 100);
    if (currentFundsCp < itemCostCp) return;
    
    setConfirmDialog({
      isOpen: true,
      type: 'purchase',
      data: item,
      title: 'Purchase Item',
      message: `Purchase "${item.name}" for ${formatGp(itemCostCp)}? You currently have ${formatCoins(currentFundsCp)}.`,
      confirmText: `Buy for ${formatGp(itemCostCp)}`,
      onConfirm: () => {
        const updatedCharacter = {
          ...character,
          funds_cp: currentFundsCp - itemCostCp,
          backpack: [...(character.backpack || []), { ...item, id: `${item.id}_${Date.now()}` }]
        };
        onCharacterChange(updatedCharacter);
        showSuccess(`Purchased ${item.name} for ${formatGp(itemCostCp)}`);
        setConfirmDialog({ isOpen: false });
      }
    });
  };

  const renderEquippedItems = () => {
    return (
      <div className="equipped-items">
        <div className="equipped-header">
          <h3>🛡️ Equipped Gear</h3>
          <button 
            className="store-btn"
            onClick={() => setIsStoreOpen(true)}
            title="Open gear store"
          >
            🏪 Store
          </button>
        </div>
        <div className="gear-slots-grid">
          {gearSlots.map((slotId) => {
            const slotInfo = gearTypes[slotId];
            const equippedItem = character.gearSlots?.[slotId];
            return (
              <div key={slotId} className="gear-slot-display">
                <div className="slot-header">
                  <span className="slot-icon">{slotInfo?.icon || '📦'}</span>
                  <span className="slot-name">{slotInfo?.name || slotId}</span>
                </div>
                <div className="slot-content">
                  {equippedItem ? (
                    <GearTooltip item={equippedItem}>
                      <div className={`equipped-item ${equippedItem.rarity ? `rarity-${equippedItem.rarity.toLowerCase()}` : 'rarity-common'}`}>
                        <div className="item-info">
                          <span className="item-name">{equippedItem.name}</span>
                          {equippedItem.effects && (
                            <div className="item-effects">
                              {Object.entries(equippedItem.effects).map(([effect, value]) => (
                                <span key={effect} className="effect-tag">
                                  {effect}: {value}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button 
                          className="unequip-btn"
                          onClick={() => handleUnequipToBackpack(slotId)}
                          title="Unequip item"
                        >
                          ⬇️ Unequip
                        </button>
                      </div>
                    </GearTooltip>
                  ) : (
                    <div className="empty-slot">
                      <span className="empty-text">Empty</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };


  const renderBackpack = () => (
    <div className="backpack-container">
      {backpackItems.length === 0 ? (
        <div className="empty-backpack">
          <span className="empty-icon">🎒</span>
          <p>Your backpack is empty</p>
        </div>
      ) : (
        <>
          <div className="backpack-filters">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
            
            <div className="filter-container">
              <select
                value={rarityFilter}
                onChange={(e) => setRarityFilter(e.target.value)}
                className="filter-select"
              >
                {availableRarities.map(rarity => (
                  <option key={rarity} value={rarity}>
                    {rarity === 'all' ? 'All Rarities' : rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                  </option>
                ))}
              </select>
              
              <select
                value={slotFilter}
                onChange={(e) => setSlotFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Slots</option>
                {gearSlots.map(slot => (
                  <option key={slot} value={slot}>
                    {gearTypes[slot]?.name || slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredBackpackItems.length === 0 ? (
            <div className="no-results">
              <span className="no-results-icon">🔍</span>
              <p>No items match your search criteria</p>
              <button 
                className="clear-filters-btn"
                onClick={() => {
                  setSearchTerm('');
                  setRarityFilter('all');
                  setSlotFilter('all');
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="backpack-grid">
              {filteredBackpackItems.map((item, index) => (
                <GearTooltip key={`${item.id}-${index}`} item={item}>
                  <div className={`backpack-item-card ${item.rarity ? `rarity-${item.rarity.toLowerCase()}` : 'rarity-common'}`}>
                    <div className="item-header">
                      <span className="item-icon">{item.icon || '📦'}</span>
                      <span className="item-name">{item.name}</span>
                    </div>
                    <div className="item-details">
                      <div className="item-slot">
                        <span className="slot-label">Slot:</span>
                        <span className="slot-value">{gearTypes[item.slot]?.name || item.slot}</span>
                      </div>
                      {(item.cost_cp > 0 || item.cost > 0) && (
                        <div className="item-cost">
                          <span className="cost-label">Value:</span>
                          <span className="cost-value">{item.cost_cp ? formatGp(item.cost_cp) : `${item.cost} gp`}</span>
                        </div>
                      )}
                    </div>
                    <div className="item-actions">
                      <button 
                        className="equip-btn"
                        onClick={() => {
                          handleEquipFromBackpack(item);
                        }}
                        title="Equip item"
                      >
                        ⚡ Equip
                      </button>
                      {(item.cost > 0 || item.value > 0) && (
                        <button 
                          className="sell-btn"
                          onClick={() => handleSellItem(item)}
                          title="Sell item to shopkeeper"
                        >
                          💰 Sell
                        </button>
                      )}
                    </div>
                    {item.description && (
                      <div className="item-description">
                        {item.description}
                      </div>
                    )}
                  </div>
                </GearTooltip>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="modal-header">
            <h2>⚔️ Gear Management</h2>
            <div className="character-funds-display">
              💰 {formatCoins(currentFundsCp)}
            </div>
            <button className="modal-close-btn" onClick={onClose}>×</button>
          </div>
          
          <div className="modal-content">
            <div className="gear-tabs">
              <button 
                className={`tab-btn ${activeTab === 'equipped' ? 'active' : ''}`}
                onClick={() => setActiveTab('equipped')}
              >
                🛡️ Equipped
              </button>
              <button 
                className={`tab-btn ${activeTab === 'backpack' ? 'active' : ''}`}
                onClick={() => setActiveTab('backpack')}
              >
                🎒 Backpack
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'equipped' ? renderEquippedItems() : renderBackpack()}
            </div>
          </div>
        </div>
      </div>
      
      <GearStore
        character={character}
        isOpen={isStoreOpen}
        onClose={() => setIsStoreOpen(false)}
        onPurchaseItem={handlePurchaseItem}
      />
      
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        type={confirmDialog.type === 'purchase' ? 'warning' : 'default'}
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.onCancel || (() => setConfirmDialog({ isOpen: false }))}
      />
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default GearManagementModal;

import React from 'react';
import { formatGp } from '../utils/currency';
import GearTooltip from './GearTooltip';
import './LootModal.css';

const LootModal = ({ loot, isOpen, onClose, onClaimAll }) => {
  if (!isOpen || !loot || loot.length === 0) return null;

  // Use the first loot drop for display (could be enhanced to show multiple)
  const lootDrop = loot[0];

  const handleClaimAll = () => {
    onClaimAll();
    onClose();
  };

  const rarityCount = lootDrop.items.reduce((acc, item) => {
    acc[item.rarity] = (acc[item.rarity] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="modal-overlay">
      <div className="modal-container loot-modal-container">
        <div className="modal-header loot-modal-header">
          <h2>🎁 Victory Spoils</h2>
          <p>Defeated: {lootDrop.monsterName}</p>
          {lootDrop.difficulty && (
            <div className="loot-difficulty" style={{ fontSize: '12px', opacity: 0.8 }}>
              Loot difficulty: {lootDrop.difficulty.charAt(0).toUpperCase() + lootDrop.difficulty.slice(1)}
            </div>
          )}
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content loot-modal-content">
          <div className="loot-summary">
            <h3>Items Found ({lootDrop.items.length})</h3>
            <div className="rarity-breakdown">
              {Object.entries(rarityCount).map(([rarity, count]) => (
                <span 
                  key={rarity} 
                  className={`rarity-badge rarity-${rarity}`}
                >
                  {count} {rarity}
                </span>
              ))}
            </div>
          </div>

          <div className="loot-items-grid">
            {lootDrop.items.map((item, index) => (
              <GearTooltip key={index} item={item}>
                <div 
                  className={`loot-item-card rarity-${item.rarity}`}
                >
                  <div className="item-icon">{item.icon}</div>
                  <div className="item-info">
                    <div className="item-name">{item.name}</div>
                    <div className="item-value">💰 {item.cost_cp ? formatGp(item.cost_cp) : `${item.cost || 0} gp`}</div>
                    <div className={`item-rarity rarity-${item.rarity}`}>
                      {item.rarity}
                    </div>
                  </div>
                </div>
              </GearTooltip>
            ))}
          </div>

          <div className="modal-actions loot-actions">
            <button className="claim-all-btn" onClick={handleClaimAll}>
              📦 Claim All Items
            </button>
            <button className="close-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LootModal;

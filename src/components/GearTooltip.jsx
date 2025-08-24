import React, { useState, useRef, useEffect } from 'react';
import { formatGp } from '../utils/currency';
import './GearTooltip.css';

const GearTooltip = ({ item, children, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
      let y = triggerRect.top - tooltipRect.height - 10;

      // Adjust horizontal position if tooltip goes off screen
      if (x < 10) x = 10;
      if (x + tooltipRect.width > viewportWidth - 10) {
        x = viewportWidth - tooltipRect.width - 10;
      }

      // Adjust vertical position if tooltip goes off screen
      if (y < 10) {
        y = triggerRect.bottom + 10;
      }

      setTooltipPosition({ x, y });
    }
  }, [isVisible]);

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const renderEffects = () => {
    if (!item.effects || Object.keys(item.effects).length === 0) return null;

    return (
      <div className="tooltip-effects">
        <div className="tooltip-section-title">Effects:</div>
        {Object.entries(item.effects).map(([effect, value]) => (
          <div key={effect} className="tooltip-effect">
            <span className="effect-name">{effect}:</span>
            <span className="effect-value">
              {value > 0 ? '+' : ''}{value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderStats = () => {
    const stats = [];
    
    if (item.damage) {
      stats.push({ label: 'Damage', value: item.damage });
    }
    if (item.armorClass) {
      stats.push({ label: 'Armor Class', value: item.armorClass });
    }
    if (item.durability) {
      stats.push({ label: 'Durability', value: item.durability });
    }
    if (item.cost_cp || item.cost) {
      const display = item.cost_cp ? formatGp(item.cost_cp) : `${item.cost} gp`;
      stats.push({ label: 'Value', value: display });
    }

    if (stats.length === 0) return null;

    return (
      <div className="tooltip-stats">
        {stats.map((stat, index) => (
          <div key={index} className="tooltip-stat">
            <span className="stat-label">{stat.label}:</span>
            <span className="stat-value">{stat.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const getRarityClass = () => {
    if (!item.rarity) return 'common';
    return item.rarity.toLowerCase();
  };

  if (!item) return children;

  return (
    <div 
      className="tooltip-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={triggerRef}
    >
      {children}
      
      {isVisible && (
        <div 
          className={`gear-tooltip ${getRarityClass()}`}
          ref={tooltipRef}
          style={{
            position: 'fixed',
            left: tooltipPosition.x,
            top: tooltipPosition.y,
            zIndex: 10002
          }}
        >
          <div className="tooltip-header">
            <div className="tooltip-name">{item.name}</div>
            {item.rarity && (
              <div className={`tooltip-rarity ${item.rarity.toLowerCase()}`}>
                {item.rarity}
              </div>
            )}
          </div>

          {item.slot && (
            <div className="tooltip-slot">
              Slot: {item.slot}
            </div>
          )}

          {renderStats()}
          {renderEffects()}

          {item.description && (
            <div className="tooltip-description">
              {item.description}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GearTooltip;

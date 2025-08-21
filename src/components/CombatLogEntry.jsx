import React from 'react';

const CombatLogEntry = ({ entry, index }) => {
  // Handle both string entries and object entries (for summary messages)
  const message = typeof entry === 'object' ? entry.message : entry;
  const entryType = typeof entry === 'object' ? entry.type : 'combat';
  
  // Parse different types of combat messages for enhanced formatting
  const formatEntry = (message, type) => {
    // Summary messages get special formatting
    if (type === 'summary') {
      return {
        icon: message.includes('defeated') ? '🏆' : message.includes('vanguished') ? '💀' : '🏃',
        color: message.includes('defeated') ? '#27ae60' : message.includes('vanguished') ? '#8e44ad' : '#e67e22',
        fontWeight: 'bold',
        backgroundColor: message.includes('defeated') ? 'rgba(39, 174, 96, 0.15)' : message.includes('vanguished') ? 'rgba(142, 68, 173, 0.15)' : 'rgba(230, 126, 34, 0.15)',
        border: message.includes('defeated') ? '2px solid rgba(39, 174, 96, 0.5)' : message.includes('vanguished') ? '2px solid rgba(142, 68, 173, 0.5)' : '2px solid rgba(230, 126, 34, 0.5)',
        fontSize: '15px',
        padding: '12px 16px'
      };
    }
    // Fumble detection
    if (message.includes('FUMBLES!')) {
      return {
        icon: '💀',
        color: '#8e44ad',
        fontWeight: 'bold',
        backgroundColor: 'rgba(142, 68, 173, 0.15)',
        border: '1px solid rgba(142, 68, 173, 0.4)'
      };
    }
    
    // Critical hit detection
    if (message.includes('CRITICAL HIT')) {
      return {
        icon: '💥',
        color: '#ff6b35',
        fontWeight: 'bold',
        backgroundColor: 'rgba(255, 107, 53, 0.1)',
        border: '1px solid rgba(255, 107, 53, 0.3)'
      };
    }
    
    // Miss detection
    if (message.includes('misses') || message.includes('miss')) {
      return {
        icon: '💨',
        color: '#95a5a6',
        fontWeight: 'normal',
        backgroundColor: 'rgba(149, 165, 166, 0.05)',
        border: '1px solid rgba(149, 165, 166, 0.2)'
      };
    }
    
    // Damage/hit detection
    if (message.includes('hits') && (message.includes('damage') || message.includes('HP left'))) {
      return {
        icon: '⚔️',
        color: '#e74c3c',
        fontWeight: 'bold',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        border: '1px solid rgba(231, 76, 60, 0.2)'
      };
    }
    
    // Initiative/fight start
    if (message.includes('Fight started') || message.includes('Initiative:')) {
      return {
        icon: '🎯',
        color: '#3498db',
        fontWeight: 'bold',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        border: '1px solid rgba(52, 152, 219, 0.3)'
      };
    }
    
    // Victory/defeat
    if (message.includes('defeated') || message.includes('vanguished')) {
      return {
        icon: message.includes('defeated') ? '🏆' : '💀',
        color: message.includes('defeated') ? '#27ae60' : '#8e44ad',
        fontWeight: 'bold',
        backgroundColor: message.includes('defeated') ? 'rgba(39, 174, 96, 0.1)' : 'rgba(142, 68, 173, 0.1)',
        border: message.includes('defeated') ? '1px solid rgba(39, 174, 96, 0.3)' : '1px solid rgba(142, 68, 173, 0.3)'
      };
    }
    
    // Luck burning
    if (message.includes('burns') && message.includes('luck')) {
      return {
        icon: '🍀',
        color: '#f39c12',
        fontWeight: 'bold',
        backgroundColor: 'rgba(243, 156, 18, 0.1)',
        border: '1px solid rgba(243, 156, 18, 0.3)'
      };
    }
    
    // Running away
    if (message.includes('ran away')) {
      return {
        icon: '🏃',
        color: '#e67e22',
        fontWeight: 'normal',
        backgroundColor: 'rgba(230, 126, 34, 0.1)',
        border: '1px solid rgba(230, 126, 34, 0.2)'
      };
    }
    
    // Default formatting
    return {
      icon: '📝',
      color: '#2c3e50',
      fontWeight: 'normal',
      backgroundColor: 'rgba(44, 62, 80, 0.05)',
      border: '1px solid rgba(44, 62, 80, 0.1)'
    };
  };

  const style = formatEntry(message, entryType);
  
  return (
    <li 
      style={{
        padding: style.padding || '8px 12px',
        margin: '4px 0',
        borderRadius: '6px',
        backgroundColor: style.backgroundColor,
        border: style.border,
        color: style.color,
        fontWeight: style.fontWeight,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: style.fontSize || '14px',
        lineHeight: '1.4',
        transition: 'all 0.2s ease'
      }}
    >
      <span style={{ fontSize: '16px', flexShrink: 0 }}>{style.icon}</span>
      <span style={{ flex: 1 }}>{message}</span>
      {entryType === 'summary' && typeof entry === 'object' && entry.timestamp && (
        <span style={{ fontSize: '12px', opacity: 0.7, marginLeft: '8px' }}>
          {entry.timestamp}
        </span>
      )}
    </li>
  );
};

export default CombatLogEntry;

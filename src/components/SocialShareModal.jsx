import React, { useState } from 'react';
import { generateCharacterUrl } from '../utils/characterUrl';
import { getCompressionStats } from '../utils/urlCompression';
import './SocialShareModal.css';

const SocialShareModal = ({ character, achievements = null, stats = null, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [shareType, setShareType] = useState('full'); // 'full' or 'minimal'

  if (!isOpen || !character) return null;

  const fullUrl = generateCharacterUrl(character, achievements, stats);
  
  // Create a minimal share URL with just essential character info
  const minimalCharacterData = {
    name: character.name,
    alignment: character.alignment,
    Strength: character.Strength,
    Agility: character.Agility,
    Stamina: character.Stamina,
    Personality: character.Personality,
    Intelligence: character.Intelligence,
    Luck: character.Luck,
    funds: character.funds,
    hp: character.hp,
    maxHp: character.maxHp,
    occupation: character.occupation
  };
  
  const minimalUrl = generateCharacterUrl(minimalCharacterData);
  const currentUrl = shareType === 'minimal' ? minimalUrl : fullUrl;
  
  const compressionStats = getCompressionStats(shareType === 'minimal' ? minimalCharacterData : {
    name: character.name,
    alignment: character.alignment,
    Strength: character.Strength,
    Agility: character.Agility,
    Stamina: character.Stamina,
    Personality: character.Personality,
    Intelligence: character.Intelligence,
    Luck: character.Luck,
    modifiers: character.modifiers,
    funds: character.funds,
    tradeGood: character.tradeGood,
    birthAugur: character.birthAugur,
    occupation: character.occupation,
    hp: character.hp,
    maxHp: character.maxHp,
    luck: character.luck,
    maxLuck: character.maxLuck,
    weapon: character.weapon,
    gearSlots: character.gearSlots || {},
    backpack: character.backpack || [],
    achievements: achievements || [],
    combatStats: stats || {}
  });

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = currentUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getSocialMediaUrl = (platform) => {
    const text = `Check out my RPG character: ${character.name} the ${character.alignment} ${character.occupation?.Occupation || 'Adventurer'}!`;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(currentUrl);
    
    switch (platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
      case 'reddit':
        return `https://reddit.com/submit?url=${encodedUrl}&title=${encodedText}`;
      case 'discord':
        return `https://discord.com/channels/@me?message=${encodedText}%20${encodedUrl}`;
      default:
        return currentUrl;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container social-share-modal">
        <div className="modal-header social-share-header">
          <h3>📤 Share Character</h3>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content social-share-content">
          <div className="share-options">
            <div className="share-type-selector">
              <label>
                <input
                  type="radio"
                  value="minimal"
                  checked={shareType === 'minimal'}
                  onChange={(e) => setShareType(e.target.value)}
                />
                <span className="share-option">
                  <strong>📱 Social Media</strong>
                  <small>Core stats only - {minimalUrl.length} chars</small>
                </span>
              </label>
              <label>
                <input
                  type="radio"
                  value="full"
                  checked={shareType === 'full'}
                  onChange={(e) => setShareType(e.target.value)}
                />
                <span className="share-option">
                  <strong>💾 Complete Backup</strong>
                  <small>All data + gear - {fullUrl.length} chars</small>
                </span>
              </label>
            </div>
          </div>

          <div className="url-section">
            <div className="url-info">
              <p className="url-description">
                {shareType === 'minimal' 
                  ? '📱 Optimized for social media sharing (core character data only)'
                  : '💾 Complete character backup with all gear and progress'
                }
              </p>
              <div className="compression-info">
                <small>
                  📦 Compressed ({compressionStats.ratio} smaller)
                </small>
              </div>
            </div>
            
            <div className="url-container">
              <input 
                type="text" 
                value={currentUrl}
                readOnly
                className="url-input"
                onClick={(e) => e.target.select()}
              />
              <button 
                onClick={handleCopyUrl}
                className={`copy-btn ${copied ? 'copied' : ''}`}
                title="Copy URL to clipboard"
              >
                {copied ? '✅' : '📋'}
              </button>
            </div>
            
            {copied && (
              <p className="copy-success">
                ✅ URL copied to clipboard!
              </p>
            )}
          </div>

          <div className="social-platforms">
            <h4>🌐 Share on Social Media</h4>
            <div className="platform-buttons">
              <a 
                href={getSocialMediaUrl('twitter')} 
                target="_blank" 
                rel="noopener noreferrer"
                className="platform-btn twitter"
              >
                🐦 Twitter
              </a>
              <a 
                href={getSocialMediaUrl('facebook')} 
                target="_blank" 
                rel="noopener noreferrer"
                className="platform-btn facebook"
              >
                📘 Facebook
              </a>
              <a 
                href={getSocialMediaUrl('reddit')} 
                target="_blank" 
                rel="noopener noreferrer"
                className="platform-btn reddit"
              >
                🔴 Reddit
              </a>
              <button 
                onClick={() => {
                  const text = `Check out my RPG character: ${character.name}!\n${currentUrl}`;
                  if (navigator.share) {
                    navigator.share({ title: 'My RPG Character', text, url: currentUrl });
                  } else {
                    handleCopyUrl();
                  }
                }}
                className="platform-btn generic"
              >
                📱 Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialShareModal;

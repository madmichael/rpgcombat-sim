import React, { useState } from 'react';
import { generateCharacterUrl } from '../utils/characterUrl';
import { getCompressionStats } from '../utils/urlCompression';
import SocialShareModal from './SocialShareModal';
import './CharacterUrlShare.css';

const CharacterUrlShare = ({ character, achievements = null, stats = null }) => {
  const [showUrl, setShowUrl] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);

  if (!character) return null;

  const handleGenerateUrl = () => {
    setShowUrl(true);
    setCopied(false);
  };

  const handleSocialShare = () => {
    setShowSocialModal(true);
  };

  const handleCopyUrl = async () => {
    const url = generateCharacterUrl(character, achievements, stats);
    
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const characterUrl = generateCharacterUrl(character, achievements, stats);
  const compressionStats = getCompressionStats({
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

  return (
    <div className="character-url-share">
      <div className="share-controls">
        <button 
          onClick={handleSocialShare}
          className="share-btn social"
          title="Share character on social media"
        >
          <span className="btn-icon">📱</span>
          <span className="btn-text">Social Share</span>
        </button>
        <button 
          onClick={handleGenerateUrl}
          className="share-btn advanced"
          title="Generate a shareable URL for this character"
        >
          <span className="btn-icon">🔗</span>
          <span className="btn-text">Advanced</span>
        </button>
      </div>

      {showUrl && (
        <div className="url-display">
          <div className="url-info">
            <p className="url-description">
              📋 Share this URL to let others use your character:
            </p>
            <div className="compression-info">
              <small>
                📦 Compressed URL ({compressionStats.ratio} smaller) - {characterUrl.length} chars
              </small>
            </div>
            <div className="url-container">
              <input 
                type="text" 
                value={characterUrl}
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
          <div className="url-actions">
            <button 
              onClick={() => setShowUrl(false)}
              className="close-btn"
            >
              ✖️ Close
            </button>
          </div>
        </div>
      )}

      <SocialShareModal
        character={character}
        achievements={achievements}
        stats={stats}
        isOpen={showSocialModal}
        onClose={() => setShowSocialModal(false)}
      />
    </div>
  );
};

export default CharacterUrlShare;

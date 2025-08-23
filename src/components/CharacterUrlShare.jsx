import React, { useState } from 'react';
import { generateCharacterUrl } from '../utils/characterUrl';
import './CharacterUrlShare.css';

const CharacterUrlShare = ({ character, achievements = null, stats = null }) => {
  const [showUrl, setShowUrl] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!character) return null;

  const handleGenerateUrl = () => {
    setShowUrl(true);
    setCopied(false);
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

  return (
    <div className="character-url-share">
      <div className="share-controls">
        <button 
          onClick={handleGenerateUrl}
          className="share-btn"
          title="Generate a shareable URL for this character"
        >
          <span className="btn-icon">🔗</span>
          <span className="btn-text">Share Character</span>
        </button>
      </div>

      {showUrl && (
        <div className="url-display">
          <div className="url-info">
            <p className="url-description">
              📋 Share this URL to let others use your character:
            </p>
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

    </div>
  );
};

export default CharacterUrlShare;

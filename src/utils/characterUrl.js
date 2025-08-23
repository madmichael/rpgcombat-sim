// Character URL encoding/decoding utilities
// Allows users to share and bookmark characters via URL

/**
 * Encode character data into a URL-safe string
 * @param {Object} character - Character object to encode
 * @param {Object} achievements - Achievement tracking data (optional)
 * @param {Object} stats - Combat stats data (optional)
 * @returns {string} Base64 encoded character data
 */
export const encodeCharacterToUrl = (character, achievements = null, stats = null) => {
  if (!character) return '';
  
  try {
    // Create a complete character object with all essential data
    const characterData = {
      name: character.name,
      alignment: character.alignment,
      // Store ability scores directly, not under stats property
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
      // Include achievements and stats if provided
      achievements: achievements || [],
      combatStats: stats || {}
    };
    
    // Convert to JSON and encode
    const jsonString = JSON.stringify(characterData);
    const encoded = btoa(encodeURIComponent(jsonString));
    
    return encoded;
  } catch (error) {
    console.error('Error encoding character:', error);
    return '';
  }
};

/**
 * Decode character data from URL parameter
 * @param {string} encodedData - Base64 encoded character data
 * @returns {Object|null} Decoded character object or null if invalid
 */
export const decodeCharacterFromUrl = (encodedData) => {
  if (!encodedData) return null;
  
  try {
    // Decode from base64
    const jsonString = decodeURIComponent(atob(encodedData));
    console.log('Decoded JSON string:', jsonString);
    const characterData = JSON.parse(jsonString);
    console.log('Parsed character data:', characterData);
    
    // Validate required fields - be more flexible with validation
    if (!characterData.name) {
      console.error('Invalid character data - missing name');
      throw new Error('Invalid character data - missing name');
    }
    
    return characterData;
  } catch (error) {
    console.error('Error decoding character:', error);
    return null;
  }
};

/**
 * Generate a shareable URL for a character
 * @param {Object} character - Character object
 * @param {Object} achievements - Achievement tracking data (optional)
 * @param {Object} stats - Combat stats data (optional)
 * @returns {string} Complete URL with character data
 */
export const generateCharacterUrl = (character, achievements = null, stats = null) => {
  const encodedData = encodeCharacterToUrl(character, achievements, stats);
  if (!encodedData) return window.location.origin;
  
  const url = new URL(window.location.origin);
  url.searchParams.set('character', encodedData);
  
  return url.toString();
};

/**
 * Extract character data from current URL
 * @returns {Object|null} Character data if found in URL, null otherwise
 */
export const getCharacterFromUrl = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const encodedData = urlParams.get('character');
  
  return decodeCharacterFromUrl(encodedData);
};

/**
 * Update the current URL with character data (without page reload)
 * @param {Object} character - Character object to encode in URL
 * @param {Object} achievements - Achievement tracking data (optional)
 * @param {Object} stats - Combat stats data (optional)
 */
export const updateUrlWithCharacter = (character, achievements = null, stats = null) => {
  if (!character) return;
  
  const encodedData = encodeCharacterToUrl(character, achievements, stats);
  if (!encodedData) return;
  
  const url = new URL(window.location);
  url.searchParams.set('character', encodedData);
  
  // Update URL without reloading the page
  window.history.replaceState({}, '', url.toString());
};

/**
 * Clear character data from URL
 */
export const clearCharacterFromUrl = () => {
  const url = new URL(window.location);
  url.searchParams.delete('character');
  
  window.history.replaceState({}, '', url.toString());
};

// URL compression utilities for shorter character URLs
// Uses simple deflate-style compression optimized for JSON data

/**
 * Simple compression using run-length encoding and dictionary substitution
 * @param {string} str - String to compress
 * @returns {string} Compressed string
 */
const compress = (str) => {
  if (!str) return '';
  
  try {
    // Step 1: Replace common JSON patterns with shorter tokens
    let compressed = str
      .replace(/{"name"/g, '§n')
      .replace(/,"alignment"/g, '§a')
      .replace(/,"Strength"/g, '§S')
      .replace(/,"Agility"/g, '§A')
      .replace(/,"Stamina"/g, '§T')
      .replace(/,"Personality"/g, '§P')
      .replace(/,"Intelligence"/g, '§I')
      .replace(/,"Luck"/g, '§L')
      .replace(/,"modifiers"/g, '§m')
      .replace(/,"funds"/g, '§f')
      .replace(/,"gearSlots"/g, '§g')
      .replace(/,"backpack"/g, '§b')
      .replace(/,"weapon"/g, '§w')
      .replace(/,"hp"/g, '§h')
      .replace(/,"maxHp"/g, '§H')
      .replace(/,"luck"/g, '§l')
      .replace(/,"maxLuck"/g, '§M')
      .replace(/,"occupation"/g, '§o')
      .replace(/,"birthAugur"/g, '§u')
      .replace(/,"tradeGood"/g, '§t')
      .replace(/,"achievements"/g, '§e')
      .replace(/,"combatStats"/g, '§c')
      .replace(/":"/g, '¤')
      .replace(/","/g, '¥')
      .replace(/":null/g, '¦')
      .replace(/":true/g, '±')
      .replace(/":false/g, '²')
      .replace(/\[\]/g, '³')
      .replace(/{}/g, '´');
    
    return compressed;
  } catch (error) {
    console.error('Compression error:', error);
    return str;
  }
};

/**
 * Decompress the compressed string
 * @param {string} compressed - Compressed string
 * @returns {string} Original string
 */
const decompress = (compressed) => {
  if (!compressed) return '';
  
  try {
    // Reverse the compression process
    let decompressed = compressed
      .replace(/´/g, '{}')
      .replace(/³/g, '[]')
      .replace(/²/g, '":false')
      .replace(/±/g, '":true')
      .replace(/¦/g, '":null')
      .replace(/¥/g, '","')
      .replace(/¤/g, '":"')
      .replace(/§c/g, ',"combatStats"')
      .replace(/§e/g, ',"achievements"')
      .replace(/§t/g, ',"tradeGood"')
      .replace(/§u/g, ',"birthAugur"')
      .replace(/§o/g, ',"occupation"')
      .replace(/§M/g, ',"maxLuck"')
      .replace(/§l/g, ',"luck"')
      .replace(/§H/g, ',"maxHp"')
      .replace(/§h/g, ',"hp"')
      .replace(/§w/g, ',"weapon"')
      .replace(/§b/g, ',"backpack"')
      .replace(/§g/g, ',"gearSlots"')
      .replace(/§f/g, ',"funds"')
      .replace(/§m/g, ',"modifiers"')
      .replace(/§L/g, ',"Luck"')
      .replace(/§I/g, ',"Intelligence"')
      .replace(/§P/g, ',"Personality"')
      .replace(/§T/g, ',"Stamina"')
      .replace(/§A/g, ',"Agility"')
      .replace(/§S/g, ',"Strength"')
      .replace(/§a/g, ',"alignment"')
      .replace(/§n/g, '{"name"');
    
    return decompressed;
  } catch (error) {
    console.error('Decompression error:', error);
    return '';
  }
};

/**
 * Create minimal character data for ultra-short URLs
 * @param {Object} characterData - Character object to compress
 * @returns {Object} Minimal character data
 */
const createMinimalCharacterData = (characterData) => {
  // Handle both old format (abilities object) and new format (top-level properties)
  const abilities = characterData.abilities || {};
  
  // Only include essential data for character recreation
  return {
    n: characterData.name,
    a: characterData.alignment,
    S: characterData.Strength || abilities.Strength || 10,
    A: characterData.Agility || abilities.Agility || 10,
    T: characterData.Stamina || abilities.Stamina || 10,
    P: characterData.Personality || abilities.Personality || 10,
    I: characterData.Intelligence || abilities.Intelligence || 10,
    L: characterData.Luck || abilities.Luck || 10,
    // Currency: include legacy numeric funds, new cp, and startingFunds string
    f: characterData.funds,
    fc: characterData.funds_cp,
    sf: characterData.startingFunds,
    o: characterData.occupation?.Roll || 0,
    h: characterData.hp,
    H: characterData.maxHp,
    // Only include non-empty gear and backpack
    g: Object.keys(characterData.gearSlots || {}).length > 0 ? characterData.gearSlots : undefined,
    b: (characterData.backpack || []).length > 0 ? characterData.backpack : undefined
  };
};

/**
 * Compress character data for shorter URLs
 * @param {Object} characterData - Character object to compress
 * @returns {string} Compressed and encoded string
 */
export const compressCharacterData = (characterData) => {
  try {
    // Try minimal compression first for ultra-short URLs
    const minimalData = createMinimalCharacterData(characterData);
    const minimalJson = JSON.stringify(minimalData);
    
    // If minimal data is small enough, use it directly
    if (minimalJson.length < 200) {
      const encoded = btoa(minimalJson)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
      return 'v3_' + encoded;
    }
    
    // Fallback to pattern compression for larger data
    const compressed = compress(minimalJson);
    const encoded = btoa(encodeURIComponent(compressed))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    return 'v2_' + encoded;
  } catch (error) {
    console.error('Compression error:', error);
    return '';
  }
};

/**
 * Expand minimal character data back to full format
 * @param {Object} minimalData - Minimal character data
 * @returns {Object} Full character data
 */
const expandMinimalCharacterData = (minimalData) => {
  // Handle the case where funds is stored as a string like "3 sp 1 cp"
  let funds = 0;
  if (typeof minimalData.f === 'string') {
    // Parse "3 sp 1 cp" format
    const matches = minimalData.f.match(/(\d+)\s*sp|(\d+)\s*cp/g);
    if (matches) {
      matches.forEach(match => {
        const [amount, type] = match.split(/\s+/);
        if (type === 'sp') funds += parseInt(amount) * 10;
        if (type === 'cp') funds += parseInt(amount);
      });
    }
  } else {
    funds = minimalData.f || 0;
  }

  // Also pull new currency fields when available
  const funds_cp = typeof minimalData.fc === 'number' ? minimalData.fc : undefined;
  const startingFunds = typeof minimalData.sf === 'string' ? minimalData.sf : undefined;

  // Parse ability scores from the data
  const strength = minimalData.S || 10;
  const agility = minimalData.A || 10;
  const stamina = minimalData.T || 10;
  const personality = minimalData.P || 10;
  const intelligence = minimalData.I || 10;
  const luck = minimalData.L || 10;

  // Reconstruct full character data with occupation-based equipment
  const occupationRoll = minimalData.o || '01';
  
  // Load occupation data to get weapon and trade good
  let occupation = null;
  let weapon = null;
  let tradeGood = null;
  
  // For now, create placeholder weapon and trade good based on occupation roll
  // This will be enhanced when occupation data is available
  if (occupationRoll) {
    // Create a basic weapon placeholder
    weapon = {
      id: `weapon_occupation_${occupationRoll}`,
      name: "Starting Weapon",
      damage: "1d4",
      slot: "meleeWeapon",
      cost: 0,
      rarity: "common",
      effects: { damage: "1d4" },
      description: `Starting weapon from occupation`,
      icon: "⚔️"
    };
    
    // Create a basic trade good placeholder
    tradeGood = {
      id: `trade_${occupationRoll}`,
      name: "Trade Goods",
      slot: "tradeGood",
      cost: 0,
      rarity: "common",
      effects: {},
      description: `Starting trade good from occupation`,
      icon: "📦"
    };
    
    // Create basic occupation object
    occupation = {
      Roll: occupationRoll,
      Occupation: "Adventurer",
      "Trained Weapon": "Starting Weapon",
      "Trade Goods": "Trade Goods"
    };
  }
  
  // Create gear slots with weapon and trade good
  const gearSlots = {
    head: null,
    neck: null,
    body: null,
    cloak: null,
    belt: null,
    arms: null,
    meleeWeapon: weapon && weapon.slot === 'meleeWeapon' ? weapon : null,
    rangedWeapon: weapon && weapon.slot === 'rangedWeapon' ? weapon : null,
    rightHand: null,
    leftHand: null,
    rightFingers: null,
    leftFingers: null,
    legs: null,
    feet: null,
    tradeGood: tradeGood,
    ...minimalData.g
  };
  
  return {
    name: minimalData.n,
    alignment: minimalData.a,
    Strength: strength,
    Agility: agility,
    Stamina: stamina,
    Personality: personality,
    Intelligence: intelligence,
    Luck: luck,
    modifiers: {
      Strength: Math.floor((strength - 10) / 2),
      Agility: Math.floor((agility - 10) / 2),
      Stamina: Math.floor((stamina - 10) / 2),
      Personality: Math.floor((personality - 10) / 2),
      Intelligence: Math.floor((intelligence - 10) / 2),
      Luck: Math.floor((luck - 10) / 2)
    },
    funds: funds,
    funds_cp: funds_cp,
    startingFunds: startingFunds,
    occupation: occupation || { Roll: occupationRoll },
    hp: minimalData.h || 1,
    maxHp: minimalData.H || 1,
    luck: luck,
    maxLuck: luck,
    gearSlots: gearSlots,
    backpack: minimalData.b || [],
    weapon: weapon,
    tradeGood: tradeGood ? tradeGood.name : null,
    birthAugur: null,
    achievements: [],
    combatStats: {}
  };
};

/**
 * Decompress character data from URL
 * @param {string} compressedData - Compressed character data
 * @returns {Object|null} Character object or null if invalid
 */
export const decompressCharacterData = (compressedData) => {
  try {
    // Handle v3 format (minimal data)
    if (compressedData.startsWith('v3_')) {
      let encoded = compressedData.substring(3);
      
      // Restore Base64 padding and characters
      encoded = encoded
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      
      while (encoded.length % 4) {
        encoded += '=';
      }
      
      const minimalJson = atob(encoded);
      const minimalData = JSON.parse(minimalJson);
      return expandMinimalCharacterData(minimalData);
    }
    
    // Handle v2 format (pattern compressed)
    if (compressedData.startsWith('v2_')) {
      let encoded = compressedData.substring(3);
      
      encoded = encoded
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      
      while (encoded.length % 4) {
        encoded += '=';
      }
      
      const compressed = decodeURIComponent(atob(encoded));
      const jsonString = decompress(compressed);
      
      if (!jsonString) {
        throw new Error('Decompression failed');
      }
      
      // v2 format contains full character data, not minimal data
      const characterData = JSON.parse(jsonString);
      
      // If it looks like minimal data, expand it
      if (characterData.n && !characterData.name) {
        return expandMinimalCharacterData(characterData);
      }
      
      // For v2 full character data, ensure ability scores are properly flattened
      if (characterData.abilities && !characterData.Strength) {
        characterData.Strength = characterData.abilities.Strength || 10;
        characterData.Agility = characterData.abilities.Agility || 10;
        characterData.Stamina = characterData.abilities.Stamina || 10;
        characterData.Personality = characterData.abilities.Personality || 10;
        characterData.Intelligence = characterData.abilities.Intelligence || 10;
        characterData.Luck = characterData.abilities.Luck || 10;
      }
      
      // Ensure modifiers exist
      if (!characterData.modifiers && characterData.Strength) {
        characterData.modifiers = {
          Strength: Math.floor((characterData.Strength - 10) / 2),
          Agility: Math.floor((characterData.Agility - 10) / 2),
          Stamina: Math.floor((characterData.Stamina - 10) / 2),
          Personality: Math.floor((characterData.Personality - 10) / 2),
          Intelligence: Math.floor((characterData.Intelligence - 10) / 2),
          Luck: Math.floor((characterData.Luck - 10) / 2)
        };
      }
      
      // Preserve existing weapon data from gearSlots
      if (characterData.gearSlots) {
        const meleeWeapon = characterData.gearSlots.meleeWeapon;
        const rangedWeapon = characterData.gearSlots.rangedWeapon;
        
        if (meleeWeapon && meleeWeapon.name) {
          characterData.weapon = meleeWeapon;
        } else if (rangedWeapon && rangedWeapon.name) {
          characterData.weapon = rangedWeapon;
        }
        
        // Preserve trade good
        if (characterData.gearSlots.tradeGood && characterData.gearSlots.tradeGood.name) {
          characterData.tradeGood = characterData.gearSlots.tradeGood.name;
        }
      }
      
      // Ensure combat stats exist
      if (!characterData.combatStats) {
        characterData.combatStats = {};
      }
      
      // Ensure achievements exist
      if (!characterData.achievements) {
        characterData.achievements = [];
      }
      
      return characterData;
    }
    
    return null;
  } catch (error) {
    console.error('Decompression error:', error);
    return null;
  }
};

/**
 * Get compression ratio for debugging
 * @param {Object} characterData - Character data to test
 * @returns {Object} Compression statistics
 */
export const getCompressionStats = (characterData) => {
  const original = JSON.stringify(characterData);
  const compressed = compressCharacterData(characterData);
  
  return {
    originalSize: original.length,
    compressedSize: compressed.length,
    ratio: ((1 - compressed.length / original.length) * 100).toFixed(1) + '%',
    savings: original.length - compressed.length
  };
};

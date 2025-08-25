import mundaneItemsData from '../data/mundaneItems.json';
import mundaneArmor from '../data/mundane_armor.json';
import gemsData from '../data/gems.json';
import vegetablesData from '../data/vegetables.json';

/**
 * Generates a random mundane item with variable descriptions
 * @param {string} rarity - Optional rarity override ('common', 'uncommon', 'rare', 'epic', 'legendary')
 * @returns {Object} Generated item object
 */
export const generateMundaneItem = (rarity = null) => {
  const { mundaneItems, fabrics, colors, materials, conditions } = mundaneItemsData;
  
  // Select random base item
  const baseItem = mundaneItems[Math.floor(Math.random() * mundaneItems.length)];
  
  // Determine rarity if not specified - grimdark distribution
  if (!rarity) {
    const rarityRoll = Math.random();
    if (rarityRoll < 0.85) rarity = 'common';
    else if (rarityRoll < 0.97) rarity = 'uncommon';
    else if (rarityRoll < 0.999) rarity = 'rare';
    else if (rarityRoll < 0.9999) rarity = 'epic';
    else rarity = 'legendary';
  }
  
  // Generate variable components
  const fabric = fabrics[Math.floor(Math.random() * fabrics.length)];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const material = materials[Math.floor(Math.random() * materials.length)];
  const condition = conditions[Math.floor(Math.random() * conditions.length)];
  
  // Calculate value based on rarity and materials - grimdark economy
  const rarityMultiplier = {
    'common': 1,
    'uncommon': 1.5,
    'rare': 3,
    'epic': 8,
    'legendary': 15
  };

  const materialMultiplier = getMaterialMultiplier(material);
  const finalValue = Math.ceil(baseItem.baseValue * rarityMultiplier[rarity] * materialMultiplier);
  
  // Generate name and description
  const itemName = generateItemName(baseItem, material, color, condition, rarity);
  const description = generateItemDescription(baseItem, fabric, color, material, condition, rarity);
  
  // Generate effects based on rarity
  const effects = generateItemEffects(baseItem, rarity, material);
  
  return {
    id: `mundane_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: itemName,
    slot: baseItem.slot,
    cost: finalValue,
    rarity: rarity,
    effects: effects,
    description: description,
    icon: baseItem.icon,
    category: baseItem.category,
    material: material,
    fabric: fabric,
    color: color,
    condition: condition
  };
};

/**
 * Generate a vegetable loot item with quality and cp value
 */
export const generateVegetableItem = () => {
  const { vegetables, qualities } = vegetablesData;
  if (!vegetables || !qualities || vegetables.length === 0 || qualities.length === 0) return null;

  // Pick a random vegetable
  const veg = vegetables[Math.floor(Math.random() * vegetables.length)];

  // Skewed quality distribution: better qualities are much rarer
  const qualityWeights = {
    'Worm Infested': 0.06,
    'Rotten': 0.20,
    'Bruised': 0.20,
    'Wilted': 0.18,
    'Edible': 0.14,
    'Fresh': 0.09,
    'Crisp': 0.06,
    'Choice': 0.04,
    'Excellent': 0.02,
    'Perfect': 0.01
  };

  const pickWeightedQuality = () => {
    const entries = qualities.map(q => ({ ...q, w: qualityWeights[q.quality] ?? 0 }));
    let total = entries.reduce((sum, q) => sum + q.w, 0);
    // Fallback uniform if weights missing
    if (total <= 0) {
      return qualities[Math.floor(Math.random() * qualities.length)];
    }
    let roll = Math.random() * total;
    for (const q of entries) {
      if ((roll -= q.w) <= 0) return q;
    }
    return entries[entries.length - 1];
  };

  const quality = pickWeightedQuality();

  // Map quality to rarity used by UI badges
  const rarityByQuality = {
    'Worm Infested': 'common',
    'Rotten': 'common',
    'Bruised': 'common',
    'Wilted': 'common',
    'Edible': 'uncommon',
    'Fresh': 'uncommon',
    'Crisp': 'rare',
    'Choice': 'rare',
    'Excellent': 'epic',
    'Perfect': 'legendary'
  };

  const rarity = rarityByQuality[quality.quality] || 'common';
  const costCopper = quality.value; // value provided is cp

  // Icon selection by veg kind (simple mapping with defaults)
  const iconByVeg = {
    'Carrots': '🥕',
    'Cabbage': '🥬',
    'Onions': '🧅',
    'Garlic': '🧄',
    'Peas': '🫛',
    'Beets': '🫐', // not exact, placeholder
  };
  const icon = iconByVeg[veg.name] || '🥗';

  return {
    id: `veg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: `${quality.quality} ${veg.name}`,
    slot: 'backpack',
    rarity,
    cost: costCopper, // legacy field (cp)
    cost_cp: costCopper,
    effects: {},
    category: 'vegetable',
    description: `A ${veg.name.toLowerCase()} of ${quality.quality.toLowerCase()} quality.`,
    icon
  };
};

/**
 * Gets material value multiplier - grimdark setting
 */
const getMaterialMultiplier = (material) => {
  const multipliers = {
    // Basic metals (common in grimdark world)
    'crude steel': 1.2, 'rusted iron': 0.8, 'rough iron': 1,
    'tarnished bronze': 1.1, 'dull copper': 0.9, 'bent metal': 0.7,
    'tin': 0.8, 'pewter': 0.9,
    // Wood materials
    'oak': 1.1, 'pine': 0.9, 'ash wood': 1, 'wood': 0.8,
    'carved wood': 1.2, 'cracked wood': 0.7,
    // Organic materials
    'bone': 1, 'polished bone': 1.2, 'brittle bone': 0.8,
    'horn': 1.1, 'antler': 1.1, 'hide': 0.9, 'rough leather': 0.8,
    'weathered leather': 0.7,
    // Stone and clay
    'stone': 0.9, 'worn stone': 0.8, 'clay': 0.7, 'chipped flint': 0.8,
    // Rope and cord
    'rope': 0.8, 'coarse rope': 0.7, 'cord': 0.8, 'twine': 0.7
  };
  
  return multipliers[material] || 0.9;
};

/**
 * Generates item name with descriptive elements
 */
const generateItemName = (baseItem, material, color, condition, rarity) => {
  const prefixes = {
    'legendary': ['Ancient', 'Fabled', 'Lost', 'Forgotten'],
    'epic': ['Well-crafted', 'Sturdy', 'Solid', 'Reliable'],
    'rare': ['Decent', 'Serviceable', 'Usable', 'Functional'],
    'uncommon': ['Patched', 'Mended', 'Repaired', 'Fixed'],
    'common': ['Broken', 'Worn', 'Crude', 'Shabby']
  };
  
  // Most items just use condition + base name for grimdark feel
  if (rarity === 'legendary' && Math.random() < 0.3) {
    const prefix = prefixes[rarity][Math.floor(Math.random() * prefixes[rarity].length)];
    return `${prefix} ${baseItem.name}`;
  } else if (Math.random() < 0.6) {
    return `${condition.charAt(0).toUpperCase() + condition.slice(1)} ${baseItem.name}`;
  } else {
    return `${color.charAt(0).toUpperCase() + color.slice(1)} ${baseItem.name}`;
  }
};

/**
 * Generates detailed item description
 */
const generateItemDescription = (baseItem, fabric, color, material, condition, rarity) => {
  const qualityDescriptions = {
    'legendary': 'Despite its age, this item shows remarkable craftsmanship from a bygone era when such skills were more common.',
    'epic': 'A well-made piece that has survived the harsh realities of this world better than most.',
    'rare': 'This item shows decent construction and might actually prove useful.',
    'uncommon': 'A serviceable item that has seen better days but still functions adequately.',
    'common': 'A crude and worn item that barely serves its intended purpose.'
  };
  
  let description = `A ${condition} ${baseItem.name.toLowerCase()}`;
  
  // Add material/fabric description
  if (baseItem.category === 'clothing' || baseItem.category === 'accessory' || baseItem.category === 'trinket') {
    description += ` made from ${color} ${fabric}`;
  } else {
    description += ` fashioned from ${color} ${material}`;
  }
  
  // Add quality description
  description += `. ${qualityDescriptions[rarity]}`;
  
  // Add grimdark flavor text
  if (rarity === 'legendary') {
    description += ' Such items are whispered about in taverns and coveted by those who know their true worth.';
  } else if (rarity === 'common') {
    description += ' Like most things in this harsh world, it bears the marks of hard use and neglect.';
  }
  
  return description;
};

/**
 * Generates item effects based on rarity and type - grimdark setting (minimal magic)
 */
const generateItemEffects = (baseItem, rarity, material) => {
  const effects = {};
  
  // Base effects by rarity - much more conservative
  const rarityBonuses = {
    'common': 0,
    'uncommon': 0,
    'rare': 1,
    'epic': 1,
    'legendary': 2
  };
  
  const bonus = rarityBonuses[rarity];
  
  // Only higher rarity items have any effects, and they're minimal
  if (bonus > 0 && Math.random() < 0.3) {
    // Add very limited effects based on item category
    switch (baseItem.category) {
      case 'clothing':
      case 'accessory':
        // Only basic protection improvements
        if (Math.random() < 0.4) effects.armorClass = bonus;
        break;
        
      case 'trinket':
        // Trinkets might provide tiny morale benefits
        if (Math.random() < 0.2) effects.luck = bonus;
        break;
        
      case 'container':
        // Better construction = slightly more capacity
        if (rarity === 'legendary') effects.carryCapacity = bonus * 3;
        break;
        
      case 'tool':
        // Well-made tools work better
        if (Math.random() < 0.3) effects.utility = bonus;
        break;
    }
    
    // Material-specific bonuses are rare and practical
    if (material === 'crude steel' && Math.random() < 0.2) {
      effects.durability = 1;
    }
  }
  
  return effects;
};

/**
 * Generate a mundane armor item from mundane_armor.json
 */
export const generateMundaneArmor = () => {
  const armor = mundaneArmor[Math.floor(Math.random() * mundaneArmor.length)];
  if (!armor) return null;

  // Normalize fumble die to '1dX' when applicable
  const rawDie = armor.fumble_die;
  const hasDie = typeof rawDie === 'string' && rawDie !== '—' && rawDie.trim().length > 0;
  const normalizedDie = hasDie ? (rawDie.trim().toLowerCase().startsWith('d') ? `1${rawDie.trim().toLowerCase()}` : rawDie.trim().toLowerCase()) : null;

  // Map armor type to gear slot
  let slot = 'armor';
  if (armor.type === 'shield') slot = 'leftHand';
  else if (armor.type === 'helmet') slot = 'head';

  // For mundane armor, do NOT map armor_bonus into effects.armorClass to avoid double-counting.
  // AC for mundane armor will be taken from the top-level armor_bonus field in useGearEffects().
  const effects = {};
  // We keep fumble die as a top-level field; useGearEffects can read either top-level or effects
  // if needed, but we avoid duplicating it in both places.

  return {
    id: `armor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: armor.name,
    slot,
    rarity: 'common',
    cost: (armor.cost_gp || 0) * 100, // legacy field (cp)
    cost_cp: (armor.cost_gp || 0) * 100,
    effects,
    category: armor.type,
    armor_bonus: armor.armor_bonus || 0,
    check_penalty: armor.check_penalty || 0,
    speed_penalty: armor.speed_penalty || 0,
    fumble_die: normalizedDie,
    weight: armor.weight
  };
};

/**
 * Generate a gem item from gems.json
 */
export const generateGemItem = () => {
  const gem = gemsData[Math.floor(Math.random() * gemsData.length)];
  if (!gem) return null;
  // Parse value range like "20-100" (gp)
  let min = 1, max = 10;
  if (typeof gem.value_gp_range === 'string') {
    const m = gem.value_gp_range.match(/(\d+)\s*-\s*(\d+)/);
    if (m) { min = parseInt(m[1], 10); max = parseInt(m[2], 10); }
  }
  const gp = Math.floor(Math.random() * (max - min + 1)) + min;
  const costCopper = gp * 100; // store as copper

  return {
    id: `gem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: gem.name,
    slot: 'backpack',
    rarity: gem.rarity || 'uncommon',
    cost: costCopper, // legacy field (cp)
    cost_cp: costCopper,
    effects: {},
    category: 'gem',
    description: gem.special_properties || 'A glittering gemstone.',
    value_gp: gp
  };
};

/**
 * Generates multiple random items (for loot drops)
 * @param {number} count - Number of items to generate
 * @param {string} difficulty - Monster difficulty affecting rarity distribution
 * @returns {Array} Array of generated items
 */
export const generateLootItems = (count = 1, difficulty = 'normal') => {
  const items = [];

  // Adjust rarity chances based on difficulty - enforce low tiers on low challenges
  const rarityWeights = {
    // Low challenge: only common/uncommon
    'easy':   { common: 0.97, uncommon: 0.03, rare: 0,     epic: 0,      legendary: 0 },
    // Mid: tiny chance of rare
    'normal': { common: 0.93, uncommon: 0.06, rare: 0.01,  epic: 0,      legendary: 0 },
    // High: rare becomes possible, epic extremely rare
    'hard':   { common: 0.85, uncommon: 0.12, rare: 0.03,  epic: 0.00,   legendary: 0 },
    // Boss: allow rare, tiny epic, vanishing legendary
    'boss':   { common: 0.72, uncommon: 0.2,  rare: 0.07,  epic: 0.009, legendary: 0.001 }
  };
  // Item type gating by difficulty - gems only at higher challenges
  const typeWeights = {
    'easy':   { mundane: 0.74, armor: 0.20, gem: 0.00, vegetable: 0.06 },
    'normal': { mundane: 0.64, armor: 0.28, gem: 0.02, vegetable: 0.06 },
    'hard':   { mundane: 0.55, armor: 0.32, gem: 0.08, vegetable: 0.05 },
    'boss':   { mundane: 0.42, armor: 0.36, gem: 0.19, vegetable: 0.03 }
  };

  const rWeights = rarityWeights[difficulty] || rarityWeights['normal'];
  const tWeights = typeWeights[difficulty] || typeWeights['normal'];

  for (let i = 0; i < count; i++) {
    // Decide item type first
    const typeRoll = Math.random();
    let type = 'mundane';
    let tCum = 0;
    for (const [t, w] of Object.entries(tWeights)) {
      tCum += w;
      if (typeRoll <= tCum) { type = t; break; }
    }

    if (type === 'armor') {
      const armorItem = generateMundaneArmor();
      if (armorItem) { items.push(armorItem); continue; }
      // fallback to mundane
    } else if (type === 'gem') {
      const gemItem = generateGemItem();
      if (gemItem) { items.push(gemItem); continue; }
      // fallback to mundane
    } else if (type === 'vegetable') {
      const vegItem = generateVegetableItem();
      if (vegItem) { items.push(vegItem); continue; }
      // fallback to mundane
    }

    // Generate a mundane item with difficulty-based rarity
    const roll = Math.random();
    let rarity = 'common';
    let cumulative = 0;
    for (const [rarityLevel, weight] of Object.entries(rWeights)) {
      cumulative += weight;
      if (roll <= cumulative) { rarity = rarityLevel; break; }
    }
    items.push(generateMundaneItem(rarity));
  }

  return items;
};

export default { generateMundaneItem, generateMundaneArmor, generateGemItem, generateVegetableItem, generateLootItems };

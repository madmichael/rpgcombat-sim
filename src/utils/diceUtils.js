// Utility functions for dice rolling and combat calculations

export function rollDice(diceStr) {
  // Ensure diceStr is a string
  const diceString = String(diceStr);
  const match = diceString.match(/(\d+)d(\d+)/);
  if (!match) return 0;
  const num = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  let total = 0;
  for (let i = 0; i < num; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  return total;
}

export function roll3d6() {
  return Math.floor(Math.random() * 6 + 1) + 
         Math.floor(Math.random() * 6 + 1) + 
         Math.floor(Math.random() * 6 + 1);
}

export function roll1d4() {
  return Math.floor(Math.random() * 4 + 1);
}

export function roll1d20() {
  return Math.floor(Math.random() * 20) + 1;
}

export function parseDamageString(damageStr) {
  // Handle undefined or null input
  if (damageStr === undefined || damageStr === null) {
    return { damage: 1, breakdown: "1" };
  }
  
  // Ensure damageStr is a string
  const damageString = String(damageStr);
  
  // Handle damage strings like "1d4", "d6" (convert to "1d6"), "1d8+2"
  let normalizedStr = damageString.replace(/^d(\d+)/, '1d$1');
  const diceMatch = normalizedStr.match(/(\d+)d(\d+)([+\-]\d+)?/);
  
  if (!diceMatch) {
    return { damage: 1, breakdown: "1" }; // Return 1 instead of 0 for unparseable damage
  }
  
  const num = parseInt(diceMatch[1], 10);
  const sides = parseInt(diceMatch[2], 10);
  const modifier = diceMatch[3] ? parseInt(diceMatch[3], 10) : 0;
  
  let damage = 0;
  let rolls = [];
  for (let i = 0; i < num; i++) {
    const roll = Math.floor(Math.random() * sides) + 1;
    rolls.push(roll);
    damage += roll;
  }
  damage += modifier;
  
  // Create breakdown string
  let breakdown = rolls.join(' + ');
  if (modifier !== 0) {
    breakdown += ` ${modifier >= 0 ? '+' : ''}${modifier}`;
  }
  breakdown += ` = ${Math.max(1, damage)}`;
  
  return { damage: Math.max(1, damage), breakdown }; // Minimum 1 damage
}

export function calculateAC(character) {
  return 10 + (character.modifiers ? character.modifiers['Agility'] : 0);
}

export function isRangedWeapon(weaponName) {
  return weaponName && /bow|sling|crossbow/i.test(weaponName);
}

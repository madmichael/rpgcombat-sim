// DCC RPG Combat Fumble Table and Utilities
import { rollDice } from './diceUtils.js';

// DCC RPG Combat Fumble Table
// Roll die based on armor: d4 (no armor), d8 (light), d12 (medium), d16 (heavy)
// Adjust result by Luck modifier

const dccFumbleTable = [
  {
    roll: "0 or less",
    result: "Slipped on filth. You must make a DC 11 Ref Save or fall prone.",
    severity: "minor",
    effect: "prone_save",
    duration: 0
  },
  {
    roll: 1,
    result: "Get a grip! Your weapon shifts in your hand; take your next attack at a -2 penalty.",
    severity: "minor",
    effect: "attack_penalty",
    penalty: -2,
    duration: 1
  },
  {
    roll: 2,
    result: "Off balance. Take your next attack at a -4 penalty.",
    severity: "minor",
    effect: "attack_penalty",
    penalty: -4,
    duration: 1
  },
  {
    roll: 3,
    result: "Exposed defenses! Your opponent gets a +2 bonus for its next attack.",
    severity: "minor",
    effect: "opponent_attack_bonus",
    bonus: 2,
    duration: 1
  },
  {
    roll: 4,
    result: "Discombobulated. Your opponent gets a +4 bonus for its next attack.",
    severity: "moderate",
    effect: "opponent_attack_bonus",
    bonus: 4,
    duration: 1
  },
  {
    roll: 5,
    result: "Something in your eye. Your attacks only do half damage against your current opponent.",
    severity: "moderate",
    effect: "half_damage",
    duration: -1 // Until combat ends
  },
  {
    roll: 6,
    result: "Weak fingers. You drop your weapon; pick it up or draw a new one on your next action.",
    severity: "moderate",
    effect: "weapon_dropped",
    duration: 1
  },
  {
    roll: 7,
    result: "Clumsy! Your weapon flies off 1d10 feet in a random direction, possibly hitting something (or someone) for half damage.",
    severity: "moderate",
    effect: "weapon_thrown",
    duration: 1
  },
  {
    roll: 8,
    result: "Breakage. Your weapon comes apart somehow. 10 minutes to repair, useless for now.",
    severity: "severe",
    effect: "weapon_broken",
    duration: -1 // Until repaired
  },
  {
    roll: 9,
    result: "Fail. Your weapon strikes at a bad angle, gets fractured and deals only half damage until mended.",
    severity: "severe",
    effect: "weapon_damaged",
    duration: -1 // Until repaired
  },
  {
    roll: 10,
    result: "Shatter! You manage to break your weapon into pieces; it is quite useless until mended.",
    severity: "severe",
    effect: "weapon_shattered",
    duration: -1 // Until repaired
  },
  {
    roll: 11,
    result: "Easy prey. You incompetently become Entangled in your armor for 1d3 rounds.",
    severity: "severe",
    effect: "entangled",
    duration: "1d3"
  },
  {
    roll: 12,
    result: "Sitting duck. You are Entangled in your armor until you succeed in a DC 15 Agility check made at the end of each of your turns.",
    severity: "severe",
    effect: "entangled_save",
    saveDC: 15,
    duration: -1 // Until save succeeds
  },
  {
    roll: 13,
    result: "Cover blown. A piece of your armor falls off; 10 minutes to fix, for now reduce your AC by 1d2.",
    severity: "severe",
    effect: "ac_reduction",
    reduction: "1d2",
    duration: -1 // Until repaired
  },
  {
    roll: 14,
    result: "Striptease. Pieces of your armor fall off; 10 minutes to fix, for now reduce your AC by 1d2+1.",
    severity: "critical",
    effect: "ac_reduction",
    reduction: "1d2+1",
    duration: -1 // Until repaired
  },
  {
    roll: 15,
    result: "Grinding halt! Your armor seizes up for 1d3 rounds, rendering you Helpless for the duration.",
    severity: "critical",
    effect: "helpless",
    duration: "1d3"
  },
  {
    roll: 16,
    result: "Jammed straps. You remain Helpless until you succeed in a DC 17 Strength check made at the end of each of your turns.",
    severity: "critical",
    effect: "helpless_save",
    saveDC: 17,
    duration: -1 // Until save succeeds
  },
  {
    roll: 17,
    result: "Shoddy donning! Your entire armor falls off suddenly and comically, tripping you prone.",
    severity: "critical",
    effect: "armor_falls_prone",
    duration: 0
  },
  {
    roll: 18,
    result: "Are you alright? You hit the nearest ally (or yourself if no ally) for normal damage and fall prone.",
    severity: "critical",
    effect: "hit_ally_prone",
    duration: 0
  },
  {
    roll: 19,
    result: "What ails thee? You hit yourself for normal damage +1 and fall prone.",
    severity: "critical",
    effect: "hit_self_prone",
    bonusDamage: 1,
    duration: 0
  },
  {
    roll: "20+",
    result: "Vulgar display of blunder! You hit yourself for maximum damage and fall prone.",
    severity: "catastrophic",
    effect: "hit_self_max_prone",
    duration: 0
  }
];

// Fumble die by armor type
const fumbleDice = {
  "no_armor": "1d4",
  "light_armor": "1d8", 
  "medium_armor": "1d12",
  "heavy_armor": "1d16"
};

// Function to get fumble result
export function getFumbleResult(armorType = "no_armor", luckModifier = 0) {
  const fumbleDie = fumbleDice[armorType] || fumbleDice["no_armor"];
  const roll = rollDice(fumbleDie);
  const adjustedRoll = roll + luckModifier;
  
  let fumbleEntry;
  if (adjustedRoll <= 0) {
    fumbleEntry = dccFumbleTable[0];
  } else if (adjustedRoll >= 20) {
    fumbleEntry = dccFumbleTable[dccFumbleTable.length - 1];
  } else {
    fumbleEntry = dccFumbleTable.find(entry => entry.roll === adjustedRoll) || dccFumbleTable[adjustedRoll];
  }
  
  return {
    ...fumbleEntry,
    rawRoll: roll,
    adjustedRoll: adjustedRoll,
    fumbleDie: fumbleDie
  };
}

// Apply fumble effects to character/monster
export function applyFumbleEffect(fumbleResult, attacker, weapon) {
  const effects = [];
  
  switch (fumbleResult.effect) {
    case "attack_penalty":
      effects.push({
        type: "attack_penalty",
        value: fumbleResult.penalty,
        duration: fumbleResult.duration,
        description: `${fumbleResult.penalty} attack penalty for ${fumbleResult.duration} round(s)`
      });
      break;
      
    case "opponent_attack_bonus":
      effects.push({
        type: "opponent_attack_bonus",
        value: fumbleResult.bonus,
        duration: fumbleResult.duration,
        description: `Opponent gets +${fumbleResult.bonus} attack bonus for ${fumbleResult.duration} round(s)`
      });
      break;
      
    case "half_damage":
      effects.push({
        type: "half_damage",
        duration: fumbleResult.duration,
        description: "Attacks do half damage until combat ends"
      });
      break;
      
    case "weapon_dropped":
      effects.push({
        type: "weapon_dropped",
        duration: fumbleResult.duration,
        description: "Weapon dropped - must pick up or draw new weapon"
      });
      break;
      
    case "weapon_broken":
    case "weapon_shattered":
      effects.push({
        type: "weapon_unusable",
        duration: fumbleResult.duration,
        description: "Weapon is broken and unusable until repaired"
      });
      break;
      
    case "weapon_damaged":
      effects.push({
        type: "weapon_half_damage",
        duration: fumbleResult.duration,
        description: "Weapon deals half damage until repaired"
      });
      break;
      
    case "hit_self_prone":
      const selfDamage = weapon ? rollDice(weapon.damage || "1d3") + (fumbleResult.bonusDamage || 0) : 1;
      effects.push({
        type: "self_damage",
        value: selfDamage,
        description: `Hit self for ${selfDamage} damage and fall prone`
      });
      break;
      
    case "hit_self_max_prone":
      const maxDamage = weapon ? getMaxDamage(weapon.damage || "1d3") : 3;
      effects.push({
        type: "self_damage",
        value: maxDamage,
        description: `Hit self for maximum damage (${maxDamage}) and fall prone`
      });
      break;
      
    default:
      effects.push({
        type: "special",
        description: fumbleResult.result
      });
  }
  
  return effects;
}

// Helper function to get maximum damage from dice string
function getMaxDamage(diceStr) {
  const match = diceStr.match(/(\d+)d(\d+)([+\-]\d+)?/);
  if (!match) return 1;
  
  const num = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  const modifier = match[3] ? parseInt(match[3], 10) : 0;
  
  return (num * sides) + modifier;
}

// Check if a roll is a fumble (natural 1)
export function isFumble(rawRoll) {
  return rawRoll === 1;
}

export { dccFumbleTable, fumbleDice };

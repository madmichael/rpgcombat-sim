import { useMemo } from 'react';

/**
 * Hook to calculate total gear effects from equipped items
 * @param {Object} character - Character object with gearSlots
 * @returns {Object} Combined effects from all equipped gear
 */
export const useGearEffects = (character) => {
  const gearEffects = useMemo(() => {
    if (!character || !character.gearSlots) {
      return {
        armorClass: 0,
        attackBonus: 0,
        damageBonus: 0,
        abilityModifiers: {
          Strength: 0,
          Agility: 0,
          Stamina: 0,
          Personality: 0,
          Intelligence: 0,
          Luck: 0
        },
        movementBonus: 0,
        totalArmorClass: 10, // Base AC
        totalAttackBonus: 0,
        totalDamageBonus: 0,
        armorBonusTotal: 0,
        checkPenaltyTotal: 0,
        armorFumbleDie: null
      };
    }

    const effects = {
      armorClass: 0,
      attackBonus: 0,
      damageBonus: 0,
      abilityModifiers: {
        Strength: 0,
        Agility: 0,
        Stamina: 0,
        Personality: 0,
        Intelligence: 0,
        Luck: 0
      },
      movementBonus: 0,
      armorBonusTotal: 0,
      checkPenaltyTotal: 0,
      armorFumbleDie: null
    };

    // Process each equipped item
    const gearSlotValues = character.gearSlots ? Object.values(character.gearSlots) : [];
    gearSlotValues.forEach(item => {
      if (!item || !item.effects) return;

      const itemEffects = item.effects || {};

      // Armor Class bonus
      if (itemEffects.armorClass) {
        effects.armorClass += itemEffects.armorClass;
      }

      // Mundane armor direct fields mapping
      if (typeof item.armor_bonus === 'number') {
        effects.armorBonusTotal += item.armor_bonus;
      }
      if (typeof item.check_penalty === 'number') {
        effects.checkPenaltyTotal += item.check_penalty; // usually negative
      }
      // fumble die may appear as 'd4' vs '1d4'. Normalize to '1dX'. Prefer the largest die if multiple pieces provide one.
      const fdie = item.fumble_die || item.fumbleDie || itemEffects.fumble_die || itemEffects.fumbleDie;
      if (typeof fdie === 'string' && fdie !== '—' && fdie.trim().length > 0) {
        const normalized = fdie.trim().toLowerCase().startsWith('d') ? `1${fdie.trim().toLowerCase()}` : fdie.trim().toLowerCase();
        // Choose the worst (largest) die: compare by sides
        const currSides = effects.armorFumbleDie ? parseInt(effects.armorFumbleDie.replace(/[^\d]/g, ''), 10) : 0;
        const newSides = parseInt(normalized.replace(/[^\d]/g, ''), 10) || 0;
        if (!effects.armorFumbleDie || newSides > currSides) {
          effects.armorFumbleDie = normalized;
        }
      }

      // Attack bonus
      if (itemEffects.attackBonus) {
        effects.attackBonus += itemEffects.attackBonus;
      }

      // Damage bonus
      if (itemEffects.damageBonus) {
        effects.damageBonus += itemEffects.damageBonus;
      }

      // Movement bonus
      if (itemEffects.movementBonus) {
        effects.movementBonus += itemEffects.movementBonus;
      }

      // Ability modifiers
      if (itemEffects.strengthBonus) {
        effects.abilityModifiers.Strength += itemEffects.strengthBonus;
      }
      if (itemEffects.agilityBonus) {
        effects.abilityModifiers.Agility += itemEffects.agilityBonus;
      }
      if (itemEffects.staminaBonus) {
        effects.abilityModifiers.Stamina += itemEffects.staminaBonus;
      }
      if (itemEffects.personalityBonus) {
        effects.abilityModifiers.Personality += itemEffects.personalityBonus;
      }
      if (itemEffects.intelligenceBonus) {
        effects.abilityModifiers.Intelligence += itemEffects.intelligenceBonus;
      }
      if (itemEffects.luckBonus) {
        effects.abilityModifiers.Luck += itemEffects.luckBonus;
      }

      // Handle penalties (negative bonuses)
      if (itemEffects.strengthPenalty) {
        effects.abilityModifiers.Strength -= itemEffects.strengthPenalty;
      }
      if (itemEffects.agilityPenalty) {
        effects.abilityModifiers.Agility -= itemEffects.agilityPenalty;
      }
      if (itemEffects.staminaPenalty) {
        effects.abilityModifiers.Stamina -= itemEffects.staminaPenalty;
      }
      if (itemEffects.personalityPenalty) {
        effects.abilityModifiers.Personality -= itemEffects.personalityPenalty;
      }
      if (itemEffects.intelligencePenalty) {
        effects.abilityModifiers.Intelligence -= itemEffects.intelligencePenalty;
      }
      if (itemEffects.luckPenalty) {
        effects.abilityModifiers.Luck -= itemEffects.luckPenalty;
      }
    });

    // Calculate totals including base character stats
    const baseAC = 10 + (character.modifiers?.Agility || 0);
    const baseAttackBonus = character.modifiers?.Strength || 0;
    const baseDamageBonus = character.modifiers?.Strength || 0;

    // Include armor bonus from mundane armor plus any generic armorClass bonuses and agility boosts from gear
    effects.totalArmorClass = baseAC + effects.armorClass + effects.armorBonusTotal + effects.abilityModifiers.Agility;
    effects.totalAttackBonus = baseAttackBonus + effects.attackBonus + effects.abilityModifiers.Strength;
    effects.totalDamageBonus = baseDamageBonus + effects.damageBonus + effects.abilityModifiers.Strength;

    return effects;
  }, [character]);

  return gearEffects;
};

/**
 * Get modified ability scores including gear effects
 * @param {Object} character - Character object
 * @param {Object} gearEffects - Gear effects from useGearEffects
 * @returns {Object} Modified ability scores
 */
export const getModifiedAbilities = (character, gearEffects) => {
  if (!character || !character.abilities) return {};

  const modifiedAbilities = {};
  const modifiedModifiers = {};

  Object.keys(character.abilities).forEach(ability => {
    const baseScore = character.abilities[ability];
    const gearBonus = gearEffects.abilityModifiers[ability] || 0;
    const modifiedScore = baseScore + gearBonus;
    
    modifiedAbilities[ability] = modifiedScore;
    modifiedModifiers[ability] = Math.floor((modifiedScore - 10) / 2);
  });

  return {
    abilities: modifiedAbilities,
    modifiers: modifiedModifiers
  };
};

/**
 * Get equipped weapon damage including gear effects
 * @param {Object} character - Character object
 * @param {Object} gearEffects - Gear effects from useGearEffects
 * @returns {string} Weapon damage string (e.g., "1d8+2")
 */
export const getModifiedWeaponDamage = (character, gearEffects) => {
  if (!character) return "1d4";
  
  // Check for equipped weapons in gear slots
  const meleeWeapon = character.gearSlots?.meleeWeapon;
  const rangedWeapon = character.gearSlots?.rangedWeapon;
  const rightHand = character.gearSlots?.rightHand;
  
  let weaponDamage = "1d4"; // Default unarmed damage
  
  // Find equipped weapon
  const equippedWeapon = meleeWeapon || rangedWeapon || rightHand;
  if (equippedWeapon && equippedWeapon.effects && equippedWeapon.effects.damage) {
    weaponDamage = equippedWeapon.effects.damage;
  } else if (character.weapon && character.weapon.damage) {
    // Fallback to legacy weapon system
    weaponDamage = character.weapon.damage;
  }

  // Add damage bonus from gear
  const totalDamageBonus = gearEffects ? gearEffects.totalDamageBonus : 0;
  if (totalDamageBonus > 0) {
    return `${weaponDamage}+${totalDamageBonus}`;
  } else if (totalDamageBonus < 0) {
    return `${weaponDamage}${totalDamageBonus}`;
  }
  
  return weaponDamage;
};

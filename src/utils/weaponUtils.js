import weaponsData from '../data/weapons.json';

/**
 * Determines if a weapon is melee or ranged based on the weapons data
 * @param {Object} weapon - The weapon object
 * @returns {string} - 'meleeWeapon' or 'rangedWeapon'
 */
export const getWeaponSlot = (weapon) => {
  if (!weapon || !weapon.name) return 'meleeWeapon';
  
  try {
    // Check if weapon exists in melee weapons
    const isMelee = weaponsData.melee_weapons?.some(
      meleeWeapon => meleeWeapon.weapon?.toLowerCase() === weapon.name.toLowerCase()
    );
    
    if (isMelee) return 'meleeWeapon';
    
    // Check if weapon exists in ranged weapons
    const isRanged = weaponsData.ranged_weapons?.some(
      rangedWeapon => rangedWeapon.weapon?.toLowerCase() === weapon.name.toLowerCase()
    );
    
    if (isRanged) return 'rangedWeapon';
    
    // Default to melee if not found (for backwards compatibility)
    return 'meleeWeapon';
  } catch (error) {
    console.warn('Error determining weapon slot:', error);
    return 'meleeWeapon';
  }
};

/**
 * Creates a gear item from a weapon object
 * @param {Object} weapon - The weapon object
 * @returns {Object} - Gear item object
 */
export const weaponToGearItem = (weapon) => {
  if (!weapon || !weapon.name) return null;
  
  try {
    const slot = getWeaponSlot(weapon);
    const allWeapons = [
      ...(weaponsData.melee_weapons || []),
      ...(weaponsData.ranged_weapons || [])
    ];
    const weaponData = allWeapons.find(w => 
      w.weapon?.toLowerCase() === weapon.name.toLowerCase()
    );
    const costValueGp = weaponData?.cost ? parseInt(weaponData.cost.replace(/[^\d]/g, '')) || 0 : 0;
    const costCp = Math.round(costValueGp * 100);
    
    return {
      id: `weapon_${weapon.name.toLowerCase().replace(/\s+/g, '_')}`,
      name: weapon.name,
      slot: slot,
      cost_cp: costCp,
      rarity: "common",
      effects: {
        damage: weaponData?.damage || weapon.damage || "1d4",
        range: weaponData?.range || weapon.range || "-"
      },
      description: weaponData?.notes || `A ${weapon.name.toLowerCase()} weapon`,
      icon: slot === 'meleeWeapon' ? '⚔️' : '🏹'
    };
  } catch (error) {
    console.warn('Error creating gear item from weapon:', error);
    return null;
  }
};

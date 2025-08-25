import { useMemo } from 'react';
import { roll1d20 } from '../utils/diceUtils';
import { useGearEffects, getModifiedAbilities } from './useGearEffects';

export function useSkillChallenge(gameState) {
  const gearEffects = useGearEffects(gameState?.character);
  const modified = useMemo(() => (
    gameState?.character && gearEffects
      ? getModifiedAbilities(gameState.character, gearEffects)
      : null
  ), [gameState?.character, gearEffects]);

  function computeDC({ difficulty = 'standard', baseDC, level, gearAttackBonus }) {
    if (typeof baseDC === 'number') return baseDC;
    const baseByDiff = { easy: 10, standard: 12, hard: 14 };
    const base = baseByDiff[difficulty] ?? 12;
    const lvlAdj = Math.ceil((level || 0) / 2);
    const gearAdj = Math.floor((gearAttackBonus || 0) / 2);
    const dc = Math.min(20, Math.max(8, base + lvlAdj + gearAdj));
    return dc;
  }

  function getLevelProxy(character) {
    // If no explicit level, derive a proxy from positive ability mods
    const mods = modified?.modifiers || character?.modifiers || {};
    const vals = Object.values(mods).map(Number).filter(v => !Number.isNaN(v));
    const sumPos = vals.reduce((a, b) => a + (b > 0 ? b : 0), 0);
    return Math.max(0, sumPos); // simple proxy
  }

  function rollChallenge(challenge, characterOverride) {
    const character = characterOverride || gameState?.character;
    if (!challenge || !character) return null;

    const ability = challenge.ability;
    const abilityMod = modified?.modifiers ? (ability ? modified.modifiers[ability] : 0)
      : (character.modifiers ? (ability ? character.modifiers[ability] : 0) : 0);
    const level = character.level ?? getLevelProxy(character);
    const gearAttackBonus = gearEffects?.attackBonus || 0;

    const dc = computeDC({
      difficulty: challenge.difficulty || 'standard',
      baseDC: challenge.baseDC,
      level,
      gearAttackBonus
    });

    const raw = roll1d20();
    const total = raw + (abilityMod || 0);
    const success = total >= dc;

    const mods = success ? (challenge.onSuccessBossMods || {}) : (challenge.onFailureBossMods || {});

    return {
      raw,
      total,
      dc,
      success,
      ability,
      abilityMod: abilityMod || 0,
      appliedBossMods: mods
    };
  }

  return {
    computeDC,
    rollChallenge
  };
}

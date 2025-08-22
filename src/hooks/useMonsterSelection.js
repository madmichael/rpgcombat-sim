import { useState } from 'react';
import * as creatureTemplates from '../data/creatures.js';
import { rollDice } from '../utils/diceUtils.js';

export const useMonsterSelection = (gameState) => {
  const {
    selectedChallenge,
    monsterNames,
    character,
    setMonster,
    setMonsterHp,
    setFightStatus,
    setCombatLog,
    setWeapon,
    setSummary,
    setCharHp
  } = gameState;

  const selectRandomMonster = async () => {
    // Get challenge template array - now using basicCreatures only
    const templates = creatureTemplates.basicCreatures;
    if (!templates || templates.length === 0) {
      setSummary('No challenge templates available.');
      return;
    }
    if (monsterNames.length === 0) {
      setSummary('No monster names available.');
      return;
    }

    // Map challenge level to array index
    const challengeMapping = {
      'patheticCreatures': 0,
      'veryWeakCreatures': 1,
      'weakCreatures': 2,
      'standardCreatures': 3,
      'strongCreatures': 4,
      'veryStrongCreatures': 5,
      'extremeCreatures': 6
    };

    // Get specific template based on challenge level
    const templateIndex = challengeMapping[selectedChallenge] || 0;
    const template = templates[templateIndex];
    const entry = monsterNames[Math.floor(Math.random() * monsterNames.length)];

    // Find full monster data from JSON
    let monsterData = null;
    try {
      const monstersJson = await (await fetch('/data/dnd_srd_monsters_with_attacktype.json')).json();
      monsterData = monstersJson.find(m => m.name === (entry.name || entry));
    } catch (e) {
      monsterData = null;
    }

    // Roll HP using Hit Die from template and add base Hit Points value
    const rolledHp = rollDice(template["Hit Die"]) + template["Hit Points"];
    
    // Use monsterData fields, fallback to template if missing
    const mon = {
      name: monsterData && monsterData.name ? monsterData.name : (entry.name || entry),
      hp: rolledHp, // Use rolled HP (dice + base) instead of static value
      maxHp: rolledHp, // Store max HP for reference
      armor: monsterData && monsterData["Armor Class"] ? monsterData["Armor Class"] : template["Armor Class"],
      attack: monsterData && monsterData["Attack"] ? monsterData["Attack"] : template["Attack"],
      damage: monsterData && monsterData["Damage"] ? monsterData["Damage"] : template["Damage"],
      movement: monsterData && monsterData["Movement"] ? monsterData["Movement"] : template["Movement"],
      AttackType: monsterData && monsterData.AttackType && typeof monsterData.AttackType === 'string' && monsterData.AttackType.trim().length > 0
        ? monsterData.AttackType.trim()
        : (template.AttackType && typeof template.AttackType === 'string' && template.AttackType.trim().length > 0
            ? template.AttackType.trim()
            : undefined),
      challengeLevel: selectedChallenge,
      challengeLabel: getChallengeLabel(),
      ...template,
      hp: rolledHp, // Override any template HP with rolled value
      maxHp: rolledHp, // Store max HP for reference
      "Hit Points": `${rolledHp} (${template["Hit Die"]})` // Show rolled result with dice formula
    };

    setMonster(mon);
    setMonsterHp(rolledHp);
    setFightStatus('not started');
    setCombatLog([]);
    setWeapon(null);
    setSummary('');
    setCharHp(character ? character.hp : null);
  };

  const getChallengeLabel = () => {
    return selectedChallenge
      .replace(/Creatures$/, '')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/^./, s => s.toUpperCase())
      .trim();
  };

  const adjustChallenge = (direction) => {
    const challengeOrder = [
      'patheticCreatures',
      'veryWeakCreatures', 
      'weakCreatures',
      'standardCreatures',
      'strongCreatures',
      'veryStrongCreatures',
      'extremeCreatures'
    ];
    
    const currentIndex = challengeOrder.indexOf(selectedChallenge);
    let newIndex;
    
    if (direction === 'up') {
      newIndex = Math.min(currentIndex + 1, challengeOrder.length - 1);
    } else {
      newIndex = Math.max(currentIndex - 1, 0);
    }
    
    if (newIndex !== currentIndex) {
      const newChallenge = challengeOrder[newIndex];
      gameState.setSelectedChallenge(newChallenge);
      // Auto-generate new monster with the new challenge level
      setTimeout(() => selectRandomMonster(), 100);
      return true; // Challenge was changed
    }
    return false; // Challenge at min/max limit
  };

  return {
    selectRandomMonster,
    getChallengeLabel,
    adjustChallenge
  };
};

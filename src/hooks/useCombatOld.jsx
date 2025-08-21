import React, { useState } from 'react';
import { roll1d20, parseDamageString, rollDice, calculateAC, isRangedWeapon } from '../utils/diceUtils';
import { isFumble, getFumbleResult, applyFumbleEffect } from '../utils/fumbleUtils';

export const useCombat = (gameState, playSound) => {
  const [showLuckConfirmModal, setShowLuckConfirmModal] = useState(false);
  const [showLuckModal, setShowLuckModal] = useState(false);
  const [pendingAttack, setPendingAttack] = useState(null);
  const [luckToBurn, setLuckToBurn] = useState(1);
  const [monsterACRevealed, setMonsterACRevealed] = useState(false);
  const [characterEffects, setCharacterEffects] = useState({
    attackPenalty: 0,
    opponentAttackBonus: 0,
    halfDamage: false
  });
  const [monsterEffects, setMonsterEffects] = useState({
    attackPenalty: 0,
    opponentAttackBonus: 0,
    halfDamage: false
  });

  const {
    character,
    monster,
    weapon,
    combatLog,
    fightStatus,
    charHp,
    monsterHp,
    setCombatLog,
    setFightStatus,
    setSummary,
    setCharHp,
    setMonsterHp,
    setCharacter
  } = gameState;

  const rollInitiative = () => {
    const charInitRoll = roll1d20() + (character.modifiers ? character.modifiers['Agility'] : 0);
    const monsterInitRoll = roll1d20();
    
    if (charInitRoll === monsterInitRoll) {
      // Handle ties with rerolls
      let tie = true;
      let rerollChar, rerollMonster;
      while (tie) {
        rerollChar = roll1d20() + (character.modifiers ? character.modifiers['Agility'] : 0);
        rerollMonster = roll1d20();
        if (rerollChar !== rerollMonster) {
          tie = false;
        }
      }
      return {
        charRoll: charInitRoll,
        monsterRoll: monsterInitRoll,
        winner: rerollChar > rerollMonster ? 'character' : 'monster'
      };
    }
    
    return {
      charRoll: charInitRoll,
      monsterRoll: monsterInitRoll,
      winner: charInitRoll > monsterInitRoll ? 'character' : 'monster'
    };
  };

  const performMonsterAttack = () => {
    const rawMonsterRoll = roll1d20();
    const attackBonus = 0; // Could be extracted from monster data
    
    // Apply monster attack penalty from fumbles and bonus from character fumbles
    const attackPenalty = monsterEffects.attackPenalty;
    const opponentBonus = characterEffects.opponentAttackBonus;
    const monsterAttackRoll = rawMonsterRoll + attackBonus + attackPenalty + opponentBonus;
    
    // Clear monster attack penalty after use
    if (monsterEffects.attackPenalty !== 0) {
      setMonsterEffects(prev => ({ ...prev, attackPenalty: 0 }));
    }
    
    // Clear character opponent attack bonus after use (from character fumbles)
    if (characterEffects.opponentAttackBonus !== 0) {
      setCharacterEffects(prev => ({ ...prev, opponentAttackBonus: 0 }));
    }
    
    // Check for monster fumble (natural 1)
    let fumbleResult = null;
    if (isFumble(rawMonsterRoll)) {
      fumbleResult = getFumbleResult("no_armor", 0); // Monsters have no luck modifier
    }
    
    let monsterDmg = parseDamageString(monster.damage);
    let monsterCritical = false;
    
    // Apply half damage effect if active
    if (monsterEffects.halfDamage) {
      monsterDmg = Math.max(1, Math.floor(monsterDmg / 2));
    }
    
    if (rawMonsterRoll === 20) {
      monsterCritical = true;
      monsterDmg += parseDamageString(monster.damage); // Double damage for crit
    }
    
    const playerAC = calculateAC(character);
    const monsterHit = monsterAttackRoll >= playerAC && !fumbleResult; // Fumbles always miss
    const newCharHp = monsterHit ? (charHp !== null ? charHp : character.hp) - monsterDmg : (charHp !== null ? charHp : character.hp);
    
    // Determine attack type
    let attackType = '';
    if (monster.AttackType && typeof monster.AttackType === 'string' && monster.AttackType.trim().length > 0) {
      attackType = monster.AttackType.trim();
    } else {
      attackType = 'Weapon';
    }
    
    const rollFormula = attackBonus !== 0 ? `${rawMonsterRoll}${attackBonus >= 0 ? '+' : ''}${attackBonus} (${monsterAttackRoll})` : `${monsterAttackRoll}`;
    
    let attackMessage;
    if (fumbleResult) {
      attackMessage = `${monster.name} uses ${attackType} and rolls a ${rollFormula} vs. AC ${playerAC} and FUMBLES! Rolled ${fumbleResult.rawRoll} on ${fumbleResult.fumbleDie} (adjusted ${fumbleResult.adjustedRoll}): ${fumbleResult.result}`;
      
      // Apply monster fumble effects
      const fumbleEffects = applyFumbleEffect(fumbleResult, monster, null);
      fumbleEffects.forEach(effect => {
        if (effect.type === 'attack_penalty') {
          setMonsterEffects(prev => ({ ...prev, attackPenalty: effect.value }));
        } else if (effect.type === 'opponent_attack_bonus') {
          setMonsterEffects(prev => ({ ...prev, opponentAttackBonus: effect.value }));
        } else if (effect.type === 'half_damage') {
          setMonsterEffects(prev => ({ ...prev, halfDamage: true }));
        }
      });
      
      playSound('danger');
    } else if (monsterHit) {
      playSound('monsterAttack');
      if (monsterCritical) {
        attackMessage = `${monster.name} uses ${attackType} and rolls a ${rollFormula} vs. AC ${playerAC} and scores a CRITICAL HIT on ${character.name} for ${monsterDmg} damage (${Math.max(newCharHp, 0)} HP left)`;
      } else {
        attackMessage = `${monster.name} uses ${attackType} and rolls a ${rollFormula} vs. AC ${playerAC} and hits ${character.name} for ${monsterDmg} damage (${Math.max(newCharHp, 0)} HP left)`;
      }
    } else {
      attackMessage = `${monster.name} uses ${attackType} and rolls a ${rollFormula} vs. AC ${playerAC} and misses!`;
    }
    
    return { attackMessage, newCharHp, hit: monsterHit };
  };

  const performCharacterAttack = () => {
    const rawAttackRoll = roll1d20();
    const isRanged = isRangedWeapon(weapon.name);
    const abilityType = isRanged ? 'Agility' : 'Strength';
    const abilityMod = character.modifiers ? character.modifiers[abilityType] : 0;
    
    // Apply character attack penalty from fumbles
    const attackPenalty = characterEffects.attackPenalty;
    const charAttackRoll = rawAttackRoll + abilityMod + attackPenalty;
    
    // Clear character attack penalty after use
    if (characterEffects.attackPenalty !== 0) {
      setCharacterEffects(prev => ({ ...prev, attackPenalty: 0 }));
    }
    
    // Check for fumble (natural 1)
    let fumbleResult = null;
    if (isFumble(rawAttackRoll)) {
      const luckMod = character.modifiers ? character.modifiers['Luck'] : 0;
      fumbleResult = getFumbleResult("no_armor", luckMod);
    }
    
    const charDmgStr = weapon.dmg.split('/')[0]; // Use first damage value
    let charDmg = rollDice(charDmgStr);
    if (charDmg < 1) charDmg = 1;
    
    // Apply half damage effect if active
    if (characterEffects.halfDamage) {
      charDmg = Math.max(1, Math.floor(charDmg / 2));
    }
    
    let charCritical = false;
    if (rawAttackRoll === 20) {
      charCritical = true;
      let critDmg = rollDice(charDmgStr);
      if (critDmg < 1) critDmg = 1;
      charDmg += critDmg; // Double damage for crit
    }
    
    const monsterAC = Number(monster["Armor Class"]);
    const charHit = charAttackRoll >= monsterAC && !fumbleResult; // Fumbles always miss
    
    return {
      rawAttackRoll,
      charAttackRoll,
      charDmg,
      charCritical,
      charHit,
      abilityType,
      abilityMod,
      monsterAC,
      fumbleResult
    };
  };

  const startFight = () => {
    const initiative = rollInitiative();
    setFightStatus('in progress');
    
    const monsterAC = Number(monster["Armor Class"]);
    const playerAC = calculateAC(character);
    
    let newLog = [];
    newLog.push(`Fight started between ${character.name} (AC: ${playerAC}) and ${monster.name} (AC: ${monsterAC})!`);
    newLog.push(`Initiative: ${character.name} rolls ${initiative.charRoll} (d20 + Agility), ${monster.name} rolls ${initiative.monsterRoll} (d20). ${initiative.winner === 'character' ? character.name + ' goes first.' : monster.name + ' goes first.'}`);
    
    setCombatLog(newLog);
    
    if (initiative.winner === 'monster') {
      const { attackMessage, newCharHp } = performMonsterAttack();
      newLog.push(attackMessage);
      setCharHp(newCharHp);
      setCombatLog([...newLog]);
      
      if (newCharHp <= 0) {
        const summaryMessage = `${monster.name} has vanguished ${character.name}. Perhaps another character will have better luck.`;
        setCombatLog(prev => [...prev, { 
          type: 'summary', 
          message: summaryMessage,
          timestamp: new Date().toLocaleTimeString()
        }]);
        setFightStatus('finished');
        setSummary(summaryMessage);
        playSound('gong');
        return;
      }
    }
  };

  const continueFight = () => {
    if (monsterHp === 0) {
      const summaryMessage = `${character.name} has defeated ${monster.name} in glorious combat.`;
      setCombatLog(prev => [...prev, { 
        type: 'summary', 
        message: summaryMessage,
        timestamp: new Date().toLocaleTimeString()
      }]);
      setSummary(summaryMessage);
      setFightStatus('finished');
      return;
    }

    const attackResult = performCharacterAttack();
    const { rawAttackRoll, charAttackRoll, charDmg, charCritical, charHit, abilityType, abilityMod, monsterAC, fumbleResult } = attackResult;
    
    // Reveal Monster AC on first successful hit
    if (charHit && !monsterACRevealed) {
      setMonsterACRevealed(true);
    }

    const diff = monsterAC - charAttackRoll;
    if (!charHit && diff > 0 && diff <= character.Luck) {
      setShowLuckConfirmModal(true);
      setPendingAttack({ rawAttackRoll, charAttackRoll, diff, charDmg, abilityType });
      return;
    }

    let currentMonsterHp = monsterHp !== null && !isNaN(Number(monsterHp)) ? Number(monsterHp) : (monster.hp !== undefined && !isNaN(Number(monster.hp)) ? Number(monster.hp) : 0);
    let newMonsterHp = charHit ? Number(currentMonsterHp) - Number(charDmg) : Number(currentMonsterHp);
    
    const modSign = abilityMod >= 0 ? '+' : '';
    let charAttack;
    let displayHp;
    
    // Handle fumble first
    if (fumbleResult) {
      displayHp = currentMonsterHp > 0 ? currentMonsterHp : (monster["Hit Points"] || monster.hp || 1);
      charAttack = `${character.name} attacks ${monster.name} with ${weapon.name} and rolls a ${rawAttackRoll} ${modSign}${abilityMod} (${abilityType}) = ${charAttackRoll} vs. AC ${monsterAC} and FUMBLES! Rolled ${fumbleResult.rawRoll} on ${fumbleResult.fumbleDie} (adjusted ${fumbleResult.adjustedRoll}): ${fumbleResult.result}`;
      
      // Apply fumble effects
      const fumbleEffects = applyFumbleEffect(fumbleResult, character, weapon);
      fumbleEffects.forEach(effect => {
        if (effect.type === 'self_damage') {
          const newCharHp = Math.max(0, (charHp !== null ? charHp : character.hp) - effect.value);
          setCharHp(newCharHp);
          charAttack += ` (${character.name} takes ${effect.value} damage!)`;
        } else if (effect.type === 'attack_penalty') {
          setCharacterEffects(prev => ({ ...prev, attackPenalty: effect.value }));
        } else if (effect.type === 'opponent_attack_bonus') {
          setCharacterEffects(prev => ({ ...prev, opponentAttackBonus: effect.value }));
        } else if (effect.type === 'half_damage') {
          setCharacterEffects(prev => ({ ...prev, halfDamage: true }));
        }
      });
      
      if (currentMonsterHp > 0) setMonsterHp(displayHp);
      playSound('danger');
    } else if (charHit) {
      const updatedMonsterHp = Math.max(0, newMonsterHp);
      displayHp = updatedMonsterHp;
      charAttack = charCritical
        ? `${character.name} attacks ${monster.name} with ${weapon.name} and rolls a ${rawAttackRoll} ${modSign}${abilityMod} (${abilityType}) = ${charAttackRoll} vs. AC ${monsterAC} and hits for ${charDmg} damage (${displayHp} HP left) - CRITICAL HIT!`
        : `${character.name} attacks ${monster.name} with ${weapon.name} and rolls a ${rawAttackRoll} ${modSign}${abilityMod} (${abilityType}) = ${charAttackRoll} vs. AC ${monsterAC} and hits for ${charDmg} damage (${displayHp} HP left)`;
      setMonsterHp(updatedMonsterHp);
      playSound('slash');
    } else {
      displayHp = currentMonsterHp > 0 ? currentMonsterHp : (monster["Hit Points"] || monster.hp || 1);
      charAttack = `${character.name} attacks ${monster.name} with ${weapon.name} and rolls a ${rawAttackRoll} ${modSign}${abilityMod} (${abilityType}) = ${charAttackRoll} vs. AC ${monsterAC} and misses! (${displayHp} HP left)`;
      if (currentMonsterHp > 0) setMonsterHp(displayHp);
      playSound('block');
    }
    
    let newLog = [...combatLog, charAttack];
    setCombatLog(newLog);
    
    if (newMonsterHp <= 0) {
      const summaryMessage = `${character.name} has defeated ${monster.name} in glorious combat.`;
      setCombatLog(prev => [...prev, { 
        type: 'summary', 
        message: summaryMessage,
        timestamp: new Date().toLocaleTimeString()
      }]);
      setFightStatus('finished');
      setSummary(summaryMessage);
      playSound('victory');
      return;
    }

    // Monster attacks after delay
    setTimeout(() => {
      const { attackMessage, newCharHp } = performMonsterAttack();
      let delayedLog = [...newLog, attackMessage];
      setCharHp(newCharHp);
      setCombatLog(delayedLog);
      
      if (newCharHp <= 0) {
        const summaryMessage = `${monster.name} has vanguished ${character.name}. Perhaps another character will have better luck.`;
        setCombatLog(prev => [...prev, { 
          type: 'summary', 
          message: summaryMessage,
          timestamp: new Date().toLocaleTimeString()
        }]);
        setFightStatus('finished');
        setSummary(summaryMessage);
        return;
      }
    }, 900);
  };

  const handleLuckConfirmYes = () => {
    setShowLuckConfirmModal(false);
    setShowLuckModal(true);
    setLuckToBurn(1);
  };

  const handleLuckConfirmNo = () => {
    setShowLuckConfirmModal(false);
    // Continue with the original missed attack
    if (!pendingAttack) return;
    
    const abilityMod = character.modifiers ? (pendingAttack.abilityType ? character.modifiers[pendingAttack.abilityType] : 0) : 0;
    const modSign = abilityMod >= 0 ? '+' : '';
    const charAttack = `${character.name} attacks ${monster.name} with ${weapon.name} and rolls a ${pendingAttack.rawAttackRoll} ${modSign}${abilityMod} (${pendingAttack.abilityType}) = ${pendingAttack.charAttackRoll} vs. AC ${monster["Armor Class"]} and misses!`;
    
    setCombatLog(prev => [...prev, charAttack]);
    setPendingAttack(null);
    
    // Continue with monster's turn
    setTimeout(() => {
      const monsterAttackResult = performMonsterAttack();
      if (monsterAttackResult) {
        setCombatLog(prev => [...prev, monsterAttackResult.attack]);
        
        if (monsterAttackResult.newCharHp <= 0) {
          const summaryMessage = `${character.name} has been vanguished by ${monster.name}.`;
          setCombatLog(prev => [...prev, { 
            type: 'summary', 
            message: summaryMessage,
            timestamp: new Date().toLocaleTimeString()
          }]);
          setSummary(summaryMessage);
          setFightStatus('finished');
        }
      }
    }, 1000);
  };

  const burnLuck = (amount) => {
    if (!pendingAttack || !character) return;
    
    let newLuck = character.Luck - amount;
    const abilityMod = character.modifiers ? (pendingAttack.abilityType ? character.modifiers[pendingAttack.abilityType] : 0) : 0;
    const modSign = abilityMod >= 0 ? '+' : '';
    const newAttackRoll = pendingAttack.rawAttackRoll + abilityMod + amount;
    const monsterAC = Number(monster["Armor Class"]);
    const charHit = newAttackRoll >= monsterAC;
    
    let currentMonsterHp = monsterHp !== null && !isNaN(Number(monsterHp)) ? Number(monsterHp) : (monster.hp !== undefined && !isNaN(Number(monster.hp)) ? Number(monster.hp) : 0);
    let charAttack;
    let charCritical = pendingAttack.rawAttackRoll === 20;
    let charDmg = pendingAttack.charDmg;
    let newMonsterHp = currentMonsterHp;
    
    if (charCritical && charHit) {
      charDmg += pendingAttack.charDmg;
      newMonsterHp = Number(newMonsterHp) - charDmg;
      const displayHp = newMonsterHp < 0 ? 0 : newMonsterHp;
      charAttack = `${character.name} burns ${amount} Luck and attacks ${monster.name} with ${weapon.name} and rolls a ${pendingAttack.rawAttackRoll} ${modSign}${abilityMod} +${amount} (${pendingAttack.abilityType}) = ${newAttackRoll} vs. AC ${monsterAC} and hits for ${charDmg} damage (${displayHp} HP left) - CRITICAL HIT!`;
    } else if (charHit) {
      newMonsterHp = Number(newMonsterHp) - charDmg;
      const displayHp = newMonsterHp < 0 ? 0 : newMonsterHp;
      charAttack = `${character.name} burns ${amount} Luck and attacks ${monster.name} with ${weapon.name} and rolls a ${pendingAttack.rawAttackRoll} ${modSign}${abilityMod} +${amount} (${pendingAttack.abilityType}) = ${newAttackRoll} vs. AC ${monsterAC} and hits for ${charDmg} damage (${displayHp} HP left)`;
    } else {
      charAttack = `${character.name} burns ${amount} Luck and attacks ${monster.name} with ${weapon.name} and rolls a ${pendingAttack.rawAttackRoll} ${modSign}${abilityMod} +${amount} (${pendingAttack.abilityType}) = ${newAttackRoll} vs. AC ${monsterAC} and misses!`;
    }
    
    if (newLuck < 0) newLuck = 0;
    setCharacter({ 
      ...character, 
      Luck: newLuck,
      originalLuck: character.originalLuck || character.Luck
    });
    setMonsterHp(newMonsterHp);
    setShowLuckModal(false);
    setPendingAttack(null);
    
    // Add combat log entries
    if (!charHit) {
      setCombatLog(prev => [...prev, charAttack, "Sorry, Luck is not with you this time."]);
    } else {
      setCombatLog(prev => [...prev, charAttack]);
    }
    
    // Check if monster is defeated
    if (newMonsterHp <= 0) {
      const summaryMessage = `${character.name} has defeated ${monster.name} in glorious combat.`;
      setCombatLog(prev => [...prev, { 
        type: 'summary', 
        message: summaryMessage,
        timestamp: new Date().toLocaleTimeString()
      }]);
      setFightStatus('finished');
      setSummary(summaryMessage);
      playSound('victory');
      return;
    }

  const startFight = () => {
    if (!character || !monster || !weapon) return;
    
    setFightStatus('in progress');
    setCharHp(character.hp);
    setMonsterHp(monster.hp);
    setSummary('');
    setMonsterACRevealed(false); // Reset AC revelation for new fight
    
    const { charInitiative, monsterInitiative, initiativeMessage } = rollInitiative();
    setCombatLog([initiativeMessage]);
    
    if (charInitiative) {
      // Character goes first - they attack immediately
      setTimeout(() => continueFight(), 1000);
    } else {
      // Monster goes first
      setTimeout(() => {
        const monsterAttackResult = performMonsterAttack();
        if (monsterAttackResult) {
          setCombatLog(prev => [...prev, monsterAttackResult.attack]);
          
          if (monsterAttackResult.newCharHp <= 0) {
            const summaryMessage = `${character.name} has been vanguished by ${monster.name}.`;
            setCombatLog(prev => [...prev, { 
              type: 'summary', 
              message: summaryMessage,
              timestamp: new Date().toLocaleTimeString()
            }]);
            setSummary(summaryMessage);
            setFightStatus('finished');
          }
        }
      }, 1000);
    }
  };

  const runAway = () => {
    const summaryMessage = `${character.name} ran away from the fight.`;
    setCombatLog(prev => [...prev, { 
      type: 'summary', 
      message: summaryMessage,
      timestamp: new Date().toLocaleTimeString()
    }]);
    playSound('danger');
    setFightStatus('ran away');
    setSummary(summaryMessage);
  };

  return {
    showLuckConfirmModal,
    setShowLuckConfirmModal,
    showLuckModal,
    setShowLuckModal,
    pendingAttack,
    setPendingAttack,
    luckToBurn,
    setLuckToBurn,
    handleLuckConfirmYes,
    handleLuckConfirmNo,
    monsterACRevealed,
    setMonsterACRevealed,
    startFight,
    continueFight,
    burnLuck,
    runAway
  };
};

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
        charInitiative: rerollChar > rerollMonster,
        monsterInitiative: rerollMonster > rerollChar,
        initiativeMessage: `Initiative tie! ${character.name} rerolls ${rerollChar}, ${monster.name} rerolls ${rerollMonster}. ${rerollChar > rerollMonster ? character.name : monster.name} goes first!`
      };
    }
    
    return {
      charInitiative: charInitRoll > monsterInitRoll,
      monsterInitiative: monsterInitRoll > charInitRoll,
      initiativeMessage: `Initiative: ${character.name} rolls ${charInitRoll}, ${monster.name} rolls ${monsterInitRoll}. ${charInitRoll > monsterInitRoll ? character.name : monster.name} goes first!`
    };
  };

  const performCharacterAttack = () => {
    const rawAttackRoll = roll1d20();
    const abilityType = isRangedWeapon(weapon.name) ? 'Agility' : 'Strength';
    const abilityMod = character.modifiers ? character.modifiers[abilityType] : 0;
    const charAttackRoll = rawAttackRoll + abilityMod + characterEffects.opponentAttackBonus;
    const monsterAC = Number(monster["Armor Class"]) + monsterEffects.attackPenalty;
    const charHit = charAttackRoll >= monsterAC;
    const charCritical = rawAttackRoll === 20;

    let fumbleResult = null;
    if (isFumble(rawAttackRoll, weapon)) {
      fumbleResult = getFumbleResult();
    }

    let charDmg = 0;
    let damageBreakdown = "";
    if (charHit && !fumbleResult) {
      const damageResult = parseDamageString(weapon.damage);
      charDmg = damageResult.damage;
      damageBreakdown = damageResult.breakdown;
      
      if (charCritical) {
        const critDamageResult = parseDamageString(weapon.damage);
        charDmg += critDamageResult.damage;
        damageBreakdown += ` + ${critDamageResult.breakdown} (crit)`;
      }
      if (characterEffects.halfDamage) {
        charDmg = Math.floor(charDmg / 2);
        damageBreakdown += ` (halved)`;
      }
    }

    return {
      rawAttackRoll,
      charAttackRoll,
      charDmg,
      charCritical,
      charHit,
      abilityType,
      abilityMod,
      monsterAC,
      fumbleResult,
      damageBreakdown
    };
  };

  const performMonsterAttack = () => {
    if (!monster || !monster.Attack || !monster.Damage) return null;

    // Parse attack bonus from Attack string (e.g., "+2" or "Weapon +4 melee")
    const attackStr = monster.Attack.toString();
    const attackBonus = parseInt(attackStr.match(/[+-]\d+/)?.[0] || '0');
    
    const rawAttackRoll = roll1d20();
    const monsterAttackRoll = rawAttackRoll + attackBonus + monsterEffects.opponentAttackBonus;
    const charAC = calculateAC(character) + characterEffects.attackPenalty;
    const monsterHit = monsterAttackRoll >= charAC;
    const monsterCritical = rawAttackRoll === 20;

    let monsterDmg = 0;
    let monsterDamageBreakdown = "";
    if (monsterHit) {
      const damageResult = parseDamageString(monster.Damage);
      monsterDmg = damageResult.damage;
      monsterDamageBreakdown = damageResult.breakdown;
      
      if (monsterCritical) {
        const critDamageResult = parseDamageString(monster.Damage);
        monsterDmg += critDamageResult.damage;
        monsterDamageBreakdown += ` + ${critDamageResult.breakdown} (crit)`;
      }
      if (monsterEffects.halfDamage) {
        monsterDmg = Math.floor(monsterDmg / 2);
        monsterDamageBreakdown += ` (halved)`;
      }
    }

    const currentCharHp = charHp !== null ? charHp : character.hp;
    const newCharHp = monsterHit ? Math.max(0, currentCharHp - monsterDmg) : currentCharHp;
    
    if (monsterHit) {
      setCharHp(newCharHp);
    }

    const attackMessage = monsterHit
      ? `${monster.name} attacks ${character.name} and rolls ${rawAttackRoll} + ${attackBonus} = ${monsterAttackRoll} vs. AC ${charAC} and hits for ${monsterDmg} damage [${monsterDamageBreakdown}]${monsterCritical ? ' - CRITICAL HIT!' : ''} (${newCharHp} HP left)`
      : `${monster.name} attacks ${character.name} and rolls ${rawAttackRoll} + ${attackBonus} = ${monsterAttackRoll} vs. AC ${charAC} and misses!`;

    return {
      attack: attackMessage,
      newCharHp,
      monsterHit,
      monsterDmg
    };
  };

  const startFight = () => {
    if (!character || !monster || !weapon) return;
    
    setFightStatus('in progress');
    setCharHp(character.hp);
    setMonsterHp(monster.hp);
    setSummary('');
    setMonsterACRevealed(false);
    
    const { charInitiative, monsterInitiative, initiativeMessage } = rollInitiative();
    setCombatLog([initiativeMessage]);
    
    if (charInitiative) {
      setTimeout(() => continueFight(), 1000);
    } else {
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

  const continueFight = () => {
    if (fightStatus === 'finished') {
      const summaryMessage = `${character.name} ran away from the fight.`;
      setCombatLog(prev => [...prev, { 
        type: 'summary', 
        message: summaryMessage,
        timestamp: new Date().toLocaleTimeString()
      }]);
      setFightStatus('finished');
      setSummary(summaryMessage);
      return;
    }

    const attackResult = performCharacterAttack();
    const { rawAttackRoll, charAttackRoll, charDmg, charCritical, charHit, abilityType, abilityMod, monsterAC, fumbleResult, damageBreakdown } = attackResult;
    
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

    // Process normal attack (hit or miss without luck)
    processAttackResult(attackResult);
  };

  const processAttackResult = (attackResult) => {
    const { rawAttackRoll, charAttackRoll, charDmg, charCritical, charHit, abilityType, abilityMod, monsterAC, fumbleResult, damageBreakdown } = attackResult;
    
    let currentMonsterHp = monsterHp !== null && !isNaN(Number(monsterHp)) ? Number(monsterHp) : (monster.hp !== undefined && !isNaN(Number(monster.hp)) ? Number(monster.hp) : 0);
    let newMonsterHp = charHit ? Number(currentMonsterHp) - Number(charDmg) : Number(currentMonsterHp);
    
    const modSign = abilityMod >= 0 ? '+' : '';
    let charAttack;
    let displayHp;
    
    if (fumbleResult) {
      displayHp = currentMonsterHp > 0 ? currentMonsterHp : (monster["Hit Points"] || monster.hp || 1);
      charAttack = `${character.name} attacks ${monster.name} with ${weapon.name} and rolls a ${rawAttackRoll} ${modSign}${abilityMod} (${abilityType}) = ${charAttackRoll} vs. AC ${monsterACRevealed ? monsterAC : '?'} and FUMBLES! Rolled ${fumbleResult.rawRoll} on ${fumbleResult.fumbleDie} (adjusted ${fumbleResult.adjustedRoll}): ${fumbleResult.result}`;
      
      const fumbleEffects = applyFumbleEffect(fumbleResult, character, weapon);
      fumbleEffects.forEach(effect => {
        if (effect.type === 'self_damage') {
          const newCharHp = Math.max(0, (charHp !== null ? charHp : character.hp) - effect.value);
          setCharHp(newCharHp);
          charAttack += ` (${character.name} takes ${effect.value} damage!)`;
        } else if (effect.type === 'attack_penalty') {
          setCharacterEffects(prev => ({ ...prev, attackPenalty: effect.value }));
          charAttack += ` (${character.name} suffers ${effect.value} penalty to next attack!)`;
        }
      });
      
      if (currentMonsterHp > 0) setMonsterHp(displayHp);
      playSound('danger');
    } else if (charHit) {
      const updatedMonsterHp = Math.max(0, newMonsterHp);
      displayHp = updatedMonsterHp;
      charAttack = charCritical
        ? `${character.name} attacks ${monster.name} with ${weapon.name} and rolls a ${rawAttackRoll} ${modSign}${abilityMod} (${abilityType}) = ${charAttackRoll} vs. AC ${monsterACRevealed ? monsterAC : '?'} and hits for ${charDmg} damage [${damageBreakdown}] (${displayHp} HP left) - CRITICAL HIT!`
        : `${character.name} attacks ${monster.name} with ${weapon.name} and rolls a ${rawAttackRoll} ${modSign}${abilityMod} (${abilityType}) = ${charAttackRoll} vs. AC ${monsterACRevealed ? monsterAC : '?'} and hits for ${charDmg} damage [${damageBreakdown}] (${displayHp} HP left)`;
      setMonsterHp(updatedMonsterHp);
      playSound('slash');
    } else {
      displayHp = currentMonsterHp > 0 ? currentMonsterHp : (monster["Hit Points"] || monster.hp || 1);
      charAttack = `${character.name} attacks ${monster.name} with ${weapon.name} and rolls a ${rawAttackRoll} ${modSign}${abilityMod} (${abilityType}) = ${charAttackRoll} vs. AC ${monsterACRevealed ? monsterAC : '?'} and misses! (${displayHp} HP left)`;
      if (currentMonsterHp > 0) setMonsterHp(displayHp);
      playSound('block');
    }
      
    setCombatLog(prev => [...prev, charAttack]);
      
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

  const handleLuckConfirmYes = () => {
    setShowLuckConfirmModal(false);
    setShowLuckModal(true);
    setLuckToBurn(1);
  };

  const handleLuckConfirmNo = () => {
    setShowLuckConfirmModal(false);
    if (!pendingAttack) return;
    
    const abilityMod = character.modifiers ? (pendingAttack.abilityType ? character.modifiers[pendingAttack.abilityType] : 0) : 0;
    const modSign = abilityMod >= 0 ? '+' : '';
    const charAttack = `${character.name} attacks ${monster.name} with ${weapon.name} and rolls a ${pendingAttack.rawAttackRoll} ${modSign}${abilityMod} (${pendingAttack.abilityType}) = ${pendingAttack.charAttackRoll} vs. AC ${monsterACRevealed ? monster["Armor Class"] : '?'} and misses!`;
    
    setCombatLog(prev => [...prev, charAttack]);
    setPendingAttack(null);
    
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
    let charDmg = 0;
    let charDamageBreakdown = "";
    if (charHit) {
      const damageResult = parseDamageString(weapon.damage);
      charDmg = damageResult.damage;
      charDamageBreakdown = damageResult.breakdown;
    }
    let newMonsterHp = currentMonsterHp;
    
    // Reveal Monster AC on successful luck burn hit
    if (charHit && !monsterACRevealed) {
      setMonsterACRevealed(true);
    }
    
    if (charCritical && charHit) {
      const critDamageResult = parseDamageString(weapon.damage);
      charDmg += critDamageResult.damage;
      charDamageBreakdown += ` + ${critDamageResult.breakdown} (crit)`;
      newMonsterHp = Number(newMonsterHp) - charDmg;
      const displayHp = newMonsterHp < 0 ? 0 : newMonsterHp;
      charAttack = `${character.name} burns ${amount} Luck and attacks ${monster.name} with ${weapon.name} and rolls a ${pendingAttack.rawAttackRoll} ${modSign}${abilityMod} +${amount} (${pendingAttack.abilityType}) = ${newAttackRoll} vs. AC ${monsterACRevealed ? monsterAC : '?'} and hits for ${charDmg} damage [${charDamageBreakdown}] (${displayHp} HP left) - CRITICAL HIT!`;
    } else if (charHit) {
      newMonsterHp = Number(newMonsterHp) - charDmg;
      const displayHp = newMonsterHp < 0 ? 0 : newMonsterHp;
      charAttack = `${character.name} burns ${amount} Luck and attacks ${monster.name} with ${weapon.name} and rolls a ${pendingAttack.rawAttackRoll} ${modSign}${abilityMod} +${amount} (${pendingAttack.abilityType}) = ${newAttackRoll} vs. AC ${monsterACRevealed ? monsterAC : '?'} and hits for ${charDmg} damage [${charDamageBreakdown}] (${displayHp} HP left)`;
    } else {
      charAttack = `${character.name} burns ${amount} Luck and attacks ${monster.name} with ${weapon.name} and rolls a ${pendingAttack.rawAttackRoll} ${modSign}${abilityMod} +${amount} (${pendingAttack.abilityType}) = ${newAttackRoll} vs. AC ${monsterACRevealed ? monsterAC : '?'} and misses!`;
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
    
    if (!charHit) {
      setCombatLog(prev => [...prev, charAttack, "Sorry, Luck is not with you this time."]);
    } else {
      setCombatLog(prev => [...prev, charAttack]);
    }
    
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

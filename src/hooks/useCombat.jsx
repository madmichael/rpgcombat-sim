import { useState, useEffect } from 'react';
import { roll1d20, roll1d6, parseDamageString, isRangedWeapon, isFumble, getFumbleResult, calculateAC } from '../utils/diceUtils';
import { useAudio } from './useAudio';
import { useVictoryTracking } from './useVictoryTracking';
// import tradeGoodsData from '../data/tradeGoods.json';

export const useCombat = (gameState, playSound, victoryTracking, achievementTracking) => {
  const { recordVictory, recordDefeat } = victoryTracking || useVictoryTracking();
  const [tradeGoodsData, setTradeGoodsData] = useState(null);

  // Load trade goods data on mount
  useEffect(() => {
    async function loadTradeGoods() {
      try {
        const response = await fetch('/data/tradeGoods.json');
        const data = await response.json();
        setTradeGoodsData(data);
      } catch (error) {
        console.error('Failed to load trade goods data:', error);
      }
    }
    loadTradeGoods();
  }, []);
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
    halfDamage: false,
    skipNextAction: false
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

  const applyFumbleEffect = (fumbleResult, character, weapon) => {
    const effects = [];
    
    // Parse fumble result to determine effects
    const result = fumbleResult.result.toLowerCase();
    
    if (result.includes('strikes themselves') || result.includes('accidentally strikes themselves')) {
      // Self-damage effect
      const damageResult = parseDamageString(weapon.dmg || weapon.damage || '1d4');
      effects.push({
        type: 'self_damage',
        value: damageResult.damage
      });
    } else if (result.includes('drops') && result.includes('weapon')) {
      // Skip next attack (weapon dropped)
      effects.push({
        type: 'skip_next_attack',
        value: 1
      });
    } else if (result.includes('falls prone') || result.includes('trips')) {
      // Skip next attack (fallen prone)
      effects.push({
        type: 'skip_next_attack',
        value: 1
      });
    }
    
    return effects;
  };

  const performCharacterAttack = () => {
    const rawAttackRoll = roll1d20();
    const abilityType = isRangedWeapon(weapon.name) ? 'Agility' : 'Strength';
    const abilityMod = character.modifiers ? character.modifiers[abilityType] : 0;
    const charAttackRoll = rawAttackRoll + abilityMod + characterEffects.opponentAttackBonus;
    const monsterAC = Number(monster["Armor Class"]) + monsterEffects.attackPenalty;
    const charHit = charAttackRoll >= monsterAC;
    const charCritical = rawAttackRoll === 20;
    
    // Track achievements
    if (achievementTracking) {
      if (charCritical) {
        achievementTracking.recordCriticalHit();
      } else {
        achievementTracking.recordNonCriticalHit();
      }
    }

    let fumbleResult = null;
    if (isFumble(rawAttackRoll, weapon)) {
      fumbleResult = getFumbleResult();
    }

    let charDmg = 0;
    let damageBreakdown = "";
    if (charHit && !fumbleResult) {
      const damageResult = parseDamageString(weapon.dmg || weapon.damage);
      charDmg = damageResult.damage;
      damageBreakdown = damageResult.breakdown;
      
      if (charCritical) {
        const critDamageResult = parseDamageString(weapon.dmg || weapon.damage);
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

    // Check if monster is still alive
    const currentMonsterHp = monsterHp !== null && !isNaN(Number(monsterHp)) ? Number(monsterHp) : (monster.hp !== undefined && !isNaN(Number(monster.hp)) ? Number(monster.hp) : 0);
    if (currentMonsterHp <= 0) {
      return null; // Monster is dead, cannot attack
    }

    // Check if monster should skip this action
    if (monsterEffects.skipNextAction) {
      setMonsterEffects(prev => ({ ...prev, skipNextAction: false }));
      setCombatLog(prev => [...prev, `💤 ${monster.name} loses their action and cannot attack this round!`]);
      return null;
    }

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

    const monsterDamageDisplay = monsterDamageBreakdown.includes('=') || monsterDamageBreakdown.includes('+') || monsterDamageBreakdown.includes('(crit)') ? ` [${monsterDamageBreakdown}]` : '';
    const attackMessage = monsterHit
      ? `${monster.name} attacks ${character.name} and rolls ${rawAttackRoll} + ${attackBonus} = ${monsterAttackRoll} vs. AC ${charAC} and hits for ${monsterDmg} damage${monsterDamageDisplay}${monsterCritical ? ' - CRITICAL HIT!' : ''} (${newCharHp} HP left)`
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
        // Only allow monster attack if monster HP > 0
        const currentMonsterHp = monsterHp !== null && !isNaN(Number(monsterHp)) ? Number(monsterHp) : (monster.hp !== undefined && !isNaN(Number(monster.hp)) ? Number(monster.hp) : 0);
        if (currentMonsterHp > 0) {
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
              recordDefeat(character, monster);
            }
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
    if (!charHit && diff > 0 && diff <= character.Luck && rawAttackRoll !== 1) {
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
      
      // Track fumble survival for achievements
      if (achievementTracking) {
        achievementTracking.recordFumbleSurvived();
      }
      
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
      const damageDisplay = damageBreakdown.includes('=') || damageBreakdown.includes('+') || damageBreakdown.includes('(crit)') ? ` [${damageBreakdown}]` : '';
      charAttack = charCritical
        ? `${character.name} attacks ${monster.name} with ${weapon.name} and rolls a ${rawAttackRoll} ${modSign}${abilityMod} (${abilityType}) = ${charAttackRoll} vs. AC ${monsterACRevealed ? monsterAC : '?'} and hits for ${charDmg} damage${damageDisplay} (${displayHp} HP left) - CRITICAL HIT!`
        : `${character.name} attacks ${monster.name} with ${weapon.name} and rolls a ${rawAttackRoll} ${modSign}${abilityMod} (${abilityType}) = ${charAttackRoll} vs. AC ${monsterACRevealed ? monsterAC : '?'} and hits for ${charDmg} damage${damageDisplay} (${displayHp} HP left)`;
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
      const challengeText = monster.challengeLabel ? ` (${monster.challengeLabel})` : '';
      const summaryMessage = `${character.name} has defeated ${monster.name}${challengeText} in glorious combat.`;
      setCombatLog(prev => [...prev, { 
        type: 'summary', 
        message: summaryMessage,
        timestamp: new Date().toLocaleTimeString()
      }]);
      setFightStatus('finished');
      setSummary(summaryMessage);
      recordVictory(character, monster);
      if (achievementTracking) {
        achievementTracking.recordVictory(monster);
      }
      playSound('victory');
      return;
    }

    setTimeout(() => {
      // Only allow monster attack if monster HP > 0
      if (newMonsterHp > 0) {
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
            recordDefeat(character, monster);
          }
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
      // Only allow monster attack if monster HP > 0
      const currentMonsterHp = monsterHp !== null && !isNaN(Number(monsterHp)) ? Number(monsterHp) : (monster.hp !== undefined && !isNaN(Number(monster.hp)) ? Number(monster.hp) : 0);
      if (currentMonsterHp > 0) {
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
            setFightStatus('finished');
            setSummary(summaryMessage);
            recordDefeat(character, monster);
          }
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
      const damageResult = parseDamageString(weapon.dmg || weapon.damage);
      charDmg = damageResult.damage;
      charDamageBreakdown = damageResult.breakdown;
    }
    let newMonsterHp = currentMonsterHp;
    
    // Reveal Monster AC on successful luck burn hit
    if (charHit && !monsterACRevealed) {
      setMonsterACRevealed(true);
    }
    
    if (charCritical && charHit) {
      const critDamageResult = parseDamageString(weapon.dmg || weapon.damage);
      charDmg += critDamageResult.damage;
      charDamageBreakdown += ` + ${critDamageResult.breakdown} (crit)`;
      newMonsterHp = Number(newMonsterHp) - charDmg;
      const displayHp = newMonsterHp < 0 ? 0 : newMonsterHp;
      const luckDamageDisplay = charDamageBreakdown.includes('=') || charDamageBreakdown.includes('+') || charDamageBreakdown.includes('(crit)') ? ` [${charDamageBreakdown}]` : '';
      charAttack = `${character.name} burns ${amount} Luck and attacks ${monster.name} with ${weapon.name} and rolls a ${pendingAttack.rawAttackRoll} ${modSign}${abilityMod} +${amount} (${pendingAttack.abilityType}) = ${newAttackRoll} vs. AC ${monsterACRevealed ? monsterAC : '?'} and hits for ${charDmg} damage${luckDamageDisplay} (${displayHp} HP left) - CRITICAL HIT!`;
    } else if (charHit) {
      newMonsterHp = Number(newMonsterHp) - charDmg;
      const displayHp = newMonsterHp < 0 ? 0 : newMonsterHp;
      const luckDamageDisplay = charDamageBreakdown.includes('=') || charDamageBreakdown.includes('+') || charDamageBreakdown.includes('(crit)') ? ` [${charDamageBreakdown}]` : '';
      charAttack = `${character.name} burns ${amount} Luck and attacks ${monster.name} with ${weapon.name} and rolls a ${pendingAttack.rawAttackRoll} ${modSign}${abilityMod} +${amount} (${pendingAttack.abilityType}) = ${newAttackRoll} vs. AC ${monsterACRevealed ? monsterAC : '?'} and hits for ${charDmg} damage${luckDamageDisplay} (${displayHp} HP left)`;
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
      const challengeText = monster.challengeLabel ? ` (${monster.challengeLabel})` : '';
      const summaryMessage = `${character.name} has defeated ${monster.name}${challengeText} in glorious combat.`;
      setCombatLog(prev => [...prev, { 
        type: 'summary', 
        message: summaryMessage,
        timestamp: new Date().toLocaleTimeString()
      }]);
      setFightStatus('finished');
      setSummary(summaryMessage);
      recordVictory(character, monster);
      if (achievementTracking) {
        achievementTracking.recordVictory(monster);
      }
      playSound('victory');
      return;
    }

    setTimeout(() => {
      // Only allow monster attack if monster HP > 0
      const currentMonsterHp = monsterHp !== null && !isNaN(Number(monsterHp)) ? Number(monsterHp) : (monster.hp !== undefined && !isNaN(Number(monster.hp)) ? Number(monster.hp) : 0);
      if (currentMonsterHp > 0) {
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
            setFightStatus('finished');
            setSummary(summaryMessage);
            recordDefeat(character, monster);
          }
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
    recordDefeat(character, monster);
    setFightStatus('finished');
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
    runAway,
    attemptMightyDeed
  };

  // Helper function to apply mighty deed effects
  function applyMightyDeedEffects(effects) {
    if (effects.monsterAttackBonus) {
      setMonsterEffects(prev => ({
        ...prev,
        attackBonus: effects.monsterAttackBonus,
        attackBonusDuration: effects.monsterAttackBonusDuration || 1
      }));
    }
    
    if (effects.monsterAttackPenalty) {
      setMonsterEffects(prev => ({
        ...prev,
        attackPenalty: Math.max(prev.attackPenalty, effects.monsterAttackPenalty),
        attackPenaltyDuration: effects.monsterAttackPenaltyDuration || 1
      }));
    }
    
    if (effects.characterAttackBonus) {
      setCharacterEffects(prev => ({
        ...prev,
        opponentAttackBonus: effects.characterAttackBonus,
        opponentAttackBonusDuration: effects.characterAttackBonusDuration || 1
      }));
    }
    
    if (effects.characterAttackPenalty) {
      setCharacterEffects(prev => ({
        ...prev,
        attackPenalty: Math.max(prev.attackPenalty, effects.characterAttackPenalty),
        attackPenaltyDuration: effects.characterAttackPenaltyDuration || 1
      }));
    }
    
    if (effects.monsterSkipNextAttack) {
      setMonsterEffects(prev => ({
        ...prev,
        skipNextAction: true
      }));
    }
    
    if (effects.characterSkipNextAttack) {
      setCharacterEffects(prev => ({
        ...prev,
        skipNextAttack: true
      }));
    }
    
    if (effects.characterExtraAttack) {
      setCharacterEffects(prev => ({
        ...prev,
        extraAttack: true
      }));
    }
    
    // Handle self-damage effects
    if (effects.selfDamage || effects.damageToCharacter) {
      const damageAmount = effects.selfDamage || effects.damageToCharacter;
      const damageResult = parseDamageString(damageAmount);
      const newCharHp = Math.max(0, character.hp - damageResult.damage);
      setCharacter(prev => ({ ...prev, hp: newCharHp }));
      
      if (newCharHp <= 0) {
        const summaryMessage = `${character.name} has been defeated by their own fumbling!`;
        setCombatLog(prev => [...prev, { 
          type: 'summary', 
          message: summaryMessage,
          timestamp: new Date().toLocaleTimeString()
        }]);
        setFightStatus('finished');
        setSummary(summaryMessage);
        recordDefeat(character, monster, 'fumble');
      }
    }
  }

  function attemptMightyDeed() {
    if (!character || !character.tradeGood || fightStatus !== 'in progress') return;

    // Map occupation trade goods to our Mighty Deed trade goods
    const tradeGoodMapping = {
      "Oil, 1 flask": "Oil (1 flask)",
      "Pony": "Rope (50 feet)", // Pony rope/harness
      "Iron helmet": "Iron Pot",
      "Sack of grain": "Sack of Grain",
      "Rope, 50'": "Rope (50 feet)",
      "Salt, 1 pound": "Bag of Salt",
      "Ale, 1 gallon": "Barrel of Ale",
      "Cloth, 1 bolt": "Bolt of Cloth",
      "Fabric, 3 yards": "Fabric (3 yards)",
      "Bag of Coins (5 gp 10 sp 200 cp)": "Bag of Coins",
      "Coinpurse (20 sp)": "Bag of Coins",
      "Bag of Coins (4 gp 14 sp 27 cp)": "Bag of Coins",
      "Bag of Coins (100 cp)": "Bag of Coins",
      "100 cp": "Bag of Coins"
    };

    let mappedTradeGood = tradeGoodMapping[character.tradeGood] || character.tradeGood;
    
    if (!tradeGoodsData) return; // Wait for data to load
    
    let tradeGood = tradeGoodsData.tradeGoods.find(tg => tg.name.toLowerCase() === mappedTradeGood.toLowerCase());
    let isImprovisedTradeGood = false;
    if (!tradeGood) {
      // Fallback to a generic trade good effect
      tradeGood = tradeGoodsData.tradeGoods[0]; // Use first trade good as fallback
      isImprovisedTradeGood = true;
      setCombatLog(prev => [...prev, `${character.name} improvises with their ${character.tradeGood}, treating it like a ${tradeGood.name}!`]);
    }

    // Roll attack like a normal attack
    const rawAttackRoll = roll1d20();
    const abilityType = isRangedWeapon(weapon?.name) ? 'Agility' : 'Strength';
    const abilityMod = character.modifiers ? character.modifiers[abilityType] : 0;
    const attackRoll = rawAttackRoll + abilityMod + characterEffects.opponentAttackBonus;
    const monsterAC = Number(monster["Armor Class"]) + monsterEffects.attackPenalty;
    const attackHits = attackRoll >= monsterAC;
    
    // Roll 1d6 for Mighty Deed success
    const deedRoll = roll1d6();
    const deedSucceeds = deedRoll === 6;
    
    // Track successful mighty deeds for achievements
    if (achievementTracking && deedSucceeds) {
      achievementTracking.recordSuccessfulMightyDeed();
    }
    
    let result;
    let resultType;
    let charDmg = 0;
    let damageBreakdown = "";
    let currentMonsterHp = monsterHp !== null && !isNaN(Number(monsterHp)) ? Number(monsterHp) : (monster.hp !== undefined && !isNaN(Number(monster.hp)) ? Number(monster.hp) : 0);
    let finalMonsterHp = currentMonsterHp; // Track the final HP after all damage calculations
    
    // Reveal Monster AC on first successful hit
    if (attackHits && !monsterACRevealed) {
      setMonsterACRevealed(true);
    }

    // Check for fumble on natural 1 attack roll (regardless of deed roll)
    if (rawAttackRoll === 1) {
      const fumbleEffect = tradeGood.mightyDeeds.fumble;
      result = fumbleEffect.text || fumbleEffect;
      resultType = "MIGHTY FUMBLE";
      playSound('danger');
      
      // Apply fumble effects
      if (fumbleEffect.effects) {
        applyMightyDeedEffects(fumbleEffect.effects);
      }
      
      const deedMessage = `🎭${character.name} attempts a Mighty Deed with ${character.tradeGood}! Attack: ${rawAttackRoll} + ${abilityMod} = ${attackRoll} vs AC ${monsterACRevealed ? monsterAC : '?'} MISSES. Deed roll: ${deedRoll} - ${resultType}! ${result}`;
      setCombatLog(prev => [...prev, deedMessage]);
    } else if (attackHits) {
      // Calculate damage
      const damageResult = parseDamageString(weapon?.dmg || weapon?.damage || "1d4");
      charDmg = damageResult.damage;
      damageBreakdown = damageResult.breakdown;
      
      // Check for Mighty Critical (natural 20 on attack AND 6 on deed)
      if (rawAttackRoll === 20 && deedRoll === 6) {
        const criticalEffect = tradeGood.mightyDeeds.critical;
        result = criticalEffect.text || criticalEffect;
        resultType = "MIGHTY CRITICAL";
        playSound('victory');
        
        // Apply bonus damage if specified
        if (criticalEffect.effects && criticalEffect.effects.bonusDamage) {
          const bonusDamageResult = parseDamageString(criticalEffect.effects.bonusDamage);
          charDmg += bonusDamageResult.damage;
          damageBreakdown += ` + ${bonusDamageResult.breakdown}`;
        }
        
        // Apply other critical effects
        if (criticalEffect.effects) {
          applyMightyDeedEffects(criticalEffect.effects);
        }
        
        // Apply total damage to monster after bonus calculation
        finalMonsterHp = Math.max(0, currentMonsterHp - charDmg);
        setMonsterHp(finalMonsterHp);
        
        const damageDisplay = damageBreakdown.includes('=') || damageBreakdown.includes('+') ? ` [${damageBreakdown}]` : '';
        const deedMessage = `🎭${character.name} attempts a Mighty Deed with ${character.tradeGood}! Attack: ${rawAttackRoll} + ${abilityMod} = ${attackRoll} vs AC ${monsterACRevealed ? monsterAC : '?'} CRITICAL HIT for ${charDmg} damage${damageDisplay}. Deed roll: ${deedRoll} - ${resultType}! ${result} (${finalMonsterHp} HP left)`;
        setCombatLog(prev => [...prev, deedMessage]);
      } else if (deedSucceeds && rawAttackRoll === 20) {
        // Attack hits with natural 20 AND deed succeeds (but not critical - requires both nat 20 and deed 6)
        const successEffect = tradeGood.mightyDeeds.success;
        result = successEffect.text || successEffect;
        resultType = "MIGHTY SUCCESS";
        playSound('slash');
        
        // Apply bonus damage if specified
        if (successEffect.effects && successEffect.effects.bonusDamage) {
          const bonusDamageResult = parseDamageString(successEffect.effects.bonusDamage);
          charDmg += bonusDamageResult.damage;
          damageBreakdown += ` + ${bonusDamageResult.breakdown}`;
        }
        
        // Apply other success effects
        if (successEffect.effects) {
          applyMightyDeedEffects(successEffect.effects);
        }
        
        // Apply total damage to monster after bonus calculation
        finalMonsterHp = Math.max(0, currentMonsterHp - charDmg);
        setMonsterHp(finalMonsterHp);
        
        const damageDisplay = damageBreakdown.includes('=') || damageBreakdown.includes('+') ? ` [${damageBreakdown}]` : '';
        const deedMessage = `🎭${character.name} attempts a Mighty Deed with ${character.tradeGood}! Attack: ${rawAttackRoll} + ${abilityMod} = ${attackRoll} vs AC ${monsterACRevealed ? monsterAC : '?'} HITS for ${charDmg} damage${damageDisplay}. Deed roll: ${deedRoll} - ${resultType}! ${result} (${finalMonsterHp} HP left)`;
        setCombatLog(prev => [...prev, deedMessage]);
      } else {
        // Attack hits but deed fails
        resultType = "DEED FAILED";
        playSound('slash');
        
        finalMonsterHp = Math.max(0, currentMonsterHp - charDmg);
        setMonsterHp(finalMonsterHp);
        
        const damageDisplay = damageBreakdown.includes('=') || damageBreakdown.includes('+') ? ` [${damageBreakdown}]` : '';
        const deedMessage = `🎭${character.name} attempts a Mighty Deed with ${character.tradeGood}! Attack: ${rawAttackRoll} + ${abilityMod} = ${attackRoll} vs AC ${monsterACRevealed ? monsterAC : '?'} HITS for ${charDmg} damage${damageDisplay}. Deed roll: ${deedRoll} - ${resultType}! The attack succeeds but the mighty deed fails. (${finalMonsterHp} HP left)`;
        setCombatLog(prev => [...prev, deedMessage]);
      }
      
      // Check if monster is defeated (use the calculated finalMonsterHp)
      if (finalMonsterHp <= 0) {
        const challengeText = monster.challengeLabel ? ` (${monster.challengeLabel})` : '';
        const summaryMessage = (rawAttackRoll === 20 && deedRoll === 6) ? 
          `${character.name} has defeated ${monster.name}${challengeText} in glorious combat with a Mighty Critical!` :
          (deedSucceeds ? `${character.name} has defeated ${monster.name}${challengeText} in glorious combat with a Mighty Deed!` :
          `${character.name} has defeated ${monster.name}${challengeText} in combat.`);
        setCombatLog(prev => [...prev, { 
          type: 'summary', 
          message: summaryMessage,
          timestamp: new Date().toLocaleTimeString()
        }]);
        setFightStatus('finished');
        setSummary(summaryMessage);
        recordVictory(character, monster, rawAttackRoll === 20 && deedRoll === 6 ? 'mighty_critical' : deedSucceeds ? 'mighty_deed' : 'normal');
        playSound('victory');
        return;
      }
    } else {
      // Attack misses (but not a mighty fumble)
      resultType = "ATTACK MISSED";
      playSound('block');
      const deedMessage = `🎭${character.name} attempts a Mighty Deed with ${character.tradeGood}! Attack: ${rawAttackRoll} + ${abilityMod} = ${attackRoll} vs AC ${monsterACRevealed ? monsterAC : '?'} MISSES. The mighty deed attempt fails completely.`;
      setCombatLog(prev => [...prev, deedMessage]);
    }

    // After attempting a mighty deed, monster gets to attack
    setTimeout(() => {
      // Only allow monster attack if monster HP > 0 (use the calculated finalMonsterHp)
      if (finalMonsterHp > 0) {
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
            setFightStatus('finished');
            setSummary(summaryMessage);
            recordDefeat(character, monster);
          }
        }
      }
    }, 1000);
  }
};

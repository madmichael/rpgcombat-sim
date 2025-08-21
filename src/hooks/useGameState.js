import { useState, useEffect } from 'react';

export const useGameState = () => {
  const [character, setCharacter] = useState(null);
  const [monster, setMonster] = useState(null);
  const [weapon, setWeapon] = useState(null);
  const [combatLog, setCombatLog] = useState([]);
  const [fightStatus, setFightStatus] = useState('not started');
  const [summary, setSummary] = useState('');
  const [charHp, setCharHp] = useState(null);
  const [monsterHp, setMonsterHp] = useState(null);
  const [selectedChallenge, setSelectedChallenge] = useState('patheticCreatures');
  const [monsterNames, setMonsterNames] = useState([]);

  // Load monster names on mount
  useEffect(() => {
    async function fetchMonsterNames() {
      try {
        const res = await fetch('src/data/dnd_srd_monsters_with_attacktype.json');
        const data = await res.json();
        setMonsterNames(data.map(m => ({ name: m.name, AttackType: m.AttackType })));
      } catch (e) {
        setMonsterNames([]);
      }
    }
    fetchMonsterNames();
  }, []);

  const resetGame = () => {
    setCharacter(null);
    setMonster(null);
    setWeapon(null);
    setCombatLog([]);
    setFightStatus('not started');
    setSummary('');
    setCharHp(null);
    setMonsterHp(null);
  };

  const resetCombat = () => {
    setMonster(null);
    setCombatLog([]);
    setFightStatus('not started');
    setSummary('');
    setMonsterHp(null);
    if (character) {
      setCharHp(character.hp);
    }
  };

  const restartFight = () => {
    if (character && monster) {
      setCharHp(character.hp);
      setMonsterHp(monster.hp);
      setCombatLog([]);
      setFightStatus('not started');
      setSummary('');
      
      // Reset character Luck to original value
      if (character.originalLuck !== undefined) {
        setCharacter({
          ...character,
          Luck: character.originalLuck
        });
      }
    }
  };

  return {
    // State
    character,
    monster,
    weapon,
    combatLog,
    fightStatus,
    summary,
    charHp,
    monsterHp,
    selectedChallenge,
    monsterNames,
    
    // Setters
    setCharacter,
    setMonster,
    setWeapon,
    setCombatLog,
    setFightStatus,
    setSummary,
    setCharHp,
    setMonsterHp,
    setSelectedChallenge,
    
    // Actions
    resetGame,
    resetCombat,
    restartFight
  };
};

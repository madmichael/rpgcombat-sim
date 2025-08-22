import { useState, useEffect } from 'react';

const STORAGE_KEY = 'rpg-combat-victories';

export const useVictoryTracking = () => {
  const [victories, setVictories] = useState({
    totalWins: 0,
    totalLosses: 0,
    characterStats: {},
    monsterDefeats: {},
    recentBattles: []
  });

  // Load victory data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setVictories(parsed);
      } catch (error) {
        console.warn('Failed to parse victory data:', error);
      }
    }
  }, []);

  // Save victory data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(victories));
  }, [victories]);

  const recordVictory = (character, monster, battleType = 'normal') => {
    const battleRecord = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      character: {
        name: character.name,
        occupation: character.occupation,
        level: character.level || 0
      },
      monster: {
        name: monster.name,
        challenge: monster.Challenge || monster.challenge || 'Unknown',
        challengeLabel: monster.challengeLabel || null
      },
      result: 'victory',
      battleType
    };

    setVictories(prev => {
      const newVictories = {
        ...prev,
        totalWins: prev.totalWins + 1,
        characterStats: {
          ...prev.characterStats,
          [character.name]: {
            ...prev.characterStats[character.name],
            wins: (prev.characterStats[character.name]?.wins || 0) + 1,
            losses: prev.characterStats[character.name]?.losses || 0,
            occupation: character.occupation,
            lastPlayed: new Date().toISOString()
          }
        },
        monsterDefeats: {
          ...prev.monsterDefeats,
          [monster.name]: {
            count: (prev.monsterDefeats[monster.name]?.count || 0) + 1,
            challengeLabel: monster.challengeLabel || prev.monsterDefeats[monster.name]?.challengeLabel || null
          }
        },
        recentBattles: [battleRecord, ...prev.recentBattles.slice(0, 19)] // Keep last 20 battles
      };
      return newVictories;
    });
  };

  const recordDefeat = (character, monster, battleType = 'normal') => {
    const battleRecord = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      character: {
        name: character.name,
        occupation: character.occupation,
        level: character.level || 0
      },
      monster: {
        name: monster.name,
        challenge: monster.Challenge || monster.challenge || 'Unknown',
        challengeLabel: monster.challengeLabel || null
      },
      result: 'defeat',
      battleType
    };

    setVictories(prev => {
    const newVictories = {
      ...prev,
      totalLosses: prev.totalLosses + 1,
      characterStats: {
        ...prev.characterStats,
        [character.name]: {
          ...prev.characterStats[character.name],
          wins: prev.characterStats[character.name]?.wins || 0,
          losses: (prev.characterStats[character.name]?.losses || 0) + 1,
          occupation: character.occupation,
          lastPlayed: new Date().toISOString()
        }
      },
      recentBattles: [battleRecord, ...prev.recentBattles.slice(0, 19)] // Keep last 20 battles
    };
    return newVictories;
    });
  };

  const getCharacterRecord = (characterName) => {
    return victories.characterStats[characterName] || { wins: 0, losses: 0 };
  };

  const getWinRate = (characterName = null) => {
    if (characterName) {
      const stats = victories.characterStats[characterName];
      if (!stats || (stats.wins + stats.losses) === 0) return 0;
      return Math.round((stats.wins / (stats.wins + stats.losses)) * 100);
    }
    
    const total = victories.totalWins + victories.totalLosses;
    if (total === 0) return 0;
    return Math.round((victories.totalWins / total) * 100);
  };

  const getMostDefeatedMonster = () => {
    const monsters = Object.entries(victories.monsterDefeats);
    if (monsters.length === 0) return null;
    
    return monsters.reduce((max, [name, data]) => {
      const count = typeof data === 'number' ? data : data.count || 0;
      const challengeLabel = typeof data === 'object' ? data.challengeLabel : null;
      
      if (count > max.count) {
        return { name, count, challengeLabel };
      }
      return max;
    }, { name: '', count: 0, challengeLabel: null });
  };

  const getBestCharacter = () => {
    const characters = Object.entries(victories.characterStats);
    if (characters.length === 0) return null;

    return characters.reduce((best, [name, stats]) => {
      const winRate = stats.wins / (stats.wins + stats.losses || 1);
      const bestWinRate = best.stats.wins / (best.stats.wins + best.stats.losses || 1);
      
      return winRate > bestWinRate ? { name, stats } : best;
    }, { name: '', stats: { wins: 0, losses: 0 } });
  };

  const clearAllData = () => {
    const emptyData = {
      totalWins: 0,
      totalLosses: 0,
      characterStats: {},
      monsterDefeats: {},
      recentBattles: []
    };
    setVictories(emptyData);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    victories,
    recordVictory,
    recordDefeat,
    getCharacterRecord,
    getWinRate,
    getMostDefeatedMonster,
    getBestCharacter,
    clearAllData
  };
};

import { useState, useEffect } from 'react';
import achievementsData from '../data/achievements.json';

export const useAchievements = (characterId) => {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({
    victories: 0,
    fumbles_survived: 0,
    high_hp_kills: 0,
    consecutive_nat20s: 0,
    current_nat20_streak: 0,
    critical_hits: 0,
    successful_mighty_deeds: 0,
    monster_kills: {}
  });

  // Load achievements and stats from localStorage
  useEffect(() => {
    if (characterId) {
      const savedAchievements = localStorage.getItem(`achievements_${characterId}`);
      const savedStats = localStorage.getItem(`stats_${characterId}`);
      
      if (savedAchievements) {
        setAchievements(JSON.parse(savedAchievements));
      }
      
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    }
  }, [characterId]);

  // Save to localStorage whenever achievements or stats change
  useEffect(() => {
    if (characterId) {
      localStorage.setItem(`achievements_${characterId}`, JSON.stringify(achievements));
      localStorage.setItem(`stats_${characterId}`, JSON.stringify(stats));
    }
  }, [achievements, stats, characterId]);

  const checkAchievements = (newStats) => {
    const unlockedAchievements = [];
    
    achievementsData.achievements.forEach(achievement => {
      // Skip if already unlocked
      if (achievements.some(a => a.id === achievement.id)) {
        return;
      }

      let unlocked = false;
      const req = achievement.requirement;

      switch (req.type) {
        case 'victories':
          unlocked = newStats.victories >= req.count;
          break;
        case 'fumbles_survived':
          unlocked = newStats.fumbles_survived >= req.count;
          break;
        case 'high_hp_kills':
          unlocked = newStats.high_hp_kills >= req.count;
          break;
        case 'consecutive_nat20s':
          unlocked = newStats.consecutive_nat20s >= req.count;
          break;
        case 'critical_hits':
          unlocked = newStats.critical_hits >= req.count;
          break;
        case 'successful_mighty_deeds':
          unlocked = newStats.successful_mighty_deeds >= req.count;
          break;
        case 'monster_type_kill':
          const typeKills = newStats.monster_kills[req.monster_type] || 0;
          unlocked = typeKills >= req.count;
          break;
      }

      if (unlocked) {
        unlockedAchievements.push({
          ...achievement,
          unlockedAt: new Date().toISOString()
        });
      }
    });

    if (unlockedAchievements.length > 0) {
      setAchievements(prev => [...prev, ...unlockedAchievements]);
    }

    return unlockedAchievements;
  };

  const updateStats = (updates) => {
    setStats(prevStats => {
      const newStats = { ...prevStats, ...updates };
      
      // Handle consecutive nat20s tracking
      if (updates.hasOwnProperty('current_nat20_streak')) {
        if (updates.current_nat20_streak > newStats.consecutive_nat20s) {
          newStats.consecutive_nat20s = updates.current_nat20_streak;
        }
      }

      // Handle monster kills
      if (updates.monster_kill) {
        const { type, hp } = updates.monster_kill;
        newStats.monster_kills = { ...newStats.monster_kills };
        newStats.monster_kills[type] = (newStats.monster_kills[type] || 0) + 1;
        
        // Check for high HP kills
        if (hp >= 50) {
          newStats.high_hp_kills = (newStats.high_hp_kills || 0) + 1;
        }
      }

      // Check for new achievements
      setTimeout(() => checkAchievements(newStats), 0);
      
      return newStats;
    });
  };

  const recordVictory = (monster) => {
    const monsterType = getMonsterType(monster);
    updateStats({
      victories: stats.victories + 1,
      monster_kill: {
        type: monsterType,
        hp: monster.hp || monster["Hit Points"] || 0
      }
    });
  };

  const recordFumbleSurvived = () => {
    updateStats({
      fumbles_survived: stats.fumbles_survived + 1
    });
  };

  const recordCriticalHit = () => {
    updateStats({
      critical_hits: stats.critical_hits + 1,
      current_nat20_streak: stats.current_nat20_streak + 1
    });
  };

  const recordNonCriticalHit = () => {
    updateStats({
      current_nat20_streak: 0
    });
  };

  const recordSuccessfulMightyDeed = () => {
    updateStats({
      successful_mighty_deeds: stats.successful_mighty_deeds + 1
    });
  };

  const getMonsterType = (monster) => {
    const name = monster.name.toLowerCase();
    
    if (name.includes('dragon')) return 'dragon';
    if (name.includes('zombie') || name.includes('skeleton') || name.includes('ghost') || 
        name.includes('wight') || name.includes('lich') || name.includes('vampire') ||
        name.includes('mummy')) return 'undead';
    if (name.includes('goblin') || name.includes('orc') || name.includes('hobgoblin')) return 'humanoid';
    if (name.includes('wolf') || name.includes('bear') || name.includes('tiger')) return 'beast';
    if (name.includes('demon') || name.includes('devil')) return 'fiend';
    
    return 'other';
  };

  const getAchievementsByRarity = () => {
    const grouped = {
      common: [],
      uncommon: [],
      rare: [],
      legendary: []
    };
    
    achievements.forEach(achievement => {
      grouped[achievement.rarity].push(achievement);
    });
    
    return grouped;
  };

  return {
    achievements,
    stats,
    recordVictory,
    recordFumbleSurvived,
    recordCriticalHit,
    recordNonCriticalHit,
    recordSuccessfulMightyDeed,
    getAchievementsByRarity,
    totalAchievements: achievementsData.achievements.length,
    unlockedCount: achievements.length
  };
};

import React, { useEffect, useState } from 'react';
import CharacterCreator from './components/CharacterCreator';
import MonsterSelector from './components/MonsterSelector';
import WeaponSelector from './components/WeaponSelector';
import CombatControls from './components/CombatControls';
import CombatLog from './components/CombatLog';
import Summary from './components/Summary';
import EnhancedCharacterSummary from './components/EnhancedCharacterSummary';
import EnhancedMonsterSummary from './components/EnhancedMonsterSummary';
import EnhancedMonsterDisplay from './components/EnhancedMonsterDisplay';
import CombatDashboard from './components/CombatDashboard';
import LuckModal from './components/LuckModal';
import LuckConfirmModal from './components/LuckConfirmModal';
import GameActions from './components/GameActions';
import ChallengeSelector from './components/ChallengeSelector';
import VictoryStats from './components/VictoryStats';
import AchievementPanel from './components/AchievementPanel';
import AchievementNotification from './components/AchievementNotification';
import Credits from './components/Credits';
import { useGameState } from './hooks/useGameState';
import { useAudio } from './hooks/useAudio';
import { useCombat } from './hooks/useCombat.jsx';
import { useMonsterSelection } from './hooks/useMonsterSelection';
import { useVictoryTracking } from './hooks/useVictoryTracking';
import { useAchievements } from './hooks/useAchievements';
import { getCharacterFromUrl, updateUrlWithCharacter, clearCharacterFromUrl } from './utils/characterUrl';
import './App.css';

function App() {
  // Initialize hooks
  const gameState = useGameState();
  const { playSound, AudioElements } = useAudio();
  const victoryTracking = useVictoryTracking();
  
  const {
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
    setCharacter,
    setCharHp,
    setSelectedChallenge,
    resetCombat,
    restartFight
  } = gameState;

  // Initialize achievement tracking with character name
  const achievementTracking = useAchievements(character?.name);
  const combat = useCombat(gameState, playSound, victoryTracking, achievementTracking);
  const monsterSelection = useMonsterSelection(gameState);
  const [showVictoryStats, setShowVictoryStats] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showCredits, setShowCredits] = useState(false);

  const {
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
  } = combat;

  const { selectRandomMonster, getChallengeLabel, adjustChallenge } = monsterSelection;

  const handleCreateCharacter = (char) => {
    setCharacter(char);
    updateUrlWithCharacter(char, achievementTracking.achievements, achievementTracking.stats);
    playSound('success');
    resetCombat();
    playSound('door');
    // Monster selection will be handled by useEffect when monster names are ready
  };

  const handleSelectMonster = () => {
    playSound('door');
    selectRandomMonster();
  };

  const handleSelectWeapon = (weap) => {
    gameState.setWeapon(weap);
  };

  // Auto-select weapon when character and monster are ready
  useEffect(() => {
    if (character && monster && !weapon && character.weapon) {
      handleSelectWeapon({ name: character.weapon.name, dmg: character.weapon.damage });
    }
  }, [character, monster, weapon]);

  // Load character from URL on initial page load
  useEffect(() => {
    const urlCharacter = getCharacterFromUrl();
    if (urlCharacter && !character) {
      console.log('Loading character from URL:', urlCharacter);
      setCharacter(urlCharacter);
      
      // Load achievements and stats if they exist in the URL data
      console.log('URL character achievements:', urlCharacter.achievements);
      console.log('URL character combatStats:', urlCharacter.combatStats);
      
      // Use setTimeout to ensure achievement tracking is initialized
      setTimeout(() => {
        if (urlCharacter.achievements && urlCharacter.achievements.length > 0) {
          console.log('Loading achievements:', urlCharacter.achievements);
          achievementTracking.loadAchievements(urlCharacter.achievements);
        }
        
        if (urlCharacter.combatStats && Object.keys(urlCharacter.combatStats).length > 0) {
          console.log('Loading combat stats:', urlCharacter.combatStats);
          achievementTracking.loadStats(urlCharacter.combatStats);
          // Also load stats into victory tracking system for the Stats modal
          victoryTracking.loadStatsFromUrl(urlCharacter.combatStats);
        }
      }, 100);
      
      playSound('success');
    }
  }, []);

  // Auto-select monster when character exists but monster doesn't and monster names are loaded
  useEffect(() => {
    if (character && !monster && monsterNames.length > 0) {
      selectRandomMonster();
    }
  }, [character, monster, monsterNames]);

  // Update URL when character, achievements, or stats change
  useEffect(() => {
    if (character) {
      updateUrlWithCharacter(character, achievementTracking.achievements, achievementTracking.stats);
    } else {
      clearCharacterFromUrl();
    }
  }, [character, achievementTracking.achievements, achievementTracking.stats]);

  // Auto-start fight when character and monster are ready
  useEffect(() => {
    if (character && monster && fightStatus === 'not started') {
      startFight();
    }
  }, [character, monster, fightStatus]);

  const handleFindAnotherMonster = () => {
    resetCombat();
    // Increment battles won
    setCharacter(prev => {
      if (!prev) return prev;
      const newBattlesWon = (prev.battlesWon || 0) + 1;
      const newBattlesWonByLevel = { ...(prev.battlesWonByLevel || {}) };
      newBattlesWonByLevel[selectedChallenge] = (newBattlesWonByLevel[selectedChallenge] || 0) + 1;
      return {
        ...prev,
        name: prev.name,
        alignment: prev.alignment,
        Luck: prev.Luck,
        battlesWon: newBattlesWon,
        battlesWonByLevel: newBattlesWonByLevel
      };
    });
  };

  const handleLuckKeepRoll = () => {
    setShowLuckModal(false);
    setPendingAttack(null);
    continueFight();
  };


  return (
    <div className="App">
      <AudioElements />
      
      <LuckConfirmModal
        show={showLuckConfirmModal}
        onClose={() => setShowLuckConfirmModal(false)}
        attackRoll={pendingAttack?.charAttackRoll}
        character={character}
        onYes={handleLuckConfirmYes}
        onNo={handleLuckConfirmNo}
      />
      
      <LuckModal
        show={showLuckModal}
        onClose={() => { setShowLuckModal(false); setPendingAttack(null); }}
        pendingAttack={pendingAttack}
        character={character}
        monster={monster}
        luckToBurn={luckToBurn}
        setLuckToBurn={setLuckToBurn}
        onBurnLuck={burnLuck}
        onKeepRoll={handleLuckKeepRoll}
      />
      
      <header>
        <h1 id="main-title">RPG Combat Simulator</h1>
      </header>
      
      <main role="main" aria-labelledby="main-title">
      
      {!character && (
        <>
          <div className="challenge-selector-section">
            <ChallengeSelector
              selectedChallenge={selectedChallenge}
              onChallengeChange={setSelectedChallenge}
            />
          </div>
          <CharacterCreator onCharacterCreated={handleCreateCharacter} />
        </>
      )}
      
      
      <GameActions
        fightStatus={fightStatus}
        summary={summary}
        character={character}
        monster={monster}
        selectedChallenge={selectedChallenge}
        onFindAnotherMonster={handleFindAnotherMonster}
        onRestartFight={restartFight}
        onAdjustChallenge={adjustChallenge}
        playSound={playSound}
        onShowVictoryStats={() => setShowVictoryStats(true)}
        onShowAchievements={() => setShowAchievements(true)}
        onShowCredits={() => setShowCredits(true)}
      />
      
      {character && !monster && (
        <div className="loading-encounter">
          <div className="encounter-card">
            <div className="encounter-header">
              <h3>🏰 Entering the Dungeon...</h3>
              <p>Searching for a worthy opponent...</p>
            </div>
            <div className="loading-spinner">⚔️</div>
          </div>
        </div>
      )}
      
      {character && monster && (
        <div className="new-combat-layout">
          {/* Dashboard Header */}
          <CombatDashboard 
            character={character}
            monster={monster}
            weapon={weapon}
            fightStatus={fightStatus}
            charHp={charHp}
            monsterHp={monsterHp}
            combatLog={combatLog}
            monsterACRevealed={monsterACRevealed}
            selectedChallenge={selectedChallenge}
            getChallengeLabel={getChallengeLabel}
            achievements={achievementTracking.achievements}
            stats={achievementTracking.stats}
          />
          
          {/* Combat Controls */}
          <div className="combat-controls-section">
            <CombatControls 
              status={fightStatus}
              onStart={startFight}
              onContinue={continueFight}
              onRun={() => runAway(selectRandomMonster)}
              onMightyDeed={attemptMightyDeed}
              character={character}
              isActionInProgress={combat.isActionInProgress}
              onFindAnother={() => {
                playSound('swoosh');
                selectRandomMonster();
              }}
              onRestartFight={restartFight}
              onAdjustChallenge={(direction) => {
                playSound('swoosh');
                adjustChallenge(direction);
              }}
              onReset={gameState.resetGame}
              summary={summary}
              buttonStyles={{
                start: { backgroundColor: 'red', color: 'white' },
                continue: { backgroundColor: 'green', color: 'white' },
                run: { backgroundColor: 'yellow', color: 'black' },
                findAnother: { backgroundColor: 'blue', color: 'white' }
              }}
            />
          </div>

          {/* Combat Log - Main Focus */}
          <div className="combat-log-section">
            {combatLog.length > 0 && (
              <CombatLog 
                log={combatLog} 
                character={character} 
                monster={monster} 
                charHp={charHp}
                monsterHp={monsterHp}
              />
            )}
          </div>


        </div>
      )}
      
      
      {combatLog.length > 0 && !monster && (
        <CombatLog 
          log={combatLog} 
          character={character} 
          monster={monster} 
          charHp={charHp}
          monsterHp={monsterHp}
          onReset={gameState.resetGame}
        />
      )}
      
      {/* Victory Stats Modal */}
      <VictoryStats 
        isOpen={showVictoryStats} 
        onClose={() => setShowVictoryStats(false)}
        victoryTracking={victoryTracking}
      />
      
      {/* Achievement Panel Modal */}
      <AchievementPanel 
        isOpen={showAchievements} 
        onClose={() => setShowAchievements(false)}
        achievementTracking={achievementTracking}
      />
      
      {/* Credits Modal */}
      <Credits 
        isOpen={showCredits} 
        onClose={() => setShowCredits(false)}
      />
      
      {/* Achievement Notifications */}
      <AchievementNotification achievementTracking={achievementTracking} />
      
      </main>
    </div>
  );
}

export default App;
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
import { useGameState } from './hooks/useGameState';
import { useAudio } from './hooks/useAudio';
import { useCombat } from './hooks/useCombat.jsx';
import { useMonsterSelection } from './hooks/useMonsterSelection';
import { useVictoryTracking } from './hooks/useVictoryTracking';
import './App.css';

function App() {
  // Initialize hooks
  const gameState = useGameState();
  const { playSound, AudioElements } = useAudio();
  const victoryTracking = useVictoryTracking();
  const combat = useCombat(gameState, playSound, victoryTracking);
  const monsterSelection = useMonsterSelection(gameState);
  const [showVictoryStats, setShowVictoryStats] = useState(false);

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
    setCharHp(char.hp);
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

  // Auto-select monster when character exists but monster doesn't and monster names are loaded
  useEffect(() => {
    if (character && !monster && monsterNames.length > 0) {
      selectRandomMonster();
    }
  }, [character, monster, monsterNames]);

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
          <CharacterCreator onCreate={handleCreateCharacter} />
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
          />
          
          {/* Combat Controls */}
          <div className="combat-controls-section">
            <CombatControls 
              status={fightStatus}
              onStart={startFight}
              onContinue={continueFight}
              onRun={runAway}
              onMightyDeed={attemptMightyDeed}
              character={character}
              onFindAnother={() => {
                playSound('swoosh');
                selectRandomMonster();
              }}
              onRestartFight={restartFight}
              onAdjustChallenge={(direction) => {
                playSound('swoosh');
                adjustChallenge(direction);
              }}
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
                onReset={gameState.resetGame}
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
      
      </main>
    </div>
  );
}

export default App;
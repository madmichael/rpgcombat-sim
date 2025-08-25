import React, { useEffect, useRef, useState } from 'react';
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
import LootModal from './components/LootModal';
import Credits from './components/Credits';
import Tutorial from './components/Tutorial';
import QuestBoard from './components/quests/QuestBoard';
import QuestDetail from './components/quests/QuestDetail';
import SkillChallenge from './components/quests/SkillChallenge';
import BossFightWrapper from './components/quests/BossFightWrapper';
import QuestCompletionModal from './components/quests/QuestCompletionModal';
import QuestFailureModal from './components/quests/QuestFailureModal';
import { useGameState } from './hooks/useGameState';
import { useAudio } from './hooks/useAudio';
import { useCombat } from './hooks/useCombat.jsx';
import { useMonsterSelection } from './hooks/useMonsterSelection';
import { useVictoryTracking } from './hooks/useVictoryTracking';
import { useAchievements } from './hooks/useAchievements';
import { useLoot } from './hooks/useLoot';
import { useQuests } from './hooks/useQuests';
import { getCharacterFromUrl, updateUrlWithCharacter, clearCharacterFromUrl } from './utils/characterUrl';
import './App.css';

function App() {
  // Initialize hooks
  const gameState = useGameState();
  const { playSound, AudioElements } = useAudio();
  const victoryTracking = useVictoryTracking();
  const questsApi = useQuests();
  
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
  const lootSystem = useLoot();
  const combat = useCombat(gameState, playSound, victoryTracking, achievementTracking, setCharacter, lootSystem);
  const monsterSelection = useMonsterSelection(gameState);
  const [showVictoryStats, setShowVictoryStats] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialInitialStep, setTutorialInitialStep] = useState(0);
  const dashboardRef = useRef(null);

  // Quest UI state
  const [questMode, setQuestMode] = useState(false);
  const [activeQuestId, setActiveQuestId] = useState(null);
  const [questUiStep, setQuestUiStep] = useState('board'); // 'board' | 'detail' | 'challenges' | 'boss'
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [showQuestComplete, setShowQuestComplete] = useState(false);
  const [questRewardUrl, setQuestRewardUrl] = useState(null);
  const [lastCompletedQuestId, setLastCompletedQuestId] = useState(null);
  const [pendingQuestId, setPendingQuestId] = useState(null);
  const [showQuestFailed, setShowQuestFailed] = useState(false);

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
    // Flatten abilities object to top-level properties for compatibility
    const flattenedChar = {
      ...char,
      Strength: char.abilities?.Strength || char.Strength || 10,
      Agility: char.abilities?.Agility || char.Agility || 10,
      Stamina: char.abilities?.Stamina || char.Stamina || 10,
      Personality: char.abilities?.Personality || char.Personality || 10,
      Intelligence: char.abilities?.Intelligence || char.Intelligence || 10,
      Luck: char.abilities?.Luck || char.Luck || 10
    };
    
    setCharacter(flattenedChar);
    updateUrlWithCharacter(flattenedChar, achievementTracking.achievements, achievementTracking.stats);
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
    // Auto-show tutorial if not seen
    try {
      const seen = localStorage.getItem('rpg_tutorial_seen');
      if (!seen) setShowTutorial(true);
    } catch {}

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

  // When a quest boss fight finishes with monster HP <= 0, show reward modal
  useEffect(() => {
    if (pendingQuestId && fightStatus === 'finished' && monsterHp !== null && Number(monsterHp) <= 0) {
      const quest = questsApi.getQuestById(pendingQuestId);
      const url = quest?.reward?.staticUrl;
      if (url) {
        questsApi.markCompleted(pendingQuestId, url);
        setLastCompletedQuestId(pendingQuestId);
        setQuestRewardUrl(url);
        setShowQuestComplete(true);
      }
      setPendingQuestId(null);
    }
  }, [fightStatus, monsterHp, pendingQuestId]);

  // When a quest boss fight finishes and the character is dead, show failure modal
  useEffect(() => {
    if (pendingQuestId && fightStatus === 'finished' && charHp !== null && Number(charHp) <= 0) {
      setShowQuestFailed(true);
      setLastCompletedQuestId(pendingQuestId); // reuse to reference quest info
      setPendingQuestId(null);
    }
  }, [fightStatus, charHp, pendingQuestId]);

  // If the player runs away, clear any pending quest boss ID to prevent accidental completion later
  useEffect(() => {
    if (fightStatus === 'ran away' && pendingQuestId) {
      setShowQuestFailed(true);
      setLastCompletedQuestId(pendingQuestId);
      setPendingQuestId(null);
    }
  }, [fightStatus, pendingQuestId]);

  // When a new monster is selected, scroll the dashboard into view
  useEffect(() => {
    if (monster && dashboardRef.current) {
      try {
        dashboardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch {}
    }
  }, [monster]);

  // Play sounds when quest modals open
  useEffect(() => {
    if (showQuestComplete) {
      try { playSound('victory'); } catch {}
    }
  }, [showQuestComplete]);
  useEffect(() => {
    if (showQuestFailed) {
      try { playSound('danger'); } catch {}
    }
  }, [showQuestFailed]);

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
        <div style={{ marginTop: 8 }}>
          <button onClick={() => { setQuestMode(true); setQuestUiStep('board'); }}>
            Quests
          </button>
        </div>
      </header>
      
      <main role="main" aria-labelledby="main-title">

      {questMode && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-container" style={{ background: '#111', color: '#eee', border: '1px solid #444', borderRadius: 8, padding: 16, width: 'min(900px, 96vw)', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>Quest Board</h2>
              <button onClick={() => { setQuestMode(false); setQuestUiStep('board'); setActiveQuestId(null); setChallengeIndex(0); }}>Close</button>
            </div>

            {questUiStep === 'board' && (
              <QuestBoard
                onViewQuest={(id) => { setActiveQuestId(id); setQuestUiStep('detail'); }}
                onStartQuest={(id) => { setActiveQuestId(id); questsApi.startQuest(id); setChallengeIndex(0); setQuestUiStep('challenges'); }}
              />
            )}

            {questUiStep === 'detail' && activeQuestId && (
              <QuestDetail
                questId={activeQuestId}
                onStart={() => { questsApi.startQuest(activeQuestId); setChallengeIndex(0); setQuestUiStep('challenges'); }}
              />
            )}

            {questUiStep === 'challenges' && activeQuestId && (() => {
              const quest = questsApi.getQuestById(activeQuestId);
              const challenges = quest?.challenges || [];
              const current = challenges[challengeIndex];
              if (!current) return null;
              return (
                <div style={{ display: 'grid', gap: 12 }}>
                  <div>Step {challengeIndex + 1} of {challenges.length}</div>
                  <SkillChallenge
                    gameState={gameState}
                    questId={activeQuestId}
                    challenge={current}
                    onResolved={(mods, success) => {
                      questsApi.recordChallengeOutcome(activeQuestId, current.id, success, mods);
                      const next = challengeIndex + 1;
                      if (next < challenges.length) setChallengeIndex(next);
                      else setQuestUiStep('boss');
                    }}
                  />
                </div>
              );
            })()}

            {questUiStep === 'boss' && activeQuestId && (
              <BossFightWrapper
                questId={activeQuestId}
                selectedChallenge={selectedChallenge}
                onPrepared={(adaptedMonster) => {
                  // Reset and start a new fight with the adapted boss
                  gameState.resetCombat();
                  gameState.setMonster(adaptedMonster);
                  setPendingQuestId(activeQuestId);
                  // Explicitly start the fight now
                  try { startFight(); } catch {}
                  // Return to main combat UI and reset quest UI state so it doesn't stay on 'boss' next open
                  setQuestMode(false);
                  setQuestUiStep('board');
                  setActiveQuestId(null);
                  setChallengeIndex(0);
                }}
                onCancel={() => { setQuestMode(false); setQuestUiStep('board'); setActiveQuestId(null); setChallengeIndex(0); }}
              />
            )}

          </div>
        </div>
      )}
      
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
        onShowTutorial={() => setShowTutorial(true)}
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
          <div ref={dashboardRef}>
          {/* SR-only live region announcing new encounters for screen readers */}
          {monster && (
            <div className="sr-only" aria-live="polite" aria-atomic="true">
              New encounter: {monster.name}. Threat level {getChallengeLabel ? getChallengeLabel(selectedChallenge) : selectedChallenge}.
            </div>
          )}
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
            onCharacterChange={setCharacter}
            onFindAnother={() => { playSound('swoosh'); selectRandomMonster(); }}
            focusTrigger={monster?.name}
          />
          </div>
          
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
              onShowTutorialAtStep={(step) => { setTutorialInitialStep(step); setShowTutorial(true); }}
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
      
      {/* Tutorial Modal */}
      <Tutorial 
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        initialStep={tutorialInitialStep}
      />

      {/* Quest Completion Modal */}
      <QuestCompletionModal
        isOpen={showQuestComplete}
        onClose={() => { setShowQuestComplete(false); setQuestRewardUrl(null); setLastCompletedQuestId(null); }}
        questTitle={lastCompletedQuestId ? (questsApi.getQuestById(lastCompletedQuestId)?.title || 'Quest') : 'Quest'}
        completionText={lastCompletedQuestId ? questsApi.getQuestById(lastCompletedQuestId)?.completionText : ''}
        rewardUrl={questRewardUrl}
      />

      {/* Quest Failure Modal */}
      <QuestFailureModal
        isOpen={showQuestFailed}
        onClose={() => { setShowQuestFailed(false); setLastCompletedQuestId(null); }}
        questTitle={lastCompletedQuestId ? (questsApi.getQuestById(lastCompletedQuestId)?.title || 'Quest') : 'Quest'}
        failureText={lastCompletedQuestId ? questsApi.getQuestById(lastCompletedQuestId)?.failureText : ''}
        failureLootUrl={lastCompletedQuestId ? questsApi.getQuestById(lastCompletedQuestId)?.failureLootUrl : ''}
      />
      
      {/* Loot Modal */}
      <LootModal 
        isOpen={lootSystem.pendingLoot.length > 0} 
        loot={lootSystem.pendingLoot}
        onClaimAll={() => {
          lootSystem.claimLoot(character, setCharacter);
          playSound('success');
        }}
        onClose={() => lootSystem.clearPendingLoot()}
      />
      
      {/* Achievement Notifications */}
      <AchievementNotification achievementTracking={achievementTracking} />
      
      </main>
    </div>
  );
}

export default App;
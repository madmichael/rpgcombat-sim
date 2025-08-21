import React from 'react';

const GameActions = ({ 
  fightStatus, 
  summary, 
  character, 
  monster,
  selectedChallenge,
  onFindAnotherMonster, 
  onRestartFight,
  playSound 
}) => {
  const handleFindAnotherMonster = () => {
    if (playSound) {
      playSound('swoosh');
    }
    onFindAnotherMonster();
  };

  return (
    <>
      
    </>
  );
};

export default GameActions;

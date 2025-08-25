import React, { useEffect, useMemo, useState } from 'react';
import { useSkillChallenge } from '../../hooks/useSkillChallenge';

export default function SkillChallenge({ gameState, questId, challenge, onResolved }) {
  const { rollChallenge, computeDC } = useSkillChallenge(gameState);
  const [result, setResult] = useState(null);
  const [rolled, setRolled] = useState(false);

  // Reset state when challenge changes (e.g., moving to next step)
  useEffect(() => {
    setRolled(false);
    setResult(null);
  }, [challenge?.id]);

  const dc = useMemo(() => {
    const character = gameState?.character;
    const level = character?.level;
    return computeDC({
      difficulty: challenge?.difficulty || 'standard',
      baseDC: challenge?.baseDC,
      level,
      gearAttackBonus: 0 // computed internally in rollChallenge; shown here for display only
    });
  }, [challenge, computeDC, gameState?.character]);

  if (!challenge) return null;

  const handleRoll = () => {
    const r = rollChallenge(challenge);
    setResult(r);
    setRolled(true);
  };

  const handleContinue = () => {
    if (!result) return;
    onResolved?.(result?.appliedBossMods || {}, !!result?.success, result);
  };

  return (
    <div className="skill-challenge" style={{ border: '1px dashed #666', borderRadius: 8, padding: 12 }}>
      <div style={{ fontWeight: 700 }}>{challenge.title}</div>
      <div style={{ color: '#aaa', marginBottom: 6 }}>{challenge.description}</div>
      <div>
        Ability: <strong>{challenge.ability}</strong> • Difficulty: <strong>{challenge.difficulty || 'standard'}</strong> • DC: <strong>{dc}</strong>
      </div>

      {!rolled && (
        <button style={{ marginTop: 8 }} onClick={handleRoll}>Roll</button>
      )}

      {rolled && result && (
        <div style={{ marginTop: 8 }}>
          <div>Roll: {result.raw} + {result.abilityMod} = <strong>{result.total}</strong> vs DC {result.dc} — {result.success ? 'Success' : 'Failure'}</div>
          {(result.success && challenge.successText) && (
            <div style={{ marginTop: 6, color: '#cfe9cf' }}>{challenge.successText}</div>
          )}
          {(!result.success && challenge.failureText) && (
            <div style={{ marginTop: 6, color: '#f2c0c0' }}>{challenge.failureText}</div>
          )}
          <div style={{ marginTop: 8 }}>
            <button onClick={handleContinue}>Continue</button>
          </div>
        </div>
      )}
    </div>
  );
}

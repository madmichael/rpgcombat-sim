import { useEffect, useState, useCallback } from 'react';

// Local storage helpers
const LS_KEYS = {
  progress: (questId) => `quests.progress.${questId}`,
  completed: (questId) => `quests.completed.${questId}`
};

function loadJson(path) {
  return fetch(path).then(r => {
    if (!r.ok) throw new Error(`Failed to load ${path}`);
    return r.json();
  });
}

// Merge and normalize boss modifiers
function mergeBossMods(a = {}, b = {}) {
  const out = { ...a };
  const numericFields = [
    'bossACDelta',
    'bossAttackBonusDelta',
    'bossHpDelta'
  ];
  for (const f of numericFields) {
    if (b[f] !== undefined) out[f] = (out[f] || 0) + Number(b[f]);
  }
  // Damage handling: support replacement or additive bonus string
  if (b.damageOverride) out.damageOverride = b.damageOverride;
  if (b.bossDamageDice) {
    // concatenate additive dice bonuses like "+1d3"
    out.bossDamageDice = (out.bossDamageDice || '') + String(b.bossDamageDice);
  }
  // Status durations: keep the max
  const statusFields = ['blindedDuration', 'proneDuration', 'ongoingDamage', 'ongoingDamageDuration'];
  for (const f of statusFields) {
    if (b[f] !== undefined) out[f] = Math.max(out[f] || 0, Number(b[f]));
  }
  return out;
}

export function useQuests() {
  const [quests, setQuests] = useState([]);
  const [bosses, setBosses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      loadJson('/data/quests.json'),
      loadJson('/data/quest_bosses.json')
    ])
      .then(([q, b]) => {
        if (!mounted) return;
        setQuests(q.quests || []);
        setBosses(b.bosses || []);
        setLoading(false);
      })
      .catch(err => {
        if (!mounted) return;
        setError(err);
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const listQuests = useCallback(() => quests, [quests]);

  const getQuestById = useCallback((questId) => {
    return quests.find(q => q.id === questId) || null;
  }, [quests]);

  const getBossDefinition = useCallback((bossRef) => {
    if (!bossRef) return null;
    return bosses.find(b => b.id === bossRef.bossId) || null;
  }, [bosses]);

  const getProgress = useCallback((questId) => {
    try {
      const raw = localStorage.getItem(LS_KEYS.progress(questId));
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  }, []);

  const saveProgress = useCallback((questId, progress) => {
    localStorage.setItem(LS_KEYS.progress(questId), JSON.stringify(progress));
  }, []);

  const clearProgress = useCallback((questId) => {
    localStorage.removeItem(LS_KEYS.progress(questId));
  }, []);

  const getCompletion = useCallback((questId) => {
    try {
      const raw = localStorage.getItem(LS_KEYS.completed(questId));
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  }, []);

  const markCompleted = useCallback((questId, rewardUrl) => {
    const completed = { questId, completedAt: new Date().toISOString(), rewardUrl };
    localStorage.setItem(LS_KEYS.completed(questId), JSON.stringify(completed));
    clearProgress(questId);
    return completed;
  }, [clearProgress]);

  const startQuest = useCallback((questId) => {
    const quest = getQuestById(questId);
    if (!quest) throw new Error('Quest not found');
    const progress = {
      questId,
      stepIndex: 0,
      bossModsAccum: {},
      outcomes: [],
      startedAt: new Date().toISOString()
    };
    saveProgress(questId, progress);
    return progress;
  }, [getQuestById, saveProgress]);

  const aggregateBossMods = useCallback((questId) => {
    const progress = getProgress(questId);
    return progress?.bossModsAccum || {};
  }, [getProgress]);

  const recordChallengeOutcome = useCallback((questId, challengeId, success, mods) => {
    const progress = getProgress(questId);
    if (!progress) return null;
    const quest = getQuestById(questId);
    const stepIndex = Math.min(progress.stepIndex, (quest?.challenges?.length || 1) - 1);
    const nextMods = mergeBossMods(progress.bossModsAccum, mods || {});
    const outcomes = Array.isArray(progress.outcomes) ? progress.outcomes.slice() : [];
    outcomes.push({ challengeId, success });
    const next = {
      ...progress,
      stepIndex: stepIndex + 1,
      bossModsAccum: nextMods,
      lastOutcome: { challengeId, success },
      outcomes
    };
    saveProgress(questId, next);
    return next;
  }, [getProgress, getQuestById, saveProgress]);

  const abortQuest = useCallback((questId) => {
    clearProgress(questId);
  }, [clearProgress]);

  return {
    loading,
    error,
    listQuests,
    getQuestById,
    getBossDefinition,
    getProgress,
    startQuest,
    recordChallengeOutcome,
    aggregateBossMods,
    markCompleted,
    getCompletion,
    abortQuest
  };
}

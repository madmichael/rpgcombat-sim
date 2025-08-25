import React from 'react';
import { useQuests } from '../../hooks/useQuests';
import QuestCard from './QuestCard';

export default function QuestBoard({ onViewQuest, onStartQuest }) {
  const { loading, error, listQuests } = useQuests();
  const quests = listQuests();

  if (loading) return <div>Loading quests...</div>;
  if (error) return <div style={{ color: 'salmon' }}>Failed to load quests.</div>;

  return (
    <div className="quest-board" style={{ display: 'grid', gap: 12 }}>
      {quests.map(q => (
        <QuestCard key={q.id} quest={q} onView={onViewQuest} onStart={onStartQuest} />
      ))}
      {quests.length === 0 && <div>No quests available yet.</div>}
    </div>
  );
}

import React from 'react';
import { useQuests } from '../../hooks/useQuests';

export default function QuestDetail({ questId, onStart }) {
  const { getQuestById } = useQuests();
  const quest = getQuestById(questId);

  if (!quest) return <div>Quest not found.</div>;
  const cover = quest.product?.coverImage;
  const logo = quest.publisherLogo;

  return (
    <div className="quest-detail" style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 16 }}>
        {cover && (
          <img src={cover} alt={quest.title} style={{ width: 160, height: 160, objectFit: 'cover', borderRadius: 8 }} />
        )}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ margin: '4px 0' }}>{quest.title}</h2>
            {logo && (
              <img src={logo} alt={`${quest.publisher} logo`} style={{ height: 24, objectFit: 'contain', marginLeft: 'auto' }} />
            )}
          </div>
          <div style={{ color: '#bbb' }}>{quest.publisher}</div>
          <p style={{ marginTop: 8 }}>{quest.summary}</p>
          {quest.longDescription && (
            <p style={{ marginTop: 6, color: '#ddd' }}>{quest.longDescription}</p>
          )}
          {quest.product?.externalUrl && (
            <a href={quest.product.externalUrl} target="_blank" rel="noreferrer">Product page</a>
          )}
        </div>
      </div>

      <div>
        <h3>Challenges</h3>
        <ol>
          {(quest.challenges || []).map(ch => (
            <li key={ch.id}>
              <strong>{ch.title}</strong> — {ch.description} ({ch.ability}; {ch.difficulty || 'standard'})
              {(ch.successText || ch.failureText) && (
                <div style={{ marginTop: 4, color: '#aaa' }}>
                  {ch.successText && (
                    <div><em>On success:</em> {ch.successText}</div>
                  )}
                  {ch.failureText && (
                    <div><em>On failure:</em> {ch.failureText}</div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>

      <div>
        <h3>Boss</h3>
        <div>{quest.bossRef?.bossId}</div>
      </div>

      <div>
        <h3>Reward</h3>
        <div>Static discount link provided upon completion.</div>
      </div>

      {(quest.failureText || quest.failureLootUrl) && (
        <div>
          <h3>On Failure</h3>
          {quest.failureText && <p style={{ color: '#ccc' }}>{quest.failureText}</p>}
          {quest.failureLootUrl && (
            <div>
              Consolation reward: <a href={quest.failureLootUrl} target="_blank" rel="noreferrer">{quest.failureLootUrl}</a>
            </div>
          )}
        </div>
      )}

      <div>
        <button onClick={() => onStart?.(quest.id)}>Start Quest</button>
      </div>
    </div>
  );
}

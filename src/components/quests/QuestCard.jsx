import React from 'react';

export default function QuestCard({ quest, onView, onStart }) {
  if (!quest) return null;
  const cover = quest.product?.coverImage;
  const logo = quest.publisherLogo;
  return (
    <div className="quest-card" style={{ border: '1px solid #444', borderRadius: 8, padding: 12, display: 'flex', gap: 12 }}>
      {cover && (
        <img src={cover} alt={quest.title} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 6 }} />
      )}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{quest.title}</div>
          {logo && (
            <img src={logo} alt={`${quest.publisher} logo`} style={{ height: 20, objectFit: 'contain', marginLeft: 'auto' }} />
          )}
        </div>
        <div style={{ color: '#bbb', fontSize: 12 }}>{quest.publisher}</div>
        <div style={{ marginTop: 6 }}>{quest.summary}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button onClick={() => onView?.(quest.id)}>View</button>
          <button onClick={() => onStart?.(quest.id)}>Start</button>
        </div>
      </div>
    </div>
  );
}

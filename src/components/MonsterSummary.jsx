import React from 'react';

const MonsterSummary = ({ monster }) => {
  if (!monster) return null;
  // Use correct fields for custom and SRD monsters
  const maxHp = Number(monster.maxHp ?? monster.hp ?? 0);
  const currentHp = Number(monster.hp ?? 0);
  const hpPercent = maxHp > 0 ? Math.max(0, Math.min(100, Math.round((currentHp / maxHp) * 100))) : 0;
  const AC = monster["Armor Class"] || monster.armor || 'N/A';
  const attackType = monster.AttackType ? monster.AttackType : (monster.attack ? 'Weapon' : '');
  const attackBonus = typeof monster.Attack === 'string' ? monster.Attack : (monster.attack || '');
  const damage = monster.Damage || monster.damage || '';
  return (
    <div style={{border: '1px solid #ccc', padding: '1em', margin: '1em 0'}}>
      <h3>Monster Summary</h3>
      <div style={{ margin: '0.5em 0' }}>
        <strong>HP:</strong> {currentHp} / {maxHp}
        <div style={{ background: '#eee', borderRadius: '6px', height: '18px', width: '100%', marginTop: '4px', boxShadow: 'inset 0 1px 2px #aaa' }}>
          <div style={{ width: `${hpPercent}%`, height: '100%', background: hpPercent > 50 ? '#4caf50' : hpPercent > 20 ? '#ff9800' : '#f44336', borderRadius: '6px', transition: 'width 0.3s' }} />
        </div>
      </div>
      <div><strong>AC:</strong> {AC}</div>
      <div><strong>Attack Type:</strong> {attackType}</div>
      <div><strong>Attack Bonus:</strong> {attackBonus}</div>
      <div><strong>Damage:</strong> {damage}</div>
    </div>
  );
};

export default MonsterSummary;

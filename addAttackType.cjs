const fs = require('fs');

function addAttackTypeToMonsters(inputPath, outputPath) {
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  data.forEach(monster => {
    if (monster.Actions) {
      const match = monster.Actions.match(/<strong>([A-Za-z ]+)\.<\/strong>/);
      monster.AttackType = match ? match[1].trim() : null;
    } else {
      monster.AttackType = null;
    }
  });
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
}

// Usage:
addAttackTypeToMonsters(
  'src/data/dnd_srd_monsters.json',
  'src/data/dnd_srd_monsters_with_attacktype.json'
);
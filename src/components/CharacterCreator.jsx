import React, { useState } from 'react';
import birthAugers from '../data/birth_augers.json';

const abilities = [
  'Strength',
  'Intelligence',
  'Agility',
  'Stamina',
  'Personality',
  'Luck'
];

const alignments = ['Law', 'Neutral', 'Chaos'];

// Ability modifiers table from src/data/ability_modifiers.json
const abilityModifiers = [
  { score: 3, mod: -3 },
  { score: 4, mod: -2 },
  { score: 5, mod: -2 },
  { score: 6, mod: -1 },
  { score: 7, mod: -1 },
  { score: 8, mod: 0 },
  { score: 9, mod: 0 },
  { score: 10, mod: 0 },
  { score: 11, mod: 0 },
  { score: 12, mod: 0 },
  { score: 13, mod: 1 },
  { score: 14, mod: 1 },
  { score: 15, mod: 1 },
  { score: 16, mod: 2 },
  { score: 17, mod: 2 },
  { score: 18, mod: 3 }
];

const occupations = [
  { Roll: "01", Occupation: "Alchemist", "Trained Weapon": "Staff", "Trade Goods": "Oil, 1 flask", weapontype: "staff" },
  { Roll: "02", Occupation: "Animal trainer", "Trained Weapon": "Club", "Trade Goods": "Pony", weapontype: "club" },
  { Roll: "03", Occupation: "Armorer", "Trained Weapon": "Hammer (as club)", "Trade Goods": "Iron helmet", weapontype: "club" },
  { Roll: "04", Occupation: "Astrologer", "Trained Weapon": "Dagger", "Trade Goods": "Spyglass", weapontype: "dagger" },
  { Roll: "05", Occupation: "Barber", "Trained Weapon": "Razor (as dagger)", "Trade Goods": "Scissors", weapontype: "dagger" },
  { Roll: "06", Occupation: "Beadle", "Trained Weapon": "Staff", "Trade Goods": "Holy symbol", weapontype: "staff" },
  { Roll: "07", Occupation: "Beekeeper", "Trained Weapon": "Staff", "Trade Goods": "Jar of honey", weapontype: "staff" },
  { Roll: "08", Occupation: "Blacksmith", "Trained Weapon": "Hammer (as club)", "Trade Goods": "Steel tongs", weapontype: "club" },
  { Roll: "09", Occupation: "Butcher", "Trained Weapon": "Cleaver (as axe)", "Trade Goods": "Side of beef", weapontype: "axe" },
  { Roll: "10", Occupation: "Caravan guard", "Trained Weapon": "Short sword", "Trade Goods": "Linen, 1 yard", weapontype: "Short sword" },
  { Roll: "11", Occupation: "Cheesemaker", "Trained Weapon": "Cudgel (as staff)", "Trade Goods": "Stinky cheese", weapontype: "staff" },
  { Roll: "12", Occupation: "Cobbler", "Trained Weapon": "Awl (as dagger)", "Trade Goods": "Shoehorn", weapontype: "dagger" },
  { Roll: "13", Occupation: "Confidence artist", "Trained Weapon": "Dagger", "Trade Goods": "Quality cloak", weapontype: "dagger" },
  { Roll: "14", Occupation: "Cooper", "Trained Weapon": "Crowbar (as club)", "Trade Goods": "Barrel", weapontype: "club" },
  { Roll: "15", Occupation: "Costermonger", "Trained Weapon": "Knife (as dagger)", "Trade Goods": "Fruit", weapontype: "dagger" },
  { Roll: "16", Occupation: "Cutpurse", "Trained Weapon": "Dagger", "Trade Goods": "Small chest", weapontype: "dagger" },
  { Roll: "17", Occupation: "Ditch digger", "Trained Weapon": "Shovel (as staff)", "Trade Goods": "Fine dirt, 1 lb.", weapontype: "staff" },
  { Roll: "18", Occupation: "Dock worker", "Trained Weapon": "Pole (as staff)", "Trade Goods": "1 late RPG book", weapontype: "staff" },
  { Roll: "19", Occupation: "Dwarven apothecarist", "Trained Weapon": "Cudgel (as staff)", "Trade Goods": "Steel vial", weapontype: "staff" },
  { Roll: "20", Occupation: "Dwarven blacksmith", "Trained Weapon": "Hammer (as club)", "Trade Goods": "Mithril, 1 oz", weapontype: "club" },
  { Roll: "21", Occupation: "Dwarven chest-maker", "Trained Weapon": "Chisel (as dagger)", "Trade Goods": "Wood, 10 lbs.", weapontype: "dagger" },
  { Roll: "22", Occupation: "Dwarven herder", "Trained Weapon": "Staff", "Trade Goods": "Sow", weapontype: "staff" },
  { Roll: "23-24", Occupation: "Dwarven miner", "Trained Weapon": "Pick (as club)", "Trade Goods": "Lantern", weapontype: "club" },
  { Roll: "25", Occupation: "Dwarven mushroom-farmer", "Trained Weapon": "Shovel (as staff)", "Trade Goods": "Sack", weapontype: "staff" },
  { Roll: "26", Occupation: "Dwarven rat-catcher", "Trained Weapon": "Club", "Trade Goods": "Net", weapontype: "club" },
  { Roll: "27-28", Occupation: "Dwarven stonemason", "Trained Weapon": "Hammer", "Trade Goods": "Fine stone, 10 lbs.", weapontype: "Hammer" },
  { Roll: "29", Occupation: "Elven artisan", "Trained Weapon": "Staff", "Trade Goods": "Clay, 1 lb.", weapontype: "staff" },
  { Roll: "30", Occupation: "Elven barrister", "Trained Weapon": "Quill (as dart)", "Trade Goods": "Book", weapontype: "dart" },
  { Roll: "31", Occupation: "Elven chandler", "Trained Weapon": "Scissors (as dagger)", "Trade Goods": "Candles, 20", weapontype: "dagger" },
  { Roll: "32", Occupation: "Elven falconer", "Trained Weapon": "Dagger", "Trade Goods": "Falcon", weapontype: "dagger" },
  { Roll: "33-34", Occupation: "Elven forester", "Trained Weapon": "Staff", "Trade Goods": "Herbs, 1 lb.", weapontype: "staff" },
  { Roll: "35", Occupation: "Elven glassblower", "Trained Weapon": "Hammer (as club)", "Trade Goods": "Glass beads", weapontype: "club" },
  { Roll: "36", Occupation: "Elven navigator", "Trained Weapon": "Shortbow", "Trade Goods": "Spyglass", weapontype: "Shortbow" },
  { Roll: "37-38", Occupation: "Elven sage", "Trained Weapon": "Dagger", "Trade Goods": "Parchment and quill pen", weapontype: "dagger" },
  { Roll: "39-47", Occupation: "Farmer", "Trained Weapon": "Pitchfork (as spear)", "Trade Goods": "Hen", weapontype: "spear" },
  { Roll: "48", Occupation: "Fortune-teller", "Trained Weapon": "Dagger", "Trade Goods": "Tarot deck", weapontype: "dagger" },
  { Roll: "49", Occupation: "Gambler", "Trained Weapon": "Club", "Trade Goods": "Dice", weapontype: "club" },
  { Roll: "50", Occupation: "Gongfarmer", "Trained Weapon": "Trowel (as dagger)", "Trade Goods": "Sack of night soil", weapontype: "dagger" },
  { Roll: "51-52", Occupation: "Grave digger", "Trained Weapon": "Shovel (as staff)", "Trade Goods": "Trowel", weapontype: "staff" },
  { Roll: "53-54", Occupation: "Guild beggar", "Trained Weapon": "Sling", "Trade Goods": "Crutches", weapontype: "Sling" },
  { Roll: "55", Occupation: "Halfling chicken butcher", "Trained Weapon": "Hand axe", "Trade Goods": "Chicken meat, 5 lbs.", weapontype: "Hand axe" },
  { Roll: "56-57", Occupation: "Halfling dyer", "Trained Weapon": "Staff", "Trade Goods": "Fabric, 3 yards", weapontype: "staff" },
  { Roll: "58", Occupation: "Halfling glovemaker", "Trained Weapon": "Awl (as dagger)", "Trade Goods": "Gloves, 4 pairs", weapontype: "dagger" },
  { Roll: "59", Occupation: "Halfling gypsy", "Trained Weapon": "Sling", "Trade Goods": "Hex doll", weapontype: "Sling" },
  { Roll: "60", Occupation: "Halfling haberdasher", "Trained Weapon": "Scissors (as dagger)", "Trade Goods": "Fine suits, 3 sets", weapontype: "dagger" },
  { Roll: "61", Occupation: "Halfling mariner", "Trained Weapon": "Knife (as dagger)", "Trade Goods": "Sailcloth, 2 yards", weapontype: "dagger" },
  { Roll: "62", Occupation: "Halfling moneylender", "Trained Weapon": "Short sword", "Trade Goods": "5 gp, 10 sp, 200 cp", weapontype: "Short sword" },
  { Roll: "63", Occupation: "Halfling trader", "Trained Weapon": "Short sword", "Trade Goods": "20 sp", weapontype: "Short sword" },
  { Roll: "64", Occupation: "Halfling vagrant", "Trained Weapon": "Club", "Trade Goods": "Begging bowl", weapontype: "club" },
  { Roll: "65", Occupation: "Healer", "Trained Weapon": "Club", "Trade Goods": "Holy water, 1 vial", weapontype: "club" },
  { Roll: "66", Occupation: "Herbalist", "Trained Weapon": "Club", "Trade Goods": "Herbs, 1 lb.", weapontype: "club" },
  { Roll: "67", Occupation: "Herder", "Trained Weapon": "Staff", "Trade Goods": "Herding dog", weapontype: "staff" },
  { Roll: "68-69", Occupation: "Hunter", "Trained Weapon": "Shortbow", "Trade Goods": "Deer pelt", weapontype: "Shortbow" },
  { Roll: "70", Occupation: "Indentured servant", "Trained Weapon": "Staff", "Trade Goods": "Locket", weapontype: "staff" },
  { Roll: "71", Occupation: "Jester", "Trained Weapon": "Dart", "Trade Goods": "Silk clothes", weapontype: "Dart" },
  { Roll: "72", Occupation: "Jeweler", "Trained Weapon": "Dagger", "Trade Goods": "Gem worth 20 gp", weapontype: "dagger" },
  { Roll: "73", Occupation: "Locksmith", "Trained Weapon": "Dagger", "Trade Goods": "Fine tools", weapontype: "dagger" },
  { Roll: "74", Occupation: "Mendicant", "Trained Weapon": "Club", "Trade Goods": "Cheese dip", weapontype: "club" },
  { Roll: "75", Occupation: "Mercenary", "Trained Weapon": "Longsword", "Trade Goods": "Hide armor", weapontype: "Longsword" },
  { Roll: "76", Occupation: "Merchant", "Trained Weapon": "Dagger", "Trade Goods": "4 gp, 14 sp, 27 cp", weapontype: "dagger" },
  { Roll: "77", Occupation: "Miller/baker", "Trained Weapon": "Club", "Trade Goods": "Flour, 1 lb.", weapontype: "club" },
  { Roll: "78", Occupation: "Minstrel", "Trained Weapon": "Dagger", "Trade Goods": "Ukulele", weapontype: "dagger" },
  { Roll: "79", Occupation: "Noble", "Trained Weapon": "Longsword", "Trade Goods": "Gold ring worth 10 gp", weapontype: "Longsword" },
  { Roll: "80", Occupation: "Orphan", "Trained Weapon": "Club", "Trade Goods": "Rag doll", weapontype: "club" },
  { Roll: "81", Occupation: "Ostler", "Trained Weapon": "Staff", "Trade Goods": "Bridle", weapontype: "staff" },
  { Roll: "82", Occupation: "Outlaw", "Trained Weapon": "Short sword", "Trade Goods": "Leather armor", weapontype: "Short sword" },
  { Roll: "83", Occupation: "Rope maker", "Trained Weapon": "Knife (as dagger)", "Trade Goods": "Rope, 100'", weapontype: "dagger" },
  { Roll: "84", Occupation: "Scribe", "Trained Weapon": "Dart", "Trade Goods": "Parchment, 10 sheets", weapontype: "Dart" },
  { Roll: "85", Occupation: "Shaman", "Trained Weapon": "Mace", "Trade Goods": "Herbs, 1 lb.", weapontype: "Mace" },
  { Roll: "86", Occupation: "Slave", "Trained Weapon": "Club", "Trade Goods": "Strange-looking rock", weapontype: "club" },
  { Roll: "87", Occupation: "Smuggler", "Trained Weapon": "Sling", "Trade Goods": "Waterproof sack", weapontype: "Sling" },
  { Roll: "88", Occupation: "Soldier", "Trained Weapon": "Spear", "Trade Goods": "Shield", weapontype: "Spear" },
  { Roll: "89-90", Occupation: "Squire", "Trained Weapon": "Longsword", "Trade Goods": "Steel helmet", weapontype: "Longsword" },
  { Roll: "91", Occupation: "Tax collector", "Trained Weapon": "Longsword", "Trade Goods": "100 cp", weapontype: "Longsword" },
  { Roll: "92-93", Occupation: "Trapper", "Trained Weapon": "Sling", "Trade Goods": "Badger pelt", weapontype: "Sling" },
  { Roll: "94", Occupation: "Urchin", "Trained Weapon": "Stick (as club)", "Trade Goods": "Begging bowl", weapontype: "club" },
  { Roll: "95", Occupation: "Wainwright", "Trained Weapon": "Club", "Trade Goods": "Pushcart", weapontype: "club" },
  { Roll: "96", Occupation: "Weaver", "Trained Weapon": "Dagger", "Trade Goods": "Fine suit of clothes", weapontype: "dagger" },
  { Roll: "97", Occupation: "Wizard's apprentice", "Trained Weapon": "Dagger", "Trade Goods": "Black grimoire", weapontype: "dagger" },
  { Roll: "98-100", Occupation: "Woodcutter", "Trained Weapon": "Handaxe", "Trade Goods": "Bundle of wood", weapontype: "Handaxe" }
];

// Weapons data (from src/data/weapons.json)
const weapons = [
  { weapon: "Battleaxe", damage: "1d10" },
  { weapon: "Bastard sword", damage: "1d8" },
  { weapon: "Blackjack", damage: "1d3" },
  { weapon: "Brass knuckles", damage: "1d4" },
  { weapon: "Cestus", damage: "1d5" },
  { weapon: "Club", damage: "1d4" },
  { weapon: "Dagger", damage: "1d4" },
  { weapon: "Flail", damage: "1d6" },
  { weapon: "Garrote", damage: "1" },
  { weapon: "Handaxe", damage: "1d6" },
  { weapon: "Heavy flail", damage: "1d12" },
  { weapon: "Hunting spear", damage: "1d8" },
  { weapon: "Katana", damage: "1d8" },
  { weapon: "Kris", damage: "1d5" },
  { weapon: "Lance", damage: "2d12" },
  { weapon: "Longspear", damage: "1d10" },
  { weapon: "Longsword", damage: "1d8" },
  { weapon: "Mace", damage: "1d6" },
  { weapon: "Maul", damage: "1d10" },
  { weapon: "Net", damage: "-" },
  { weapon: "Polearm", damage: "1d10" },
  { weapon: "Rapier", damage: "1d6" },
  { weapon: "Sabre", damage: "1d8" },
  { weapon: "Scimitar", damage: "1d7" },
  { weapon: "Short sword", damage: "1d6" },
  { weapon: "Spear", damage: "1d8" },
  { weapon: "Staff", damage: "1d4" },
  { weapon: "Two-handed sword", damage: "1d10" },
  { weapon: "Warhammer", damage: "1d8" },
  { weapon: "Whip", damage: "1d4" },
  { weapon: "Blowgun", damage: "1d3" },
  { weapon: "Crossbow", damage: "1d6" },
  { weapon: "Dart", damage: "1d4" },
  { weapon: "Hand crossbow", damage: "1d4" },
  { weapon: "Heavy crossbow", damage: "1d10" },
  { weapon: "Javelin", damage: "1d6" },
  { weapon: "Longbow", damage: "1d8" },
  { weapon: "Shortbow", damage: "1d6" },
  { weapon: "Shuriken", damage: "1d5" },
  { weapon: "Sling", damage: "1d4" }
];

function getModifier(score) {
  const found = abilityModifiers.find(a => a.score === score);
  return found ? found.mod : 0;
}

function roll3d6() {
  return Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1) + Math.floor(Math.random() * 6 + 1);
}

function roll1d4() {
  return Math.floor(Math.random() * 4 + 1);
}

const CharacterCreator = ({ onCreate }) => {
  // Helper to get random name from array
  function getRandomName(arr) {
    return arr.length ? arr[Math.floor(Math.random() * arr.length)] : '';
  }

  // Dice sound ref
  const diceRef = React.useRef(null);

  // State for names
  const [firstNames, setFirstNames] = useState([]);
  const [lastNames, setLastNames] = useState([]);

  // Load names on mount
  React.useEffect(() => {
    async function loadNames() {
      try {
        const first = await import('../data/names_first.json');
        const last = await import('../data/names_last.json');
        setFirstNames(Array.isArray(first.default) ? first.default : first);
        setLastNames(Array.isArray(last.default) ? last.default : last);
      } catch (e) {
        setFirstNames(["Aaren", "Abbie", "Ada"]);
        setLastNames(["Aaberg", "Abbott", "Abate"]);
      }
    }
    loadNames();
  }, []);
  // Helper for starting funds
  function roll5d12() {
    let total = 0;
    for (let i = 0; i < 5; i++) {
      total += Math.floor(Math.random() * 12) + 1;
    }
    return total;
  }
  function convertCoins(cp) {
    let remaining = cp;
    const pp = Math.floor(remaining / 10000); remaining %= 10000;
    const ep = Math.floor(remaining / 1000); remaining %= 1000;
    const gp = Math.floor(remaining / 100); remaining %= 100;
    const sp = Math.floor(remaining / 10); remaining %= 10;
    return { pp, ep, gp, sp, cp: remaining };
  }
  function getStartingFunds() {
    const rolledCp = roll5d12();
    const coins = convertCoins(rolledCp);
    return [
      coins.pp ? `${coins.pp} pp` : null,
      coins.ep ? `${coins.ep} ep` : null,
      coins.gp ? `${coins.gp} gp` : null,
      coins.sp ? `${coins.sp} sp` : null,
      coins.cp ? `${coins.cp} cp` : null
    ].filter(Boolean).join(', ');
  }
  function getLuckySign() {
    if (!birthAugers || !Array.isArray(birthAugers)) return '';
    const idx = Math.floor(Math.random() * birthAugers.length);
    const augur = birthAugers[idx];
    return `${augur.birth_augur} (${augur.lucky_roll})`;
  }
  function getLanguages(intMod) {
    const extraLanguagesList = ['Centaur', 'Giant', 'Gnome', 'Goblin', 'Kobold', 'Elf', 'Dwarf', 'Halfling'];
    let languagesArr = ['Common'];
    if (intMod > 0) {
      let shuffled = [...extraLanguagesList].sort(() => Math.random() - 0.5);
      languagesArr = languagesArr.concat(shuffled.slice(0, intMod));
    }
    return languagesArr.join(', ');
  }
  const [stats, setStats] = useState({});
  const [name, setName] = useState('');

  // When names are loaded, set a random name
  React.useEffect(() => {
    if (firstNames.length && lastNames.length && !name) {
      setName(`${getRandomName(firstNames)} ${getRandomName(lastNames)}`);
    }
  }, [firstNames, lastNames]);
  const [alignment, setAlignment] = useState('Law');
  const [hp, setHp] = useState(null);
  const [occupation, setOccupation] = useState(null);
  const [assignedWeapon, setAssignedWeapon] = useState(null);

  const handleRollStats = () => {
    // Play dice sound
    if (diceRef.current) {
      diceRef.current.currentTime = 0;
      diceRef.current.play();
    }
    const rolled = {};
    abilities.forEach(ab => {
      rolled[ab] = roll3d6();
    });
    setStats(rolled);
    // Roll HP using 1d4 + Stamina modifier, minimum 1
    const staminaMod = getModifier(rolled['Stamina']);
    const rolledHp = roll1d4() + staminaMod;
    setHp(Math.max(1, rolledHp));

    // Randomly select alignment
    const alignmentsArr = ['Law', 'Neutral', 'Chaos'];
    setAlignment(alignmentsArr[Math.floor(Math.random() * alignmentsArr.length)]);

    // Roll random occupation
    const occ = occupations[Math.floor(Math.random() * occupations.length)];
    setOccupation(occ);
    // Find weapon damage by occupation's weapontype or Trained Weapon from full weapons.json
    let weaponName = occ["Trained Weapon"];
    let weaponType = occ.weapontype;
    // Merge melee and ranged weapons from weapons.json
    let allWeapons = [];
    try {
      const weaponsData = require('../data/weapons.json');
      allWeapons = [...(weaponsData.melee_weapons || []), ...(weaponsData.ranged_weapons || [])];
    } catch (e) {
      allWeapons = weapons;
    }
    // Try to match ignoring extra text like '(as club)'
    function normalizeWeaponName(name) {
      return name.toLowerCase().replace(/\s*\(as [^)]+\)/, '').trim();
    }
    // If occupation weapon has (as X), match X to weapon.weapon
    let matchName = weaponName;
    const asMatch = weaponName.match(/\(as ([^)]+)\)/);
    if (asMatch) {
      matchName = asMatch[1];
    }
    let weaponData = allWeapons.find(w => normalizeWeaponName(w.weapon) === normalizeWeaponName(matchName));
    setAssignedWeapon({ name: weaponName, damage: weaponData ? weaponData.damage : '?' });

    // Generate new random name on stat roll
    if (firstNames.length && lastNames.length) {
      setName(`${getRandomName(firstNames)} ${getRandomName(lastNames)}`);
    }
  };

  const handleCreate = () => {
    if (!name || !stats['Strength']) return;
    const modifiers = Object.fromEntries(abilities.map(ab => [ab, getModifier(stats[ab])]));
    const startingFunds = getStartingFunds();
    const luckySign = getLuckySign();
    const languages = getLanguages(modifiers['Intelligence']);
    onCreate({
      name,
      alignment,
      ...stats,
      modifiers,
      hp,
      occupation,
      weapon: assignedWeapon,
      startingFunds,
      luckySign,
      languages
    });
  };

  const handleReset = () => {
    setStats({});
    setName('');
    setAlignment('Law');
    setHp(null);
    setOccupation(null);
    setAssignedWeapon(null);
  };

  return (
    <section aria-labelledby="character-creator-heading" className="character-creator">
      <audio ref={diceRef} src="/rolling-dice-2-102706.mp3" preload="auto" />
      
      <div className="character-creator-header">
        <h2 id="character-creator-heading" className="page-title">
          🎲 Create Zero Level Character
        </h2>
        <p className="page-subtitle">
          Roll the dice of fate to forge your adventurer's destiny
        </p>
      </div>

      <div className="character-creator-content">
        <div className="creation-card">
          <div className="card-header">
            <h3>🎯 Character Generation</h3>
            <p>Generate your character's stats, background, and starting equipment</p>
          </div>
          
          <div className="action-buttons" role="group" aria-label="Character creation actions">
            <button 
              onClick={handleRollStats} 
              className="btn btn-primary btn-large"
              aria-describedby="roll-stats-help"
            >
              🎲 Roll Stats
            </button>
            <button 
              onClick={handleReset} 
              className="btn btn-secondary"
              aria-label="Reset character creation form"
            >
              🔄 Reset
            </button>
          </div>
          <div id="roll-stats-help" className="sr-only">
            Generates random ability scores, HP, occupation, and weapon for your character
          </div>
        </div>

        <div className="details-card">
          <div className="card-header">
            <h3>⚔️ Character Details</h3>
            <p>Customize your character's identity</p>
          </div>
          
          <form aria-label="Character details" className="character-form">
            <div className="form-group">
              <label htmlFor="character-name" className="form-label">
                👤 Character Name
              </label>
              <input 
                id="character-name"
                className="form-input"
                value={name} 
                onChange={e => setName(e.target.value)}
                aria-required="true"
                aria-describedby="name-help"
                placeholder="Enter your character's name"
              />
              <div id="name-help" className="form-help">
                Enter your character's name or use the generated random name
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="character-alignment" className="form-label">
                ⚖️ Moral Alignment
              </label>
              <select 
                id="character-alignment"
                className="form-select"
                value={alignment} 
                onChange={e => setAlignment(e.target.value)}
                aria-describedby="alignment-help"
              >
                {alignments.map(al => <option key={al} value={al}>{al}</option>)}
              </select>
              <div id="alignment-help" className="form-help">
                Choose your character's moral alignment: Law, Neutral, or Chaos
              </div>
            </div>
          </form>
        </div>
      </div>
      {Object.keys(stats).length > 0 && (
        <div className="stats-card" aria-live="polite">
          <div className="card-header">
            <h3 id="character-stats-heading">📊 Generated Character Stats</h3>
            <p>Your character's abilities and background</p>
          </div>
          
          <div className="stats-grid">
            <div className="abilities-section">
              <h4>🎯 Ability Scores</h4>
              <div className="abilities-grid" role="list" aria-label="Character ability scores">
                {abilities.map(ab => (
                  <div key={ab} className="ability-item" role="listitem">
                    <span className="ability-name">{ab}</span>
                    <span className="ability-score">{stats[ab]}</span>
                    <span className="ability-modifier">
                      {getModifier(stats[ab]) >= 0 ? '+' : ''}{getModifier(stats[ab])}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="character-info">
              <div className="hp-display" aria-label="Hit Points">
                <span className="hp-label">❤️ Hit Points</span>
                <span className="hp-value">{hp}</span>
              </div>
              
              {occupation && (
                <div className="background-section" role="group" aria-labelledby="occupation-heading">
                  <h4 id="occupation-heading">🏺 Character Background</h4>
                  <div className="background-details">
                    <div className="background-item">
                      <strong>Occupation:</strong> {occupation.Occupation}
                    </div>
                    <div className="background-item">
                      <strong>Weapon:</strong> {assignedWeapon ? `${assignedWeapon.name} (${assignedWeapon.damage})` : occupation["Trained Weapon"]}
                    </div>
                    <div className="background-item">
                      <strong>Trade Good:</strong> {occupation["Trade Goods"]}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="create-section">
        <button 
          onClick={handleCreate} 
          disabled={!name || !stats['Strength']} 
          className={`btn btn-success btn-large create-character-btn ${(!name || !stats['Strength']) ? 'disabled' : ''}`}
          aria-label="Create character and proceed to game"
          aria-describedby="create-button-help"
        >
          ⚔️ Create Character & Begin Adventure
        </button>
        <div id="create-button-help" className="form-help">
          {!name || !stats['Strength'] ? 
            '⚠️ Please enter a name and roll stats before creating character' : 
            '✅ Ready to create your character and start your adventure!'
          }
        </div>
      </div>
    </section>
  );
};

export default CharacterCreator;

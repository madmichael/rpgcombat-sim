import React from 'react';

const Credits = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const credits = [
    {
      title: "Combat Rules",
      description: "Dungeon Crawl Classics RPG",
      url: "https://goodman-games.com/dungeon-crawl-classics-rpg/",
      icon: "⚔️"
    },
    {
      title: "Mighty Deeds",
      description: "inspired by the Mighty Peasant Deeds Book",
      url: "https://www.drivethrurpg.com/en/product/472605/mighty-peasant-deeds-book",
      icon: "🎭"
    },
    {
      title: "Monster Data",
      description: "D&D 5e SRD Monster JSON",
      url: "https://gist.github.com/tkfu/9819e4ac6d529e225e9fc58b358c3479",
      icon: "🐉"
    },
    {
      title: "Generic Monster Stats",
      description: "inspired by the Generic Monsters of Julio's RPG Cove",
      url: "https://juliosrpgcove.com/genericmonsters/",
      icon: "📊"
    },
    {
      title: "Character Name Generator",
      description: "name data from leganz Random Name Generator",
      url: "https://github.com/leganz/random-name-generator",
      icon: "📊"
    },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-container credits-modal">
        <button 
          onClick={onClose}
          className="modal-close"
          aria-label="Close credits"
        >
          ×
        </button>
        
        <div className="credits-header">
          <h3>Credits & Resources</h3>
          <p>This RPG Combat Simulator was built using resources from the amazing RPG community</p>
        </div>

        <div className="credits-content">
          <div className="credits-grid">
            {credits.map((credit, index) => (
              <div key={index} className="credit-item">
                <div className="credit-icon">{credit.icon}</div>
                <div className="credit-details">
                  <h4 className="credit-title">{credit.title}</h4>
                  <p className="credit-description">{credit.description}</p>
                  <a 
                    href={credit.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="credit-link"
                  >
                    Visit Resource →
                  </a>
                </div>
              </div>
            ))}
          </div>
          
          <div className="credits-footer">
            <div className="developer-credit">
              <h4>Developed with ❤️</h4>
              <p>Built as a tribute to the tabletop RPG community and the creators who make these amazing games possible.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Credits;

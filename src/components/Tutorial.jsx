import React, { useState, useEffect } from 'react';

// Simple tutorial modal using existing modal CSS classes (modal-overlay, modal-container, etc.)
const Tutorial = ({ isOpen, onClose, initialStep = 0 }) => {
  const [step, setStep] = useState(0);
  const slides = [
    {
      title: 'Welcome to the RPG Combat Simulator',
      body: (
        <>
          <p>This app simulates quick tabletop-style battles inspired by games like Dungeon Crawl Classics (DCC), Mighty Peasant Deeds, and more.</p>
          <p>No prior experience needed — follow a few steps to start fighting monsters!</p>
        </>
      )
    },
    {
      title: 'Core Concepts',
      body: (
        <>
          <ul className="list-indent">
            <li><strong>Character:</strong> Your hero has abilities (Strength, Agility, etc.), Hit Points (HP), and equipment.</li>
            <li><strong>Monster:</strong> The opponent you face. Each has Armor Class (AC) and Hit Dice (HD).</li>
            <li><strong>AC:</strong> Target number you must meet or beat on an attack roll to hit.</li>
            <li><strong>Attack Roll:</strong> Roll a d20 + modifiers; equal or exceed AC to hit.</li>
            <li><strong>Damage:</strong> Roll listed weapon damage on a hit.</li>
          </ul>
        </>
      )
    },
    {
      title: 'Turn Flow',
      body: (
        <>
          <ol className="list-indent">
            <li><strong>Initiative:</strong> Determines who acts first.</li>
            <li><strong>On Your Turn:</strong> Attack the monster or attempt a Mighty Deed (if available).</li>
            <li><strong>Luck:</strong> You can burn Luck to improve attack rolls when prompted.</li>
            <li><strong>Victory:</strong> Reduce the monster to 0 HP to win. Loot may drop!</li>
          </ol>
          <div className="tip-box">
            <strong>Mighty Deed examples:</strong> Trip, disarm, shove back, pin a shield, sunder a weapon, or strike a weak spot. Declare it, then roll — if your attack hits and your Deed Die shows 3+, the deed takes effect.
          </div>
        </>
      )
    },
    {
      title: 'Equipment and Funds',
      body: (
        <>
          <ul className="list-indent">
            <li><strong>Manage Gear:</strong> Click Manage in your character sheet to equip/buy/sell equipment.</li>
            <li><strong>Currency:</strong> Funds are shown as coins (gp/gold pieces, sp/silver pieces, cp/copper pieces). Prices are labeled in gp for convenience.</li>
            <li><strong>Haggling:</strong> Try to sell for a better price — but you may also do worse!</li>
          </ul>
        </>
      )
    },
    {
      title: 'Quick Start',
      body: (
        <>
          <ol className="list-indent">
            <li>Create a character with the form or load one from a URL.</li>
            <li>Click Find Another Monster to start a new encounter.</li>
            <li>Use the Combat Actions to fight, run, or adjust challenge.</li>
            <li>Open Stats, Achievements, or Credits from the floating buttons.</li>
          </ol>
          <p>Tip: Hover or click Details in the dashboard to see more info.</p>
        </>
      )
    }
  ];

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
    } else {
      // When opening, jump to requested step if provided
      const idx = Number.isInteger(initialStep) ? Math.max(0, Math.min(initialStep, slides.length - 1)) : 0;
      setStep(idx);
    }
  }, [isOpen, initialStep]);

  if (!isOpen) return null;

  const isLast = step === slides.length - 1;

  const handleClose = () => {
    try { localStorage.setItem('rpg_tutorial_seen', '1'); } catch {}
    onClose?.();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
      <div className="modal-container tutorial-modal">
        <div className="modal-header">
          <h2 id="tutorial-title">{slides[step].title}</h2>
          <button className="modal-close-btn" onClick={handleClose} aria-label="Close tutorial">×</button>
        </div>

        <div className="modal-content leading-relaxed">
          {slides[step].body}
        </div>

        <div className="modal-footer">
          <div className="modal-meta">Step {step + 1} of {slides.length}</div>
          <div className="modal-actions">
            <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="btn-secondary">Back</button>
            {!isLast && (
              <button onClick={() => setStep((s) => Math.min(slides.length - 1, s + 1))} className="btn-primary">Next</button>
            )}
            {isLast && (
              <button onClick={handleClose} className="btn-primary">Got it</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;

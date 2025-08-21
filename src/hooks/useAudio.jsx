import React, { useRef } from 'react';

export const useAudio = () => {
  const audioRefs = {
    danger: useRef(null),
    monsterAttack: useRef(null),
    swoosh: useRef(null),
    door: useRef(null),
    victory: useRef(null),
    block: useRef(null),
    slash: useRef(null),
    gong: useRef(null),
    dice: useRef(null)
  };

  const playSound = (soundName) => {
    const ref = audioRefs[soundName];
    if (ref && ref.current && ref.current.parentNode) {
      try {
        ref.current.currentTime = 0;
        const playPromise = ref.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            // Only log if it's not an AbortError from component unmounting
            if (e.name !== 'AbortError') {
              console.warn('Audio play failed:', e);
            }
          });
        }
      } catch (e) {
        console.warn('Audio play error:', e);
      }
    }
  };

  const AudioElements = () => (
    <>
      <audio ref={audioRefs.danger} src="/danger-257023.mp3" preload="auto" />
      <audio ref={audioRefs.monsterAttack} src="/monster-211717.mp3" preload="auto" />
      <audio ref={audioRefs.swoosh} src="/swoosh-142322.mp3" preload="auto" />
      <audio ref={audioRefs.door} src="/creaking-old-iron-door-193249.mp3" preload="auto" />
      <audio ref={audioRefs.victory} src="/victory.mp3" preload="auto" />
      <audio ref={audioRefs.block} src="/block.mp3" preload="auto" />
      <audio ref={audioRefs.slash} src="/slash.mp3" preload="auto" />
      <audio ref={audioRefs.gong} src="/gong.mp3" preload="auto" />
      <audio ref={audioRefs.dice} src="/rolling-dice-2-102706.mp3" preload="auto" />
    </>
  );

  return { playSound, AudioElements };
};

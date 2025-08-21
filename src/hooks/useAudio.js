import { useRef } from 'react';

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
    if (ref && ref.current) {
      ref.current.currentTime = 0;
      ref.current.play().catch(e => console.warn('Audio play failed:', e));
    }
  };

  const AudioElements = () => (
    <>
      <audio ref={audioRefs.danger} src="/danger-257023.mp3" preload="auto" />
      <audio ref={audioRefs.monsterAttack} src="/monster-211717.mp3" preload="auto" />
      <audio ref={audioRefs.swoosh} src="/swoosh-142322.mp3" preload="auto" />
      <audio ref={audioRefs.door} src="/creaking-old-iron-door-193249.mp3" preload="auto" />
      <audio ref={audioRefs.victory} src="/victory.mp3" preload="auto" />
      <audio ref={audioRefs.block} src="/public/block.mp3" preload="auto" />
      <audio ref={audioRefs.slash} src="/public/slash.mp3" preload="auto" />
      <audio ref={audioRefs.gong} src="/public/gong.mp3" preload="auto" />
      <audio ref={audioRefs.dice} src="/rolling-dice-2-102706.mp3" preload="auto" />
    </>
  );

  return { playSound, AudioElements };
};

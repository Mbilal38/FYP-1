// src/components/useSound.js
import { useEffect } from 'react';

const useSound = (src, volume = 1) => {
  useEffect(() => {
    const audio = new Audio(src);
    audio.volume = volume;
    const playPromise = audio.play();

    return () => {
      playPromise.then(() => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, [src, volume]);
};

export default useSound;
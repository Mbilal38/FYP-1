import { useEffect, useState } from 'react';
import useSound from './useSound';
import styles from './SplashScreen.module.css';

const SplashScreen = ({ onFinish }) => {
  const [displayText, setDisplayText] = useState('');
  const [animateV, setAnimateV] = useState(false);
  const fullText = 'VORTAX';

  // Play sound effect with improved timing
  useSound('/assets/sound.mpeg', 0.4);

  useEffect(() => {
    // Character by character animation with staggered delay
    const animationDelays = [0, 150, 300, 450, 600, 750];
    
    animationDelays.forEach((delay, index) => {
      setTimeout(() => {
        setDisplayText(prev => fullText.substring(0, index + 1));
        
        // Start V animation after last character appears
        if (index === fullText.length - 1) {
          setTimeout(() => {
            setAnimateV(true);
            // Finish after animation completes
            setTimeout(() => {
              onFinish();
            }, 1200);
          }, 300);
        }
      }, delay);
    });

    return () => {
      animationDelays.forEach(delay => clearTimeout(delay));
    };
  }, [onFinish]);

  return (
    <div className={styles.splashContainer}>
      <div className={styles.logoContainer}>
        {displayText.split('').map((char, index) => (
          <span 
            key={index}
            className={`${styles.logoChar} ${
              char === 'V' && animateV ? styles.animateV : ''
            }`}
            style={{
              animationDelay: `${index * 0.15}s`,
              color: index === 0 ? '#00eoff' : '#00e0ff'
            }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SplashScreen;
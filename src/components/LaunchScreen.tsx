// ============================================================
// THULIR AI — Premium Startup Screen
// ============================================================

import { useState, useEffect } from 'react';

interface LaunchScreenProps {
  onComplete: () => void;
}

export function LaunchScreen({ onComplete }: LaunchScreenProps) {
  const [fadeout, setFadeout] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeout(true), 1100);
    const completeTimer = setTimeout(() => onComplete(), 1450);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDismiss = () => {
    setFadeout(true);
    setTimeout(() => onComplete(), 50);
  };

  return (
    <div
      className={`launch-screen-backdrop ${fadeout ? 'launch-fade-out' : ''}`}
      onClick={handleDismiss}
      aria-hidden="true"
    >
      <div className="apple-launch-container">
        {/* Neural-Leaf Motif */}
        <svg
          width="52"
          height="52"
          viewBox="0 0 52 52"
          fill="none"
          style={{ margin: '0 auto 16px', display: 'block', opacity: 0.9 }}
        >
          <path
            d="M26 4C26 4 10 10 8 26C6 42 20 48 26 48C32 48 46 42 44 26C42 10 26 4 26 4Z"
            fill="none"
            stroke="#0F6B57"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Neural vein paths */}
          <path d="M26 10 L26 42" stroke="#0F6B57" strokeWidth="0.8" strokeOpacity="0.5" />
          <path d="M26 22 C20 22 14 20 12 16" stroke="#0F6B57" strokeWidth="0.6" strokeOpacity="0.35" />
          <path d="M26 28 C20 28 15 30 13 34" stroke="#0F6B57" strokeWidth="0.6" strokeOpacity="0.35" />
          <path d="M26 22 C32 22 38 20 40 16" stroke="#0F6B57" strokeWidth="0.6" strokeOpacity="0.35" />
          <path d="M26 28 C32 28 37 30 39 34" stroke="#0F6B57" strokeWidth="0.6" strokeOpacity="0.35" />
          <circle cx="26" cy="22" r="2.2" fill="#0F6B57" fillOpacity="0.7" />
          <circle cx="26" cy="28" r="1.8" fill="#0F6B57" fillOpacity="0.5" />
          <circle cx="19" cy="22" r="1.5" fill="#0F6B57" fillOpacity="0.35" />
          <circle cx="33" cy="22" r="1.5" fill="#0F6B57" fillOpacity="0.35" />
        </svg>

        <div className="apple-launch-wordmark">
          THULIR <span>AI</span>
        </div>
        <div className="apple-launch-subtext">
          Intelligent Mine Safety · Safer Mines. Smarter Decisions.
        </div>
        <div className="apple-launch-dot-progress">
          <span className="dot dot-1" />
          <span className="dot dot-2" />
          <span className="dot dot-3" />
        </div>
      </div>
    </div>
  );
}

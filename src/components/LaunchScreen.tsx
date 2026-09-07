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
        {/* THULIR AI Logo */}
        <div style={{ margin: '0 auto 18px', display: 'flex', justifyContent: 'center' }}>
          <img
            src="/logo.png"
            alt="THULIR AI Logo"
            width={64}
            height={64}
            style={{
              objectFit: 'contain',
              borderRadius: '12px',
              filter: 'drop-shadow(0 6px 16px rgba(16, 185, 129, 0.45))',
            }}
          />
        </div>

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

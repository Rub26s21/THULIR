// ============================================================
// THULIR - Premium Apple Startup Screen
// ============================================================

import { useState, useEffect } from 'react';

interface LaunchScreenProps {
  onComplete: () => void;
}

export function LaunchScreen({ onComplete }: LaunchScreenProps) {
  const [fadeout, setFadeout] = useState(false);

  useEffect(() => {
    // Smooth 600ms startup presentation, then 300ms fadeout
    const fadeTimer = setTimeout(() => {
      setFadeout(true);
    }, 600);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 900);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const handleDismiss = () => {
    setFadeout(true);
    setTimeout(() => {
      onComplete();
    }, 50);
  };

  return (
    <div
      className={`launch-screen-backdrop ${fadeout ? 'launch-fade-out' : ''}`}
      onClick={handleDismiss}
      style={{ cursor: 'pointer' }}
      aria-hidden="true"
    >
      <div className="apple-launch-container">
        <div className="apple-launch-wordmark">THULIR</div>
        <div className="apple-launch-subtext">Structural &amp; Environmental Early Warning System</div>
        <div className="apple-launch-dot-progress">
          <span className="dot dot-1" />
          <span className="dot dot-2" />
          <span className="dot dot-3" />
        </div>
      </div>
    </div>
  );
}

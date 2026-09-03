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
    // 1.1s smooth startup presentation
    const timer = setTimeout(() => {
      setFadeout(true);
      setTimeout(onComplete, 350);
    }, 1100);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`launch-screen-backdrop ${fadeout ? 'launch-fade-out' : ''}`}
      onClick={() => {
        setFadeout(true);
        setTimeout(onComplete, 120);
      }}
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

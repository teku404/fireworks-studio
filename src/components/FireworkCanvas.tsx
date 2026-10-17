import { useRef, useCallback } from 'react';
import { useFireworks } from '../hooks/useFireworks';
import { FireworkConfig } from '../types/firework';

interface Props {
  selectedConfig?: FireworkConfig;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export default function FireworkCanvas({ selectedConfig, soundEnabled, onToggleSound }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { launchAt, launchRandom, particleCount, clearAll } = useFireworks(canvasRef);

  const handleInteraction = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (selectedConfig) {
      launchAt(x, y, { ...selectedConfig, id: Math.random().toString(36).slice(2) });
    } else {
      launchRandom(x, y);
    }
  }, [selectedConfig, launchAt, launchRandom]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    handleInteraction(e.clientX, e.clientY);
  }, [handleInteraction]);

  const handleTouch = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      handleInteraction(t.clientX, t.clientY);
    }
  }, [handleInteraction]);

  return (
    <div
      className="relative w-full h-full cursor-crosshair"
      onClick={handleClick}
      onTouchStart={handleTouch}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
      />
      {/* Top bar overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <img src="/assets/app_icon.png" alt="logo" className="w-9 h-9 rounded-lg shadow-lg" />
          <h1 className="text-white/90 font-semibold text-lg tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Fireworks Studio
          </h1>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="text-white/40 text-xs font-mono">{particleCount > 0 ? particleCount : ''}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSound(); }}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
            title={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.5 8.5H4a1 1 0 00-1 1v5a1 1 0 001 1h2.5l4.5 4V4.5l-4.5 4z" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 5v14a1 1 0 01-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
            )}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); clearAll(); }}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
            title="Clear"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>

      {/* Tap hint */}
      {particleCount === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-pulse z-10">
          <div className="text-center">
            <div className="text-5xl mb-4 opacity-60">🎆</div>
            <p className="text-white/40 text-sm tracking-widest uppercase" style={{ fontFamily: 'Outfit, sans-serif' }}>Tap anywhere to launch</p>
          </div>
        </div>
      )}
    </div>
  );
}

import os
base = r'd:\APK to WEB\fireworks-studio\src'

def write_file(rel_path, content):
    full = os.path.join(base, rel_path.replace('/', os.sep))
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'OK: {rel_path}')

# Fix 1: Move click to wrapper div, use ref for canvas positioning
write_file('components/FireworkCanvas.tsx', """import { useRef, useCallback } from 'react';
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
            <div className="text-5xl mb-4 opacity-60">\U0001f386</div>
            <p className="text-white/40 text-sm tracking-widest uppercase" style={{ fontFamily: 'Outfit, sans-serif' }}>Tap anywhere to launch</p>
          </div>
        </div>
      )}
    </div>
  );
}
""")

# Fix 2: Stop updating particleCount at 60fps — throttle it
write_file('hooks/useFireworks.ts', """import { useRef, useEffect, useCallback, useState } from 'react';
import { FireworkEngine, createRandomConfig } from '../services/engine';
import { FireworkConfig } from '../types/firework';
import { soundEngine } from '../services/audio';

export function useFireworks(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const engineRef = useRef<FireworkEngine | null>(null);
  const [particleCount, setParticleCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const lastUpdate = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new FireworkEngine(canvas);
    engineRef.current = engine;

    // Throttle particle count updates to avoid excess re-renders
    engine.onParticleCount = (count: number) => {
      const now = Date.now();
      if (now - lastUpdate.current > 200 || count === 0) {
        lastUpdate.current = now;
        setParticleCount(count);
      }
    };

    engine.start();

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      engine.stop();
      engineRef.current = null;
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const launchAt = useCallback((x: number, y: number, config?: FireworkConfig) => {
    engineRef.current?.launch(x, y, config);
  }, []);

  const launchRandom = useCallback((x: number, y: number) => {
    engineRef.current?.launch(x, y, createRandomConfig());
  }, []);

  const clearAll = useCallback(() => {
    engineRef.current?.clear();
    setParticleCount(0);
  }, []);

  const toggleSound = useCallback(() => {
    const enabled = soundEngine.toggleMute();
    setSoundEnabled(enabled);
    return enabled;
  }, []);

  const setVolume = useCallback((v: number) => { soundEngine.setVolume(v); }, []);

  return { launchAt, launchRandom, clearAll, particleCount, toggleSound, soundEnabled, setVolume };
}
""")

# Fix 3: PresetPanel — stopPropagation on clicks so they don't trigger fireworks
write_file('components/PresetPanel.tsx', """import { PRESETS } from '../services/presets';
import { FireworkConfig } from '../types/firework';

interface Props {
  isOpen: boolean;
  onToggle: () => void;
  onSelectPreset: (config: FireworkConfig) => void;
  selectedId?: string;
  onAutoShow: (configs: FireworkConfig[]) => void;
}

export default function PresetPanel({ isOpen, onToggle, onSelectPreset, selectedId, onAutoShow }: Props) {
  return (
    <div
      className={`absolute bottom-0 left-0 right-0 z-20 transition-all duration-500 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-56px)]'}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Toggle bar */}
      <button
        onClick={onToggle}
        className="w-full h-14 flex items-center justify-center gap-2 bg-gradient-to-t from-black/80 to-black/40 backdrop-blur-xl border-t border-white/10 hover:border-white/20 transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 text-white/60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
        <span className="text-white/70 text-sm font-medium tracking-wide" style={{ fontFamily: 'Outfit, sans-serif' }}>Firework Presets</span>
      </button>

      {/* Panel content */}
      <div className="bg-black/85 backdrop-blur-xl px-4 pb-6 pt-2 max-h-[50vh] overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Random button */}
          <button
            onClick={() => onSelectPreset(undefined as any)}
            className={`group relative p-4 rounded-2xl border transition-all duration-300 ${
              !selectedId
                ? 'border-amber-400/60 bg-amber-400/10 shadow-lg shadow-amber-400/10'
                : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
            }`}
          >
            <div className="text-3xl mb-2">\U0001f3b2</div>
            <div className="text-white/90 text-sm font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>Random</div>
            <div className="text-white/40 text-xs mt-1">Surprise me!</div>
          </button>

          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                if (preset.configs.length > 1) {
                  onAutoShow(preset.configs);
                } else {
                  onSelectPreset(preset.configs[0]);
                }
              }}
              className={`group relative p-4 rounded-2xl border transition-all duration-300 ${
                selectedId === preset.configs[0]?.id
                  ? 'border-amber-400/60 bg-amber-400/10 shadow-lg shadow-amber-400/10'
                  : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="text-3xl mb-2">{preset.emoji}</div>
              <div className="text-white/90 text-sm font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>{preset.name}</div>
              <div className="text-white/40 text-xs mt-1 line-clamp-2">{preset.description}</div>
              {preset.configs.length > 1 && (
                <div className="absolute top-2 right-2 bg-amber-400/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">SHOW</div>
              )}
              <div className="flex gap-1 mt-2 justify-center">
                {preset.configs[0].colors.slice(0, 4).map((c, i) => (
                  <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
""")

print('All 3 files fixed!')

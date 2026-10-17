import os
base = r'd:\APK to WEB\fireworks-studio\src'

def write_file(rel_path, content):
    full = os.path.join(base, rel_path.replace('/', os.sep))
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'OK: {rel_path}')

# Completely new approach: merge everything into a single component 
# that manages the canvas and click handling directly
write_file('App.tsx', """import { useState, useCallback, useRef, useEffect } from 'react';
import { FireworkEngine, createRandomConfig } from './services/engine';
import { FireworkConfig } from './types/firework';
import { soundEngine } from './services/audio';
import { PRESETS } from './services/presets';
import SplashScreen from './components/SplashScreen';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [selectedConfig, setSelectedConfig] = useState<FireworkConfig | undefined>(undefined);
  const [panelOpen, setPanelOpen] = useState(false);
  const [particleCount, setParticleCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<FireworkEngine | null>(null);
  const lastCountUpdate = useRef(0);
  const selectedConfigRef = useRef(selectedConfig);

  // Keep ref in sync with state
  selectedConfigRef.current = selectedConfig;

  // Initialize engine
  useEffect(() => {
    if (showSplash) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    console.log('Initializing FireworkEngine...');
    const engine = new FireworkEngine(canvas);
    engineRef.current = engine;

    engine.onParticleCount = (count: number) => {
      const now = Date.now();
      if (now - lastCountUpdate.current > 300 || count === 0) {
        lastCountUpdate.current = now;
        setParticleCount(count);
      }
    };

    engine.start();
    console.log('Engine started');

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      engine.stop();
      engineRef.current = null;
      window.removeEventListener('resize', handleResize);
    };
  }, [showSplash]);

  // Canvas click handler
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) {
      console.log('No canvas or engine', !!canvas, !!engine);
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    console.log('Launch at', x, y);

    const cfg = selectedConfigRef.current;
    if (cfg) {
      engine.launch(x, y, { ...cfg, id: Math.random().toString(36).slice(2) });
    } else {
      engine.launch(x, y, createRandomConfig());
    }
  }, []);

  const handleToggleSound = useCallback(() => {
    const enabled = soundEngine.toggleMute();
    setSoundEnabled(enabled);
  }, []);

  const handleClear = useCallback(() => {
    engineRef.current?.clear();
    setParticleCount(0);
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="fixed inset-0 bg-[#05051a] overflow-hidden" style={{ fontFamily: 'Outfit, sans-serif' }}>
      {/* Main interactive area */}
      <div className="absolute inset-0 cursor-crosshair" onClick={handleCanvasClick}>
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 pointer-events-none">
        <div className="flex items-center gap-3">
          <img src="/assets/app_icon.png" alt="logo" className="w-9 h-9 rounded-lg shadow-lg" />
          <h1 className="text-white/90 font-semibold text-lg tracking-wide">Fireworks Studio</h1>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="text-white/40 text-xs font-mono">{particleCount > 0 ? particleCount : ''}</span>
          <button onClick={(e) => { e.stopPropagation(); handleToggleSound(); }} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all" title={soundEnabled ? 'Mute' : 'Unmute'}>
            {soundEnabled ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.5 8.5H4a1 1 0 00-1 1v5a1 1 0 001 1h2.5l4.5 4V4.5l-4.5 4z" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 5v14a1 1 0 01-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
            )}
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleClear(); }} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all" title="Clear">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>

      {/* Tap hint */}
      {particleCount === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-pulse z-10">
          <div className="text-center">
            <div className="text-5xl mb-4 opacity-60">\U0001f386</div>
            <p className="text-white/40 text-sm tracking-widest uppercase">Tap anywhere to launch</p>
          </div>
        </div>
      )}

      {/* Preset Panel */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 transition-all duration-500 ease-out ${panelOpen ? 'translate-y-0' : 'translate-y-[calc(100%-56px)]'}`} onClick={(e) => e.stopPropagation()}>
        <button onClick={() => setPanelOpen(!panelOpen)} className="w-full h-14 flex items-center justify-center gap-2 bg-gradient-to-t from-black/80 to-black/40 backdrop-blur-xl border-t border-white/10 hover:border-white/20 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 text-white/60 transition-transform duration-300 ${panelOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
          <span className="text-white/70 text-sm font-medium tracking-wide">Firework Presets</span>
        </button>
        <div className="bg-black/85 backdrop-blur-xl px-4 pb-6 pt-2 max-h-[50vh] overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button onClick={() => { setSelectedConfig(undefined); setPanelOpen(false); }} className={`p-4 rounded-2xl border transition-all ${!selectedConfig ? 'border-amber-400/60 bg-amber-400/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
              <div className="text-3xl mb-2">\U0001f3b2</div>
              <div className="text-white/90 text-sm font-medium">Random</div>
              <div className="text-white/40 text-xs mt-1">Surprise me!</div>
            </button>
            {PRESETS.map((preset) => (
              <button key={preset.id} onClick={() => { setSelectedConfig(preset.configs[0]); setPanelOpen(false); }} className={`p-4 rounded-2xl border transition-all ${selectedConfig?.id === preset.configs[0]?.id ? 'border-amber-400/60 bg-amber-400/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                <div className="text-3xl mb-2">{preset.emoji}</div>
                <div className="text-white/90 text-sm font-medium">{preset.name}</div>
                <div className="text-white/40 text-xs mt-1 line-clamp-2">{preset.description}</div>
                {preset.configs.length > 1 && <div className="absolute top-2 right-2 bg-amber-400/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">SHOW</div>}
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
    </div>
  );
}
""")

print('Done: Monolithic App.tsx rewritten')

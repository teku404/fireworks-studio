import os
base = r'd:\APK to WEB\fireworks-studio\src'

def write_file(rel_path, content):
    full = os.path.join(base, rel_path.replace('/', os.sep))
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'OK: {rel_path}')

write_file('components/SplashScreen.tsx', """import { useEffect, useState } from 'react';

interface Props {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: Props) {
  const [phase, setPhase] = useState<'enter' | 'show' | 'exit'>('enter');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('show'), 100);
    const t2 = setTimeout(() => setPhase('exit'), 2500);
    const t3 = setTimeout(() => onComplete(), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#05051a] transition-opacity duration-700 ${phase === 'exit' ? 'opacity-0' : 'opacity-100'}`}>
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-amber-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Logo */}
      <div className={`transform transition-all duration-1000 ease-out ${phase === 'enter' ? 'scale-50 opacity-0' : 'scale-100 opacity-100'}`}>
        <div className="relative">
          <div className="absolute -inset-8 bg-amber-400/10 rounded-full blur-3xl animate-pulse" />
          <img
            src="/assets/app_icon.png"
            alt="Fireworks Studio"
            className="w-28 h-28 rounded-3xl shadow-2xl shadow-amber-500/30 relative z-10"
          />
        </div>
      </div>

      {/* Title */}
      <div className={`mt-8 transform transition-all duration-1000 delay-300 ${phase === 'enter' ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'}`}>
        <h1 className="text-white text-3xl font-outfit font-bold tracking-wider">
          Fireworks
          <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent"> Studio</span>
        </h1>
        <p className="text-white/30 text-sm text-center mt-2 font-outfit tracking-widest uppercase">
          Create \u2022 Launch \u2022 Amaze
        </p>
      </div>

      {/* Loading bar */}
      <div className={`mt-12 w-48 h-0.5 bg-white/10 rounded-full overflow-hidden transition-opacity duration-500 ${phase === 'enter' ? 'opacity-0' : 'opacity-100'}`}>
        <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-loading-bar" />
      </div>
    </div>
  );
}
""")

write_file('App.tsx', """import { useState, useCallback, useRef } from 'react';
import FireworkCanvas from './components/FireworkCanvas';
import PresetPanel from './components/PresetPanel';
import SplashScreen from './components/SplashScreen';
import { FireworkConfig } from './types/firework';
import { soundEngine } from './services/audio';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [selectedConfig, setSelectedConfig] = useState<FireworkConfig | undefined>(undefined);
  const [panelOpen, setPanelOpen] = useState(false);
  const [particleCount, setParticleCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const handleSelectPreset = useCallback((config: FireworkConfig | null) => {
    setSelectedConfig(config || undefined);
  }, []);

  const handleAutoShow = useCallback((configs: FireworkConfig[]) => {
    setPanelOpen(false);
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    configs.forEach((config, i) => {
      setTimeout(() => {
        const x = rect.width * (0.2 + Math.random() * 0.6);
        const y = rect.height * (0.15 + Math.random() * 0.35);
        const event = new MouseEvent('click', {
          clientX: rect.left + x,
          clientY: rect.top + y,
        });
        // We'll use a custom approach - trigger launch via window event
        window.dispatchEvent(new CustomEvent('auto-launch', { detail: { x, y, config } }));
      }, i * 600);
    });
  }, []);

  const handleToggleSound = useCallback(() => {
    const enabled = soundEngine.toggleMute();
    setSoundEnabled(enabled);
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="fixed inset-0 bg-[#05051a] overflow-hidden font-outfit" ref={canvasContainerRef}>
      <FireworkCanvas
        selectedConfig={selectedConfig}
        onParticleCount={setParticleCount}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />
      <PresetPanel
        isOpen={panelOpen}
        onToggle={() => setPanelOpen(!panelOpen)}
        onSelectPreset={handleSelectPreset}
        selectedId={selectedConfig?.id}
        onAutoShow={handleAutoShow}
      />
    </div>
  );
}
""")

write_file('main.tsx', """import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
""")

write_file('index.css', """@import "tailwindcss";

@theme {
  --font-outfit: 'Outfit', sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html, body, #root {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #05051a;
  font-family: 'Outfit', sans-serif;
}

/* Custom animations */
@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
  50% { transform: translateY(-20px) scale(1.5); opacity: 0.6; }
}

@keyframes loading-bar {
  0% { width: 0%; }
  100% { width: 100%; }
}

.animate-float {
  animation: float ease-in-out infinite;
}

.animate-loading-bar {
  animation: loading-bar 2.2s ease-out forwards;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 4px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* Glass morphism utility */
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
""")

# Also create a vite-env.d.ts
write_file('vite-env.d.ts', """/// <reference types="vite/client" />
""")

print('All files created!')

import os
base = r'd:\APK to WEB\fireworks-studio\src'

def write_file(rel_path, content):
    full = os.path.join(base, rel_path.replace('/', os.sep))
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'OK: {rel_path}')

write_file('App.tsx', """import { useState, useCallback } from 'react';
import FireworkCanvas from './components/FireworkCanvas';
import PresetPanel from './components/PresetPanel';
import SplashScreen from './components/SplashScreen';
import { FireworkConfig } from './types/firework';
import { soundEngine } from './services/audio';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [selectedConfig, setSelectedConfig] = useState<FireworkConfig | undefined>(undefined);
  const [panelOpen, setPanelOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleSelectPreset = useCallback((config: FireworkConfig | null) => {
    setSelectedConfig(config || undefined);
  }, []);

  const handleAutoShow = useCallback((_configs: FireworkConfig[]) => {
    setPanelOpen(false);
    // Auto-show would need direct engine access — for now just select first config
    if (_configs.length > 0) {
      setSelectedConfig(_configs[0]);
    }
  }, []);

  const handleToggleSound = useCallback(() => {
    const enabled = soundEngine.toggleMute();
    setSoundEnabled(enabled);
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="fixed inset-0 bg-[#05051a] overflow-hidden" style={{ fontFamily: 'Outfit, sans-serif' }}>
      <FireworkCanvas
        selectedConfig={selectedConfig}
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

print('Done: App.tsx fixed')

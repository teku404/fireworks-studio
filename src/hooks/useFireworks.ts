import { useRef, useEffect, useCallback, useState } from 'react';
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

import { useEffect, useState } from 'react';

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
          Create • Launch • Amaze
        </p>
      </div>

      {/* Loading bar */}
      <div className={`mt-12 w-48 h-0.5 bg-white/10 rounded-full overflow-hidden transition-opacity duration-500 ${phase === 'enter' ? 'opacity-0' : 'opacity-100'}`}>
        <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-loading-bar" />
      </div>
    </div>
  );
}

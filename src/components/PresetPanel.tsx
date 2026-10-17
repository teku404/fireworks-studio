import { PRESETS } from '../services/presets';
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
            <div className="text-3xl mb-2">🎲</div>
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

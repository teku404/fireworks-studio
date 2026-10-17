import { FireworkPreset, FireworkConfig, BurstPattern } from '../types/firework';

const makeConfig = (
  name: string, colors: string[], pattern: BurstPattern,
  size: number, count: number, trail: number, glitter: boolean,
  crackle: boolean, speed: number, gravity: number
): FireworkConfig => ({
  id: Math.random().toString(36).slice(2),
  name, colors, pattern, size,
  particleCount: count, trailLength: trail,
  hasGlitter: glitter, hasCrackle: crackle,
  spreadAngle: Math.PI * 2, gravity, speed,
});

export const PRESETS: FireworkPreset[] = [
  {
    id: 'classic-gold', name: 'Classic Gold', emoji: '✨',
    description: 'Traditional golden chrysanthemum burst',
    configs: [makeConfig('Gold Chrysanthemum', ['#ffd600', '#ffab00', '#ffe57f'], 'chrysanthemum', 5, 150, 12, true, false, 5, 0.035)],
  },
  {
    id: 'red-peony', name: 'Red Peony', emoji: '🌹',
    description: 'Rich red peony with silver glitter',
    configs: [makeConfig('Red Peony', ['#ff1744', '#ff5252', '#ff8a80'], 'peony', 6, 180, 10, true, false, 4.5, 0.04)],
  },
  {
    id: 'blue-ring', name: 'Sapphire Ring', emoji: '💎',
    description: 'Perfect blue ring formation',
    configs: [makeConfig('Blue Ring', ['#2979ff', '#448aff', '#82b1ff'], 'ring', 5, 120, 8, false, false, 5.5, 0.03)],
  },
  {
    id: 'willow-silver', name: 'Silver Willow', emoji: '🍃',
    description: 'Graceful silver willow cascade',
    configs: [makeConfig('Silver Willow', ['#cfd8dc', '#eceff1', '#ffffff'], 'willow', 4, 200, 20, true, false, 3.5, 0.05)],
  },
  {
    id: 'palm-green', name: 'Emerald Palm', emoji: '🌴',
    description: 'Green palm burst shooting upward',
    configs: [makeConfig('Green Palm', ['#00e676', '#69f0ae', '#b9f6ca'], 'palm', 5, 140, 15, false, false, 6, 0.045)],
  },
  {
    id: 'crossette-purple', name: 'Purple Crossette', emoji: '🔮',
    description: 'Purple crossette with crackling stars',
    configs: [makeConfig('Purple Crossette', ['#d500f9', '#e040fb', '#ea80fc'], 'crossette', 5, 160, 10, false, true, 5, 0.035)],
  },
  {
    id: 'dahlia-multi', name: 'Rainbow Dahlia', emoji: '🌈',
    description: 'Multi-color dahlia explosion',
    configs: [makeConfig('Rainbow', ['#ff1744', '#ffd600', '#2979ff', '#00e676', '#d500f9'], 'dahlia', 7, 200, 12, true, true, 5.5, 0.035)],
  },
  {
    id: 'grand-finale', name: 'Grand Finale', emoji: '🎆',
    description: 'Multi-burst spectacular finale!',
    configs: [
      makeConfig('Gold Burst', ['#ffd600', '#ffab00'], 'spherical', 6, 150, 10, true, true, 5, 0.035),
      makeConfig('Red Ring', ['#ff1744', '#ff5252'], 'ring', 5, 120, 8, false, true, 5.5, 0.03),
      makeConfig('Blue Willow', ['#2979ff', '#82b1ff'], 'willow', 4, 180, 18, true, false, 3.5, 0.05),
      makeConfig('Silver Crackle', ['#eceff1', '#ffffff'], 'chrysanthemum', 5, 160, 12, true, true, 5, 0.04),
    ],
  },
];

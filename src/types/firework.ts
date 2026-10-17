export interface Vec2 {
  x: number;
  y: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  trail: Vec2[];
  trailLength: number;
  alpha: number;
  decay: number;
  gravity: number;
  friction: number;
  type: 'spark' | 'trail' | 'glow' | 'crackle';
}

export type BurstPattern = 'spherical' | 'ring' | 'willow' | 'palm' | 'crossette' | 'dahlia' | 'peony' | 'chrysanthemum';

export interface FireworkConfig {
  id: string;
  name: string;
  colors: string[];
  pattern: BurstPattern;
  size: number;
  particleCount: number;
  trailLength: number;
  hasGlitter: boolean;
  hasCrackle: boolean;
  spreadAngle: number;
  gravity: number;
  speed: number;
}

export interface LaunchingFirework {
  x: number;
  y: number;
  targetY: number;
  vy: number;
  config: FireworkConfig;
  trail: Vec2[];
  color: string;
  alive: boolean;
}

export interface FireworkPreset {
  id: string;
  name: string;
  emoji: string;
  configs: FireworkConfig[];
  description: string;
}

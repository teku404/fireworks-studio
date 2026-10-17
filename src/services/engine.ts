import { Particle, LaunchingFirework, FireworkConfig, BurstPattern, Vec2 } from '../types/firework';
import { soundEngine } from './audio';

const COLORS: Record<string, string[]> = {
  red: ['#ff1744', '#ff5252', '#ff8a80'],
  gold: ['#ffd600', '#ffab00', '#ffe57f'],
  blue: ['#2979ff', '#448aff', '#82b1ff'],
  green: ['#00e676', '#69f0ae', '#b9f6ca'],
  purple: ['#d500f9', '#e040fb', '#ea80fc'],
  silver: ['#cfd8dc', '#eceff1', '#ffffff'],
  orange: ['#ff6d00', '#ff9100', '#ffab40'],
  pink: ['#f50057', '#ff4081', '#ff80ab'],
  teal: ['#1de9b6', '#64ffda', '#a7ffeb'],
  white: ['#ffffff', '#f5f5f5', '#e0e0e0'],
};

const COLOR_NAMES = Object.keys(COLORS);

function randomColor(): string[] {
  return COLORS[COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)]];
}

export function createRandomConfig(): FireworkConfig {
  const patterns: BurstPattern[] = ['spherical', 'ring', 'willow', 'palm', 'crossette', 'dahlia', 'peony', 'chrysanthemum'];
  const colors = randomColor();
  return {
    id: Math.random().toString(36).slice(2),
    name: 'Random',
    colors,
    pattern: patterns[Math.floor(Math.random() * patterns.length)],
    size: 3 + Math.random() * 5,
    particleCount: 80 + Math.floor(Math.random() * 120),
    trailLength: 5 + Math.floor(Math.random() * 15),
    hasGlitter: Math.random() > 0.5,
    hasCrackle: Math.random() > 0.6,
    spreadAngle: Math.PI * 2,
    gravity: 0.03 + Math.random() * 0.02,
    speed: 3 + Math.random() * 4,
  };
}

export class FireworkEngine {
  private particles: Particle[] = [];
  private launches: LaunchingFirework[] = [];
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;
  private animId = 0;
  private stars: { x: number; y: number; size: number; twinkle: number; speed: number }[] = [];
  public onParticleCount?: (count: number) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.resize();
  }

  private generateStars() {
    this.stars = [];
    const count = Math.floor((this.width * this.height) / 3000);
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height * 0.7,
        size: Math.random() * 1.5 + 0.5,
        twinkle: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 2,
      });
    }
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.generateStars();
  }

  private drawStarsOnly(time: number) {
    const ctx = this.ctx;
    for (const star of this.stars) {
      const twinkle = Math.sin(time * star.speed * 0.001 + star.twinkle) * 0.5 + 0.5;
      const alpha = 0.15 + twinkle * 0.35;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size * (0.7 + twinkle * 0.3), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
    }
  }

  private drawInitialBackground() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#05051a');
    grad.addColorStop(0.3, '#0a0a2e');
    grad.addColorStop(0.6, '#0d1137');
    grad.addColorStop(0.85, '#111640');
    grad.addColorStop(1, '#1a1a3e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#0a0a15';
    ctx.beginPath();
    ctx.moveTo(0, h);
    const buildings = 30;
    const bw = w / buildings;
    for (let i = 0; i <= buildings; i++) {
      const bh = 20 + Math.sin(i * 1.7) * 15 + Math.cos(i * 0.8) * 25;
      ctx.lineTo(i * bw, h - bh);
      if (i < buildings) ctx.lineTo((i + 0.9) * bw, h - bh);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  }

  private drawBackground(time: number) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#05051a');
    grad.addColorStop(0.3, '#0a0a2e');
    grad.addColorStop(0.6, '#0d1137');
    grad.addColorStop(0.85, '#111640');
    grad.addColorStop(1, '#1a1a3e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    for (const star of this.stars) {
      const twinkle = Math.sin(time * star.speed * 0.001 + star.twinkle) * 0.5 + 0.5;
      const alpha = 0.3 + twinkle * 0.7;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size * (0.7 + twinkle * 0.3), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
    }

    ctx.fillStyle = '#0a0a15';
    ctx.beginPath();
    ctx.moveTo(0, h);
    const buildings = 30;
    const bw = w / buildings;
    for (let i = 0; i <= buildings; i++) {
      const bh = 20 + Math.sin(i * 1.7) * 15 + Math.cos(i * 0.8) * 25 + Math.random() * 5;
      ctx.lineTo(i * bw, h - bh);
      if (i < buildings) ctx.lineTo((i + 0.9) * bw, h - bh);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    for (let i = 0; i < buildings * 3; i++) {
      const x = Math.random() * w;
      const bh = 20 + Math.sin((x / bw) * 1.7) * 15 + Math.cos((x / bw) * 0.8) * 25;
      const y = h - Math.random() * bh * 0.6;
      if (Math.random() > 0.5) {
        ctx.fillStyle = `rgba(255, 200, 100, ${0.3 + Math.random() * 0.4})`;
        ctx.fillRect(x, y, 1.5, 1.5);
      }
    }
  }

  launch(x: number, targetY: number, config?: FireworkConfig) {
    const cfg = config || createRandomConfig();
    soundEngine.playLaunch(true);
    this.launches.push({
      x, y: this.height,
      targetY: Math.max(targetY, this.height * 0.1),
      vy: -(12 + Math.random() * 6),
      config: cfg, trail: [],
      color: cfg.colors[0], alive: true,
    });
  }

  private explode(fw: LaunchingFirework) {
    const cfg = fw.config;
    soundEngine.playExplosion(cfg.size, cfg.hasCrackle);
    const count = cfg.particleCount;

    for (let i = 0; i < count; i++) {
      let angle: number, speed: number;
      switch (cfg.pattern) {
        case 'ring':
          angle = (i / count) * Math.PI * 2;
          speed = cfg.speed * (0.9 + Math.random() * 0.2); break;
        case 'willow':
          angle = Math.random() * Math.PI * 2;
          speed = cfg.speed * (0.3 + Math.random() * 0.7); break;
        case 'palm':
          angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
          speed = cfg.speed * (0.5 + Math.random() * 1.2); break;
        case 'crossette': {
          const arm = Math.floor(i / (count / 4));
          angle = (arm * Math.PI) / 2 + (Math.random() - 0.5) * 0.5;
          speed = cfg.speed * (0.6 + Math.random() * 0.8); break;
        }
        case 'dahlia':
          angle = Math.random() * Math.PI * 2;
          speed = cfg.speed * (0.8 + Math.random() * 0.8); break;
        case 'peony':
          angle = Math.random() * Math.PI * 2;
          speed = cfg.speed * (0.5 + Math.random() * 0.5); break;
        case 'chrysanthemum':
          angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
          speed = cfg.speed * (0.7 + Math.random() * 0.6); break;
        default:
          angle = Math.random() * Math.PI * 2;
          speed = cfg.speed * (0.4 + Math.random() * 0.6);
      }
      const color = cfg.colors[Math.floor(Math.random() * cfg.colors.length)];
      const life = 60 + Math.random() * 80;
      this.particles.push({
        x: fw.x, y: fw.y,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life, maxLife: life, color,
        size: cfg.size * (0.5 + Math.random() * 0.5),
        trail: [], trailLength: cfg.trailLength,
        alpha: 1, decay: 0.004 + Math.random() * 0.006,
        gravity: cfg.gravity, friction: 0.98, type: 'spark',
      });
    }
    if (cfg.hasGlitter) {
      for (let i = 0; i < count * 0.3; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = cfg.speed * 0.3 * Math.random();
        this.particles.push({
          x: fw.x, y: fw.y,
          vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          life: 100 + Math.random() * 60, maxLife: 160,
          color: '#ffffff', size: 1.5,
          trail: [], trailLength: 0,
          alpha: 1, decay: 0.005, gravity: 0.015, friction: 0.99, type: 'glow',
        });
      }
    }
  }

  private update() {
    for (const fw of this.launches) {
      if (!fw.alive) continue;
      fw.trail.push({ x: fw.x, y: fw.y });
      if (fw.trail.length > 12) fw.trail.shift();
      fw.y += fw.vy; fw.vy *= 0.985; fw.vy += 0.04;
      if (Math.random() > 0.4) {
        this.particles.push({
          x: fw.x + (Math.random() - 0.5) * 3, y: fw.y,
          vx: (Math.random() - 0.5) * 0.5, vy: Math.random() * 2 + 1,
          life: 15 + Math.random() * 10, maxLife: 25,
          color: '#ffcc00', size: 2, trail: [], trailLength: 3,
          alpha: 1, decay: 0.04, gravity: 0.05, friction: 0.96, type: 'trail',
        });
      }
      if (fw.y <= fw.targetY || fw.vy >= 0) { fw.alive = false; this.explode(fw); }
    }
    this.launches = this.launches.filter((f) => f.alive);

    for (const p of this.particles) {
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > p.trailLength) p.trail.shift();
      p.vx *= p.friction; p.vy *= p.friction;
      p.vy += p.gravity; p.x += p.vx; p.y += p.vy;
      p.life -= 1; p.alpha = Math.max(0, p.life / p.maxLife);
      p.size *= 0.998;
    }
    this.particles = this.particles.filter((p) => p.life > 0 && p.alpha > 0.01);
    this.onParticleCount?.(this.particles.length + this.launches.length);
  }

  private hexAlpha(alpha: number, max: number): string {
    return Math.floor(alpha * max).toString(16).padStart(2, '0');
  }

  private draw(time: number) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    // Semi-transparent overlay for trail persistence (don't fully clear)
    ctx.fillStyle = 'rgba(5, 5, 26, 0.25)';
    ctx.fillRect(0, 0, w, h);
    // Redraw background stars only (very faint, under the overlay)
    this.drawStarsOnly(time);
    ctx.save();

    for (const fw of this.launches) {
      if (fw.trail.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(fw.trail[0].x, fw.trail[0].y);
      for (let i = 1; i < fw.trail.length; i++) ctx.lineTo(fw.trail[i].x, fw.trail[i].y);
      ctx.lineTo(fw.x, fw.y);
      ctx.strokeStyle = 'rgba(255, 200, 50, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath(); ctx.arc(fw.x, fw.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#fff'; ctx.fill();
      ctx.beginPath(); ctx.arc(fw.x, fw.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 200, 50, 0.4)'; ctx.fill();
    }

    for (const p of this.particles) {
      if (p.trail.length > 1 && p.trailLength > 0) {
        ctx.beginPath();
        ctx.moveTo(p.trail[0].x, p.trail[0].y);
        for (let i = 1; i < p.trail.length; i++) ctx.lineTo(p.trail[i].x, p.trail[i].y);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = p.color + this.hexAlpha(p.alpha, 80);
        ctx.lineWidth = p.size * 0.4;
        ctx.stroke();
      }
      if (p.type === 'spark' || p.type === 'glow') {
        const gs = p.size * 4;
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, gs);
        gradient.addColorStop(0, p.color + this.hexAlpha(p.alpha, 60));
        gradient.addColorStop(1, p.color + '00');
        ctx.fillStyle = gradient;
        ctx.fillRect(p.x - gs, p.y - gs, gs * 2, gs * 2);
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.5, p.size * p.alpha), 0, Math.PI * 2);
      ctx.fillStyle = p.color + this.hexAlpha(p.alpha, 255);
      ctx.fill();
      if (p.type === 'spark' && p.alpha > 0.5) {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.6})`;
        ctx.fill();
      }
    }
    ctx.restore();
  }

  start() {
    this.drawInitialBackground();
    const loop = (time: number) => {
      this.update();
      this.draw(time);
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  stop() { cancelAnimationFrame(this.animId); }
  clear() { this.particles = []; this.launches = []; }
  getParticleCount() { return this.particles.length; }
}

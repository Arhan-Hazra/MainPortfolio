// High-performance Canvas Particle Systems for Electric Sparks and Overload Smoke
import { SparkParticle, SmokeParticle } from './types';

export class ParticleSystem {
  public sparks: SparkParticle[] = [];
  public smoke: SmokeParticle[] = [];

  // Spawn high-energy electric spark particles
  public spawnSparks(x: number, y: number, count: number = 8, intense: boolean = false) {
    const sparkColors = ['#00FF41', '#39FF14', '#00FFFF', '#FFFFFF', '#66ff99'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (intense ? 4 : 2) + Math.random() * (intense ? 8 : 4);
      const life = (intense ? 20 : 12) + Math.floor(Math.random() * (intense ? 25 : 15));

      this.sparks.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: life,
        maxLife: life,
        color: sparkColors[Math.floor(Math.random() * sparkColors.length)],
        size: 1.5 + Math.random() * (intense ? 2.5 : 1.5),
      });
    }
  }

  // Spawn thick expanding smoke puffs on overload boom
  public spawnOverloadSmoke(x: number, y: number, count: number = 40) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 3.5;
      const maxLife = 50 + Math.floor(Math.random() * 60);

      this.smoke.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 12,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (0.8 + Math.random() * 1.5), // Buoyant upward drift
        size: 8 + Math.random() * 14,
        growSpeed: 0.8 + Math.random() * 1.4,
        opacity: 0.8 + Math.random() * 0.2,
        life: maxLife,
        maxLife: maxLife,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
      });
    }

    // Also spawn a burst of intense sparks with smoke
    this.spawnSparks(x, y, 35, true);
  }

  // Update physics for all particles
  public update() {
    // 1. Update sparks
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      // Slight jitter / erratic electrical branching
      s.vx += (Math.random() - 0.5) * 1.2;
      s.vy += (Math.random() - 0.5) * 1.2 + 0.05; // gravity
      s.vx *= 0.92;
      s.vy *= 0.92;
      s.life--;

      if (s.life <= 0) {
        this.sparks.splice(i, 1);
      }
    }

    // 2. Update smoke
    for (let i = this.smoke.length - 1; i >= 0; i--) {
      const sm = this.smoke[i];
      sm.x += sm.vx;
      sm.y += sm.vy;
      sm.vx *= 0.96; // Air drag
      sm.vy *= 0.96;
      sm.vy -= 0.02; // Upward thermal float
      sm.size += sm.growSpeed;
      sm.rotation += sm.rotSpeed;
      sm.life--;

      // Fade opacity as life diminishes
      sm.opacity = (sm.life / sm.maxLife) * 0.75;

      if (sm.life <= 0) {
        this.smoke.splice(i, 1);
      }
    }
  }

  // Render particles to canvas context
  public render(ctx: CanvasRenderingContext2D) {
    // Render smoke first (underneath sparks)
    if (this.smoke.length > 0) {
      ctx.save();
      for (const sm of this.smoke) {
        ctx.save();
        ctx.translate(sm.x, sm.y);
        ctx.rotate(sm.rotation);

        const gradient = ctx.createRadialGradient(0, 0, sm.size * 0.1, 0, 0, sm.size);
        gradient.addColorStop(0, `rgba(45, 48, 55, ${sm.opacity * 0.9})`);
        gradient.addColorStop(0.5, `rgba(30, 32, 38, ${sm.opacity * 0.5})`);
        gradient.addColorStop(1, `rgba(15, 17, 20, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, sm.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }

    // Render electric sparks
    if (this.sparks.length > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (const s of this.sparks) {
        const alpha = s.life / s.maxLife;
        ctx.shadowBlur = 8;
        ctx.shadowColor = s.color;

        ctx.fillStyle = s.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();

        // Spark trail
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.size * 0.6;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 2, s.y - s.vy * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  public clear() {
    this.sparks = [];
    this.smoke = [];
  }
}

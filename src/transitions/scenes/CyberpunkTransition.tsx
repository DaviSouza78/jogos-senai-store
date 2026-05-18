import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useTransition } from '../TransitionContext';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  r: number;
  hue: number;
};

const CyberpunkTransition = () => {
  const { markCovered, markRevealed } = useTransition();
  const root = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const emitting = useRef(false);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const motoEl = root.current?.querySelector('.cp-moto') as HTMLElement | null;

    const loop = () => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(6,6,11,0.06)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      if (emitting.current && motoEl) {
        const r = motoEl.getBoundingClientRect();
        const ox = r.left + r.width * 0.25;
        const oy = r.top + r.height * 0.92;
        for (let i = 0; i < 18; i++) {
          particles.current.push({
            x: ox + (Math.random() - 0.5) * 22,
            y: oy + (Math.random() - 0.5) * 6,
            vx: (Math.random() - 0.5) * 4 - 2.5,
            vy: -Math.random() * 2.4 - 0.4,
            life: 0,
            max: 110 + Math.random() * 80,
            r: 30 + Math.random() * 45,
            hue: 285 + Math.random() * 55,
          });
        }
      }

      ctx.globalCompositeOperation = 'screen';
      const survivors: Particle[] = [];
      for (const p of particles.current) {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy *= 0.99;
        p.r *= 1.018;
        const t = p.life / p.max;
        if (t >= 1) continue;
        const a = (1 - t) * 0.32;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, `hsla(${p.hue}, 95%, 65%, ${a})`);
        g.addColorStop(0.45, `hsla(${p.hue}, 85%, 45%, ${a * 0.4})`);
        g.addColorStop(1, 'hsla(0,0%,0%,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        survivors.push(p);
      }
      particles.current = survivors;
      rafId.current = requestAnimationFrame(loop);
    };
    rafId.current = requestAnimationFrame(loop);

    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  useGSAP(
    () => {
      const tl = gsap.timeline();
      tl.fromTo('.cp-veil', { opacity: 0 }, { opacity: 1, duration: 0.22, ease: 'power2.out' }, 0)
        .call(() => {
          emitting.current = true;
        }, [], 0.05)

        .fromTo(
          '.cp-moto',
          { xPercent: -200, yPercent: 20, rotate: -10, scale: 1.0 },
          {
            xPercent: 650,
            yPercent: -10,
            rotate: 16,
            scale: 1.15,
            duration: 1.0,
            ease: 'power2.in',
          },
          0.22
        )
        .fromTo(
          '.cp-streak',
          { opacity: 0, scaleX: 0.4 },
          { opacity: 1, scaleX: 1.2, duration: 0.6, ease: 'power2.out' },
          0.25
        )
        .to('.cp-streak', { opacity: 0, duration: 0.6, ease: 'power2.in' }, 1.0)

        .call(markCovered, [], 0.85)

        .call(() => {
          emitting.current = false;
        }, [], 1.2)

        .to(
          '.cp-veil',
          { opacity: 0, filter: 'blur(22px)', duration: 1.3, ease: 'power2.out' },
          1.4
        )
        .to(
          canvasRef.current,
          { opacity: 0, filter: 'blur(14px)', duration: 1.3, ease: 'power2.out' },
          1.4
        )
        .call(markRevealed, [], 2.75);
    },
    { scope: root }
  );

  return (
    <div ref={root} className="absolute inset-0 overflow-hidden">
      <div
        className="cp-veil absolute inset-0 opacity-0"
        style={{
          background: `
            linear-gradient(rgba(6,6,11,0.94), rgba(6,6,11,0.94)),
            repeating-linear-gradient(0deg,  rgba(255,0,255,0.18) 0 1px, transparent 1px 42px),
            repeating-linear-gradient(90deg, rgba(0,229,255,0.18) 0 1px, transparent 1px 42px)`,
        }}
      />

      <div
        className="cp-streak absolute left-0 right-0 top-[55%] h-[6px] opacity-0"
        style={{
          background:
            'linear-gradient(90deg, transparent, #ff00ff 30%, #00e5ff 70%, transparent)',
          filter: 'blur(4px) drop-shadow(0 0 12px #ff00ff)',
        }}
      />

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div className="cp-moto absolute top-[40%] left-0 -translate-y-1/2 w-56 h-32 pointer-events-none">
        <svg
          viewBox="0 0 220 110"
          className="w-full h-full"
          style={{ filter: 'drop-shadow(0 0 24px #ff00ff)' }}
        >
          <defs>
            <linearGradient id="cp-body" x1="0" x2="1">
              <stop offset="0" stopColor="#ff00ff" />
              <stop offset="1" stopColor="#00e5ff" />
            </linearGradient>
          </defs>
          <path
            d="M30 78 Q70 28 120 56 L160 56 Q190 56 196 80"
            stroke="url(#cp-body)"
            strokeWidth="4"
            fill="none"
          />
          <path d="M88 50 L140 28 L154 50 Z" fill="#00e5ff" opacity="0.85" />
          <path d="M88 50 L140 28 L154 50 Z" fill="none" stroke="#ff00ff" strokeWidth="1" />
          <circle cx="42" cy="86" r="20" fill="#0a0a14" stroke="#00e5ff" strokeWidth="3" />
          <circle cx="172" cy="86" r="20" fill="#0a0a14" stroke="#ff00ff" strokeWidth="3" />
          <circle cx="42" cy="86" r="6" fill="#00e5ff" />
          <circle cx="172" cy="86" r="6" fill="#ff00ff" />
        </svg>
      </div>
    </div>
  );
};

export default CyberpunkTransition;

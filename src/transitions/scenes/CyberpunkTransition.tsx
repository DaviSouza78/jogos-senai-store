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
  kind: 'smoke' | 'spark';
};

const CyberpunkTransition = () => {
  const { markCovered, markRevealed } = useTransition();
  const root = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const emitting = useRef(false);
  const sparking = useRef(false);
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

    const moto = root.current?.querySelector('.cp-moto') as HTMLElement | null;

    const loop = () => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(6,6,11,0.05)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      if (moto && (emitting.current || sparking.current)) {
        const r = moto.getBoundingClientRect();
        const rearX = r.left + r.width * 0.78;
        const rearY = r.top + r.height * 0.85;

        if (emitting.current) {
          // Thick magenta-purple smoke
          for (let i = 0; i < 14; i++) {
            particles.current.push({
              x: rearX + (Math.random() - 0.5) * 28,
              y: rearY + (Math.random() - 0.5) * 8,
              vx: (Math.random() - 0.5) * 3.5 - 2.0,
              vy: -Math.random() * 2.0 - 0.4,
              life: 0,
              max: 140 + Math.random() * 100,
              r: 36 + Math.random() * 55,
              hue: 285 + Math.random() * 55,
              kind: 'smoke',
            });
          }
        }
        if (sparking.current) {
          // Bright orange tire sparks (fewer, faster, smaller)
          for (let i = 0; i < 6; i++) {
            const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.6;
            const s = 6 + Math.random() * 8;
            particles.current.push({
              x: rearX,
              y: rearY,
              vx: Math.cos(a) * s + (Math.random() - 0.5) * 2 - 2,
              vy: Math.sin(a) * s - 1,
              life: 0,
              max: 35 + Math.random() * 25,
              r: 1.5 + Math.random() * 2,
              hue: 30 + Math.random() * 25,
              kind: 'spark',
            });
          }
        }
      }

      const survivors: Particle[] = [];
      for (const p of particles.current) {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        if (p.kind === 'smoke') {
          p.vx *= 0.985;
          p.vy *= 0.99;
          p.r *= 1.018;
        } else {
          p.vy += 0.25;
          p.vx *= 0.97;
        }
        const t = p.life / p.max;
        if (t >= 1) continue;

        if (p.kind === 'smoke') {
          ctx.globalCompositeOperation = 'screen';
          const a = (1 - t) * 0.34;
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
          g.addColorStop(0, `hsla(${p.hue}, 95%, 65%, ${a})`);
          g.addColorStop(0.45, `hsla(${p.hue}, 85%, 45%, ${a * 0.4})`);
          g.addColorStop(1, 'hsla(0,0%,0%,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.globalCompositeOperation = 'screen';
          const a = 1 - t;
          ctx.strokeStyle = `hsla(${p.hue}, 100%, 65%, ${a})`;
          ctx.lineWidth = p.r;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 1.5, p.y - p.vy * 1.5);
          ctx.stroke();
          ctx.fillStyle = `hsla(${p.hue}, 100%, 80%, ${a})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
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

      tl.fromTo('.cp-veil', { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0)
        .fromTo('.cp-haze', { opacity: 0 }, { opacity: 0.5, duration: 0.4 }, 0)

        // ── 0.40  Bike enters from left, distant, slow build ─────────────────
        .call(() => {
          emitting.current = true;
        }, [], 0.35)
        .fromTo(
          '.cp-moto',
          { xPercent: -180, yPercent: 30, rotate: -6, scale: 0.85, opacity: 0 },
          { xPercent: -40, yPercent: 5, rotate: -3, scale: 1, opacity: 1, duration: 0.65, ease: 'power2.out' },
          0.4
        )

        // ── 1.05  Bike drifts through center, slight wheelie lean ────────────
        .call(() => {
          sparking.current = true;
        }, [], 1.05)
        .to('.cp-moto', {
          xPercent: 90,
          yPercent: -8,
          rotate: 12,
          scale: 1.1,
          duration: 0.6,
          ease: 'sine.inOut',
        }, 1.05)

        // ── 1.65  Bike accelerates out the right, more lean ──────────────────
        .to('.cp-moto', {
          xPercent: 280,
          yPercent: -18,
          rotate: 18,
          scale: 1.15,
          duration: 0.55,
          ease: 'power3.in',
        }, 1.65)

        // Light streak under the bike — drawn behind, fades as bike leaves
        .fromTo('.cp-streak',
          { opacity: 0, scaleX: 0.3 },
          { opacity: 1, scaleX: 1.3, duration: 0.8, ease: 'power2.out' }, 0.4)
        .to('.cp-streak', { opacity: 0, duration: 0.7, ease: 'power2.in' }, 1.8)

        // ── Skid marks grow on the road ──────────────────────────────────────
        .fromTo('.cp-skid-a', { strokeDashoffset: 2000 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 0.55)
        .fromTo('.cp-skid-b', { strokeDashoffset: 2000 }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 0.6)

        // markCovered at peak smoke density
        .call(markCovered, [], 1.55)

        // ── 2.2  Bike is gone, particles dissipate, sparks stop ──────────────
        .call(() => {
          sparking.current = false;
        }, [], 2.0)
        .call(() => {
          emitting.current = false;
        }, [], 2.25)

        // ── 2.5–4.0  Smoke dissipates with blur, veil fades ──────────────────
        .to('.cp-veil', { opacity: 0, filter: 'blur(28px)', duration: 1.5, ease: 'power2.out' }, 2.4)
        .to('.cp-haze', { opacity: 0, duration: 1.5 }, 2.4)
        .to('.cp-skid-a, .cp-skid-b', { opacity: 0, duration: 1.0, ease: 'power2.out' }, 2.6)
        .to(canvasRef.current, { opacity: 0, filter: 'blur(20px)', duration: 1.5, ease: 'power2.out' }, 2.6)

        .call(markRevealed, [], 4.0);
    },
    { scope: root }
  );

  return (
    <div ref={root} className="absolute inset-0 overflow-hidden">
      {/* Black veil + neon grid */}
      <div
        className="cp-veil absolute inset-0 opacity-0"
        style={{
          background: `
            linear-gradient(rgba(6,6,11,0.95), rgba(6,6,11,0.95)),
            repeating-linear-gradient(0deg,  rgba(255,0,255,0.20) 0 1px, transparent 1px 44px),
            repeating-linear-gradient(90deg, rgba(0,229,255,0.20) 0 1px, transparent 1px 44px)`,
        }}
      />

      {/* Atmospheric haze layer */}
      <div
        className="cp-haze absolute inset-0 opacity-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 60%, rgba(255,0,140,0.18), transparent 55%),' +
            'radial-gradient(ellipse at 30% 40%, rgba(0,229,255,0.12), transparent 60%)',
        }}
      />

      {/* Horizon light streak — emulates speed of bike */}
      <div
        className="cp-streak absolute left-0 right-0 top-[60%] h-[8px] opacity-0"
        style={{
          background:
            'linear-gradient(90deg, transparent, #ff00ff 25%, #ffffff 50%, #00e5ff 75%, transparent)',
          filter: 'blur(5px) drop-shadow(0 0 18px #ff00ff)',
        }}
      />

      {/* Skid marks on the "ground" — SVG paths revealed via dasharray */}
      <svg
        className="absolute left-0 right-0 bottom-[18%] w-full h-[15%] pointer-events-none overflow-visible"
        viewBox="0 0 2000 200"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="cp-skid-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(0,0,0,0)" />
            <stop offset="15%" stopColor="rgba(40,40,55,0.85)" />
            <stop offset="55%" stopColor="rgba(80,30,80,0.95)" />
            <stop offset="100%" stopColor="rgba(255,30,180,0.4)" />
          </linearGradient>
        </defs>
        <path
          className="cp-skid-a"
          d="M -50 110 Q 600 130 1200 90 T 2050 60"
          stroke="url(#cp-skid-grad)"
          strokeWidth="14"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="2000 2000"
        />
        <path
          className="cp-skid-b"
          d="M -50 130 Q 600 150 1200 110 T 2050 80"
          stroke="url(#cp-skid-grad)"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="2000 2000"
          opacity="0.75"
        />
      </svg>

      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* The Yaiba Kusanagi — detailed Akira-inspired silhouette */}
      <div className="cp-moto absolute top-[42%] left-0 -translate-y-1/2 w-[520px] max-w-[58vw] pointer-events-none">
        <svg
          viewBox="0 0 480 220"
          className="w-full h-full"
          style={{ filter: 'drop-shadow(0 18px 22px rgba(0,0,0,0.7)) drop-shadow(0 0 22px rgba(255,0,170,0.45))' }}
        >
          <defs>
            <linearGradient id="cp-fairing" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff1a3a" />
              <stop offset="60%" stopColor="#c00020" />
              <stop offset="100%" stopColor="#5a0010" />
            </linearGradient>
            <linearGradient id="cp-tank" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff003c" />
              <stop offset="100%" stopColor="#7a000c" />
            </linearGradient>
            <linearGradient id="cp-tail" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#a00018" />
              <stop offset="100%" stopColor="#ff003c" />
            </linearGradient>
            <linearGradient id="cp-engine" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2a2a30" />
              <stop offset="100%" stopColor="#0a0a0e" />
            </linearGradient>
            <linearGradient id="cp-wheel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#222226" />
              <stop offset="100%" stopColor="#080809" />
            </linearGradient>
            <linearGradient id="cp-rider" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a1a22" />
              <stop offset="100%" stopColor="#000" />
            </linearGradient>
            <radialGradient id="cp-led-cyan" cx="0.5" cy="0.5">
              <stop offset="0%" stopColor="#aaf6ff" />
              <stop offset="100%" stopColor="#00e5ff" />
            </radialGradient>
            <radialGradient id="cp-led-magenta" cx="0.5" cy="0.5">
              <stop offset="0%" stopColor="#ffb0ff" />
              <stop offset="100%" stopColor="#ff00cc" />
            </radialGradient>
          </defs>

          {/* ─── REAR FENDER / TAIL (twin-fin Akira tail) ─── */}
          <path
            d="M 290 100 L 460 105 L 470 130 L 460 165 L 380 175 L 320 165 Z"
            fill="url(#cp-tail)"
            stroke="#3a0008"
            strokeWidth="1.5"
          />
          {/* Twin fins */}
          <path d="M 400 105 L 462 80 L 470 100 L 410 115 Z" fill="url(#cp-tail)" stroke="#3a0008" strokeWidth="1" />
          <path d="M 380 100 L 442 85 L 450 105 L 390 113 Z" fill="#a00018" stroke="#3a0008" strokeWidth="0.8" />
          {/* Tail LED strip — magenta */}
          <rect x="320" y="160" width="135" height="3" fill="url(#cp-led-magenta)" />
          <rect x="320" y="160" width="135" height="3" fill="url(#cp-led-magenta)" filter="blur(2px)" opacity="0.7" />

          {/* ─── REAR WHEEL (covered fender) ─── */}
          <circle cx="395" cy="165" r="32" fill="url(#cp-wheel)" stroke="#000" strokeWidth="2" />
          <circle cx="395" cy="165" r="22" fill="#0a0a0e" stroke="#1a1a22" strokeWidth="1" />
          <circle cx="395" cy="165" r="8" fill="#ff00cc" opacity="0.55" filter="blur(1px)" />
          {/* Spokes/disc detail */}
          {Array.from({ length: 5 }, (_, i) => {
            const angle = (i / 5) * Math.PI * 2;
            return (
              <line
                key={`rs-${i}`}
                x1={395 + Math.cos(angle) * 4}
                y1={165 + Math.sin(angle) * 4}
                x2={395 + Math.cos(angle) * 20}
                y2={165 + Math.sin(angle) * 20}
                stroke="#1a1a22"
                strokeWidth="2"
              />
            );
          })}

          {/* ─── EXHAUST ─── */}
          <path d="M 400 130 L 470 138 L 472 152 L 400 145 Z" fill="#0a0a0e" stroke="#1a1a22" strokeWidth="1" />
          <circle cx="470" cy="145" r="5" fill="#1a1a22" />
          <circle cx="470" cy="145" r="3" fill="#ff4a30" opacity="0.8" />

          {/* ─── ENGINE BLOCK (exposed, central) ─── */}
          <path
            d="M 175 110 L 290 110 L 300 135 L 285 160 L 180 160 L 170 140 Z"
            fill="url(#cp-engine)"
            stroke="#000"
            strokeWidth="2"
          />
          {/* Engine cooling fins */}
          {Array.from({ length: 7 }, (_, i) => (
            <line
              key={`ef-${i}`}
              x1={185 + i * 15}
              y1={120}
              x2={185 + i * 15}
              y2={155}
              stroke="#3a3a40"
              strokeWidth="1.5"
              opacity="0.8"
            />
          ))}
          {/* Engine glow underneath */}
          <ellipse cx="235" cy="158" rx="55" ry="6" fill="#ff00cc" opacity="0.55" filter="blur(2px)" />

          {/* ─── TANK ─── */}
          <path
            d="M 170 75 L 290 70 L 295 115 L 175 115 Z"
            fill="url(#cp-tank)"
            stroke="#3a0008"
            strokeWidth="1.5"
          />
          {/* Tank highlight strip */}
          <path d="M 175 78 L 285 73 L 287 85 L 178 89 Z" fill="rgba(255,255,255,0.18)" />
          {/* Tank logo accent */}
          <text x="220" y="100" fill="rgba(255,255,255,0.6)" fontSize="9" fontFamily="monospace" letterSpacing="2">
            YAIBA
          </text>

          {/* ─── FRONT FAIRING (sloped, swept-back) ─── */}
          <path
            d="M 30 90 Q 60 50 130 60 L 170 75 L 175 115 L 100 120 Q 50 118 30 110 Z"
            fill="url(#cp-fairing)"
            stroke="#3a0008"
            strokeWidth="1.5"
          />
          {/* Windscreen */}
          <path
            d="M 60 70 Q 90 38 140 50 L 155 70 Q 110 60 65 78 Z"
            fill="rgba(0,229,255,0.32)"
            stroke="rgba(0,229,255,0.6)"
            strokeWidth="1"
          />
          {/* Headlight */}
          <ellipse cx="55" cy="100" rx="14" ry="8" fill="#fff" opacity="0.95" />
          <ellipse cx="55" cy="100" rx="22" ry="13" fill="#fff" opacity="0.4" filter="blur(4px)" />
          {/* Front fairing LED strip — cyan */}
          <path d="M 35 105 Q 80 102 130 108" stroke="url(#cp-led-cyan)" strokeWidth="2.5" fill="none" />
          <path
            d="M 35 105 Q 80 102 130 108"
            stroke="url(#cp-led-cyan)"
            strokeWidth="2.5"
            fill="none"
            filter="blur(3px)"
            opacity="0.85"
          />

          {/* ─── RIDER (leaning forward) ─── */}
          {/* Body */}
          <path
            d="M 180 35 Q 215 25 245 40 L 255 70 L 230 78 L 200 75 L 175 65 Z"
            fill="url(#cp-rider)"
            stroke="#000"
            strokeWidth="1"
          />
          {/* Helmet */}
          <ellipse cx="220" cy="32" rx="22" ry="20" fill="#0a0a0e" stroke="#000" strokeWidth="1.5" />
          <path
            d="M 205 28 Q 220 22 238 28 L 238 38 L 205 38 Z"
            fill="rgba(0,229,255,0.45)"
            stroke="rgba(0,229,255,0.7)"
            strokeWidth="0.8"
          />
          {/* Backpack/pill (Kaneda nod) */}
          <ellipse cx="262" cy="58" rx="10" ry="14" fill="#1a1a22" stroke="#3a3a40" strokeWidth="0.8" />
          <rect x="258" y="52" width="8" height="3" fill="#ff003c" />

          {/* Arms forward to handlebars */}
          <path
            d="M 180 60 Q 130 70 105 90 L 100 100 Q 95 95 100 80 Q 130 55 175 50 Z"
            fill="url(#cp-rider)"
            stroke="#000"
            strokeWidth="1"
          />

          {/* ─── FRONT WHEEL (partial visible at front) ─── */}
          <circle cx="60" cy="155" r="28" fill="url(#cp-wheel)" stroke="#000" strokeWidth="2" />
          <circle cx="60" cy="155" r="18" fill="#0a0a0e" />
          <circle cx="60" cy="155" r="6" fill="#00e5ff" opacity="0.55" filter="blur(1px)" />
          {Array.from({ length: 5 }, (_, i) => {
            const angle = (i / 5) * Math.PI * 2;
            return (
              <line
                key={`fs-${i}`}
                x1={60 + Math.cos(angle) * 4}
                y1={155 + Math.sin(angle) * 4}
                x2={60 + Math.cos(angle) * 17}
                y2={155 + Math.sin(angle) * 17}
                stroke="#1a1a22"
                strokeWidth="2"
              />
            );
          })}
          {/* Front fork */}
          <line x1="60" y1="155" x2="80" y2="115" stroke="#1a1a22" strokeWidth="3" />

          {/* ─── SWINGARM (single-sided) ─── */}
          <path d="M 280 140 L 380 155 L 380 165 L 280 152 Z" fill="#1a1a22" stroke="#000" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
};

export default CyberpunkTransition;

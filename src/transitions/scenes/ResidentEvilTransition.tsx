import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useTransition } from '../TransitionContext';

const PLATE_BG =
  'radial-gradient(ellipse at 30% 30%, rgba(180,10,10,0.18), transparent 55%),' +
  'radial-gradient(circle at 80% 70%, rgba(110,0,0,0.25), transparent 60%),' +
  'repeating-linear-gradient(45deg, rgba(20,8,8,0.6) 0 3px, rgba(8,3,4,0.8) 3px 6px),' +
  'linear-gradient(180deg, #0c0507 0%, #1a0608 50%, #0a0405 100%)';

const ResidentEvilTransition = () => {
  const { markCovered, markRevealed } = useTransition();
  const root = useRef<HTMLDivElement>(null);
  const sparkCanvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<
    Array<{ x: number; y: number; vx: number; vy: number; life: number; max: number; size: number }>
  >([]);
  const rafRef = useRef<number | null>(null);
  const emitSparks = useRef(false);

  useEffect(() => {
    const canvas = sparkCanvasRef.current;
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

    const muzzleEl = root.current?.querySelector('.re-muzzle-anchor') as HTMLElement | null;

    const loop = () => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(8,4,5,0.12)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      if (emitSparks.current && muzzleEl) {
        const r = muzzleEl.getBoundingClientRect();
        const ox = r.left + r.width / 2;
        const oy = r.top + r.height / 2;
        for (let i = 0; i < 6; i++) {
          const angle = -Math.PI + (Math.random() - 0.5) * 0.9;
          const speed = 4 + Math.random() * 9;
          sparksRef.current.push({
            x: ox,
            y: oy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 2,
            life: 0,
            max: 40 + Math.random() * 35,
            size: 1.5 + Math.random() * 2,
          });
        }
      }

      ctx.globalCompositeOperation = 'screen';
      const alive: typeof sparksRef.current = [];
      for (const s of sparksRef.current) {
        s.life++;
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.18;
        s.vx *= 0.98;
        const t = s.life / s.max;
        if (t >= 1) continue;
        const alpha = 1 - t;
        ctx.strokeStyle = `rgba(255, ${180 + Math.random() * 60}, 60, ${alpha})`;
        ctx.lineWidth = s.size;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 1.5, s.y - s.vy * 1.5);
        ctx.stroke();
        ctx.fillStyle = `rgba(255, 240, 200, ${alpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
        alive.push(s);
      }
      sparksRef.current = alive;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  useGSAP(
    () => {
      const tl = gsap.timeline();

      tl.fromTo('.re-top', { yPercent: -100 }, { yPercent: 0, duration: 0.45, ease: 'power3.in' }, 0)
        .fromTo('.re-bottom', { yPercent: 100 }, { yPercent: 0, duration: 0.45, ease: 'power3.in' }, 0)
        .call(markCovered, [], 0.5)

        // ── GUN ENTERS — Requiem revolver slides in from right with breathing ─
        .fromTo(
          '.re-gun',
          { xPercent: 120, yPercent: -10, rotate: -18, opacity: 0 },
          { xPercent: 0, yPercent: 0, rotate: -8, opacity: 1, duration: 0.55, ease: 'power3.out' },
          0.55
        )
        .to('.re-gun', { yPercent: 1.5, duration: 0.18, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 1.05)

        // ── HAMMER COCK + cylinder rotate ─────────────────────────────────────
        .to('.re-hammer', { rotate: -32, duration: 0.18, ease: 'power2.in' }, 1.15)
        .to('.re-cylinder', { rotate: 60, duration: 0.18, ease: 'power2.out' }, 1.15)
        .to('.re-hammer', { rotate: 0, duration: 0.04, ease: 'power4.in' }, 1.42)

        // ── FIRE ──────────────────────────────────────────────────────────────
        .call(() => {
          emitSparks.current = true;
        }, [], 1.46)
        // Camera shake (root)
        .to(root.current, {
          keyframes: [
            { x: -14, y: 6, duration: 0.04 },
            { x: 12, y: -8, duration: 0.04 },
            { x: -8, y: 4, duration: 0.04 },
            { x: 6, y: -3, duration: 0.04 },
            { x: 0, y: 0, duration: 0.06 },
          ],
          ease: 'none',
        }, 1.46)
        // Recoil — gun lurches back and up, then settles
        .to('.re-gun', {
          xPercent: 18,
          yPercent: -14,
          rotate: -22,
          duration: 0.08,
          ease: 'power4.out',
        }, 1.46)
        .to('.re-gun', {
          xPercent: 0,
          yPercent: 0,
          rotate: -8,
          duration: 0.55,
          ease: 'elastic.out(1, 0.4)',
        }, 1.55)
        // Muzzle bloom — radial flash
        .fromTo('.re-muzzle-bloom', {
          opacity: 0, scale: 0.2,
        }, {
          opacity: 1, scale: 3.2, duration: 0.06, ease: 'power2.out',
        }, 1.46)
        .to('.re-muzzle-bloom', {
          opacity: 0, scale: 4.5, duration: 0.18, ease: 'power3.out',
        }, 1.52)
        // Muzzle smoke wisp
        .fromTo('.re-muzzle-smoke', {
          opacity: 0, scale: 0.8, x: 0,
        }, {
          opacity: 0.7, scale: 1.6, x: -40, duration: 0.6, ease: 'power2.out',
        }, 1.52)
        .to('.re-muzzle-smoke', { opacity: 0, scale: 2.2, duration: 0.7, ease: 'power2.out' }, 1.95)
        // Screen white-flash
        .to('.re-flash', { opacity: 1, duration: 0.04 }, 1.46)
        .to('.re-flash', { opacity: 0, duration: 0.35, ease: 'power3.out' }, 1.5)

        // ── BULLET STREAK — diagonal trail crosses screen ─────────────────────
        .fromTo('.re-bullet', {
          xPercent: -10, yPercent: -10, opacity: 0, scaleX: 0.2,
        }, {
          xPercent: 120, yPercent: 120, opacity: 1, scaleX: 1, duration: 0.16, ease: 'power2.in',
        }, 1.5)
        .to('.re-bullet', { opacity: 0, duration: 0.04 }, 1.66)
        // Vapor trail (line that draws then fades)
        .fromTo('.re-vapor', {
          strokeDashoffset: 1000,
          opacity: 0.9,
        }, {
          strokeDashoffset: 0, duration: 0.18, ease: 'power2.in',
        }, 1.5)
        .to('.re-vapor', { opacity: 0, duration: 0.4, ease: 'power2.out' }, 1.7)

        // ── CRACK PROPAGATION ─────────────────────────────────────────────────
        .call(() => {
          emitSparks.current = false;
        }, [], 1.7)
        .fromTo('.re-crack-main', {
          strokeDashoffset: 600,
          opacity: 1,
        }, {
          strokeDashoffset: 0, duration: 0.25, ease: 'power3.in',
        }, 1.66)
        .fromTo('.re-crack-branch', {
          strokeDashoffset: 800,
          opacity: 0.85,
        }, {
          strokeDashoffset: 0, duration: 0.3, ease: 'power3.in',
        }, 1.7)
        // Crack glow pulse
        .fromTo('.re-slash-glow', { opacity: 0 }, {
          opacity: 1, duration: 0.06, repeat: 3, yoyo: true,
        }, 1.86)

        // ── TEAR ─ halves slide apart with rotation + shadow ─────────────────
        .to('.re-top', {
          yPercent: -130, rotate: -4, duration: 1.0, ease: 'expo.in',
        }, 2.0)
        .to('.re-bottom', {
          yPercent: 130, rotate: 4, duration: 1.0, ease: 'expo.in',
        }, 2.0)
        .to('.re-crack-main, .re-crack-branch, .re-slash-glow', {
          opacity: 0, duration: 0.4, ease: 'power3.out',
        }, 2.3)
        .to('.re-gun', { xPercent: 130, opacity: 0, duration: 0.5, ease: 'power3.in' }, 2.0)
        .call(markRevealed, [], 3.0);
    },
    { scope: root }
  );

  return (
    <div ref={root} className="absolute inset-0 overflow-hidden">
      {/* TOP HALF — has the bottom-side shadow */}
      <div
        className="re-top absolute inset-0 will-change-transform"
        style={{
          backgroundColor: '#08040a',
          backgroundImage: PLATE_BG,
          clipPath: 'polygon(0 0, 100% 0, 100% 38%, 0 62%)',
          boxShadow: 'inset 0 -6px 80px rgba(120,0,0,0.45), 0 8px 40px rgba(0,0,0,0.7)',
        }}
      />
      {/* BOTTOM HALF */}
      <div
        className="re-bottom absolute inset-0 will-change-transform"
        style={{
          backgroundColor: '#08040a',
          backgroundImage: PLATE_BG,
          clipPath: 'polygon(0 62%, 100% 38%, 100% 100%, 0 100%)',
          boxShadow: 'inset 0 6px 80px rgba(120,0,0,0.45), 0 -8px 40px rgba(0,0,0,0.7)',
        }}
      />

      {/* Bullet vapor trail — drawn along the diagonal */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="re-vapor-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="40%" stopColor="rgba(255,200,140,0.7)" />
            <stop offset="60%" stopColor="rgba(255,80,40,0.8)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <filter id="re-vapor-blur">
            <feGaussianBlur stdDeviation="0.4" />
          </filter>
        </defs>
        <line
          className="re-vapor"
          x1="-5"
          y1="-5"
          x2="115"
          y2="115"
          stroke="url(#re-vapor-grad)"
          strokeWidth="0.6"
          fill="none"
          filter="url(#re-vapor-blur)"
          strokeDasharray="1000 1000"
        />
      </svg>

      {/* CRACK SVG — main diagonal + branches */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="re-crack-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main diagonal crack with jagged path */}
        <path
          className="re-crack-main"
          d="M0 62 L8 60.5 L14 61.8 L22 59.6 L30 60.4 L38 57.8 L46 58.6 L54 56.2 L62 56.8 L70 54.4 L78 55.0 L86 52.4 L94 53.0 L100 50.0"
          stroke="#ff3030"
          strokeWidth="0.6"
          fill="none"
          strokeDasharray="600 600"
          filter="url(#re-crack-glow)"
        />
        <path
          className="re-crack-main"
          d="M0 62 L8 60.5 L14 61.8 L22 59.6 L30 60.4 L38 57.8 L46 58.6 L54 56.2 L62 56.8 L70 54.4 L78 55.0 L86 52.4 L94 53.0 L100 50.0"
          stroke="#ffffff"
          strokeWidth="0.18"
          fill="none"
          strokeDasharray="600 600"
        />

        {/* Branch cracks (jagged offshoots) */}
        <path
          className="re-crack-branch"
          d="M30 60.4 L34 65 L38 67 L44 71 M62 56.8 L68 53 L72 50 L78 46 M22 59.6 L18 64 L14 67 L10 71"
          stroke="#ff4040"
          strokeWidth="0.35"
          fill="none"
          strokeDasharray="800 800"
          filter="url(#re-crack-glow)"
        />

        {/* Glow line along the seam */}
        <line
          className="re-slash-glow"
          x1="0"
          y1="62"
          x2="100"
          y2="38"
          stroke="#ff2020"
          strokeWidth="0.4"
          opacity="0"
          filter="url(#re-crack-glow)"
        />
      </svg>

      {/* White screen flash */}
      <div className="re-flash absolute inset-0 bg-white opacity-0 mix-blend-screen pointer-events-none" />

      {/* Spark canvas (ejected at fire moment) */}
      <canvas ref={sparkCanvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Bullet (point of light streaking diagonally) */}
      <div
        className="re-bullet absolute top-0 left-0 w-24 h-1 pointer-events-none origin-left"
        style={{
          background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,220,140,1) 60%, #fff 100%)',
          boxShadow: '0 0 12px rgba(255,200,100,1), 0 0 24px rgba(255,140,60,0.8)',
          transform: 'rotate(45deg)',
        }}
      />

      {/* THE REQUIEM — modified RSh-12 magnum, drawn from a side angle */}
      <div className="re-gun absolute top-[44%] right-[5%] -translate-y-1/2 w-[640px] max-w-[68vw] pointer-events-none">
        <svg viewBox="0 0 640 240" className="w-full h-full" style={{ filter: 'drop-shadow(0 12px 18px rgba(0,0,0,0.85))' }}>
          <defs>
            <linearGradient id="re-metal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3a3a40" />
              <stop offset="40%" stopColor="#1a1a1f" />
              <stop offset="100%" stopColor="#0a0a0d" />
            </linearGradient>
            <linearGradient id="re-metal-bright" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#52525a" />
              <stop offset="50%" stopColor="#2a2a30" />
              <stop offset="100%" stopColor="#15151a" />
            </linearGradient>
            <linearGradient id="re-grip-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3a2418" />
              <stop offset="100%" stopColor="#1a0e08" />
            </linearGradient>
            <linearGradient id="re-bore" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#000" />
              <stop offset="50%" stopColor="#1a1a1f" />
              <stop offset="100%" stopColor="#000" />
            </linearGradient>
          </defs>

          {/* ───── GRIP (back) — wood/composite with checkering ───── */}
          <path
            d="M 80 80 Q 70 85 65 100 L 60 200 Q 60 215 75 218 L 130 220 Q 145 220 145 205 L 145 120 Q 145 100 130 92 Z"
            fill="url(#re-grip-grad)"
            stroke="#0a0604"
            strokeWidth="2"
          />
          {/* Checkering hatch pattern on grip */}
          <g stroke="rgba(80,50,30,0.6)" strokeWidth="0.6" fill="none">
            {Array.from({ length: 12 }, (_, i) => (
              <line key={`gv-${i}`} x1={75 + i * 6} y1={110} x2={70 + i * 6} y2={210} />
            ))}
            {Array.from({ length: 8 }, (_, i) => (
              <line key={`gh-${i}`} x1={62} y1={120 + i * 12} x2={143} y2={110 + i * 12} />
            ))}
          </g>
          {/* Grip palm-swell highlight */}
          <ellipse cx="105" cy="160" rx="25" ry="40" fill="rgba(120,80,50,0.18)" />

          {/* ───── FRAME / TRIGGER GUARD ───── */}
          <path
            d="M 145 80 L 245 75 L 250 110 L 235 115 Q 220 125 215 145 Q 215 160 230 165 L 250 165 L 255 195 L 145 195 Z"
            fill="url(#re-metal)"
            stroke="#000"
            strokeWidth="2"
          />
          {/* Trigger */}
          <path
            d="M 222 130 Q 218 145 225 158 Q 230 162 232 152 Q 234 138 230 130 Z"
            fill="#1a1a1f"
            stroke="#000"
            strokeWidth="1"
          />

          {/* ───── HAMMER (animates: rotate around its pivot) ───── */}
          <g className="re-hammer" style={{ transformOrigin: '180px 88px', transformBox: 'fill-box' as const }}>
            <path
              d="M 165 65 L 195 60 L 200 80 L 180 88 L 168 82 Z"
              fill="url(#re-metal-bright)"
              stroke="#000"
              strokeWidth="1.5"
            />
            <circle cx="180" cy="88" r="3" fill="#0a0a0a" />
          </g>

          {/* ───── CYLINDER ───── */}
          <g className="re-cylinder" style={{ transformOrigin: '305px 130px', transformBox: 'fill-box' as const }}>
            <circle cx="305" cy="130" r="60" fill="url(#re-metal)" stroke="#000" strokeWidth="2.5" />
            <circle cx="305" cy="130" r="52" fill="none" stroke="#000" strokeWidth="1" opacity="0.6" />
            {/* 6 chamber holes */}
            {Array.from({ length: 6 }, (_, i) => {
              const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
              const cx = 305 + Math.cos(angle) * 36;
              const cy = 130 + Math.sin(angle) * 36;
              return (
                <g key={`ch-${i}`}>
                  <circle cx={cx} cy={cy} r="9" fill="#000" />
                  <circle cx={cx} cy={cy} r="6" fill="#1a1410" stroke="#3a2418" strokeWidth="0.5" />
                </g>
              );
            })}
            {/* Center pin */}
            <circle cx="305" cy="130" r="6" fill="#0a0a0a" stroke="#2a2a2f" strokeWidth="1" />
            {/* Cylinder fluting (cuts) */}
            {Array.from({ length: 6 }, (_, i) => {
              const angle = (i / 6) * Math.PI * 2 - Math.PI / 2 + Math.PI / 6;
              const x1 = 305 + Math.cos(angle) * 12;
              const y1 = 130 + Math.sin(angle) * 12;
              const x2 = 305 + Math.cos(angle) * 48;
              const y2 = 130 + Math.sin(angle) * 48;
              return (
                <line key={`fl-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0a0a0a" strokeWidth="2" opacity="0.7" />
              );
            })}
          </g>

          {/* ───── BARREL SHROUD — distinctive 6 o'clock barrel, long, with vent holes ───── */}
          {/* Top rail (sights) */}
          <path
            d="M 260 95 L 600 88 L 605 100 L 265 105 Z"
            fill="url(#re-metal-bright)"
            stroke="#000"
            strokeWidth="1.5"
          />
          {/* Picatinny rail teeth */}
          {Array.from({ length: 14 }, (_, i) => (
            <rect
              key={`pr-${i}`}
              x={275 + i * 23}
              y={91}
              width={6}
              height={3}
              fill="#0a0a0a"
            />
          ))}
          {/* Front sight */}
          <path
            d="M 590 76 L 600 76 L 600 90 L 590 90 Z"
            fill="url(#re-metal)"
            stroke="#000"
            strokeWidth="1"
          />
          <rect x="593" y="78" width="3" height="3" fill="#ff8030" />

          {/* Main barrel body (BOTTOM half — 6 o'clock orientation) */}
          <path
            d="M 365 145 L 600 138 L 612 158 L 612 180 L 365 180 Z"
            fill="url(#re-metal)"
            stroke="#000"
            strokeWidth="2"
          />
          {/* Vent / lightening cuts in the shroud */}
          {Array.from({ length: 7 }, (_, i) => (
            <ellipse
              key={`vt-${i}`}
              cx={395 + i * 32}
              cy={158}
              rx={9}
              ry={5}
              fill="#000"
              opacity="0.85"
            />
          ))}
          {/* Recessed strip along top of barrel */}
          <rect x="365" y="142" width="245" height="6" fill="#0a0a0a" opacity="0.55" />

          {/* Muzzle */}
          <path d="M 605 145 L 625 150 L 625 175 L 605 180 Z" fill="url(#re-metal-bright)" stroke="#000" strokeWidth="2" />
          {/* Bore (black hole at end of muzzle) */}
          <ellipse cx="618" cy="162" rx="4" ry="11" fill="url(#re-bore)" />

          {/* Anchor point for spark emission — invisible marker */}
          <circle className="re-muzzle-anchor" cx="625" cy="162" r="2" fill="transparent" />
        </svg>

        {/* MUZZLE BLOOM — radial flash centered at muzzle */}
        <div
          className="re-muzzle-bloom absolute opacity-0 pointer-events-none"
          style={{
            top: '64%',
            left: '95%',
            width: 240,
            height: 240,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            background:
              'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,240,180,0.95) 18%, rgba(255,180,80,0.85) 35%, rgba(255,90,30,0.6) 55%, rgba(180,30,10,0) 75%)',
            filter: 'blur(2px)',
            mixBlendMode: 'screen',
          }}
        />

        {/* Muzzle smoke wisp */}
        <div
          className="re-muzzle-smoke absolute opacity-0 pointer-events-none"
          style={{
            top: '60%',
            left: '92%',
            width: 180,
            height: 100,
            transform: 'translate(-50%, -50%)',
            background:
              'radial-gradient(ellipse, rgba(160,160,160,0.55) 0%, rgba(80,80,80,0.3) 40%, rgba(0,0,0,0) 75%)',
            filter: 'blur(8px)',
          }}
        />
      </div>
    </div>
  );
};

export default ResidentEvilTransition;

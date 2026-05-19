import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useTransition } from '../TransitionContext';

// Skyline gradient + warm NY night atmosphere
const VEIL_BG =
  'radial-gradient(ellipse at 70% 0%, rgba(255,180,80,0.12), transparent 50%),' +
  'radial-gradient(ellipse at 20% 90%, rgba(255,45,85,0.18), transparent 55%),' +
  'linear-gradient(180deg, #0a0612 0%, #15081f 35%, #2a0a28 65%, #0a0512 100%)';

/**
 * Procedural web rendered via SVG path. We animate four variables held in
 * `state` through a GSAP timeline; a rAF loop reads them and rewrites the
 * path `d` every frame, so the web actually curves and stretches like a
 * physical strand instead of being a static line.
 */
const SpiderManTransition = () => {
  const { markCovered, markRevealed } = useTransition();
  const root = useRef<HTMLDivElement>(null);
  const mainPathRef = useRef<SVGPathElement>(null);
  const sideAPathRef = useRef<SVGPathElement>(null);
  const sideBPathRef = useRef<SVGPathElement>(null);
  const zigzagPathRef = useRef<SVGPathElement>(null);
  const rafRef = useRef<number | null>(null);

  // Animated state — all values in % of an 800×600 viewBox
  const state = useRef({
    endY: -10, // tip of the web (descends as it's shot)
    veilOffsetY: 0, // veil position (0 = covering screen, +100 = below)
    veilTilt: 0, // skewY for organic bend
    veilRot: 0, // rotation as if hanging
    sway: 0, // horizontal sway used for curve control point
    snapped: false, // when true, hide the web (it broke)
  });

  useEffect(() => {
    let prev = performance.now();
    let phase = 0; // 0..1 used to wiggle control point

    const updatePaths = () => {
      const now = performance.now();
      const dt = now - prev;
      prev = now;
      phase += dt * 0.004;

      const s = state.current;
      if (s.snapped) {
        if (mainPathRef.current) mainPathRef.current.setAttribute('opacity', '0');
        if (sideAPathRef.current) sideAPathRef.current.setAttribute('opacity', '0');
        if (sideBPathRef.current) sideBPathRef.current.setAttribute('opacity', '0');
        if (zigzagPathRef.current) zigzagPathRef.current.setAttribute('opacity', '0');
      } else {
        // Anchor — fixed off-screen, top-center
        const ax = 400 + Math.sin(phase * 0.8) * 4;
        const ay = -40;

        // End of web — moves with veil
        const ex = 400 + s.sway;
        const ey = s.endY + s.veilOffsetY * 3.5;

        // Curve sag from gravity — peaks halfway between anchor and end
        const sag = Math.min(40, Math.abs(ey - ay) * 0.18);
        const wiggle = Math.sin(phase * 6) * 3 * (s.snapped ? 0 : 1);

        // Main strand — natural sag curve via cubic Bezier
        const cpx1 = ax + 18 + wiggle;
        const cpy1 = ay + (ey - ay) * 0.35 + sag * 0.5;
        const cpx2 = ex - 22 - wiggle;
        const cpy2 = ay + (ey - ay) * 0.7 + sag;

        if (mainPathRef.current) {
          mainPathRef.current.setAttribute(
            'd',
            `M ${ax} ${ay} C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${ex} ${ey}`,
          );
          mainPathRef.current.setAttribute('opacity', '1');
        }

        // Side strands — parallel offset for "rope of webs" depth
        if (sideAPathRef.current) {
          sideAPathRef.current.setAttribute(
            'd',
            `M ${ax - 4} ${ay} C ${cpx1 - 8} ${cpy1 + 2}, ${cpx2 - 6} ${cpy2 + 1}, ${ex - 6} ${ey}`,
          );
          sideAPathRef.current.setAttribute('opacity', '0.7');
        }
        if (sideBPathRef.current) {
          sideBPathRef.current.setAttribute(
            'd',
            `M ${ax + 4} ${ay} C ${cpx1 + 8} ${cpy1 - 2}, ${cpx2 + 6} ${cpy2 - 1}, ${ex + 6} ${ey}`,
          );
          sideBPathRef.current.setAttribute('opacity', '0.7');
        }

        // Zigzag detail — barbs along the strand
        if (zigzagPathRef.current) {
          const segments = 18;
          let d = '';
          for (let i = 1; i < segments; i++) {
            const t = i / segments;
            const t2 = t * t;
            const t3 = t2 * t;
            const u = 1 - t;
            const u2 = u * u;
            const u3 = u2 * u;
            // cubic Bezier midpoint along the main curve
            const px = u3 * ax + 3 * u2 * t * cpx1 + 3 * u * t2 * cpx2 + t3 * ex;
            const py = u3 * ay + 3 * u2 * t * cpy1 + 3 * u * t2 * cpy2 + t3 * ey;
            // Perpendicular offset toggling sides
            const dx = ex - ax;
            const dy = ey - ay;
            const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
            const nx = -dy / len;
            const ny = dx / len;
            const off = (i % 2 === 0 ? 5 : -5) + Math.sin(phase + i) * 0.6;
            d += `${i === 1 ? 'M' : 'L'} ${px + nx * off} ${py + ny * off} `;
          }
          zigzagPathRef.current.setAttribute('d', d);
          zigzagPathRef.current.setAttribute('opacity', '0.55');
        }
      }

      rafRef.current = requestAnimationFrame(updatePaths);
    };
    rafRef.current = requestAnimationFrame(updatePaths);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useGSAP(
    () => {
      const tl = gsap.timeline();
      const s = state.current;

      // Veil starts ABOVE the viewport (so the new page is visible underneath
      // until the web pulls the veil into frame, then yanks it off)
      tl.set('.sm-veil', {
        yPercent: -110,
        rotate: 0,
        skewY: 0,
        scale: 1,
        opacity: 1,
        transformOrigin: '50% 0%',
      })
        .set('.sm-flash', { opacity: 0 })
        .set(s, { endY: -40, veilOffsetY: -150, veilTilt: 0, veilRot: 0, sway: 0, snapped: false })

        // ── 0.00–0.30  WEB SHOOTS DOWN ────────────────────────────────────────
        // Tip of web descends rapidly
        .to(s, {
          endY: 290,
          duration: 0.28,
          ease: 'power4.out',
          onUpdate: () => {},
        }, 0)
        // "Thwip" splash at anchor when web extends
        .fromTo('.sm-thwip',
          { opacity: 0, scale: 0.4 },
          { opacity: 1, scale: 1.6, duration: 0.1, ease: 'power3.out' }, 0)
        .to('.sm-thwip', { opacity: 0, duration: 0.2, ease: 'power2.out' }, 0.1)

        // ── 0.20–0.55  WEB ATTACHES, PULLS VEIL DOWN INTO FRAME ──────────────
        // Veil drops with elastic snap, like cloth catching on the web
        .to('.sm-veil', {
          yPercent: 0,
          duration: 0.42,
          ease: 'back.out(1.6)',
        }, 0.18)
        // Web's end-Y now tracks the veil — animate sync
        .to(s, {
          veilOffsetY: 0,
          duration: 0.42,
          ease: 'back.out(1.6)',
        }, 0.18)

        // Tension wobble — page sways slightly side to side as it settles
        .to('.sm-veil', {
          rotate: 1.2,
          skewY: -1,
          duration: 0.12,
          yoyo: true,
          repeat: 1,
          ease: 'sine.inOut',
        }, 0.62)
        .to(s, {
          sway: 5,
          duration: 0.12,
          yoyo: true,
          repeat: 1,
          ease: 'sine.inOut',
        }, 0.62)

        .call(markCovered, [], 0.7)

        // ── 0.85–1.60  YANK — pendulum swing + organic deformation ───────────
        .to('.sm-veil', {
          keyframes: [
            { yPercent: 12, rotate: 4, skewY: -2, scale: 0.98, duration: 0.15 },
            { yPercent: 55, rotate: 12, skewY: -5, scale: 0.92, duration: 0.25 },
            { yPercent: 130, rotate: 22, skewY: -2, scale: 0.82, duration: 0.35 },
          ],
          ease: 'power4.in',
        }, 0.85)
        // Web stretches with the veil — endY follows veil drop
        .to(s, {
          veilOffsetY: 220,
          sway: 30,
          duration: 0.75,
          ease: 'power4.in',
        }, 0.85)

        // ── 1.60–1.75  SNAP — web breaks, flash, veil whips out ──────────────
        .to('.sm-veil', {
          yPercent: 220,
          rotate: 35,
          skewY: 4,
          scale: 0.7,
          duration: 0.3,
          ease: 'expo.in',
        }, 1.6)
        .call(() => {
          s.snapped = true;
        }, [], 1.6)
        .to('.sm-flash', {
          opacity: 0.45,
          duration: 0.05,
          ease: 'power2.out',
        }, 1.6)
        .to('.sm-flash', {
          opacity: 0,
          duration: 0.35,
          ease: 'power3.out',
        }, 1.65)

        // ── 1.95  DONE ────────────────────────────────────────────────────────
        .call(markRevealed, [], 1.95);
    },
    { scope: root }
  );

  return (
    <div ref={root} className="absolute inset-0 overflow-hidden">
      {/* THE VEIL — page surface that gets yanked. Skyline with NY night colors */}
      <div
        className="sm-veil absolute inset-0 will-change-transform"
        style={{
          background: VEIL_BG,
          boxShadow:
            'inset 0 -8px 80px rgba(255,45,85,0.18), 0 30px 80px rgba(0,0,0,0.75)',
          transformOrigin: '50% 0%',
        }}
      >
        {/* Skyline silhouette */}
        <svg
          viewBox="0 0 800 400"
          className="absolute bottom-0 left-0 right-0 w-full h-1/2 opacity-65"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="sm-sky-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a0a1f" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <path
            d="M0 320 L40 280 L40 260 L70 260 L70 240 L120 240 L120 290 L170 290 L170 220 L220 220 L220 280 L260 280 L260 200 L320 200 L320 270 L370 270 L370 250 L420 250 L420 180 L480 180 L480 260 L540 260 L540 230 L600 230 L600 290 L660 290 L660 240 L720 240 L720 270 L780 270 L800 280 L800 400 L0 400 Z"
            fill="url(#sm-sky-grad)"
          />
          {/* Random lit windows */}
          {Array.from({ length: 40 }, (_, i) => (
            <rect
              key={`w-${i}`}
              x={50 + (i * 19) % 720}
              y={210 + ((i * 37) % 100)}
              width="3"
              height="4"
              fill="#ffcc66"
              opacity={0.5 + Math.random() * 0.4}
            />
          ))}
        </svg>

        {/* Subtle film grain / noise overlay */}
        <div
          className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              'repeating-radial-gradient(circle at 30% 40%, transparent 0 4px, rgba(255,255,255,0.4) 4px 5px),' +
              'repeating-radial-gradient(circle at 70% 60%, transparent 0 5px, rgba(255,255,255,0.3) 5px 6px)',
          }}
        />
      </div>

      {/* WEB SVG OVERLAY — drawn over the veil */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMin slice"
      >
        <defs>
          <filter id="sm-web-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="sm-web-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
            <stop offset="100%" stopColor="rgba(220,220,240,0.85)" />
          </linearGradient>
        </defs>

        {/* Outer glow strand */}
        <path
          ref={sideAPathRef}
          stroke="rgba(200,200,255,0.5)"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          filter="url(#sm-web-glow)"
        />
        {/* Second outer */}
        <path
          ref={sideBPathRef}
          stroke="rgba(220,220,255,0.55)"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          filter="url(#sm-web-glow)"
        />
        {/* Main bright strand */}
        <path
          ref={mainPathRef}
          stroke="url(#sm-web-grad)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* Zigzag detail — barbs */}
        <path
          ref={zigzagPathRef}
          stroke="rgba(255,255,255,0.65)"
          strokeWidth="0.8"
          fill="none"
          strokeLinejoin="miter"
        />
      </svg>

      {/* Thwip splash at top */}
      <div
        className="sm-thwip absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 opacity-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(200,200,255,0.5) 40%, transparent 70%)',
          filter: 'blur(2px)',
          mixBlendMode: 'screen',
        }}
      />

      {/* White snap flash */}
      <div className="sm-flash absolute inset-0 bg-white opacity-0 mix-blend-screen pointer-events-none" />
    </div>
  );
};

export default SpiderManTransition;

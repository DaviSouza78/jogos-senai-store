import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useTransition } from '../TransitionContext';

const HUD_LINES = [
  '> INITIALIZING SYSTEM',
  '> LOADING ASSET MANIFEST',
  '> ALLOCATING FRAME 03/12',
  '> RIGGING HULL PLATES',
  '> CALIBRATING SERVOS',
  '> BOOT SEQUENCE READY',
];

const ArcRaidersTransition = () => {
  const { markCovered, markRevealed } = useTransition();
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline();

      tl.fromTo(
        '.arc-veil',
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' },
        0
      )
        .fromTo(
          '.arc-grid',
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' },
          0
        )
        .call(markCovered, [], 0.32)

        .fromTo(
          '.arc-hud-line',
          { opacity: 0, x: -10 },
          {
            opacity: 1,
            x: 0,
            duration: 0.18,
            ease: 'steps(4)',
            stagger: 0.07,
          },
          0.35
        )

        .to('.arc-target', { rotate: 90, duration: 1.6, ease: 'none' }, 0.4)
        .fromTo(
          '.arc-target',
          { opacity: 0 },
          { opacity: 0.9, duration: 0.3 },
          0.4
        )

        .to({}, { duration: 1.2 }, 0.6)

        .to('.arc-hud', { opacity: 0, duration: 0.4, ease: 'power2.out' }, 2.0)
        .to(
          '.arc-grid',
          { opacity: 0, scale: 1.2, duration: 0.5, ease: 'power3.in' },
          2.0
        )
        .to(
          '.arc-veil',
          { opacity: 0, duration: 0.5, ease: 'power3.in' },
          2.1
        )
        .call(markRevealed, [], 2.65);
    },
    { scope: root }
  );

  return (
    <div ref={root} className="absolute inset-0 overflow-hidden font-mono">
      <div className="arc-veil absolute inset-0 bg-[#02060a] opacity-0" />

      <div
        className="arc-grid absolute inset-0 opacity-0"
        style={{
          background: `
            repeating-linear-gradient(0deg,  rgba(0,229,255,0.18) 0 1px, transparent 1px 38px),
            repeating-linear-gradient(90deg, rgba(0,229,255,0.18) 0 1px, transparent 1px 38px),
            radial-gradient(circle at 50% 50%, rgba(0,229,255,0.18), transparent 70%)`,
        }}
      />

      <div
        className="arc-target absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 opacity-0 pointer-events-none"
        style={{
          border: '1px solid rgba(0,229,255,0.6)',
          borderRadius: '50%',
          boxShadow: '0 0 24px rgba(0,229,255,0.3), inset 0 0 24px rgba(0,229,255,0.15)',
        }}
      >
        <div
          className="absolute inset-4 border border-cyan/40 rounded-full"
          style={{ borderColor: 'rgba(0,229,255,0.4)' }}
        />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan/40" />
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-cyan/40" />
      </div>

      <div className="arc-hud absolute top-8 left-8 text-cyan text-xs tracking-widest space-y-1.5 pointer-events-none">
        {HUD_LINES.map((line, i) => (
          <div
            key={i}
            className="arc-hud-line opacity-0"
            style={{ textShadow: '0 0 8px rgba(0,229,255,0.7)' }}
          >
            {line}
          </div>
        ))}
      </div>

      <div
        className="absolute bottom-8 right-8 text-cyan text-[10px] tracking-[0.3em] opacity-70 pointer-events-none"
        style={{ textShadow: '0 0 8px rgba(0,229,255,0.7)' }}
      >
        ARC // RAIDERS — ASSEMBLY PROTOCOL
      </div>
    </div>
  );
};

export default ArcRaidersTransition;

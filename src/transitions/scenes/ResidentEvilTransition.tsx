import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useTransition } from '../TransitionContext';

const PLATE_BG =
  'radial-gradient(circle at 30% 40%, rgba(140,0,0,0.35), transparent 55%),' +
  'repeating-linear-gradient(45deg, #0a0405 0 3px, #160709 3px 6px)';

const ResidentEvilTransition = () => {
  const { markCovered, markRevealed } = useTransition();
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline();

      tl.fromTo(
        '.re-top',
        { yPercent: -100 },
        { yPercent: 0, duration: 0.4, ease: 'power3.in' },
        0
      )
        .fromTo(
          '.re-bottom',
          { yPercent: 100 },
          { yPercent: 0, duration: 0.4, ease: 'power3.in' },
          0
        )
        .call(markCovered, [], 0.42)

        .fromTo(
          '.re-leon',
          { xPercent: -150, opacity: 0 },
          { xPercent: 280, opacity: 1, duration: 0.55, ease: 'power2.out' },
          0.45
        )
        .to(
          '.re-muzzle',
          { opacity: 1, scale: 1.6, duration: 0.04, repeat: 5, yoyo: true, ease: 'none' },
          0.55
        )

        .fromTo(
          '.re-slash',
          { opacity: 0 },
          { opacity: 1, duration: 0.06, repeat: 4, yoyo: true, ease: 'none' },
          0.85
        )
        .to('.re-flash', { opacity: 0.85, duration: 0.05, yoyo: true, repeat: 1 }, 0.9)

        .to(
          '.re-top',
          { yPercent: -115, rotate: -2.2, duration: 0.75, ease: 'power3.in' },
          1.0
        )
        .to(
          '.re-bottom',
          { yPercent: 115, rotate: 2.2, duration: 0.75, ease: 'power3.in' },
          1.0
        )
        .to('.re-slash', { opacity: 0, duration: 0.3 }, 1.45)
        .call(markRevealed, [], 1.8);
    },
    { scope: root }
  );

  return (
    <div ref={root} className="absolute inset-0 overflow-hidden">
      <div
        className="re-top absolute inset-0 will-change-transform"
        style={{
          backgroundColor: '#08040a',
          backgroundImage: PLATE_BG,
          clipPath: 'polygon(0 0, 100% 0, 100% 38%, 0 62%)',
          boxShadow: 'inset 0 -4px 60px rgba(255,40,40,0.35)',
        }}
      />
      <div
        className="re-bottom absolute inset-0 will-change-transform"
        style={{
          backgroundColor: '#08040a',
          backgroundImage: PLATE_BG,
          clipPath: 'polygon(0 62%, 100% 38%, 100% 100%, 0 100%)',
          boxShadow: 'inset 0 4px 60px rgba(255,40,40,0.35)',
        }}
      />

      <div className="re-flash absolute inset-0 bg-white opacity-0 mix-blend-screen pointer-events-none" />

      <svg
        className="re-slash absolute inset-0 w-full h-full opacity-0 mix-blend-screen pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <filter id="re-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <line
          x1="0"
          y1="62"
          x2="100"
          y2="38"
          stroke="#ff2a2a"
          strokeWidth="0.5"
          filter="url(#re-glow)"
        />
        <line x1="0" y1="62" x2="100" y2="38" stroke="#ffffff" strokeWidth="0.12" />
      </svg>

      <div className="re-leon absolute top-[42%] left-0 -translate-y-1/2 w-40 h-56 opacity-0 pointer-events-none">
        <svg
          viewBox="0 0 100 150"
          className="w-full h-full"
          style={{ filter: 'drop-shadow(0 0 18px rgba(255,40,40,0.6))' }}
        >
          <path
            d="M40 28 Q50 22 60 28 L64 56 L82 78 L78 84 L66 72 L66 108 L58 150 L48 150 L48 108 L36 150 L26 150 L34 108 L34 70 L20 88 L16 84 L26 56 Z"
            fill="#0a0a0a"
            stroke="#ff2a2a"
            strokeWidth="1.2"
          />
          <rect x="76" y="68" width="18" height="4" fill="#1a1a1a" stroke="#ff2a2a" strokeWidth="0.6" />
        </svg>
        <div
          className="re-muzzle absolute opacity-0"
          style={{
            top: '46%',
            left: '88%',
            width: 70,
            height: 70,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, #fff 0%, #ffe080 25%, #ff6a30 50%, rgba(255,40,30,0) 70%)',
            filter: 'blur(2px)',
          }}
        />
      </div>
    </div>
  );
};

export default ResidentEvilTransition;

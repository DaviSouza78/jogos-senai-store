import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useTransition } from '../TransitionContext';

const SKYLINE_BG =
  'linear-gradient(180deg, #0a0814 0%, #15071a 45%, #2a0820 75%, #0a0a18 100%),' +
  'radial-gradient(circle at 50% 90%, rgba(255,45,85,0.25), transparent 55%)';

const SpiderManTransition = () => {
  const { markCovered, markRevealed } = useTransition();
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline();

      tl.set('.sm-veil', { yPercent: -100, rotate: 0, scale: 1 })
        .set('.sm-web', { scaleY: 0 })
        .set('.sm-flash', { opacity: 0 })

        .to('.sm-web', { scaleY: 1, duration: 0.18, ease: 'power4.out' }, 0)
        .to('.sm-thwip', { opacity: 1, scale: 1.4, duration: 0.05, yoyo: true, repeat: 1 }, 0)

        .to(
          '.sm-veil',
          {
            yPercent: 0,
            duration: 0.22,
            ease: 'back.out(2.2)',
          },
          0.08
        )

        .call(markCovered, [], 0.32)

        .to(
          '.sm-veil',
          {
            yPercent: 1.5,
            duration: 0.08,
            yoyo: true,
            repeat: 1,
            ease: 'sine.inOut',
          },
          0.34
        )

        .to(
          '.sm-veil',
          {
            yPercent: 135,
            rotate: 9,
            scale: 0.88,
            transformOrigin: '50% 0%',
            duration: 0.7,
            ease: 'expo.in',
          },
          0.55
        )
        .to(
          '.sm-web',
          {
            scaleY: 2.4,
            duration: 0.55,
            ease: 'expo.in',
          },
          0.55
        )

        .to('.sm-flash', { opacity: 0.55, duration: 0.05 }, 1.18)
        .to('.sm-flash', { opacity: 0, duration: 0.25, ease: 'power2.out' }, 1.23)
        .to('.sm-web', { opacity: 0, scaleY: 0.2, duration: 0.18, ease: 'power3.out' }, 1.2)

        .call(markRevealed, [], 1.55);
    },
    { scope: root }
  );

  return (
    <div ref={root} className="absolute inset-0 overflow-hidden">
      <div
        className="sm-web absolute top-0 left-1/2 -translate-x-1/2 w-[6px] h-full pointer-events-none"
        style={{
          transformOrigin: '50% 0%',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(220,220,255,0.6))',
          boxShadow: '0 0 8px rgba(255,255,255,0.8), 0 0 18px rgba(180,180,255,0.4)',
        }}
      />
      <div
        className="sm-web absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-full pointer-events-none"
        style={{
          transformOrigin: '50% 0%',
          background: '#ffffff',
          boxShadow: '0 0 4px rgba(255,255,255,1)',
        }}
      />

      <div
        className="sm-thwip absolute top-2 left-1/2 -translate-x-1/2 w-12 h-12 opacity-0 pointer-events-none"
        style={{
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(255,255,255,0.9), rgba(180,180,255,0.5) 50%, transparent 70%)',
          filter: 'blur(1px)',
        }}
      />

      <div
        className="sm-veil absolute inset-0 will-change-transform"
        style={{
          background: SKYLINE_BG,
          boxShadow:
            'inset 0 -8px 80px rgba(255,45,85,0.25), 0 30px 60px rgba(0,0,0,0.6)',
          transformOrigin: '50% 0%',
        }}
      >
        <svg viewBox="0 0 800 400" className="w-full h-full opacity-60" preserveAspectRatio="none">
          <path
            d="M0 320 L40 280 L40 260 L70 260 L70 240 L120 240 L120 290 L170 290 L170 220 L220 220 L220 280 L260 280 L260 200 L320 200 L320 270 L370 270 L370 250 L420 250 L420 180 L480 180 L480 260 L540 260 L540 230 L600 230 L600 290 L660 290 L660 240 L720 240 L720 270 L780 270 L800 280 L800 400 L0 400 Z"
            fill="#000"
            stroke="rgba(255,45,85,0.4)"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div className="sm-flash absolute inset-0 bg-white opacity-0 mix-blend-screen pointer-events-none" />
    </div>
  );
};

export default SpiderManTransition;

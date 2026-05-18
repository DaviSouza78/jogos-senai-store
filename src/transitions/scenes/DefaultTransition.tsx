import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useTransition } from '../TransitionContext';

const DefaultTransition = () => {
  const { markCovered, markRevealed } = useTransition();
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline();
      tl.fromTo('.dt-cover', { yPercent: -100 }, { yPercent: 0, duration: 0.35, ease: 'power3.in' })
        .call(markCovered)
        .to('.dt-cover', { yPercent: 100, duration: 0.45, ease: 'power3.out' }, '+=0.05')
        .call(markRevealed);
    },
    { scope: root }
  );

  return (
    <div ref={root} className="absolute inset-0">
      <div className="dt-cover absolute inset-0 bg-void" />
    </div>
  );
};

export default DefaultTransition;

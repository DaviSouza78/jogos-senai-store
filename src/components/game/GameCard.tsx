import { motion } from 'framer-motion';
import { useRef } from 'react';
import { Game } from '../../data/games';
import { useTransition } from '../../transitions/TransitionContext';

interface GameCardProps {
  game: Game;
}

const GameCard = ({ game }: GameCardProps) => {
  const { trigger, phase } = useTransition();
  const cardRef = useRef<HTMLDivElement>(null);

  const open = (e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    if (phase !== 'idle') return;
    trigger(game, cardRef.current?.getBoundingClientRect());
  };

  return (
    <motion.div
      ref={cardRef}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="glass-panel rounded-2xl overflow-hidden group cursor-pointer flex flex-col"
      onClick={() => open()}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      }}
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={game.coverImage}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/50 to-transparent opacity-80" />

        <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-display font-bold text-xl mb-1 text-glow">{game.title}</h3>
          <p className="text-muted text-sm mb-4 line-clamp-2">{game.description}</p>
          <button
            type="button"
            onClick={open}
            className="block w-full text-center bg-accent hover:bg-accent/80 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Ver Detalhes
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default GameCard;

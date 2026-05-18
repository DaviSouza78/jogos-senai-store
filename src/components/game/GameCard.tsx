import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Game } from '../../data/games';

interface GameCardProps {
  game: Game;
}

const GameCard = ({ game }: GameCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="glass-panel rounded-2xl overflow-hidden group cursor-pointer flex flex-col"
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
          <Link
            to={`/jogo/${game.id}`}
            className="block w-full text-center bg-accent hover:bg-accent/80 text-white font-semibold py-3 rounded-lg transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Ver Detalhes
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default GameCard;

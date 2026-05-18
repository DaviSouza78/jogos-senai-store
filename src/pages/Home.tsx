import { motion } from 'framer-motion';
import GameCard from '../components/game/GameCard';
import { games } from '../data/games';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-6 py-12"
    >
      <section className="mb-24 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-5xl md:text-7xl font-black mb-6 tracking-tight"
        >
          EXPLORE NOVOS <span className="text-cyan text-glow">MUNDOS</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted text-lg md:text-xl max-w-2xl mx-auto"
        >
          Os melhores jogos reunidos em um só lugar com uma experiência de próxima geração.
        </motion.p>
      </section>

      <section>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-1 h-8 bg-accent rounded-full" />
          <h2 className="font-display text-2xl font-bold">JOGOS EM DESTAQUE</h2>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {games.map(game => (
            <motion.div key={game.id} variants={itemVariants}>
              <GameCard game={game} />
            </motion.div>
          ))}
        </motion.div>
      </section>
    </motion.div>
  );
};

export default Home;

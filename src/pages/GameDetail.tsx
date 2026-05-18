import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { getGameById } from '../data/games';
import { useCart } from '../context/CartContext';

const GameDetail = () => {
  const { id } = useParams<{ id: string }>();
  const game = getGameById(id || '');
  const { addToCart } = useCart();

  if (!game) {
    return (
      <div className="container mx-auto px-6 py-24 text-center">
        <h1 className="text-4xl font-display text-accent mb-4">Jogo não encontrado</h1>
        <Link to="/" className="text-cyan hover:underline">Voltar para Home</Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pb-24"
    >
      {/* Hero Banner */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-void/60 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent z-10" />
        <img 
          src={game.heroImage || game.coverImage} 
          alt={game.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 z-20 container mx-auto px-6 pb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-muted hover:text-white mb-6 transition-colors">
            <ArrowLeft size={20} /> Voltar
          </Link>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="font-display text-5xl md:text-7xl font-bold mb-4 text-glow"
          >
            {game.title}
          </motion.h1>
          <p className="text-cyan text-lg font-medium">{game.developer} • {game.genre}</p>
        </div>
      </div>

      <div className="container mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="text-2xl font-display font-bold mb-4">Sobre o Jogo</h2>
            <p className="text-muted leading-relaxed text-lg">{game.description}</p>
          </section>

          <section>
            <h2 className="text-2xl font-display font-bold mb-6">Galeria</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {game.gallery.map((img, i) => (
                <div key={i} className="aspect-video rounded-xl overflow-hidden glass-panel">
                  <img src={img} alt={`Galeria ${i}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </section>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-2xl border-t-2 border-t-cyan">
              <h3 className="font-bold text-lg mb-4 text-cyan">Pontos Positivos</h3>
              <ul className="space-y-3 text-muted">
                {game.pros.map((pro, i) => <li key={i} className="flex items-start gap-2"><span className="text-cyan mt-1">•</span>{pro}</li>)}
              </ul>
            </div>
            <div className="glass-panel p-6 rounded-2xl border-t-2 border-t-accent">
              <h3 className="font-bold text-lg mb-4 text-accent">Pontos Negativos</h3>
              <ul className="space-y-3 text-muted">
                {game.cons.map((con, i) => <li key={i} className="flex items-start gap-2"><span className="text-accent mt-1">•</span>{con}</li>)}
              </ul>
            </div>
          </div>
        </div>

        {/* Sidebar / CTA */}
        <div className="lg:col-span-1">
          <div className="sticky top-32 glass-panel p-8 rounded-3xl text-center shadow-2xl shadow-cyan/5">
            <div className="text-4xl font-display font-bold text-cyan mb-8">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(game.price)}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => addToCart(game)}
              className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-[0_0_20px_rgba(255,45,85,0.4)]"
            >
              <ShoppingCart size={20} />
              Adicionar ao Carrinho
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GameDetail;

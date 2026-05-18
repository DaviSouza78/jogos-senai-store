import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const formatMoney = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-6 py-12 max-w-5xl"
    >
      <div className="flex items-center gap-4 mb-10">
        <div className="w-1 h-8 bg-accent rounded-full" />
        <h1 className="font-display text-3xl font-bold">SEU CARRINHO</h1>
      </div>

      {items.length === 0 ? (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-panel p-16 rounded-3xl text-center border-dashed border-2 border-white/10"
        >
          <ShoppingBag className="mx-auto h-16 w-16 text-muted mb-6 opacity-50" />
          <h2 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h2>
          <Link to="/" className="inline-block bg-cyan hover:bg-cyan/80 text-void font-bold px-8 py-3 rounded-xl transition-colors">
            Explorar Jogos
          </Link>
        </motion.div>
      ) : (
        <div className="glass-panel rounded-3xl p-8 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-muted text-sm uppercase tracking-wider">
                  <th className="pb-4 font-medium">Produto</th>
                  <th className="pb-4 font-medium">Preço</th>
                  <th className="pb-4 font-medium">Quantidade</th>
                  <th className="pb-4 font-medium text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, backgroundColor: 'rgba(255,45,85,0.1)' }}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="py-6 flex items-center gap-4">
                        <img src={item.coverImage} alt={item.title} className="w-16 h-16 object-cover rounded-lg" />
                        <span className="font-bold">{item.title}</span>
                      </td>
                      <td className="py-6 text-muted">{formatMoney(item.price)}</td>
                      <td className="py-6">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                          className="w-16 bg-void border border-white/10 rounded-md px-2 py-1 text-center outline-none focus:border-cyan transition-colors"
                        />
                      </td>
                      <td className="py-6 text-right">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-muted hover:text-accent p-2 rounded-full hover:bg-white/5 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div>
              <p className="text-muted text-sm uppercase tracking-wider mb-1">Total da Compra</p>
              <p className="font-display text-4xl font-bold text-cyan">{formatMoney(total)}</p>
            </div>
            <div className="flex gap-4 w-full sm:w-auto">
              <button 
                onClick={clearCart}
                className="flex-1 sm:flex-none px-6 py-3 border border-white/10 hover:bg-white/5 rounded-xl font-medium transition-colors"
              >
                Limpar
              </button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  alert('Compra finalizada!');
                  clearCart();
                }}
                className="flex-1 sm:flex-none px-8 py-3 bg-cyan hover:bg-cyan/90 text-void font-bold rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-colors"
              >
                Finalizar Compra
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Cart;

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import clsx from 'clsx';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Integrantes', path: '/integrantes' },
    { name: 'Carrinho', path: '/carrinho' },
  ];

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'bg-void/80 backdrop-blur-lg border-b border-white/5 py-4' : 'bg-transparent py-6'
      )}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl font-bold tracking-wider">
          JOGOS <span className="text-accent">SENAI</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={clsx(
                'relative font-medium text-sm transition-colors hover:text-white',
                location.pathname === link.path ? 'text-white' : 'text-muted'
              )}
            >
              {link.name === 'Carrinho' && itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-3 -right-4 bg-accent text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center"
                >
                  {itemCount}
                </motion.span>
              )}
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-panel border-b border-white/10 p-4 flex flex-col gap-4 md:hidden shadow-2xl"
          >
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  'p-3 rounded-lg flex items-center justify-between',
                  location.pathname === link.path ? 'bg-white/5 text-white' : 'text-muted'
                )}
              >
                {link.name}
                {link.name === 'Carrinho' && itemCount > 0 && (
                  <span className="bg-accent text-white text-xs font-bold px-2 py-1 rounded-full">
                    {itemCount}
                  </span>
                )}
              </Link>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;

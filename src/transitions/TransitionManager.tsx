import { AnimatePresence, motion } from 'framer-motion';
import { useTransition } from './TransitionContext';
import ResidentEvilTransition from './scenes/ResidentEvilTransition';
import SpiderManTransition from './scenes/SpiderManTransition';
import CyberpunkTransition from './scenes/CyberpunkTransition';
import ArcRaidersTransition from './scenes/ArcRaidersTransition';
import DefaultTransition from './scenes/DefaultTransition';

const TransitionManager = () => {
  const { phase, theme } = useTransition();
  const active = phase !== 'idle';

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key={`overlay-${theme}`}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
        >
          {theme === 'resident-evil' && <ResidentEvilTransition />}
          {theme === 'spider-man' && <SpiderManTransition />}
          {theme === 'cyberpunk' && <CyberpunkTransition />}
          {theme === 'arc-raiders' && <ArcRaidersTransition />}
          {theme === 'default' && <DefaultTransition />}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TransitionManager;

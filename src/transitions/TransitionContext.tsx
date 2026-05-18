import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import type { Game } from '../data/games';

export type TransitionPhase = 'idle' | 'entering' | 'revealing';
export type TransitionTheme =
  | 'resident-evil'
  | 'spider-man'
  | 'cyberpunk'
  | 'arc-raiders'
  | 'default';

const themeByGameId: Record<string, TransitionTheme> = {
  'resident-evil-requiem': 'resident-evil',
  'spider-man-2': 'spider-man',
  'cyberpunk-2077': 'cyberpunk',
  'arc-raiders': 'arc-raiders',
};

interface TransitionState {
  phase: TransitionPhase;
  theme: TransitionTheme;
  targetGame: Game | null;
  sourceRect: DOMRect | null;
  trigger: (game: Game, rect?: DOMRect) => void;
  markCovered: () => void;
  markRevealed: () => void;
}

const TransitionCtx = createContext<TransitionState | null>(null);

export const useTransition = () => {
  const v = useContext(TransitionCtx);
  if (!v) throw new Error('useTransition must be used inside <TransitionProvider>');
  return v;
};

export const TransitionProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<TransitionPhase>('idle');
  const [targetGame, setTargetGame] = useState<Game | null>(null);
  const [theme, setTheme] = useState<TransitionTheme>('default');
  const [sourceRect, setSourceRect] = useState<DOMRect | null>(null);
  const locked = useRef(false);
  const targetRef = useRef<Game | null>(null);

  const trigger = useCallback((game: Game, rect?: DOMRect) => {
    if (locked.current) return;
    locked.current = true;
    targetRef.current = game;
    setTargetGame(game);
    setTheme(themeByGameId[game.id] ?? 'default');
    setSourceRect(rect ?? null);
    setPhase('entering');
  }, []);

  const markCovered = useCallback(() => {
    const target = targetRef.current;
    if (target) navigate(`/jogo/${target.id}`);
    setPhase('revealing');
  }, [navigate]);

  const markRevealed = useCallback(() => {
    setPhase('idle');
    setTargetGame(null);
    setSourceRect(null);
    setTheme('default');
    targetRef.current = null;
    locked.current = false;
  }, []);

  const value = useMemo(
    () => ({
      phase,
      theme,
      targetGame,
      sourceRect,
      trigger,
      markCovered,
      markRevealed,
    }),
    [phase, theme, targetGame, sourceRect, trigger, markCovered, markRevealed]
  );

  return <TransitionCtx.Provider value={value}>{children}</TransitionCtx.Provider>;
};

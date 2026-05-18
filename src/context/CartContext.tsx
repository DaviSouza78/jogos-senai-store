import React, { createContext, useContext, useState, useEffect } from 'react';
import { Game } from '../data/games';

export interface CartItem extends Game {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (game: Game) => void;
  removeFromCart: (gameId: string) => void;
  updateQuantity: (gameId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('@jogos-senai:cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('@jogos-senai:cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (game: Game) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === game.id);
      if (existing) {
        return prev.map((i) =>
          i.id === game.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...game, quantity: 1 }];
    });
  };

  const removeFromCart = (gameId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== gameId));
  };

  const updateQuantity = (gameId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) => (i.id === gameId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { Product } from '../data/products';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string | number, delta: number) => void;
  cartTotal: number;
  cartCount: number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const local = localStorage.getItem('kk_cart');
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const isFirstLoad = useRef(true);

  // 1. Sync cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('kk_cart', JSON.stringify(cart));
  }, [cart]);

  // 2. Fetch and merge Firestore cart on login
  useEffect(() => {
    if (authLoading) return;

    const syncOnLogin = async () => {
      if (!user) {
        isFirstLoad.current = false;
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          const firestoreCart = data.cart || [];

          if (firestoreCart.length > 0) {
            setCart(prevLocal => {
              const merged = [...prevLocal];
              firestoreCart.forEach((fItem: CartItem) => {
                const existingIndex = merged.findIndex(lItem => lItem.product.id === fItem.product.id);
                if (existingIndex > -1) {
                  // Keep the larger quantity or combine them
                  merged[existingIndex].quantity = Math.max(merged[existingIndex].quantity, fItem.quantity);
                } else {
                  merged.push(fItem);
                }
              });
              return merged;
            });
          }
        }
      } catch (err) {
        console.error("Error fetching saved cart on login:", err);
      } finally {
        isFirstLoad.current = false;
      }
    };

    syncOnLogin();
  }, [user, authLoading]);

  // 3. Write updates to Firestore on cart state changes (after initial merge)
  useEffect(() => {
    if (!user || isFirstLoad.current) return;

    const syncToFirestore = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { cart }, { merge: true });
      } catch (err) {
        console.error("Error syncing cart to database:", err);
      }
    };

    // Debounce database writes to avoid unnecessary Firebase calls during fast quantity clicks
    const timeout = setTimeout(syncToFirestore, 600);
    return () => clearTimeout(timeout);
  }, [cart, user]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => String(item.product.id) === String(product.id));
      if (existing) {
        return prev.map(item => 
          String(item.product.id) === String(product.id)
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string | number, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (String(item.product.id) === String(productId)) {
          const newQ = item.quantity + delta;
          return { ...item, quantity: newQ };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const clearCart = () => setCart([]);
  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart, isCartOpen, setIsCartOpen, addToCart, updateQuantity, cartTotal, cartCount, clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { Product } from '../data/products';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface CartItem {
  cartItemId?: string;
  product: Product;
  quantity: number;
  selectedWeight?: number;
  selectedJar?: boolean;
  unitPrice?: number;
}

interface CartContextType {
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  addToCart: (product: Product, quantity?: number, selectedWeight?: number, selectedJar?: boolean) => void;
  updateQuantity: (cartItemIdOrProductId: string | number, delta: number) => void;
  cartTotal: number;
  cartCount: number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [cart, setCart] = useState<CartItem[]>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'success') {
      localStorage.removeItem('kk_cart');
      return [];
    }
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

    const params = new URLSearchParams(window.location.search);
    if (params.get('status') === 'success') {
      isFirstLoad.current = false;
      return;
    }

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
                const fKey = fItem.cartItemId || String(fItem.product.id);
                const existingIndex = merged.findIndex(lItem => (lItem.cartItemId || String(lItem.product.id)) === fKey);
                if (existingIndex > -1) {
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

    const timeout = setTimeout(syncToFirestore, 600);
    return () => clearTimeout(timeout);
  }, [cart, user]);

  const addToCart = (
    product: Product, 
    quantity: number = 1,
    selectedWeight?: number,
    selectedJar?: boolean
  ) => {
    const weight = selectedWeight || product.weightGrams || 500;
    const isJar = !!selectedJar;
    const weightMultiplier = weight === 1000 ? 2 : 1;
    const computedUnitPrice = (product.price * weightMultiplier) + (isJar ? 100 : 0);
    const cartItemId = `${product.id}-${weight}-${isJar ? 'jar' : 'pouch'}`;

    setCart(prev => {
      const existing = prev.find(item => (item.cartItemId || String(item.product.id)) === cartItemId);
      if (existing) {
        return prev.map(item => 
          (item.cartItemId || String(item.product.id)) === cartItemId
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...prev, { 
        cartItemId, 
        product, 
        quantity, 
        selectedWeight: weight, 
        selectedJar: isJar, 
        unitPrice: computedUnitPrice 
      }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (cartItemIdOrProductId: string | number, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        const key = item.cartItemId || String(item.product.id);
        if (key === String(cartItemIdOrProductId)) {
          const newQ = item.quantity + delta;
          return { ...item, quantity: newQ };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('kk_cart');
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      setDoc(userRef, { cart: [] }, { merge: true }).catch(err => {
        console.error("Error clearing cart in Firestore:", err);
      });
    }
  };

  const cartTotal = cart.reduce((sum, item) => {
    const itemWeight = item.selectedWeight || item.product.weightGrams || 500;
    const price = item.unitPrice ?? ((item.product.price * (itemWeight === 1000 ? 2 : 1)) + (item.selectedJar ? 100 : 0));
    return sum + (price * item.quantity);
  }, 0);

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

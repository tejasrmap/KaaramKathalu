import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Leaf, Flame, Loader2 } from 'lucide-react';
import { ProductType } from '../data/products';
import { db } from '../firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import SEO from '../components/SEO';
import { useWishlist } from '../context/WishlistContext';
import { Heart } from 'lucide-react';

export default function Shop({ category }: { category?: 'murukku' | 'namkeen' | 'snacks' }) {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const filteredProducts = category 
    ? products.filter(p => p.type === category)
    : products;

  const pageTitle = category === 'murukku'
    ? 'Murukku'
    : category === 'namkeen'
      ? 'Namkeen & Sev'
      : category === 'snacks'
        ? 'Snacks'
        : 'Shop All';

  return (
    <div className="pt-24 md:pt-32 pb-24 px-4 sm:px-6 md:px-12 max-w-[100vw] overflow-x-hidden md:max-w-7xl mx-auto min-h-screen">
      <SEO title={pageTitle} description={`Explore our collection of authentic, hand-made ${pageTitle.toLowerCase()}.`} />
      
      <div className="text-center mb-12 relative w-full mx-auto">
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-warm-dark uppercase tracking-wider">
          {pageTitle}
        </h1>
        <div className="w-12 h-0.5 bg-warm-accent mx-auto mt-4 mb-6"></div>
      </div>

      <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
        <AnimatePresence>
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-12 h-12 text-warm-accent animate-spin" />
              <p className="font-serif italic text-warm-dark/40">Opening the pantry door...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
             <div className="col-span-full py-20 text-center bg-white border border-warm-dark/5 rounded-[24px] shadow-sm max-w-xl mx-auto w-full">
              <p className="font-serif font-bold text-xl italic text-warm-dark/30">No snacks found in this section.</p>
            </div>
          ) : filteredProducts.map(product => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              key={product.docId}
              className="group"
            >
              <Link to={`/product/${product.id}`} className="block h-full">
                <div className="bg-transparent flex flex-col h-full transition-transform duration-300 group-hover:-translate-y-1">
                  
                  <div className="relative aspect-square overflow-hidden bg-warm-light border border-warm-dark/5 rounded-xl mb-4">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${product.stock <= 0 ? 'opacity-50 grayscale' : ''}`}
                      referrerPolicy="no-referrer"
                    />
                    {product.stock <= 0 && (
                      <div className="absolute inset-0 bg-warm-dark/20 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                        <span className="font-serif font-bold text-white text-xl border-2 border-white px-3 py-1.5">OUT OF STOCK</span>
                      </div>
                    )}
                    
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
                      <span className="bg-warm-dark text-white text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                        {product.type}
                      </span>
                      {product.stock <= 0 && (
                        <span className="bg-red-600 text-white text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded animate-pulse">
                          Sold Out
                        </span>
                      )}
                    </div>

                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product);
                      }}
                      className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-warm-dark flex items-center justify-center shadow-sm transition-colors group/heart"
                      aria-label="Wishlist"
                    >
                      <Heart className={`w-4 h-4 transition-colors ${isInWishlist(product.id) ? 'fill-warm-accent text-warm-accent' : 'text-warm-dark group-hover/heart:text-warm-accent'}`} />
                    </button>

                    <div className="absolute bottom-3 right-3 z-20 w-8 h-8 rounded-full bg-warm-accent text-white flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110">
                      <span className="text-lg font-bold font-sans">+</span>
                    </div>
                  </div>
                  
                  <div className="pt-2 flex flex-col text-left">
                    <span className="text-[9px] uppercase font-bold tracking-[0.15em] text-warm-accent mb-1">{product.type}</span>
                    <h3 className="font-heading font-bold text-sm sm:text-base text-warm-dark group-hover:text-warm-accent transition-colors leading-tight mb-1">{product.name}</h3>
                    <span className="font-serif text-sm text-warm-dark/60">From ₹{product.price}.00</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

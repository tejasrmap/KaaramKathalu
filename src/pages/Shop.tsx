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

export default function Shop() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | ProductType>('all');
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

  const filteredProducts = activeFilter === 'all' 
    ? products 
    : products.filter(p => p.type === activeFilter);

  return (
    <div className="pt-24 md:pt-32 pb-24 px-4 sm:px-6 md:px-12 max-w-[100vw] overflow-x-hidden md:max-w-7xl mx-auto min-h-screen">
      <SEO title="Shop Our Pantry" description="Browse our collection of hand-crafted pickles, podis, and tasting bundles." />
      <div className="text-center mb-16 relative w-full max-w-[95vw] mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-warm-dark mb-6 inline-block bg-white px-6 md:px-8 py-3 md:py-4 border-2 border-warm-dark shadow-[4px_4px_0px_#3A2A22] transform rotate-1">
          Our <span className="text-warm-accent italic">Pantry</span>
        </h1>
        <p className="text-warm-dark/70 max-w-2xl mx-auto font-serif text-lg md:text-xl italic border-t-2 border-dashed border-warm-dark/20 pt-6 mt-4 px-4">
          Explore our collection of authentic, hand-made pickles, podis, and curated tasting bundles.
        </p>
      </div>

      <div className="sticky top-20 z-30 -mx-4 px-4 bg-warm-bg/80 backdrop-blur-md border-b-2 border-warm-dark/5 mb-8 md:mb-16 py-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 w-max mx-auto md:mx-0">
          {(['all', 'pickle', 'podi', 'bundle'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border-2 ${
                activeFilter === filter 
                  ? 'bg-warm-dark text-white border-warm-dark shadow-[4px_4px_0px_rgba(58,42,34,0.3)]' 
                  : 'bg-white text-warm-dark border-warm-dark/20 hover:border-warm-dark'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
        <AnimatePresence>
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-12 h-12 text-warm-accent animate-spin" />
              <p className="font-serif italic text-warm-dark/40">Opening the pantry door...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
             <div className="col-span-full py-20 text-center bg-white border-2 border-warm-dark shadow-[4px_4px_0px_#3A2A22]">
              <p className="font-serif font-bold text-2xl italic text-warm-dark/30">No jars found in this section.</p>
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
                    <h3 className="font-heading font-bold text-base text-warm-dark group-hover:text-warm-accent transition-colors leading-tight mb-1">{product.name}</h3>
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

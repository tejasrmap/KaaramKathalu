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
                <div className="bg-white border-2 border-warm-dark p-3 flex flex-col h-full relative z-10 transition-transform duration-300 group-hover:-translate-y-2 group-hover:-translate-x-1 shadow-[4px_4px_0px_#3A2A22] md:shadow-[8px_8px_0px_#3A2A22]">
                  
                  <div className="relative aspect-square border-2 border-dashed border-warm-dark/30 mb-4 bg-warm-bg overflow-hidden p-2">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className={`w-full h-full object-cover grayscale-[10%] contrast-110 sepia-[10%] transition-all duration-700 group-hover:grayscale-0 group-hover:sepia-0 border border-warm-dark/10 ${product.stock <= 0 ? 'opacity-50 grayscale' : ''}`}
                      referrerPolicy="no-referrer"
                    />
                    {product.stock <= 0 && (
                      <div className="absolute inset-0 bg-warm-dark/20 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                        <span className="font-serif font-bold text-white text-3xl transform -rotate-12 drop-shadow-lg border-4 border-white p-2">OUT OF STOCK</span>
                      </div>
                    )}
                    
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <div className="bg-white border-2 border-warm-dark px-3 py-1 text-[10px] uppercase font-bold tracking-widest text-warm-dark shadow-[2px_2px_0px_#3A2A22]">
                        {product.type}
                      </div>
                      {product.stock <= 0 && (
                        <div className="bg-red-600 text-white border-2 border-warm-dark px-3 py-1 text-[10px] uppercase font-bold tracking-widest shadow-[2px_2px_0px_#3A2A22] animate-pulse">
                          Sold Out
                        </div>
                      )}
                    </div>

                    <div className="absolute top-4 right-4 flex gap-1">
                      {[...Array(product.spiciness)].map((_, i) => (
                        <Flame key={i} className="w-5 h-5 text-warm-accent fill-warm-accent drop-shadow-md" />
                      ))}
                    </div>

                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product);
                      }}
                      className="absolute bottom-4 right-4 z-20 p-2 bg-white border-2 border-warm-dark shadow-[4px_4px_0px_#3A2A22] hover:translate-y-px hover:shadow-none transition-all group/heart"
                    >
                      <Heart className={`w-5 h-5 transition-colors ${isInWishlist(product.id) ? 'fill-warm-accent text-warm-accent' : 'text-warm-dark group-hover/heart:text-warm-accent'}`} />
                    </button>
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col items-center text-center border-2 border-warm-dark bg-warm-light">
                    <h3 className="font-serif text-2xl font-bold text-warm-dark mb-2">{product.name}</h3>
                    <span className="font-bold text-lg tracking-widest text-warm-accent mb-4 block border-b-2 border-warm-dark/20 pb-4 w-full">₹{product.price}</span>
                    <p className="text-warm-dark/70 text-sm font-serif italic">{product.description}</p>
                    
                    <div className="w-full mt-6 pt-4 border-t-2 border-dashed border-warm-dark/20 flex justify-between items-center px-2">
                       <span className="text-[10px] uppercase font-bold tracking-widest text-warm-dark">View Details</span>
                       <span className="text-[10px] uppercase font-bold tracking-widest text-warm-accent underline underline-offset-4">Add →</span>
                    </div>
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

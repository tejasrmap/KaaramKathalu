import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useSearchParams } from 'react-router-dom';
import { Leaf, Flame, Loader2 } from 'lucide-react';
import { ProductType } from '../data/products';
import { db } from '../firebase';
import { collection, onSnapshot, query, doc, getDoc } from 'firebase/firestore';
import SEO from '../components/SEO';
import { useWishlist } from '../context/WishlistContext';
import { Heart } from 'lucide-react';
import { getProductStartingPrice, getProductStock } from '../utils/price';

export default function Shop({ category }: { category?: 'murukku' | 'namkeen' | 'snacks' }) {
  const [products, setProducts] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('kk_products_cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(() => {
    try {
      const cached = localStorage.getItem('kk_products_cache');
      return !cached || JSON.parse(cached).length === 0;
    } catch {
      return true;
    }
  });
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
      localStorage.setItem('kk_products_cache', JSON.stringify(productsData));
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const [activeCategories, setActiveCategories] = useState<any>(() => {
    try {
      const cached = localStorage.getItem('kk_active_categories_cache');
      return cached ? JSON.parse(cached) : {
        pickle: true,
        podi: true,
        snacks: true,
        fryums: true,
        bundle: true
      };
    } catch {
      return {
        pickle: true,
        podi: true,
        snacks: true,
        fryums: true,
        bundle: true
      };
    }
  });

  useEffect(() => {
    const fetchActiveCategories = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'general'));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.activeCategories) {
            setActiveCategories(data.activeCategories);
            localStorage.setItem('kk_active_categories_cache', JSON.stringify(data.activeCategories));
          }
        }
      } catch (err) {
        console.error("Error loading category settings:", err);
      }
    };
    fetchActiveCategories();
  }, []);

  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get('category');
  const selectedCategory = urlCategory || 'all';

  const setSelectedCategory = (category: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (category === 'all') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', category);
    }
    setSearchParams(nextParams);
  };

  const categories = [
    { id: 'all', label: 'All Products' },
    { id: 'pickle', label: 'Pickles' },
    { id: 'podi', label: 'Podis' }
  ].filter(cat => cat.id === 'all' || activeCategories[cat.id] !== false);

  const getCategoryLabel = (type: string) => {
    switch (type) {
      case 'pickle': return 'Pickles';
      case 'podi': return 'Podis';
      case 'snacks': return 'Snacks';
      case 'fryums': return 'Fryums';
      case 'bundle': return 'Bundles';
      default: return type;
    }
  };

  const getCategoryPriority = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'podi': return 1;
      case 'pickle': return 2;
      case 'snacks': return 3;
      case 'fryums': return 4;
      case 'bundle': return 5;
      default: return 6;
    }
  };

  const filteredProducts = (selectedCategory === 'all'
    ? products.filter(p => activeCategories[p.type] !== false)
    : products.filter(p => p.type === selectedCategory)
  ).sort((a, b) => {
    const rankA = getCategoryPriority(a.type);
    const rankB = getCategoryPriority(b.type);
    return rankA - rankB;
  });

  const pageTitle = selectedCategory === 'all'
    ? 'Shop All'
    : getCategoryLabel(selectedCategory);

  return (
    <div className="pt-8 md:pt-12 pb-24 px-4 sm:px-6 md:px-12 max-w-[100vw] overflow-x-hidden md:max-w-7xl mx-auto min-h-screen">
      <SEO title={pageTitle} description={`Explore our collection of authentic, hand-made ${pageTitle.toLowerCase()}.`} />
      
      <div className="text-center mb-10 relative w-full mx-auto">
        <h1 className="text-3xl md:text-5xl font-heading font-bold text-warm-dark uppercase tracking-wider">
          {pageTitle}
        </h1>
      </div>



      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-12 h-12 text-warm-accent animate-spin" />
              <p className="font-serif italic text-warm-dark/40">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
             <div className="col-span-full py-20 text-center bg-white border border-warm-dark/5 rounded-[24px] shadow-sm max-w-xl mx-auto w-full">
              <p className="font-serif font-bold text-xl italic text-warm-dark/30">No items found in this section.</p>
            </div>
          ) : filteredProducts.map(product => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              key={product.docId || product.id}
              className="group"
            >
              <Link to={`/product/${product.id}`} className="block h-full">
                <div className="bg-transparent flex flex-col h-full transition-transform duration-300 group-hover:-translate-y-1">
                  
                  <div className="relative aspect-square overflow-hidden bg-warm-light border border-warm-dark/5 rounded-xl mb-4">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      loading="lazy"
                      decoding="async"
                       className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${getProductStock(product) <= 0 ? 'opacity-50 grayscale' : ''}`}
                      referrerPolicy="no-referrer"
                    />
                    {getProductStock(product) <= 0 && (
                      <div className="absolute inset-0 bg-warm-dark/20 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                        <span className="font-serif font-bold text-white text-xl border-2 border-white px-3 py-1.5">OUT OF STOCK</span>
                      </div>
                    )}
                    
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20">
                      <span className="bg-warm-dark text-white text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                        {getCategoryLabel(product.type)}
                      </span>
                      {getProductStock(product) <= 0 && (
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
                  </div>
                  
                  <div className="pt-2 flex flex-col text-left">
                    <span className="text-[9px] uppercase font-bold tracking-[0.15em] text-warm-accent mb-1">{product.type}</span>
                    <h3 className="font-heading font-bold text-sm sm:text-base text-warm-dark group-hover:text-warm-accent transition-colors leading-tight mb-1">{product.name}</h3>
                    <div className="flex justify-between items-center mt-1">
                      <span className="font-serif text-sm text-warm-dark/60">From ₹{getProductStartingPrice(product)}.00</span>
                      <span className="text-[10px] bg-warm-light/80 border border-warm-dark/5 px-2 py-0.5 rounded text-warm-dark/65 font-medium font-sans">
                        {product.weightGrams || 500}g
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

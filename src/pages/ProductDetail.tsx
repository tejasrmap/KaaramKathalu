import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Flame, Plus, Minus, Info, Loader2 } from 'lucide-react';
import { Product } from '../data/products';
import { useCart } from '../context/CartContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import SEO from '../components/SEO';

export default function ProductDetail() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart, setIsCartOpen } = useCart();
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const q = query(collection(db, 'products'), where('id', '==', Number(id)), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setProduct(querySnapshot.docs[0].data() as Product);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-12 h-12 text-warm-accent animate-spin mb-4" />
        <p className="font-serif italic text-warm-dark/40">Fetching the recipe...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-serif text-warm-dark mb-4 p-4 border-2 border-warm-dark bg-white shadow-[6px_6px_0px_#3A2A22] transform -rotate-2">Recipe Not Found</h2>
        <p className="text-warm-dark/60 mb-8 font-serif italic text-lg">The jar you are looking for seems to be missing from our pantry.</p>
        <Link to="/shop" className="px-8 py-3 bg-[#F4EBE1] border-2 border-warm-dark text-warm-dark font-bold tracking-widest uppercase text-xs shadow-[4px_4px_0px_#3A2A22] hover:translate-y-1 hover:shadow-[2px_2px_0px_#3A2A22] transition-all">
          Return to Shop
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsCartOpen(true);
  };

  return (
    <div className="pt-24 md:pt-32 pb-24 px-4 sm:px-6 md:px-12 max-w-[100vw] overflow-x-hidden md:max-w-7xl mx-auto">
      <SEO title={product.name} description={product.description} image={product.image} />
      <Link to="/shop" className="inline-flex items-center gap-2 text-warm-dark font-bold uppercase tracking-widest text-[10px] md:text-xs mb-8 md:mb-10 hover:text-warm-accent transition-colors bg-white px-3 py-2 md:px-4 md:py-2 border-2 border-warm-dark md:shadow-[2px_2px_0px_#3A2A22] md:hover:translate-y-px md:hover:shadow-none ml-2 md:ml-0 shadow-sm relative z-10 w-fit">
        <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" /> Back to Pantry
      </Link>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-20 w-full max-w-[95vw] mx-auto relative z-10">
        {/* Product Image */}
        <div className="w-full lg:w-1/2">
          <div className="relative aspect-square md:aspect-[4/5] bg-white border-[12px] border-white shadow-[12px_12px_0px_#3A2A22] transform -rotate-1 group">
            <div className="absolute inset-0 border-2 border-dashed border-warm-dark/20 z-10 pointer-events-none m-4"></div>
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover grayscale-[10%] contrast-110 sepia-[10%] group-hover:grayscale-0 transition-all duration-700"
              referrerPolicy="no-referrer"
            />
            {/* Stamp Badge */}
            <div className="absolute top-8 right-8 bg-[#F4EBE1] w-24 h-24 rounded-full flex flex-col items-center justify-center border-2 border-warm-dark shadow-[4px_4px_0px_#3A2A22] transform rotate-12 z-20">
              <span className="font-serif font-bold text-2xl text-warm-dark mb-[-4px]">₹{product.price}</span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-warm-dark/60">Per Jar</span>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center">
          <div className="bg-[#F4EBE1] border-2 border-warm-dark p-8 md:p-12 shadow-[8px_8px_0px_#3A2A22] relative">
            
            {/* "Tape" top */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-white/40 border border-warm-dark/20 shadow-sm transform rotate-2"></div>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-white border-2 border-warm-dark px-3 py-1 text-[10px] uppercase font-bold tracking-widest text-warm-dark shadow-[2px_2px_0px_#3A2A22]">
                {product.type}
              </span>
              <div className="flex gap-1" title={`Spiciness Level: ${product.spiciness}/3`}>
                {[...Array(3)].map((_, i) => (
                  <Flame 
                    key={i} 
                    className={`w-5 h-5 ${i < product.spiciness ? 'text-warm-accent fill-warm-accent' : 'text-warm-dark/20 fill-warm-dark/10'}`} 
                  />
                ))}
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-serif text-warm-dark leading-[1.1] mb-6">
              {product.name}
            </h1>
            
            <p className="text-xl text-warm-dark/80 font-serif mb-8 italic border-b-2 border-dashed border-warm-dark/20 pb-8">
              {product.description}
            </p>

            {/* Desktop Purchase Section */}
            <div className="hidden sm:flex items-stretch sm:items-end gap-4 sm:gap-6 mb-10 w-full max-w-full">
              <div className="flex-shrink-0 w-full sm:w-auto">
                <label className="block text-[10px] uppercase font-bold tracking-widest text-warm-dark/60 mb-2">Quantity</label>
                <div className="flex items-center bg-white border-2 border-warm-dark shadow-[4px_4px_0px_#3A2A22] w-full sm:w-auto">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex-1 sm:w-12 h-12 flex items-center justify-center hover:bg-warm-dark hover:text-white transition-colors border-r-2 border-warm-dark"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-16 sm:w-12 md:w-16 text-center font-bold tracking-widest font-sans">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex-1 sm:w-12 h-12 flex items-center justify-center hover:bg-warm-dark hover:text-white transition-colors border-l-2 border-warm-dark"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 w-full bg-warm-accent text-white h-12 border-2 border-warm-dark font-bold tracking-widest uppercase text-xs shadow-[4px_4px_0px_#3A2A22] hover:translate-y-1 hover:shadow-none transition-all whitespace-nowrap px-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-warm-dark/40"
              >
                {product.stock <= 0 ? 'Out of Stock' : 'Add to Basket'}
              </button>
            </div>

            {/* Mobile Sticky Bottom Bar */}
            <div className="sm:hidden fixed bottom-16 left-0 right-0 z-40 bg-[#F4EBE1]/90 backdrop-blur-md border-t-2 border-warm-dark p-4 flex gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
               <div className="flex items-center bg-white border-2 border-warm-dark w-32 h-12">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex-1 h-full flex items-center justify-center border-r-2 border-warm-dark"><Minus className="w-4 h-4" /></button>
                  <span className="w-10 text-center font-bold">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="flex-1 h-full flex items-center justify-center border-l-2 border-warm-dark"><Plus className="w-4 h-4" /></button>
               </div>
               <button 
                onClick={handleAddToCart}
                className="flex-1 bg-warm-accent text-white h-12 border-2 border-warm-dark font-bold tracking-widest uppercase text-[10px] shadow-[4px_4px_0px_#3A2A22]"
              >
                Add to Basket
              </button>
            </div>

            <div className="pt-8 border-t-2 border-warm-dark">
              <h3 className="text-sm font-bold tracking-widest uppercase text-warm-dark mb-4 flex items-center gap-2">
                <Info className="w-4 h-4" /> The Story
              </h3>
              <p className="text-warm-dark/70 font-serif leading-relaxed text-lg italic">
                {product.longDescription || product.description}
              </p>
            </div>

            {product.ingredients && (
              <div className="pt-8 mt-8 border-t-2 border-dashed border-warm-dark/20">
                <h3 className="text-sm font-bold tracking-widest uppercase text-warm-dark mb-4">Pure Ingredients</h3>
                <div className="flex flex-wrap gap-2">
                  {product.ingredients.map((ingredient, idx) => (
                    <span 
                      key={idx} 
                      className="bg-white border text-warm-dark px-3 py-1 font-serif italic text-sm shadow-sm"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

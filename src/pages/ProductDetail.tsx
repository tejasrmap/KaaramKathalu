import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Flame, Plus, Minus, Info, Loader2, Check, Heart } from 'lucide-react';
import { Product } from '../data/products';
import { RECIPES } from '../data/recipes';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import SEO from '../components/SEO';

export default function ProductDetail() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState<number>(500);
  const [isJar, setIsJar] = useState<boolean>(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart, setIsCartOpen } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const q = query(collection(db, 'products'), where('id', '==', Number(id)), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const prod = querySnapshot.docs[0].data() as Product;
          setProduct(prod);
          setSelectedWeight(prod.weightGrams || 500);
          setActiveImageIndex(0);
        }
      } catch (error) {
        console.error("Error fetching product from firestore:", error);
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
        <p className="font-serif italic text-warm-dark/40">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-serif text-warm-dark mb-4">Product Not Found</h2>
        <p className="text-warm-dark/60 mb-8 font-serif italic text-lg">The product you are looking for seems to be unavailable right now.</p>
        <Link to="/shop" className="px-8 py-3 bg-warm-accent hover:bg-warm-accent/90 text-white rounded-full font-bold tracking-widest uppercase text-xs transition-colors">
          Return to Shop
        </Link>
      </div>
    );
  }

  const imagesList = product.images && product.images.length > 0 ? product.images : [product.image];
  const activeImage = imagesList[activeImageIndex] || product.image;

  const weightMultiplier = selectedWeight === 250 ? 0.5 : selectedWeight === 1000 ? 2 : 1;
  const computedUnitPrice = (product.price * weightMultiplier) + (isJar ? 100 : 0);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedWeight, isJar);
    setIsCartOpen(true);
  };

  // Find matching recipes based on product name
  const matchingRecipes = RECIPES.filter(recipe => 
    recipe.pairing.toLowerCase().includes(product.name.toLowerCase()) ||
    product.name.toLowerCase().includes(recipe.pairing.split(' (')[0].toLowerCase())
  );

  return (
    <div className="pt-8 md:pt-12 pb-24 px-4 sm:px-6 md:px-12 max-w-[100vw] overflow-x-hidden md:max-w-7xl mx-auto">
      <SEO title={product.name} description={product.description} image={activeImage} />
      
      <div className="mb-8">
        <Link to="/shop" className="inline-flex items-center gap-2 text-warm-dark font-bold uppercase tracking-widest text-xs hover:text-warm-accent transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 w-full max-w-[95vw] mx-auto relative z-10">
        {/* Product Image & Gallery */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="relative aspect-square bg-white overflow-hidden rounded-[24px] border border-warm-dark/5 shadow-sm">
            <img 
              src={activeImage} 
              alt={product.name} 
              className="w-full h-full object-cover transition-all duration-300"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Gallery Thumbnails */}
          {imagesList.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
              {imagesList.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer shadow-xs ${
                    activeImageIndex === idx
                      ? 'border-warm-accent ring-2 ring-warm-accent/30 scale-105'
                      : 'border-warm-dark/10 hover:border-warm-dark/30 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={imgUrl} 
                    alt={`${product.name} thumbnail ${idx + 1}`} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="w-full lg:w-1/2 flex flex-col justify-start">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-warm-light border border-warm-dark/10 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest text-warm-dark">
              {product.type}
            </span>
            <div className="flex gap-1" title={`Spiciness Level: ${product.spiciness}/3`}>
              {[...Array(3)].map((_, i) => (
                <Flame 
                  key={i} 
                  className={`w-4 h-4 ${i < product.spiciness ? 'text-warm-accent fill-warm-accent' : 'text-warm-dark/25 fill-warm-dark/10'}`} 
                />
              ))}
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-serif text-warm-dark leading-tight mb-2">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="text-3xl font-serif font-bold text-warm-accent">
              ₹{computedUnitPrice}
            </div>
            <span className="bg-warm-light/60 border border-warm-dark/5 px-3 py-1 rounded-lg text-xs font-semibold text-warm-dark/70 font-sans">
              Weight: {selectedWeight}g
            </span>
            {isJar && (
              <span className="bg-warm-accent/10 border border-warm-accent/30 text-warm-accent px-2.5 py-1 rounded-lg text-xs font-bold">
                🫙 Glass Jar (+₹100)
              </span>
            )}
          </div>
          
          <p className="text-base text-warm-dark/70 font-serif mb-8 italic">
            {product.description}
          </p>

          {/* Weight Options Selector */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-widest text-warm-dark/50 mb-2.5">Select Weight</label>
            <div className="flex gap-3">
              {(product.availableWeights || [250, 500, 1000]).map(weight => (
                <button
                  key={weight}
                  type="button"
                  onClick={() => setSelectedWeight(weight)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border shadow-sm cursor-pointer ${
                    selectedWeight === weight
                      ? 'bg-warm-dark text-white border-warm-dark font-extrabold'
                      : 'bg-white text-warm-dark/70 border-warm-dark/15 hover:bg-warm-light'
                  }`}
                >
                  {weight === 1000 ? '1000g (1kg)' : `${weight}g`}
                </button>
              ))}
            </div>
          </div>

          {/* Glass Jar Packaging Option (+₹100) */}
          {product.hasJarOption !== false && (
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-widest text-warm-dark/50 mb-2.5">Packaging Option</label>
              <div 
                onClick={() => setIsJar(!isJar)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-sm ${
                  isJar 
                    ? 'bg-warm-accent/10 border-warm-accent ring-1 ring-warm-accent' 
                    : 'bg-white border-warm-dark/15 hover:border-warm-dark/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                    isJar ? 'bg-warm-accent border-warm-accent text-white' : 'bg-white border-warm-dark/20'
                  }`}>
                    {isJar && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-warm-dark block">
                      🫙 Add Premium Glass Jar Packaging (+₹100)
                    </span>
                    <span className="text-[11px] text-warm-dark/60 font-serif italic">
                      Preserves freshness in an authentic sealed glass jar
                    </span>
                  </div>
                </div>
                <span className="text-xs font-heading font-black text-warm-accent bg-warm-accent/10 px-2.5 py-1 rounded-full border border-warm-accent/20">
                  +₹100
                </span>
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-widest text-warm-dark/50 mb-2.5">Quantity</label>
            <div className="flex items-center bg-white border border-warm-dark/15 rounded-xl w-32 h-12 shadow-sm">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex-1 h-full flex items-center justify-center text-warm-dark/50 hover:text-warm-dark transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center font-bold text-warm-dark text-sm">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="flex-1 h-full flex items-center justify-center text-warm-dark/50 hover:text-warm-dark transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-3.5">
            <button 
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="flex-1 bg-white hover:bg-warm-light/40 text-warm-dark h-12 border border-warm-dark rounded-xl font-heading tracking-widest uppercase text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {product.stock <= 0 ? 'Out of Stock' : 'Add to cart'}
            </button>

            {product && (
              <button 
                type="button"
                onClick={() => {
                  isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product);
                }}
                className={`h-12 px-4 border rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 ${
                  isInWishlist(product.id)
                    ? 'bg-warm-accent/10 border-warm-accent text-warm-accent font-bold'
                    : 'bg-white border-warm-dark/20 text-warm-dark hover:border-warm-dark'
                }`}
                title={isInWishlist(product.id) ? "Remove from Wishlist" : "Save to Wishlist"}
              >
                <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-warm-accent text-warm-accent' : ''}`} />
                <span className="text-xs font-heading uppercase font-bold tracking-wider hidden sm:inline">
                  {isInWishlist(product.id) ? 'Saved' : 'Wishlist'}
                </span>
              </button>
            )}
          </div>
          
          <button 
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="w-full bg-warm-dark hover:bg-warm-dark/95 text-white h-12 rounded-xl font-heading tracking-widest uppercase text-xs font-bold transition-all duration-200 cursor-pointer mb-8 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {product.stock <= 0 ? 'Sold Out' : 'Buy it now'}
          </button>

          {/* Value Badges */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-warm-light/40 border border-warm-dark/5 p-4 rounded-xl flex items-center gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-warm-dark/5 flex items-center justify-center text-warm-dark">
                <svg className="w-4 h-4 text-warm-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <span className="text-[11px] font-semibold text-warm-dark/80 tracking-wide">Free Shipping</span>
            </div>
            <div className="bg-warm-light/40 border border-warm-dark/5 p-4 rounded-xl flex items-center gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-warm-dark/5 flex items-center justify-center text-warm-dark">
                <svg className="w-4 h-4 text-warm-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-[11px] font-semibold text-warm-dark/80 tracking-wide">3% Off On Prepaid Orders</span>
            </div>
          </div>

          {/* Mobile Sticky Bottom Bar */}
          <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-warm-dark/15 p-3 flex gap-2.5 shadow-[0_-6px_16px_rgba(0,0,0,0.12)]">
             <div className="flex items-center bg-warm-light/60 border border-warm-dark/15 rounded-xl w-28 h-11">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex-1 h-full flex items-center justify-center text-warm-dark/60 cursor-pointer active:scale-90"><Minus className="w-3.5 h-3.5" /></button>
                <span className="w-8 text-center font-bold text-warm-dark text-xs">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="flex-1 h-full flex items-center justify-center text-warm-dark/60 cursor-pointer active:scale-90"><Plus className="w-3.5 h-3.5" /></button>
             </div>
             <button 
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="flex-1 bg-warm-accent hover:bg-warm-dark active:scale-[0.98] text-white h-11 rounded-xl font-heading tracking-wider uppercase text-xs font-bold transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {product.stock <= 0 ? 'Out of Stock' : `Add to Cart • ₹${computedUnitPrice * quantity}`}
            </button>
          </div>

          {/* Description sections */}
          <div className="pt-6 border-t border-warm-dark/10 mt-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-warm-dark/50 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" /> The Story
            </h3>
            <p className="text-warm-dark/70 font-serif leading-relaxed text-base italic">
              {product.longDescription || product.description}
            </p>
          </div>

          {product.ingredients && (
            <div className="pt-6 mt-6 border-t border-dashed border-warm-dark/10">
              <h3 className="text-xs font-bold uppercase tracking-widest text-warm-dark/50 mb-3">Pure Ingredients</h3>
              <div className="flex flex-wrap gap-2">
                {product.ingredients.map((ingredient, idx) => (
                  <span 
                    key={idx} 
                    className="bg-warm-light/50 border border-warm-dark/5 rounded-full px-4 py-1.5 font-serif italic text-xs shadow-sm"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Culinary Pairings Integration */}
          {matchingRecipes.length > 0 && (
            <div className="pt-10 mt-10 border-t border-warm-dark/10">
              <h3 className="text-xs font-bold tracking-widest uppercase text-warm-accent mb-6 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-warm-accent rounded-full"></div>
                 Culinary Pairings
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {matchingRecipes.map(recipe => (
                  <Link 
                    key={recipe.id}
                    to={`/recipes/${recipe.id}`}
                    className="group flex items-center gap-4 p-4 bg-white border border-warm-dark/5 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="w-16 h-16 flex-shrink-0 rounded-xl border border-warm-dark/5 overflow-hidden">
                      <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-serif font-bold text-warm-dark text-base group-hover:text-warm-accent transition-colors">{recipe.title}</h4>
                      <p className="text-xs text-warm-dark/50 font-serif italic line-clamp-1">{recipe.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-warm-dark/30 group-hover:text-warm-accent group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

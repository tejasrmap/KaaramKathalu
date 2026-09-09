import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Flame, Plus, Minus, Info, Loader2, Check, Heart, Leaf } from 'lucide-react';
import { Product } from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import SEO from '../components/SEO';
import { getAvailableWeights, getProductUnitPrice, isWeightInStock } from '../utils/price';
import { formatRichText } from '../utils/richText';

export default function ProductDetail() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState<number>(500);
  const [isJar, setIsJar] = useState<boolean>(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [product, setProduct] = useState<Product | null>(() => {
    try {
      const cachedProducts = localStorage.getItem('kk_products_cache');
      if (cachedProducts) {
        const list = JSON.parse(cachedProducts);
        const match = list.find((p: any) => Number(p.id) === Number(id));
        if (match) return match as Product;
      }
      const cachedBestsellers = localStorage.getItem('kk_bestsellers_cache');
      if (cachedBestsellers) {
        const list = JSON.parse(cachedBestsellers);
        const match = list.find((p: any) => Number(p.id) === Number(id));
        if (match) return match as Product;
      }
    } catch (e) {
      console.error("Cache parse error", e);
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => !product);
  const { addToCart, setIsCartOpen } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  useEffect(() => {
    // Sync initial selected weight if product was populated from cache
    if (product) {
      const weights = getAvailableWeights(product);
      setSelectedWeight(product.weightGrams || weights[0] || 500);
    }
  }, [product?.id]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const q = query(collection(db, 'products'), where('id', '==', Number(id)), limit(1));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const prod = querySnapshot.docs[0].data() as Product;
          setProduct(prod);
          if (!product) {
            const weights = getAvailableWeights(prod);
            setSelectedWeight(prod.weightGrams || weights[0] || 500);
            setActiveImageIndex(0);
          }
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

  const computedUnitPrice = getProductUnitPrice(product, selectedWeight, isJar);
  const selectedWeightInStock = isWeightInStock(product, selectedWeight);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedWeight, isJar);
    setIsCartOpen(true);
  };

  return (
    <div className="pt-6 md:pt-10 pb-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
      <SEO title={product.name} description={product.description} image={activeImage} />
      
      <div className="mb-6">
        <Link to="/shop" className="inline-flex items-center gap-2 text-warm-dark/70 hover:text-warm-accent font-heading font-bold uppercase tracking-widest text-xs transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Shop
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 w-full relative z-10 items-start">
        {/* Product Image & Gallery */}
        <div className="w-full lg:w-1/2 flex flex-col lg:sticky lg:top-28">
          <div className="relative aspect-square bg-white overflow-hidden rounded-2xl border border-warm-dark/10 shadow-xs">
            <img 
              src={activeImage} 
              alt={product.name} 
              decoding="async"
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
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 cursor-pointer shadow-xs ${
                    activeImageIndex === idx
                      ? 'border-warm-accent ring-2 ring-warm-accent/30 scale-105'
                      : 'border-warm-dark/10 hover:border-warm-dark/30 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={imgUrl} 
                    alt={`${product.name} thumbnail ${idx + 1}`} 
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info & Actions */}
        <div className="w-full lg:w-1/2 flex flex-col justify-start">
          <div className="flex items-center gap-3 mb-3">
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

          <h1 className="text-3xl md:text-4xl font-serif text-warm-dark leading-tight mb-3">
            {formatRichText(product.name)}
          </h1>

          {/* Clean, Straight & Highly Readable Price Presentation */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <div className="inline-flex items-baseline gap-1.5 bg-white px-4 py-2 rounded-xl border border-warm-dark/15 shadow-xs">
              <span className="text-sm font-sans font-bold text-warm-accent">₹</span>
              <span className="text-2xl font-sans font-extrabold text-warm-dark tracking-tight leading-none">
                {computedUnitPrice}
              </span>
              <span className="text-xs font-sans font-medium text-warm-dark/60 ml-2 border-l border-warm-dark/15 pl-2.5">
                Weight: {selectedWeight === 1000 ? '1000g (1kg)' : `${selectedWeight}g`}
              </span>
            </div>
            {isJar && (
              <span className="inline-flex items-center gap-1 bg-warm-accent/10 border border-warm-accent/30 text-warm-accent px-3 py-2 rounded-xl text-xs font-bold font-sans">
                🫙 Glass Jar (+₹100)
              </span>
            )}
            <span className="text-[11px] font-sans text-warm-dark/50 uppercase tracking-wider font-bold">
              • Inclusive of all taxes
            </span>
          </div>
          
          <p className="text-base text-warm-dark/75 font-serif mb-6 leading-relaxed">
            {formatRichText(product.description)}
          </p>

          {/* Weight Options Selector */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/50">Select Weight</label>
              <span className="text-xs font-serif text-warm-dark/50 italic">
                {selectedWeight === 1000 ? '1000g (1kg)' : `${selectedWeight}g`}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {getAvailableWeights(product).map(weight => {
                const inStock = isWeightInStock(product, weight);
                const isSelected = selectedWeight === weight;
                return (
                  <button
                    key={weight}
                    type="button"
                    onClick={() => setSelectedWeight(weight)}
                    disabled={!inStock}
                    className={`h-11 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                      isSelected
                        ? 'bg-warm-dark text-white border-warm-dark font-extrabold shadow-sm'
                        : 'bg-white text-warm-dark/75 border-warm-dark/15 hover:border-warm-dark/40 hover:bg-warm-light/40'
                    } ${!inStock ? 'opacity-40 cursor-not-allowed line-through' : ''}`}
                  >
                    <span>{weight === 1000 ? '1000g (1kg)' : `${weight}g`}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Glass Jar Packaging Option (+₹100) */}
          {product.hasJarOption !== false && (
            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-widest text-warm-dark/50 mb-2">Packaging Option</label>
              <div 
                onClick={() => setIsJar(!isJar)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between shadow-xs ${
                  isJar 
                    ? 'bg-warm-accent/10 border-warm-accent ring-1 ring-warm-accent' 
                    : 'bg-white border-warm-dark/15 hover:border-warm-dark/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    isJar ? 'bg-warm-accent border-warm-accent text-white' : 'bg-white border-warm-dark/20'
                  }`}>
                    {isJar && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-warm-dark block">
                      Add Premium Glass Jar Packaging (+₹100)
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

          {/* Action Controls */}
          <div className="space-y-3 mb-6">
            <label className="block text-xs font-bold uppercase tracking-widest text-warm-dark/50 mb-1">Quantity & Add to Cart</label>
            {/* Quantity, Add to Cart, Wishlist Row */}
            <div className="flex items-center gap-3">
              {/* Quantity Selector */}
              <div className="flex items-center bg-white border border-warm-dark/15 rounded-xl w-32 h-12 shadow-xs shrink-0">
                <button 
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex-1 h-full flex items-center justify-center text-warm-dark/60 hover:text-warm-dark transition-colors cursor-pointer active:scale-90"
                  title="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-bold text-warm-dark text-sm">{quantity}</span>
                <button 
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex-1 h-full flex items-center justify-center text-warm-dark/60 hover:text-warm-dark transition-colors cursor-pointer active:scale-90"
                  title="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button 
                type="button"
                onClick={handleAddToCart}
                disabled={!selectedWeightInStock}
                className="flex-1 bg-white hover:bg-warm-light/60 text-warm-dark h-12 border border-warm-dark/80 rounded-xl font-heading tracking-widest uppercase text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!selectedWeightInStock ? 'Out of Stock' : 'Add to cart'}
              </button>

              {/* Wishlist Button */}
              {product && (
                <button 
                  type="button"
                  onClick={() => {
                    isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product);
                  }}
                  className={`w-12 h-12 border rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 ${
                    isInWishlist(product.id)
                      ? 'bg-warm-accent/10 border-warm-accent text-warm-accent'
                      : 'bg-white border-warm-dark/15 text-warm-dark/70 hover:border-warm-dark hover:text-warm-dark'
                  }`}
                  title={isInWishlist(product.id) ? "Remove from Wishlist" : "Save to Wishlist"}
                >
                  <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-warm-accent text-warm-accent' : ''}`} />
                </button>
              )}
            </div>

            {/* Buy It Now Button */}
            <button 
              type="button"
              onClick={handleAddToCart}
              disabled={!selectedWeightInStock}
              className="w-full bg-warm-dark hover:bg-warm-dark/95 text-white h-12 rounded-xl font-heading tracking-widest uppercase text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!selectedWeightInStock ? 'Sold Out' : 'Buy it now'}
            </button>
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

        </div>
      </div>

      {/* Product Story & Ingredients Details - Symmetric 2-Column Section */}
      <div className="mt-14 pt-10 border-t border-warm-dark/10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {/* The Story & Heritage */}
          <div className="bg-warm-light/35 border border-warm-dark/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-2xs">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-warm-accent mb-4 flex items-center gap-2 font-heading">
                <Info className="w-4 h-4" /> The Story & Heritage
              </h3>
              <p className="text-warm-dark/80 font-serif leading-relaxed text-base italic">
                {product.longDescription || product.description}
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-warm-dark/10 flex items-center gap-2 text-xs text-warm-dark/60 font-serif">
              <span className="w-2 h-2 rounded-full bg-warm-accent"></span>
              Authentic traditional Andhra recipe prepared in small artisanal batches
            </div>
          </div>

          {/* Pure Ingredients */}
          <div className="bg-warm-light/35 border border-warm-dark/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-2xs">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-warm-accent mb-4 flex items-center gap-2 font-heading">
                <Leaf className="w-4 h-4" /> Pure Ingredients
              </h3>
              {product.ingredients && product.ingredients.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {product.ingredients.map((ingredient, idx) => (
                    <span 
                      key={idx} 
                      className="bg-white border border-warm-dark/10 rounded-xl px-3.5 py-2 font-serif text-xs text-warm-dark/80 shadow-2xs font-medium"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-warm-dark/70 font-serif text-sm italic">
                  Made with 100% natural, farm-fresh ingredients and traditional spices. No artificial additives or chemical preservatives.
                </p>
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-warm-dark/10 flex items-center gap-2 text-xs text-warm-dark/60 font-serif">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              100% Natural • Zero Preservatives • Traditional Sun-Dried Spices
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

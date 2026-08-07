import React from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, ArrowLeft, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart, setIsCartOpen } = useCart();

  const handleMoveToCart = (product: any) => {
    addToCart(product, 1);
    removeFromWishlist(product.id);
    setIsCartOpen(true);
  };

  return (
    <div className="pt-8 md:pt-12 pb-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto min-h-[70vh]">
      <SEO title="My Wishlist" description="Your favorite pickles and podis from Kaaram Kathalu." />
      
      <Link to="/shop" className="inline-flex items-center gap-2 text-warm-dark font-bold uppercase tracking-widest text-xs mb-6 hover:text-warm-accent transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Shop
      </Link>
      
      <div className="text-center mb-12 mt-2">
        <span className="font-heading text-warm-accent text-xs font-bold uppercase tracking-[0.2em] block mb-2">Saved Items</span>
        <h1 className="text-4xl md:text-5xl font-heading font-black text-warm-dark uppercase tracking-tight">
          My <span className="text-warm-accent">Wishlist</span>
        </h1>
        <p className="text-warm-dark/60 font-serif italic text-sm mt-1">A collection of your favorite spicy treasures.</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white border border-warm-dark/5 p-12 md:p-16 rounded-[24px] text-center shadow-md max-w-xl mx-auto">
          <Heart className="w-16 h-16 text-warm-dark/10 mx-auto mb-6" />
          <h2 className="text-2xl font-heading font-bold uppercase tracking-wide text-warm-dark mb-3">Your wishlist is empty</h2>
          <p className="text-warm-dark/60 mb-8 font-serif italic text-sm">Start exploring our collection and save your favorites!</p>
          <Link to="/shop" className="px-8 py-3.5 bg-warm-accent hover:bg-warm-accent/90 text-white font-heading font-bold tracking-widest uppercase text-xs rounded-full transition-colors shadow-sm hover:shadow-md inline-block cursor-pointer">
            Browse Shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {wishlist.map(product => (
            <div 
              key={product.id} 
              className="group flex flex-col transition-transform duration-300"
            >
              <div className="relative aspect-square overflow-hidden bg-warm-light border border-warm-dark/5 rounded-2xl mb-4">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <button 
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-warm-dark flex items-center justify-center shadow-sm transition-colors cursor-pointer"
                  aria-label="Remove from Wishlist"
                >
                  <Trash2 className="w-4 h-4 text-warm-dark/60 hover:text-red-600 transition-colors" />
                </button>
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-warm-dark text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
                  ₹{product.price}
                </div>
              </div>
              
              <div className="pt-1 flex flex-col text-left">
                <span className="text-[9px] uppercase font-bold tracking-[0.15em] text-warm-accent mb-1">{product.type || 'Delicacy'}</span>
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-heading font-semibold text-sm sm:text-base text-warm-dark hover:text-warm-accent transition-colors leading-tight mb-3 line-clamp-1">{product.name}</h3>
                </Link>
                
                <button 
                  onClick={() => handleMoveToCart(product)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-warm-accent hover:bg-warm-dark text-white font-bold tracking-widest uppercase text-xs rounded-xl transition-colors shadow-sm cursor-pointer"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> Move to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

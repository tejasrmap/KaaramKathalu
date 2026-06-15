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
    <div className="pt-24 md:pt-32 pb-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto min-h-[70vh]">
      <SEO title="My Wishlist" description="Your favorite pickles and podis from Kaaram Kathalu." />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <Link to="/shop" className="inline-flex items-center gap-2 text-warm-dark font-bold uppercase tracking-widest text-xs mb-6 hover:text-warm-accent transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Pantry
          </Link>
          <h1 className="text-5xl font-serif text-warm-dark italic">My Wishlist</h1>
          <p className="text-warm-dark/60 font-serif mt-2 italic">A collection of your favorite spicy treasures.</p>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white border-2 border-warm-dark p-12 text-center shadow-[8px_8px_0px_#3A2A22] transform rotate-1">
          <Heart className="w-16 h-16 text-warm-dark/10 mx-auto mb-6" />
          <h2 className="text-2xl font-serif text-warm-dark mb-4">Your wishlist is empty</h2>
          <p className="text-warm-dark/60 mb-8 font-serif italic">Start exploring our pantry and save your favorites!</p>
          <Link to="/shop" className="px-10 py-4 bg-warm-accent text-white font-bold tracking-widest uppercase text-xs shadow-[4px_4px_0px_#3A2A22] hover:translate-y-1 hover:shadow-none transition-all">
            Browse Shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlist.map(product => (
            <div 
              key={product.id} 
              className="group flex flex-col transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="relative aspect-square overflow-hidden bg-warm-light border border-warm-dark/5 rounded-xl mb-4">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <button 
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-warm-dark flex items-center justify-center shadow-md transition-colors"
                  aria-label="Remove from Wishlist"
                >
                  <Trash2 className="w-4 h-4 hover:text-red-600 transition-colors" />
                </button>
                <div className="absolute top-3 left-3 bg-warm-dark text-white text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                  ₹{product.price}
                </div>
              </div>
              
              <div className="pt-2 flex flex-col text-left">
                <span className="text-[9px] uppercase font-bold tracking-[0.15em] text-warm-accent mb-1">{product.type || 'Pantry'}</span>
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-heading font-bold text-base text-warm-dark hover:text-warm-accent transition-colors leading-tight mb-2">{product.name}</h3>
                </Link>
                
                <button 
                  onClick={() => handleMoveToCart(product)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-warm-accent hover:bg-warm-dark text-white font-bold tracking-widest uppercase text-xs rounded-lg transition-colors shadow-sm"
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

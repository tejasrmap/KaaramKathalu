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
            <div key={product.id} className="bg-white border-2 border-warm-dark shadow-[6px_6px_0px_#3A2A22] group flex flex-col">
              <div className="relative aspect-square border-b-2 border-warm-dark overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-700"
                />
                <button 
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-4 right-4 p-2 bg-white border-2 border-warm-dark text-warm-dark hover:bg-red-50 hover:text-red-600 transition-colors shadow-[4px_4px_0px_#3A2A22]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="absolute top-4 left-4 bg-warm-accent border-2 border-warm-dark text-white px-3 py-1 font-bold text-xs shadow-[4px_4px_0px_#3A2A22] transform -rotate-3">
                  ₹{product.price}
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-2xl font-serif font-bold text-warm-dark mb-2">{product.name}</h3>
                <p className="text-warm-dark/60 text-sm font-serif italic mb-6 line-clamp-2">
                  {product.description}
                </p>
                
                <button 
                  onClick={() => handleMoveToCart(product)}
                  className="mt-auto w-full flex items-center justify-center gap-3 py-4 bg-warm-dark text-white font-bold tracking-widest uppercase text-xs shadow-[4px_4px_0px_#B83A20] hover:translate-y-1 hover:shadow-none transition-all"
                >
                  <ShoppingCart className="w-4 h-4" /> Move to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

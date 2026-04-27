import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Menu, X, Plus, Minus, MapPin, Phone, Mail, User as UserIcon, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { Heart } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, cartTotal, cartCount } = useCart();
  const { user, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('🔥 Traditional Flavors Delivered to Your Doorstep. Free Shipping on Orders Above ₹999.');
  const location = useLocation();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'general');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().announcementText) {
          setAnnouncement(docSnap.data().announcementText);
        }
      } catch (error) {
        console.error("Error fetching announcement:", error);
      }
    };
    fetchSettings();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const KOLAM_PATTERN = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,0 Q20,0 20,20 T40,40 M0,40 Q20,40 20,20 T40,0' stroke='%233A2A22' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round' /%3E%3Ccircle cx='10' cy='20' r='1.5' fill='%233A2A22' /%3E%3Ccircle cx='30' cy='20' r='1.5' fill='%233A2A22' /%3E%3Ccircle cx='20' cy='10' r='1.5' fill='%233A2A22' /%3E%3Ccircle cx='20' cy='30' r='1.5' fill='%233A2A22' /%3E%3C/svg%3E")`;

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col max-w-[100vw]">
      {/* KOLAM LEFT BORDER */}
      <div 
        className="fixed top-0 left-0 bottom-0 w-[24px] sm:w-[32px] md:w-[60px] lg:w-[80px] z-0 pointer-events-none opacity-[0.08]"
        style={{ backgroundImage: KOLAM_PATTERN, backgroundRepeat: 'repeat', backgroundPosition: 'left center', backgroundSize: '100% auto' }}
      />
      {/* KOLAM RIGHT BORDER */}
      <div 
        className="fixed top-0 right-0 bottom-0 w-[24px] sm:w-[32px] md:w-[60px] lg:w-[80px] z-0 pointer-events-none opacity-[0.08]"
        style={{ backgroundImage: KOLAM_PATTERN, backgroundRepeat: 'repeat', backgroundPosition: 'right center', backgroundSize: '100% auto' }}
      />

      {/* Announcement Bar */}
      <div className="bg-warm-dark text-[#F4EBE1] py-2 px-4 text-center text-[10px] uppercase font-bold tracking-[0.2em] relative z-50">
        {announcement}
      </div>

      {/* NAVBAR */}
      <header 
        className={`fixed top-8 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled || location.pathname !== '/' ? 'bg-warm-bg/95 backdrop-blur-sm border-b-2 border-warm-dark py-3 md:py-4' : 'bg-transparent py-4 md:py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto pl-10 pr-4 sm:px-6 md:px-12 flex justify-between items-center w-full">
          <Link to="/" className="flex items-center gap-2 z-50">
            <span className="font-serif font-bold text-xl md:text-2xl tracking-tight text-warm-dark bg-[#F4EBE1] px-2 py-1 md:px-3 md:py-1 border-2 border-warm-dark shadow-[4px_4px_0px_#3A2A22] transform -rotate-1 relative">
              <span className="absolute -left-1 -top-1 md:-left-2 md:-top-2 w-2 h-2 md:w-3 md:h-3 bg-warm-accent rounded-full border border-warm-dark shadow-sm"></span>
              Kaaram<span className="text-warm-accent italic">Kathalu</span>
            </span>
          </Link>

          <nav className="hidden md:flex gap-8 items-center font-bold text-xs tracking-widest uppercase bg-[#F4EBE1] px-8 py-3 border-2 border-warm-dark shadow-[4px_4px_0px_#3A2A22]">
            <Link to="/" className={`${location.pathname === '/' ? 'text-warm-accent underline' : 'text-warm-dark'} hover:text-warm-accent transition-colors underline-offset-4 decoration-2`}>Home</Link>
            <Link to="/about" className={`${location.pathname === '/about' ? 'text-warm-accent underline' : 'text-warm-dark'} hover:text-warm-accent transition-colors underline-offset-4 decoration-2`}>Our Story</Link>
            <Link to="/shop" className={`${location.pathname === '/shop' ? 'text-warm-accent underline' : 'text-warm-dark'} hover:text-warm-accent transition-colors underline-offset-4 decoration-2`}>Shop</Link>
          </nav>

          <div className="flex items-center gap-4 z-50">
            {user ? (
              <div className="flex items-center gap-2">
                <Link 
                  to="/profile"
                  className="p-2 bg-[#F4EBE1] border-2 border-warm-dark text-warm-dark hover:bg-warm-dark hover:text-[#F4EBE1] transition-colors shadow-[4px_4px_0px_#3A2A22]"
                  title="My Profile"
                >
                  <UserIcon className="w-5 h-5" />
                </Link>
                <Link 
                  to="/my-orders"
                  className="p-2 bg-white border-2 border-warm-dark text-warm-dark hover:bg-warm-bg transition-colors shadow-[4px_4px_0px_#3A2A22]"
                  title="My Orders"
                >
                  <ShoppingCart className="w-5 h-5 opacity-50" /> 
                </Link>
                <button 
                  onClick={() => logout()}
                  className="p-2 bg-white border-2 border-warm-dark text-warm-dark hover:bg-red-50 hover:text-red-600 transition-colors shadow-[4px_4px_0px_#3A2A22]"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                className="p-2 bg-[#F4EBE1] border-2 border-warm-dark text-warm-dark hover:bg-warm-dark hover:text-[#F4EBE1] transition-colors shadow-[4px_4px_0px_#3A2A22]"
                title="Login"
              >
                <UserIcon className="w-5 h-5" />
              </Link>
            )}

            <Link 
              to="/wishlist"
              className="relative p-2 bg-[#F4EBE1] border-2 border-warm-dark text-warm-dark hover:bg-warm-dark hover:text-[#F4EBE1] transition-colors shadow-[4px_4px_0px_#3A2A22]"
              title="My Wishlist"
            >
              <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'fill-warm-accent text-warm-accent' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-3 -right-3 bg-white text-warm-dark text-[10px] font-bold w-6 h-6 flex items-center justify-center border-2 border-warm-dark transform -rotate-3">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 bg-[#F4EBE1] border-2 border-warm-dark text-warm-dark hover:bg-warm-dark hover:text-[#F4EBE1] transition-colors shadow-[4px_4px_0px_#3A2A22]"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-3 -right-3 bg-warm-accent text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center border-2 border-warm-dark transform rotate-3">
                  {cartCount}
                </span>
              )}
            </button>
            
            <button 
              className="md:hidden p-2 bg-[#F4EBE1] border-2 border-warm-dark text-warm-dark shadow-[4px_4px_0px_#3A2A22]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-30 bg-warm-bg pt-32 px-6 flex flex-col gap-6 md:hidden border-b-4 border-warm-dark"
          >
            <Link to="/" className="font-serif text-4xl font-bold border-b-2 border-dashed border-warm-dark/20 pb-4">Home</Link>
            <Link to="/about" className="font-serif text-4xl font-bold border-b-2 border-dashed border-warm-dark/20 pb-4">Our Story</Link>
            <Link to="/shop" className="font-serif text-4xl font-bold border-b-2 border-dashed border-warm-dark/20 pb-4">Shop</Link>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 mt-16 md:mt-24">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="bg-warm-dark text-[#F4EBE1] py-16 md:py-24 px-4 sm:px-6 md:px-12 mt-auto border-t-[8px] border-warm-accent relative w-full overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-24 relative z-10 w-full pl-6 md:pl-0">
          <div className="flex flex-col gap-6">
            <span className="font-serif font-bold text-2xl md:text-3xl opacity-90 text-white">
              Kaaram<span className="text-warm-accent italic">Kathalu</span>
            </span>
            <p className="text-[#F4EBE1]/70 leading-relaxed max-w-sm font-serif text-base md:text-lg">
              Preserving the heritage of Indian culinary traditions, one jar at a time. Crafted with love, spices, and string.
            </p>
          </div>
          
          <div>
            <h4 className="font-serif text-lg md:text-xl mb-6 border-b-2 border-warm-accent/50 pb-2 inline-block font-bold">Contact Us</h4>
            <ul className="space-y-4 text-[#F4EBE1]/70 text-sm md:text-base">
              <li className="flex items-start gap-3"><MapPin className="w-5 h-5 text-warm-accent flex-shrink-0 mt-0.5" /> <span>123 Heritage Lane, Hyderabad</span></li>
              <li className="flex items-center gap-3"><Phone className="w-5 h-5 text-warm-accent flex-shrink-0" /> <span>+91 98765 43210</span></li>
              <li className="flex items-center gap-3"><Mail className="w-5 h-5 text-warm-accent flex-shrink-0" /> <span>order@kaaramkathalu.com</span></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-serif text-lg md:text-xl mb-6 border-b-2 border-warm-accent/50 pb-2 inline-block font-bold">Follow Us</h4>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/kaaram.kathalu/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 md:w-12 h-10 md:h-12 bg-[#F4EBE1] text-warm-dark border-2 border-[#F4EBE1] flex items-center justify-center hover:bg-warm-accent hover:border-warm-accent hover:text-white transition-colors cursor-pointer text-xs md:text-sm font-bold shadow-[4px_4px_0px_#B83A20] transform rotate-3">IN</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 md:mt-24 pt-8 border-t-2 border-dashed border-[#F4EBE1]/20 text-center font-bold tracking-widest uppercase text-[#F4EBE1]/40 text-[10px] md:text-xs px-8">
          &copy; {new Date().getFullYear()} Kaaram Kathalu. All rights reserved.
        </div>
      </footer>

      {/* CART OVERLAY & DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-warm-dark/80 z-50 mix-blend-multiply"
            />
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-warm-bg border-l-4 border-warm-dark shadow-2xl z-50 flex flex-col pt-safe px-safe"
            >
              <div className="p-6 border-b-2 border-warm-dark flex justify-between items-center bg-[#F4EBE1] relative">
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]"></div>
                <h2 className="font-serif text-3xl font-bold text-warm-dark tracking-wide relative z-10">Basket</h2>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="relative z-10 p-2 border-2 border-transparent hover:border-warm-dark bg-[#F4EBE1] shadow-[2px_2px_0px_#3A2A22] transition-colors"
                >
                  <X className="w-5 h-5 text-warm-dark" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-warm-dark/50 gap-4">
                    <ShoppingCart className="w-16 h-16 opacity-30" />
                    <p className="font-medium font-serif text-xl italic">Your basket is empty.</p>
                    <Link 
                      to="/shop"
                      onClick={() => setIsCartOpen(false)}
                      className="mt-6 px-8 py-3 bg-[#F4EBE1] border-2 border-warm-dark text-warm-dark font-bold tracking-widest uppercase text-xs shadow-[4px_4px_0px_#3A2A22] hover:translate-y-1 hover:shadow-[2px_2px_0px_#3A2A22] transition-all"
                    >
                      Explore Pantry
                    </Link>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.product.id} className="flex gap-4 items-center bg-[#F4EBE1] p-4 border-2 border-warm-dark shadow-[4px_4px_0px_rgba(58,42,34,0.15)] relative">
                      <div className="w-20 h-20 border-2 border-warm-dark p-1 bg-white">
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover grayscale-[20%] contrast-125"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1">
                        <Link to={`/product/${item.product.id}`} onClick={() => setIsCartOpen(false)}>
                          <h4 className="font-serif font-bold text-lg text-warm-dark hover:text-warm-accent transition-colors leading-tight mb-1">{item.product.name}</h4>
                        </Link>
                        <div className="font-bold text-warm-accent mb-3 text-sm tracking-widest">₹{item.product.price}</div>
                        
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="w-8 h-8 bg-[#F4EBE1] border-2 border-warm-dark flex items-center justify-center hover:bg-warm-dark hover:text-white transition-colors shadow-[2px_2px_0px_#3A2A22]"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-4 text-center font-bold tracking-widest">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="w-8 h-8 bg-[#F4EBE1] border-2 border-warm-dark flex items-center justify-center hover:bg-warm-dark hover:text-white transition-colors shadow-[2px_2px_0px_#3A2A22]"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 bg-[#F4EBE1] border-t-4 border-warm-dark">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-dashed border-warm-dark/20">
                    <span className="text-warm-dark font-bold uppercase tracking-widest text-xs">Total Due</span>
                    <span className="font-serif text-3xl font-bold text-warm-dark">₹{cartTotal}</span>
                  </div>
                  <Link 
                    to="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full bg-warm-accent text-white py-4 border-2 border-warm-dark font-bold tracking-widest uppercase text-sm shadow-[4px_4px_0px_#3A2A22] hover:translate-y-1 hover:shadow-[2px_2px_0px_#3A2A22] transition-all flex items-center justify-center"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

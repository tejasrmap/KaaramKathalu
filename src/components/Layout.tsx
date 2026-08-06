import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, ShoppingBag, Home, X, Plus, Minus, MapPin, Phone, Mail, User as UserIcon, LogOut, Heart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, cartTotal, cartCount } = useCart();
  const { user, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState({
    companyName: 'Kaaram Kathalu',
    supportEmail: 'kaaram.kathalu2025@gmail.com',
    supportPhone: '+91 76766 44366',
    address: '002 Ground Floor Spoorthi Vaibhava Apartment, 6th A Cross Trinity Enclave, Banjara Layout, Horamavu, Bangalore, Karnataka - 560043',
    announcementText: 'Free Shipping on Orders Above ₹999.',
    isMaintenanceMode: false
  });
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);

    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'general');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }));
        }
      } catch (error) {
        console.error("Error fetching general settings:", error);
      }
    };
    fetchSettings();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen relative overflow-x-hidden flex flex-col max-w-[100vw] bg-warm-bg font-sans">
      {settings.isMaintenanceMode && !location.pathname.startsWith('/admin') ? (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-warm-bg">
          <div className="max-w-md bg-white p-8 md:p-12 rounded-[32px] shadow-xl border border-warm-dark/5 flex flex-col items-center">
            <img src="/logo_icon.jpg" alt={settings.companyName} className="h-24 md:h-32 object-contain rounded-full mb-8 animate-pulse" />
            <h1 className="font-serif text-3xl font-bold text-warm-dark mb-4">Pantry Under Maintenance</h1>
            <p className="text-sm font-serif italic text-warm-dark/60 mb-6">
              Our digital courtyard is temporarily closed for maintenance while we restock our jars and refresh our pages. We'll be back shortly!
            </p>
            <div className="w-16 h-0.5 bg-warm-accent mb-6"></div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-warm-dark/40">
              For urgent inquiries: {settings.supportEmail}
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* TOP NAVIGATION WRAPPER */}
          <div className="fixed top-0 left-0 right-0 z-50">
            {/* Announcement Bar */}
            <div className="bg-warm-dark text-warm-bg py-2 px-4 text-center text-[10px] uppercase font-bold tracking-[0.2em]">
              {settings.announcementText}
            </div>

            {/* NAVBAR */}
            <header
              className={`transition-all duration-300 border-b bg-warm-bg/95 backdrop-blur-sm border-warm-dark/10 shadow-sm ${isScrolled || location.pathname !== '/'
                ? 'py-3 md:py-4'
                : 'py-5 md:py-6'
                }`}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex justify-between items-center w-full relative">
                <div className="flex justify-start">
                  <Link to="/" className="flex items-center">
                    <img
                      src="/logo_icon.jpg"
                      alt="Kaaram Kathalu"
                      className={`transition-all duration-300 object-contain rounded-full ${isScrolled || location.pathname !== '/'
                        ? 'h-8 md:h-12'
                        : 'h-10 md:h-16'
                        }`}
                    />
                  </Link>
                </div>

                {/* Desktop Nav Links - Absolutely Centered */}
                <nav className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 hidden lg:flex gap-8 items-center font-heading text-base tracking-wider uppercase text-warm-dark font-medium whitespace-nowrap">
                  <Link to="/" className={`${location.pathname === '/' ? 'text-warm-accent font-semibold' : ''} hover:text-warm-accent transition-colors`}>Home</Link>
                  <Link to="/shop" className={`${location.pathname === '/shop' && !location.search ? 'text-warm-accent font-semibold' : ''} hover:text-warm-accent transition-colors`}>Shop All</Link>
                  <Link to="/shop?category=pickle" className={`${location.pathname === '/shop' && location.search.includes('category=pickle') ? 'text-warm-accent font-semibold' : ''} hover:text-warm-accent transition-colors`}>Pickles</Link>
                  <Link to="/shop?category=podi" className={`${location.pathname === '/shop' && location.search.includes('category=podi') ? 'text-warm-accent font-semibold' : ''} hover:text-warm-accent transition-colors`}>Podis</Link>
                  <Link to="/about" className={`${location.pathname === '/about' ? 'text-warm-accent font-semibold' : ''} hover:text-warm-accent transition-colors`}>Our Story</Link>
                </nav>

                {/* Desktop & Mobile Actions */}
                <div className="flex justify-end items-center gap-3 sm:gap-4">
                  {/* Mobile Menu Toggle button */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="lg:hidden p-2 text-warm-dark hover:text-warm-accent transition-colors"
                    aria-label="Toggle Menu"
                  >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <ShoppingCart className="w-6 h-6 rotate-0 hidden" /* just reference */ />}
                    {!mobileMenuOpen && (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                      </svg>
                    )}
                  </button>

                  {user ? (
                    <div className="flex items-center gap-2">
                      <Link
                        to="/profile"
                        className="p-2 text-warm-dark hover:text-warm-accent transition-colors"
                        title="My Profile"
                      >
                        <UserIcon className="w-5 h-5" />
                      </Link>
                      <Link
                        to="/my-orders"
                        className="p-2 text-warm-dark hover:text-warm-accent transition-colors"
                        title="My Orders"
                      >
                        <ShoppingBag className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => logout()}
                        className="p-2 text-warm-dark hover:text-red-600 transition-colors hidden sm:inline-block"
                        title="Logout"
                      >
                        <LogOut className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <Link
                      to="/login"
                      className="p-2 text-warm-dark hover:text-warm-accent transition-colors"
                      title="Login"
                    >
                      <UserIcon className="w-5 h-5" />
                    </Link>
                  )}

                  <Link
                    to="/wishlist"
                    className="relative p-2 text-warm-dark hover:text-warm-accent transition-colors"
                    title="My Wishlist"
                  >
                    <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'fill-warm-accent text-warm-accent' : ''}`} />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-warm-accent text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>

                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="relative p-2 text-warm-dark hover:text-warm-accent transition-colors"
                    aria-label="View Cart"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-warm-dark text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                        {cartCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </header>
          </div>

          {/* MOBILE NAV DRAWER */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="fixed inset-0 bg-black/60 z-50 backdrop-blur-[2px] lg:hidden"
                />

                {/* Left Drawer */}
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
                  className="fixed top-0 left-0 bottom-0 w-[80vw] max-w-xs bg-white z-50 flex flex-col h-full lg:hidden border-r border-warm-dark/10"
                >
                  <div className="p-5 border-b border-warm-dark/10 flex justify-between items-center bg-warm-light">
                    <img src="/logo_icon.jpg" alt="Kaaram Kathalu" className="h-12 object-contain rounded-full" />
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 border border-warm-dark/10 hover:border-warm-dark bg-white transition-colors"
                    >
                      <X className="w-4 h-4 text-warm-dark" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 font-heading text-lg tracking-wider uppercase text-warm-dark">
                    <Link to="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-warm-accent transition-colors pb-3 border-b border-warm-dark/5">Home</Link>
                    <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="hover:text-warm-accent transition-colors pb-3 border-b border-warm-dark/5">Shop All</Link>
                    <Link to="/shop?category=pickle" onClick={() => setMobileMenuOpen(false)} className="hover:text-warm-accent transition-colors pb-3 border-b border-warm-dark/5">Pickles</Link>
                    <Link to="/shop?category=podi" onClick={() => setMobileMenuOpen(false)} className="hover:text-warm-accent transition-colors pb-3 border-b border-warm-dark/5">Podis</Link>
                    <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="hover:text-warm-accent transition-colors pb-3 border-b border-warm-dark/5">Our Story</Link>
                    {user ? (
                      <>
                        <Link to="/my-orders" onClick={() => setMobileMenuOpen(false)} className="hover:text-warm-accent transition-colors pb-3 border-b border-warm-dark/5">My Orders</Link>
                        <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="hover:text-warm-accent transition-colors pb-3 border-b border-warm-dark/5">Profile</Link>
                        <button
                          onClick={() => {
                            logout();
                            setMobileMenuOpen(false);
                          }}
                          className="text-left hover:text-red-600 transition-colors uppercase font-heading text-lg tracking-wider pb-3 cursor-pointer"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="hover:text-warm-accent transition-colors pb-3">Login</Link>
                    )}
                  </div>

                  <div className="p-6 border-t border-warm-dark/10 bg-warm-light text-center">
                    <p className="text-[10px] font-heading tracking-widest text-warm-dark/50 uppercase">Handcrafted Traditions</p>
                    <p className="text-[9px] font-serif text-warm-dark/40 mt-1">&copy; {new Date().getFullYear()} Kaaram Kathalu</p>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <main className="flex-1 mt-24 md:mt-32 pb-12 overflow-x-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* FOOTER */}
          <footer className="bg-warm-dark text-warm-bg py-16 px-6 md:px-12 mt-auto border-t-4 border-warm-accent relative w-full overflow-hidden">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-16 relative z-10 w-full">

              {/* Logo / Brand Info */}
              <div className="flex flex-col gap-4">
                <div className="bg-white p-2.5 inline-block rounded border border-warm-accent/20 w-fit max-w-[280px]">
                  <img
                    src="/logo.jpg"
                    alt={settings.companyName}
                    className="h-16 md:h-20 object-contain"
                  />
                </div>
                <p className="text-warm-bg/70 leading-relaxed font-serif text-sm">
                  Welcome to {settings.companyName}. We specialize in authentic, handmade, small-batch traditional Andhra packaged foods and heritage recipes made with pure ingredients and zero preservatives.
                </p>
              </div>

              {/* Quick Shop */}
              <div>
                <h4 className="font-heading text-lg tracking-wider text-white uppercase mb-6 font-bold pb-1 border-b border-warm-accent/30 inline-block">Quick Shop</h4>
                <ul className="space-y-3 text-warm-bg/70 text-sm font-serif">
                  <li><Link to="/shop" className="hover:text-white transition-colors">Shop All</Link></li>
                  <li><Link to="/shop?category=pickle" className="hover:text-white transition-colors">Pickles</Link></li>
                  <li><Link to="/shop?category=podi" className="hover:text-white transition-colors">Podis</Link></li>
                  <li><Link to="/about" className="hover:text-white transition-colors">Our Story</Link></li>
                </ul>
              </div>

              {/* Help Links */}
              <div>
                <h4 className="font-heading text-lg tracking-wider text-white uppercase mb-6 font-bold pb-1 border-b border-warm-accent/30 inline-block">Helpful Links</h4>
                <ul className="space-y-3 text-warm-bg/70 text-sm font-serif">
                  <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                  <li><Link to="/shop" className="hover:text-white transition-colors">Online Store</Link></li>
                  <li><Link to="/track-order" className="hover:text-white transition-colors">Track Shipment</Link></li>
                  <li><Link to="/recipes" className="hover:text-white transition-colors">Traditional Recipes</Link></li>
                  <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/terms-and-conditions" className="hover:text-white transition-colors">Terms &amp; Conditions</Link></li>
                </ul>
              </div>

              {/* Contact info */}
              <div>
                <h4 className="font-heading text-lg tracking-wider text-white uppercase mb-6 font-bold pb-1 border-b border-warm-accent/30 inline-block">Contact Info</h4>
                <ul className="space-y-3 text-warm-bg/70 text-sm">
                  <li className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-warm-accent flex-shrink-0 mt-1" />
                    <span className="font-serif text-xs">{settings.address}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-warm-accent flex-shrink-0" />
                    <span className="font-serif">{settings.supportPhone}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-warm-accent flex-shrink-0" />
                    <span className="font-serif">
                      <a href={`mailto:${settings.supportEmail}`} className="hover:text-white transition-colors">{settings.supportEmail}</a>
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-warm-bg/10 text-center font-heading tracking-wider uppercase text-warm-bg/40 text-xs">
              &copy; {new Date().getFullYear()} {settings.companyName}. All rights reserved.
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
                  className="fixed inset-0 bg-black/60 z-50 backdrop-blur-[2px]"
                />

                <motion.div
                  initial={isMobile ? { y: '100%' } : { x: '100%' }}
                  animate={isMobile ? { y: 0 } : { x: 0 }}
                  exit={isMobile ? { y: '100%' } : { x: '100%' }}
                  transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
                  className="fixed bottom-0 md:top-0 right-0 w-full max-w-md bg-warm-bg border-t-2 md:border-t-0 md:border-l border-warm-dark/10 shadow-2xl z-50 flex flex-col h-[85vh] md:h-full"
                >
                  <div className="p-6 border-b border-warm-dark/10 flex justify-between items-center bg-warm-light">
                    <h2 className="font-heading text-2xl font-bold text-warm-dark uppercase tracking-wider">Your Cart</h2>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="p-2 border border-warm-dark/10 hover:border-warm-dark bg-warm-bg transition-colors"
                    >
                      <X className="w-5 h-5 text-warm-dark" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
                    {cart.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-warm-dark/50 gap-4">
                        <ShoppingBag className="w-16 h-16 opacity-30 text-warm-dark" />
                        <p className="font-serif italic text-base">Your cart is currently empty.</p>
                        <Link
                          to="/shop"
                          onClick={() => setIsCartOpen(false)}
                          className="mt-4 px-6 py-2.5 bg-warm-dark text-white font-heading tracking-wider uppercase text-sm hover:bg-warm-accent transition-colors"
                        >
                          Continue Shopping
                        </Link>
                      </div>
                    ) : (
                      cart.map(item => (
                        <div key={item.product.id} className="flex gap-4 items-center bg-warm-light/50 p-4 border border-warm-dark/10 relative">
                          <div className="w-16 h-16 border border-warm-dark/10 bg-white flex-shrink-0">
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link to={`/product/${item.product.id}`} onClick={() => setIsCartOpen(false)}>
                              <h4 className="font-heading font-bold text-base text-warm-dark hover:text-warm-accent transition-colors leading-tight mb-1 truncate">{item.product.name}</h4>
                            </Link>
                            <div className="font-bold text-warm-accent text-sm mb-2">₹{item.product.price}</div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.product.id, -1)}
                                className="w-6 h-6 bg-warm-bg border border-warm-dark/10 flex items-center justify-center hover:bg-warm-dark hover:text-white transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.product.id, 1)}
                                className="w-6 h-6 bg-warm-bg border border-warm-dark/10 flex items-center justify-center hover:bg-warm-dark hover:text-white transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {cart.length > 0 && (
                    <div className="p-6 bg-warm-light border-t border-warm-dark/10">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-warm-dark font-heading font-bold uppercase tracking-wider text-xs">Estimated Total</span>
                        <span className="font-serif text-2xl font-bold text-warm-dark">₹{cartTotal}</span>
                      </div>
                      <Link
                        to="/checkout"
                        onClick={() => setIsCartOpen(false)}
                        className="w-full bg-warm-dark text-white py-3.5 font-heading tracking-wider uppercase text-center text-sm hover:bg-warm-accent transition-colors block"
                      >
                        Proceed to Checkout
                      </Link>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Flame, ChevronDown, Award, ShieldCheck, BadgeAlert, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, limit, onSnapshot, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import SEO from '../components/SEO';
import { useWishlist } from '../context/WishlistContext';
import { getProductStartingPrice } from '../utils/price';

export default function Home() {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [bestsellers, setBestsellers] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('kk_bestsellers_cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(() => {
    try {
      const cached = localStorage.getItem('kk_bestsellers_cache');
      return !cached || JSON.parse(cached).length === 0;
    } catch {
      return true;
    }
  });
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [heroSettings, setHeroSettings] = useState(() => {
    try {
      const cached = localStorage.getItem('kk_hero_settings_cache');
      return cached ? JSON.parse(cached) : {
        heroTag: 'Handmade Traditions',
        heroTitle: 'Savour the Heritage.',
        heroDescription: 'Handcrafted Andhra pickles, Gongura, Avakaya, and aromatic spice podis made with pure ingredients, cold-pressed oils, and zero preservatives. Every bite tells a story.',
        heroButtonText: 'Shop Pickles & Podis',
        heroBgImage1: '',
        heroBgImage2: '',
        heroBgImage3: '',
        heroMobileBgImage1: '',
        heroMobileBgImage2: '',
        heroMobileBgImage3: '',
        heroOverlayOpacity: '30'
      };
    } catch {
      return {
        heroTag: 'Handmade Traditions',
        heroTitle: 'Savour the Heritage.',
        heroDescription: 'Handcrafted Andhra pickles, Gongura, Avakaya, and aromatic spice podis made with pure ingredients, cold-pressed oils, and zero preservatives. Every bite tells a story.',
        heroButtonText: 'Shop Pickles & Podis',
        heroBgImage1: '',
        heroBgImage2: '',
        heroBgImage3: '',
        heroMobileBgImage1: '',
        heroMobileBgImage2: '',
        heroMobileBgImage3: '',
        heroOverlayOpacity: '30'
      };
    }
  });
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'products'), where('isBestseller', '==', true), limit(4));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let products = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));

      if (products.length === 0) {
        const fallbackQuery = query(collection(db, 'products'), limit(4));
        onSnapshot(fallbackQuery, (fallbackSnapshot) => {
          const fallbackProducts = fallbackSnapshot.docs.map(doc => ({
            docId: doc.id,
            ...doc.data()
          }));
          setBestsellers(fallbackProducts);
          localStorage.setItem('kk_bestsellers_cache', JSON.stringify(fallbackProducts));
          setIsLoading(false);
        });
      } else {
        setBestsellers(products);
        localStorage.setItem('kk_bestsellers_cache', JSON.stringify(products));
        setIsLoading(false);
      }
    }, (error) => {
      console.error("Firestore read error:", error);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  // Fetch hero background & copy settings in real-time
  useEffect(() => {
    const docRef = doc(db, 'settings', 'general');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const newSettings = {
          heroTag: data.heroTag || '',
          heroTitle: data.heroTitle || '',
          heroDescription: data.heroDescription || '',
          heroButtonText: data.heroButtonText || '',
          heroBgImage1: data.heroBgImage1 || '',
          heroBgImage2: data.heroBgImage2 || '',
          heroBgImage3: data.heroBgImage3 || '',
          heroMobileBgImage1: data.heroMobileBgImage1 || '',
          heroMobileBgImage2: data.heroMobileBgImage2 || '',
          heroMobileBgImage3: data.heroMobileBgImage3 || '',
          heroOverlayOpacity: data.heroOverlayOpacity || '30'
        };
        setHeroSettings(newSettings);
        localStorage.setItem('kk_hero_settings_cache', JSON.stringify(newSettings));
      }
    }, (error) => {
      console.error('Error listening to hero settings:', error);
    });

    return () => unsubscribe();
  }, []);

  // Build active lists for desktop and mobile covers
  const desktopImages = [
    heroSettings.heroBgImage1,
    heroSettings.heroBgImage2,
    heroSettings.heroBgImage3
  ].filter(Boolean);

  const mobileImages = [
    heroSettings.heroMobileBgImage1,
    heroSettings.heroMobileBgImage2,
    heroSettings.heroMobileBgImage3
  ].filter(Boolean);

  const hasCustomImages = isMobile
    ? mobileImages.length > 0
    : desktopImages.length > 0;

  const activeHeroImages = isMobile
    ? (mobileImages.length > 0 ? mobileImages : ['/hero_fallback.jpg'])
    : (desktopImages.length > 0 ? desktopImages : ['/hero_fallback.jpg']);

  // Auto-cycle slides
  useEffect(() => {
    if (activeHeroImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroSlide(prev => (prev + 1) % activeHeroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeHeroImages.length]);


  const faqs = [
    {
      q: "Are your pickles and podis handmade?",
      a: "Yes! Every batch of Avakaya, Gongura, and aromatic podis is handcrafted in small quantities. We use traditional stoneware grinding methods passed down through generations of Andhra households."
    },
    {
      q: "Do your products contain preservatives or artificial additives?",
      a: "Absolutely not. All our pickles and podis are completely free of artificial chemical preservatives, synthetic colours, or MSG. We use cold-pressed sesame oil, sea salt, and lemon juice as natural preservatives just like grandmothers do."
    },
    {
      q: "What oils do you use in your pickles?",
      a: "We exclusively use premium, raw cold-pressed sesame oil (Nuvvula Nune) and pure groundnut oil for our pickles. This not only preserves the pickles naturally but also lends them an authentic coastal Andhra aroma and flavour."
    },
    {
      q: "How long do the pickles and podis stay fresh?",
      a: "Our pickles stay fresh for up to 6–12 months when stored properly. Spice podis are best consumed within 3–4 months to enjoy their peak aroma. Always use a clean, dry spoon to retain freshness."
    },
    {
      q: "Can I order in bulk for events or gifting?",
      a: "Absolutely! We accept bulk orders for weddings, festivals, corporate gifting, and events. Contact us at kaaram.kathalu2025@gmail.com or call +91 76766 44366 for bulk pricing and custom packaging options."
    }
  ];

  return (
    <div className="min-h-screen bg-warm-bg">
      <SEO
        title="Kaaram Kathalu | Authentic Andhra Pickles & Podis"
        description="Kaaram Kathalu brings you handcrafted Andhra pickles, Gongura, Avakaya, and traditional spice podis made by local artisans. Zero preservatives. Free shipping on orders above ₹999."
        url="https://www.kaaramkathalu.in/"
      />

      {/* HERO BANNER SECTION */}
      <section className="relative w-full overflow-hidden py-16 md:py-24 border-b border-warm-dark/5 min-h-[50vh] sm:min-h-[60vh] flex items-center bg-warm-bg">
        
        {/* Background Slideshow / Fallback Image */}
        {hasCustomImages ? (
          <>
            <AnimatePresence mode="sync">
              <motion.div
                key={currentHeroSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
                className="absolute inset-0 z-0"
              >
                <img
                  src={activeHeroImages[currentHeroSlide]}
                  alt="Hero Background"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </AnimatePresence>
            {/* Soft overlay */}
            <div 
              className="absolute inset-0 z-[1] bg-white/20"
            />
            {/* Slide Indicators */}
            {activeHeroImages.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
                {activeHeroImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentHeroSlide(idx)}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      idx === currentHeroSlide
                        ? 'w-6 h-2 bg-warm-accent'
                        : 'w-2 h-2 bg-warm-dark/20 hover:bg-warm-dark/40'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          /* Handcrafted Andhra Pickle Fallback Layout matching the photo */
          <div className="absolute inset-y-0 right-0 w-full md:w-[50%] lg:w-[45%] z-0">
            <img
              src="/hero_fallback.jpg"
              alt="Handcrafted Andhra Pickles"
              className="w-full h-full object-cover object-center md:object-right opacity-90 md:opacity-100"
            />
            {/* Desktop soft transition overlay */}
            <div className="hidden md:block absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-warm-bg to-transparent z-1" />
            {/* Mobile soft overlay for text readability */}
            <div className="md:hidden absolute inset-0 bg-white/30 backdrop-blur-[0.5px] z-1" />
          </div>
        )}

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-24 relative z-10 w-full">
          <div className="max-w-xl flex flex-col gap-4 md:max-w-md lg:max-w-lg">
            <span className="font-sans tracking-[0.2em] text-xs uppercase font-bold text-warm-accent">
              {heroSettings.heroTag || 'Handmade Traditions'}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif leading-tight text-warm-dark whitespace-pre-line">
              {heroSettings.heroTitle || 'Savour the Heritage.'}
            </h1>
            
            {/* Heritage Divider Line below heading */}
            <div className="heritage-divider text-warm-accent w-full max-w-[120px] !my-2 justify-start">✻</div>

            <p className="font-serif italic text-sm sm:text-base leading-relaxed text-warm-dark/80 whitespace-pre-line">
              {heroSettings.heroDescription || 'Handcrafted Andhra pickles, Gongura, Avakaya, and aromatic spice podis made with pure ingredients, cold-pressed oils, and zero preservatives. Every bite tells a story.'}
            </p>
            <Link 
              to="/shop" 
              className="w-fit px-8 py-3.5 bg-warm-accent text-white hover:bg-warm-dark transition-all mt-4 font-sans uppercase text-xs tracking-wider font-bold rounded shadow-md hover:shadow-lg active:scale-98"
            >
              {heroSettings.heroButtonText || 'Shop Pickles & Podis'}
            </Link>
          </div>
        </div>
      </section>

      {/* BESTSELLERS SECTION */}
      <section className="py-20 md:py-28 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16 max-w-2xl mx-auto flex flex-col items-center">
          <span className="font-sans text-warm-accent text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2">
            <span>🌿</span> Curated Favorites <span>🌿</span>
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif text-warm-dark mt-3 mb-4">Our Bestsellers</h2>
          <p className="font-serif italic text-warm-dark/70 text-sm md:text-base max-w-lg leading-relaxed">
            Bold flavors. Time-honored recipes. Made with love, enjoyed by all.
          </p>
          <div className="heritage-divider text-warm-accent w-full max-w-[200px] mt-2">✻</div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
          {isLoading ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="h-[360px] bg-warm-dark/5 animate-pulse rounded-lg border border-warm-dark/10"></div>
            ))
          ) : bestsellers.map((product) => (
            <Link 
              key={product.docId}
              to={`/product/${product.id}`}
              className="group flex flex-col items-center transition-transform duration-300 hover:-translate-y-1 text-center"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-transparent mb-4">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product);
                  }}
                  className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-warm-dark flex items-center justify-center shadow-sm transition-all cursor-pointer group/heart active:scale-90"
                  aria-label="Wishlist"
                >
                  <Heart className={`w-4 h-4 transition-colors ${isInWishlist(product.id) ? 'fill-warm-accent text-warm-accent' : 'text-warm-dark group-hover/heart:text-warm-accent'}`} />
                </button>
              </div>
              
              <div className="pt-2 flex flex-col items-center w-full px-2">
                <h3 className="font-serif text-sm sm:text-base text-warm-dark group-hover:text-warm-accent transition-colors leading-snug mb-3 min-h-[2.5rem] flex items-center justify-center font-medium">{product.name}</h3>
                <div className="w-full max-w-[120px] py-1.5 border border-warm-accent/80 text-warm-accent font-sans text-[10px] tracking-widest uppercase transition-all duration-300 group-hover:bg-warm-accent group-hover:text-white rounded font-bold">
                  Shop Now
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>


      {/* VALUE PROPOSITIONS */}
      <section className="py-20 md:py-28 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="flex flex-col items-center text-center p-6 bg-white border border-warm-dark/5 rounded-2xl shadow-sm">
          <div className="w-12 h-12 bg-warm-accent/10 rounded-full flex items-center justify-center text-warm-accent mb-6">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-heading text-xl font-bold uppercase tracking-wider text-warm-dark mb-3">Farm-Fresh Flavors</h3>
          <p className="font-serif italic text-warm-dark/70 text-sm leading-relaxed">
            We are dedicated to making products bursting with authentic, rich flavours. Our commitment to using fresh, natural ingredients from local farmers guarantees a truly delicious taste in every bite.
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-6 bg-white border border-warm-dark/5 rounded-2xl shadow-sm">
          <div className="w-12 h-12 bg-warm-accent/10 rounded-full flex items-center justify-center text-warm-accent mb-6">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-heading text-xl font-bold uppercase tracking-wider text-warm-dark mb-3">Quality You Can Taste</h3>
          <p className="font-serif italic text-warm-dark/70 text-sm leading-relaxed">
            We don't compromise on quality. Every bite reflects our commitment to using the finest ingredients. We source fresh seasonal offerings, ensuring peak flavor and support local farmers. We sample before we use ingredients.
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-6 bg-white border border-warm-dark/5 rounded-2xl shadow-sm">
          <div className="w-12 h-12 bg-warm-accent/10 rounded-full flex items-center justify-center text-warm-accent mb-6">
            <BadgeAlert className="w-6 h-6" />
          </div>
          <h3 className="font-heading text-xl font-bold uppercase tracking-wider text-warm-dark mb-3">Seasonal Availability</h3>
          <p className="font-serif italic text-warm-dark/70 text-sm leading-relaxed">
            The journey of the fresh ingredients, from the farm directly into your product, highlights the connection to quality, traditional preservation and the authentic, seasonal taste without chemicals.
          </p>
        </div>
      </section>


      {/* FAQ SECTION */}
      <section className="py-20 md:py-28 px-4 sm:px-6 md:px-12 max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="font-heading text-warm-accent text-xs font-bold tracking-[0.2em] uppercase">Frequently Asked Questions</span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-warm-dark mt-2 uppercase">FAQ</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="border border-warm-dark/10 rounded-xl overflow-hidden bg-white shadow-sm"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-warm-bg/20 transition-colors"
              >
                <span className="font-heading font-bold text-base md:text-lg text-warm-dark tracking-wide">{faq.q}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-warm-dark/40 transition-transform duration-300 ${activeFaq === idx ? 'rotate-180 text-warm-accent' : ''}`}
                />
              </button>
              
              <AnimatePresence initial={false}>
                {activeFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden border-t border-warm-dark/5"
                  >
                    <div className="p-6 font-serif italic text-warm-dark/70 text-sm md:text-base leading-relaxed bg-warm-bg/5">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

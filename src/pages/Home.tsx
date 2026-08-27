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
        heroBgImage1: '',
        heroBgImage2: '',
        heroBgImage3: '',
        heroOverlayOpacity: '30'
      };
    } catch {
      return {
        heroBgImage1: '',
        heroBgImage2: '',
        heroBgImage3: '',
        heroOverlayOpacity: '30'
      };
    }
  });
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

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

  // Fetch hero background settings
  useEffect(() => {
    const fetchHeroSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'general');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const newSettings = {
            heroBgImage1: data.heroBgImage1 || '',
            heroBgImage2: data.heroBgImage2 || '',
            heroBgImage3: data.heroBgImage3 || '',
            heroOverlayOpacity: data.heroOverlayOpacity || '30'
          };
          setHeroSettings(newSettings);
          localStorage.setItem('kk_hero_settings_cache', JSON.stringify(newSettings));
        }
      } catch (error) {
        console.error('Error fetching hero settings:', error);
      }
    };
    fetchHeroSettings();
  }, []);

  // Build array of active hero images
  const heroImages = [
    heroSettings.heroBgImage1,
    heroSettings.heroBgImage2,
    heroSettings.heroBgImage3
  ].filter(Boolean);

  // Auto-cycle slides
  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroSlide(prev => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);


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
      <section className="relative w-full overflow-hidden py-20 md:py-32 border-b border-warm-dark/5 min-h-[45vh] sm:min-h-[55vh] flex items-center">
        
        {/* Background Slideshow */}
        {heroImages.length > 0 ? (
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
                  src={heroImages[currentHeroSlide]}
                  alt="Hero Background"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            </AnimatePresence>
            {/* Dark overlay */}
            <div 
              className="absolute inset-0 z-[1] bg-warm-dark"
              style={{ opacity: Number(heroSettings.heroOverlayOpacity) / 100 }}
            />
            {/* Slide Indicators */}
            {heroImages.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
                {heroImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentHeroSlide(idx)}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      idx === currentHeroSlide
                        ? 'w-6 h-2 bg-white'
                        : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 z-0 bg-warm-light" />
        )}

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-24 relative z-10 w-full">
          <div className="max-w-2xl flex flex-col gap-5">
            <span className="font-heading tracking-[0.2em] text-xs md:text-sm uppercase font-bold text-warm-accent">
              {heroSettings.heroTag || 'Handmade Traditions'}
            </span>
            <h1 className={`text-4xl sm:text-5xl md:text-6xl font-serif leading-tight whitespace-pre-line ${
              heroImages.length > 0 ? 'text-white drop-shadow-lg' : 'text-warm-dark'
            }`}>
              {heroSettings.heroTitle || 'Savour the Heritage.'}
            </h1>
            <p className={`font-serif italic text-sm md:text-base leading-relaxed max-w-md ${
              heroImages.length > 0 ? 'text-white/90 drop-shadow' : 'text-warm-dark/80'
            }`}>
              {heroSettings.heroDescription || 'Handcrafted Andhra pickles, Gongura, Avakaya, and aromatic spice podis made with pure ingredients, cold-pressed oils, and zero preservatives. Every bite tells a story.'}
            </p>
            <Link 
              to="/shop" 
              className={`w-fit px-8 py-3.5 rounded-lg font-heading uppercase text-xs sm:text-sm tracking-wider transition-all mt-2 ${
                heroImages.length > 0
                  ? 'bg-warm-accent hover:bg-white hover:text-warm-dark text-white shadow-lg'
                  : 'bg-warm-accent text-white hover:bg-warm-dark shadow-[4px_4px_0px_var(--color-warm-dark)]'
              }`}
            >
              {heroSettings.heroButtonText || 'Shop Pickles & Podis'}
            </Link>
          </div>
        </div>
      </section>


      {/* BESTSELLERS SECTION */}
      <section className="py-20 md:py-28 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="font-heading text-warm-accent text-xs font-bold tracking-[0.2em] uppercase">Curated Favorites</span>
          <h2 className="text-3xl sm:text-5xl font-heading font-bold text-warm-dark mt-2 mb-4 uppercase">Our Bestsellers</h2>
          <p className="font-serif italic text-warm-dark/70 text-base md:text-lg">
            Introducing several creations with bold flavors and fresh traditions! Our bestsellers and loved products change every month!
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {isLoading ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="h-[400px] bg-warm-dark/5 animate-pulse rounded-lg border border-warm-dark/10"></div>
            ))
          ) : bestsellers.map((product) => (
            <Link 
              key={product.docId}
              to={`/product/${product.id}`}
              className="group flex flex-col transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="relative aspect-square overflow-hidden bg-warm-light border border-warm-dark/5 rounded-xl mb-4">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-warm-dark text-white text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                  Bestseller
                </div>

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
              
              <div className="pt-2 flex flex-col text-left">
                <span className="text-[9px] uppercase font-bold tracking-[0.15em] text-warm-accent mb-1">Traditional Recipe</span>
                <h3 className="font-heading font-bold text-sm sm:text-base text-warm-dark group-hover:text-warm-accent transition-colors leading-tight mb-1">{product.name}</h3>
                <span className="font-serif text-sm text-warm-dark/60">From ₹{getProductStartingPrice(product)}.00</span>
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

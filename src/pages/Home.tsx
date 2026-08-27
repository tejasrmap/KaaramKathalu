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
      <section className="relative w-full overflow-hidden py-16 md:py-24 border-b border-warm-dark/5 min-h-[50vh] sm:min-h-[60vh] flex items-center bg-warm-bg">
        
        {/* Background Slideshow / Fallback Image */}
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
            {/* Soft overlay */}
            <div 
              className="absolute inset-0 z-[1] bg-white/20"
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
          <div className="absolute inset-0 md:left-[45%] lg:left-[50%] z-0">
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
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif leading-tight text-warm-dark">
              {heroSettings.heroTitle || 'Savour the Heritage.'}
            </h1>
            
            {/* Heritage Divider Line below heading */}
            <div className="heritage-divider text-warm-accent w-full max-w-[120px] !my-2 justify-start">✻</div>

            <p className="font-serif italic text-sm sm:text-base leading-relaxed text-warm-dark/80">
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

      {/* Forest Green Heritage Banner */}
      <section className="relative bg-forest-green text-white py-10 md:py-12 overflow-visible z-20">
        {/* Torn Paper Top Edge */}
        <div className="absolute top-0 left-0 right-0 -translate-y-[95%] z-20 pointer-events-none h-6">
          <svg 
            className="w-full h-full fill-forest-green" 
            viewBox="0 0 1440 24" 
            preserveAspectRatio="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0 24h1440V12c-30-2-60-8-90-5s-60 8-90 4-60-10-90-5-60 9-90 5-60-8-90-4-60 10-90 5-60-9-90-5-60 8-90 4-60-10-90-5-60 9-90 5-60-8-90-4-60 10-90 5-60-9-90-5-60 8-90 4-60-10-90-5-60 9-90 5V24z"/>
          </svg>
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="flex overflow-x-auto no-scrollbar md:grid md:grid-cols-5 items-start text-center gap-4 md:gap-0 py-2">
            
            {/* Item 1 */}
            <div className="flex flex-col items-center justify-start flex-shrink-0 w-[120px] sm:w-[140px] md:w-auto md:px-4 md:border-r border-white/10 last:border-none">
              {/* Mixing Bowl SVG */}
              <div className="w-10 h-10 mb-3.5 flex items-center justify-center text-white/95">
                <svg className="w-7 h-7 stroke-current" fill="none" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v4M6 5.5l2.5 2.5M18 5.5l-2.5 2.5" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18c0 4.5-3 8-9 8s-9-3.5-9-8z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 10c0 3 2 5 5 5s5-2 5-5" />
                </svg>
              </div>
              <span className="font-heading text-[10px] tracking-[0.15em] uppercase font-semibold leading-normal whitespace-pre-wrap">Handmade<br/>In Small Batches</span>
            </div>

            {/* Item 2 */}
            <div className="flex flex-col items-center justify-start flex-shrink-0 w-[120px] sm:w-[140px] md:w-auto md:px-4 md:border-r border-white/10 last:border-none">
              {/* Leaf SVG */}
              <div className="w-10 h-10 mb-3.5 flex items-center justify-center text-white/95">
                <svg className="w-7 h-7 stroke-current" fill="none" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 0 0 9-9c0-5-4-9-9-9s-9 4-9 9a9 9 0 0 0 9 9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c1.5 4 4.5 7.5 9 9" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12c4.5-1.5 7.5-4.5 9-9" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21V12" />
                </svg>
              </div>
              <span className="font-heading text-[10px] tracking-[0.15em] uppercase font-semibold leading-normal whitespace-pre-wrap">100% Natural<br/>Ingredients</span>
            </div>

            {/* Item 3 */}
            <div className="flex flex-col items-center justify-start flex-shrink-0 w-[120px] sm:w-[140px] md:w-auto md:px-4 md:border-r border-white/10 last:border-none">
              {/* Cruet/Oil Bottle SVG */}
              <div className="w-10 h-10 mb-3.5 flex items-center justify-center text-white/95">
                <svg className="w-7 h-7 stroke-current" fill="none" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 8h4l1 3h-6zM9 11h6c1 0 2 1.5 2 3.5s-1 4.5-5 4.5s-5-2.5-5-4.5s1-3.5 2-3.5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v5M10 3h4" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 14c0 1.5.5 3 2 3" />
                </svg>
              </div>
              <span className="font-heading text-[10px] tracking-[0.15em] uppercase font-semibold leading-normal whitespace-pre-wrap">Cold Pressed<br/>Oils</span>
            </div>

            {/* Item 4 */}
            <div className="flex flex-col items-center justify-start flex-shrink-0 w-[120px] sm:w-[140px] md:w-auto md:px-4 md:border-r border-white/10 last:border-none">
              {/* Flask with slash SVG */}
              <div className="w-10 h-10 mb-3.5 flex items-center justify-center text-white/95">
                <svg className="w-7 h-7 stroke-current" fill="none" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6M10 3v6M14 3v6M6 21h12c1.5 0 2-1 1-2.5L15 11V9H9v2L5 18.5c-1 1.5-.5 2.5 1 2.5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                </svg>
              </div>
              <span className="font-heading text-[10px] tracking-[0.15em] uppercase font-semibold leading-normal whitespace-pre-wrap">Zero<br/>Preservatives</span>
            </div>

            {/* Item 5 */}
            <div className="flex flex-col items-center justify-start flex-shrink-0 w-[120px] sm:w-[140px] md:w-auto md:px-4 md:border-r border-white/10 last:border-none">
              {/* Heart/Hand SVG */}
              <div className="w-10 h-10 mb-3.5 flex items-center justify-center text-white/95">
                <svg className="w-7 h-7 stroke-current" fill="none" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12c.5 1.5 2 2.5 4 2.5s3.5-1 4-2.5" />
                </svg>
              </div>
              <span className="font-heading text-[10px] tracking-[0.15em] uppercase font-semibold leading-normal whitespace-pre-wrap">Made<br/>With Love</span>
            </div>

          </div>
        </div>

        {/* Traditional repeating pattern border at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-repeat-x opacity-35 bg-[radial-gradient(circle_at_center,var(--color-olive)_1px,transparent_1.5px)] bg-[size:8px_8px]" />
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

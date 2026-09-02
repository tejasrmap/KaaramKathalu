import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Flame, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, limit, onSnapshot, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import SEO from '../components/SEO';
import { useWishlist } from '../context/WishlistContext';
import { getProductStartingPrice } from '../utils/price';
import { formatRichText } from '../utils/richText';

interface ValueProposition {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

const DEFAULT_VALUE_PROPS: ValueProposition[] = [
  {
    id: '1',
    title: 'Farm-Fresh Flavors',
    description: 'We are dedicated to making products bursting with authentic, rich flavours. Our commitment to using fresh, natural ingredients from local farmers guarantees a truly delicious taste in every bite.',
    enabled: true
  },
  {
    id: '2',
    title: 'Quality You Can Taste',
    description: "We don't compromise on quality. Every bite reflects our commitment to using the finest ingredients. We source fresh seasonal offerings, ensuring peak flavor and support local farmers. We sample before we use ingredients.",
    enabled: true
  },
  {
    id: '3',
    title: 'Seasonal Availability',
    description: 'The journey of the fresh ingredients, from the farm directly into your product, highlights the connection to quality, traditional preservation and the authentic, seasonal taste without chemicals.',
    enabled: true
  },
  {
    id: '4',
    title: 'Traditional Stoneware Ground',
    description: 'Prepared using age-old stoneware methods to preserve authentic coastal Andhra textures, distinct crunch, and rich aromatic oils.',
    enabled: false
  },
  {
    id: '5',
    title: 'Zero Preservatives & Additives',
    description: '100% pure natural ingredients without artificial chemical preservatives, synthetic food colours, or artificial taste enhancers.',
    enabled: false
  }
];

interface Testimonial {
  id: string;
  author: string;
  location: string;
  product: string;
  quote: string;
  rating: number;
  enabled: boolean;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    author: 'Sunitha Reddy',
    location: 'Hyderabad',
    product: 'Avakaya Pickle',
    quote: "The Avakaya pickle transported me straight back to my grandmother's house in Rajahmundry. Perfect oil balance, crunch, and authentic spice heat!",
    rating: 5,
    enabled: true
  },
  {
    id: '2',
    author: 'Karthik Rao',
    location: 'Bengaluru',
    product: 'Pappula Podi Gun Powder',
    quote: "Hands down the best Karampodi and Pappula Podi I've ordered online. Pure homemade aroma with hot steaming rice and a dollop of ghee.",
    rating: 5,
    enabled: true
  },
  {
    id: '3',
    author: 'Venkatesh V.',
    location: 'Chennai',
    product: 'Boneless Chicken Pickle',
    quote: "Authentic Andhra boneless chicken pickle that doesn't compromise on freshness, tenderness, or quality. 10/10 flavor profile.",
    rating: 5,
    enabled: true
  },
  {
    id: '4',
    author: 'Ananya Sharma',
    location: 'Mumbai',
    product: 'Gongura Pickle',
    quote: "Incredible tangy Gongura taste! Brings true coastal Andhra flavors right to my dining table in Mumbai.",
    rating: 5,
    enabled: false
  },
  {
    id: '5',
    author: 'Rajesh Naidu',
    location: 'Vijayawada',
    product: 'Idli Karam Podi',
    quote: "Fresh roasted aroma, zero chemicals, pure traditional flavor. Our entire family loves it for morning breakfast.",
    rating: 5,
    enabled: false
  },
  {
    id: '6',
    author: 'Deepthi P.',
    location: 'Visakhapatnam',
    product: 'Tomato Pickle',
    quote: "The perfect homemade consistency and punchy garlic tadka. Reminds me of traditional summer vacations.",
    rating: 5,
    enabled: false
  },
  {
    id: '7',
    author: 'Sravan Kumar',
    location: 'Dallas (USA)',
    product: 'Boneless Mutton Pickle',
    quote: "Ordered from the US for my parents and they couldn't stop praising the authenticity. Perfectly cooked and packed.",
    rating: 5,
    enabled: false
  },
  {
    id: '8',
    author: 'Madhavi Latha',
    location: 'Guntur',
    product: 'Nalla Karam Podi',
    quote: "Authentic Guntur spice blend that is impossible to find elsewhere. Zero artificial preservatives makes it so healthy.",
    rating: 5,
    enabled: false
  },
  {
    id: '9',
    author: 'Rohit Varma',
    location: 'Pune',
    product: 'Prawns Pickle',
    quote: "Juicy prawns with balanced coastal masala. Arrived in leak-proof packaging and stayed ultra fresh.",
    rating: 5,
    enabled: false
  },
  {
    id: '10',
    author: 'Sai Teja',
    location: 'Hyderabad',
    product: 'Kandi Podi',
    quote: "Wholesome, comforting, and packed with traditional flavours. A permanent staple in our pantry.",
    rating: 5,
    enabled: false
  }
];

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
  const [valueProps, setValueProps] = useState<ValueProposition[]>(() => {
    try {
      const cached = localStorage.getItem('kk_value_props_cache');
      return cached ? JSON.parse(cached) : DEFAULT_VALUE_PROPS;
    } catch {
      return DEFAULT_VALUE_PROPS;
    }
  });
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    try {
      const cached = localStorage.getItem('kk_testimonials_cache');
      return cached ? JSON.parse(cached) : DEFAULT_TESTIMONIALS;
    } catch {
      return DEFAULT_TESTIMONIALS;
    }
  });
  const [currentReviewSlide, setCurrentReviewSlide] = useState(0);
  const [heroSettings, setHeroSettings] = useState(() => {
    try {
      const cached = localStorage.getItem('kk_hero_settings_cache');
      return cached ? JSON.parse(cached) : {
        heroTag: 'Handmade Traditions',
        heroTitle: 'Savour the Heritage.',
        heroTitleFontSize: 48,
        heroDescription: 'Handcrafted Andhra pickles, Gongura, Avakaya, and aromatic spice podis made with pure ingredients, cold-pressed oils, and zero preservatives. Every bite tells a story.',
        heroButtonText: 'Shop Pickles & Podis',
        heroBgImage1: '',
        heroBgImage2: '',
        heroBgImage3: '',
        heroMobileBgImage1: '',
        heroMobileBgImage2: '',
        heroMobileBgImage3: '',
        heroOverlayOpacity: '30',
        bestsellersTag: 'Curated Favorites',
        bestsellersTitle: 'Our Bestsellers',
        bestsellersDescription: 'Bold flavors. Time-honored recipes. Made with love, enjoyed by all.',
        testimonialsTag: 'Loved by Food Lovers',
        testimonialsTitle: 'What Our Customers Say',
        testimonialsDescription: 'Cherished words from homes across India celebrating authentic Andhra flavors.'
      };
    } catch {
      return {
        heroTag: 'Handmade Traditions',
        heroTitle: 'Savour the Heritage.',
        heroTitleFontSize: 48,
        heroDescription: 'Handcrafted Andhra pickles, Gongura, Avakaya, and aromatic spice podis made with pure ingredients, cold-pressed oils, and zero preservatives. Every bite tells a story.',
        heroButtonText: 'Shop Pickles & Podis',
        heroBgImage1: '',
        heroBgImage2: '',
        heroBgImage3: '',
        heroMobileBgImage1: '',
        heroMobileBgImage2: '',
        heroMobileBgImage3: '',
        heroOverlayOpacity: '30',
        bestsellersTag: 'Curated Favorites',
        bestsellersTitle: 'Our Bestsellers',
        bestsellersDescription: 'Bold flavors. Time-honored recipes. Made with love, enjoyed by all.',
        testimonialsTag: 'Loved by Food Lovers',
        testimonialsTitle: 'What Our Customers Say',
        testimonialsDescription: 'Cherished words from homes across India celebrating authentic Andhra flavors.'
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
          heroTitleFontSize: data.heroTitleFontSize ? Number(data.heroTitleFontSize) : 48,
          heroDescription: data.heroDescription || '',
          heroButtonText: data.heroButtonText || '',
          heroBgImage1: data.heroBgImage1 || '',
          heroBgImage2: data.heroBgImage2 || '',
          heroBgImage3: data.heroBgImage3 || '',
          heroMobileBgImage1: data.heroMobileBgImage1 || '',
          heroMobileBgImage2: data.heroMobileBgImage2 || '',
          heroMobileBgImage3: data.heroMobileBgImage3 || '',
          heroOverlayOpacity: data.heroOverlayOpacity || '30',
          bestsellersTag: data.bestsellersTag || 'Curated Favorites',
          bestsellersTitle: data.bestsellersTitle || 'Our Bestsellers',
          bestsellersDescription: data.bestsellersDescription || 'Bold flavors. Time-honored recipes. Made with love, enjoyed by all.',
          testimonialsTag: data.testimonialsTag || 'Loved by Food Lovers',
          testimonialsTitle: data.testimonialsTitle || 'What Our Customers Say',
          testimonialsDescription: data.testimonialsDescription || 'Cherished words from homes across India celebrating authentic Andhra flavors.'
        };
        setHeroSettings(newSettings);
        localStorage.setItem('kk_hero_settings_cache', JSON.stringify(newSettings));

        if (Array.isArray(data.valueProps) && data.valueProps.length > 0) {
          const merged = DEFAULT_VALUE_PROPS.map((defItem, idx) => {
            const existing = data.valueProps.find((p: any) => p.id === defItem.id || p.id === String(idx + 1)) || data.valueProps[idx];
            return existing ? { ...defItem, ...existing } : defItem;
          });
          setValueProps(merged);
          localStorage.setItem('kk_value_props_cache', JSON.stringify(merged));
        }

        if (Array.isArray(data.testimonials) && data.testimonials.length > 0) {
          const mergedT = DEFAULT_TESTIMONIALS.map((defItem, idx) => {
            const existing = data.testimonials.find((t: any) => t.id === defItem.id || t.id === String(idx + 1)) || data.testimonials[idx];
            return existing ? { ...defItem, ...existing } : defItem;
          });
          setTestimonials(mergedT);
          localStorage.setItem('kk_testimonials_cache', JSON.stringify(mergedT));
        }
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

  // Auto-cycle hero slides
  useEffect(() => {
    if (activeHeroImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroSlide(prev => (prev + 1) % activeHeroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeHeroImages.length]);

  // Auto-cycle review slides
  const activeTestimonials = testimonials.filter(t => t.enabled !== false);
  useEffect(() => {
    if (activeTestimonials.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentReviewSlide(prev => (prev + 1) % activeTestimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTestimonials.length]);

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
          <div className="max-w-xl flex flex-col items-start text-left md:max-w-md lg:max-w-lg mx-0">
            <span className="font-sans tracking-[0.2em] text-xs uppercase font-bold text-warm-accent mb-2">
              {heroSettings.heroTag || 'Handmade Traditions'}
            </span>
            <h1 
              className="font-serif leading-[1.15] text-warm-accent whitespace-pre-line mb-1 text-left"
              style={{
                fontSize: heroSettings.heroTitleFontSize 
                  ? `clamp(26px, 4.5vw, ${heroSettings.heroTitleFontSize}px)` 
                  : 'clamp(28px, 4.5vw, 48px)'
              }}
            >
              {heroSettings.heroTitle || 'Savour the Heritage.'}
            </h1>
            
            {/* Heritage Divider Line below heading */}
            <div className="heritage-divider text-warm-accent w-full max-w-[120px] !my-0.5 !mx-0 justify-start">✻</div>

            <p className="font-serif italic text-sm sm:text-base leading-relaxed text-warm-dark/80 whitespace-pre-line mt-1 mb-4 text-left">
              {heroSettings.heroDescription || 'Handcrafted Andhra pickles, Gongura, Avakaya, and aromatic spice podis made with pure ingredients, cold-pressed oils, and zero preservatives. Every bite tells a story.'}
            </p>
            <Link 
              to="/shop" 
              className="w-fit px-8 py-3 bg-warm-accent text-white hover:bg-warm-dark transition-all font-sans uppercase text-xs tracking-wider font-bold rounded shadow-md hover:shadow-lg active:scale-98"
            >
              {heroSettings.heroButtonText || 'Shop Pickles & Podis'}
            </Link>
          </div>
        </div>
      </section>

      {/* SVG FILTERS FOR AUTHENTIC TORN PAPER FIBERS */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="realPaperRipTop" x="-10%" y="-20%" width="120%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04 0.08" numOctaves="5" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G" result="torn" />
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.12" />
          </filter>
          <filter id="whitePaperPulpFiber" x="-10%" y="-20%" width="120%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.06 0.1" numOctaves="4" seed="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="16" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* HERITAGE GREEN PAPERCUT TORN PAPER TRUST BADGES STRIP */}
      <section className="relative w-full overflow-hidden select-none my-2 sm:my-3">
        {/* Realistic Multi-Layer Torn Paper Top Edge */}
        <div className="w-full overflow-hidden leading-none select-none pointer-events-none -mb-[1px] relative">
          {/* Layer 1: White/Cream Raw Paper Pulp & Fibers (exposed when paper is torn) */}
          <svg 
            viewBox="0 0 1440 45" 
            preserveAspectRatio="none" 
            className="w-full h-7 sm:h-9 md:h-12 text-[#f5efe4] fill-current block" 
            style={{ filter: 'url(#whitePaperPulpFiber)' }}
          >
            <path d="M0,45 L0,18 Q45,8 90,16 T180,14 T270,20 T360,12 T450,18 T540,14 T630,21 T720,13 T810,19 T900,14 T990,20 T1080,13 T1170,19 T1260,14 T1350,20 Q1395,16 1440,14 L1440,45 Z" />
          </svg>

          {/* Layer 2: Main Dark Green Paper Tear overlapping the white fiber pulp */}
          <svg 
            viewBox="0 0 1440 45" 
            preserveAspectRatio="none" 
            className="w-full h-7 sm:h-9 md:h-12 text-[#233d32] fill-current block relative -mt-6 sm:-mt-8 md:-mt-10 -mb-[1px]" 
            style={{ filter: 'url(#realPaperRipTop)' }}
          >
            <path d="M0,45 L0,22 Q45,15 90,24 T180,18 T270,25 T360,19 T450,26 T540,18 T630,26 T720,19 T810,25 T900,19 T990,26 T1080,18 T1170,25 T1260,19 T1350,25 Q1395,20 1440,21 L1440,45 Z" />
          </svg>
        </div>

        {/* Main Green Patch Body */}
        <div className="bg-[#233d32] text-[#fbf8f2] py-4 sm:py-6 md:py-8 px-2 sm:px-4 md:px-8 relative w-full shadow-inner">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-5 divide-x divide-white/15 items-center">
              {/* 1. HANDMADE IN SMALL BATCHES */}
              <div className="flex flex-col items-center justify-start text-center px-1 sm:px-2 md:px-4">
                <div className="mb-2 sm:mb-3 flex items-center justify-center h-8 sm:h-10 md:h-11">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 text-warm-bg/95" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 19 C7 28 13 33 20 33 C27 33 33 28 33 19 Z" />
                    <line x1="5" y1="19" x2="35" y2="19" strokeWidth="1.8" />
                    <path d="M14 19 C14 13 17 9 24 6" />
                    <path d="M19 12 C21 9 25 7 28 8" />
                    <circle cx="16" cy="14" r="1.2" fill="currentColor" />
                    <circle cx="22" cy="15" r="1.2" fill="currentColor" />
                    <circle cx="28" cy="13" r="1.2" fill="currentColor" />
                    <line x1="12" y1="36" x2="28" y2="36" strokeWidth="1.8" />
                  </svg>
                </div>
                <p className="font-heading text-[7.5px] xs:text-[9px] sm:text-xs md:text-sm font-bold uppercase tracking-wider text-warm-bg/95 leading-tight">
                  Handmade <br className="hidden sm:inline" />in Small <br className="hidden sm:inline" />Batches
                </p>
              </div>

              {/* 2. 100% NATURAL INGREDIENTS */}
              <div className="flex flex-col items-center justify-start text-center px-1 sm:px-2 md:px-4">
                <div className="mb-2 sm:mb-3 flex items-center justify-center h-8 sm:h-10 md:h-11">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 text-warm-bg/95" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 32 C10 32 9 20 20 13 C29 8 34 6 34 6 C34 6 32 15 25 22 C17 30 10 32 10 32 Z" />
                    <path d="M10 32 C15 25 22 18 31 9" />
                    <path d="M12 23 C12 23 7 16 12 10 C17 5 22 6 22 6 C22 6 20 13 15 18 Z" />
                    <path d="M12 16 C15 13 18 10 22 6" />
                  </svg>
                </div>
                <p className="font-heading text-[7.5px] xs:text-[9px] sm:text-xs md:text-sm font-bold uppercase tracking-wider text-warm-bg/95 leading-tight">
                  100% <br className="hidden sm:inline" />Natural <br className="hidden sm:inline" />Ingredients
                </p>
              </div>

              {/* 3. COLD PRESSED OILS */}
              <div className="flex flex-col items-center justify-start text-center px-1 sm:px-2 md:px-4">
                <div className="mb-2 sm:mb-3 flex items-center justify-center h-8 sm:h-10 md:h-11">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 text-warm-bg/95" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 7 L23 7 L23 12 L28 18 C30 21 31 24 31 28 C31 33 26.5 36 20 36 C13.5 36 9 33 9 28 C9 24 10 21 12 18 L17 12 Z" />
                    <line x1="15" y1="5" x2="25" y2="5" strokeWidth="1.8" />
                    <line x1="17" y1="12" x2="23" y2="12" strokeWidth="1.4" />
                    <circle cx="20" cy="27" r="3" strokeWidth="1.4" />
                    <path d="M20 22 C20 22 18 25 18 27 C18 28.1 18.9 29 20 29 C21.1 29 22 28.1 22 27 C22 25 20 22 20 22 Z" fill="currentColor" stroke="none" />
                  </svg>
                </div>
                <p className="font-heading text-[7.5px] xs:text-[9px] sm:text-xs md:text-sm font-bold uppercase tracking-wider text-warm-bg/95 leading-tight">
                  Cold Pressed <br className="hidden sm:inline" />Oils
                </p>
              </div>

              {/* 4. ZERO PRESERVATIVES */}
              <div className="flex flex-col items-center justify-start text-center px-1 sm:px-2 md:px-4">
                <div className="mb-2 sm:mb-3 flex items-center justify-center h-8 sm:h-10 md:h-11">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 text-warm-bg/95" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="20" cy="20" r="15" strokeWidth="1.7" />
                    <line x1="9" y1="9" x2="31" y2="31" strokeWidth="1.7" />
                    <path d="M17 13 L23 13" strokeWidth="1.5" />
                    <path d="M18 13 L18 17 L13 26 C12 28 13.5 29.5 15.5 29.5 L24.5 29.5 C26.5 29.5 28 28 27 26 L22 17 L22 13" strokeWidth="1.5" />
                  </svg>
                </div>
                <p className="font-heading text-[7.5px] xs:text-[9px] sm:text-xs md:text-sm font-bold uppercase tracking-wider text-warm-bg/95 leading-tight">
                  Zero <br className="hidden sm:inline" />Preservatives
                </p>
              </div>

              {/* 5. MADE WITH LOVE */}
              <div className="flex flex-col items-center justify-start text-center px-1 sm:px-2 md:px-4">
                <div className="mb-2 sm:mb-3 flex items-center justify-center h-8 sm:h-10 md:h-11">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 text-warm-bg/95" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 13 C18.5 10.5 15 8.5 12.5 10.5 C9.5 13 9.5 17.5 13 21 L20 27.5 L27 21 C30.5 17.5 30.5 13 27.5 10.5 C25 8.5 21.5 10.5 20 13 Z" strokeWidth="1.7" />
                    <path d="M6 26 C9.5 24.5 13 25.5 16 29 L20 32.5 C21 33.5 22.5 33.5 23.5 32.5 L32 25.5 C33.5 24 36 25 37 26.5 C38 28.5 37 31 34.5 32.5 L27 37 C23.5 39 18.5 39 15 36.5 L6 30 C4.5 28.5 4.5 27 6 26 Z" strokeWidth="1.6" />
                  </svg>
                </div>
                <p className="font-heading text-[7.5px] xs:text-[9px] sm:text-xs md:text-sm font-bold uppercase tracking-wider text-warm-bg/95 leading-tight">
                  Made With <br className="hidden sm:inline" />Love
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Traditional Heritage Border Motif */}
        <div className="w-full h-3 sm:h-4 bg-[#1b3127] flex items-center justify-center overflow-hidden border-t border-white/10 opacity-75">
          <svg className="w-full h-full text-warm-accent/40" preserveAspectRatio="repeat" viewBox="0 0 80 12" fill="currentColor">
            <pattern id="heritageBorderStrip" x="0" y="0" width="20" height="12" patternUnits="userSpaceOnUse">
              <path d="M10 1 L19 6 L10 11 L1 6 Z" fill="none" stroke="currentColor" strokeWidth="0.75" />
              <circle cx="10" cy="6" r="1.5" />
              <circle cx="0" cy="6" r="0.8" />
              <circle cx="20" cy="6" r="0.8" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#heritageBorderStrip)" />
          </svg>
        </div>
      </section>

      {/* BESTSELLERS SECTION */}
      <section className="pt-10 pb-6 md:pt-14 md:pb-8 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-8 max-w-2xl mx-auto flex flex-col items-center">
          <span className="font-sans text-warm-accent text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2">
            <span>🌿</span> {heroSettings.bestsellersTag || 'Curated Favorites'} <span>🌿</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif text-warm-accent mt-2 mb-0.5">
            {heroSettings.bestsellersTitle || 'Our Bestsellers'}
          </h2>
          <div className="heritage-divider text-warm-accent w-full max-w-[160px] !my-0.5">✻</div>
          <p className="font-serif italic text-warm-dark/70 text-sm md:text-base max-w-lg leading-relaxed mt-1">
            {heroSettings.bestsellersDescription || 'Bold flavors. Time-honored recipes. Made with love, enjoyed by all.'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8">
          {isLoading ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="h-[340px] bg-warm-dark/5 animate-pulse rounded-lg border border-warm-dark/10"></div>
            ))
          ) : bestsellers.map((product) => (
            <Link 
              key={product.docId}
              to={`/product/${product.id}`}
              className="group flex flex-col justify-between h-full items-center transition-transform duration-300 hover:-translate-y-1 text-center"
            >
              <div className="w-full flex flex-col items-center">
                <div className="relative aspect-square w-full overflow-hidden bg-transparent mb-3">
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
                
                <h3 className="font-serif text-sm sm:text-base text-warm-dark group-hover:text-warm-accent transition-colors leading-snug mb-3 min-h-[2.75rem] sm:min-h-[3.25rem] flex items-center justify-center font-medium px-1">
                  {product.name}
                </h3>
              </div>

              <div className="w-full flex justify-center mt-auto pb-1">
                <div className="w-full max-w-[120px] py-1.5 border border-warm-accent/80 text-warm-accent font-sans text-[10px] tracking-widest uppercase transition-all duration-300 group-hover:bg-warm-accent group-hover:text-white rounded font-bold">
                  Shop Now
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Flower divider after Bestsellers */}
      <div className="heritage-divider text-warm-accent w-full max-w-[160px] mx-auto !my-8 md:!my-12">✻</div>

      {/* VALUE PROPOSITIONS */}
      {(() => {
        const activeProps = valueProps.filter(p => p.enabled !== false);
        if (activeProps.length === 0) return null;

        const firstThree = activeProps.slice(0, 3);
        const remaining = activeProps.slice(3);

        return (
          <>
            <section className="pt-2 pb-8 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto space-y-8 md:space-y-12">
              {/* First Row (Up to 3 items) */}
              <div className={`grid gap-8 md:gap-12 ${
                firstThree.length === 1 ? 'grid-cols-1 max-w-xl mx-auto' :
                firstThree.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' :
                'grid-cols-1 md:grid-cols-3'
              }`}>
                {firstThree.map((prop) => (
                  <div key={prop.id} className="flex flex-col items-center text-center px-4">
                    <h3 className="font-heading text-lg sm:text-xl font-bold uppercase tracking-wider text-warm-accent mb-3">
                      {formatRichText(prop.title)}
                    </h3>
                    <p className="font-serif italic text-warm-dark/70 text-sm md:text-base leading-relaxed whitespace-pre-line">
                      {formatRichText(prop.description)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Second Row (4th & 5th items placed below the first 3) */}
              {remaining.length > 0 && (
                <div className={`grid gap-8 md:gap-12 pt-2 md:pt-4 ${
                  remaining.length === 1 
                    ? 'grid-cols-1 max-w-xl mx-auto' 
                    : 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto'
                }`}>
                  {remaining.map((prop) => (
                    <div key={prop.id} className="flex flex-col items-center text-center px-4">
                      <h3 className="font-heading text-lg sm:text-xl font-bold uppercase tracking-wider text-warm-accent mb-3">
                        {formatRichText(prop.title)}
                      </h3>
                      <p className="font-serif italic text-warm-dark/70 text-sm md:text-base leading-relaxed whitespace-pre-line">
                        {formatRichText(prop.description)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Heritage Flower Divider after Value Propositions Section */}
            <div className="heritage-divider text-warm-accent w-full max-w-[160px] mx-auto !my-8 md:!my-12">✻</div>
          </>
        );
      })()}

      {/* TESTIMONIALS SECTION - SLIDESHOW */}
      {(() => {
        if (activeTestimonials.length === 0) return null;

        const safeSlide = currentReviewSlide % activeTestimonials.length;
        const current = activeTestimonials[safeSlide];

        return (
          <>
            <section className="pt-2 pb-12 md:pt-4 md:pb-16 px-4 sm:px-6 md:px-12 max-w-5xl mx-auto">
              <div className="text-center mb-8 max-w-2xl mx-auto flex flex-col items-center">
                <span className="font-sans text-warm-accent text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                  <span>⭐️</span> {heroSettings.testimonialsTag || 'Loved by Food Lovers'} <span>⭐️</span>
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif text-warm-accent mt-2 mb-0.5">
                  {formatRichText(heroSettings.testimonialsTitle || 'What Our Customers Say')}
                </h2>
                <div className="heritage-divider text-warm-accent w-full max-w-[160px] !my-0.5">✻</div>
                <p className="font-serif italic text-warm-dark/70 text-sm md:text-base max-w-lg leading-relaxed mt-1">
                  {formatRichText(heroSettings.testimonialsDescription || 'Cherished words from homes across India celebrating authentic Andhra flavors.')}
                </p>
              </div>

              {/* Slideshow Container */}
              <div className="relative min-h-[220px] sm:min-h-[190px] flex items-center justify-center px-8 sm:px-14">
                {/* Previous Button */}
                {activeTestimonials.length > 1 && (
                  <button
                    onClick={() => setCurrentReviewSlide(prev => (prev - 1 + activeTestimonials.length) % activeTestimonials.length)}
                    className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-warm-light/80 hover:bg-warm-accent hover:text-white text-warm-dark/70 transition-all flex items-center justify-center border border-warm-dark/10 cursor-pointer shadow-sm hover:shadow active:scale-90 z-10"
                    aria-label="Previous Review"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

                {/* Animated Review Slide */}
                <div className="w-full max-w-3xl mx-auto overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={current.id || safeSlide}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.45, ease: 'easeInOut' }}
                      className="flex flex-col items-center text-center space-y-4"
                    >
                      {/* Rating Stars */}
                      <div className="flex items-center justify-center gap-1 text-amber-500">
                        {[...Array(current.rating || 5)].map((_, i) => (
                          <span key={i} className="text-lg">★</span>
                        ))}
                      </div>

                      {/* Review Quote */}
                      <p className="font-serif italic text-warm-dark/85 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
                        "{formatRichText(current.quote)}"
                      </p>

                      {/* Author and Location */}
                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                        <span className="font-serif font-bold text-warm-dark text-base sm:text-lg">
                          {current.author}
                        </span>
                        {current.location && (
                          <>
                            <span className="hidden sm:inline text-warm-dark/30">•</span>
                            <span className="text-xs font-sans uppercase tracking-widest text-warm-dark/50">
                              {current.location}
                            </span>
                          </>
                        )}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Next Button */}
                {activeTestimonials.length > 1 && (
                  <button
                    onClick={() => setCurrentReviewSlide(prev => (prev + 1) % activeTestimonials.length)}
                    className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-warm-light/80 hover:bg-warm-accent hover:text-white text-warm-dark/70 transition-all flex items-center justify-center border border-warm-dark/10 cursor-pointer shadow-sm hover:shadow active:scale-90 z-10"
                    aria-label="Next Review"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Indicator Dots */}
              {activeTestimonials.length > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  {activeTestimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentReviewSlide(idx)}
                      className={`transition-all duration-300 rounded-full cursor-pointer ${
                        idx === safeSlide
                          ? 'w-6 h-2 bg-warm-accent'
                          : 'w-2 h-2 bg-warm-dark/20 hover:bg-warm-dark/40'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Heritage Flower Divider after Testimonials Section */}
            <div className="heritage-divider text-warm-accent w-full max-w-[160px] mx-auto !mt-2 !mb-14">✻</div>
          </>
        );
      })()}
    </div>
  );
}

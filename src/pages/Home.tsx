import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Flame, ChevronDown, Award, ShieldCheck, BadgeAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import SEO from '../components/SEO';

export default function Home() {
  const [bestsellers, setBestsellers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'products'), limit(4));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
      setBestsellers(products);
      setIsLoading(false);
    }, (error) => {
      console.error("Firestore read error:", error);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const circularCategories = [
    {
      name: 'Pickles',
      image: 'https://themanduvaproject.in/cdn/shop/files/jar_3387912.png?v=1776152279&width=100',
      link: "/pickles"
    },
    {
      name: 'Podi & Sprinkles',
      image: 'https://themanduvaproject.in/cdn/shop/files/party_6700769.png?v=1776152279&width=100',
      link: "/podi-sprinkles"
    }
  ];



  return (
    <>
      <SEO />

      {/* HERO BANNER SECTION */}
      <section className="relative w-full overflow-hidden bg-warm-light py-20 md:py-32 border-b border-warm-dark/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 md:px-24 flex items-center min-h-[30vh] sm:min-h-[40vh]">
          <div className="max-w-2xl flex flex-col gap-5">
            <span className="font-heading tracking-[0.2em] text-xs md:text-sm uppercase font-bold text-warm-accent">Handmade Heritage</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif leading-tight text-warm-dark">Fresh Traditions, <br/>Bold Flavors.</h1>
            <p className="font-serif italic text-sm md:text-base text-warm-dark/80 leading-relaxed max-w-md">
              We preserve the culinary marvels of ancestral homes, handcrafting zero-preservative Andhra pachadis, spice mixes, and crunchy savouries.
            </p>
            <Link 
              to="/shop" 
              className="w-fit bg-warm-accent text-white px-8 py-3.5 rounded-lg font-heading uppercase text-xs sm:text-sm tracking-wider hover:bg-warm-dark transition-all mt-2 shadow-[4px_4px_0px_var(--color-warm-dark)]"
            >
              Shop Authentic Jars
            </Link>
          </div>
        </div>
      </section>

      {/* CIRCULAR CATEGORIES */}
      <section className="py-12 md:py-16 px-4 bg-white border-b border-warm-dark/5">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-around items-center gap-6 md:gap-10">
          {circularCategories.map((cat, idx) => (
            <Link 
              key={idx} 
              to={cat.link}
              className="flex flex-col items-center gap-3 group transition-transform hover:scale-105"
            >
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border border-warm-dark/10 p-2 bg-warm-light flex items-center justify-center shadow-sm overflow-hidden group-hover:border-warm-accent transition-colors">
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                />
              </div>
              <span className="font-heading text-sm sm:text-base tracking-wider uppercase font-bold text-warm-dark group-hover:text-warm-accent transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* BESTSELLERS SECTION */}
      <section className="py-20 md:py-28 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="font-heading text-warm-accent text-xs font-bold tracking-[0.2em] uppercase">Curated Favorites</span>
          <h2 className="text-3xl sm:text-5xl font-heading font-bold text-warm-dark mt-2 mb-4 uppercase">Our Bestsellers</h2>
          <div className="w-16 h-0.5 bg-warm-accent mx-auto mb-6"></div>
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
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-warm-dark text-white text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">
                  Bestseller
                </div>
                <div className="absolute bottom-3 right-3 z-20 w-8 h-8 rounded-full bg-warm-accent text-white flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110">
                  <span className="text-lg font-bold font-sans">+</span>
                </div>
              </div>
              
              <div className="pt-2 flex flex-col text-left">
                <span className="text-[9px] uppercase font-bold tracking-[0.15em] text-warm-accent mb-1">Traditional Recipe</span>
                <h3 className="font-heading font-bold text-sm sm:text-base text-warm-dark group-hover:text-warm-accent transition-colors leading-tight mb-1">{product.name}</h3>
                <span className="font-serif text-sm text-warm-dark/60">From ₹{product.price}.00</span>
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


    </>
  );
}

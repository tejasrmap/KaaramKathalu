import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Flame, ChevronDown, Award, ShieldCheck, BadgeAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import SEO from '../components/SEO';
import { PRODUCTS } from '../data/products';

export default function Home() {
  const [bestsellers, setBestsellers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'products'), limit(3));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let products = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
      // Fallback
      if (products.length === 0) {
        products = PRODUCTS.slice(0, 3).map(p => ({
          docId: `static_${p.id}`,
          ...p
        }));
      }
      setBestsellers(products);
      setIsLoading(false);
    }, (error) => {
      console.error("Firestore read error, using local fallback products:", error);
      const products = PRODUCTS.slice(0, 3).map(p => ({
        docId: `static_${p.id}`,
        ...p
      }));
      setBestsellers(products);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const circularCategories = [
    {
      name: 'Pickles',
      image: 'https://themanduvaproject.in/cdn/shop/files/jar_3387912.png?v=1776152279&width=100',
      link: '/shop?category=pickle'
    },
    {
      name: 'Podi & Sprinkles',
      image: 'https://themanduvaproject.in/cdn/shop/files/party_6700769.png?v=1776152279&width=100',
      link: '/shop?category=podi'
    },
    {
      name: 'Fryums & Crisps',
      image: 'https://themanduvaproject.in/cdn/shop/files/jar_3387912.png?v=1776152279&width=100',
      link: '/shop?category=fryums'
    },
    {
      name: 'Snacks',
      image: 'https://themanduvaproject.in/cdn/shop/files/snacks_17016572.png?v=1776152278&width=100',
      link: '/shop?category=snacks'
    }
  ];

  const snacksHighlights = PRODUCTS.filter(p => p.type === 'snacks').slice(0, 4);

  const testimonials = [
    {
      quote: "The best mango pickle EVER!!! Manduva’s avakaya mango hot and spicy pickle is the best pickle I have come across recently. We south Indians truly appreciate the whole garlic, chunky mango spices and the awesome kick from the Guntur chilies.",
      author: "Parinitha Prathap"
    },
    {
      quote: "Greetings Manduva team! Your pickle taste is very good... like amma cheti pickles (mother's hand-made). I am also from Andhra and my mother makes the same style pickle. I like your products very much... your craft is great!",
      author: "Ratna Rao"
    },
    {
      quote: "I’m a huge huge fan, especially of the mint chili podi! I recommend it to everyone. Cheers and thanks for bringing such an amazing brand to life.",
      author: "Anubhutie Singh"
    }
  ];

  const faqs = [
    {
      q: "Are your pickles handmade?",
      a: "Yes! All our pickles are handcrafted in small batches in rural Andhra villages by local women. We use traditional family heirloom recipes, sun-dry our ingredients, and hand-mix with pure cold-pressed oils."
    },
    {
      q: "Do your products contain preservatives or chemicals?",
      a: "Absolutely not. All products at The Manduva Project are completely free of artificial preservatives, vinegar, acidity regulators, chemical colors, or MSG. We preserve using traditional natural agents like sea salt, turmeric, lemon juice, and pure oils."
    },
    {
      q: "What is the difference between a podi and a sprinkle?",
      a: "Podis are traditional spice powders cooked down with roasted lentils and typically hand-mixed with hot rice and ghee. Sprinkles are finer seasoning blends specifically crafted to be dusted as a garnish on breakfast tiffins (idli, dosa), snacks, or curries."
    },
    {
      q: "How should I store the pickles?",
      a: "Store the pickle jar in a cool, dry place away from direct sunlight. Always use a clean, completely dry spoon to scoop the pickle. Ensure there is a thin layer of oil on top of the pickle to maintain freshness."
    },
    {
      q: "How long do the pickles stay fresh?",
      a: "Since our products are preservative-free and natural, our pickles stay completely fresh for up to 9-12 months when stored properly. Our podis and sprinkles maintain their aromatic flavors for up to 6 months."
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
              <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border border-warm-dark/10 p-2 bg-[#eaeada] flex items-center justify-center shadow-sm overflow-hidden group-hover:border-warm-accent transition-colors">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-[400px] bg-warm-dark/5 animate-pulse rounded-lg border border-warm-dark/10"></div>
            ))
          ) : bestsellers.map((product) => (
            <div 
              key={product.docId}
              className="bg-[#eaeada]/40 border border-warm-dark/10 p-4 rounded-xl flex flex-col group hover:shadow-lg transition-all"
            >
              <Link to={`/product/${product.id}`} className="block relative aspect-square bg-white border border-warm-dark/5 rounded-lg overflow-hidden p-2 mb-4">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 bg-white px-3 py-1 font-heading text-xs font-bold uppercase tracking-wider text-warm-dark rounded border border-warm-dark/5">
                  ₹{product.price}
                </div>
                <div className="absolute top-4 right-4 flex gap-0.5">
                  {[...Array(product.spiciness)].map((_, i) => (
                    <Flame key={i} className="w-4 h-4 text-warm-accent fill-warm-accent" />
                  ))}
                </div>
              </Link>
              
              <Link to={`/product/${product.id}`} className="flex-1 flex flex-col">
                <h3 className="font-heading font-bold text-xl text-warm-dark mb-2 group-hover:text-warm-accent transition-colors leading-tight">{product.name}</h3>
                <p className="text-warm-dark/70 font-serif italic text-sm line-clamp-2 mb-4">{product.description}</p>
                <div className="mt-auto pt-4 border-t border-warm-dark/5 flex justify-between items-center text-xs font-heading font-bold uppercase tracking-wider text-warm-dark">
                  <span>Experience Heritage</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-all text-warm-accent" />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* SNACKS SECTION */}
      <section className="py-20 md:py-24 bg-[#eaeada]/30 border-t border-b border-warm-dark/5 px-4 sm:px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <span className="font-heading text-warm-accent text-xs font-bold tracking-[0.2em] uppercase">Crispy Evening Bites</span>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-warm-dark mt-2 uppercase">Our Freshly Launched Snacks Await!</h2>
            </div>
            <Link 
              to="/shop?category=snacks" 
              className="px-6 py-2.5 bg-white border border-warm-dark/20 hover:border-warm-dark text-warm-dark font-heading uppercase tracking-wider text-xs rounded transition-colors"
            >
              View All Snacks
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {snacksHighlights.map((product) => (
              <Link 
                key={product.id} 
                to={`/product/${product.id}`}
                className="bg-white border border-warm-dark/10 p-3 rounded-xl flex flex-col group hover:shadow-md transition-all"
              >
                <div className="relative aspect-square bg-[#eaeada]/20 rounded-lg overflow-hidden p-2 mb-3">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 left-2 bg-warm-dark text-white px-2 py-0.5 text-[10px] font-bold rounded">
                    ₹{product.price}
                  </div>
                </div>
                <h3 className="font-heading font-bold text-base text-warm-dark leading-tight group-hover:text-warm-accent transition-colors truncate">{product.name}</h3>
                <span className="text-[10px] text-warm-dark/40 font-heading uppercase tracking-wider mt-1">{product.type}</span>
              </Link>
            ))}
          </div>
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

      {/* TESTIMONIALS */}
      <section className="py-20 md:py-28 bg-[#eaeada]/40 px-4 sm:px-6 md:px-12 border-t border-b border-warm-dark/5">
        <div className="max-w-4xl mx-auto text-center">
          <span className="font-heading text-warm-accent text-xs font-bold tracking-[0.2em] uppercase">Love from Homes</span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-warm-dark mt-2 mb-16 uppercase">Let Our Customer Speak for Us</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-white border border-warm-dark/10 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                <p className="font-serif italic text-warm-dark/80 text-sm leading-relaxed mb-6">
                  "{t.quote}"
                </p>
                <div className="pt-4 border-t border-warm-dark/5 font-heading text-xs font-bold uppercase tracking-wider text-warm-accent">
                  - {t.author}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRESS SHOWCASE */}
      <section className="py-16 bg-white px-4 border-b border-warm-dark/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-sm font-bold tracking-[0.3em] uppercase text-warm-dark/40 mb-8">We're Showcased In & Available At</h2>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 hover:opacity-80 transition-opacity">
            <a href="https://www.asianage.com/life/food/140222/flavours-of-south-india.html" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
              <span className="font-serif font-semibold text-lg tracking-widest text-warm-dark uppercase border border-warm-dark/25 px-3 py-1">THE ASIAN AGE</span>
            </a>
            <a href="https://www.qmart.in/" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
              <span className="font-heading font-black text-2xl tracking-tighter text-warm-dark flex items-baseline">QMART<span className="w-1.5 h-1.5 bg-warm-accent rounded-full ml-0.5"></span></span>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 md:py-28 px-4 sm:px-6 md:px-12 max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="font-heading text-warm-accent text-xs font-bold tracking-[0.2em] uppercase">Pantry Queries</span>
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
    </>
  );
}

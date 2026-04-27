import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PRODUCTS } from '../data/products';
import SEO from '../components/SEO';

export default function Home() {
  const featured = PRODUCTS.slice(0, 3);

  const galleryImages = [
    "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=80",
    "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600&q=80",
    "https://images.unsplash.com/photo-1626388416805-40b991ea4518?w=600&q=80",
    "https://images.unsplash.com/photo-1589923158776-cb4485d99fd6?w=600&q=80"
  ];

  return (
    <>
      <SEO />
      {/* HERO SECTION */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-20 px-4 sm:px-6 md:px-12 w-full max-w-[100vw] overflow-x-hidden md:max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 lg:gap-24 min-h-[90vh]">
        <div className="flex-1 flex flex-col gap-4 md:gap-8 z-10 w-full lg:max-w-none">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="p-6 md:p-8 border-2 border-warm-dark bg-white shadow-[4px_4px_0px_#3A2A22] md:shadow-[8px_8px_0px_#3A2A22] relative w-full"
          >
            <div className="absolute -top-3 -left-3 w-6 h-6 border-b border-r border-warm-dark bg-warm-bg transform -rotate-45 hidden md:block"></div>
            <p className="uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-xs font-bold text-warm-dark/60 mb-4 md:mb-6 border-b-2 border-dashed border-warm-dark/20 pb-3 md:pb-4 inline-block">Authentic Homemade Recipes</p>
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-serif leading-[1] md:leading-[0.9] text-warm-dark mb-4 md:mb-6 break-words">
              Taste the <br className="hidden md:block" />
              <span className="italic text-warm-accent">Tradition.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-warm-dark/80 max-w-md font-serif leading-relaxed pr-2 md:pr-0">
              We bring back the nostalgic flavors of grandmother's kitchen. Handcrafted pickles and podis made with love, patience, and the purest ingredients.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex gap-4 md:ml-4"
          >
            <Link 
              to="/shop" 
              className="bg-[#F4EBE1] text-warm-dark border-2 border-warm-dark px-6 py-3 font-bold tracking-widest uppercase text-[10px] md:text-xs md:px-8 md:py-4 hover:bg-warm-dark hover:text-[#F4EBE1] transition-all flex items-center gap-2 shadow-[2px_2px_0px_#3A2A22] md:shadow-[4px_4px_0px_#3A2A22] hover:translate-y-1 hover:shadow-none"
            >
              Explore Shop <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </Link>
          </motion.div>
        </div>

        <div className="flex-1 w-full relative max-w-[90vw] lg:max-w-none mx-auto min-h-[300px] mb-8 md:mb-0 ml-2 md:ml-0 mr-4 md:mr-0 pl-2 lg:pl-0 pr-6 md:pr-0">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative p-3 md:p-6 bg-white border-2 border-warm-dark shadow-[6px_6px_0px_#3A2A22] md:shadow-[12px_12px_0px_#3A2A22] transform rotate-1 md:rotate-2 w-full max-w-[500px] mx-auto lg:ml-auto"
          >
            {/* "Tape" at top */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-white/60 backdrop-blur-sm border border-warm-dark/20 transform -rotate-3 z-30 opacity-70"></div>
            
            <img 
              src="https://images.unsplash.com/photo-1543362906-acfc16c67564?w=800&q=80" 
              alt="Traditional Pickles" 
              className="w-full aspect-[4/5] object-cover border-2 border-warm-dark grayscale-[10%] contrast-125 sepia-[20%] relative z-10"
              referrerPolicy="no-referrer"
            />
            
            <motion.div 
              animate={{ rotate: [-6, -2, -6] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute -bottom-8 -left-8 bg-warm-accent text-white p-6 z-20 w-36 h-36 flex flex-col items-center justify-center border-4 border-warm-bg rounded-full shadow-xl transform -rotate-6"
            >
              <div className="w-full h-full border-2 border-dashed border-white/50 rounded-full flex flex-col items-center justify-center">
                <span className="font-serif text-4xl font-bold text-white">100%</span>
                <span className="text-[10px] uppercase tracking-widest font-bold text-white/90 text-center">Natural<br/>Ingredients</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FEATURED SECTION */}
      <div className="w-full border-t-4 border-dashed border-warm-dark/20 my-12"></div>
      
      <section className="py-24 px-6 md:px-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16 px-4">
            <div className="p-6 bg-white border-2 border-warm-dark shadow-[6px_6px_0px_#3A2A22] relative inline-block">
              <div className="absolute -top-2 left-4 w-4 h-4 rounded-full border-2 border-warm-dark bg-warm-bg"></div>
              <div className="absolute -top-2 right-4 w-4 h-4 rounded-full border-2 border-warm-dark bg-warm-bg"></div>
              <h2 className="text-4xl md:text-5xl font-serif text-warm-dark mb-2">Our Favorites</h2>
              <p className="text-warm-dark/60 max-w-md font-serif italic text-lg border-t border-warm-dark/10 pt-2">Our best-selling recipes, crafted with carefully sourced ingredients.</p>
            </div>
            
            <Link to="/shop" className="px-8 py-3 bg-[#F4EBE1] border-2 border-warm-dark text-warm-dark font-bold tracking-widest hover:bg-warm-dark hover:text-white transition-all uppercase text-xs shadow-[4px_4px_0px_#3A2A22] hover:translate-y-1 hover:shadow-[2px_2px_0px_#3A2A22]">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {featured.map((product, idx) => (
              <Link to={`/product/${product.id}`} key={product.id} className="group relative">
                <div className="absolute inset-0 bg-warm-dark transform translate-x-2 translate-y-2 opacity-10"></div>
                <div className={`bg-white border-2 border-warm-dark p-3 flex flex-col h-full relative z-10 transition-transform duration-300 group-hover:-translate-y-2 group-hover:-translate-x-1 ${idx % 2 === 0 ? 'transform rotate-1' : 'transform -rotate-1'}`}>
                  <div className="relative aspect-[4/3] border-2 border-dashed border-warm-dark/30 mb-4 bg-warm-bg">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover grayscale-[10%] contrast-110 sepia-[10%] transition-all duration-700 group-hover:grayscale-0 group-hover:sepia-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 bg-warm-bg border-2 border-warm-dark px-2 py-1 text-[10px] uppercase font-bold tracking-widest text-warm-dark shadow-[2px_2px_0px_#3A2A22]">
                      {product.type}
                    </div>
                  </div>
                  
                  <div className="p-4 flex-1 flex flex-col items-center text-center border-2 border-warm-dark bg-[#F4EBE1]">
                    <h3 className="font-serif text-2xl font-bold text-warm-dark mb-2">{product.name}</h3>
                    <span className="font-bold text-md tracking-widest text-warm-accent mb-4 block border-b border-warm-dark/20 pb-2 w-full">₹{product.price}</span>
                    <p className="text-warm-dark/70 text-sm font-serif italic">{product.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* INSTAGRAM / GALLERY SECTION */}
      <div className="w-full border-t-4 border-dashed border-warm-dark/20 my-12"></div>
      
      <section className="py-24 px-6 md:px-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-16 w-full max-w-[95vw] mx-auto">
            <div className="border-4 border-warm-dark p-4 md:p-6 rounded-full bg-white mb-6 shadow-[4px_4px_0px_#3A2A22] transform rotate-3">
              <Instagram className="w-8 h-8 md:w-12 md:h-12 text-warm-accent" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-warm-dark mb-4 bg-white px-4 py-2 border-2 border-warm-dark shadow-[4px_4px_0px_#3A2A22] transform -rotate-1">Follow the Flavour</h2>
            <p className="text-warm-dark/70 max-w-md font-serif italic text-lg md:text-xl mt-6 px-4 border-l-4 border-warm-accent">
              Join us on Instagram <a href="https://www.instagram.com/kaaram.kathalu/" target="_blank" rel="noopener noreferrer" className="text-warm-accent font-bold not-italic hover:underline">@kaaram.kathalu</a> for behind-the-scenes, recipes, and more spicy tales.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-8 w-full max-w-[95vw] mx-auto">
            {galleryImages.map((src, idx) => (
              <motion.a 
                href="https://www.instagram.com/kaaram.kathalu/"
                target="_blank"
                rel="noopener noreferrer"
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className={`group relative aspect-square bg-white border-2 border-warm-dark p-2 shadow-[6px_6px_0px_#3A2A22] hover:shadow-[2px_2px_0px_#3A2A22] hover:translate-y-1 transition-all ${idx%2===0 ? 'rotate-[-3deg]' : 'rotate-[2deg]'}`}
              >
                <div className="w-full h-full border border-dashed border-warm-dark/30 relative overflow-hidden bg-warm-bg">
                  <img 
                    src={src} 
                    alt={`Instagram gallery post ${idx + 1}`} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[20%] sepia-[10%] contrast-125"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-warm-dark/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Instagram className="w-8 h-8 text-white" />
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

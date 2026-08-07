import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Home, ShoppingBag, BookOpen, Scroll, HelpCircle } from 'lucide-react';
import SEO from '../components/SEO';

export default function NotFound() {
  return (
    <div className="pb-16 px-4 sm:px-6 md:px-12 w-full max-w-[100vw] overflow-x-hidden md:max-w-7xl mx-auto min-h-[70vh] flex items-center justify-center">
      <SEO 
        title="Page Not Found (404)" 
        description="The recipe or page you are looking for does not exist in the Kaaram Kathalu courtyard."
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl bg-white border border-warm-dark/5 rounded-[32px] p-8 md:p-16 shadow-lg text-center relative overflow-hidden"
      >
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-warm-accent/20 rounded-tl-3xl"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-warm-accent/20 rounded-tr-3xl"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-warm-accent/20 rounded-bl-3xl"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-warm-accent/20 rounded-br-3xl"></div>

        {/* Traditional Ceramic Bharani Jar (Pickle Jar) Illustration */}
        <div className="flex justify-center mb-8">
          <motion.div
            initial={{ scale: 0.8, rotate: -5 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
            className="w-40 h-40 relative"
          >
            <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              {/* Spilled spice powder dots */}
              <circle cx="25" cy="100" r="2" fill="#B83A20" opacity="0.6" className="animate-pulse" />
              <circle cx="32" cy="104" r="1.5" fill="#D27E6A" opacity="0.8" />
              <circle cx="95" cy="98" r="2.5" fill="#B83A20" opacity="0.7" />
              <circle cx="102" cy="95" r="1.5" fill="#D27E6A" opacity="0.9" />
              <circle cx="88" cy="105" r="2" fill="#B83A20" opacity="0.5" />
              
              {/* Spilled liquid drop */}
              <path d="M 45 102 Q 52 108 55 100 T 60 98" stroke="#B83A20" strokeWidth="2" strokeLinecap="round" opacity="0.4" />

              {/* Jar Shadow */}
              <ellipse cx="60" cy="102" rx="30" ry="6" fill="#2A1B19" fillOpacity="0.1" />

              {/* Bharani Jar Body */}
              <path d="M35 55 C35 48 38 45 44 45 H76 C82 45 85 48 85 55 V85 C85 94 79 100 70 100 H50 C41 100 35 94 35 85 V55 Z" fill="#FAF2F0" stroke="#2A1B19" strokeWidth="3" />
              
              {/* Bharani Mustard Top Neck */}
              <path d="M36 50 C36 45 38 41 44 41 H76 C82 41 84 45 84 50 V60 H36 V50 Z" fill="#D27E6A" stroke="#2A1B19" strokeWidth="3" />
              
              {/* String tied around the neck */}
              <path d="M 35 58 Q 60 61 85 58" stroke="#2A1B19" strokeWidth="1.5" fill="none" />
              {/* Hanging string bow */}
              <path d="M 42 59 Q 38 65 35 63 C 32 61 38 58 42 59 Z" fill="#FAF2F0" stroke="#2A1B19" strokeWidth="1.2" />
              <path d="M 42 59 Q 45 68 40 72" stroke="#2A1B19" strokeWidth="1.2" fill="none" />
              
              {/* Jar Label with Telugu-inspired design */}
              <rect x="45" y="66" width="30" height="22" rx="4" fill="#FFFFFF" stroke="#2A1B19" strokeWidth="1.5" />
              {/* Traditional red dot/tilak on label */}
              <circle cx="60" cy="77" r="3" fill="#B83A20" />
              <path d="M52 74 H68 M52 80 H68" stroke="#2A1B19" strokeWidth="1" strokeOpacity="0.3" />

              {/* Floating question mark above jar */}
              <motion.g
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <path d="M 60 30 C 58 20, 68 18, 67 25 C 66 28, 62 30, 60 33" stroke="#B83A20" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <circle cx="60" cy="38" r="1.5" fill="#B83A20" />
              </motion.g>
            </svg>
          </motion.div>
        </div>

        {/* 404 Heading */}
        <span className="font-heading text-warm-accent text-xs font-bold tracking-[0.25em] uppercase block mb-2">
          Empty Jar!
        </span>
        <h1 className="text-7xl md:text-8xl font-heading font-bold text-warm-dark tracking-tighter mb-4 select-none">
          404
        </h1>
        <h2 className="text-xl md:text-2xl font-serif font-bold text-warm-dark mb-4">
          Lost in the Spice Courtyard!
        </h2>
        <p className="font-serif italic text-warm-dark/70 text-sm md:text-base max-w-md mx-auto leading-relaxed mb-10">
          The traditional recipe or page you are looking for has wandered off our digital shelves. Let us help you find your way back to the aromas of Andhra.
        </p>

        {/* Nav Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
          <Link
            to="/"
            className="flex items-center justify-center gap-3 px-6 py-3.5 bg-warm-accent text-white rounded-xl font-heading uppercase text-xs sm:text-sm tracking-wider hover:bg-warm-dark transition-all duration-300 shadow-md group"
          >
            <Home className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
            <span>Go to Home</span>
          </Link>
          <Link
            to="/shop"
            className="flex items-center justify-center gap-3 px-6 py-3.5 bg-white border border-warm-dark/15 text-warm-dark rounded-xl font-heading uppercase text-xs sm:text-sm tracking-wider hover:border-warm-dark hover:text-warm-accent transition-all duration-300 shadow-sm group"
          >
            <ShoppingBag className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>Browse Shop</span>
          </Link>
          <Link
            to="/privacy-policy"
            className="flex items-center justify-center gap-3 px-6 py-3.5 bg-warm-light text-warm-dark rounded-xl font-heading uppercase text-xs sm:text-sm tracking-wider hover:bg-warm-dark/5 hover:text-warm-dark transition-all duration-300 group"
          >
            <Scroll className="w-4 h-4 transition-transform group-hover:rotate-6" />
            <span>Privacy Policy</span>
          </Link>
          <Link
            to="/recipes"
            className="flex items-center justify-center gap-3 px-6 py-3.5 bg-warm-light text-warm-dark rounded-xl font-heading uppercase text-xs sm:text-sm tracking-wider hover:bg-warm-dark/5 hover:text-warm-dark transition-all duration-300 group"
          >
            <BookOpen className="w-4 h-4 transition-transform group-hover:scale-105" />
            <span>Traditional Recipes</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

import React from 'react';
import { motion } from 'motion/react';
import { RECIPES } from '../data/recipes';
import { Clock, ChefHat, ArrowRight, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';

const KOLAM_PATTERN = `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 10 L60 40 L90 50 L60 60 L50 90 L40 60 L10 50 L40 40 Z' fill='none' stroke='%233A2A22' stroke-width='0.5' opacity='0.2'/%3E%3C/svg%3E")`;

export default function Recipes() {
  return (
    <div className="min-h-screen bg-warm-bg pb-20">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden bg-warm-dark text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: KOLAM_PATTERN, backgroundSize: '80px' }}></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1 rounded-full border border-warm-accent text-warm-accent text-[10px] font-bold uppercase tracking-[0.3em] mb-6"
          >
            Culinary Stories
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif font-bold mb-8 italic"
          >
            The Art of <span className="text-warm-accent">Pickle</span> Pairing
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 font-serif italic text-xl max-w-2xl mx-auto"
          >
            Beyond the jar lies a world of flavor. Discover traditional and modern ways to bring our heirloom recipes to your daily table.
          </motion.p>
        </div>
      </section>

      {/* Recipes Grid */}
      <section className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {RECIPES.map((recipe, index) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border-2 border-warm-dark shadow-[8px_8px_0px_#3A2A22] overflow-hidden group flex flex-col h-full"
            >
              <div className="h-64 overflow-hidden relative">
                <img 
                  src={recipe.image} 
                  alt={recipe.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-warm-accent text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-warm-dark shadow-[2px_2px_0px_#3A2A22]">
                    {recipe.pairing}
                  </span>
                </div>
              </div>
              
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-warm-dark/40 mb-4">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {recipe.prepTime}</span>
                  <span className="flex items-center gap-1"><ChefHat className="w-3 h-3" /> {recipe.difficulty}</span>
                </div>
                
                <h3 className="text-2xl font-serif font-bold text-warm-dark mb-4 group-hover:text-warm-accent transition-colors italic">
                  {recipe.title}
                </h3>
                
                <p className="text-warm-dark/60 font-serif italic mb-8 line-clamp-3">
                  "{recipe.description}"
                </p>

                <div className="mt-auto pt-6 border-t border-warm-dark/5">
                  <Link 
                    to={`/recipes/${recipe.id}`}
                    className="flex items-center justify-between group/link"
                  >
                    <span className="text-xs font-bold uppercase tracking-widest text-warm-dark group-hover/link:text-warm-accent transition-colors">View Full Story</span>
                    <div className="w-8 h-8 rounded-full border border-warm-dark/20 flex items-center justify-center group-hover/link:bg-warm-dark group-hover/link:text-white transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Community Section */}
      <section className="max-w-3xl mx-auto px-6 mt-32 text-center">
        <div className="p-12 border-2 border-dashed border-warm-dark/20 bg-white/50 relative">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-warm-bg px-4">
            <Utensils className="w-12 h-12 text-warm-accent opacity-20" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-warm-dark mb-4 italic">Have a family recipe?</h2>
          <p className="text-warm-dark/60 font-serif italic mb-8">
            Our stories are built on traditions passed down through generations. If you have a unique way of enjoying our pickles, we'd love to hear it.
          </p>
          <button className="bg-warm-dark text-white px-8 py-3 font-bold uppercase tracking-widest text-xs shadow-[4px_4px_0px_#B83A20] hover:translate-y-1 hover:shadow-none transition-all">
            Share Your Story
          </button>
        </div>
      </section>
    </div>
  );
}

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { RECIPES } from '../data/recipes';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, ChefHat, Utensils, Heart } from 'lucide-react';

export default function RecipeDetail() {
  const { id } = useParams();
  const recipe = RECIPES.find(r => r.id === id);

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-bg p-6">
        <div className="text-center">
          <h2 className="text-3xl font-serif font-bold text-warm-dark mb-4">Story not found...</h2>
          <Link to="/recipes" className="text-warm-accent font-bold underline underline-offset-8 decoration-2">Back to Recipes</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-bg pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pt-12 flex justify-between items-center">
        <Link 
          to="/recipes" 
          className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-warm-dark/60 hover:text-warm-dark transition-colors"
        >
          <div className="w-8 h-8 rounded-full border border-warm-dark/10 flex items-center justify-center group-hover:bg-warm-dark group-hover:text-white transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Return to Kitchen
        </Link>
        <button className="p-3 bg-white border-2 border-warm-dark text-warm-dark hover:bg-warm-bg transition-colors shadow-[4px_4px_0px_#3A2A22]">
          <Heart className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Side: Visuals */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="aspect-[4/5] bg-white border-2 border-warm-dark shadow-[20px_20px_0px_#3A2A22] p-4">
              <img 
                src={recipe.image} 
                alt={recipe.title} 
                className="w-full h-full object-cover border-2 border-warm-dark"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-warm-dark text-white rounded-2xl">
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Perfect Pairing</p>
                <p className="text-xl font-serif italic text-warm-accent">{recipe.pairing}</p>
              </div>
              <div className="p-6 bg-warm-light border-2 border-warm-dark rounded-2xl flex flex-col justify-center">
                <div className="flex items-center gap-4 text-warm-dark">
                  <div className="text-center">
                    <p className="text-[10px] uppercase font-bold text-warm-dark/40">Time</p>
                    <p className="font-bold">{recipe.prepTime}</p>
                  </div>
                  <div className="w-px h-8 bg-warm-dark/10" />
                  <div className="text-center">
                    <p className="text-[10px] uppercase font-bold text-warm-dark/40">Skill</p>
                    <p className="font-bold">{recipe.difficulty}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Content */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            <div>
              <h1 className="text-5xl md:text-6xl font-serif font-bold text-warm-dark mb-6 italic leading-tight">
                {recipe.title}
              </h1>
              <p className="text-xl font-serif italic text-warm-dark/60 leading-relaxed">
                "{recipe.description}"
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-warm-dark">
                <Utensils className="w-5 h-5 text-warm-accent" /> Ingredients
              </h3>
              <ul className="space-y-4">
                {recipe.ingredients.map((item, i) => (
                  <li key={i} className="flex items-center gap-4 group">
                    <div className="w-2 h-2 rounded-full bg-warm-accent group-hover:scale-125 transition-transform" />
                    <span className="font-serif text-lg text-warm-dark/80 italic">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8">
              <h3 className="text-sm font-bold uppercase tracking-widest text-warm-dark">Step-by-Step Story</h3>
              <div className="space-y-8">
                {recipe.instructions.map((step, i) => (
                  <div key={i} className="flex gap-6">
                    <span className="text-4xl font-serif font-bold text-warm-accent opacity-30 mt-[-8px]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="font-serif text-lg text-warm-dark/80 leading-relaxed border-l-2 border-warm-dark/5 pl-6">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

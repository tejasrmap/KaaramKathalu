import React from 'react';
import { motion } from 'motion/react';

export default function About() {
  return (
    <div className="pt-24 md:pt-32 pb-24 px-4 sm:px-6 md:px-12 w-full max-w-[100vw] overflow-x-hidden md:max-w-7xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
      <div className="text-center mb-16 relative w-full max-w-[95vw] mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif text-warm-dark mb-6 inline-block bg-white px-6 md:px-8 py-3 md:py-4 border-2 border-warm-dark shadow-[4px_4px_0px_#3A2A22] transform rotate-1">
          Our <span className="text-warm-accent italic">Heritage</span>
        </h1>
        <p className="uppercase tracking-[0.2em] text-xs font-bold text-warm-dark/60 mt-4 border-t-2 border-dashed border-warm-dark/20 pt-6">The Kaaram Kathalu Story</p>
      </div>
      
      <div className="relative w-full max-w-[90vw] mx-auto mb-20 md:mb-32">
        <div className="bg-white border-[12px] md:border-[16px] border-white shadow-[8px_8px_0px_#3A2A22] md:shadow-[12px_12px_0px_#3A2A22] transform -rotate-1 relative z-10 w-full">
          <div className="absolute inset-0 border-2 border-dashed border-warm-dark/20 z-10 pointer-events-none m-3 md:m-4"></div>
          <img 
            src="https://images.unsplash.com/photo-1604085444653-53e34b9cfbc6?w=1200&q=80" 
            alt="Traditional Indian Spices" 
            className="w-full aspect-[16/9] md:aspect-[21/9] object-cover grayscale-[10%] sepia-[10%] contrast-110 border border-warm-dark/10"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-4 right-4 bg-white px-3 py-1 border-2 border-warm-dark text-[10px] uppercase font-bold tracking-widest shadow-[2px_2px_0px_#3A2A22] z-20">1992</div>
        </div>
        {/* Tape */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-40 h-10 bg-white/50 backdrop-blur-sm border border-warm-dark/20 transform rotate-2 z-20 opacity-80"></div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 lg:gap-24 items-center mb-24 w-full max-w-[95vw] mx-auto">
        <div className="lg:col-span-7 bg-[#F4EBE1] border-2 border-warm-dark p-6 md:p-10 shadow-[6px_6px_0px_#3A2A22] relative z-10">
          <div className="absolute -left-2 -top-2 w-4 h-4 bg-warm-accent rounded-full border-2 border-warm-dark shadow-[2px_2px_0px_#3A2A22]"></div>
          <p className="text-xl md:text-2xl font-serif leading-relaxed text-warm-dark italic border-b-2 border-dashed border-warm-dark/20 pb-6 mb-6">
            Kaaram Kathalu translates to "Spicy Tales," a tribute to the stories told in our grandmothers' kitchens, where the aroma of roasting spices formed the backdrop of every summer.
          </p>
          
          <p className="text-warm-dark/80 font-serif leading-relaxed text-base md:text-lg">
            It started as a small endeavor to preserve our family's heirloom recipes. The modern jarred pickles in supermarkets tasted flat, missing the depth, pungency, and sheer joy of a sun-cured traditional Andhra pickle. We missed the zing of the red chilies, the earthy nuttiness of cold-pressed sesame oil, and the unmistakable crunch of perfectly pickled raw mangoes.
          </p>
        </div>
        <div className="lg:col-span-5 relative w-[80%] mx-auto lg:w-full">
           <div className="bg-white border-[10px] border-white shadow-[8px_8px_0px_#3A2A22] transform rotate-2 relative z-10">
             <div className="absolute inset-0 border-2 border-dashed border-warm-dark/20 z-10 pointer-events-none m-2"></div>
            <img 
              src="https://images.unsplash.com/photo-1596649557760-44e27f673f8d?w=800&q=80" 
              alt="Raw Spices" 
              className="w-full aspect-square md:aspect-[4/5] object-cover grayscale-[20%] sepia-[15%] contrast-110"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12 lg:gap-24 items-center mb-20 w-full max-w-[95vw] mx-auto">
        <div className="lg:col-span-5 order-last lg:order-first relative w-[80%] mx-auto lg:w-full">
          <div className="bg-white border-[10px] border-white shadow-[8px_8px_0px_#3A2A22] transform -rotate-3 relative z-10">
            <div className="absolute inset-0 border-2 border-dashed border-warm-dark/20 z-10 pointer-events-none m-2"></div>
            <img 
              src="https://images.unsplash.com/photo-1589923158776-cb4485d99fd6?w=800&q=80" 
              alt="Pickle Jars" 
              className="w-full aspect-[4/5] object-cover grayscale-[10%] sepia-[20%] contrast-110"
              referrerPolicy="no-referrer"
            />
             {/* "Tape" at top */}
             <div className="absolute -top-3 right-4 w-24 h-6 bg-white/60 backdrop-blur-sm border border-warm-dark/20 transform rotate-12 z-30 opacity-70"></div>
          </div>
        </div>
        <div className="lg:col-span-7 bg-[#F4EBE1] border-2 border-warm-dark p-6 md:p-10 shadow-[6px_6px_0px_#3A2A22] relative z-10">
          <p className="text-warm-dark/80 font-serif leading-relaxed text-base md:text-lg mb-8">
            Today, Kaaram Kathalu is on a mission to revive those nostalgic flavors. Every jar we produce is a labor of love. We don't take shortcuts. We sun-dry our ingredients, we hand-pound our masalas, and we let time do the heavy lifting when it comes to maturing the pickles.
          </p>

          <div className="space-y-6 pt-6 border-t-2 border-dashed border-warm-dark/20">
            <div className="bg-white p-4 md:p-6 border-2 border-warm-dark shadow-[4px_4px_0px_#3A2A22] transform -rotate-1 relative group hover:rotate-0 transition-transform">
              <h3 className="font-serif text-xl md:text-2xl font-bold mb-3 text-warm-dark">Pure Ingredients</h3>
              <p className="text-sm md:text-base text-warm-dark/80 font-serif italic m-0">We source our chilies from Guntur, sesame oil from local mills, and raw mangoes from trusted farmers. No artificial preservatives or colors.</p>
            </div>
            <div className="bg-white p-4 md:p-6 border-2 border-warm-dark shadow-[4px_4px_0px_#3A2A22] transform rotate-1 relative group hover:rotate-0 transition-transform">
              <h3 className="font-serif text-xl md:text-2xl font-bold mb-3 text-warm-dark">Time-Honored Methods</h3>
              <p className="text-sm md:text-base text-warm-dark/80 font-serif italic m-0">Fermented naturally under the Indian sun. Hand-mixed in small batches to ensure the perfect ratio of spice, salt, and tang in every spoonful.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center max-w-3xl mx-auto w-full max-w-[95vw] bg-white border-2 border-warm-dark p-8 md:p-12 shadow-[8px_8px_0px_#3A2A22] relative mt-16 md:mt-32 transform rotate-1 mb-8">
         <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border border-warm-dark shadow-sm bg-warm-bg flex items-center justify-center">
            <div className="w-4 h-4 bg-warm-dark rounded-full"></div>
         </div>
        <h2 className="text-2xl md:text-4xl font-serif text-warm-dark italic leading-relaxed">"Every spoonful brings a taste of tradition, a memory of home, and a spark of culinary delight."</h2>
      </div>
      </motion.div>
    </div>
  );
}

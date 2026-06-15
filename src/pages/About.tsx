import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import SEO from '../components/SEO';
import { Quote, Sparkles, Heart, Star, Compass } from 'lucide-react';

export default function About() {
  const [storySettings, setStorySettings] = useState({
    title: 'Our Story',
    subtitle: 'Storytellers preserving the vibrant tapestry of Andhra\'s rich history, architectural marvels, and culinary traditions.',
    legacyTitle: 'The Manduva Legacy',
    bannerImage: 'https://themanduvaproject.in/cdn/shop/files/58a7s9w56qhc1.jpg?v=1753097183&width=3200',
    
    section1Title: 'Allure of South Indian Heritage',
    section1Quote: '"At The Manduva Project, we are more than just a brand. We are storytellers, preserving the vibrant tapestry of Andhra\'s rich history, culture, and traditions."',
    section1Content: 'Our roots return to the lush fields of coastal Andhra Pradesh, and our palates still crave those hearty meals at ancestral homes, traditionally known as Manduva houses, which dotted every village. There, in the sun-kissed courtyard, grandmothers and mothers spent afternoons grinding spices to a fine podi or powder and pickling fruits and vegetables into irreplaceable staples.',
    section1Image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
    
    section2Title: 'The Courtyard Symphony',
    section2Content1: 'Their furtive hands, busy with the rokali banda or stone mortar and pestle, produced a constant hum that would mingle with their chattering voices. Children scurried around them, playing hide and seek or hunting for a quiet corner for a game of caroms. And the air was filled with delicious promise – whiffs of ginger, garlic, mustard, sesame, chili, lemon, curry leaf and so much more wafted through the house.',
    section2Content2: 'As times changed, afternoons like these slowly started disappearing. We cannot save those old homes or hold onto the ways of life they sustained, but we can certainly keep their food alive! And that’s exactly what we, at the Manduva Project, intend to do. Just like the tall ornate wooden pillars, we stand as guardians of the region\'s cultural heritage.',
    section2Image: 'https://themanduvaproject.in/cdn/shop/files/Manduvawebsitepicture_1.png?v=1749711321&width=533',
    
    foundersTitle: 'Usha Sarvarayalu & Neha Alluri',
    foundersSubtitle: 'Co-Founders & Mission',
    foundersContent: 'Co-founded by Usha Sarvarayalu and Neha Alluri, The Manduva Project emerged from a desire to keep the food traditions of Andhra Pradesh alive. The production is largely driven by local women, supporting rural livelihoods in traditional kitchens across villages like Annadevarapeta and Uppalametta.',
    foundersBadges: 'Artisanal & Small Batch, Preservative Free, Supporting Women-led Kitchens',
    bottomQuote: '"Come, embark on a sensory journey that transports you to the sun-kissed plains and lush green landscapes of Andhra Pradesh. Immerse yourself in the kaleidoscope of flavours passed down through generations."'
  });

  useEffect(() => {
    const fetchStorySettings = async () => {
      try {
        const storyRef = doc(db, 'settings', 'story');
        const storySnap = await getDoc(storyRef);
        if (storySnap.exists()) {
          setStorySettings(storySnap.data() as any);
        }
      } catch (error) {
        console.error("Error fetching story settings:", error);
      }
    };
    fetchStorySettings();
  }, []);

  const badges = storySettings.foundersBadges 
    ? storySettings.foundersBadges.split(',').map(b => b.trim()).filter(Boolean)
    : [];

  return (
    <div className="pt-24 md:pt-32 pb-24 px-4 sm:px-6 md:px-12 w-full max-w-[100vw] overflow-x-hidden md:max-w-7xl mx-auto min-h-screen bg-warm-bg/30">
      <SEO title={`${storySettings.title} - Traditional Andhra Culinary Heritage`} />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="space-y-24 md:space-y-36"
      >
        {/* Page Title & Hero Header */}
        <div className="text-center relative w-full max-w-4xl mx-auto px-4 mt-6">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 w-24 h-24 bg-warm-accent/5 rounded-full blur-2xl -z-10" />
          
          <motion.span 
            initial={{ opacity: 0, letterSpacing: '0.1em' }}
            animate={{ opacity: 1, letterSpacing: '0.2em' }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="font-heading text-warm-accent text-xs font-bold uppercase tracking-[0.2em] block mb-3"
          >
            {storySettings.legacyTitle}
          </motion.span>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-heading font-black text-warm-dark uppercase tracking-tight leading-none">
            {storySettings.title.split(' ').slice(0, -1).join(' ')}{' '}
            <span className="text-warm-accent italic font-light relative">
              {storySettings.title.split(' ').slice(-1)[0]}
              <svg className="absolute -bottom-2 left-0 w-full h-2 text-warm-accent/35" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,5 Q50,0 100,5" stroke="currentColor" strokeWidth="4" fill="none" />
              </svg>
            </span>
          </h1>
          
          <div className="w-16 h-1 bg-warm-accent/80 mx-auto mt-6 mb-8 rounded-full"></div>
          
          <p className="font-serif italic text-warm-dark/70 text-lg md:text-2xl max-w-3xl mx-auto whitespace-pre-line leading-relaxed">
            {storySettings.subtitle}
          </p>
        </div>
        
        {/* Main Banner Image with Hero Stamp */}
        {storySettings.bannerImage && (
          <div className="relative w-full max-w-[90vw] mx-auto group">
            <div className="absolute -inset-4 bg-gradient-to-tr from-warm-accent/10 to-transparent rounded-[36px] blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-700 -z-10" />
            
            <div className="bg-white border-[8px] sm:border-[16px] border-white shadow-2xl relative z-10 w-full rounded-[24px] sm:rounded-[36px] overflow-hidden transform group-hover:scale-[1.01] transition-transform duration-700">
              <img 
                src={storySettings.bannerImage} 
                alt="Traditional Andhra Culinary Banner" 
                className="w-full aspect-[16/9] md:aspect-[21/9] object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-warm-dark/30 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Decorative Heritage Stamp */}
            <div className="absolute -bottom-6 -right-2 md:-right-8 bg-warm-accent text-white p-4 md:p-6 rounded-full w-24 h-24 md:w-36 md:h-36 flex flex-col items-center justify-center text-center shadow-2xl border-[6px] border-white transform rotate-12 hover:rotate-6 transition-transform duration-500 z-20 cursor-pointer select-none">
              <Compass className="w-5 h-5 md:w-8 md:h-8 mb-1 animate-spin-slow text-white/95" />
              <span className="text-[8px] md:text-[10px] font-heading font-black tracking-wider uppercase text-white/90">100% Traditional</span>
            </div>
          </div>
        )}

        {/* Narrative Section 1 */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center w-full max-w-[95vw] mx-auto">
          <div className="lg:col-span-7 bg-white/95 border border-warm-dark/5 p-8 md:p-14 rounded-[32px] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            {/* Background quote mark decoration */}
            <div className="absolute -top-4 -right-4 text-warm-accent/[0.03] select-none pointer-events-none transform translate-x-4 -translate-y-4">
              <Quote className="w-48 h-48 fill-current rotate-180" />
            </div>
            
            <div className="flex items-center gap-2 mb-6 text-warm-accent">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="font-heading text-xs font-bold tracking-widest uppercase">The Heritage</span>
            </div>

            <h2 className="font-heading text-2xl md:text-3xl font-extrabold uppercase tracking-wide text-warm-dark mb-6 leading-tight">
              {storySettings.section1Title}
            </h2>
            
            {storySettings.section1Quote && (
              <div className="border-l-4 border-warm-accent pl-6 mb-8 py-1">
                <p className="text-base md:text-xl font-serif leading-relaxed text-warm-dark/80 italic">
                  {storySettings.section1Quote}
                </p>
              </div>
            )}
            
            <p className="text-warm-dark/70 font-serif leading-relaxed text-sm md:text-base whitespace-pre-line">
              {storySettings.section1Content}
            </p>
          </div>
          
          {storySettings.section1Image && (
            <div className="lg:col-span-5 relative w-[85%] sm:w-[70%] mx-auto lg:w-full">
              <div className="absolute -inset-4 bg-warm-accent/5 rounded-[24px] blur-lg transform -rotate-2" />
              <div className="bg-white border-[12px] border-white shadow-xl rounded-[24px] overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500 cursor-pointer group">
                <img 
                  src={storySettings.section1Image} 
                  alt="Narrative Section 1 Media" 
                  className="w-full aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Narrative Section 2 */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center w-full max-w-[95vw] mx-auto">
          {storySettings.section2Image && (
            <div className="lg:col-span-5 order-last lg:order-first relative w-[85%] sm:w-[70%] mx-auto lg:w-full">
              <div className="absolute -inset-4 bg-warm-accent/5 rounded-[24px] blur-lg transform rotate-3" />
              <div className="bg-white border-[12px] border-white shadow-xl rounded-[24px] overflow-hidden transform -rotate-3 hover:rotate-0 transition-transform duration-500 cursor-pointer group">
                <img 
                  src={storySettings.section2Image} 
                  alt="Narrative Section 2 Media" 
                  className="w-full aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}
          
          <div className="lg:col-span-7 bg-white/95 border border-warm-dark/5 p-8 md:p-14 rounded-[32px] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            {/* Background quote mark decoration */}
            <div className="absolute -top-4 -left-4 text-warm-accent/[0.03] select-none pointer-events-none transform -translate-x-4 -translate-y-4">
              <Quote className="w-48 h-48 fill-current" />
            </div>

            <div className="flex items-center gap-2 mb-6 text-warm-accent">
              <Star className="w-5 h-5 fill-current" />
              <span className="font-heading text-xs font-bold tracking-widest uppercase">The Courtyard</span>
            </div>

            <h2 className="font-heading text-2xl md:text-3xl font-extrabold uppercase tracking-wide text-warm-dark mb-6 leading-tight">
              {storySettings.section2Title}
            </h2>
            
            <p className="text-warm-dark/70 font-serif leading-relaxed text-sm md:text-base mb-6 whitespace-pre-line">
              {storySettings.section2Content1}
            </p>
            {storySettings.section2Content2 && (
              <p className="text-warm-dark/70 font-serif leading-relaxed text-sm md:text-base whitespace-pre-line border-t border-warm-dark/5 pt-6 mt-6">
                {storySettings.section2Content2}
              </p>
            )}
          </div>
        </div>

        {/* Co-Founders & Livelihoods Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-br from-white to-warm-light/40 border border-warm-accent/10 rounded-[40px] p-8 md:p-16 max-w-4xl mx-auto shadow-xl overflow-hidden group">
          <div className="absolute top-0 right-0 -translate-y-6 translate-x-6 w-32 h-32 bg-warm-accent/5 rounded-full blur-xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-6 -translate-x-6 w-32 h-32 bg-warm-accent/5 rounded-full blur-xl pointer-events-none" />

          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-full bg-warm-accent/10 flex items-center justify-center text-warm-accent shadow-inner">
              <Heart className="w-6 h-6 fill-current" />
            </div>
          </div>

          <span className="font-heading text-warm-accent text-xs font-black tracking-[0.25em] uppercase block mb-3">
            {storySettings.foundersSubtitle}
          </span>
          
          <h2 className="text-3xl md:text-4xl font-heading font-black text-warm-dark mb-6 uppercase tracking-wide leading-tight">
            {storySettings.foundersTitle}
          </h2>
          
          <p className="font-serif italic text-warm-dark/70 text-base md:text-xl leading-relaxed max-w-2xl mx-auto mb-10 whitespace-pre-line">
            {storySettings.foundersContent}
          </p>
          
          {badges.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4">
              {badges.map((badge, idx) => (
                <motion.span 
                  whileHover={{ scale: 1.05, y: -2 }}
                  key={idx} 
                  className="bg-white border border-warm-accent/10 hover:border-warm-accent hover:shadow-md text-warm-dark px-6 py-3 font-serif italic text-sm rounded-full shadow-sm transition-all duration-300 cursor-default"
                >
                  🌶️ {badge}
                </motion.span>
              ))}
            </div>
          )}
        </section>

        {/* Dynamic Signature Quote Block */}
        {storySettings.bottomQuote && (
          <div className="bg-warm-dark text-white p-12 md:p-20 rounded-[40px] shadow-2xl relative overflow-hidden mt-16 md:mt-24 mb-8 max-w-5xl mx-auto text-center border-t-8 border-warm-accent group">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-radial-gradient from-white/[0.02] to-transparent pointer-events-none" />
            <div className="absolute -top-10 -left-10 text-white/[0.02] select-none pointer-events-none">
              <Quote className="w-64 h-64 fill-current" />
            </div>

            <Quote className="w-10 h-10 text-warm-accent mx-auto mb-8 animate-pulse" />
            
            <h2 className="text-xl md:text-3xl lg:text-4xl font-serif text-warm-bg/90 italic leading-relaxed max-w-4xl mx-auto relative z-10">
              {storySettings.bottomQuote}
            </h2>
            
            <div className="w-12 h-0.5 bg-warm-accent mx-auto mt-10 rounded-full opacity-60"></div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

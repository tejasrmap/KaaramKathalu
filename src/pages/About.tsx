import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import SEO from '../components/SEO';

export default function About() {
  const [storySettings, setStorySettings] = useState({
    title: 'Our Story',
    subtitle: 'Storytellers preserving the vibrant tapestry of Andhra\'s rich history, architectural marvels, and culinary traditions.',
    legacyTitle: 'The Manduva Legacy',
    bannerImage: '',

    section1Title: 'Allure of South Indian Heritage',
    section1Quote: '"At The Manduva Project, we are more than just a brand. We are storytellers, preserving the vibrant tapestry of Andhra\'s rich history, culture, and traditions."',
    section1Content: 'Our roots return to the lush fields of coastal Andhra Pradesh, and our palates still crave those hearty meals at ancestral homes, traditionally known as Manduva houses, which dotted every village. There, in the sun-kissed courtyard, grandmothers and mothers spent afternoons grinding spices to a fine podi or powder and pickling fruits and vegetables into irreplaceable staples.',
    section1Image: '',

    section2Title: 'The Courtyard Symphony',
    section2Content1: 'Their furtive hands, busy with the rokali banda or stone mortar and pestle, produced a constant hum that would mingle with their chattering voices. Children scurried around them, playing hide and seek or hunting for a quiet corner for a game of caroms. And the air was filled with delicious promise – whiffs of ginger, garlic, mustard, sesame, chili, lemon, curry leaf and so much more wafted through the house.',
    section2Content2: 'As times changed, afternoons like these slowly started disappearing. We cannot save those old homes or hold onto the ways of life they sustained, but we can certainly keep their food alive! And that’s exactly what we, at the Manduva Project, intend to do. Just like the tall ornate wooden pillars, we stand as guardians of the region\'s cultural heritage.',
    section2Image: '',

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
    <div className="pt-24 md:pt-32 pb-24 px-4 sm:px-6 md:px-12 w-full max-w-[100vw] overflow-x-hidden md:max-w-7xl mx-auto min-h-screen">
      <SEO title={`${storySettings.title} - Traditional Andhra Culinary Heritage`} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Page Title */}
        <div className="text-center mb-16 relative w-full max-w-[95vw] mx-auto">
          <span className="font-heading text-warm-accent text-xs font-bold tracking-[0.2em] uppercase">
            {storySettings.legacyTitle}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-heading font-bold text-warm-dark mt-2 mb-4 uppercase">
            {storySettings.title.split(' ').slice(0, -1).join(' ')}{' '}
            <span className="text-warm-accent italic">
              {storySettings.title.split(' ').slice(-1)[0]}
            </span>
          </h1>
          <div className="w-16 h-0.5 bg-warm-accent mx-auto mb-6"></div>
          <p className="font-serif italic text-warm-dark/70 text-lg md:text-xl max-w-2xl mx-auto whitespace-pre-line">
            {storySettings.subtitle}
          </p>
        </div>

        {/* Main Banner Image */}
        {storySettings.bannerImage && (
          <div className="relative w-full max-w-[90vw] mx-auto mb-20 md:mb-32">
            <div className="bg-white border-8 border-white shadow-lg relative z-10 w-full rounded-2xl overflow-hidden">
              <img
                src={storySettings.bannerImage}
                alt="Traditional Andhra Culinary Banner"
                className="w-full aspect-[16/9] md:aspect-[21/9] object-cover border border-warm-dark/5"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        )}

        {/* Narrative Section 1 */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-24 items-center mb-24 w-full max-w-[95vw] mx-auto">
          <div className="lg:col-span-7 bg-warm-light/30 border border-warm-dark/10 p-8 md:p-12 rounded-2xl flex flex-col justify-center">
            <h2 className="font-heading text-2xl font-bold uppercase tracking-wider text-warm-dark mb-6">
              {storySettings.section1Title}
            </h2>
            {storySettings.section1Quote && (
              <p className="text-base md:text-lg font-serif leading-relaxed text-warm-dark/80 italic mb-6">
                {storySettings.section1Quote}
              </p>
            )}
            <p className="text-warm-dark/70 font-serif leading-relaxed text-sm md:text-base whitespace-pre-line">
              {storySettings.section1Content}
            </p>
          </div>

          {storySettings.section1Image && (
            <div className="lg:col-span-5 relative w-[80%] mx-auto lg:w-full">
              <div className="bg-white border-4 border-white shadow-md rounded-2xl overflow-hidden">
                <img
                  src={storySettings.section1Image}
                  alt="Narrative Section 1 Media"
                  className="w-full aspect-square md:aspect-[4/5] object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Narrative Section 2 */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-24 items-center mb-20 w-full max-w-[95vw] mx-auto">
          {storySettings.section2Image && (
            <div className="lg:col-span-5 order-last lg:order-first relative w-[80%] mx-auto lg:w-full">
              <div className="bg-white border-4 border-white shadow-md rounded-2xl overflow-hidden">
                <img
                  src={storySettings.section2Image}
                  alt="Narrative Section 2 Media"
                  className="w-full aspect-[4/5] object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}

          <div className="lg:col-span-7 bg-warm-light/30 border border-warm-dark/10 p-8 md:p-12 rounded-2xl flex flex-col justify-center">
            <h2 className="font-heading text-2xl font-bold uppercase tracking-wider text-warm-dark mb-6">
              {storySettings.section2Title}
            </h2>
            <p className="text-warm-dark/70 font-serif leading-relaxed text-sm md:text-base mb-6 whitespace-pre-line">
              {storySettings.section2Content1}
            </p>
            {storySettings.section2Content2 && (
              <p className="text-warm-dark/70 font-serif leading-relaxed text-sm md:text-base whitespace-pre-line">
                {storySettings.section2Content2}
              </p>
            )}
          </div>
        </div>

        {/* Co-Founders & Livelihoods Section */}
        <section className="py-16 md:py-24 bg-white border border-warm-dark/5 rounded-3xl p-8 md:p-12 mb-20 text-center max-w-4xl mx-auto shadow-sm">
          <span className="font-heading text-warm-accent text-xs font-bold tracking-[0.2em] uppercase">
            {storySettings.foundersSubtitle}
          </span>
          <h2 className="text-3xl font-heading font-bold text-warm-dark mt-2 mb-6 uppercase">
            {storySettings.foundersTitle}
          </h2>
          <p className="font-serif italic text-warm-dark/70 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-8 whitespace-pre-line">
            {storySettings.foundersContent}
          </p>
          {badges.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4">
              {badges.map((badge, idx) => (
                <span key={idx} className="bg-warm-bg border text-warm-dark px-4 py-2 font-serif italic text-sm rounded-full shadow-sm">
                  {badge}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Quote Block */}
        {storySettings.bottomQuote && (
          <div className="text-center max-w-3xl mx-auto w-full max-w-[95vw] bg-white border border-warm-dark/10 p-8 md:p-12 rounded-2xl shadow-sm relative mt-16 md:mt-24 mb-8">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border border-warm-dark/10 bg-warm-bg flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-warm-accent rounded-full"></div>
            </div>
            <h2 className="text-xl md:text-3xl font-serif text-warm-dark italic leading-relaxed">
              {storySettings.bottomQuote}
            </h2>
          </div>
        )}
      </motion.div>
    </div>
  );
}

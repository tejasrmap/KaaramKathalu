import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import SEO from '../components/SEO';

export default function About() {
  const [storySettings, setStorySettings] = useState(() => {
    try {
      const cached = localStorage.getItem('kk_story_settings_cache');
      return cached ? JSON.parse(cached) : {
        dictWord: 'Kaaram Kathalu',
        dictPhonetic: '[kaa:ram ka:tha:lu]',
        dictPart1: 'noun',
        dictDef1: 'Spicy, fiery piquancy (కారము) derived from sun-dried red chillies and heirloom Andhra spices.',
        dictPart2: 'noun',
        dictDef2: 'Stories, tales, and lore (కథలు) passed down across generations and ancestral dining tables.',
        title: 'Our Story',
        introParagraph1: "At Kaaram Kathalu, we are more than just a brand. We are storytellers preserving the vibrant tapestry of Andhra's rich history, architectural marvels, and culinary traditions.",
        introParagraph2: "Our roots return to the lush fields of coastal Andhra Pradesh, and our palates still crave those hearty meals at ancestral homes. What began in sun-kissed courtyards with hand-ground spices continues today with pure ingredients, cold-pressed oils, and zero preservatives.",
        subtitle: 'Storytellers preserving the vibrant tapestry of Andhra\'s rich history, architectural marvels, and culinary traditions.',
        legacyTitle: 'Our Heritage',
        bannerImage: '',

        section1Title: 'Allure of South Indian Heritage',
        section1Quote: '"At Kaaram Kathalu, we are more than just a brand. We are storytellers, preserving the vibrant tapestry of Andhra\'s rich history, culture, and traditions."',
        section1Content: 'Our roots return to the lush fields of coastal Andhra Pradesh, and our palates still crave those hearty meals at ancestral homes, traditionally known for bringing families together in courtyards, which dotted every village. There, in the sun-kissed courtyard, grandmothers and mothers spent afternoons grinding spices to a fine podi or powder and pickling fruits and vegetables into irreplaceable staples.',
        section1Image: '',

        section2Title: 'The Courtyard Symphony',
        section2Content1: 'Their furtive hands, busy with the rokali banda or stone mortar and pestle, produced a constant hum that would mingle with their chattering voices. Children scurried around them, playing hide and seek or hunting for a quiet corner for a game of caroms. And the air was filled with delicious promise – whiffs of ginger, garlic, mustard, sesame, chili, lemon, curry leaf and so much more wafted through the house.',
        section2Content2: 'As times changed, afternoons like these slowly started disappearing. We cannot save those old homes or hold onto the ways of life they sustained, but we can certainly keep their food alive! And that’s exactly what we, at Kaaram Kathalu, intend to do. Just like the tall ornate wooden pillars, we stand as guardians of the region\'s cultural heritage.',
        section2Image: '',

        foundersTitle: 'Deepthi Vaishnavy',
        foundersSubtitle: 'Co-Founders & Mission',
        foundersContent: 'Co-founded by Usha Sarvarayalu and Neha Alluri, Kaaram Kathalu emerged from a desire to keep the food traditions of Andhra Pradesh alive. The production is largely driven by local women, supporting rural livelihoods in traditional kitchens across villages like Annadevarapeta and Uppalametta.',
        foundersBadges: 'Artisanal & Small Batch, Preservative Free, Supporting Women-led Kitchens',
        bottomQuote: '"Come, embark on a sensory journey that transports you to the sun-kissed plains and lush green landscapes of Andhra Pradesh. Immerse yourself in the kaleidoscope of flavours passed down through generations."'
      };
    } catch {
      return {
        dictWord: 'Kaaram Kathalu',
        dictPhonetic: '[kaa:ram ka:tha:lu]',
        dictPart1: 'noun',
        dictDef1: 'Spicy, fiery piquancy (కారము) derived from sun-dried red chillies and heirloom Andhra spices.',
        dictPart2: 'noun',
        dictDef2: 'Stories, tales, and lore (కథలు) passed down across generations and ancestral dining tables.',
        title: 'Our Story',
        introParagraph1: "At Kaaram Kathalu, we are more than just a brand. We are storytellers preserving the vibrant tapestry of Andhra's rich history, architectural marvels, and culinary traditions.",
        introParagraph2: "Our roots return to the lush fields of coastal Andhra Pradesh, and our palates still crave those hearty meals at ancestral homes. What began in sun-kissed courtyards with hand-ground spices continues today with pure ingredients, cold-pressed oils, and zero preservatives.",
        subtitle: 'Storytellers preserving the vibrant tapestry of Andhra\'s rich history, architectural marvels, and culinary traditions.',
        legacyTitle: 'Our Heritage',
        bannerImage: '',

        section1Title: 'Allure of South Indian Heritage',
        section1Quote: '"At Kaaram Kathalu, we are more than just a brand. We are storytellers, preserving the vibrant tapestry of Andhra\'s rich history, culture, and traditions."',
        section1Content: 'Our roots return to the lush fields of coastal Andhra Pradesh, and our palates still crave those hearty meals at ancestral homes, traditionally known for bringing families together in courtyards, which dotted every village. There, in the sun-kissed courtyard, grandmothers and mothers spent afternoons grinding spices to a fine podi or powder and pickling fruits and vegetables into irreplaceable staples.',
        section1Image: '',

        section2Title: 'The Courtyard Symphony',
        section2Content1: 'Their furtive hands, busy with the rokali banda or stone mortar and pestle, produced a constant hum that would mingle with their chattering voices. Children scurried around them, playing hide and seek or hunting for a quiet corner for a game of caroms. And the air was filled with delicious promise – whiffs of ginger, garlic, mustard, sesame, chili, lemon, curry leaf and so much more wafted through the house.',
        section2Content2: 'As times changed, afternoons like these slowly started disappearing. We cannot save those old homes or hold onto the ways of life they sustained, but we can certainly keep their food alive! And that’s exactly what we, at Kaaram Kathalu, intend to do. Just like the tall ornate wooden pillars, we stand as guardians of the region\'s cultural heritage.',
        section2Image: '',

        foundersTitle: 'Deepthi Vaishnavy',
        foundersSubtitle: 'Co-Founders & Mission',
        foundersContent: 'Co-founded by Usha Sarvarayalu and Neha Alluri, Kaaram Kathalu emerged from a desire to keep the food traditions of Andhra Pradesh alive. The production is largely driven by local women, supporting rural livelihoods in traditional kitchens across villages like Annadevarapeta and Uppalametta.',
        foundersBadges: 'Artisanal & Small Batch, Preservative Free, Supporting Women-led Kitchens',
        bottomQuote: '"Come, embark on a sensory journey that transports you to the sun-kissed plains and lush green landscapes of Andhra Pradesh. Immerse yourself in the kaleidoscope of flavours passed down through generations."'
      };
    }
  });

  useEffect(() => {
    const fetchStorySettings = async () => {
      try {
        const storyRef = doc(db, 'settings', 'story');
        const storySnap = await getDoc(storyRef);
        if (storySnap.exists()) {
          const data = storySnap.data() as any;
          setStorySettings(data);
          localStorage.setItem('kk_story_settings_cache', JSON.stringify(data));
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
    <div className="pt-8 md:pt-12 pb-24 px-4 sm:px-6 md:px-12 w-full max-w-[100vw] overflow-x-hidden md:max-w-7xl mx-auto min-h-screen">
      <SEO title={`${storySettings.title} - Traditional Andhra Culinary Heritage`} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Editorial Dictionary Brand Definition Section */}
        <div className="text-center max-w-2xl mx-auto pt-6 pb-12 md:pt-10 md:pb-16 px-4 space-y-4 md:space-y-6">
          {/* Main Brand Word in English & Native Script */}
          <div className="space-y-1">
            <h1 
              className="font-heading font-bold text-warm-accent uppercase tracking-wider"
              style={{
                fontSize: storySettings.dictWordFontSize 
                  ? `clamp(24px, 4.5vw, ${storySettings.dictWordFontSize}px)` 
                  : 'clamp(28px, 4.5vw, 48px)'
              }}
            >
              {storySettings.dictWord || 'Kaaram Kathalu'}
            </h1>
            {(storySettings.dictNativeScript || storySettings.dictNativeScript !== '') && (
              <p 
                className="font-serif font-bold text-warm-dark/90 tracking-normal pt-1"
                style={{
                  fontSize: storySettings.dictNativeScriptFontSize 
                    ? `clamp(20px, 3.5vw, ${storySettings.dictNativeScriptFontSize}px)` 
                    : 'clamp(22px, 3.5vw, 30px)'
                }}
              >
                {storySettings.dictNativeScript || 'కారం కథలు'}
              </p>
            )}
          </div>

          {/* Phonetic Pronunciation */}
          {(storySettings.dictPhonetic || storySettings.dictPhonetic !== '') && (
            <p className="font-serif italic text-base sm:text-lg text-warm-dark/60 tracking-wider">
              {storySettings.dictPhonetic || '[kā ka:tha]'}
            </p>
          )}

          {/* Grammatical Definition */}
          <div className="pt-2 space-y-2">
            {storySettings.dictPart1 && (
              <span className="font-serif font-bold text-warm-dark text-base sm:text-lg block">
                {storySettings.dictPart1}
              </span>
            )}
            {storySettings.dictDef1 && (
              <p className="font-serif text-warm-dark/85 text-base sm:text-lg leading-relaxed max-w-lg mx-auto">
                {storySettings.dictDef1}
              </p>
            )}
          </div>

          {/* Word Breakdowns & Meanings */}
          {(storySettings.dictBreakdown1 || storySettings.dictBreakdown2) && (
            <div className="pt-3 space-y-2 font-serif text-warm-dark/85 text-base sm:text-lg">
              {storySettings.dictBreakdown1 && (
                <p className="font-medium">{storySettings.dictBreakdown1}</p>
              )}
              {storySettings.dictBreakdown2 && (
                <p className="font-medium">{storySettings.dictBreakdown2}</p>
              )}
            </div>
          )}

          {/* Heritage Flower Divider */}
          <div className="heritage-divider text-warm-accent w-full max-w-[160px] mx-auto !my-8">✻</div>

          {/* Our Story Intro Narrative */}
          <div className="space-y-6 pt-2 max-w-2xl mx-auto">
            <h2 
              className="font-heading font-bold text-warm-accent uppercase tracking-wider"
              style={{
                fontSize: storySettings.storyTitleFontSize 
                  ? `clamp(20px, 3.5vw, ${storySettings.storyTitleFontSize}px)` 
                  : 'clamp(24px, 3.5vw, 32px)'
              }}
            >
              {storySettings.title || 'Our Story'}
            </h2>

            {/* Story Photo between headline and matter */}
            {storySettings.storyPhoto && (
              <div className={`mx-auto overflow-hidden rounded-2xl border border-warm-dark/10 shadow-md ${
                storySettings.storyPhotoWidth === 'max-w-md' ? 'max-w-md' :
                storySettings.storyPhotoWidth === 'max-w-xl' ? 'max-w-xl' :
                storySettings.storyPhotoWidth === 'max-w-3xl' ? 'max-w-3xl' :
                storySettings.storyPhotoWidth === 'max-w-4xl' ? 'max-w-4xl' :
                storySettings.storyPhotoWidth === 'w-full' ? 'w-full' :
                'max-w-2xl'
              }`}>
                <div className={`w-full overflow-hidden bg-warm-light/40 flex items-center justify-center ${
                  storySettings.storyPhotoAspectRatio === '16:9' ? 'aspect-[16/9]' :
                  storySettings.storyPhotoAspectRatio === '4:3' ? 'aspect-[4/3]' :
                  storySettings.storyPhotoAspectRatio === '3:2' ? 'aspect-[3/2]' :
                  storySettings.storyPhotoAspectRatio === '1:1' ? 'aspect-square' :
                  storySettings.storyPhotoAspectRatio === '21:9' ? 'aspect-[21/9]' :
                  storySettings.storyPhotoAspectRatio === 'auto' ? 'aspect-auto' :
                  'aspect-[16/9]'
                }`}>
                  <img 
                    src={storySettings.storyPhoto} 
                    alt={storySettings.title || 'Our Story'} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            )}

            {storySettings.introParagraph1 && (
              <p className="font-serif text-warm-dark/75 text-base md:text-lg leading-relaxed whitespace-pre-line">
                {storySettings.introParagraph1}
              </p>
            )}
            {storySettings.introParagraph2 && (
              <p className="font-serif text-warm-dark/75 text-base md:text-lg leading-relaxed whitespace-pre-line">
                {storySettings.introParagraph2}
              </p>
            )}
          </div>
        </div>

        {/* Narrative Section 1 */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-24 items-center mb-24 w-full max-w-[95vw] mx-auto">
          <div className="lg:col-span-7 bg-warm-light/30 border border-warm-dark/10 p-8 md:p-12 rounded-2xl flex flex-col justify-center">
            <h2 className="font-heading text-2xl font-bold uppercase tracking-wider text-warm-accent mb-6">
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
            <h2 className="font-heading text-2xl font-bold uppercase tracking-wider text-warm-accent mb-6">
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
          <h2 className="text-3xl font-heading font-bold text-warm-accent mt-2 mb-6 uppercase">
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

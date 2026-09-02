import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { db } from '../firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import SEO from '../components/SEO';
import { formatRichText } from '../utils/richText';

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
    // Real-time synchronization for instant slider preview across tabs/devices
    const storyRef = doc(db, 'settings', 'story');
    const unsubscribe = onSnapshot(storyRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        setStorySettings(data);
        localStorage.setItem('kk_story_settings_cache', JSON.stringify(data));
      }
    }, (error) => {
      console.error("Error subscribing to story settings:", error);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="pt-8 md:pt-12 pb-24 px-4 sm:px-6 md:px-12 w-full max-w-[100vw] overflow-x-hidden md:max-w-7xl mx-auto min-h-screen">
      <SEO title={`${storySettings.title || 'Our Story'} - Traditional Andhra Culinary Heritage`} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Editorial Dictionary Brand Definition Section */}
        <div className="text-center max-w-2xl mx-auto pt-6 pb-2 md:pt-10 md:pb-3 px-4 space-y-4 md:space-y-6">
          {/* Main Brand Word in English & Native Script */}
          <div className="space-y-1">
            <h1 
              className="font-heading font-bold text-warm-accent uppercase tracking-wider"
              style={{
                fontSize: storySettings.dictWordFontSize 
                  ? `${storySettings.dictWordFontSize}px` 
                  : '42px'
              }}
            >
              {formatRichText(storySettings.dictWord || 'Kaaram Kathalu')}
            </h1>
            {(storySettings.dictNativeScript || storySettings.dictNativeScript !== '') && (
              <p 
                className="font-serif font-bold text-warm-dark/90 tracking-normal pt-1"
                style={{
                  fontSize: storySettings.dictNativeScriptFontSize 
                    ? `${storySettings.dictNativeScriptFontSize}px` 
                    : '28px'
                }}
              >
                {formatRichText(storySettings.dictNativeScript || 'కారం కథలు')}
              </p>
            )}
          </div>

          {/* Phonetic Pronunciation */}
          {(storySettings.dictPhonetic || storySettings.dictPhonetic !== '') && (
            <p 
              className="font-serif italic text-warm-dark/60 tracking-wider"
              style={{
                fontSize: storySettings.dictPhoneticFontSize 
                  ? `${storySettings.dictPhoneticFontSize}px` 
                  : '16px'
              }}
            >
              {formatRichText(storySettings.dictPhonetic || '[kā ka:tha]')}
            </p>
          )}

          {/* Grammatical Definition */}
          <div className="pt-2 space-y-2">
            {storySettings.dictPart1 && (
              <span 
                className="font-serif font-bold text-warm-dark block"
                style={{
                  fontSize: storySettings.dictDefFontSize 
                    ? `${storySettings.dictDefFontSize}px` 
                    : '16px'
                }}
              >
                {formatRichText(storySettings.dictPart1)}
              </span>
            )}
            {storySettings.dictDef1 && (
              <p 
                className="font-serif text-warm-dark/85 leading-relaxed max-w-lg mx-auto"
                style={{
                  fontSize: storySettings.dictDefFontSize 
                    ? `${storySettings.dictDefFontSize}px` 
                    : '16px'
                }}
              >
                {formatRichText(storySettings.dictDef1)}
              </p>
            )}
          </div>

          {/* Word Breakdowns & Meanings */}
          {(storySettings.dictBreakdown1 || storySettings.dictBreakdown2) && (
            <div 
              className="pt-3 space-y-2 font-serif text-warm-dark/85"
              style={{
                fontSize: storySettings.dictBreakdownFontSize 
                  ? `${storySettings.dictBreakdownFontSize}px` 
                  : '18px'
              }}
            >
              {storySettings.dictBreakdown1 && (
                <p className="font-medium">{formatRichText(storySettings.dictBreakdown1)}</p>
              )}
              {storySettings.dictBreakdown2 && (
                <p className="font-medium">{formatRichText(storySettings.dictBreakdown2)}</p>
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
                  ? `${storySettings.storyTitleFontSize}px` 
                  : '32px'
              }}
            >
              {formatRichText(storySettings.title || 'Our Story')}
            </h2>

            {/* Subheading under Our Story */}
            {storySettings.subtitle && (
              <p 
                className={`text-warm-dark/80 max-w-xl mx-auto leading-relaxed ${
                  storySettings.storySubtitleFontFamily === 'font-serif' ? 'font-serif' :
                  storySettings.storySubtitleFontFamily === 'font-cormorant' ? 'font-serif italic font-light tracking-wide' :
                  storySettings.storySubtitleFontFamily === 'font-heading' ? 'font-heading font-semibold uppercase tracking-wider' :
                  storySettings.storySubtitleFontFamily === 'font-sans' ? 'font-sans font-medium' :
                  'font-serif italic'
                }`}
                style={{
                  fontSize: storySettings.storySubtitleFontSize 
                    ? `${storySettings.storySubtitleFontSize}px` 
                    : '18px'
                }}
              >
                {formatRichText(storySettings.subtitle)}
              </p>
            )}

            {/* Story Photo between headline and matter */}
            {storySettings.storyPhoto && (
              <div 
                style={{
                  '--m-w': storySettings.storyPhotoMobileWidthPx ? `${storySettings.storyPhotoMobileWidthPx}px` : '100%',
                  '--d-w': storySettings.storyPhotoWidthPx ? `${storySettings.storyPhotoWidthPx}px` : (
                    storySettings.storyPhotoWidth === 'max-w-md' ? '450px' :
                    storySettings.storyPhotoWidth === 'max-w-xl' ? '576px' :
                    storySettings.storyPhotoWidth === 'max-w-3xl' ? '768px' :
                    storySettings.storyPhotoWidth === 'max-w-4xl' ? '896px' :
                    storySettings.storyPhotoWidth === 'w-full' ? '100%' : '672px'
                  )
                } as React.CSSProperties}
                className="w-full max-w-[var(--m-w)] md:max-w-[var(--d-w)] mx-auto overflow-hidden rounded-2xl border border-warm-dark/10 shadow-md"
              >
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
              <p 
                className="font-serif text-warm-dark/75 leading-relaxed whitespace-pre-line"
                style={{
                  fontSize: storySettings.introParagraphFontSize 
                    ? `${storySettings.introParagraphFontSize}px` 
                    : '18px'
                }}
              >
                {formatRichText(storySettings.introParagraph1)}
              </p>
            )}
            {storySettings.introParagraph2 && (
              <p 
                className="font-serif text-warm-dark/75 leading-relaxed whitespace-pre-line"
                style={{
                  fontSize: storySettings.introParagraphFontSize 
                    ? `${storySettings.introParagraphFontSize}px` 
                    : '18px'
                }}
              >
                {formatRichText(storySettings.introParagraph2)}
              </p>
            )}
          </div>
        </div>

        {/* Heritage Flower Divider on top of Essence of South Indian Heritage */}
        <div className="heritage-divider text-warm-accent w-full max-w-[160px] mx-auto !my-4 md:!my-6">✻</div>

        {/* Narrative Sections (Supports up to 5 customizable sections with individual ON/OFF toggles) */}
        {[1, 2, 3, 4, 5].map((num) => {
          const isEnabled = (storySettings as any)[`section${num}Enabled`] !== false;
          if (!isEnabled) return null;

          const title = (storySettings as any)[`section${num}Title`];
          const titleFontSize = (storySettings as any)[`section${num}TitleFontSize`] || 28;
          const content1 = (storySettings as any)[`section${num}Content`] || (storySettings as any)[`section${num}Content1`];
          const content2 = (storySettings as any)[`section${num}Content2`];
          const contentFontSize = (storySettings as any)[`section${num}ContentFontSize`] || 18;
          const image = (storySettings as any)[`section${num}Image`];
          const imageSize = (storySettings as any)[`section${num}ImageSize`] || 'max-w-md';
          const imageWidthPx = (storySettings as any)[`section${num}ImageWidthPx`];
          const imageMobileWidthPx = (storySettings as any)[`section${num}ImageMobileWidthPx`];
          const imageAspectRatio = (storySettings as any)[`section${num}ImageAspectRatio`] || '1:1';
          const imageRadius = (storySettings as any)[`section${num}ImageRadius`] || 'rounded-2xl';
          const imagePosition = (storySettings as any)[`section${num}ImagePosition`] || (num % 2 === 1 ? 'left' : 'right');

          if (!title && !content1 && !image) return null;

          const isImageLeft = imagePosition === 'left';

          return (
            <div key={num} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center mb-20 md:mb-28 max-w-6xl mx-auto px-4">
              {/* Photo Component */}
              {image && (
                <div 
                  style={{
                    '--m-w': imageMobileWidthPx ? `${imageMobileWidthPx}px` : '100%',
                    '--d-w': imageWidthPx ? `${imageWidthPx}px` : (
                      imageSize === 'max-w-xs' ? '320px' :
                      imageSize === 'max-w-sm' ? '384px' :
                      imageSize === 'max-w-md' ? '448px' :
                      imageSize === 'max-w-lg' ? '512px' :
                      imageSize === 'max-w-xl' ? '576px' : '100%'
                    )
                  } as React.CSSProperties}
                  className={`lg:col-span-5 w-full max-w-[var(--m-w)] lg:max-w-[var(--d-w)] mx-auto ${
                    isImageLeft ? 'order-1' : 'order-1 lg:order-2'
                  }`}
                >
                  <div className={`overflow-hidden shadow-md border border-warm-dark/10 bg-warm-light/40 w-full ${
                    imageRadius === 'rounded-none' ? 'rounded-none' :
                    imageRadius === 'rounded-xl' ? 'rounded-xl' :
                    imageRadius === 'rounded-3xl' ? 'rounded-3xl' :
                    'rounded-2xl'
                  } ${
                    imageAspectRatio === '4:5' ? 'aspect-[4/5]' :
                    imageAspectRatio === '3:4' ? 'aspect-[3/4]' :
                    imageAspectRatio === '16:9' ? 'aspect-[16/9]' :
                    imageAspectRatio === '3:2' ? 'aspect-[3/2]' :
                    imageAspectRatio === 'auto' ? 'aspect-auto' :
                    'aspect-square'
                  }`}>
                    <img
                      src={image}
                      alt={title || `Narrative Section ${num}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}

              {/* Text Component */}
              <div className={`${image ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4 text-left ${
                isImageLeft ? 'order-2' : 'order-2 lg:order-1'
              }`}>
                {title && (
                  <h2 
                    className="font-heading font-bold uppercase tracking-wider text-warm-accent"
                    style={{
                      fontSize: `${titleFontSize}px`
                    }}
                  >
                    {formatRichText(title)}
                  </h2>
                )}
                {content1 && (
                  <p 
                    className="text-warm-dark/75 font-serif leading-relaxed whitespace-pre-line"
                    style={{
                      fontSize: `${contentFontSize}px`
                    }}
                  >
                    {formatRichText(content1)}
                  </p>
                )}
                {content2 && (
                  <p 
                    className="text-warm-dark/75 font-serif leading-relaxed whitespace-pre-line"
                    style={{
                      fontSize: `${contentFontSize}px`
                    }}
                  >
                    {formatRichText(content2)}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* Heritage Quote Block */}
        {storySettings.bottomQuote && (
          <div className="text-center max-w-3xl mx-auto px-4 mt-16 md:mt-24 mb-12 space-y-4">
            <div className="heritage-divider text-warm-accent w-full max-w-[140px] mx-auto">✻</div>
            <h2 
              className={`leading-relaxed text-warm-dark/90 ${
                storySettings.bottomQuoteFontFamily === 'font-serif' ? 'font-serif' :
                storySettings.bottomQuoteFontFamily === 'font-cormorant' ? 'font-serif italic font-light tracking-wide' :
                storySettings.bottomQuoteFontFamily === 'font-heading' ? 'font-heading font-semibold uppercase tracking-wider' :
                storySettings.bottomQuoteFontFamily === 'font-sans' ? 'font-sans font-medium' :
                'font-serif italic'
              }`}
              style={{
                fontSize: storySettings.bottomQuoteFontSize 
                  ? `${storySettings.bottomQuoteFontSize}px` 
                  : '28px'
              }}
            >
              {formatRichText(storySettings.bottomQuote)}
            </h2>
          </div>
        )}
      </motion.div>
    </div>
  );
}

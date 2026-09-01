import React, { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle2, Globe, Phone, Mail, Bell, ShieldCheck, Image as ImageIcon, Trash2, BookOpen } from 'lucide-react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { supabase } from '../../supabase';
import { usePopups } from '../../context/PopupContext';

export default function Settings() {
  const { showAlert, showToast } = usePopups();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'story'>('general');
  
  const [settings, setSettings] = useState({
    companyName: 'Kaaram Kathalu',
    supportEmail: 'kaaram.kathalu2025@gmail.com',
    supportPhone: '+91 76766 44366',
    address: '002 Ground Floor Spoorthi Vaibhava Apartment, 6th A Cross Trinity Enclave, Banjara Layout, Horamavu, Bangalore, Karnataka - 560043',
    announcementText: '🔥 New Season Avakaya Pickles Are Here! Free Shipping on Orders Above ₹999.',
    isMaintenanceMode: false,
    heroTag: 'Handmade Traditions',
    heroTitle: 'Savour the Heritage.',
    heroTitleFontSize: 48,
    heroDescription: 'Handcrafted Andhra pickles, Gongura, Avakaya, and aromatic spice podis made with pure ingredients, cold-pressed oils, and zero preservatives. Every bite tells a story.',
    heroButtonText: 'Shop Pickles & Podis',
    heroBgImage1: '',
    heroBgImage2: '',
    heroBgImage3: '',
    heroMobileBgImage1: '',
    heroMobileBgImage2: '',
    heroMobileBgImage3: '',
    heroOverlayOpacity: '30',
    bestsellersTag: 'Curated Favorites',
    bestsellersTitle: 'Our Bestsellers',
    bestsellersDescription: 'Bold flavors. Time-honored recipes. Made with love, enjoyed by all.',
    testimonialsTag: 'Loved by Food Lovers',
    testimonialsTitle: 'What Our Customers Say',
    testimonialsDescription: 'Cherished words from homes across India celebrating authentic Andhra flavors.',
    delhiveryWarehouseName: 'Kaaram Kathalu',
    activeCategories: {
      pickle: true,
      podi: true,
      snacks: true,
      fryums: true,
      bundle: true
    },
    valueProps: [
      {
        id: '1',
        title: 'Farm-Fresh Flavors',
        description: 'We are dedicated to making products bursting with authentic, rich flavours. Our commitment to using fresh, natural ingredients from local farmers guarantees a truly delicious taste in every bite.',
        enabled: true
      },
      {
        id: '2',
        title: 'Quality You Can Taste',
        description: "We don't compromise on quality. Every bite reflects our commitment to using the finest ingredients. We source fresh seasonal offerings, ensuring peak flavor and support local farmers. We sample before we use ingredients.",
        enabled: true
      },
      {
        id: '3',
        title: 'Seasonal Availability',
        description: 'The journey of the fresh ingredients, from the farm directly into your product, highlights the connection to quality, traditional preservation and the authentic, seasonal taste without chemicals.',
        enabled: true
      },
      {
        id: '4',
        title: 'Traditional Stoneware Ground',
        description: 'Prepared using age-old stoneware methods to preserve authentic coastal Andhra textures, distinct crunch, and rich aromatic oils.',
        enabled: false
      },
      {
        id: '5',
        title: 'Zero Preservatives & Additives',
        description: '100% pure natural ingredients without artificial chemical preservatives, synthetic food colours, or artificial taste enhancers.',
        enabled: false
      }
    ],
    testimonials: [
      {
        id: '1',
        author: 'Sunitha Reddy',
        location: 'Hyderabad',
        product: 'Avakaya Pickle',
        quote: "The Avakaya pickle transported me straight back to my grandmother's house in Rajahmundry. Perfect oil balance, crunch, and authentic spice heat!",
        rating: 5,
        enabled: true
      },
      {
        id: '2',
        author: 'Karthik Rao',
        location: 'Bengaluru',
        product: 'Pappula Podi Gun Powder',
        quote: "Hands down the best Karampodi and Pappula Podi I've ordered online. Pure homemade aroma with hot steaming rice and a dollop of ghee.",
        rating: 5,
        enabled: true
      },
      {
        id: '3',
        author: 'Venkatesh V.',
        location: 'Chennai',
        product: 'Boneless Chicken Pickle',
        quote: "Authentic Andhra boneless chicken pickle that doesn't compromise on freshness, tenderness, or quality. 10/10 flavor profile.",
        rating: 5,
        enabled: true
      },
      {
        id: '4',
        author: 'Ananya Sharma',
        location: 'Mumbai',
        product: 'Gongura Pickle',
        quote: "Incredible tangy Gongura taste! Brings true coastal Andhra flavors right to my dining table in Mumbai.",
        rating: 5,
        enabled: false
      },
      {
        id: '5',
        author: 'Rajesh Naidu',
        location: 'Vijayawada',
        product: 'Idli Karam Podi',
        quote: "Fresh roasted aroma, zero chemicals, pure traditional flavor. Our entire family loves it for morning breakfast.",
        rating: 5,
        enabled: false
      },
      {
        id: '6',
        author: 'Deepthi P.',
        location: 'Visakhapatnam',
        product: 'Tomato Pickle',
        quote: "The perfect homemade consistency and punchy garlic tadka. Reminds me of traditional summer vacations.",
        rating: 5,
        enabled: false
      },
      {
        id: '7',
        author: 'Sravan Kumar',
        location: 'Dallas (USA)',
        product: 'Boneless Mutton Pickle',
        quote: "Ordered from the US for my parents and they couldn't stop praising the authenticity. Perfectly cooked and packed.",
        rating: 5,
        enabled: false
      },
      {
        id: '8',
        author: 'Madhavi Latha',
        location: 'Guntur',
        product: 'Nalla Karam Podi',
        quote: "Authentic Guntur spice blend that is impossible to find elsewhere. Zero artificial preservatives makes it so healthy.",
        rating: 5,
        enabled: false
      },
      {
        id: '9',
        author: 'Rohit Varma',
        location: 'Pune',
        product: 'Prawns Pickle',
        quote: "Juicy prawns with balanced coastal masala. Arrived in leak-proof packaging and stayed ultra fresh.",
        rating: 5,
        enabled: false
      },
      {
        id: '10',
        author: 'Sai Teja',
        location: 'Hyderabad',
        product: 'Kandi Podi',
        quote: "Wholesome, comforting, and packed with traditional flavours. A permanent staple in our pantry.",
        rating: 5,
        enabled: false
      }
    ]
  });

  const [hero1File, setHero1File] = useState<File | null>(null);
  const [hero1Preview, setHero1Preview] = useState<string | null>(null);
  const [hero1Tab, setHero1Tab] = useState<'upload' | 'url'>('upload');

  const [hero2File, setHero2File] = useState<File | null>(null);
  const [hero2Preview, setHero2Preview] = useState<string | null>(null);
  const [hero2Tab, setHero2Tab] = useState<'upload' | 'url'>('upload');

  const [hero3File, setHero3File] = useState<File | null>(null);
  const [hero3Preview, setHero3Preview] = useState<string | null>(null);
  const [hero3Tab, setHero3Tab] = useState<'upload' | 'url'>('upload');

  const [heroMobile1File, setHeroMobile1File] = useState<File | null>(null);
  const [heroMobile1Preview, setHeroMobile1Preview] = useState<string | null>(null);
  const [heroMobile1Tab, setHeroMobile1Tab] = useState<'upload' | 'url'>('upload');

  const [heroMobile2File, setHeroMobile2File] = useState<File | null>(null);
  const [heroMobile2Preview, setHeroMobile2Preview] = useState<string | null>(null);
  const [heroMobile2Tab, setHeroMobile2Tab] = useState<'upload' | 'url'>('upload');

  const [heroMobile3File, setHeroMobile3File] = useState<File | null>(null);
  const [heroMobile3Preview, setHeroMobile3Preview] = useState<string | null>(null);
  const [heroMobile3Tab, setHeroMobile3Tab] = useState<'upload' | 'url'>('upload');

  const [storySettings, setStorySettings] = useState({
    dictWord: 'Kaaram Kathalu',
    dictNativeScript: 'కారం కథలు',
    dictPhonetic: '[kā ka:tha]',
    dictPart1: 'noun',
    dictDef1: 'Stories of spice, food, and heritage.',
    dictBreakdown1: 'కారం — Spice',
    dictBreakdown2: 'కథలు — Stories',
    dictPart2: '',
    dictDef2: '',
    title: 'Our Story',
    introParagraph1: "At Kaaram Kathalu, we are more than just a brand. We are storytellers preserving the vibrant tapestry of Andhra's rich history, architectural marvels, and culinary traditions.",
    introParagraph2: "Our roots return to the lush fields of coastal Andhra Pradesh, and our palates still crave those hearty meals at ancestral homes. What began in sun-kissed courtyards with hand-ground spices continues today with pure ingredients, cold-pressed oils, and zero preservatives.",
    subtitle: 'Storytellers preserving the vibrant tapestry of Andhra\'s rich history, architectural marvels, and culinary traditions.',
    legacyTitle: 'Our Heritage',
    bannerImage: '',
    
    section1Title: 'Allure of South Indian Heritage',
    section1Quote: '"At Kaaram Kathalu, we are more than just a brand. We are storytellers, preserving the vibrant tapestry of Andhra\'s rich history, culture, and traditions."',
    section1Content: 'Our roots return to the lush fields of coastal Andhra Pradesh, and our palates still crave those hearty meals at ancestral homes, traditionally known for bringing families together in courtyards, which dotted every village. There, in the sun-kissed courtyard, grandmothers and mothers spent afternoons grinding spices to a fine podi or powder and pickling fruits and vegetables into irreplaceable staples.',
    section1Image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
    
    section2Title: 'The Courtyard Symphony',
    section2Content1: 'Their furtive hands, busy with the rokali banda or stone mortar and pestle, produced a constant hum that would mingle with their chattering voices. Children scurried around them, playing hide and seek or hunting for a quiet corner for a game of caroms. And the air was filled with delicious promise – whiffs of ginger, garlic, mustard, sesame, chili, lemon, curry leaf and so much more wafted through the house.',
    section2Content2: 'As times changed, afternoons like these slowly started disappearing. We cannot save those old homes or hold onto the ways of life they sustained, but we can certainly keep their food alive! And that’s exactly what we, at Kaaram Kathalu, intend to do. Just like the tall ornate wooden pillars, we stand as guardians of the region\'s cultural heritage.',
    section2Image: 'https://themanduvaproject.in/cdn/shop/files/Manduvawebsitepicture_1.png?v=1749711321&width=533',
    
    foundersTitle: 'Usha Sarvarayalu & Neha Alluri',
    foundersSubtitle: 'Co-Founders & Mission',
    foundersContent: 'Co-founded by Usha Sarvarayalu and Neha Alluri, Kaaram Kathalu emerged from a desire to keep the food traditions of Andhra Pradesh alive. The production is largely driven by local women, supporting rural livelihoods in traditional kitchens across villages like Annadevarapeta and Uppalametta.',
    foundersBadges: 'Artisanal & Small Batch, Preservative Free, Supporting Women-led Kitchens',
    bottomQuote: '"Come, embark on a sensory journey that transports you to the sun-kissed plains and lush green landscapes of Andhra Pradesh. Immerse yourself in the kaleidoscope of flavours passed down through generations."'
  });

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerTab, setBannerTab] = useState<'upload' | 'url'>('upload');

  const [sec1File, setSec1File] = useState<File | null>(null);
  const [sec1Preview, setSec1Preview] = useState<string | null>(null);
  const [sec1Tab, setSec1Tab] = useState<'upload' | 'url'>('upload');

  const [sec2File, setSec2File] = useState<File | null>(null);
  const [sec2Preview, setSec2Preview] = useState<string | null>(null);
  const [sec2Tab, setSec2Tab] = useState<'upload' | 'url'>('upload');

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchAllSettings = async () => {
      try {
        const generalRef = doc(db, 'settings', 'general');
        const generalSnap = await getDoc(generalRef);
        if (generalSnap.exists()) {
          const data = generalSnap.data();
          
          const defaultProps = [
            {
              id: '1',
              title: 'Farm-Fresh Flavors',
              description: 'We are dedicated to making products bursting with authentic, rich flavours. Our commitment to using fresh, natural ingredients from local farmers guarantees a truly delicious taste in every bite.',
              enabled: true
            },
            {
              id: '2',
              title: 'Quality You Can Taste',
              description: "We don't compromise on quality. Every bite reflects our commitment to using the finest ingredients. We source fresh seasonal offerings, ensuring peak flavor and support local farmers. We sample before we use ingredients.",
              enabled: true
            },
            {
              id: '3',
              title: 'Seasonal Availability',
              description: 'The journey of the fresh ingredients, from the farm directly into your product, highlights the connection to quality, traditional preservation and the authentic, seasonal taste without chemicals.',
              enabled: true
            },
            {
              id: '4',
              title: 'Traditional Stoneware Ground',
              description: 'Prepared using age-old stoneware methods to preserve authentic coastal Andhra textures, distinct crunch, and rich aromatic oils.',
              enabled: false
            },
            {
              id: '5',
              title: 'Zero Preservatives & Additives',
              description: '100% pure natural ingredients without artificial chemical preservatives, synthetic food colours, or artificial taste enhancers.',
              enabled: false
            }
          ];

          let mergedValueProps = defaultProps;
          if (Array.isArray(data?.valueProps) && data.valueProps.length > 0) {
            mergedValueProps = defaultProps.map((defItem, idx) => {
              const existing = data.valueProps.find((p: any) => p.id === defItem.id || p.id === String(idx + 1)) || data.valueProps[idx];
              return existing ? { ...defItem, ...existing } : defItem;
            });
          }

          const defaultTestimonials = [
            {
              id: '1',
              author: 'Sunitha Reddy',
              location: 'Hyderabad',
              product: 'Avakaya Pickle',
              quote: "The Avakaya pickle transported me straight back to my grandmother's house in Rajahmundry. Perfect oil balance, crunch, and authentic spice heat!",
              rating: 5,
              enabled: true
            },
            {
              id: '2',
              author: 'Karthik Rao',
              location: 'Bengaluru',
              product: 'Pappula Podi Gun Powder',
              quote: "Hands down the best Karampodi and Pappula Podi I've ordered online. Pure homemade aroma with hot steaming rice and a dollop of ghee.",
              rating: 5,
              enabled: true
            },
            {
              id: '3',
              author: 'Venkatesh V.',
              location: 'Chennai',
              product: 'Boneless Chicken Pickle',
              quote: "Authentic Andhra boneless chicken pickle that doesn't compromise on freshness, tenderness, or quality. 10/10 flavor profile.",
              rating: 5,
              enabled: true
            },
            {
              id: '4',
              author: 'Ananya Sharma',
              location: 'Mumbai',
              product: 'Gongura Pickle',
              quote: "Incredible tangy Gongura taste! Brings true coastal Andhra flavors right to my dining table in Mumbai.",
              rating: 5,
              enabled: false
            },
            {
              id: '5',
              author: 'Rajesh Naidu',
              location: 'Vijayawada',
              product: 'Idli Karam Podi',
              quote: "Fresh roasted aroma, zero chemicals, pure traditional flavor. Our entire family loves it for morning breakfast.",
              rating: 5,
              enabled: false
            },
            {
              id: '6',
              author: 'Deepthi P.',
              location: 'Visakhapatnam',
              product: 'Tomato Pickle',
              quote: "The perfect homemade consistency and punchy garlic tadka. Reminds me of traditional summer vacations.",
              rating: 5,
              enabled: false
            },
            {
              id: '7',
              author: 'Sravan Kumar',
              location: 'Dallas (USA)',
              product: 'Boneless Mutton Pickle',
              quote: "Ordered from the US for my parents and they couldn't stop praising the authenticity. Perfectly cooked and packed.",
              rating: 5,
              enabled: false
            },
            {
              id: '8',
              author: 'Madhavi Latha',
              location: 'Guntur',
              product: 'Nalla Karam Podi',
              quote: "Authentic Guntur spice blend that is impossible to find elsewhere. Zero artificial preservatives makes it so healthy.",
              rating: 5,
              enabled: false
            },
            {
              id: '9',
              author: 'Rohit Varma',
              location: 'Pune',
              product: 'Prawns Pickle',
              quote: "Juicy prawns with balanced coastal masala. Arrived in leak-proof packaging and stayed ultra fresh.",
              rating: 5,
              enabled: false
            },
            {
              id: '10',
              author: 'Sai Teja',
              location: 'Hyderabad',
              product: 'Kandi Podi',
              quote: "Wholesome, comforting, and packed with traditional flavours. A permanent staple in our pantry.",
              rating: 5,
              enabled: false
            }
          ];

          let mergedTestimonials = defaultTestimonials;
          if (Array.isArray(data?.testimonials) && data.testimonials.length > 0) {
            mergedTestimonials = defaultTestimonials.map((defItem, idx) => {
              const existing = data.testimonials.find((t: any) => t.id === defItem.id || t.id === String(idx + 1)) || data.testimonials[idx];
              return existing ? { ...defItem, ...existing } : defItem;
            });
          }

          setSettings(prev => ({
            ...prev,
            ...data,
            valueProps: mergedValueProps,
            testimonials: mergedTestimonials,
            activeCategories: {
              ...prev.activeCategories,
              ...(data?.activeCategories || {})
            }
          }));
        }
        
        const storyRef = doc(db, 'settings', 'story');
        const storySnap = await getDoc(storyRef);
        if (storySnap.exists()) {
          setStorySettings(storySnap.data() as any);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllSettings();
  }, []);

  useEffect(() => {
    if (storySettings.bannerImage) {
      setBannerTab(storySettings.bannerImage.includes('supabase.co') ? 'upload' : 'url');
    }
    if (storySettings.section1Image) {
      setSec1Tab(storySettings.section1Image.includes('supabase.co') ? 'upload' : 'url');
    }
    if (storySettings.section2Image) {
      setSec2Tab(storySettings.section2Image.includes('supabase.co') ? 'upload' : 'url');
    }
  }, [storySettings]);

  useEffect(() => {
    if (settings.heroBgImage1) {
      setHero1Tab(settings.heroBgImage1.includes('supabase.co') ? 'upload' : 'url');
    }
    if (settings.heroBgImage2) {
      setHero2Tab(settings.heroBgImage2.includes('supabase.co') ? 'upload' : 'url');
    }
    if (settings.heroBgImage3) {
      setHero3Tab(settings.heroBgImage3.includes('supabase.co') ? 'upload' : 'url');
    }
    if (settings.heroMobileBgImage1) {
      setHeroMobile1Tab(settings.heroMobileBgImage1.includes('supabase.co') ? 'upload' : 'url');
    }
    if (settings.heroMobileBgImage2) {
      setHeroMobile2Tab(settings.heroMobileBgImage2.includes('supabase.co') ? 'upload' : 'url');
    }
    if (settings.heroMobileBgImage3) {
      setHeroMobile3Tab(settings.heroMobileBgImage3.includes('supabase.co') ? 'upload' : 'url');
    }
  }, [
    settings.heroBgImage1, 
    settings.heroBgImage2, 
    settings.heroBgImage3, 
    settings.heroMobileBgImage1, 
    settings.heroMobileBgImage2, 
    settings.heroMobileBgImage3
  ]);

  const uploadImage = async (file: File, pathPrefix: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${pathPrefix}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      if (activeTab === 'general') {
        setIsUploading(true);
        let updatedGeneral = { ...settings };

        if (hero1File && hero1Tab === 'upload') {
          updatedGeneral.heroBgImage1 = await uploadImage(hero1File, 'hero');
        }
        if (hero2File && hero2Tab === 'upload') {
          updatedGeneral.heroBgImage2 = await uploadImage(hero2File, 'hero');
        }
        if (hero3File && hero3Tab === 'upload') {
          updatedGeneral.heroBgImage3 = await uploadImage(hero3File, 'hero');
        }
        if (heroMobile1File && heroMobile1Tab === 'upload') {
          updatedGeneral.heroMobileBgImage1 = await uploadImage(heroMobile1File, 'hero');
        }
        if (heroMobile2File && heroMobile2Tab === 'upload') {
          updatedGeneral.heroMobileBgImage2 = await uploadImage(heroMobile2File, 'hero');
        }
        if (heroMobile3File && heroMobile3Tab === 'upload') {
          updatedGeneral.heroMobileBgImage3 = await uploadImage(heroMobile3File, 'hero');
        }

        setIsUploading(false);

        await setDoc(doc(db, 'settings', 'general'), {
          ...updatedGeneral,
          updatedAt: serverTimestamp()
        });

        setSettings(updatedGeneral);
        setHero1File(null);
        setHero2File(null);
        setHero3File(null);
        setHeroMobile1File(null);
        setHeroMobile2File(null);
        setHeroMobile3File(null);
      } else {
        setIsUploading(true);
        let updatedStory = { ...storySettings };

        if (bannerFile && bannerTab === 'upload') {
          updatedStory.bannerImage = await uploadImage(bannerFile, 'story');
        }
        if (sec1File && sec1Tab === 'upload') {
          updatedStory.section1Image = await uploadImage(sec1File, 'story');
        }
        if (sec2File && sec2Tab === 'upload') {
          updatedStory.section2Image = await uploadImage(sec2File, 'story');
        }

        setIsUploading(false);

        await setDoc(doc(db, 'settings', 'story'), {
          ...updatedStory,
          updatedAt: serverTimestamp()
        });
        
        setStorySettings(updatedStory);
        setBannerFile(null);
        setSec1File(null);
        setSec2File(null);
      }
      showToast("Settings saved successfully!", "success");
    } catch (error: any) {
      console.error("Error saving settings:", error);
      showAlert("Failed to save settings: " + (error?.message || error?.error_description || JSON.stringify(error)), "Error");
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-warm-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="bg-warm-light p-6 rounded-2xl border border-warm-dark/5 shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-warm-dark">Store Ledger & Config</h2>
          <p className="text-sm text-warm-dark/60 mt-1 font-serif">Configure the storefront settings and branding details.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-warm-dark/10 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'general'
              ? 'border-warm-accent text-warm-dark font-black'
              : 'border-transparent text-warm-dark/40 hover:text-warm-dark'
          }`}
        >
          <Globe className="w-4.5 h-4.5" /> General Settings
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('story')}
          className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'story'
              ? 'border-warm-accent text-warm-dark font-black'
              : 'border-transparent text-warm-dark/40 hover:text-warm-dark'
          }`}
        >
          <BookOpen className="w-4.5 h-4.5" /> Our Story Page
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {activeTab === 'general' ? (
          <>
            {/* Business Info */}
            <div className="bg-white border border-warm-dark/5 rounded-[24px] overflow-hidden shadow-sm">
              <div className="bg-warm-light/60 p-4 border-b border-warm-dark/5 flex items-center gap-2">
                <Globe className="w-5 h-5 text-warm-dark" />
                <h2 className="font-serif font-semibold text-warm-dark uppercase tracking-widest text-sm">Business Identity</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Company Name</label>
                  <input 
                    type="text" 
                    value={settings.companyName}
                    onChange={e => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif focus:border-warm-accent transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Support Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-dark/30" />
                    <input 
                      type="text" 
                      value={settings.supportPhone}
                      onChange={e => setSettings(prev => ({ ...prev, supportPhone: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif focus:border-warm-accent transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Support Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-dark/30" />
                    <input 
                      type="email" 
                      value={settings.supportEmail}
                      onChange={e => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif focus:border-warm-accent transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Store Address</label>
                  <input 
                    type="text" 
                    value={settings.address}
                    onChange={e => setSettings(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif focus:border-warm-accent transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Delhivery Pickup Warehouse Name</label>
                  <input 
                    type="text" 
                    value={settings.delhiveryWarehouseName || ''}
                    placeholder="e.g. Horamavu"
                    onChange={e => setSettings(prev => ({ ...prev, delhiveryWarehouseName: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif focus:border-warm-accent transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Storefront Features */}
            <div className="bg-white border border-warm-dark/5 rounded-[24px] overflow-hidden shadow-sm">
              <div className="bg-warm-light/60 p-4 border-b border-warm-dark/5 flex items-center gap-2">
                <Bell className="w-5 h-5 text-warm-dark" />
                <h2 className="font-serif font-semibold text-warm-dark uppercase tracking-widest text-sm">Storefront Features</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Announcement Bar Text</label>
                  <textarea 
                    rows={2}
                    value={settings.announcementText}
                    onChange={e => setSettings(prev => ({ ...prev, announcementText: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif resize-none focus:border-warm-accent transition-colors"
                  />
                </div>
                
                <div className="flex items-center justify-between p-5 bg-warm-light rounded-2xl border border-dashed border-warm-dark/10">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-warm-dark/40" />
                    <div>
                      <h4 className="font-serif font-bold text-warm-dark">Maintenance Mode</h4>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-warm-dark/45">Disable storefront for visitors</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, isMaintenanceMode: !prev.isMaintenanceMode }))}
                    className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${settings.isMaintenanceMode ? 'bg-warm-accent' : 'bg-warm-dark/20'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.isMaintenanceMode ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Storefront Categories */}
            <div className="bg-white border border-warm-dark/5 rounded-[24px] overflow-hidden shadow-sm">
              <div className="bg-warm-light/60 p-4 border-b border-warm-dark/5 flex items-center gap-2">
                <Globe className="w-5 h-5 text-warm-dark" />
                <h2 className="font-serif font-semibold text-warm-dark uppercase tracking-widest text-sm">Active Storefront Categories</h2>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-xs font-serif italic text-warm-dark/50 leading-relaxed mb-2">
                  Toggle categories on or off. Disabled categories will be hidden from the storefront product list.
                </p>
                
                {[
                  { id: 'pickle', label: 'Pickles' },
                  { id: 'podi', label: 'Podis' },
                  { id: 'snacks', label: 'Snacks' },
                  { id: 'fryums', label: 'Fryums' },
                  { id: 'bundle', label: 'Bundles' }
                ].map(cat => {
                  const isActive = settings.activeCategories?.[cat.id as keyof typeof settings.activeCategories] !== false;
                  return (
                    <div key={cat.id} className="flex items-center justify-between p-4 bg-warm-light/50 rounded-xl border border-warm-dark/5">
                      <div className="flex items-center gap-3">
                        <span className="font-serif font-bold text-warm-dark text-sm">{cat.label}</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setSettings(prev => ({ 
                          ...prev, 
                          activeCategories: {
                            ...prev.activeCategories,
                            [cat.id]: !isActive
                          }
                        }))}
                        className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${isActive ? 'bg-warm-accent' : 'bg-warm-dark/20'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isActive ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Homepage Hero Settings */}
            <div className="bg-white border border-warm-dark/5 rounded-[24px] overflow-hidden shadow-sm">
              <div className="bg-warm-light/60 p-4 border-b border-warm-dark/5 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-warm-dark" />
                <h2 className="font-serif font-semibold text-warm-dark uppercase tracking-widest text-sm">Homepage Hero Slideshow</h2>
              </div>
              <div className="p-6 space-y-8">
                {/* Hero Banner Sentences */}
                <div className="space-y-4 pt-2">
                  <h3 className="font-serif font-bold text-warm-dark text-base border-b border-warm-dark/5 pb-2">Hero Banner Copy & Sentences</h3>
                  
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60 block mb-1">Sub-Heading Tag</label>
                    <input 
                      type="text" 
                      value={settings.heroTag || 'Handmade Traditions'}
                      onChange={e => setSettings(prev => ({ ...prev, heroTag: e.target.value }))}
                      placeholder="e.g. Handmade Traditions"
                      className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif focus:border-warm-accent transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60 block mb-1">Main Banner Headline</label>
                    <input 
                      type="text" 
                      value={settings.heroTitle || 'Savour the Heritage.'}
                      onChange={e => setSettings(prev => ({ ...prev, heroTitle: e.target.value }))}
                      placeholder="e.g. Savour the Heritage."
                      className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif text-lg font-bold focus:border-warm-accent transition-colors"
                    />
                  </div>

                  {/* Hero Headline Font Size Slider */}
                  <div className="bg-warm-light/40 p-4 rounded-2xl border border-warm-dark/5 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/70">Headline Font Size</label>
                      <span className="text-xs font-mono font-bold bg-warm-accent/10 text-warm-accent px-2.5 py-1 rounded-md">
                        {settings.heroTitleFontSize || 48}px
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-warm-dark/40">24px</span>
                      <input 
                        type="range"
                        min="24"
                        max="72"
                        step="2"
                        value={settings.heroTitleFontSize || 48}
                        onChange={e => setSettings(prev => ({ ...prev, heroTitleFontSize: Number(e.target.value) }))}
                        className="w-full accent-warm-accent cursor-pointer h-2 bg-warm-dark/10 rounded-lg appearance-none"
                      />
                      <span className="text-[11px] font-mono text-warm-dark/40">72px</span>
                    </div>
                    <div className="pt-2 text-[11px] font-serif italic text-warm-dark/60">
                      Live preview of headline scale:
                      <div 
                        className="font-serif font-bold text-warm-dark leading-tight mt-1 truncate"
                        style={{ fontSize: `${Math.min(Math.max(Number(settings.heroTitleFontSize || 48) * 0.65, 18), 38)}px` }}
                      >
                        {settings.heroTitle || 'Savour the Heritage.'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60 block mb-1">Narrative Description Paragraph</label>
                    <textarea 
                      rows={3}
                      value={settings.heroDescription || 'Handcrafted Andhra pickles, Gongura, Avakaya, and aromatic spice podis made with pure ingredients, cold-pressed oils, and zero preservatives. Every bite tells a story.'}
                      onChange={e => setSettings(prev => ({ ...prev, heroDescription: e.target.value }))}
                      placeholder="Handcrafted Andhra pickles, Gongura, Avakaya..."
                      className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif text-sm focus:border-warm-accent transition-colors leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60 block mb-1">Button Call-To-Action Text</label>
                    <input 
                      type="text" 
                      value={settings.heroButtonText || 'Shop Pickles & Podis'}
                      onChange={e => setSettings(prev => ({ ...prev, heroButtonText: e.target.value }))}
                      placeholder="e.g. Shop Pickles & Podis"
                      className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif focus:border-warm-accent transition-colors text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-warm-dark/5">
                  <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60 block">Dark Overlay Opacity ({settings.heroOverlayOpacity || '30'}%)</label>
                  <p className="text-[10px] text-warm-dark/50 font-serif">Adjust this to make text more readable against your background photos.</p>
                  <input 
                    type="range" 
                    min="0" 
                    max="90" 
                    step="5"
                    value={settings.heroOverlayOpacity || '30'}
                    onChange={e => setSettings(prev => ({ ...prev, heroOverlayOpacity: e.target.value }))}
                    className="w-full accent-warm-accent cursor-pointer mt-2"
                  />
                </div>

                {/* Background Image 1 */}
                <div className="space-y-3 pt-4 border-t border-warm-dark/5">
                  <label className="block text-xs font-bold uppercase tracking-widest text-warm-dark/60">Background Photo 1</label>
                  <div className="flex border-b border-warm-dark/10 mb-4 gap-4">
                    <button
                      type="button; button"
                      onClick={() => setHero1Tab('upload')}
                      className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                        hero1Tab === 'upload' ? 'border-warm-accent text-warm-dark font-black' : 'border-transparent text-warm-dark/40'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setHero1Tab('url')}
                      className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                        hero1Tab === 'url' ? 'border-warm-accent text-warm-dark font-black' : 'border-transparent text-warm-dark/40'
                      }`}
                    >
                      Paste URL
                    </button>
                  </div>
                  {hero1Tab === 'upload' ? (
                    <div className="space-y-4">
                      {hero1Preview || (settings.heroBgImage1 && !hero1File && settings.heroBgImage1 !== '') ? (
                        <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden border border-warm-dark/10 shadow-sm bg-warm-light flex items-center justify-center">
                          <img src={hero1Preview || settings.heroBgImage1} alt="Hero 1 Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <button 
                            type="button"
                            onClick={() => { setHero1File(null); setHero1Preview(null); setSettings(prev => ({ ...prev, heroBgImage1: '' })); }}
                            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-warm-accent rounded-full shadow-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => document.getElementById('hero1-upload')?.click()}
                          className="border-2 border-dashed border-warm-dark/15 bg-warm-bg/5 hover:bg-warm-accent/5 hover:border-warm-accent transition-all rounded-xl py-6 flex flex-col items-center justify-center cursor-pointer min-h-[140px]"
                        >
                          <ImageIcon className="w-8 h-8 text-warm-dark/30 mb-2" />
                          <span className="text-xs font-bold uppercase tracking-wider text-warm-dark/50">Upload Hero Image 1</span>
                          <input 
                            id="hero1-upload"
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) { setHero1File(file); setHero1Preview(URL.createObjectURL(file)); }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <input 
                      type="text" 
                      value={settings.heroBgImage1}
                      onChange={e => setSettings(prev => ({ ...prev, heroBgImage1: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif focus:border-warm-accent transition-colors"
                      placeholder="https://..."
                    />
                  )}
                </div>

                {/* Background Image 2 */}
                <div className="space-y-3 pt-4 border-t border-warm-dark/5">
                  <label className="block text-xs font-bold uppercase tracking-widest text-warm-dark/60">Background Photo 2</label>
                  <div className="flex border-b border-warm-dark/10 mb-4 gap-4">
                    <button
                      type="button"
                      onClick={() => setHero2Tab('upload')}
                      className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                        hero2Tab === 'upload' ? 'border-warm-accent text-warm-dark font-black' : 'border-transparent text-warm-dark/40'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setHero2Tab('url')}
                      className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                        hero2Tab === 'url' ? 'border-warm-accent text-warm-dark font-black' : 'border-transparent text-warm-dark/40'
                      }`}
                    >
                      Paste URL
                    </button>
                  </div>
                  {hero2Tab === 'upload' ? (
                    <div className="space-y-4">
                      {hero2Preview || (settings.heroBgImage2 && !hero2File && settings.heroBgImage2 !== '') ? (
                        <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden border border-warm-dark/10 shadow-sm bg-warm-light flex items-center justify-center">
                          <img src={hero2Preview || settings.heroBgImage2} alt="Hero 2 Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <button 
                            type="button"
                            onClick={() => { setHero2File(null); setHero2Preview(null); setSettings(prev => ({ ...prev, heroBgImage2: '' })); }}
                            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-warm-accent rounded-full shadow-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => document.getElementById('hero2-upload')?.click()}
                          className="border-2 border-dashed border-warm-dark/15 bg-warm-bg/5 hover:bg-warm-accent/5 hover:border-warm-accent transition-all rounded-xl py-6 flex flex-col items-center justify-center cursor-pointer min-h-[140px]"
                        >
                          <ImageIcon className="w-8 h-8 text-warm-dark/30 mb-2" />
                          <span className="text-xs font-bold uppercase tracking-wider text-warm-dark/50">Upload Hero Image 2</span>
                          <input 
                            id="hero2-upload"
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) { setHero2File(file); setHero2Preview(URL.createObjectURL(file)); }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <input 
                      type="text" 
                      value={settings.heroBgImage2}
                      onChange={e => setSettings(prev => ({ ...prev, heroBgImage2: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif focus:border-warm-accent transition-colors"
                      placeholder="https://..."
                    />
                  )}
                </div>

                {/* Background Image 3 */}
                <div className="space-y-3 pt-4 border-t border-warm-dark/5">
                  <label className="block text-xs font-bold uppercase tracking-widest text-warm-dark/60">Background Photo 3</label>
                  <div className="flex border-b border-warm-dark/10 mb-4 gap-4">
                    <button
                      type="button"
                      onClick={() => setHero3Tab('upload')}
                      className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                        hero3Tab === 'upload' ? 'border-warm-accent text-warm-dark font-black' : 'border-transparent text-warm-dark/40'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setHero3Tab('url')}
                      className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                        hero3Tab === 'url' ? 'border-warm-accent text-warm-dark font-black' : 'border-transparent text-warm-dark/40'
                      }`}
                    >
                      Paste URL
                    </button>
                  </div>
                  {hero3Tab === 'upload' ? (
                    <div className="space-y-4">
                      {hero3Preview || (settings.heroBgImage3 && !hero3File && settings.heroBgImage3 !== '') ? (
                        <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden border border-warm-dark/10 shadow-sm bg-warm-light flex items-center justify-center">
                          <img src={hero3Preview || settings.heroBgImage3} alt="Hero 3 Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <button 
                            type="button"
                            onClick={() => { setHero3File(null); setHero3Preview(null); setSettings(prev => ({ ...prev, heroBgImage3: '' })); }}
                            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-warm-accent rounded-full shadow-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => document.getElementById('hero3-upload')?.click()}
                          className="border-2 border-dashed border-warm-dark/15 bg-warm-bg/5 hover:bg-warm-accent/5 hover:border-warm-accent transition-all rounded-xl py-6 flex flex-col items-center justify-center cursor-pointer min-h-[140px]"
                        >
                          <ImageIcon className="w-8 h-8 text-warm-dark/30 mb-2" />
                          <span className="text-xs font-bold uppercase tracking-wider text-warm-dark/50">Upload Hero Image 3</span>
                          <input 
                            id="hero3-upload"
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) { setHero3File(file); setHero3Preview(URL.createObjectURL(file)); }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <input 
                      type="text" 
                      value={settings.heroBgImage3}
                      onChange={e => setSettings(prev => ({ ...prev, heroBgImage3: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif focus:border-warm-accent transition-colors"
                      placeholder="https://..."
                    />
                  )}
                </div>

                {/* Mobile Cover Banners Section */}
                <div className="pt-6 border-t-2 border-warm-dark/10 mt-6">
                  <h3 className="font-serif font-semibold text-warm-dark uppercase tracking-widest text-sm mb-4">Mobile Cover Banners (Aspect Ratio ~ 3:4 / Portrait)</h3>
                  
                  {/* Mobile Background Image 1 */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-widest text-warm-dark/60">Mobile Background Photo 1</label>
                    <div className="flex border-b border-warm-dark/10 mb-4 gap-4">
                      <button
                        type="button"
                        onClick={() => setHeroMobile1Tab('upload')}
                        className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                          heroMobile1Tab === 'upload' ? 'border-warm-accent text-warm-dark font-black' : 'border-transparent text-warm-dark/40'
                        }`}
                      >
                        Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeroMobile1Tab('url')}
                        className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                          heroMobile1Tab === 'url' ? 'border-warm-accent text-warm-dark font-black' : 'border-transparent text-warm-dark/40'
                        }`}
                      >
                        Paste URL
                      </button>
                    </div>
                    {heroMobile1Tab === 'upload' ? (
                      <div className="space-y-4">
                        {heroMobile1Preview || (settings.heroMobileBgImage1 && !heroMobile1File && settings.heroMobileBgImage1 !== '') ? (
                          <div className="relative w-44 aspect-[3/4] rounded-xl overflow-hidden border border-warm-dark/10 shadow-sm bg-warm-light flex items-center justify-center">
                            <img src={heroMobile1Preview || settings.heroMobileBgImage1} alt="Hero Mobile 1 Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <button 
                              type="button"
                              onClick={() => { setHeroMobile1File(null); setHeroMobile1Preview(null); setSettings(prev => ({ ...prev, heroMobileBgImage1: '' })); }}
                              className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-warm-accent rounded-full shadow-md transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div 
                            onClick={() => document.getElementById('heromobile1-upload')?.click()}
                            className="border-2 border-dashed border-warm-dark/15 bg-warm-bg/5 hover:bg-warm-accent/5 hover:border-warm-accent transition-all rounded-xl py-6 flex flex-col items-center justify-center cursor-pointer min-h-[120px]"
                          >
                            <ImageIcon className="w-6 h-6 text-warm-dark/30 mb-2" />
                            <span className="text-xs font-bold uppercase tracking-wider text-warm-dark/50">Upload Mobile Image 1</span>
                            <input 
                              id="heromobile1-upload"
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) { setHeroMobile1File(file); setHeroMobile1Preview(URL.createObjectURL(file)); }
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <input 
                        type="text" 
                        value={settings.heroMobileBgImage1}
                        onChange={e => setSettings(prev => ({ ...prev, heroMobileBgImage1: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif focus:border-warm-accent transition-colors"
                        placeholder="https://..."
                      />
                    )}
                  </div>

                  {/* Mobile Background Image 2 */}
                  <div className="space-y-3 pt-6 border-t border-warm-dark/5 mt-6">
                    <label className="block text-xs font-bold uppercase tracking-widest text-warm-dark/60">Mobile Background Photo 2</label>
                    <div className="flex border-b border-warm-dark/10 mb-4 gap-4">
                      <button
                        type="button"
                        onClick={() => setHeroMobile2Tab('upload')}
                        className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                          heroMobile2Tab === 'upload' ? 'border-warm-accent text-warm-dark font-black' : 'border-transparent text-warm-dark/40'
                        }`}
                      >
                        Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeroMobile2Tab('url')}
                        className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                          heroMobile2Tab === 'url' ? 'border-warm-accent text-warm-dark font-black' : 'border-transparent text-warm-dark/40'
                        }`}
                      >
                        Paste URL
                      </button>
                    </div>
                    {heroMobile2Tab === 'upload' ? (
                      <div className="space-y-4">
                        {heroMobile2Preview || (settings.heroMobileBgImage2 && !heroMobile2File && settings.heroMobileBgImage2 !== '') ? (
                          <div className="relative w-44 aspect-[3/4] rounded-xl overflow-hidden border border-warm-dark/10 shadow-sm bg-warm-light flex items-center justify-center">
                            <img src={heroMobile2Preview || settings.heroMobileBgImage2} alt="Hero Mobile 2 Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <button 
                              type="button"
                              onClick={() => { setHeroMobile2File(null); setHeroMobile2Preview(null); setSettings(prev => ({ ...prev, heroMobileBgImage2: '' })); }}
                              className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-warm-accent rounded-full shadow-md transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div 
                            onClick={() => document.getElementById('heromobile2-upload')?.click()}
                            className="border-2 border-dashed border-warm-dark/15 bg-warm-bg/5 hover:bg-warm-accent/5 hover:border-warm-accent transition-all rounded-xl py-6 flex flex-col items-center justify-center cursor-pointer min-h-[120px]"
                          >
                            <ImageIcon className="w-6 h-6 text-warm-dark/30 mb-2" />
                            <span className="text-xs font-bold uppercase tracking-wider text-warm-dark/50">Upload Mobile Image 2</span>
                            <input 
                              id="heromobile2-upload"
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) { setHeroMobile2File(file); setHeroMobile2Preview(URL.createObjectURL(file)); }
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <input 
                        type="text" 
                        value={settings.heroMobileBgImage2}
                        onChange={e => setSettings(prev => ({ ...prev, heroMobileBgImage2: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif focus:border-warm-accent transition-colors"
                        placeholder="https://..."
                      />
                    )}
                  </div>

                  {/* Mobile Background Image 3 */}
                  <div className="space-y-3 pt-6 border-t border-warm-dark/5 mt-6">
                    <label className="block text-xs font-bold uppercase tracking-widest text-warm-dark/60">Mobile Background Photo 3</label>
                    <div className="flex border-b border-warm-dark/10 mb-4 gap-4">
                      <button
                        type="button"
                        onClick={() => setHeroMobile3Tab('upload')}
                        className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                          heroMobile3Tab === 'upload' ? 'border-warm-accent text-warm-dark font-black' : 'border-transparent text-warm-dark/40'
                        }`}
                      >
                        Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeroMobile3Tab('url')}
                        className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                          heroMobile3Tab === 'url' ? 'border-warm-accent text-warm-dark font-black' : 'border-transparent text-warm-dark/40'
                        }`}
                      >
                        Paste URL
                      </button>
                    </div>
                    {heroMobile3Tab === 'upload' ? (
                      <div className="space-y-4">
                        {heroMobile3Preview || (settings.heroMobileBgImage3 && !heroMobile3File && settings.heroMobileBgImage3 !== '') ? (
                          <div className="relative w-44 aspect-[3/4] rounded-xl overflow-hidden border border-warm-dark/10 shadow-sm bg-warm-light flex items-center justify-center">
                            <img src={heroMobile3Preview || settings.heroMobileBgImage3} alt="Hero Mobile 3 Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <button 
                              type="button"
                              onClick={() => { setHeroMobile3File(null); setHeroMobile3Preview(null); setSettings(prev => ({ ...prev, heroMobileBgImage3: '' })); }}
                              className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-warm-accent rounded-full shadow-md transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div 
                            onClick={() => document.getElementById('heromobile3-upload')?.click()}
                            className="border-2 border-dashed border-warm-dark/15 bg-warm-bg/5 hover:bg-warm-accent/5 hover:border-warm-accent transition-all rounded-xl py-6 flex flex-col items-center justify-center cursor-pointer min-h-[120px]"
                          >
                            <ImageIcon className="w-6 h-6 text-warm-dark/30 mb-2" />
                            <span className="text-xs font-bold uppercase tracking-wider text-warm-dark/50">Upload Mobile Image 3</span>
                            <input 
                              id="heromobile3-upload"
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) { setHeroMobile3File(file); setHeroMobile3Preview(URL.createObjectURL(file)); }
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <input 
                        type="text" 
                        value={settings.heroMobileBgImage3}
                        onChange={e => setSettings(prev => ({ ...prev, heroMobileBgImage3: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif focus:border-warm-accent transition-colors"
                        placeholder="https://..."
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Homepage Value Propositions / Feature Columns */}
            <div className="bg-white border border-warm-dark/5 rounded-[24px] overflow-hidden shadow-sm">
              <div className="bg-warm-light/60 p-4 border-b border-warm-dark/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌿</span>
                  <div>
                    <h2 className="font-serif font-semibold text-warm-dark uppercase tracking-widest text-sm">Homepage Feature Columns (Value Propositions)</h2>
                    <p className="text-[11px] font-serif italic text-warm-dark/50">Edit text matter and toggle up to 5 feature columns on/off.</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {(settings.valueProps || []).map((prop, idx) => (
                  <div key={prop.id || idx} className="p-5 bg-warm-light/40 rounded-2xl border border-warm-dark/10 space-y-4">
                    <div className="flex items-center justify-between border-b border-warm-dark/10 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-warm-accent/10 text-warm-accent font-mono font-bold flex items-center justify-center text-xs">
                          {idx + 1}
                        </span>
                        <span className="font-serif font-bold text-warm-dark text-sm">
                          Feature Column #{idx + 1}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                          prop.enabled ? 'bg-green-100 text-green-700' : 'bg-warm-dark/10 text-warm-dark/50'
                        }`}>
                          {prop.enabled ? 'Active on Storefront' : 'Disabled'}
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          const updated = [...(settings.valueProps || [])];
                          updated[idx] = { ...updated[idx], enabled: !updated[idx].enabled };
                          setSettings(prev => ({ ...prev, valueProps: updated }));
                        }}
                        className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${prop.enabled ? 'bg-warm-accent' : 'bg-warm-dark/20'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${prop.enabled ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60 block mb-1">
                          Column Heading / Title
                        </label>
                        <input 
                          type="text"
                          value={prop.title || ''}
                          onChange={(e) => {
                            const updated = [...(settings.valueProps || [])];
                            updated[idx] = { ...updated[idx], title: e.target.value };
                            setSettings(prev => ({ ...prev, valueProps: updated }));
                          }}
                          placeholder="e.g. Farm-Fresh Flavors"
                          className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-white focus:bg-white outline-none font-serif text-sm font-bold text-warm-accent focus:border-warm-accent transition-colors"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60 block mb-1">
                          Description Matter
                        </label>
                        <textarea 
                          rows={3}
                          value={prop.description || ''}
                          onChange={(e) => {
                            const updated = [...(settings.valueProps || [])];
                            updated[idx] = { ...updated[idx], description: e.target.value };
                            setSettings(prev => ({ ...prev, valueProps: updated }));
                          }}
                          placeholder="Enter description text..."
                          className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-white focus:bg-white outline-none font-serif text-sm focus:border-warm-accent transition-colors leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Homepage Customer Reviews & Testimonials */}
            <div className="bg-white border border-warm-dark/5 rounded-[24px] overflow-hidden shadow-sm">
              <div className="bg-warm-light/60 p-4 border-b border-warm-dark/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⭐️</span>
                  <div>
                    <h2 className="font-serif font-semibold text-warm-dark uppercase tracking-widest text-sm">Homepage Customer Reviews & Testimonials</h2>
                    <p className="text-[11px] font-serif italic text-warm-dark/50">Edit customer feedback, city, product tags, ratings, and toggle reviews on/off.</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {/* Testimonials Section Header & Subheading Settings */}
                <div className="p-5 bg-warm-accent/5 rounded-2xl border border-warm-accent/20 space-y-4">
                  <div className="flex items-center gap-2 border-b border-warm-accent/15 pb-3">
                    <span className="text-base">✍️</span>
                    <h3 className="font-serif font-bold text-warm-accent text-sm uppercase tracking-wider">
                      Section Header & Subheading Content
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60 block mb-1">
                        Top Tag Badge (e.g. Loved by Food Lovers)
                      </label>
                      <input 
                        type="text"
                        value={settings.testimonialsTag || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, testimonialsTag: e.target.value }))}
                        placeholder="Loved by Food Lovers"
                        className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-white focus:bg-white outline-none font-sans text-xs font-bold uppercase tracking-widest text-warm-accent focus:border-warm-accent transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60 block mb-1">
                        Main Section Heading Title
                      </label>
                      <input 
                        type="text"
                        value={settings.testimonialsTitle || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, testimonialsTitle: e.target.value }))}
                        placeholder="What Our Customers Say"
                        className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-white focus:bg-white outline-none font-serif text-sm font-bold text-warm-dark focus:border-warm-accent transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60 block mb-1">
                      Subheading / Descriptive Matter
                    </label>
                    <textarea 
                      rows={2}
                      value={settings.testimonialsDescription || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, testimonialsDescription: e.target.value }))}
                      placeholder="Cherished words from homes across India celebrating authentic Andhra flavors."
                      className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-white focus:bg-white outline-none font-serif italic text-sm focus:border-warm-accent transition-colors leading-relaxed"
                    />
                  </div>
                </div>

                {(settings.testimonials || []).map((t, idx) => (
                  <div key={t.id || idx} className="p-5 bg-warm-light/40 rounded-2xl border border-warm-dark/10 space-y-4">
                    <div className="flex items-center justify-between border-b border-warm-dark/10 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-warm-accent/10 text-warm-accent font-mono font-bold flex items-center justify-center text-xs">
                          {idx + 1}
                        </span>
                        <span className="font-serif font-bold text-warm-dark text-sm">
                          Review #{idx + 1}: {t.author || 'Customer'}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                          t.enabled ? 'bg-green-100 text-green-700' : 'bg-warm-dark/10 text-warm-dark/50'
                        }`}>
                          {t.enabled ? 'Active on Storefront' : 'Disabled'}
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          const updated = [...(settings.testimonials || [])];
                          updated[idx] = { ...updated[idx], enabled: !updated[idx].enabled };
                          setSettings(prev => ({ ...prev, testimonials: updated }));
                        }}
                        className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${t.enabled ? 'bg-warm-accent' : 'bg-warm-dark/20'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${t.enabled ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60 block mb-1">
                            Customer Name
                          </label>
                          <input 
                            type="text"
                            value={t.author || ''}
                            onChange={(e) => {
                              const updated = [...(settings.testimonials || [])];
                              updated[idx] = { ...updated[idx], author: e.target.value };
                              setSettings(prev => ({ ...prev, testimonials: updated }));
                            }}
                            placeholder="e.g. Sunitha Reddy"
                            className="w-full px-4 py-2 rounded-xl border border-warm-dark/10 bg-white focus:bg-white outline-none font-serif text-sm font-bold text-warm-dark focus:border-warm-accent transition-colors"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60 block mb-1">
                            Location / City
                          </label>
                          <input 
                            type="text"
                            value={t.location || ''}
                            onChange={(e) => {
                              const updated = [...(settings.testimonials || [])];
                              updated[idx] = { ...updated[idx], location: e.target.value };
                              setSettings(prev => ({ ...prev, testimonials: updated }));
                            }}
                            placeholder="e.g. Hyderabad"
                            className="w-full px-4 py-2 rounded-xl border border-warm-dark/10 bg-white focus:bg-white outline-none font-sans text-sm text-warm-dark/80 focus:border-warm-accent transition-colors"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60 block mb-1">
                            Product Badge Tag
                          </label>
                          <input 
                            type="text"
                            value={t.product || ''}
                            onChange={(e) => {
                              const updated = [...(settings.testimonials || [])];
                              updated[idx] = { ...updated[idx], product: e.target.value };
                              setSettings(prev => ({ ...prev, testimonials: updated }));
                            }}
                            placeholder="e.g. Avakaya Pickle"
                            className="w-full px-4 py-2 rounded-xl border border-warm-dark/10 bg-white focus:bg-white outline-none font-mono text-sm text-warm-accent font-semibold focus:border-warm-accent transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60 block mb-1">
                          Review Quote Text
                        </label>
                        <textarea 
                          rows={3}
                          value={t.quote || ''}
                          onChange={(e) => {
                            const updated = [...(settings.testimonials || [])];
                            updated[idx] = { ...updated[idx], quote: e.target.value };
                            setSettings(prev => ({ ...prev, testimonials: updated }));
                          }}
                          placeholder="Enter testimonial quote..."
                          className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-white focus:bg-white outline-none font-serif italic text-sm focus:border-warm-accent transition-colors leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Story Header & Dictionary Noun Definition Section */}
            <div className="bg-white border border-warm-dark/5 rounded-[24px] overflow-hidden shadow-sm">
              <div className="bg-warm-light/60 p-4 border-b border-warm-dark/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-warm-dark" />
                  <div>
                    <h2 className="font-serif font-semibold text-warm-dark uppercase tracking-widest text-sm">Brand Dictionary Definition & Story Header</h2>
                    <p className="text-[11px] font-serif italic text-warm-dark/50">Configure the editorial dictionary noun layout and story intro.</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {/* Brand Word & Telugu Native Script */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Brand Word Title (English)</label>
                    <input 
                      type="text" 
                      value={storySettings.dictWord || 'Kaaram Kathalu'}
                      onChange={e => setStorySettings(prev => ({ ...prev, dictWord: e.target.value }))}
                      placeholder="e.g. Kaaram Kathalu"
                      className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif text-lg font-bold focus:border-warm-accent transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Native Script Subtitle (Telugu)</label>
                    <input 
                      type="text" 
                      value={storySettings.dictNativeScript || 'కారం కథలు'}
                      onChange={e => setStorySettings(prev => ({ ...prev, dictNativeScript: e.target.value }))}
                      placeholder="e.g. కారం కథలు"
                      className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif text-lg font-bold text-warm-dark/90 focus:border-warm-accent transition-colors"
                    />
                  </div>
                </div>

                {/* Phonetic Pronunciation */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Phonetic Pronunciation</label>
                  <input 
                    type="text" 
                    value={storySettings.dictPhonetic || '[kā ka:tha]'}
                    onChange={e => setStorySettings(prev => ({ ...prev, dictPhonetic: e.target.value }))}
                    placeholder="e.g. [kā ka:tha]"
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-mono text-sm focus:border-warm-accent transition-colors"
                  />
                </div>

                {/* Grammatical Definition */}
                <div className="p-4 bg-warm-light/40 rounded-2xl border border-warm-dark/10 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-warm-dark/70">Grammatical Definition</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1 space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-warm-dark/50">Part of Speech</label>
                      <input 
                        type="text"
                        value={storySettings.dictPart1 || 'noun'}
                        onChange={e => setStorySettings(prev => ({ ...prev, dictPart1: e.target.value }))}
                        placeholder="noun"
                        className="w-full px-3 py-2 rounded-xl border border-warm-dark/10 bg-white font-serif italic text-sm outline-none focus:border-warm-accent"
                      />
                    </div>
                    <div className="md:col-span-3 space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-warm-dark/50">Meaning / Definition Text</label>
                      <input 
                        type="text"
                        value={storySettings.dictDef1 || ''}
                        onChange={e => setStorySettings(prev => ({ ...prev, dictDef1: e.target.value }))}
                        placeholder="e.g. Stories of spice, food, and heritage."
                        className="w-full px-3 py-2 rounded-xl border border-warm-dark/10 bg-white font-serif text-sm outline-none focus:border-warm-accent"
                      />
                    </div>
                  </div>
                </div>

                {/* Word Breakdowns */}
                <div className="p-4 bg-warm-light/40 rounded-2xl border border-warm-dark/10 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-warm-dark/70">Word Breakdowns & Meanings</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-warm-dark/50">Breakdown Line #1</label>
                      <input 
                        type="text"
                        value={storySettings.dictBreakdown1 || ''}
                        onChange={e => setStorySettings(prev => ({ ...prev, dictBreakdown1: e.target.value }))}
                        placeholder="e.g. కారం — Spice"
                        className="w-full px-3 py-2 rounded-xl border border-warm-dark/10 bg-white font-serif text-sm outline-none focus:border-warm-accent"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-warm-dark/50">Breakdown Line #2</label>
                      <input 
                        type="text"
                        value={storySettings.dictBreakdown2 || ''}
                        onChange={e => setStorySettings(prev => ({ ...prev, dictBreakdown2: e.target.value }))}
                        placeholder="e.g. కథలు — Stories"
                        className="w-full px-3 py-2 rounded-xl border border-warm-dark/10 bg-white font-serif text-sm outline-none focus:border-warm-accent"
                      />
                    </div>
                  </div>
                </div>

                {/* Story Title & Intro Paragraphs */}
                <div className="space-y-4 pt-4 border-t border-warm-dark/10">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Story Heading Title</label>
                    <input 
                      type="text" 
                      value={storySettings.title || 'Our Story'}
                      onChange={e => setStorySettings(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Our Story"
                      className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif font-bold text-warm-accent focus:border-warm-accent transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Introductory Paragraph 1</label>
                    <textarea 
                      rows={3}
                      value={storySettings.introParagraph1 || ''}
                      onChange={e => setStorySettings(prev => ({ ...prev, introParagraph1: e.target.value }))}
                      placeholder="At Kaaram Kathalu, we are more than just a brand..."
                      className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif text-sm focus:border-warm-accent transition-colors leading-relaxed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Introductory Paragraph 2 (Optional)</label>
                    <textarea 
                      rows={3}
                      value={storySettings.introParagraph2 || ''}
                      onChange={e => setStorySettings(prev => ({ ...prev, introParagraph2: e.target.value }))}
                      placeholder="What began in sun-kissed courtyards..."
                      className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif text-sm focus:border-warm-accent transition-colors leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Narrative Section 1 */}
            <div className="bg-white border border-warm-dark/5 rounded-[24px] overflow-hidden shadow-sm">
              <div className="bg-warm-light/60 p-4 border-b border-warm-dark/5 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-warm-dark" />
                <h2 className="font-serif font-semibold text-warm-dark uppercase tracking-widest text-sm">Narrative Section 1</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Section Title</label>
                  <input 
                    type="text" 
                    value={storySettings.section1Title}
                    onChange={e => setStorySettings(prev => ({ ...prev, section1Title: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif focus:border-warm-accent transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Hero Highlight Quote</label>
                  <textarea 
                    rows={2}
                    value={storySettings.section1Quote}
                    onChange={e => setStorySettings(prev => ({ ...prev, section1Quote: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif resize-none focus:border-warm-accent transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Main Content Paragraph</label>
                  <textarea 
                    rows={4}
                    value={storySettings.section1Content}
                    onChange={e => setStorySettings(prev => ({ ...prev, section1Content: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif focus:border-warm-accent transition-colors"
                  />
                </div>

                {/* Section 1 Image */}
                <div className="space-y-3 pt-4 border-t border-warm-dark/5">
                  <label className="block text-xs font-bold uppercase tracking-widest text-warm-dark/60">Side Image</label>
                  <div className="flex border-b border-warm-dark/10 mb-4 gap-4">
                    <button
                      type="button"
                      onClick={() => setSec1Tab('upload')}
                      className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                        sec1Tab === 'upload' ? 'border-warm-accent text-warm-dark font-black' : 'border-transparent text-warm-dark/40'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setSec1Tab('url')}
                      className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                        sec1Tab === 'url' ? 'border-warm-accent text-warm-dark font-black' : 'border-transparent text-warm-dark/40'
                      }`}
                    >
                      Paste URL
                    </button>
                  </div>
                  {sec1Tab === 'upload' ? (
                    <div className="space-y-4">
                      {sec1Preview || (storySettings.section1Image && !sec1File && storySettings.section1Image !== '') ? (
                        <div className="relative w-full aspect-[4/3] max-w-md rounded-xl overflow-hidden border border-warm-dark/10 shadow-sm bg-warm-light flex items-center justify-center">
                          <img src={sec1Preview || storySettings.section1Image} alt="Section 1 Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <button 
                            type="button"
                            onClick={() => { setSec1File(null); setSec1Preview(null); setStorySettings(prev => ({ ...prev, section1Image: '' })); }}
                            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-warm-accent rounded-full shadow-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => document.getElementById('sec1-upload')?.click()}
                          className="border-2 border-dashed border-warm-dark/15 bg-warm-bg/5 hover:bg-warm-accent/5 hover:border-warm-accent transition-all rounded-xl py-6 flex flex-col items-center justify-center cursor-pointer min-h-[140px]"
                        >
                          <ImageIcon className="w-8 h-8 text-warm-dark/30 mb-2" />
                          <span className="text-xs font-bold uppercase tracking-wider text-warm-dark/50">Upload Side Image</span>
                          <input 
                            id="sec1-upload"
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) { setSec1File(file); setSec1Preview(URL.createObjectURL(file)); }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <input 
                      type="text" 
                      value={storySettings.section1Image}
                      onChange={e => setStorySettings(prev => ({ ...prev, section1Image: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif focus:border-warm-accent transition-colors"
                      placeholder="https://..."
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Narrative Section 2 */}
            <div className="bg-white border border-warm-dark/5 rounded-[24px] overflow-hidden shadow-sm">
              <div className="bg-warm-light/60 p-4 border-b border-warm-dark/5 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-warm-dark" />
                <h2 className="font-serif font-semibold text-warm-dark uppercase tracking-widest text-sm">Narrative Section 2</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Section Title</label>
                  <input 
                    type="text" 
                    value={storySettings.section2Title}
                    onChange={e => setStorySettings(prev => ({ ...prev, section2Title: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif focus:border-warm-accent transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">First Content Paragraph</label>
                  <textarea 
                    rows={3}
                    value={storySettings.section2Content1}
                    onChange={e => setStorySettings(prev => ({ ...prev, section2Content1: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif focus:border-warm-accent transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Second Content Paragraph</label>
                  <textarea 
                    rows={3}
                    value={storySettings.section2Content2}
                    onChange={e => setStorySettings(prev => ({ ...prev, section2Content2: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif focus:border-warm-accent transition-colors"
                  />
                </div>

                {/* Section 2 Image */}
                <div className="space-y-3 pt-4 border-t border-warm-dark/5">
                  <label className="block text-xs font-bold uppercase tracking-widest text-warm-dark/60">Side Image</label>
                  <div className="flex border-b border-warm-dark/10 mb-4 gap-4">
                    <button
                      type="button"
                      onClick={() => setSec2Tab('upload')}
                      className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                        sec2Tab === 'upload' ? 'border-warm-accent text-warm-dark font-black' : 'border-transparent text-warm-dark/40'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setSec2Tab('url')}
                      className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                        sec2Tab === 'url' ? 'border-warm-accent text-warm-dark font-black' : 'border-transparent text-warm-dark/40'
                      }`}
                    >
                      Paste URL
                    </button>
                  </div>
                  {sec2Tab === 'upload' ? (
                    <div className="space-y-4">
                      {sec2Preview || (storySettings.section2Image && !sec2File && storySettings.section2Image !== '') ? (
                        <div className="relative w-full aspect-[4/3] max-w-md rounded-xl overflow-hidden border border-warm-dark/10 shadow-sm bg-warm-light flex items-center justify-center">
                          <img src={sec2Preview || storySettings.section2Image} alt="Section 2 Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <button 
                            type="button"
                            onClick={() => { setSec2File(null); setSec2Preview(null); setStorySettings(prev => ({ ...prev, section2Image: '' })); }}
                            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-warm-accent rounded-full shadow-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => document.getElementById('sec2-upload')?.click()}
                          className="border-2 border-dashed border-warm-dark/15 bg-warm-bg/5 hover:bg-warm-accent/5 hover:border-warm-accent transition-all rounded-xl py-6 flex flex-col items-center justify-center cursor-pointer min-h-[140px]"
                        >
                          <ImageIcon className="w-8 h-8 text-warm-dark/30 mb-2" />
                          <span className="text-xs font-bold uppercase tracking-wider text-warm-dark/50">Upload Side Image</span>
                          <input 
                            id="sec2-upload"
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) { setSec2File(file); setSec2Preview(URL.createObjectURL(file)); }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <input 
                      type="text" 
                      value={storySettings.section2Image}
                      onChange={e => setStorySettings(prev => ({ ...prev, section2Image: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif focus:border-warm-accent transition-colors"
                      placeholder="https://..."
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Founders Section */}
            <div className="bg-white border border-warm-dark/5 rounded-[24px] overflow-hidden shadow-sm">
              <div className="bg-warm-light/60 p-4 border-b border-warm-dark/5 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-warm-dark" />
                <h2 className="font-serif font-semibold text-warm-dark uppercase tracking-widest text-sm">Founders & Badges</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Section Tag</label>
                    <input 
                      type="text" 
                      value={storySettings.foundersSubtitle}
                      onChange={e => setStorySettings(prev => ({ ...prev, foundersSubtitle: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif focus:border-warm-accent transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Founders Names Heading</label>
                    <input 
                      type="text" 
                      value={storySettings.foundersTitle}
                      onChange={e => setStorySettings(prev => ({ ...prev, foundersTitle: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif focus:border-warm-accent transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Mission Statement Paragraph</label>
                  <textarea 
                    rows={3}
                    value={storySettings.foundersContent}
                    onChange={e => setStorySettings(prev => ({ ...prev, foundersContent: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif focus:border-warm-accent transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Badges (Comma Separated)</label>
                  <input 
                    type="text" 
                    value={storySettings.foundersBadges}
                    onChange={e => setStorySettings(prev => ({ ...prev, foundersBadges: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif focus:border-warm-accent transition-colors"
                    placeholder="Badge 1, Badge 2, Badge 3"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Quote */}
            <div className="bg-white border border-warm-dark/5 rounded-[24px] overflow-hidden shadow-sm">
              <div className="bg-warm-light/60 p-4 border-b border-warm-dark/5 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-warm-dark" />
                <h2 className="font-serif font-semibold text-warm-dark uppercase tracking-widest text-sm">Bottom Quote Section</h2>
              </div>
              <div className="p-6 space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Invitation Quote Text</label>
                <textarea 
                  rows={3}
                  value={storySettings.bottomQuote}
                  onChange={e => setStorySettings(prev => ({ ...prev, bottomQuote: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif resize-none focus:border-warm-accent transition-colors"
                />
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end pt-4">
          <button 
            disabled={isSaving || isUploading}
            className={`flex items-center gap-2 px-10 py-4 font-bold uppercase tracking-widest text-xs transition-all duration-300 rounded-xl cursor-pointer shadow-sm ${
              saveSuccess 
                ? 'bg-green-600 text-white' 
                : 'bg-warm-dark hover:bg-warm-accent text-white hover:-translate-y-0.5'
            }`}
          >
            {isSaving || isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isUploading ? 'Uploading Media...' : isSaving ? 'Saving Changes...' : saveSuccess ? 'Settings Applied' : 'Commit Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

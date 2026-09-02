import React, { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle2, Globe, Phone, Mail, Bell, ShieldCheck, Image as ImageIcon, Trash2, BookOpen, Crop } from 'lucide-react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { supabase } from '../../supabase';
import { usePopups } from '../../context/PopupContext';
import { ImageCropModal } from '../../components/ImageCropModal';

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
    valuePropsHeadingColor: '#8B2E0F',
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
    dictWordFontSize: 42,
    dictNativeScript: 'కారం కథలు',
    dictNativeScriptFontSize: 28,
    dictPhonetic: '[kā ka:tha]',
    dictPhoneticFontSize: 16,
    dictPart1: 'noun',
    dictDef1: 'Stories of spice, food, and heritage.',
    dictDefFontSize: 16,
    dictBreakdown1: 'కారం — Spice',
    dictBreakdown2: 'కథలు — Stories',
    dictBreakdownFontSize: 18,
    dictPart2: '',
    dictDef2: '',
    title: 'Our Story',
    storyTitleFontSize: 32,
    storyPhoto: '',
    storyPhotoAspectRatio: '16:9',
    storyPhotoWidth: 'max-w-2xl',
    storyPhotoWidthPx: 672,
    storyPhotoMobileWidthPx: 340,
    introParagraph1: "At Kaaram Kathalu, we are more than just a brand. We are storytellers preserving the vibrant tapestry of Andhra's rich history, architectural marvels, and culinary traditions.",
    introParagraph2: "Our roots return to the lush fields of coastal Andhra Pradesh, and our palates still crave those hearty meals at ancestral homes. What began in sun-kissed courtyards with hand-ground spices continues today with pure ingredients, cold-pressed oils, and zero preservatives.",
    introParagraphFontSize: 18,
    subtitle: 'Storytellers preserving the vibrant tapestry of Andhra\'s rich history, architectural marvels, and culinary traditions.',
    storySubtitleFontSize: 18,
    storySubtitleFontFamily: 'font-serif-italic',
    legacyTitle: 'Our Heritage',
    bannerImage: '',
    
    section1Enabled: true,
    section1Title: 'Allure of South Indian Heritage',
    section1TitleFontSize: 28,
    section1Content: 'Our roots return to the lush fields of coastal Andhra Pradesh, and our palates still crave those hearty meals at ancestral homes, traditionally known for bringing families together in courtyards, which dotted every village. There, in the sun-kissed courtyard, grandmothers and mothers spent afternoons grinding spices to a fine podi or powder and pickling fruits and vegetables into irreplaceable staples.',
    section1ContentFontSize: 18,
    section1Image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
    section1ImageSize: 'max-w-md',
    section1ImageWidthPx: 448,
    section1ImageMobileWidthPx: 320,
    section1ImageAspectRatio: '1:1',
    section1ImageRadius: 'rounded-2xl',
    section1ImagePosition: 'left',
    
    section2Enabled: true,
    section2Title: 'The Courtyard Symphony',
    section2TitleFontSize: 28,
    section2Content1: 'Their furtive hands, busy with the rokali banda or stone mortar and pestle, produced a constant hum that would mingle with their chattering voices. Children scurried around them, playing hide and seek or hunting for a quiet corner for a game of caroms. And the air was filled with delicious promise – whiffs of ginger, garlic, mustard, sesame, chili, lemon, curry leaf and so much more wafted through the house.',
    section2Content2: 'As times changed, afternoons like these slowly started disappearing. We cannot save those old homes or hold onto the ways of life they sustained, but we can certainly keep their food alive! And that’s exactly what we, at Kaaram Kathalu, intend to do. Just like the tall ornate wooden pillars, we stand as guardians of the region\'s cultural heritage.',
    section2ContentFontSize: 18,
    section2Image: 'https://themanduvaproject.in/cdn/shop/files/Manduvawebsitepicture_1.png?v=1749711321&width=533',
    section2ImageSize: 'max-w-md',
    section2ImageWidthPx: 448,
    section2ImageMobileWidthPx: 320,
    section2ImageAspectRatio: '1:1',
    section2ImageRadius: 'rounded-2xl',
    section2ImagePosition: 'right',

    section3Enabled: false,
    section3Title: 'Traditions Passed Down',
    section3TitleFontSize: 28,
    section3Content1: 'Every recipe is an heirloom passed down through grandmothers and mothers, perfected over decades of culinary devotion.',
    section3Content2: '',
    section3ContentFontSize: 18,
    section3Image: '',
    section3ImageSize: 'max-w-md',
    section3ImageWidthPx: 448,
    section3ImageMobileWidthPx: 320,
    section3ImageAspectRatio: '1:1',
    section3ImageRadius: 'rounded-2xl',
    section3ImagePosition: 'left',

    section4Enabled: false,
    section4Title: 'Purity in Every Grain',
    section4TitleFontSize: 28,
    section4Content1: 'We handpick the freshest farm produce, sun-dry our spices naturally, and stone-grind every batch to preserve the soulful Andhra aroma.',
    section4Content2: '',
    section4ContentFontSize: 18,
    section4Image: '',
    section4ImageSize: 'max-w-md',
    section4ImageWidthPx: 448,
    section4ImageMobileWidthPx: 320,
    section4ImageAspectRatio: '1:1',
    section4ImageRadius: 'rounded-2xl',
    section4ImagePosition: 'right',

    section5Enabled: false,
    section5Title: 'From Our Home to Yours',
    section5TitleFontSize: 28,
    section5Content1: 'Experience the authentic heat, tangy richness, and deep nostalgia of real Andhra pickles and podis delivered straight to your dining table.',
    section5Content2: '',
    section5ContentFontSize: 18,
    section5Image: '',
    section5ImageSize: 'max-w-md',
    section5ImageWidthPx: 448,
    section5ImageMobileWidthPx: 320,
    section5ImageAspectRatio: '1:1',
    section5ImageRadius: 'rounded-2xl',
    section5ImagePosition: 'left',
    
    bottomQuote: '"Come, embark on a sensory journey that transports you to the sun-kissed plains and lush green landscapes of Andhra Pradesh. Immerse yourself in the kaleidoscope of flavours passed down through generations."',
    bottomQuoteFontSize: 28,
    bottomQuoteFontFamily: 'font-serif-italic'
  });

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerTab, setBannerTab] = useState<'upload' | 'url'>('upload');

  const [storyPhotoFile, setStoryPhotoFile] = useState<File | null>(null);
  const [storyPhotoPreview, setStoryPhotoPreview] = useState<string | null>(null);
  const [storyPhotoTab, setStoryPhotoTab] = useState<'upload' | 'url'>('upload');

  const [sec1File, setSec1File] = useState<File | null>(null);
  const [sec1Preview, setSec1Preview] = useState<string | null>(null);
  const [sec1Tab, setSec1Tab] = useState<'upload' | 'url'>('upload');

  const [sec2File, setSec2File] = useState<File | null>(null);
  const [sec2Preview, setSec2Preview] = useState<string | null>(null);
  const [sec2Tab, setSec2Tab] = useState<'upload' | 'url'>('upload');

  const [sec3File, setSec3File] = useState<File | null>(null);
  const [sec3Preview, setSec3Preview] = useState<string | null>(null);
  const [sec3Tab, setSec3Tab] = useState<'upload' | 'url'>('upload');

  const [sec4File, setSec4File] = useState<File | null>(null);
  const [sec4Preview, setSec4Preview] = useState<string | null>(null);
  const [sec4Tab, setSec4Tab] = useState<'upload' | 'url'>('upload');

  const [sec5File, setSec5File] = useState<File | null>(null);
  const [sec5Preview, setSec5Preview] = useState<string | null>(null);
  const [sec5Tab, setSec5Tab] = useState<'upload' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState(false);

  // Image Cropper & Framing Modal State
  const [cropModalConfig, setCropModalConfig] = useState<{
    isOpen: boolean;
    imageSrc: string;
    imageName: string;
    targetField: string;
    targetTitle: string;
    aspectRatioType: 'desktop-hero' | 'mobile-hero' | 'square' | 'free';
    originalFile?: File | null;
  }>({
    isOpen: false,
    imageSrc: '',
    imageName: '',
    targetField: '',
    targetTitle: '',
    aspectRatioType: 'desktop-hero',
    originalFile: null
  });

  const handleSelectFileToCrop = (
    file: File,
    targetField: string,
    targetTitle: string,
    aspectRatioType: 'desktop-hero' | 'mobile-hero' | 'square' | 'free' = 'desktop-hero'
  ) => {
    const objectUrl = URL.createObjectURL(file);
    setCropModalConfig({
      isOpen: true,
      imageSrc: objectUrl,
      imageName: file.name,
      targetField,
      targetTitle,
      aspectRatioType,
      originalFile: file
    });
  };

  const handleOpenExistingImageToCrop = (
    imageSrc: string,
    targetField: string,
    targetTitle: string,
    aspectRatioType: 'desktop-hero' | 'mobile-hero' | 'square' | 'free' = 'desktop-hero'
  ) => {
    setCropModalConfig({
      isOpen: true,
      imageSrc,
      imageName: `${targetField}_cropped.jpg`,
      targetField,
      targetTitle,
      aspectRatioType,
      originalFile: null
    });
  };

  const handleApplyCroppedImage = (croppedBlob: Blob, previewUrl: string) => {
    const fileName = cropModalConfig.originalFile?.name 
      ? `cropped_${cropModalConfig.originalFile.name.replace(/\.[^/.]+$/, "")}.jpg` 
      : `${cropModalConfig.targetField}_cropped.jpg`;
    
    const croppedFile = new File([croppedBlob], fileName, { type: 'image/jpeg' });
    const target = cropModalConfig.targetField;

    if (target === 'hero1') {
      setHero1File(croppedFile);
      setHero1Preview(previewUrl);
    } else if (target === 'hero2') {
      setHero2File(croppedFile);
      setHero2Preview(previewUrl);
    } else if (target === 'hero3') {
      setHero3File(croppedFile);
      setHero3Preview(previewUrl);
    } else if (target === 'heroMobile1') {
      setHeroMobile1File(croppedFile);
      setHeroMobile1Preview(previewUrl);
    } else if (target === 'heroMobile2') {
      setHeroMobile2File(croppedFile);
      setHeroMobile2Preview(previewUrl);
    } else if (target === 'heroMobile3') {
      setHeroMobile3File(croppedFile);
      setHeroMobile3Preview(previewUrl);
    } else if (target === 'banner') {
      setBannerFile(croppedFile);
      setBannerPreview(previewUrl);
    } else if (target === 'storyPhoto') {
      setStoryPhotoFile(croppedFile);
      setStoryPhotoPreview(previewUrl);
    } else if (target === 'sec1') {
      setSec1File(croppedFile);
      setSec1Preview(previewUrl);
    } else if (target === 'sec2') {
      setSec2File(croppedFile);
      setSec2Preview(previewUrl);
    } else if (target === 'sec3') {
      setSec3File(croppedFile);
      setSec3Preview(previewUrl);
    } else if (target === 'sec4') {
      setSec4File(croppedFile);
      setSec4Preview(previewUrl);
    } else if (target === 'sec5') {
      setSec5File(croppedFile);
      setSec5Preview(previewUrl);
    }
  };

  const handleUseOriginalImage = () => {
    if (cropModalConfig.originalFile) {
      const file = cropModalConfig.originalFile;
      const previewUrl = URL.createObjectURL(file);
      const target = cropModalConfig.targetField;

      if (target === 'hero1') { setHero1File(file); setHero1Preview(previewUrl); }
      else if (target === 'hero2') { setHero2File(file); setHero2Preview(previewUrl); }
      else if (target === 'hero3') { setHero3File(file); setHero3Preview(previewUrl); }
      else if (target === 'heroMobile1') { setHeroMobile1File(file); setHeroMobile1Preview(previewUrl); }
      else if (target === 'heroMobile2') { setHeroMobile2File(file); setHeroMobile2Preview(previewUrl); }
      else if (target === 'heroMobile3') { setHeroMobile3File(file); setHeroMobile3Preview(previewUrl); }
      else if (target === 'banner') { setBannerFile(file); setBannerPreview(previewUrl); }
      else if (target === 'storyPhoto') { setStoryPhotoFile(file); setStoryPhotoPreview(previewUrl); }
      else if (target === 'sec1') { setSec1File(file); setSec1Preview(previewUrl); }
      else if (target === 'sec2') { setSec2File(file); setSec2Preview(previewUrl); }
      else if (target === 'sec3') { setSec3File(file); setSec3Preview(previewUrl); }
      else if (target === 'sec4') { setSec4File(file); setSec4Preview(previewUrl); }
      else if (target === 'sec5') { setSec5File(file); setSec5Preview(previewUrl); }
    }
    setCropModalConfig(prev => ({ ...prev, isOpen: false }));
  };

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
          setStorySettings(prev => ({ ...prev, ...(storySnap.data() as any) }));
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
        if (storyPhotoFile && storyPhotoTab === 'upload') {
          updatedStory.storyPhoto = await uploadImage(storyPhotoFile, 'story');
        }
        if (sec1File && sec1Tab === 'upload') {
          updatedStory.section1Image = await uploadImage(sec1File, 'story');
        }
        if (sec2File && sec2Tab === 'upload') {
          updatedStory.section2Image = await uploadImage(sec2File, 'story');
        }
        if (sec3File && sec3Tab === 'upload') {
          updatedStory.section3Image = await uploadImage(sec3File, 'story');
        }
        if (sec4File && sec4Tab === 'upload') {
          updatedStory.section4Image = await uploadImage(sec4File, 'story');
        }
        if (sec5File && sec5Tab === 'upload') {
          updatedStory.section5Image = await uploadImage(sec5File, 'story');
        }

        setIsUploading(false);

        await setDoc(doc(db, 'settings', 'story'), {
          ...updatedStory,
          updatedAt: serverTimestamp()
        });
        
        setStorySettings(updatedStory);
        setBannerFile(null);
        setStoryPhotoFile(null);
        setStoryPhotoPreview(null);
        setSec1File(null);
        setSec1Preview(null);
        setSec2File(null);
        setSec2Preview(null);
        setSec3File(null);
        setSec3Preview(null);
        setSec4File(null);
        setSec4Preview(null);
        setSec5File(null);
        setSec5Preview(null);
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
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Instagram Profile URL</label>
                  <input 
                    type="url" 
                    value={settings.instagramUrl || ''}
                    placeholder="https://www.instagram.com/kaaramkathalu/"
                    onChange={e => setSettings(prev => ({ ...prev, instagramUrl: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-sans text-sm focus:border-warm-accent transition-colors"
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
                        <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden border border-warm-dark/10 shadow-sm bg-warm-light flex items-center justify-center group">
                          <img src={hero1Preview || settings.heroBgImage1} alt="Hero 1 Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          
                          {/* Crop & Adjust View Button */}
                          <button 
                            type="button"
                            onClick={() => handleOpenExistingImageToCrop(hero1Preview || settings.heroBgImage1, 'hero1', 'Desktop Hero Photo 1', 'desktop-hero')}
                            className="absolute top-3 right-14 px-3 py-1.5 bg-white/95 hover:bg-white text-warm-dark hover:text-warm-accent rounded-full shadow-md transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold font-sans z-10"
                            title="Crop & Move Position / Adjust View"
                          >
                            <Crop className="w-3.5 h-3.5 text-warm-accent" />
                            <span>Crop & Adjust View</span>
                          </button>

                          <button 
                            type="button"
                            onClick={() => { setHero1File(null); setHero1Preview(null); setSettings(prev => ({ ...prev, heroBgImage1: '' })); }}
                            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-warm-accent rounded-full shadow-md transition-colors cursor-pointer z-10"
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
                          <span className="text-xs font-bold uppercase tracking-wider text-warm-dark/50">Upload Hero Image 1 (With Interactive Crop & Frame)</span>
                          <input 
                            id="hero1-upload"
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleSelectFileToCrop(file, 'hero1', 'Desktop Hero Photo 1', 'desktop-hero');
                                e.target.value = '';
                              }
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
                        <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden border border-warm-dark/10 shadow-sm bg-warm-light flex items-center justify-center group">
                          <img src={hero2Preview || settings.heroBgImage2} alt="Hero 2 Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          
                          {/* Crop & Adjust View Button */}
                          <button 
                            type="button"
                            onClick={() => handleOpenExistingImageToCrop(hero2Preview || settings.heroBgImage2, 'hero2', 'Desktop Hero Photo 2', 'desktop-hero')}
                            className="absolute top-3 right-14 px-3 py-1.5 bg-white/95 hover:bg-white text-warm-dark hover:text-warm-accent rounded-full shadow-md transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold font-sans z-10"
                            title="Crop & Move Position / Adjust View"
                          >
                            <Crop className="w-3.5 h-3.5 text-warm-accent" />
                            <span>Crop & Adjust View</span>
                          </button>

                          <button 
                            type="button"
                            onClick={() => { setHero2File(null); setHero2Preview(null); setSettings(prev => ({ ...prev, heroBgImage2: '' })); }}
                            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-warm-accent rounded-full shadow-md transition-colors cursor-pointer z-10"
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
                          <span className="text-xs font-bold uppercase tracking-wider text-warm-dark/50">Upload Hero Image 2 (With Interactive Crop & Frame)</span>
                          <input 
                            id="hero2-upload"
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleSelectFileToCrop(file, 'hero2', 'Desktop Hero Photo 2', 'desktop-hero');
                                e.target.value = '';
                              }
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
                        <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden border border-warm-dark/10 shadow-sm bg-warm-light flex items-center justify-center group">
                          <img src={hero3Preview || settings.heroBgImage3} alt="Hero 3 Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          
                          {/* Crop & Adjust View Button */}
                          <button 
                            type="button"
                            onClick={() => handleOpenExistingImageToCrop(hero3Preview || settings.heroBgImage3, 'hero3', 'Desktop Hero Photo 3', 'desktop-hero')}
                            className="absolute top-3 right-14 px-3 py-1.5 bg-white/95 hover:bg-white text-warm-dark hover:text-warm-accent rounded-full shadow-md transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold font-sans z-10"
                            title="Crop & Move Position / Adjust View"
                          >
                            <Crop className="w-3.5 h-3.5 text-warm-accent" />
                            <span>Crop & Adjust View</span>
                          </button>

                          <button 
                            type="button"
                            onClick={() => { setHero3File(null); setHero3Preview(null); setSettings(prev => ({ ...prev, heroBgImage3: '' })); }}
                            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-warm-accent rounded-full shadow-md transition-colors cursor-pointer z-10"
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
                          <span className="text-xs font-bold uppercase tracking-wider text-warm-dark/50">Upload Hero Image 3 (With Interactive Crop & Frame)</span>
                          <input 
                            id="hero3-upload"
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleSelectFileToCrop(file, 'hero3', 'Desktop Hero Photo 3', 'desktop-hero');
                                e.target.value = '';
                              }
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
                          <div className="relative w-48 aspect-[3/4] rounded-xl overflow-hidden border border-warm-dark/10 shadow-sm bg-warm-light flex items-center justify-center group">
                            <img src={heroMobile1Preview || settings.heroMobileBgImage1} alt="Hero Mobile 1 Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            
                            {/* Crop & Adjust View Button */}
                            <button 
                              type="button"
                              onClick={() => handleOpenExistingImageToCrop(heroMobile1Preview || settings.heroMobileBgImage1, 'heroMobile1', 'Mobile Background Photo 1', 'mobile-hero')}
                              className="absolute top-2 right-10 p-1.5 bg-white/95 hover:bg-white text-warm-dark hover:text-warm-accent rounded-full shadow-md transition-all cursor-pointer z-10"
                              title="Crop & Move Position / Adjust View"
                            >
                              <Crop className="w-3.5 h-3.5 text-warm-accent" />
                            </button>

                            <button 
                              type="button"
                              onClick={() => { setHeroMobile1File(null); setHeroMobile1Preview(null); setSettings(prev => ({ ...prev, heroMobileBgImage1: '' })); }}
                              className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-warm-accent rounded-full shadow-md transition-colors cursor-pointer z-10"
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
                            <span className="text-xs font-bold uppercase tracking-wider text-warm-dark/50">Upload Mobile Image 1 (With Crop Tool)</span>
                            <input 
                              id="heromobile1-upload"
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleSelectFileToCrop(file, 'heroMobile1', 'Mobile Background Photo 1', 'mobile-hero');
                                  e.target.value = '';
                                }
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
                          <div className="relative w-48 aspect-[3/4] rounded-xl overflow-hidden border border-warm-dark/10 shadow-sm bg-warm-light flex items-center justify-center group">
                            <img src={heroMobile2Preview || settings.heroMobileBgImage2} alt="Hero Mobile 2 Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            
                            {/* Crop & Adjust View Button */}
                            <button 
                              type="button"
                              onClick={() => handleOpenExistingImageToCrop(heroMobile2Preview || settings.heroMobileBgImage2, 'heroMobile2', 'Mobile Background Photo 2', 'mobile-hero')}
                              className="absolute top-2 right-10 p-1.5 bg-white/95 hover:bg-white text-warm-dark hover:text-warm-accent rounded-full shadow-md transition-all cursor-pointer z-10"
                              title="Crop & Move Position / Adjust View"
                            >
                              <Crop className="w-3.5 h-3.5 text-warm-accent" />
                            </button>

                            <button 
                              type="button"
                              onClick={() => { setHeroMobile2File(null); setHeroMobile2Preview(null); setSettings(prev => ({ ...prev, heroMobileBgImage2: '' })); }}
                              className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-warm-accent rounded-full shadow-md transition-colors cursor-pointer z-10"
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
                            <span className="text-xs font-bold uppercase tracking-wider text-warm-dark/50">Upload Mobile Image 2 (With Crop Tool)</span>
                            <input 
                              id="heromobile2-upload"
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleSelectFileToCrop(file, 'heroMobile2', 'Mobile Background Photo 2', 'mobile-hero');
                                  e.target.value = '';
                                }
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
                          <div className="relative w-48 aspect-[3/4] rounded-xl overflow-hidden border border-warm-dark/10 shadow-sm bg-warm-light flex items-center justify-center group">
                            <img src={heroMobile3Preview || settings.heroMobileBgImage3} alt="Hero Mobile 3 Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            
                            {/* Crop & Adjust View Button */}
                            <button 
                              type="button"
                              onClick={() => handleOpenExistingImageToCrop(heroMobile3Preview || settings.heroMobileBgImage3, 'heroMobile3', 'Mobile Background Photo 3', 'mobile-hero')}
                              className="absolute top-2 right-10 p-1.5 bg-white/95 hover:bg-white text-warm-dark hover:text-warm-accent rounded-full shadow-md transition-all cursor-pointer z-10"
                              title="Crop & Move Position / Adjust View"
                            >
                              <Crop className="w-3.5 h-3.5 text-warm-accent" />
                            </button>

                            <button 
                              type="button"
                              onClick={() => { setHeroMobile3File(null); setHeroMobile3Preview(null); setSettings(prev => ({ ...prev, heroMobileBgImage3: '' })); }}
                              className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-warm-accent rounded-full shadow-md transition-colors cursor-pointer z-10"
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
                            <span className="text-xs font-bold uppercase tracking-wider text-warm-dark/50">Upload Mobile Image 3 (With Crop Tool)</span>
                            <input 
                              id="heromobile3-upload"
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleSelectFileToCrop(file, 'heroMobile3', 'Mobile Background Photo 3', 'mobile-hero');
                                  e.target.value = '';
                                }
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
                    <p className="text-[11px] font-serif italic text-warm-dark/50">Edit text matter, customize heading colors by #hex codes, and toggle up to 5 feature columns on/off.</p>
                  </div>
                </div>
              </div>

              {/* Section-wide Heading Color Controls */}
              <div className="p-5 bg-warm-light/25 border-b border-warm-dark/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-warm-dark block mb-1">
                    Default Headings Color (Hex Code)
                  </label>
                  <p className="text-[11px] font-serif italic text-warm-dark/60">
                    Set the default color code for all column titles in this section (e.g. #3E400E).
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {/* Color Picker + Hex Input */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-warm-dark/15 rounded-xl shadow-xs">
                    <input 
                      type="color"
                      value={settings.valuePropsHeadingColor || '#8B2E0F'}
                      onChange={(e) => setSettings(prev => ({ ...prev, valuePropsHeadingColor: e.target.value }))}
                      className="w-7 h-7 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                      title="Choose custom color"
                    />
                    <input 
                      type="text"
                      value={settings.valuePropsHeadingColor || '#8B2E0F'}
                      onChange={(e) => setSettings(prev => ({ ...prev, valuePropsHeadingColor: e.target.value }))}
                      placeholder="#3E400E"
                      className="w-24 px-2 py-1 font-mono text-xs font-bold text-warm-dark uppercase bg-transparent outline-none"
                    />
                  </div>

                  {/* Preset Swatches */}
                  <div className="flex items-center gap-1.5 pl-2 border-l border-warm-dark/15">
                    {[
                      { code: '#3E400E', label: 'Olive / Heritage Green (#3E400E)' },
                      { code: '#8B2E0F', label: 'Brick Red (#8B2E0F)' },
                      { code: '#1B3127', label: 'Forest Green (#1B3127)' },
                      { code: '#9E2A2B', label: 'Chilli Red (#9E2A2B)' },
                      { code: '#2C1810', label: 'Coffee Brown (#2C1810)' },
                      { code: '#D97706', label: 'Amber Gold (#D97706)' }
                    ].map(preset => (
                      <button
                        key={preset.code}
                        type="button"
                        onClick={() => setSettings(prev => ({ ...prev, valuePropsHeadingColor: preset.code }))}
                        title={preset.label}
                        className={`w-7 h-7 rounded-lg transition-transform hover:scale-110 cursor-pointer border ${
                          (settings.valuePropsHeadingColor || '#8B2E0F').toUpperCase() === preset.code.toUpperCase()
                            ? 'ring-2 ring-warm-accent ring-offset-1 border-white shadow-xs'
                            : 'border-black/10'
                        }`}
                        style={{ backgroundColor: preset.code }}
                      />
                    ))}
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

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60 block">
                            Column Heading / Title
                          </label>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase text-warm-dark/50">Custom #Color:</span>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white border border-warm-dark/10 rounded-lg">
                              <input 
                                type="color"
                                value={prop.titleColor || settings.valuePropsHeadingColor || '#8B2E0F'}
                                onChange={(e) => {
                                  const updated = [...(settings.valueProps || [])];
                                  updated[idx] = { ...updated[idx], titleColor: e.target.value };
                                  setSettings(prev => ({ ...prev, valueProps: updated }));
                                }}
                                className="w-4 h-4 rounded cursor-pointer border-0 p-0 bg-transparent"
                                title="Custom color for this heading"
                              />
                              <input 
                                type="text"
                                value={prop.titleColor || ''}
                                onChange={(e) => {
                                  const updated = [...(settings.valueProps || [])];
                                  updated[idx] = { ...updated[idx], titleColor: e.target.value };
                                  setSettings(prev => ({ ...prev, valueProps: updated }));
                                }}
                                placeholder={settings.valuePropsHeadingColor || '#8B2E0F'}
                                className="w-18 font-mono text-[11px] uppercase bg-transparent outline-none"
                              />
                            </div>
                          </div>
                        </div>
                        <input 
                          type="text"
                          value={prop.title || ''}
                          onChange={(e) => {
                            const updated = [...(settings.valueProps || [])];
                            updated[idx] = { ...updated[idx], title: e.target.value };
                            setSettings(prev => ({ ...prev, valueProps: updated }));
                          }}
                          placeholder="e.g. Farm-Fresh Flavors"
                          style={{ color: prop.titleColor || settings.valuePropsHeadingColor || '#8B2E0F' }}
                          className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-white focus:bg-white outline-none font-serif text-sm font-bold focus:border-warm-accent transition-colors"
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
                          Review #{idx + 1}
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
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60 block mb-1">Brand Word Title (English)</label>
                      <input 
                        type="text" 
                        value={storySettings.dictWord || 'Kaaram Kathalu'}
                        onChange={e => setStorySettings(prev => ({ ...prev, dictWord: e.target.value }))}
                        placeholder="e.g. Kaaram Kathalu"
                        className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif text-lg font-bold focus:border-warm-accent transition-colors"
                      />
                    </div>

                    {/* Brand Word Font Size Slider */}
                    <div className="bg-warm-light/40 p-3.5 rounded-xl border border-warm-dark/5 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-warm-dark/70">English Heading Font Size</label>
                        <span className="text-xs font-mono font-bold bg-warm-accent/10 text-warm-accent px-2 py-0.5 rounded-md">
                          {storySettings.dictWordFontSize || 48}px
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-warm-dark/40">24px</span>
                        <input 
                          type="range"
                          min="24"
                          max="72"
                          step="2"
                          value={storySettings.dictWordFontSize || 48}
                          onChange={e => setStorySettings(prev => ({ ...prev, dictWordFontSize: Number(e.target.value) }))}
                          className="w-full accent-warm-accent cursor-pointer h-2 bg-warm-dark/10 rounded-lg appearance-none"
                        />
                        <span className="text-[10px] font-mono text-warm-dark/40">72px</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60 block mb-1">Native Script Subtitle (Telugu)</label>
                      <input 
                        type="text" 
                        value={storySettings.dictNativeScript || 'కారం కథలు'}
                        onChange={e => setStorySettings(prev => ({ ...prev, dictNativeScript: e.target.value }))}
                        placeholder="e.g. కారం కథలు"
                        className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif text-lg font-bold text-warm-dark/90 focus:border-warm-accent transition-colors"
                      />
                    </div>

                    {/* Telugu Subtitle Font Size Slider */}
                    <div className="bg-warm-light/40 p-3.5 rounded-xl border border-warm-dark/5 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-warm-dark/70">Telugu Script Font Size</label>
                        <span className="text-xs font-mono font-bold bg-warm-accent/10 text-warm-accent px-2 py-0.5 rounded-md">
                          {storySettings.dictNativeScriptFontSize || 30}px
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-warm-dark/40">18px</span>
                        <input 
                          type="range"
                          min="18"
                          max="56"
                          step="2"
                          value={storySettings.dictNativeScriptFontSize || 28}
                          onChange={e => setStorySettings(prev => ({ ...prev, dictNativeScriptFontSize: Number(e.target.value) }))}
                          className="w-full accent-warm-accent cursor-pointer h-2 bg-warm-dark/10 rounded-lg appearance-none"
                        />
                        <span className="text-[10px] font-mono text-warm-dark/40">56px</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phonetic Pronunciation */}
                <div className="space-y-3">
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

                  {/* Phonetic Font Size Slider */}
                  <div className="bg-warm-light/40 p-3.5 rounded-xl border border-warm-dark/5 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-warm-dark/70">Phonetic Text Font Size</label>
                      <span className="text-xs font-mono font-bold bg-warm-accent/10 text-warm-accent px-2 py-0.5 rounded-md">
                        {storySettings.dictPhoneticFontSize || 16}px
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-warm-dark/40">12px</span>
                      <input 
                        type="range"
                        min="12"
                        max="28"
                        step="1"
                        value={storySettings.dictPhoneticFontSize || 16}
                        onChange={e => setStorySettings(prev => ({ ...prev, dictPhoneticFontSize: Number(e.target.value) }))}
                        className="w-full accent-warm-accent cursor-pointer h-2 bg-warm-dark/10 rounded-lg appearance-none"
                      />
                      <span className="text-[10px] font-mono text-warm-dark/40">28px</span>
                    </div>
                  </div>
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
                        value={storySettings.dictPart1 ?? ''}
                        onChange={e => setStorySettings(prev => ({ ...prev, dictPart1: e.target.value }))}
                        placeholder="e.g. noun"
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

                  {/* Definition Font Size Slider */}
                  <div className="bg-white/80 p-3 rounded-xl border border-warm-dark/5 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-warm-dark/70">Definition Font Size</label>
                      <span className="text-xs font-mono font-bold bg-warm-accent/10 text-warm-accent px-2 py-0.5 rounded-md">
                        {storySettings.dictDefFontSize || 16}px
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-warm-dark/40">12px</span>
                      <input 
                        type="range"
                        min="12"
                        max="28"
                        step="1"
                        value={storySettings.dictDefFontSize || 16}
                        onChange={e => setStorySettings(prev => ({ ...prev, dictDefFontSize: Number(e.target.value) }))}
                        className="w-full accent-warm-accent cursor-pointer h-2 bg-warm-dark/10 rounded-lg appearance-none"
                      />
                      <span className="text-[10px] font-mono text-warm-dark/40">28px</span>
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

                  {/* Breakdown Font Size Slider */}
                  <div className="bg-white/80 p-3 rounded-xl border border-warm-dark/5 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-warm-dark/70">Breakdowns Font Size</label>
                      <span className="text-xs font-mono font-bold bg-warm-accent/10 text-warm-accent px-2 py-0.5 rounded-md">
                        {storySettings.dictBreakdownFontSize || 18}px
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-warm-dark/40">12px</span>
                      <input 
                        type="range"
                        min="12"
                        max="28"
                        step="1"
                        value={storySettings.dictBreakdownFontSize || 18}
                        onChange={e => setStorySettings(prev => ({ ...prev, dictBreakdownFontSize: Number(e.target.value) }))}
                        className="w-full accent-warm-accent cursor-pointer h-2 bg-warm-dark/10 rounded-lg appearance-none"
                      />
                      <span className="text-[10px] font-mono text-warm-dark/40">28px</span>
                    </div>
                  </div>
                </div>

                {/* Story Title & Intro Paragraphs */}
                <div className="space-y-4 pt-4 border-t border-warm-dark/10">
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60 block mb-1">Story Heading Title</label>
                      <input 
                        type="text" 
                        value={storySettings.title || 'Our Story'}
                        onChange={e => setStorySettings(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. Our Story"
                        className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif font-bold text-warm-accent focus:border-warm-accent transition-colors"
                      />
                    </div>

                    {/* Story Heading Font Size Slider */}
                    <div className="bg-warm-light/40 p-3.5 rounded-xl border border-warm-dark/5 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-warm-dark/70">Story Heading Font Size</label>
                        <span className="text-xs font-mono font-bold bg-warm-accent/10 text-warm-accent px-2 py-0.5 rounded-md">
                          {storySettings.storyTitleFontSize || 32}px
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-warm-dark/40">18px</span>
                        <input 
                          type="range"
                          min="18"
                          max="60"
                          step="2"
                          value={storySettings.storyTitleFontSize || 32}
                          onChange={e => setStorySettings(prev => ({ ...prev, storyTitleFontSize: Number(e.target.value) }))}
                          className="w-full accent-warm-accent cursor-pointer h-2 bg-warm-dark/10 rounded-lg appearance-none"
                        />
                        <span className="text-[10px] font-mono text-warm-dark/40">60px</span>
                      </div>
                    </div>

                    {/* Subheading under Our Story */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60 block mb-1">
                        Subheading / Tagline (Under Heading)
                      </label>
                      <input 
                        type="text" 
                        value={storySettings.subtitle ?? ''}
                        onChange={e => setStorySettings(prev => ({ ...prev, subtitle: e.target.value }))}
                        placeholder="e.g. Storytellers preserving the vibrant tapestry of Andhra..."
                        className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif italic text-sm text-warm-dark/80 focus:border-warm-accent transition-colors"
                      />
                    </div>

                    {/* Subheading Font Size Slider */}
                    <div className="bg-warm-light/40 p-3.5 rounded-xl border border-warm-dark/5 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-warm-dark/70">Subheading Font Size</label>
                        <span className="text-xs font-mono font-bold bg-warm-accent/10 text-warm-accent px-2 py-0.5 rounded-md">
                          {storySettings.storySubtitleFontSize || 18}px
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-warm-dark/40">12px</span>
                        <input 
                          type="range"
                          min="12"
                          max="36"
                          step="1"
                          value={storySettings.storySubtitleFontSize || 18}
                          onChange={e => setStorySettings(prev => ({ ...prev, storySubtitleFontSize: Number(e.target.value) }))}
                          className="w-full accent-warm-accent cursor-pointer h-2 bg-warm-dark/10 rounded-lg appearance-none"
                        />
                        <span className="text-[10px] font-mono text-warm-dark/40">36px</span>
                      </div>
                    </div>

                    {/* Subheading Font Family / Style Selector */}
                    <div className="space-y-2 pt-1">
                      <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/70 block">
                        Subheading Font Style & Family
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          { id: 'font-serif-italic', label: 'Playfair Italic', desc: 'Poetic' },
                          { id: 'font-serif', label: 'Playfair Regular', desc: 'Classic' },
                          { id: 'font-cormorant', label: 'Garamond', desc: 'Editorial' },
                          { id: 'font-heading', label: 'Cinzel', desc: 'Heritage' },
                          { id: 'font-sans', label: 'Modern Sans', desc: 'Clean' },
                        ].map(font => {
                          const isSelected = (storySettings.storySubtitleFontFamily || 'font-serif-italic') === font.id;
                          return (
                            <button
                              key={font.id}
                              type="button"
                              onClick={() => setStorySettings(prev => ({ ...prev, storySubtitleFontFamily: font.id }))}
                              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                                isSelected 
                                  ? 'bg-warm-accent text-white border-warm-accent shadow-sm' 
                                  : 'bg-white hover:bg-warm-accent/5 text-warm-dark border-warm-dark/10'
                              }`}
                            >
                              <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-warm-dark'}`}>
                                {font.label}
                              </span>
                              <span className={`text-[10px] uppercase font-sans tracking-wider ${isSelected ? 'text-white/80' : 'text-warm-dark/50'}`}>
                                {font.desc}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Story Photo between headline and matter */}
                  <div className="p-4 bg-warm-light/40 rounded-2xl border border-warm-dark/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-warm-accent" />
                        <span className="text-xs font-bold uppercase tracking-widest text-warm-dark/80">Story Photo (Between Headline & Matter)</span>
                      </div>
                    </div>

                    <div className="flex border-b border-warm-dark/10 gap-4">
                      <button
                        type="button"
                        onClick={() => setStoryPhotoTab('upload')}
                        className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                          storyPhotoTab === 'upload' ? 'border-warm-accent text-warm-dark font-black' : 'border-transparent text-warm-dark/40'
                        }`}
                      >
                        Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setStoryPhotoTab('url')}
                        className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                          storyPhotoTab === 'url' ? 'border-warm-accent text-warm-dark font-black' : 'border-transparent text-warm-dark/40'
                        }`}
                      >
                        Paste URL
                      </button>
                    </div>

                    {storyPhotoTab === 'upload' ? (
                      <div className="space-y-4">
                        {storyPhotoPreview || (storySettings.storyPhoto && !storyPhotoFile && storySettings.storyPhoto !== '') ? (
                          <div className="relative w-full aspect-[16/9] max-w-md mx-auto rounded-xl overflow-hidden border border-warm-dark/10 shadow-sm bg-warm-light flex items-center justify-center group">
                            <img src={storyPhotoPreview || storySettings.storyPhoto} alt="Story Photo Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            
                            {/* Crop & Adjust View Button */}
                            <button 
                              type="button"
                              onClick={() => handleOpenExistingImageToCrop(storyPhotoPreview || storySettings.storyPhoto, 'storyPhoto', 'Our Story Photo', 'desktop-hero')}
                              className="absolute top-3 right-12 px-2.5 py-1 bg-white/95 hover:bg-white text-warm-dark hover:text-warm-accent rounded-full shadow-md transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold font-sans z-10"
                              title="Crop & Move Position / Adjust View"
                            >
                              <Crop className="w-3.5 h-3.5 text-warm-accent" />
                              <span>Adjust</span>
                            </button>

                            <button 
                              type="button"
                              onClick={() => { setStoryPhotoFile(null); setStoryPhotoPreview(null); setStorySettings(prev => ({ ...prev, storyPhoto: '' })); }}
                              className="absolute top-3 right-3 p-1.5 bg-white/90 hover:bg-white text-warm-accent rounded-full shadow-md transition-colors cursor-pointer z-10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div 
                            onClick={() => document.getElementById('story-photo-upload')?.click()}
                            className="border-2 border-dashed border-warm-dark/15 bg-warm-bg/5 hover:bg-warm-accent/5 hover:border-warm-accent transition-all rounded-xl py-6 flex flex-col items-center justify-center cursor-pointer min-h-[140px]"
                          >
                            <ImageIcon className="w-8 h-8 text-warm-dark/30 mb-2" />
                            <span className="text-xs font-bold uppercase tracking-wider text-warm-dark/50">Upload Story Photo (With Crop Tool)</span>
                            <input 
                              id="story-photo-upload"
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleSelectFileToCrop(file, 'storyPhoto', 'Our Story Photo', 'desktop-hero');
                                  e.target.value = '';
                                }
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <input 
                        type="text" 
                        value={storySettings.storyPhoto || ''}
                        onChange={e => setStorySettings(prev => ({ ...prev, storyPhoto: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif focus:border-warm-accent transition-colors text-sm"
                        placeholder="https://..."
                      />
                    )}

                    {/* Size & Aspect Ratio Options */}
                    <div className="space-y-4 pt-3 border-t border-warm-dark/10">
                      {/* Aspect Ratio (Shape) */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/70 block">
                          Aspect Ratio (Photo Shape)
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {[
                            { id: '16:9', label: '16:9', desc: 'Landscape' },
                            { id: '4:3', label: '4:3', desc: 'Classic' },
                            { id: '3:2', label: '3:2', desc: 'DSLR' },
                            { id: '1:1', label: '1:1', desc: 'Square' },
                            { id: '21:9', label: '21:9', desc: 'Cinema' },
                            { id: 'auto', label: 'Auto', desc: 'Original' },
                          ].map(ratio => {
                            const isSelected = (storySettings.storyPhotoAspectRatio || '16:9') === ratio.id;
                            return (
                              <button
                                key={ratio.id}
                                type="button"
                                onClick={() => setStorySettings(prev => ({ ...prev, storyPhotoAspectRatio: ratio.id }))}
                                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                                  isSelected 
                                    ? 'bg-warm-accent text-white border-warm-accent shadow-sm' 
                                    : 'bg-white hover:bg-warm-accent/5 text-warm-dark border-warm-dark/10'
                                }`}
                              >
                                <span className={`font-mono text-xs font-bold ${isSelected ? 'text-white' : 'text-warm-dark'}`}>
                                  {ratio.label}
                                </span>
                                <span className={`text-[10px] uppercase font-sans tracking-wider ${isSelected ? 'text-white/80' : 'text-warm-dark/50'}`}>
                                  {ratio.desc}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Desktop / Laptop Width */}
                      <div className="bg-warm-light/40 p-3.5 rounded-xl border border-warm-dark/5 space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-bold uppercase tracking-widest text-warm-dark/70">
                            💻 Laptop / Desktop Width
                          </label>
                          <span className="text-xs font-mono font-bold bg-warm-accent/10 text-warm-accent px-2 py-0.5 rounded-md">
                            {storySettings.storyPhotoWidthPx || 672}px
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-warm-dark/40">280px</span>
                          <input 
                            type="range"
                            min="280"
                            max="1000"
                            step="10"
                            value={storySettings.storyPhotoWidthPx || 672}
                            onChange={e => setStorySettings(prev => ({ ...prev, storyPhotoWidthPx: Number(e.target.value) }))}
                            className="w-full accent-warm-accent cursor-pointer h-2 bg-warm-dark/10 rounded-lg appearance-none"
                          />
                          <span className="text-[10px] font-mono text-warm-dark/40">1000px</span>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
                          {[
                            { px: 450, label: '450px' },
                            { px: 576, label: '576px' },
                            { px: 672, label: '672px' },
                            { px: 768, label: '768px' },
                            { px: 896, label: '896px' },
                            { px: 1000, label: '1000px' },
                          ].map(preset => (
                            <button
                              key={preset.px}
                              type="button"
                              onClick={() => setStorySettings(prev => ({ ...prev, storyPhotoWidthPx: preset.px }))}
                              className={`py-1 px-2 rounded-lg text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                                (storySettings.storyPhotoWidthPx || 672) === preset.px
                                  ? 'bg-warm-accent text-white border-warm-accent'
                                  : 'bg-white text-warm-dark/70 border-warm-dark/10 hover:bg-warm-accent/5'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Mobile Width */}
                      <div className="bg-warm-light/40 p-3.5 rounded-xl border border-warm-dark/5 space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-bold uppercase tracking-widest text-warm-dark/70">
                            📱 Mobile Screen Width
                          </label>
                          <span className="text-xs font-mono font-bold bg-warm-accent/10 text-warm-accent px-2 py-0.5 rounded-md">
                            {storySettings.storyPhotoMobileWidthPx || 340}px
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-warm-dark/40">150px</span>
                          <input 
                            type="range"
                            min="150"
                            max="450"
                            step="10"
                            value={storySettings.storyPhotoMobileWidthPx || 340}
                            onChange={e => setStorySettings(prev => ({ ...prev, storyPhotoMobileWidthPx: Number(e.target.value) }))}
                            className="w-full accent-warm-accent cursor-pointer h-2 bg-warm-dark/10 rounded-lg appearance-none"
                          />
                          <span className="text-[10px] font-mono text-warm-dark/40">450px</span>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 pt-1">
                          {[
                            { px: 240, label: '240px' },
                            { px: 280, label: '280px' },
                            { px: 320, label: '320px' },
                            { px: 360, label: '360px' },
                            { px: 400, label: '400px' },
                          ].map(preset => (
                            <button
                              key={preset.px}
                              type="button"
                              onClick={() => setStorySettings(prev => ({ ...prev, storyPhotoMobileWidthPx: preset.px }))}
                              className={`py-1 px-2 rounded-lg text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                                (storySettings.storyPhotoMobileWidthPx || 340) === preset.px
                                  ? 'bg-warm-accent text-white border-warm-accent'
                                  : 'bg-white text-warm-dark/70 border-warm-dark/10 hover:bg-warm-accent/5'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
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
                  
                  {/* Intro Paragraphs Font Size Slider */}
                  <div className="bg-warm-light/40 p-3.5 rounded-xl border border-warm-dark/5 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-warm-dark/70">Intro Paragraphs Font Size</label>
                      <span className="text-xs font-mono font-bold bg-warm-accent/10 text-warm-accent px-2 py-0.5 rounded-md">
                        {storySettings.introParagraphFontSize || 18}px
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-warm-dark/40">14px</span>
                      <input 
                        type="range"
                        min="14"
                        max="32"
                        step="1"
                        value={storySettings.introParagraphFontSize || 18}
                        onChange={e => setStorySettings(prev => ({ ...prev, introParagraphFontSize: Number(e.target.value) }))}
                        className="w-full accent-warm-accent cursor-pointer h-2 bg-warm-dark/10 rounded-lg appearance-none"
                      />
                      <span className="text-[10px] font-mono text-warm-dark/40">32px</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Narrative Sections 1 through 5 with Individual ON/OFF Toggles */}
            {[
              { num: 1, defaultPos: 'left', file: sec1File, setFile: setSec1File, preview: sec1Preview, setPreview: setSec1Preview, tab: sec1Tab, setTab: setSec1Tab },
              { num: 2, defaultPos: 'right', file: sec2File, setFile: setSec2File, preview: sec2Preview, setPreview: setSec2Preview, tab: sec2Tab, setTab: setSec2Tab },
              { num: 3, defaultPos: 'left', file: sec3File, setFile: setSec3File, preview: sec3Preview, setPreview: setSec3Preview, tab: sec3Tab, setTab: setSec3Tab },
              { num: 4, defaultPos: 'right', file: sec4File, setFile: setSec4File, preview: sec4Preview, setPreview: setSec4Preview, tab: sec4Tab, setTab: setSec4Tab },
              { num: 5, defaultPos: 'left', file: sec5File, setFile: setSec5File, preview: sec5Preview, setPreview: setSec5Preview, tab: sec5Tab, setTab: setSec5Tab },
            ].map(({ num, defaultPos, file, setFile, preview, setPreview, tab, setTab }) => {
              const isEnabled = (storySettings as any)[`section${num}Enabled`] !== false;
              const titleKey = `section${num}Title`;
              const titleFontSizeKey = `section${num}TitleFontSize`;
              const content1Key = num === 1 ? 'section1Content' : `section${num}Content1`;
              const content2Key = `section${num}Content2`;
              const contentFontSizeKey = `section${num}ContentFontSize`;
              const imageKey = `section${num}Image`;
              const imageWidthPxKey = `section${num}ImageWidthPx`;
              const imageMobileWidthPxKey = `section${num}ImageMobileWidthPx`;
              const imageAspectRatioKey = `section${num}ImageAspectRatio`;
              const imageRadiusKey = `section${num}ImageRadius`;
              const imagePosKey = `section${num}ImagePosition`;

              const currentPos = (storySettings as any)[imagePosKey] || defaultPos;
              const currentTitle = (storySettings as any)[titleKey] || '';
              const currentImage = (storySettings as any)[imageKey] || '';

              return (
                <div key={num} className={`bg-white border rounded-[24px] overflow-hidden shadow-sm transition-all ${
                  isEnabled ? 'border-warm-dark/10' : 'border-warm-dark/10 bg-warm-light/10 opacity-80'
                }`}>
                  {/* Card Header with ON/OFF Toggle */}
                  <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 transition-colors ${
                    isEnabled ? 'bg-warm-light/60 border-warm-dark/5' : 'bg-warm-dark/5 border-warm-dark/10'
                  }`}>
                    <div className="flex items-center gap-2">
                      <BookOpen className={`w-5 h-5 ${isEnabled ? 'text-warm-dark' : 'text-warm-dark/50'}`} />
                      <h2 className="font-serif font-semibold text-warm-dark uppercase tracking-widest text-sm">
                        Narrative Section {num} {currentTitle ? `— ${currentTitle}` : ''}
                      </h2>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${
                        isEnabled ? 'text-green-700 font-black' : 'text-warm-dark/50'
                      }`}>
                        {isEnabled ? '● Visible on Website' : '○ Hidden from Website'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setStorySettings(prev => ({ ...prev, [`section${num}Enabled`]: !isEnabled }))}
                        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                          isEnabled ? 'bg-green-600' : 'bg-warm-dark/25'
                        }`}
                        title={isEnabled ? "Click to hide from website" : "Click to show on website"}
                      >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          isEnabled ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-6 space-y-6">
                    {!isEnabled && (
                      <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-serif italic flex items-center gap-2">
                        <span>ⓘ</span> This section is currently hidden from the storefront. Switch the toggle above ON to display it.
                      </div>
                    )}

                    {/* Section Title & Layout Position */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Section Title</label>
                          <input 
                            type="text" 
                            value={currentTitle}
                            onChange={e => setStorySettings(prev => ({ ...prev, [titleKey]: e.target.value }))}
                            placeholder={`e.g. Narrative Section ${num} Title`}
                            className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif font-bold text-warm-accent focus:border-warm-accent transition-colors"
                          />
                        </div>

                        {/* Image Position Selector */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Layout Position</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setStorySettings(prev => ({ ...prev, [imagePosKey]: 'left' }))}
                              className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-center ${
                                currentPos === 'left'
                                  ? 'bg-warm-accent text-white border-warm-accent shadow-sm'
                                  : 'bg-white text-warm-dark border-warm-dark/10 hover:bg-warm-accent/5'
                              }`}
                            >
                              Photo Left
                            </button>
                            <button
                              type="button"
                              onClick={() => setStorySettings(prev => ({ ...prev, [imagePosKey]: 'right' }))}
                              className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-center ${
                                currentPos === 'right'
                                  ? 'bg-warm-accent text-white border-warm-accent shadow-sm'
                                  : 'bg-white text-warm-dark border-warm-dark/10 hover:bg-warm-accent/5'
                              }`}
                            >
                              Photo Right
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Title Font Size Slider */}
                      <div className="bg-warm-light/40 p-3.5 rounded-xl border border-warm-dark/5 space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-bold uppercase tracking-widest text-warm-dark/70">Title Font Size</label>
                          <span className="text-xs font-mono font-bold bg-warm-accent/10 text-warm-accent px-2 py-0.5 rounded-md">
                            {(storySettings as any)[titleFontSizeKey] || 28}px
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-warm-dark/40">18px</span>
                          <input 
                            type="range"
                            min="18"
                            max="48"
                            step="2"
                            value={(storySettings as any)[titleFontSizeKey] || 28}
                            onChange={e => setStorySettings(prev => ({ ...prev, [titleFontSizeKey]: Number(e.target.value) }))}
                            className="w-full accent-warm-accent cursor-pointer h-2 bg-warm-dark/10 rounded-lg appearance-none"
                          />
                          <span className="text-[10px] font-mono text-warm-dark/40">48px</span>
                        </div>
                      </div>
                    </div>

                    {/* Content Paragraphs */}
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Main Content Paragraph 1</label>
                        <textarea 
                          rows={3}
                          value={(storySettings as any)[content1Key] || ''}
                          onChange={e => setStorySettings(prev => ({ ...prev, [content1Key]: e.target.value }))}
                          placeholder="Write the first paragraph of your story here..."
                          className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif text-sm focus:border-warm-accent transition-colors leading-relaxed"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Paragraph 2 (Optional)</label>
                        <textarea 
                          rows={3}
                          value={(storySettings as any)[content2Key] || ''}
                          onChange={e => setStorySettings(prev => ({ ...prev, [content2Key]: e.target.value }))}
                          placeholder="Write an additional paragraph (optional)..."
                          className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif text-sm focus:border-warm-accent transition-colors leading-relaxed"
                        />
                      </div>

                      {/* Content Font Size Slider */}
                      <div className="bg-warm-light/40 p-3.5 rounded-xl border border-warm-dark/5 space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-bold uppercase tracking-widest text-warm-dark/70">Content Font Size</label>
                          <span className="text-xs font-mono font-bold bg-warm-accent/10 text-warm-accent px-2 py-0.5 rounded-md">
                            {(storySettings as any)[contentFontSizeKey] || 18}px
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-warm-dark/40">14px</span>
                          <input 
                            type="range"
                            min="14"
                            max="32"
                            step="1"
                            value={(storySettings as any)[contentFontSizeKey] || 18}
                            onChange={e => setStorySettings(prev => ({ ...prev, [contentFontSizeKey]: Number(e.target.value) }))}
                            className="w-full accent-warm-accent cursor-pointer h-2 bg-warm-dark/10 rounded-lg appearance-none"
                          />
                          <span className="text-[10px] font-mono text-warm-dark/40">32px</span>
                        </div>
                      </div>
                    </div>

                    {/* Side Photo */}
                    <div className="space-y-4 pt-4 border-t border-warm-dark/10">
                      <label className="block text-xs font-bold uppercase tracking-widest text-warm-dark/60">
                        Side Photo ({currentPos === 'left' ? 'Left Position' : 'Right Position'})
                      </label>
                      <div className="flex border-b border-warm-dark/10 mb-4 gap-4">
                        <button
                          type="button"
                          onClick={() => setTab('upload')}
                          className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                            tab === 'upload' ? 'border-warm-accent text-warm-dark font-black' : 'border-transparent text-warm-dark/40'
                          }`}
                        >
                          Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => setTab('url')}
                          className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                            tab === 'url' ? 'border-warm-accent text-warm-dark font-black' : 'border-transparent text-warm-dark/40'
                          }`}
                        >
                          Paste URL
                        </button>
                      </div>

                      {tab === 'upload' ? (
                        <div className="space-y-4">
                          {preview || (currentImage && !file && currentImage !== '') ? (
                            <div className="relative w-full aspect-square max-w-xs rounded-xl overflow-hidden border border-warm-dark/10 shadow-sm bg-warm-light flex items-center justify-center group">
                              <img src={preview || currentImage} alt={`Section ${num} Preview`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              
                              {/* Crop & Adjust View Button */}
                              <button 
                                type="button"
                                onClick={() => handleOpenExistingImageToCrop(preview || currentImage, `sec${num}`, `Section ${num} Side Photo`, 'square')}
                                className="absolute top-3 right-12 px-2.5 py-1 bg-white/95 hover:bg-white text-warm-dark hover:text-warm-accent rounded-full shadow-md transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold font-sans z-10"
                                title="Crop & Move Position / Adjust View"
                              >
                                <Crop className="w-3.5 h-3.5 text-warm-accent" />
                                <span>Adjust</span>
                              </button>

                              <button 
                                type="button"
                                onClick={() => { setFile(null); setPreview(null); setStorySettings(prev => ({ ...prev, [imageKey]: '' })); }}
                                className="absolute top-3 right-3 p-1.5 bg-white/90 hover:bg-white text-warm-accent rounded-full shadow-md transition-colors cursor-pointer z-10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div 
                              onClick={() => document.getElementById(`sec${num}-upload`)?.click()}
                              className="border-2 border-dashed border-warm-dark/15 bg-warm-bg/5 hover:bg-warm-accent/5 hover:border-warm-accent transition-all rounded-xl py-6 flex flex-col items-center justify-center cursor-pointer min-h-[140px]"
                            >
                              <ImageIcon className="w-8 h-8 text-warm-dark/30 mb-2" />
                              <span className="text-xs font-bold uppercase tracking-wider text-warm-dark/50">Upload Side Photo (With Crop Tool)</span>
                              <input 
                                id={`sec${num}-upload`}
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) {
                                    handleSelectFileToCrop(f, `sec${num}`, `Section ${num} Side Photo`, 'square');
                                    e.target.value = '';
                                  }
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <input 
                          type="text" 
                          value={currentImage}
                          onChange={e => setStorySettings(prev => ({ ...prev, [imageKey]: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif focus:border-warm-accent transition-colors"
                          placeholder="https://..."
                        />
                      )}

                      {/* Photo Aspect Ratio */}
                      <div className="space-y-2 pt-3 border-t border-warm-dark/10">
                        <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/70 block">
                          Photo Aspect Ratio (Crop / Shape)
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {[
                            { id: '1:1', label: '1:1', desc: 'Square' },
                            { id: '4:5', label: '4:5', desc: 'Portrait' },
                            { id: '3:4', label: '3:4', desc: 'Classic' },
                            { id: '16:9', label: '16:9', desc: 'Landscape' },
                            { id: '3:2', label: '3:2', desc: 'DSLR' },
                            { id: 'auto', label: 'Auto', desc: 'Original' },
                          ].map(ratio => {
                            const isSelected = ((storySettings as any)[imageAspectRatioKey] || '1:1') === ratio.id;
                            return (
                              <button
                                key={ratio.id}
                                type="button"
                                onClick={() => setStorySettings(prev => ({ ...prev, [imageAspectRatioKey]: ratio.id }))}
                                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                                  isSelected 
                                    ? 'bg-warm-accent text-white border-warm-accent shadow-sm' 
                                    : 'bg-white hover:bg-warm-accent/5 text-warm-dark border-warm-dark/10'
                                }`}
                              >
                                <span className={`font-mono text-xs font-bold ${isSelected ? 'text-white' : 'text-warm-dark'}`}>
                                  {ratio.label}
                                </span>
                                <span className={`text-[10px] uppercase font-sans tracking-wider ${isSelected ? 'text-white/80' : 'text-warm-dark/50'}`}>
                                  {ratio.desc}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Desktop / Laptop Width */}
                      <div className="bg-warm-light/40 p-3.5 rounded-xl border border-warm-dark/5 space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-bold uppercase tracking-widest text-warm-dark/70">
                            💻 Laptop / Desktop Width
                          </label>
                          <span className="text-xs font-mono font-bold bg-warm-accent/10 text-warm-accent px-2 py-0.5 rounded-md">
                            {(storySettings as any)[imageWidthPxKey] || 448}px
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-warm-dark/40">200px</span>
                          <input 
                            type="range"
                            min="200"
                            max="650"
                            step="10"
                            value={(storySettings as any)[imageWidthPxKey] || 448}
                            onChange={e => setStorySettings(prev => ({ ...prev, [imageWidthPxKey]: Number(e.target.value) }))}
                            className="w-full accent-warm-accent cursor-pointer h-2 bg-warm-dark/10 rounded-lg appearance-none"
                          />
                          <span className="text-[10px] font-mono text-warm-dark/40">650px</span>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
                          {[
                            { px: 320, label: '320px' },
                            { px: 384, label: '384px' },
                            { px: 448, label: '448px' },
                            { px: 512, label: '512px' },
                            { px: 576, label: '576px' },
                            { px: 650, label: '650px' },
                          ].map(preset => (
                            <button
                              key={preset.px}
                              type="button"
                              onClick={() => setStorySettings(prev => ({ ...prev, [imageWidthPxKey]: preset.px }))}
                              className={`py-1 px-2 rounded-lg text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                                ((storySettings as any)[imageWidthPxKey] || 448) === preset.px
                                  ? 'bg-warm-accent text-white border-warm-accent'
                                  : 'bg-white text-warm-dark/70 border-warm-dark/10 hover:bg-warm-accent/5'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Mobile Width */}
                      <div className="bg-warm-light/40 p-3.5 rounded-xl border border-warm-dark/5 space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[11px] font-bold uppercase tracking-widest text-warm-dark/70">
                            📱 Mobile Screen Width
                          </label>
                          <span className="text-xs font-mono font-bold bg-warm-accent/10 text-warm-accent px-2 py-0.5 rounded-md">
                            {(storySettings as any)[imageMobileWidthPxKey] || 320}px
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-warm-dark/40">140px</span>
                          <input 
                            type="range"
                            min="140"
                            max="450"
                            step="10"
                            value={(storySettings as any)[imageMobileWidthPxKey] || 320}
                            onChange={e => setStorySettings(prev => ({ ...prev, [imageMobileWidthPxKey]: Number(e.target.value) }))}
                            className="w-full accent-warm-accent cursor-pointer h-2 bg-warm-dark/10 rounded-lg appearance-none"
                          />
                          <span className="text-[10px] font-mono text-warm-dark/40">450px</span>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 pt-1">
                          {[
                            { px: 200, label: '200px' },
                            { px: 260, label: '260px' },
                            { px: 300, label: '300px' },
                            { px: 340, label: '340px' },
                            { px: 380, label: '380px' },
                          ].map(preset => (
                            <button
                              key={preset.px}
                              type="button"
                              onClick={() => setStorySettings(prev => ({ ...prev, [imageMobileWidthPxKey]: preset.px }))}
                              className={`py-1 px-2 rounded-lg text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                                ((storySettings as any)[imageMobileWidthPxKey] || 320) === preset.px
                                  ? 'bg-warm-accent text-white border-warm-accent'
                                  : 'bg-white text-warm-dark/70 border-warm-dark/10 hover:bg-warm-accent/5'
                              }`}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Corner Rounding */}
                      <div className="space-y-2 pt-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/70 block">
                          Corner Border Radius
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { id: 'rounded-2xl', label: 'Curved (16px)' },
                            { id: 'rounded-3xl', label: 'Deep Curve (24px)' },
                            { id: 'rounded-xl', label: 'Soft (12px)' },
                            { id: 'rounded-none', label: 'Sharp Heritage (0px)' },
                          ].map(r => {
                            const isSelected = ((storySettings as any)[imageRadiusKey] || 'rounded-2xl') === r.id;
                            return (
                              <button
                                key={r.id}
                                type="button"
                                onClick={() => setStorySettings(prev => ({ ...prev, [imageRadiusKey]: r.id }))}
                                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs font-bold ${
                                  isSelected 
                                    ? 'bg-warm-accent text-white border-warm-accent shadow-sm' 
                                    : 'bg-white hover:bg-warm-accent/5 text-warm-dark border-warm-dark/10'
                                }`}
                              >
                                {r.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Bottom Quote */}
            <div className="bg-white border border-warm-dark/5 rounded-[24px] overflow-hidden shadow-sm">
              <div className="bg-warm-light/60 p-4 border-b border-warm-dark/5 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-warm-dark" />
                <h2 className="font-serif font-semibold text-warm-dark uppercase tracking-widest text-sm">Bottom Quote Section</h2>
              </div>
              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Invitation Quote Text</label>
                  <textarea 
                    rows={4}
                    value={storySettings.bottomQuote}
                    onChange={e => setStorySettings(prev => ({ ...prev, bottomQuote: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif text-base focus:border-warm-accent transition-colors leading-relaxed"
                  />
                </div>

                {/* Font Size Slider */}
                <div className="bg-warm-light/40 p-3.5 rounded-xl border border-warm-dark/5 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-warm-dark/70">Quote Text Font Size</label>
                    <span className="text-xs font-mono font-bold bg-warm-accent/10 text-warm-accent px-2 py-0.5 rounded-md">
                      {storySettings.bottomQuoteFontSize || 28}px
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-warm-dark/40">16px</span>
                    <input 
                      type="range"
                      min="16"
                      max="48"
                      step="2"
                      value={storySettings.bottomQuoteFontSize || 28}
                      onChange={e => setStorySettings(prev => ({ ...prev, bottomQuoteFontSize: Number(e.target.value) }))}
                      className="w-full accent-warm-accent cursor-pointer h-2 bg-warm-dark/10 rounded-lg appearance-none"
                    />
                    <span className="text-[10px] font-mono text-warm-dark/40">48px</span>
                  </div>
                </div>

                {/* Font Family / Style Selector */}
                <div className="space-y-2 pt-2 border-t border-warm-dark/10">
                  <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/70 block">
                    Font Style & Family
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: 'font-serif-italic', label: 'Playfair Italic', desc: 'Poetic' },
                      { id: 'font-serif', label: 'Playfair Regular', desc: 'Classic' },
                      { id: 'font-cormorant', label: 'Garamond', desc: 'Editorial' },
                      { id: 'font-heading', label: 'Cinzel', desc: 'Heritage' },
                      { id: 'font-sans', label: 'Modern Sans', desc: 'Clean' },
                    ].map(font => {
                      const isSelected = (storySettings.bottomQuoteFontFamily || 'font-serif-italic') === font.id;
                      return (
                        <button
                          key={font.id}
                          type="button"
                          onClick={() => setStorySettings(prev => ({ ...prev, bottomQuoteFontFamily: font.id }))}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                            isSelected 
                              ? 'bg-warm-accent text-white border-warm-accent shadow-sm' 
                              : 'bg-white hover:bg-warm-accent/5 text-warm-dark border-warm-dark/10'
                          }`}
                        >
                          <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-warm-dark'}`}>
                            {font.label}
                          </span>
                          <span className={`text-[10px] uppercase font-sans tracking-wider ${isSelected ? 'text-white/80' : 'text-warm-dark/50'}`}>
                            {font.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
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

      {/* Interactive Image Crop & Framing Viewfinder Modal */}
      <ImageCropModal
        isOpen={cropModalConfig.isOpen}
        imageSrc={cropModalConfig.imageSrc}
        imageName={cropModalConfig.imageName}
        targetTitle={cropModalConfig.targetTitle}
        aspectRatioType={cropModalConfig.aspectRatioType}
        heroTag={settings.heroTag}
        heroTitle={settings.heroTitle}
        heroTitleFontSize={settings.heroTitleFontSize}
        heroDescription={settings.heroDescription}
        heroButtonText={settings.heroButtonText}
        heroOverlayOpacity={settings.heroOverlayOpacity}
        onClose={() => setCropModalConfig(prev => ({ ...prev, isOpen: false }))}
        onCropComplete={handleApplyCroppedImage}
        onUseOriginal={cropModalConfig.originalFile ? handleUseOriginalImage : undefined}
      />
    </div>
  );
}

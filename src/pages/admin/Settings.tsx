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
    heroDescription: 'Handcrafted Andhra pickles, Gongura, Avakaya, and aromatic spice podis made with pure ingredients, cold-pressed oils, and zero preservatives. Every bite tells a story.',
    heroButtonText: 'Shop Pickles & Podis',
    heroBgImage1: '',
    heroBgImage2: '',
    heroBgImage3: '',
    heroOverlayOpacity: '30',
    delhiveryWarehouseName: 'Kaaram Kathalu',
    activeCategories: {
      pickle: true,
      podi: true,
      snacks: true,
      fryums: true,
      bundle: true
    }
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

  const [storySettings, setStorySettings] = useState({
    title: 'Our Story',
    subtitle: 'Storytellers preserving the vibrant tapestry of Andhra\'s rich history, architectural marvels, and culinary traditions.',
    legacyTitle: 'Our Heritage',
    bannerImage: 'https://themanduvaproject.in/cdn/shop/files/58a7s9w56qhc1.jpg?v=1753097183&width=3200',
    
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
          setSettings(prev => ({
            ...prev,
            ...data,
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
  }, [settings.heroBgImage1, settings.heroBgImage2, settings.heroBgImage3]);

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

        setIsUploading(false);

        await setDoc(doc(db, 'settings', 'general'), {
          ...updatedGeneral,
          updatedAt: serverTimestamp()
        });

        setSettings(updatedGeneral);
        setHero1File(null);
        setHero2File(null);
        setHero3File(null);
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
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Story Header */}
            <div className="bg-white border border-warm-dark/5 rounded-[24px] overflow-hidden shadow-sm">
              <div className="bg-warm-light/60 p-4 border-b border-warm-dark/5 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-warm-dark" />
                <h2 className="font-serif font-semibold text-warm-dark uppercase tracking-widest text-sm">Header Section</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Legacy Subtitle Tag</label>
                    <input 
                      type="text" 
                      value={storySettings.legacyTitle}
                      onChange={e => setStorySettings(prev => ({ ...prev, legacyTitle: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif focus:border-warm-accent transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Story Title</label>
                    <input 
                      type="text" 
                      value={storySettings.title}
                      onChange={e => setStorySettings(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif focus:border-warm-accent transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Story Subheading</label>
                  <textarea 
                    rows={2}
                    value={storySettings.subtitle}
                    onChange={e => setStorySettings(prev => ({ ...prev, subtitle: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif resize-none focus:border-warm-accent transition-colors"
                  />
                </div>

                {/* Banner Image */}
                <div className="space-y-3 pt-4 border-t border-warm-dark/5">
                  <label className="block text-xs font-bold uppercase tracking-widest text-warm-dark/60">Hero Banner Image</label>
                  <div className="flex border-b border-warm-dark/10 mb-4 gap-4">
                    <button
                      type="button"
                      onClick={() => setBannerTab('upload')}
                      className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                        bannerTab === 'upload' ? 'border-warm-accent text-warm-dark font-black' : 'border-transparent text-warm-dark/40'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setBannerTab('url')}
                      className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                        bannerTab === 'url' ? 'border-warm-accent text-warm-dark font-black' : 'border-transparent text-warm-dark/40'
                      }`}
                    >
                      Paste URL
                    </button>
                  </div>
                  {bannerTab === 'upload' ? (
                    <div className="space-y-4">
                      {bannerPreview || (storySettings.bannerImage && !bannerFile && storySettings.bannerImage !== '') ? (
                        <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden border border-warm-dark/10 shadow-sm bg-warm-light flex items-center justify-center">
                          <img src={bannerPreview || storySettings.bannerImage} alt="Banner Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <button 
                            type="button"
                            onClick={() => { setBannerFile(null); setBannerPreview(null); setStorySettings(prev => ({ ...prev, bannerImage: '' })); }}
                            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-warm-accent rounded-full shadow-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => document.getElementById('banner-upload')?.click()}
                          className="border-2 border-dashed border-warm-dark/15 bg-warm-bg/5 hover:bg-warm-accent/5 hover:border-warm-accent transition-all rounded-xl py-6 flex flex-col items-center justify-center cursor-pointer min-h-[140px]"
                        >
                          <ImageIcon className="w-8 h-8 text-warm-dark/30 mb-2" />
                          <span className="text-xs font-bold uppercase tracking-wider text-warm-dark/50">Upload Banner File</span>
                          <input 
                            id="banner-upload"
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) { setBannerFile(file); setBannerPreview(URL.createObjectURL(file)); }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <input 
                      type="text" 
                      value={storySettings.bannerImage}
                      onChange={e => setStorySettings(prev => ({ ...prev, bannerImage: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif focus:border-warm-accent transition-colors"
                      placeholder="https://..."
                    />
                  )}
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

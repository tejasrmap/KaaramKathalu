import React, { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle2, Globe, Phone, Mail, Bell, ShieldCheck } from 'lucide-react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function Settings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [settings, setSettings] = useState({
    companyName: 'Kaaram Kathalu',
    supportEmail: 'kathalukaaram@gmail.com',
    supportPhone: '+91 98765 43210',
    address: 'Traditional Flavors Lane, Andhra Pradesh',
    announcementText: '🔥 New Season Avakaya Pickles Are Here! Free Shipping on Orders Above ₹999.',
    isMaintenanceMode: false
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'general');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data() as any);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await setDoc(doc(db, 'settings', 'general'), {
        ...settings,
        updatedAt: serverTimestamp()
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings.");
    } finally {
      setIsSaving(false);
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
      <div className="bg-white p-6 border-2 border-warm-dark shadow-[4px_4px_0px_#3A2A22] transform -rotate-1 relative z-10">
        <h1 className="text-3xl font-serif font-bold text-warm-dark italic">Ledger Settings</h1>
        <p className="text-warm-dark/70 mt-2 font-serif">Configure the storefront and business parameters.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Business Info */}
        <div className="bg-white border-2 border-warm-dark shadow-[6px_6px_0px_#3A2A22] overflow-hidden">
          <div className="bg-[#F4EBE1] p-4 border-b-2 border-warm-dark flex items-center gap-2">
            <Globe className="w-5 h-5 text-warm-dark" />
            <h2 className="font-serif font-bold text-warm-dark uppercase tracking-widest text-sm">Business Identity</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Company Name</label>
              <input 
                type="text" 
                value={settings.companyName}
                onChange={e => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
                className="w-full px-4 py-2 border-2 border-warm-dark bg-warm-bg/20 focus:bg-white outline-none font-serif font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Support Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-dark/30" />
                <input 
                  type="text" 
                  value={settings.supportPhone}
                  onChange={e => setSettings(prev => ({ ...prev, supportPhone: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border-2 border-warm-dark bg-warm-bg/20 focus:bg-white outline-none font-serif font-bold"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Support Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-dark/30" />
                <input 
                  type="email" 
                  value={settings.supportEmail}
                  onChange={e => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border-2 border-warm-dark bg-warm-bg/20 focus:bg-white outline-none font-serif font-bold"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Store Address</label>
              <input 
                type="text" 
                value={settings.address}
                onChange={e => setSettings(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-4 py-2 border-2 border-warm-dark bg-warm-bg/20 focus:bg-white outline-none font-serif font-bold"
              />
            </div>
          </div>
        </div>

        {/* Storefront Features */}
        <div className="bg-white border-2 border-warm-dark shadow-[6px_6px_0px_#3A2A22] overflow-hidden">
          <div className="bg-[#F4EBE1] p-4 border-b-2 border-warm-dark flex items-center gap-2">
            <Bell className="w-5 h-5 text-warm-dark" />
            <h2 className="font-serif font-bold text-warm-dark uppercase tracking-widest text-sm">Storefront Features</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Announcement Bar Text</label>
              <textarea 
                rows={2}
                value={settings.announcementText}
                onChange={e => setSettings(prev => ({ ...prev, announcementText: e.target.value }))}
                className="w-full px-4 py-2 border-2 border-warm-dark bg-warm-bg/20 focus:bg-white outline-none font-serif font-bold resize-none"
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-warm-bg/30 border-2 border-dashed border-warm-dark/20">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-warm-dark/40" />
                <div>
                  <h4 className="font-serif font-bold text-warm-dark">Maintenance Mode</h4>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-warm-dark/40">Disable storefront for visitors</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, isMaintenanceMode: !prev.isMaintenanceMode }))}
                className={`w-12 h-6 rounded-full relative transition-colors ${settings.isMaintenanceMode ? 'bg-warm-accent' : 'bg-warm-dark/20'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.isMaintenanceMode ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            disabled={isSaving}
            className={`flex items-center gap-2 px-10 py-4 font-bold uppercase tracking-widest text-xs transition-all shadow-[6px_6px_0px_#3A2A22] ${
              saveSuccess 
                ? 'bg-green-500 text-white border-green-700 shadow-none translate-y-1' 
                : 'bg-warm-dark text-white border-2 border-warm-dark hover:-translate-y-1 hover:shadow-[8px_8px_0px_#3A2A22]'
            }`}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? 'Saving Changes...' : saveSuccess ? 'Settings Applied' : 'Commit Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

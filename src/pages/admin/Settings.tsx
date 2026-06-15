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
    supportPhone: '+91 97708 89608',
    address: '002 Ground Floor Spoorthi Vaibhava Apartment, 6th A Cross Trinity Enclave, Banjara Layout, Horamavu, Bangalore, Karnataka - 560043',
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
      <div className="bg-warm-light p-6 rounded-2xl border border-warm-dark/5 shadow-sm mb-6">
        <h2 className="text-2xl font-serif font-bold text-warm-dark">Ledger Settings</h2>
        <p className="text-sm text-warm-dark/60 mt-1 font-serif">Configure the storefront and business parameters.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
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

        <div className="flex justify-end pt-4">
          <button 
            disabled={isSaving}
            className={`flex items-center gap-2 px-10 py-4 font-bold uppercase tracking-widest text-xs transition-all duration-300 rounded-xl cursor-pointer shadow-sm ${
              saveSuccess 
                ? 'bg-green-600 text-white' 
                : 'bg-warm-dark hover:bg-warm-accent text-white hover:-translate-y-0.5'
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

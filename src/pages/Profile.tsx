import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User, MapPin, Phone, Mail, Save, Loader2, CheckCircle2, ShieldCheck, Compass } from 'lucide-react';
import SEO from '../components/SEO';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: ''
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData({
            name: data.name || user.displayName || '',
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || '',
            pincode: data.pincode || ''
          });
        } else {
          setProfileData(prev => ({ ...prev, name: user.displayName || '' }));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, authLoading]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        ...profileData,
        email: user.email,
        updatedAt: serverTimestamp()
      }, { merge: true });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-warm-bg/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-warm-accent animate-spin" />
          <p className="text-sm font-serif italic text-warm-dark/50">Retrieving patron files...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto pt-28">
        <div className="w-16 h-16 rounded-full bg-warm-accent/10 flex items-center justify-center text-warm-accent mb-6 shadow-inner">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-heading font-black text-warm-dark uppercase tracking-wide mb-4">Patron Identification Required</h2>
        <p className="text-warm-dark/60 mb-8 font-serif italic text-sm leading-relaxed">
          Please sign in to your Kaaram Kathalu account to manage your delivery address, contact details, and heritage preferences.
        </p>
        <Link 
          to="/login"
          className="w-full bg-warm-accent text-white py-4 rounded-xl font-heading font-black tracking-widest uppercase hover:bg-warm-dark transition-all duration-300 shadow-md text-sm block"
        >
          Proceed to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-32 pb-24 px-4 sm:px-6 md:px-12 w-full max-w-5xl mx-auto min-h-screen bg-warm-bg/30">
      <SEO title="Patron Profile - Kaaram Kathalu" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start"
      >
        {/* Title and Intro */}
        <div className="lg:col-span-12 mb-4 mt-6">
          <span className="font-heading text-warm-accent text-xs font-bold uppercase tracking-[0.2em] block mb-2">My Account</span>
          <h1 className="text-4xl md:text-5xl font-heading font-black text-warm-dark uppercase tracking-tight">
            Patron <span className="text-warm-accent italic font-light font-serif">Profile</span>
          </h1>
          <p className="text-warm-dark/60 font-serif italic text-sm mt-1">Manage your details for faster heritage deliveries.</p>
          <div className="w-16 h-1 bg-warm-accent/80 mt-4 rounded-full"></div>
        </div>

        {/* Left Card: Account Card */}
        <div className="lg:col-span-4 bg-white border border-warm-accent/10 rounded-[32px] p-6 md:p-8 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-warm-accent/[0.02] rounded-full blur-xl pointer-events-none" />
          
          {/* Avatar Container */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-tr from-warm-accent/20 to-transparent rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-24 h-24 rounded-full bg-warm-light/50 border-[4px] border-white ring-4 ring-warm-accent/10 shadow-lg overflow-hidden relative z-10 flex items-center justify-center">
              {user.photoURL ? (
                <img src={user.photoURL} alt={profileData.name || user.displayName || 'Patron'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-warm-accent/30 bg-warm-light">
                  <User className="w-12 h-12" />
                </div>
              )}
            </div>
            
            <div className="absolute -bottom-1 -right-1 bg-warm-accent text-white p-2 rounded-full shadow-md z-20 border border-white">
              <Compass className="w-3.5 h-3.5 animate-spin-slow" />
            </div>
          </div>

          <h2 className="text-xl font-heading font-bold text-warm-dark mb-1 uppercase tracking-wider">
            {profileData.name || user.displayName || 'Patron'}
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-warm-dark/50 font-serif mb-6">
            <Mail className="w-3.5 h-3.5 text-warm-accent/60" />
            <span className="truncate max-w-[200px]">{user.email}</span>
          </div>

          <div className="w-full border-t border-warm-dark/5 pt-6 text-left space-y-4">
            <div className="bg-warm-light/40 p-4 rounded-2xl border border-warm-accent/5">
              <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-warm-accent mb-2">Heritage Member</h3>
              <p className="text-xs font-serif text-warm-dark/65 leading-relaxed">
                Thank you for supporting small-batch, preservative-free traditional kitchens.
              </p>
            </div>
          </div>
        </div>

        {/* Right Card: Edit Form */}
        <div className="lg:col-span-8 bg-white border border-warm-accent/10 rounded-[32px] shadow-sm overflow-hidden p-6 md:p-10">
          <form onSubmit={handleSave} className="space-y-6">
            <h3 className="text-lg font-heading font-bold text-warm-dark uppercase tracking-wider border-b border-warm-dark/5 pb-4 mb-6">
              Delivery Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-xs font-heading font-black tracking-widest uppercase text-warm-dark/55 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-accent/50" />
                  <input 
                    type="text" 
                    value={profileData.name}
                    onChange={e => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-warm-dark/10 bg-warm-light/20 focus:outline-none focus:border-warm-accent focus:bg-white transition-all duration-300 font-serif text-sm font-semibold text-warm-dark placeholder-warm-dark/30 shadow-inner"
                    placeholder="Patron Name"
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="text-xs font-heading font-black tracking-widest uppercase text-warm-dark/55 block">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-accent/50" />
                  <input 
                    type="tel" 
                    value={profileData.phone}
                    onChange={e => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-warm-dark/10 bg-warm-light/20 focus:outline-none focus:border-warm-accent focus:bg-white transition-all duration-300 font-serif text-sm font-semibold text-warm-dark placeholder-warm-dark/30 shadow-inner"
                    placeholder="Contact Number"
                    pattern="[0-9]{10,12}"
                    title="Please enter a valid phone number"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="space-y-2">
              <label className="text-xs font-heading font-black tracking-widest uppercase text-warm-dark/55 block">Delivery Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4.5 w-4 h-4 text-warm-accent/50" />
                <textarea 
                  rows={3}
                  value={profileData.address}
                  onChange={e => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-warm-dark/10 bg-warm-light/20 focus:outline-none focus:border-warm-accent focus:bg-white transition-all duration-300 font-serif text-sm font-semibold text-warm-dark placeholder-warm-dark/30 shadow-inner"
                  placeholder="Door No, Street name, Apartment, Landmark..."
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* City */}
              <div className="space-y-2">
                <label className="text-xs font-heading font-black tracking-widest uppercase text-warm-dark/55 block">City</label>
                <input 
                  type="text" 
                  value={profileData.city}
                  onChange={e => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-4 py-3.5 rounded-2xl border border-warm-dark/10 bg-warm-light/20 focus:outline-none focus:border-warm-accent focus:bg-white transition-all duration-300 font-serif text-sm font-semibold text-warm-dark placeholder-warm-dark/30 shadow-inner"
                  placeholder="e.g. Gudivada"
                  required
                />
              </div>

              {/* Pincode */}
              <div className="space-y-2">
                <label className="text-xs font-heading font-black tracking-widest uppercase text-warm-dark/55 block">Pincode</label>
                <input 
                  type="text" 
                  value={profileData.pincode}
                  onChange={e => setProfileData(prev => ({ ...prev, pincode: e.target.value }))}
                  className="w-full px-4 py-3.5 rounded-2xl border border-warm-dark/10 bg-warm-light/20 focus:outline-none focus:border-warm-accent focus:bg-white transition-all duration-300 font-serif text-sm font-semibold text-warm-dark placeholder-warm-dark/30 shadow-inner"
                  placeholder="6-digit PIN"
                  pattern="[0-9]{6}"
                  title="Please enter a 6-digit pin code"
                  required
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-warm-dark/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs font-serif italic text-warm-dark/40 max-w-[90%] sm:max-w-[60%] text-center sm:text-left leading-relaxed">
                These settings will automatically fill your checkout details for a faster, single-click ordering process.
              </p>
              <button 
                type="submit"
                disabled={isSaving}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-heading font-black uppercase text-xs sm:text-sm tracking-wider transition-all duration-300 ${
                  saveSuccess 
                    ? 'bg-green-600 text-white shadow-md' 
                    : 'bg-warm-accent hover:bg-warm-dark text-white shadow-md hover:-translate-y-0.5'
                }`}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saveSuccess ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSaving ? 'Saving...' : saveSuccess ? 'Details Saved' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

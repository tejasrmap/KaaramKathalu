import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User, MapPin, Phone, Mail, Save, Loader2, CheckCircle2 } from 'lucide-react';

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
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-warm-accent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-serif text-warm-dark mb-4">Patron Identification Required</h2>
        <p className="text-warm-dark/60 mb-8 font-serif">Please sign in to manage your delivery preferences.</p>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-32 pb-24 px-4 sm:px-6 md:px-12 max-w-3xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-serif text-warm-dark mb-3 italic">Patron Profile</h1>
        <p className="text-warm-dark/60 font-serif">Manage your details for faster heritage deliveries.</p>
      </div>

      <div className="bg-white border-2 border-warm-dark shadow-[8px_8px_0px_#3A2A22] transform rotate-1 overflow-hidden">
        <div className="bg-warm-light p-8 border-b-2 border-warm-dark flex items-center gap-6">
          <div className="w-20 h-20 bg-white border-2 border-warm-dark shadow-[4px_4px_0px_#3A2A22] overflow-hidden">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-warm-dark/20">
                <User className="w-10 h-10" />
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-warm-dark">{user.displayName}</h2>
            <p className="text-xs font-bold uppercase tracking-widest text-warm-dark/40 flex items-center gap-2 mt-1">
              <Mail className="w-3 h-3" /> {user.email}
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-dark/30" />
                <input 
                  type="text" 
                  value={profileData.name}
                  onChange={e => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border-2 border-warm-dark bg-warm-bg/20 focus:outline-none focus:bg-white transition-colors font-serif font-bold"
                  placeholder="Your Name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-dark/30" />
                <input 
                  type="tel" 
                  value={profileData.phone}
                  onChange={e => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border-2 border-warm-dark bg-warm-bg/20 focus:outline-none focus:bg-white transition-colors font-serif font-bold"
                  placeholder="Contact Number"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Delivery Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-4 w-4 h-4 text-warm-dark/30" />
              <textarea 
                rows={3}
                value={profileData.address}
                onChange={e => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border-2 border-warm-dark bg-warm-bg/20 focus:outline-none focus:bg-white transition-colors font-serif font-bold"
                placeholder="Door No, Street Name, Landmark..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">City</label>
              <input 
                type="text" 
                value={profileData.city}
                onChange={e => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-warm-dark bg-warm-bg/20 focus:outline-none focus:bg-white transition-colors font-serif font-bold"
                placeholder="e.g. Hyderabad"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-warm-dark/60">Pincode</label>
              <input 
                type="text" 
                value={profileData.pincode}
                onChange={e => setProfileData(prev => ({ ...prev, pincode: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-warm-dark bg-warm-bg/20 focus:outline-none focus:bg-white transition-colors font-serif font-bold"
                placeholder="6-digit PIN"
              />
            </div>
          </div>

          <div className="pt-6 flex items-center justify-between">
            <p className="text-xs font-serif italic text-warm-dark/40 max-w-[60%]">
              These details will be used to automatically fill your delivery information during checkout.
            </p>
            <button 
              disabled={isSaving}
              className={`flex items-center gap-2 px-8 py-4 font-bold uppercase tracking-widest text-sm transition-all shadow-[4px_4px_0px_#3A2A22] ${
                saveSuccess 
                  ? 'bg-green-500 text-white border-green-700 shadow-none translate-y-1' 
                  : 'bg-warm-dark text-white border-2 border-warm-dark hover:-translate-y-1 hover:shadow-[6px_6px_0px_#3A2A22]'
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
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User, MapPin, Phone, Mail, Save, Loader2, CheckCircle2, ShieldCheck, Compass, Plus, Trash2, Edit3, Star, Home, LogOut } from 'lucide-react';
import SEO from '../components/SEO';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { usePopups } from '../context/PopupContext';

export default function Profile() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const { showAlert, showToast, showConfirm } = usePopups();
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

  const [addresses, setAddresses] = useState<any[]>([]);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [addressFormData, setAddressFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    isDefault: false
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
          setAddresses(data.addresses || []);
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
      showToast("Profile saved successfully!", "success");
    } catch (error) {
      console.error("Error saving profile:", error);
      showAlert("Failed to save profile.", "Error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenAddressForm = (address?: any) => {
    if (address) {
      setEditingAddress(address);
      setAddressFormData({
        name: address.name || '',
        phone: address.phone || '',
        address: address.address || '',
        city: address.city || '',
        pincode: address.pincode || '',
        isDefault: address.isDefault || false
      });
    } else {
      setEditingAddress(null);
      setAddressFormData({
        name: '',
        phone: '',
        address: '',
        city: '',
        pincode: '',
        isDefault: false
      });
    }
    setIsAddressFormOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    let updatedAddresses = [...addresses];
    
    // If setting as default, clear other defaults
    if (addressFormData.isDefault) {
      updatedAddresses = updatedAddresses.map(addr => ({ ...addr, isDefault: false }));
    }

    const addressToSave = {
      ...addressFormData,
      id: editingAddress?.id || Math.random().toString(36).substring(2, 11)
    };

    if (editingAddress) {
      updatedAddresses = updatedAddresses.map(addr => addr.id === editingAddress.id ? addressToSave : addr);
    } else {
      if (updatedAddresses.length === 0) {
        addressToSave.isDefault = true;
      }
      updatedAddresses.push(addressToSave);
    }

    // Sync default address to primary profile fields
    const defaultAddr = updatedAddresses.find(addr => addr.isDefault);
    if (defaultAddr) {
      setProfileData({
        name: defaultAddr.name,
        phone: defaultAddr.phone,
        address: defaultAddr.address,
        city: defaultAddr.city,
        pincode: defaultAddr.pincode
      });
    }

    setAddresses(updatedAddresses);
    setIsAddressFormOpen(false);

    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        addresses: updatedAddresses,
        ...(defaultAddr ? {
          name: defaultAddr.name,
          phone: defaultAddr.phone,
          address: defaultAddr.address,
          city: defaultAddr.city,
          pincode: defaultAddr.pincode
        } : {})
      }, { merge: true });
      showToast("Address saved successfully!", "success");
    } catch (err) {
      console.error("Error saving address list:", err);
      showAlert("Failed to save address.", "Error");
    }
  };

  const handleDeleteAddress = async (idToDelete: string) => {
    if (!user) return;
    
    const confirmed = await showConfirm("Are you sure you want to delete this address?", "Delete Address");
    if (!confirmed) return;
    
    let updatedAddresses = addresses.filter(addr => addr.id !== idToDelete);
    
    // If we deleted the default, set the first one as default if any remain
    if (addresses.find(addr => addr.id === idToDelete)?.isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0].isDefault = true;
    }

    const defaultAddr = updatedAddresses.find(addr => addr.isDefault);
    if (defaultAddr) {
      setProfileData({
        name: defaultAddr.name,
        phone: defaultAddr.phone,
        address: defaultAddr.address,
        city: defaultAddr.city,
        pincode: defaultAddr.pincode
      });
    } else {
      setProfileData({
        name: '',
        phone: '',
        address: '',
        city: '',
        pincode: ''
      });
    }

    setAddresses(updatedAddresses);

    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        addresses: updatedAddresses,
        ...(defaultAddr ? {
          name: defaultAddr.name,
          phone: defaultAddr.phone,
          address: defaultAddr.address,
          city: defaultAddr.city,
          pincode: defaultAddr.pincode
        } : {
          name: '',
          phone: '',
          address: '',
          city: '',
          pincode: ''
        })
      }, { merge: true });
      showToast("Address deleted successfully!", "success");
    } catch (err) {
      console.error("Error deleting address:", err);
      showAlert("Failed to delete address.", "Error");
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-warm-bg/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-warm-accent animate-spin" />
          <p className="text-sm font-serif italic text-warm-dark/50">Retrieving profile details...</p>
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
        <h2 className="text-3xl font-heading font-black text-warm-dark uppercase tracking-wide mb-4">Sign In Required</h2>
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
    <div className="pt-8 md:pt-12 pb-24 px-4 sm:px-6 md:px-12 w-full max-w-5xl mx-auto min-h-screen bg-warm-bg/30">
      <SEO title="My Profile - Kaaram Kathalu" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start"
      >
        {/* Title and Intro */}
        <div className="lg:col-span-12 mb-4 mt-6 text-center">
          <span className="font-heading text-warm-accent text-xs font-bold uppercase tracking-[0.2em] block mb-2">My Account</span>
          <h1 className="text-4xl md:text-5xl font-heading font-black text-warm-dark uppercase tracking-tight">
            My <span className="text-warm-accent">Profile</span>
          </h1>
          <p className="text-warm-dark/60 font-serif italic text-sm mt-1">Manage your details for faster heritage deliveries.</p>
        </div>

        {/* Left Card: Account Card */}
        <div className="lg:col-span-4 bg-white border border-warm-accent/10 rounded-[32px] p-6 md:p-8 shadow-sm flex flex-col items-center text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-warm-accent/[0.02] rounded-full blur-xl pointer-events-none" />
          
          {/* Avatar Container */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-tr from-warm-accent/20 to-transparent rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-24 h-24 rounded-full bg-warm-light/50 border-[4px] border-white ring-4 ring-warm-accent/10 shadow-lg overflow-hidden relative z-10 flex items-center justify-center">
              {user.photoURL ? (
                <img src={user.photoURL} alt={profileData.name || user.displayName || 'Customer'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
            {profileData.name || user.displayName || 'Valued Customer'}
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

            <div className="pt-2 flex flex-col gap-2.5">
              <Link
                to="/my-orders"
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-warm-dark/10 bg-warm-light/20 hover:bg-white hover:border-warm-accent/40 text-warm-dark font-heading text-xs font-bold uppercase tracking-wider transition-all"
              >
                <span>My Orders</span>
                <span className="text-warm-accent text-sm">→</span>
              </Link>
              <button
                type="button"
                onClick={async () => {
                  const confirmed = await showConfirm("Are you sure you want to log out of your account?", "Log Out");
                  if (confirmed) {
                    await logout();
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-red-200 bg-red-50/60 hover:bg-red-600 hover:text-white text-red-700 font-heading text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer group"
              >
                <LogOut className="w-4 h-4 text-red-500 group-hover:text-white transition-colors" />
                <span>Log Out</span>
              </button>
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
                    placeholder="Your Full Name"
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

        {/* Saved Addresses Card */}
        <div className="lg:col-span-12 bg-white border border-warm-accent/10 rounded-[32px] p-6 md:p-10 shadow-sm text-left">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-warm-dark/5 pb-4 mb-6">
            <div>
              <h3 className="text-xl font-heading font-black text-warm-dark uppercase tracking-wider">
                Saved Shipping Addresses
              </h3>
              <p className="text-xs text-warm-dark/50 font-serif italic mt-0.5">Manage multiple shipping addresses for your deliveries.</p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenAddressForm()}
              className="inline-flex items-center gap-1.5 bg-warm-accent hover:bg-warm-dark text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-sm animate-fade-in"
            >
              <Plus className="w-4 h-4" /> Add New Address
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="text-center py-10 bg-warm-light/10 rounded-2xl border border-dashed border-warm-accent/10">
              <p className="font-serif italic text-warm-dark/40 text-sm">No saved addresses found. Add one to quick-fill checkout.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.map((addr) => (
                <div 
                  key={addr.id}
                  className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between ${
                    addr.isDefault 
                      ? 'border-warm-accent bg-warm-accent/[0.01] shadow-sm' 
                      : 'border-warm-dark/10 hover:border-warm-accent/50 bg-white'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-warm-dark font-serif text-base">{addr.name}</h4>
                      {addr.isDefault && (
                        <span className="inline-flex items-center gap-1 bg-warm-accent/10 text-warm-accent text-[9px] font-heading font-black uppercase px-2 py-0.5 rounded-full border border-warm-accent/25">
                          <Star className="w-2.5 h-2.5 fill-warm-accent" /> Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-serif text-warm-dark/85 leading-relaxed">{addr.address}</p>
                    <p className="text-sm font-serif text-warm-dark/85">{addr.city}, {addr.pincode}</p>
                    <p className="text-xs text-warm-dark/60 font-sans pt-1 flex items-center gap-1">
                      <span className="font-heading font-bold text-[9px] uppercase tracking-wider text-warm-accent">Phone</span> 
                      {addr.phone}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t border-warm-dark/5 pt-4 mt-4">
                    <button
                      type="button"
                      onClick={() => handleOpenAddressForm(addr)}
                      className="p-2 rounded-lg bg-warm-light hover:bg-warm-accent hover:text-white text-warm-dark/60 transition-colors cursor-pointer"
                      title="Edit Address"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="p-2 rounded-lg bg-warm-light hover:bg-red-600 hover:text-white text-warm-dark/60 transition-colors cursor-pointer"
                      title="Delete Address"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Address Form Dialog Modal */}
      <AnimatePresence>
        {isAddressFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-dark/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white border border-warm-accent/15 rounded-[32px] shadow-2xl max-w-lg w-full overflow-hidden text-left flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="bg-warm-light/40 px-6 py-5 border-b border-warm-accent/10 flex justify-between items-center">
                <h3 className="font-heading font-black text-warm-dark uppercase tracking-wider text-sm">
                  {editingAddress ? 'Edit Address' : 'Add Shipping Address'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddressFormOpen(false)}
                  className="w-8 h-8 rounded-full bg-white hover:bg-warm-accent hover:text-white text-warm-dark/60 border border-warm-dark/10 flex items-center justify-center transition-all cursor-pointer font-bold text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveAddress} className="p-6 overflow-y-auto space-y-4 flex-1">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-heading font-black tracking-widest uppercase text-warm-dark/50">Full Name</label>
                  <input
                    type="text"
                    required
                    value={addressFormData.name}
                    onChange={e => setAddressFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/10 focus:outline-none focus:border-warm-accent focus:bg-white transition-all font-serif text-sm font-semibold text-warm-dark"
                    placeholder="Recipient Full Name"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-heading font-black tracking-widest uppercase text-warm-dark/50">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={addressFormData.phone}
                    onChange={e => setAddressFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/10 focus:outline-none focus:border-warm-accent focus:bg-white transition-all font-serif text-sm font-semibold text-warm-dark"
                    placeholder="Recipient Phone Number"
                    pattern="[0-9]{10,12}"
                  />
                </div>

                {/* Address Text Area */}
                <div className="space-y-1">
                  <label className="text-[10px] font-heading font-black tracking-widest uppercase text-warm-dark/50">Shipping Address</label>
                  <textarea
                    required
                    rows={3}
                    value={addressFormData.address}
                    onChange={e => setAddressFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/10 focus:outline-none focus:border-warm-accent focus:bg-white transition-all font-serif text-sm font-semibold text-warm-dark"
                    placeholder="Flat/House No, Building, Street, Area..."
                  />
                </div>

                {/* City and Pincode */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-heading font-black tracking-widest uppercase text-warm-dark/50">City</label>
                    <input
                      type="text"
                      required
                      value={addressFormData.city}
                      onChange={e => setAddressFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/10 focus:outline-none focus:border-warm-accent focus:bg-white transition-all font-serif text-sm font-semibold text-warm-dark"
                      placeholder="e.g. Gudivada"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-heading font-black tracking-widest uppercase text-warm-dark/50">Pincode</label>
                    <input
                      type="text"
                      required
                      value={addressFormData.pincode}
                      onChange={e => setAddressFormData(prev => ({ ...prev, pincode: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-warm-dark/10 bg-warm-light/10 focus:outline-none focus:border-warm-accent focus:bg-white transition-all font-serif text-sm font-semibold text-warm-dark"
                      placeholder="6-digit PIN"
                      pattern="[0-9]{6}"
                    />
                  </div>
                </div>

                {/* Is Default Checkbox */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={addressFormData.isDefault}
                    onChange={e => setAddressFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                    className="w-4 h-4 text-warm-accent focus:ring-warm-accent border-warm-dark/10 rounded accent-warm-accent cursor-pointer"
                  />
                  <label htmlFor="isDefault" className="text-xs font-serif text-warm-dark/70 select-none cursor-pointer">
                    Set as default shipping address
                  </label>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-warm-dark/5 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddressFormOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-warm-dark/15 text-warm-dark font-heading font-black text-[10px] uppercase hover:bg-warm-light transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-warm-accent hover:bg-warm-dark text-white rounded-xl font-heading font-black text-[10px] uppercase shadow-sm transition-all cursor-pointer"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

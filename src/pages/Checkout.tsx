import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, runTransaction, doc, getDoc, query, where, limit, getDocs, updateDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { ArrowLeft, Package, Send, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';
import { motion } from 'motion/react';
import { usePopups } from '../context/PopupContext';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { showAlert, showToast, showConfirm } = usePopups();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const successOrderId = searchParams.get('id');
  const waybill = searchParams.get('waybill');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(() => {
    return sessionStorage.getItem('kk_checkout_success') === 'true' || searchParams.get('status') === 'success';
  });
  const [successWaybill, setSuccessWaybill] = useState<string>(() => {
    return sessionStorage.getItem('kk_checkout_waybill') || searchParams.get('waybill') || "";
  });
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [failedOrderId, setFailedOrderId] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState(() => {
    return sessionStorage.getItem('kk_checkout_selected_address_id') || "";
  });
  const [showNewAddressForm, setShowNewAddressForm] = useState(() => {
    return sessionStorage.getItem('kk_checkout_show_new_address_form') === 'true';
  });
  const [saveToProfile, setSaveToProfile] = useState(false);
  
  const [formData, setFormData] = useState(() => {
    const cached = sessionStorage.getItem('kk_checkout_form');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
    return {
      name: user?.displayName || '',
      email: user?.email || '',
      phone: '',
      address: '',
      city: '',
      pincode: ''
    };
  });

  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [pincodeError, setPincodeError] = useState<string | null>(null);

  const totalWeightGrams = cart.reduce((acc, item) => acc + (item.quantity * (item.product.weightGrams || 500)), 0);

  React.useEffect(() => {
    let active = true;
    const fetchShippingCost = async () => {
      const pin = formData.pincode.trim();
      if (!/^\d{6}$/.test(pin)) {
        if (active) {
          setShippingCost(null);
          setPincodeError(null);
        }
        return;
      }

      setIsCalculating(true);
      setPincodeError(null);
      const token = import.meta.env.VITE_DELHIVERY_API_TOKEN;
      
      if (!token || token === 'YOUR_DELHIVERY_API_TOKEN') {
        console.warn("Delhivery API token is not configured. Using fallback shipping cost.");
        if (active) {
          setShippingCost(null);
          setIsCalculating(false);
        }
        return;
      }

      try {
        // Determine backend API host for local dev compatibility (use live endpoint when running on localhost)
        const host = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
          ? 'https://kaaramkathalu.in' 
          : '';

        // 1. Verify Pincode Serviceability
        const serviceabilityUrl = `${host}/api/shipping?type=serviceability&pin=${pin}`;
        const serviceabilityRes = await fetch(serviceabilityUrl, {
          method: 'GET'
        });

        if (!serviceabilityRes.ok) {
          throw new Error(`Serviceability API returned status ${serviceabilityRes.status}`);
        }

        const serviceabilityData = await serviceabilityRes.json();
        
        if (active) {
          if (serviceabilityData && Array.isArray(serviceabilityData.delivery_codes)) {
            if (serviceabilityData.delivery_codes.length === 0) {
              setPincodeError("We do not ship to this pincode. Please try a different location.");
              setShippingCost(null);
              setIsCalculating(false);
              return;
            } else {
              // Auto-fill city if the user hasn't explicitly customized it yet
              const info = serviceabilityData.delivery_codes[0];
              if (info.district) {
                setFormData(prev => ({
                  ...prev,
                  city: prev.city || info.district
                }));
              }
            }
          }
        }

        // 2. Fetch shipping cost
        const o_pin = 560043;
        const cgm = totalWeightGrams || 500;
        const chargesUrl = `${host}/api/shipping?type=charges&o_pin=${o_pin}&d_pin=${pin}&cgm=${cgm}`;

        const response = await fetch(chargesUrl, {
          method: 'GET'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (active) {
          if (Array.isArray(data) && data.length > 0 && data[0].total_amount !== undefined) {
            const cost = Number(data[0].total_amount);
            if (!isNaN(cost) && cost > 0) {
              setShippingCost(Math.round(cost) + 10);
            } else {
              setShippingCost(null);
            }
          } else if (data && typeof data === 'object' && 'error' in data) {
            console.warn("Delhivery API error response:", data.error);
            setShippingCost(null);
          } else {
            console.warn("Unexpected Delhivery API response format:", data);
            setShippingCost(null);
          }
        }
      } catch (error) {
        console.error("Error fetching shipping charges from Delhivery:", error);
        // Fail-open: do not block if there is a network error or token issue
        if (active) {
          setPincodeError(null);
          setShippingCost(null);
        }
      } finally {
        if (active) {
          setIsCalculating(false);
        }
      }
    };

    fetchShippingCost();

    return () => {
      active = false;
    };
  }, [formData.pincode, totalWeightGrams]);

  React.useEffect(() => {
    sessionStorage.setItem('kk_checkout_form', JSON.stringify(formData));
  }, [formData]);

  React.useEffect(() => {
    sessionStorage.setItem('kk_checkout_selected_address_id', selectedAddressId);
  }, [selectedAddressId]);

  React.useEffect(() => {
    sessionStorage.setItem('kk_checkout_show_new_address_form', showNewAddressForm ? 'true' : 'false');
  }, [showNewAddressForm]);

  React.useEffect(() => {
    // If there are items in the cart and we are NOT in a successful callback, clear old success state
    if (cart.length > 0 && status !== 'success') {
      sessionStorage.removeItem('kk_checkout_success');
      sessionStorage.removeItem('kk_checkout_waybill');
      setIsSuccess(false);
      setSuccessWaybill("");
    }
  }, [cart, status]);

  React.useEffect(() => {
    if (status === 'success' && successOrderId) {
      setIsSuccess(true);
      setSuccessWaybill(waybill || "");
      sessionStorage.setItem('kk_checkout_success', 'true');
      if (waybill) {
        sessionStorage.setItem('kk_checkout_waybill', waybill);
      }
      clearCart();
      sessionStorage.removeItem('kk_checkout_form');
      sessionStorage.removeItem('kk_checkout_selected_address_id');
      sessionStorage.removeItem('kk_checkout_show_new_address_form');
    } else if (status === 'failure') {
      setPaymentFailed(true);
      setFailedOrderId(successOrderId);
    }
  }, [status, successOrderId, waybill, clearCart]);

  const hasLoadedInitialData = React.useRef(sessionStorage.getItem('kk_checkout_form') !== null);

  React.useEffect(() => {
    if (!user) return;

    const docRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const list = data.addresses || [];
        setSavedAddresses(list);

        if (!hasLoadedInitialData.current) {
          const defaultAddr = list.find((addr: any) => addr.isDefault);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
            setFormData(prev => ({
              ...prev,
              name: defaultAddr.name || data.name || user.displayName || prev.name,
              email: data.email || user.email || prev.email,
              phone: defaultAddr.phone || data.phone || prev.phone,
              address: defaultAddr.address || data.address || prev.address,
              city: defaultAddr.city || data.city || prev.city,
              pincode: defaultAddr.pincode || data.pincode || prev.pincode
            }));
          } else {
            setFormData(prev => ({
              ...prev,
              name: data.name || user.displayName || prev.name,
              email: data.email || user.email || prev.email,
              phone: data.phone || prev.phone,
              address: data.address || prev.address,
              city: data.city || prev.city,
              pincode: data.pincode || prev.pincode
            }));
          }
          hasLoadedInitialData.current = true;
        }
      } else {
        if (!hasLoadedInitialData.current) {
          setFormData(prev => ({
            ...prev,
            name: user.displayName || prev.name,
            email: user.email || prev.email
          }));
          hasLoadedInitialData.current = true;
        }
      }
    });

    return unsubscribe;
  }, [user]);

  if (!user && !isSuccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto">
        <AlertTriangle className="w-16 h-16 text-warm-accent mb-6 opacity-80" />
        <h2 className="text-3xl md:text-4xl font-serif text-warm-dark mb-4">Sign In Required</h2>
        <p className="text-warm-dark/60 mb-8 font-serif italic text-lg leading-relaxed">
          Please log in or create an account to proceed with your booking and experience our heritage.
        </p>
        <Link to="/login" className="px-8 py-4 bg-warm-accent hover:bg-warm-accent/90 text-white rounded-full font-bold tracking-widest uppercase text-xs transition-colors shadow-sm cursor-pointer">
          Sign In to Continue
        </Link>
      </div>
    );
  }

  if (cart.length === 0 && !isSuccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-serif text-warm-dark mb-4">Your basket is empty</h2>
        <Link to="/shop" className="px-8 py-3.5 bg-warm-accent hover:bg-warm-accent/90 text-white rounded-full font-bold tracking-widest uppercase text-xs transition-colors shadow-sm cursor-pointer">
          Return to Shop
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showAlert("Please log in to place an order.", "Authentication Required");
      return;
    }
    if (pincodeError) {
      showAlert("Please enter a serviceable pincode before placing your order.", "Unserviceable Location");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Resolve docIds first to prevent transaction read errors
      const resolvedCartItems = await Promise.all(cart.map(async (item) => {
        let docId = (item.product as any).docId;
        if (!docId) {
          const q = query(collection(db, 'products'), where('id', '==', Number(item.product.id)), limit(1));
          const snap = await getDocs(q);
          if (!snap.empty) {
            docId = snap.docs[0].id;
          } else {
            throw new Error(`Product ${item.product.name} not found in our catalog.`);
          }
        }
        return { ...item, resolvedDocId: docId };
      }));

      // Generate sequential Order ID in format KKYYMMXXX starting from 001 (e.g. KK2608001, KK2608002)
      const now = new Date();
      const year = String(now.getFullYear()).slice(-2);
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const monthPrefix = `KK${year}${month}`;

      let nextSeq = 1;
      try {
        const qOrders = query(
          collection(db, 'orders'),
          where('__name__', '>=', monthPrefix),
          where('__name__', '<=', monthPrefix + '\uf8ff')
        );
        const orderSnap = await getDocs(qOrders);
        let maxSeq = 0;
        orderSnap.docs.forEach(docSnap => {
          const idStr = docSnap.id;
          if (idStr.startsWith(monthPrefix)) {
            const seqStr = idStr.slice(monthPrefix.length);
            const seqNum = parseInt(seqStr, 10);
            if (!isNaN(seqNum) && seqNum > maxSeq) {
              maxSeq = seqNum;
            }
          }
        });
        nextSeq = maxSeq + 1;
      } catch (err) {
        console.warn("Could not query existing order sequence, fallback:", err);
        nextSeq = 1;
      }

      const seqFormatted = String(nextSeq).padStart(3, '0');
      const customOrderId = `${monthPrefix}${seqFormatted}`;

      const orderRef = doc(db, 'orders', customOrderId);
      const orderId = orderRef.id;

      await runTransaction(db, async (transaction) => {
        // 1. Verify all items are in stock
        const stockChecks = await Promise.all(resolvedCartItems.map(async (item) => {
          const productRef = doc(db, 'products', item.resolvedDocId);
          const productSnap = await transaction.get(productRef);
          
          if (!productSnap.exists()) {
            throw new Error(`Product ${item.product.name} no longer exists.`);
          }
          
          const currentStock = productSnap.data().stock || 0;
          if (currentStock < item.quantity) {
            throw new Error(`Insufficient stock for ${item.product.name}. Only ${currentStock} left.`);
          }
          
          return { ref: productRef, newStock: currentStock - item.quantity };
        }));

        // 2. Prepare Order Data
        const orderData = {
          customer: formData,
          userId: user.uid,
          items: resolvedCartItems.map(item => {
            const itemWeight = item.selectedWeight || item.product.weightGrams || 500;
            const weightMultiplier = itemWeight === 250 ? 0.5 : itemWeight === 1000 ? 2 : 1;
            const unitPrice = item.unitPrice ?? ((item.product.price * weightMultiplier) + (item.selectedJar ? 100 : 0));
            return {
              id: item.product.id,
              docId: item.resolvedDocId,
              name: item.product.name,
              price: unitPrice,
              quantity: item.quantity,
              weightGrams: itemWeight,
              selectedWeight: itemWeight,
              selectedJar: !!item.selectedJar
            };
          }),
          total: cartTotal + (shippingCost ?? 0),
          shippingCost: shippingCost ?? 0,
          status: 'payment_pending',
          createdAt: serverTimestamp()
        };

        // 3. Execute updates
        transaction.set(orderRef, orderData);
        
        stockChecks.forEach(check => {
          transaction.update(check.ref, { stock: check.newStock });
        });
      });

      // Auto-save address to user's profile if selected
      if (saveToProfile && user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          let currentAddresses = [];
          if (userSnap.exists()) {
            currentAddresses = userSnap.data().addresses || [];
          }
          const isAlreadySaved = currentAddresses.some((addr: any) => 
            addr.address === formData.address && addr.pincode === formData.pincode
          );
          if (!isAlreadySaved) {
            const addressToSave = {
              id: Math.random().toString(36).substring(2, 11),
              name: formData.name,
              phone: formData.phone,
              address: formData.address,
              city: formData.city,
              pincode: formData.pincode,
              isDefault: currentAddresses.length === 0
            };
            const updatedAddresses = [...currentAddresses, addressToSave];
            await setDoc(userRef, {
              addresses: updatedAddresses,
              ...(currentAddresses.length === 0 ? {
                name: formData.name,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                pincode: formData.pincode
              } : {})
            }, { merge: true });
          }
        } catch (err) {
          console.error("Error auto-saving address to profile during checkout:", err);
        }
      }

      // 4. Request PhonePe Redirect URL from Backend API Proxy
      const host = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000' 
        : '';
        
      const response = await fetch(`${host}/api/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initialize payment gateway.');
      }

      const payData = await response.json();
      if (payData.url) {
        // Redirect to PhonePe payment page
        window.location.href = payData.url;
      } else {
        throw new Error('Payment gateway did not return a valid URL.');
      }
    } catch (error: any) {
      console.error("Error placing order:", error);
      showAlert(error.message || "Failed to place order. Please try again.", "Order Placement Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (paymentFailed) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-24 h-24 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-8 border border-red-100 shadow-sm"
        >
          <AlertTriangle className="w-12 h-12" />
        </motion.div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-4xl md:text-5xl font-serif text-warm-dark mb-6"
        >
          Payment Unsuccessful
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-warm-dark/60 mb-8 font-serif italic text-lg leading-relaxed"
        >
          {failedOrderId ? `We couldn't process your payment for order ${failedOrderId}.` : "We couldn't process your payment."} If money was deducted, it will be automatically refunded by PhonePe. Please try checking out again.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={() => {
              setPaymentFailed(false);
              setFailedOrderId(null);
              navigate('/checkout');
            }}
            className="px-8 py-4 bg-warm-accent hover:bg-warm-accent/90 text-white rounded-full font-bold tracking-widest uppercase text-xs transition-colors shadow-sm cursor-pointer"
          >
            Retry Checkout
          </button>
          <Link
            to="/shop"
            className="px-8 py-4 bg-white hover:bg-warm-light/40 border border-warm-dark/15 text-warm-dark rounded-full font-bold tracking-widest uppercase text-xs transition-colors shadow-sm cursor-pointer flex items-center justify-center"
          >
            Back to Shop
          </Link>
        </motion.div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-8 border border-green-100 shadow-sm"
        >
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-4xl md:text-5xl font-serif text-warm-dark mb-6"
        >
          Order Placed Successfully!
        </motion.h2>

        {successOrderId && (
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="text-sm font-heading font-black tracking-widest text-warm-accent uppercase mb-4"
          >
            Order ID: {successOrderId}
          </motion.p>
        )}

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-warm-dark/60 mb-8 font-serif italic text-lg leading-relaxed"
        >
          Thank you for choosing Kaaram Kathalu. We've received your order and our artisans are preparing your jars of heritage. You'll receive an update soon.
        </motion.p>

        {successWaybill && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-10 p-5 bg-green-50/40 border border-green-200/50 rounded-2xl max-w-md w-full flex flex-col items-center gap-1.5 shadow-sm"
          >
            <span className="text-[10px] font-heading font-black tracking-widest text-green-800 uppercase">Delhivery Tracking AWB</span>
            <span className="font-mono text-xl font-bold text-green-950 tracking-wider select-all">{successWaybill}</span>
            <Link 
              to={`/my-orders`}
              className="text-xs text-green-700 hover:text-green-900 transition-colors font-serif underline mt-1"
            >
              Track Live Status in My Orders
            </Link>
          </motion.div>
        )}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link to="/shop" className="px-8 py-4 bg-warm-accent hover:bg-warm-accent/90 text-white rounded-full font-bold tracking-widest uppercase text-xs transition-colors shadow-sm cursor-pointer">
            Continue Shopping
          </Link>
          <Link to="/" className="px-8 py-4 bg-white hover:bg-warm-light/40 border border-warm-dark/15 text-warm-dark rounded-full font-bold tracking-widest uppercase text-xs transition-colors shadow-sm cursor-pointer">
            Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-8 md:pt-12 pb-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
      <SEO title="Checkout" description="Proceed to complete your purchase and secure your traditional jars." />
      
      <div className="mb-8">
        <Link to="/shop" className="inline-flex items-center gap-2 text-warm-dark font-bold uppercase tracking-widest text-xs hover:text-warm-accent transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Checkout Form */}
        <div className="bg-white rounded-[24px] border border-warm-dark/5 p-6 sm:p-8 md:p-10 shadow-md">
          <h1 className="text-3xl font-serif text-warm-dark mb-8">Delivery Details</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {savedAddresses.length > 0 && !showNewAddressForm ? (
              <div className="space-y-6">
                {/* Carousel */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-warm-dark/50 text-left">
                      Select a Saved Address
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAddressId("");
                        setShowNewAddressForm(true);
                        setFormData(prev => ({
                          ...prev,
                          name: '',
                          phone: '',
                          address: '',
                          city: '',
                          pincode: ''
                        }));
                      }}
                      className="text-[10px] font-heading font-black text-warm-accent hover:text-warm-dark uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      + Add New Address
                    </button>
                  </div>
                  
                  <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-warm-accent/20">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <button
                          type="button"
                          key={addr.id}
                          onClick={() => {
                            setSelectedAddressId(addr.id);
                            setShowNewAddressForm(false);
                            setFormData(prev => ({
                              ...prev,
                              name: addr.name || '',
                              phone: addr.phone || '',
                              address: addr.address || '',
                              city: addr.city || '',
                              pincode: addr.pincode || ''
                            }));
                          }}
                          className={`p-4 rounded-xl border text-left flex-shrink-0 w-64 transition-all duration-300 cursor-pointer ${
                            isSelected 
                              ? 'border-warm-accent bg-warm-accent/[0.02] shadow-sm scale-[1.01]' 
                              : 'border-warm-dark/10 hover:border-warm-accent/40 bg-white'
                          }`}
                        >
                          <h4 className="font-bold text-warm-dark font-serif text-sm flex items-center justify-between">
                            <span className="truncate pr-2">{addr.name}</span>
                            {isSelected && <span className="w-2 h-2 rounded-full bg-warm-accent flex-shrink-0"></span>}
                          </h4>
                          <p className="text-xs font-serif text-warm-dark/70 truncate mt-1">{addr.address}</p>
                          <p className="text-xs font-serif text-warm-dark/70">{addr.city}, {addr.pincode}</p>
                          <p className="text-[10px] text-warm-dark/50 mt-1">Phone: {addr.phone}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Address Summary Card */}
                {selectedAddressId && (
                  <div className="bg-warm-light/20 p-6 rounded-2xl border border-warm-accent/10 text-left font-serif space-y-3 shadow-inner">
                    <div className="flex justify-between items-center pb-2 border-b border-warm-dark/5">
                      <span className="text-[9px] font-heading font-black tracking-widest text-warm-accent uppercase">Selected Delivery Address</span>
                      <span className="text-[10px] font-mono text-warm-dark/40 font-bold">PIN: {formData.pincode}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-warm-dark text-base">{formData.name}</h4>
                      <p className="text-sm text-warm-dark/80 mt-1 leading-relaxed">{formData.address}</p>
                      <p className="text-sm text-warm-dark/80">{formData.city}, {formData.pincode}</p>
                    </div>
                    <div className="pt-2 border-t border-warm-dark/5 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between text-xs text-warm-dark/60 font-sans">
                      <div>
                        <span className="font-semibold text-warm-dark/80">Phone:</span> {formData.phone}
                        <span className="mx-2 hidden sm:inline">|</span>
                        <span className="block sm:inline"><span className="font-semibold text-warm-dark/80">Email:</span> {formData.email}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Standard Address Input Fields
              <div className="space-y-6">
                {savedAddresses.length > 0 && (
                  <div className="flex justify-between items-center pb-2 border-b border-warm-dark/5">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-warm-dark/50">Enter New Delivery Address</span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewAddressForm(false);
                        const defaultAddr = savedAddresses.find(addr => addr.isDefault) || savedAddresses[0];
                        if (defaultAddr) {
                          setSelectedAddressId(defaultAddr.id);
                          setFormData(prev => ({
                            ...prev,
                            name: defaultAddr.name || '',
                            phone: defaultAddr.phone || '',
                            address: defaultAddr.address || '',
                            city: defaultAddr.city || '',
                            pincode: defaultAddr.pincode || ''
                          }));
                        }
                      }}
                      className="text-[10px] font-heading font-black text-warm-accent hover:text-warm-dark uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      ← Use Saved Address
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-warm-dark/50 mb-2">Full Name</label>
                    <input 
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-warm-dark/10 rounded-xl p-3.5 font-serif focus:ring-0 focus:border-warm-accent outline-none focus:bg-white transition-all shadow-sm focus:shadow-md"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-warm-dark/50 mb-2">Phone Number</label>
                    <input 
                      required
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-warm-dark/10 rounded-xl p-3.5 font-serif focus:ring-0 focus:border-warm-accent outline-none focus:bg-white transition-all shadow-sm focus:shadow-md"
                      placeholder="+91 00000 00000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-warm-dark/50 mb-2">Email Address</label>
                  <input 
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-warm-dark/10 rounded-xl p-3.5 font-serif focus:ring-0 focus:border-warm-accent outline-none focus:bg-white transition-all shadow-sm focus:shadow-md"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-warm-dark/50 mb-2">Shipping Address</label>
                  <textarea 
                    required
                    name="address"
                    rows={3}
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-warm-dark/10 rounded-xl p-3.5 font-serif focus:ring-0 focus:border-warm-accent outline-none focus:bg-white transition-all shadow-sm focus:shadow-md resize-none"
                    placeholder="House No, Street Name, Landmark"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-warm-dark/50 mb-2">City</label>
                    <input 
                      required
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-warm-dark/10 rounded-xl p-3.5 font-serif focus:ring-0 focus:border-warm-accent outline-none focus:bg-white transition-all shadow-sm focus:shadow-md"
                      placeholder="Hyderabad"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-warm-dark/50 mb-2">Pincode</label>
                    <input 
                      required
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className={`w-full bg-white border ${pincodeError ? 'border-red-500 focus:border-red-500' : 'border-warm-dark/10 focus:border-warm-accent'} rounded-xl p-3.5 font-serif focus:ring-0 outline-none focus:bg-white transition-all shadow-sm focus:shadow-md`}
                      placeholder="500001"
                    />
                    {pincodeError && (
                      <p className="text-red-500 text-xs font-serif italic mt-1.5">{pincodeError}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {(savedAddresses.length === 0 || showNewAddressForm) && user && (
              <div className="flex items-center gap-2 mb-4 text-left">
                <input
                  type="checkbox"
                  id="saveToProfile"
                  checked={saveToProfile}
                  onChange={e => setSaveToProfile(e.target.checked)}
                  className="w-4 h-4 text-warm-accent focus:ring-warm-accent border-warm-dark/10 rounded accent-warm-accent cursor-pointer"
                />
                <label htmlFor="saveToProfile" className="text-xs font-serif text-warm-dark/70 select-none cursor-pointer">
                  Save this address to my profile for future orders
                </label>
              </div>
            )}

            <button 
              type="submit"
              disabled={isSubmitting || isCalculating || !!pincodeError}
              className="w-full bg-warm-accent hover:bg-warm-accent/95 text-white py-4.5 rounded-xl font-bold tracking-widest uppercase text-xs transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer shadow-sm hover:shadow-md"
            >
              {isSubmitting ? 'Processing...' : (
                <>
                  <Send className="w-4 h-4" /> {saveToProfile ? 'Save Address and Confirm Order' : 'Confirm Order'}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="flex flex-col gap-8">
          <div className="bg-white border border-warm-dark/5 rounded-[24px] p-6 sm:p-8 shadow-md relative">
            <h3 className="text-2xl font-serif text-warm-dark mb-8 flex items-center gap-3">
              <Package className="w-6 h-6 text-warm-accent" /> Your Items
            </h3>
            
            <div className="space-y-6 mb-8">
              {cart.map(item => {
                const itemKey = item.cartItemId || String(item.product.id);
                const weight = item.selectedWeight || item.product.weightGrams || 500;
                const weightMultiplier = weight === 250 ? 0.5 : weight === 1000 ? 2 : 1;
                const price = item.unitPrice ?? ((item.product.price * weightMultiplier) + (item.selectedJar ? 100 : 0));
                return (
                  <div key={itemKey} className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h4 className="font-serif font-bold text-warm-dark">{item.product.name}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs text-warm-dark/50 font-serif">Qty: {item.quantity}</span>
                        <span className="text-[10px] bg-warm-dark/5 px-2 py-0.5 rounded font-medium text-warm-dark/70 font-sans">{weight}g</span>
                        {item.selectedJar && (
                          <span className="text-[9px] bg-warm-accent/10 border border-warm-accent/30 text-warm-accent px-1.5 py-0.5 rounded font-bold">
                            🫙 Glass Jar (+₹100)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="font-bold text-warm-dark font-serif">₹{price * item.quantity}</div>
                  </div>
                );
              })}
            </div>
            
            <div className="pt-6 border-t border-dashed border-warm-dark/10 space-y-4">
              <div className="flex justify-between text-warm-dark/50 text-xs font-semibold uppercase tracking-wider">
                <span>Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              <div className="flex justify-between text-warm-dark/50 text-xs font-semibold uppercase tracking-wider items-center">
                <span>Shipping</span>
                {formData.pincode.trim().length !== 6 ? (
                  <span className="text-warm-dark/40 font-serif text-xs normal-case italic">
                    Enter Pincode
                  </span>
                ) : isCalculating ? (
                  <span className="flex items-center gap-1.5 text-warm-accent font-serif text-xs normal-case italic">
                    <Loader2 className="w-3 h-3 animate-spin" /> Calculating...
                  </span>
                ) : pincodeError ? (
                  <span className="text-red-500 font-bold font-serif text-xs uppercase">
                    Unserviceable
                  </span>
                ) : shippingCost === null ? (
                  <span className="text-warm-dark/40 font-serif text-xs normal-case italic">
                    Unavailable
                  </span>
                ) : (
                  <span className="text-warm-accent font-bold font-serif text-sm">
                    {shippingCost === 0 ? 'Free' : `₹${shippingCost}`}
                  </span>
                )}
              </div>
              <div className="flex justify-between text-warm-dark/50 text-xs font-semibold uppercase tracking-wider">
                <span>Total Weight</span>
                <span className="text-warm-dark/70 font-bold">{totalWeightGrams}g</span>
              </div>
              <div className="flex justify-between items-center pt-5 border-t border-warm-dark/10">
                <span className="font-serif text-xl font-bold text-warm-dark">Grand Total</span>
                <span className="font-serif text-2xl font-bold text-warm-accent">
                  {pincodeError || shippingCost === null
                    ? '—'
                    : formData.pincode.trim().length !== 6
                    ? `₹${cartTotal}`
                    : `₹${cartTotal + shippingCost}`}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-warm-light text-warm-dark border border-warm-dark/5 p-6 sm:p-8 rounded-[24px] shadow-sm">
            <h4 className="font-serif text-xl font-bold mb-4 italic text-warm-accent">Artisanal Guarantee</h4>
            <p className="text-warm-dark/80 font-serif leading-relaxed italic text-sm">
              "Every jar is packed by hand and sent with the same care as if it were for our own family. Thank you for supporting our heritage."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

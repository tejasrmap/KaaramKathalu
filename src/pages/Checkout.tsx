import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, runTransaction, doc, getDoc, query, where, limit, getDocs } from 'firebase/firestore';
import { ArrowLeft, Package, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import SEO from '../components/SEO';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    pincode: ''
  });

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData(prev => ({
            ...prev,
            name: data.name || user.displayName || prev.name,
            email: data.email || user.email || prev.email,
            phone: data.phone || prev.phone,
            address: data.address || prev.address,
            city: data.city || prev.city,
            pincode: data.pincode || prev.pincode
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            name: user.displayName || prev.name,
            email: user.email || prev.email
          }));
        }
      }
    };
    fetchProfile();
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
      alert("Please log in to place an order.");
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
            throw new Error(`Product ${item.product.name} not found in our pantry.`);
          }
        }
        return { ...item, resolvedDocId: docId };
      }));

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
          items: cart.map(item => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity
          })),
          total: cartTotal,
          status: 'pending',
          createdAt: serverTimestamp()
        };

        // 3. Execute updates
        const orderRef = doc(collection(db, 'orders'));
        transaction.set(orderRef, orderData);
        
        stockChecks.forEach(check => {
          transaction.update(check.ref, { stock: check.newStock });
        });
      });
      
      setIsSuccess(true);
      clearCart();
    } catch (error: any) {
      console.error("Error placing order:", error);
      alert(error.message || "Failed to place order. Please try again.");
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

  if (isSuccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto">
        <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-8 border border-green-100 shadow-sm">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-4xl md:text-5xl font-serif text-warm-dark mb-6">Order Placed Successfully!</h2>
        <p className="text-warm-dark/60 mb-10 font-serif italic text-lg leading-relaxed">
          Thank you for choosing Kaaram Kathalu. We've received your order and our artisans are preparing your jars of heritage. You'll receive an update soon.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/shop" className="px-8 py-4 bg-warm-accent hover:bg-warm-accent/90 text-white rounded-full font-bold tracking-widest uppercase text-xs transition-colors shadow-sm cursor-pointer">
            Continue Shopping
          </Link>
          <Link to="/" className="px-8 py-4 bg-white hover:bg-warm-light/40 border border-warm-dark/15 text-warm-dark rounded-full font-bold tracking-widest uppercase text-xs transition-colors shadow-sm cursor-pointer">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-32 pb-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
      <SEO title="Checkout" description="Proceed to complete your purchase and secure your traditional jars." />
      
      <div className="mb-8">
        <Link to="/shop" className="inline-flex items-center gap-2 text-warm-dark font-bold uppercase tracking-widest text-xs hover:text-warm-accent transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Pantry
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Checkout Form */}
        <div className="bg-white rounded-[24px] border border-warm-dark/5 p-6 sm:p-8 md:p-10 shadow-md">
          <h1 className="text-3xl font-serif text-warm-dark mb-8">Delivery Details</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="w-full bg-white border border-warm-dark/10 rounded-xl p-3.5 font-serif focus:ring-0 focus:border-warm-accent outline-none focus:bg-white transition-all shadow-sm focus:shadow-md"
                  placeholder="500001"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-warm-accent hover:bg-warm-accent/95 text-white py-4.5 rounded-xl font-bold tracking-widest uppercase text-xs transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer shadow-sm hover:shadow-md"
            >
              {isSubmitting ? 'Processing...' : (
                <>
                  <Send className="w-4 h-4" /> Confirm Order
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
              {cart.map(item => (
                <div key={item.product.id} className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h4 className="font-serif font-bold text-warm-dark">{item.product.name}</h4>
                    <p className="text-sm text-warm-dark/50">Quantity: {item.quantity}</p>
                  </div>
                  <div className="font-bold text-warm-dark font-serif">₹{item.product.price * item.quantity}</div>
                </div>
              ))}
            </div>
            
            <div className="pt-6 border-t border-dashed border-warm-dark/10 space-y-4">
              <div className="flex justify-between text-warm-dark/50 text-xs font-semibold uppercase tracking-wider">
                <span>Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              <div className="flex justify-between text-warm-dark/50 text-xs font-semibold uppercase tracking-wider">
                <span>Shipping</span>
                <span className="text-warm-accent">Free</span>
              </div>
              <div className="flex justify-between items-center pt-5 border-t border-warm-dark/10">
                <span className="font-serif text-xl font-bold text-warm-dark">Grand Total</span>
                <span className="font-serif text-2xl font-bold text-warm-accent">₹{cartTotal}</span>
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

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Package, Truck, CheckCircle, Clock, ArrowRight, Loader2, ShoppingBag, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { motion } from 'motion/react';

export default function MyOrders() {
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    const q = query(
      collection(db, 'orders'),
      where('customer.email', '==', user.email),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) || 'Recent'
      }));
      setOrders(ordersData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [user, authLoading]);

  const getStatusDetails = (status: string) => {
    const s = status.toLowerCase();
    switch(s) {
      case 'delivered': 
        return {
          bg: 'bg-green-50 text-green-700 border-green-200/50',
          icon: <CheckCircle className="w-3.5 h-3.5" />,
          label: 'Delivered'
        };
      case 'shipped': 
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/50',
          icon: <Truck className="w-3.5 h-3.5" />,
          label: 'In Transit'
        };
      case 'processing': 
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200/50',
          icon: <Clock className="w-3.5 h-3.5" />,
          label: 'Processing'
        };
      default: 
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200/50',
          icon: <Clock className="w-3.5 h-3.5" />,
          label: status
        };
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-warm-bg/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-warm-accent animate-spin" />
          <p className="text-sm font-serif italic text-warm-dark/50">Tracking your spicy treasures...</p>
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
        <h2 className="text-3xl font-heading font-black text-warm-dark uppercase tracking-wide mb-4">Identification Required</h2>
        <p className="text-warm-dark/60 mb-8 font-serif italic text-sm leading-relaxed">
          Please sign in to view your culinary parcel status and track current shipments.
        </p>
        <Link 
          to="/login"
          className="w-full bg-warm-accent text-white py-4 rounded-xl font-heading font-black tracking-widest uppercase hover:bg-warm-dark transition-all duration-300 shadow-md text-sm block"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-32 pb-24 px-4 sm:px-6 md:px-12 max-w-5xl mx-auto min-h-screen bg-warm-bg/30">
      <SEO title="My Orders - Kaaram Kathalu" description="Track your heritage pickle and podi orders." />
      
      {/* Title Block */}
      <div className="mb-12 mt-6">
        <span className="font-heading text-warm-accent text-xs font-bold uppercase tracking-[0.2em] block mb-2">Track Orders</span>
        <h1 className="text-4xl md:text-5xl font-heading font-black text-warm-dark uppercase tracking-tight">
          My <span className="text-warm-accent italic font-light font-serif">Parcels</span>
        </h1>
        <p className="text-warm-dark/60 font-serif italic text-sm mt-1">Track your spicy treasures as they travel from our kitchen to yours.</p>
        <div className="w-16 h-1 bg-warm-accent/80 mt-4 rounded-full"></div>
      </div>

      {orders.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white border border-warm-accent/10 rounded-[32px] p-12 text-center shadow-sm max-w-2xl mx-auto"
        >
          <div className="w-20 h-20 bg-warm-light rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-warm-accent/40 animate-pulse" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-warm-dark mb-3 uppercase tracking-wider">No parcels yet</h2>
          <p className="text-warm-dark/60 mb-8 font-serif italic text-sm leading-relaxed max-w-md mx-auto">
            Your culinary journey with Kaaram Kathalu hasn't started yet. Let's fill your pantry with authentic delicacies!
          </p>
          <Link 
            to="/shop" 
            className="inline-block bg-warm-accent text-white px-10 py-4 rounded-xl font-heading font-black tracking-widest uppercase text-xs hover:bg-warm-dark transition-all duration-300 shadow-md"
          >
            Explore Pantry
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {orders.map((order, idx) => {
            const statusInfo = getStatusDetails(order.status);
            return (
              <motion.div 
                key={order.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="bg-white border border-warm-accent/10 rounded-[32px] shadow-sm flex flex-col md:flex-row overflow-hidden group hover:shadow-md transition-shadow duration-300"
              >
                {/* Status Column */}
                <div className="bg-warm-light/40 p-6 md:w-64 border-b md:border-b-0 md:border-r border-warm-accent/10 flex flex-row md:flex-col justify-between items-center md:items-start relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-warm-accent/[0.01] rounded-full blur-xl pointer-events-none" />
                  <div>
                    <p className="text-[10px] font-heading font-black tracking-widest text-warm-dark/40 uppercase mb-1">Order ID</p>
                    <p className="font-bold text-warm-dark font-serif text-base">#{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  
                  <div className="mt-0 md:mt-8">
                    <p className="text-[10px] font-heading font-black tracking-widest text-warm-dark/40 uppercase mb-1.5 hidden md:block">Status</p>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-heading font-black uppercase tracking-wider border ${statusInfo.bg}`}>
                      {statusInfo.icon}
                      {statusInfo.label}
                    </div>
                  </div>
                </div>

                {/* Details Column */}
                <div className="flex-1 p-6 md:p-8">
                  {/* Summary Bar */}
                  <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-dashed border-warm-accent/10 text-left">
                    <div>
                      <p className="text-[10px] font-heading font-black tracking-widest text-warm-dark/40 uppercase mb-1">Ordered On</p>
                      <p className="font-bold text-warm-dark font-serif text-sm">{order.date}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-heading font-black tracking-widest text-warm-dark/40 uppercase mb-1">Total Value</p>
                      <p className="font-bold text-warm-accent font-serif text-base">₹{order.total}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-heading font-black tracking-widest text-warm-dark/40 uppercase mb-1">Delivery To</p>
                      <p className="font-bold text-warm-dark font-serif text-sm truncate max-w-[150px]">{order.customer?.city}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2.5">
                    {order.items?.map((item: any, idx: number) => (
                      <div 
                        key={idx} 
                        className="flex justify-between items-center bg-warm-light/20 px-4 py-2.5 rounded-xl border border-warm-accent/5 hover:border-warm-accent/10 transition-colors duration-200"
                      >
                        <span className="font-serif font-semibold text-warm-dark text-sm">
                          {item.name} 
                          <span className="text-warm-dark/40 font-sans text-xs ml-2 font-normal">x{item.quantity}</span>
                        </span>
                        <span className="font-bold text-warm-dark/60 text-sm">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

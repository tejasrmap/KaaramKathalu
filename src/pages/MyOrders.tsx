import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Package, Truck, CheckCircle, Clock, ArrowRight, Loader2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

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
        date: doc.data().createdAt?.toDate().toLocaleDateString() || 'Recent'
      }));
      setOrders(ordersData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [user, authLoading]);

  const getStatusIcon = (status: string) => {
    switch(status.toLowerCase()) {
      case 'delivered': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'shipped': return <Truck className="w-5 h-5 text-purple-500" />;
      case 'processing': return <Clock className="w-5 h-5 text-blue-500" />;
      default: return <Clock className="w-5 h-5 text-orange-500" />;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-warm-accent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-serif text-warm-dark mb-4">Identification Required</h2>
        <p className="text-warm-dark/60 mb-8 font-serif">Please sign in to view your order history.</p>
        <Link to="/login" className="px-8 py-3 bg-warm-dark text-white font-bold tracking-widest uppercase text-xs shadow-[4px_4px_0px_#3A2A22] hover:translate-y-1 transition-all">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-32 pb-24 px-4 sm:px-6 md:px-12 max-w-5xl mx-auto min-h-[70vh]">
      <SEO title="My Orders" description="Track your heritage pickle and podi orders." />
      
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-serif text-warm-dark mb-3 italic">My Parcels</h1>
        <p className="text-warm-dark/60 font-serif">Track your spicy treasures as they travel from our kitchen to yours.</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border-2 border-warm-dark p-12 text-center shadow-[8px_8px_0px_#3A2A22] transform -rotate-1">
          <ShoppingBag className="w-16 h-16 text-warm-dark/10 mx-auto mb-6" />
          <h2 className="text-2xl font-serif text-warm-dark mb-4">No parcels yet</h2>
          <p className="text-warm-dark/60 mb-8 font-serif italic">Your journey with Kaaram Kathalu hasn't started yet. Let's fix that!</p>
          <Link to="/shop" className="px-10 py-4 bg-warm-accent text-white font-bold tracking-widest uppercase text-xs shadow-[4px_4px_0px_#3A2A22] hover:translate-y-1 hover:shadow-none transition-all">
            Explore Pantry
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map(order => (
            <div key={order.id} className="bg-white border-2 border-warm-dark shadow-[4px_4px_0px_#3A2A22] md:shadow-[8px_8px_0px_#3A2A22] flex flex-col md:flex-row overflow-hidden transform hover:-translate-y-1 transition-transform group">
              <div className="bg-[#F4EBE1] p-6 md:w-64 border-b-2 md:border-b-0 md:border-r-2 border-warm-dark flex flex-col justify-between relative overflow-hidden">
                 <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]"></div>
                 <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-warm-dark/40 mb-1">Order ID</p>
                    <p className="font-bold text-warm-dark font-serif text-lg">#{order.id.slice(0, 8)}</p>
                 </div>
                 <div className="mt-4 md:mt-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-warm-dark/40 mb-1">Status</p>
                    <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-warm-dark">
                       {getStatusIcon(order.status)}
                       {order.status}
                    </div>
                 </div>
              </div>

              <div className="flex-1 p-6 md:p-8">
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6 pb-6 border-b-2 border-dashed border-warm-dark/10">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-warm-dark/40 mb-1">Ordered On</p>
                    <p className="font-bold text-warm-dark font-serif">{order.date}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-warm-dark/40 mb-1">Total Value</p>
                    <p className="font-bold text-warm-accent font-serif text-xl">₹{order.total}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-warm-dark/40 mb-1">Delivery To</p>
                    <p className="font-bold text-warm-dark font-serif text-sm truncate max-w-[200px]">{order.customer?.city}</p>
                  </div>
                </div>

                <div className="space-y-3">
                   {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-warm-bg/30 px-4 py-2 border border-warm-dark/10 text-sm">
                         <span className="font-serif font-bold text-warm-dark">{item.name} <span className="text-warm-dark/40 font-sans ml-2">x{item.quantity}</span></span>
                         <span className="font-bold text-warm-dark/60">₹{item.price * item.quantity}</span>
                      </div>
                   ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

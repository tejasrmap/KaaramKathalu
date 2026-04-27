import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Package, Clock, CheckCircle2, Truck, AlertCircle, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function MyOrders() {
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/my-orders' } } });
      return;
    }

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
  }, [user, authLoading, navigate]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="w-5 h-5 text-orange-500" />;
      case 'processing': return <Package className="w-5 h-5 text-blue-500" />;
      case 'shipped': return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-warm-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="pt-24 md:pt-32 pb-24 px-4 sm:px-6 md:px-12 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif text-warm-dark mb-3 italic">Your Jar Collection</h1>
          <p className="text-warm-dark/60 font-serif">Track your heritage parcels and past delights.</p>
        </div>
        <Link to="/shop" className="px-6 py-3 bg-[#F4EBE1] border-2 border-warm-dark text-warm-dark font-bold tracking-widest uppercase text-xs shadow-[4px_4px_0px_#3A2A22] hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2">
          <ShoppingBag className="w-4 h-4" /> Visit Pantry
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border-2 border-warm-dark p-12 text-center shadow-[8px_8px_0px_#3A2A22] transform -rotate-1">
          <Package className="w-16 h-16 text-warm-dark/20 mx-auto mb-6" />
          <h2 className="text-2xl font-serif text-warm-dark mb-4">No orders found</h2>
          <p className="text-warm-dark/60 mb-8 font-serif italic">Your pantry seems a bit empty. Time to start your collection!</p>
          <Link to="/shop" className="inline-block px-8 py-3 bg-warm-accent text-white font-bold tracking-widest uppercase text-xs shadow-[4px_4px_0px_#3A2A22] hover:translate-y-1 hover:shadow-none transition-all">
            Browse Shop
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border-2 border-warm-dark shadow-[8px_8px_0px_#3A2A22] overflow-hidden group">
              {/* Order Header */}
              <div className="bg-[#F4EBE1] p-6 border-b-2 border-warm-dark flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white border-2 border-warm-dark flex items-center justify-center text-warm-dark shadow-[2px_2px_0px_#3A2A22]">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-warm-dark/40 mb-1">Order ID</p>
                    <p className="font-serif font-bold text-warm-dark tracking-wide">#{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                </div>
                
                <div className="flex gap-8">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-warm-dark/40 mb-1">Date</p>
                    <p className="font-serif font-bold text-warm-dark">{order.date}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-warm-dark/40 mb-1">Total</p>
                    <p className="font-serif font-bold text-warm-accent">₹{order.total}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-warm-dark/40 mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-warm-dark uppercase tracking-wider text-xs">{order.status}</span>
                      {getStatusIcon(order.status)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <div className="space-y-4">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center py-3 border-b border-dashed border-warm-dark/10 last:border-0">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-2 bg-warm-accent rounded-full"></div>
                        <span className="font-serif font-bold text-warm-dark">{item.name}</span>
                        <span className="text-xs font-bold text-warm-dark/40 uppercase tracking-widest">x{item.quantity}</span>
                      </div>
                      <span className="font-serif font-bold text-warm-dark">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer / Actions */}
              <div className="p-6 bg-warm-bg/50 border-t-2 border-dashed border-warm-dark/10 flex justify-between items-center">
                <p className="text-sm font-serif italic text-warm-dark/60">
                  Delivering to: <span className="font-bold text-warm-dark not-italic">{order.customer?.city}, {order.customer?.pincode}</span>
                </p>
                <button className="text-[10px] uppercase font-bold tracking-widest text-warm-accent hover:text-warm-dark transition-colors flex items-center gap-2">
                   View Receipt
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

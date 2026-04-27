import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { X } from 'lucide-react';

const STATUSES = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered'];

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Format date for display if it exists
        date: doc.data().createdAt?.toDate().toLocaleDateString() || 'Recent'
      }));
      setOrders(ordersData);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const filteredOrders = orders.filter(o => {
    const matchesTab = activeTab === 'All' || o.status.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = o.customer.name.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status: newStatus });
      setOpenDropdown(null);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'Processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Shipped': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-orange-100 text-orange-700 border-orange-200';
    }
  };

  return (
    <div className="space-y-6 max-w-[100vw] overflow-x-hidden md:max-w-none">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full max-w-[95vw] md:max-w-none mx-auto bg-white p-6 border-2 border-warm-dark shadow-[4px_4px_0px_#3A2A22] transform -rotate-1 relative z-10 mt-4 md:mt-0">
         <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-warm-accent border border-warm-dark shadow-sm"></div>
        <div>
          <h1 className="text-3xl font-serif font-bold text-warm-dark italic">Ledger of Parcels</h1>
          <p className="text-warm-dark/70 mt-2 font-serif">Manage and track customer orders.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-[#F4EBE1] border-2 border-warm-dark shadow-[4px_4px_0px_#3A2A22] p-4 flex flex-col lg:flex-row justify-between items-center gap-4 w-full max-w-[95vw] md:max-w-none mx-auto transform rotate-1 relative z-10">
        <div className="flex w-full lg:w-auto gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          {STATUSES.map(status => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`px-4 py-2 font-bold uppercase tracking-widest text-[10px] whitespace-nowrap transition-colors border-2 ${
                activeTab === status 
                  ? 'bg-warm-dark text-white border-warm-dark shadow-[2px_2px_0px_rgba(58,42,34,0.5)]' 
                  : 'bg-white text-warm-dark/70 border-warm-dark hover:bg-warm-dark/5 shadow-[2px_2px_0px_#3A2A22]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex w-full lg:w-auto gap-3">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-dark/40" />
            <input 
              type="text" 
              placeholder="Search order or customer..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-warm-dark bg-white focus:outline-none focus:ring-0 focus:border-warm-accent text-sm font-bold font-serif shadow-[2px_2px_0px_#3A2A22]"
            />
          </div>
          <button className="px-4 py-2 flex items-center gap-2 border-2 border-warm-dark bg-white hover:bg-warm-dark hover:text-white shadow-[2px_2px_0px_#3A2A22] text-[10px] font-bold uppercase tracking-widest text-warm-dark transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      {/* Table (Desktop) / Cards (Mobile) */}
      <div className="bg-white border-2 border-warm-dark shadow-[6px_6px_0px_#3A2A22] overflow-hidden w-full max-w-[95vw] md:max-w-none mx-auto relative z-10 p-1">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F4EBE1] text-warm-dark font-bold font-serif border-b-2 border-solid border-warm-dark tracking-widest uppercase">
              <tr>
                <th className="px-6 py-4 border-r-2 border-dashed border-warm-dark/20 text-xs">Parcel ID</th>
                <th className="px-6 py-4 border-r-2 border-dashed border-warm-dark/20 text-xs">Patron</th>
                <th className="px-6 py-4 border-r-2 border-dashed border-warm-dark/20 text-xs">Date</th>
                <th className="px-6 py-4 border-r-2 border-dashed border-warm-dark/20 text-xs text-right">Value</th>
                <th className="px-6 py-4 border-r-2 border-dashed border-warm-dark/20 text-xs text-center">Status</th>
                <th className="px-6 py-4 text-center text-xs">Modify</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-dashed divide-warm-dark/20 bg-white">
              <AnimatePresence>
                {filteredOrders.map(order => (
                  <motion.tr 
                    key={order.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-warm-bg transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-warm-dark font-serif border-r-2 border-dashed border-warm-dark/20">{order.id.slice(0, 8)}...</td>
                    <td className="px-6 py-4 border-r-2 border-dashed border-warm-dark/20">
                      <div>
                        <div className="font-bold text-warm-dark font-serif text-base">{order.customer?.name}</div>
                        <div className="text-[10px] text-warm-dark/60 uppercase tracking-widest">{order.customer?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-warm-dark/80 font-serif border-r-2 border-dashed border-warm-dark/20 font-bold">{order.date}</td>
                    <td className="px-6 py-4 font-bold text-warm-dark text-lg border-r-2 border-dashed border-warm-dark/20 text-right">₹{order.total}</td>
                    <td className="px-6 py-4 border-r-2 border-dashed border-warm-dark/20 text-center">
                      <span className={`inline-block px-3 py-1 border-2 border-warm-dark shadow-[2px_2px_0px_#3A2A22] text-[10px] font-bold uppercase tracking-wider transform rotate-1 bg-warm-bg text-warm-dark`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 relative">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 border-2 border-warm-dark bg-white hover:bg-warm-dark hover:text-white transition-colors shadow-[2px_2px_0px_#3A2A22] hover:translate-y-px text-warm-dark font-bold uppercase tracking-widest text-[10px] flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>
                        
                        <div className="relative">
                          <button 
                            onClick={() => setOpenDropdown(openDropdown === order.id ? null : order.id)}
                            className="p-1 border-2 border-warm-dark bg-warm-accent hover:bg-white text-white hover:text-warm-accent transition-colors shadow-[2px_2px_0px_#3A2A22] hover:translate-y-px"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {openDropdown === order.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                              <div className="absolute right-0 mt-2 w-48 bg-[#F4EBE1] border-2 border-warm-dark shadow-[4px_4px_0px_#3A2A22] z-20 py-2 transform rotate-1">
                                <div className="px-4 py-2 border-b-2 border-dashed border-warm-dark/20 text-[10px] font-bold text-warm-dark uppercase tracking-widest mb-1">Update Status To:</div>
                                {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
                                  <button
                                    key={status}
                                    onClick={() => updateStatus(order.id, status)}
                                    className="w-full text-left px-4 py-2 text-xs font-bold font-serif text-warm-dark hover:bg-white hover:text-warm-accent transition-colors flex items-center justify-between"
                                  >
                                    {status}
                                    {order.status === status && <div className="w-2 h-2 rounded-full bg-warm-accent"></div>}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y-2 divide-dashed divide-warm-dark/20">
          {filteredOrders.map(order => (
            <div key={order.id} className="p-4 bg-white space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-warm-dark/40 mb-1">Parcel #{order.id.slice(0, 8)}</p>
                  <h3 className="font-serif font-bold text-lg text-warm-dark">{order.customer?.name}</h3>
                  <p className="text-[10px] text-warm-dark/60 uppercase tracking-widest">{order.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-warm-dark text-xl">₹{order.total}</p>
                  <span className="inline-block px-2 py-0.5 border-2 border-warm-dark shadow-[2px_2px_0px_#3A2A22] text-[8px] font-bold uppercase tracking-wider transform rotate-1 bg-warm-bg text-warm-dark mt-1">
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedOrder(order)}
                  className="flex-1 px-4 py-3 border-2 border-warm-dark bg-white text-warm-dark font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-[4px_4px_0px_#3A2A22]"
                >
                  <Eye className="w-4 h-4" /> View Details
                </button>
                <div className="relative">
                  <button 
                    onClick={() => setOpenDropdown(openDropdown === order.id ? null : order.id)}
                    className="p-3 border-2 border-warm-dark bg-warm-accent text-white shadow-[4px_4px_0px_#3A2A22]"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {openDropdown === order.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                      <div className="absolute right-0 bottom-full mb-2 w-48 bg-[#F4EBE1] border-2 border-warm-dark shadow-[4px_4px_0px_#3A2A22] z-20 py-2 transform -rotate-1">
                        <div className="px-4 py-2 border-b-2 border-dashed border-warm-dark/20 text-[10px] font-bold text-warm-dark uppercase tracking-widest mb-1">Update Status:</div>
                        {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
                          <button
                            key={status}
                            onClick={() => updateStatus(order.id, status)}
                            className="w-full text-left px-4 py-2 text-xs font-bold font-serif text-warm-dark hover:bg-white transition-colors"
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="font-serif font-bold text-xl italic text-warm-dark/50">No parcels found matching your query.</p>
          </div>
        )}
      </div>
      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-warm-dark/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl relative z-10 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] border-4 border-warm-dark"
            >
              <div className="p-6 border-b-2 border-warm-dark bg-[#F4EBE1] flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-warm-dark">Order #{selectedOrder.id.slice(0, 8)}</h2>
                  <p className="text-xs font-bold uppercase tracking-widest text-warm-dark/40">{selectedOrder.date}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-warm-dark/10 rounded-full transition-colors">
                  <X className="w-6 h-6 text-warm-dark" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-warm-accent border-b-2 border-dashed border-warm-accent/20 pb-2">Patron Details</h3>
                    <div className="bg-warm-bg/30 p-4 border-2 border-warm-dark shadow-[4px_4px_0px_#3A2A22]">
                      <p className="font-serif font-bold text-xl text-warm-dark">{selectedOrder.customer?.name}</p>
                      <p className="text-sm font-bold text-warm-dark/60">{selectedOrder.customer?.email}</p>
                      <p className="text-sm font-bold text-warm-dark/60 mt-1">{selectedOrder.customer?.phone}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-warm-accent border-b-2 border-dashed border-warm-accent/20 pb-2">Delivery Address</h3>
                    <div className="bg-warm-bg/30 p-4 border-2 border-warm-dark shadow-[4px_4px_0px_#3A2A22]">
                      <p className="text-sm font-serif italic text-warm-dark/80 whitespace-pre-wrap">{selectedOrder.customer?.address}</p>
                      <p className="text-sm font-bold text-warm-dark uppercase tracking-widest mt-2">{selectedOrder.customer?.city}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-warm-accent border-b-2 border-dashed border-warm-accent/20 pb-2">Order Items</h3>
                  <div className="border-2 border-warm-dark overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-warm-dark text-white text-[10px] uppercase tracking-[0.2em]">
                        <tr>
                          <th className="px-4 py-3">Item</th>
                          <th className="px-4 py-3 text-center">Qty</th>
                          <th className="px-4 py-3 text-right">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-dashed divide-warm-dark/10">
                        {selectedOrder.items?.map((item: any, idx: number) => (
                          <tr key={idx} className="bg-white">
                            <td className="px-4 py-4 font-serif font-bold text-warm-dark">{item.name}</td>
                            <td className="px-4 py-4 text-center font-bold">{item.quantity}</td>
                            <td className="px-4 py-4 text-right font-bold">₹{item.price * item.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-[#F4EBE1] border-t-2 border-warm-dark">
                        <tr>
                          <td colSpan={2} className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-warm-dark">Grand Total</td>
                          <td className="px-4 py-4 text-right font-bold text-xl text-warm-accent">₹{selectedOrder.total}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t-2 border-warm-dark bg-warm-bg flex justify-end">
                 <button 
                  onClick={() => setSelectedOrder(null)}
                  className="px-8 py-3 bg-warm-dark text-white font-bold uppercase tracking-widest text-xs shadow-[4px_4px_0px_#B83A20] hover:translate-y-1 hover:shadow-none transition-all"
                >
                  Close Register
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';

const STATUSES = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered'];

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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

      {/* Table */}
      <div className="bg-white border-2 border-warm-dark shadow-[6px_6px_0px_#3A2A22] overflow-hidden w-full max-w-[95vw] md:max-w-none mx-auto relative z-10 p-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F4EBE1] text-warm-dark font-bold font-serif border-b-2 border-solid border-warm-dark tracking-widest uppercase">
              <tr>
                <th className="px-6 py-4 border-r-2 border-dashed border-warm-dark/20 text-xs">Parcel ID</th>
                <th className="px-6 py-4 border-r-2 border-dashed border-warm-dark/20 text-xs">Patron</th>
                <th className="px-6 py-4 border-r-2 border-dashed border-warm-dark/20 text-xs">Date</th>
                <th className="px-6 py-4 border-r-2 border-dashed border-warm-dark/20 text-xs">Jars</th>
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
                    <td className="px-6 py-4 text-warm-dark/80 font-serif border-r-2 border-dashed border-warm-dark/20">{order.items?.length} jars</td>
                    <td className="px-6 py-4 font-bold text-warm-dark text-lg border-r-2 border-dashed border-warm-dark/20 text-right">₹{order.total}</td>
                    <td className="px-6 py-4 border-r-2 border-dashed border-warm-dark/20 text-center">
                      <span className={`inline-block px-3 py-1 border-2 border-warm-dark shadow-[2px_2px_0px_#3A2A22] text-[10px] font-bold uppercase tracking-wider transform rotate-1 bg-warm-bg text-warm-dark`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 relative">
                      <div className="flex items-center justify-center gap-2">
                        <button className="px-3 py-1.5 border-2 border-warm-dark bg-white hover:bg-warm-dark hover:text-white transition-colors shadow-[2px_2px_0px_#3A2A22] hover:translate-y-px text-warm-dark font-bold uppercase tracking-widest text-[10px] flex items-center gap-1">
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
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <p className="font-serif font-bold text-xl italic text-warm-dark/50">No parcels found matching your query.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

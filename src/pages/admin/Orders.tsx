import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, MoreVertical, X, Truck, AlertTriangle, Check, Loader2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, getDoc } from 'firebase/firestore';

const STATUSES = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered'];

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const [isShipping, setIsShipping] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [shippingSuccess, setShippingSuccess] = useState<string | null>(null);

  const createDelhiveryShipment = async (order: any) => {
    setIsShipping(true);
    setShippingError(null);
    setShippingSuccess(null);

    const token = import.meta.env.VITE_DELHIVERY_API_TOKEN;
    if (!token || token === 'YOUR_DELHIVERY_API_TOKEN') {
      setShippingError("Delhivery API token is not configured in .env file.");
      setIsShipping(false);
      return;
    }

    try {
      // Fetch dynamic warehouse name from Firestore settings
      let warehouseName = "Kaaram Kathalu";
      try {
        const settingsSnap = await getDoc(doc(db, 'settings', 'general'));
        if (settingsSnap.exists()) {
          const settingsData = settingsSnap.data();
          if (settingsData.delhiveryWarehouseName) {
            warehouseName = settingsData.delhiveryWarehouseName;
          }
        }
      } catch (err) {
        console.warn("Failed to fetch settings from Firestore, using default warehouse name:", err);
      }

      const pickupLocation = {
        name: warehouseName,
        add: "002 Ground Floor Spoorthi Vaibhava Apartment, 6th A Cross Trinity Enclave, Banjara Layout, Horamavu",
        city: "Bangalore",
        pin: 560043,
        phone: "9770889608"
      };

      const consigneePhone = (() => {
        const p = order.customer?.phone;
        if (!p) return "9770889608";
        let cleaned = p.replace(/\D/g, '');
        if (cleaned.length === 12 && cleaned.startsWith('91')) {
          cleaned = cleaned.substring(2);
        }
        if (cleaned.length === 11 && cleaned.startsWith('0')) {
          cleaned = cleaned.substring(1);
        }
        if (cleaned.length !== 10) {
          return "9770889608";
        }
        return cleaned;
      })();

      const shipments = [
        {
          waybill: "",
          order: order.id,
          product: order.items?.map((item: any) => `${item.name} (x${item.quantity})`).join(', ') || "Andhra Pickles & Podis",
          
          // Flat fields for standard/legacy CMU API
          name: order.customer?.name || "Customer",
          add: order.customer?.address || "",
          city: order.customer?.city || "",
          state: "Karnataka",
          pin: Number(order.customer?.pincode) || 560043,
          phone: consigneePhone,
          country: "India",

          // Nested fields for newer Unified/Direct APIs
          consignee: {
            name: order.customer?.name || "Customer",
            address: order.customer?.address || "",
            city: order.customer?.city || "",
            state: "Karnataka",
            pincode: Number(order.customer?.pincode) || 560043,
            phone: consigneePhone
          },
          payment_mode: "Pre-paid",
          package_type: "Prepaid",
          weight: 0.5,
          cod_amount: 0,
          order_date: order.createdAt?.toDate ? order.createdAt.toDate().toISOString() : new Date().toISOString(),
          total_amount: Number(order.total) || 0,
          quantity: order.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 1
        }
      ];

      const payload = {
        shipments,
        pickup_location: pickupLocation
      };

      const host = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'https://kaaramkathalu.in'
        : '';

      const response = await fetch(`${host}/api/shipping`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'create_shipment',
          data: payload
        })
      });

      if (!response.ok) {
        throw new Error(`Delhivery API returned status ${response.status}`);
      }

      const resData = await response.json();
      console.log("Delhivery API Response:", resData);

      if (resData.success && resData.packages && resData.packages.length > 0) {
        const waybill = resData.packages[0].waybill;
        
        // Update order in Firestore
        await updateDoc(doc(db, 'orders', order.id), {
          status: 'Shipped',
          waybill: waybill,
          carrier: 'Delhivery',
          shippedAt: new Date()
        });

        // Update modal state
        setSelectedOrder((prev: any) => prev ? { ...prev, status: 'Shipped', waybill: waybill, carrier: 'Delhivery' } : null);
        setShippingSuccess(`Shipment created successfully! Waybill: ${waybill}`);
      } else if (resData.pickups && resData.pickups.length > 0 && resData.pickups[0].waybills && resData.pickups[0].waybills.length > 0) {
        const waybillObj = resData.pickups[0].waybills[0];
        if (waybillObj.status === 'Success' || waybillObj.waybill) {
          const waybill = waybillObj.waybill;

          // Update order in Firestore
          await updateDoc(doc(db, 'orders', order.id), {
            status: 'Shipped',
            waybill: waybill,
            carrier: 'Delhivery',
            shippedAt: new Date()
          });

          // Update modal state
          setSelectedOrder((prev: any) => prev ? { ...prev, status: 'Shipped', waybill: waybill, carrier: 'Delhivery' } : null);
          setShippingSuccess(`Shipment created successfully! Waybill: ${waybill}`);
        } else {
          throw new Error(waybillObj.remarks?.join(', ') || "Failed to generate waybill.");
        }
      } else {
        let errorMsg = "";
        if (resData.rm_remarks) {
          errorMsg = resData.rm_remarks;
        } else if (resData.packages && resData.packages.length > 0 && resData.packages[0].remarks) {
          errorMsg = Array.isArray(resData.packages[0].remarks) 
            ? resData.packages[0].remarks.join(', ') 
            : String(resData.packages[0].remarks);
        } else if (resData.pickups && resData.pickups.length > 0 && resData.pickups[0].waybills && resData.pickups[0].waybills.length > 0 && resData.pickups[0].waybills[0].remarks) {
          const waybillObj = resData.pickups[0].waybills[0];
          errorMsg = Array.isArray(waybillObj.remarks) ? waybillObj.remarks.join(', ') : String(waybillObj.remarks);
        } else if (resData.error && typeof resData.error !== 'boolean') {
          errorMsg = String(resData.error);
        } else {
          errorMsg = JSON.stringify(resData);
        }
        throw new Error(errorMsg || "No waybill was returned by Delhivery.");
      }
    } catch (err: any) {
      console.error("Delhivery CMU Error:", err);
      setShippingError(err.message || "An unexpected error occurred while booking the shipment.");
    } finally {
      setIsShipping(false);
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
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

  return (
    <div className="space-y-6 max-w-[100vw] overflow-x-hidden md:max-w-none">
      <div className="bg-warm-light p-6 rounded-2xl border border-warm-dark/5 shadow-sm mb-6">
        <h2 className="text-2xl font-serif font-bold text-warm-dark">Ledger of Parcels</h2>
        <p className="text-sm text-warm-dark/60 mt-1 font-serif">Manage and track customer orders.</p>
      </div>

      {/* Toolbar */}
      <div className="bg-warm-light border border-warm-dark/5 rounded-2xl p-4 flex flex-col lg:flex-row justify-between items-center gap-4 w-full max-w-[95vw] md:max-w-none mx-auto relative z-10">
        <div className="flex w-full lg:w-auto gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          {STATUSES.map(status => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`px-4 py-2 rounded-full font-bold uppercase tracking-widest text-[10px] whitespace-nowrap transition-all duration-200 border cursor-pointer ${
                activeTab === status 
                  ? 'bg-warm-dark text-white border-warm-dark shadow-sm' 
                  : 'bg-white text-warm-dark/70 border-warm-dark/10 hover:bg-warm-dark/5'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex w-full lg:w-auto gap-3">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-dark/40" />
            <input 
              type="text" 
              placeholder="Search order or customer..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-warm-dark/10 bg-white focus:outline-none focus:border-warm-accent text-sm font-serif"
            />
          </div>
          <button className="px-4 py-2 flex items-center gap-2 rounded-xl border border-warm-dark/10 bg-white hover:bg-warm-dark/5 text-[10px] font-bold uppercase tracking-widest text-warm-dark transition-colors cursor-pointer">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      {/* Table (Desktop) / Cards (Mobile) */}
      <div className="bg-white border border-warm-dark/5 rounded-2xl overflow-hidden w-full max-w-[95vw] md:max-w-none mx-auto relative z-10 p-1 shadow-sm">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-warm-light text-warm-dark font-bold font-serif border-b border-warm-dark/10 tracking-widest uppercase">
              <tr>
                <th className="px-6 py-4 text-xs">Parcel ID</th>
                <th className="px-6 py-4 text-xs">Patron</th>
                <th className="px-6 py-4 text-xs">Date</th>
                <th className="px-6 py-4 text-xs text-right">Value</th>
                <th className="px-6 py-4 text-xs text-center">Status</th>
                <th className="px-6 py-4 text-center text-xs">Modify</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-dark/5 bg-white">
              <AnimatePresence>
                {filteredOrders.map(order => (
                  <motion.tr 
                    key={order.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-warm-bg/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-warm-dark font-serif">{order.id.slice(0, 8)}...</td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-warm-dark font-serif text-base">{order.customer?.name}</div>
                        <div className="text-[10px] text-warm-dark/60 uppercase tracking-widest">{order.customer?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-warm-dark/80 font-serif font-bold">{order.date}</td>
                    <td className="px-6 py-4 font-bold text-warm-dark text-lg text-right">₹{order.total}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-warm-accent/10 text-warm-accent`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 relative">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 rounded-xl border border-warm-dark/10 bg-white hover:bg-warm-dark hover:text-white transition-colors text-warm-dark font-bold uppercase tracking-widest text-[10px] flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        
                        <div className="relative">
                          <button 
                            onClick={() => setOpenDropdown(openDropdown === order.id ? null : order.id)}
                            className="p-1.5 rounded-xl border border-warm-dark/10 bg-warm-light hover:bg-warm-accent hover:text-white text-warm-dark transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {openDropdown === order.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                              <div className="absolute right-0 mt-2 w-48 bg-white border border-warm-dark/10 rounded-2xl shadow-lg z-20 py-2">
                                <div className="px-4 py-2 border-b border-warm-dark/5 text-[10px] font-bold text-warm-dark/40 uppercase tracking-widest mb-1">Update Status To:</div>
                                {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
                                  <button
                                    key={status}
                                    onClick={() => updateStatus(order.id, status)}
                                    className="w-full text-left px-4 py-2.5 text-xs font-serif text-warm-dark hover:bg-warm-light hover:text-warm-accent transition-colors flex items-center justify-between cursor-pointer"
                                  >
                                    {status}
                                    {order.status === status && <div className="w-1.5 h-1.5 rounded-full bg-warm-accent"></div>}
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
        <div className="md:hidden divide-y divide-warm-dark/5">
          {filteredOrders.map(order => (
            <div key={order.id} className="p-4 bg-white space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-warm-dark/45 mb-1">Parcel #{order.id.slice(0, 8)}</p>
                  <h3 className="font-serif font-bold text-lg text-warm-dark">{order.customer?.name}</h3>
                  <p className="text-[10px] text-warm-dark/60 uppercase tracking-widest">{order.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-warm-dark text-xl">₹{order.total}</p>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-warm-accent/10 text-warm-accent mt-1">
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedOrder(order)}
                  className="flex-1 px-4 py-3 rounded-xl border border-warm-dark/10 bg-white text-warm-dark font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-colors hover:bg-warm-light cursor-pointer"
                >
                  <Eye className="w-4 h-4" /> View Details
                </button>
                <div className="relative">
                  <button 
                    onClick={() => setOpenDropdown(openDropdown === order.id ? null : order.id)}
                    className="p-3 rounded-xl border border-warm-dark/10 bg-warm-light text-warm-dark transition-colors cursor-pointer"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {openDropdown === order.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                      <div className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-warm-dark/10 rounded-2xl shadow-lg z-20 py-2">
                        <div className="px-4 py-2 border-b border-warm-dark/5 text-[10px] font-bold text-warm-dark/40 uppercase tracking-widest mb-1">Update Status:</div>
                        {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
                          <button
                            key={status}
                            onClick={() => updateStatus(order.id, status)}
                            className="w-full text-left px-4 py-2 text-xs font-bold font-serif text-warm-dark hover:bg-warm-light transition-colors"
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
              className="absolute inset-0 bg-warm-dark/65 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl relative z-10 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] border border-warm-dark/5"
            >
              <div className="p-6 border-b border-warm-dark/10 bg-warm-light flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-warm-dark">Order #{selectedOrder.id.slice(0, 8)}</h2>
                  <p className="text-xs font-bold uppercase tracking-widest text-warm-dark/40">{selectedOrder.date}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-warm-dark/10 rounded-full transition-colors cursor-pointer">
                  <X className="w-6 h-6 text-warm-dark" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-warm-accent border-b border-dashed border-warm-accent/20 pb-2">Patron Details</h3>
                    <div className="bg-warm-light p-5 rounded-2xl border border-warm-dark/5">
                      <p className="font-serif font-bold text-xl text-warm-dark">{selectedOrder.customer?.name}</p>
                      <p className="text-sm text-warm-dark/60 mt-1">{selectedOrder.customer?.email}</p>
                      <p className="text-sm text-warm-dark/60 mt-0.5">{selectedOrder.customer?.phone}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-warm-accent border-b border-dashed border-warm-accent/20 pb-2">Delivery Address</h3>
                    <div className="bg-warm-light p-5 rounded-2xl border border-warm-dark/5">
                      <p className="text-sm font-serif italic text-warm-dark/80 whitespace-pre-wrap">{selectedOrder.customer?.address}</p>
                      <p className="text-xs font-bold text-warm-dark uppercase tracking-widest mt-3">{selectedOrder.customer?.city}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-warm-accent border-b border-dashed border-warm-accent/20 pb-2">Order Items</h3>
                  <div className="border border-warm-dark/10 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                      <thead className="bg-warm-light text-warm-dark font-semibold text-[10px] uppercase tracking-[0.2em] border-b border-warm-dark/10">
                        <tr>
                          <th className="px-4 py-3">Item</th>
                          <th className="px-4 py-3 text-center">Qty</th>
                          <th className="px-4 py-3 text-right">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-warm-dark/10">
                        {selectedOrder.items?.map((item: any, idx: number) => (
                          <tr key={idx} className="bg-white">
                            <td className="px-4 py-4 font-serif font-bold text-warm-dark">{item.name}</td>
                            <td className="px-4 py-4 text-center font-bold">{item.quantity}</td>
                            <td className="px-4 py-4 text-right font-bold">₹{item.price * item.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-warm-light/50 border-t border-warm-dark/10">
                        <tr>
                          <td colSpan={2} className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-warm-dark">Grand Total</td>
                          <td className="px-4 py-4 text-right font-bold text-xl text-warm-accent">₹{selectedOrder.total}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Delhivery Integration Section */}
                <div className="mt-8 pt-6 border-t border-warm-dark/10 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-warm-accent border-b border-dashed border-warm-accent/20 pb-2">Logistics & Shipping</h3>
                  
                  {selectedOrder.waybill ? (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <p className="text-xs font-bold text-green-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-green-600" /> Booked with Delhivery
                        </p>
                        <p className="text-sm font-serif text-green-900/80">
                          Tracking ID (Waybill): <span className="font-sans font-bold">{selectedOrder.waybill}</span>
                        </p>
                      </div>
                      <a 
                        href={`https://www.delhivery.com/track/package/${selectedOrder.waybill}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl transition-colors cursor-pointer shadow-sm text-center"
                      >
                        Track Package
                      </a>
                    </div>
                  ) : (
                    <div className="bg-warm-light border border-warm-dark/5 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="max-w-md">
                        <p className="text-sm font-bold text-warm-dark flex items-center gap-2">
                          <Truck className="w-4 h-4 text-warm-accent" /> Delhivery Shipping Integration
                        </p>
                        <p className="text-xs font-serif text-warm-dark/60 mt-1 leading-relaxed">
                          Book this parcel automatically with Delhivery. This will generate a waybill number and mark the order as Shipped.
                        </p>
                      </div>
                      
                      <div className="w-full sm:w-auto flex flex-col items-stretch sm:items-end gap-2">
                        <button
                          onClick={() => createDelhiveryShipment(selectedOrder)}
                          disabled={isShipping}
                          className="px-6 py-3 bg-warm-accent hover:bg-warm-dark disabled:bg-warm-dark/40 text-white font-bold uppercase tracking-widest text-[10px] rounded-xl transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
                        >
                          {isShipping ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Booking...
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" /> Book Shipment
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {shippingError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl flex items-center gap-2 font-serif">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>{shippingError}</span>
                    </div>
                  )}

                  {shippingSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-700 text-xs px-4 py-3 rounded-xl flex items-center gap-2 font-serif">
                      <Check className="w-4 h-4 flex-shrink-0" />
                      <span>{shippingSuccess}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-warm-dark/10 bg-warm-light flex justify-end">
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="px-8 py-3 bg-warm-dark hover:bg-warm-accent text-white font-bold uppercase tracking-widest text-xs rounded-full transition-colors cursor-pointer shadow-sm"
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

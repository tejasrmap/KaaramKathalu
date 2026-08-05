import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Package, MapPin, Calendar, Clock, Truck, CheckCircle2, AlertCircle, ArrowRight, CornerDownRight } from 'lucide-react';
import SEO from '../components/SEO';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

interface TrackingScan {
  time: string;
  location: string;
  status: string;
  instructions: string;
}

interface TrackingData {
  waybill: string;
  status: string;
  origin: string;
  destination: string;
  expectedDate?: string;
  scans: TrackingScan[];
}

export default function TrackOrder() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingInfo, setTrackingInfo] = useState<TrackingData | null>(null);

  const mockTrackingData = (awb: string): TrackingData => {
    return {
      waybill: awb,
      status: "In Transit",
      origin: "Bangalore Warehouse (Horamavu)",
      destination: "Gudivada, Andhra Pradesh (521301)",
      expectedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      scans: [
        {
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          location: "Bangalore Gateway (Delhivery Hub)",
          status: "In Transit",
          instructions: "Parcel has left the Bangalore consolidation center and is heading to the transit hub."
        },
        {
          time: new Date(Date.now() - 4 * 60 * 60 * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          location: "Bangalore Main Warehouse",
          status: "Handed over to Delhivery",
          instructions: "Shipment picked up by courier associate."
        },
        {
          time: new Date(Date.now() - 6 * 60 * 60 * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          location: "Kaaram Kathalu Dispatch Desk",
          status: "Manifest Created",
          instructions: "Order details registered with courier. Awaiting pickup."
        }
      ]
    };
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const searchVal = query.trim();
    if (!searchVal) return;

    setIsLoading(true);
    setError(null);
    setTrackingInfo(null);



    try {
      const host = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'https://kaaramkathalu.in'
        : '';
      
      const response = await fetch(`${host}/api/shipping?type=track&waybill=${searchVal}`);
      if (!response.ok) {
        throw new Error(`Delhivery returned status ${response.status}`);
      }

      const resData = await response.json();
      
      if (resData && resData.ShipmentData && resData.ShipmentData.length > 0) {
        const shipment = resData.ShipmentData[0].Shipment;
        
        const scans = (shipment.Scans || []).map((item: any) => {
          const scan = item.ScanDetail || {};
          return {
            time: scan.ScanDateTime ? new Date(scan.ScanDateTime).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'Date/Time unavailable',
            location: scan.ScannedLocation || 'Transit Point',
            status: scan.Scan || 'In Transit',
            instructions: scan.Instructions || 'No additional instructions.'
          };
        });

        setTrackingInfo({
          waybill: shipment.AWB || searchVal,
          status: shipment.Status?.Status || 'Registered',
          origin: shipment.PickUpLocation || 'Warehouse',
          destination: shipment.Destination || 'Customer Address',
          expectedDate: shipment.ExpectedDeliveryDate ? new Date(shipment.ExpectedDeliveryDate).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }) : undefined,
          scans: scans.length > 0 ? scans : [
            {
              time: shipment.PickUpLocation ? 'Ready for pickup' : 'Registered',
              location: shipment.PickUpLocation || 'Origin Warehouse',
              status: shipment.Status?.Status || 'Manifest Created',
              instructions: 'Shipment created successfully. Waiting to be handed over to Delhivery.'
            }
          ]
        });

        const liveStatus = shipment.Status?.Status || 'Registered';
        if (liveStatus.toLowerCase() === 'cancelled' || liveStatus.toLowerCase() === 'canceled') {
          try {
            const ordersQ = query(collection(db, 'orders'), where('waybill', '==', shipment.AWB || searchVal));
            const ordersSnap = await getDocs(ordersQ);
            if (!ordersSnap.empty) {
              const orderDoc = ordersSnap.docs[0];
              if ((orderDoc.data() as any).status !== 'Cancelled') {
                await updateDoc(doc(db, 'orders', orderDoc.id), {
                  status: 'Cancelled'
                });
              }
            }
          } catch (err) {
            console.warn("Failed to auto-cancel order status:", err);
          }
        }
      } else {
        setError("No tracking information found for this Waybill number. Please check the number or try again later.");
      }
    } catch (err: any) {
      console.error("Tracking API error:", err);
      setError("Unable to connect to Delhivery's live servers. Please check your network and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-8 md:pt-12 pb-24 px-4 sm:px-6 md:px-12 max-w-[100vw] overflow-x-hidden md:max-w-4xl mx-auto min-h-screen bg-warm-bg/30">
      <SEO 
        title="Track Order - Kaaram Kathalu" 
        description="Track your heritage snacks and pickle delivery live with Delhivery." 
      />

      {/* Header Block */}
      <div className="text-center mb-12">
        <span className="font-heading text-warm-accent text-xs font-bold uppercase tracking-[0.2em] block mb-2">Live Delivery</span>
        <h1 className="text-4xl md:text-5xl font-heading font-black text-warm-dark uppercase tracking-tight">
          Track Your <span className="text-warm-accent italic font-light font-serif">Parcels</span>
        </h1>
        <div className="w-16 h-1 bg-warm-accent/80 mx-auto mt-4 rounded-full"></div>
      </div>

      {/* Search Input Card */}
      <div className="bg-white border border-warm-accent/10 rounded-[32px] p-6 sm:p-8 md:p-10 shadow-sm mb-10 max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="space-y-4">
          <label className="block text-[10px] uppercase font-bold tracking-widest text-warm-dark/50 mb-1">
            Waybill / Tracking Number (AWB)
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-dark/30" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Enter 14-digit AWB (e.g. 57316010000011)"
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-warm-dark/10 bg-warm-light/20 focus:bg-white outline-none font-serif focus:border-warm-accent transition-all text-base shadow-sm focus:shadow-md"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-8 py-4 bg-warm-accent hover:bg-warm-dark disabled:bg-warm-dark/30 text-white rounded-2xl font-heading font-black tracking-widest uppercase text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:cursor-not-allowed"
            >
              {isLoading ? 'Searching...' : 'Track live'}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </div>

      {/* Info Panel / Results */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <div className="w-12 h-12 border-4 border-warm-accent/20 border-t-warm-accent rounded-full animate-spin"></div>
            <p className="font-serif italic text-warm-dark/50">Calling Delhivery dispatch servers...</p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }}
            className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-[24px] flex items-start gap-4 max-w-2xl mx-auto shadow-sm"
          >
            <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-serif font-bold text-base mb-1">Shipment Not Found</h3>
              <p className="text-sm opacity-90 leading-relaxed font-serif">{error}</p>
            </div>
          </motion.div>
        )}

        {trackingInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-8 max-w-2xl mx-auto"
          >
            {/* Status Summary Card */}
            <div className="bg-white border border-warm-accent/10 rounded-[32px] p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-heading font-black tracking-widest text-warm-dark/40 uppercase">Waybill Number</p>
                <h2 className="text-xl font-bold text-warm-dark font-mono">{trackingInfo.waybill}</h2>
                <div className="flex items-center gap-1.5 mt-2 bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-full text-[10px] font-heading font-black uppercase tracking-wider w-fit">
                  <Truck className="w-3.5 h-3.5" />
                  {trackingInfo.status}
                </div>
              </div>
              
              {trackingInfo.expectedDate && (
                <div className="bg-warm-light/60 p-4 rounded-2xl border border-warm-dark/5 text-left sm:text-right w-full sm:w-auto">
                  <p className="text-[10px] font-heading font-black tracking-widest text-warm-dark/45 uppercase flex items-center sm:justify-end gap-1 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-warm-accent" /> Est. Delivery
                  </p>
                  <p className="font-bold text-warm-dark font-serif text-lg">{trackingInfo.expectedDate}</p>
                </div>
              )}
            </div>

            {/* Path summary */}
            <div className="bg-white border border-warm-accent/10 rounded-[32px] p-6 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              <div>
                <p className="text-[10px] font-heading font-black tracking-widest text-warm-dark/45 uppercase mb-1">Origin Point</p>
                <p className="font-serif font-semibold text-warm-dark text-sm">{trackingInfo.origin}</p>
              </div>
              <div className="border-t md:border-t-0 md:border-l border-dashed border-warm-accent/10 pt-4 md:pt-0 md:pl-6">
                <p className="text-[10px] font-heading font-black tracking-widest text-warm-dark/45 uppercase mb-1">Destination Point</p>
                <p className="font-serif font-semibold text-warm-dark text-sm">{trackingInfo.destination}</p>
              </div>
            </div>

            {/* Scan History Timeline */}
            <div className="bg-white border border-warm-accent/10 rounded-[32px] p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg font-heading font-black uppercase tracking-wider text-warm-dark mb-8 flex items-center gap-2 pb-3 border-b border-warm-dark/5">
                <Package className="w-5 h-5 text-warm-accent" /> Journey Updates
              </h3>

              <div className="relative border-l border-dashed border-warm-accent/30 ml-3 pl-8 space-y-8 py-2">
                {trackingInfo.scans.map((scan, idx) => (
                  <div key={idx} className="relative text-left">
                    {/* Circle Bullet icon */}
                    <div className={`absolute -left-[41px] top-1.5 w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center shadow-sm ${
                      idx === 0 
                        ? 'border-warm-accent text-warm-accent scale-110' 
                        : 'border-warm-dark/20 text-warm-dark/40'
                    }`}>
                      {idx === 0 ? (
                        <CheckCircle2 className="w-3.5 h-3.5 fill-warm-accent/10" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-warm-dark/20" />
                      )}
                    </div>

                    {/* Scan Item Details */}
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className={`text-xs font-bold font-heading tracking-widest uppercase ${idx === 0 ? 'text-warm-accent' : 'text-warm-dark/50'}`}>
                          {scan.status}
                        </span>
                        <span className="hidden sm:inline text-warm-dark/20">|</span>
                        <div className="flex items-center gap-1.5 text-xs text-warm-dark/40 font-serif font-semibold">
                          <Clock className="w-3 h-3" /> {scan.time}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm font-bold text-warm-dark mt-1 font-serif">
                        <MapPin className="w-3.5 h-3.5 text-warm-dark/45" /> {scan.location}
                      </div>
                      
                      <p className="text-xs font-serif text-warm-dark/60 mt-1.5 leading-relaxed bg-warm-light/20 p-2.5 rounded-lg border border-warm-dark/5 flex items-start gap-1.5">
                        <CornerDownRight className="w-3.5 h-3.5 text-warm-dark/30 flex-shrink-0 mt-0.5" />
                        {scan.instructions}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

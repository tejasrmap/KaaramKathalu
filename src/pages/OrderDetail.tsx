import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, Package, MapPin, Calendar, Clock, Truck, 
  CheckCircle, ShieldCheck, Loader2, FileText, Printer, AlertCircle, CornerDownRight 
} from 'lucide-react';
import SEO from '../components/SEO';
import { motion } from 'motion/react';

interface TrackingScan {
  time: string;
  location: string;
  status: string;
  instructions: string;
}

interface TrackingData {
  status: string;
  scans: TrackingScan[];
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any | null>(null);
  const [orderLoading, setOrderLoading] = useState(true);
  const [trackingInfo, setTrackingInfo] = useState<TrackingData | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrderDetails = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'orders', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Verify ownership or admin status if needed
          if (data.userId === user.uid || data.customer?.email === user.email) {
            setOrder({
              id: docSnap.id,
              ...data,
              date: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'Recent'
            });
          } else {
            console.warn("Unauthorized access to order:", id);
            navigate('/my-orders');
          }
        } else {
          console.warn("Order not found:", id);
          navigate('/my-orders');
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
      } finally {
        setOrderLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id, user, authLoading, navigate]);

  // Fetch live tracking from Delhivery if waybill is present
  useEffect(() => {
    if (!order || !order.waybill) return;

    const fetchLiveTracking = async () => {
      setTrackingLoading(true);
      setTrackingError(null);

      try {
        const host = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
          ? 'https://kaaramkathalu.in'
          : '';
        
        const response = await fetch(`${host}/api/shipping?type=track&waybill=${order.waybill}`);
        if (!response.ok) {
          throw new Error(`Delhivery status ${response.status}`);
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
            status: shipment.Status?.Status || 'Registered',
            scans: scans.length > 0 ? scans : [
              {
                time: 'Registered',
                location: shipment.PickUpLocation || 'Origin Warehouse',
                status: shipment.Status?.Status || 'Manifest Created',
                instructions: 'Shipment created successfully. Waiting to be picked up by Delhivery.'
              }
            ]
          });
        } else {
          setTrackingError("No tracking log updates found on Delhivery.");
        }
      } catch (err: any) {
        console.error("Delhivery tracking error:", err);
        setTrackingError("Unable to fetch live tracking updates. Please check back later.");
      } finally {
        setTrackingLoading(false);
      }
    };

    fetchLiveTracking();
  }, [order]);

  const getStatusDetails = (status?: string) => {
    const s = (status || 'pending').toLowerCase();
    switch(s) {
      case 'cancelled':
      case 'canceled':
        return {
          bg: 'bg-red-50 text-red-700 border-red-200/50',
          icon: <AlertCircle className="w-4 h-4" />,
          label: 'Cancelled'
        };
      case 'delivered': 
        return {
          bg: 'bg-green-50 text-green-700 border-green-200/50',
          icon: <CheckCircle className="w-4 h-4" />,
          label: 'Delivered'
        };
      case 'shipped': 
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/50',
          icon: <Truck className="w-4 h-4" />,
          label: 'In Transit'
        };
      case 'processing': 
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200/50',
          icon: <Clock className="w-4 h-4" />,
          label: 'Processing'
        };
      default: 
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200/50',
          icon: <Clock className="w-4 h-4" />,
          label: status || 'Pending'
        };
    }
  };

  if (authLoading || orderLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-warm-bg/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-warm-accent animate-spin" />
          <p className="text-sm font-serif italic text-warm-dark/50">Fetching your order invoice...</p>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const statusInfo = getStatusDetails(order.status);

  return (
    <div className="pt-8 md:pt-12 pb-24 px-4 sm:px-6 md:px-12 max-w-4xl mx-auto min-h-screen bg-warm-bg/30 text-left">
      <SEO title={`Order Summary #${order.id.slice(0, 8).toUpperCase()}`} />

      {/* Navigation Header */}
      <div className="flex justify-between items-center mb-8 mt-6">
        <Link 
          to="/my-orders" 
          className="inline-flex items-center gap-2 text-warm-dark font-bold uppercase tracking-widest text-xs hover:text-warm-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Parcels
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 bg-white border border-warm-dark/10 hover:bg-warm-accent hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider text-warm-dark transition-all cursor-pointer shadow-sm"
        >
          <Printer className="w-3.5 h-3.5" /> Print Receipt
        </button>
      </div>

      <div className="space-y-8">
        {/* Main Details Panel */}
        <div className="bg-white border border-warm-accent/10 rounded-[32px] overflow-hidden shadow-sm">
          {/* Card Header */}
          <div className="bg-warm-light/40 px-6 py-6 border-b border-warm-accent/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="font-heading text-warm-accent text-[10px] font-bold uppercase tracking-widest block mb-1">Receipt Summary</span>
              <h1 className="text-xl md:text-2xl font-bold text-warm-dark font-serif">Order #{order.id.toUpperCase()}</h1>
              <p className="text-xs text-warm-dark/45 font-sans mt-0.5">Placed on {order.date}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full md:w-auto">
              <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-heading font-black uppercase tracking-wider border ${statusInfo.bg}`}>
                {statusInfo.icon}
                {statusInfo.label}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Split Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-dashed border-warm-accent/15 pb-8">
              {/* Delivery Details */}
              <div className="space-y-3 font-serif">
                <h3 className="text-xs font-heading font-black tracking-widest text-warm-accent uppercase flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-warm-accent/70" /> Delivery Address
                </h3>
                <div className="text-sm text-warm-dark/80 space-y-1">
                  <p className="font-bold text-warm-dark">{order.customer?.name}</p>
                  <p className="leading-relaxed">{order.customer?.address}</p>
                  <p>{order.customer?.city}, {order.customer?.pincode}</p>
                  <p className="pt-2 text-xs font-sans text-warm-dark/65">
                    <span className="font-heading font-bold text-[9px] uppercase tracking-wider text-warm-accent bg-warm-accent/5 px-1.5 py-0.5 rounded mr-1.5">Contact</span>
                    {order.customer?.phone}
                  </p>
                </div>
              </div>

              {/* Order Info Details */}
              <div className="space-y-3 font-serif">
                <h3 className="text-xs font-heading font-black tracking-widest text-warm-accent uppercase flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-warm-accent/70" /> Order Parameters
                </h3>
                <div className="text-sm text-warm-dark/80 space-y-2">
                  <div className="flex justify-between border-b border-warm-dark/5 pb-1.5">
                    <span className="text-warm-dark/50">Payment Mode:</span>
                    <span className="font-bold text-warm-dark">Pre-paid</span>
                  </div>
                  <div className="flex justify-between border-b border-warm-dark/5 pb-1.5">
                    <span className="text-warm-dark/50">Shipping Carrier:</span>
                    <span className="font-bold text-warm-dark">{order.carrier || 'Delhivery'}</span>
                  </div>
                  {order.waybill && (
                    <div className="flex justify-between items-center">
                      <span className="text-warm-dark/50">Waybill AWB:</span>
                      <span className="font-mono text-xs font-bold text-warm-dark bg-warm-light/70 px-2 py-0.5 rounded">{order.waybill}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-xs font-heading font-black tracking-widest text-warm-accent uppercase mb-4">Items Ordered</h3>
              <div className="space-y-3 font-serif">
                {order.items?.map((item: any, idx: number) => (
                  <div 
                    key={idx} 
                    className="flex justify-between items-center bg-warm-light/15 px-5 py-3.5 rounded-2xl border border-warm-accent/5"
                  >
                    <div>
                      <p className="font-bold text-warm-dark text-base">{item.name}</p>
                      <p className="text-[10px] text-warm-dark/50 font-sans mt-0.5">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-warm-dark text-base">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Breakdown */}
            <div className="bg-warm-light/20 p-6 rounded-2xl border border-warm-accent/5 max-w-md ml-auto text-sm font-serif space-y-2.5">
              <div className="flex justify-between text-warm-dark/70">
                <span>Subtotal</span>
                <span>₹{order.total - (order.shippingCost || 0)}</span>
              </div>
              <div className="flex justify-between text-warm-dark/70">
                <span>Shipping Cost</span>
                <span>₹{order.shippingCost || 0}</span>
              </div>
              <div className="flex justify-between font-bold text-warm-dark text-base border-t border-warm-dark/5 pt-3 mt-1.5">
                <span>Grand Total</span>
                <span className="text-warm-accent text-lg">₹{order.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Shipment Tracking Timeline */}
        {order.waybill && (
          <div className="bg-white border border-warm-accent/10 rounded-[32px] p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg font-heading font-black uppercase tracking-wider text-warm-dark mb-8 flex items-center gap-2 pb-3 border-b border-warm-dark/5">
              <Truck className="w-5 h-5 text-warm-accent" /> Live Delivery Tracking
            </h3>

            {trackingLoading && (
              <div className="flex items-center gap-2.5 py-10 justify-center">
                <Loader2 className="w-6 h-6 text-warm-accent animate-spin" />
                <p className="font-serif italic text-warm-dark/50">Contacting Delhivery transit database...</p>
              </div>
            )}

            {trackingError && (
              <div className="text-red-600 text-sm font-serif p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-2 max-w-xl mx-auto shadow-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{trackingError}</span>
              </div>
            )}

            {trackingInfo && (
              <div className="space-y-8">
                <div className="flex justify-between items-center pb-4 border-b border-warm-dark/5">
                  <div>
                    <p className="text-[10px] font-heading font-black tracking-widest text-warm-dark/40 uppercase">Current Logistics Status</p>
                    <p className="font-serif text-base font-bold text-warm-dark mt-0.5">{trackingInfo.status}</p>
                  </div>
                  <a 
                    href={`https://www.delhivery.com/track/package/${order.waybill}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] font-heading font-black uppercase tracking-wider text-warm-accent hover:underline flex items-center gap-1 border border-warm-accent/15 px-3 py-1.5 rounded-xl bg-warm-accent/[0.02]"
                  >
                    Delhivery Live Portal <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                  </a>
                </div>

                <div className="relative border-l border-dashed border-warm-accent/30 ml-3 pl-8 space-y-8 py-2">
                  {trackingInfo.scans.map((scan, sIdx) => (
                    <div key={sIdx} className="relative text-left">
                      {/* Circle Bullet icon */}
                      <div className={`absolute -left-[41px] top-1.5 w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center shadow-sm ${
                        sIdx === 0 
                          ? 'border-warm-accent text-warm-accent scale-110' 
                          : 'border-warm-dark/20 text-warm-dark/40'
                      }`}>
                        {sIdx === 0 ? (
                          <CheckCircle className="w-3.5 h-3.5 fill-warm-accent/10" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-warm-dark/20" />
                        )}
                      </div>

                      {/* Scan Details */}
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                          <span className={`text-xs font-bold font-heading tracking-widest uppercase ${sIdx === 0 ? 'text-warm-accent' : 'text-warm-dark/50'}`}>
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
            )}
          </div>
        )}
      </div>
    </div>
  );
}

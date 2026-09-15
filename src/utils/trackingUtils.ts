import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Utility to determine if a Delhivery tracking status string or type represents a Delivered package.
 */
export function isDeliveredStatus(status?: string, statusType?: string): boolean {
  if (!status && !statusType) return false;
  const s = (status || '').toLowerCase().trim();
  const t = (statusType || '').toUpperCase().trim();

  return (
    t === 'DL' ||
    s === 'dl' ||
    s.includes('delivered') ||
    s.includes('delivered to consignee')
  );
}

/**
 * Utility to determine if a Delhivery tracking status string or type represents a Cancelled / RTO package.
 */
export function isCancelledStatus(status?: string, statusType?: string): boolean {
  if (!status && !statusType) return false;
  const s = (status || '').toLowerCase().trim();
  const t = (statusType || '').toUpperCase().trim();

  return (
    t === 'RT' ||
    s.includes('cancel') ||
    s.includes('canceled') ||
    s.includes('rto')
  );
}

/**
 * Queries Delhivery tracking API for a waybill and updates the Firestore order doc status
 * if the package has been Delivered or Cancelled.
 *
 * @returns The new status if updated ('Delivered' | 'Cancelled'), or null if unchanged/error.
 */
export async function syncOrderTrackingStatus(orderId: string, waybill: string, currentStatus?: string): Promise<'Delivered' | 'Cancelled' | null> {
  if (!waybill || !orderId) return null;

  try {
    const host = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'https://kaaramkathalu.in'
      : '';

    const response = await fetch(`${host}/api/shipping?type=track&waybill=${waybill}`);
    if (!response.ok) return null;

    const resData = await response.json();
    if (!resData || !resData.ShipmentData || resData.ShipmentData.length === 0) {
      return null;
    }

    const shipment = resData.ShipmentData[0]?.Shipment;
    if (!shipment) return null;

    const liveStatus = shipment.Status?.Status || '';
    const liveStatusType = shipment.Status?.StatusType || '';

    if (isDeliveredStatus(liveStatus, liveStatusType)) {
      if (currentStatus !== 'Delivered') {
        await updateDoc(doc(db, 'orders', orderId), {
          status: 'Delivered',
          deliveredAt: new Date()
        });
        return 'Delivered';
      }
    } else if (isCancelledStatus(liveStatus, liveStatusType)) {
      if (currentStatus !== 'Cancelled') {
        await updateDoc(doc(db, 'orders', orderId), {
          status: 'Cancelled',
          cancelledAt: new Date()
        });
        return 'Cancelled';
      }
    }
  } catch (err) {
    console.warn(`Failed to sync tracking for order ${orderId} (waybill ${waybill}):`, err);
  }

  return null;
}

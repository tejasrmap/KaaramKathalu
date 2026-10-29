export const CANONICAL_API_HOST = 'https://www.kaaramkathalu.in';

export function getApiHost(): string {
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ) {
    return CANONICAL_API_HOST;
  }
  return '';
}

export interface PaymentVerifyResult {
  success: boolean;
  alreadyProcessed?: boolean;
  state?: 'COMPLETED' | 'PENDING' | 'FAILED' | 'ORDER_NOT_FOUND' | string;
  status?: string;
  waybill?: string;
  paymentId?: string;
}

const inFlightVerifications = new Map<string, Promise<PaymentVerifyResult | null>>();

/**
 * Calls /api/pay-callback?merchantOrderId=...&format=json to verify an order's live
 * PhonePe V2 payment status and sync Firestore + Delhivery shipment if completed.
 */
export async function verifyOrderPaymentStatus(orderId: string): Promise<PaymentVerifyResult | null> {
  if (!orderId) return null;

  const existing = inFlightVerifications.get(orderId);
  if (existing) return existing;

  const promise = (async (): Promise<PaymentVerifyResult | null> => {
    try {
      const host = getApiHost();
      const res = await fetch(
        `${host}/api/pay-callback?merchantOrderId=${encodeURIComponent(orderId)}&format=json`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json'
          }
        }
      );
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn(`Failed to verify payment status for order ${orderId}:`, err);
      return null;
    } finally {
      inFlightVerifications.delete(orderId);
    }
  })();

  inFlightVerifications.set(orderId, promise);
  return promise;
}

export function formatOrderStatusLabel(status?: string): string {
  const s = (status || 'pending').toLowerCase().trim();
  switch (s) {
    case 'payment_pending':
      return 'Payment Pending';
    case 'payment_failed':
      return 'Payment Failed';
    case 'pending':
    case 'processing':
      return 'Processing';
    case 'shipped':
      return 'Shipped';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
    case 'canceled':
      return 'Cancelled';
    default:
      return status || 'Processing';
  }
}


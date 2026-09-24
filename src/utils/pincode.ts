const STATE_CODE_MAP: Record<string, string> = {
  AP: 'Andhra Pradesh',
  TS: 'Telangana',
  TG: 'Telangana',
  KA: 'Karnataka',
  TN: 'Tamil Nadu',
  KL: 'Kerala',
  MH: 'Maharashtra',
  DL: 'Delhi',
  GA: 'Goa',
  GJ: 'Gujarat',
  HR: 'Haryana',
  HP: 'Himachal Pradesh',
  JK: 'Jammu and Kashmir',
  JH: 'Jharkhand',
  MP: 'Madhya Pradesh',
  OR: 'Odisha',
  OD: 'Odisha',
  PB: 'Punjab',
  RJ: 'Rajasthan',
  SK: 'Sikkim',
  UP: 'Uttar Pradesh',
  UK: 'Uttarakhand',
  UA: 'Uttarakhand',
  WB: 'West Bengal',
  AN: 'Andaman and Nicobar Islands',
  CH: 'Chandigarh',
  DN: 'Dadra and Nagar Haveli and Daman and Diu',
  LA: 'Ladakh',
  LD: 'Lakshadweep',
  PY: 'Puducherry',
};

export const getFullStateName = (codeOrName: string): string => {
  if (!codeOrName) return '';
  const trimmed = codeOrName.trim();
  if (trimmed.length === 2 && STATE_CODE_MAP[trimmed.toUpperCase()]) {
    return STATE_CODE_MAP[trimmed.toUpperCase()];
  }
  return trimmed;
};

export interface PincodeDetails {
  city: string;
  state: string;
}

export async function fetchPincodeDetails(pin: string): Promise<PincodeDetails | null> {
  const cleanPin = pin.trim();
  if (!/^\d{6}$/.test(cleanPin)) return null;

  // 1. Try India Post API for exact Indian district and state
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        const city = po.District || po.Division || po.Block || po.Name || '';
        const state = getFullStateName(po.State || '');
        if (city || state) {
          return { city, state };
        }
      }
    }
  } catch (e) {
    console.warn("Postal pincode API lookup failed, trying fallback:", e);
  }

  // 2. Fallback to Delhivery serviceability API
  try {
    const host = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'https://kaaramkathalu.in'
      : '';
    const serviceabilityRes = await fetch(`${host}/api/shipping?type=serviceability&pin=${cleanPin}`);
    if (serviceabilityRes.ok) {
      const data = await serviceabilityRes.json();
      if (data?.delivery_codes?.[0]?.postal_code) {
        const pc = data.delivery_codes[0].postal_code;
        const city = pc.city || pc.district || '';
        const state = getFullStateName(pc.state_name || pc.state || pc.state_code || '');
        if (city || state) {
          return { city, state };
        }
      }
    }
  } catch (e) {
    console.warn("Delhivery postal code lookup fallback failed:", e);
  }

  return null;
}

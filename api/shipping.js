export default async function handler(req, res) {
  // CORS Headers to allow local development testing
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const token = process.env.VITE_DELHIVERY_API_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'Delhivery API token is not configured on the server.' });
  }

  const { type } = req.query;

  try {
    if (type === 'serviceability') {
      const pin = req.query.pin;
      if (!pin) {
        return res.status(400).json({ error: 'Missing pin parameter' });
      }
      const targetUrl = `https://track.delhivery.com/c/api/pin-codes/json/?token=${token}&filter_codes=${pin}`;
      const response = await fetch(targetUrl);
      if (!response.ok) {
        throw new Error(`Delhivery returned status ${response.status}`);
      }
      const data = await response.json();
      return res.status(200).json(data);
    } else if (type === 'charges') {
      const { o_pin, d_pin, cgm } = req.query;
      if (!o_pin || !d_pin || !cgm) {
        return res.status(400).json({ error: 'Missing required parameters: o_pin, d_pin, cgm' });
      }
      const targetUrl = `https://track.delhivery.com/api/kinko/v1/invoice/charges/.json?md=E&ss=Delivered&o_pin=${o_pin}&d_pin=${d_pin}&cgm=${cgm}`;
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`Delhivery returned status ${response.status}`);
      }
      const data = await response.json();
      return res.status(200).json(data);
    } else {
      return res.status(400).json({ error: 'Invalid query type' });
    }
  } catch (error) {
    console.error("Delhivery API proxy error:", error);
    return res.status(500).json({ error: error.message || 'Error fetching from Delhivery' });
  }
}

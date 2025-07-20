require('dotenv').config();
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const path = require('path');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: 'https://your-site.netlify.app'
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;
const PESAPAL_API_URL = process.env.PESAPAL_API_URL || 'https://cybqa.pesapal.com/pesapalv3/api';

let accessToken = null;
let tokenExpiry = null;

async function getOAuthToken() {
  const credentials = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  const response = await axios.get(`${PESAPAL_API_URL}/Auth/RequestToken`, {
    headers: { Authorization: `Basic ${credentials}` }
  });

  accessToken = response.data.token;
  tokenExpiry = new Date(Date.now() + 55 * 60 * 1000);
  console.log('[Pesapal] Access token refreshed');
  return accessToken;
}

app.get('/', (req, res) => {
  res.send('Pesapal STK Push API is running');
});

app.post('/stk-push', async (req, res) => {
  try {
    const { phone_number } = req.body;

    if (!/^2547\d{8}$/.test(phone_number)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }

    console.log(`[STK PUSH] Phone: ${phone_number} | Amount: 100`);

    if (!accessToken || !tokenExpiry || new Date() > tokenExpiry) {
      await getOAuthToken();
    }

    const payload = {
      id: crypto.randomUUID(),
      amount: 100,
      phone_number,
      currency: "KES",
      email_address: "test@example.com",
      callback_url: "https://yourdomain.com/callback",
      description: "Payment for ViralJet",
      country: "KEN"
    };

    const response = await axios.post(`${PESAPAL_API_URL}/Transaction/SubmitOrderRequest`, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('[Pesapal] STK push request sent successfully');
    res.json(response.data);

  } catch (error) {
    console.error('[Pesapal] STK push failed:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to initiate STK push' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

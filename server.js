import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import PayHero from './index.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://super-centaur-1329ef.netlify.app'
    : '*'
}));
app.use(express.json());

// Auth header setup
const credentials = `${process.env.API_USERNAME}:${process.env.API_PASSWORD}`;
const encodedCredentials = Buffer.from(credentials).toString('base64');
const authToken = `Basic ${encodedCredentials}`;

// Initialize PayHero
const payHero = new PayHero({
  Authorization: authToken,
  pesapalConsumerKey: process.env.PESAPAL_CONSUMER_KEY,
  pesapalConsumerSecret: process.env.PESAPAL_CONSUMER_SECRET,
  pesapalApiUrl: process.env.PESAPAL_API_URL,
  pesapalCallbackUrl: process.env.PESAPAL_CALLBACK_URL,
  pesapalIpnId: process.env.PESAPAL_IPN_ID
});

// STK Push Route
app.post('/stk-push', async (req, res) => {
  const { phone, amount } = req.body;

  // Validate input
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  if (!amount || isNaN(amount) || parseFloat(amount) < 1) {
    return res.status(400).json({ error: 'Valid amount is required' });
  }

  const normalizedPhone = phone.startsWith('0') ? phone.replace(/^0/, '254') : phone;

  const paymentDetails = {
    amount: parseFloat(amount),
    phone_number: normalizedPhone,
    channel_id: 2200,
    provider: 'm-pesa',
    external_reference: `WEB-ORDER-${Date.now()}`,
    callback_url: 'https://bingwa-sokoni-bundle-purchase.onrender.com/callback'
  };

  try {
    const response = await payHero.makeStkPush(paymentDetails);
    res.json(response);
  } catch (err) {
    console.error('❌ STK Push Error:', {
      message: err.message,
      status: err.response?.status || 'No status',
      headers: err.response?.headers || 'No headers',
      data: err.response?.data || 'No data',
      stack: err.stack
    });

    console.error('📦 Payment details that caused error:', paymentDetails);

    res.status(500).json({
      error: 'STK Push failed',
      message: err.message,
      response: err.response?.data || 'No response data',
      statusCode: err.response?.status || 500
    });
  }
});

// Callback route
app.post('/callback', (req, res) => {
  console.log('✅ Callback received:', req.body);
  res.status(200).send('Callback received');
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import PayHero from './index.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'https://aesthetic-mandazi-ff9e00.netlify.app'
}));
app.use(express.json());

// Setup PayHero authorization
const credentials = `${process.env.API_USERNAME}:${process.env.API_PASSWORD}`;
const encodedCredentials = Buffer.from(credentials).toString('base64');
const authToken = `Basic ${encodedCredentials}`;

// Initialize PayHero client
const payHero = new PayHero({
  Authorization: authToken
});

// Health check route
app.get('/', (req, res) => {
  res.send('✅ PayHero STK Server is running');
});

// STK Push endpoint (channel_id hardcoded to 2200)
app.post('/stk-push', async (req, res) => {
  const { phone, amount } = req.body;
  console.log('📥 STK Request Received:', req.body);

  // Input validation
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  if (!amount || isNaN(amount) || parseFloat(amount) < 1) {
    return res.status(400).json({ error: 'Valid amount is required' });
  }

  if (!process.env.PROVIDER) {
    return res.status(500).json({ error: 'Server misconfiguration: Missing PROVIDER' });
  }

  const paymentDetails = {
    amount: parseFloat(amount),
    phone_number: phone,
    channel_id: 2200, // Hardcoded
    provider: process.env.PROVIDER,
    external_reference: `INV-${Date.now()}`,
    callback_url: 'https://bingwa-sokoni-bundle-purchase.onrender.com/callback'
  };

  try {
    const response = await payHero.makeStkPush(paymentDetails);
    console.log('✅ STK Push Success:', response);
    res.json(response);
  } catch (err) {
    console.error('❌ STK Push Failed:', {
      message: err.message,
      status: err.response?.status,
      data: err.response?.data,
      headers: err.response?.headers
    });

    res.status(500).json({
      error: 'STK Push failed',
      message: err.message,
      response: err.response?.data || 'No response data'
    });
  }
});

// Callback endpoint
app.post('/callback', (req, res) => {
  console.log('✅ Callback received:', req.body);
  res.status(200).send('Callback received');
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});

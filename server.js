import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import PayHero from './index.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// âœ… Open CORS to all origins for testing
app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/', (req, res) => {
  res.send('âœ… PayHero backend is live');
});

const credentials = `${process.env.API_USERNAME}:${process.env.API_PASSWORD}`;
const encodedCredentials = Buffer.from(credentials).toString('base64');
const authToken = `Basic ${encodedCredentials}`;

const payHero = new PayHero({
  Authorization: authToken,
  pesapalConsumerKey: '',
  pesapalConsumerSecret: '',
  pesapalApiUrl: '',
  pesapalCallbackUrl: '',
  pesapalIpnId: ''
});

// STK push endpoint with logging
app.post('/stk-push', async (req, res) => {
  const { phone } = req.body;
  console.log('ðŸ“ž STK Push called with phone:', phone); // âœ… log input

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const paymentDetails = {
    amount: 129,
    phone_number: phone,
    channel_id: parseInt(process.env.CHANNEL_ID),
    provider: process.env.PROVIDER,
    external_reference: 'WEB-ORDER-129',
    callback_url: 'https://bingwa-sokoni-bundle-purchase.onrender.com/callback'
  };

  try {
    const response = await payHero.makeStkPush(paymentDetails);
    res.json(response);
  } catch (err) {
    console.error('âŒ Error in STK Push:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Callback route
app.post('/callback', (req, res) => {
  console.log('ðŸ” Callback received:', req.body);
  res.status(200).send('Callback received');
});

app.listen(port, () => {
  console.log(`ðŸš€ Server is running on port ${port}`);
});

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import PayHero from './index.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: 'https://ubiquitous-pegasus-14c28a.netlify.app'
}));
app.use(express.json());

const credentials = `${process.env.API_USERNAME}:${process.env.API_PASSWORD}`;
const encodedCredentials = Buffer.from(credentials).toString('base64');
const authToken = `Basic ${encodedCredentials}`;

const payHero = new PayHero({
  Authorization: authToken,
  pesapalConsumerKey: process.env.PESAPAL_CONSUMER_KEY,
  pesapalConsumerSecret: process.env.PESAPAL_CONSUMER_SECRET,
  pesapalApiUrl: process.env.PESAPAL_API_URL,
  pesapalCallbackUrl: process.env.PESAPAL_CALLBACK_URL,
  pesapalIpnId: process.env.PESAPAL_IPN_ID
});

// Health check route
app.get('/', (req, res) => {
  res.send('âœ… STK Server is running');
});

app.post('/stk-push', async (req, res) => {
  const { phone, amount } = req.body;
  console.log('ðŸ“¥ STK Request Received:', req.body);

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  if (!amount || isNaN(amount) || parseFloat(amount) < 1) {
    return res.status(400).json({ error: 'Valid amount is required' });
  }

  if (!process.env.CHANNEL_ID || !process.env.PROVIDER) {
    return res.status(500).json({ error: 'Server misconfiguration: Missing CHANNEL_ID or PROVIDER' });
  }

  const paymentDetails = {
    amount: parseFloat(amount),
    phone_number: phone,
    channel_id: 2200,
    provider: "m-pesa",
    external_reference: "INV-009",
    callback_url: 'https://bingwa-sokoni-bundle-purchase.onrender.com/callback'
  };

  try {
    const response = await payHero.makeStkPush(paymentDetails);
    res.json(response);
  } catch (err) {
    console.error('âŒ Error in STK Push:', {
      message: err.message,
      responseData: err.response?.data,
      config: err.config,
      stack: err.stack
    });

    res.status(500).json({
      error: 'STK Push failed',
      message: err.message,
      details: err.response?.data || 'No response data'
    });
  }
});

app.post('/callback', (req, res) => {
  console.log('âœ… Callback received:', req.body);
  res.status(200).send('Callback received');
});

app.listen(port, () => {
  console.log(`ðŸš€ Server is running on port ${port}`);
});

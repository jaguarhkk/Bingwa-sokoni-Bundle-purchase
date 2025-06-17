import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import PayHero from './index.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// ✅ Allow only one Netlify domain
app.use(cors({
  origin: 'https://68512e7eb907eae1d154e68b--gleeful-taffy-6e6df0.netlify.app'
}));

app.use(express.json());

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

app.post('/stk-push', async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const paymentDetails = {
    amount: 129,
    phone_number: phone,
    channel_id: parseInt(process.env.CHANNEL_ID),
    provider: process.env.PROVIDER,
    network_code: '63902',
    external_reference: 'WEB-ORDER-129',
    callback_url: 'https://bingwa-sokoni-bundle-purchase.onrender.com/callback'
  };

  try {
    const response = await payHero.makeStkPush(paymentDetails);
    res.json(response);
  } catch (err) {
    console.error('Error in STK Push:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/callback', (req, res) => {
  console.log('Callback received:', req.body);
  res.status(200).send('Callback received');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

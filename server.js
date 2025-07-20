const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'https://serene-tapioca-05764a.netlify.app' // Replace with your actual Netlify domain
}));
app.use(express.json());

let accessToken = '';
let tokenExpiry = 0;

const getAccessToken = async () => {
  if (Date.now() < tokenExpiry && accessToken) {
    console.log('Using cached access token');
    return accessToken;
  }

  try {
    const response = await axios.post(
      'https://pay.pesapal.com/v3/api/Auth/RequestToken',
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${process.env.PESAPAL_KEY}:${process.env.PESAPAL_SECRET}`).toString('base64')}`
        }
      }
    );

    accessToken = response.data.token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000);
    console.log('✅ Access token retrieved');
    return accessToken;
  } catch (error) {
    console.error('❌ Failed to get access token:', error.response?.data || error.message);
    throw new Error('Access token fetch failed');
  }
};

app.post('/stk-push', async (req, res) => {
  const phone = req.body.phone;
  const amount = 100;

  if (!/^07\d{8}$/.test(phone) && !/^2547\d{8}$/.test(phone)) {
    return res.status(400).json({ message: 'Invalid Kenyan phone number format. Use 07XXXXXXXX or 2547XXXXXXXX' });
  }
  try {
    const token = await getAccessToken();

    const order = {
      id: `order-${Date.now()}`,
      currency: 'KES',
      amount,
      description: 'Payment for item',
      callback_url: 'https://webhook.site/your-callback-url', // Optional
      notification_id: '', // Optional if not using IPN
      billing_address: {
        phone_number: phone,
        email_address: 'demo@example.com',
        country_code: 'KE',
        first_name: 'Demo',
        last_name: 'User',
        line_1: 'Nairobi',
        city: 'Nairobi',
        state: 'Nairobi'
      }
    };

    const response = await axios.post(
      'https://pay.pesapal.com/v3/api/Transactions/SubmitOrderRequest',
      order,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('✅ STK Push Response:', response.data);
    res.status(200).json({ message: 'STK push sent', data: response.data });

  } catch (error) {
    console.error('❌ STK Push Failed:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to initiate STK push' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

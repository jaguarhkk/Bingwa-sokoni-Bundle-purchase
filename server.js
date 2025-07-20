require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const PesaPal = require('./lib/pesapal').init({
  key: process.env.PESAPAL_CONSUMER_KEY,
  secret: process.env.PESAPAL_CONSUMER_SECRET,
  debug: true
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

PesaPal.authenticate();

app.post('/api/pay', async (req, res) => {
  const { phone, amount } = req.body;

  if (!phone || !amount) {
    return res.status(400).json({ message: 'Phone and amount are required' });
  }

  try {
    const response = await PesaPal.submit_order({
      id: Date.now().toString(),
      currency: 'KES',
      amount: parseFloat(amount),
      description: `STK Push for ${amount} KES`,
      callback_url: process.env.CALLBACK_URL,
      notification_id: process.env.NOTIFICATION_ID,
      billing_address: {
        email_address: 'customer@mail.com',
        phone_number: phone,
        country_code: 'KE',
        first_name: 'Imarika',
        last_name: 'User'
      }
    });

    res.status(200).json({
      message: 'STK Push initiated',
      redirect_url: response.redirect_url || null
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error initiating payment', error });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));

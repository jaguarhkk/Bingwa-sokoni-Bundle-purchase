// This is where your HTTP logic to interact with Pesapal API goes
// Use axios, store tokens, and call endpoints like Auth, SubmitOrderRequest, etc.

const axios = require('axios');

let config = {
  token: null,
  key: '',
  secret: '',
  debug: true
};

exports.setup = function (key, secret, debug) {
  config.key = key;
  config.secret = secret;
  config.debug = debug;
};

exports.authenticate = async function () {
  const authString = Buffer.from(`${config.key}:${config.secret}`).toString('base64');
  const url = config.debug
    ? 'https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken'
    : 'https://pay.pesapal.com/v3/api/Auth/RequestToken';

  const res = await axios.post(url, {}, {
    headers: { Authorization: `Basic ${authString}` }
  });

  config.token = res.data.token;
};

exports.SubmitOrder = async function (order) {
  const url = config.debug
    ? 'https://cybqa.pesapal.com/pesapalv3/api/Transactions/SubmitOrderRequest'
    : 'https://pay.pesapal.com/v3/api/Transactions/SubmitOrderRequest';

  const res = await axios.post(url, order, {
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json'
    }
  });

  return res.data;
};

exports.getTransactionStatus = async function (orderTrackingId) {
  const url = config.debug
    ? `https://cybqa.pesapal.com/pesapalv3/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`
    : `https://pay.pesapal.com/v3/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`;

  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${config.token}` }
  });

  return res.data;
};

exports.registerIPNurl = async function (url, type) {
  // implement if needed
};

exports.getIPNurl = async function () {
  // implement if needed
};

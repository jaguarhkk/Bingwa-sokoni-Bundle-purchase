import axios from "axios";

class PayHero {
  constructor(config) {
    this.Authorization = config.Authorization;
    this.baseUrl = "https://backend.payhero.co.ke/api/v2/";
  }

  async makeStkPush(details) {
    try {
      const response = await axios.post(`${this.baseUrl}payments`, details, {
        headers: {
          Authorization: this.Authorization,
        },
      });
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async serviceWalletBalance() {
    try {
      const response = await axios.get(
        `${this.baseUrl}wallets?wallet_type=service_wallet`,
        {
          headers: {
            Authorization: this.Authorization,
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async paymentsWalletBalance() {
    try {
      const response = await axios.get(
        `${this.baseUrl}wallets?wallet_type=payment_wallet`,
        {
          headers: {
            Authorization: this.Authorization,
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async topUpServiceWallet(details) {
    try {
      const response = await axios.post(`${this.baseUrl}topup`, details, {
        headers: {
          Authorization: this.Authorization,
        },
      });
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async accountTransactions() {
    try {
      const response = await axios.get(`${this.baseUrl}transactions`, {
        headers: {
          Authorization: this.Authorization,
        },
      });
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async transactionStatus(transactionId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}transaction-status?reference=${transactionId}`,
        {
          headers: {
            Authorization: this.Authorization,
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async paymentChannels() {
    try {
      const response = await axios.get(`${this.baseUrl}payment_channels`, {
        headers: {
          Authorization: this.Authorization,
        },
      });
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async createPaymentChannel(details) {
    try {
      const response = await axios.post(
        `${this.baseUrl}payment_channels`,
        details,
        {
          headers: {
            Authorization: this.Authorization,
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async getBanks() {
    try {
      const response = await axios.get(`${this.baseUrl}bank_paybills`, {
        headers: {
          Authorization: this.Authorization,
        },
      });
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async withdraw(details) {
    try {
      const response = await axios.post(`${this.baseUrl}withdraw`, details, {
        headers: {
          Authorization: this.Authorization,
        },
      });
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async makeWhatsappPayment(details) {
    try {
      const response = await axios.post(
        `${this.baseUrl}whatspp/sendText`,
        details,
        {
          headers: {
            Authorization: this.Authorization,
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}

export default PayHero;

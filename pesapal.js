var core = require("./internal/core");

var PesaPal = {};

PesaPal.authenticate = function(){
  core.authenticate();
}

PesaPal.register_ipn_url = function (options) {
  options = options || {};
  if (!options.url || !options.ipn_notification_type)
    throw new Error("Need to specify both IPN url and IPN notification type");
  return core.registerIPNurl(options.url, options.ipn_notification_type);
};

PesaPal.get_ipn_list = function () {
  return core.getIPNurl();
};

PesaPal.submit_order = function (options) {
  options = options || {};
  if (!options.id || !options.currency || !options.amount || !options.description ||
      !options.callback_url || !options.notification_id || !options.billing_address)
    throw new Error("Missing fields. Refer to Pesapal v3 documentation.");
  return core.SubmitOrder(options);
};

PesaPal.get_transaction_status = function (options) {
  options = options || {};
  if (!options.OrderTrackingId)
    throw new Error("OrderTrackingId is required");
  return core.getTransactionStatus(options.OrderTrackingId);
};

exports.init = function (options) {
  if (!options.key || !options.secret)
    throw new Error("Need to specify both consumer key and secret");
  core.setup(options.key, options.secret, options.debug || false);
  return PesaPal;
};

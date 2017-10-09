/* globals process, __dirname */
    
var https = require('https');
var express = require('express');
var fs = require('fs');

/*
// TODO
MONGOHQ_URL
*/

//
// Configure app
//

var app = express();

// Path

app.set('ROOT_PATH', __dirname);
app.set('PUBLIC_PATH', process.env.PUBLIC_PATH || app.get('ROOT_PATH') + '/public/');

// App
app.set('APP_SSL', process.env.APP_SSL || true);
app.set('APP_PORT', process.env.APP_PORT || 8080);
app.set('APP_HOST', process.env.APP_HOST || 'localhost');
app.set('APP_URL', process.env.APP_URL || (app.get('APP_SSL') ? 'https' : 'http') + '://' + app.get('APP_HOST') + ':' + app.get('APP_PORT'));

app.set('BRAINTREE_MARCHANT_ID', process.env.BRAINTREE_MARCHANT_ID || "2vcbbfdttx7cyjxt");

// Load json config
app.set('config', require('./config/all'));

//
// Serve statics
//
var PUBLIC_PATH = app.get('PUBLIC_PATH');
app.use(express.static(PUBLIC_PATH, {
  index: false
}));

// Trust first proxy
app.set('trust proxy', 1);

//
// Offer and Customer API
//

var offers = require('./controllers/offers');
app.get("/api/offers", offers.getOffers);
app.get("/api/offers/offer/:offerId", offers.getOffer);


var customer = require('./controllers/customer');
app.get("/api/customer", customer.getCustomer);
app.get("/api/customer/:customerId", customer.getCustomerDetails);
app.get("/api/customer/:customerId/orders", customer.getCustomerOrders);
app.get("/api/customer/:customerId/orders/order/:orderId", customer.getCustomerOrder);
app.get("/api/customer/:customerId/orders/order/:orderId/invoice/:invoiceFormat", customer.getCustomerOrder);
app.delete("/api/customer/:customerId/orders/order/:orderId", customer.cancelCustomerOrder);
app.get("/api/customer/:customerId/transactions", customer.getCustomerTransactions);
app.get("/api/customer/:customerId/subscriptions", customer.getCustomerSubscriptions);
app.get("/api/customer/:customerId/offers", customer.getCustomerOffers);
app.get("/api/customer/:customerId/offers/offer/:offerId", customer.getCustomerOffer);
app.get("/api/customer/:customerId/plans", customer.getCustomerPlans);
// TODO param
//app.param('customerId', offers.customerIdParam);

var payment = require('./controllers/payment');
app.post("/api/payment", payment.checkoutPaymentOffer);
app.put("/api/payment/:orderId", payment.updatePaymentOffer);
app.post("/api/payment/callback", payment.callback);
app.get("/api/payment/callbackTest", payment.callbackTest);

//
// Errors Handling
//

var errors = require('./controllers/errors');

// Handle CSP report-violation 
app.post('/report-violation', errors.reportViolation);

// Main error handler
app.use(errors.errors);

// Assume 404 since no middleware responded
app.use(errors.notfound);  

//
// Start http server
//

var APP_PORT = app.get('APP_PORT'),  
    APP_URL = app.get('APP_URL'),  
    APP_SSL = app.get('APP_SSL'),
    CERT_PATH = app.get('ROOT_PATH') + '/certs/';

if (APP_PORT === 443) {
  var forwardingServer = express();

  forwardingServer.all('*', function(req, res) {
      return res.redirect("https://" + APP_URL + req.url);
  });

  forwardingServer.listen(80); 
}

if (APP_SSL === true) {

  https
    .createServer({
        key: fs.readFileSync(CERT_PATH + '/private.key'),
        cert:  fs.readFileSync(CERT_PATH + '/public.crt')
    }, app)
    .listen(APP_PORT, function (error) {
      if (error) {
        console.error(error);
        return process.exit(1);
      } else {
        console.log('(https) Listening on port: ' + APP_PORT + '.');
      }
    });
} else {
  app.listen(APP_PORT);
  console.log('(http) Listening on port: ' + APP_PORT + '.');
} 
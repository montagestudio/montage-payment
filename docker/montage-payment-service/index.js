
var http = require("http");             
var https = require('https');
var express = require('express');
var path = require('path');
var fs = require('fs');



// Path

var ROOT_PATH = __dirname;
var PUBLIC_PATH = process.env.PUBLIC_PATH || ROOT_PATH + '/public/';
var RESOURCES_PATH = process.env.RESOURCES_PATH || ROOT_PATH + '/resources/';

/*
MONGOHQ_URL
RESOURCES_PATH
*/

function readFile(path) {
  return new Promise(function (resolve, reject) {
    fs.readFile(path, function (err, file) {
      if (err) {
        reject(err);
      } else {
        resolve(file);
      }
    });
  });
}

// Set default env
const BRAINTREE_MARCHANT_ID = process.env.BRAINTREE_MARCHANT_ID || "";

const APP_SSL = process.env.APP_SSL || true;
const APP_PORT = process.env.APP_PORT || 8080;
const APP_HOST = process.env.APP_HOST || 'localhost';
const APP_URL = process.env.APP_URL || (APP_SSL ? 'https' : 'http') + '://' + APP_HOST + ':' + APP_PORT;

//
// Configure app
//

var app = express();

//
// Serve statics
//

app.use(express.static(PUBLIC_PATH, {
  index: false
}));


//
// Offer and Customer API
//

var offers = require('./controllers/api/offers');
app.get("/api/offers", session.authentify, offers.getOffers);
app.get("/api/offers/offer/:offerId", session.authentify, offers.getOffer);

app.get("/api/customer", session.authentify, offers.getCustomer);
app.get("/api/customer/:customerId", session.authentify, offers.getCustomerDetails);
app.get("/api/customer/:customerId/orders", session.authentify, offers.getCustomerOrders);
app.get("/api/customer/:customerId/orders/order/:orderId", session.authentify, offers.getCustomerOrder);
app.delete("/api/customer/:customerId/orders/order/:orderId", session.authentify, offers.cancelCustomerOrder);
app.get("/api/customer/:customerId/transactions", session.authentify, offers.getCustomerTransactions);
app.get("/api/customer/:customerId/subscriptions", session.authentify, offers.getCustomerSubscriptions);
app.get("/api/customer/:customerId/offers", session.authentify, offers.getCustomerOffers);
app.get("/api/customer/:customerId/offers/offer/:offerId", session.authentify, offers.getCustomerOffer);
app.get("/api/customer/:customerId/plans", session.authentify, offers.getCustomerPlans);

//
// Errors Handling
//

var errors = require('./controllers/api/errors');

// Handle CSP report-violation 
app.post('/report-violation', errors.reportViolation);

// Main error handler
app.use(errors.errors);

// Assume 404 since no middleware responded
app.use(errors.notfound);   
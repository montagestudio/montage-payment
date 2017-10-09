/* global exports, require */
'use strict';

// https://developers.braintreepayments.com/reference/general/testing/node
// https://developers.braintreepayments.com/start/hello-server/node
// https://developers.braintreepayments.com/guides/recurring-billing/overview

var braintree = require('braintree');
var q = require('q');

var mongoose = require('mongoose');
var Order = mongoose.model('Order');


function isValidEmail(str) {
    return new Valid().validate(str).required().isEmail().isValid();
};

function formatEmailName(email, name) {

    if (exports.isValidEmail(email) === false) {
        throw Error('Invalid formatEmailName email: ' + email);
    }

    if (email === name) {
        name = null;
    }

    return name ? name + ' <' + email + '>' : email;
};

function sendEmailTemplate(templateName, templateData, emailObj, config, emailConfig) {
  // TODO
  /*
  var Valid = require('node-valid');
  var nodemailer = require("nodemailer");
  var smtpTransport = require('nodemailer-smtp-transport');
  var stubTransport = require('nodemailer-stub-transport');
  var sendmailTransport = require('nodemailer-sendmail-transport');
  var EmailTemplate = require('email-templates').EmailTemplate;
  */
}

function filterByProperty(orderId, orders, prop) {
  return orders.filter(function (order) {
    return order[prop] === orderId;
  })[0];
}
//
// Plans & Offers
//

var plans = {
  PREMIUM: {
    // Features info
    user: {
      enableScheduling: true
    },
    room: {
      enableBroacasting: true,
      enableRecording: true
    }
  },
  TEAM_20K: {

  },
  BUSINESS_20K: {

  }
};

var offers = [
  {
    enable: true,
    id: 'pro',
    name: "Pro",
    description: "Premium for individual profesional user.",
    features: [
      'Perfect for Dev and Project Manager',
    ],
    // Plan
    planId: 'PREMIUM',
    planDuration: 1,
    planPeriod: 'month',
    // Trail info
    trialPeriod: true,
    trialDuration: 14,
    trialDurationUnit: 'day',
    // Price
    amount: {
      currency: 'USD',
      value: '9.90'
    }
  },
  {
    enable: true,
    id: 'saas',
    name: "Team",
    description: "Premium for Team. Mutualized SAAS Server.",
    features: [
      'Multi-user Functionality',
      'Customize Branding',
      'Perfect for Agencies',
    ],
    // Order info
    planId: 'TEAM',
    planDuration: 1,
    planPeriod: 'month',
    // Trail info
    trialPeriod: true,
    trialDuration: 14,
    trialDurationUnit: 'day',
    // Price
    amount: {
      currency: 'USD',
      value: '399.00'
    }
  },
  {
    enable: true,
    id: 'business',
    name: "Business",
    description: "Premium for Team. Dedicated SAAS Server.",
    features: [
      'Everything Included in Team Offer',
      'Dedicated Virtual Private Cloud (VPC)',
      'Perfect for Corporation',
    ],
    // Order info
    planId: 'BUSINESS',
    planDuration: 1,
    planPeriod: 'month',
    // Trail info
    trialPeriod: true,
    trialDuration: 14,
    trialDurationUnit: 'day',
    // Price
    amount: {
      currency: 'USD',
      value: '799.00'
    }
  },
  {
    enable: true,
    id: 'support',
    name: "Support Hour",
    description: "One hour of prepaid dedicated support.",
    features: [
      'Support response in 1 hour 24/24',
      'Assistance for indivial or team',
      'Ideal for outsourcing Corporate support',
    ],
    // Product
    productId: "SUPPORT_HOUR",
    productQty: 1,
    productQtyUsed: 0,
    // Price
    amount: {
      currency: 'USD',
      value: '99.00'
    }
  }
];

//
// Offer Internal API
//

function getOffer(offerId) {
  var deferred = q.defer();

  var offer = offers.filter(function (offer) {
    return offer.enable && offer.id === offerId;
  })[0];

  if (offer) {
    deferred.resolve(offer);
  } else {
    deferred.reject(new Error("Offer NotFound"));
  }

  return deferred.promise;
}

function getOfferInfo(offer) {
  return {
    id: offer.id,
    name: offer.name,
    description: offer.description,
    features: offer.features,
    // Order info
    planId: offer.planId,
    planDuration: offer.planDuration,
    planPeriod: offer.planPeriod,
    // Trail info
    trialPeriod: offer.trialPeriod,
    trialDuration: offer.trialDuration,
    trialDurationUnit: offer.trialDurationUnit,
    // Product
    productId: offer.productId,
    productQty: offer.productQty,
    productQtyUsed: offer.productQtyUsed,
    // Price
    amount: offer.amount ? {
      currency: offer.amount.currency,
      value: offer.amount.value
    } : null
  };
}

//
// Payment internal API
//

function getPaymentGateway(config) {
  if (
    config.payment && config.payment.enable &&
      config.braintree && config.braintree.enable
  ) {
    
    /*
    gateway.customer.find
    gateway.customer.create
    gateway.customer.update
    gateway.customer.search
    gateway.subscription.create
    gateway.subscription.search
    gateway.subscription.find
    gateway.subscription.cancel
    gateway.transaction.sale
    gateway.transaction.search
    gateway.transaction.void
    gateway.clientToken.generate
    gateway.paymentMethod.find
    gateway.paymentMethod.create
    gateway.webhookNotification.parse
    gateway.webhookTesting.sampleNotification
    */
    return q.resolve(braintree.connect({
        environment:  braintree.Environment.Sandbox,
        merchantId: config.braintree.merchantId,
        publicKey: config.braintree.publicKey,
        privateKey: config.braintree.privateKey
    })); 
  } else {
    return q.reject('NoPaymentGateway');
  }
}

//
// Customer
// 

function getCustomerInfo(customer) {
  return {
    id: customer.id,
    firstName: customer.firstName,
    lastName: customer.lastName,
    company: customer.company,
    email: customer.email,
    phone: customer.phone,
    fax: customer.fax,
    website: customer.website,
    created: new Date(customer.createdAt),
    updated: new Date(customer.updatedAt),
    addresses: customer.addresses
  };
}

function getCustomerById(customerId, gateway) {

  if (!customerId) {
    return q.reject('MissingCustomerId');
  }

  var deferred = q.defer();
  try {
    gateway.customer.find(customerId, function(err, customer) {
      if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(customer);
        }
    });
  } catch (err) {
    deferred.reject(err);
  }
  return deferred.promise;
}

function createCustomer(customerDetails, gateway) {
  var deferred = q.defer();

  try {
    gateway.customer.create({
      id: customerDetails.id,
      email: customerDetails.email
      /*
      firstName: "Jen",
      lastName: "Smith",
      company: "Braintree",
      email: "jen@example.com",
      phone: "312.555.1234",
      fax: "614.555.5678",
      website: "www.example.com"
      */
    }, function (err, result) {
        if (err) {
          deferred.reject(err);
        } else {
          if (result.success) {
            console.info('Created customer', customerDetails);
            deferred.resolve(result.customer);
          } else {
            deferred.reject(result);
          }
        }
    });
  } catch (err) {
    deferred.reject(err);
  }

  return deferred.promise;
}

function updateCustomer(customerDetails, gateway) {
  var deferred = q.defer();

  try {
    gateway.customer.update(customerDetails.id, {
      email: customerDetails.email
      /*
      firstName: "Jen",
      lastName: "Smith",
      company: "Braintree",
      email: "jen@example.com",
      phone: "312.555.1234",
      fax: "614.555.5678",
      website: "www.example.com"
      */
    }, function (err, result) {
        if (err) {
          deferred.reject(err);
        } else {
          if (result.success) {
            console.info('Updated customer', customerDetails);
            deferred.resolve(result.customer);
          } else {
            deferred.reject(result);
          }
        }
    });
  } catch (err) {
    deferred.reject(err);
  }

  return deferred.promise;
}

function findCustomer(customerDetails, gateway) {
  var deferred = q.defer();
  try {
    var stream = gateway.customer.search(function (search) {
      if (customerDetails.id) {
          search.id().is(customerDetails.id);
      } else if (customerDetails.email) {
          search.email().is(customerDetails.email); 
      }
    }, function (err, searchResponse) {
      if (err) {
          deferred.reject(err);
        } else {
        var customers = [];
        if (searchResponse.length() === 0) {
          deferred.reject(new Error('CustomerNotFound'));
        } else {              
            searchResponse.each(function (err, customer) {
              if (err) {
                deferred.reject(err);
              } else {
                customers.push(customer);
                if (customers.length === searchResponse.length()) {
                  deferred.resolve(customers[0]);
                } 
              }
            }); 
        }
      }
    });
  } catch (err) {
    deferred.reject(err);
  }

  return deferred.promise;
}

//
//
//

function getTransactionOrderId(transaction) {
  return transaction.subscriptionId ? transaction.subscriptionId : 
        transaction.orderId ? transaction.orderId : transaction.id;
}

function getSubscriptionInfo(subscription) {
  /*
    Subscription {
      addOns: 
       [ { amount: '29.90',
           currentBillingCycle: 1,
           id: 'WIDGET',
           name: 'Sylaps Widget',
           neverExpires: false,
           numberOfBillingCycles: 1,
           quantity: 1 } ],
      balance: '0.00',
      billingDayOfMonth: 1,
      billingPeriodEndDate: '2017-10-31',
      billingPeriodStartDate: '2017-10-01',
      createdAt: '2017-10-01T23:53:34Z',
      updatedAt: '2017-10-01T23:53:34Z',
      currentBillingCycle: 1,
      daysPastDue: null,
      discounts: [],
      failureCount: 0,
      firstBillingDate: '2017-10-01',
      id: 'jc2qx6',
      merchantAccountId: 'myMarchandId',
      neverExpires: true,
      nextBillAmount: '9.90',
      nextBillingPeriodAmount: '9.90',
      nextBillingDate: '2017-11-01',
      numberOfBillingCycles: null,
      paidThroughDate: '2017-10-31',
      paymentMethodToken: 'cg5hvp',
      planId: 'PREMIUM',
      price: '9.90',
      status: 'Active',
      trialDuration: null,
      trialDurationUnit: null,
      trialPeriod: false,
      descriptor: { name: null, phone: null, url: null },
      description: null,
      transactions: []
      statusHistory: 
       [ { timestamp: '2017-10-01T23:53:34Z',
           status: 'Active',
           user: 'john@example.com',
           subscriptionSource: 'api',
           balance: '0.00',
           price: '9.90',
           currencyIsoCode: 'USD',
           planId: 'PREMIUM' } ] }
    */
  return {
    id: subscription.id,
    orderId: getTransactionOrderId(subscription),
    planId: subscription.planId,
    addOns: subscription.addOns,
    status: subscription.status,
    balance: subscription.balance,

        currentBillingCycle: subscription.currentBillingCycle,
    numberOfBillingCycles: subscription.numberOfBillingCycles,

        billingDayOfMonth: subscription.billingDayOfMonth,
    billingPeriodEndDate: subscription.billingPeriodEndDate,
    billingPeriodStartDate: subscription.billingPeriodStartDate,
    
    failureCount: subscription.failureCount,
    daysPastDue: subscription.daysPastDue,
    nextBillAmount: subscription.nextBillAmount,
    firstBillingDate: subscription.firstBillingDate,
    nextBillingDate: subscription.nextBillingDate,
    paidThroughDate: subscription.paidThroughDate,

    trialDuration: subscription.trialDuration,
    trialDurationUnit: subscription.trialDurationUnit,
    trialPeriod: subscription.trialPeriod,

    created: subscription.createdAt,
    updated: subscription.updatedAt
  };  
}

function getTransactionInfo(transaction) {
  /*
  {
    "id": "4ckjt5qj",
    "status": "submitted_for_settlement",
    "type": "sale",
    "currencyIsoCode": "USD",
    "amount": "99.00",
    "merchantAccountId": "myMarchandId",
    "subMerchantAccountId": null,
    "masterMerchantAccountId": null,
    "orderId": "59d1808035a77a3568e80d77",
    "createdAt": "2017-10-01T23:55:45Z",
    "updatedAt": "2017-10-01T23:55:45Z",
    "customer": {
      "id": "59b77e4f7a963d1808e3d989",
      "firstName": null,
      "lastName": null,
      "company": null,
      "email": "hthetiot@gmail.com",
      "website": null,
      "phone": null,
      "fax": null
    },
    "billing": {
      "id": null,
      "firstName": null,
      "lastName": null,
      "company": null,
      "streetAddress": null,
      "extendedAddress": null,
      "locality": null,
      "region": null,
      "postalCode": null,
      "countryName": null,
      "countryCodeAlpha2": null,
      "countryCodeAlpha3": null,
      "countryCodeNumeric": null
    },
    "refundId": null,
    "refundIds": [],
    "refundedTransactionId": null,
    "partialSettlementTransactionIds": [],
    "authorizedTransactionId": null,
    "settlementBatchId": null,
    "shipping": {
      "id": null,
      "firstName": null,
      "lastName": null,
      "company": null,
      "streetAddress": null,
      "extendedAddress": null,
      "locality": null,
      "region": null,
      "postalCode": null,
      "countryName": null,
      "countryCodeAlpha2": null,
      "countryCodeAlpha3": null,
      "countryCodeNumeric": null
    },
    "customFields": {
      "productQty": "1",
      "productId": "SUPPORT_HOUR"
    },
    "avsErrorResponseCode": null,
    "avsPostalCodeResponseCode": "I",
    "avsStreetAddressResponseCode": "I",
    "cvvResponseCode": "I",
    "gatewayRejectionReason": null,
    "processorAuthorizationCode": "SLQFZV",
    "processorResponseCode": "1000",
    "processorResponseText": "Approved",
    "additionalProcessorResponse": null,
    "voiceReferralNumber": null,
    "purchaseOrderNumber": null,
    "taxAmount": null,
    "taxExempt": false,
    "creditCard": {
      "token": "cg5hvp",
      "bin": "601111",
      "last4": "1117",
      "cardType": "Discover",
      "expirationMonth": "02",
      "expirationYear": "2020",
      "customerLocation": "US",
      "cardholderName": null,
      "imageUrl": "https://assets.braintreegateway.com/payment_method_logo/discover.png?environment=sandbox",
      "prepaid": "Unknown",
      "healthcare": "Unknown",
      "debit": "Unknown",
      "durbinRegulated": "Unknown",
      "commercial": "Unknown",
      "payroll": "Unknown",
      "issuingBank": "Unknown",
      "countryOfIssuance": "Unknown",
      "productId": "Unknown",
      "uniqueNumberIdentifier": "a9caaac657aca9d12014fbed70b9048d",
      "venmoSdk": false,
      "maskedNumber": "601111******1117",
      "expirationDate": "02/2020"
    },
    "statusHistory": [{
      "timestamp": "2017-10-01T23:55:45Z",
      "status": "authorized",
      "amount": "99.00",
      "user": "john@example.com,
      "transactionSource": "api"
    }, {
      "timestamp": "2017-10-01T23:55:45Z",
      "status": "submitted_for_settlement",
      "amount": "99.00",
      "user": "john@example.com,
      "transactionSource": "api"
    }],
    "planId": null,
    "subscriptionId": null,
    "subscription": {
      "billingPeriodEndDate": null,
      "billingPeriodStartDate": null
    },
    "addOns": [],
    "discounts": [],
    "descriptor": {
      "name": null,
      "phone": null,
      "url": null
    },
    "recurring": false,
    "channel": null,
    "serviceFeeAmount": null,
    "escrowStatus": null,
    "disbursementDetails": {
      "disbursementDate": null,
      "settlementAmount": null,
      "settlementCurrencyIsoCode": null,
      "settlementCurrencyExchangeRate": null,
      "fundsHeld": null,
      "success": null
    },
    "disputes": [],
    "authorizationAdjustments": [],
    "paymentInstrumentType": "credit_card",
    "processorSettlementResponseCode": "",
    "processorSettlementResponseText": "",
    "riskData": {
      "id": "P1G5057KVK95",
      "decision": "Approve",
      "deviceDataCaptured": false
    },
    "threeDSecureInfo": null,
    "paypalAccount": {},
    "coinbaseAccount": {},
    "applePayCard": {},
    "androidPayCard": {},
    "visaCheckoutCard": {},
    "masterpassCard": {}
  }
  */
  return {
    id: transaction.id,
    orderId: transaction.orderId,
    status: transaction.status,
    recurring: transaction.recurring,
    amount: {
      currency: transaction.currencyIsoCode,
      value: transaction.amount
    },
    created: transaction.createdAt,
    updated: transaction.updatedAt
  };  
}

function getOrderInfo(order) {
  return Object.assign({
    transactions: order.transactions.map(getTransactionInfo),
    subscriptions: order.subscriptions.map(getSubscriptionInfo)
  }, order.order_info);
}

function getSubscription(subscriptionId, gateway) {
  var deferred = q.defer();

  if (!subscriptionId) {
    deferred.reject("NoSubscriptionId");
  }

  try {
    gateway.subscription.find(subscriptionId, function (err, subscription) {
      var subscriptions = [];
      if (err) {
        deferred.reject(err);         
        } else {
          deferred.resolve(subscription);
      }
    });
  } catch (err) {
    deferred.reject(err);
  }
  return deferred.promise;
}

function voidTransaction(transaction, gateway) {
  var deferred = q.defer();
  try {
    console.info("[Offer] Void transation " + transaction.id);
            
    gateway.transaction.void(transaction.id, function (err, result) {
      if (err) {
          deferred.reject(err);
        } else {
          if (result.success) {
            deferred.resolve(result.transaction);
          } else {
            deferred.reject(result);
          } 
        }
    });
  } catch (err) {
    deferred.reject(err);
  }
  return deferred.promise;
}

function cancelSubscription (subscription, gateway) {
  var deferred = q.defer();
  try {
    console.info("[Offer] Cancel subscription " + subscription.id);

    getSubscription(subscription.id, gateway).then(function (subscription) {
      if (subscription.status === 'Active') {
        gateway.subscription.cancel(subscription.id, function (err, result) {
          if (err) {
              deferred.reject(err);
            } else {
              if (result.success) {
                deferred.resolve(result.subscription);
              } else {
                deferred.reject(result);
              } 
            }
        }); 
      } else {
          deferred.resolve(subscription);
      }
    });
  } catch (err) {
    deferred.reject(err);
  }
  return deferred.promise;
}

function voidOrder(order, gateway) {
  if (order.subscriptions.length > 0) {
    return q.all(order.subscriptions.map(function (subscription) {
      if (subscription.status === 'Active') {
        return cancelSubscription(subscription, gateway);
      } else {
        return subscription;
      }
    })).then(function (subscriptions) {
      order.subscriptions = subscriptions;
      return order.save();
    });
  } else {
    return q.all(order.transactions.map(function (transaction) {
      if (transaction.status !== 'voided') {
        return voidTransaction(transaction, gateway);
      } else {
        return transaction;
      }
    })).then(function (transactions) {
      order.transactions = transactions;
      return order.save();
    });
  }
}

function getOrCreateCustomer(customerDetails, gateway) {
  var deferred = q.defer();
  findCustomer(customerDetails, gateway).catch(function (err) {
    return createCustomer(customerDetails, gateway);
  }).then(function (customer) {
    if (
      customerDetails.email &&
        customerDetails.email !== customer.email 
    ) {
      updateCustomer(customerDetails, gateway)
          .then(deferred.resolve, deferred.reject);
    } else {
      deferred.resolve(customer);
    }
  });

  return deferred.promise;
}

function getCustomerToken(customerId, gateway, config) {
  var deferred = q.defer();
  try {
    gateway.clientToken.generate({
      customerId: customerId,
      merchantAccountId: config.braintree.merchantId,
      options: {
        failOnDuplicatePaymentMethod: config.braintree.failOnDuplicatePaymentMethod,
        verifyCard: config.braintree.payment.verifyCard,
        makeDefault: config.braintree.payment.makeDefault 
      }
    }, function (err, result) {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(result);
        }
    });   
  } catch (err) {
    deferred.reject(err);
  }
  return deferred.promise;
}

function getCustomerFromRequest(req, gateway) {

  // User interacting on behalf of customerID
  if (
    // Do we have customerId param 
    req.params.customerId &&
      // If we have user and not match customerId we will check using gateway
      // to allow authenticated user use API with provided custumerId
      (!req.user || (req.user && req.user.customerId !== req.params.customerId))
  ) {
    return getCustomerById(req.params.customerId, gateway);

    // Authenticated user
  } else if (req.user) {
    var user = req.user;

    // Authenticated user with customerId will return partial
    if (user.customerId) {
      return q.resolve({
        id: user.customerId,
        email: user.email
      });

    // Authenticated user with no customerIdwe will check using gateway
    } else {
      return getOrCreateCustomer({
        id: user.customerId,
        email: user.email
      }, gateway).then(function (customer) {
        user.customerId = customer.id;
        return user.save().then(function () {
          return customer;
        });
      });     
    }

  } else {
    return q.reject(new Error("Unauthorized"));
    // TODO Allow guest ?
    //return getPaymentClientToken({}, config);
  }
}

function getTransactionOfferDetails(transaction) {
  //console.log('getTransactionOfferDetails', transaction)
  return transaction.customFields ? {
    planId: transaction.customFields.planId,
    productQtyUsed: transaction.customFields.productQtyUsed || 0,
    productQty: transaction.customFields.productQty,
    productId: transaction.customFields.productId,
    amount: {
      currency: transaction.currencyIsoCode,
      value: transaction.amount
    }
  } : {
    planId: transaction.planId,
    productQtyUsed: null,
    productQty: null,
    productId: null,
    amount: {
      currency: transaction.statusHistory[0].currencyIsoCode,
      value: transaction.statusHistory[0].price
    }
  };
}

function syncCustomerOrderTransaction (customerId, order, transaction, orders, gateway) {

  console.log('[Offer] Check order', order.orderId);

  // Add transaction if missing
  var existingTransaction = filterByProperty(transaction.id, order.transactions, 'id');
  if (!existingTransaction) {

    console.log('[Offer] Add missing transaction', transaction.id);
    order.transactions.push(transaction);
    order.markModified('transactions');

    // Subscriptions
    if (transaction.subscriptionId) {

      return getSubscription(transaction.subscriptionId, gateway).then(function (subscription) {
        var existingSubscription = filterByProperty(transaction.subscriptionId, order.subscriptions, 'id');
        if (!existingSubscription) {
          console.log('[Offer] Add missing transaction subscription', transaction.id, subscription.id);
          delete subscription.transactions;
          order.subscriptions.push(subscription);
          order.markModified('subscriptions');
          return order.save();
        } else if (
          existingSubscription.updatedAt !== subscription.updatedAt
        ) {
          console.log('[Offer] Update transaction subscription', transaction.id, subscription.id);
          Object.assign(existingSubscription, subscription); 
          order.markModified('subscriptions');  
          return order.save();
        } else {
          return order;
        }
      });

    // From API
    } else if (order.offerDetails.planId || order.offerDetails.productId) {
      console.log('[Offer] Update order', order.orderId);
      return order.save();
    // Invalid transations
    } else {

      console.log('[Offer] Void order transaction', transaction.id);  
      return voidTransaction(transaction, gateway).then(function (){
        return order.save();
      });
    }

  // Update order
  } else if (
    existingTransaction.updatedAt !== transaction.updatedAt
  ) {

    console.log('[Offer] Update order', order.orderId);
    console.log('[Offer] Update transaction', transaction.id);
    Object.assign(existingTransaction, transaction); 
    order.markModified('transactions');

    // Subscriptions
    if (transaction.subscriptionId) {
      return getSubscription(transaction.subscriptionId, gateway).then(function (subscription) {
        var existingSubscription = filterByProperty(transaction.subscriptionId, order.subscriptions, 'id');
        if (!existingSubscription) {
          console.log('[Offer] Add missing transaction subscription', transaction.id, subscription.id);
          delete subscription.transactions;
          order.subscriptions.push(subscription);
          order.markModified('subscriptions');
          return order.save();
        } else if (
          existingSubscription.updatedAt !== subscription.updatedAt
        ) {
          console.log('[Offer] Update transaction subscription', transaction.id, subscription.id);
          Object.assign(existingSubscription, subscription); 
          order.markModified('subscriptions');  
          return order.save();
        } else {
          return order;
        }
      }); 
    } else {
      return order; 
    }
  } else {
    return order;
  }
}

function syncCustomerSubscription (customerId, subscription, orders, gateway) {

  var orderId = getTransactionOrderId(subscription),
    order = filterByProperty(orderId, orders, 'orderId') || {
      orderId: orderId,
      customerId: customerId,
      merchantAccountId: subscription.merchantAccountId,
      created: new Date(subscription.createdAt),
      offerDetails: getTransactionOfferDetails(subscription),
      transactions: [],
      subscriptions: []
    };

  // Add order if missing
  if (!filterByProperty(order.orderId, orders, 'orderId')) {
    console.log('[Offer] Add order', order.orderId);
    order = new Order(order);
    orders.push(order);
  } 

  if (subscription.transactions.length === 0) {
    var existingSubscription = filterByProperty(subscription.id, order.subscriptions, 'id');
    
    // Add subscription if missing
    if (!existingSubscription) {
      console.log('[Offer] Add missing subscription', subscription.id);
      order.subscriptions.push(subscription);
      order.markModified('subscriptions');
      return order.save();

    } else if (
      existingSubscription.updatedAt !== subscription.updatedAt
    ) {
      // Updare subscription otherwise
      console.log('[Offer] Update subscription', subscription.id);
      Object.assign(existingSubscription, subscription); 
      order.markModified('subscriptions');
      return order.save();
    } else {
      return order;
    }

  } else {
    return q.all(subscription.transactions.map(function (transaction) {
      return syncCustomerOrderTransaction(customerId, order, transaction, orders, gateway);
    }));
  }
}

function syncCustomerTransaction (customerId, transaction, orders, gateway) {

  var orderId = getTransactionOrderId(transaction),
    order = filterByProperty(orderId, orders, 'orderId') || {
      orderId: orderId,
      merchantAccountId: transaction.merchantAccountId,
      customerId: transaction.customer.id,
      created: new Date(transaction.createdAt),
      offerDetails: getTransactionOfferDetails(transaction),
      transactions: [],
      subscriptions: []
    };

  // Add order if missing
  if (!filterByProperty(order.orderId, orders, 'orderId')) {
    console.log('[Offer] Add order', order.orderId);
    order = new Order(order);
    orders.push(order);
  }

  return syncCustomerOrderTransaction(customerId, order, transaction, orders, gateway);
}

function getCustomerTransactions(customerId, gateway, config) {
  var deferred = q.defer();
  try {
    gateway.transaction.search(function (search) {
      search.customerId().is(customerId);
      //search.merchantAccountId().is(config.braintree.merchantId);
    }, function (err, searchResponse) {

      if (err) {
          deferred.reject(err);
        } else {
        var transactions = [];
        if (searchResponse.length() === 0) {
          deferred.resolve(transactions);
        } else {              
            searchResponse.each(function (err, transaction) {
              if (err) {
                deferred.reject(err);
              } else {
                transactions.push(transaction);
                if (transactions.length === searchResponse.length()) {
                  deferred.resolve(transactions);
                } 
              }
            }); 
        }
      }
    });
  } catch (err) {
    deferred.reject(err);
  }
  return deferred.promise;
}

function findPaymentMethod(paymentMethodToken, gateway) {
  var deferred = q.defer();

  try {
    gateway.paymentMethod.find(paymentMethodToken, function (err, result) { 
      if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(result);
      }
    });
  } catch (err) {
    deferred.reject(err);
  }
  return deferred.promise;
}

function getCustomerOrders(customerId, gateway, useGateway, config) {
  var deferred = q.defer();
  Order.find({ 
        customerId: customerId
    })
    .sort('-created')
    .exec(function (err, orders) {
        if (err) {
            deferred.reject(err);
        } else if (!orders) {
            deferred.reject(new Error('Failed to get orders'));
        } else {
          if (orders.length === 0 || useGateway) {
        getCustomerTransactions(customerId, gateway, config).then(function (transactions) {
          return q.all(transactions.map(function (transaction) {
            return syncCustomerTransaction(customerId, transaction, orders, gateway);
          }));
        }).then(function () {
          return getCustomerSubscriptions(customerId, gateway, config).then(function (subscriptions) {
            return q.all(subscriptions.map(function (subscription) {
              return syncCustomerSubscription(customerId, subscription, orders, gateway);
            }));
          });
        }).then(function () {
            deferred.resolve(orders);           
        }, deferred.reject);
          } else {

            orders.sort(function(a, b) {
                // Turn your strings into dates, and then subtract them
                // to get a value that is either negative, positive, or zero.
                return b.created - a.created;
              });

            deferred.resolve(orders);       
          }
        }
    }); 
  return deferred.promise;
}

function getCustomerOrder(customerId, orderId, gateway, useGateway, config) {
  var deferred = q.defer();
  Order.findOne({ 
        orderId: orderId
    }, function (err, order) {
      if (err) {
        deferred.reject(err);
      } else if (order) {
        deferred.resolve(order);
      } else {
        getCustomerOrders(customerId, gateway, useGateway, config).then(function (orders) {
        var order = orders.filter(function (order) {
          return order.orderId === orderId && 
              (!customerId || order.customerId === customerId);
        })[0];

        if (order) {
          deferred.resolve(order);
        } else {
          deferred.reject(new Error("OrderNotFound"));
        }
      });
      }
    });
  return deferred.promise;
}

function getCustomerSubscriptions(customerId, gateway, config) {
  var deferred = q.defer();
  // TODO use local first
  try {
    gateway.subscription.search(function (search) {
      search.merchantAccountId().is(config.braintree.merchantAccountId);
      //search.status().is(braintree.Subscription.Status.Active);
      //search.status().is(braintree.Subscription.Status.Canceled);
    }, function (err, searchResponse) {

      if (err) {
          deferred.reject(err);
        } else {
        var subscriptions = [],
          subscriptionChecked = 0;

        if (searchResponse.length() === 0) {
          deferred.resolve(subscriptions);
        } else {              
            searchResponse.each(function (err, subscription) {
              if (err) {
                deferred.reject(err);
              } else {

                var findOrderPromise;
                if (subscription.paymentMethodToken) {
                  // Check customer associated with subscription paymentMethodToken
                  findOrderPromise = findPaymentMethod(subscription.paymentMethodToken, gateway);
                } else {
                  // Check orders
                  findOrderPromise = getCustomerOrder(null, subscription.id, gateway, false, config);
                }
                
                findOrderPromise.then(function (result) {
                  subscriptionChecked++;
                if (result.customerId === customerId) {
                    subscriptions.push(subscription); 
                  }
              }).catch(function (err) {
                subscriptionChecked++;
                // Ignore missing order
              }).then(function () {
                if (subscriptionChecked === searchResponse.length()) {

                  subscriptions.sort(function(a, b) {
                          // Turn your strings into dates, and then subtract them
                          // to get a value that is either negative, positive, or zero.
                          return new Date(b.updatedAt) - new Date(a.updatedAt);
                        });

                    deferred.resolve(subscriptions);
                  }
              });
              }
            }); 
        }
      }
    });
  } catch (err) {
    deferred.reject(err);
  }
  return deferred.promise;
}
function cancelCustomerOrder(customerId, orderId, gateway, useGateway, config) {
  return getCustomerOrder(customerId, orderId, gateway, useGateway, config).then(function (order) {
    return voidOrder(order, gateway);
  });
}

function createTransaction(order, paymentMethodNonce, gateway, config, riskData) {
  var transactionConfig = config.braintree && config.braintree.transaction; 
  var deferred = q.defer();
  try {

    gateway.transaction.sale({
      orderId: order.orderId,
      customerId: order.customerId,
      paymentMethodNonce: paymentMethodNonce,
      amount: order.offerDetails.amount.value,
      riskData: {
        customerIp: riskData.customerIp,
        customerBrowser: riskData.customerBrowser
      },
      options: {
        submitForSettlement: transactionConfig.submitForSettlement,
          storeInVaultOnSuccess: transactionConfig.storeInVaultOnSuccess
      },
      // https://articles.braintreepayments.com/control-panel/custom-fields#creating-a-custom-field
      customFields: {
        product_id: order.offerDetails.productId,
        product_qty: order.offerDetails.productQty,
        product_qty_used: order.offerDetails.productQtyUsed,
      }
    }, function (err, result) {
        if (err) {
          deferred.reject(err);
        } else {
          if (result.success) {
            deferred.resolve(result.transaction);
          } else {
            deferred.reject(result);
          }
        }
    });   
  } catch (err) {
    deferred.reject(err);
  }

  return deferred.promise;
}

function saveOrderPaymentMethod(order, paymentMethodNonce, gateway, config, riskData) {
  return getCustomerById(order.customerId, gateway).then(function (customer) {
    order.customerDetails = getCustomerInfo(customer);
    order.markModified('customerDetails');
    return order.save().then(function () {
      var deferred = q.defer();

      try {

        gateway.paymentMethod.create({
          customerId: order.customerId,
          paymentMethodNonce: paymentMethodNonce,
          options: {
            verifyCard: config.braintree.payment.verifyCard,
            makeDefault: config.braintree.payment.makeDefault
          }
        }, function (err, result) { 
          if (err) {
              deferred.reject(err);
            } else {
              if (result.success) {
                deferred.resolve(result); 
              } else {
                deferred.reject(result);
              }         
          }
        }); 

      } catch (err) {
        deferred.reject(err);
      }

      return deferred.promise;
    });
  });
}

function createSubscription(order, paymentMethodNonce, gateway, config, riskData) {
  var subscriptionConfig = config.braintree && config.braintree.subscription; 
  return saveOrderPaymentMethod(order, paymentMethodNonce, gateway, config).then(function (paymentMethodResult) {
    var deferred = q.defer();
    try {
      gateway.subscription.create({
        id: order.orderId,
        planId: order.offerDetails.planId,
        paymentMethodToken: paymentMethodResult.creditCard.token, 
          options: {
          startImmediately: subscriptionConfig.startImmediately
        }
      }, function (err, result) {
        if (err) {
            deferred.reject(err);
          } else {
            if (result.success) {
              deferred.resolve(result.subscription);
            } else {
              deferred.reject(result);
            }
          }
      }); 
    } catch (err) {
      deferred.reject(err);
    }
    return deferred.promise;
  });
}

function checkoutPaymentOrder(order, paymentMethodNonce, gateway, config, riskData) {

  if (!order) {
    return q.reject(new Error("InvalidOrder"));
  } else if (!order.id) {
    return q.reject(new Error("InvalidOrderId"));
  }

  if (order.offerDetails.planId) {
    return createSubscription(order, paymentMethodNonce, gateway, config, riskData);
  } else if (order.offerDetails.productId) {
    return createTransaction(order, paymentMethodNonce, gateway, config, riskData);
  } else {
    return q.reject(new Error("InvalidOrderOfferDetails"));
  }
}

//
// Notifications
//

function sendTransactionReceiptEmail(order, customer, transaction, config) {
  // Welcome email
    var emailConfig = config.email,
        appConfig = config.app,
        templateName = 'offer_receipt',
        templateData = {
          order: order,
            customer: customer,
          transaction: transaction
        },
        emailObj = {
            // Comma separated list of recipients
            to: formatEmailName(customer.email customer.name),
            // ReplyTo info
            replyTo: formatEmailName(emailConfig.billing, appConfig.title),   
            // Sender info
            from: formatEmailName(emailConfig.billing, appConfig.title),      
            headers: {
                "X-MC-Important": "true"
            }
        };

    return sendEmailTemplate(templateName, templateData, emailObj, config, emailConfig);
}

function sendPurchaseEmail(order, customer, transaction, config) {
    // Welcome email
    var emailConfig = config.email,
        appConfig = config.app,
        templateName = 'offer_purchase',
        templateData = {
          order: order,
            customer: customer,
            transaction: transaction
        },
        emailObj = {
            // Comma separated list of recipients
            to: formatEmailName(customer.email customer.name),
            // ReplyTo info
            replyTo: formatEmailName(emailConfig.billing, appConfig.title),   
            // Sender info
            from: formatEmailName(emailConfig.billing, appConfig.title),       
            headers: {
                "X-MC-Important": "true"
            }
        };

    return sendEmailTemplate(templateName, templateData, emailObj, config, emailConfig);
}

function sendSubscriptionEmail(order, customer, subscription, config) {
    // Welcome email
    var emailConfig = config.email,
        appConfig = config.app,
        templateName = 'offer_subscription',
        templateData = {
          order: order,
            customer: customer,
            subscription: subscription
        },
        emailObj = {
            // Comma separated list of recipients
            to: formatEmailName(customer.email customer.name),  
            // ReplyTo info
            replyTo: formatEmailName(emailConfig.billing, appConfig.title),   
            // Sender info
            from: formatEmailName(emailConfig.billing, appConfig.title),       
            headers: {
                "X-MC-Important": "true"
            }
        };

    return sendEmailTemplate(templateName, templateData, emailObj, config, emailConfig);
}

function sendOrderEmail(order, customer, config) {
  if (order.subscriptions[0]) {
    return sendSubscriptionEmail(order, customer, order.subscriptions[0], config);
  } else if (order.transactions[0]) {
    return sendPurchaseEmail(order, customer, order.transactions[0] ,config);
  } else {
    return q.rejec(new Error('MissingOrderSubscriptionsOrTransactions'));
  }
}

//
// Offers routes
//

exports.getOffers = function (req, res, next) {
    var config = req.app.get('config');
  res.status(200);
  res.json(offers.filter(function (offer) {
    return offer.enable;
  }).map(getOfferInfo));
};

exports.getOffer = function (req, res, next) {
    var config = req.app.get('config');
  getOffer(req.params.offerId).then(function (offer) {
    res.status(200);
    res.json(getOfferInfo(offer));
  }, function (err) {
    res.status(404);
    next(err);
  });
};

//
// Customer route
//

// /!\ No gateway pls
function getCustomerOffersDetails(customerId, config) {
  var deferred = q.defer();

  deferred.resolve({
    updated: Date.now()
  }); 

  //deferred.reject(err);
  return deferred.promise;
}

exports.getCustomer = function (req, res, next) {

    var config = req.app.get('config');

  getPaymentGateway(config).then(function (gateway) {
    return getCustomerFromRequest(req, gateway).then(function (customer) {
      return getCustomerOffersDetails(customer.id).then(function (offersDetails) {
        return {
          customerId: customer.id,
          offersDetails: offersDetails
        };
      });
    }).then(function (result) {
      res.status(203);
      res.json(result);
    }, function (err) {
      res.status(401);
      next(err);
    });
  }).catch(function (err) {
    res.status(502);
    next(err);
  });
};

exports.getCustomerDetails = function (req, res, next) {

    var config = req.app.get('config');

  getPaymentGateway(config).then(function (gateway) {
    return getCustomerFromRequest(req, gateway).then(function (customer) {
        return getCustomerToken(customer.id, gateway, config).then(function (result) {
        return {
          customerDetails: getCustomerInfo(customer),
          clientToken: result.clientToken
        };
      }).then(function (result) {
        res.status(201);
        res.json(result);
      }, function (err) {
        res.status(502);
        next(err);
      });
    }, function (err) {
      res.status(401);
      next(err);
    });
  }).catch(function (err) {
    res.status(502);
    next(err);
  });
};

exports.getCustomerOrders = function (req, res, next) {

    var config = req.app.get('config'),
      customerId = req.params.customerId,
      useGateway = req.query.useGateway === '1';

  getPaymentGateway(config).then(function (gateway) {
    return getCustomerOrders(customerId, gateway, useGateway, config).then(function (orders) {
      return orders.map(getOrderInfo);
    });
  }).then(function (result) {
    res.status(useGateway ? 200 : 203);
    res.json(result);
  }).catch(function (err) {
    res.status(502);
    next(err);
  });
};

function renderOrderInvoice(res, order, format, config) {
  var deferred = q.defer();
  try { 

    var path = require('path');

    var template = order.subscriptions.length > 0 ? 'offer_subscription' : 'offer_purchase',
      templateDir = path.join(config.resourcesPath, 'email', template),
      templatePath = path.join(templateDir, format || 'text');

    var mimetype = format === 'html' ? 'text/html' : 'text/plain';
    res.setHeader('Content-type', mimetype);
    res.render(templatePath, {
          order: order,
          subscription: order.subscriptions[0],
          transaction: order.transactions[0],
          customer: order.customerDetails,
          app: config.app
      });
      res.end();

    deferred.resolve(res);

  } catch (err) {
    deferred.reject(err);
  }

  return deferred.promise;
}

function renderOrderPdfInvoice(res, order, config) {
  var deferred = q.defer();
      
  try {
    var path = require('path');
    var pug = require('pug');
    var PdfPrinter = require('pdfmake/src/printer');
    
    var template = order.subscriptions.length > 0 ? 'offer_subscription' : 'offer_purchase',
      fontsDir = path.join(config.resourcesPath, 'fonts'),
      RobotoFontDir = path.join(fontsDir, 'roboto'),
      templateDir = path.join(config.resourcesPath, 'email', template),
      templateFilePath =templateDir + '/text.pug';

    var defaultClientFonts = {
      Roboto: {
        normal: RobotoFontDir + '/Roboto-Regular.ttf',
        bold: RobotoFontDir + '/Roboto-Medium.ttf',
        italics: RobotoFontDir + '/Roboto-Italic.ttf',
        bolditalics: RobotoFontDir + '/Roboto-MediumItalic.ttf'
      }
    };

    var printer = new PdfPrinter(defaultClientFonts);

    var filename = [config.app.title, '- Order #',order.orderId, ".pdf"].join(''),
      mimetype = 'application/pdf',
      pdfDoc = printer.createPdfKitDocument({
        content: [
            pug.compileFile(templateFilePath)({
                order: order,
                subscription: order.subscriptions[0],
                transaction: order.transactions[0],
                customer: order.customerDetails,
                app: config.app
            })
        ]
      });

    // https://pugjs.org/api/reference.html
    //res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', mimetype);

    pdfDoc.pipe(res);
    pdfDoc.end(); 

    deferred.resolve(res);

  } catch (err) {
    deferred.reject(err);
  }

  return deferred.promise;
}

exports.getCustomerOrder = function (req, res, next) {

    var config = req.app.get('config'),
      customerId = req.params.customerId,
      orderId = req.params.orderId,
      showInvoice = req.query.showInvoice === '1',
      invoiceFormat = req.query.invoiceFormat,
      downloadInvoice = req.query.downloadInvoice === '1',
      sendEmail = req.query.sendEmail === '1',
      useGateway = req.query.useGateway === '1';

  getPaymentGateway(config).then(function (gateway) {
    return getCustomerOrder(customerId, orderId, gateway, useGateway, config).then(function (order) {
      if (order) {

        // Fix possible missing billingDetails
        // TODO remove or use config anyway ?
        order.billingDetails = order.billingDetails || config.payment.billing;

        if (order.customerId !== customerId) {
          res.status(401);
          next();
        } else if (downloadInvoice || invoiceFormat === 'pdf') {
          renderOrderPdfInvoice(res, order, config).then(function (res) {
                  }, function (err) {
                    next(err);
                  });
        } else if (showInvoice || invoiceFormat === 'text' || invoiceFormat === 'html') {
          renderOrderInvoice(res, order, invoiceFormat, config).then(function (invoice) {
                  }, function (err) {
                    next(err);
                  });
        } else if (sendEmail) {
                  sendOrderEmail(order, order.customerDetails, config).then(function (mail) {
                    res.status(201);
            res.json(mail); 
                  }, function (err) {
                    next(err);
                  });
        } else {
          res.status(useGateway ? 200 : 203);
          res.json(getOrderInfo(order));  
        }
      } else {
        res.status(404);
        next();
      }
    });
  }).catch(function (err) {
    res.status(502);
    next(err);
  });
};

exports.cancelCustomerOrder = function (req, res, next) {

  var config = req.app.get('config'),
      customerId = req.params.customerId,
      orderId = req.params.orderId,
      useGateway = req.query.useGateway === '1';

  getPaymentGateway(config).then(function (gateway) {
    return cancelCustomerOrder(customerId, orderId, gateway, useGateway, config).then(function (order) {
      if (order) {
        res.status(205);
        res.json(getOrderInfo(order));
      } else {
        res.status(404);
        next();
      }
    });
  }).catch(function (err) {
    res.status(502);
    next(err);
  });
};

exports.getCustomerOffers = function (req, res, next) {

    var config = req.app.get('config'),
      customerId = req.params.customerId,
      useGateway = req.query.useGateway === '1';

  getPaymentGateway(config).then(function (gateway) {
    return getCustomerOrders(customerId, gateway, useGateway, config).then(function (orders) {
      return orders.map(function (order) {
        var offerInfo = {
          orderId: order.orderId,
          created: order.created,
          updated: order.updated,
          status: order.status
        };  

        Object.assign(offerInfo, getOfferInfo(order.offerDetails));

        return offerInfo;
      });
    });
  }).then(function (result) {
    res.status(useGateway ? 200 : 203);
    res.json(result);
  }).catch(function (err) {
    res.status(502);
    next(err);
  });
};

exports.getCustomerOffer = function (req, res, next) {

  var config = req.app.get('config'),
      offerId = req.params.offerId,
      customerId = req.params.customerId,
      useGateway = req.query.useGateway === '1';

  getPaymentGateway(config).then(function (gateway) {
    return getOffer(offerId).then(function (offer) {
      return getCustomerFromRequest(req, gateway).then(function (customer) {
        return getCustomerOrders(customer.id, gateway, useGateway, config).then(function (orders) {
          var offerInfos = orders.filter(function (order) {
            return offer.planId ? order.offerDetails.planId === offer.planId :
              order.offerDetails.productId === offer.productId;
          }).map(function (order) {
            var offerInfo = {
              orderId: order.orderId,
              created: order.created,
              updated: order.updated,
              status: order.status,
              subscriptions: order.subscriptions.map(getSubscriptionInfo)
            };  

            Object.assign(offerInfo, getOfferInfo(order.offerDetails));

            return offerInfo;
          });

          if (offerInfos) {
            res.status(useGateway ? 200 : 203);
            res.json(offerInfos);
          } else {
            res.status(404);
            next();
          }
        });
      });
    }, function (err) {
      res.status(404);
      next(err);
    });
  }).catch(function (err) {
    res.status(502);
    next(err);
  });
};

exports.getCustomerPlans = function (req, res, next) {

    var config = req.app.get('config'),
      customerId = req.params.customerId,
      useGateway = req.query.useGateway === '1';

  getPaymentGateway(config).then(function (gateway) {
    return getCustomerFromRequest(req, gateway).then(function (customer) {
      return getCustomerOrders(customer.id, gateway, useGateway, config).then(function (orders) {

        var planInfos = orders.filter(function (order) {
          return !!order.offerDetails.planId;
        }).map(function (order) {
          var planInfo = {
            orderId: order.orderId,
            created: order.created,
            updated: order.updated,
            status: order.status
          };  

          Object.assign(planInfo, getOfferInfo(order.offerDetails));

          return planInfo;
        });

        if (planInfos) {
          res.status(203);
          res.json(planInfos);
        } else {
          res.status(404);
          next();
        }
      });
    });
  }).catch(function (err) {
    res.status(502);
    next(err);
  });
};

exports.getCustomerTransactions = function (req, res, next) {

    var config = req.app.get('config'),
      customerId = req.params.customerId;

  getPaymentGateway(config).then(function (gateway) {
    return getCustomerFromRequest(req, gateway).then(function (customer) {
      return getCustomerTransactions(customer.id, gateway, config);
    });
  }).then(function (result) {
    res.status(201);
    res.json(result.map(getTransactionInfo));
  }).catch(function (err) {
    res.status(502);
    next(err);
  });
};

exports.getCustomerSubscriptions = function (req, res, next) {

    var config = req.app.get('config'),
      customerId = req.params.customerId;

  getPaymentGateway(config).then(function (gateway) {
    return getCustomerFromRequest(req, gateway).then(function (customer) {
      return getCustomerSubscriptions(customer.id, gateway, config);
    });
  }).then(function (result) {
    res.status(201);
    res.json(result.map(getSubscriptionInfo));
  }).catch(function (err) {
    res.status(502);
    next(err);
  });
};

//
// Payment
//

function createOrder(orderDetails, result) {
  var deferred = q.defer();
  var order = new Order(orderDetails);
    order.save(function (err, order) {
        if (err) {
            deferred.reject(err);
        } else if (!order) {
            deferred.reject(new Error('Failed to create order'));
        } else {
            deferred.resolve(order);
        }
    });
  return deferred.promise;
}

function updateOrder(order, result) {
  var deferred = q.defer();

  try {
    var lastTransaction;
    if (result.transactions) {
      result.transactions.forEach(function (transaction) {
        order.transactions.push(transaction);

        // TODO sort by date to be sure
        lastTransaction = transaction;
      });

      delete result.transactions;
      order.subscriptions.push(result);
    } else {
      lastTransaction = result;
      order.transactions.push(result);
    }

    if (lastTransaction) {
      order.customerId = lastTransaction.customer.id;
      order.customerDetails = getCustomerInfo(lastTransaction.customer);
      order.merchantAccountId = lastTransaction.merchantAccountId;  
    }

      order.save(function (err, order) {
          if (err) {
              deferred.reject(err);
          } else if (!order) {
              deferred.reject(new Error('Failed to create order'));
          } else {
              deferred.resolve(order);
          }
      });
  } catch (err) {
    deferred.reject(err);
  }
  return deferred.promise;
}

function getReqRemoteAddr(req) {
    return req.headers['x-real-ip'] || 
                req.headers['x-forwarded-for'] || 
                    req.connection.remoteAddress;
}

function getRiskDataFromRequest (req) {
  return {
    customerIp: getReqRemoteAddr(req),
    customerBrowser: req.header('user-agent')
  };
}

exports.checkoutPaymentOffer = function (req, res, next) {

    // Configure
    var config = req.app.get('config'),
      paymentConfig = config.payment,
      billingDetails = paymentConfig.billing,
      user = req.user,
      offerId = req.body.offerId,
      customerId = req.body.customerId,
      paymentMethodNonce = req.body.paymentMethodNonce;

  if (!paymentConfig.enable) {
    res.status(503);
    return;
  }

  return getOffer(offerId).then(function (offer) {
    return getPaymentGateway(config).then(function (gateway) {
      return getCustomerFromRequest(req, gateway).then(function (customer) {
        return createOrder({
          customerId: customer.id,
          merchantAccountId: config.braintree.merchantId,
          customerDetails: getCustomerInfo(customer),
          offerDetails: getOfferInfo(offer),
          billingDetails: billingDetails
          }).then(function (order) {
            var riskData = getRiskDataFromRequest(req);
          return checkoutPaymentOrder(order, paymentMethodNonce, gateway, config, riskData).then(function (result) {
            return updateOrder(order, result).then(function () {
              // Update only if missing
              if (!user.customerId) {
                user.customerId = order.customerId;
                return req.user.save().then(function () {
                  res.status(201)
                            .json(getOrderInfo(order));
                });
              } else {
                res.status(201)
                          .json(getOrderInfo(order));
              }

              // TODO use scheduler instead
                      sendOrderEmail(order, order.customerDetails, config).then(function (mail) {
                        console.info("[Offer] Email sent for orderId " + order.orderId);
                      }, function (err) {
                        console.error("[Offer] Unable to send email orderId " + order.orderId, err);
                      }); 

            }).catch(function (err) {
                return voidOrder(order, gateway).then(function () {
                res.status(402);
                next(err);
                }, next);
            });
          });
        }).catch(function (err) {
          res.status(406);
          next(err);
        });
      }).catch(function (err) {
        res.status(401);
        next(err);
      });
    }).catch(function (err) {
      res.status(502);
      next(err);
    });
  }).catch(function (err) {
    res.status(404);
    next(err);
  });
};

exports.updatePaymentOffer = function (req, res, next) {
  // Configure
    var config = req.app.get('config'),
      paymentConfig = config.payment,
      billingDetails = paymentConfig.billing,
      useGateway = req.query.useGateway === '1',
      user = req.user,
      orderId = req.params.orderId,
      customerId = req.body.customerId,
      paymentMethodNonce = req.body.paymentMethodNonce;

  if (!paymentConfig.enable) {
    res.status(503);
    return;
  }

  return getPaymentGateway(config).then(function (gateway) {
    return getCustomerOrder(customerId, orderId, gateway, useGateway, config).then(function (order) {
      return saveOrderPaymentMethod(order, paymentMethodNonce, gateway, config).then(function () {
        // TODO update transation and subscription.
        res.status(202)
                  .json(getOrderInfo(order));
      });
    }, function (err) {
      res.status(406);
      next(err);
    });
  }).catch(function (err) {
    res.status(502);
    next(err);
  });
};

function parseNotification(webhookNotification, gateway, useGateway, config) {

  var deferred = q.defer();
  try {
    gateway.webhookNotification.parse(
        webhookNotification.bt_signature,
        webhookNotification.bt_payload,
      function (err, webhookNotification) {
          if (err) {
            deferred.reject(err);
          } else {

          console.info("[Offer Webhook] Kind: " + webhookNotification.kind);

            if (webhookNotification.kind === braintree.WebhookNotification.Kind.Check) {
              deferred.resolve(webhookNotification);
              return;
            }


            // TODO transaction_ids
            var hasSubscription = webhookNotification.subscription,
              hasTransation = webhookNotification.transaction;

            if (!hasSubscription && !hasTransation) {
              deferred.reject(new Error('InvalidNotification'));
              return;
            }

            var orderId = hasSubscription ? webhookNotification.subscription.id : webhookNotification.transaction.orderId,
              customerId = hasSubscription ? null : webhookNotification.transaction.customer.id;

          getCustomerOrder(customerId, orderId, gateway, false, config).then(function (order) {

            console.info("[Offer Webhook] Sync order with orderId " + orderId);

            if (webhookNotification.subscription) {
              return syncCustomerSubscription(customerId, webhookNotification.subscription, [order], gateway);
            } else if (webhookNotification.transaction) {
              return syncCustomerTransaction(customerId, webhookNotification.transaction, [order], gateway);              
            }
          }).then(deferred.resolve, deferred.reject);
          }
        }
      );
  } catch (err) {
    deferred.reject(err);
  }
  return deferred.promise;
}

exports.callbackTest = function (req, res, next) {
  // Configure
    var config = req.app.get('config'),
      useGateway = req.query.useGateway === '1';

  return getPaymentGateway(config).then(function (gateway) {
    var sampleNotification = gateway.webhookTesting.sampleNotification(
      braintree.WebhookNotification.Kind.Check
    );
    return parseNotification(sampleNotification, gateway, useGateway, config);
  }).catch(function (err) {
    res.status(502);
    next(err);
  });
};

exports.callback = function (req, res, next) {
  // Configure
    var config = req.app.get('config'),
      useGateway = req.query.useGateway === '1';

  return getPaymentGateway(config).then(function (gateway) {
    return parseNotification(req.body, gateway, useGateway, config);
  }).catch(function (err) {
    res.status(502);
    next(err);
  });
};

/* global exports, require */
var offersService = require('./../services/offers');


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

  return offersService.offer.get(offerId).then(function (offer) {
    return offersService.gateway.get(config).then(function (gateway) {
      return offersService.customer.getFromRequest(req, gateway).then(function (customer) {
        return offersService.order.create({
            customerId: customer.id,
            merchantAccountId: config.braintree.merchantId,
            customerDetails: offersService.customer.getInfo(customer),
            offerDetails: offersService.offer.getInfo(offer),
            billingDetails: billingDetails
          }).then(function (order) {
          var riskData = getRiskDataFromRequest(req);
          return offersService.payment.checkoutPaymentOrder(order, paymentMethodNonce, gateway, config, riskData).then(function (result) {
            return offersService.order.update(order, result).then(function () {
              // Update only if missing
              if (!user.customerId) {
                user.customerId = order.customerId;
                return req.user.save().then(function () {
                  res.status(201)
                      .json(offersService.order.getInfo(order));
                });
              } else {
                res.status(201)
                    .json(offersService.order.getInfo(order));
              }

              // TODO use scheduler instead
              offersService.invoice.sendOrderEmail(order, order.customerDetails, config).then(function (mail) {
                console.info("[Offer] Email sent for orderId " + order.orderId);
              }, function (err) {
                console.error("[Offer] Unable to send email orderId " + order.orderId, err);
              }); 

            }).catch(function (err) {
                return offersService.order.void(order, gateway).then(function () {
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

  return offersService.gateway.get(config).then(function (gateway) {
    return offersService.customer.getOrder(customerId, orderId, gateway, useGateway, config).then(function (order) {
      return offersService.payment.saveOrderPaymentMethod(order, paymentMethodNonce, gateway, config).then(function () {
        // TODO update transation and subscription.
        res.status(202)
            .json(offersService.order.getInfo(order));
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

exports.callbackTest = function (req, res, next) {
  // Configure
    var config = req.app.get('config'),
      useGateway = req.query.useGateway === '1';

  return offersService.gateway.get(config).then(function (gateway) {
    // TODO  gateway.sampleNotification
    var braintree = require('braintree');
    var sampleNotification = gateway.webhookTesting.sampleNotification(
      braintree.WebhookNotification.Kind.Check
    );
    return offersService.payment.parseNotification(sampleNotification, gateway, useGateway, config);
  }).catch(function (err) {
    res.status(502);
    next(err);
  });
};

exports.callback = function (req, res, next) {
  // Configure
    var config = req.app.get('config'),
      useGateway = req.query.useGateway === '1';

  return offersService.gateway.get(config).then(function (gateway) {
    return offersService.payment.parseNotification(req.body, gateway, useGateway, config);
  }).catch(function (err) {
    res.status(502);
    next(err);
  });
};
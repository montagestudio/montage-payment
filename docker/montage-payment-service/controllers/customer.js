/* global exports, require */
var offersService = require('./../services/offers');

exports.getCustomer = function(req, res, next) {

    var config = req.app.get('config');

    offersService.gateway.get(config).then(function(gateway) {
        return offersService.customer.getFromRequest(req, gateway).then(function(customer) {
            return offersService.customer.getOffersDetails(customer.id).then(function(offersDetails) {
                return {
                    customerId: customer.id,
                    offersDetails: offersDetails
                };
            });
        }).then(function(result) {
            res.status(203);
            res.json(result);
        }, function(err) {
            res.status(401);
            next(err);
        });
    }).catch(function(err) {
        res.status(502);
        next(err);
    });
};

exports.getCustomerDetails = function(req, res, next) {

    var config = req.app.get('config');

    offersService.gateway.get(config).then(function(gateway) {
        return offersService.customer.getFromRequest(req, gateway).then(function(customer) {
            return offersService.customer.getToken(customer.id, gateway, config).then(function(result) {
                return {
                    customerDetails: offersService.customer.getInfo(customer),
                    clientToken: result.clientToken
                };
            }).then(function(result) {
                res.status(201);
                res.json(result);
            }, function(err) {
                res.status(502);
                next(err);
            });
        }, function(err) {
            res.status(401);
            next(err);
        });
    }).catch(function(err) {
        res.status(502);
        next(err);
    });
};

exports.getCustomerOrders = function(req, res, next) {

    var config = req.app.get('config'),
        customerId = req.params.customerId,
        useGateway = req.query.useGateway === '1';

    offersService.gateway.get(config).then(function(gateway) {
        return offersService.customer.getOrders(customerId, gateway, useGateway, config).then(function(orders) {
            return orders.map(offersService.order.getInfo);
        });
    }).then(function(result) {
        res.status(useGateway ? 200 : 203);
        res.json(result);
    }).catch(function(err) {
        res.status(502);
        next(err);
    });
};

exports.getCustomerOrder = function(req, res, next) {

    var config = req.app.get('config'),
        customerId = req.params.customerId,
        orderId = req.params.orderId,
        showInvoice = req.query.showInvoice === '1',
        invoiceFormat = req.params.invoiceFormat || req.query.invoiceFormat,
        downloadInvoice = req.query.downloadInvoice === '1',
        sendEmail = req.query.sendEmail === '1',
        useGateway = req.query.useGateway === '1';

    offersService.gateway.get(config).then(function(gateway) {
        return offersService.customer.getOrder(customerId, orderId, gateway, useGateway, config).then(function(order) {
            if (order) {

                // Fix possible missing billingDetails
                // TODO remove or use config anyway ?
                order.billingDetails = order.billingDetails || config.payment.billing;

                if (order.customerId !== customerId) {
                    res.status(401);
                    next();
                } else if (downloadInvoice || invoiceFormat === 'pdf') {
                    offersService.invoice.renderOrderPdfInvoice(res, order, config).then(function(res) {}, function(err) {
                        next(err);
                    });
                } else if (showInvoice || invoiceFormat === 'text' || invoiceFormat === 'html') {
                    offersService.invoice.renderOrderInvoice(res, order, invoiceFormat, config).then(function(invoice) {}, function(err) {
                        next(err);
                    });
                } else if (sendEmail) {
                    offersService.invoice.sendOrderEmail(order, order.customerDetails, config).then(function(mail) {
                        res.status(201);
                        res.json(mail);
                    }, function(err) {
                        next(err);
                    });
                } else {
                    res.status(useGateway ? 200 : 203);
                    res.json(offersService.order.getInfo(order));
                }
            } else {
                res.status(404);
                next();
            }
        });
    }).catch(function(err) {
        res.status(502);
        next(err);
    });
};

exports.cancelCustomerOrder = function(req, res, next) {

    var config = req.app.get('config'),
        customerId = req.params.customerId,
        orderId = req.params.orderId,
        useGateway = req.query.useGateway === '1';

    offersService.gateway.get(config).then(function(gateway) {
        return offersService.customer.cancelOrder(customerId, orderId, gateway, useGateway, config).then(function(order) {
            if (order) {
                res.status(205);
                res.json(offersService.order.getInfo(order));
            } else {
                res.status(404);
                next();
            }
        });
    }).catch(function(err) {
        res.status(502);
        next(err);
    });
};

exports.getCustomerOffers = function(req, res, next) {

    var config = req.app.get('config'),
        customerId = req.params.customerId,
        useGateway = req.query.useGateway === '1';

    offersService.gateway.get(config).then(function(gateway) {
        return offersService.customer.getFromRequest(req, gateway).then(function(customer) {
            return offersService.customer.getOffers(customerId, gateway, useGateway, config).then(function(result) {
                res.status(useGateway ? 200 : 203);
                res.json(result.map(offersService.order.getOfferInfo));
            });
        }, function(err) {
            res.status(401);
            next(err);
        });
    }).catch(function(err) {
        res.status(502);
        next(err);
    });
};

exports.getCustomerOffer = function(req, res, next) {

    var config = req.app.get('config'),
        offerId = req.params.offerId,
        customerId = req.params.customerId,
        useGateway = req.query.useGateway === '1';

    offersService.gateway.get(config).then(function(gateway) {
        return offersService.customer.getFromRequest(req, gateway).then(function(customer) {
            return offersService.customer.getOffer(customer.id, offerId, gateway, useGateway, config).then(function(result) {
                res.status(useGateway ? 200 : 203);
                res.json(result.map(offersService.order.getOfferInfo));
            }, function (err) {
                res.status(404);
                next(err);
            });
        }, function(err) {
            res.status(401);
            next(err);
        });
    }).catch(function(err) {
        res.status(502);
        next(err);
    });
};

exports.getCustomerPlans = function(req, res, next) {

    var config = req.app.get('config'),
        customerId = req.params.customerId,
        useGateway = req.query.useGateway === '1';

    offersService.gateway.get(config).then(function(gateway) {
        return offersService.customer.getFromRequest(req, gateway).then(function(customer) {
            return offersService.customer.getPlans(customerId, gateway, useGateway, config).then(function(result) {
                res.status(useGateway ? 200 : 203);
                res.json(result.map(offersService.order.getOfferInfo));
            });
        }, function(err) {
            res.status(401);
            next(err);
        });
    }).catch(function(err) {
        res.status(502);
        next(err);
    });
};

exports.getCustomerTransactions = function(req, res, next) {

    var config = req.app.get('config'),
        customerId = req.params.customerId;

    offersService.gateway.get(config).then(function(gateway) {
        return offersService.customer.getFromRequest(req, gateway).then(function(customer) {
            return offersService.customer.getTransactions(customer.id, gateway, config).then(function(result) {
                res.status(200);
                res.json(result.map(offersService.transaction.getInfo));
            });
        }, function(err) {
            res.status(401);
            next(err);
        });
    }).catch(function(err) {
        res.status(502);
        next(err);
    });
};

exports.getCustomerSubscriptions = function(req, res, next) {

    var config = req.app.get('config'),
        customerId = req.params.customerId;

    offersService.gateway.get(config).then(function(gateway) {
        return offersService.customer.getFromRequest(req, gateway).then(function(customer) {
            return offersService.customer.getSubscriptions(customer.id, gateway, config).then(function(result) {
                res.status(200);
                res.json(result.map(offersService.subscription.getInfo));
            });
        }, function(err) {
            res.status(401);
            next(err);
        });
    }).catch(function(err) {
        res.status(502);
        next(err);
    });
};
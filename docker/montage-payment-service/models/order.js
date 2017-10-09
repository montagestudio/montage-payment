/*global require, exports */
'use strict';

var mongoose = require('mongoose');
var jsonschema = require('jsonschema');

var jsonSchemaValidate = jsonschema.validate;
var Schema = mongoose.Schema;

var offerDetailsSchema =  {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "id": "/offerDetails",
    "type": "object"
};

var customerDetailsSchema =  {
    "$schema": "http://json-schema.org/draft-04/schema#",
    "id": "/customerDetails",
    "type": "object"
};

var transactionValidStatus = ['submitted_for_settlement', 'settling', 'settlement_pending', 'settlement_confirmed', 'settled', 'authorized', 'authorizing'];
var transactionInvalidStatus = ['voided', 'settlement_declined', 'processor_declined', 'failed', 'gateway_rejected', 'authorization_expired'];

var subscriptionValidStatus = ['active', 'pending'];
var subscriptionInvalidStatus = ['canceled', 'past_due', 'expired'];

var orderValidStatus = transactionValidStatus.concat(subscriptionValidStatus);
var orderInvalidStatus = transactionInvalidStatus.concat(subscriptionInvalidStatus);


var OrderSchema = new Schema({
            
    // Public
    orderId: {
        type: String,
        require: true
    },
    customerId: {
        type: String,
        require: true
    },

    offerDetails: {
        type: Object,
        require: true
    },

    // Secret
    merchantAccountId: {
        type: String,
        require: false
    },

    // Private
    billingDetails: {
        type: Object,
        require: true
    },

    // TODO schema
    customerDetails: {
        type: Object,
        default: {},
        require: false
    },

    transactions: Array,
    subscriptions: Array,

    created: Date,
    updated: [Date]
});

/**
 * Validations
 */

function isValidJsonSchema(validation) {
    return validation.errors.length === 0;
}

OrderSchema.path('offerDetails').validate(function (offerDetails) {
    return isValidJsonSchema(jsonSchemaValidate(offerDetails, offerDetailsSchema));
}, 'Invalid offerDetails schema.');

OrderSchema.path('customerDetails').validate(function (offerDetails) {
    return isValidJsonSchema(jsonSchemaValidate(offerDetails, customerDetailsSchema));
}, 'Invalid customerDetails schema.');
 
// TODO transactions and subscriptions schema.

/**
 * Virtuals
 */
OrderSchema
    .virtual('status')
    .get(function () {
        var order = this,
            offerDetails = order.offerDetails,
            status = 'unknow'; // default unknow

        // look for offerDetails.planId or productId
        // Then look for subscription or transaction state

        if (offerDetails.planId) {
            // Sort by dates
            var subscriptions = order.subscriptions.slice();

            subscriptions.sort(function(a, b) {
              // Turn your strings into dates, and then subtract them
              // to get a value that is either negative, positive, or zero.
              return new Date(b.updatedAt) - new Date(a.updatedAt);
            });

            // Filter by active and match planId
            status = subscriptions.length > 0 ? subscriptions[0].status : status;

        } else if (offerDetails.productId) {

            // Sort by dates
            var transactions = order.transactions.slice().filter(function (transaction) {
                return transaction.customFields && 
                    transaction.customFields.productId === offerDetails.productId;
            });

            transactions.sort(function(a, b) {
              // Turn your strings into dates, and then subtract them
              // to get a value that is either negative, positive, or zero.
              return new Date(b.updatedAt) - new Date(a.updatedAt);
            });

            // Filter by active and match planId
            status = transactions.length > 0 ? transactions[0].status : status;
        }

        return String(status).replace(' ', '_').toLowerCase();
    });

OrderSchema
    .virtual('order_info')
    .get(function () {
        var order = this;
        return {
            id: order._id,
            orderId: order.orderId,
            customerId: order.customerId,
            status: order.status,
            offerDetails: Object.assign({
                planId: null,
                productId: null,
                productQty: null
            }, order.offerDetails),
            customerDetails: order.customerDetails,
            created: order.created,
            updated: order.updated
        };
    });

OrderSchema.path('offerDetails').validate(function (offerDetails, respond) {

    var currentOrder = this;
    mongoose.models.Order.find({
        customerId: currentOrder.customerId,
        "_id":{
            "$ne": currentOrder._id
        },
    })
    .sort('-created')
    .exec(function (err, orders) {

        // TODO child planIds
        // TODO child productIds

        // Check non duplicate subscriptionValidStatus 
        if (
            currentOrder.offerDetails.planId && 
                (currentOrder.isNew || subscriptionValidStatus.indexOf(currentOrder.status) !== -1)
        ) {
            orders = orders.filter(function (order) {
                return order.offerDetails.planId === currentOrder.offerDetails.planId &&
                    subscriptionValidStatus.indexOf(order.status) !== -1;
            });

        // Check valid order status
        } else if (
            currentOrder.status !== 'unknow' &&
                orderInvalidStatus.indexOf(currentOrder.status) === -1 &&
                    orderValidStatus.indexOf(currentOrder.status) === -1
        ) {
            orders = [currentOrder];
        } else {
            orders = [];
        }

        if (err) {
            throw err;
        } else if (orders.length > 0) {
            respond(false);
        } else {
            respond(true);
        }
    });

}, 'The specified planId is already in use.');

/**
 * Pre hook.
 */
OrderSchema.pre('save', function (next) {
    if (this.isNew) {

        // Generate order id
        this.orderId = this.orderId || mongoose.Types.ObjectId();
        this.created = this.created || Date.now();
        this.updated.push(this.created);
    } else {
        this.updated.push(Date.now());
    }

    next();
});

/**
 * Define model.
 */
mongoose.model('Order', OrderSchema);

exports.Order = mongoose.model('Order');
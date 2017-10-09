# montage-payment

[![Build Status](https://travis-ci.com/montagestudio/montage-payment.svg?token=DkxazY7pbviHZyy38ZZb&branch=master)](https://travis-ci.com/montagestudio/montage-payment)

This is a sample app that use Montage and Braintree to fetch provide a payment service.

## Quick start

1. Install 
```
git clone git@github.com:montagestudio/montage-payment.git
cd montage-payment
npm install
```

2. Start
```
npm start
```

3. Test
Then Open you browser to "https://localhost:8080".

## BrainTree config

### New config

#### Create accounts

1. Create a Paypal account (https://www.paypal.com/signup/create)
2. Create BrainTree account (https://www.braintreepayments.com/sandbox)
3. Use Paypal to login after BrainTree email confirmation.
4. Visit https://sandbox.braintreegateway.com
5. Look for Sandbox Keys & Configuration" and save following value for later: "Merchant ID", "Public Key, and "Private Key".
6. Use BRAINTREE_MARCHANT_ID to start montage-payment-service.

#### Setup CustomFields

You will need to configure following CustomFields:
- plan_id: planId
- product_id productId
- product_qty productQty
- product_qty_used productQtyUsed

See: https://articles.braintreepayments.com/control-panel/custom-fields#creating-a-custom-field

## Links
- https://sandbox.braintreegateway.com/
- https://articles.braintreepayments.com/control-panel/custom-fields#creating-a-custom-field
- https://developers.braintreepayments.com/reference/general/testing/node

# Documentation

## API

(Work in progress)

### Offers

- GET "/api/offers" - getOffers
- GET "/api/offers/offer/:offerId" - getOffer

### Customer

- GET "/api/customer" - get Customer
- GET "/api/customer/:customerId" - get Customer Details
- GET "/api/customer/:customerId/orders" - get Customer Orders
- GET "/api/customer/:customerId/orders/order/:orderId" - get Customer Order
- DELETE "/api/customer/:customerId/orders/order/:orderId" - cancel Customer Order
- GET "/api/customer/:customerId/transactions" - get Customer Transactions
- GET "/api/customer/:customerId/subscriptions" - get Customer Subscriptions
- GET "/api/customer/:customerId/offers" - get Customer Offers
- GET "/api/customer/:customerId/offers/offer/:offerId" - get Customer Offer
- GET "/api/customer/:customerId/plans" - get Customer Plans

### Payment

- POST "/api/payment" - checkout Payment Offer
- PUT "/api/payment/:orderId" - update Payment Offer
- POST "/api/payment/callback" - payment callback 
- GET "/api/payment/callbackTest" - payment callbackTest

# Project Directory

The default project directory includes the following files and folders:

* assets/  -  Contains global stylesheets and images for the application.
* index.html  -  Is the entry-point document for the application. 
* node_modules/  -  Contains the code dependencies required in development.

    Includes Montage, the core framework, and Digit, a mobile-optimized user
    interface widget set by default. Since MontageJS uses the CommonJS module 
    system, you can leverage the npm ecosystem for additional modules. To add 
    dependencies (e.g., foo), use `npm install foo` in the project directory.
    
    NOTE: All packages in this directory must be included as dependencies 
    in package.json.

* package.json  -  Describes the application and the dependencies included in 
            the node_modules directory.
* README.md  -  The default readme file.
* run-tests.html  -  Is a page to run Jasmine tests manually in the browser.
* test/  -  Contains tests for the application.

    By default, this directory includes all.js, a module that points the test runner
    to all jasmine specs.

* ui/  -  Contains the application user interface components. 

    By default, this directory contains two components: main.reel (the Main
    user interface component) and version.reel (which displays the current
    MontageJS version).

* core/  -  Contains the core modules of the application logic.

In development, you can expand this project directory as necessary; for example,
depending on the project you may want to add the following folders:

* locale/  -  For localized content.
* scripts/  -  For JS libraries that do not support the CommonJS exports object
           and, therefore, have to be loaded using a `<script>` tag.

## Unit Testing

MontageJS uses some pure unit tests that are straightforward [Jasmine specs][1].

To install the test code, run `npm install` in your project folder. This installs the 
the [montage-testing][2] package, which adds some useful utilities for writing 
jasmine tests. You will need the file run-tests.html.

For an example of how we implement unit testing, see the [digit][3] repository:

* [run-tests][4] loads our test environment.
* `data-module="test/all"` inside the final script tag tells the system to load [test/all.js][5].
* all.js specifies a list of module ids for the runner to execute.

>Note that in this example, all the tests load a page in an iframe using 
`TestPageLoader.queueTest()`. These are akin to integration tests since they test 
the component in a real environment.

We also test some components by [mocking their dependencies][6].



/* global module */
module.exports = {

    //
    // Payment
    //

    payment: {
        enable: true,
        billing: {
            email: 'billing@example.com',
            company: "Acme Inc",
            phone: "+1415000000",
            streetAddress: "144 Carl Street",
            locality: "San Francisco",
            postalCode: "94117",
            region: "CA",
            countryName: "USA"
        }
    },

    //
    // Externals Shared APIs
    //

    email: {
        enable: true,
        test: false,
        testFailure: false,
        noreply: 'noreply@example.com',
        sender: 'noreply@example.com',
        support: 'support@example.com',
        billing: 'billing@example.com',
        contact: 'support@example.com',
        smtp: {
            enable: false,
            host: 'smtp.mandrillapp.com',
            port: 587,
            user: 'support@example.com', 
            pass: 'NotConfigured'
        },
        sendmail: {
            enable: false,
            path: '/usr/sbin/sendmail'
        }
    },


    // https://developer.paypal.com/
    braintree: {
        enable: true,
        merchantId: 'swvh5f24s3x7md9f',
        publicKey: '8wctc92ysj8w3tgz',
        privateKey: '975c8ae94db9437953c66c1e990f6540',
        payment: {
            failOnDuplicatePaymentMethod: false,
            verifyCard: true,
            makeDefault: true
        },
        subscription: {
            startImmediately: false
        },
        transaction: {
            submitForSettlement: true,
            storeInVaultOnSuccess: true
        }
    }
};

/* global module */
module.exports = {

    // Payment
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

    // MailService
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

    //
    // Braintree
    // 

    braintree: {
        enable: true,
        // harold.thetiot@kaazing.com
        merchantId: '2vcbbfdttx7cyjxt',
        publicKey: 't4kn2m7nywkycmrs',
        privateKey: 'dcfd5303cb2459c33f521136796d67e7',
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

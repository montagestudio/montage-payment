/* global exports, require */

// Load required modules
var q = require('q');
var path = require('path');
var nodemailer = require("nodemailer");
var Valid = require('node-valid');
var smtpTransport = require('nodemailer-smtp-transport');
var stubTransport = require('nodemailer-stub-transport');
var sendmailTransport = require('nodemailer-sendmail-transport');
var EmailTemplate = require('email-templates').EmailTemplate;

var tagsToReplace = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
};

function replaceTag (tag) {
    return tagsToReplace[tag] || tag;
}

exports.isValidEmail = function (str) {
    return new Valid().validate(str).required().isEmail().isValid();
};

exports.formatEmailName = function (email, name) {

    if (exports.isValidEmail(email) === false) {
        throw Error('Invalid formatEmailName email: ' + email);
    }

    if (email === name) {
        name = null;
    }

    return name ? name + ' <' + email + '>' : email;
};

exports.safeTagsReplace = function (str) {
    return str.replace(/[&<>]/g, replaceTag);
};

exports.prepateHmlBody = function (str) {
    return str.replace(/(?:\r\n|\r|\n)/g, '<br />');
};

exports.getClient = function (emailConfig) {
    var client,
        smtp = emailConfig.smtp,
        sendmail = emailConfig.sendmail;

    if (emailConfig.test === true) {
        console.log('warning', '[Mail] Client Stub Transport, email will not be sent! (config.email.enable=false)');
        client = stubTransport(emailConfig.sendmail || {});
    } else if (smtp && smtp.enable) {
        console.log('warning', '[Mail] Client SMTP transport');
        client = smtpTransport({
            host: smtp.host,
            port: smtp.port,
            auth: {
                user: smtp.user,
                pass: smtp.pass
            }
        });
    } else if (sendmail && sendmail.enable) {
        console.log('warning', '[Mail] Client Sendmail transport');
        client = sendmailTransport(emailConfig.sendmail);
    }  

    return nodemailer.createTransport(client);
};

exports.sendTemplate = function (template, data, emailObj, config, emailConfig) {

    var templateDir = path.join(config.resourcesPath, 'email', template),
        deferred = q.defer();

    // Expose config.app to template
    try {

        data.app = config.app;

        var renderTemplate = new EmailTemplate(templateDir);
        renderTemplate.render(data, function (err, result) {

            if (err) {
                deferred.reject(err);
            } else {

                emailObj.subject = result.subject || emailObj.subject;
                emailObj.html = result.html;
                emailObj.text = result.text;

                exports.send(emailObj, emailConfig)
                    .then(deferred.resolve, deferred.reject);            
            }
        });
    } catch (err) {
        deferred.reject(err);
    }

    return deferred.promise;
};

exports.send = function (emailObj, emailConfig) {
	
	var client = exports.getClient(emailConfig),
		deferred = q.defer();

    if (typeof emailObj !== 'object') {
        deferred.reject(new Error('Invalid emailObj object'));
    } else if (typeof emailObj.subject !== 'string') {
        deferred.reject(new Error('Invalid emailObj missing subject property'));
    } else if (emailConfig.testFailure === true) {
        deferred.reject('Test Failure');
    } else {

        // Can be array cc, to, bcc,
        ['cc', 'bcc', 'to'].forEach(function (dest) {
               
            if (
                emailObj.hasOwnProperty(dest) &&
                    Array.isArray(emailObj[dest])
            ) {
                emailObj[dest] = emailObj[dest].join(', ');
            } 
        });

        emailObj.encoding = 'utf-8';
        emailObj.textEncoding = 'base64';
        emailObj.headers = {
            'X-Date': Date.now() 
        };

        if (typeof emailObj.html === 'string') {
            emailObj.html = {
                content: emailObj.html,
                encoding: 'utf-8'
            };
        }

        if (emailConfig.test === true) {
            console.info('[Mail] Email test', emailObj.to, emailObj.subject, emailObj.text);
        }

        // Reference: https://github.com/nodemailer/nodemailer
        client.sendMail(emailObj, function(err, responseData) {
            if (!err) {

                var result = {
                    emailObj: emailObj,
                    response: responseData
                };

                console.info('[Mail] Email sent', emailObj.to, emailObj.subject);
                deferred.resolve(result);
            } else {
                console.error('[Mail] Email send failed', emailObj.to, emailObj.subject, err);
                deferred.reject(err);
            }
        });   
    }

    return deferred.promise;
};

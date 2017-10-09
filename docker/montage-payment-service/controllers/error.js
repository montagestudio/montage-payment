/* global exports, require */
'use strict';
                                        
function getReqRemoteAddr(req) {
    return req.headers['x-real-ip'] || 
                req.headers['x-forwarded-for'] || 
                    req.connection.remoteAddress;
}

exports.notfound = function(req, res, next) {

    // Log it
    console.warn('Error 404 - NotFound - ' + req.originalUrl, getReqRemoteAddr(req)); 

    // Response code
    res.status(404);

    return exports.errors(new Error('NotFound ' + req.originalUrl), req, res, next);
};

exports.unauthorized = function(req, res, next) {

    // Log it
    console.warn('Error 401 - Unauthorized', getReqRemoteAddr(req)); 

    // Logout attempt
    req.logout();   

    // Response code
    res.status(401);

    return exports.errors(new Error('Unauthorized'), req, res, next);
};

exports.forbiden = function(req, res, next) {

    // Log it
    console.info('Error 403 - Forbiden', getReqRemoteAddr(req));
    
    // Logout attempt
    req.logout();

    // Response code
    res.status(403);

    return exports.errors(new Error('Forbiden'), req, res, next);
};

exports.tooManyRequests = function(req, res, next) {

    // Log it
    console.info('Error 429 - TooManyRequests', getReqRemoteAddr(req));
    
    // Response code
    res.status(429);

    return exports.errors(new Error('TooManyRequests'), req, res, next);
};

/**
 * Send errors
 */
exports.errors = function(err, req, res, next) {

    // Configure
    var config = req.app.get('config');

    // Assume "not found" in the error msgs is a 404. this is somewhat
    // silly, but valid, you can do whatever you like, set properties,
    // use instanceof etc.
    if (err.message && ~err.message.indexOf('not found')) {
        
        exports.notfound(req, res, next);

    // Treat invalid csrf as 400
    } else if (err.message && ~err.message.indexOf('invalid csrf token')) {
        
        res.status(400)
            .json({
                error: 'InvalidRequest',
                message: "Invalid CSRF token"
            });

    // ValidationError page
    } else if (err.name && err.name === 'ValidationError') {

        if (res.statusCode < 400) {
            res.status(406);
        }

        res.json({
            error: 'ValidatorError',
            message: err.message,
            errors: err.errors && (function () {

                var field, 
                    errors = {},
                    fieldsErrors = err.errors;
                
                for (field in fieldsErrors) {
                    if (fieldsErrors.hasOwnProperty(field)) {
                        errors[field] = {
                            message: fieldsErrors[field].message
                        };
                    }
                }

                return errors;
            }())
        });

    // Error page
    } else {

        var errorCodesToName = {
            '401': 'Unauthorized',
            '402': 'Payment Required',
            '403': 'Forbidden',
            '404': 'NotFound',
            '405': 'MethodNotAllowed',
            '406': 'NotAcceptable',
            '407': 'ProxyAuthenticationRequired',
            '408': 'RequestTimeout',
            '409': 'Conflict',
            '410': 'Gone',
            '411': 'LengthRequired',
            '412': 'PreconditionFailed',
            '413': 'PayloadTooLarge',
            '414': 'URITooLong',
            '415': 'UnsupportedMediaType',
            '416': 'RangeNotSatisfiable',
            '417': 'ExpectationFailed',
        };

        if (res.statusCode < 400) {
            res.status(500);
        }

        var errorObj = {
            code: res.statusCode,
            error: err.name || errorCodesToName[res.statusCode] || 'FatalError',
            message: err.message || err || 'Unknow Reason'
        };

        // Return json on api routes
        res.json(errorObj);

        /*
        // TODO
        var accepts = require('accepts');
        var accept = accepts(req).type(['json', 'html']);
        if (accept === 'json') {
            res.json(errorObj);

        // Otherwise display error page.
        } else if (0 || accept === 'html') {

            // Render custom page per error code
        }
        */

        res.end();

        // Log it
        if (errorObj.code < 500) {
            console.info('Warning ' + errorObj.code + ' - ' + errorObj.error, getReqRemoteAddr(req));
        } else {
            console.info('Error ' + errorObj.code + ' - ' + errorObj.error, getReqRemoteAddr(req));
            console.error(errorObj, err);   
        }
    }
};

exports.reportViolation = function(req, res, next) {
    
    // Log it
    console.error('Error 401 - CSP Violation', getReqRemoteAddr(req));

    if (req.body) {
        console.error('CSP Violation', req.body);
    } else {
        console.error('CSP Violation No data received!');
    }

    // Response code
    res.status(204)
        .end();
};
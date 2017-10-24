var HttpService = require("montage/data/service/http-service").HttpService,
    DataService = require("montage/data/service/data-service").DataService,
    Offer = require("logic/model/offer").Offer;


var Connection = require("logic/service/offers-service-connection.json");
    // Replace the above with the following to load mock data
// var  Connection = require("logic/service/twitter-service-connection.mock.json");


/**
 * Provides data for applications.
 *
 * @class
 * @link https://dev.twitter.com/rest/
 * @extends external:DataService
 */
exports.OffersService = HttpService.specialize(/** @lends OffersService.prototype */ {

    fetchRawData: {
        value: function (stream) {
            var self = this,
                criteria = stream.query.criteria,
                parameters = criteria.parameters,
                apiUrl;

            apiUrl = Connection.url;
            return self.fetchHttpRawData(apiUrl).then(function (data) {
                if (data) {
                    self.addRawData(stream, data);
                    self.rawDataDone(stream);
                }
            });
        }
    }
});

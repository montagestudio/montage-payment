/**
 * @module ui/offers-list.reel
 */
var Component = require("montage/ui/component").Component,
    Criteria = require("montage/core/criteria").Criteria,
    DataQuery = require("montage/data/model/data-query").DataQuery,
    DataService = require("montage/data/service/data-service").DataService,
    Deserializer = require("montage/core/serialization/deserializer/montage-deserializer").MontageDeserializer,
    Offer = require("logic/model/offer").Offer;

/**
 * @class OffersList
 * @extends Component
 */
exports.OffersList = Component.specialize(/** @lends OffersList# */ {
    constructor: {
        value: function OffersList() {
            this.super();
            DataService.authorizationManager.delegate = this;
            var self = this;
            this._initializeServices().then(function () {
                return self._initializeOffers();
            });
        }
    },

    _initializeServices: {
        value: function () {
            var self = this;
            return require.async("data/montage-data.mjson").then(function (descriptor) {
                var deserializer = new Deserializer().init(JSON.stringify(descriptor), require);
                return deserializer.deserializeObject();
            }).then(function (service) {
                self.application.service = service;
                self.isReady = true;
                return service;
            });
        }
    },

    _initializeOffers: {
        value: function () {
            var self = this;
            return this.application.service.fetchData(Offer).then(function (offers) {
                self.offers = offers;
                return null;
            });
        }
    },
});

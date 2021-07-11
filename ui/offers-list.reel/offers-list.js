/**
 * @module ui/offers-list.reel
 */
var Component = require("montage/ui/component").Component,
    Criteria = require("montage/core/criteria").Criteria,
    DataQuery = require("montage/data/model/data-query").DataQuery,
    DataService = require("montage/data/service/data-service").DataService,
    Deserializer = require("montage/core/serialization/deserializer/montage-deserializer").MontageDeserializer,
    Offer = require("logic/model/offer").Offer,
    MontageDataDescriptor = require("data/montage-data.mjson");

/**
 * @class OffersList
 * @extends Component
 */
exports.OffersList = Component.specialize(/** @lends OffersList# */ {
    constructor: {
        value: function OffersList() {
            var self = this;
            self.super();
            DataService.authorizationManager.delegate = self;
            self._initializeServices().then(function () {
                self._initializeOffers();
                self._initializeOfferById('pro');
                self._createOfferById('test');
            });
        }
    },

    _initializeServices: {
        value: function () {
            var self = this;
            var deserializer = new Deserializer().init(MontageDataDescriptor, require);
            return deserializer.deserializeObject().then(function (service) {
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

    _initializeOfferById: {
        value: function (id) {
            var self = this,
                criteria = new Criteria().initWithExpression("id == $.id", { id: id }),
                query = DataQuery.withTypeAndCriteria(Offer, criteria);
            return this.application.service.fetchData(query).then(function (offer) {
                self.offer = offer;
                return null;
            });
        }
    },

    _createOfferById: {
        value: function (id) {

            var self = this;

            var offer = this.application.service.createDataObject(Offer);
            offer.id = id;

            return this.application.service.saveDataObject(offer).then(function (offer) {
                self.offer = offer;
                return null;
            });
        }
    }
});

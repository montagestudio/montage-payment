/* global exports, require */
var offersService = require('./../services/offers');

//
// Offers routes
//

exports.getOffers = function (req, res, next) {
    var config = req.app.get('config');
    offersService.offer.getAll().then(function (offers) {
      res.status(200);
      res.json(offers.map(offersService.offer.getInfo));
    });
};

exports.getOffer = function (req, res, next) {
    var config = req.app.get('config');
  offersService.offer.get(req.params.offerId).then(function (offer) {
    res.status(200);
    res.json(offersService.offer.getInfo(offer));
  }, function (err) {
    res.status(404);
    next(err);
  });
};


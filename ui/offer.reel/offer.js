/**
 * @module ui/offer.reel
 */
var Component = require("montage/ui/component").Component;

/**
 * @class Offer
 * @extends Component
 */
exports.Offer = Component.specialize(/** @lends Offer# */ {
    constructor: {
        value: function Offer() {
            this.super();
        }
    },
    
	_value: {
        value: null
    },

    /**
     * The string to be displayed. `null` is equivalent to the empty string.
     * @type {string}
     * @default null
     */
    value: {
        get: function () {
            return this._value;
        },
        set: function (value) {
            if (this._value !== value) {
                this._value = value;
                this.needsDraw = true;
            }
        }
    }
});

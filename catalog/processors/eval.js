var Global = require('./_template.js');

Mapper = function(SPOO) {
    return Object.assign(new Global(SPOO), {

        execute: function(dsl, obj, prop, data, callback, client, app, user, options) {

            var SPOO = this.SPOO;
            console.log("22..", dsl);
            if (this.multitenancy == this.CONSTANTS.MULTITENANCY.ISOLATED) {
                try {
                    eval(dsl);
                } catch (e) {
                    console.log(e);
                }
                callback();
            } else {
                try {
                    eval(dsl);
                } catch (e) {
                    console.log(e);
                }
                callback();
            }
        }
    })
}

module.exports = Mapper;
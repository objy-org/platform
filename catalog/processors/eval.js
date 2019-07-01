const Mapper = require('./_template.js');

Mapper.prototype.execute = function(dsl, obj, prop, data, callback, client, app, user, options) {
        
        var SPOO = this.SPOO;

        if(this.multitenancy == this.CONSTANTS.MULTITENANCY.ISOLATED) {
            eval(dsl);
            callback();
        }
        else {
            eval(dsl)
            callback();
        }
}

module.exports = Mapper;
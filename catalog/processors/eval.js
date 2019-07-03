var Global = require('./_template.js');

Mapper = function(SPOO) {
    return Object.assign(new Global(SPOO), {
        
        execute : function(dsl, obj, prop, data, callback, client, app, user, options) {
        
        var SPOO = this.SPOO;
console.log("22..");
        if(this.multitenancy == this.CONSTANTS.MULTITENANCY.ISOLATED) {
            eval(dsl);
            callback();
        }
        else {
            eval(dsl)
            callback();
        }
    }
    })
}


module.exports = Mapper;
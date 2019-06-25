var CONSTANTS = {
    MULTITENANCY: {
        ISOLATED: "isolated",
        SHARED: "shared"
    }
}

Mapper = function(SPOO) {
	this.SPOO = SPOO;
	this.multitenancy = CONSTANTS.MULTITENANCY.ISOLATED;
}

Mapper.prototype.setMultiTenancy = function(value) {
    this.multitenancy = value;
};

Mapper.prototype.execute = function(dsl, obj, prop, data, callback, client, app, user, options) {
        
        var SPOO = this.SPOO;

        if(this.multitenancy == CONSTANTS.MULTITENANCY.ISOLATED) {
            eval(dsl)
        }
        else {
            eval(dsl)
        }
}



module.exports = Mapper;
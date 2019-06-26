Mapper = function(SPOO) {
    this.CONSTANTS = {
        MULTITENANCY: {
            ISOLATED: "isolated",
            SHARED: "shared"
        },
        TYPES: {
            SCHEDULED: 'scheduled',
            QUERIED: 'queried'
        }
    }

	this.SPOO = SPOO;
    this.objectFamily = null;
	this.multitenancy = this.CONSTANTS.MULTITENANCY.ISOLATED;
}

Mapper.prototype.setMultiTenancy = function(value) {
    this.multitenancy = value;
};

Mapper.prototype.setObjectFamily = function(value) {
    this.objectFamily = value;
};

Mapper.prototype.execute = function(dsl, obj, prop, data, callback, client, app, user, options) {
        
}

module.exports = Mapper;

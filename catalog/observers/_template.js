Mapper = function(SPOO, options) {
    this.CONSTANTS = {
        MULTITENANCY: {
            ISOLATED: "isolated",
            SHARED: "shared"
        },
        TYPES: {
            SCHEDULED: 'scheduled',
            QUERIED: 'queried'
        }
    };
    this.SPOO = SPOO;
    this.interval =  (options || {}).interval || 600;
    this.initialize();
    this.objectFamily = null;
    this.type = (options || {}).type || this.CONSTANTS.TYPES.QUERIED;
    this.multitenancy = (options || {}).multitenancy || this.CONSTANTS.MULTITENANCY.ISOLATED;
}

Mapper.prototype.initialize = function(millis) {
       
}

Mapper.prototype.setObjectFamily = function(value) {
    this.objectFamily = value;
};

Mapper.prototype.run = function(date) {

}

module.exports = Mapper;
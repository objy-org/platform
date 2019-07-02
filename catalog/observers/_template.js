Mapper = function(SPOO, options, content) {
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
    this.interval =  (options || {}).interval || 60000;
    this.objectFamily = null;
    this.type = (options || {}).type || this.CONSTANTS.TYPES.QUERIED;
    this.multitenancy = (options || {}).multitenancy || this.CONSTANTS.MULTITENANCY.ISOLATED;

    if(content) Object.assign(this, content)
}

Mapper.prototype.initialize = function(millis) {

}

Mapper.prototype.setObjectFamily = function(value) {
    this.objectFamily = value;
};

Mapper.prototype.run = function(date) {

}

module.exports = Mapper;
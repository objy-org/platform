Mapper = function(options) {
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
    this.objectFamily = null;
	this.multitenancy = (options || {}).multitenancy || this.CONSTANTS.MULTITENANCY.ISOLATED;
}

Mapper.prototype.connect = function(connectionString, success, error) {

}

Mapper.prototype.closeConnection = function(success, error) {
    
}

Mapper.prototype.setObjectFamily = function(value) {
    this.objectFamily = value;
};

Mapper.prototype.setMultiTenancy = function(value) {
    this.multitenancy = value;
};

Mapper.prototype.createClient = function(client, success, error) {

}

Mapper.prototype.getDBByMultitenancy = function(client) {

};

Mapper.prototype.listClients = function(success, error) {

};

Mapper.prototype.getById = function(id, success, error, app, client) {

}

Mapper.prototype.getByCriteria = function(criteria, success, error, app, client, flags) {

}

Mapper.prototype.count = function(criteria, success, error, app, client, flags) {

}

Mapper.prototype.update = function(spooElement, success, error, app, client) {

};

Mapper.prototype.add = function(spooElement, success, error, app, client) {

};

Mapper.prototype.remove = function(spooElement, success, error, app, client) {

};

module.exports = Mapper;
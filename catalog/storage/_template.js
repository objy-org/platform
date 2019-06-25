var CONSTANTS = {
    MULTITENANCY: {
        TENANTIDENTIFIER: "tenantIdentifier",
        DATABASE: "database"
    }
}

Mapper = function(options) {
	this.database = {};
	this.multitenancy = (options || {}).multitenancy || CONSTANTS.MULTITENANCY.DATABASE;
}

Mapper.prototype.connect = function(connectionString, success, error) {

}

Mapper.prototype.closeConnection = function(success, error) {
    
}

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
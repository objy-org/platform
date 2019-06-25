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

Mapper.prototype.getObjById = function(id, success, error, app, client) {

}

Mapper.prototype.getObjsByCriteria = function(criteria, success, error, app, client, flags) {

}

Mapper.prototype.aggregateObjsByCriteria = function(aggregation, criteria, success, error, app, client, flags) {

}

Mapper.prototype.updateObj = function(spooElement, success, error, app, client) {

};

Mapper.prototype.addObj = function(spooElement, success, error, app, client) {

};

Mapper.prototype.removeObj = function(spooElement, success, error, app, client) {

};

module.exports = Mapper;
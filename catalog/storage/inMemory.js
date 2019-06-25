var Query = require("query");

var CONSTANTS = {
    MULTITENANCY: {
        TENANTIDENTIFIER: "tenantIdentifier",
        DATABASE: "database"
    }
}

Mapper = function(options) {
	this.database = {};
	this.index = {};
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

    if (this.multitenancy == CONSTANTS.MULTITENANCY.DATABASE) {
        if(this.database[client])
            error('Client already exists')

        this.database[client] = [];
        this.index[client] = {};
        success()
    }
}

Mapper.prototype.getDBByMultitenancy = function(client) {
        
        if (this.multitenancy == CONSTANTS.MULTITENANCY.TENANTIDENTIFIER) {
        	if(!Array.isArray(this.database)) this.database = [];

            return this.database;
        } else if (this.multitenancy == CONSTANTS.MULTITENANCY.DATABASE) {
        	
        	if(!this.database[client])
            	error('no database for client ' + client);

            return this.database[client];
        }
};

Mapper.prototype.listClients = function(success, error) {
	if(!this.database)
         return error('no database');


    success(Object.keys(this.database));
};


Mapper.prototype.getById = function(id, success, error, app, client) {
        
        var db = this.getDBByMultitenancy(client);

        if(!db[id]) 
        	return error('object not found: ' + id);
        
        if(this.multitenancy == CONSTANTS.MULTITENANCY.TENANTIDENTIFIER)
        	if(db[this.index[client][id]].tenantId != client) 
        		error('object not found: ' + id);
        

        success(db[this.index[client][id]]);
}


Mapper.prototype.getByCriteria = function(criteria, success, error, app, client, flags) {

	var db = this.getDBByMultitenancy(client);

    if(app) 
    	Object.assign(criteria, {applications: { $in : [app]}})

    if(this.multitenancy == CONSTANTS.MULTITENANCY.TENANTIDENTIFIER)
     	Object.assign(criteria, {tenantId: client})

	success(Query.query( db, criteria));
}


Mapper.prototype.aggregateByCriteria = function(aggregation, criteria, success, error, app, client, flags) {


	var db = this.getDBByMultitenancy(client);

         switch (aggregation) {
            case 'count':
                     
			success(Query.query( db, criteria).length);

                break;
            default:
                error();
        }

}

Mapper.prototype.update = function(spooElement, success, error, app, client) {
        
        var db = this.getDBByMultitenancy(client);

        if(!this.index[client][spooElement._id]);
            return error('object not found: ' + id);

        if(this.multitenancy == CONSTANTS.MULTITENANCY.TENANTIDENTIFIER)
        	if(this.index[client][spooElement._id].tenantId != client) 
        		return error('object not found: ' + id);

        db[this.index[client][spooElement._id]] = spooElement;
        
        success(db[spooElement._id]);
};

Mapper.prototype.add = function(spooElement, success, error, app, client) {

        if(!this.database[client])
            this.database[client] = [];
        
        if(!this.index[client]) this.index[client] = [];

        if(this.index[client][spooElement._id])
            return error('object with taht id already exists: ' + id);
        if(!this.index[client]) this.index[client] = {};

        var db = this.getDBByMultitenancy(client);

        if(this.multitenancy == CONSTANTS.MULTITENANCY.TENANTIDENTIFIER)
        	spooElement.tenantId = client;

        db.push(spooElement)
        this.index[client][spooElement._id] = db.length;

        success(spooElement);
};

Mapper.prototype.remove = function(spooElement, success, error, app, client) {

        var db = this.getDBByMultitenancy(client);

        if(!this.index[client][spooElement._id])
            return error('object not found: ' + spooElement._id);

        if(this.multitenancy == CONSTANTS.MULTITENANCY.TENANTIDENTIFIER)
        	if(this.index[client][spooElement._id].tenantId != client) 
        		return error('object not found: ' + spooElement._id);


        db.splice(this.index[client][spooElement._id], 1);
        delete this.index[client][spooElement._id];
        success(spooElement)

};

module.exports = Mapper;
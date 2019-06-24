
// SCHEDULED MAPPER

var CONSTANTS = {
    MULTITENANCY: {
        ISOLATED: "isolated",
        SHARED: "shared"
    },
    TYPES: {
        SCHEDULED: 'sheduled',
        QUERIED: 'queried'
    }
}


Mapper = function(options) {
    this.type = (options || {}).type || CONSTANTS.TYPES.SCHEDULED;
    this.database = {};
    this.index = {};
    this.multitenancy = (options || {}).multitenancy || CONSTANTS.MULTITENANCY.ISOLATED;
}

Mapper.prototype.setMultiTenancy = function(value) {
    this.multitenancy = value;
};

Mapper.prototype.getDBByMultitenancy = function(client) {
        
        if (this.multitenancy == CONSTANTS.MULTITENANCY.ISOLATED) {
            if(!Array.isArray(this.database)) this.database = [];

            return this.database;
        } else if (this.multitenancy == CONSTANTS.MULTITENANCY.SHARED) {
            
            if(!this.database[client])
                throw new Error('no database for client ' + client);

            return this.database[client];
        }
};

Mapper.prototype.listTenants = function(success, error) {
    if(!this.database)
         return error('no database');


    success(Object.keys(this.database));
};


Mapper.prototype.getEvent = function(objId, propName, success, error, client) {
        
        var db = this.getDBByMultitenancy(client);

        if(!db[id]) 
            return error('object not found: ' + id);
        
        if(this.multitenancy == CONSTANTS.MULTITENANCY.ISOLATED)
            if(db[this.index[client][id]].tenantId != client) 
                error('object not found: ' + id);
        
        success(db[this.index[client][id]]);
}

Mapper.prototype.addEvent = function(objId, propName, event, success, error, client) {

        if(!this.database[client])
            this.database[client] = [];
        
        if(!this.index[client]) this.index[client] = [];

        if(this.index[client][objId + ':'+propName])
            return error('object with taht id already exists: ' + id);
        
        if(!this.index[client]) this.index[client] = {};

        var db = this.getDBByMultitenancy(client);

        if(this.multitenancy == CONSTANTS.MULTITENANCY.ISOLATED)
            event.tenantId = client;

        if(event.date) {
            var difference = 0;
            
            db.push(setTimeout(function() {

                // @TODO: link to processor

            }, difference))
        }
        else if(event.interval) {

            var interval = 0; // @TODO: convert iso8601 duration to millis

            db.push(setInterval(function() {

                // @TODO: link to processor

            }, interval))
        }
            

        this.index[client][objId + ':'+propName] = db.length;

        success(event);
        
};

Mapper.prototype.removeEvent = function(objId, propName, success, error, client) {

        var db = this.getDBByMultitenancy(client);

        if(!this.index[client][objId + ':'+propName])
            return error('object not found: ' + id);

        if(this.multitenancy == CONSTANTS.MULTITENANCY.ISOLATED)
            if(this.index[client][objId + ':'+propName].tenantId != client) 
                return error('object not found: ' + id);


        db.splice(this.index[client][objId + ':'+propName], 1);
        delete this.index[client][objId + ':'+propName];
        success('removed')

};

module.exports = Mapper;
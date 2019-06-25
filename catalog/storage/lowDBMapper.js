const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')


var globalPagingNum = 20;


var CONSTANTS = {
    MULTITENANCY: {
        TENANTIDENTIFIER: "tenantIdentifier",
        DATABASE: "database"
    }
}


localStorageMapper = function(options, connectionString, connectionSuccess, connectionError) {

    this.connectionString = connectionString;

    this.multitenancy = options.multitenancy || CONSTANTS.MULTITENANCY.TENANTIDENTIFIER;

    var dbConMain = {};

    this.connectInit = function(success, error) {

    };

    this.connectInit(connectionSuccess, connectionError);

    this.setMultiTenancy = function(value) {
        this.multitenancy = value;
    };


    this.closeConnection = function() {

    };

    this.getDBByMultitenancy = function(client)
    {

        if (this.multitenancy == CONSTANTS.MULTITENANCY.TENANTIDENTIFIER) {
            const adapter = new FileSync('db.json')
            return low(adapter)
        } else if (this.multitenancy == CONSTANTS.MULTITENANCY.DATABASE) {
             const adapter = new FileSync('db' + client + '.json')
            return low(adapter)
        }
    };

    this.listTenants = function(success, error)
    {

    };

    this.getObjById = function(id, success, error, app, client) {

        var db = this.getDBByMultitenancy(client);

        var query = { _id: id };

        if(this.multitenancy == CONSTANTS.MULTITENANCY.TENANTIDENTIFIER)
            Object.assign(query, {tenantId: client})

        success(db.get('objects')
            .find(query)
            .value())

    }


    this.getObjsByCriteria = function(criteria, success, error, app, client, flags) {

        var db = this.getDBByMultitenancy(client);

        // flags contain thigs lik $sort or $page

        if(this.multitenancy == CONSTANTS.MULTITENANCY.TENANTIDENTIFIER)
            Object.assign(criteria, {tenantId: client})

        success(db.get('objects')
            .filter(criteria)
            .value())
    }


    this.aggregateObjsByCriteria = function(aggregation, criteria, success, error, app, client, flags) {

        var db = this.getDBByMultitenancy(client);


        switch (aggregation) {
            case 'count':

                // flags contain thigs lik $sort or $page

                success(db.get('objects')
                    .filter(criteria)
                    .value().length)

                break;
            default:
                error();
        }

    }

    this.updateObj = function(spooElement, success, error, app, client) {

        var db = this.getDBByMultitenancy(client);

        var query = { _id: spooElement._id };

        if(this.multitenancy == CONSTANTS.MULTITENANCY.TENANTIDENTIFIER)
            Object.assign(query, {tenantId: client})


        success(db.get('objects')
            .find(query)
            .assign(spooElement)
            .write())

    };

    this.addObj = function(spooElement, success, error, app, client) {

        var db = this.getDBByMultitenancy(client);

        db.defaults({ objects: [] })
            .write()

        if(this.multitenancy == CONSTANTS.MULTITENANCY.TENANTIDENTIFIER)
            spooElement.tenantId = client;

        db.get('objects')
            .push(spooElement)
            .write()

        success(spooElement);


    };

    this.removeObj = function(spooElement, success, error, app, client) {

         var db = this.getDBByMultitenancy(client);

         var query = { _id: spooElement._id };

         if(this.multitenancy == CONSTANTS.MULTITENANCY.TENANTIDENTIFIER)
            Object.assign(query, {tenantId: client})

        success(db.get('objects')
            .remove(query)
            .write())
    };


}

module.exports = localStorageMapper;
var globalPagingNum = 20;
var shortid = require('shortid');
var localStorage = require('localStorage');

localStorageMapper = function(connectionString, connectionSuccess, connectionError) {

    this.connectionString = connectionString;

    this.objects = {};

    var dbConMain = {};


    this.connectInit = function(success, error) {

    };

    this.connectInit(connectionSuccess, connectionError);


    this.closeConnection = function() {

    };


    this.getObjById = function(id, success, error, constrains, client) {

        var items = JSON.parse(localStorage.getItem('objs_' + client)) || {};
        var item = null;

        Object.keys(items).forEach(function(i) {
            if (items[i]._id == id) item = items[i];
        })
        success(item);
    }


    this.getObjsByCriteria = function(criteria, success, error, constrains, client, flags, all) {

    }


    this.aggregateObjsByCriteria = function(aggregation, criteria, success, error, constrains, client, flags) {


        switch (aggregation) {
            case 'count':
                return Object.keys(this.objects).length;
                break;
            default:
                error();
        }

    }

    this.updateObj = function(spooElement, success, error, constrains, client) {
        this.objects[spooElement._id] = spooElement;
    };

    this.addObj = function(spooElement, success, error, constrains, client) {
        var items = JSON.parse(localStorage.getItem('objs_' + client)) || {};

        if (items[spooElement._id]) {
            return error("Id already exists");
        }
        if (!spooElement._id) spooElement._id = shortid.generate();
        items[spooElement._id] = spooElement;

        success(items[spooElement._id]);
        localStorage.setItem(JSON.stringify(items));
    };

    this.removeObj = function(spooElement, success, error, constrains, client) {
        delete this.spooElement[spooElement._id];
    };


}

module.exports = localStorageMapper;
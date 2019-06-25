var globalPagingNum = 20;
var shortid = require('shortid');
var localStorage = require('localStorage');

localStorageMapper = function(connectionString, connectionSuccess, connectionError) {

    this.connectionString = connectionString;

    this.objects = {};

    var dbConMain = {};

    Mapper.prototype.connect = function(connectionString, success, error) {

    }

    Mapper.prototype.closeConnection = function(success, error) {

    }


    this.getById = function(id, success, error, constrains, client) {

        var items = JSON.parse(localStorage.getItem('objs_' + client)) || {};
        var item = null;

        Object.keys(items).forEach(function(i) {
            if (items[i]._id == id) item = items[i];
        })
        success(item);
    }


    this.getByCriteria = function(criteria, success, error, constrains, client, flags, all) {

    }


    this.count = function(criteria, success, error, constrains, client, flags) {

      return Object.keys(this.objects).length;
      
    }

    this.update = function(spooElement, success, error, constrains, client) {
        this.objects[spooElement._id] = spooElement;
    };

    this.add = function(spooElement, success, error, constrains, client) {
        var items = JSON.parse(localStorage.getItem('objs_' + client)) || {};

        if (items[spooElement._id]) {
            return error("Id already exists");
        }
        if (!spooElement._id) spooElement._id = shortid.generate();
        items[spooElement._id] = spooElement;

        success(items[spooElement._id]);
        localStorage.setItem(JSON.stringify(items));
    };

    this.remove = function(spooElement, success, error, constrains, client) {
        delete this.spooElement[spooElement._id];
    };


}

module.exports = localStorageMapper;
var globalPagingNum = 20;
var shortid = require('shortid');

storageMapper = function(connectionString, connectionSuccess, connectionError) {
    
    this.connectionString = connectionString;
    
    var dbConMain = {};

  
    this.connectInit = function(success, error) {

    };

    this.connectInit(connectionSuccess, connectionError);

   
    this.closeConnection = function() {
       
    };

    this.createClient = function(name, _key, success, error) {

      
    }

    this.createRegistrationKey = function(email, success, error) {

        //shortid.generate() + shortid.generate()

    }

    this.createUserRegistrationKey = function(email, client, success, error) {

        //var newKey = new UserRegistration({ _id: null, key: 
    }

    this.createPasswordResetKey = function(uId, client, success, error) {

        //shortid.generate() + shortid.generate()

    }

    this.redeemClientActivationKey = function(_key, success, error) {

      
    }

    this.redeemUserActivationKey = function(_key, email, client, success, error) {

      
    }


    this.redeemPasswordResetKey = function(_key, client, success, error) {

     
    }

    this.getClientApplications = function(success, error, client) {
        
    }

    this.checkDeveloperSecret = function(client, secret, success, error) {

       
    }

    this.addClientApplication = function(app, success, error, client) {
        
    }

    this.setClientApplicationVisibility = function(app, value, success, error, client) {
        
    }

    this.setClientApplicationVersion = function(app, value, success, error, client) {
       
    }


    this.addApplication = function(app, success, error) {

    };

    this.updateApplication = function(app, success, error) {

    };

    this.getApplicationsByCriteria = function(criteria, success, error, flags) {

    };

    this.getPublicApplicationsByCriteria = function(criteria, success, error, flags) {

    };


    this.getApplicationById = function(id, success, error, constrains) {
        
    }

   

    this.getObjsByCriteria = function(criteria, success, error, constrains, client, flags, all) {

    }


    this.aggregateObjsByCriteria = function(aggregation, criteria, success, error, constrains, client, flags) {


        switch (aggregation) {
            case 'count':
                // ...
                break;
            default:
                error();
        }

    }

}

module.exports = storageMapper;
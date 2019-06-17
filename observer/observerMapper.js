
var CONSTANTS = {
    MULTITENANCY: {
        ISOLATED: "isolated",
        SHARED: "shared"
    }
}

processorMapper = function(SPOO) {

	this.multitenancy = CONSTANTS.MULTITENANCY.ISOLATED;

	this.SPOO = SPOO;

    this.setMultiTenancy = function(value) {
        this.multitenancy = value;
    };

	this.sandBox = new VM({ sandbox: { SPOO: SPOO, dsl: this, this: this }})

    this.execute = function(dsl, obj, prop, data, callback, client, app, options) {
       	
        this.sandBox.run(new VMScript(dsl));

    }

    this.initObservation = function()
    {

    }

    this.run = function()
    {
    	var self = this;
    	if(this.multitenancy == CONSTANTS.MULTITENANCY.ISOLATED) {

    		SPOO.getObjectFamilies().forEach(function(family)
    		{
    			SPOO.getPersistenceMapper(family).listTenants(function(tenants) {
    				tenants.forEach(function(tenant) {
    					self.getJobs(tenant);
    				})
	    		}, function(error) {

	    		})
    		})

    	}
    	else {

    	}
    }
}

module.exports = processorMapper;
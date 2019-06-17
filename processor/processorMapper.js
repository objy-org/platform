const { VM, VMScript } = require('vm2');

var CONSTANTS = {
    MULTITENANCY: {
        ISOLATED: "isolated",
        SHARED: "shared"
    }
}

processorMapper = function(SPOO) {

	// additional, custom methods

	this.SPOO = SPOO;

	this.multitenancy = CONSTANTS.MULTITENANCY.ISOLATED;

    this.setMultiTenancy = function(value) {
        this.multitenancy = value;
    };

	this.email = function(from, to, subject, body) {

	}

	this.sandBox = new VM({ sandbox: { SPOO: SPOO, dsl: this, this: this }})

    this.execute = function(dsl, obj, prop, data, callback, client, app, user, options) {
        
        if(this.multitenancy == CONSTANTS.MULTITENANCY.ISOLATED)
        {
        	this.sandBox.run(new VMScript(dsl));
        }
        else
        {
        	this.sandBox.run(new VMScript(dsl));
        }
        
    }
}

module.exports = processorMapper;
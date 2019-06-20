const { VM, VMScript } = require('vm2');

var CONSTANTS = {
    MULTITENANCY: {
        ISOLATED: "isolated",
        SHARED: "shared"
    }
}

Mapper = function(SPOO) {
	this.SPOO = SPOO;
	this.multitenancy = CONSTANTS.MULTITENANCY.ISOLATED;
	this.sandBox = new VM({ sandbox: { SPOO: SPOO, dsl: this, this: this }});
}

Mapper.prototype.setMultiTenancy = function(value) {
    this.multitenancy = value;
};

Mapper.prototype.execute = function(dsl, obj, prop, data, callback, client, app, user, options) {
        
        if(this.multitenancy == CONSTANTS.MULTITENANCY.ISOLATED) {
            this.sandBox.run(new VMScript(dsl));
        }
        else {
            this.sandBox.run(new VMScript(dsl));
        }
}



module.exports = Mapper;
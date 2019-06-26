const Mapper = require('./_template.js');
const { VM, VMScript } = require('vm2');

Mapper.prototype.sandBox = new VM({ sandbox: { SPOO: this.SPOO, dsl: this, this: this }});

Mapper.prototype.execute = function(dsl, obj, prop, data, callback, client, app, user, options) {
        
        if(this.multitenancy == this.CONSTANTS.MULTITENANCY.ISOLATED) {
            this.sandBox.run(new VMScript(dsl));
        }
        else {
            this.sandBox.run(new VMScript(dsl));
        }
}

module.exports = Mapper;
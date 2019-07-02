const Mapper = require('./_template.js');
const { VM, VMScript } = require('vm2');

Mapper.prototype.execute = function(dsl, obj, prop, data, callback, client, app, user, options) {
        
        var sandBox = new VM({ sandbox: { SPOO: this.SPOO, dsl: this, this: this }});
        
        if(this.multitenancy == this.CONSTANTS.MULTITENANCY.ISOLATED) {
            sandBox.run(new VMScript(dsl));
        }
        else {
            sandBox.run(new VMScript(dsl));
        }
}

module.exports = Mapper;
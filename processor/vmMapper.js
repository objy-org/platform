const { VM, VMScript } = require('vm2');

activityMapper = function() {

    this.execute = function(dsl, obj, prop, data, callback, client, options) {
     
        var sandBox = new VM({ sandbox: { dsl: this, this: this } })

        callback("Script executed asynchronously");
    }
}
module.exports = activityMapper;
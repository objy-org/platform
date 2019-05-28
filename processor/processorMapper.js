processorMapper = function() {

    this.execute = function(dsl, obj, prop, data, callback, client, options) {
        	console.log("executing: " + dsl);
    }
}
module.exports = processorMapper;
activityMapper = function() {

    this.execute = function(dsl, obj, prop, data, callback, client, options) {
        console.log("EXECUTE");
    }
}
module.exports = activityMapper;
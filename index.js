var Rest = require('./catalog/rest.js');
var OBJY = require('@spootechnologies/objy');

const SPOO = {

    enabledObjectFymilies: {},

    define: function(options) {

        OBJY.define(options);

        if (options.interfaces) {
            options.interfaces.forEach(function(i) {
                if (!enabledObjectFymilies[i]) enabledObjectFymilies[i] = [];
                enabledObjectFymilies[i].push(options.name);
                enabledObjectFymilies[i].push(options.pluralName);
            })
        }

    },

    REST: function(OBJY, options, enabledObjectFymilies) {
        return new Rest(OBJY, options)
    },
    MQTT: function(OBJY, options, enabledObjectFymilies) {
        // TODO...
    }
}

module.exports = SPOO;
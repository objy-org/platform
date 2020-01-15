var Rest = require('./catalog/rest.js');
var OBJY = require('@spootechnologies/objy');

const SPOO = {

    metaMappers: {
        mongoMapper: require('./mappers/MetaMapper.js')
    },

    messageMappers: {
        sendgridMapper: require('./mappers/MessageMapper.js')
    },

    MetaMapper: {},

    OBJY: OBJY,

    //enabledObjectFymilies: {},

    define: function(options) {

        OBJY.define(options);

        /*if (options.interfaces) {
            options.interfaces.forEach(function(i) {
                if (!enabledObjectFymilies[i]) enabledObjectFymilies[i] = [];
                enabledObjectFymilies[i].push(options.name);
                enabledObjectFymilies[i].push(options.pluralName);
            })
        }*/

    },

    REST: function(options, enabledObjectFymilies) {
        return new Rest(OBJY, options)
    },

    /*MQTT: function(options, enabledObjectFymilies) {
        // TODO...
    }*/
}

module.exports = SPOO;
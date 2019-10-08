var Rest = require('./catalog/rest.js');
var OBJY = require('@spootechnologies/objy');

var MetaMongoMapper = require('./mappers/MetaMapper.js');
var MessageSendgridMapper = require('./mappers/MessageMapper.js');

const SPOO = {

    metaMappers: {
        mongoMapper: MetaMongoMapper
    },

    messageMappers: {
        sendgridMapper: MessageSendgridMapper
    },

    MetaMapper: {},

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

    MQTT: function(options, enabledObjectFymilies) {
        // TODO...
    }
}

module.exports = SPOO;
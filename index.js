var Rest = require('./catalog/rest.js');
var OBJY = require('@spootechnologies/objy');

const SPOO = {

    metaPropPrefix: '',

    metaProperties: ['id', 'role', 'applications', 'inherits', 'onCreate', 'onChange', 'onDelete', 'permissions', 'privileges', 'created', 'lastModified'],
    staticProperties: ['name', 'type', 'username', 'password'],

    serialize: function(obj) {

        if (this.metaPropPrefix == '') return obj;

        if (obj.properties) return obj;

        var self = this;

        var nObj = {
            properties: {}
        };

        for (var prop in obj) {
            if (self.metaProperties.indexOf(prop.substr(1)) == -1 || self.staticProperties.indexOf(prop.substr) == -1) {
                nObj.properties[prop] = obj[prop];
            } else nObj[prop.substr(1)] = obj[prop];
        }
        return nObj;
    },

    serializeQuery: function(obj) {

        if (this.metaPropPrefix == '') return obj;

        if (obj.properties) return obj;

        var self = this;

        var nObj = {
            properties: {}
        };

        for (var prop in obj) {
            if (self.metaProperties.indexOf(prop.substr(1)) == -1) {
                if (self.staticProperties.indexOf(prop) != -1) nObj[prop] = obj[prop];
                else nObj['properties.' + prop] = obj[prop];
            } else nObj[prop.substr(1)] = obj[prop];
        }

        delete nObj.properties;
        return nObj;
    },

    deserialize: function(obj) {

        console.info('SPOO', this.metaPropPrefix)

        if (this.metaPropPrefix == '') return obj;

        var self = this;

        var nObj = {};

        for (var prop in JSON.parse(JSON.stringify(obj))) {

            if (self.metaProperties.indexOf(prop) != -1) {
                console.info(self.metaProperties.indexOf(prop), prop)
                nObj[self.metaPropPrefix + prop] = obj[prop];
            } else if (prop != 'properties') nObj[prop] = obj[prop];
        }

        for (var prop in obj.properties) {
            nObj[prop] = obj.properties[prop]
        }

        return nObj;
    },

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
        return new Rest(this, OBJY, options)
    },

    /*MQTT: function(options, enabledObjectFymilies) {
        // TODO...
    }*/
}

module.exports = SPOO;
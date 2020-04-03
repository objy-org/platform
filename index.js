var Rest = require('./catalog/rest.js');

const LEGACY_BLACKLIST = ['$propsAsObj']

const SPOO = {

    legacy: false,

    authorisationsEnabled: false,

    metaPropPrefix: '',

    metaProperties: ['role', 'applications', 'inherits', 'onCreate', 'onChange', 'onDelete', 'permissions', 'privileges', 'created', 'lastModified'],
    staticProperties: ['name', '_id', 'type', 'username', 'password', '$in', '$and', '$or'],
    flagProperties: ['$sort', '$page', '$query'],

    serialize: function(obj) {

        if (this.metaPropPrefix == '') return obj;

        if (obj.properties) return obj;

        var self = this;

        var nObj = {
            properties: {}
        };

        for (var prop in obj) {
            if (self.metaProperties.indexOf(prop.substr(1)) == -1) {
                if (self.staticProperties.indexOf(prop) != -1) nObj[prop] = obj[prop];
                else nObj.properties[prop] = obj[prop];
            } else nObj[prop.substr(1)] = obj[prop];
        }
        return nObj;
    },

    serializeQuery: function(obj) {
        var self = this;

        Object.keys(obj).forEach(function(k) {
            if (LEGACY_BLACKLIST.indexOf(k) != -1) delete obj[k];

            if (self.legacy) {
                if (k.indexOf('properties.') != -1 && k.indexOf('.value') == -1) {
                    obj[k + '.value'] = obj[k];
                    delete obj[k];
                }
            }
        })

        if (this.metaPropPrefix == '') return obj;

        if (obj.properties) return obj;

        var self = this;

        var nObj = {
            properties: {}
        };

        for (var prop in obj) {
            try {
                obj[prop] = JSON.parse(obj[prop]);
            } catch (e) {

            }
        }

        for (var prop in obj) {
            if (self.metaProperties.indexOf(prop.substr(1)) == -1) {
                if (self.staticProperties.indexOf(prop) != -1) nObj[prop] = obj[prop];
                else {
                    if (prop.charAt(0) != '$') nObj['properties.' + prop] = obj[prop];
                    else if (prop.charAt(0) == '$' && self.flagProperties.indexOf(prop) != -1) {
                        if (typeof obj[prop] === 'string') {

                            if (obj[prop].charAt(0) == '-') {
                                if (self.staticProperties.indexOf(obj[prop].substr(1)) != -1) {
                                    nObj[prop] = obj[prop];
                                } else nObj[prop] = "-properties." + obj[prop].substr(1);
                            } else {
                                if (self.staticProperties.indexOf(obj[prop]) != -1) {
                                    nObj[prop] = obj[prop];
                                } else nObj[prop] = "properties." + obj[prop];
                            }

                        } else {
                            nObj[prop] = obj[prop];
                        }
                    } else if (prop.charAt(0) == '$' && self.staticProperties.indexOf(prop) == -1) nObj[prop] = "properties." + obj[prop];
                    else if (prop.charAt(0) == '$' && self.staticProperties.indexOf(prop) != -1) nObj[prop] = obj[prop];
                    else nObj[prop] = obj[prop];
                }
            } else {
                if (self.staticProperties.indexOf(prop) != -1) nObj[prop.substr(1)] = obj[prop];
                else nObj[prop.substr(1)] = "properties." + obj[prop];
            }

        }

        delete nObj.properties;
        return nObj;
    },

    deserialize: function(obj) {

        if (this.metaPropPrefix == '') return obj;

        var self = this;

        var nObj = {};

        var deserialized;

        try {
            deserialized = JSON.parse(JSON.stringify(obj))
        } catch (e) {
            deserialized = obj
        }

        for (var prop in deserialized) {

            if (self.metaProperties.indexOf(prop) != -1) {

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

    OBJY: null,

    //enabledObjectFymilies: {},

    define: function(options) {

        this.OBJY.define(options);

        /*if (options.interfaces) {
            options.interfaces.forEach(function(i) {
                if (!enabledObjectFymilies[i]) enabledObjectFymilies[i] = [];
                enabledObjectFymilies[i].push(options.name);
                enabledObjectFymilies[i].push(options.pluralName);
            })
        }*/

    },

    REST: function(options, enabledObjectFymilies) {
        return new Rest(this, this.OBJY, options)
    },

    /*MQTT: function(options, enabledObjectFymilies) {
        // TODO...
    }*/
}

module.exports = SPOO;
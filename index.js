var Rest = require('./interface/rest.js');

const SPOO = {

    authorisationsEnabled: false,
    allowClientRegistrations: true,
    allowUserRegistrations: true,

     mappers: {
        meta: {
            mongo: require('./mappers/meta/mongo.js')
        },
        communication: {
            sendgrid: require('./mappers/communication/sendgrid.js')
        },
        session: {
            redis: require('./mappers/session/redis.js')
        },
        functionality: {
            objy: require('./mappers/functionality/objy.js')
        }
    },

    REST: function(options) {
        if (options.OBJY) this.OBJY = options.OBJY;
        if (options.OBJY_CATALOG) {
            this.OBJY_CATALOG = options.OBJY_CATALOG;
            this.CATALOG = options.OBJY_CATALOG;
        }
        return new Rest(this, this.OBJY, options)
    },

    /*MQTT: function(options, enabledObjectFymilies) {
        // TODO...
    }*/
}

module.exports = SPOO;
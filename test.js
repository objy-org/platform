var SPOO = require('./');
var Mongo = require('./node_modules/@spootechnologies/objy/mappers/storage/mongoMapper');
// define one or more OBJY object types
const mongoConnection = new Mongo(SPOO.OBJY).connect('mongodb://localhost', function(data) { }, function(data) { });

SPOO.define({
    authable: true,
    name: "user",
    pluralName: "users",
    storage: new Mongo(SPOO.OBJY).useConnection(mongoConnection.getConnection(), () => {}, () => {})
});

SPOO.define({
    name: 'object',
    pluralName: 'objects',
    storage: new Mongo(SPOO.OBJY).useConnection(mongoConnection.getConnection(),() => {}, () => {})
});

var MetaMapper = new SPOO.metaMappers.mongoMapper().connect('mongodb://localhost', function(data) {
    console.info('meta connected')
}, function(data) {
    console.info('meta not connected', data)
});

SPOO.REST({
    port: 8080,
    metaMapper: MetaMapper,
    messageMapper: {
        send: function () {
            console.log ("Sending Email!!", arguments)
        }
    }
}).run();

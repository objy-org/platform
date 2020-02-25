var SPOO = require('./index.js');
var Mongo = require('./node_modules/@spootechnologies/objy/mappers/storage/mongoMapper.js');

SPOO.metaPropPrefix = '_';


var MetaMapper = new SPOO.metaMappers.mongoMapper().connect('mongodb://localhost', function(data) {
    console.info('meta connected')
}, function(data) {
    console.info('meta not connected', data)
})

SPOO.define({
    name: "user",
    pluralName: "users",
    storage: new Mongo(SPOO.OBJY).connect('mongodb://localhost', function(data) {
        console.info('mongo connected')
    }, function(data) {
        console.info('mongo not connected', data)
    }),
})

SPOO.REST({
    metaMapper: MetaMapper,
    port: 80
});
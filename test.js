var SPOO = require('./index.js');
//var Mongo = require('./node_modules/@spootechnologies/objy/mappers/storage/mongoMapper.js');

SPOO.metaPropPrefix = '_';


var MetaMapper = new SPOO.metaMappers.mongoMapper().connect('mongodb://localhost', function(data) {
    console.info('meta connected')
}, function(data) {
    console.info('meta not connected', data)
})

SPOO.define({
    name: "user",
    pluralName: "users"
})

SPOO.define({
    name: "file",
    pluralName: "files"
})

SPOO.REST({
    metaMapper: MetaMapper,
    port: 80
})
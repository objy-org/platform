var SPOO = require('./spoo.js');
var MAPPER = require('./storageMappers/localStorageMapper.js');
var PROCESSOR = require('./processorMappers/processorMapper.js');


SPOO.define({
    name: "SensorItem",
    pluralName: 'SensorItems',
    storage: new MAPPER(),
    processor: new PROCESSOR()
})

SPOO.define({
    name: "Object",
    pluralName: 'Objects',
    storage: new MAPPER(),
    processor: new PROCESSOR()
})

SPOO.define({
    authable: true,
    name: "User",
    pluralName: 'Users',
    storage: new MAPPER(),
    processor: new PROCESSOR()
})



var user = new SPOO.User({});

user.addProperty({test: "124"}).addProperty({event: {type: "event", action:"23"}});

console.log(user);


user.getProperty("event").call();

user.update();

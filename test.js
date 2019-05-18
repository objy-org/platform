var SPOO = require('./spoo.js');
var MAPPER = require('./storageMappers/localStorageMapper.js');
var PROCESSOR = require('./processorMappers/processorMapper.js');

SPOO.hello();


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

user.update();

return;

/*SPOO.Nicole = function(obj)
{
	new SPOO.Obj(obj, '')
}*/



// add one


new SPOO.SensorItem({
    name: "",
    type: "movingitem",
    work: {
        type: "event",
        interval: "P10T",
        action: "dsl.eee"
    },
    bag: {
        type: "bag",
        items: {
            test: "hallo",
            items: {
                evt: {
                    type: "Event",
                    value: "asf"
                }
            }
        }
    }
}).add(function(data, err) {
    console.log(data);
});




{
    "name": "ssdg",
    "test": "23434",
    "permissions": {
        "test" : {
            "admin" : {
                "value": "*"
            }
        }
    }
}


//get/update one


new SPOO.SensorItem("dJZ1SYHqK").get(function(data) {
    console.log(data);

    //data.work.call();

}, function(err) {
    console.log(err);
}, 'test')


return;

new SPOO.SensorItem("123").get(function(data, err) {
    data.setName("hallo").save();
})













return;


console.log(SPOO.processors);


var t = new SPOO.Nicole({
    name: "test",
    properties: {
        action: {
            type: "action",
            dsl: "sdfsdf"
        }
    }
}).add(function(data, err) {
    // console.log(data);

}, 'client', 'app')


t.getProperty("action").call(function() {

}, 'spoo')



SPOO.Nicoles({}).get(function(data) {

}, 'client')

t.getProperty('dsl').call(function(data, err) {

})
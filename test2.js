var SPOO = require('./spoo.js');
//var MAPPER = require('./storageMappers/localStorageMapper.js');
var PROCESSOR = require('./processorMappers/processorMapper.js');
//var OBSERVER = require('./observerMappers/observerMapper.js');

var LOWDBMAPPER = require('./storageMappers/lowDBMapper.js');

var lowDBMapper = new LOWDBMAPPER(null, function(data) {

}, function(error) {

});

var cronObserver;// = new ScheduledObserver('connectionString');

/*
SPOO.define({
    name: "SensorItem",
    pluralName: 'SensorItems',
    storage: new MAPPER(),
    processor: new PROCESSOR()
})*/

SPOO.define({
    name: "Nicole",
    pluralName: 'Nicoles',
    multitenancy: 'database',
    storage: lowDBMapper,
    multitenancy: "database",
    processor: new PROCESSOR(),
    observer: cronObserver
})

/*
SPOO.define({
    authable: true,
    name: "User",
    pluralName: 'Users',
    storage: new MAPPER(),
    processor: new PROCESSOR()
})*/


//i9mJ9GWlgRKhIBKdGKdSzcWkP

            
            //var obj = new SPOO.Object("i9mJ9GWlgRKhIBKdGKdSzcWkP").addProperty({hallo21: "marco"});

            //console.log(obj);

            //obj.addProperty({hallo2: "marco"});

            //console.log(obj);

            /*.update(function(data)
            {
                console.log("updated!");
            }, function(err)
            {

            }, 'spoo');*/

            //SPOO.Nicole({_id: "i9mJ9GWlgRKhIBKdGKdSzcWkP"}).add(function(){},function(){},'spoo');
            

new SPOO.Nicole("i9mJ9GWlgRKhIBKdGKdSzcWkP").get(function(data)
{   
    SPOO.Nicole(data).addProperty({hallo2:2323}).update(function()
    {

    }, function()

    {

    }, 'spoo')

}, function(err)
{

}, 'spoo')
 

  return;

var user = new SPOO.Object({name : "HALLO"}).add(function(data)
    {
        //console.log(data);


        SPOO.Object(data).addProperty({hallo: "marco"}).update(function(data)
            {
                console.log("updated!");
            }, function(err)
            {

            }, 'spoo');

        /*SPOO.Object(data._id).get(function(data)
        {
            console.log("--------------");
             console.log(data);
        }, function(err)
        {

        }, 'spoo')*/
       
    }, function(err)
    {
        console.log(err);
    }, 'spoo');



return;

user.addProperty({ test: "124" }).addProperty({ action: { type: "action", value: "23" } });

user.getProperty("action").call(function(message) {
    console.log(message);
}, 'spoo');


user.update();
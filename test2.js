var SPOO = require('./spoo.js');


var PROCESSOR = require('./processor/processorMapper.js');

var LOWDBMAPPER = require('./storage/lowDBMapper.js');

var lowDBMapper = new LOWDBMAPPER(null, function(data) {

}, function(error) {

});


SPOO.ObjectFamily({
    name: "Nicole",
    pluralName: 'Nicoles',

    persistence: {
        mapper: lowDBMapper,
        multitenancy: 'database'
    },
    processor: {
        multitenancy: 'shared'
    },
    ovserver:  {

    }
})


console.log("sdgsdgd");
console.log(SPOO.objectFamilies);

SPOO.tenant('dsl').app('demoapp')


var n = SPOO.Nicole({ permissions: {
    admin: {
        value: "pux"
    }
}})//.setPermission('admin', {value : "pu"})

n.addProperty('remindme', {value : "test"})
n.setOnChange('default', {value : "SPOO.Nicole({name: 'dsl dsl'}).addProperty('mother', {value: 'fucker'}).add(function(){});dsl.email()"});

//n.removeProperty('remindme')
//n.setOnCreate('default', {value:'dfsdf'})

//console.log(n.properties);


n.update(function(data)
    {

    });


return;
/*
{
    name: "test",
    inherits: [],
    age: "test",

    collection:
    {
        test:
    }
    "$meta":
    {
        name:
        {
            permissions: {},
            onCreate:{
                demo: {
                    value : "sfsdf",
                    trigger: "before"
                }
            }
        },
        "collection.test"
        {

        }
    }
}*/


SPOO.Nicole("IcLnXW35TD,KBCC1UpP5aT8Ue").get(function(data)
{   
    data.addProperty({h333allo232f:2323}).update(function()
    {

    }, function()

    {

    })

}, function(err)
{

})





return;



SPOO.Object("ddsg").get(function(obj)
{
    obj.setPropertyValue('test', "325q2");
})
/*
SPOO.Nicole({
    onCreate: {
        bev:
        {
            value: "Hihi",
            trigger: 'before'
        },
        aft:
        {
            value: "Hihi after",
            trigger: 'after'
        }
    },
    properties:
    {
        test: {
            type: "shortText",
            value: "asfsdf",
            onCreate:
            {
                default:
                {
                    value: "sdgsdg",
                    trigger: 'before'
                }
            }
        },
        int: {
            type: "event",
            interval: "P10D",
            action : "tesr"
        }
    }
}).add(function(data){

    console.log(data);

},function(){});

return;*/

var start = new Date();

for(var i = 0; i<100000;i++){

if(i%99999 == 0)
{
    console.log(i);
    console.log(((new Date().getTime() - start.getTime()) / 1000));
} 


SPOO.Nicole({name: "test"}).addProperty({name: {type: "shortText", value: "sf"}});

}


return;


SPOO.Nicoles({}).get(function(data)
{
    console.log(data);
}, function(err)
{

})


return;

SPOO.Nicole("i9mJ9GWlgRKhIBKdGKdSzcWkP").get(function(data)
{   
    data.addProperty({h333allo232f:2323}).update(function()
    {

    }, function()

    {

    })

}, function(err)
{

})





return;
SPOO.tenant('spoo').app('').user({username: marco}).Nicole()

SPOO.Nicole("i9mJ9GWlgRKhIBKdGKdSzcWkP").get(function(data)
{   
    data.addProperty({hallo232f:2323}).update(function()
    {

    }, function()

    {

    }, 'spoo')

}, function(err)
{

}, 'spoo')
 

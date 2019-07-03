var SPOO = require('./spoo.js');


var PROCESSOR = require('./catalog/processors/vmMapper.js');
var OBSERVER = require('./catalog/observers/intervalMapper.js');
var LOWDBMAPPER = require('./catalog/storage/lowDBMapper.js');
var lowDBMapper = new LOWDBMAPPER({multitenancy: 'database'}, null, function(data) {

}, function(error) {

});


SPOO.ObjectFamily({
    name: "Nicole",
    pluralName: 'Nicoles'
})

console.log(SPOO.mappers)
//new SPOO.Impulse({}).add();

//console.log("sdgsdgd");
//console.log(SPOO.objectFamilies);

SPOO.tenant('dsllj').app('demoapp')


var n = SPOO.Nicole({ onCreate: {
            test:  {
                value: "SPOO.Nicole({}).add(function(data){console.log(data)}, function(err){console.log(err)})",
                trigger: 'before'
            }
    },
    properties: {
    iterval : {
        type: 'event',
        interval: 10000,
        action: 'console.log("interval...")'
    },
    date : {
        type: 'event',
        date: '1',
        action: 'console.log("date...")'

    }},
    permissions: {
    admin: {
        value: "pux"
    }
}}).add(function(data)
{

    console.log(data);

   /* SPOO.Nicole(data._id).remove(function(data)
    {
        console.log(data);
    }, function(err)
    {
        console.log(err)
    })*/
    /*SPOO.Nicoles({_id : data._id}).get(function(data)
    {
        console.log(data[0].aggregatedEvents);
    }, function(err)
    {
        console.log(err)
    })*/
    //console.log(data);
}, function(err)
{
    //console.log(err);
});

return;

n.addProperty('sf', 'sdgsdg').update();

console.log(n)

n.remove();


return;


//.setPermission('admin', {value : "pu"})

n.addProperty('remindme', {value : "test"})
//n.setOnChange('default', {value : "SPOO.Nicole({name: 'dsl dsl'}).addProperty('hello', {value: 'world'}).add(function(){});dsl.email()"});

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
 

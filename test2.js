var SPOO = require('./spoo.js');


var PROCESSOR = require('./processor/processorMapper.js');

var LOWDBMAPPER = require('./storage/lowDBMapper.js');

var lowDBMapper = new LOWDBMAPPER(null, function(data) {

}, function(error) {

});


SPOO.ObjectFamily({
    name: "Nicole",
    pluralName: 'Nicoles',
    multitenancy: 'database',
    storage: lowDBMapper,
    multitenancy: "database",
    processor: new PROCESSOR(),
    observer: null
})



SPOO.tenant('sfasfafs').app('demoapp').user({username: "marco"});

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
        evt: {
            type: "event",
            date: "10",
            action : "tesr"
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


return;

SPOO.Nicole({name: "hallo"}).add(function(data)
{

    //console.log(data);

    data.setOnCreate({default: { value : "saf"}}).setOnChange({default: { value : "saf"}}).removeOnCreate('default').addProperty({
        test: {
            value: "123",
            type: "shortText"
        }
    }).setPropertyOnChange('test', {default: { value : "saf"}});

    console.log(data);
})



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
 

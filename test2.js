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

//SPOO.Nicole({_id: "i9mJ9GWlgRKhIBKdGKdSzcWkP_"}).add(function(){},function(){});


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
 

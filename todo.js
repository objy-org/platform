var SPOO = require('./spoo.js');
var Obj = require('./catalog/inMemoryObject.js')(SPOO);

Obj({}).addProperty('test', {type: 'boolean', value: true, evt : {
	type: 'event',
	interval: 'P10D',
	action: 'dfsfd'
}}).add(function(data)
{
	console.log(data);
})

var SPOO = require('./spoo.js');
var Obj = require('./catalog/inMemoryObject.js')(SPOO);

Obj({}).addProperty('test', {type: 'boolean', value: true}).add(function(data)
{
	console.log(data);
})
// platform.js

var SPOO = require('./spoo.js');
var Obj = require('./catalog/inMemoryObject.js')(SPOO);


var Other = SPOO.define({
	name: "Log",
	pluralName: "Logs",
	persistence: new Persistence(),
	processor: new Processor(SPOO),
	observer: new Observer()
})


Obj({}).addProperty('test', {type: 'boolean', value: true}).add(function(data)
{
	console.log(data);
})


function addObject(obj, client, app)
{
	SPOO
		.client(client)
		.app(app)
		.Obj(obj).add(function(data) {

		}, function(err) {

		})
}
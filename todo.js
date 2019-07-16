var SPOO = require('./spoo.js');

SPOO.define({
	name : "Object",
	pluralName: "Objects"
});


SPOO.Object({name: "test122"}).add(function(data)
{
	console.log("data", data);

	SPOO.Object({inherits: [data._id, "2323"]}).add(function(data_)
	{
		console.log(data_)
	})
})
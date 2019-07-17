var SPOO = require('./spoo.js');

SPOO.define({
	name : "Object",
	pluralName: "Objects"
});


SPOO.Object({name: "test123"}).add(function(data)
{
	console.log("data", data);

	SPOO.Object({inherits: [data._id]}).add(function(data_)
	{
		//console.log(data_)


		SPOO.Object(data_._id).get(function(data__)
			{
				console.log(data_)

				/*data__.removeInherit(data._id).update(function(data___)
				{
					console.log(data___)
				})*/

			}, function(err)
			{
				console.log(err);
			})


	}, function(err)
	{
		console.log(err);
	})
})
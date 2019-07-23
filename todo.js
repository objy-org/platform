var SPOO = require('./spoo.js');



SPOO.define({
    name: "Template",
    pluralName: "Templates"
});


SPOO.define({
    name: "Item",
    pluralName: "Items",
    templateFamily:'Template',
    templateMode: 'strict'
});


SPOO.define({
    name: "sdgsdg",
    pluralName: "dsdsgsdg"
});


SPOO.client("test")
  

SPOO.Template({ name: "test123" }).add(function(data) {
    console.log("data", data);

    console.log("mappers", SPOO.mappers)
  


    SPOO.Item({ inherits: [data._id] }).add(function(data_) {
        //console.log(data_)

        SPOO.Item(data_._id).get(function(data__) {
            console.log("data_", data_)


            /*data__.removeInherit(data._id).update(function(data___)
            {
            	console.log(data___)
            })*/

        }, function(err) {
            console.log(err);
        })


    }, function(err) {


    	
        console.log(err);
    })
})
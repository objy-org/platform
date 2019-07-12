var SPOO = require('./spoo.js');
var bcrypt = require("bcrypt");



var Mongo = require('./catalog/storage/mongoMapper.js');

var m = new Mongo(SPOO, { multitenancy: 'shared' });

m.connect('mongodb://localhost:27017', function(data) {

    console.log("connection", data)



    SPOO.define({
        name: "Impulse",
        pluralName: 'Impulses',
        storage: m
    })


    SPOO.client('mongotest2');

    SPOO.getPersistenceMapper('Impulse').createClient('createtest1', function()
    {

    }, function(e){
        console.log(e)
    })

    SPOO.Impulses({ name: "sss" }, {$page:1}).get(function(data) {
        console.log("mdata", data)

        /*SPOO.Impulse({ name: "sss", properties: { test: 'sd' } }).add(function(data) {
            console.log("removed", data)
        }, function(err) {
            console.log("err", err)
        })*/


        /*SPOO[data[0].role](data[0]._id).remove(function(data)
        {
            console.log("removed", data)
        }, function(err)
        {
            console.log("err", err)
        })*/

    }, function(err) {
        console.log("merr", err)
    })

}, function(err) {
    console.log(err)
})


return;

SPOO.define({
    name: "Impulse",
    pluralName: 'Impulses'
})


SPOO.define({
    name: "User",
    pluralName: 'Users',
    authable: true
})


SPOO.define({
    name: "Str",
    pluralName: 'Strs',
    structure: {
        blah: null
    }
})


console.log(SPOO.Str({}));

return
/*
SPOO.ObjectFamily({
    name: "Asset",
    pluralName: 'Asset',
    persistence: new MongoMapper(SPOO),
    observer: new MongoObserver(SPOO),
    processor: new BullObserver(SPOO)
})

/*

SPOO
    .define('Activity')
    .setPlural('Activities')
    .setProcessor(new ProcessorMapper())
    .setPersistence(new Mapper()),
    .setObserver(new Observer())
    .ml(new MLMapper())
*/

SPOO.tenant('dsl').app('demoapp')

console.log(SPOO.User({}));


SPOO.Users().auth({ username: "sfaf", password: "244" }, function(userPass, dbPass) {
    if (bcrypt.compareSync(userPass, dbPass)) {
        console.log("authenticated")
    }
}, function(err) {

})


var obj = {
    name: 'test',
    expire: {
        date: new Date(),
        action: "this.name+=' (expired)';SPOO.Impulse(obj._id).setName(this.name).update();"
    },
    permissions: {

    }
}

return;


SPOO
    .Impulse()
    .setName('noname')
    .addProperty('test', 'asf')
    .add();
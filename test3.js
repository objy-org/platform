var SPOO = require('./spoo.js');
var bcrypt = require("bcrypt");

SPOO.define({
    name: "Impulse",
    pluralName: 'Impulses'
})


SPOO.define({
    name: "User",
    pluralName: 'Users',
    authable: true
})


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

SPOO.Users().checkAuthentication({ username: "sfaf", password: "244" }, function(userPass, dbPass) {
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
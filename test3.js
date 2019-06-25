var SPOO = require('./spoo.js');


SPOO.ObjectFamily({
    name: "Impulse",
    pluralName: 'Impulses'
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
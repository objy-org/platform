var SPOO = require('./spoo.js');


SPOO.ObjectFamily({
    name: "Impulse",
    pluralName: 'Impulses',
    observer: new ImplicitObserver(SPOO)
})

SPOO.tenant('dsl').app('demoapp')


var obj = {
    name: 'test',
    expire: {
        date: new Date(),
        action: "this.name+=' (expired)';this.update()"
    }
}

new SPOO.Impulse(obj).add();
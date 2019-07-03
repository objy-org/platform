const Mapper = require('./_template.js');
const { VM, VMScript } = require('vm2');
var SPOO = require('./spoo.js');
var Queue = require('bull');


Mapper.sandBox = new VM({ sandbox: { SPOO: this.SPOO, dsl: this, this: this }});

Mapper.jobQueue = new Queue('spoo jobs', {redis : rediscon});

Mapper.jobQueue.process(function(job, done) {
        new Mapper(SPOO).executeFromJob(job.data.dsl, JSON.parse(job.data.obj), JSON.parse(job.prop || {}), job.data.data, );
});

Mapper.jobQueue.on('completed', function(job, result) {
        job.remove();
})

// execute from original caller
Mapper.execute = function(dsl, obj, prop, data, callback, client, app, options) {
        
        if(this.multitenancy == this.CONSTANTS.MULTITENANCY.ISOLATED) {
            this.jobQueue.add({
        		dsl : dsl,
        		obj : JSON.stringify(obj || {}),
        		prop: JSON.pringify(prop || {}),
        		data: JSON.stringify(data || {}),
        		client : client, 
        		app: app,
        		options: JSON.stringify(options || {})
            });
        }
        else {
             this.jobQueue.add({
        		dsl : dsl,
        		obj : JSON.stringify(obj || {}),
        		prop: JSON.pringify(prop || {}),
        		data: JSON.stringify(data || {}),
        		client : client, 
        		app: app,
        		options: JSON.stringify(options || {})
            });
        }
}

// execute single job
Mapper.executeFromJob = function(dsl, obj, prop, data, callback, client, app, options) {
        this.sandBox.run(new VMScript(dsl));
}


module.exports = Mapper;
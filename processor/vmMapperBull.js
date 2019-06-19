var CONSTANTS = {
    MULTITENANCY: {
        ISOLATED: "isolated",
        SHARED: "shared"
    }
}

const { VM, VMScript } = require('vm2');
var SPOO = require('./spoo.js');
var Queue = require('bull');


Mapper = function(SPOO, rediscon) {

	this.jobQueue = new Queue('spoo jobs', {redis : rediscon});;
	this.jobQueue.process(function(job, done) {
        new Mapper(SPOO).executeFromJob(job.data.dsl, JSON.parse(job.data.obj), JSON.parse(job.prop || {}), job.data.data, );
    });

	this.jobQueue.on('completed', function(job, result) {
        job.remove();
    })

	this.multitenancy = CONSTANTS.MULTITENANCY.ISOLATED;
	this.sandBox = new VM({ sandbox: { SPOO: SPOO, dsl: this, this: this }})
}


Mapper.prototype.setMultiTenancy = function(value) {
    this.multitenancy = value;
};

// execute from original caller
Mapper.prototype.execute = function(dsl, obj, prop, data, callback, client, app, options) {
        
        if(this.multitenancy == CONSTANTS.MULTITENANCY.ISOLATED) {
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
Mapper.prototype.executeFromJob = function(dsl, obj, prop, data, callback, client, app, options) {
        this.sandBox.run(new VMScript(dsl));
}


module.exports = Mapper;
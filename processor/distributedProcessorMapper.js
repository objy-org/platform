var CONSTANTS = {
    MULTITENANCY: {
        ISOLATED: "isolated",
        SHARED: "shared"
    }
}

const { VM, VMScript } = require('vm2');
var SPOO = require('./spoo.js');
var Queue = require('bull');

var jobQueue = new Queue('spoo jobs', {redis : 'redisconnectionstring'});

processorMapper = function(SPOO) {

	this.multitenancy = CONSTANTS.MULTITENANCY.ISOLATED;

    this.setMultiTenancy = function(value) {
        this.multitenancy = value;
    };

	/*
	*	ADDITIONAL METHODS HERE
	*/


	this.sandBox = new VM({ sandbox: { SPOO: SPOO, dsl: this, this: this }})

	// execute from original caller
    this.execute = function(dsl, obj, prop, data, callback, client, app, options) {

        jobQueue.add({
        		dsl : dsl,
        		obj : JSON.stringify(obj || {}),
        		prop: JSON.pringify(prop || {}),
        		data: JSON.stringify(data || {}),
        		client : client, 
        		app: app,
        		options: JSON.stringify(options || {})
            });

    }

    // execute from job queue
    this.executeFromJob = function(dsl, obj, prop, data, callback, client, app, options) {
        this.sandBox.run(new VMScript(dsl));
    }
}




jobQueue.process(function(job, done) {

        new processorMapper(SPOO).executeFromJob(job.data.dsl, JSON.parse(job.data.obj), JSON.parse(job.prop || {}), job.data.data, );

    });

jobQueue.on('completed', function(job, result) {
        job.remove();
    })

module.exports = processorMapper;
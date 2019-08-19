var Global = require('./_template.js');
const { VM, VMScript, NodeVM } = require('vm2');
var Queue = require('bull');


Mapper = function(SPOO) {
    return Object.assign(new Global(SPOO), {

        sandBox: new NodeVM({ console: 'inherit', sandbox: { SPOO: this.SPOO, dsl: this, this: this } }),
        jobQueue: null,

        init: function(redisCon) {

            var self = this;

            console.warn('initializing');

            this.jobQueue = new Queue('spoo jobs', redisCon);

            this.sandBox.on('console.info', function(message) {
                console.warn('msg', message);
            })

            this.jobQueue.process(function(job, done) {
                console.warn('executing...')
                try {
                    self.sandBox.run(job.data.dsl);
                } catch (e) {
                    console.warn('error', e)
                }
            });

            this.jobQueue.on('completed', function(job, result) {
                job.remove();
            })
        },

        execute: function(dsl, obj, prop, data, callback, client, app, options) {

            if (this.multitenancy == this.CONSTANTS.MULTITENANCY.ISOLATED) {

                this.jobQueue.add({
                    dsl: dsl,
                    obj: JSON.stringify(obj || {}),
                    prop: JSON.stringify(prop || {}),
                    data: JSON.stringify(data || {}),
                    client: client,
                    app: app,
                    options: JSON.stringify(options || {})
                });
            } else {
                this.jobQueue.add({
                    dsl: dsl,
                    obj: JSON.stringify(obj || {}),
                    prop: JSON.stringify(prop || {}),
                    data: JSON.stringify(data || {}),
                    client: client,
                    app: app,
                    options: JSON.stringify(options || {})
                });
            }

            callback();

        },


        executeFromJob: function(dsl, obj, prop, data, callback, client, app, options) {

            try {
                this.sandBox.run(dsl);
            } catch (e) {
                console.warn('error', e)
            }
        }
    })
}

module.exports = Mapper;
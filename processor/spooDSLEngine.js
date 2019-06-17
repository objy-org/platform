const { VM, VMScript } = require('vm2');
var cluster = require('cluster');

var numCPUs = 3;

if (cluster.isMaster) {
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork(); 
    }
} else {

 function _getById(role) {
        switch (role) {
            case 'object':
                return 'getObjectById';
                break;
            case 'template':
                return 'getTemplateById';
                break;
            case 'user':
                return 'getUserById';
                break;
            case 'eventlog':
                return 'getEventLogById';
                break;
            case 'file':
                return 'getFileById';
                break;
            case 'objects':
                return 'findObjects';
                break;
            case 'templates':
                return 'findTemplates';
                break;
            case 'users':
                return 'findUsers';
                break;
            case 'eventlogs':
                return 'findEventLogs';
                break;
            case 'files':
                return 'findFiles';
                break;
            default:
                return 'getObjectById';
        }
    }

    function _getFindMany(role) {
        switch (role) {
            case 'objects':
                return 'findObjects';
                break;
            case 'templates':
                return 'findTemplates';
                break;
            case 'users':
                return 'findUsers';
                break;
            case 'eventlogs':
                return 'findEventLogs';
                break;
            case 'files':
                return 'findFiles';
                break;
            default:
                return 'findObjects';
        }
    }

    function _getFindManyAll(role) {
        switch (role) {
            case 'objects':
                return 'findAllObjects';
                break;
            case 'templates':
                return 'findTemplates';
                break;
            case 'users':
                return 'findUsers';
                break;
            case 'eventlogs':
                return 'findEventLogs';
                break;
            case 'files':
                return 'findFiles';
                break;
            default:
                return 'findObjects';
        }
    }

    function _singleInstance(role) {
        switch (role) {
            case 'object':
                return 'Obj';
                break;
            case 'template':
                return 'Template';
                break;
            case 'user':
                return 'User';
                break;
            case 'eventlog':
                return 'EventLog';
                break;
            case 'file':
                return 'File';
                break;
            default:
                return 'Obj';
        }
    }

    function _singleMultiInstance(role) {
        switch (role) {
            case 'objects':
                return 'Obj';
                break;
            case 'templates':
                return 'Template';
                break;
            case 'users':
                return 'User';
                break;
            case 'eventlogs':
                return 'EventLog';
                break;
            case 'files':
                return 'File';
                break;
            default:
                return 'Obj';
        }
    }

    function _aggregateMulti(role) {
        switch (role) {
            case 'objects':
                return 'aggregateObjects';
                break;
            case 'templates':
                return 'aggregateTemplates';
                break;
            case 'users':
                return 'aggregateUsers';
                break;
            case 'eventlogs':
                return 'aggregateEventLogs';
                break;
            case 'files':
                return 'aggregateFiles';
                break;
            default:
                return 'aggregateObjects';
        }
    }

    function _aggregateMulti(role) {
        switch (role) {
            case 'objects':
                return 'aggregateObjects';
                break;
            case 'templates':
                return 'aggregateTemplates';
                break;
            case 'users':
                return 'aggregateUsers';
                break;
            case 'eventlogs':
                return 'aggregateEventLogs';
                break;
            case 'files':
                return 'aggregateFiles';
                break;
            default:
                return 'aggregateObjects';
        }
    }


    function getFlags(params) {

        var newParams = {};
        if (params) {
            newParams.sort = params.$sort;
            newParams.limit = params.$limit;
            newParams.page = params.$page;
        }

        return newParams;
    }

// SPOO, null, client, obj, prop, data, callback, false
var DSLExecution = function(SPOO, dsl, privileges, client, object, value, paramData, accessToken, doneCallback, isSandbox) {

        this.SPOO = SPOO || gSPOO;

        this.value = value;

        this.object = object;

        this.param = paramData;

        this.client = client;

        this.isSandbox = isSandbox;


        this.global;

        this.sync = false;

        this.eachSet = false;
        this.eachExecDsl = null;

        this.processPage;

        this.entity;
        this.property;

        this.inherit;

        this.entities;

        this.newValue;

        this.finalUpdatable;

        this.finalObject;


        this.sBox = new VM({ sandbox: { dsl: this, this: this } })

        this.Self = function() {
            switch (this.object.role) {
                case 'object':
                    return this._Object(this.object._id);
                    break;
            }
        }

       
        this.Object = function(payload) {
            var self = this;
            this.finalUpdatable = 'object';

            console.log("USER");
            self.entity = payload

            return this;
        }

        this.Objects = function(payload) {
            var self = this;
            this.finalUpdatable = 'objects';

            console.log("USER");
            self.entity = payload

            return this;
        }

        this.get = function(callback) {
            var self = this;

            if (typeof self.entity == 'string') {
                console.log("d");
                SPOO[_getById(self.finalUpdatable)](self.entity, function(data) {

                    if (data.role == 'user') data.password = "*";

                    try {
                        data = new SPOO[_singleInstance(self.finalUpdatable)](data);
                        console.log("spooObj");
                        console.log(data);

                        data.save = function() {

                            if (self.isSandbox) {
                                if (callback) callback({ message: "Sandbox mode! No data will be persisted" }, false);
                                return;
                            }

                            data.update(function() {}, function() {}, self.constrains, self.client);
                        }

                        console.log("success");
                    } catch (e) {

                    }

                    callback(data, false);
                }, function(err) {
                    console.log("err");
                    console.log(err);
                    callback(err, true);
                }, this.constrains, this.client, (getFlags(self.entity) || {}));
            } else if (typeof self.entity == 'object') {
                console.log("d");

                //if(!self.finalUpdatable['$page']) self.finalUpdatable['$page'] = 0;

                var flags = getFlags(self.entity);


                SPOO[_getFindMany(self.finalUpdatable)](paramsToObject(self.entity), function(data) {

                    //self.email('marco.boelling@web.de', 'marco.boelling@web.de', 'get: ', JSON.stringify(self.entity) + " -- " + JSON.stringify(data))

                    var i;
                    for (i = 0; i < data.length; i++) {
                        try {

                            data[i] = new SPOO[_singleMultiInstance(self.finalUpdatable)](data[i]);
                            console.log("spooObj");
                            console.log(data[i]);

                            if (data[i].role == 'user') data[i].password = "*";

                            data[i].save = function() {

                                if (self.isSandbox) {
                                    if (callback) callback({ message: "Sandbox mode! No data will be persisted" }, false);
                                    return;
                                }

                                this.update(function() {}, function() {}, self.constrains, self.client);
                            }

                            console.log("success");
                        } catch (e) {

                        }
                    }

                    data.count = function(success_, error_) {
                        SPOO[_aggregateMulti(self.finalUpdatable)]('count', paramsToObject(self.entity), success_,
                            error_, self.constrains, self.client);
                    }


                    callback(data, false);
                }, function(err) {
                    console.log("err");
                    console.log(err);
                    callback(err, true);
                }, this.constrains, this.client, (flags || {}));
            }

        }

        this.count = function(callback) {
            var self = this;

            if (typeof self.entity == 'string') {

            } else if (typeof self.entity == 'object') {
                console.log("d");

                SPOO[_aggregateMulti(self.finalUpdatable)]('count', paramsToObject(self.entity), function(data) {
                        callback(data, false);
                    },
                    function(data) {
                        callback(data, true);
                    }, self.constrains, self.client);

            }

        }

        this.processAll = function(callback) {
            var self = this;

            // self.email('marco.boelling@web.de', 'marco.boelling@web.de', 'process page', (self.processPage || -1).toString())

            if (!self.processPage) {


                var flags = getFlags(self.entity);


                SPOO[_aggregateMulti(self.finalUpdatable)]('count', paramsToObject(self.entity), function(data) {


                        var pages = Math.ceil((data.result / 20));

                        //self.email('marco.boelling@web.de', 'marco.boelling@web.de', 'total pages', pages.toString())

                        var i;
                        for (i = 1; i < pages + 1; i++) {

                            //if(!flags.page) flags.page = i;

                            if (i > 0) self.forkProcess(i);

                            //self.email('marco.boelling@web.de', 'marco.boelling@web.de', 'page counter', i.toString())

                            /*   SPOO[_getFindMany(self.finalUpdatable)](paramsToObject(self.entity), function(data) {

                            var i;
                            for (i = 0; i < data.length; i++) {
                                try {

                                    data[i] = new SPOO[_singleMultiInstance(self.finalUpdatable)](data[i]);
                                    console.log("spooObj");
                                    console.log(data[i]);

                                    data[i].save = function() {

                                        if (self.isSandbox) {
                                            if (callback) callback({ message: "Sandbox mode! No data will be persisted" }, false);
                                            return;
                                        }

                                        this.update(function() {}, function() {}, self.constrains, self.client);
                                    }

                                    console.log("success");
                                } catch (e) {

                                }
                            }

                            callback(data, false);
                        }, function(err) {
                            console.log("err");
                            console.log(err);
                            callback(err, true);
                        }, this.constrains, this.client, (flags || {}));

*/

                            //  if(flags.page) return;

                        }


                    },
                    function(data) {
                        callback(data, true);
                    }, self.constrains, self.client);


            } else {

                //self.email('marco.boelling@web.de', 'marco.boelling@web.de', 'page counter x', (self.processPage || "xxx").toString())

                var flags = {
                    page: self.processPage
                }

                SPOO[_getFindMany(self.finalUpdatable)](paramsToObject(self.entity), function(data) {

                    var i;
                    for (i = 0; i < data.length; i++) {
                        try {

                            data[i] = new SPOO[_singleMultiInstance(self.finalUpdatable)](data[i]);
                            console.log("spooObj");
                            console.log(data[i]);
                            if (data[i].role == 'user') data[i].password = "*";

                            data[i].save = function() {

                                if (self.isSandbox) {
                                    if (callback) callback({ message: "Sandbox mode! No data will be persisted" }, false);
                                    return;
                                }

                                this.update(function() {}, function() {}, self.constrains, self.client);
                            }

                            console.log("success");
                        } catch (e) {

                        }
                    }

                    callback(data, false);
                }, function(err) {
                    console.log("err");
                    console.log(err);
                    callback(err, true);
                }, this.constrains, this.client, (flags || {}));

                //  if(flags.page) return;
            }



        }

        this.add = function(callback) {
            var self = this;

            if (self.isSandbox) {
                if (callback) callback({ message: "Sandbox mode! No data will be persisted" }, false);
                return;
            }

            if (typeof self.entity == 'object' && !Array.isArray(self.entity)) {
                console.log("add single entity");

                if (Array.isArray(self.entity.properties)) propsSerialize(self.entity);

                new SPOO[_singleInstance(self.finalUpdatable)](self.entity).add(function(data) {

                    try {
                        data = new SPOO[_singleInstance(self.finalUpdatable)](data);
                        if (data.role == 'user') data.password = "*";
                        console.log("spooObj");
                        console.log(data);
                        data.save = function() {
                            if (self.isSandbox) {
                                if (callback) callback({ message: "Sandbox mode! No data will be persisted" }, false);
                                return;
                            }
                            data.update(function() {}, function() {}, self.constrains, self.client);
                        }

                        console.log("success");
                    } catch (e) {

                    }

                    if (callback) callback(data, false);
                }, function(err) {
                    console.log("err");
                    console.log(err);
                    if (callback) callback(err, true);
                }, self.constrains, self.client);
            } else if (Array.isArray(self.entity)) {
                console.log("add multiple entities");
                console.log(self.entity);

                var i;
                for (i = 0; i < self.entity.length; i++) {
                    var entity = self.entity[i];

                    if (Array.isArray(entity.properties)) propsSerialize(entity);

                    new SPOO[_singleMultiInstance(self.finalUpdatable)](entity).add(function(data) {

                        try {
                            data = new SPOO[_singleInstance(self.finalUpdatable)](data);
                            console.log("spooObj");

                            if (data.role == 'user') data.password = "*";

                            console.log(data);
                            data.save = function() {
                                if (self.isSandbox) {
                                    if (callback) callback({ message: "Sandbox mode! No data will be persisted" }, false);
                                    return;
                                }
                                data.update(function() {}, function() {}, self.constrains, self.client);
                            }

                            console.log("success");
                        } catch (e) {

                        }

                        if (callback) callback(data, false);
                    }, function(err) {
                        console.log("err");
                        console.log(err);
                        if (callback) callback(err, true);
                    }, self.constrains, self.client);

                }
            }
        }

        this.delete = function(callback) {
            var self = this;

            if (self.isSandbox) {
                if (callback) callback({ message: "Sandbox mode! No data will be deleted" }, false);
                return;
            }

            if (typeof self.entity == 'string') {
                console.log("d");
                new SPOO[_singleInstance(self.finalUpdatable)](self.entity).remove(function(data) {

                    console.log("success");
                    if (callback) callback(data, false);
                }, function(err) {
                    console.log("err");
                    console.log(err);
                    if (callback) callback(err, true);
                }, this.constrains, this.client);
            }

        }

        this.execute = function(dsl, processPage) {
            this.dsl = dsl;
            var self = this;

            //this.email('marco.boelling@web.de', 'marco.boelling@web.de', 'init ae', " pp: " + processPage)


            if (processPage) this.processPage = processPage;

            try {
                //vm.runInNewContext(dsl, { dsl : this, this:this});


                this.sBox.run(new VMScript(dsl));

            } catch (e) {
                console.log('dsl execution error');
                console.log(e);
            }

            process.on('uncaughtException', function(err) {
                console.log('Caught exception: ' + err);

                //self.email('marco.boelling@itam-group.com', 'marco.boelling@itam-group.com', 'Caught exception', err)

            });


        }

        this.forkProcess = function(page) {
            var self = this;

            new Promise(function(fulfill, reject) {
                //new ActivityEngine(SPOO, {}, constrains, client, object, value, notPermitted).execute(dsl);

                jobQueue.add({
                    constrains: self.constrains,
                    client: self.client,
                    object: JSON.stringify(self.object || self.user || self.template || self.eventlog || {}),
                    value: self.value,
                    dsl: self.dsl,
                    accessToken: self.accessToken,
                    paramData: self.param,
                    processPage: page
                });

                //asyncCallback();

                //self.email('marco.boelling@itam-group.com', 'marco.boelling@itam-group.com', 'forked', (page || -1).toString())

            }).then(function() {
                console.log("activity done");
                //asyncCallback();
            }, function(err) {
                console.log("activity failed");
                //asyncCallback();
                console.log(err);
            });

        }

        this.done = function() {
            if (doneCallback) doneCallback();
        }

        this.Sync = function() {
            this.sync = true;

            return this;
        }

        this.Value = function(payload) {
            if (payload) {
                this.newValue = payload;
            } else {
                if (payload == false) this.newValue = false;
                else this.newValue = undefined;
            }

            return this;
        }


        this.Property = function(payload) {
            var self = this;

            if (typeof(payload) == 'string') {
                this.property = payload;
            } else if (typeof(payload) == 'object') {
                this.property = payload;
            }
            return this;
        }

        this.Inherit = function(payload) {
            var self = this;

            if (typeof(payload) == 'string') {
                this.inherit = payload;
            }
            return this;
        }

        this.execute(dsl);

        return this;
    }
   
}

process.on('unhandledRejection', (reason, p) => {

});

module.exports = DSLExecution;
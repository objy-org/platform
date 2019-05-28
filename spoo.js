var moment = require('moment');
var shortid = require('shortid');

var CONSTANTS = {

    EVENT: {
        TYPE_RECURRING: 'recurring',
        TYPE_TERMINATING: 'terminating',
        ACTION: {
            TYPE_AUTORENEW: 'autorenew',
            TYPE_CONFIRM: 'confirm',
            TYPE_PROTOCOL: 'protocol'
        }
    },
    PROPERTY: {
        TYPE_SHORTTEXT: 'shortText',
        TYPE_LONGTEXT: 'longText',
        TYPE_INDEXEDTEXT: 'indexedText',
        TYPE_NUMBER: 'number',
        TYPE_DATE: 'date',
        TYPE_SHORTID: 'shortId',
        //TYPE_DURATION : 'duration',
        TYPE_REF_OBJ: 'objectRef',
        TYPE_REF_USR: 'userRef',
        TYPE_REF_FILE: 'fileRef',
        TYPE_PROPERTY_BAG: 'bag',
        TYPE_BOOLEAN: 'boolean',
        TYPE_ARRAY: 'array',
        TYPE_EVENT: 'event',
        TYPE_ACTION: 'action',
        TYPE_JSON: 'json'
    }
}


function NoOnChangeException(message) {
    this.message = "onChange not found";
    this.name = 'NoOnChangeException';
}

function NoMetaException(message) {
    this.message = "meta not found";
    this.name = 'NoMetaException';
}

function NoOnDeleteException(message) {
    this.message = "onDelete not found";
    this.name = 'NoOnDeleteException';
}

function NoEventIdException(message) {
    this.message = "No Event ID provided";
    this.name = 'NoEventIdException';
}

function InvalidTypeException(message) {
    this.message = message + " is not a valid type";
    this.name = 'InvalidTypeException';
}

function InvalidValueException(value, type) {
    this.message = value + " is not valid. Type must be: " + type;
    this.name = 'InvalidValueException';
}

function InvalidFormatException() {
    this.message = "Invlid format";
    this.name = 'InvalidFormatException';
}

function DuplicatePropertyException(message) {
    this.message = "Property " + message + " already exists in this object";
    this.name = 'DuplicatePropertyException';
}

function DuplicateActionException(message) {
    this.message = "Action " + message + " already exists in this object";
    this.name = 'DuplicateActionException';
}

function DuplicateApplicationException(message) {
    this.message = "Application " + message + " already exists in this object";
    this.name = 'DuplicateApplicationException';
}

function NoSuchApplicationException(message) {
    this.message = "Application " + message + " does not exist in this object";
    this.name = 'NoSuchApplicationException';
}

function NoSuchReminderException(message) {
    this.message = "Reminder " + message + " does not exist in this event";
    this.name = 'NoSuchReminderException';
}

function DuplicateEventException(message) {
    this.message = "Event " + message + " already exists in this object";
    this.name = 'DuplicateEventException';
}

function NoSuchTemplateException(message) {
    this.message = "Template id " + message + " does not exist";
    this.name = 'NoSuchTemplateException';
}

function NotAnEventException(message) {
    this.message = "Property " + message + " is not an event";
    this.name = 'NotAnEventException';
}

function NoSuchObjectException(message) {
    this.message = "Object id " + message + " does not exist";
    this.name = 'NoSuchObjectException';
}

function NoSuchPropertyException(message) {
    this.message = "Property " + message + " does not exist in this object";
    this.name = 'NoSuchPropertyException';
}

function NoSuchEventException(message) {
    this.message = "Event " + message + " does not exist in this object";
    this.name = 'NoSuchEventException';
}

function PropertyNotFoundException(message) {
    this.message = "Property " + message + " does not exist in this object";
    this.name = 'PropertyNotFoundException';
}

function MissingAttributeException(message) {
    this.message = "Missing attibute " + message + " in this object";
    this.name = 'MissingAttributeException';
}

function CallbackErrorException(message) {
    this.message = message;
    this.name = 'CallbackErrorException';
}

function InvalidDateException(message) {
    this.message = message + " is not a valid date";
    this.name = 'InvalidDateException';
}

function InvalidActionException(message) {
    this.message = message + " is not a valid event action";
    this.name = 'InvalidActionException';
}

function InvalidDataTypeException(message, type) {
    this.message = message + " is not of type " + type;
    this.name = 'InvalidDataTypeException';
}

function NotATemplateExteptopn(message) {
    this.message = message + " is not a template";
    this.name = 'NotATemplateExteptopn';
}

function InvalidPrivilegeException(message) {
    this.message = "Invalid privileges format";
    this.name = 'InvalidPrivilegeException';
}

function NoSuchPrivilegeException(message) {
    this.message = "Privilege does not exist";
    this.name = 'NoSuchPrivilegeException';
}

function NoSuchPermissionException(message) {
    this.message = "Permission " + message + " does not exist";
    this.name = 'NoSuchPermissionException';
}

function InvalidPermissionException(message) {
    this.message = "Permission format invalid";
    this.name = 'InvalidPermissionException';
}

function InvalidEventIdException(message) {
    this.message = "Event ID format not valid: " + message;
    this.name = 'InvalidEventIdException';
}


function NoHandlerProvidedException(message) {
    this.message = "No handler provided " + message;
    this.name = 'NoHandlerProvidedException';
}

function HandlerExistsException(message) {
    this.message = "Handler " + message + " already exists";
    this.name = 'HandlerExistsException';
}

function HandlerNotFoundException(message) {
    this.message = "Handler " + message + " not found";
    this.name = 'HandlerNotFoundException';
}

function InvalidArgumentException(message) {
    this.message = "Invalid argument";
    this.name = 'InvalidArgumentException';
}

function InvalidHandlerException(message) {
    this.message = "Invalid handler";
    this.name = 'InvalidHandlerException';
}



var SPOO = {

    self: this,

    instance: this,

    activeTenant:null,

    activeUser:null,

    activeApp:null,

    tenant: function(tenant)
    {
        if(!tenant) throw new Error("No tenant specified");
        this.activeTenant = tenant;

        return this;
    },

    user: function(user)
    {
        if(!user) throw new Error("No user specified");
        this.activeUser = user;

        return this;
    },

    app: function(app)
    {
        if(!app) throw new Error("No app specified");
        this.activeApp = app;

        return this;
    },

    define: function(params) {

        if (!params.name || !params.storage || !params.pluralName || !params.processor) {
            throw new Error("Invalid arguments");
        }

        this[params.name] = function(obj) {

            if(params.authable)
            {
                obj.username = obj.username || null;
                obj.email = obj.email || null;
                obj.password = obj.password || null;
                obj.privileges = SPOO.PrivilegesChecker(obj) || {};
                obj.spooAdmin = obj.spooAdmin || false;

                obj.addPrivilege = function(privilege) {
                    new SPOO.PrivilegeChecker(obj, privilege);
                    return obj;
                };

                obj.setUsername = function(username) {
                    this.username = username;
                    return obj;
                }

                obj.setEmail = function(email) {
                    this.email = email;
                    return obj;
                }

                obj.setPassword = function(password) {
                    // should be encrypted at this point
                    this.password = password;
                    return obj;
                }

                obj.removePrivilege = function(privilege) {
                    new SPOO.PrivilegeRemover(obj, privilege);
                    return obj;
                };
            }

            return new SPOO.Obj(obj, params.name, this);
        }

        this[params.pluralName] = function(objs) {

            
            if (!objs) throw new Error("No params defined");

            return new SPOO.Objs(objs, params.name, this);

            
        }

        this.plugInMapper(params.name, params.storage, params.multitenancy);

        this.plugInProcessor(params.name, params.processor);
    },
    
    ObjectFamily: function(params)
    {
        this.define(params);
    },

    mappers: {},

    plugInMapper: function(name, mapper, multitenancy) {
        if (!name) throw new Error("No mapper name provided");
        this.mappers[name] = mapper;
        this.mappers[name].setMultiTenancy(multitenancy || "tenantIdentifier");
    },

    processors: {},

    plugInProcessor: function(name, processor) {
        if (!name) throw new Error("No mapper name provided");
        this.processors[name] = processor;
    },

    ConditionsChecker: function(property, value) {


        if (property.hasOwnProperty('conditions')) {

            //new ConditionEngine(undefined, property, undefined, value).execute(property.conditions);
        }
    },

    execProcessorAction: function(dsl, obj, prop, data, callback, client, options) {
        if (!this.processors[obj.role]) throw new Error("No Processor registered");

        this.processors[obj.role].execute(dsl, obj, prop, data, callback, client, options);
    },

    getElementPermisson: function(element) {

        if (!element) return {};
        else if (!element.permissions) return {};
        else return element.permissions;
    },

    getTemplateFieldsForObject: function(obj, templateId, success, error, client) {

        this.getTemplateById(templateId, function(template) {

                if (!template) {
                    error('no such template');
                    return;
                }

                if (template.type) {
                    if (!obj.type) obj.type = template.type;
                }

                if (template.onCreate) {
                    if (!obj.onCreate) obj.onCreate = template.onCreate;
                    if (!obj.onCreateOverwritten) {
                        if (!obj.onCreate) obj.onCreate = template.onCreate;
                    }
                }



                if (template.onDelete) {
                    if (!obj.onDelete) obj.onDelete = template.onDelete;
                    if (!obj.onDeleteOverwritten) {
                        if (!obj.onDelete) obj.onDelete = template.onDelete;
                    }
                }

                var propertyKeys = Object.keys(template.properties);

                var derievedProps = {};
                propertyKeys.forEach(function(property) {
                    if (!obj.properties.hasOwnProperty(property)) {

                        template.properties[property].template = templateId;

                        if (template.properties[property].overwritten) delete template.properties[property].overwritten;

                        var cloned = JSON.parse(JSON.stringify(template.properties[property]));

                        obj.properties[property] = cloned;

                    } else {
                        obj.properties[property].template = templateId;
                        obj.properties[property].overwritten = true;

                        if (!obj.properties[property].overwrittenOnCreate) {
                            if (!obj.properties[property].onCreate) obj.properties[property].onCreate = template.properties[property].onCreate;
                        }
                        if (!obj.properties[property].overwrittenOnChange) {
                            if (!obj.properties[property].onChange) obj.properties[property].onChange = template.properties[property].onChange;
                        }
                        if (!obj.properties[property].overwrittenOnDelete) {
                            if (!obj.properties[property].onDelete) obj.properties[property].onDelete = template.properties[property].onDelete;
                        }
                        if (!obj.properties[property].overwrittenMeta) {
                            if (!obj.properties[property].meta) obj.properties[property].meta = template.properties[property].meta;
                        }

                        function getBagProperties(objBag, tmplBag) {


                            if (!objBag) {
                                objBag = {};
                                objBag[Object.keys(tmplBag)[0]] = tmplBag;


                            } else {
                                if (!objBag.overwritten) {
                                    if (objBag.permissions) objBag.permissions = Object.assign(objBag.permissions, tmplBag.permissions);
                                    else objBag.permissions = tmplBag.permissions;
                                }

                            }

                            objBag.template = template._id;



                            if (!objBag.overwrittenOnCreate) objBag.onCreate = tmplBag.onCreate;
                            if (!objBag.overwrittenOnChange) objBag.onChange = tmplBag.onChange;
                            if (!objBag.overwrittenOnDelete) objBag.onDelete = tmplBag.onDelete;
                            if (!objBag.overwrittenMeta) objBag.onDelete = tmplBag.meta;

                            if (objBag.type == CONSTANTS.PROPERTY.TYPE_PROPERTY_BAG && tmplBag.type == CONSTANTS.PROPERTY.TYPE_PROPERTY_BAG) {

                                var templateInnerKeys = Object.keys(tmplBag.properties);
                                templateInnerKeys.forEach(function(templKey) {


                                    var hasProp = false;
                                    var innerPropKeys = Object.keys(objBag.properties);
                                    innerPropKeys.forEach(function(objKey) {
                                        if (templKey == objKey) hasProp = true;
                                    })

                                    if (!hasProp) {


                                        objBag.properties[templKey] = tmplBag.properties[templKey];
                                        objBag.properties[templKey].template = template._id;
                                    } else {
                                        if (objBag.properties[templKey].value === undefined && tmplBag.properties[templKey].hasOwnProperty('value')) {
                                            if (objBag.properties[templKey].triggered) tmplBag.properties[templKey].triggered = objBag.properties[templKey].triggered;
                                            objBag.properties[templKey] = tmplBag.properties[templKey];
                                            objBag.properties[templKey].template = template._id;
                                        }


                                    }


                                    if (tmplBag.properties[templKey].type == CONSTANTS.PROPERTY.TYPE_PROPERTY_BAG)
                                        getBagProperties(objBag.properties[templKey], tmplBag.properties[templKey])
                                    else objBag.properties[templKey].template = template._id;

                                })

                            } else {
                                objBag.template = template._id;
                            }
                        }

                        getBagProperties(obj.properties[property], template.properties[property]);



                    }
                });



                if (template.applications)
                    if (Array.isArray(template.applications)) {

                        if (!obj.applications) obj.applications = [];

                        template.applications.forEach(function(app) {

                            if (obj.applications.indexOf(app) == -1) obj.applications.push(app);
                        })
                    }

                var permissionKeys = Object.keys(template.permissions);
                var derievedPermissions = {};
                permissionKeys.forEach(function(permission) {
                    if (!obj.permissions.hasOwnProperty(permission)) {
                        template.permissions[permission].template = templateId;
                        var cloned = JSON.parse(JSON.stringify(template.permissions[permission]));
                        obj.permissions[permission] = cloned;
                    }
                });


                var privilegeAppKeys = Object.keys(template.privileges);
                var derievedPrivileges = {};
                if (!obj.privileges) obj.privileges = {};


                privilegeAppKeys.forEach(function(tApp) {


                    if (!obj.privileges[tApp]) obj.privileges[tApp] = [];

                    var j;
                    for (j = 0; j < template.privileges[tApp].length; j++) {
                        var contains = false;
                        var i;
                        for (i = 0; i < obj.privileges[tApp].length; i++) {
                            if (obj.privileges[tApp][i].name == template.privileges[tApp][j].name) contains = true;
                        }
                        if (!contains) {
                            obj.privileges[tApp].push(Object.assign({ template: templateId }, template.privileges[tApp][j]));
                        }
                    }
                })



                success();
            },
            function(err) {

                error(err);
            }, {}, client)

    },

    ID: function() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,;-_"; // NO DOT!!! 

        for (var i = 0; i < 25; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    },

    RANDOM: function(amount) {
        return shortid.generate();
    },

    removeTemplateFieldsToObject: function(obj, templateId) {
        this.getTemplateAsyn(templateId, function(template) {
                var propertyKeys = Object.keys(template.properties);
                propertyKeys.forEach(function(property) {
                    if (obj.properties[property] === undefined) {
                        this.removeTemplateFieldFromObjects(obj.template.properties[property])
                    }
                })
            },
            function(error) {

            })
    },

    addTemplateToObject: function(obj, templateId) {
        var contains = false;
        obj.inherits.forEach(function(templ) {
            if (templ == templateId) contains = true;
        });
        if (!contains) {
            obj.inherits.push(templateId);

        }

    },

    addApplicationToObject: function(obj, application) {
        var contains = false;
        obj.applications.forEach(function(app) {
            if (app == application) contains = true;
        });
        if (!contains) {
            obj.applications.push(application);

        } else throw new DuplicateApplicationException(application);

    },

    removeApplicationFromObject: function(obj, application) {
        var contains = false;
        obj.applications.forEach(function(app, i) {
            if (app == application) {
                obj.applications.splice(i, 1);
                contains = true;
                return;
            }
        });

        if (!contains) {
            throw new NoSuchApplicationException(application);
        }
    },

    removeTemplateFromObject: function(obj, templateId, success, error) {
        var contains = false;
        obj.inherits.forEach(function(templ) {
            if (templ == templateId) contains = true;
        });

        if (contains) {
            var propKeys = Object.keys(obj.properties);
            var i;
            for (i = 0; i < propKeys.length; i++) {
                console.log("properties inherit");
                console.log(obj.properties[propKeys[i]] + ' . ' + templateId);
                if (obj.properties[propKeys[i]].template == templateId) delete obj.properties[propKeys[i]];
            }


            var permissionKeys = Object.keys(obj.permissions);
            var i;
            for (i = 0; i < permissionKeys.length; i++) {
                console.log("permissions inherit");
                console.log(obj.permissions[permissionKeys[i]] + ' . ' + templateId);
                if (obj.permissions[permissionKeys[i]].template == templateId) delete obj.permissions[permissionKeys[i]];
            }

            var i;
            for (i = 0; i < obj.inherits.length; i++) {
                if (obj.inherits[i] == templateId) obj.inherits.splice(i, 1);
            }

            success(obj);
        } else {
            error('Template not found in object');
        }
    },

    remove: function(obj, success, error, app, client) {

        this.removeObject(obj, success, error, app, client);

    },

    removeObject: function(obj, success, error, app, client) {

        var self = this;

        this.mappers[obj.role].removeObj(obj, function(data) {
            
            success(data);

            if(obj.onDelete) self.execProcessorAction(obj.onDelete, obj, null, null, function(data) {
            
            }, client, null);

        }, function(err) {
            error('Error - Could not remove object');
        }, app, client);
    },

    add: function(obj, success, error, app, client) {

        var propKeys = Object.keys(obj.properties);

        propKeys.forEach(function(property) {

            if (property.template) delete property;

            if (property.type == CONSTANTS.PROPERTY.TYPE_SHORTID) {
                if (property.value == '' && !property.value)
                    property.value = SPOO.RANDOM();
            }

        })


        this.addObject(obj, success, error, app, client);

    },

    addObject: function(obj, success, error, app, client) {

        console.log("##" + client); 

        this.mappers[obj.role].addObj(obj, function(data) {
            success(data);

        }, function(err) {
            error('Error - Could not add object');
        }, app, client);

    },


    updateO: function(obj, success, error, client) {
        var propKeys = Object.keys(obj.properties);


        propKeys.forEach(function(property) {
            {
                if (obj.properties[property].template) {

                    if (!obj.properties[property].overwrittenOnCreate) delete obj.properties[property].onCreate;
                    if (!obj.properties[property].overwrittenOnChange) delete obj.properties[property].onChange;
                    if (!obj.properties[property].overwrittenOnDelete) delete obj.properties[property].onDelete;
                    if (!obj.properties[property].meta) delete obj.properties[property].meta;
                    if (!obj.properties[property].overwritten) delete obj.properties[property];
                }
            }
        })

        if (obj.privileges) {
            var appKeys = Object.keys(obj.privileges);
            appKeys.forEach(function(app) {

                var k;
                for (k = 0; k < obj.privileges[app].length; k++) {

                }

                if (obj.privileges[app].length == 0) delete obj.privileges[app];
            })
        }

        this.updateObject(obj, success, error, client);


        // ADD TENANT AND APPLICATION!!!
    },

    updateObject: function(obj, success, error, client) {
        this.mappers[obj.role].updateObj(obj, function(data) {
            success(data);

        }, function(err) {
            error('Error - Could not update object');
        }, client);
    },

    getObjectById: function(role, id, success, error, app, client) {


        this.mappers[role].getObjById(id, function(data) {

             //console.log("---" + data)

            if (data == null) {
                error('Error - object not found');
                return;
            }
            
            success(data);



        }, function(err) {
            error('Error - Could get object: ' + err);
        }, app, client);
    },

    findObjects: function(criteria, role,  success, error, app, client, flags) {


        var templatesCache = [];
        var objectsCache = [];
        this.mappers[role].getObjsByCriteria(criteria, function(data) {
            var counter = 0;
            var num = data.length;
            if (num == 0) success([]);

            success(data);


            /*data.forEach(function(obj, i) {

                counter++;
                if (counter == data.length) success(data);

                /*new SPOO.Obj(obj).get(function(ob) {
                        counter++;
                        data[i] = ob

                        if (counter == data.length) success(data);
                    },
                    function(err) {
                        error(err);
                    }, client);*
            })*/


        }, function(err) {
            error('Error - Could get object: ' + err);
        }, app, client, flags);
    },

    findAllObjects: function(role, criteria, success, error, client, flags) {
        this.findObjects(role, criteria, success, error, client, flags, true);
    },


    PropertyRefParser: function(obj, propertyName, success, error) {
        var allProperties = obj.getProperties();

        try {
            propertyToReturn = allProperties[propertyName];
        } catch (e) {

        }

        if (!propertyToReturn) throw new PropertyNotFoundException(propertyName);

        if (!propertyToReturn.type == 'objectRef') throw new PropertyNotFoundException(propertyName);


        return SPOO.getObjectByIdSyn(propertyToReturn.value);


    },

    EventParser: function(obj, eventName) {
        var allEvents = obj.events;
        var thisRef = this;

        var eventToReturn;

        function getValue(obj, access) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                getValue(obj.events[access.shift()], access);
            } else {

                try {
                    var t = obj.events[access[0]].type;
                } catch (e) {
                    throw new NoSuchEventException(propertyName);
                }

                eventToReturn = obj.events[access[0]];
            }
        }

        getValue(obj, eventName);

        return eventToReturn;


    },


    PropertyBagItemQueryRemover: function(obj, propertyName) {
        var allProperties = obj.properties;
        var thisRef = this;


        var propertyToReturn;

        function removeQuery(obj, access) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                removeQuery(obj.properties[access.shift()], access);
            } else {


                try {
                    var t = obj.properties[access[0]].type;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyName);
                }

                if (!obj.properties[access[0]].query) throw new NoSuchPermissionException(permissionKey);


                delete obj.properties[access[0]].query;
                return;
            }
        }

        removeQuery(obj, propertyName);

    },


    PropertyBagItemConditionsRemover: function(obj, propertyName) {
        var allProperties = obj.properties;
        var thisRef = this;


        var propertyToReturn;

        function removeConditions(obj, access) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                removeConditions(obj.properties[access.shift()], access);
            } else {


                try {
                    var t = obj.properties[access[0]].type;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyName);
                }

                if (!obj.properties[access[0]].conditions) throw new NoSuchPermissionException(permissionKey);


                delete obj.properties[access[0]].conditions;
                return;
            }
        }

        removeConditions(obj, propertyName);

    },


    PropertyBagItemOnChangeRemover: function(obj, propertyName, name) {
        var allProperties = obj.properties;
        var thisRef = this;

        var propertyToReturn;

        function removeOnChange(obj, access) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                removeOnChange(obj.properties[access.shift()], access);
            } else {


                try {
                    var t = obj.properties[access[0]].type;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyName);
                }

                if (!obj.properties[access[0]].onChange[name]) throw new HandlerNotFoundException(name);

                delete obj.properties[access[0]].onChange[name];
                return;
            }
        }

        removeOnChange(obj, propertyName);

    },

    PropertyBagItemMetaRemover: function(obj, propertyName) {
        var allProperties = obj.properties;
        var thisRef = this;

        var propertyToReturn;

        function removeOnChange(obj, access) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                removeOnChange(obj.properties[access.shift()], access);
            } else {


                try {
                    var t = obj.properties[access[0]].type;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyName);
                }

                if (!obj.properties[access[0]].meta) throw new NoSuchPermissionException(permissionKey);

                delete obj.properties[access[0]].meta;
                return;
            }
        }

        removeOnChange(obj, propertyName);

    },

    PropertyBagItemOnCreateRemover: function(obj, propertyName) {
        var allProperties = obj.properties;
        var thisRef = this;

        var propertyToReturn;

        function removeOnCreate(obj, access) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                removeOnCreate(obj.properties[access.shift()], access);
            } else {

                try {
                    var t = obj.properties[access[0]].type;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyName);
                }

                if (!obj.properties[access[0]].onCreate) throw new NoSuchPermissionException(permissionKey);

                delete obj.properties[access[0]].onCreate;
                return;
            }
        }

        removeOnCreate(obj, propertyName);

    },

    PropertyBagItemOnDeleteRemover: function(obj, propertyName, name) {
        var allProperties = obj.properties;
        var thisRef = this;

        var propertyToReturn;

        function removeOnDelete(obj, access) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                removeOnDelete(obj.properties[access.shift()], access);
            } else {

                try {
                    var t = obj.properties[access[0]].type;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyName);
                }

                if (!obj.properties[access[0]].onDelete[name]) throw new HandlerNotFoundException(name);

                delete obj.properties[access[0]].onDelete[name];
                return;
            }
        }

        removeOnDelete(obj, propertyName);

    },


    PropertyBagItemPermissionRemover: function(obj, propertyName, permissionKey) {
        var allProperties = obj.properties;
        var thisRef = this;



        var propertyToReturn;

        function removePermission(obj, access) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                removePermission(obj.properties[access.shift()], access);
            } else {


                try {
                    var t = obj.properties[access[0]].type;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyName);
                }
                console.log(obj.properties[access[0]]);
                console.log(obj.properties[access[0]].permissions);
                console.log(permissionKey);
                console.log(obj.properties[access[0]].permissions[permissionKey]);

                if (!obj.properties[access[0]].permissions) throw new NoSuchPermissionException(permissionKey);
                if (!obj.properties[access[0]].permissions[permissionKey]) throw new NoSuchPermissionException(permissionKey);

                delete obj.properties[access[0]].permissions[permissionKey];
                return;
            }
        }

        removePermission(obj, propertyName);

    },

    PropertyBagItemRemover: function(obj, propertyName,  client) {
        var allProperties = obj.properties; //obj.getProperties();
        var thisRef = this;


        var propertyToReturn;

        function getValue(obj, access) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                getValue(obj.properties[access.shift()], access);
            } else {


                try {
                    var t = obj.properties[access[0]].type;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyName);
                }

                delete obj.properties[access[0]];


                return;
            }
        }

        getValue(obj, propertyName);

    },

    PropertyParser: function(obj, propertyName) {
        var allProperties = obj.properties;
        var thisRef = this;

        var propertyToReturn;

        function getValue(obj, access) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                getValue(obj.properties[access.shift()], access);
            } else {

                try {
                    var t = obj.properties[access[0]].type;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyName);
                }

                propertyToReturn = obj.properties[access[0]];
            }
        }

        getValue(obj, propertyName);

        console.log(thisRef);

        if (propertyToReturn.type == "action") {
            propertyToReturn.call = function(callback, client) {
                thisRef.execProcessorAction(propertyToReturn.value, obj, propertyToReturn, {}, callback, client, {});
            }
        }

        return propertyToReturn;

    },


    ValuePropertyMetaSubstituter: function(property) {
        if (typeof property !== 'undefined')
            if (typeof property.value === 'undefined') property.value = null;
    },


    ActionCreateWrapper: function(obj, action,  client) {
        console.debug(obj);
        console.log("pppa");
        console.debug(action);

        action = Object.assign({}, action);

        if (typeof action !== 'object') throw new InvalidFormatException();
        var actionKey = Object.keys(action)[0];

        try {
            existing = obj.actions[actionKey]
            console.debug(obj.actions);
            console.debug(action);
        } catch (e) {}

        if (existing) throw new DuplicateActionException(actionKey);
    },



    PropertyCreateWrapper: function(obj, property, isBag, client) {

        property = Object.assign({}, property);

        
        var propertyKey = Object.keys(property)[0];

        if (typeof property !== 'object')
        {
            throw new InvalidFormatException();
            //obj.properties[propertyKey] = property[propertyKey];
            //return;
        }


       

     

        try {
            existing = obj.properties[propertyKey]
            console.log(obj.properties);
            console.log(property);
        } catch (e) {}

         /*iif (!property[propertyKey].type) {

            obj.properties[propertyKey] = property[propertyKey];

           

            f (typeof property[propertyKey].value === 'string') {
                if (property[propertyKey].value.length <= 255) property[propertyKey].type = CONSTANTS.PROPERTY.TYPE_SHORTTEXT;
                else property[propertyKey].type = CONSTANTS.PROPERTY.TYPE_LONGTEXT;
            } else if (typeof property[propertyKey].value === 'boolean')
                property[propertyKey].type = CONSTANTS.PROPERTY.TYPE_BOOLEAN;
            else property[propertyKey].type = CONSTANTS.PROPERTY.TYPE_SHORTTEXT;
        }*/


        if (existing) throw new DuplicatePropertyException(propertyKey);

        //console.debug(property);
        switch (property[propertyKey].type) {
            case undefined:
                obj.properties[propertyKey] = property[propertyKey];
                break;

            case CONSTANTS.PROPERTY.TYPE_SHORTTEXT:
                obj.properties[propertyKey] = property[propertyKey];
                SPOO.ValuePropertyMetaSubstituter(obj.properties[propertyKey]);
                break;

            case CONSTANTS.PROPERTY.TYPE_LONGTEXT:
                obj.properties[propertyKey] = property[propertyKey];
                SPOO.ValuePropertyMetaSubstituter(obj.properties[propertyKey]);
                break;

            case CONSTANTS.PROPERTY.TYPE_INDEXEDTEXT:
                obj.properties[propertyKey] = property[propertyKey];
                SPOO.ValuePropertyMetaSubstituter(obj.properties[propertyKey]);
                break;

            case CONSTANTS.PROPERTY.TYPE_JSON:
                if (property[propertyKey].value) {
                    if (typeof property[propertyKey].value === 'string') {
                        try {
                            obj.properties[propertyKey].value = JSON.parse(obj.properties[propertyKey].value);
                        } catch (e) {
                            //throw new InvalidValueException(property[propertyKey].value, CONSTANTS.PROPERTY.TYPE_JSON);
                        }
                    } else {

                    }
                }
                obj.properties[propertyKey] = property[propertyKey];
                SPOO.ValuePropertyMetaSubstituter(obj.properties[propertyKey]);
                break;

            case CONSTANTS.PROPERTY.TYPE_NUMBER:
                if (property[propertyKey].value != '') {
                    if (property[propertyKey].value != null)
                        if (isNaN(property[propertyKey].value)) throw new InvalidValueException(property[propertyKey].value, CONSTANTS.PROPERTY.TYPE_NUMBER);
                }
                obj.properties[propertyKey] = property[propertyKey];
                SPOO.ValuePropertyMetaSubstituter(obj.properties[propertyKey]);
                break;

                /*
            case CONSTANTS.PROPERTY.TYPE_ARRAY:
                if (!Array.isArray(property[propertyKey].value)) throw new InvalidValueException(property[propertyKey].value, CONSTANTS.PROPERTY.TYPE_ARRAY);
                obj.properties[propertyKey] = property[propertyKey];
                break;
*/
            case CONSTANTS.PROPERTY.TYPE_EVENT:

                var _event = {};
                var eventKey = propertyKey;
                _event[eventKey] = property[propertyKey];

                if (!_event[eventKey].eventId) _event[eventKey].eventId = obj._id + SPOO.ID();

                if (!_event[eventKey].reminders) _event[eventKey].reminders = {};


                if (_event[eventKey].interval !== undefined) {

                    if (_event[eventKey].lastOccurence == undefined) _event[eventKey].lastOccurence = null;
                    else if (!moment(_event[eventKey].lastOccurence).isValid()) throw new InvalidDateException(_event[eventKey].lastOccurence);
                    else _event[eventKey].lastOccurence = moment(_event[eventKey].lastOccurence).format();

                    if (_event[eventKey].nextOccurence == undefined)
                        _event[eventKey].nextOccurence = null;

                    if (_event[eventKey].action === undefined) _event[eventKey].action = '';


                    if (_event[eventKey].interval === undefined) throw new MissingAttributeException('interval');



                } else if (_event[eventKey].date !== undefined) {


                    if (_event[eventKey].date == null) _event[eventKey].date = moment().toISOString();

                    if (!_event[eventKey].date) throw new MissingAttributeException('date');

                    try {
                        if (!moment(_event[eventKey].date).isValid()) throw new InvalidDateException(_event[eventKey].date);
                    } catch (e) {
                        //throw new InvalidDateException(_event[eventKey].date);
                    }

                    try {
                        _event[eventKey].date = moment(_event[eventKey].date).format();
                    } catch (e) {

                    }

                    if (!_event[eventKey].action) _event[eventKey].action = '';
                } else {
                    //throw new InvalidTypeException("No interval or date provided");
                }

                obj.properties[propertyKey] = _event[eventKey];
                break;

            case CONSTANTS.PROPERTY.TYPE_DATE:
                if (!property[propertyKey].value || property[propertyKey].value == '') property[propertyKey].value = null;
                //else property[propertyKey].value = property[propertyKey];
                obj.properties[propertyKey] = property[propertyKey];
                SPOO.ValuePropertyMetaSubstituter(obj.properties[propertyKey]);
                break;


            case CONSTANTS.PROPERTY.TYPE_SHORTID:
                if (!property[propertyKey].value || property[propertyKey].value == '') property[propertyKey].value = SPOO.RANDOM();
                if (obj.role == 'template') property[propertyKey].value = null;
                obj.properties[propertyKey] = property[propertyKey];
                SPOO.ValuePropertyMetaSubstituter(obj.properties[propertyKey]);
                break;

            case CONSTANTS.PROPERTY.TYPE_REF_OBJ:


                // FOR NOW: no checking for existing object, since callback!!!
                obj.properties[propertyKey] = property[propertyKey];
                SPOO.ValuePropertyMetaSubstituter(obj.properties[propertyKey]);
                break;

            case CONSTANTS.PROPERTY.TYPE_REF_USR:



                // FOR NOW: no checking for existing object, since callback!!!
                obj.properties[propertyKey] = property[propertyKey];
                SPOO.ValuePropertyMetaSubstituter(obj.properties[propertyKey]);
                break;

            case CONSTANTS.PROPERTY.TYPE_REF_FILE:



                // FOR NOW: no checking for existing object, since callback!!!
                obj.properties[propertyKey] = property[propertyKey];
                SPOO.ValuePropertyMetaSubstituter(obj.properties[propertyKey]);
                break;

            case CONSTANTS.PROPERTY.TYPE_PROPERTY_BAG:

                if (!property[propertyKey].properties) property[propertyKey].properties = {};

                var innerProperties = property[propertyKey].properties;

                var propertyKeys = Object.keys(innerProperties);
                console.debug(propertyKeys);
                parentProp = property;

                obj.properties[propertyKey] = property[propertyKey];
                obj.properties[propertyKey].type = CONSTANTS.PROPERTY.TYPE_PROPERTY_BAG;
                obj.properties[propertyKey].properties = {};



                propertyKeys.forEach(function(property) {
                    tmpProp = {};
                    tmpProp[property] = innerProperties[property];

                    new SPOO.PropertyCreateWrapper(obj.properties[propertyKey], Object.assign({}, tmpProp, true));
                })

                break;

            case CONSTANTS.PROPERTY.TYPE_ARRAY:

                if (!property[propertyKey].properties) property[propertyKey].properties = {};

                var innerProperties = property[propertyKey].properties;

                var propertyKeys = Object.keys(innerProperties);
                console.debug(propertyKeys);
                parentProp = property;

                obj.properties[propertyKey] = { type: CONSTANTS.PROPERTY.TYPE_ARRAY, properties: {}, query: property[propertyKey].query, meta: property[propertyKey].meta };


                propertyKeys.forEach(function(property) {
                    tmpProp = {};
                    tmpProp[property] = innerProperties[property];

                    new SPOO.PropertyCreateWrapper(obj.properties[propertyKey], Object.assign({}, tmpProp, true));
                })

                break;

            case CONSTANTS.PROPERTY.TYPE_BOOLEAN:
                if (!typeof property[propertyKey].value === 'boolean') throw new InvalidValueException(property[propertyKey].value, CONSTANTS.PROPERTY.TYPE_BOOLEAN);
                obj.properties[propertyKey] = property[propertyKey];
                SPOO.ValuePropertyMetaSubstituter(obj.properties[propertyKey]);
                break;

            case CONSTANTS.PROPERTY.TYPE_ACTION:

                if (property[propertyKey].value) {
                    if (typeof property[propertyKey].value !== 'string') throw new InvalidValueException(property[propertyKey].value, CONSTANTS.PROPERTY.TYPE_ACTION);
                }

                obj.properties[propertyKey] = property[propertyKey];
                SPOO.ValuePropertyMetaSubstituter(obj.properties[propertyKey]);
                break;

            default:
                throw new InvalidTypeException(property[propertyKey].type);
        }

    },


    EventSetWrapper: function(obj, _event, fieldKey, newValue) {
        function setValue(obj, access, value) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                setValue(obj.events[_event][access.shift()], access, value);
            } else {

                if (obj.events[_event] === undefined) throw new NoSuchEventException(_event);

                try {
                    var t = obj.events[_event][access[0]].type;
                } catch (e) {
                    throw new NoSuchPropertyException(fieldKey);
                }
                obj.events[_event][access[0]] = newValue;
            }
        }

        setValue(obj, fieldKey, newValue);
    },


    EventCreateWrapper: function(obj, _event) {

        if (typeof _event !== 'object') throw new InvalidFormatException();
        var eventKey = Object.keys(_event)[0];
        try {
            existing = obj.events[eventKey]
            console.debug(obj.events);
            console.debug(_event);
        } catch (e) {}

        if (existing) throw new DuplicateEventException(eventKey);

        if (!_event[eventKey]._id) _event[eventKey]._id = SPOO.ID();

        switch (_event[eventKey].type) {
            case CONSTANTS.EVENT.TYPE_RECURRING:
                if (_event[eventKey].lastOccurence == undefined) _event[eventKey].lastOccurence = null;
                else if (!moment(_event[eventKey].lastOccurence).isValid()) throw new InvalidDateException(_event[eventKey].lastOccurence);
                else _event[eventKey].lastOccurence = moment(_event[eventKey].lastOccurence).format();

                if (_event[eventKey].action === undefined) _event[eventKey].action = 'confirm';

                if (_event[eventKey].interval === undefined) throw new MissingAttributeException('interval');

                _event[eventKey].interval = moment.duration(_event[eventKey].interval);

                switch (_event[eventKey].action) {
                    case CONSTANTS.EVENT.ACTION.TYPE_AUTORENEW:

                        break;
                    case CONSTANTS.EVENT.ACTION.TYPE_CONFIRM:

                        break;
                    default:
                        throw new InvalidActionException(_event[eventKey].action);
                        break;
                }

                obj.events[eventKey] = _event[eventKey];
                break;
            case CONSTANTS.EVENT.TYPE_TERMINATING:
                if (_event[eventKey].date === undefined) throw new MissingAttributeException('date');
                if (!moment(_event[eventKey].date).isValid()) throw new InvalidDateException(_event[eventKey].date);
                _event[eventKey].date = moment(_event[eventKey].date).format();
                if (_event[eventKey].action === undefined) _event[eventKey].action = 'deactivate';
                obj.events[eventKey] = _event[eventKey];
                break;
            default:
                throw new InvalidTypeException(_event.type);
        }


    },


    EventLogTemplatesCreateWrapper: function(obj, template) //addTemplateToObject!!!
    {
        var existing = false;
        obj.inherits.forEach(function(_template) {
            if (_template == template) existing = true;
        })
        if (!existing) {
            obj.inherits.push(template);

        }
    },

    TemplatesCreateWrapper: function(obj, template) //addTemplateToObject!!!
    {
        var existing = false;
        obj.inherits.forEach(function(_template) {
            if (_template == template) existing = true;
        })
        if (!existing) {
            obj.inherits.push(template);

        }
    },


    ObjectPermissionsCreateWrapper: function(obj, permissions) //addTemplateToObject!!!
    {
        if (!typeof permissions == 'object') throw new InvalidPermissionException();

        if (!permissions) return {};

        var permissionKeys = Object.keys(permissions);
        permissionKeys.forEach(function(permission) {
            //if (!typeof permissions[permission] == 'string') throw new InvalidPermissionException();
            if (typeof permissions[permission] == 'string') {
                permissions[permission] = { value: permissions[permission] };
            } else {
                permissions[permission] = permissions[permission];
            }
        })
        return permissions;
    },

    ObjectOnCreateSetWrapper: function(obj, name, onCreate, trigger, type) {
        //if (!typeof onchange == 'object') throw new InvalidPermissionException();

        if (!onCreate) throw new InvalidHandlerException();

        if(obj.onCreate[name]) throw new HandlerExistsException(name);

        if(!name) name = SPOO.RANDOM();

        if(!obj.onCreate[name]) obj.onCreate[name] = {}
        
        obj.onCreate[name].value = onCreate;
        obj.onCreate[name].trigger = trigger || 'after';
        obj.onCreate[name].type = type || 'async';

        if(obj.onCreate[name].templateId) obj.onCreate[name].overwritten = true;

        return onCreate;
    },

    ObjectOnChangeSetWrapper: function(obj, name, onChange, trigger, type) {
        //if (!typeof onchange == 'object') throw new InvalidPermissionException();

        if (!onChange) throw new InvalidHandlerException();

        if(obj.onChange[name]) throw new HandlerExistsException(name);

        if(!name) name = SPOO.RANDOM();

        if(!obj.onChange[name]) obj.onChange[name] = {}
        
        obj.onChange[name].value = onChange;
        obj.onChange[name].trigger = trigger || 'after';
        obj.onChange[name].type = type || 'async';

        if(obj.onChange[name].templateId) obj.onChange[name].overwritten = true;

        return onChange;
    },

    ObjectOnDeleteSetWrapper: function(obj, name, onDelete, trigger, type) {
        //if (!typeof onchange == 'object') throw new InvalidPermissionException();

        if (!onDelete) throw new InvalidHandlerException();

        if(obj.onDelete[name]) throw new HandlerExistsException(name);

        if(!name) name = SPOO.RANDOM();

        if(!obj.onDelete[name]) obj.onDelete[name] = {}
        
        obj.onDelete[name].value = onDelete;
        obj.onDelete[name].trigger = trigger || 'after';
        obj.onDelete[name].type = type || 'async';

        if(obj.onDelete[name].templateId) obj.onDelete[name].overwritten = true;

        return onDelete;
    },

    ObjectPermissionSetWrapper: function(obj, permission) //addTemplateToObject!!!
    {
        if (!typeof permission == 'object') throw new InvalidPermissionException();

        if (!permission) throw new InvalidPermissionException();

        var permissionKey = Object.keys(permission)[0];

        if (!obj.permissions[permissionKey]) obj.permissions[permissionKey] = permission[permissionKey];
        else {
            obj.permissions[permissionKey] = permission[permissionKey];
        }

        return permission;
    },

    ObjectPermissionRemoveWrapper: function(obj, permissionName) //addTemplateToObject!!!
    {
        if (!permissionName) throw new InvalidPermissionException();

        if (!typeof permissionName == 'string') throw new InvalidPermissionException();

        if (!obj.permissions[permissionName]) throw new NoSuchPermissionException(permissionName);

        delete obj.permissions[permissionName];

        return permissionName;
    },


    PropertyQuerySetWrapper: function(obj, propertyKey, query) {
        console.debug(obj);
        console.debug(propertyKey);



        function setValue(obj, access, value) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                setValue(obj.properties[access.shift()], access, value);
            } else {
                //obj[access[0]] = value;
                try {
                    var t = obj.properties[access[0]].value;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyKey);
                }


                if (typeof value !== 'object') throw new InvalidDataTypeException(value, 'object');

                obj.properties[access[0]].query = query;
            }
        }

        setValue(obj, propertyKey, query);



    },



    PropertyMetaSetWrapper: function(obj, propertyKey, meta) {
        function setOnChange(obj, access, meta) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                setOnChange(obj.properties[access.shift()], access, meta);
            } else {

                try {
                    var t = obj.properties[access[0]].value;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyKey);
                }

                //if (!obj.properties[access[0]].on) obj.properties[access[0]].on = {};

                if (obj.properties[access[0]].template) obj.properties[access[0]].metaOverwritten = true;
                obj.properties[access[0]].meta = meta;
            }
        }

        setOnChange(obj, propertyKey, meta);
    },


    PropertyOnChangeSetWrapper: function(obj, propertyKey, name, onChange, trigger, type) {
        function setOnChange(obj, access, onChange) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                setOnChange(obj.properties[access.shift()], access, onChange);
            } else {

                try {
                    var t = obj.properties[access[0]].value;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyKey);
                }

                //if (!obj.properties[access[0]].on) obj.properties[access[0]].on = {};

                if(!obj.properties[access[0]].onChange) obj.properties[access[0]].onChange = {}

                if(!obj.properties[access[0]].onChange[name]) obj.properties[access[0]].onChange[name] = {}

                if (obj.properties[access[0]].onChange[name].template) obj.properties[access[0]].onChange[name].overwritten = true;
                obj.properties[access[0]].onChange[name].value = onChange;
                obj.properties[access[0]].onChange[name].trigger = trigger || 'after'; 
                obj.properties[access[0]].onChange[name].type = type || 'async'; 
            }
        }

        setOnChange(obj, propertyKey, onChange);
    },

    PropertyOnCreateSetWrapper: function(obj, propertyKey, name, onCreate, trigger, type) {
        function setOnCreate(obj, access, onCreate) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                setOnCreate(obj.properties[access.shift()], access, onCreate);
            } else {
                //obj[access[0]] = value;
                try {
                    var t = obj.properties[access[0]].value;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyKey);
                }

                //if (!obj.properties[access[0]].on) obj.properties[access[0]].on = {};

                if(!obj.properties[access[0]].onCreate) obj.properties[access[0]].onCreate = {};

                if(!obj.properties[access[0]].onCreate[name]) obj.properties[access[0]].onCreate[name] = {};

                if(obj.properties[access[0]].onCreate[name].templateId) obj.properties[access[0]].onCreate[name].overwritten = true;
            
                obj.properties[access[0]].onCreate[name].value = onCreate;
                obj.properties[access[0]].onCreate[name].trigger = trigger || 'after';
                obj.properties[access[0]].onCreate[name].type = type || 'async';

            }
        }

        setOnCreate(obj, propertyKey, onCreate);
    },

    PropertyOnDeleteSetWrapper: function(obj, propertyKey, name, onDelete, trigger, type) {
        function setOnDelete(obj, access, onDelete) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                setOnDelete(obj.properties[access.shift()], access, onDelete);
            } else {
                //obj[access[0]] = value;
                try {
                    var t = obj.properties[access[0]].value;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyKey);
                }   

                if(!obj.properties[access[0]].onDelete) obj.properties[access[0]].onDelete = {}; 
                if(!obj.properties[access[0]].onDelete[name]) obj.properties[access[0]].onDelete[name] = {}; 

                //if (!obj.properties[access[0]].on) obj.properties[access[0]].on = {};
                if (obj.properties[access[0]].onDelete[name].template) obj.properties[access[0]].onDelete[name].overwritten = true;
                obj.properties[access[0]].onDelete[name].value = onDelete;
                obj.properties[access[0]].onDelete[name].trigger = trigger || 'after';
                obj.properties[access[0]].onDelete[name].type = type || 'async';
            }
        }

        setOnDelete(obj, propertyKey, onDelete);
    },

    PropertyConditionsSetWrapper: function(obj, propertyKey, conditions) {

        function setConditions(obj, access, conditions) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                setConditions(obj.properties[access.shift()], access, conditions);
            } else {
                //obj[access[0]] = value;
                try {
                    var t = obj.properties[access[0]].value;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyKey);
                }

                //if (!obj.properties[access[0]].on) obj.properties[access[0]].on = {};

                obj.properties[access[0]].conditions = conditions;
            }
        }

        setConditions(obj, propertyKey, conditions);
    },

    PropertyPermissionSetWrapper: function(obj, propertyKey, permission) {
        console.debug(obj);
        console.debug(propertyKey);


        function setPermission(obj, access, permission) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {
                setPermission(obj.properties[access.shift()], access, permission);
            } else {
                //obj[access[0]] = value;
                try {
                    var t = obj.properties[access[0]].value;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyKey);
                }

                var permissionKey = Object.keys(permission)[0];
                if (!obj.properties[access[0]].permissions) obj.properties[access[0]].permissions = {};

                obj.properties[access[0]].permissions[permissionKey] = permission[permissionKey];
            }
        }

        setPermission(obj, propertyKey, permission);



        /*switch(existingProperty.type)
        {
            case constants.PROPERTY_TYPE_SHORTTEXT:
                obj.properties[propertyKey].value = newValue;
            break;

            default : 
                throw new InvalidTypeException(existingProperty.type);
        }*/

        /*if(obj.role == 'template') 
        {
            SPOO.addTemplateFieldToObjects(obj, propertyKey, function(data)
                {
                    console.log("template added!");
                },
                function(error)
                {
                    throw new NoSuchTemplateException(error);
                });
        }*/
    },


    PropertySetWrapper: function(obj, propertyKey, newValue,  client, notPermitted) {


        function setValue(obj, access, value) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {

                var shift = access.shift();
                try {
                    if (obj.properties[shift].type) {
                        if (obj.properties[shift].type == CONSTANTS.PROPERTY.TYPE_PROPERTY_BAG) {
                            if (obj.properties[shift].template) obj.properties[shift].overwritten = true;
                            //obj.properties[shift].hello = true;
                        }
                        if (obj.properties[shift].type == CONSTANTS.PROPERTY.TYPE_ARRAY) {
                            if (obj.properties[shift].template) obj.properties[shift].overwritten = true;
                            //obj.properties[shift].hello = true;
                        }
                    }
                } catch (e) {}

                setValue(obj.properties[shift], access, value);
            } else {
                //obj[access[0]] = value;
                try {
                    var t = obj.properties[access[0]].value;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyKey);
                }

                if (obj.properties[access[0]].type == 'boolean') {
                    if (typeof(newValue) != 'boolean') throw new InvalidValueException(newValue, obj.properties[access[0]].type);
                }
                if (obj.properties[access[0]].type == 'number') {
                    if (isNaN(newValue)) throw new InvalidValueException(newValue, obj.properties[access[0]].type);
                }


                if (obj.properties[access[0]].template) obj.properties[access[0]].overwritten = true;
                obj.properties[access[0]].value = newValue;
            }
        }

        setValue(obj, propertyKey, newValue);



        /*switch(existingProperty.type)
        {
            case constants.PROPERTY_TYPE_SHORTTEXT:
                obj.properties[propertyKey].value = newValue;
            break;

            default : 
                throw new InvalidTypeException(existingProperty.type);
        }*/

        /*if(obj.role == 'template') 
        {
            SPOO.addTemplateFieldToObjects(obj, propertyKey, function(data)
                {
                    console.log("template added!");
                },
                function(error)
                {
                    throw new NoSuchTemplateException(error);
                });
        }*/
    },

    EventIntervalSetWrapper: function(obj, propertyKey, newValue,  client, notPermitted) {


        var prop = obj.getProperty(propertyKey);

        if (prop.type != CONSTANTS.PROPERTY.TYPE_EVENT) throw new NotAnEventException(propertyKey);



        function setValue(obj, access, value) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {

                var shift = access.shift();
                try {
                    if (obj.properties[shift].type) {
                        if (obj.properties[shift].type == CONSTANTS.PROPERTY.TYPE_PROPERTY_BAG) {
                            if (obj.properties[shift].template) obj.properties[shift].overwritten = true;
                            //obj.properties[shift].hello = true;
                        }
                        if (obj.properties[shift].type == CONSTANTS.PROPERTY.TYPE_ARRAY) {
                            if (obj.properties[shift].template) obj.properties[shift].overwritten = true;
                            //obj.properties[shift].hello = true;
                        }
                    }
                } catch (e) {}

                setValue(obj.properties[shift], access, value);
            } else {
                //obj[access[0]] = value;
                try {
                    var t = obj.properties[access[0]].value;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyKey);
                }


                if (obj.properties[access[0]].template) obj.properties[access[0]].overwritten = true;

                delete obj.properties[access[0]].date;
                obj.properties[access[0]].interval = newValue;
            }
        }

        setValue(obj, propertyKey, newValue);

    },

    EventTriggeredSetWrapper: function(obj, propertyKey, newValue,  client, notPermitted) {

        var prop = obj.getProperty(propertyKey);

        if (prop.type != CONSTANTS.PROPERTY.TYPE_EVENT) throw new NotAnEventException(propertyKey);


        function setValue(obj, access, value) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {

                var shift = access.shift();
                try {
                    if (obj.properties[shift].type) {
                        if (obj.properties[shift].type == CONSTANTS.PROPERTY.TYPE_PROPERTY_BAG) {
                            if (obj.properties[shift].template) obj.properties[shift].overwritten = true;
                            //obj.properties[shift].hello = true;
                        }
                        if (obj.properties[shift].type == CONSTANTS.PROPERTY.TYPE_ARRAY) {
                            if (obj.properties[shift].template) obj.properties[shift].overwritten = true;
                            //obj.properties[shift].hello = true;
                        }
                    }
                } catch (e) {}

                setValue(obj.properties[shift], access, value);
            } else {
                //obj[access[0]] = value;
                try {
                    var t = obj.properties[access[0]].type;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyKey);
                }


                obj.properties[access[0]].triggered = newValue;
                obj.properties[access[0]].overwritten = true;
            }
        }

        setValue(obj, propertyKey, newValue);

    },


    EventLastOccurenceSetWrapper: function(obj, propertyKey, newValue,  client, notPermitted) {

        var prop = obj.getProperty(propertyKey);

        if (prop.type != CONSTANTS.PROPERTY.TYPE_EVENT) throw new NotAnEventException(propertyKey);


        function setValue(obj, access, value) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {

                var shift = access.shift();
                try {
                    if (obj.properties[shift].type) {
                        if (obj.properties[shift].type == CONSTANTS.PROPERTY.TYPE_PROPERTY_BAG) {
                            if (obj.properties[shift].template) obj.properties[shift].overwritten = true;
                            //obj.properties[shift].hello = true;
                        }
                        if (obj.properties[shift].type == CONSTANTS.PROPERTY.TYPE_ARRAY) {
                            if (obj.properties[shift].template) obj.properties[shift].overwritten = true;
                            //obj.properties[shift].hello = true;
                        }
                    }
                } catch (e) {}

                setValue(obj.properties[shift], access, value);
            } else {
                //obj[access[0]] = value;
                try {

                    var t = obj.properties[access[0]].type;

                } catch (e) {
                    throw new NoSuchPropertyException(propertyKey);
                }


                obj.properties[access[0]].lastOccurence = newValue;

                obj.properties[access[0]].nextOccurence = moment(newValue).add(moment.duration(obj.properties[access[0]].interval)).toISOString();
            }
        }

        setValue(obj, propertyKey, newValue);

    },

    EventReminderSetWrapper: function(obj, propertyKey, reminder,  client, notPermitted) {


        var prop = obj.getProperty(propertyKey);

        if (prop.type != CONSTANTS.PROPERTY.TYPE_EVENT) throw new NotAnEventException(propertyKey);

        function setValue(obj, access, value) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {

                var shift = access.shift();
                try {
                    if (obj.properties[shift].type) {
                        if (obj.properties[shift].type == CONSTANTS.PROPERTY.TYPE_PROPERTY_BAG) {
                            if (obj.properties[shift].template) obj.properties[shift].overwritten = true;
                            //obj.properties[shift].hello = true;
                        }
                        if (obj.properties[shift].type == CONSTANTS.PROPERTY.TYPE_ARRAY) {
                            if (obj.properties[shift].template) obj.properties[shift].overwritten = true;
                            //obj.properties[shift].hello = true;
                        }
                    }
                } catch (e) {}

                setValue(obj.properties[shift], access, value);
            } else {
                //obj[access[0]] = value;
                try {
                    var t = obj.properties[access[0]].value;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyKey);
                }


                if (obj.properties[access[0]].template) obj.properties[access[0]].overwritten = true;

                if (!obj.properties[access[0]].reminders)
                    obj.properties[access[0]].reminders = {};

                obj.properties[access[0]].reminders[reminder.diff] = { action: reminder.action };
            }
        }

        setValue(obj, propertyKey, reminder);

    },


    EventReminderRemover: function(obj, propertyKey, reminder,  client, notPermitted) {


        var prop = obj.getProperty(propertyKey);

        if (prop.type != CONSTANTS.PROPERTY.TYPE_EVENT) throw new NotAnEventException(propertyKey);

        function setValue(obj, access, value) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {

                var shift = access.shift();
                try {
                    if (obj.properties[shift].type) {
                        if (obj.properties[shift].type == CONSTANTS.PROPERTY.TYPE_PROPERTY_BAG) {
                            if (obj.properties[shift].template) obj.properties[shift].overwritten = true;
                            //obj.properties[shift].hello = true;
                        }
                        if (obj.properties[shift].type == CONSTANTS.PROPERTY.TYPE_ARRAY) {
                            if (obj.properties[shift].template) obj.properties[shift].overwritten = true;
                            //obj.properties[shift].hello = true;
                        }
                    }
                } catch (e) {}

                setValue(obj.properties[shift], access, value);
            } else {
                //obj[access[0]] = value;
                try {
                    var t = obj.properties[access[0]].value;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyKey);
                }


                if (obj.properties[access[0]].reminders) {
                    try {
                        delete obj.properties[access[0]].reminders[reminder];
                    } catch (e) {
                        throw new NoSuchReminderException(reminder);
                    }
                }

            }
        }

        setValue(obj, propertyKey, reminder);

    },


    EventDateSetWrapper: function(obj, propertyKey, newValue,  client, notPermitted) {


        function setValue(obj, access, value) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {

                var shift = access.shift();
                try {
                    if (obj.properties[shift].type) {
                        if (obj.properties[shift].type == CONSTANTS.PROPERTY.TYPE_PROPERTY_BAG) {
                            if (obj.properties[shift].template) obj.properties[shift].overwritten = true;
                            //obj.properties[shift].hello = true;
                        }
                        if (obj.properties[shift].type == CONSTANTS.PROPERTY.TYPE_ARRAY) {
                            if (obj.properties[shift].template) obj.properties[shift].overwritten = true;
                            //obj.properties[shift].hello = true;
                        }
                    }
                } catch (e) {}

                setValue(obj.properties[shift], access, value);
            } else {
                //obj[access[0]] = value;
                try {
                    var t = obj.properties[access[0]].value;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyKey);
                }


                if (obj.properties[access[0]].template) obj.properties[access[0]].overwritten = true;
                delete obj.properties[access[0]].interval;
                delete obj.properties[access[0]].lastOccurence;
                delete obj.properties[access[0]].nextOccurence;
                obj.properties[access[0]].date = newValue;
            }
        }

        setValue(obj, propertyKey, newValue);

    },

    EventActionSetWrapper: function(obj, propertyKey, newValue,  client, notPermitted) {

        function setValue(obj, access, value) {
            if (typeof(access) == 'string') {
                access = access.split('.');
            }
            if (access.length > 1) {

                var shift = access.shift();
                try {
                    if (obj.properties[shift].type) {
                        if (obj.properties[shift].type == CONSTANTS.PROPERTY.TYPE_PROPERTY_BAG) {
                            if (obj.properties[shift].template) obj.properties[shift].overwritten = true;
                            //obj.properties[shift].hello = true;
                        }
                        if (obj.properties[shift].type == CONSTANTS.PROPERTY.TYPE_ARRAY) {
                            if (obj.properties[shift].template) obj.properties[shift].overwritten = true;
                            //obj.properties[shift].hello = true;
                        }
                    }
                } catch (e) {}

                setValue(obj.properties[shift], access, value);
            } else {

                try {
                    var t = obj.properties[access[0]].value;
                } catch (e) {
                    throw new NoSuchPropertyException(propertyKey);
                }



                if (obj.properties[access[0]].template) obj.properties[access[0]].overwritten = true;

                obj.properties[access[0]].action = newValue;
            }
        }

        setValue(obj, propertyKey, newValue);

    },

    ObjectRoleChecker: function(obj, role) {
        switch (role) {
            case 'object':
                return role;
                break;
            case 'template':
                return role;
                break;
            case 'tenant':
                return role;
                break;
            case 'application':
                return role;
                break;
            case 'user':
                obj.username = '';
                obj.password = '';
                return role;
                break;
            default:
                return 'object';
        }
    },

    PropertiesChecker: function(obj, properties) {
        if (properties === undefined) return {};

        obj.properties = {};
        var propertyKeys = Object.keys(properties);
        propertyKeys.forEach(function(property) {
            var propKey = {};
            propKey[property] = properties[property];
            var newProp = propKey;
            new SPOO.PropertyCreateWrapper(obj, newProp, false);
        })
        return obj.properties;
    },

    ApplicationsChecker: function(obj, applications) {
        if (applications === undefined) return [];

        obj.applications = [];
        applications.forEach(function(application) {
            obj.applications.push(application);
        })
        return obj.applications;
    },

    ActionsChecker: function(obj, actions) {
        if (actions === undefined) return {};

        obj.actions = {};
        var actionKeys = Object.keys(actions);
        actionKeys.forEach(function(action) {
            var actionKey = {};
            actionKey[action] = actions[action];
            var newAction = actionKey;
            new SPOO.ActionCreateWrapper(obj, newAction, false);
        })
        return obj.actions;
    },

    TemplatesChecker: function(obj, templates) {
        if (templates === undefined) return [];
        if (typeof templates !== 'object') return [];
        obj.inherits = [];

        templates.forEach(function(template) {
            if (template != obj._id) new SPOO.TemplatesCreateWrapper(obj, template);
        })

        return obj.inherits;
    },


    PrivilegesChecker: function(obj) {

        obj = JSON.stringify(obj);
        var nObj = JSON.parse(obj);

        return nObj.privileges;
    },

    PrivilegeChecker: function(obj, privilege) {

        if (!typeof privilege == 'object') throw new InvalidPrivilegeException();
        var privilegeKey = Object.keys(privilege)[0];

        if (!obj.privileges[privilegeKey]) {
            obj.privileges[privilegeKey] = [];
        }

        if (obj.privileges[privilegeKey].indexOf(privilege[privilegeKey]) == -1) obj.privileges[privilegeKey].push(privilege[privilegeKey]);

        return privilege;
    },

    PrivilegeRemover: function(obj, privilege) {

        if (!typeof privilege == 'object') throw new InvalidPrivilegeException();
        var privilegeKey = Object.keys(privilege)[0];

        if (!obj.privileges[privilegeKey]) {
            throw new NoSuchPrivilegeException();
        }

        var i;
        for (i = 0; i < obj.privileges[privilegeKey].length; i++) {
            if (obj.privileges[privilegeKey][i].name == privilege[privilegeKey]) obj.privileges[privilegeKey].splice(i, 1);
        }

        if (obj.privileges[privilegeKey].length == 0) {
            delete obj.privileges[privilegeKey];
        }

        return privilege;
    },

    Objs: function(objs, role, instance) {
        var self = this;

        if(typeof objs === "object")
        {

            this.get = function(success, error) {

            var client = instance.activeTenant;
            var app = instance.activeApp;
            
            var thisRef = this;
            var counter = 0;

            var flags = {} // TODO!!!


             SPOO.findObjects(objs, role, function(data) { 
                success(data);

            }, function(err) { error(err) }, app, client, flags);
             return;

            if (this.inherits.length == 0) {
                success(thisRef);
                return this;
            }


            this.inherits.forEach(function(template) {

                if (thisRef._id != template) {

                    SPOO.getTemplateFieldsForObject(thisRef, template, function() {
                            counter++;
                            if (counter == thisRef.inherits.length) {
                                success(thisRef);
                                return this;
                            }
                        },
                        function(err) {

                            success(thisRef);
                            return this;
                        }, client)
                } else {
                    if (thisRef.inherits.length == 1) {
                        success(thisRef);
                        return this;
                    } else {
                        counter++;
                        return;
                    }
                }
            });


           
        }


        } else if(Array.isArray(objs))
        {
            var i;
            for (i = 0; i < objs.length; i++) {
                objs[i] = new SPOO.Obj(objs[i], role);
            }

            return objs;
        }
        
    },

    Obj: function(obj, role, instance) {

        if (typeof obj === "string") {
            this._id = obj;
        }

        if (obj === undefined) obj = {};

        this.role = role || 'object';

        this.type = obj.type || null;

        if (this.role != 'application' && this.role != 'tenant') {

            this.applications = SPOO.ApplicationsChecker(this, obj.applications) || [];
        }

        this.inherits = SPOO.TemplatesChecker(this, obj.inherits) || [];

        if (obj._id) this._id = obj._id;
        this.name = obj.name || null;

        this.onCreate = obj.onCreate || {};
        this.onChange = obj.onChange || {};
        this.onDelete = obj.onDelete || {};

        this.created = obj.created || moment().toDate().toISOString();
        this.lastModified = obj.lastModified || moment().toDate().toISOString();

        this.properties = SPOO.PropertiesChecker(this, obj.properties) || {};

        this.permissions = new SPOO.ObjectPermissionsCreateWrapper(this, obj.permissions) || {};

        this.aggregatedEvents = obj.aggregatedEvents || [];

        if (this.role == 'template') {
            this.privileges = obj.privileges;
            this.addPrivilege = obj.addPrivilege;
            this.removePrivilege = obj.removePrivilege;
        }

        if (this.role == 'user') {
            this.username = obj.username;
            this.email = obj.email;
            this.password = obj.password;
            this.spooAdmin = obj.spooAdmin;
            this.privileges = obj.privileges;
            this.addPrivilege = obj.addPrivilege;
            this.removePrivilege = obj.removePrivilege;
            this.setUsername = obj.setUsername;
            this.setEmail = obj.setEmail;
            this.setPassword = obj.setPassword;
        }

        this.addInherit = function(templateId) {
            SPOO.addTemplateToObject(this, templateId);
            return this;
        };

        this.removeInherit = function(templateId, success, error) {
            SPOO.removeTemplateFromObject(this, templateId, function(data) {
                    //if (success) success(templateId);
                },
                function(err) {
                    //if (error) error(err);
                });
            return this;
        };


        this.addApplication = function(application) {
            SPOO.addApplicationToObject(this, application);
            return this;
        };

        this.removeApplication = function(application) {
            SPOO.removeApplicationFromObject(this, application);
            return this;
        };

        this.addProperty = function(property, client) {

            var propertyKey = Object.keys(property)[0];
            if (propertyKey.indexOf('.') != -1) {
                var lastDot = propertyKey.lastIndexOf(".");
                var bag = propertyKey.substring(0, lastDot);
                var newProKey = propertyKey.substring(lastDot + 1, propertyKey.length);
                var newProp = {};
                newProp[newProKey] = property[propertyKey];

                this.addPropertyToBag(bag, newProp,  client);

                return;
            }

            new SPOO.PropertyCreateWrapper(this, property, false, client);

            return this;
        };

        this.setOnChange = function(onChangeObj) {

            if(typeof onChangeObj !== 'object') throw new InvalidArgumentException()
            var key = Object.keys(onChangeObj)[0];

            new SPOO.ObjectOnChangeSetWrapper(this, key, onChangeObj[key].value, onChangeObj[key].trigger, onChangeObj[key].type);
            return this;
        };

        this.setOnDelete = function(onDeleteObj) {

            if(typeof onDeleteObj !== 'object') throw new InvalidArgumentException()
            var key = Object.keys(onDeleteObj)[0];

            new SPOO.ObjectOnDeleteSetWrapper(this, key, onDeleteObj[key].value, onDeleteObj[key].trigger, onDeleteObj[key].type);
            return this;
        };

        this.setOnCreate = function(onCreateObj) {
            
            if(typeof onCreateObj !== 'object') throw new InvalidArgumentException()
            var key = Object.keys(onCreateObj)[0];

            new SPOO.ObjectOnCreateSetWrapper(this, key, onCreateObj[key].value, onCreateObj[key].trigger, onCreateObj[key].type);
            return this;
        };

        this.removeOnChange = function(name) {
            if (!this.onChange[name]) throw new HandlerNotFoundException(name);
            else delete this.onChange[name];
            return this;
        };

        this.removeOnDelete = function(name) {
            if (!this.onDelete[name]) throw new HandlerNotFoundException(name);
            else delete this.onDelete[name];
            return this;
        };

        this.removeOnCreate = function(name) {
            if (!this.onCreate[name]) throw new HandlerNotFoundException(name);
            else delete this.onCreate[name];
            return this;
        };

        this.setPermission = function(permission) {
            new SPOO.ObjectPermissionSetWrapper(this, permission);
            return this;
        };

        this.removePermission = function(permission) {
            new SPOO.ObjectPermissionRemoveWrapper(this, permission);
            return this;
        };

        this.setPropertyValue = function(property, value,  client) {

            var propertyKey = Object.keys(property)[0];
            if (propertyKey.indexOf('.') != -1) {
                var lastDot = propertyKey.lastIndexOf(".");
                var bag = propertyKey.substring(0, lastDot);
                var newProKey = propertyKey.substring(lastDot + 1, propertyKey.length);
                var newProp = {};
                this.setBagPropertyValue(bag, newProKey, value,  client);
                return;
            }

            new SPOO.ConditionsChecker(this.getProperty(property), value);

            new SPOO.PropertySetWrapper(this, property, value,  client, ['addObject']);
            return this;
        };

        this.setEventDate = function(property, value,  client) {

            var propertyKey = Object.keys(property)[0];
            if (propertyKey.indexOf('.') != -1) {
                var lastDot = propertyKey.lastIndexOf(".");
                var bag = propertyKey.substring(0, lastDot);
                var newProKey = propertyKey.substring(lastDot + 1, propertyKey.length);
                var newProp = {};
                this.setBagEventDate(bag, newProKey, value,  client);
                return;
            }


            new SPOO.EventDateSetWrapper(this, property, value,  client, ['addObject']);
            return this;
        };

        this.setEventAction = function(property, value,  client) {

            var propertyKey = Object.keys(property)[0];
            if (propertyKey.indexOf('.') != -1) {
                var lastDot = propertyKey.lastIndexOf(".");
                var bag = propertyKey.substring(0, lastDot);
                var newProKey = propertyKey.substring(lastDot + 1, propertyKey.length);
                var newProp = {};
                this.setBagEventAction(bag, newProKey, value,  client);
                return;
            }

            // new SPOO.ConditionsChecker(this.getProperty(property), value);

            new SPOO.EventActionSetWrapper(this, property, value,  client, ['addObject']);
            return this;
        };

        this.setEventTriggered = function(property, value,  client) {

            var propertyKey = Object.keys(property)[0];
            if (propertyKey.indexOf('.') != -1) {
                var lastDot = propertyKey.lastIndexOf(".");
                var bag = propertyKey.substring(0, lastDot);
                var newProKey = propertyKey.substring(lastDot + 1, propertyKey.length);
                var newProp = {};
                this.setBagEventTriggered(bag, newProKey, value,  client);
                return;
            }

            // new SPOO.ConditionsChecker(this.getProperty(property), value);

            new SPOO.EventTriggeredSetWrapper(this, property, value,  client, ['addObject']);
            return this;
        };

        this.setEventLastOccurence = function(property, value,  client) {

            var propertyKey = Object.keys(property)[0];
            if (propertyKey.indexOf('.') != -1) {
                var lastDot = propertyKey.lastIndexOf(".");
                var bag = propertyKey.substring(0, lastDot);
                var newProKey = propertyKey.substring(lastDot + 1, propertyKey.length);
                var newProp = {};
                this.setBagEventLastOccurence(bag, newProKey, value,  client);
                return;
            }

            // new SPOO.ConditionsChecker(this.getProperty(property), value);


            new SPOO.EventLastOccurenceSetWrapper(this, property, value,  client, ['addObject']);
            return this;
        };

        this.setEventInterval = function(property, value,  client) {

            var propertyKey = Object.keys(property)[0];
            if (propertyKey.indexOf('.') != -1) {
                var lastDot = propertyKey.lastIndexOf(".");
                var bag = propertyKey.substring(0, lastDot);
                var newProKey = propertyKey.substring(lastDot + 1, propertyKey.length);
                var newProp = {};
                this.setBagEventInterval(bag, newProKey, value,  client);
                return;
            }

            // new SPOO.ConditionsChecker(this.getProperty(property), value);

            new SPOO.EventIntervalSetWrapper(this, property, value,  client, ['addObject']);
            return this;
        };

        this.addEventReminder = function(property, reminder,  client) {

            var propertyKey = Object.keys(property)[0];
            if (propertyKey.indexOf('.') != -1) {
                var lastDot = propertyKey.lastIndexOf(".");
                var bag = propertyKey.substring(0, lastDot);
                var newProKey = propertyKey.substring(lastDot + 1, propertyKey.length);
                var newProp = {};
                this.addBagEventReminder(bag, newProKey, reminder,  client);
                return;
            }

            // new SPOO.ConditionsChecker(this.getProperty(property), value);

            new SPOO.EventReminderSetWrapper(this, property, reminder,  client, ['addObject']);
            return this;
        };

        this.removeEventReminder = function(propertyName, reminder) {
            if (propertyName.indexOf('.') != -1) {
                this.removeEventReminderFromBag(propertyName, reminder);
                return;
            } else {

                if (!this.properties[propertyName]) throw new NoSuchPropertyException(propertyName);
                if (!this.properties[propertyName].reminders) throw new NoSuchReminderException(reminder); // CHANGE!!!

                try {
                    delete this.properties[propertyName].reminders[reminder];
                } catch (e) {
                    throw new NoSuchReminderException(reminder);
                }

            }

            return this;
        };

        this.pushToArray = function(array, value,  client) {

            var propKey = Object.keys(value)[0];
            var tmpProp = {};
            var tmpName;
            tmpName = shortid.generate();

            tmpProp[tmpName] = value[propKey];
            console.log(tmpProp);
            this.addPropertyToBag(array, tmpProp,  client);
        };

        this.setPropertyPermission = function(property, permission) {
            var propertyKey = Object.keys(property)[0];
            if (propertyKey.indexOf('.') != -1) {
                var lastDot = propertyKey.lastIndexOf(".");
                var bag = propertyKey.substring(0, lastDot);
                var newProKey = propertyKey.substring(lastDot + 1, propertyKey.length);
                var newProp = {};
                this.setBagPropertyPermission(bag, newProKey, value);
                return;
            }
            new SPOO.PropertyPermissionSetWrapper(this, property, permission);
            return this;
        };

        this.setPropertyOnCreate = function(property, onCreateObj) {

            if(typeof onCreateObj !== 'object') throw new InvalidArgumentException()
            var key = Object.keys(onCreateObj)[0];

            new SPOO.PropertyOnCreateSetWrapper(this, property, key, onCreateObj[key].value, onCreateObj[key].trigger, onCreateObj[key].type);
            return this;
        };

        this.removePropertyOnCreate = function(propertyName) {
            if (propertyName.indexOf('.') != -1) {
                this.removePropertyOnCreateFromBag(propertyName);
                return;
            } else {

                if (!this.properties[propertyName]) throw new NoSuchPropertyException(propertyName);
                if (!this.properties[propertyName].onCreate) throw new NoOnCreateException(); // CHANGE!!!
                delete this.properties[propertyName].onCreate;
            }

            return this;
        };

        this.removePropertyOnCreateFromBag = function(property) {
            var bag = this.getProperty(property);
            if (this.role == 'template') {

            }
            new SPOO.PropertyBagItemOnCreateRemover(this, property);
            return this;
        };

        this.removeEventReminderFromBag = function(property, reminder) {
            var bag = this.getProperty(property);
            new SPOO.EventReminderRemover(this, property, reminder);
            return this;
        };

        this.setPropertyMeta = function(property, meta) {
            new SPOO.PropertyMetaSetWrapper(this, property, meta);
            return this;
        };

        this.removePropertyMetaFromBag = function(property) {
            var bag = this.getProperty(property);
            if (this.role == 'template') {

            }
            new SPOO.PropertyBagItemMetaRemover(this, property);
            return this;
        };

        this.removePropertyMeta = function(propertyName) {
            if (propertyName.indexOf('.') != -1) {
                this.removePropertyMetaFromBag(propertyName);
                return;
            } else {

                if (!this.properties[propertyName]) throw new NoSuchPropertyException(propertyName);
                if (!this.properties[propertyName].meta) throw new NoMetaException(); // CHANGE!!!
                delete this.properties[propertyName].meta;
            }

            return this;
        };


        this.setPropertyOnChange = function(property, onChangeObj) {

            if(typeof onChangeObj !== 'object') throw new InvalidArgumentException()
            var key = Object.keys(onChangeObj)[0];


            new SPOO.PropertyOnChangeSetWrapper(this, property, key, onChangeObj[key].value, onChangeObj[key].trigger, onChangeObj[key].type);
            return this;
        };

        this.removePropertyOnChange = function(propertyName, name) {
            if (propertyName.indexOf('.') != -1) {
                this.removePropertyOnChangeFromBag(propertyName, name);
                return;
            } else {

                if (!this.properties[propertyName]) throw new NoSuchPropertyException(propertyName);
                if (!this.properties[propertyName].onDelete[name]) throw new HandlerNotFoundException(name); // CHANGE!!!
                delete this.properties[propertyName][name];
            }

            return this;
        };

        this.removePropertyOnChangeFromBag = function(property, name) {
            var bag = this.getProperty(property);

            new SPOO.PropertyBagItemOnChangeRemover(this, property, name);
            return this;
        };

        this.setPropertyOnDelete = function(property, onDeleteObj) {

            if(typeof onDeleteObj !== 'object') throw new InvalidArgumentException()
            var key = Object.keys(onDeleteObj)[0];

            new SPOO.PropertyOnDeleteSetWrapper(this, property, key, onDeleteObj[key].value, onDeleteObj[key].trigger, onDeleteObj[key].type);
            return this;
        };

        this.removePropertyOnDelete = function(propertyName, name) {
            if (propertyName.indexOf('.') != -1) {
                this.removePropertyOnDeleteFromBag(propertyName, name);
                return;
            } else {

                if (!this.properties[propertyName]) throw new NoSuchPropertyException(propertyName);
                if (!this.properties[propertyName].onDelete[name]) throw new HandlerNotFoundException(name); // CHANGE!!!
                delete this.properties[propertyName].onDelete[name]
            }

            return this;
        };

        this.removePropertyOnDeleteFromBag = function(property, name) {
            var bag = this.getProperty(property);

            new SPOO.PropertyBagItemOnDeleteRemover(this, property, name);
            return this;
        };



        this.setPropertyConditions = function(property, conditions) {
            var propertyKey = Object.keys(property)[0];
            if (propertyKey.indexOf('.') != -1) {
                var lastDot = propertyKey.lastIndexOf(".");
                var bag = propertyKey.substring(0, lastDot);
                var newProKey = propertyKey.substring(lastDot + 1, propertyKey.length);
                var newProp = {};
                this.setBagPropertyConditions(bag, newProKey, conditions);
                return;
            }
            new SPOO.PropertyConditionsSetWrapper(this, property, conditions);
            return this;
        };

        this.setBagPropertyConditions = function(bag, property, conditions) {
            new SPOO.PropertyConditionsSetWrapper(this.getProperty(bag), property, conditions);
            return this;
        };


        this.setBagPropertyPermission = function(bag, property, permission) {
            new SPOO.PropertyPermissionSetWrapper(this.getProperty(bag), property, permission);
            return this;
        };

        this.setPropertyQuery = function(property, options) {
            var propertyKey = Object.keys(property)[0];
            if (propertyKey.indexOf('.') != -1) {
                var lastDot = propertyKey.lastIndexOf(".");
                var bag = propertyKey.substring(0, lastDot);
                var newProKey = propertyKey.substring(lastDot + 1, propertyKey.length);
                var newProp = {};
                this.setBagPropertyQuery(bag, newProKey, value);
                return;
            }
            new SPOO.PropertyQuerySetWrapper(this, property, options);
            return this;
        };

        this.setPropertyEventInterval = function(property, interval) {
            var propertyKey = Object.keys(property)[0];
            if (propertyKey.indexOf('.') != -1) {
                var lastDot = propertyKey.lastIndexOf(".");
                var bag = propertyKey.substring(0, lastDot);
                var newProKey = propertyKey.substring(lastDot + 1, propertyKey.length);
                var newProp = {};
                this.setBagPropertyEventInterval(bag, newProKey, value);
                return;
            }
            new SPOO.PropertyEventIntervalSetWrapper(this, property, interval);
            return this;
        };

        this.removePropertyQuery = function(propertyName) {
            if (propertyName.indexOf('.') != -1) {
                this.removePropertyQueryFromBag(propertyName);
                return;
            } else {

                if (!this.properties[propertyName]) throw new NoSuchPropertyException(propertyName);
                if (!this.properties[propertyName].query) throw new NoSuchPermissionException(permissionKey); // CHANGE!!!
                delete this.properties[propertyName].query;
            }

            return this;
        };

        this.removePropertyQueryFromBag = function(property) {
            var bag = this.getProperty(property);

            new SPOO.PropertyBagItemQueryRemover(this, property);
            return this;
        };

        this.removePropertyConditions = function(propertyName) {
            if (propertyName.indexOf('.') != -1) {
                this.removePropertyConditionsFromBag(propertyName);
                return;
            } else {

                if (!this.properties[propertyName]) throw new NoSuchPropertyException(propertyName);
                if (!this.properties[propertyName].conditions) throw new NoSuchPermissionException(permissionKey); // CHANGE!!!
                delete this.properties[propertyName].conditions;
            }

            return this;
        };

        this.removePropertyConditionsFromBag = function(property) {
            var bag = this.getProperty(property);

            new SPOO.PropertyBagItemConditionsRemover(this, property);
            return this;
        };

        this.setBagPropertyQuery = function(bag, property, options) {
            new SPOO.setBagPropertyQuery(this.getProperty(bag), property, permoptionsission);
            return this;
        };

        this.removePropertyPermission = function(propertyName, permissionKey) {
            if (propertyName.indexOf('.') != -1) {
                this.removePropertyPermissionFromBag(propertyName, permissionKey);
                return;
            } else {
                console.log(permissionKey);
                if (!this.properties[propertyName]) throw new NoSuchPropertyException(propertyName);
                if (!this.properties[propertyName].permissions[permissionKey]) throw new NoSuchPermissionException(permissionKey);
                delete this.properties[propertyName].permissions[permissionKey];
            }

            return this;
        };

        this.setBagPropertyValue = function(bag, property, value,  client) {
            new SPOO.PropertySetWrapper(this.getProperty(bag), property, value, ['addObject']);
            return this;
        };

        this.setBagEventDate = function(bag, property, value,  client) {
            new SPOO.EventDateSetWrapper(this.getProperty(bag), property, value, ['addObject']);
            return this;
        };

        this.setBagEventAction = function(bag, property, value,  client) {
            new SPOO.EventActionSetWrapper(this.getProperty(bag), property, value, ['addObject']);
            return this;
        };

        this.setBagEventInterval = function(bag, property, value,  client) {
            new SPOO.EventIntervalSetWrapper(this.getProperty(bag), property, value, ['addObject']);
            return this;
        };

        this.setBagEventTriggered = function(bag, property, value,  client) {
            new SPOO.EventTriggeredSetWrapper(this.getProperty(bag), property, value, ['addObject']);
            return this;
        };

        this.setBagEventLastOccurence = function(bag, property, value,  client) {
            new SPOO.EventLastOccurenceSetWrapper(this.getProperty(bag), property, value, ['addObject']);
            return this;
        };

        this.addBagEventReminder = function(bag, property, value,  client) {
            new SPOO.EventReminderSetWrapper(this.getProperty(bag), property, value, ['addObject']);
            return this;
        };

        this.addPropertyToBag = function(bag, property, client) {


            var tmpBag = this.getProperty(bag);
            if (tmpBag.template) tmpBag.overwritten = true;

            new SPOO.PropertyCreateWrapper(tmpBag, property, true, client);

            return this;
        };

        this.removePropertyFromBag = function(property,  client) {
            var bag = this.getProperty(property);

            new SPOO.PropertyBagItemRemover(this, property,  client);
            return this;
        };

        this.removePropertyPermissionFromBag = function(property, permissionKey) {
            var bag = this.getProperty(property);

            new SPOO.PropertyBagItemPermissionRemover(this, property, permissionKey);
            return this;
        };

        this.removeProperty = function(propertyName,  client) {

            if (propertyName.indexOf('.') != -1) {
                this.removePropertyFromBag(propertyName,  client);
                return;
            } else {
                if (!this.properties[propertyName]) throw new NoSuchPropertyException(propertyName);



                delete this.properties[propertyName];


            }

            return this;
        };


        this.getId = function() {
            return this._id;
        };

        this.getName = function() {
            return this.name;
        };

        this.setName = function(name) {
            this.name = name;
            return this;
        };

        this.setType = function(type) {
            this.type = type;
            return this;
        };

        this.getType = function() {
            return this.type;
        };

        this.getRef = function(propertyName) {
            return new SPOO.PropertyRefParser(this, propertyName);
        };

        this.getProperty = function(propertyName) {
            //return this.properties[propertyName];
            return SPOO.PropertyParser(this, propertyName);
        };

        this.getProperties = function() {
            return this.properties;
        };

        this.add = function(success, error) {
            
            var client = instance.activeTenant;
            var app = instance.activeApp;

            var thisRef = this;

            Object.keys(thisRef.onCreate).forEach(function(key)
            {
                if(thisRef.onCreate[key].trigger == 'before')
                {
                    //dsl, obj, prop, data, callback, client, options
                    instance.execProcessorAction(thisRef.onCreate[key].value, thisRef, null, null, function(data) {
            
                    }, client, null);
                }
            })

            this.created = moment().toDate().toISOString();
            this.lastModified = moment().toDate().toISOString();

            var thisRef = this;

            var newEvents = [];

            thisRef.aggregatedEvents = [];

            function aggregateAllEvents(props, prePropsString) {

                Object.keys(props).forEach(function(p) {
                    if (props[p].type == CONSTANTS.PROPERTY.TYPE_PROPERTY_BAG)
                        if (prePropsString) {
                            aggregateAllEvents(props[p].properties, prePropsString + "." + p)
                        }
                    else {
                        aggregateAllEvents(props[p].properties, p)
                    }

                    if (props[p].type == CONSTANTS.PROPERTY.TYPE_EVENT) {

                        var date = null;

                        if (props[p].date) {
                            if (!props[p].date.triggered) date = props[p].date;
                            else date = null;
                        } else if (props[p].interval) {
                            if (props[p].nextOccurence) {
                                date = props[p].nextOccurence;
                            } else date = moment().toISOString();
                        }

                        if (prePropsString) {

                            newEvents.push({ obj: thisRef, propName: prePropsString + "." + p, propData: props[p], date: date })

                            var found = false;
                            thisRef.aggregatedEvents.forEach(function(aE) {
                                if (aE.propName == prePropsString + "." + p) found = true;
                            })

                            if (!found) thisRef.aggregatedEvents.push({ propName: prePropsString + "." + p, propData: props[p], date: date });

                        } else {

                            newEvents.push({ obj: thisRef, propName: p, propData: props[p], date: date })

                            var found = false;
                            thisRef.aggregatedEvents.forEach(function(aE) {
                                if (aE.propName == p) found = true;
                            })

                            if (!found) thisRef.aggregatedEvents.push({ propName: p, propData: props[p], date: date });

                        }
                    }

                })
            }

            aggregateAllEvents(this.properties);

            if(!this._id) this._id = SPOO.ID();

            if(app)
                if(this.applications.indexOf(app) == -1) this.applications.push(app);

            delete this.instance;

            SPOO.add(this, function(data) {
                    
                    this._id = data._id;

                    Object.keys(data.onCreate).forEach(function(key)
                    {
                        if(data.onCreate[key].trigger == 'after')
                        {
                            //dsl, obj, prop, data, callback, client, options
                            instance.execProcessorAction(data.onCreate[key].value, data, null, null, function(data) {
                    
                            }, client, null);
                        }
                    })

                    //if(this.role == 'template') this.inherit();


                    /*
                        Call event Aggregator
                        method(this)
                            -> get with template
                            -> add all events
                    */


                    success(data);
                },
                function(err) {
                    error(err);
                    //throw new CallbackErrorException(error);
                }, app, client);

            return this;
        };

        this.update = function(success, error) {

            var client = instance.activeTenant;
            var app = instance.activeApp;


            var thisRef = this;

            Object.keys(thisRef.onChange).forEach(function(key)
            {
                if(thisRef.onChange[key].trigger == 'before')
                {
                    //dsl, obj, prop, data, callback, client, options
                    instance.execProcessorAction(thisRef.onChange[key].value, thisRef, null, null, function(data) {
            
                    }, client, null);
                }
            })

            this.lastModified = moment().toDate().toISOString();

            var thisRef = this;

            var newEvents = [];

            thisRef.aggregatedEvents = [];

            function aggregateAllEvents(props, prePropsString) {

                Object.keys(props).forEach(function(p) {
                    if (props[p].type == CONSTANTS.PROPERTY.TYPE_PROPERTY_BAG)
                        if (prePropsString) {
                            aggregateAllEvents(props[p].properties, prePropsString + "." + p)
                        }
                    else {
                        aggregateAllEvents(props[p].properties, p)
                    }

                    if (props[p].type == CONSTANTS.PROPERTY.TYPE_EVENT) {

                        var date = null;

                        if (props[p].date) {
                            if (!props[p].date.triggered) date = props[p].date;
                            else date = null;
                        } else if (props[p].interval) {
                            if (props[p].nextOccurence) {
                                date = props[p].nextOccurence;
                            } else date = moment().toISOString();
                        }

                        if (prePropsString) {

                            newEvents.push({ obj: thisRef, propName: prePropsString + "." + p, propData: props[p], date: date })

                            var found = false;
                            thisRef.aggregatedEvents.forEach(function(aE) {
                                if (aE.propName == prePropsString + "." + p) found = true;
                            })

                            if (!found) thisRef.aggregatedEvents.push({ propName: prePropsString + "." + p, propData: props[p], date: date });

                        } else {

                            newEvents.push({ obj: thisRef, propName: p, propData: props[p], date: date })

                            var found = false;
                            thisRef.aggregatedEvents.forEach(function(aE) {
                                if (aE.propName == p) found = true;
                            })

                            if (!found) thisRef.aggregatedEvents.push({ propName: p, propData: props[p], date: date });

                        }
                    }

                })
            }

            //aggregateAllEvents(this.properties);


            SPOO.updateO(this, function(data) {


                    Object.keys(data.onChange).forEach(function(key)
                    {
                        if(data.onChange[key].trigger == 'after')
                        {
                            //dsl, obj, prop, data, callback, client, options
                            instance.execProcessorAction(data.onChange[key].value, data, null, null, function(data) {
                    
                            }, client, null);
                        }
                    })


                    //if (this.role == 'template') this.inherit();
                    success(data);

                    /*
                        Call event Aggregator
                        method(this)
                            -> get with template
                            -> add all events
                    */

                },
                function(err) {
                    error(err);
                    //throw new CallbackErrorException(err);
                }, app, client);

            return this;
        };

        this.remove = function(success, error) {

            var client = instance.activeTenant;
            var app = instance.activeApp;


            var thisRef = this;

            Object.keys(thisRef.onDelete).forEach(function(key)
            {
                if(thisRef.onDelete[key].trigger == 'before')
                {
                    //dsl, obj, prop, data, callback, client, options
                    instance.execProcessorAction(thisRef.onDelete[key].value, thisRef, null, null, function(data) {
            
                    }, client, null);
                }
            })


            /*
                        Call event Aggregator
                        method(this)
                            -> remove all events
                    */

            return SPOO.remove(this, function(data)
                {

                     Object.keys(data.onDelete).forEach(function(key)
                    {
                        if(data.onDelete[key].trigger == 'before')
                        {
                            //dsl, obj, prop, data, callback, client, options
                            instance.execProcessorAction(data.onDelete[key].value, data, null, null, function(data) {
                    
                            }, client, null);
                        }
                    })


                }, error, app, client);
        };


        this.get = function(success, error) {

            var client = instance.activeTenant;
            var app = instance.activeApp;
            
            var thisRef = this;
            var counter = 0;

            function arrayDeserialize(obj, parentArray) {

                if (obj.properties) {
                    var propsArray = [];
                    var propertyKeys = Object.keys(obj.properties);
                    propertyKeys.forEach(function(propKey) {

                        if (obj.properties[propKey].type == 'array')
                            arrayDeserialize(obj.properties[propKey], true);

                        if (obj.properties[propKey].permissions) {
                            obj.properties[propKey].permissions = permDeserialize(obj.properties[propKey].permissions);
                        }

                        propsArray.push(Object.assign({ name: propKey }, obj.properties[propKey]));
                    });
                    obj.properties = propsArray;
                }

            }
            // arrayDeserialize(this);

             SPOO.getObjectById(this.role, this._id, function(data) { 

                
                success(SPOO[thisRef.role](data)) 

            }, function(err) { error(err) }, app, client);
             return;

            if (this.inherits.length == 0) {
                success(thisRef);
                return this;
            }


            this.inherits.forEach(function(template) {

                if (thisRef._id != template) {

                    SPOO.getTemplateFieldsForObject(thisRef, template, function() {
                            counter++;
                            if (counter == thisRef.inherits.length) {
                                success(thisRef);
                                return this;
                            }
                        },
                        function(err) {

                            success(thisRef);
                            return this;
                        }, client)
                } else {
                    if (thisRef.inherits.length == 1) {
                        success(thisRef);
                        return this;
                    } else {
                        counter++;
                        return;
                    }
                }
            });


           
        }

        return this;
    },

    hello: function() {
        console.log("Hello from SPOO");
    }

}


module.exports = SPOO;


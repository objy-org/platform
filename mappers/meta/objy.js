var MetaMapper = function(OBJY) {

    this.database = {};

    this.connect = function(connectionString, success, error, options) {
        OBJY.define({
            name: "_meta",
            pluralName: "_metas"
        })
    };

    this.setConnection = function(connection) {
        
    }

    this.redeemClientRegistration = function(_key, success, error) {

        OBJY._metas({type: "clientRegistration", key: _key}).get(data => {
            if(!data.length) return error("activation key not found");

            OBJY._meta(data[0]._id).delete(data => {
                success(_key);
            }, err => {
                error(err)
            })

        }, err => {
            error(err);
        });
    }

    this.createClient = function(_key, clientName, success, error) {

        var db = this.database.useDb(clientName);

        this.database.db.listCollections({ name: 'clientinfos' })
            .next(function(err, collinfo) {
                if (collinfo) {
                    error('Name already taken');
                    return;
                }
                console.log("ignoring err");

                Client = db.model('ClientInfo', ClientSchema);

                var devSecret = shortid.generate() + '' + shortid.generate();

                var newClient = new Client({ name: clientName, key: _key, displayName: clientName });

                newClient.save(function(err, data) {
                    if (err) {
                        console.log("save err");
                        error(err);
                        return;
                    }

                    success(data);
                    console.log('SAVED TO DB');
                })

            });
    }

    this.createClientRegistration = function(success, error) {

        OBJY._meta({type: "clientRegistration", key: shortid.generate() + shortid.generate()}).add(data => {
            success(data)
        }, err => {
            error(err);
        });
    }


    this.createUserRegistrationKey = function(email, client, success, error) {

        OBJY._meta({type: "userRegistration", client: client, key: shortid.generate() + shortid.generate(), email: email}).add(data => {
            success(data)
        }, err => {
            error(err);
        });

    }

    this.createPasswordResetKey = function(uId, client, success, error) {

        OBJY._meta({type: "passwordResetKey", client: client, key: shortid.generate() + shortid.generate(), uId: uId }).add(data => {
            success(data)
        }, err => {
            error(err);
        });

    }


    this.redeemPasswordResetKey = function(_key, client, success, error) {

        OBJY._metas({type: "passwordResetKey", key: _key}).get(data => {
            if(!data.length) return error("reset key not found");

            OBJY._meta(data[0]._id).delete(data => {
                success(data)
            }, err => {
                error(err);
            })
        }, err => {
            error(err);
        })
        
    }


    this.addClientApplication = function(app, success, error, client) {

        var db = this.database.useDb(client);

        ClientInfo = db.model('ClientInfo', ClientSchema);
        getable = ClientInfo;

        var exists = false;

        getable.find({}).exec(function(err, data) {
            if (err) {
                error(err);
                return;
            }
            if (!data.length) return error({ message: 'client not found' })

            exists = data[0].applications.find(app_ => app_.name == app.name);

            if (exists) {
                error({ message: "applications already exists" });
                return;
            }

            getable.update({
                "$addToSet": {
                    "applications": app
                }
            }, function(err, data) {
                if (err) {
                    error(err);
                    return;
                }
                console.log(data);
                success({ "message": "ok" });
                return;
            });
        });

    }

    this.removeClientApplication = function(appId, success, error, client) {

        var db = this.database.useDb(client);

        ClientInfo = db.model('ClientInfo', ClientSchema);
        getable = ClientInfo;

        var exists = false;

        getable.find({}).exec(function(err, data) {
            if (err) {
                error(err);
                return;
            }

            if (!data.length) return error({ message: 'client not found' })

            exists = data[0].applications.find(app => app.name == appId);

            if (!exists) {
                error({ message: "applications doesn't exist" });
                return;
            }

            getable.update({
                "$pull": {
                    "applications": {
                        "name": appId
                    }
                }
            }, function(err, data) {
                if (err) {
                    error(err);
                    return;
                }
                console.log(data);
                success({ "message": "ok" });
                return;
            });
        });

    }


    this.getClientApplications = function(success, error, client) {

        var db = this.database.useDb(client);

        ClientInfo = db.model('ClientInfo', ClientSchema);
        getable = ClientInfo;

        getable.findOne({}, function(err, data) {
            console.log(1, arguments)
            if (err) {
                console.log('err:', err)
                error(err);
                return;
            }
            console.log('data:', data);
            if (data.applications) success(data.applications);
            else success(null)
            return;
        });
    }

    return this;

}

module.exports = MetaMapper;
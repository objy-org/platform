import mongoose from 'mongoose';
import shortid from 'shortid';
var Schema = mongoose.Schema;
var Admin = mongoose.mongo.Admin;

var clientSchema = {
    name: String,
    key: String,
    displayName: String,
    applications: [],
    twoFA: String
};

var ClientSchema = new Schema(clientSchema);

var clientActivationSchema = {
    key: String
};
var ClientActivationSchema = new Schema(clientActivationSchema);


var userRegistrationSchema = {
    email: String,
    client: String,
    key: String,
    date: { type: Date, default: Date.now, expires: '30d' }
};
var UserRegistrationSchema = new Schema(userRegistrationSchema);


var passwordResetSchema = {
    uId: String,
    key: String,
    client: String,
    date: { type: Date, default: Date.now, expires: '1d' }
};
var PasswordResetSchema = new Schema(passwordResetSchema);


var twoFACodeSchema = {
    uId: String,
    key: String,
    client: String,
    date: { type: Date, default: Date.now, expires: '5m' }
};
var TwoFACodeSchema = new Schema(twoFACodeSchema);


export default function MongoMapper() {

    this.database = {};

    this.connect = function(connectionString, success, error, options) {
        this.database = mongoose.createConnection(connectionString, options);

        this.database.on('error', function(err) {
            error(err)
        });

        this.database.once('open', function() {
            success();
        });

        return this;
    };

    this.setConnection = function(connection) {
        this.database = connection;
    }

    this.redeemClientRegistration = function(_key, success, error) {

        let db = this.database.useDb('spoo__meta');

        let ClientActivation = db.model('ClientActivation', ClientActivationSchema);

        ClientActivation.findOne({ key: _key }, function(err, data) {

            if (err) {
                error(err);
                return;
            }
            if (data == null) {
                error("activation key not found");
                return;
            }

            ClientActivation.remove({ key: _key }, function(err, data) {
                if (err) {
                    error(err);
                    return;
                }

                success(_key);
                return;
            });
        });

    }

    this.createClient = function(_key, clientName, success, error) {

        let db = this.database.useDb(clientName);

        this.database.db.listCollections({ name: 'clientinfos' })
            .next(function(err, collinfo) {
                if (collinfo) {
                    error('Name already taken');
                    return;
                }

                let Client = db.model('ClientInfo', ClientSchema);

                let devSecret = shortid.generate() + '' + shortid.generate();

                let newClient = new Client({ name: clientName, key: _key, displayName: clientName });

                newClient.save(function(err, data) {
                    if (err) {
                        console.log("save err");
                        error(err);
                        return;
                    }

                    success(data);
                })

            });
    }

    this.createClientRegistration = function(success, error) {

        let db = this.database.useDb('spoo__meta');

        let ClientActivationKey = db.model('ClientActivation', ClientActivationSchema);

        let newKey = new ClientActivationKey({ _id: null, key: shortid.generate() + shortid.generate() });

        newKey.save(function(err, data) {
            if (err) {
                console.log("save err");
                error(err);
                return;
            }
            success(data);
        })

    }


    this.createUserRegistrationKey = function(email, client, success, error) {

        let db = this.database.useDb(client);

        let UserRegistration = db.model('UserRegistration', UserRegistrationSchema);

        let newKey = new UserRegistration({ _id: null, client: client, key: shortid.generate() + shortid.generate(), email: email });

        newKey.save(function(err, data) {
            if (err) {
                console.log("save err");
                error(err);
                return;
            }
            success(data);
        })

    }

    this.createPasswordResetKey = function(uId, client, success, error) {

        let db = this.database.useDb(client);

        let PasswordReset = db.model('PasswordReset', PasswordResetSchema);

        let newKey = new PasswordReset({ _id: null, client: client, key: shortid.generate() + shortid.generate(), uId: uId });

        newKey.save(function(err, data) {
            if (err) {
                console.log("save err");
                error(err);
                return;
            }
            success(data);
        })

    }


    this.redeemPasswordResetKey = function(_key, client, success, error) {

        let db = this.database.useDb(client);

        let PasswordReset = db.model('PasswordReset', PasswordResetSchema);

        PasswordReset.findOne({ key: _key }, function(err, data) {

            if (err) {
                error(err);
                return;
            }
            if (data == null) {
                error("reset key not found");
                return;
            }

            PasswordReset.remove({ key: _key }, function(_err, _data) {
                if (_err) {
                    error(_err);
                    return;
                }

                success(data);
                return;
            });
        });
    }

    this.createTwoFAKey = function(uId, client, success, error) {

        let db = this.database.useDb(client);

        let TwoFA = db.model('TwoFaKey', TwoFACodeSchema);

        let _key = Math.floor(100000 + Math.random() * 900000) //shortid.generate();

        let newKey = new TwoFA({ _id: null, client: client, key: _key, uId: uId });

        newKey.save(function(err, data) {
            if (err) {
                error(err);
                return;
            }
            success(_key);
        })

    }

    this.redeemTwoFAKey = function(_key, uId, client, success, error) {

        let db = this.database.useDb(client);

        let TwoFA = db.model('TwoFaKey', TwoFACodeSchema);

        TwoFA.findOne({ key: _key, uId: uId }, function(err, data) {

            if (err) {
                error(err);
                return;
            }
            if (data == null) {
                error("reset key not found");
                return;
            }

            TwoFA.remove({ key: _key, uId: uId}, function(_err, _data) {
                if (_err) {
                    error(_err);
                    return;
                }

                success(data);
                return;
            });
        });
    }

    this.getTwoFAMethod = function(success, error, client) {

        let db = this.database.useDb(client);

        let ClientInfo = db.model('ClientInfo', ClientSchema);
        let getable = ClientInfo;

        getable.findOne({}, function(err, data) {

            if (err) {

                error(err);
                return;
            }

            if (data.twoFA) success(data.twoFA);
            else error(null)
            return;
        });
    }

    this.setTwoFAMethod = function(method, success, error, client) {

        let db = this.database.useDb(client);

        let ClientInfo = db.model('ClientInfo', ClientSchema);
        let getable = ClientInfo;

        if (typeof method !== 'string')
            return error('invalid method')

        getable.findOneAndUpdate({}, {twoFA: method}, function(err, data) {

            if (err) {

                error(err);
                return;
            }

            if (data.twoFA) success(data.twoFA);
            else error(null)
            return;
        }, {includeResultMetadata: true});
    }


    this.addClientApplication = function(app, success, error, client) {

        let db = this.database.useDb(client);

        let ClientInfo = db.model('ClientInfo', ClientSchema);
        let getable = ClientInfo;

        let exists = false;

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
                success({ "message": "ok" });
                return;
            });
        });

    }

    this.removeClientApplication = function(appId, success, error, client) {

        let db = this.database.useDb(client);

        let ClientInfo = db.model('ClientInfo', ClientSchema);
        let getable = ClientInfo;

        let exists = false;

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
                success({ "message": "ok" });
                return;
            });
        });

    }


    this.getClientApplications = function(success, error, client) {

        let db = this.database.useDb(client);

        let ClientInfo = db.model('ClientInfo', ClientSchema);
        let getable = ClientInfo;

        getable.findOne({}, function(err, data) {
            if (err) {
                console.log('err:', err)
                error(err);
                return;
            }
            if (data.applications) success(data.applications);
            else success(null)
            return;
        });
    }

    return this;

}
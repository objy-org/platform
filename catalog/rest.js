// platform.js

var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var moment = require("moment")
var Redis = require("ioredis");
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var app = express();
var router = express.Router();
var shortid = require('shortid');
var defaultSecret = 'asdgnm0923t923';

Platform = function(SPOO, OBJY, options) {

    console.log(options)

    this.router = router;

    var redis;

    if (options.redisCon) {
        redis = new Redis(options.redisCon);
    } else redis = new Redis("redis://localhost");

    var objectFamilies = options.objectFamilies || [];

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json({ limit: '300mb' }));
    app.use(cors());
    app.options('*', cors());

    OBJY.hello();

    var metaMapper = options.metaMapper;
    var messageMapper = options.messageMapper;

    var checkObjectFamily = function(req, res, next) {
        if (objectFamilies.indexOf(req.params.entity) == -1 && !objectFamilies.length == 0) {
            res.status(500).json({ message: 'Object Family not available for this interface' })
        }
        next();
    }

    var checkAuthentication = function(req, res, next) {

        var token;

        if (req.headers.authorization) {
            token = req.headers.authorization.slice(7, req.headers.authorization.length)
            console.log(token)
        } else if (req.query.token) {
            token = req.query.token
        }

        console.info(token)

        jwt.verify(token, options.jwtSecret || defaultSecret, function(err, decoded) {
            if (err) return res.status(401).send({ auth: false, message: 'Failed to authenticate token' });

            redis.get(token, function(err, result) {
                if (err || !result) return res.status(401).send({ auth: false, message: 'Failed to authenticate token' });

                req.user = decoded

                if ((decoded.clients || []).indexOf(req.params.client) == -1) return res.status(401).send({ auth: false, message: 'Failed to authenticate token' });

                next()
            });
        });
    }


    // Welcome
    router.route(['/'])

        .get(function(req, res) {
            res.json({ message: "Hi there" })
            console.log("Hi there");
        })

    // Request a client activation key
    router.route(['/client/register'])

        .post(function(req, res) {

            var data = req.body;

            if (!data.email) {
                res.status(404);
                res.json({ error: 'No email address provided' });
                return;
            }

            metaMapper.createClientRegistration(function(data) {

                messageMapper.send((options.clientRegistrationMessage || {}).from || 'SPOO', req.body.email, (options.clientRegistrationMessage || {}).subject || 'your workspace registration key', ((options.clientRegistrationMessage || {}).body || '').replace('__KEY__', data.key) || data.key)

                res.json({ message: 'workspace registration key sent!' })

            }, function(err) {
                res.status(500)
                res.json(err)
            })

        })


    // Redeem a client activation key -> create a client
    router.route(['/client'])

        .post(function(req, res) {

            var reqdata = req.body;

            if (!req.body.registrationKey) {
                res.status(404);
                res.json({ error: 'No activation key found' });
                return;
            }

            reqdata.clientname = reqdata.clientname.replace(/\s/g, '');
            reqdata.clientname = reqdata.clientname.toLowerCase();

            metaMapper.redeemClientRegistration(req.body.registrationKey, function(data) {

                metaMapper.createClient(req.body.registrationKey, reqdata.clientname, function(data) {

                    res.json(data)

                }, function(err) {
                    res.status(500);
                    res.json(err)
                })

            }, function(err) {
                res.status(500);
                res.json(err)
            })

        })



    router.route(['/client/:client/application'])

        .post(checkAuthentication, function(req, res) {

            console.log(req.user);

            var client = req.params.client;

            var appData = req.body;
            var appKey = Object.keys(appData)[0];

            metaMapper.addClientApplication(appData, function(data) {
                res.json(data);
            }, function(err) {
                res.status(500);
                res.json({ error: 'Some Error occured' });
            }, client);

        });

    router.route(['/client/:client/applications'])

        .get(checkAuthentication, function(req, res) {

            console.log(req.user);

            var client = req.params.client;

            metaMapper.getClientApplications(function(data) {

                var _data = [];

                if (req.query.name) {
                    data.forEach(function(d) {
                        if (d.displayName.toLowerCase().indexOf(req.query.name.toLowerCase()) != -1) _data.push(d)
                    })
                } else _data = data;

                _data.forEach(function(d, i) {
                    if (!req.user.privileges[d.name]) _data.splice(i, 1);
                })

                res.json(_data)

            }, function(err) {
                res.status(500);
                res.json({ error: 'Some Error occured' });
            }, client);

        });

    router.route('/client/:client/user/requestkey')

        .post(function(req, res) {

            var data = req.body;

            if (!data.email) {
                res.status(404);
                res.json({ error: 'No email address provided' });
                return;
            } else if (/\S+@\S+/.test(data.email) == false) {
                res.status(404);
                res.json({ error: 'email not valid' });
                return;
            }

            metaMapper.createUserRegistrationKey(data.email, req.params.client, function(data) {

                messageMapper.send((options.userRegistrationMessage || {}).from || 'SPOO', req.body.email, (options.userRegistrationMessage || {}).subject || 'your registration key', ((options.userRegistrationMessage || {}).body || '').replace('__KEY__', data.key) || data.key)

                res.json({ message: 'registration key sent!' })
            }, function(err) {
                res.status(500);
                res.json({ error: err });
            })

        });



    router.route('/client/:client/user/requestpasswordreset')

        .post(function(req, res) {

            var data = req.body;

            var client = req.params.client || client;

            if (!data.email) {
                res.status(404);
                res.json({ error: 'Neither email nor username provided' });
                return;
            } else if (data.email && /\S+@\S+/.test(data.email) == false) {
                res.status(404);
                res.json({ error: 'email not valid' });
                return;
            }

            var query = {};

            if (data.username) query.username = data.username;
            query.email = data.email;

            OBJY.client(req.params.client);

            OBJY['users'](query).get(function(udata) {

                    if (udata.length == 0) {
                        res.status(404);
                        res.json({ error: 'email not found' });
                        return;
                    } else if (udata.length > 1) {
                        res.status(404);
                        res.json({ error: 'use username and email' });
                        return;
                    }

                    metaMapper.createPasswordResetKey(udata[0]._id, req.params.client, function(data) {

                        messageMapper.send((options.userPasswordResetMessage || {}).from || 'SPOO', req.body.email, (options.userPasswordResetMessage || {}).subject || 'your password reset key', ((options.userPasswordResetMessage || {}).body || '').replace('__KEY__', data.key) || data.key)

                        res.json({ message: 'password reset key sent!' })
                    }, function(err) {
                        res.status(500);
                        res.json({ error: err });
                    })

                },
                function(err) {
                    res.status(404);
                    res.json({ error: err });
                    return;
                });

        });


    router.route('/client/:client/user/resetpassword')


        .post(function(req, res) {

            var userData = req.body;

            var client = req.params.client || client;

            if (!req.body.resetKey) {
                res.status(404);
                res.json({ error: 'No Reset Key found' });
                return;
            }

            if (!req.body.password) {
                res.status(404);
                res.json({ error: 'Password not provided' });
                return;
            }

            if (!req.body.password2) {
                res.status(404);
                res.json({ error: 'Password 2 not provided' });
                return;
            }

            if (req.body.password != req.body.password2) {
                res.status(500);
                res.json({ error: 'Passwords do not match' });
                return;
            }

            OBJY.client(req.params.client);

            metaMapper.redeemPasswordResetKey(req.body.resetKey, req.params.client, function(_data) {

                    OBJY.client(req.params.client);

                    OBJY['User'](_data.uId).get(function(data) {

                            data.password = bcrypt.hashSync(req.body.password);

                            data.update(function(spooElem) {
                                    res.json({ message: "Password changed" });
                                    return;
                                },
                                function(err) {
                                    res.status(404);
                                    res.json({ error: err });
                                    return;
                                });

                        },
                        function(err) {
                            res.status(404);
                            res.json({ error: err });
                            return;
                        });
                },
                function(err) {
                    res.status(403);
                    res.json({ error: err });
                    return;
                });
        });

    // ADD: one or many, GET: one or many
    router.route(['/client/:client/register/user', '/client/:client/aapp/:app/register/user'])

        .post(function(req, res) {

            OBJY.client(req.params.client);
            if (req.params.app)
                OBJY.app(req.params.app);

            if (!OBJY['user'])
                res.json({ message: "object family doe not exist" })

            var user = req.body;

            user = SPOO.serialize(req.body);

            if (!user.username) user.username = shortid.generate();
            if (!user.password) user.password = shortid.generate();
            if (!user.email) user.email = shortid.generate() + "@" + shortid.generate() + ".com";

            user.password = bcrypt.hashSync(user.password);

            if (req.body) {

                OBJY['user'](req.body).add(function(data) {
                    res.json(SPOO.deserialize(data))
                }, function(err) {
                    res.json(data)
                })
            }

        })


    // LOGIN
    router.route(['/client/:client/auth', '/client/:client/app/:app/auth'])

        .post(function(req, res) {

            OBJY.client(req.params.client);

            OBJY.users().auth({ username: req.body.username }, function(user) {

                console.info('authenticating user:', user)

                if (bcrypt.compareSync(req.body.password, user.password)) {

                    var clients = user._clients || [];
                    if (clients.indexOf(req.params.client) == -1) clients.push(req.params.client);

                    console.info('clients', clients)

                    var token = jwt.sign({ id: user._id, username: user.username, privileges: user.privileges, clients: clients }, options.jwtSecret || defaultSecret, {
                        expiresIn: 20 * 60000
                    });

                    var refreshToken = shortid.generate() + shortid.generate() + shortid.generate();

                    redis.set(token, 'true', "EX", 1200)
                    redis.set(refreshToken, JSON.stringify(user), "EX", 2592000)

                    console.info('asdsagsdgsdg', SPOO.deserialize(user));

                    res.json({ message: "authenticated", user: SPOO.deserialize(user), token: { accessToken: token, refreshToken: refreshToken } })

                } else {
                    res.status(401)
                    res.json({ message: "not authenticated" })
                }
            }, function(err) {
                res.status(401)
                res.json({ message: "not authenticated" })
            })

        });


    // REFRESH  A TOKEN
    router.route(['/client/:client/token', '/client/:client/app/:app/token'])

        .post(function(req, res) {

            OBJY.client(req.params.client);

            redis.get(req.body.refreshToken, function(err, result) {
                if (err || !result) return res.status(401).send({ auth: false, message: 'Failed to verify refresh token.' });


                console.info(result)

                result = JSON.parse(result);


                var token = jwt.sign(result, options.jwtSecret || defaultSecret, {
                    expiresIn: 20 * 60000
                });

                redis.del(req.body.refreshToken);

                var refreshToken = shortid.generate() + shortid.generate() + shortid.generate();


                redis.set(token, 'true', "EX", 1200)
                redis.set(refreshToken, JSON.stringify(result), "EX", 2592000)

                res.json({ message: "authenticated", user: result, token: { accessToken: token, refreshToken: refreshToken } })
            });


        });

    // REJECT A TOKEN
    router.route(['/client/:client/token/reject', '/client/:client/app/:app/token/reject'])

        .post(function(req, res) {

            OBJY.client(req.params.client);

            redis.get(req.body.accessToken, function(err, result) {
                if (err || !result) return res.status(404).send({ auth: false, message: 'Token not found' });

                console.info(result)

                redis.del(req.body.accessToken);

                res.json({ message: "token rejected" })
            });


        });


    // ADD: one or many, GET: one or many
    router.route(['/client/:client/:entity', '/client/:client/app/:app/:entity'])

        .post(checkAuthentication, checkObjectFamily, function(req, res) {

            OBJY.client(req.params.client);
            if (req.params.app)
                OBJY.app(req.params.app);
            else OBJY.app(undefined);

            if (!OBJY[req.params.entity])
                res.json({ message: "object family doe not exist" })

            // add content

            if (req.body) {

                req.body = SPOO.serialize(req.body);

                OBJY[req.params.entity](req.body).add(function(data) {
                    res.json(SPOO.deserialize(data))
                }, function(err) {
                    res.json(err)
                })
            }

        })

        .get(checkAuthentication, checkObjectFamily, function(req, res) {

            OBJY.client(req.params.client);
            if (req.params.app)
                OBJY.app(req.params.app);
            else OBJY.app(undefined);

            if (!OBJY[req.params.entity])
                res.json({ message: "object family doe not exist" })


            var search = SPOO.serializeQuery(req.query);

            for (var k in search) {
                if (search[k] == 'true') search[k] = true;
                if (search[k] == 'false') search[k] = false;
            }

            Object.keys(search).forEach(function(k) {
                if (k == "$query") search[k] = JSON.parse(search[k])
            })

            delete search.token;

            console.info('getting...', req.params.entity, search)

            OBJY[req.params.entity](search).get(function(data) {


                var _data = [];
                data.forEach(function(d) {
                    _data.push(SPOO.deserialize(d))
                })
                res.json(_data);


            }, function(err) {
                res.json(err)
            })
        });


    // ADD: one or many, GET: one or many
    router.route(['/client/:client/:entity/count', '/client/:client/app/:app/:entity/count'])


        .get(checkAuthentication, checkObjectFamily, function(req, res) {



            OBJY.client(req.params.client);
            if (req.params.app)
                OBJY.app(req.params.app);
            else OBJY.app(undefined);

            if (!OBJY[req.params.entity])
                res.json({ message: "object family doe not exist" })

            var search = req.query;

            for (var k in search) {
                if (search[k] == 'true') search[k] = true;
                if (search[k] == 'false') search[k] = false;
            }

            Object.keys(search).forEach(function(k) {
                if (k == "$query") search[k] = JSON.parse(search[k])
            })

            delete search.token;

            OBJY[req.params.entity](search).count(function(data) {
                res.json(data)

            }, function(err) {
                res.json(err)
            })
        });


    // GET: one, UPDATE: one, DELETE: one
    router.route(['/client/:client/:entity/:id/password', '/client/:client/app/:app/:entity/:id/password'])

        .patch(checkAuthentication, checkObjectFamily, function(req, res) {

            OBJY.client(req.params.client);

            var usrData = req.body;
            var passwordKey = Object.keys(usrData)[0];

            var oldPassword = usrData['old'];
            var newPassword = usrData['new'];

            console.log(req.user)

            if (req.user.id != req.params.id) {
                res.status(403);
                res.json({ error: 'This operation can only be performed by the user' });
                return;
            }

            if (newPassword.length < 3) {
                res.status(500);
                res.json({ error: 'Password too short. Use 3 characters or more' });
                return;
            }


            if (req.params.app)
                OBJY.app(req.params.app);
            else OBJY.app(undefined);

            if (!OBJY[req.params.entity])
                res.json({ message: "object family does not exist" })

            OBJY[req.params.entity](req.params.id).get(function(data) {

                if (!bcrypt.compareSync(oldPassword, data.password)) {
                    res.status(500);
                    res.json({ error: 'Old password not correct' });
                    return;
                }

                try {
                    data.setPassword(bcrypt.hashSync(newPassword));
                } catch (err) {
                    res.status(500);
                    res.json({ error: err });
                    return;
                }

                data.update(function(_data) {
                    res.json(SPOO.deserialize(_data))
                }, function(err) {

                })

            }, function(err) {
                res.json({ msg: err })
            })

        })




    // GET: one, UPDATE: one, DELETE: one
    router.route(['/client/:client/:entity/:id', '/client/:client/app/:app/:entity/:id'])

        .get(checkAuthentication, checkObjectFamily, function(req, res) {

            OBJY.client(req.params.client);
            if (req.params.app)
                OBJY.app(req.params.app);
            else OBJY.app(undefined);

            if (!OBJY[req.params.entity])
                res.json({ message: "object family does not exist" })

            OBJY[req.params.entity](req.params.id).get(function(data) {
                res.json(SPOO.deserialize(data))
            }, function(err) {
                res.json(err)
            })
        })

        .delete(checkAuthentication, checkObjectFamily, function(req, res) {

            OBJY.client(req.params.client);
            if (req.params.app)
                OBJY.app(req.params.app);

            if (!OBJY[req.params.entity])
                res.json({ message: "object family does not exist" })

            OBJY[req.params.entity](req.params.id).remove(function(data) {
                res.json(SPOO.deserialize(data))
            }, function(err) {
                res.json(err)
            })

        })

        .patch(checkAuthentication, checkObjectFamily, function(req, res) {

            OBJY.client(req.params.client);

            console.info('..app..', req.params.app);

            if (req.params.app)
                OBJY.app(req.params.app);
            else OBJY.app(undefined);

            if (!OBJY[req.params.entity])
                res.json({ message: "object family does not exist" })

            OBJY[req.params.entity](req.params.id).get(function(data) {

                var commands = req.body;

                console.info(commands);

                if (!Array.isArray(commands)) {
                    var k = Object.keys(commands)[0];
                    data[k](...commands[k]);
                } else {
                    console.info('arr')
                    commands.forEach(function(c) {
                        var k = Object.keys(c)[0];

                        if (Array.isArray(c[k])) data[k](...c[k]);
                        else data[k](c[k]);

                    })
                }

                console.info('u')

                data.update(function(_data) {
                    res.json(SPOO.deserialize(_data))
                }, function(err) {

                })

            }, function(err) {
                res.json({ msg: err })
            })

        })


        .put(checkAuthentication, checkObjectFamily, function(req, res) {

            OBJY.client(req.params.client);

            if (req.params.app)
                OBJY.app(req.params.app);
            else OBJY.app(undefined);

            if (!OBJY[req.params.entity])
                res.json({ message: "object family does not exist" })

            OBJY[req.params.entity](req.params.id).get(function(data) {

                console.info('commands');

                //data = OBJY[req.params.entity](req.body);

                console.info(data)

                data.replace(SPOO.serialize(req.body));

                data.update(function(_data) {
                    res.json(SPOO.deserialize(_data))
                }, function(err) {

                })

            }, function(err) {
                res.json({ msg: "not found" })
            })

        });


    // ADD: one or many, GET: one or many
    router.route(['/client/:client/:entity/:id/property/:propName/call', '/client/:client/app/:app/:entity/:id/property/:propName/call'])

        .post(checkAuthentication, checkObjectFamily, function(req, res) {

            OBJY.client(req.params.client);
            if (req.params.app)
                OBJY.app(req.params.app);
            else OBJY.app(undefined);

            if (!OBJY[req.params.entity])
                res.json({ message: "object family does not exist" })

            OBJY[req.params.entity](req.params.id).get(function(data) {

                if (data.getProperty(req.params.propName)) {
                    data.getProperty(req.params.propName).call(function(data) {
                        console.log("called");
                        res.json({ message: "called" })
                    }, req.params.client)
                }

            }, function(err) {
                res.json(err)
            })
        });


    router.route(['/client/:client/authenticated', '/client/:client/app/:app/authenticated'])

        .get(checkAuthentication, function(req, res) {
            console.info('ad')
            res.status(200);
            res.json({ authenticated: true });
            return;
        });

    this.run = function() {
        app.listen(options.port || '8888');
        app.use('/api', router);
    }

}

process.on('uncaughtException', function(err) {
    console.error(err)
})

module.exports = Platform;
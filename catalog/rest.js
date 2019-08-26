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


Platform = function(OBJY, options) {

    var redis = new Redis("redis://localhost");

    var objectFamilies = options.objectFamilies || [];

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json({ limit: '300mb' }));
    app.use(cors());
    app.options('*', cors());

    OBJY.hello();

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
            if (err) return res.status(401).send({ auth: false, message: 'Failed to authenticate token.' });

            redis.get(token, function(err, result) {
                if (err || !result) return res.status(401).send({ auth: false, message: 'Failed to authenticate token.' });
                next()
            });
        });
    }


    // ADD: one or many, GET: one or many
    router.route(['/'])

        .get(checkAuthentication, function(req, res) {
            res.json({})
            console.log("ff");
        })


    // ADD: one or many, GET: one or many
    router.route(['/client/:client/register/User', '/client/:client/aapp/:app/register/User'])

        .post(function(req, res) {

            OBJY.client(req.params.client);
            if (req.params.app)
                OBJY.app(req.params.app);

            if (!OBJY['User'])
                res.json({ message: "object family doe not exist" })

            var user = req.body;

            if (!user.username) user.username = shortid.generate();
            if (!user.password) user.password = shortid.generate();
            if (!user.email) user.email = shortid.generate() + "@" + shortid.generate() + ".com";

            user.password = bcrypt.hashSync(user.password);

            if (req.body) {

                OBJY['User'](req.body).add(function(data) {
                    res.json(data)
                }, function(err) {
                    res.json(data)
                })
            }

        })


    // LOGIN
    router.route(['/client/:client/auth', '/client/:client/app/:app/auth'])

        .post(function(req, res) {

            OBJY.client(req.params.client);

            OBJY.Users().auth({ username: req.body.username }, function(user) {

                console.info('authenticating user:', user)

                if (bcrypt.compareSync(req.body.password, user.password)) {

                    var token = jwt.sign({ id: user._id, privileges: user.privileges }, options.jwtSecret || defaultSecret, {
                        expiresIn: 20 * 60000
                    });

                    var refreshToken = shortid.generate() + shortid.generate() + shortid.generate();

                    redis.set(token, 'true', "EX", 1200)
                    redis.set(refreshToken, JSON.stringify(user), "EX", 2592000)


                    res.json({ message: "authenticated", user: user, token: { accessToken: token, refreshToken: refreshToken } })

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

    // REFRESH  A TOKEN
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

            if (!OBJY[req.params.entity])
                res.json({ message: "object family doe not exist" })

            // add content

            if (req.body) {

                OBJY[req.params.entity](req.body).add(function(data) {
                    res.json(data)
                }, function(err) {
                    res.json(err)
                })
            }

        })

        .get(checkAuthentication, checkObjectFamily, function(req, res) {


            OBJY.client(req.params.client);
            if (req.params.app)
                OBJY.app(req.params.app);


            if (!OBJY[req.params.entity])
                res.json({ message: "object family doe not exist" })


            var search = req.query;


            Object.keys(search).forEach(function(k) {
                if (k == "$query") search[k] = JSON.parse(search[k])
            })

            delete search.token;

            console.info('getting...', req.params.entity, search)

            OBJY[req.params.entity](search).get(function(data) {
                res.json(data)

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

            if (!OBJY[req.params.entity])
                res.json({ message: "object family doe not exist" })

            var search = req.query;

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
    router.route(['/client/:client/:entity/:id', '/client/:client/app/:app/:entity/:id'])

        .get(checkAuthentication, checkObjectFamily, function(req, res) {

            OBJY.client(req.params.client);
            if (req.params.app)
                OBJY.app(req.params.app);

            if (!OBJY[req.params.entity])
                res.json({ message: "object family does not exist" })

            OBJY[req.params.entity](req.params.id).get(function(data) {
                res.json(data)
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
                res.json(data)
            }, function(err) {
                res.json(err)
            })

        })

        .patch(checkAuthentication, checkObjectFamily, function(req, res) {

            OBJY.client(req.params.client);
            if (req.params.app)
                OBJY.app(req.params.app);

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

                        console.info(k, c[k]);
                        data[k](...c[k]);
                        console.info(...c[k])

                    })
                }

                console.info('u')

                data.update(function(_data) {
                    res.json(_data)
                }, function(err) {

                })

            }, function(err) {
                res.json({ msg: "not found" })
            })

        })


        .put(checkAuthentication, checkObjectFamily, function(req, res) {

            OBJY.client(req.params.client);

            if (req.params.app)
                OBJY.app(req.params.app);

            if (!OBJY[req.params.entity])
                res.json({ message: "object family does not exist" })

            OBJY[req.params.entity](req.params.id).get(function(data) {

                console.info('commands');

                //data = OBJY[req.params.entity](req.body);

                console.info(data)

                data.replace(req.body);

                data.update(function(_data) {
                    res.json(_data)
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


    app.listen(options.port || '8888');
    app.use('/api', router);

}

process.on('uncaughtException', function(err) {
    console.error(err)
})

module.exports = Platform;
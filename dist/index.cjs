'use strict';

var express = require('express');
var cors = require('cors');
require('moment');
var Redis = require('ioredis');
var jsonwebtoken = require('jsonwebtoken');
var jwtDecode = require('jwt-decode');
var bcrypt = require('bcryptjs');
var shortid = require('shortid');
var fileUpload = require('express-fileupload');
var stream = require('stream');
var isStream = require('is-stream');
var timeout = require('connect-timeout');
var ClientOAuth2 = require('client-oauth2');
var vm = require('vm');
var mail = require('@sendgrid/mail');
var mongoose = require('mongoose');

// platform.js

const { sign, decode, verify } = jsonwebtoken;

const saltRounds = 10;

var app = express();
var router = express.Router();
var defaultSecret = 'asdgnm0923t923';
var defaultMaxUserSessions = 20;

// Helper functions
function propsSerialize(obj) {
    if (obj.properties) {
        var propsObj = {};
        var i;
        for (i = 0; i < obj.properties.length; i++) {
            if (obj.properties[i].type == 'bag' || obj.properties[i].type == 'array') propsSerialize(obj.properties[i]);
            if (typeof obj.properties[i].name == 'undefined') obj.properties[i].name = SPOO.RANDOM();
            propsObj[obj.properties[i].name] = obj.properties[i];
            if (propsObj[obj.properties[i].permissions]) propsObj[obj.properties[i].permissions] = permSerialize(propsObj[obj.properties[i].permissions]);
            delete obj.properties[i].name;
        }
        obj.properties = propsObj;
    }
}

async function checkAuth(OBJY, redis, headers, params, body, metaMapper, messageMapper, options) {
    let token = null;
    let username = null;
    let password = null;
    let grantType = null;
    let user = null;

    if (params.grant_type == 'client_credentials' || body.grant_type == 'client_credentials') {
        grantType = 'client_credentials';

        if (headers.authorization) {
            let auth = (headers.authorization || '').split(' ')[1];
            let headerTokenData = Buffer.from(auth, 'base64').toString().split(':');

            if (headerTokenData?.length == 2) {
                username = decodeURIComponent(headerTokenData[0]);
                password = decodeURIComponent(headerTokenData[1]);
            }
        } else {
            username = body.client_id;
            password = body.client_secret;
        }
    } else {
        grantType = 'password';

        username = body.username;
        password = body.password;
    }

    let result = await new Promise((resolve, reject) => {
        redis.get('cnt_' + username, function (err, result) {
            if (err) return reject();
            else resolve(result);
        });
    });

    OBJY.client(params.client);

    if (params.app) {
        OBJY.app(params.app);
    } else OBJY.app(null);

    OBJY.useUser(null);

    if (result !== null) {
        if (parseInt(result) >= (options.maxUserSessions || defaultMaxUserSessions)) {
            throw { code: 401, message: 'too many sessions' };
        }
    }

    var authQuery = {
        username: { $regex: '^' + username + '$', $options: 'i' },
    };

    if (OBJY?.globalCtx?.authableFields) {
        authQuery = {};
        OBJY.globalCtx.authableFields.forEach((f) => {
            authQuery[f] = { $regex: '^' + (body[f] || username) + '$', $options: 'i' };
        });
    }

    try {
        user = await new Promise((resolve, reject) => {
            OBJY.users().auth(
                authQuery,
                (user) => resolve(user),
                (err) => reject(),
                params.client,
                params.app,
            );
        });
    } catch (err) {
        throw { code: 401, message: 'not authenticated' };
    }

    if (!user.spooAdmin) {
        if (params.app) {
            if (!(user.applications || []).includes(params.app)) {
                throw { code: 401, message: 'not authenticated' };
            }
        }
    }

    // Default checkPassword method can be overwritten
    var checkPassword = bcrypt.compareSync;
    if (options.checkPassword) checkPassword = options.checkPassword;

    if (checkPassword(password, user.password)) {
        var clients = user._clients || [];
        if (clients.indexOf(params.client) == -1) clients.push(params.client);

        var _user = JSON.parse(JSON.stringify(user));

        function doTheActualLogin() {
            var tokenId = shortid.generate() + shortid.generate() + shortid.generate();

            var refreshToken;

            if (body.permanent) refreshToken = 'rt_' + tokenId + 'rt_' + shortid.generate() + shortid.generate() + shortid.generate();

            var accessToken = sign(
                {
                    id: _user._id,
                    username: _user.username,
                    //privileges: _user.privileges,
                    applications: _user.applications,
                    spooAdmin: _user.spooAdmin,
                    clients: clients,
                    //authorisations: _user.authorisations,
                    tokenId: tokenId,
                },
                options.jwtSecret || defaultSecret,
                {
                    expiresIn: 20 * 60000,
                },
            );

            user.clients = clients;

            //redis.set(accessToken, 'true', "EX", 1200)
            //redis.set('at_' + tokenId, accessToken, "EX", 1200)

            try {
                // user authentication details
                redis.set(
                    'ua_' + tokenId,
                    JSON.stringify({
                        id: _user._id,
                        username: _user.username,
                        applications: _user.applications,
                        spooAdmin: _user.spooAdmin,
                        clients: clients,
                        privileges: _user.privileges,
                        authorisations: _user.authorisations,
                    }),
                    'EX',
                    1200,
                );

                redis.set('cnt_' + username, ++result, 'EX', 1200);

                if (body.permanent) {
                    redis.set('rt_' + tokenId, JSON.stringify(user), 'EX', 2592000);
                }
            } catch (e) {
                throw { code: 500, message: 'authentication error' };
            }

            delete user.password;

            token = {
                accessToken: accessToken,
                refreshToken: refreshToken,
            };
        }

        if (grantType == 'client_credentials') {
            await doTheActualLogin();
        } else {
            try {
                await new Promise((resolve, reject) => {
                    metaMapper.getTwoFAMethod(
                        async (method) => {
                            if (method == 'email') {
                                if (body.twoFAKey) {
                                    metaMapper.redeemTwoFAKey(
                                        body.twoFAKey,
                                        _user._id,
                                        params.client,
                                        (success) => {
                                            // 2Fa Code valid, do the login
                                            doTheActualLogin();
                                            resolve();
                                        },
                                        (error) => {
                                            reject({
                                                code: 401,
                                                message: {
                                                    type: '2fa_key_invalid',
                                                    message: '2 FA Key could not be verified',
                                                },
                                            });
                                        },
                                    );
                                } else {
                                    // No 2fa key provided, generating one...

                                    if (!_user.email) {
                                        reject({
                                            code: 401,
                                            message: {
                                                type: '2fa_no_email',
                                                message: '2FA could not be sent, no email provided',
                                            },
                                        });
                                    }

                                    try {
                                        await new Promise((_resolve, _reject) => {
                                            metaMapper.createTwoFAKey(
                                                _user._id,
                                                params.client,
                                                async (_key) => {
                                                    try {
                                                        await messageMapper.send(
                                                            (options.twoFAMessage || {}).from || 'SPOO',
                                                            _user.email,
                                                            (options.twoFAMessage || {}).subject || 'Your 2 Factor Authentication Key',
                                                            ((options.twoFAMessage || {}).body || '')
                                                                .replace('__KEY__', _key)
                                                                .replace('__USERNAME__', _user.username)
                                                                .replace('__CLIENT__', params.client) || _key.toString(),
                                                        );
                                                    } catch (err) {
                                                        _reject({
                                                            code: 400,
                                                            message: {
                                                                type: '2fa_key_create_error',
                                                                message: '2 FA Key could not be sent',
                                                            },
                                                        });
                                                    }

                                                    _reject({
                                                        code: 401,
                                                        message: {
                                                            type: '2fa_key_sent',
                                                            message: '2FA key has been generated and send',
                                                        },
                                                    });
                                                },
                                                (error) => {
                                                    _reject({
                                                        code: 401,
                                                        message: {
                                                            type: '2fa_key_create_error',
                                                            message: '2 FA Key could not be sent',
                                                        },
                                                    });
                                                },
                                            );
                                        });
                                    } catch (e) {
                                        reject(e);
                                    }
                                }
                            } else {
                                reject({
                                    code: 401,
                                    message: {
                                        type: '2fa_method_invalid',
                                        message: '2 FA Method invalid',
                                    },
                                });
                            }
                        },
                        (NoTwoFA) => {
                            // No 2FA implemented, proceed with normal login

                            doTheActualLogin();
                            resolve();
                        },
                        params.client,
                    );
                });
            } catch (err) {
                throw err;
            }
        }
    } else {
        throw { code: 401, message: 'not authenticated' };
    }

    return token;
}

var Rest = function (SPOO, OBJY, options) {
    this.server = app;

    OBJY.Logger.log('Platform options: ' + options);

    this.router = router;

    var redis;

    if (options.redisCon) {
        redis = new Redis(options.redisCon);
    } else redis = new Redis('redis://localhost');

    var objectFamilies = options.objectFamilies || [];

    app.use(function (req, res, next) {
        OBJY.app(null);
        if (req.headers.metaPropPrefix) SPOO.metaPropPrefix = req.headers.metaPropPrefix;
        next();
    });

    app.use(
        express.urlencoded({
            extended: true,
        }),
    );
    app.use(
        express.json({
            limit: '300mb',
        }),
    );
    app.use(cors());
    app.use(fileUpload());
    app.options('*', cors());

    OBJY.hello();

    var metaMapper = options.metaMapper;
    var messageMapper = options.messageMapper;

    var checkObjectFamily = function (req, res, next) {
        if (objectFamilies.indexOf(req.params.entity) == -1 && !objectFamilies.length == 0) {
            return res.status(500).json({
                message: 'Object Family not available for this interface',
            });
        } else next();
    };

    var checkAuthentication = function (req, res, next) {
        if (options.publicPlatform) {
            if (req.method == 'GET') return next();
        }

        var token;

        if (req.headers.authorization) {
            token = req.headers.authorization.slice(7, req.headers.authorization.length);
        } else if (req.query.token) {
            token = req.query.token;
        }

        verify(token, options.jwtSecret || defaultSecret, function (err, decoded) {
            if (err)
                return res.status(401).send({
                    auth: false,
                    message: 'Failed to authenticate token',
                });

            redis.get('ua_' + decoded.tokenId, function (err, result) {
                if (err || !result)
                    return res.status(401).send({
                        auth: false,
                        message: 'Failed to authenticate token',
                    });

                var user = JSON.parse(result);
                req.user = user;

                if (req.user) OBJY.useUser(req.user);

                if ((user.clients || []).indexOf(req.params.client) == -1 && (user.clients || []).length > 0)
                    return res.status(401).send({
                        auth: false,
                        message: 'Failed to authenticate token',
                    });

                next();
            });
        });
    };

    // Welcome
    router
        .route(['/'])

        .get(function (req, res) {
            res.json({
                message: 'Hi there',
            });
        });

    // Request a client activation key
    router
        .route(['/client/register'])

        .post(function (req, res) {
            if (!SPOO.allowClientRegistrations) {
                res.json({
                    message: 'feature disabled',
                });
                return;
            }

            var data = req.body;

            if (!data.email) {
                res.status(400);
                res.json({
                    error: 'No email address provided',
                });
                return;
            }

            metaMapper.createClientRegistration(
                function (data) {
                    if (messageMapper) {
                        messageMapper.send(
                            (options.clientRegistrationMessage || {}).from || 'SPOO',
                            req.body.email,
                            (options.clientRegistrationMessage || {}).subject || 'your workspace registration key',
                            ((options.clientRegistrationMessage || {}).body || '').replace('__KEY__', data.key).replace('__CLIENT__', req.params.client) ||
                                data.key,
                        );
                    }

                    res.json({
                        message: 'workspace registration key sent!',
                    });
                },
                function (err) {
                    res.status(400);
                    res.json({
                        error: err,
                    });
                },
            );
        });

    // Redeem a client activation key -> create a client
    router
        .route(['/client'])

        .post(function (req, res) {
            if (!SPOO.allowClientRegistrations) {
                res.json({
                    message: 'feature disabled',
                });
                return;
            }

            var reqdata = req.body;

            if (!req.body.registrationKey) {
                res.status(404);
                res.json({
                    error: 'No activation key found',
                });
                return;
            }

            reqdata.clientname = reqdata.clientname.replace(/\s/g, '');
            reqdata.clientname = reqdata.clientname.toLowerCase();

            metaMapper.redeemClientRegistration(
                req.body.registrationKey,
                function (data) {
                    metaMapper.createClient(
                        req.body.registrationKey,
                        reqdata.clientname,
                        function (data) {
                            //res.json(data)

                            OBJY.client(reqdata.clientname);

                            if (!OBJY['user']) {
                                res.json({
                                    message: 'object family does not exist',
                                });
                                return;
                            }

                            var user = req.body;

                            if (!user.username) user.username = shortid.generate();
                            if (!user.password) user.password = shortid.generate();
                            if (!user.email) user.email = shortid.generate() + '@' + shortid.generate() + '.com';

                            user.password = bcrypt.hashSync(user.password, saltRounds);

                            if (user.username) {
                                OBJY.useUser(null);

                                OBJY['user']({ username: user.username, email: user.email, password: user.password, spooAdmin: true }).add(
                                    function (udata) {
                                        delete udata.password;
                                        res.json({ client: data, user: SPOO.deserialize(udata) });
                                    },
                                    function (err) {
                                        console.log(err);
                                        res.json(data);
                                    },
                                );
                            }
                        },
                        function (err) {
                            res.status(400);
                            res.json(err);
                        },
                    );
                },
                function (err) {
                    res.status(400);
                    res.json(err);
                },
            );
        });

    router
        .route(['/client/:client/authenticated', '/client/:client/app/:app/authenticated'])

        .get(checkAuthentication, function (req, res) {
            res.status(200);
            res.json({
                authenticated: true,
            });
            return;
        });

    // OAuth

    router
        .route('/client/:client/oauth/services')

        .get(function (req, res) {
            if (options.oAuth) {
                OBJY.client(req.params.client);

                OBJY.useUser(null);

                OBJY[options.oAuthFamily]({}).get(
                    (data) => {
                        var retArr = [];

                        let filteredData = data.filter((d) => {
                            return d.properties?.clientId && d.properties?.clientSecret && d.properties?.accessTokenUri && d.properties?.authorizationUri;
                        });

                        filteredData.forEach((d) => {
                            retArr.push({ name: d.name });
                        });

                        res.json(retArr);
                    },
                    (err) => {
                        return res.status(400).json({ error: 'oauth services not found' });
                    },
                );
            } else return res.status(400).json({ error: 'oauth not available' });
        });

    router
        .route('/client/:client/oauth-login/:oAuthService')

        .get(function (req, res) {
            if (options.oAuth) {
                OBJY.client(req.params.client);

                OBJY.useUser(null);

                OBJY[options.oAuthFamily]({ name: req.params.oAuthService }).get(
                    (data) => {
                        if (data?.length == 0) return res.status(400).json({ error: 'oauth service error' });
                        var data = data[0];

                        var uri = new ClientOAuth2({
                            clientId: data.properties.clientId.value,
                            clientSecret: data.properties.clientSecret.value,
                            accessTokenUri: data.properties.accessTokenUri.value,
                            authorizationUri: data.properties.authorizationUri.value,
                            redirectUri: data.properties.redirectUri.value,
                            scopes: data.properties.scopes.value,
                            state: req.query.state,
                        }).code.getUri();

                        res.redirect(uri);
                    },
                    (err) => {
                        return res.status(400).json({ error: 'oauth service not found' });
                    },
                );
            } else return res.status(400).json({ error: 'oauth not available' });
        });

    router
        .route('/client/:client/auth-callback/:oAuthService')

        .get(function (req, res) {
            var oauth_client;
            var _OBJY = OBJY.clone();

            if (options.oAuth) {
                function authenticateUser(req, user, state, oauth) {
                    var clients = user._clients || [];
                    if (clients.indexOf(req.params.client) == -1) clients.push(req.params.client);

                    var _user = JSON.parse(JSON.stringify(user));

                    var tokenId = shortid.generate() + shortid.generate() + shortid.generate();

                    var refreshToken;

                    /*if (req.body.permanent)*/
                    refreshToken = 'rt_' + tokenId + 'rt_' + shortid.generate() + shortid.generate() + shortid.generate();

                    var token = sign(
                        {
                            id: _user._id,
                            username: _user.username,
                            //privileges: _user.privileges,
                            applications: _user.applications,
                            spooAdmin: _user.spooAdmin,
                            clients: clients,
                            //authorisations: _user.authorisations,
                            tokenId: tokenId,
                        },
                        options.jwtSecret || defaultSecret,
                        {
                            expiresIn: 20 * 60000,
                        },
                    );

                    user.clients = clients;
                    //redis.set(token, 'true', "EX", 1200)
                    redis.set(
                        'ua_' + tokenId,
                        JSON.stringify({
                            id: _user._id,
                            username: _user.username,
                            applications: _user.applications,
                            spooAdmin: _user.spooAdmin,
                            clients: clients,
                            privileges: _user.privileges,
                            authorisations: _user.authorisations,
                        }),
                        'EX',
                        1200,
                    );

                    //if (req.body.permanent) {
                    redis.set('rt_' + tokenId, JSON.stringify(user), 'EX', 2592000);
                    //}

                    delete user.password;

                    //res.redirect(options.oauth.clientRedirect + '?accessToken=' + token + '&refreshToken=' + refreshToken + '&userdata='+Buffer.from(JSON.stringify(SPOO.deserialize(user))).toString('base64'))

                    if (!oauth.clientRedirect?.value) {
                        res.json({
                            message: 'authenticated',
                            /*user: SPOO.deserialize(user),*/
                            token: {
                                accessToken: token,
                                refreshToken: refreshToken,
                            },
                        });

                        //console.log('client redirect', options.oauth.clientRedirect + '?accessToken=' + token + '&refreshToken=' + refreshToken + '&userdata='+Buffer.from(JSON.stringify(SPOO.deserialize(user))).toString('base64'))
                    } else {
                        return res.redirect(
                            oauth.clientRedirect?.value +
                                '?accessToken=' +
                                token +
                                '&refreshToken=' +
                                refreshToken +
                                '&clientId=' +
                                req.params.client +
                                '&state=' +
                                state,
                        );
                    }
                }

                _OBJY.client(req.params.client);

                _OBJY.useUser(null);

                _OBJY[options.oAuthFamily]({ name: req.params.oAuthService }).get((data) => {
                    if (data?.length == 0) return res.status(400).json({ error: 'oauth service error' });
                    var data = data[0];

                    oauth_client = new ClientOAuth2({
                        clientId: data.properties.clientId.value,
                        clientSecret: data.properties.clientSecret.value,
                        accessTokenUri: data.properties.accessTokenUri.value,
                        authorizationUri: data.properties.authorizationUri.value,
                        redirectUri: data.properties.redirectUri.value,
                        scopes: data.properties.scopes.value,
                        state: req.query.state,
                    });

                    if (!data.properties.userFieldsMapping) {
                        data.properties.userFieldsMapping = { properties: {}, type: 'bag' };
                    }

                    oauth_client.code
                        .getToken(req.originalUrl)
                        .then(function (user) {
                            var userData = jwtDecode.jwtDecode(user.accessToken);
                            var state = req.query.state;

                            var query = {};

                            Object.keys(data.properties.userFieldsMapping.properties).forEach((key) => {
                                query[key] = { $regex: '^' + userData[data.properties.userFieldsMapping.properties[key].value] + '$', $options: 'i' };
                            });

                            _OBJY.users(query).get(
                                (users) => {
                                    if (users.length == 0) {
                                        var newUser = { inherits: [] };

                                        if (data.properties.userFieldsTemplate) {
                                            try {
                                                newUser = JSON.parse(JSON.stringify(data.properties.userFieldsTemplate));
                                            } catch (err) {
                                                newUser = { inherits: [] };
                                            }

                                            if (!newUser.inherits) {
                                                newUser.inherits = [];
                                            }
                                        }

                                        Object.keys(data.properties.userFieldsMapping.properties).forEach((key) => {
                                            newUser[key] = userData[data.properties.userFieldsMapping.properties[key].value];
                                        });

                                        newUser.password = 'oauth:' + user.accessToken;

                                        if (!newUser.username) newUser.username = newUser.email || SPOO.OBJY.RANDOM();
                                        _OBJY.user(newUser).add((_user) => {
                                            _OBJY.user(_user._id.toString()).get((usr) => {
                                                authenticateUser(req, usr, state, data.properties);
                                            });
                                        });
                                    } else if (users.length > 0) {
                                        _OBJY.user(users[0]._id.toString()).get(
                                            (_user) => {
                                                _user.password = 'oauth:' + user.accessToken;

                                                _user.update(
                                                    (updatedUser) => {
                                                        authenticateUser(req, updatedUser, state, data.properties);
                                                    },
                                                    (err) => {
                                                        res.status(400).json({ err: err });
                                                    },
                                                );
                                            },
                                            (err) => {
                                                res.status(400).json({ err: err });
                                            },
                                        );
                                    }
                                },
                                (err) => {
                                    res.status(400).json({ err: err });
                                },
                            );
                        })
                        .catch((e) => {
                            res.status(400).json({ err: e });
                        });
                });
            } else return res.status(400).json({ error: 'oauth not available' });
        });

    // SCRIPT: run a script, can return data
    router
        .route(['/client/:client/script', '/client/:client/app/:app/script'])

        .get(checkAuthentication, function (req, res) {
            OBJY.client(req.params.client);

            if (req.params.app) OBJY.app(req.params.app);
            else OBJY.app(null);

            var script = req.query.code;

            function done(data) {
                res.json({
                    data: data,
                });
            }

            var _context = {
                done: done,
                OBJY: OBJY,
            };

            //OBJY.client = function () {};
            //OBJY.useUser = function () {};

            Object.assign(_context, options.scriptContext || {});

            var script = new vm.Script(script);

            vm.createContext(_context);

            script.runInContext(_context);
        })

        .post(checkAuthentication, function (req, res) {
            OBJY.client(req.params.client);

            if (req.params.app) OBJY.app(req.params.app);
            else OBJY.app(null);

            var script = req.body.code;

            function done(data) {
                res.json({
                    data: data,
                });
            }

            var _context = {
                done: done,
                OBJY: OBJY,
            };

            //OBJY.client = function () {};
            //OBJY.useUser = function () {};

            Object.assign(_context, options.scriptContext || {});

            var script = new vm.Script(script);

            vm.createContext(_context);

            script.runInContext(_context);
        });

    router
        .route(['/client/:client/application'])

        .post(checkAuthentication, function (req, res) {
            var client = req.params.client;

            var appData = req.body;
            Object.keys(appData)[0];

            // TODO: add spooAdmin check!

            if (!req.user.spooAdmin) {
                res.json({ error: 'Not authorized' });
                return;
            }

            try {
                metaMapper.addClientApplication(
                    appData,
                    function (data) {
                        res.json(data);
                    },
                    function (err) {
                        res.status(400);
                        res.json({
                            error: 'Some Error occured',
                        });
                    },
                    client,
                );
            } catch (e) {
                res.status(400);
                res.json({ error: e });
            }
        });

    router
        .route(['/client/:client/application/:appId'])

        .delete(checkAuthentication, function (req, res) {
            var client = req.params.client;

            var appKey = req.params.appId;

            if (!req.user.spooAdmin) {
                res.json({ error: 'Not authorized' });
                return;
            }

            try {
                metaMapper.removeClientApplication(
                    appKey,
                    function (data) {
                        res.json(data);
                    },
                    function (err) {
                        res.status(400);
                        res.json(err);
                    },
                    client,
                );
            } catch (e) {
                res.status(400);
                res.json({ error: e });
            }
        })

        .get(checkAuthentication, function (req, res) {
            var client = req.params.client;

            var appKey = req.params.appId;

            try {
                metaMapper.getClientApplications(
                    function (data) {
                        var ret = null;

                        data.forEach((app) => {
                            if (app.name == appKey) ret = app;
                        });

                        if (ret) res.json(ret);
                        else {
                            res.status(404);
                            res.json({
                                error: 'app not found',
                            });
                        }
                    },
                    function (err) {
                        res.status(400);
                        res.json({
                            error: 'Some Error occured',
                        });
                    },
                    client,
                );
            } catch (e) {
                res.status(400);
                res.json({ error: e });
            }
        });

    router
        .route(['/client/:client/applications'])

        .get(checkAuthentication, function (req, res) {
            var client = req.params.client;

            try {
                metaMapper.getClientApplications(
                    function (data) {
                        var _data = [];
                        var clientApps = [];

                        if (req.query.name) {
                            data.forEach(function (d) {
                                if (d.displayName.toLowerCase().indexOf(req.query.name.toLowerCase()) != -1) _data.push(d);
                            });
                        } else _data = data;

                        function getFullAppDetails(name) {
                            var details;
                            _data.forEach((a) => {
                                if (a.name == name) details = a;
                            });
                            return details;
                        }

                        if (!req.user) {
                            clientApps = _data;
                        } else if (!req.user.spooAdmin) {
                            req.user.applications.forEach((a) => {
                                clientApps.push(getFullAppDetails(a));
                            });

                            /*var j;
                        for (j = 0; j < _data.length; j++) {
                            console.log('io', data[j].name, req.user.applications.indexOf(data[j].name));
                            if (req.user.applications.indexOf(data[j].name) == -1) _data.splice(j, 1);
                        }
                        console.log('after apps', _data);
                        var i;
                        for (i = 0; i < _data.length; i++) {
                            console.log('io2', req.user.privileges[data[i].name]);
                            if (!req.user.privileges[data[i].name]) _data.splice(i, 1);
                        }*/
                        } else clientApps = _data;

                        /* _data.forEach(function(d, i) {

                         //if (req.user.applications.indexOf(d.name) == -1) _data.splice(i, 1);
                         //if (!req.applications.privileges[d.name]) _data.splice(i, 1);

                         if(!req.user.spooAdmin && !req.user.privileges[d.name]) _data.splice(i, 1);
                     })*/

                        res.json(clientApps);
                    },
                    function (err) {
                        res.status(400);
                        res.json({
                            error: 'Some Error occured',
                        });
                    },
                    client,
                );
            } catch (e) {
                res.status(400);
                res.json({ error: e });
            }
        });

    router
        .route(['/client/:client/twoFaMethod'])

        .put(checkAuthentication, function (req, res) {
            var client = req.params.client;

            var twoFAMethod = (req.body || {}).method;

            // TODO: add spooAdmin check!

            if (!req.user.spooAdmin) {
                res.json({ error: 'Not authorized' });
                return;
            }

            try {
                metaMapper.setTwoFAMethod(
                    twoFAMethod,
                    function (data) {
                        res.json(data);
                    },
                    function (err) {
                        res.status(400);
                        res.json({
                            error: err,
                        });
                    },
                    client,
                );
            } catch (e) {
                res.status(400);
                res.json({ error: e });
            }
        })

        .get(checkAuthentication, function (req, res) {
            var client = req.params.client;

            if (!req.user.spooAdmin) {
                res.json({ error: 'Not authorized' });
                return;
            }

            try {
                metaMapper.getTwoFAMethod(
                    function (data) {
                        res.json({ method: data });
                    },
                    function (err) {
                        res.status(400);
                        res.json({
                            error: err,
                        });
                    },
                    client,
                );
            } catch (e) {
                res.status(400);
                res.json({ error: e });
            }
        });

    router
        .route('/client/:client/user/requestkey')

        .post(function (req, res) {
            var data = req.body;

            if (!data.email) {
                res.status(400);
                res.json({
                    error: 'No email address provided',
                });
                return;
            } else if (/\S+@\S+/.test(data.email) == false) {
                res.status(400);
                res.json({
                    error: 'email not valid',
                });
                return;
            }

            metaMapper.createUserRegistrationKey(
                data.email,
                req.params.client,
                function (data) {
                    messageMapper.send(
                        (options.userRegistrationMessage || {}).from || 'SPOO',
                        req.body.email,
                        (options.userRegistrationMessage || {}).subject || 'your registration key',
                        ((options.userRegistrationMessage || {}).body || '')
                            .replace('__KEY__', data.key)
                            .replace('__USERNAME__', data.username)
                            .replace('__CLIENT__', req.params.client) || data.key,
                    );

                    res.json({
                        message: 'registration key sent!',
                    });
                },
                function (err) {
                    res.status(400);
                    res.json({
                        error: err,
                    });
                },
            );
        });

    router
        .route('/client/:client/user/requestpasswordreset')

        .post(function (req, res) {
            var data = req.body;

            var client = req.params.client || client;

            if (!data.email) {
                res.status(400);
                res.json({
                    error: 'Neither email nor username provided',
                });
                return;
            } else if (data.email && /\S+@\S+/.test(data.email) == false) {
                res.status(400);
                res.json({
                    error: 'email not valid',
                });
                return;
            }

            var query = {};

            if (data.username) query.username = { $regex: '^' + data.username + '$', $options: 'i' };
            query.email = { $regex: '^' + data.email + '$', $options: 'i' };

            OBJY.client(req.params.client);

            OBJY['users'](query).get(
                function (udata) {
                    if (udata.length == 0) {
                        res.status(404);
                        res.json({
                            error: 'email not found',
                        });
                        return;
                    } else if (udata.length > 1) {
                        res.status(404);
                        res.json({
                            error: 'use username and email',
                        });
                        return;
                    }

                    metaMapper.createPasswordResetKey(
                        udata[0]._id,
                        req.params.client,
                        function (data) {
                            messageMapper.send(
                                (options.userPasswordResetMessage || {}).from || 'SPOO',
                                req.body.email,
                                (options.userPasswordResetMessage || {}).subject || 'your password reset key',
                                ((options.userPasswordResetMessage || {}).body || '')
                                    .replace('__KEY__', data.key)
                                    .replace('__USERNAME__', data.username)
                                    .replace('__CLIENT__', req.params.client) || data.key,
                            );

                            res.json({
                                message: 'password reset key sent!',
                            });
                        },
                        function (err) {
                            res.status(400);
                            res.json({
                                error: err,
                            });
                        },
                    );
                },
                function (err) {
                    res.status(400);
                    res.json({
                        error: err,
                    });
                    return;
                },
            );
        });

    router
        .route('/client/:client/user/resetpassword')

        .post(function (req, res) {
            req.body;

            var client = req.params.client || client;

            if (!req.body.resetKey) {
                res.status(400);
                res.json({
                    error: 'No Reset Key found',
                });
                return;
            }

            if (!req.body.password) {
                res.status(400);
                res.json({
                    error: 'Password not provided',
                });
                return;
            }

            if (!req.body.password2) {
                res.status(400);
                res.json({
                    error: 'Password 2 not provided',
                });
                return;
            }

            if (req.body.password != req.body.password2) {
                res.status(400);
                res.json({
                    error: 'Passwords do not match',
                });
                return;
            }

            OBJY.client(req.params.client);

            metaMapper.redeemPasswordResetKey(
                req.body.resetKey,
                req.params.client,
                function (_data) {
                    OBJY.client(req.params.client);

                    OBJY['user'](_data.uId).get(
                        function (data) {
                            if (options.resetPasswordMethod) {
                                options.resetPasswordMethod(
                                    data,
                                    req.body.password,
                                    (success) => {
                                        res.json({
                                            message: 'Password changed',
                                        });
                                    },
                                    (error) => {
                                        res.status(400);
                                        res.json({
                                            error: error,
                                        });
                                    },
                                    undefined,
                                    client,
                                );
                            } else {
                                data.password = bcrypt.hashSync(req.body.password, saltRounds);

                                data.update(
                                    function (spooElem) {
                                        res.json({
                                            message: 'Password changed',
                                        });
                                        return;
                                    },
                                    function (err) {
                                        res.status(400);
                                        res.json({
                                            error: err,
                                        });
                                        return;
                                    },
                                );
                            }
                        },
                        function (err) {
                            res.status(400);
                            res.json({
                                error: err,
                            });
                            return;
                        },
                    );
                },
                function (err) {
                    res.status(400);
                    res.json({
                        error: err,
                    });
                    return;
                },
            );
        });

    // ADD: one or many, GET: one or many
    router
        .route(['/client/:client/register/user', '/client/:client/aapp/:app/register/user'])

        .post(function (req, res) {
            if (!SPOO.allowUserRegistrations) {
                res.json({
                    message: 'feature disabled',
                });
                return;
            }

            OBJY.client(req.params.client);
            if (req.params.app) OBJY.app(req.params.app);

            if (!OBJY['user'])
                res.json({
                    message: 'object family does not exist',
                });

            var user = req.body;

            user = SPOO.serialize(req.body);

            if (!user.username) user.username = shortid.generate();
            if (!user.password) user.password = shortid.generate();
            if (!user.email) user.email = shortid.generate() + '@' + shortid.generate() + '.com';

            user.password = bcrypt.hashSync(user.password, saltRounds);

            if (req.body) {
                OBJY['user'](user).add(
                    function (data) {
                        res.json(SPOO.deserialize(data));
                    },
                    function (err) {
                        res.json(data);
                    },
                );
            }
        });

    // LOGIN
    router
        .route(['/client/:client/auth', '/client/:client/app/:app/auth'])

        .post(async function (req, res) {
            let token = null;

            try {
                token = await checkAuth(OBJY, redis, req.headers, req.params, req.body, metaMapper, messageMapper, options);
            } catch (err) {
                res.status(err.code);
                return res.json(err.message);
            }

            return res.json({ message: 'authenticated', token });
        });

    // REFRESH  A TOKEN
    router
        .route(['/client/:client/token', '/client/:client/app/:app/token'])

        .post(async function (req, res) {
            OBJY.client(req.params.client);

            if (req.body.grant_type == 'client_credentials') {
                let token = null;

                try {
                    token = await checkAuth(OBJY, redis, req.headers, req.params, req.body, metaMapper, messageMapper, options);
                } catch (err) {
                    console.log(err);

                    res.status(err.code);
                    return res.json(err.message);
                }

                return res.json({ message: 'authenticated', access_token: token.accessToken, token_type: 'Bearer', expires_in: 1200 });
            } else {
                var refreshToken = req.body.refreshToken;
                var oldTokenId = refreshToken.split('rt_')[1];

                redis.get('rt_' + oldTokenId, function (err, result) {
                    if (err || !result)
                        return res.status(401).send({
                            auth: false,
                            message: 'Failed to verify refresh token.',
                        });

                    result = JSON.parse(result);

                    var tokenId = shortid.generate() + shortid.generate() + shortid.generate();

                    var refreshToken = 'rt_' + tokenId + 'rt_' + shortid.generate() + shortid.generate() + shortid.generate();

                    var token = sign(
                        {
                            id: result._id,
                            username: result.username,
                            //privileges: result.privileges,
                            clients: result.clients,
                            applications: result.applications,
                            spooAdmin: result.spooAdmin,
                            //authorisations: result.authorisations,
                            tokenId: tokenId,
                        },
                        options.jwtSecret || defaultSecret,
                        {
                            expiresIn: 20 * 60000,
                        },
                    );

                    setTimeout(function () {
                        redis.del('rt_' + oldTokenId);
                        redis.del('ua_' + oldTokenId);
                    }, 1000);

                    //redis.set(token, 'true', "EX", 1200)
                    redis.set(
                        'ua_' + tokenId,
                        JSON.stringify({
                            id: result._id,
                            username: result.username,
                            applications: result.applications,
                            spooAdmin: result.spooAdmin,
                            clients: result.clients,
                            privileges: result.privileges,
                            authorisations: result.authorisations,
                        }),
                        'EX',
                        1200,
                    );
                    redis.set('rt_' + tokenId, JSON.stringify(result), 'EX', 2592000);

                    delete result.password;

                    res.json({
                        message: 'authenticated',
                        /*user: result,*/
                        token: {
                            accessToken: token,
                            refreshToken: refreshToken,
                        },
                    });
                });
            }
        });

    // REJECT A TOKEN
    router
        .route(['/client/:client/token/reject', '/client/:client/app/:app/token/reject'])

        .post(checkAuthentication, function (req, res) {
            OBJY.client(req.params.client);

            verify(req.body.accessToken, options.jwtSecret || defaultSecret, function (err, decoded) {
                if (err)
                    return res.status(401).send({
                        auth: false,
                        message: 'token is already invalid',
                    });

                redis.get('rt_' + decoded.tokenId, function (err, result) {
                    /*if (err || !result) return res.status(404).send({
                        auth: false,
                        message: 'Token not found'
                    });*/

                    redis.del('ua_' + decoded.tokenId);
                    redis.del('rt_' + decoded.tokenId);

                    redis.get('cnt_' + decoded.username, function (err, result) {
                        if (result !== null) {
                            if (parseInt(result) > 1) redis.set('cnt_' + decoded.username, --result, 'EX', 1200);
                            else redis.del('cnt_' + decoded.username);
                        }
                    });

                    res.json({
                        message: 'token rejected',
                    });
                });
            });
        });

    // ADD: one or many, GET: one or many
    router
        .route(['/client/:client/:entity', '/client/:client/app/:app/:entity'])

        .post(checkAuthentication, checkObjectFamily, function (req, res) {
            OBJY.client(req.params.client);
            if (req.params.app) OBJY.app(req.params.app);
            else OBJY.app(null);

            if (!OBJY[req.params.entity])
                res.json({
                    message: 'object family does not exist',
                });

            // add content

            if (req.files) {
                var k = Object.keys(req.files)[0];
                var file = req.files[k];

                function bufferToStream(buffer) {
                    var stream$1 = new stream.Duplex();
                    stream$1.push(buffer);
                    stream$1.push(null);
                    return stream$1;
                }

                var inStream = bufferToStream(file.data);
                inStream.pause();

                if (SPOO.metaPropPrefix != '') {
                    req.body = {
                        data: inStream,
                        mimetype: file.mimetype,
                    };
                } else {
                    req.body = {
                        properties: {
                            data: inStream,
                            mimetype: file.mimetype,
                        },
                    };
                }

                req.body.name = file.name;
            }

            if (req.body) {
                req.body = SPOO.serialize(req.body);

                var pw = req.body.password || shortid.generate() + '.' + shortid.generate();

                if (req.body.username) {
                    req.body.password = bcrypt.hashSync(pw, saltRounds);
                }

                if (Array.isArray(req.body.properties)) propsSerialize(req.body);

                try {
                    OBJY[req.params.entity](req.body).add(
                        function (data) {
                            res.json(SPOO.deserialize(data));

                            if (req.body.username && !req.query.noemail) {
                                messageMapper.send(
                                    (options.userRegistrationMessage || {}).from || 'SPOO',
                                    req.body.email,
                                    (options.userRegistrationMessage || {}).subject || 'your password',
                                    ((options.userRegistrationMessage || {}).body || '')
                                        .replace('__KEY__', pw)
                                        .replace('__USERNAME__', req.body.username)
                                        .replace('__CLIENT__', req.params.client) || pw,
                                );
                            }
                        },
                        function (err) {
                            res.status(400);
                            res.json({
                                error: err,
                            });
                        },
                    );
                } catch (e) {
                    console.log(e);
                    res.status(400);
                    res.json({
                        error: e,
                    });
                }
            }
        })

        .get(checkAuthentication, checkObjectFamily, function (req, res) {
            var filterFieldsEnabled;

            try {
                if (req.query.$filterFieldsEnabled) filterFieldsEnabled = JSON.parse(req.query.$filterFieldsEnabled);
            } catch (e) {}

            OBJY.client(req.params.client);
            if (req.params.app) OBJY.app(req.params.app);
            else OBJY.app(null);

            if (!OBJY[req.params.entity])
                res.json({
                    message: 'object family does not exist',
                });

            if (req.headers.lazyquery) {
                Object.keys(req.query).forEach(function (k) {
                    if (k.indexOf('properties.') != -1 && k.indexOf('.value') == -1) {
                        req.query[k + '.value'] = req.query[k];
                        delete req.query[k];
                    }
                });
            }

            delete req.query.$filterFieldsEnabled;

            var search = SPOO.serializeQuery(req.query);

            for (var k in search) {
                if (search[k] == 'true') search[k] = true;
                if (search[k] == 'false') search[k] = false;
            }

            Object.keys(search).forEach(function (k) {
                if (k == '$query') {
                    try {
                        search[k] = JSON.parse(search[k]);
                    } catch (e) {}
                }
            });

            delete search.token;

            try {
                OBJY[req.params.entity](search).get(
                    function (data) {
                        var _data = [];
                        data.forEach(function (d) {
                            if ((d.properties || {}).data) {
                                if (isStream.isStream(d.properties.data)) {
                                    delete d.properties.data;
                                    d.properties.path = req.params.entity + '/' + req.params.id + '/stream';
                                }
                            }

                            var d = SPOO.deserialize(d);
                            if (filterFieldsEnabled) d = SPOO.filterFields(d, filterFieldsEnabled);

                            if (req.query.$permsAsArr == 'true') propsSerialize;
                            _data.push(d);
                        });
                        res.json(_data);
                    },
                    function (err) {
                        res.status(400);
                        res.json({
                            error: err,
                        });
                    },
                );
            } catch (e) {
                res.status(400);
                res.json({
                    error: e,
                });
            }
        });

    // ADD: one or many, GET: one or many
    router
        .route(['/client/:client/:entity/count', '/client/:client/app/:app/:entity/count'])

        .get(checkAuthentication, checkObjectFamily, function (req, res) {
            OBJY.client(req.params.client);
            if (req.params.app) OBJY.app(req.params.app);
            else OBJY.app(null);

            if (!OBJY[req.params.entity])
                res.json({
                    message: 'object family doe not exist',
                });

            var search = SPOO.serializeQuery(req.query);

            for (var k in search) {
                if (search[k] == 'true') search[k] = true;
                if (search[k] == 'false') search[k] = false;
            }

            Object.keys(search).forEach(function (k) {
                if (k == '$query') {
                    try {
                        search[k] = JSON.parse(search[k]);
                    } catch (e) {}
                }
            });

            delete search.token;

            try {
                OBJY[req.params.entity](search).count(
                    function (data) {
                        res.json(data);
                    },
                    function (err) {
                        res.json({
                            error: err,
                        });
                    },
                );
            } catch (e) {
                res.status(400);
                res.json({ error: e });
            }
        });

    // GET: one, UPDATE: one, DELETE: one
    router
        .route(['/client/:client/:entity/:id/password', '/client/:client/app/:app/:entity/:id/password'])

        .patch(checkAuthentication, checkObjectFamily, function (req, res) {
            OBJY.client(req.params.client);

            var token = null;
            if (req.headers.authorization) {
                token = req.headers.authorization.slice(7, req.headers.authorization.length);
            } else if (req.query.token) {
                token = req.query.token;
            }

            var decodedToken = verify(token, options.jwtSecret || defaultSecret);
            var tokenId = decodedToken.tokenId;

            var usrData = req.body;
            Object.keys(usrData)[0];

            var oldPassword = usrData['old'];
            var newPassword = usrData['new'];

            if (req.user.id != req.params.id) {
                res.status(400);
                res.json({
                    error: 'This operation can only be performed by the user',
                });
                return;
            }

            if (newPassword.length < 3) {
                res.status(400);
                res.json({
                    error: 'Password too short. Use 3 characters or more',
                });
                return;
            }

            if (req.params.app) OBJY.app(req.params.app);
            else OBJY.app(null);

            if (!OBJY[req.params.entity]) {
                res.json({
                    message: 'object family does not exist',
                });
            }

            OBJY.useUser({
                name: 'changePWUser',
                authorisations: { '*': [{ perm: 'crud', query: JSON.stringify({ role: 'user', username: req.user.username }) }] },
                properties: {},
                role: 'user',
            });

            if (options.changePasswordMethod) {
                options.changePasswordMethod(
                    req.user,
                    oldPassword,
                    newPassword,
                    (success) => {
                        res.json(SPOO.deserialize(req.user));
                    },
                    (error) => {
                        res.status(400);
                        res.json({
                            error: error,
                        });
                    },
                    req.params.app,
                    req.params.client,
                );
            } else {
                try {
                    OBJY[req.params.entity](req.params.id).get(
                        function (data) {
                            if (!bcrypt.compareSync(oldPassword, data.password)) {
                                res.status(400);
                                res.json({
                                    error: 'Old password not correct',
                                });
                                return;
                            }

                            try {
                                data.setPassword(bcrypt.hashSync(newPassword, saltRounds));
                            } catch (err) {
                                res.status(400);
                                res.json({
                                    error: err,
                                });
                                return;
                            }

                            data.update(
                                function (_data) {
                                    redis.del('rt_' + tokenId);
                                    redis.del('ua_' + tokenId);

                                    res.json(SPOO.deserialize(_data));
                                },
                                function (err) {},
                            );
                        },
                        function (err) {
                            res.status(400);
                            res.json({
                                error: err,
                            });
                        },
                    );
                } catch (e) {
                    res.status(400);
                    res.json({ error: e });
                }
            }
        });

    // GET: one, UPDATE: one, DELETE: one
    router
        .route(['/client/:client/:entity/:id', '/client/:client/app/:app/:entity/:id'])

        .get(checkAuthentication, checkObjectFamily, function (req, res) {
            var filterFieldsEnabled;

            try {
                if (req.query.$filterFieldsEnabled) filterFieldsEnabled = JSON.parse(req.query.$filterFieldsEnabled);
            } catch (e) {}

            OBJY.client(req.params.client);
            if (req.params.app) OBJY.app(req.params.app);
            else OBJY.app(null);

            if (!OBJY[req.params.entity]) {
                res.status(400);
                res.json({
                    message: 'object family does not exist',
                });
            }

            try {
                OBJY[req.params.entity](req.params.id).get(
                    function (data) {
                        if ((data.properties || {}).data) {
                            if (isStream.isStream(data.properties.data)) {
                                delete data.properties.data;
                                data.properties.path = req.params.entity + '/' + req.params.id + '/stream';
                            }
                        }

                        data = SPOO.deserialize(data);
                        if (filterFieldsEnabled) data = SPOO.filterFields(data, filterFieldsEnabled);

                        res.json(data);
                    },
                    function (err) {
                        res.status(400);
                        res.json({ error: err });
                    },
                );
            } catch (e) {
                res.status(400);
                res.json({ error: e });
            }
        })

        .delete(checkAuthentication, checkObjectFamily, function (req, res) {
            OBJY.client(req.params.client);
            if (req.params.app) OBJY.app(req.params.app);

            if (!OBJY[req.params.entity])
                res.json({
                    message: 'object family does not exist',
                });

            try {
                OBJY[req.params.entity](req.params.id).remove(
                    function (data) {
                        res.json(SPOO.deserialize(data));
                    },
                    function (err) {
                        res.status(400);
                        res.json({
                            error: err,
                        });
                    },
                );
            } catch (e) {
                res.status(400);
                res.json({ error: e });
            }
        })

        .patch(checkAuthentication, checkObjectFamily, function (req, res) {
            OBJY.client(req.params.client);

            if (req.params.app) OBJY.app(req.params.app);
            else OBJY.app(null);

            if (!OBJY[req.params.entity])
                res.json({
                    message: 'object family does not exist',
                });

            try {
                OBJY[req.params.entity](req.params.id).get(
                    function (data) {
                        var commands = req.body;

                        data = OBJY[data.role](data);

                        try {
                            if (!Array.isArray(commands)) {
                                var k = Object.keys(commands)[0];
                                data[k](...commands[k]);
                            } else {
                                commands.forEach(function (c) {
                                    var k = Object.keys(c)[0];
                                    if (Array.isArray(c[k])) data[k](...c[k]);
                                    else data[k](c[k]);
                                });
                            }

                            data.update(
                                function (_data) {
                                    res.json(SPOO.deserialize(_data));
                                },
                                function (err) {
                                    console.log(err);
                                    res.status(400);
                                    res.json({
                                        error: err,
                                    });
                                },
                            );
                        } catch (e) {
                            console.log(e);
                            res.status(400);
                            res.json({
                                error: e,
                            });
                        }
                    },
                    function (err) {
                        res.status(400);
                        res.json({
                            error: err,
                        });
                    },
                );
            } catch (e) {
                res.status(400);
                res.json({ error: e });
            }
        })

        .put(checkAuthentication, checkObjectFamily, function (req, res) {
            OBJY.client(req.params.client);

            if (req.params.app) OBJY.app(req.params.app);
            else OBJY.app(null);

            if (!OBJY[req.params.entity])
                res.json({
                    message: 'object family does not exist',
                });

            OBJY[req.params.entity](req.params.id).get(
                function (data) {
                    data.replace(SPOO.serialize(req.body));

                    try {
                        data.update(
                            function (_data) {
                                res.json(SPOO.deserialize(_data));
                            },
                            function (err) {},
                        );
                    } catch (e) {
                        res.status(400);
                        res.json({ error: e });
                    }
                },
                function (err) {
                    res.status(400);
                    res.json({
                        error: 'not found',
                    });
                },
            );
        });

    router
        .route(['/client/:client/:entity/:id/stream', '/client/:client/app/:app/:entity/:id/stream'])

        .get(checkAuthentication, checkObjectFamily, function (req, res) {
            OBJY.client(req.params.client);
            if (req.params.app) OBJY.app(req.params.app);
            else OBJY.app(undefined);

            if (!OBJY[req.params.entity])
                res.json({
                    message: 'object family does not exist',
                });

            try {
                OBJY[req.params.entity](req.params.id).get(
                    function (data) {
                        //res.type(data.mimetype)

                        var downloadable = true;
                        ['pdf', 'png', 'jpg', 'jpeg'].forEach((f) => {
                            if (downloadable && (data.name || '').toLowerCase().includes('.' + f)) downloadable = false;
                        });

                        if (downloadable) res.set('Content-Disposition', 'attachment;filename=' + encodeURI(data.name));

                        data.properties.data.resume();
                        data.properties.data.pipe(res);
                    },
                    function (err) {
                        res.json({ error: err });
                    },
                );
            } catch (e) {
                res.status(400);
                res.json({ error: e });
            }
        });

    // ADD: one or many, GET: one or many
    router
        .route(['/client/:client/:entity/:id/property/:propName/call', '/client/:client/app/:app/:entity/:id/property/:propName/call'])

        .post(checkAuthentication, checkObjectFamily, function (req, res) {
            OBJY.client(req.params.client);
            if (req.params.app) OBJY.app(req.params.app);
            else OBJY.app(null);

            if (!OBJY[req.params.entity])
                res.json({
                    message: 'object family does not exist',
                });

            try {
                OBJY[req.params.entity](req.params.id).get(
                    function (data) {
                        if (data.getProperty(req.params.propName)) {
                            data.getProperty(req.params.propName).call(function (data) {
                                res.json({
                                    message: 'called',
                                });
                            }, req.params.client);
                        }
                    },
                    function (err) {
                        res.status(400);
                        res.json({
                            error: err,
                        });
                    },
                );
            } catch (e) {
                res.status(400);
                res.json({ error: e });
            }
        });

    //
    /*
    router
        .route(['/client/:client/:entity/observe'])

        .post(checkAuthentication, checkObjectFamily, function (req, res) {
            OBJY.client(req.params.client);
            if (req.params.app) OBJY.app(req.params.app);
            else OBJY.app(null);

            if (!OBJY[req.params.entity])
                res.json({
                    message: 'object family does not exist',
                });

            
            // CODE HERE



        });
        */

    // PLUG IN EXTENTIONS
    if (Array.isArray(options.extensions || [])) {
        (options.extensions || []).forEach((ext) => {
            if (ext.route) {
                var modifiedRoute = [];

                // Check if tenancy and app contexts are enabled
                if (ext.tenancyContext) {
                    if (!ext.route.includes('client/:client')) modifiedRoute.push('/client/:client' + ext.route);
                }

                if (ext.appContext) {
                    if (ext.tenancyContext) {
                        if (!ext.route.includes('app/:app')) modifiedRoute.push('/client/:client/app/:app' + ext.route);
                    } else if (!ext.route.includes('app/:app')) modifiedRoute.push('/app/:app' + ext.route);
                }

                if (modifiedRoute.length > 0) ext.route = modifiedRoute;

                var newRoute = router.route(ext.route);

                Object.keys(ext.methods).forEach((method) => {
                    var authFn = () => {};
                    if (ext.authable) authFn = checkAuthentication;
                    newRoute[method](authFn, ext.methods[method]);
                });
            }
        });
    }

    this.run = function () {
        app.use('/api', router);
        app.use(timeout(options.timeout || '30s'));
        app.use(function (req, res, next) {
            if (!req.timedout) next();
        });
        app.listen(options.port || '8888');

        return app;
    };
};

process.on('uncaughtException', function (err) {
    console.error(err);
});

const sgMail = new mail.MailService();

function SendgridMapper() {
    this.connect = function(key) {
        sgMail.setApiKey(key);
        return this;
    };

    this.send = async function(from, to, subject, body) {
        var msg = {
            to: to,
            from: from,
            subject: subject,
            html: body
        };

        try {
            await sgMail.send(msg);
        } catch(err){
            throw err
        }
        
    };

}

var Schema = mongoose.Schema;
mongoose.mongo.Admin;

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


function MongoMapper() {

    this.database = {};

    this.connect = function(connectionString, success, error, options) {
        this.database = mongoose.createConnection(connectionString, options);

        this.database.on('error', function(err) {
            error(err);
        });

        this.database.once('open', function() {
            success();
        });

        return this;
    };

    this.setConnection = function(connection) {
        this.database = connection;
    };

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

    };

    this.createClient = function(_key, clientName, success, error) {

        let db = this.database.useDb(clientName);

        this.database.db.listCollections({ name: 'clientinfos' })
            .next(function(err, collinfo) {
                if (collinfo) {
                    error('Name already taken');
                    return;
                }

                let Client = db.model('ClientInfo', ClientSchema);

                shortid.generate() + '' + shortid.generate();

                let newClient = new Client({ name: clientName, key: _key, displayName: clientName });

                newClient.save(function(err, data) {
                    if (err) {
                        console.log("save err");
                        error(err);
                        return;
                    }

                    success(data);
                });

            });
    };

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
        });

    };


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
        });

    };

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
        });

    };


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
    };

    this.createTwoFAKey = function(uId, client, success, error) {

        let db = this.database.useDb(client);

        let TwoFA = db.model('TwoFaKey', TwoFACodeSchema);

        let _key = Math.floor(100000 + Math.random() * 900000); //shortid.generate();

        let newKey = new TwoFA({ _id: null, client: client, key: _key, uId: uId });

        newKey.save(function(err, data) {
            if (err) {
                error(err);
                return;
            }
            success(_key);
        });

    };

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
    };

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
            else error('no 2fa method set');
            return;
        });
    };

    this.setTwoFAMethod = function(method, success, error, client) {

        let db = this.database.useDb(client);

        let ClientInfo = db.model('ClientInfo', ClientSchema);
        let getable = ClientInfo;

        if (typeof method !== 'string' && method != null)
            return error('invalid method')

        getable.findOneAndUpdate({}, {twoFA: method}, function(err, data) {

            if (err) {

                error(err);
                return;
            }

            success(method);

            return;
        }, {includeResultMetadata: true});
    };


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

    };

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

    };


    this.getClientApplications = function(success, error, client) {

        let db = this.database.useDb(client);

        let ClientInfo = db.model('ClientInfo', ClientSchema);
        let getable = ClientInfo;

        getable.findOne({}, function(err, data) {
            if (err) {
                console.log('err:', err);
                error(err);
                return;
            }
            if (data.applications) success(data.applications);
            else success(null);
            return;
        });
    };

    return this;

}

const LEGACY_BLACKLIST = ['$propsAsObj'];

const Platform = {

    authorisationsEnabled: false,
    allowClientRegistrations: true,
    allowUserRegistrations: true,

    metaPropPrefix: '',

    metaProperties: ['role', 'applications', 'inherits', 'onCreate', 'onChange', 'onDelete', 'permissions', 'privileges', 'created', 'lastModified', 'authorisations'],
    staticProperties: ['name', '_id', 'type', 'username', 'email', 'password', '$in', '$and', '$or'],
    flagProperties: ['$sort', '$page', '$query'],

    filterFields: function(obj, filterObj) {

        obj = JSON.parse(JSON.stringify(obj));

        function filter(filterObj, realObj, ignore) {

            Object.keys(realObj || {}).forEach(function(f) {

                if (typeof realObj[f] === 'object') {

                    if (!filterObj) return;

                    var ignore = false;

                    if (filterObj[f]) ignore = true;

                    filter(filterObj[f], realObj[f]);

                }

                if (!filterObj[f] && !ignore && realObj[f]) delete realObj[f];

            });

        }

        filter(filterObj, obj);

        obj._filtered = true;

        return obj;

    },

    serialize: function(obj) {

        return obj;
    },

    serializeQuery: function(obj) {
        var self = this;

        Object.keys(obj).forEach(function(k) {
            if (LEGACY_BLACKLIST.indexOf(k) != -1) delete obj[k];
        });

        if (this.metaPropPrefix == '') return obj;

        if (obj.properties) return obj;

        var self = this;

        var nObj = {
            properties: {}
        };

        for (var prop in obj) {
            try {
                obj[prop] = JSON.parse(obj[prop]);
            } catch (e) {

            }
        }

        for (var prop in obj) {
            if (self.metaProperties.indexOf(prop.substr(1)) == -1) {
                if (self.staticProperties.indexOf(prop) != -1) nObj[prop] = obj[prop];
                else {
                    if (prop.charAt(0) != '$') nObj['properties.' + prop] = obj[prop];
                    else if (prop.charAt(0) == '$' && self.flagProperties.indexOf(prop) != -1) {
                        if (typeof obj[prop] === 'string') {

                            if (obj[prop].charAt(0) == '-') {
                                if (self.staticProperties.indexOf(obj[prop].substr(1)) != -1) {
                                    nObj[prop] = obj[prop];
                                } else nObj[prop] = "-properties." + obj[prop].substr(1);
                            } else {
                                if (self.staticProperties.indexOf(obj[prop]) != -1) {
                                    nObj[prop] = obj[prop];
                                } else nObj[prop] = "properties." + obj[prop];
                            }

                        } else {
                            nObj[prop] = obj[prop];
                        }
                    } else if (prop.charAt(0) == '$' && self.staticProperties.indexOf(prop) == -1) nObj[prop] = "properties." + obj[prop];
                    else if (prop.charAt(0) == '$' && self.staticProperties.indexOf(prop) != -1) nObj[prop] = obj[prop];
                    else nObj[prop] = obj[prop];
                }
            } else {
                if (self.staticProperties.indexOf(prop) != -1) nObj[prop.substr(1)] = obj[prop];
                else nObj[prop.substr(1)] = "properties." + obj[prop];
            }

        }

        delete nObj.properties;
        return nObj;
    },

    deserialize: function(obj) {

        if(obj.role == "user") obj.password = '***';

        return obj;
    },

    metaMappers: {
        mongoMapper: MongoMapper
    },

    messageMappers: {
        sendgridMapper: SendgridMapper
    },

    MetaMapper: {},

    define: function(options) {

        this.OBJY.define(options);

    },

    REST: function(options, enabledObjectFymilies) {
        if (options.OBJY) this.OBJY = options.OBJY;
        if (options.OBJY_CATALOG) {
            this.OBJY_CATALOG = options.OBJY_CATALOG;
            this.CATALOG = options.OBJY_CATALOG;
        }
        return new Rest(this, this.OBJY, options)
    },

    /*MQTT: function(options, enabledObjectFymilies) {
        // TODO...
    }*/
};

module.exports = Platform;
//# sourceMappingURL=index.cjs.map

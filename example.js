var SPOO = require('./index.js');
var OBJY = require('objy');

OBJY.define({
    name: "user",
    pluralName: "users",
    authable: true
})


var P = SPOO.REST({
    port: 80,
    OBJY,
    scriptContext: {
        objects: function(){console.log(',,,')}
    },
    extensions: [{
        route: '/:entity/:id/property/:propName/call',
        authable: true,
        tenancyContext: true,
        appContext: true,
        methods: {
            post: (req, res) => {

            }
        }
    }]
}).run();

/*
SPOO.OBJY.client('default');

SPOO.OBJY.user({username: "sdgsg"}).add(usr => {
	console.log('dummy added')
})

var P = SPOO.REST({
    port: 80,
    oauth: {
        clientId: '229184211896-83tnprfe9asspohej7rftutrsv1dchbb.apps.googleusercontent.com',
        clientSecret: 'mgAnCUo1JxAoR1Thq4oJtZY5',
        accessTokenUri: 'https://accounts.google.com/o/oauth2/token',
        authorizationUri: 'https://accounts.google.com/o/oauth2/v2/auth',
        redirectUri: 'http://localhost/api/client/default/auth-callback',
        scopes: ['profile', 'email', 'openid'],
        userFieldsMapping: {
        	email: 'email'
        }
    }
}).run();
*/
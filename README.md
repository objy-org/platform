# OBJY Platform

OBJY Platform is a framework for building custom platforms. It comes with everythyng needed for running a platform, like  <b>Abstract Object Programming Model, Authorizations, Messaging, User Handling, Multi Tenancy</b> and more.

Install:

```shell
npm i objy objy-platform
```

> For running a basic platform you will need Node.js, Redis and MongoDB. This will change in the future.

```javascript
// 1. import objy and objy-platform
const OBJY = require('objy');
const PLATFORM = require('objy-platform');

// 2. define some "object wrappers"
OBJY.define({
  name: "user",
  pluralName: "users",
  authable: true
})

OBJY.define({
  name: "object",
  pluralName: "objects"
})

// 3. run the platform via REST
PLATFORM.REST({
  port:80,
  OBJY,
  metaMapper: new PLATFORM.metaMappers.mongoMapper().connect("mongodb://localhost") // The matamapper is for basic config
}).run()
```

Parameters help customizing a platform. Some are reqiured, some are optional. Optional ones have default values as shown below.

```javascript
PLATFORM.REST({
  // REQUIRED
  OBJY, // OBJY instance
  metaMapper: new SomeMapper() // The matamapper is for basic config
  messageMapper: new MessageMapper, // Mapper that handles messaging
  redisCon: { // Redis connection
      host: '',
      port: '',
      password: '',
      username: '',
  },
  // or redisCon: 'redis://url.com:port'


  // OPTIONAL
  port: 80, // Port to listen on
  publicPlatform: false, // When true, ALL read requests don'T require authentication
  maxUserSessions: 100, // Max concurrent sessions per user
  userPasswordResetMessage: { // Email params when a user resets a password
      from: 'mail@domain.com',
      subject: '',
      body: '',
  },
  clientRegistrationMessage: { // Email params when a client is registered
      from: 'mail@domain.com',
      subject: '',
      body: '',
  },
  userRegistrationMessage: { // Email params when a user is registered
      from: 'mail@domain.com',
      subject: '',
      body: '',
  }
}).run()
```

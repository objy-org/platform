# SPOO 

SPOO (Single Point of Object) is a JavaScript framework that lets you define custom platforms. 

SPOO is built upon [OBJY](https://objy-org.github.io).

![OBJY](https://objy.io/assets/img/badge-sm.png "SPOO runs on OBJY")


# Quick Example

This quick example shows you how to spin up a platform with just a few lines of code.


```shell
npm i spoojs
```

```javascript
// import objy and spoo
const OBJY = require('objy');
const SPOO = require('spoojs');

// define an "object family"
OBJY.define({
  name: "user",
  pluralName: "users",
  authable: true
})

// run the platform via REST
SPOO.REST({
  port:80,
  OBJY: OBJY,
  metaMapper: new SPOO.metaMappers.mongoMapper().connect("mongodb://localhost")
}).run()
```


# Object Wrappers

Object Wrappers are used to define object pools and introduce the necessary wrappers to the system.


```javascript
OBJY.define({
  name: "template", // the singular name for single object access
  pluralName: "templates", // the plural name for access to multiple objects

  // mappers (default mappers are all in memory):
  storage: new mongo("..."),
  processor: new vm(""),
  observer: new interval() 
})
````


## Custom Mappers

Every Object Wrapper can have custom plugged-in technologies for `persistence`, `processing` and `observing`


```javascript
OBJY.define({
  ...
  storage: new mongo("..."),
  processor: new vm(""),
  observer: new interval() 
})
````


## Start the REST Interface

The REST Interface is the default interface in SPOO. It spins up an express server, that has all the required SPOO routes ready.


```javascript
SPOO.REST({
  port: 80, // The port to run on
  OBJY: OBJY, // Pass the OBJY instance
  redisCon: "localhost", // The redis connection (for session storage)
  metaMapper: new SPOO.metaMappers.mongoMapper().connect("mongodb://localhost") // The meta mapper is required for general config
})
````


# Authors

* **Marco Boelling** - *Initial work* - [Twitter](https://twitter.com/marcoboelling)


# License

SPOO is open source and licensed under the AGPL license.

# Further reading

* For more information on SPOO, go to [spoo.io](https://spoo.io)


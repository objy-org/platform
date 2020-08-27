# SPOO 

SPOO (Single Point of Object) is a JavaScript framework that lets you define custom platforms.


# Quick Example

This quick example shows you how to spin up a platform with just a few lines of code.


> Install via npm:

```shell
npm i spoojs
```

> Set up a platform:

```javascript
// import spoo
const SPOO = require('spoojs');

// define an "object family"
SPOO.define({
  name: "user",
  pluralName: "users",
  authable: true
})

// run the platform via REST
SPOO.REST({
  port:80,
  metaMapper: new SPOO.metaMappers.mongoMapper().connect("mongodb://localhost")
}).run()
```


# Object Wrappers

Object Wrappers are used to define object pools and introduce the necessary wrappers to the system.


```javascript
SPOO.define({
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
SPOO.define({
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


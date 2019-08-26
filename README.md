# SPOO - Build a platform

A scalable JavaScript framework for building dynamic, domain-specific platforms.

## Table of Contents

- [Main Concepts](#Getting Started)
- [Installing](dgs)

## Main Concepts

### Build you own platform

...

### Plug-in the right technologies

Every use case requires the right technologies. SPOO lets you plug-in the technologies you need to solve the problems of your domain or industry.

### Simple Programming Interface

Developing on your platform is done with OBJY. OBJY lets you build use cases by modelling dynamic, behaviour-driven objects that do the work for you, instead of writing static code.

Learn more... 

### Ready-to-use protocols

Wether you build an IoT platform, a cloud platform or anything else, SPOO comes with ready-to-use protocols, like REST, MQTT, ...

Enable the ones you need with just a single line of code.


## Installing

### NPM

```shell
npm install spoo
```


### CDN


```shell
https://spoo.io/code/spoo.js
```



## Quick Example


```javascript
const SPOO = require('spoo');

SPOO.define({
	name: "Asset",
	pluralName: "Assets",
	storage: SPOO.mappers.MongoMapper().connect('mongodb://...')
})

// Enable REST
SPOO.REST({port: 8080})

// Enable MQTT
MQTT({port: 8181})

```

### Built-in Capabilities

- Runs on any infrastructure, at any scale

- Simple, open API

- Don't write much code, just define objects

- Multitenancy

- App Contexts

- User and Permission Handling

- Industry-specific solutions


## Adapters

### Persistence

### Data Processing

### Data Observation

In order to build production-grade platforms and solutions, SPOO let's you plug in just the right technologies for specific use cases. This is what object families are for. They represent objects that have the same requirements for the underlying technologies used for persistence, processing and observation.

See [Mappers](#mappers) for details.


### Example 1: Use Ready to use mappers
```javascript
SPOO.define({
	name : "Item",
	pluralName: "Items",
	persistence: new InMemoryMapper(),
	observer: new RealTimeObserver(),
	processor: new RealTimeProcessor()
})
```

### Example 2: Use inline mappers
```javascript
SPOO.define({
	name : "Item",
	pluralName: "Items",
	persistence: {
		add: function() {

		},
		get: function() {

		},
		...
	},
	observer: {
		initialize: function() {

		},
		run: function(){

		}
	},
	processor: {
		execute: function() {

		}
	}
})
```

## Authors

* **Marco Boelling** - *Creator of SPOO* - [Twitter](https://twitter.com/marcoboelling)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the AGPL License - see the [LICENSE.md](LICENSE.md) file for details

## Connect

* [spoo.io](https://spoo.io) - SPOO's official website
* [Twitter](https://www.twitter.com/spooio) - SPOO's Twitter
* [Medium](https://medium.com/spoo-io) - Official SPOO Blog


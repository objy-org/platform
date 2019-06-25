# SPOO

A framework that uses dynamic, behaviour-driven objects to digitalize real-life use cases and build infrastructure-agnostic, multitenant platforms for any infrastructure and any scale.

## SPOO Objects

Objects are at the center of every use case. They consist of the following key features:

- Properties
- Events
- Actions

With theese features, objects can be used to represent any entity and transform real-life use cases into digital representations.

## Quick Example


First, you need the SPOO Core

```
var SPOO = require('./spoo.js');
var storage = require('./mappers/persistence/inMemory.js');
var observer = require('./mappers/observer/inMemory.js');
var processor = require('./mappers/processor/inMemory.js');

SPOO.define({
	name : "Object",
	pluralName: "Objects",
	persistence: new storage(),
	observer: new observer(),
	processor: new processor()
})

SPOO.Object({}).addProperty('test', {type: 'boolean', value: true}).add(function(data)
{
	console.log(data);
})
```

## Getting Started

SPOO runs on JavaScript and can be used on any JS Runtime, like Node.js or Browsers. In order to plug in technologies, like Databses or Data Processing Frameworks, get the right connectors, or build something yourself.

SPOO and all available connectors can be downloaded from our GitHub repository.


First, you need the SPOO Core

```
var SPOO = require('./spoo.js');
var Obj = require('./catalog/inMemoryObject.js')(SPOO);

Obj({}).addProperty('test', {type: 'boolean', value: true}).add(function(data)
{
	console.log(data);
})
```

## Installing

A step by step series of examples that tell you how to get a development env running

Say what the step will be

### NPM

Core Framework

```
npm install spoo
```

Data Persistence Mappers

```
npm install spoo-mongodb
```

Data Processing Mappers

```
npm install spoo-bulljs
```


### CDN

Core Framework

```
npm install spoo
```

Data Persistence Mappers

```
npm install spoo-mongodb
```

Data Processing Mappers

```
npm install spoo-bulljs
```


### Kubernetes

Core Framework

```
npm install spoo
```

Data Persistence Mappers

```
npm install spoo-mongodb
```

Data Processing Mappers

```
npm install spoo-bulljs

```



## Getting started

Explain how to run the automated tests for this system

Explain what these tests test and why


```
var SPOO = require('spoo');
var MAPPER = require('spoo-mongodb');

// Say hello and make sure everything works
SPOO.hello(); // "Hello from SPOO"


// Plug in mappers
var mapper = SPOO.plugInMapper('plain', new MAPPER());

// Define object families

SPOO.objectFamily('Plain', mapper);


SPOO.Plain = function(obj) {
    return new SPOO.Obj(obj, 'plain');
}


var test = new SPOO.Plain({ name: "test" }).add(function(data, err)
{
	console.log(data);
})

```


## Documentation

### Object Anatomy

### Object Methods

### Global Methods


## Deployment

Add additional notes about how to deploy this on a live system

## Built With

* [Dropwizard](http://www.dropwizard.io/1.0.2/docs/) - The web framework used
* [Maven](https://maven.apache.org/) - Dependency Management
* [ROME](https://rometools.github.io/rome/) - Used to generate RSS Feeds

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Marco Boelling** - *Creator of SPOO, CEO SPOO Technologies* - [Twitter](https://twitter.com/marcoboelling)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Hat tip to anyone whose code was used
* Inspiration
* etc


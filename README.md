# SPOO

A framework that uses dynamic, behaviour-driven objects to digitalize real-life use cases and build infrastructure-agnostic, multitenant platforms for any infrastructure and any scale.

## SPOO Objects

Objects are at the center of every use case. They consist of the following key features:

- Properties
- Events
- Actions

With theese features, objects can be used to represent any entity and transform real-life use cases into digital representations.


## Getting Started

SPOO runs on JavaScript and can be used on any JS Runtime, like Node.js or Browsers. In order to plug in technologies, like Databses or Data Processing Frameworks, get the right connectors, or build something yourself.

SPOO and all available connectors can be downloaded from our GitHub repository.


First, you need the SPOO Core

```
SPOO.Object({name: "Hello World"}).add(function(data)
{
	console.log(data);
});

SPOO.Objects({name: "Hello World"}).get(function(data){
	
})
```

## Installing


### NPM


```
npm install spoo
```


### CDN

Core Framework

```
https://spoo.io/code/spoo.js

 - or -
 
https://spoo.io/code/spoo.min.js

```


## Custom Object Families with Adapters

In order to build production-grade platforms and solutions, SPOO let's your plug in just the right technologies for specific use cases. This is what object families are for. They represent objects that have the same requirements for the underlying technologies used for persistence, processing and observation.

| Mapper Type | Description | Examples
--- | --- | ---
|Persistence| Used to store objects and delegate CRUD operations | Database Systems, File Systems or Caches.
Processor | Used to execute object actions, event actions and handler actions |  Anything that executes JS Code, like eval or the VM Module. Can be proxied with Messaging Systems.
Observer | Observes object events and execute their actions. | Cron-based solutions or event schedulers



### Example
```
// Install the mappers
var storage = require('./mappers/persistence/inMemory.js');
var observer = require('./mappers/observer/inMemory.js');
var processor = require('./mappers/processor/inMemory.js');

// Define an object family
SPOO.define({
	name : "Object",
	pluralName: "Objects",
	persistence: new storage(),
	observer: new observer(),
	processor: new processor()
})

// Use the object family's constructor
SPOO.Object({name: "Hello World"}).add(function(data)
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


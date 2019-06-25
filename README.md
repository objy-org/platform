# SPOO

A framework that uses dynamic, behaviour-driven objects to digitalize real-life use cases and build infrastructure-agnostic, multitenant platforms for any infrastructure and any scale.

## Table of Contents

- [Getting Started](#Getting Started).
- [Installing](dgs)



## Getting Started

SPOO is written in JavaScript and can be used on any JS Runtime, like Node.js or Browsers. It can be downloaded from our GitHub repository or from spoo.io.



## Installing

### NPM

```shell
npm install spoo
```


### CDN


```shell
https://spoo.io/code/spoo.js

 - or -
 
https://spoo.io/code/spoo.min.js
```



## Main Concepts


### Objects

In real life, everything is an object. Every object is dynamic, has characteristics, behaviour and can execute actions. In SPOO, we are adopting the way objects work in real life by offering a way to model objects, that can have the same features like in real life. This makes it super easy to turn real use cases into its digital representation

In fact, SPOO stands for Single Point of Object.

Objects can have the following features


### Pluggable Technologies

Every use case has it's special technical requirements. That's why SPOO has a plaggable and extendable mapper ecosystem to plug in any technology responsible for data persistence, processing and observation. These mappers can be used to define Object Families (Objects that have the same technical requirements and share the same mappers).

### Platform Capabilities

SPOO is perfect for building platforms, because it has everything a platform needs:

- Runs on any infrastructure, at any scale
- Simple, open API
- Don't write much code, just define objects
- Multitenancy
- App Contexts
- User and Permission Handling
- Industry-specific solutions



## Quick Example


```javascript
// Define an object family
SPOO.ObjectFamily({
	name : "Object",
	pluralName: "Objects"
})

// Initialize in the context of a client and (optionally) an app
SPOO.client('myComapny').app('helloWorldApp');

// Create an object
SPOO.Object({name: "Hello World"}).add( obj => {
	console.log(data);
}, err => {
	console.error(err);
})

// Get a single object by its id
SPOO.Object("id...").get( obj => {
	console.log(obj);
}, err => {
	console.error(err);
})

// Query Objects
SPOO.Object({name: "Hello Word"}).get( objs => {
	console.log(objs);
}, err => {
	console.error(err);
})
```



## Custom Object Families with Mappers

In order to build production-grade platforms and solutions, SPOO let's you plug in just the right technologies for specific use cases. This is what object families are for. They represent objects that have the same requirements for the underlying technologies used for persistence, processing and observation.

See [Mappers](#mappers) for details.

### Example
```javascript
// Define an object family with mappers
SPOO.define({
	name : "Item",
	pluralName: "Items",
	persistence: new InMemoryMapper(),
	observer: new RealTimeObserver(),
	processor: new RealTimeProcessor()
})
```


## Build your own mapper - extend the ecosystem

If you need a mapper that doesn't exist yet, you can simply build it yourself. Each mapper type must follow a predefined structure, that can be found inside the mapper directories (_template.js). You can use this template as a starting point.

### Why build a new mapper?

Building mappers is the best way to participate in the SPOO Ecosystem. 

Every use case may have different requirements for the technologies used. By matching requirements and technical solutions, the best results can be archieved.

With many different mappers for different technologies, SPOO can be used to build platforms for a varaity of different use cases and domains.

### Natively integrate third party systems

Mappers can also be used to connect to third party systems and introduce third party data as SPOO objects in your platform.


## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.


## Authors

* **Marco Boelling** - *Creator of SPOO* - [Twitter](https://twitter.com/marcoboelling)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Connect

* [spoo.io](https://spoo.io) - SPOO's official website
* [Twitter](https://www.twitter.com/spooio) - SPOO's Twitter
* [Medium](https://medium.com/spoo-io) - Official SPOO Blog


var Persistence = require('../storage/defaultMapper.js');
var Processor = require('../processor/defaultMapper.js');
var Observer = require('../observer/defaultMapper.js');


Backend = function(SPOO) {
	this.persistence = new Persistence({multitenancy : 'database'});
	this.processor = new Processor(SPOO);
	this.observer = new Observer();
}

module.exports = Backend;
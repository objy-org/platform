var Persistence = require('../mappers/storage/defaultMapper.js');
var Processor = require('../mappers/processor/defaultMapper.js');
var Observer = require('../mappers/observer/defaultMapper.js');


Obj = function(SPOO, name, pluralName)
{
	SPOO.ObjectFamily({
		name: name || 'Object',
		pluralName: pluralName || 'Objects',
		persistence: new Persistence(),
		processor: new Processor(SPOO),
		observer: new Observer()
	})
}

module.exports = Obj;
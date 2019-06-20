
var DefaultBackend = require('../backends/DefaultBackend.js');

Obj = function(SPOO, name, pluralName)
{
	SPOO.ObjectFamily({
		name: name || 'Object',
		pluralName: pluralName || 'Objects',
		backend: new DefaultBackend()
	})
}

module.exports = Obj;
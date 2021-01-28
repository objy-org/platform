const SPOO = require('../');
const OBJY = require('objy');

const Platform = () => SPOO.REST({
    OBJY,
    port: 8080,
})

test('SPOO REST platform instantiates.', () => {
    const platform = Platform();
    expect(platform).toBeDefined();
});
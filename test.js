var SPOO = require('spoo');

SPOO.define({
    name: "User",
    pluralName: "Users",
    storage: null
})


SPOO.REST({
    port: 80
});

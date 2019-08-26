var SPOO = require('spoo');



SPOO.define({
    name: "User",
    pluralName: "Users",
    storage: null
})


SPOO.REST({
    port: 80
});

SPOO.MQTT({
    port: 8990
});



/*
SPOO.define(OBJY, {
    name: "SOCKETIO",
    mapper: function() {

        io.on('connection', function(socket) {
            
            socket.on('Asset:add', function(data) {
                console.log(data);
            });

            socket.on('Asset:add', function(data) {
                console.log(data);
            });

        });

    }
})*/





//SPOO.SOCKETIO(OBJY, '*');
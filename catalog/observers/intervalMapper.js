const Mapper = require('./_template.js');

Mapper.prototype.initialize = function(millis) {
        var self = this;

        // first run
        self.run(new Date());

        // interval
        this.interval = setInterval(function() {

            self.run(new Date());

        }, this.interval)
}

Mapper.prototype.setObjectFamily = function(value) {
    this.objectFamily = value;
};

Mapper.prototype.run = function(date) {
        
        var self = this;

        self.SPOO.getPersistence(this.objectFamily).listClients(function(data){

            data.forEach(function(tenant) {
                    console.log("asfasf", tenant);
                self.SPOO.getPersistence(self.objectFamily).getByCriteria({}, function(objs) {

                        objs.forEach(function(obj) {
                            console.log("asfasf");
                        })

                    }, function(err) {

                    }, /*app*/ undefined, tenant, /*flags*/)
            })

        }, function(err)
        {

        })
}


module.exports = Mapper;
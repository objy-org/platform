
Mapper = function(persistence) {
	this.persistence = persistence;
    this.interval =  null;
    this.initialize();
}

Mapper.prototype.initialize = function(millis) {
        var self = this;

        // first run
        self.run(new Date());

        // interval
        this.interval = setInterval(function() {

            self.run(new Date());

        }, millis || 60000)
}


Mapper.prototype.run = function(date) {
        console.log("-----");
        
        var self = this;

        this.persistence.listTenants(function(data){

            data.forEach(function(tenant) {
                
                self.persistence.getObjsByCriteria({}, function(objs) {
                        
                        objs.forEach(function(obj) {

                        })

                    }, function(err) {

                    }, /*app*/ undefined, tenant, /*flags*/)
            })

        }, function(err)
        {

        })
}


module.exports = Mapper;
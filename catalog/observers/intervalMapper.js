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

Mapper.prototype.run = function(date) {
        
        var self = this;

        self.SPOO.getPersistence(this.objectFamily).listClients(function(data){

            data.forEach(function(tenant) {
                    
                console.log("asfasf", date, date.toISOString());

                console.log("...", tenant);

                self.SPOO.getPersistence(self.objectFamily).getByCriteria({ $or: [ { aggregatedEvents: {
                        $elemMatch: {
                          'date': { $lte: date.toISOString() }
                        }} },

                        { aggregatedEvents: {
                        $elemMatch: {
                          'nectInterval': { $lte: date.toISOString() }
                        }} }

                        ]}, function(objs) {

                        objs.forEach(function(obj) {

                            obj.aggregatedEvents.forEach(function(aE)
                            {

                                if(aE.date <= date.toISOString())
                                {
                                    console.log(aE)
                                    var prop = obj.getProperty(aE.propName);

                                    console.log("pers-", self.SPOO.getPersistence(obj.role).index);

                                    self.SPOO.execProcessorAction(prop.action, obj, prop, null, function() {
                                        
                                        obj.setEventTriggered(aE.propName, true, tenant).update(function(){
                                            console.log("updated");
                                        }, function(err)
                                        {
                                            console.log(err);
                                        }, tenant)

                                      
                                    }, tenant, {});
                                }
                            })

                            
                        })

                    }, function(err) {

                    }, /*app*/ undefined, tenant, /*flags*/)
            })

        }, function(err)
        {

        })
}


module.exports = Mapper;
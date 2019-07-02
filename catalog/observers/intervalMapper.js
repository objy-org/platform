const Mapper = require('./_template.js');

Mapper.prototype.initialize = function(millis) {
        var self = this;

        // first run
        //self.run(new Date());

        // interval
        this.interval = setInterval(function() {

            self.run(new Date());

        }, this.interval)
}


Mapper.prototype.run = function(date) {
        
        var self = this;

        console.log("of", this)

        self.SPOO.getPersistence(self.objectFamily).listClients(function(data){

            data.forEach(function(tenant) {
                    
                console.log("current run: ", date.toISOString());

                self.SPOO.getPersistence(self.objectFamily).getByCriteria({ $or: [ { aggregatedEvents: {
                        $elemMatch: {
                          'date': { $lte: date.toISOString() }
                        }} },

                        { aggregatedEvents: {
                        $elemMatch: {
                          'nextInterval': { $lte: date.toISOString() }
                        }} }

                        ]}, function(objs) {

                        objs.forEach(function(obj) {

                            obj.aggregatedEvents.forEach(function(aE)
                            {
                                if(aE.date <= date.toISOString())
                                {
                                    
                                    var prop = obj.getProperty(aE.propName);

                                    self.SPOO.execProcessorAction(prop.action, obj, prop, null, function() {
                                        
                                        obj.setEventTriggered(aE.propName, true, tenant).update(function(d){
                                            
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
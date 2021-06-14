module.exports = (SPOO, OBJY) => {
    return [{
        route: '/:entity/:id/property/:propName/call',
        authable: true,
        tenancyContext: true,
        appContext: true,
        methods: {
            post: (req, res) => {
                OBJY.client(req.params.client);
                if (req.params.app)
                    OBJY.activeApp = req.params.app;
                else OBJY.activeApp = undefined;

                if (!OBJY[req.params.entity])
                    res.json({
                        message: "object family does not exist"
                    })

                try {
                    OBJY[req.params.entity](req.params.id).get(function(data) {

                        if (data.getProperty(req.params.propName)) {
                            data.getProperty(req.params.propName).call(function(data) {

                                res.json({
                                    message: "called"
                                })
                            }, req.params.client)
                        }

                    }, function(err) {
                        res.status(400);
                        res.json({
                            error: err
                        })
                    })
                } catch (e) {
                    res.status(400);
                    res.json({ error: e });
                }
            }
        }
    }]
}
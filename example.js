SPOO.REST({
	port: 80,
	mappers: {
		meta : SPOO.mapper({
				requestPasswordReset: () => {

				},
				countUserSessions: () => {

				},
				setRefreshToken: () => {

				},
				setAccessToken: () => {
					
				},
				authenticateUser: () => {

				},
				checkPassword: () => {

				},
				authenticateUser: () => {

				}
			}),
			session: new RedisMapper()
	},
	routes: [{
		paths: ['/client/:client/:entity/:id'],
		post: () => {
			res.json(req.params.id)
		}
	}]
})
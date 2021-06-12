SPOO.REST({
	port: 80,
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
	routes: [{
		paths: ['/store/apps'],
		auth: true,
		post: () => {
			res.json(req.params.id)
		}
	},
	{
		paths: ['/client/:client/apps'],
		post: () => {
			OBJY.app({}).get()
		}
	}]
})
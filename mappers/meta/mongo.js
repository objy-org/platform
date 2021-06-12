module.exports = () => {
	getAccessToken: (tokenId, success, error) => {
		
		redis.get('at_' + tokenId, function(err, result) {

                console.log("Got token from redis " + result);

                if (err || !result) return error(401)

                success(decoded)
            });
	}
}
const constants = require("../../lib/constants")
const {fetchUser} = require("../../lib/collectors")
const {render} = require("pinski/plugins")

module.exports = [
	{route: `/u/(${constants.external.username_regex})/rss.xml`, methods: ["GET"], code: async ({url, fill}) => {
		const user = await fetchUser(fill[0])
		const content = user.timeline.getFeed().xml()
		return {
			statusCode: 200,
			contentType: "application/rss+xml", // see https://stackoverflow.com/questions/595616/what-is-the-correct-mime-type-to-use-for-an-rss-feed
			content
		}
	}}
]

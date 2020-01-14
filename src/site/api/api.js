const constants = require("../../lib/constants")
const {fetchUser} = require("../../lib/collectors")

function reply(statusCode, content) {
	return {
		statusCode: statusCode,
		contentType: "application/json",
		content: JSON.stringify(content)
	}
}

module.exports = [
	{route: `/api/user/(${constants.external.username_regex})`, methods: ["GET"], code: async ({fill}) => {
		const user = await fetchUser(fill[0])
		const data = user.export()
		return reply(200, data)
	}}
]

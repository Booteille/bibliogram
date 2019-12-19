const passthrough = require("../../../../../passthrough")

module.exports = [
	{
		route: "/api/templates", methods: ["GET"], code: async () => {
			const result = {}
			const entries = passthrough.instance.pugCache.entries()
			for (const [file, value] of entries) {
				const match = file.match(/client\/.*?([^/]+)\.pug$/)
				if (match) {
					const name = match[1]
					result[name] = value.client.toString()
				}
			}
			return [200, result]
		}
	}
]

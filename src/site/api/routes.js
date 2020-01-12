const {fetchUser} = require("../../lib/collectors")
const {render} = require("pinski/plugins")

module.exports = [
	{route: "/u/([\\w.]+)", methods: ["GET"], code: async ({url, fill}) => {
		const params = url.searchParams
		const user = await fetchUser(fill[0])
		const page = +params.get("page")
		if (typeof page === "number" && !isNaN(page) && page >= 1) {
			await user.timeline.fetchUpToPage(page - 1)
		}
		return render(200, "pug/user.pug", {url, user})
	}}
]

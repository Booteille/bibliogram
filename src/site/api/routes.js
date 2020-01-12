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
	}},
	{route: "/fragment/user/([\\w.]+)/(\\d+)", methods: ["GET"], code: async ({url, fill}) => {
		const user = await fetchUser(fill[0])
		const pageNumber = +fill[1]
		const pageIndex = pageNumber - 1
		await user.timeline.fetchUpToPage(pageIndex)
		if (user.timeline.pages[pageIndex]) {
			return render(200, "pug/fragments/timeline_page.pug", {page: user.timeline.pages[pageIndex], pageIndex, user, url})
		} else {
			return {
				statusCode: 400,
				contentType: "text/html",
				content: "That page does not exist"
			}
		}
	}}
]

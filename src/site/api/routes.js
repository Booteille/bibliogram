const constants = require("../../lib/constants")
const {fetchUser, fetchShortcode} = require("../../lib/collectors")
const {render} = require("pinski/plugins")

module.exports = [
	{
		route: `/u/(${constants.external.username_regex})`, methods: ["GET"], code: async ({url, fill}) => {
			const params = url.searchParams
			const user = await fetchUser(fill[0])
			const page = +params.get("page")
			if (typeof page === "number" && !isNaN(page) && page >= 1) {
				await user.timeline.fetchUpToPage(page - 1)
			}
			return render(200, "pug/user.pug", {url, user})
		}
	},
	{
		route: `/fragment/user/(${constants.external.username_regex})/(\\d+)`, methods: ["GET"], code: async ({url, fill}) => {
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
		}
	},
	{
		route: `/p/(${constants.external.shortcode_regex})`, methods: ["GET"], code: async ({fill}) => {
			const post = await fetchShortcode(fill[0])
			await post.fetchExtendedOwner()
			return render(200, "pug/post.pug", {post})
		}
	}
]

const constants = require("../constants")
const TimelineImage = require("./TimelineImage")
const collectors = require("../collectors")
require("../testimports")(constants, TimelineImage)

function transformEdges(edges) {
	return edges.map(e => new TimelineImage(e.node))
}

class Timeline {
	/**
	 * @param {import("./User")} user
	 */
	constructor(user) {
		this.user = user
		this.pages = []
		this.addPage(this.user.data.edge_owner_to_timeline_media)
		this.page_info = this.user.data.edge_owner_to_timeline_media.page_info
	}

	hasNextPage() {
		return this.page_info.has_next_page
	}

	fetchNextPage() {
		if (!this.hasNextPage()) return constants.symbols.NO_MORE_PAGES
		return collectors.fetchTimelinePage(this.user.data.id, this.page_info.end_cursor).then(page => {
			this.addPage(page)
			return this.pages.slice(-1)[0]
		})
	}

	async fetchUpToPage(index) {
		while (this.pages[index] === undefined && this.hasNextPage()) {
			await this.fetchNextPage()
		}
	}

	addPage(page) {
		this.pages.push(transformEdges(page.edges))
		this.page_info = page.page_info
	}
}

module.exports = Timeline

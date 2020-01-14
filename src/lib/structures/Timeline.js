const RSS = require("rss")
const constants = require("../constants")
const config = require("../../../config")
const TimelineImage = require("./TimelineImage")
const collectors = require("../collectors")
require("../testimports")(constants, TimelineImage)

/** @param {any[]} edges */
function transformEdges(edges) {
	return edges.map(e => new TimelineImage(e.node))
}

class Timeline {
	/**
	 * @param {import("./User")} user
	 */
	constructor(user) {
		this.user = user
		/** @type {import("./TimelineImage")[][]} */
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

	getFeed() {
		const feed = new RSS({
			title: `@${this.user.data.username}`,
			feed_url: `${config.website_origin}/u/${this.user.data.username}/rss.xml`,
			site_url: config.website_origin,
			description: this.user.data.biography,
			image_url: this.user.data.profile_pic_url,
			pubDate: new Date(this.user.cachedAt),
			ttl: this.user.getTtl(1000*60) // scale to minute
		})
		const page = this.pages[0] // only get posts from first page
		for (const item of page) {
			feed.item(item.getFeedData())
		}
		return feed
	}
}

module.exports = Timeline

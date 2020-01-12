const Timeline = require("./Timeline")
require("../testimports")(Timeline)

class User {
	/**
	 * @param {import("../types").GraphUser} data
	 */
	constructor(data) {
		this.data = data
		this.following = data.edge_follow.count
		this.followedBy = data.edge_followed_by.count
		this.posts = data.edge_owner_to_timeline_media.count
		this.timeline = new Timeline(this)
	}

	export() {
		return this.data
	}
}

module.exports = User

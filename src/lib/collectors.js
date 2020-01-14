const constants = require("./constants")
const {request} = require("./utils/request")
const {extractSharedData} = require("./utils/body")
const InstaCache = require("./cache")
const {User} = require("./structures")
require("./testimports")(constants, request, extractSharedData, InstaCache, User)

const cache = new InstaCache(constants.resource_cache_time)

function fetchUser(username) {
	return cache.getOrFetch("user/"+username, () => {
		return request(`https://www.instagram.com/${username}/`).then(res => res.text()).then(text => {
			const sharedData = extractSharedData(text)
			const user = new User(sharedData.entry_data.ProfilePage[0].graphql.user)
			return user
		})
	})
}

/**
 * @param {string} userID
 * @param {string} after
 * @returns {Promise<import("./types").PagedEdges<import("./types").GraphImage>>}
 */
function fetchTimelinePage(userID, after) {
	const p = new URLSearchParams()
	p.set("query_hash", constants.external.timeline_query_hash)
	p.set("variables", JSON.stringify({
		id: userID,
		first: constants.external.timeline_fetch_first,
		after: after
	}))
	return cache.getOrFetchPromise("page/"+after, () => {
		return request(`https://www.instagram.com/graphql/query/?${p.toString()}`).then(res => res.json()).then(root => {
			/** @type {import("./types").PagedEdges<import("./types").GraphImage>} */
			const timeline = root.data.user.edge_owner_to_timeline_media
			return timeline
		})
	})
}

module.exports.fetchUser = fetchUser
module.exports.fetchTimelinePage = fetchTimelinePage

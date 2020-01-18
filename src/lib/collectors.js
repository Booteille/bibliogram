const constants = require("./constants")
const {request} = require("./utils/request")
const {extractSharedData} = require("./utils/body")
const {TtlCache, RequestCache} = require("./cache")
require("./testimports")(constants, request, extractSharedData, RequestCache)

const requestCache = new RequestCache(constants.resource_cache_time)
/** @type {import("./cache").TtlCache<import("./structures/TimelineImage")>} */
const timelineImageCache = new TtlCache(constants.resource_cache_time)

function fetchUser(username) {
	return requestCache.getOrFetch("user/"+username, () => {
		return request(`https://www.instagram.com/${username}/`).then(res => res.text()).then(text => {
			// require down here or have to deal with require loop. require cache will take care of it anyway.
			// User -> Timeline -> TimelineImage -> collectors -/> User
			const User = require("./structures/User")
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
	return requestCache.getOrFetchPromise("page/"+after, () => {
		return request(`https://www.instagram.com/graphql/query/?${p.toString()}`).then(res => res.json()).then(root => {
			/** @type {import("./types").PagedEdges<import("./types").GraphImage>} */
			const timeline = root.data.user.edge_owner_to_timeline_media
			return timeline
		})
	})
}

/**
 * @param {string} shortcode
 * @param {boolean} needDirect
 * @returns {Promise<import("./structures/TimelineImage")>}
 */
function fetchShortcode(shortcode, needDirect = false) {
	const attempt = timelineImageCache.get(shortcode)
	if (attempt && (attempt.isDirect === true || needDirect === false)) return Promise.resolve(attempt)

	// example actual query from web:
	// query_hash=2b0673e0dc4580674a88d426fe00ea90&variables={"shortcode":"xxxxxxxxxxx","child_comment_count":3,"fetch_comment_count":40,"parent_comment_count":24,"has_threaded_comments":true}
	// we will not include params about comments, which means we will not receive comments, but everything else should still work fine
	const p = new URLSearchParams()
	p.set("query_hash", constants.external.shortcode_query_hash)
	p.set("variables", JSON.stringify({shortcode}))
	return requestCache.getOrFetchPromise("shortcode/"+shortcode, () => {
		return request(`https://www.instagram.com/graphql/query/?${p.toString()}`).then(res => res.json()).then(root => {
			/** @type {import("./types").GraphImage} */
			const data = root.data.shortcode_media
			return createShortcodeFromData(data, true)
		})
	})
}

/**
 * @param {import("./types").GraphImage} data
 * @param {boolean} isDirect
 */
function createShortcodeFromData(data, isDirect) {
	const existing = timelineImageCache.get(data.shortcode)
	if (existing) {
		existing.updateData(data, isDirect)
		return existing
	} else {
		// require down here or have to deal with require loop. require cache will take care of it anyway.
		// TimelineImage -> collectors -/> TimelineImage
		const TimelineImage = require("./structures/TimelineImage")
		const timelineImage = new TimelineImage(data, false)
		timelineImageCache.set(data.shortcode, timelineImage)
		return timelineImage
	}
}

module.exports.fetchUser = fetchUser
module.exports.fetchTimelinePage = fetchTimelinePage
module.exports.fetchShortcode = fetchShortcode
module.exports.createShortcodeFromData = createShortcodeFromData
module.exports.requestCache = requestCache
module.exports.timelineImageCache = timelineImageCache

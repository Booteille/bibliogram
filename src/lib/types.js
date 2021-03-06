/**
 * @typedef GraphEdgeCount
 * @property {number} count
 */

/**
 * @typedef GraphEdgesText
 * @type {{edges: {node: {text: string}}[]}}
 */

/**
 * @typedef GraphEdgesChildren
 * @type {{edges: {node: GraphChild}[]}}
 */

/**
 * @typedef PagedEdges<T>
 * @property {number} count
 * @property {{has_next_page: boolean, end_cursor: string}} page_info
 * @property {{node: T}[]} edges
 * @template T
 */

/**
 * @typedef GraphUser
 * @property {string} biography
 * @property {string} external_url
 * @property {GraphEdgeCount} edge_followed_by
 * @property {GraphEdgeCount} edge_follow
 * @property {string} full_name
 * @property {string} id
 * @property {boolean} is_business_account
 * @property {boolean} is_joined_recently
 * @property {boolean} is_verified
 * @property {string} profile_pic_url
 * @property {string} profile_pic_url_hd
 * @property {string} username
 *
 * @property {any} edge_felix_video_timeline
 * @property {PagedEdges<GraphImage>} edge_owner_to_timeline_media
 * @property {any} edge_saved_media
 * @property {any} edge_media_collections
 */

/**
 * @typedef Thumbnail
 * @property {string} src
 * @property {number} config_width
 * @property {number} config_height
 */

/**
 * @typedef GraphImage
 * @property {string} __typename
 * @property {string} id
 * @property {GraphEdgesText} edge_media_to_caption
 * @property {string} shortcode
 * @property {GraphEdgeCount} edge_media_to_comment
 * @property {number} taken_at_timestamp No milliseconds
 * @property {GraphEdgeCount} edge_liked_by
 * @property {GraphEdgeCount} edge_media_preview_like
 * @property {{width: number, height: number}} dimensions
 * @property {string} display_url
 * @property {BasicOwner|ExtendedOwner} owner
 * @property {string} thumbnail_src
 * @property {Thumbnail[]} thumbnail_resources
 * @property {string} accessibility_caption
 * @property {GraphEdgesChildren} edge_sidecar_to_children
 */

 /**
 * @typedef GraphChild
 * @property {string} __typename
 * @property {string} id
 * @property {string} shortcode
 * @property {{width: number, height: number}} dimensions
 * @property {string} display_url
 * @property {Thumbnail[]} display_resources
 * @property {string} accessibility_caption
 * @property {boolean} is_video
 */

/**
 * @typedef BasicOwner
 * From user HTML response.
 * @property {string} id
 * @property {string} username
 */

/**
 * @typedef ExtendedOwner
 * From post API response.
 * @property {string} id
 * @property {string|null} profile_pic_url
 * @property {string} username
 * @property {string} full_name
 */

module.exports = {}

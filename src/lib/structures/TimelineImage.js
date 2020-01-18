const config = require("../../../config")
const {proxyImage} = require("../utils/proxyurl")
const {compile} = require("pug")
const collectors = require("../collectors")
const TimelineChild = require("./TimelineChild")
require("../testimports")(collectors, TimelineChild)

const rssDescriptionTemplate = compile(`
p(style='white-space: pre-line')= caption
img(alt=alt src=src)
`)

class TimelineImage {
	/**
	 * @param {import("../types").GraphImage} data
	 * @param {boolean} isDirect
	 */
	constructor(data, isDirect) {
		this.data = data
		this.isDirect = isDirect
		this.proxyDisplayURL = proxyImage(this.data.display_url)
		/** @type {import("../types").BasicOwner} */
		this.basicOwner = null
		/** @type {import("../types").ExtendedOwner} */
		this.extendedOwner = null
		/** @type {string} */
		this.proxyOwnerProfilePicture = null
		this.fixData()
	}

	/**
	 * This must not cause issues if called multiple times on the same data.
	 */
	fixData() {
		this.data.edge_media_to_caption.edges.forEach(edge => edge.node.text = edge.node.text.replace(/\u2063/g, "")) // I don't know why U+2063 INVISIBLE SEPARATOR is in here, but it is, and it causes rendering issues with certain fonts.
		this.basicOwner = {
			id: this.data.owner.id,
			username: this.data.owner.username
		}
		// @ts-ignore
		if (this.data.owner.full_name !== undefined) this.extendedOwner = this.data.owner
		if (this.extendedOwner) this.proxyOwnerProfilePicture = proxyImage(this.extendedOwner.profile_pic_url)
	}

	/**
	 * @param {import("../types").GraphImage} data
	 * @param {boolean} isDirect
	 */
	updateData(data, isDirect) {
		this.data = data
		this.isDirect = isDirect
		this.fixData()
	}

	fetchDirect() {
		return collectors.fetchShortcode(this.data.shortcode, true) // automatically calls updateData
	}

	/**
	 * @returns {Promise<import("../types").ExtendedOwner>}
	 */
	fetchExtendedOwner() {
		// Do we just already have the extended owner?
		if (this.extendedOwner) {
			return Promise.resolve(this.extendedOwner)
		}
		// The owner happens to be in the user cache, so update from that.
		// This should maybe be moved to collectors.
		else if (collectors.requestCache.has("user/"+this.basicOwner.username)) {
			/** @type {import("./User")} */
			const user = collectors.requestCache.get("user/"+this.basicOwner.username)
			this.extendedOwner = {
				id: user.data.id,
				username: user.data.username,
				full_name: user.data.full_name,
				profile_pic_url: user.data.profile_pic_url
			}
			this.fixData()
			return Promise.resolve(this.extendedOwner)
		}
		// All else failed, we'll re-request ourselves.
		else {
			return this.fetchDirect().then(() => this.extendedOwner) // collectors will manage the updating.
		}
	}

	/**
	 * @returns {TimelineImage[]|import("./TimelineChild")[]}
	 */
	getChildren() {
		if (this.data.__typename === "GraphSidecar" && this.data.edge_sidecar_to_children && this.data.edge_sidecar_to_children.edges.length) {
			return this.data.edge_sidecar_to_children.edges.map(edge => new TimelineChild(edge.node))
		} else {
			return [this]
		}
	}

	/**
	 * @param {number} size
	 * @return {import("../types").Thumbnail}
	 */
	getSuggestedThumbnail(size) {
		let found = null
		for (const tr of this.data.thumbnail_resources) {
			found = tr
			if (tr.config_width >= size) break
		}
		return {
			config_width: found.config_width,
			config_height: found.config_height,
			src: proxyImage(found.src, found.config_width) // do not resize to requested size because of hidpi
		}
	}

	getSrcset() {
		return this.data.thumbnail_resources.map(tr => {
			return `${proxyImage(tr.src, tr.config_width)} ${tr.config_width}w`
		}).join(", ")
	}

	getSizes() {
		return `(max-width: 820px) 120px, 260px` // from css :(
	}

	getCaption() {
		if (this.data.edge_media_to_caption.edges[0]) return this.data.edge_media_to_caption.edges[0].node.text
		else return null
	}

	getIntroduction() {
		const caption = this.getCaption()
		if (caption) return caption.split("\n")[0].split(". ")[0] // try to get first meaningful line or sentence
		else return null
	}

	getAlt() {
		// For some reason, pages 2+ don't contain a11y data. Instagram web client falls back to image caption.
		return this.data.accessibility_caption || this.getCaption() || "No image description available."
	}

	getFeedData() {
		return {
			title: this.getIntroduction() || "No caption provided",
			description: rssDescriptionTemplate({src: config.website_origin+proxyImage(this.data.display_url), alt: this.getAlt(), caption: this.getCaption()}),
			author: this.data.owner.username,
			url: `${config.website_origin}/p/${this.data.shortcode}`,
			guid: `${config.website_origin}/p/${this.data.shortcode}`,
			date: new Date(this.data.taken_at_timestamp*1000)
			/*
				Readers should display the description as HTML rather than using the media enclosure.
				enclosure: {
					url: this.data.display_url,
					type: "image/jpeg" //TODO: can instagram have PNGs? everything is JPEG according to https://medium.com/@autolike.it/how-to-avoid-low-res-thumbnails-on-instagram-android-problem-bc24f0ed1c7d
				}
			*/
		}
	}
}

module.exports = TimelineImage

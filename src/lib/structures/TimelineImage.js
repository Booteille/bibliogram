const config = require("../../../config")
const {proxyImage} = require("../utils/proxyurl")
const {compile} = require("pug")

const rssDescriptionTemplate = compile(`
img(alt=alt src=src)
p(style='white-space: pre-line')= caption
`)

class GraphImage {
	/**
	 * @param {import("../types").GraphImage} data
	 */
	constructor(data) {
		this.data = data
		this.data.edge_media_to_caption.edges.forEach(edge => edge.node.text = edge.node.text.replace(/\u2063/g, "")) // I don't know why U+2063 INVISIBLE SEPARATOR is in here, but it is, and it causes rendering issues with certain fonts.
	}

	getProxy(url) {
		return proxyImage(url)
	}

	/**
	 * @param {number} size
	 */
	getSuggestedThumbnail(size) {
		let found = null
		for (const tr of this.data.thumbnail_resources) {
			found = tr
			if (tr.config_width >= size) break
		}
		return found
	}

	getSrcset() {
		return this.data.thumbnail_resources.map(tr => {
			const p = new URLSearchParams()
			p.set("width", String(tr.config_width))
			p.set("url", tr.src)
			return `/imageproxy?${p.toString()} ${tr.config_width}w`
		}).join(", ")
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
			description: rssDescriptionTemplate({src: this.data.display_url, alt: this.getAlt(), caption: this.getCaption()}),
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

module.exports = GraphImage

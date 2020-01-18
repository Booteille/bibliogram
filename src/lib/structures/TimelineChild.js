const config = require("../../../config")
const {proxyImage} = require("../utils/proxyurl")
const collectors = require("../collectors")
require("../testimports")(collectors)

class TimelineChild {
	/**
	 * @param {import("../types").GraphChild} data
	 */
	constructor(data) {
		this.data = data
		this.proxyDisplayURL = proxyImage(this.data.display_url)
	}

	/**
	 * @param {number} size
	 */
	getSuggestedResource(size) {
		let found = null
		for (const tr of this.data.display_resources) {
			found = tr
			if (tr.config_width >= size) break
		}
		found = proxyImage(found, size)
		return found
	}

	getSrcset() {
		return this.data.display_resources.map(tr => {
			const p = new URLSearchParams()
			p.set("width", String(tr.config_width))
			p.set("url", tr.src)
			return `/imageproxy?${p.toString()} ${tr.config_width}w`
		}).join(", ")
	}

	getAlt() {
		return this.data.accessibility_caption || "No image description available."
	}
}

module.exports = TimelineChild

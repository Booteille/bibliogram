class GraphImage {
	/**
	 * @param {import("../types").GraphImage} data
	 */
	constructor(data) {
		this.data = data
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

	getAlt() {
		// For some reason, pages 2+ don't contain a11y data. Instagram web client falls back to image caption.
		return this.data.accessibility_caption || this.getCaption() || "No image description available."
	}
}

module.exports = GraphImage

function proxyImage(url, width) {
	const params = new URLSearchParams()
	if (width) params.set("width", width)
	params.set("url", url)
	return "/imageproxy?"+params.toString()
}

module.exports.proxyImage = proxyImage

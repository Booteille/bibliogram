function proxyImage(url) {
	const params = new URLSearchParams()
	params.set("url", url)
	return "/imageproxy?"+params.toString()
}

module.exports.proxyImage = proxyImage

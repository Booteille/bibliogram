const {Parser} = require("./parser/parser")

/**
 * @param {string} text
 */
function extractSharedData(text) {
	const parser = new Parser(text)
	parser.seek("window._sharedData = ", {moveToMatch: true, useEnd: true})
	parser.store()
	const end = parser.seek(";</script>")
	parser.restore()
	const sharedDataString = parser.slice(end - parser.cursor)
	const sharedData = JSON.parse(sharedDataString)
	return sharedData
}

module.exports.extractSharedData = extractSharedData

module.exports = function(...items) {
	items.forEach(item => {
		if (item === undefined || (item && item.constructor && item.constructor.name == "Object" && Object.keys(item).length == 0)) {
			throw new Error("Bad import: item looks like this: "+JSON.stringify(item))
		}
	})
}

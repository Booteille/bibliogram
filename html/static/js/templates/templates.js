import {AsyncValueCache} from "../avc/avc.js"

const tc = new AsyncValueCache(true, () => {
	return fetch("/api/templates").then(res => res.json()).then(data => {
		Object.keys(data).forEach(key => {
			let fn = Function(data[key] + "; return template")()
			data[key] = fn
		})
		console.log(`Loaded ${Object.keys(data).length} templates`)
		return data
	})
})

export {tc}

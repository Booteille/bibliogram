class AsyncValueCache {
	constructor(fetchNow, callback) {
		this.callback = callback
		this.cachedPromise = null
		if (fetchNow) this.fetch()
	}

	fetch() {
		if (this.cachedPromise) return this.cachedPromise
		else return this.cachedPromise = this.callback()
	}
}

export {AsyncValueCache}

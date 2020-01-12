class InstaCache {
	/**
	 * @property {number} ttl time to keep each resource in milliseconds
	 */
	constructor(ttl) {
		this.ttl = ttl
		/** @type {Map<string, {data: any, time: number}>} */
		this.cache = new Map()
	}

	clean() {
		for (const key of this.cache.keys()) {
			const value = this.cache.get(key)
			if (Date.now() > value.time + this.ttl) this.cache.delete(key)
		}
	}

	/**
	 * @param {string} key
	 */
	get(key) {
		return this.cache.get(key).data
	}

	/**
	 * @param {string} key
	 * @param {any} data
	 */
	set(key, data) {
		this.cache.set(key, {data, time: Date.now()})
	}

	/**
	 * @param {string} key
	 * @param {() => Promise<T>} callback
	 * @returns {Promise<T>}
	 * @template T
	 */
	getOrFetch(key, callback) {
		this.clean()
		if (this.cache.has(key)) return Promise.resolve(this.get(key))
		else {
			const pending = callback().then(result => {
				this.set(key, result)
				return result
			})
			this.set(key, pending)
			return pending
		}
	}

	/**
	 * @param {string} key
	 * @param {() => Promise<T>} callback
	 * @returns {Promise<T>}
	 * @template T
	 */
	getOrFetchPromise(key, callback) {
		return this.getOrFetch(key, callback).then(result => {
			this.cache.delete(key)
			return result
		})
	}
}

module.exports = InstaCache

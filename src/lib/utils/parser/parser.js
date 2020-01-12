/**
 * @typedef GetOptions
 * @property {string} [split] Characters to split on
 * @property {string} [mode] "until" or "between"; choose where to get the content from
 * @property {function} [transform] Transformation to apply to result before returning
 */

const tf = {
	lc: s => s.toLowerCase()
}

class Parser {
	constructor(string) {
		this.string = string;
		this.substore = [];
		this.cursor = 0;
		this.cursorStore = [];
		this.mode = "until";
		this.transform = s => s;
		this.split = " ";
	}

	/**
	 * Return all the remaining text from the buffer, without updating the cursor
	 * @return {String}
	 */
	remaining() {
		return this.string.slice(this.cursor);
	}

	/**
	 * Have we reached the end of the string yet?
	 * @return {boolean}
	 */
	hasRemaining() {
		return this.cursor < this.string.length
	}

	/**
	 * @param {GetOptions} [options]
	 * @returns {String}
	 */
	get(options = {}) {
		["mode", "split", "transform"].forEach(o => {
			if (!options[o]) options[o] = this[o];
		});
		if (options.mode == "until") {
			let next = this.string.indexOf(options.split, this.cursor+options.split.length);
			if (next == -1) {
				let result = this.remaining();
				this.cursor = this.string.length;
				return result;
			} else {
				let result = this.string.slice(this.cursor, next);
				this.cursor = next + options.split.length;
				return options.transform(result);
			}
		} else if (options.mode == "between") {
			let start = this.string.indexOf(options.split, this.cursor);
			let end = this.string.indexOf(options.split, start+options.split.length);
			let result = this.string.slice(start+options.split.length, end);
			this.cursor = end + options.split.length;
			return options.transform(result);
		}
	}

	/**
	 * Get a number of chars from the buffer.
	 * @param {number} length Number of chars to get
	 * @param {boolean} [move] Whether to update the cursor
	 */
	slice(length, move = false) {
		let result = this.string.slice(this.cursor, this.cursor+length);
		if (move) this.cursor += length;
		return result;
	}

	/**
	 * Repeatedly swallow a character.
	 * @param {String} char
	 */
	swallow(char) {
		let before = this.cursor;
		while (this.string[this.cursor] == char) this.cursor++;
		return this.cursor - before;
	}

	/**
	 * Push the current cursor position to the store
	 */
	store() {
		this.cursorStore.push(this.cursor);
	}

	/**
	 * Pop the previous cursor position from the store
	 */
	restore() {
		this.cursor = this.cursorStore.pop();
	}

	/**
	 * Run a get operation, test against an input, return success or failure, and restore the cursor.
	 * @param {String} value The value to test against
	 * @param {Object} options Options for get
	 */
	test(value, options) {
		this.store();
		let next = this.get(options);
		let result = next == value;
		this.restore();
		return result;
	}

	/**
	 * Run a get operation, test against an input, and throw an error if it doesn't match.
	 * @param {String} value
	 * @param {GetOptions} [options]
	 */
	expect(value, options = {}) {
		let next = this.get(options);
		if (next != value) throw new Error("Expected "+value+", got "+next);
	}

	/**
	 * Seek past the next occurance of the string.
	 * @param {string} toFind
	 * @param {{moveToMatch?: boolean, useEnd?: boolean}} options both default to false
	 */
	seek(toFind, options = {}) {
		if (options.moveToMatch === undefined) options.moveToMatch = false
		if (options.useEnd === undefined) options.useEnd = false
		let index = this.string.indexOf(toFind, this.cursor)
		if (index !== -1) {
			if (options.useEnd) index += toFind.length
			if (options.moveToMatch) this.cursor = index
		}
		return index
	}

	/**
	 * Replace the current string, adding the old one to the substore.
	 * @param {string} string
	 */
	unshiftSubstore(string) {
		this.substore.unshift({string: this.string, cursor: this.cursor, cursorStore: this.cursorStore})
		this.string = string
		this.cursor = 0
		this.cursorStore = []
	}

	/**
	 * Replace the current string with the first entry from the substore.
	 */
	shiftSubstore() {
		Object.assign(this, this.substore.shift())
	}
}

module.exports.Parser = Parser

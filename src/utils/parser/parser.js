/**
 * @typedef {Object} GetOptions
 * @property {String} split Characters to split on
 * @property {String} mode "until" or "between"; choose where to get the content from
 * @property {Function} transform Transformation to apply to result before returning
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
	 * @param {GetOptions} options
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
		} else if (options.mode == "length" || options.length != undefined) {
			let result = this.string.slice(this.cursor, this.cursor+options.length);
			this.cursor += options.length
			return options.transform(result)
		}
	}

	/**
	 * Get a number of chars from the buffer.
	 * @param {Number} length Number of chars to get
	 * @param {Boolean} move Whether to update the cursor
	 */
	slice(length, move) {
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
	 * @param {GetOptions} options
	 */
	expect(value, options) {
		let next = this.get(options);
		if (next != value) throw new Error("Expected "+value+", got "+next);
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

class SQLParser extends Parser {
	collectAssignments(operators = ["="]) {
		let assignments = [];
		let done = false;
		while (!done) {
			// Also build up a raw string.
			let raw = "";
			// Next word is the field name/index.
			let name = this.get();
			raw += name;
			// Next word should be "=".
			let operator = this.get();
			if (!operators.includes(operator)) throw new Error("Invalid operator: received "+operator+", expected one from "+JSON.stringify(operators));
			raw += " "+operator;
			// Next word is the value
			let extraction = this.extractValue();
			let value = extraction.value;
			raw += " "+value;
			assignments.push({name, value, raw});
			done = extraction.done;
			this.swallow(" ");
		}
		return assignments;
	}

	extractValue() {
		// Next word is the value, which may or may not be in quotes.
		if (`"'`.includes(this.slice(1))) {
			// Is between quotes
			let value = this.get({mode: "between", split: this.slice(1)});
			// Check end
			let done = this.swallow(",") == 0;
			return {value, done};
		} else {
			// Is not between quotes
			let value = this.get();
			// Check end (
			let done = !value.endsWith(",") || value.endsWith(")");
			value = value.replace(/(,|\))$/, "");
			return {value, done};
		}
	}

	collectList() {
		let items = [];
		let done = false;
		while (!done) {
			let extraction = this.extractValue();
			items.push(extraction.value);
			done = extraction.done;
			this.swallow(" ");
		}
		return items;
	}

	parseOptions() {
		let options = {};
		while (this.remaining().length) { // While there's still options to collect...
			// What option are we processing?
			let optype = this.get({transform: tf.lc});
			// Limit
			if (optype == "limit") {
				// How many are we limiting to?
				options.limit = +this.get();
			}
			// Where
			else if (optype == "where") {
				// We'll just pass the filter directly in.
				if (!options.filters) options.filters = [];
				options.filters = options.filters.concat(this.collectAssignments([
					"=", "==", "<", ">", "<=", ">=", "!=", "<>",
					"#=", "#<", "#>", "#<=", "#>=", "#!=", "#<>"
				]));
			}
			// Single
			else if (optype == "single") {
				// Return first row only.
				options.single = true;
			}
			// Join
			else if (["left", "right", "inner", "outer"].includes(optype)) {
				if (!options.joins) options.joins = [];
				// SELECT * FROM Purchases WHERE purchaseID = 2 INNER JOIN PurchaseItems ON Purchases.purchaseID = PurchaseItems.purchaseID
				// SELECT * FROM Purchases WHERE purchaseID = 2 INNER JOIN PurchaseItems USING (purchaseID)
				// Left, right, inner, outer
				let direction = optype;
				// Join
				this.expect("join", {transform: tf.lc});
				// Table
				let target = this.get();
				// Mode (on/using)
				let mode = this.get({transform: tf.lc});
				if (mode == "using") {
					this.swallow("(");
					let field = this.extractValue().value;
					this.swallow(")");
					var fields = new Array(2).fill().map(() => ({
						table: null,
						field
					}));
				} else if (mode == "on") {
					var fields = [];
					const extractCombo = () => {
						// Extract from Table.field
						let value = this.extractValue().value;
						let fragments = value.split(".");
						// Field only
						if (fragments.length == 1) {
							return {
								table: null,
								field: fragments[0]
							}
						}
						// Table.field
						else {
							return {
								table: fragments[0],
								field: fragments[1]
							}
						}
					}
					fields.push(extractCombo());
					this.expect("=");
					fields.push(extractCombo());
				} else {
					throw new Error("Invalid join mode: "+mode);
				}
				options.joins.push({direction, target, fields});
			}
			// Unknown option
			else {
				throw new Error("Unknown query optype: "+optype);
			}
		}
		return options;
	}

	parseStatement() {
		let operation = this.get({transform: tf.lc});
		// Select
		if (operation == "select") {
			// Fields
			let fields = this.collectList();
			// From
			this.expect("from", {transform: tf.lc});
			// Table
			let table = this.get();
			// Where, limit, join, single, etc
			let options = this.parseOptions();
			return {operation, fields, table, options};
		}
		// Insert
		else if (operation == "insert") {
			// Into
			this.expect("into", {transform: tf.lc});
			// Table
			let table = this.get();
			// Fields?
			let fields = [];
			this.swallow("(");
			if (!this.test("values", {transform: tf.lc})) {
				fields = this.collectList();
			}
			// End of fields
			this.swallow(")");
			this.swallow(" ");
			// Values
			this.expect("values", {transform: tf.lc});
			this.swallow("(");
			let values = this.collectList();
			this.swallow(")");
			return {operation, table, fields, values};
		}
		// Update
		else if (operation == "update") {
			// Table
			let table = this.get();
			// Set
			this.expect("set", {transform: tf.lc});
			// Assignments
			let assignments = this.collectAssignments();
			// Where, limit, join, single, etc
			let options = this.parseOptions();
			return {operation, table, assignments, options};
		}
		// Delete
		else if (operation == "delete") {
			// From
			this.expect("from", {transform: tf.lc});
			// Table
			let table = this.get();
			// Where, limit, join, single, etc
			let options = this.parseOptions();
			return {operation, table, options};
		}
		throw new Error("Unknown operation: "+operation);
	}
}

module.exports.Parser = Parser
module.exports.SQLParser = SQLParser

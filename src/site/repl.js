const {instance, pugCache, wss} = require("./passthrough")
const {requestCache, timelineImageCache} = require("../lib/collectors")
const util = require("util")
const repl = require("repl")
const vm = require("vm")

/**
 * @param {string} input
 * @param {vm.Context} context
 * @param {string} filename
 * @param {(err: Error|null, result: any) => any} callback
 */
async function customEval(input, context, filename, callback) {
	let depth = 0
	if (input == "exit\n") return process.exit()
	if (input.startsWith(":")) {
		const depthOverwrite = input.split(" ")[0]
		depth = +depthOverwrite.slice(1)
		input = input.slice(depthOverwrite.length + 1)
	}
	const result = await eval(input)
	const output = util.inspect(result, false, depth, true)
	return callback(undefined, output)
}

function customWriter(output) {
	return output
}

console.log("REPL started")
repl.start({prompt: "b) ", eval: customEval, writer: customWriter}).once("exit", () => process.exit())

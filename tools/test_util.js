const assert = require('assert')
const util = require('../utils/util.js')

assert.strictEqual(util.isRgbPayload({ Red: 0, Green: 128, Blue: 255 }), true)
assert.strictEqual(util.isRgbPayload({ Red: -1, Green: 0, Blue: 0 }), false)
assert.strictEqual(util.isRgbPayload({ Red: 0, Green: 0, Blue: 256 }), false)
assert.strictEqual(util.isRgbPayload({ Red: 1.5, Green: 0, Blue: 0 }), false)
assert.strictEqual(util.isRgbPayload({ Red: 0, Green: 0 }), false)
assert.deepStrictEqual(util.hslToRgb(0, 1, 0.5), [255, 0, 0])
assert.deepStrictEqual(util.hslToRgb(1 / 3, 1, 0.5), [0, 255, 0])
assert.deepStrictEqual(util.hslToRgb(2 / 3, 1, 0.5), [0, 0, 255])

console.log('Utility logic tests passed: 8/8')

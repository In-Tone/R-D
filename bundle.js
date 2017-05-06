/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 52);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */



var base64 = __webpack_require__(31)
var ieee754 = __webpack_require__(36)
var isArray = __webpack_require__(15)

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 1 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 2 */
/***/ (function(module, exports) {

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}


/***/ }),
/* 3 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.



/*<replacement>*/

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }return keys;
};
/*</replacement>*/

module.exports = Duplex;

/*<replacement>*/
var processNextTick = __webpack_require__(10);
/*</replacement>*/

/*<replacement>*/
var util = __webpack_require__(5);
util.inherits = __webpack_require__(2);
/*</replacement>*/

var Readable = __webpack_require__(19);
var Writable = __webpack_require__(21);

util.inherits(Duplex, Readable);

var keys = objectKeys(Writable.prototype);
for (var v = 0; v < keys.length; v++) {
  var method = keys[v];
  if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false) this.readable = false;

  if (options && options.writable === false) this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

  this.once('end', onend);
}

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  processNextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer) {// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

function isArray(arg) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === '[object Array]';
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = Buffer.isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0).Buffer))

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {

var buffer = __webpack_require__(0);
var Buffer = buffer.Buffer;
var SlowBuffer = buffer.SlowBuffer;
var MAX_LEN = buffer.kMaxLength || 2147483647;
exports.alloc = function alloc(size, fill, encoding) {
  if (typeof Buffer.alloc === 'function') {
    return Buffer.alloc(size, fill, encoding);
  }
  if (typeof encoding === 'number') {
    throw new TypeError('encoding must not be number');
  }
  if (typeof size !== 'number') {
    throw new TypeError('size must be a number');
  }
  if (size > MAX_LEN) {
    throw new RangeError('size is too large');
  }
  var enc = encoding;
  var _fill = fill;
  if (_fill === undefined) {
    enc = undefined;
    _fill = 0;
  }
  var buf = new Buffer(size);
  if (typeof _fill === 'string') {
    var fillBuf = new Buffer(_fill, enc);
    var flen = fillBuf.length;
    var i = -1;
    while (++i < size) {
      buf[i] = fillBuf[i % flen];
    }
  } else {
    buf.fill(_fill);
  }
  return buf;
}
exports.allocUnsafe = function allocUnsafe(size) {
  if (typeof Buffer.allocUnsafe === 'function') {
    return Buffer.allocUnsafe(size);
  }
  if (typeof size !== 'number') {
    throw new TypeError('size must be a number');
  }
  if (size > MAX_LEN) {
    throw new RangeError('size is too large');
  }
  return new Buffer(size);
}
exports.from = function from(value, encodingOrOffset, length) {
  if (typeof Buffer.from === 'function' && (!global.Uint8Array || Uint8Array.from !== Buffer.from)) {
    return Buffer.from(value, encodingOrOffset, length);
  }
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number');
  }
  if (typeof value === 'string') {
    return new Buffer(value, encodingOrOffset);
  }
  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    var offset = encodingOrOffset;
    if (arguments.length === 1) {
      return new Buffer(value);
    }
    if (typeof offset === 'undefined') {
      offset = 0;
    }
    var len = length;
    if (typeof len === 'undefined') {
      len = value.byteLength - offset;
    }
    if (offset >= value.byteLength) {
      throw new RangeError('\'offset\' is out of bounds');
    }
    if (len > value.byteLength - offset) {
      throw new RangeError('\'length\' is out of bounds');
    }
    return new Buffer(value.slice(offset, offset + len));
  }
  if (Buffer.isBuffer(value)) {
    var out = new Buffer(value.length);
    value.copy(out, 0, 0, value.length);
    return out;
  }
  if (value) {
    if (Array.isArray(value) || (typeof ArrayBuffer !== 'undefined' && value.buffer instanceof ArrayBuffer) || 'length' in value) {
      return new Buffer(value);
    }
    if (value.type === 'Buffer' && Array.isArray(value.data)) {
      return new Buffer(value.data);
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ' + 'ArrayBuffer, Array, or array-like object.');
}
exports.allocUnsafeSlow = function allocUnsafeSlow(size) {
  if (typeof Buffer.allocUnsafeSlow === 'function') {
    return Buffer.allocUnsafeSlow(size);
  }
  if (typeof size !== 'number') {
    throw new TypeError('size must be a number');
  }
  if (size >= MAX_LEN) {
    throw new RangeError('size is too large');
  }
  return new SlowBuffer(size);
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 7 */
/***/ (function(module, exports) {

//-------------------------------------------------
// Add two complex numbers
//-------------------------------------------------
var complexAdd = function (a, b)
{
    return [a[0] + b[0], a[1] + b[1]];
};

//-------------------------------------------------
// Subtract two complex numbers
//-------------------------------------------------
var complexSubtract = function (a, b)
{
    return [a[0] - b[0], a[1] - b[1]];
};

//-------------------------------------------------
// Multiply two complex numbers
//
// (a + bi) * (c + di) = (ac - bd) + (ad + bc)i
//-------------------------------------------------
var complexMultiply = function (a, b) 
{
    return [(a[0] * b[0] - a[1] * b[1]), 
            (a[0] * b[1] + a[1] * b[0])];
};

//-------------------------------------------------
// Calculate |a + bi|
//
// sqrt(a*a + b*b)
//-------------------------------------------------
var complexMagnitude = function (c) 
{
    return Math.sqrt(c[0]*c[0] + c[1]*c[1]); 
};

//-------------------------------------------------
// Exports
//-------------------------------------------------
module.exports = {
    add: complexAdd,
    subtract: complexSubtract,
    multiply: complexMultiply,
    magnitude: complexMagnitude
};


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

/*===========================================================================*\
 * Fast Fourier Transform (Cooley-Tukey Method)
 *
 * (c) Vail Systems. Joshua Jung and Ben Bryan. 2015
 *
 * This code is not designed to be highly optimized but as an educational
 * tool to understand the Fast Fourier Transform.
\*===========================================================================*/

//------------------------------------------------
// Note: Some of this code is not optimized and is
// primarily designed as an educational and testing
// tool.
// To get high performace would require transforming
// the recursive calls into a loop and then loop
// unrolling. All of this is best accomplished
// in C or assembly.
//-------------------------------------------------

//-------------------------------------------------
// The following code assumes a complex number is
// an array: [real, imaginary]
//-------------------------------------------------
var complex = __webpack_require__(7),
    fftUtil = __webpack_require__(9),
    twiddle = __webpack_require__(12);

module.exports = {
  //-------------------------------------------------
  // Calculate FFT for vector where vector.length
  // is assumed to be a power of 2.
  //-------------------------------------------------
  fft: function fft(vector) {
    var X = [],
        N = vector.length;

    // Base case is X = x + 0i since our input is assumed to be real only.
    if (N == 1) {
      if (Array.isArray(vector[0])) //If input vector contains complex numbers
        return [[vector[0][0], vector[0][1]]];      
      else
        return [[vector[0], 0]];
    }

    // Recurse: all even samples
    var X_evens = fft(vector.filter(even)),

        // Recurse: all odd samples
        X_odds  = fft(vector.filter(odd));

    // Now, perform N/2 operations!
    for (var k = 0; k < N / 2; k++) {
      // t is a complex number!
      var t = X_evens[k],
          e = complex.multiply(fftUtil.exponent(k, N), X_odds[k]);

      X[k] = complex.add(t, e);
      X[k + (N / 2)] = complex.subtract(t, e);
    }

    function even(__, ix) {
      return ix % 2 == 0;
    }

    function odd(__, ix) {
      return ix % 2 == 1;
    }

    return X;
  },
  //-------------------------------------------------
  // Calculate FFT for vector where vector.length
  // is assumed to be a power of 2.  This is the in-
  // place implementation, to avoid the memory
  // footprint used by recursion.
  //-------------------------------------------------
  fftInPlace: function(vector) {
    var N = vector.length;

    var trailingZeros = twiddle.countTrailingZeros(N); //Once reversed, this will be leading zeros

    // Reverse bits
    for (var k = 0; k < N; k++) {
      var p = twiddle.reverse(k) >>> (twiddle.INT_BITS - trailingZeros);
      if (p > k) {
        var complexTemp = [vector[k], 0];
        vector[k] = vector[p];
        vector[p] = complexTemp;
      } else {
        vector[p] = [vector[p], 0];
      }
    }

    //Do the DIT now in-place
    for (var len = 2; len <= N; len += len) {
      for (var i = 0; i < len / 2; i++) {
        var w = fftUtil.exponent(i, len);
        for (var j = 0; j < N / len; j++) {
          var t = complex.multiply(w, vector[j * len + i + len / 2]);
          vector[j * len + i + len / 2] = complex.subtract(vector[j * len + i], t);
          vector[j * len + i] = complex.add(vector[j * len + i], t);
        }
      }
    }
  }
};


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

/*===========================================================================*\
 * Fast Fourier Transform Frequency/Magnitude passes
 *
 * (c) Vail Systems. Joshua Jung and Ben Bryan. 2015
 *
 * This code is not designed to be highly optimized but as an educational
 * tool to understand the Fast Fourier Transform.
\*===========================================================================*/

//-------------------------------------------------
// The following code assumes a complex number is
// an array: [real, imaginary]
//-------------------------------------------------
var complex = __webpack_require__(7);


//-------------------------------------------------
// By Eulers Formula:
//
// e^(i*x) = cos(x) + i*sin(x)
//
// and in DFT:
//
// x = -2*PI*(k/N)
//-------------------------------------------------
var mapExponent = {},
    exponent = function (k, N) {
      var x = -2 * Math.PI * (k / N);

      mapExponent[N] = mapExponent[N] || {};
      mapExponent[N][k] = mapExponent[N][k] || [Math.cos(x), Math.sin(x)];// [Real, Imaginary]

      return mapExponent[N][k];
};

//-------------------------------------------------
// Calculate FFT Magnitude for complex numbers.
//-------------------------------------------------
var fftMag = function (fftBins) {
    var ret = fftBins.map(complex.magnitude);
    return ret.slice(0, ret.length / 2);
};

//-------------------------------------------------
// Calculate Frequency Bins
// 
// Returns an array of the frequencies (in hertz) of
// each FFT bin provided, assuming the sampleRate is
// samples taken per second.
//-------------------------------------------------
var fftFreq = function (fftBins, sampleRate) {
    var stepFreq = sampleRate / (fftBins.length);
    var ret = fftBins.slice(0, fftBins.length / 2);

    return ret.map(function (__, ix) {
        return ix * stepFreq;
    });
};

//-------------------------------------------------
// Exports
//-------------------------------------------------
module.exports = {
    fftMag: fftMag,
    fftFreq: fftFreq,
    exponent: exponent
};


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

if (!process.version ||
    process.version.indexOf('v0.') === 0 ||
    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
  module.exports = nextTick;
} else {
  module.exports = process.nextTick;
}

function nextTick(fn, arg1, arg2, arg3) {
  if (typeof fn !== 'function') {
    throw new TypeError('"callback" argument must be a function');
  }
  var len = arguments.length;
  var args, i;
  switch (len) {
  case 0:
  case 1:
    return process.nextTick(fn);
  case 2:
    return process.nextTick(function afterTickOne() {
      fn.call(null, arg1);
    });
  case 3:
    return process.nextTick(function afterTickTwo() {
      fn.call(null, arg1, arg2);
    });
  case 4:
    return process.nextTick(function afterTickThree() {
      fn.call(null, arg1, arg2, arg3);
    });
  default:
    args = new Array(len - 1);
    i = 0;
    while (i < args.length) {
      args[i++] = arguments[i];
    }
    return process.nextTick(function afterTick() {
      fn.apply(null, args);
    });
  }
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),
/* 11 */
/***/ (function(module, exports) {

/* Copyright (c) 2012, Jens Nockert <jens@ofmlabs.org>, Jussi Kalliokoski <jussi@ofmlabs.org>
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met: 
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer. 
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution. 
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

if (!FFT) {
	var FFT = {}
}

void function (namespace) {
	"use strict"
	
	function butterfly2(output, outputOffset, outputStride, fStride, state, m) {
		var t = state.twiddle
		
		for (var i = 0; i < m; i++) {
			var s0_r = output[2 * ((outputOffset) + (outputStride) * (i))], s0_i = output[2 * ((outputOffset) + (outputStride) * (i)) + 1]
			var s1_r = output[2 * ((outputOffset) + (outputStride) * (i + m))], s1_i = output[2 * ((outputOffset) + (outputStride) * (i + m)) + 1]
			
			var t1_r = t[2 * ((0) + (fStride) * (i))], t1_i = t[2 * ((0) + (fStride) * (i)) + 1]
			
			var v1_r = s1_r * t1_r - s1_i * t1_i, v1_i = s1_r * t1_i + s1_i * t1_r
			
			var r0_r = s0_r + v1_r, r0_i = s0_i + v1_i
			var r1_r = s0_r - v1_r, r1_i = s0_i - v1_i
			
			output[2 * ((outputOffset) + (outputStride) * (i))] = r0_r, output[2 * ((outputOffset) + (outputStride) * (i)) + 1] = r0_i
			output[2 * ((outputOffset) + (outputStride) * (i + m))] = r1_r, output[2 * ((outputOffset) + (outputStride) * (i + m)) + 1] = r1_i
		}
	}
	
	function butterfly3(output, outputOffset, outputStride, fStride, state, m) {
		var t = state.twiddle
		var m1 = m, m2 = 2 * m
		var fStride1 = fStride, fStride2 = 2 * fStride
		
		var e = t[2 * ((0) + (fStride) * (m)) + 1]
		
		for (var i = 0; i < m; i++) {
			var s0_r = output[2 * ((outputOffset) + (outputStride) * (i))], s0_i = output[2 * ((outputOffset) + (outputStride) * (i)) + 1]
			
			var s1_r = output[2 * ((outputOffset) + (outputStride) * (i + m1))], s1_i = output[2 * ((outputOffset) + (outputStride) * (i + m1)) + 1]
			var t1_r = t[2 * ((0) + (fStride1) * (i))], t1_i = t[2 * ((0) + (fStride1) * (i)) + 1]
			var v1_r = s1_r * t1_r - s1_i * t1_i, v1_i = s1_r * t1_i + s1_i * t1_r
			
			var s2_r = output[2 * ((outputOffset) + (outputStride) * (i + m2))], s2_i = output[2 * ((outputOffset) + (outputStride) * (i + m2)) + 1]
			var t2_r = t[2 * ((0) + (fStride2) * (i))], t2_i = t[2 * ((0) + (fStride2) * (i)) + 1]
			var v2_r = s2_r * t2_r - s2_i * t2_i, v2_i = s2_r * t2_i + s2_i * t2_r
			
			var i0_r = v1_r + v2_r, i0_i = v1_i + v2_i
			
			var r0_r = s0_r + i0_r, r0_i = s0_i + i0_i
			output[2 * ((outputOffset) + (outputStride) * (i))] = r0_r, output[2 * ((outputOffset) + (outputStride) * (i)) + 1] = r0_i
			
			var i1_r = s0_r - i0_r * 0.5
			var i1_i = s0_i - i0_i * 0.5
			
			var i2_r = (v1_r - v2_r) * e
			var i2_i = (v1_i - v2_i) * e
			
			var r1_r = i1_r - i2_i
			var r1_i = i1_i + i2_r
			output[2 * ((outputOffset) + (outputStride) * (i + m1))] = r1_r, output[2 * ((outputOffset) + (outputStride) * (i + m1)) + 1] = r1_i
			
			var r2_r = i1_r + i2_i
			var r2_i = i1_i - i2_r
			output[2 * ((outputOffset) + (outputStride) * (i + m2))] = r2_r, output[2 * ((outputOffset) + (outputStride) * (i + m2)) + 1] = r2_i
		}
	}
	
	function butterfly4(output, outputOffset, outputStride, fStride, state, m) {
		var t = state.twiddle
		var m1 = m, m2 = 2 * m, m3 = 3 * m
		var fStride1 = fStride, fStride2 = 2 * fStride, fStride3 = 3 * fStride
		
		for (var i = 0; i < m; i++) {
			var s0_r = output[2 * ((outputOffset) + (outputStride) * (i))], s0_i = output[2 * ((outputOffset) + (outputStride) * (i)) + 1]
			
			var s1_r = output[2 * ((outputOffset) + (outputStride) * (i + m1))], s1_i = output[2 * ((outputOffset) + (outputStride) * (i + m1)) + 1]
			var t1_r = t[2 * ((0) + (fStride1) * (i))], t1_i = t[2 * ((0) + (fStride1) * (i)) + 1]
			var v1_r = s1_r * t1_r - s1_i * t1_i, v1_i = s1_r * t1_i + s1_i * t1_r
			
			var s2_r = output[2 * ((outputOffset) + (outputStride) * (i + m2))], s2_i = output[2 * ((outputOffset) + (outputStride) * (i + m2)) + 1]
			var t2_r = t[2 * ((0) + (fStride2) * (i))], t2_i = t[2 * ((0) + (fStride2) * (i)) + 1]
			var v2_r = s2_r * t2_r - s2_i * t2_i, v2_i = s2_r * t2_i + s2_i * t2_r
			
			var s3_r = output[2 * ((outputOffset) + (outputStride) * (i + m3))], s3_i = output[2 * ((outputOffset) + (outputStride) * (i + m3)) + 1]
			var t3_r = t[2 * ((0) + (fStride3) * (i))], t3_i = t[2 * ((0) + (fStride3) * (i)) + 1]
			var v3_r = s3_r * t3_r - s3_i * t3_i, v3_i = s3_r * t3_i + s3_i * t3_r
			
			var i0_r = s0_r + v2_r, i0_i = s0_i + v2_i
			var i1_r = s0_r - v2_r, i1_i = s0_i - v2_i
			var i2_r = v1_r + v3_r, i2_i = v1_i + v3_i
			var i3_r = v1_r - v3_r, i3_i = v1_i - v3_i
			
			var r0_r = i0_r + i2_r, r0_i = i0_i + i2_i
			
			if (state.inverse) {
				var r1_r = i1_r - i3_i
				var r1_i = i1_i + i3_r
			} else {
				var r1_r = i1_r + i3_i
				var r1_i = i1_i - i3_r
			}
			
			var r2_r = i0_r - i2_r, r2_i = i0_i - i2_i
			
			if (state.inverse) {
				var r3_r = i1_r + i3_i
				var r3_i = i1_i - i3_r
			} else {
				var r3_r = i1_r - i3_i
				var r3_i = i1_i + i3_r
			}
			
			output[2 * ((outputOffset) + (outputStride) * (i))] = r0_r, output[2 * ((outputOffset) + (outputStride) * (i)) + 1] = r0_i
			output[2 * ((outputOffset) + (outputStride) * (i + m1))] = r1_r, output[2 * ((outputOffset) + (outputStride) * (i + m1)) + 1] = r1_i
			output[2 * ((outputOffset) + (outputStride) * (i + m2))] = r2_r, output[2 * ((outputOffset) + (outputStride) * (i + m2)) + 1] = r2_i
			output[2 * ((outputOffset) + (outputStride) * (i + m3))] = r3_r, output[2 * ((outputOffset) + (outputStride) * (i + m3)) + 1] = r3_i
		}
	}
	
	function butterfly(output, outputOffset, outputStride, fStride, state, m, p) {
		var t = state.twiddle, n = state.n, scratch = new Float64Array(2 * p)
		
		for (var u = 0; u < m; u++) {
			for (var q1 = 0, k = u; q1 < p; q1++, k += m) {
				var x0_r = output[2 * ((outputOffset) + (outputStride) * (k))], x0_i = output[2 * ((outputOffset) + (outputStride) * (k)) + 1]
				scratch[2 * (q1)] = x0_r, scratch[2 * (q1) + 1] = x0_i
			}
			
			for (var q1 = 0, k = u; q1 < p; q1++, k += m) {
				var tOffset = 0
				
				var x0_r = scratch[2 * (0)], x0_i = scratch[2 * (0) + 1]
				output[2 * ((outputOffset) + (outputStride) * (k))] = x0_r, output[2 * ((outputOffset) + (outputStride) * (k)) + 1] = x0_i
				
				for (var q = 1; q < p; q++) {
					tOffset = (tOffset + fStride * k) % n
					
					var s0_r = output[2 * ((outputOffset) + (outputStride) * (k))], s0_i = output[2 * ((outputOffset) + (outputStride) * (k)) + 1]
					
					var s1_r = scratch[2 * (q)], s1_i = scratch[2 * (q) + 1]
					var t1_r = t[2 * (tOffset)], t1_i = t[2 * (tOffset) + 1]
					var v1_r = s1_r * t1_r - s1_i * t1_i, v1_i = s1_r * t1_i + s1_i * t1_r
					
					var r0_r = s0_r + v1_r, r0_i = s0_i + v1_i
					output[2 * ((outputOffset) + (outputStride) * (k))] = r0_r, output[2 * ((outputOffset) + (outputStride) * (k)) + 1] = r0_i
				}
			}
		}
	}
	
	function work(output, outputOffset, outputStride, f, fOffset, fStride, inputStride, factors, state) {
		var p = factors.shift()
		var m = factors.shift()
		
		if (m == 1) {
			for (var i = 0; i < p * m; i++) {
				var x0_r = f[2 * ((fOffset) + (fStride * inputStride) * (i))], x0_i = f[2 * ((fOffset) + (fStride * inputStride) * (i)) + 1]
				output[2 * ((outputOffset) + (outputStride) * (i))] = x0_r, output[2 * ((outputOffset) + (outputStride) * (i)) + 1] = x0_i
			}
		} else {
			for (var i = 0; i < p; i++) {
				work(output, outputOffset + outputStride * i * m, outputStride, f, fOffset + i * fStride * inputStride, fStride * p, inputStride, factors.slice(), state)
			}
		}
		
		switch (p) {
			case 2: butterfly2(output, outputOffset, outputStride, fStride, state, m); break
			case 3: butterfly3(output, outputOffset, outputStride, fStride, state, m); break
			case 4: butterfly4(output, outputOffset, outputStride, fStride, state, m); break
			default: butterfly(output, outputOffset, outputStride, fStride, state, m, p); break
		}
	}
	
	var complex = function (n, inverse) {
		var n = ~~n, inverse = !!inverse
		
		if (n < 1) {
			throw new RangeError("n is outside range, should be positive integer, was `" + n + "'")
		}
		
		var state = {
			n: n,
			inverse: inverse,
			
			factors: [],
			twiddle: new Float64Array(2 * n),
			scratch: new Float64Array(2 * n)
		}
		
		var t = state.twiddle, theta = 2 * Math.PI / n
		
		for (var i = 0; i < n; i++) {
			if (inverse) {
				var phase =  theta * i
			} else {
				var phase = -theta * i
			}
			
			t[2 * (i)] = Math.cos(phase)
			t[2 * (i) + 1] = Math.sin(phase)
		}
		
		var p = 4, v = Math.floor(Math.sqrt(n))
		
		while (n > 1) {
			while (n % p) {
				switch (p) {
					case 4: p = 2; break
					case 2: p = 3; break
					default: p += 2; break
				}
				
				if (p > v) {
					p = n
				}
			}
			
			n /= p
			
			state.factors.push(p)
			state.factors.push(n)
		}
		
		this.state = state
	}
	
	complex.prototype.simple = function (output, input, t) {
		this.process(output, 0, 1, input, 0, 1, t)
	}
	
	complex.prototype.process = function(output, outputOffset, outputStride, input, inputOffset, inputStride, t) {
		var outputStride = ~~outputStride, inputStride = ~~inputStride
		
		var type = t == 'real' ? t : 'complex'
		
		if (outputStride < 1) {
			throw new RangeError("outputStride is outside range, should be positive integer, was `" + outputStride + "'")
		}
		
		if (inputStride < 1) {
			throw new RangeError("inputStride is outside range, should be positive integer, was `" + inputStride + "'")
		}
		
		if (type == 'real') {
			for (var i = 0; i < this.state.n; i++) {
				var x0_r = input[inputOffset + inputStride * i]
				var x0_i = 0.0
				
				this.state.scratch[2 * (i)] = x0_r, this.state.scratch[2 * (i) + 1] = x0_i
			}
			
			work(output, outputOffset, outputStride, this.state.scratch, 0, 1, 1, this.state.factors.slice(), this.state)
		} else {
			if (input == output) {
				work(this.state.scratch, 0, 1, input, inputOffset, 1, inputStride, this.state.factors.slice(), this.state)
				
				for (var i = 0; i < this.state.n; i++) {
					var x0_r = this.state.scratch[2 * (i)], x0_i = this.state.scratch[2 * (i) + 1]
					
					output[2 * ((outputOffset) + (outputStride) * (i))] = x0_r, output[2 * ((outputOffset) + (outputStride) * (i)) + 1] = x0_i
				}
			} else {
				work(output, outputOffset, outputStride, input, inputOffset, 1, inputStride, this.state.factors.slice(), this.state)
			}
		}
	}
	
	namespace.complex = complex
}(FFT)

module.exports = FFT

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Bit twiddling hacks for JavaScript.
 *
 * Author: Mikola Lysenko
 *
 * Ported from Stanford bit twiddling hack library:
 *    http://graphics.stanford.edu/~seander/bithacks.html
 */

 "use restrict";

//Number of bits in an integer
var INT_BITS = 32;

//Constants
exports.INT_BITS  = INT_BITS;
exports.INT_MAX   =  0x7fffffff;
exports.INT_MIN   = -1<<(INT_BITS-1);

//Returns -1, 0, +1 depending on sign of x
exports.sign = function(v) {
  return (v > 0) - (v < 0);
}

//Computes absolute value of integer
exports.abs = function(v) {
  var mask = v >> (INT_BITS-1);
  return (v ^ mask) - mask;
}

//Computes minimum of integers x and y
exports.min = function(x, y) {
  return y ^ ((x ^ y) & -(x < y));
}

//Computes maximum of integers x and y
exports.max = function(x, y) {
  return x ^ ((x ^ y) & -(x < y));
}

//Checks if a number is a power of two
exports.isPow2 = function(v) {
  return !(v & (v-1)) && (!!v);
}

//Computes log base 2 of v
exports.log2 = function(v) {
  var r, shift;
  r =     (v > 0xFFFF) << 4; v >>>= r;
  shift = (v > 0xFF  ) << 3; v >>>= shift; r |= shift;
  shift = (v > 0xF   ) << 2; v >>>= shift; r |= shift;
  shift = (v > 0x3   ) << 1; v >>>= shift; r |= shift;
  return r | (v >> 1);
}

//Computes log base 10 of v
exports.log10 = function(v) {
  return  (v >= 1000000000) ? 9 : (v >= 100000000) ? 8 : (v >= 10000000) ? 7 :
          (v >= 1000000) ? 6 : (v >= 100000) ? 5 : (v >= 10000) ? 4 :
          (v >= 1000) ? 3 : (v >= 100) ? 2 : (v >= 10) ? 1 : 0;
}

//Counts number of bits
exports.popCount = function(v) {
  v = v - ((v >>> 1) & 0x55555555);
  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
  return ((v + (v >>> 4) & 0xF0F0F0F) * 0x1010101) >>> 24;
}

//Counts number of trailing zeros
function countTrailingZeros(v) {
  var c = 32;
  v &= -v;
  if (v) c--;
  if (v & 0x0000FFFF) c -= 16;
  if (v & 0x00FF00FF) c -= 8;
  if (v & 0x0F0F0F0F) c -= 4;
  if (v & 0x33333333) c -= 2;
  if (v & 0x55555555) c -= 1;
  return c;
}
exports.countTrailingZeros = countTrailingZeros;

//Rounds to next power of 2
exports.nextPow2 = function(v) {
  v += v === 0;
  --v;
  v |= v >>> 1;
  v |= v >>> 2;
  v |= v >>> 4;
  v |= v >>> 8;
  v |= v >>> 16;
  return v + 1;
}

//Rounds down to previous power of 2
exports.prevPow2 = function(v) {
  v |= v >>> 1;
  v |= v >>> 2;
  v |= v >>> 4;
  v |= v >>> 8;
  v |= v >>> 16;
  return v - (v>>>1);
}

//Computes parity of word
exports.parity = function(v) {
  v ^= v >>> 16;
  v ^= v >>> 8;
  v ^= v >>> 4;
  v &= 0xf;
  return (0x6996 >>> v) & 1;
}

var REVERSE_TABLE = new Array(256);

(function(tab) {
  for(var i=0; i<256; ++i) {
    var v = i, r = i, s = 7;
    for (v >>>= 1; v; v >>>= 1) {
      r <<= 1;
      r |= v & 1;
      --s;
    }
    tab[i] = (r << s) & 0xff;
  }
})(REVERSE_TABLE);

//Reverse bits in a 32 bit word
exports.reverse = function(v) {
  return  (REVERSE_TABLE[ v         & 0xff] << 24) |
          (REVERSE_TABLE[(v >>> 8)  & 0xff] << 16) |
          (REVERSE_TABLE[(v >>> 16) & 0xff] << 8)  |
           REVERSE_TABLE[(v >>> 24) & 0xff];
}

//Interleave bits of 2 coordinates with 16 bits.  Useful for fast quadtree codes
exports.interleave2 = function(x, y) {
  x &= 0xFFFF;
  x = (x | (x << 8)) & 0x00FF00FF;
  x = (x | (x << 4)) & 0x0F0F0F0F;
  x = (x | (x << 2)) & 0x33333333;
  x = (x | (x << 1)) & 0x55555555;

  y &= 0xFFFF;
  y = (y | (y << 8)) & 0x00FF00FF;
  y = (y | (y << 4)) & 0x0F0F0F0F;
  y = (y | (y << 2)) & 0x33333333;
  y = (y | (y << 1)) & 0x55555555;

  return x | (y << 1);
}

//Extracts the nth interleaved component
exports.deinterleave2 = function(v, n) {
  v = (v >>> n) & 0x55555555;
  v = (v | (v >>> 1))  & 0x33333333;
  v = (v | (v >>> 2))  & 0x0F0F0F0F;
  v = (v | (v >>> 4))  & 0x00FF00FF;
  v = (v | (v >>> 16)) & 0x000FFFF;
  return (v << 16) >> 16;
}


//Interleave bits of 3 coordinates, each with 10 bits.  Useful for fast octree codes
exports.interleave3 = function(x, y, z) {
  x &= 0x3FF;
  x  = (x | (x<<16)) & 4278190335;
  x  = (x | (x<<8))  & 251719695;
  x  = (x | (x<<4))  & 3272356035;
  x  = (x | (x<<2))  & 1227133513;

  y &= 0x3FF;
  y  = (y | (y<<16)) & 4278190335;
  y  = (y | (y<<8))  & 251719695;
  y  = (y | (y<<4))  & 3272356035;
  y  = (y | (y<<2))  & 1227133513;
  x |= (y << 1);
  
  z &= 0x3FF;
  z  = (z | (z<<16)) & 4278190335;
  z  = (z | (z<<8))  & 251719695;
  z  = (z | (z<<4))  & 3272356035;
  z  = (z | (z<<2))  & 1227133513;
  
  return x | (z << 2);
}

//Extracts nth interleaved component of a 3-tuple
exports.deinterleave3 = function(v, n) {
  v = (v >>> n)       & 1227133513;
  v = (v | (v>>>2))   & 3272356035;
  v = (v | (v>>>4))   & 251719695;
  v = (v | (v>>>8))   & 4278190335;
  v = (v | (v>>>16))  & 0x3FF;
  return (v<<22)>>22;
}

//Computes next combination in colexicographic order (this is mistakenly called nextPermutation on the bit twiddling hacks page)
exports.nextCombination = function(v) {
  var t = v | (v - 1);
  return (t + 1) | (((~t & -~t) - 1) >>> (countTrailingZeros(v) + 1));
}



/***/ }),
/* 13 */
/***/ (function(module, exports) {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

/*===========================================================================*\
 * Fast Fourier Transform (Cooley-Tukey Method)
 *
 * (c) Vail Systems. Joshua Jung and Ben Bryan. 2015
 *
 * This code is not designed to be highly optimized but as an educational
 * tool to understand the Fast Fourier Transform.
\*===========================================================================*/
module.exports = {
    fft: __webpack_require__(8).fft,
    ifft: __webpack_require__(34).ifft,
    fftInPlace: __webpack_require__(8).fftInPlace,
    util: __webpack_require__(9),
    dft: __webpack_require__(33)
};


/***/ }),
/* 15 */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var Buffer = __webpack_require__(0).Buffer;

var isBufferEncoding = Buffer.isEncoding
  || function(encoding) {
       switch (encoding && encoding.toLowerCase()) {
         case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
         default: return false;
       }
     }


function assertEncoding(encoding) {
  if (encoding && !isBufferEncoding(encoding)) {
    throw new Error('Unknown encoding: ' + encoding);
  }
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters. CESU-8 is handled as part of the UTF-8 encoding.
//
// @TODO Handling all encodings inside a single object makes it very difficult
// to reason about this code, so it should be split up in the future.
// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
// points as used by CESU-8.
var StringDecoder = exports.StringDecoder = function(encoding) {
  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
  assertEncoding(encoding);
  switch (this.encoding) {
    case 'utf8':
      // CESU-8 represents each of Surrogate Pair by 3-bytes
      this.surrogateSize = 3;
      break;
    case 'ucs2':
    case 'utf16le':
      // UTF-16 represents each of Surrogate Pair by 2-bytes
      this.surrogateSize = 2;
      this.detectIncompleteChar = utf16DetectIncompleteChar;
      break;
    case 'base64':
      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
      this.surrogateSize = 3;
      this.detectIncompleteChar = base64DetectIncompleteChar;
      break;
    default:
      this.write = passThroughWrite;
      return;
  }

  // Enough space to store all bytes of a single character. UTF-8 needs 4
  // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
  this.charBuffer = new Buffer(6);
  // Number of bytes received for the current incomplete multi-byte character.
  this.charReceived = 0;
  // Number of bytes expected for the current incomplete multi-byte character.
  this.charLength = 0;
};


// write decodes the given buffer and returns it as JS string that is
// guaranteed to not contain any partial multi-byte characters. Any partial
// character found at the end of the buffer is buffered up, and will be
// returned when calling write again with the remaining bytes.
//
// Note: Converting a Buffer containing an orphan surrogate to a String
// currently works, but converting a String to a Buffer (via `new Buffer`, or
// Buffer#write) will replace incomplete surrogates with the unicode
// replacement character. See https://codereview.chromium.org/121173009/ .
StringDecoder.prototype.write = function(buffer) {
  var charStr = '';
  // if our last write ended with an incomplete multibyte character
  while (this.charLength) {
    // determine how many remaining bytes this buffer has to offer for this char
    var available = (buffer.length >= this.charLength - this.charReceived) ?
        this.charLength - this.charReceived :
        buffer.length;

    // add the new bytes to the char buffer
    buffer.copy(this.charBuffer, this.charReceived, 0, available);
    this.charReceived += available;

    if (this.charReceived < this.charLength) {
      // still not enough chars in this buffer? wait for more ...
      return '';
    }

    // remove bytes belonging to the current character from the buffer
    buffer = buffer.slice(available, buffer.length);

    // get the character that was split
    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
    var charCode = charStr.charCodeAt(charStr.length - 1);
    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
      this.charLength += this.surrogateSize;
      charStr = '';
      continue;
    }
    this.charReceived = this.charLength = 0;

    // if there are no more bytes in this buffer, just emit our char
    if (buffer.length === 0) {
      return charStr;
    }
    break;
  }

  // determine and set charLength / charReceived
  this.detectIncompleteChar(buffer);

  var end = buffer.length;
  if (this.charLength) {
    // buffer the incomplete character bytes we got
    buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
    end -= this.charReceived;
  }

  charStr += buffer.toString(this.encoding, 0, end);

  var end = charStr.length - 1;
  var charCode = charStr.charCodeAt(end);
  // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
    var size = this.surrogateSize;
    this.charLength += size;
    this.charReceived += size;
    this.charBuffer.copy(this.charBuffer, size, 0, size);
    buffer.copy(this.charBuffer, 0, 0, size);
    return charStr.substring(0, end);
  }

  // or just emit the charStr
  return charStr;
};

// detectIncompleteChar determines if there is an incomplete UTF-8 character at
// the end of the given buffer. If so, it sets this.charLength to the byte
// length that character, and sets this.charReceived to the number of bytes
// that are available for this character.
StringDecoder.prototype.detectIncompleteChar = function(buffer) {
  // determine how many bytes we have to check at the end of this buffer
  var i = (buffer.length >= 3) ? 3 : buffer.length;

  // Figure out if one of the last i bytes of our buffer announces an
  // incomplete char.
  for (; i > 0; i--) {
    var c = buffer[buffer.length - i];

    // See http://en.wikipedia.org/wiki/UTF-8#Description

    // 110XXXXX
    if (i == 1 && c >> 5 == 0x06) {
      this.charLength = 2;
      break;
    }

    // 1110XXXX
    if (i <= 2 && c >> 4 == 0x0E) {
      this.charLength = 3;
      break;
    }

    // 11110XXX
    if (i <= 3 && c >> 3 == 0x1E) {
      this.charLength = 4;
      break;
    }
  }
  this.charReceived = i;
};

StringDecoder.prototype.end = function(buffer) {
  var res = '';
  if (buffer && buffer.length)
    res = this.write(buffer);

  if (this.charReceived) {
    var cr = this.charReceived;
    var buf = this.charBuffer;
    var enc = this.encoding;
    res += buf.slice(0, cr).toString(enc);
  }

  return res;
};

function passThroughWrite(buffer) {
  return buffer.toString(this.encoding);
}

function utf16DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 2;
  this.charLength = this.charReceived ? 2 : 0;
}

function base64DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 3;
  this.charLength = this.charReceived ? 3 : 0;
}


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var ClientRequest = __webpack_require__(43)
var extend = __webpack_require__(47)
var statusCodes = __webpack_require__(32)
var url = __webpack_require__(24)

var http = exports

http.request = function (opts, cb) {
	if (typeof opts === 'string')
		opts = url.parse(opts)
	else
		opts = extend(opts)

	// Normally, the page is loaded from http or https, so not specifying a protocol
	// will result in a (valid) protocol-relative url. However, this won't work if
	// the protocol is something else, like 'file:'
	var defaultProtocol = global.location.protocol.search(/^https?:$/) === -1 ? 'http:' : ''

	var protocol = opts.protocol || defaultProtocol
	var host = opts.hostname || opts.host
	var port = opts.port
	var path = opts.path || '/'

	// Necessary for IPv6 addresses
	if (host && host.indexOf(':') !== -1)
		host = '[' + host + ']'

	// This may be a relative url. The browser should always be able to interpret it correctly.
	opts.url = (host ? (protocol + '//' + host) : '') + (port ? ':' + port : '') + path
	opts.method = (opts.method || 'GET').toUpperCase()
	opts.headers = opts.headers || {}

	// Also valid opts.auth, opts.mode

	var req = new ClientRequest(opts)
	if (cb)
		req.on('response', cb)
	return req
}

http.get = function get (opts, cb) {
	var req = http.request(opts, cb)
	req.end()
	return req
}

http.Agent = function () {}
http.Agent.defaultMaxSockets = 4

http.STATUS_CODES = statusCodes

http.METHODS = [
	'CHECKOUT',
	'CONNECT',
	'COPY',
	'DELETE',
	'GET',
	'HEAD',
	'LOCK',
	'M-SEARCH',
	'MERGE',
	'MKACTIVITY',
	'MKCOL',
	'MOVE',
	'NOTIFY',
	'OPTIONS',
	'PATCH',
	'POST',
	'PROPFIND',
	'PROPPATCH',
	'PURGE',
	'PUT',
	'REPORT',
	'SEARCH',
	'SUBSCRIBE',
	'TRACE',
	'UNLOCK',
	'UNSUBSCRIBE'
]
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {exports.fetch = isFunction(global.fetch) && isFunction(global.ReadableStream)

exports.blobConstructor = false
try {
	new Blob([new ArrayBuffer(1)])
	exports.blobConstructor = true
} catch (e) {}

// The xhr request to example.com may violate some restrictive CSP configurations,
// so if we're running in a browser that supports `fetch`, avoid calling getXHR()
// and assume support for certain features below.
var xhr
function getXHR () {
	// Cache the xhr value
	if (xhr !== undefined) return xhr

	if (global.XMLHttpRequest) {
		xhr = new global.XMLHttpRequest()
		// If XDomainRequest is available (ie only, where xhr might not work
		// cross domain), use the page location. Otherwise use example.com
		// Note: this doesn't actually make an http request.
		try {
			xhr.open('GET', global.XDomainRequest ? '/' : 'https://example.com')
		} catch(e) {
			xhr = null
		}
	} else {
		// Service workers don't have XHR
		xhr = null
	}
	return xhr
}

function checkTypeSupport (type) {
	var xhr = getXHR()
	if (!xhr) return false
	try {
		xhr.responseType = type
		return xhr.responseType === type
	} catch (e) {}
	return false
}

// For some strange reason, Safari 7.0 reports typeof global.ArrayBuffer === 'object'.
// Safari 7.1 appears to have fixed this bug.
var haveArrayBuffer = typeof global.ArrayBuffer !== 'undefined'
var haveSlice = haveArrayBuffer && isFunction(global.ArrayBuffer.prototype.slice)

// If fetch is supported, then arraybuffer will be supported too. Skip calling
// checkTypeSupport(), since that calls getXHR().
exports.arraybuffer = exports.fetch || (haveArrayBuffer && checkTypeSupport('arraybuffer'))

// These next two tests unavoidably show warnings in Chrome. Since fetch will always
// be used if it's available, just return false for these to avoid the warnings.
exports.msstream = !exports.fetch && haveSlice && checkTypeSupport('ms-stream')
exports.mozchunkedarraybuffer = !exports.fetch && haveArrayBuffer &&
	checkTypeSupport('moz-chunked-arraybuffer')

// If fetch is supported, then overrideMimeType will be supported too. Skip calling
// getXHR().
exports.overrideMimeType = exports.fetch || (getXHR() ? isFunction(getXHR().overrideMimeType) : false)

exports.vbArray = isFunction(global.VBArray)

function isFunction (value) {
	return typeof value === 'function'
}

xhr = null // Help gc

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {

module.exports = Readable;

/*<replacement>*/
var processNextTick = __webpack_require__(10);
/*</replacement>*/

/*<replacement>*/
var isArray = __webpack_require__(15);
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = __webpack_require__(13).EventEmitter;

var EElistenerCount = function (emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream = __webpack_require__(22);
/*</replacement>*/

var Buffer = __webpack_require__(0).Buffer;
/*<replacement>*/
var bufferShim = __webpack_require__(6);
/*</replacement>*/

/*<replacement>*/
var util = __webpack_require__(5);
util.inherits = __webpack_require__(2);
/*</replacement>*/

/*<replacement>*/
var debugUtil = __webpack_require__(53);
var debug = void 0;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function () {};
}
/*</replacement>*/

var BufferList = __webpack_require__(46);
var StringDecoder;

util.inherits(Readable, Stream);

var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') {
    return emitter.prependListener(event, fn);
  } else {
    // This is a hack to make sure that our error handler is attached before any
    // userland ones.  NEVER DO THIS. This is here only because this code needs
    // to continue to work with older versions of Node.js that do not include
    // the prependListener() method. The goal is to eventually remove this hack.
    if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
  }
}

function ReadableState(options, stream) {
  Duplex = Duplex || __webpack_require__(4);

  options = options || {};

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = ~~this.highWaterMark;

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // when piping, we only care about 'readable' events that happen
  // after read()ing all the bytes and not getting any pushback.
  this.ranOut = false;

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = __webpack_require__(16).StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex = Duplex || __webpack_require__(4);

  if (!(this instanceof Readable)) return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options && typeof options.read === 'function') this._read = options.read;

  Stream.call(this);
}

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;

  if (!state.objectMode && typeof chunk === 'string') {
    encoding = encoding || state.defaultEncoding;
    if (encoding !== state.encoding) {
      chunk = bufferShim.from(chunk, encoding);
      encoding = '';
    }
  }

  return readableAddChunk(this, state, chunk, encoding, false);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  var state = this._readableState;
  return readableAddChunk(this, state, chunk, '', true);
};

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

function readableAddChunk(stream, state, chunk, encoding, addToFront) {
  var er = chunkInvalid(state, chunk);
  if (er) {
    stream.emit('error', er);
  } else if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else if (state.objectMode || chunk && chunk.length > 0) {
    if (state.ended && !addToFront) {
      var e = new Error('stream.push() after EOF');
      stream.emit('error', e);
    } else if (state.endEmitted && addToFront) {
      var _e = new Error('stream.unshift() after end event');
      stream.emit('error', _e);
    } else {
      var skipAdd;
      if (state.decoder && !addToFront && !encoding) {
        chunk = state.decoder.write(chunk);
        skipAdd = !state.objectMode && chunk.length === 0;
      }

      if (!addToFront) state.reading = false;

      // Don't add to the buffer if we've decoded to an empty string chunk and
      // we're not in object mode
      if (!skipAdd) {
        // if we want the data now, just emit it.
        if (state.flowing && state.length === 0 && !state.sync) {
          stream.emit('data', chunk);
          stream.read(0);
        } else {
          // update the buffer info.
          state.length += state.objectMode ? 1 : chunk.length;
          if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

          if (state.needReadable) emitReadable(stream);
        }
      }

      maybeReadMore(stream, state);
    }
  } else if (!addToFront) {
    state.reading = false;
  }

  return needMoreData(state);
}

// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
}

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = __webpack_require__(16).StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 8MB
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;

  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  } else {
    state.length -= n;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);

  return ret;
};

function chunkInvalid(state, chunk) {
  var er = null;
  if (!Buffer.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== null && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}

function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync) processNextTick(emitReadable_, stream);else emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    processNextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;else len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  this.emit('error', new Error('_read() is not implemented'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

  var endFn = doEnd ? onend : cleanup;
  if (state.endEmitted) processNextTick(endFn);else src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable) {
    debug('onunpipe');
    if (readable === src) {
      cleanup();
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', cleanup);
    src.removeListener('data', ondata);

    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  // If the user pushes more data while we're writing to dest then we'll end up
  // in ondata again. However, we only want to increase awaitDrain once because
  // dest will only emit one 'drain' event for the multiple writes.
  // => Introduce a guard on increasing awaitDrain.
  var increasedAwaitDrain = false;
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    increasedAwaitDrain = false;
    var ret = dest.write(chunk);
    if (false === ret && !increasedAwaitDrain) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', src._readableState.awaitDrain);
        src._readableState.awaitDrain++;
        increasedAwaitDrain = true;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function () {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;

    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this);
    }return this;
  }

  // try to find the right one.
  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;

  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];

  dest.emit('unpipe', this);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data') {
    // Start flowing on next tick if stream isn't explicitly paused
    if (this._readableState.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    var state = this._readableState;
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.emittedReadable = false;
      if (!state.reading) {
        processNextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this, state);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    processNextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  state.awaitDrain = 0;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null) {}
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var state = this._readableState;
  var paused = false;

  var self = this;
  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) self.push(chunk);
    }

    self.push(null);
  });

  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = self.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function (method) {
        return function () {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], self.emit.bind(self, kProxyEvents[n]));
  }

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  self._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return self;
};

// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;

  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = fromListPartial(n, state.buffer, state.decoder);
  }

  return ret;
}

// Extracts only enough buffered data to satisfy the amount requested.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromListPartial(n, list, hasStrings) {
  var ret;
  if (n < list.head.data.length) {
    // slice is the same for buffers and strings
    ret = list.head.data.slice(0, n);
    list.head.data = list.head.data.slice(n);
  } else if (n === list.head.data.length) {
    // first chunk is a perfect match
    ret = list.shift();
  } else {
    // result spans more than one buffer
    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
  }
  return ret;
}

// Copies a specified amount of characters from the list of buffered data
// chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBufferString(n, list) {
  var p = list.head;
  var c = 1;
  var ret = p.data;
  n -= ret.length;
  while (p = p.next) {
    var str = p.data;
    var nb = n > str.length ? str.length : n;
    if (nb === str.length) ret += str;else ret += str.slice(0, n);
    n -= nb;
    if (n === 0) {
      if (nb === str.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = str.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

// Copies a specified amount of bytes from the list of buffered data chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBuffer(n, list) {
  var ret = bufferShim.allocUnsafe(n);
  var p = list.head;
  var c = 1;
  p.data.copy(ret);
  n -= p.data.length;
  while (p = p.next) {
    var buf = p.data;
    var nb = n > buf.length ? buf.length : n;
    buf.copy(ret, ret.length - n, 0, nb);
    n -= nb;
    if (n === 0) {
      if (nb === buf.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = buf.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    processNextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.



module.exports = Transform;

var Duplex = __webpack_require__(4);

/*<replacement>*/
var util = __webpack_require__(5);
util.inherits = __webpack_require__(2);
/*</replacement>*/

util.inherits(Transform, Duplex);

function TransformState(stream) {
  this.afterTransform = function (er, data) {
    return afterTransform(stream, er, data);
  };

  this.needTransform = false;
  this.transforming = false;
  this.writecb = null;
  this.writechunk = null;
  this.writeencoding = null;
}

function afterTransform(stream, er, data) {
  var ts = stream._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb) return stream.emit('error', new Error('no writecb in Transform class'));

  ts.writechunk = null;
  ts.writecb = null;

  if (data !== null && data !== undefined) stream.push(data);

  cb(er);

  var rs = stream._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    stream._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);

  Duplex.call(this, options);

  this._transformState = new TransformState(this);

  var stream = this;

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;

    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  // When the writable side finishes, then flush out anything remaining.
  this.once('prefinish', function () {
    if (typeof this._flush === 'function') this._flush(function (er, data) {
      done(stream, er, data);
    });else done(stream);
  });
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  throw new Error('_transform() is not implemented');
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);

  if (data !== null && data !== undefined) stream.push(data);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  var ws = stream._writableState;
  var ts = stream._transformState;

  if (ws.length) throw new Error('Calling transform done when ws.length != 0');

  if (ts.transforming) throw new Error('Calling transform done when still transforming');

  return stream.push(null);
}

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process, setImmediate) {// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.



module.exports = Writable;

/*<replacement>*/
var processNextTick = __webpack_require__(10);
/*</replacement>*/

/*<replacement>*/
var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : processNextTick;
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;

/*<replacement>*/
var util = __webpack_require__(5);
util.inherits = __webpack_require__(2);
/*</replacement>*/

/*<replacement>*/
var internalUtil = {
  deprecate: __webpack_require__(51)
};
/*</replacement>*/

/*<replacement>*/
var Stream = __webpack_require__(22);
/*</replacement>*/

var Buffer = __webpack_require__(0).Buffer;
/*<replacement>*/
var bufferShim = __webpack_require__(6);
/*</replacement>*/

util.inherits(Writable, Stream);

function nop() {}

function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

function WritableState(options, stream) {
  Duplex = Duplex || __webpack_require__(4);

  options = options || {};

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = ~~this.highWaterMark;

  // drain event flag.
  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function () {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.')
    });
  } catch (_) {}
})();

// Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.
var realHasInstance;
if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function (object) {
      if (realHasInstance.call(this, object)) return true;

      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function (object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || __webpack_require__(4);

  // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.

  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.
  if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
    return new Writable(options);
  }

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;

    if (typeof options.writev === 'function') this._writev = options.writev;
  }

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  this.emit('error', new Error('Cannot pipe, not readable'));
};

function writeAfterEnd(stream, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  processNextTick(cb, er);
}

// Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  var er = false;

  if (chunk === null) {
    er = new TypeError('May not write null values to stream');
  } else if (typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  if (er) {
    stream.emit('error', er);
    processNextTick(cb, er);
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;
  var isBuf = Buffer.isBuffer(chunk);

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

  if (typeof cb !== 'function') cb = nop;

  if (state.ended) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function () {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = bufferShim.from(chunk, encoding);
  }
  return chunk;
}

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    chunk = decodeChunk(state, chunk, encoding);
    if (Buffer.isBuffer(chunk)) encoding = 'buffer';
  }
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = new WriteReq(chunk, encoding, cb);
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;
  if (sync) processNextTick(cb, er);else cb(er);

  stream._writableState.errorEmitted = true;
  stream.emit('error', er);
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      /*<replacement>*/
      asyncWrite(afterWrite, stream, state, finished, cb);
      /*</replacement>*/
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;

    var count = 0;
    while (entry) {
      buffer[count] = entry;
      entry = entry.next;
      count += 1;
    }

    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequestCount = 0;
  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new Error('_write() is not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished) endWritable(this, state, cb);
};

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}

function prefinish(stream, state) {
  if (!state.prefinished) {
    state.prefinished = true;
    stream.emit('prefinish');
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    if (state.pendingcb === 0) {
      prefinish(stream, state);
      state.finished = true;
      stream.emit('finish');
    } else {
      prefinish(stream, state);
    }
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) processNextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;
  this.finish = function (err) {
    var entry = _this.entry;
    _this.entry = null;
    while (entry) {
      var cb = entry.callback;
      state.pendingcb--;
      cb(err);
      entry = entry.next;
    }
    if (state.corkedRequestsFree) {
      state.corkedRequestsFree.next = _this;
    } else {
      state.corkedRequestsFree = _this;
    }
  };
}
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3), __webpack_require__(48).setImmediate))

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(13).EventEmitter;


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(19);
exports.Stream = exports;
exports.Readable = exports;
exports.Writable = __webpack_require__(21);
exports.Duplex = __webpack_require__(4);
exports.Transform = __webpack_require__(20);
exports.PassThrough = __webpack_require__(45);


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var punycode = __webpack_require__(38);
var util = __webpack_require__(50);

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = __webpack_require__(41);

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
      splitter =
          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1)
        continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      util.isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol')
        result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host || srcPath.length > 1) &&
      (last === '.' || last === '..') || last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};


/***/ }),
/* 25 */
/***/ (function(module, exports) {

module.exports = function(module) {
	if(!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if(!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

/*===========================================================================*\
 *
 * Autocorrelation based on FFT
 *
 * (c) 2016 Maximilian Bügler
 *
\*===========================================================================*/
module.exports = {
    autocorrelation: __webpack_require__(30).autocorrelation
};


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module) {var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
/**
 * @license
 *
 * chroma.js - JavaScript library for color conversions
 * 
 * Copyright (c) 2011-2017, Gregor Aisch
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 * 
 * 3. The name Gregor Aisch may not be used to endorse or promote products
 *    derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL GREGOR AISCH OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

(function() {
  var Color, DEG2RAD, LAB_CONSTANTS, PI, PITHIRD, RAD2DEG, TWOPI, _guess_formats, _guess_formats_sorted, _input, _interpolators, abs, atan2, bezier, blend, blend_f, brewer, burn, chroma, clip_rgb, cmyk2rgb, colors, cos, css2rgb, darken, dodge, each, floor, hcg2rgb, hex2rgb, hsi2rgb, hsl2css, hsl2rgb, hsv2rgb, interpolate, interpolate_hsx, interpolate_lab, interpolate_num, interpolate_rgb, lab2lch, lab2rgb, lab_xyz, lch2lab, lch2rgb, lighten, limit, log, luminance_x, m, max, multiply, normal, num2rgb, overlay, pow, rgb2cmyk, rgb2css, rgb2hcg, rgb2hex, rgb2hsi, rgb2hsl, rgb2hsv, rgb2lab, rgb2lch, rgb2luminance, rgb2num, rgb2temperature, rgb2xyz, rgb_xyz, rnd, root, round, screen, sin, sqrt, temperature2rgb, type, unpack, w3cx11, xyz_lab, xyz_rgb,
    slice = [].slice;

  type = (function() {

    /*
    for browser-safe type checking+
    ported from jQuery's $.type
     */
    var classToType, len, name, o, ref;
    classToType = {};
    ref = "Boolean Number String Function Array Date RegExp Undefined Null".split(" ");
    for (o = 0, len = ref.length; o < len; o++) {
      name = ref[o];
      classToType["[object " + name + "]"] = name.toLowerCase();
    }
    return function(obj) {
      var strType;
      strType = Object.prototype.toString.call(obj);
      return classToType[strType] || "object";
    };
  })();

  limit = function(x, min, max) {
    if (min == null) {
      min = 0;
    }
    if (max == null) {
      max = 1;
    }
    if (x < min) {
      x = min;
    }
    if (x > max) {
      x = max;
    }
    return x;
  };

  unpack = function(args) {
    if (args.length >= 3) {
      return [].slice.call(args);
    } else {
      return args[0];
    }
  };

  clip_rgb = function(rgb) {
    var i, o;
    rgb._clipped = false;
    rgb._unclipped = rgb.slice(0);
    for (i = o = 0; o < 3; i = ++o) {
      if (i < 3) {
        if (rgb[i] < 0 || rgb[i] > 255) {
          rgb._clipped = true;
        }
        if (rgb[i] < 0) {
          rgb[i] = 0;
        }
        if (rgb[i] > 255) {
          rgb[i] = 255;
        }
      } else if (i === 3) {
        if (rgb[i] < 0) {
          rgb[i] = 0;
        }
        if (rgb[i] > 1) {
          rgb[i] = 1;
        }
      }
    }
    if (!rgb._clipped) {
      delete rgb._unclipped;
    }
    return rgb;
  };

  PI = Math.PI, round = Math.round, cos = Math.cos, floor = Math.floor, pow = Math.pow, log = Math.log, sin = Math.sin, sqrt = Math.sqrt, atan2 = Math.atan2, max = Math.max, abs = Math.abs;

  TWOPI = PI * 2;

  PITHIRD = PI / 3;

  DEG2RAD = PI / 180;

  RAD2DEG = 180 / PI;

  chroma = function() {
    if (arguments[0] instanceof Color) {
      return arguments[0];
    }
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, arguments, function(){});
  };

  _interpolators = [];

  if ((typeof module !== "undefined" && module !== null) && (module.exports != null)) {
    module.exports = chroma;
  }

  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
      return chroma;
    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else {
    root = typeof exports !== "undefined" && exports !== null ? exports : this;
    root.chroma = chroma;
  }

  chroma.version = '1.3.3';

  _input = {};

  _guess_formats = [];

  _guess_formats_sorted = false;

  Color = (function() {
    function Color() {
      var arg, args, chk, len, len1, me, mode, o, w;
      me = this;
      args = [];
      for (o = 0, len = arguments.length; o < len; o++) {
        arg = arguments[o];
        if (arg != null) {
          args.push(arg);
        }
      }
      mode = args[args.length - 1];
      if (_input[mode] != null) {
        me._rgb = clip_rgb(_input[mode](unpack(args.slice(0, -1))));
      } else {
        if (!_guess_formats_sorted) {
          _guess_formats = _guess_formats.sort(function(a, b) {
            return b.p - a.p;
          });
          _guess_formats_sorted = true;
        }
        for (w = 0, len1 = _guess_formats.length; w < len1; w++) {
          chk = _guess_formats[w];
          mode = chk.test.apply(chk, args);
          if (mode) {
            break;
          }
        }
        if (mode) {
          me._rgb = clip_rgb(_input[mode].apply(_input, args));
        }
      }
      if (me._rgb == null) {
        console.warn('unknown format: ' + args);
      }
      if (me._rgb == null) {
        me._rgb = [0, 0, 0];
      }
      if (me._rgb.length === 3) {
        me._rgb.push(1);
      }
    }

    Color.prototype.toString = function() {
      return this.hex();
    };

    return Color;

  })();

  chroma._input = _input;


  /**
  	ColorBrewer colors for chroma.js
  
  	Copyright (c) 2002 Cynthia Brewer, Mark Harrower, and The 
  	Pennsylvania State University.
  
  	Licensed under the Apache License, Version 2.0 (the "License"); 
  	you may not use this file except in compliance with the License.
  	You may obtain a copy of the License at	
  	http://www.apache.org/licenses/LICENSE-2.0
  
  	Unless required by applicable law or agreed to in writing, software distributed
  	under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
  	CONDITIONS OF ANY KIND, either express or implied. See the License for the
  	specific language governing permissions and limitations under the License.
  
      @preserve
   */

  chroma.brewer = brewer = {
    OrRd: ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#b30000', '#7f0000'],
    PuBu: ['#fff7fb', '#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0', '#045a8d', '#023858'],
    BuPu: ['#f7fcfd', '#e0ecf4', '#bfd3e6', '#9ebcda', '#8c96c6', '#8c6bb1', '#88419d', '#810f7c', '#4d004b'],
    Oranges: ['#fff5eb', '#fee6ce', '#fdd0a2', '#fdae6b', '#fd8d3c', '#f16913', '#d94801', '#a63603', '#7f2704'],
    BuGn: ['#f7fcfd', '#e5f5f9', '#ccece6', '#99d8c9', '#66c2a4', '#41ae76', '#238b45', '#006d2c', '#00441b'],
    YlOrBr: ['#ffffe5', '#fff7bc', '#fee391', '#fec44f', '#fe9929', '#ec7014', '#cc4c02', '#993404', '#662506'],
    YlGn: ['#ffffe5', '#f7fcb9', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443', '#006837', '#004529'],
    Reds: ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d'],
    RdPu: ['#fff7f3', '#fde0dd', '#fcc5c0', '#fa9fb5', '#f768a1', '#dd3497', '#ae017e', '#7a0177', '#49006a'],
    Greens: ['#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#006d2c', '#00441b'],
    YlGnBu: ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'],
    Purples: ['#fcfbfd', '#efedf5', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#54278f', '#3f007d'],
    GnBu: ['#f7fcf0', '#e0f3db', '#ccebc5', '#a8ddb5', '#7bccc4', '#4eb3d3', '#2b8cbe', '#0868ac', '#084081'],
    Greys: ['#ffffff', '#f0f0f0', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252', '#252525', '#000000'],
    YlOrRd: ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'],
    PuRd: ['#f7f4f9', '#e7e1ef', '#d4b9da', '#c994c7', '#df65b0', '#e7298a', '#ce1256', '#980043', '#67001f'],
    Blues: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b'],
    PuBuGn: ['#fff7fb', '#ece2f0', '#d0d1e6', '#a6bddb', '#67a9cf', '#3690c0', '#02818a', '#016c59', '#014636'],
    Viridis: ['#440154', '#482777', '#3f4a8a', '#31678e', '#26838f', '#1f9d8a', '#6cce5a', '#b6de2b', '#fee825'],
    Spectral: ['#9e0142', '#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#e6f598', '#abdda4', '#66c2a5', '#3288bd', '#5e4fa2'],
    RdYlGn: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#006837'],
    RdBu: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#f7f7f7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'],
    PiYG: ['#8e0152', '#c51b7d', '#de77ae', '#f1b6da', '#fde0ef', '#f7f7f7', '#e6f5d0', '#b8e186', '#7fbc41', '#4d9221', '#276419'],
    PRGn: ['#40004b', '#762a83', '#9970ab', '#c2a5cf', '#e7d4e8', '#f7f7f7', '#d9f0d3', '#a6dba0', '#5aae61', '#1b7837', '#00441b'],
    RdYlBu: ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee090', '#ffffbf', '#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'],
    BrBG: ['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#f5f5f5', '#c7eae5', '#80cdc1', '#35978f', '#01665e', '#003c30'],
    RdGy: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#ffffff', '#e0e0e0', '#bababa', '#878787', '#4d4d4d', '#1a1a1a'],
    PuOr: ['#7f3b08', '#b35806', '#e08214', '#fdb863', '#fee0b6', '#f7f7f7', '#d8daeb', '#b2abd2', '#8073ac', '#542788', '#2d004b'],
    Set2: ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3'],
    Accent: ['#7fc97f', '#beaed4', '#fdc086', '#ffff99', '#386cb0', '#f0027f', '#bf5b17', '#666666'],
    Set1: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'],
    Set3: ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#ccebc5', '#ffed6f'],
    Dark2: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666'],
    Paired: ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'],
    Pastel2: ['#b3e2cd', '#fdcdac', '#cbd5e8', '#f4cae4', '#e6f5c9', '#fff2ae', '#f1e2cc', '#cccccc'],
    Pastel1: ['#fbb4ae', '#b3cde3', '#ccebc5', '#decbe4', '#fed9a6', '#ffffcc', '#e5d8bd', '#fddaec', '#f2f2f2']
  };

  (function() {
    var key, results;
    results = [];
    for (key in brewer) {
      results.push(brewer[key.toLowerCase()] = brewer[key]);
    }
    return results;
  })();


  /**
  	X11 color names
  
  	http://www.w3.org/TR/css3-color/#svg-color
   */

  w3cx11 = {
    aliceblue: '#f0f8ff',
    antiquewhite: '#faebd7',
    aqua: '#00ffff',
    aquamarine: '#7fffd4',
    azure: '#f0ffff',
    beige: '#f5f5dc',
    bisque: '#ffe4c4',
    black: '#000000',
    blanchedalmond: '#ffebcd',
    blue: '#0000ff',
    blueviolet: '#8a2be2',
    brown: '#a52a2a',
    burlywood: '#deb887',
    cadetblue: '#5f9ea0',
    chartreuse: '#7fff00',
    chocolate: '#d2691e',
    coral: '#ff7f50',
    cornflower: '#6495ed',
    cornflowerblue: '#6495ed',
    cornsilk: '#fff8dc',
    crimson: '#dc143c',
    cyan: '#00ffff',
    darkblue: '#00008b',
    darkcyan: '#008b8b',
    darkgoldenrod: '#b8860b',
    darkgray: '#a9a9a9',
    darkgreen: '#006400',
    darkgrey: '#a9a9a9',
    darkkhaki: '#bdb76b',
    darkmagenta: '#8b008b',
    darkolivegreen: '#556b2f',
    darkorange: '#ff8c00',
    darkorchid: '#9932cc',
    darkred: '#8b0000',
    darksalmon: '#e9967a',
    darkseagreen: '#8fbc8f',
    darkslateblue: '#483d8b',
    darkslategray: '#2f4f4f',
    darkslategrey: '#2f4f4f',
    darkturquoise: '#00ced1',
    darkviolet: '#9400d3',
    deeppink: '#ff1493',
    deepskyblue: '#00bfff',
    dimgray: '#696969',
    dimgrey: '#696969',
    dodgerblue: '#1e90ff',
    firebrick: '#b22222',
    floralwhite: '#fffaf0',
    forestgreen: '#228b22',
    fuchsia: '#ff00ff',
    gainsboro: '#dcdcdc',
    ghostwhite: '#f8f8ff',
    gold: '#ffd700',
    goldenrod: '#daa520',
    gray: '#808080',
    green: '#008000',
    greenyellow: '#adff2f',
    grey: '#808080',
    honeydew: '#f0fff0',
    hotpink: '#ff69b4',
    indianred: '#cd5c5c',
    indigo: '#4b0082',
    ivory: '#fffff0',
    khaki: '#f0e68c',
    laserlemon: '#ffff54',
    lavender: '#e6e6fa',
    lavenderblush: '#fff0f5',
    lawngreen: '#7cfc00',
    lemonchiffon: '#fffacd',
    lightblue: '#add8e6',
    lightcoral: '#f08080',
    lightcyan: '#e0ffff',
    lightgoldenrod: '#fafad2',
    lightgoldenrodyellow: '#fafad2',
    lightgray: '#d3d3d3',
    lightgreen: '#90ee90',
    lightgrey: '#d3d3d3',
    lightpink: '#ffb6c1',
    lightsalmon: '#ffa07a',
    lightseagreen: '#20b2aa',
    lightskyblue: '#87cefa',
    lightslategray: '#778899',
    lightslategrey: '#778899',
    lightsteelblue: '#b0c4de',
    lightyellow: '#ffffe0',
    lime: '#00ff00',
    limegreen: '#32cd32',
    linen: '#faf0e6',
    magenta: '#ff00ff',
    maroon: '#800000',
    maroon2: '#7f0000',
    maroon3: '#b03060',
    mediumaquamarine: '#66cdaa',
    mediumblue: '#0000cd',
    mediumorchid: '#ba55d3',
    mediumpurple: '#9370db',
    mediumseagreen: '#3cb371',
    mediumslateblue: '#7b68ee',
    mediumspringgreen: '#00fa9a',
    mediumturquoise: '#48d1cc',
    mediumvioletred: '#c71585',
    midnightblue: '#191970',
    mintcream: '#f5fffa',
    mistyrose: '#ffe4e1',
    moccasin: '#ffe4b5',
    navajowhite: '#ffdead',
    navy: '#000080',
    oldlace: '#fdf5e6',
    olive: '#808000',
    olivedrab: '#6b8e23',
    orange: '#ffa500',
    orangered: '#ff4500',
    orchid: '#da70d6',
    palegoldenrod: '#eee8aa',
    palegreen: '#98fb98',
    paleturquoise: '#afeeee',
    palevioletred: '#db7093',
    papayawhip: '#ffefd5',
    peachpuff: '#ffdab9',
    peru: '#cd853f',
    pink: '#ffc0cb',
    plum: '#dda0dd',
    powderblue: '#b0e0e6',
    purple: '#800080',
    purple2: '#7f007f',
    purple3: '#a020f0',
    rebeccapurple: '#663399',
    red: '#ff0000',
    rosybrown: '#bc8f8f',
    royalblue: '#4169e1',
    saddlebrown: '#8b4513',
    salmon: '#fa8072',
    sandybrown: '#f4a460',
    seagreen: '#2e8b57',
    seashell: '#fff5ee',
    sienna: '#a0522d',
    silver: '#c0c0c0',
    skyblue: '#87ceeb',
    slateblue: '#6a5acd',
    slategray: '#708090',
    slategrey: '#708090',
    snow: '#fffafa',
    springgreen: '#00ff7f',
    steelblue: '#4682b4',
    tan: '#d2b48c',
    teal: '#008080',
    thistle: '#d8bfd8',
    tomato: '#ff6347',
    turquoise: '#40e0d0',
    violet: '#ee82ee',
    wheat: '#f5deb3',
    white: '#ffffff',
    whitesmoke: '#f5f5f5',
    yellow: '#ffff00',
    yellowgreen: '#9acd32'
  };

  chroma.colors = colors = w3cx11;

  lab2rgb = function() {
    var a, args, b, g, l, r, x, y, z;
    args = unpack(arguments);
    l = args[0], a = args[1], b = args[2];
    y = (l + 16) / 116;
    x = isNaN(a) ? y : y + a / 500;
    z = isNaN(b) ? y : y - b / 200;
    y = LAB_CONSTANTS.Yn * lab_xyz(y);
    x = LAB_CONSTANTS.Xn * lab_xyz(x);
    z = LAB_CONSTANTS.Zn * lab_xyz(z);
    r = xyz_rgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z);
    g = xyz_rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z);
    b = xyz_rgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z);
    return [r, g, b, args.length > 3 ? args[3] : 1];
  };

  xyz_rgb = function(r) {
    return 255 * (r <= 0.00304 ? 12.92 * r : 1.055 * pow(r, 1 / 2.4) - 0.055);
  };

  lab_xyz = function(t) {
    if (t > LAB_CONSTANTS.t1) {
      return t * t * t;
    } else {
      return LAB_CONSTANTS.t2 * (t - LAB_CONSTANTS.t0);
    }
  };

  LAB_CONSTANTS = {
    Kn: 18,
    Xn: 0.950470,
    Yn: 1,
    Zn: 1.088830,
    t0: 0.137931034,
    t1: 0.206896552,
    t2: 0.12841855,
    t3: 0.008856452
  };

  rgb2lab = function() {
    var b, g, r, ref, ref1, x, y, z;
    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
    ref1 = rgb2xyz(r, g, b), x = ref1[0], y = ref1[1], z = ref1[2];
    return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
  };

  rgb_xyz = function(r) {
    if ((r /= 255) <= 0.04045) {
      return r / 12.92;
    } else {
      return pow((r + 0.055) / 1.055, 2.4);
    }
  };

  xyz_lab = function(t) {
    if (t > LAB_CONSTANTS.t3) {
      return pow(t, 1 / 3);
    } else {
      return t / LAB_CONSTANTS.t2 + LAB_CONSTANTS.t0;
    }
  };

  rgb2xyz = function() {
    var b, g, r, ref, x, y, z;
    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
    r = rgb_xyz(r);
    g = rgb_xyz(g);
    b = rgb_xyz(b);
    x = xyz_lab((0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / LAB_CONSTANTS.Xn);
    y = xyz_lab((0.2126729 * r + 0.7151522 * g + 0.0721750 * b) / LAB_CONSTANTS.Yn);
    z = xyz_lab((0.0193339 * r + 0.1191920 * g + 0.9503041 * b) / LAB_CONSTANTS.Zn);
    return [x, y, z];
  };

  chroma.lab = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, slice.call(arguments).concat(['lab']), function(){});
  };

  _input.lab = lab2rgb;

  Color.prototype.lab = function() {
    return rgb2lab(this._rgb);
  };

  bezier = function(colors) {
    var I, I0, I1, c, lab0, lab1, lab2, lab3, ref, ref1, ref2;
    colors = (function() {
      var len, o, results;
      results = [];
      for (o = 0, len = colors.length; o < len; o++) {
        c = colors[o];
        results.push(chroma(c));
      }
      return results;
    })();
    if (colors.length === 2) {
      ref = (function() {
        var len, o, results;
        results = [];
        for (o = 0, len = colors.length; o < len; o++) {
          c = colors[o];
          results.push(c.lab());
        }
        return results;
      })(), lab0 = ref[0], lab1 = ref[1];
      I = function(t) {
        var i, lab;
        lab = (function() {
          var o, results;
          results = [];
          for (i = o = 0; o <= 2; i = ++o) {
            results.push(lab0[i] + t * (lab1[i] - lab0[i]));
          }
          return results;
        })();
        return chroma.lab.apply(chroma, lab);
      };
    } else if (colors.length === 3) {
      ref1 = (function() {
        var len, o, results;
        results = [];
        for (o = 0, len = colors.length; o < len; o++) {
          c = colors[o];
          results.push(c.lab());
        }
        return results;
      })(), lab0 = ref1[0], lab1 = ref1[1], lab2 = ref1[2];
      I = function(t) {
        var i, lab;
        lab = (function() {
          var o, results;
          results = [];
          for (i = o = 0; o <= 2; i = ++o) {
            results.push((1 - t) * (1 - t) * lab0[i] + 2 * (1 - t) * t * lab1[i] + t * t * lab2[i]);
          }
          return results;
        })();
        return chroma.lab.apply(chroma, lab);
      };
    } else if (colors.length === 4) {
      ref2 = (function() {
        var len, o, results;
        results = [];
        for (o = 0, len = colors.length; o < len; o++) {
          c = colors[o];
          results.push(c.lab());
        }
        return results;
      })(), lab0 = ref2[0], lab1 = ref2[1], lab2 = ref2[2], lab3 = ref2[3];
      I = function(t) {
        var i, lab;
        lab = (function() {
          var o, results;
          results = [];
          for (i = o = 0; o <= 2; i = ++o) {
            results.push((1 - t) * (1 - t) * (1 - t) * lab0[i] + 3 * (1 - t) * (1 - t) * t * lab1[i] + 3 * (1 - t) * t * t * lab2[i] + t * t * t * lab3[i]);
          }
          return results;
        })();
        return chroma.lab.apply(chroma, lab);
      };
    } else if (colors.length === 5) {
      I0 = bezier(colors.slice(0, 3));
      I1 = bezier(colors.slice(2, 5));
      I = function(t) {
        if (t < 0.5) {
          return I0(t * 2);
        } else {
          return I1((t - 0.5) * 2);
        }
      };
    }
    return I;
  };

  chroma.bezier = function(colors) {
    var f;
    f = bezier(colors);
    f.scale = function() {
      return chroma.scale(f);
    };
    return f;
  };


  /*
      chroma.js
  
      Copyright (c) 2011-2013, Gregor Aisch
      All rights reserved.
  
      Redistribution and use in source and binary forms, with or without
      modification, are permitted provided that the following conditions are met:
  
      * Redistributions of source code must retain the above copyright notice, this
        list of conditions and the following disclaimer.
  
      * Redistributions in binary form must reproduce the above copyright notice,
        this list of conditions and the following disclaimer in the documentation
        and/or other materials provided with the distribution.
  
      * The name Gregor Aisch may not be used to endorse or promote products
        derived from this software without specific prior written permission.
  
      THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
      AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
      IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
      DISCLAIMED. IN NO EVENT SHALL GREGOR AISCH OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
      INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
      BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
      DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
      OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
      NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
      EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  
      @source: https://github.com/gka/chroma.js
   */

  chroma.cubehelix = function(start, rotations, hue, gamma, lightness) {
    var dh, dl, f;
    if (start == null) {
      start = 300;
    }
    if (rotations == null) {
      rotations = -1.5;
    }
    if (hue == null) {
      hue = 1;
    }
    if (gamma == null) {
      gamma = 1;
    }
    if (lightness == null) {
      lightness = [0, 1];
    }
    dh = 0;
    if (type(lightness) === 'array') {
      dl = lightness[1] - lightness[0];
    } else {
      dl = 0;
      lightness = [lightness, lightness];
    }
    f = function(fract) {
      var a, amp, b, cos_a, g, h, l, r, sin_a;
      a = TWOPI * ((start + 120) / 360 + rotations * fract);
      l = pow(lightness[0] + dl * fract, gamma);
      h = dh !== 0 ? hue[0] + fract * dh : hue;
      amp = h * l * (1 - l) / 2;
      cos_a = cos(a);
      sin_a = sin(a);
      r = l + amp * (-0.14861 * cos_a + 1.78277 * sin_a);
      g = l + amp * (-0.29227 * cos_a - 0.90649 * sin_a);
      b = l + amp * (+1.97294 * cos_a);
      return chroma(clip_rgb([r * 255, g * 255, b * 255]));
    };
    f.start = function(s) {
      if (s == null) {
        return start;
      }
      start = s;
      return f;
    };
    f.rotations = function(r) {
      if (r == null) {
        return rotations;
      }
      rotations = r;
      return f;
    };
    f.gamma = function(g) {
      if (g == null) {
        return gamma;
      }
      gamma = g;
      return f;
    };
    f.hue = function(h) {
      if (h == null) {
        return hue;
      }
      hue = h;
      if (type(hue) === 'array') {
        dh = hue[1] - hue[0];
        if (dh === 0) {
          hue = hue[1];
        }
      } else {
        dh = 0;
      }
      return f;
    };
    f.lightness = function(h) {
      if (h == null) {
        return lightness;
      }
      if (type(h) === 'array') {
        lightness = h;
        dl = h[1] - h[0];
      } else {
        lightness = [h, h];
        dl = 0;
      }
      return f;
    };
    f.scale = function() {
      return chroma.scale(f);
    };
    f.hue(hue);
    return f;
  };

  chroma.random = function() {
    var code, digits, i, o;
    digits = '0123456789abcdef';
    code = '#';
    for (i = o = 0; o < 6; i = ++o) {
      code += digits.charAt(floor(Math.random() * 16));
    }
    return new Color(code);
  };

  chroma.average = function(colors, mode) {
    var A, alpha, c, cnt, dx, dy, first, i, l, len, o, xyz, xyz2;
    if (mode == null) {
      mode = 'rgb';
    }
    l = colors.length;
    colors = colors.map(function(c) {
      return chroma(c);
    });
    first = colors.splice(0, 1)[0];
    xyz = first.get(mode);
    cnt = [];
    dx = 0;
    dy = 0;
    for (i in xyz) {
      xyz[i] = xyz[i] || 0;
      cnt.push(!isNaN(xyz[i]) ? 1 : 0);
      if (mode.charAt(i) === 'h' && !isNaN(xyz[i])) {
        A = xyz[i] / 180 * PI;
        dx += cos(A);
        dy += sin(A);
      }
    }
    alpha = first.alpha();
    for (o = 0, len = colors.length; o < len; o++) {
      c = colors[o];
      xyz2 = c.get(mode);
      alpha += c.alpha();
      for (i in xyz) {
        if (!isNaN(xyz2[i])) {
          xyz[i] += xyz2[i];
          cnt[i] += 1;
          if (mode.charAt(i) === 'h') {
            A = xyz[i] / 180 * PI;
            dx += cos(A);
            dy += sin(A);
          }
        }
      }
    }
    for (i in xyz) {
      xyz[i] = xyz[i] / cnt[i];
      if (mode.charAt(i) === 'h') {
        A = atan2(dy / cnt[i], dx / cnt[i]) / PI * 180;
        while (A < 0) {
          A += 360;
        }
        while (A >= 360) {
          A -= 360;
        }
        xyz[i] = A;
      }
    }
    return chroma(xyz, mode).alpha(alpha / l);
  };

  _input.rgb = function() {
    var k, ref, results, v;
    ref = unpack(arguments);
    results = [];
    for (k in ref) {
      v = ref[k];
      results.push(v);
    }
    return results;
  };

  chroma.rgb = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, slice.call(arguments).concat(['rgb']), function(){});
  };

  Color.prototype.rgb = function(round) {
    if (round == null) {
      round = true;
    }
    if (round) {
      return this._rgb.map(Math.round).slice(0, 3);
    } else {
      return this._rgb.slice(0, 3);
    }
  };

  Color.prototype.rgba = function(round) {
    if (round == null) {
      round = true;
    }
    if (!round) {
      return this._rgb.slice(0);
    }
    return [Math.round(this._rgb[0]), Math.round(this._rgb[1]), Math.round(this._rgb[2]), this._rgb[3]];
  };

  _guess_formats.push({
    p: 3,
    test: function(n) {
      var a;
      a = unpack(arguments);
      if (type(a) === 'array' && a.length === 3) {
        return 'rgb';
      }
      if (a.length === 4 && type(a[3]) === "number" && a[3] >= 0 && a[3] <= 1) {
        return 'rgb';
      }
    }
  });

  hex2rgb = function(hex) {
    var a, b, g, r, rgb, u;
    if (hex.match(/^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
      if (hex.length === 4 || hex.length === 7) {
        hex = hex.substr(1);
      }
      if (hex.length === 3) {
        hex = hex.split("");
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      u = parseInt(hex, 16);
      r = u >> 16;
      g = u >> 8 & 0xFF;
      b = u & 0xFF;
      return [r, g, b, 1];
    }
    if (hex.match(/^#?([A-Fa-f0-9]{8})$/)) {
      if (hex.length === 9) {
        hex = hex.substr(1);
      }
      u = parseInt(hex, 16);
      r = u >> 24 & 0xFF;
      g = u >> 16 & 0xFF;
      b = u >> 8 & 0xFF;
      a = round((u & 0xFF) / 0xFF * 100) / 100;
      return [r, g, b, a];
    }
    if ((_input.css != null) && (rgb = _input.css(hex))) {
      return rgb;
    }
    throw "unknown color: " + hex;
  };

  rgb2hex = function(channels, mode) {
    var a, b, g, hxa, r, str, u;
    if (mode == null) {
      mode = 'rgb';
    }
    r = channels[0], g = channels[1], b = channels[2], a = channels[3];
    r = Math.round(r);
    g = Math.round(g);
    b = Math.round(b);
    u = r << 16 | g << 8 | b;
    str = "000000" + u.toString(16);
    str = str.substr(str.length - 6);
    hxa = '0' + round(a * 255).toString(16);
    hxa = hxa.substr(hxa.length - 2);
    return "#" + (function() {
      switch (mode.toLowerCase()) {
        case 'rgba':
          return str + hxa;
        case 'argb':
          return hxa + str;
        default:
          return str;
      }
    })();
  };

  _input.hex = function(h) {
    return hex2rgb(h);
  };

  chroma.hex = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, slice.call(arguments).concat(['hex']), function(){});
  };

  Color.prototype.hex = function(mode) {
    if (mode == null) {
      mode = 'rgb';
    }
    return rgb2hex(this._rgb, mode);
  };

  _guess_formats.push({
    p: 4,
    test: function(n) {
      if (arguments.length === 1 && type(n) === "string") {
        return 'hex';
      }
    }
  });

  hsl2rgb = function() {
    var args, b, c, g, h, i, l, o, r, ref, s, t1, t2, t3;
    args = unpack(arguments);
    h = args[0], s = args[1], l = args[2];
    if (s === 0) {
      r = g = b = l * 255;
    } else {
      t3 = [0, 0, 0];
      c = [0, 0, 0];
      t2 = l < 0.5 ? l * (1 + s) : l + s - l * s;
      t1 = 2 * l - t2;
      h /= 360;
      t3[0] = h + 1 / 3;
      t3[1] = h;
      t3[2] = h - 1 / 3;
      for (i = o = 0; o <= 2; i = ++o) {
        if (t3[i] < 0) {
          t3[i] += 1;
        }
        if (t3[i] > 1) {
          t3[i] -= 1;
        }
        if (6 * t3[i] < 1) {
          c[i] = t1 + (t2 - t1) * 6 * t3[i];
        } else if (2 * t3[i] < 1) {
          c[i] = t2;
        } else if (3 * t3[i] < 2) {
          c[i] = t1 + (t2 - t1) * ((2 / 3) - t3[i]) * 6;
        } else {
          c[i] = t1;
        }
      }
      ref = [round(c[0] * 255), round(c[1] * 255), round(c[2] * 255)], r = ref[0], g = ref[1], b = ref[2];
    }
    if (args.length > 3) {
      return [r, g, b, args[3]];
    } else {
      return [r, g, b];
    }
  };

  rgb2hsl = function(r, g, b) {
    var h, l, min, ref, s;
    if (r !== void 0 && r.length >= 3) {
      ref = r, r = ref[0], g = ref[1], b = ref[2];
    }
    r /= 255;
    g /= 255;
    b /= 255;
    min = Math.min(r, g, b);
    max = Math.max(r, g, b);
    l = (max + min) / 2;
    if (max === min) {
      s = 0;
      h = Number.NaN;
    } else {
      s = l < 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min);
    }
    if (r === max) {
      h = (g - b) / (max - min);
    } else if (g === max) {
      h = 2 + (b - r) / (max - min);
    } else if (b === max) {
      h = 4 + (r - g) / (max - min);
    }
    h *= 60;
    if (h < 0) {
      h += 360;
    }
    return [h, s, l];
  };

  chroma.hsl = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, slice.call(arguments).concat(['hsl']), function(){});
  };

  _input.hsl = hsl2rgb;

  Color.prototype.hsl = function() {
    return rgb2hsl(this._rgb);
  };

  hsv2rgb = function() {
    var args, b, f, g, h, i, p, q, r, ref, ref1, ref2, ref3, ref4, ref5, s, t, v;
    args = unpack(arguments);
    h = args[0], s = args[1], v = args[2];
    v *= 255;
    if (s === 0) {
      r = g = b = v;
    } else {
      if (h === 360) {
        h = 0;
      }
      if (h > 360) {
        h -= 360;
      }
      if (h < 0) {
        h += 360;
      }
      h /= 60;
      i = floor(h);
      f = h - i;
      p = v * (1 - s);
      q = v * (1 - s * f);
      t = v * (1 - s * (1 - f));
      switch (i) {
        case 0:
          ref = [v, t, p], r = ref[0], g = ref[1], b = ref[2];
          break;
        case 1:
          ref1 = [q, v, p], r = ref1[0], g = ref1[1], b = ref1[2];
          break;
        case 2:
          ref2 = [p, v, t], r = ref2[0], g = ref2[1], b = ref2[2];
          break;
        case 3:
          ref3 = [p, q, v], r = ref3[0], g = ref3[1], b = ref3[2];
          break;
        case 4:
          ref4 = [t, p, v], r = ref4[0], g = ref4[1], b = ref4[2];
          break;
        case 5:
          ref5 = [v, p, q], r = ref5[0], g = ref5[1], b = ref5[2];
      }
    }
    return [r, g, b, args.length > 3 ? args[3] : 1];
  };

  rgb2hsv = function() {
    var b, delta, g, h, min, r, ref, s, v;
    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
    min = Math.min(r, g, b);
    max = Math.max(r, g, b);
    delta = max - min;
    v = max / 255.0;
    if (max === 0) {
      h = Number.NaN;
      s = 0;
    } else {
      s = delta / max;
      if (r === max) {
        h = (g - b) / delta;
      }
      if (g === max) {
        h = 2 + (b - r) / delta;
      }
      if (b === max) {
        h = 4 + (r - g) / delta;
      }
      h *= 60;
      if (h < 0) {
        h += 360;
      }
    }
    return [h, s, v];
  };

  chroma.hsv = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, slice.call(arguments).concat(['hsv']), function(){});
  };

  _input.hsv = hsv2rgb;

  Color.prototype.hsv = function() {
    return rgb2hsv(this._rgb);
  };

  num2rgb = function(num) {
    var b, g, r;
    if (type(num) === "number" && num >= 0 && num <= 0xFFFFFF) {
      r = num >> 16;
      g = (num >> 8) & 0xFF;
      b = num & 0xFF;
      return [r, g, b, 1];
    }
    console.warn("unknown num color: " + num);
    return [0, 0, 0, 1];
  };

  rgb2num = function() {
    var b, g, r, ref;
    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
    return (r << 16) + (g << 8) + b;
  };

  chroma.num = function(num) {
    return new Color(num, 'num');
  };

  Color.prototype.num = function(mode) {
    if (mode == null) {
      mode = 'rgb';
    }
    return rgb2num(this._rgb, mode);
  };

  _input.num = num2rgb;

  _guess_formats.push({
    p: 1,
    test: function(n) {
      if (arguments.length === 1 && type(n) === "number" && n >= 0 && n <= 0xFFFFFF) {
        return 'num';
      }
    }
  });

  hcg2rgb = function() {
    var _c, _g, args, b, c, f, g, h, i, p, q, r, ref, ref1, ref2, ref3, ref4, ref5, t, v;
    args = unpack(arguments);
    h = args[0], c = args[1], _g = args[2];
    c = c / 100;
    g = g / 100 * 255;
    _c = c * 255;
    if (c === 0) {
      r = g = b = _g;
    } else {
      if (h === 360) {
        h = 0;
      }
      if (h > 360) {
        h -= 360;
      }
      if (h < 0) {
        h += 360;
      }
      h /= 60;
      i = floor(h);
      f = h - i;
      p = _g * (1 - c);
      q = p + _c * (1 - f);
      t = p + _c * f;
      v = p + _c;
      switch (i) {
        case 0:
          ref = [v, t, p], r = ref[0], g = ref[1], b = ref[2];
          break;
        case 1:
          ref1 = [q, v, p], r = ref1[0], g = ref1[1], b = ref1[2];
          break;
        case 2:
          ref2 = [p, v, t], r = ref2[0], g = ref2[1], b = ref2[2];
          break;
        case 3:
          ref3 = [p, q, v], r = ref3[0], g = ref3[1], b = ref3[2];
          break;
        case 4:
          ref4 = [t, p, v], r = ref4[0], g = ref4[1], b = ref4[2];
          break;
        case 5:
          ref5 = [v, p, q], r = ref5[0], g = ref5[1], b = ref5[2];
      }
    }
    return [r, g, b, args.length > 3 ? args[3] : 1];
  };

  rgb2hcg = function() {
    var _g, b, c, delta, g, h, min, r, ref;
    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
    min = Math.min(r, g, b);
    max = Math.max(r, g, b);
    delta = max - min;
    c = delta * 100 / 255;
    _g = min / (255 - delta) * 100;
    if (delta === 0) {
      h = Number.NaN;
    } else {
      if (r === max) {
        h = (g - b) / delta;
      }
      if (g === max) {
        h = 2 + (b - r) / delta;
      }
      if (b === max) {
        h = 4 + (r - g) / delta;
      }
      h *= 60;
      if (h < 0) {
        h += 360;
      }
    }
    return [h, c, _g];
  };

  chroma.hcg = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, slice.call(arguments).concat(['hcg']), function(){});
  };

  _input.hcg = hcg2rgb;

  Color.prototype.hcg = function() {
    return rgb2hcg(this._rgb);
  };

  css2rgb = function(css) {
    var aa, ab, hsl, i, m, o, rgb, w;
    css = css.toLowerCase();
    if ((chroma.colors != null) && chroma.colors[css]) {
      return hex2rgb(chroma.colors[css]);
    }
    if (m = css.match(/rgb\(\s*(\-?\d+),\s*(\-?\d+)\s*,\s*(\-?\d+)\s*\)/)) {
      rgb = m.slice(1, 4);
      for (i = o = 0; o <= 2; i = ++o) {
        rgb[i] = +rgb[i];
      }
      rgb[3] = 1;
    } else if (m = css.match(/rgba\(\s*(\-?\d+),\s*(\-?\d+)\s*,\s*(\-?\d+)\s*,\s*([01]|[01]?\.\d+)\)/)) {
      rgb = m.slice(1, 5);
      for (i = w = 0; w <= 3; i = ++w) {
        rgb[i] = +rgb[i];
      }
    } else if (m = css.match(/rgb\(\s*(\-?\d+(?:\.\d+)?)%,\s*(\-?\d+(?:\.\d+)?)%\s*,\s*(\-?\d+(?:\.\d+)?)%\s*\)/)) {
      rgb = m.slice(1, 4);
      for (i = aa = 0; aa <= 2; i = ++aa) {
        rgb[i] = round(rgb[i] * 2.55);
      }
      rgb[3] = 1;
    } else if (m = css.match(/rgba\(\s*(\-?\d+(?:\.\d+)?)%,\s*(\-?\d+(?:\.\d+)?)%\s*,\s*(\-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)/)) {
      rgb = m.slice(1, 5);
      for (i = ab = 0; ab <= 2; i = ++ab) {
        rgb[i] = round(rgb[i] * 2.55);
      }
      rgb[3] = +rgb[3];
    } else if (m = css.match(/hsl\(\s*(\-?\d+(?:\.\d+)?),\s*(\-?\d+(?:\.\d+)?)%\s*,\s*(\-?\d+(?:\.\d+)?)%\s*\)/)) {
      hsl = m.slice(1, 4);
      hsl[1] *= 0.01;
      hsl[2] *= 0.01;
      rgb = hsl2rgb(hsl);
      rgb[3] = 1;
    } else if (m = css.match(/hsla\(\s*(\-?\d+(?:\.\d+)?),\s*(\-?\d+(?:\.\d+)?)%\s*,\s*(\-?\d+(?:\.\d+)?)%\s*,\s*([01]|[01]?\.\d+)\)/)) {
      hsl = m.slice(1, 4);
      hsl[1] *= 0.01;
      hsl[2] *= 0.01;
      rgb = hsl2rgb(hsl);
      rgb[3] = +m[4];
    }
    return rgb;
  };

  rgb2css = function(rgba) {
    var mode;
    mode = rgba[3] < 1 ? 'rgba' : 'rgb';
    if (mode === 'rgb') {
      return mode + '(' + rgba.slice(0, 3).map(round).join(',') + ')';
    } else if (mode === 'rgba') {
      return mode + '(' + rgba.slice(0, 3).map(round).join(',') + ',' + rgba[3] + ')';
    } else {

    }
  };

  rnd = function(a) {
    return round(a * 100) / 100;
  };

  hsl2css = function(hsl, alpha) {
    var mode;
    mode = alpha < 1 ? 'hsla' : 'hsl';
    hsl[0] = rnd(hsl[0] || 0);
    hsl[1] = rnd(hsl[1] * 100) + '%';
    hsl[2] = rnd(hsl[2] * 100) + '%';
    if (mode === 'hsla') {
      hsl[3] = alpha;
    }
    return mode + '(' + hsl.join(',') + ')';
  };

  _input.css = function(h) {
    return css2rgb(h);
  };

  chroma.css = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, slice.call(arguments).concat(['css']), function(){});
  };

  Color.prototype.css = function(mode) {
    if (mode == null) {
      mode = 'rgb';
    }
    if (mode.slice(0, 3) === 'rgb') {
      return rgb2css(this._rgb);
    } else if (mode.slice(0, 3) === 'hsl') {
      return hsl2css(this.hsl(), this.alpha());
    }
  };

  _input.named = function(name) {
    return hex2rgb(w3cx11[name]);
  };

  _guess_formats.push({
    p: 5,
    test: function(n) {
      if (arguments.length === 1 && (w3cx11[n] != null)) {
        return 'named';
      }
    }
  });

  Color.prototype.name = function(n) {
    var h, k;
    if (arguments.length) {
      if (w3cx11[n]) {
        this._rgb = hex2rgb(w3cx11[n]);
      }
      this._rgb[3] = 1;
      this;
    }
    h = this.hex();
    for (k in w3cx11) {
      if (h === w3cx11[k]) {
        return k;
      }
    }
    return h;
  };

  lch2lab = function() {

    /*
    Convert from a qualitative parameter h and a quantitative parameter l to a 24-bit pixel.
    These formulas were invented by David Dalrymple to obtain maximum contrast without going
    out of gamut if the parameters are in the range 0-1.
    
    A saturation multiplier was added by Gregor Aisch
     */
    var c, h, l, ref;
    ref = unpack(arguments), l = ref[0], c = ref[1], h = ref[2];
    h = h * DEG2RAD;
    return [l, cos(h) * c, sin(h) * c];
  };

  lch2rgb = function() {
    var L, a, args, b, c, g, h, l, r, ref, ref1;
    args = unpack(arguments);
    l = args[0], c = args[1], h = args[2];
    ref = lch2lab(l, c, h), L = ref[0], a = ref[1], b = ref[2];
    ref1 = lab2rgb(L, a, b), r = ref1[0], g = ref1[1], b = ref1[2];
    return [r, g, b, args.length > 3 ? args[3] : 1];
  };

  lab2lch = function() {
    var a, b, c, h, l, ref;
    ref = unpack(arguments), l = ref[0], a = ref[1], b = ref[2];
    c = sqrt(a * a + b * b);
    h = (atan2(b, a) * RAD2DEG + 360) % 360;
    if (round(c * 10000) === 0) {
      h = Number.NaN;
    }
    return [l, c, h];
  };

  rgb2lch = function() {
    var a, b, g, l, r, ref, ref1;
    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
    ref1 = rgb2lab(r, g, b), l = ref1[0], a = ref1[1], b = ref1[2];
    return lab2lch(l, a, b);
  };

  chroma.lch = function() {
    var args;
    args = unpack(arguments);
    return new Color(args, 'lch');
  };

  chroma.hcl = function() {
    var args;
    args = unpack(arguments);
    return new Color(args, 'hcl');
  };

  _input.lch = lch2rgb;

  _input.hcl = function() {
    var c, h, l, ref;
    ref = unpack(arguments), h = ref[0], c = ref[1], l = ref[2];
    return lch2rgb([l, c, h]);
  };

  Color.prototype.lch = function() {
    return rgb2lch(this._rgb);
  };

  Color.prototype.hcl = function() {
    return rgb2lch(this._rgb).reverse();
  };

  rgb2cmyk = function(mode) {
    var b, c, f, g, k, m, r, ref, y;
    if (mode == null) {
      mode = 'rgb';
    }
    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
    r = r / 255;
    g = g / 255;
    b = b / 255;
    k = 1 - Math.max(r, Math.max(g, b));
    f = k < 1 ? 1 / (1 - k) : 0;
    c = (1 - r - k) * f;
    m = (1 - g - k) * f;
    y = (1 - b - k) * f;
    return [c, m, y, k];
  };

  cmyk2rgb = function() {
    var alpha, args, b, c, g, k, m, r, y;
    args = unpack(arguments);
    c = args[0], m = args[1], y = args[2], k = args[3];
    alpha = args.length > 4 ? args[4] : 1;
    if (k === 1) {
      return [0, 0, 0, alpha];
    }
    r = c >= 1 ? 0 : 255 * (1 - c) * (1 - k);
    g = m >= 1 ? 0 : 255 * (1 - m) * (1 - k);
    b = y >= 1 ? 0 : 255 * (1 - y) * (1 - k);
    return [r, g, b, alpha];
  };

  _input.cmyk = function() {
    return cmyk2rgb(unpack(arguments));
  };

  chroma.cmyk = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, slice.call(arguments).concat(['cmyk']), function(){});
  };

  Color.prototype.cmyk = function() {
    return rgb2cmyk(this._rgb);
  };

  _input.gl = function() {
    var i, k, o, rgb, v;
    rgb = (function() {
      var ref, results;
      ref = unpack(arguments);
      results = [];
      for (k in ref) {
        v = ref[k];
        results.push(v);
      }
      return results;
    }).apply(this, arguments);
    for (i = o = 0; o <= 2; i = ++o) {
      rgb[i] *= 255;
    }
    return rgb;
  };

  chroma.gl = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, slice.call(arguments).concat(['gl']), function(){});
  };

  Color.prototype.gl = function() {
    var rgb;
    rgb = this._rgb;
    return [rgb[0] / 255, rgb[1] / 255, rgb[2] / 255, rgb[3]];
  };

  rgb2luminance = function(r, g, b) {
    var ref;
    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
    r = luminance_x(r);
    g = luminance_x(g);
    b = luminance_x(b);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  luminance_x = function(x) {
    x /= 255;
    if (x <= 0.03928) {
      return x / 12.92;
    } else {
      return pow((x + 0.055) / 1.055, 2.4);
    }
  };

  _interpolators = [];

  interpolate = function(col1, col2, f, m) {
    var interpol, len, o, res;
    if (f == null) {
      f = 0.5;
    }
    if (m == null) {
      m = 'rgb';
    }

    /*
    interpolates between colors
    f = 0 --> me
    f = 1 --> col
     */
    if (type(col1) !== 'object') {
      col1 = chroma(col1);
    }
    if (type(col2) !== 'object') {
      col2 = chroma(col2);
    }
    for (o = 0, len = _interpolators.length; o < len; o++) {
      interpol = _interpolators[o];
      if (m === interpol[0]) {
        res = interpol[1](col1, col2, f, m);
        break;
      }
    }
    if (res == null) {
      throw "color mode " + m + " is not supported";
    }
    return res.alpha(col1.alpha() + f * (col2.alpha() - col1.alpha()));
  };

  chroma.interpolate = interpolate;

  Color.prototype.interpolate = function(col2, f, m) {
    return interpolate(this, col2, f, m);
  };

  chroma.mix = interpolate;

  Color.prototype.mix = Color.prototype.interpolate;

  interpolate_rgb = function(col1, col2, f, m) {
    var xyz0, xyz1;
    xyz0 = col1._rgb;
    xyz1 = col2._rgb;
    return new Color(xyz0[0] + f * (xyz1[0] - xyz0[0]), xyz0[1] + f * (xyz1[1] - xyz0[1]), xyz0[2] + f * (xyz1[2] - xyz0[2]), m);
  };

  _interpolators.push(['rgb', interpolate_rgb]);

  Color.prototype.luminance = function(lum, mode) {
    var cur_lum, eps, max_iter, test;
    if (mode == null) {
      mode = 'rgb';
    }
    if (!arguments.length) {
      return rgb2luminance(this._rgb);
    }
    if (lum === 0) {
      this._rgb = [0, 0, 0, this._rgb[3]];
    } else if (lum === 1) {
      this._rgb = [255, 255, 255, this._rgb[3]];
    } else {
      eps = 1e-7;
      max_iter = 20;
      test = function(l, h) {
        var lm, m;
        m = l.interpolate(h, 0.5, mode);
        lm = m.luminance();
        if (Math.abs(lum - lm) < eps || !max_iter--) {
          return m;
        }
        if (lm > lum) {
          return test(l, m);
        }
        return test(m, h);
      };
      cur_lum = rgb2luminance(this._rgb);
      this._rgb = (cur_lum > lum ? test(chroma('black'), this) : test(this, chroma('white'))).rgba();
    }
    return this;
  };

  temperature2rgb = function(kelvin) {
    var b, g, r, temp;
    temp = kelvin / 100;
    if (temp < 66) {
      r = 255;
      g = -155.25485562709179 - 0.44596950469579133 * (g = temp - 2) + 104.49216199393888 * log(g);
      b = temp < 20 ? 0 : -254.76935184120902 + 0.8274096064007395 * (b = temp - 10) + 115.67994401066147 * log(b);
    } else {
      r = 351.97690566805693 + 0.114206453784165 * (r = temp - 55) - 40.25366309332127 * log(r);
      g = 325.4494125711974 + 0.07943456536662342 * (g = temp - 50) - 28.0852963507957 * log(g);
      b = 255;
    }
    return [r, g, b];
  };

  rgb2temperature = function() {
    var b, eps, g, maxTemp, minTemp, r, ref, rgb, temp;
    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
    minTemp = 1000;
    maxTemp = 40000;
    eps = 0.4;
    while (maxTemp - minTemp > eps) {
      temp = (maxTemp + minTemp) * 0.5;
      rgb = temperature2rgb(temp);
      if ((rgb[2] / rgb[0]) >= (b / r)) {
        maxTemp = temp;
      } else {
        minTemp = temp;
      }
    }
    return round(temp);
  };

  chroma.temperature = chroma.kelvin = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, slice.call(arguments).concat(['temperature']), function(){});
  };

  _input.temperature = _input.kelvin = _input.K = temperature2rgb;

  Color.prototype.temperature = function() {
    return rgb2temperature(this._rgb);
  };

  Color.prototype.kelvin = Color.prototype.temperature;

  chroma.contrast = function(a, b) {
    var l1, l2, ref, ref1;
    if ((ref = type(a)) === 'string' || ref === 'number') {
      a = new Color(a);
    }
    if ((ref1 = type(b)) === 'string' || ref1 === 'number') {
      b = new Color(b);
    }
    l1 = a.luminance();
    l2 = b.luminance();
    if (l1 > l2) {
      return (l1 + 0.05) / (l2 + 0.05);
    } else {
      return (l2 + 0.05) / (l1 + 0.05);
    }
  };

  chroma.distance = function(a, b, mode) {
    var d, i, l1, l2, ref, ref1, sum_sq;
    if (mode == null) {
      mode = 'lab';
    }
    if ((ref = type(a)) === 'string' || ref === 'number') {
      a = new Color(a);
    }
    if ((ref1 = type(b)) === 'string' || ref1 === 'number') {
      b = new Color(b);
    }
    l1 = a.get(mode);
    l2 = b.get(mode);
    sum_sq = 0;
    for (i in l1) {
      d = (l1[i] || 0) - (l2[i] || 0);
      sum_sq += d * d;
    }
    return Math.sqrt(sum_sq);
  };

  chroma.deltaE = function(a, b, L, C) {
    var L1, L2, a1, a2, b1, b2, c1, c2, c4, dH2, delA, delB, delC, delL, f, h1, ref, ref1, ref2, ref3, sc, sh, sl, t, v1, v2, v3;
    if (L == null) {
      L = 1;
    }
    if (C == null) {
      C = 1;
    }
    if ((ref = type(a)) === 'string' || ref === 'number') {
      a = new Color(a);
    }
    if ((ref1 = type(b)) === 'string' || ref1 === 'number') {
      b = new Color(b);
    }
    ref2 = a.lab(), L1 = ref2[0], a1 = ref2[1], b1 = ref2[2];
    ref3 = b.lab(), L2 = ref3[0], a2 = ref3[1], b2 = ref3[2];
    c1 = sqrt(a1 * a1 + b1 * b1);
    c2 = sqrt(a2 * a2 + b2 * b2);
    sl = L1 < 16.0 ? 0.511 : (0.040975 * L1) / (1.0 + 0.01765 * L1);
    sc = (0.0638 * c1) / (1.0 + 0.0131 * c1) + 0.638;
    h1 = c1 < 0.000001 ? 0.0 : (atan2(b1, a1) * 180.0) / PI;
    while (h1 < 0) {
      h1 += 360;
    }
    while (h1 >= 360) {
      h1 -= 360;
    }
    t = (h1 >= 164.0) && (h1 <= 345.0) ? 0.56 + abs(0.2 * cos((PI * (h1 + 168.0)) / 180.0)) : 0.36 + abs(0.4 * cos((PI * (h1 + 35.0)) / 180.0));
    c4 = c1 * c1 * c1 * c1;
    f = sqrt(c4 / (c4 + 1900.0));
    sh = sc * (f * t + 1.0 - f);
    delL = L1 - L2;
    delC = c1 - c2;
    delA = a1 - a2;
    delB = b1 - b2;
    dH2 = delA * delA + delB * delB - delC * delC;
    v1 = delL / (L * sl);
    v2 = delC / (C * sc);
    v3 = sh;
    return sqrt(v1 * v1 + v2 * v2 + (dH2 / (v3 * v3)));
  };

  Color.prototype.get = function(modechan) {
    var channel, i, me, mode, ref, src;
    me = this;
    ref = modechan.split('.'), mode = ref[0], channel = ref[1];
    src = me[mode]();
    if (channel) {
      i = mode.indexOf(channel);
      if (i > -1) {
        return src[i];
      } else {
        return console.warn('unknown channel ' + channel + ' in mode ' + mode);
      }
    } else {
      return src;
    }
  };

  Color.prototype.set = function(modechan, value) {
    var channel, i, me, mode, ref, src;
    me = this;
    ref = modechan.split('.'), mode = ref[0], channel = ref[1];
    if (channel) {
      src = me[mode]();
      i = mode.indexOf(channel);
      if (i > -1) {
        if (type(value) === 'string') {
          switch (value.charAt(0)) {
            case '+':
              src[i] += +value;
              break;
            case '-':
              src[i] += +value;
              break;
            case '*':
              src[i] *= +(value.substr(1));
              break;
            case '/':
              src[i] /= +(value.substr(1));
              break;
            default:
              src[i] = +value;
          }
        } else {
          src[i] = value;
        }
      } else {
        console.warn('unknown channel ' + channel + ' in mode ' + mode);
      }
    } else {
      src = value;
    }
    return chroma(src, mode).alpha(me.alpha());
  };

  Color.prototype.clipped = function() {
    return this._rgb._clipped || false;
  };

  Color.prototype.alpha = function(a) {
    if (arguments.length) {
      return chroma.rgb([this._rgb[0], this._rgb[1], this._rgb[2], a]);
    }
    return this._rgb[3];
  };

  Color.prototype.darken = function(amount) {
    var lab, me;
    if (amount == null) {
      amount = 1;
    }
    me = this;
    lab = me.lab();
    lab[0] -= LAB_CONSTANTS.Kn * amount;
    return chroma.lab(lab).alpha(me.alpha());
  };

  Color.prototype.brighten = function(amount) {
    if (amount == null) {
      amount = 1;
    }
    return this.darken(-amount);
  };

  Color.prototype.darker = Color.prototype.darken;

  Color.prototype.brighter = Color.prototype.brighten;

  Color.prototype.saturate = function(amount) {
    var lch, me;
    if (amount == null) {
      amount = 1;
    }
    me = this;
    lch = me.lch();
    lch[1] += amount * LAB_CONSTANTS.Kn;
    if (lch[1] < 0) {
      lch[1] = 0;
    }
    return chroma.lch(lch).alpha(me.alpha());
  };

  Color.prototype.desaturate = function(amount) {
    if (amount == null) {
      amount = 1;
    }
    return this.saturate(-amount);
  };

  Color.prototype.premultiply = function() {
    var a, rgb;
    rgb = this.rgb();
    a = this.alpha();
    return chroma(rgb[0] * a, rgb[1] * a, rgb[2] * a, a);
  };

  blend = function(bottom, top, mode) {
    if (!blend[mode]) {
      throw 'unknown blend mode ' + mode;
    }
    return blend[mode](bottom, top);
  };

  blend_f = function(f) {
    return function(bottom, top) {
      var c0, c1;
      c0 = chroma(top).rgb();
      c1 = chroma(bottom).rgb();
      return chroma(f(c0, c1), 'rgb');
    };
  };

  each = function(f) {
    return function(c0, c1) {
      var i, o, out;
      out = [];
      for (i = o = 0; o <= 3; i = ++o) {
        out[i] = f(c0[i], c1[i]);
      }
      return out;
    };
  };

  normal = function(a, b) {
    return a;
  };

  multiply = function(a, b) {
    return a * b / 255;
  };

  darken = function(a, b) {
    if (a > b) {
      return b;
    } else {
      return a;
    }
  };

  lighten = function(a, b) {
    if (a > b) {
      return a;
    } else {
      return b;
    }
  };

  screen = function(a, b) {
    return 255 * (1 - (1 - a / 255) * (1 - b / 255));
  };

  overlay = function(a, b) {
    if (b < 128) {
      return 2 * a * b / 255;
    } else {
      return 255 * (1 - 2 * (1 - a / 255) * (1 - b / 255));
    }
  };

  burn = function(a, b) {
    return 255 * (1 - (1 - b / 255) / (a / 255));
  };

  dodge = function(a, b) {
    if (a === 255) {
      return 255;
    }
    a = 255 * (b / 255) / (1 - a / 255);
    if (a > 255) {
      return 255;
    } else {
      return a;
    }
  };

  blend.normal = blend_f(each(normal));

  blend.multiply = blend_f(each(multiply));

  blend.screen = blend_f(each(screen));

  blend.overlay = blend_f(each(overlay));

  blend.darken = blend_f(each(darken));

  blend.lighten = blend_f(each(lighten));

  blend.dodge = blend_f(each(dodge));

  blend.burn = blend_f(each(burn));

  chroma.blend = blend;

  chroma.analyze = function(data) {
    var len, o, r, val;
    r = {
      min: Number.MAX_VALUE,
      max: Number.MAX_VALUE * -1,
      sum: 0,
      values: [],
      count: 0
    };
    for (o = 0, len = data.length; o < len; o++) {
      val = data[o];
      if ((val != null) && !isNaN(val)) {
        r.values.push(val);
        r.sum += val;
        if (val < r.min) {
          r.min = val;
        }
        if (val > r.max) {
          r.max = val;
        }
        r.count += 1;
      }
    }
    r.domain = [r.min, r.max];
    r.limits = function(mode, num) {
      return chroma.limits(r, mode, num);
    };
    return r;
  };

  chroma.scale = function(colors, positions) {
    var _classes, _colorCache, _colors, _correctLightness, _domain, _fixed, _max, _min, _mode, _nacol, _out, _padding, _pos, _spread, _useCache, classifyValue, f, getClass, getColor, resetCache, setColors, tmap;
    _mode = 'rgb';
    _nacol = chroma('#ccc');
    _spread = 0;
    _fixed = false;
    _domain = [0, 1];
    _pos = [];
    _padding = [0, 0];
    _classes = false;
    _colors = [];
    _out = false;
    _min = 0;
    _max = 1;
    _correctLightness = false;
    _colorCache = {};
    _useCache = true;
    setColors = function(colors) {
      var c, col, o, ref, ref1, w;
      if (colors == null) {
        colors = ['#fff', '#000'];
      }
      if ((colors != null) && type(colors) === 'string' && (chroma.brewer != null)) {
        colors = chroma.brewer[colors] || chroma.brewer[colors.toLowerCase()] || colors;
      }
      if (type(colors) === 'array') {
        colors = colors.slice(0);
        for (c = o = 0, ref = colors.length - 1; 0 <= ref ? o <= ref : o >= ref; c = 0 <= ref ? ++o : --o) {
          col = colors[c];
          if (type(col) === "string") {
            colors[c] = chroma(col);
          }
        }
        _pos.length = 0;
        for (c = w = 0, ref1 = colors.length - 1; 0 <= ref1 ? w <= ref1 : w >= ref1; c = 0 <= ref1 ? ++w : --w) {
          _pos.push(c / (colors.length - 1));
        }
      }
      resetCache();
      return _colors = colors;
    };
    getClass = function(value) {
      var i, n;
      if (_classes != null) {
        n = _classes.length - 1;
        i = 0;
        while (i < n && value >= _classes[i]) {
          i++;
        }
        return i - 1;
      }
      return 0;
    };
    tmap = function(t) {
      return t;
    };
    classifyValue = function(value) {
      var i, maxc, minc, n, val;
      val = value;
      if (_classes.length > 2) {
        n = _classes.length - 1;
        i = getClass(value);
        minc = _classes[0] + (_classes[1] - _classes[0]) * (0 + _spread * 0.5);
        maxc = _classes[n - 1] + (_classes[n] - _classes[n - 1]) * (1 - _spread * 0.5);
        val = _min + ((_classes[i] + (_classes[i + 1] - _classes[i]) * 0.5 - minc) / (maxc - minc)) * (_max - _min);
      }
      return val;
    };
    getColor = function(val, bypassMap) {
      var c, col, i, k, o, p, ref, t;
      if (bypassMap == null) {
        bypassMap = false;
      }
      if (isNaN(val)) {
        return _nacol;
      }
      if (!bypassMap) {
        if (_classes && _classes.length > 2) {
          c = getClass(val);
          t = c / (_classes.length - 2);
          t = _padding[0] + (t * (1 - _padding[0] - _padding[1]));
        } else if (_max !== _min) {
          t = (val - _min) / (_max - _min);
          t = _padding[0] + (t * (1 - _padding[0] - _padding[1]));
          t = Math.min(1, Math.max(0, t));
        } else {
          t = 1;
        }
      } else {
        t = val;
      }
      if (!bypassMap) {
        t = tmap(t);
      }
      k = Math.floor(t * 10000);
      if (_useCache && _colorCache[k]) {
        col = _colorCache[k];
      } else {
        if (type(_colors) === 'array') {
          for (i = o = 0, ref = _pos.length - 1; 0 <= ref ? o <= ref : o >= ref; i = 0 <= ref ? ++o : --o) {
            p = _pos[i];
            if (t <= p) {
              col = _colors[i];
              break;
            }
            if (t >= p && i === _pos.length - 1) {
              col = _colors[i];
              break;
            }
            if (t > p && t < _pos[i + 1]) {
              t = (t - p) / (_pos[i + 1] - p);
              col = chroma.interpolate(_colors[i], _colors[i + 1], t, _mode);
              break;
            }
          }
        } else if (type(_colors) === 'function') {
          col = _colors(t);
        }
        if (_useCache) {
          _colorCache[k] = col;
        }
      }
      return col;
    };
    resetCache = function() {
      return _colorCache = {};
    };
    setColors(colors);
    f = function(v) {
      var c;
      c = chroma(getColor(v));
      if (_out && c[_out]) {
        return c[_out]();
      } else {
        return c;
      }
    };
    f.classes = function(classes) {
      var d;
      if (classes != null) {
        if (type(classes) === 'array') {
          _classes = classes;
          _domain = [classes[0], classes[classes.length - 1]];
        } else {
          d = chroma.analyze(_domain);
          if (classes === 0) {
            _classes = [d.min, d.max];
          } else {
            _classes = chroma.limits(d, 'e', classes);
          }
        }
        return f;
      }
      return _classes;
    };
    f.domain = function(domain) {
      var c, d, k, len, o, ref, w;
      if (!arguments.length) {
        return _domain;
      }
      _min = domain[0];
      _max = domain[domain.length - 1];
      _pos = [];
      k = _colors.length;
      if (domain.length === k && _min !== _max) {
        for (o = 0, len = domain.length; o < len; o++) {
          d = domain[o];
          _pos.push((d - _min) / (_max - _min));
        }
      } else {
        for (c = w = 0, ref = k - 1; 0 <= ref ? w <= ref : w >= ref; c = 0 <= ref ? ++w : --w) {
          _pos.push(c / (k - 1));
        }
      }
      _domain = [_min, _max];
      return f;
    };
    f.mode = function(_m) {
      if (!arguments.length) {
        return _mode;
      }
      _mode = _m;
      resetCache();
      return f;
    };
    f.range = function(colors, _pos) {
      setColors(colors, _pos);
      return f;
    };
    f.out = function(_o) {
      _out = _o;
      return f;
    };
    f.spread = function(val) {
      if (!arguments.length) {
        return _spread;
      }
      _spread = val;
      return f;
    };
    f.correctLightness = function(v) {
      if (v == null) {
        v = true;
      }
      _correctLightness = v;
      resetCache();
      if (_correctLightness) {
        tmap = function(t) {
          var L0, L1, L_actual, L_diff, L_ideal, max_iter, pol, t0, t1;
          L0 = getColor(0, true).lab()[0];
          L1 = getColor(1, true).lab()[0];
          pol = L0 > L1;
          L_actual = getColor(t, true).lab()[0];
          L_ideal = L0 + (L1 - L0) * t;
          L_diff = L_actual - L_ideal;
          t0 = 0;
          t1 = 1;
          max_iter = 20;
          while (Math.abs(L_diff) > 1e-2 && max_iter-- > 0) {
            (function() {
              if (pol) {
                L_diff *= -1;
              }
              if (L_diff < 0) {
                t0 = t;
                t += (t1 - t) * 0.5;
              } else {
                t1 = t;
                t += (t0 - t) * 0.5;
              }
              L_actual = getColor(t, true).lab()[0];
              return L_diff = L_actual - L_ideal;
            })();
          }
          return t;
        };
      } else {
        tmap = function(t) {
          return t;
        };
      }
      return f;
    };
    f.padding = function(p) {
      if (p != null) {
        if (type(p) === 'number') {
          p = [p, p];
        }
        _padding = p;
        return f;
      } else {
        return _padding;
      }
    };
    f.colors = function(numColors, out) {
      var dd, dm, i, o, ref, results, samples, w;
      if (out == null) {
        out = 'hex';
      }
      if (arguments.length === 0) {
        return _colors.map(function(c) {
          return c[out]();
        });
      }
      if (numColors) {
        if (numColors === 1) {
          return f(0.5)[out]();
        }
        dm = _domain[0];
        dd = _domain[1] - dm;
        return (function() {
          results = [];
          for (var o = 0; 0 <= numColors ? o < numColors : o > numColors; 0 <= numColors ? o++ : o--){ results.push(o); }
          return results;
        }).apply(this).map(function(i) {
          return f(dm + i / (numColors - 1) * dd)[out]();
        });
      }
      colors = [];
      samples = [];
      if (_classes && _classes.length > 2) {
        for (i = w = 1, ref = _classes.length; 1 <= ref ? w < ref : w > ref; i = 1 <= ref ? ++w : --w) {
          samples.push((_classes[i - 1] + _classes[i]) * 0.5);
        }
      } else {
        samples = _domain;
      }
      return samples.map(function(v) {
        return f(v)[out]();
      });
    };
    f.cache = function(c) {
      if (c != null) {
        return _useCache = c;
      } else {
        return _useCache;
      }
    };
    return f;
  };

  if (chroma.scales == null) {
    chroma.scales = {};
  }

  chroma.scales.cool = function() {
    return chroma.scale([chroma.hsl(180, 1, .9), chroma.hsl(250, .7, .4)]);
  };

  chroma.scales.hot = function() {
    return chroma.scale(['#000', '#f00', '#ff0', '#fff'], [0, .25, .75, 1]).mode('rgb');
  };

  chroma.analyze = function(data, key, filter) {
    var add, k, len, o, r, val, visit;
    r = {
      min: Number.MAX_VALUE,
      max: Number.MAX_VALUE * -1,
      sum: 0,
      values: [],
      count: 0
    };
    if (filter == null) {
      filter = function() {
        return true;
      };
    }
    add = function(val) {
      if ((val != null) && !isNaN(val)) {
        r.values.push(val);
        r.sum += val;
        if (val < r.min) {
          r.min = val;
        }
        if (val > r.max) {
          r.max = val;
        }
        r.count += 1;
      }
    };
    visit = function(val, k) {
      if (filter(val, k)) {
        if ((key != null) && type(key) === 'function') {
          return add(key(val));
        } else if ((key != null) && type(key) === 'string' || type(key) === 'number') {
          return add(val[key]);
        } else {
          return add(val);
        }
      }
    };
    if (type(data) === 'array') {
      for (o = 0, len = data.length; o < len; o++) {
        val = data[o];
        visit(val);
      }
    } else {
      for (k in data) {
        val = data[k];
        visit(val, k);
      }
    }
    r.domain = [r.min, r.max];
    r.limits = function(mode, num) {
      return chroma.limits(r, mode, num);
    };
    return r;
  };

  chroma.limits = function(data, mode, num) {
    var aa, ab, ac, ad, ae, af, ag, ah, ai, aj, ak, al, am, assignments, best, centroids, cluster, clusterSizes, dist, i, j, kClusters, limits, max_log, min, min_log, mindist, n, nb_iters, newCentroids, o, p, pb, pr, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref2, ref3, ref4, ref5, ref6, ref7, ref8, ref9, repeat, sum, tmpKMeansBreaks, v, value, values, w;
    if (mode == null) {
      mode = 'equal';
    }
    if (num == null) {
      num = 7;
    }
    if (type(data) === 'array') {
      data = chroma.analyze(data);
    }
    min = data.min;
    max = data.max;
    sum = data.sum;
    values = data.values.sort(function(a, b) {
      return a - b;
    });
    if (num === 1) {
      return [min, max];
    }
    limits = [];
    if (mode.substr(0, 1) === 'c') {
      limits.push(min);
      limits.push(max);
    }
    if (mode.substr(0, 1) === 'e') {
      limits.push(min);
      for (i = o = 1, ref = num - 1; 1 <= ref ? o <= ref : o >= ref; i = 1 <= ref ? ++o : --o) {
        limits.push(min + (i / num) * (max - min));
      }
      limits.push(max);
    } else if (mode.substr(0, 1) === 'l') {
      if (min <= 0) {
        throw 'Logarithmic scales are only possible for values > 0';
      }
      min_log = Math.LOG10E * log(min);
      max_log = Math.LOG10E * log(max);
      limits.push(min);
      for (i = w = 1, ref1 = num - 1; 1 <= ref1 ? w <= ref1 : w >= ref1; i = 1 <= ref1 ? ++w : --w) {
        limits.push(pow(10, min_log + (i / num) * (max_log - min_log)));
      }
      limits.push(max);
    } else if (mode.substr(0, 1) === 'q') {
      limits.push(min);
      for (i = aa = 1, ref2 = num - 1; 1 <= ref2 ? aa <= ref2 : aa >= ref2; i = 1 <= ref2 ? ++aa : --aa) {
        p = (values.length - 1) * i / num;
        pb = floor(p);
        if (pb === p) {
          limits.push(values[pb]);
        } else {
          pr = p - pb;
          limits.push(values[pb] * (1 - pr) + values[pb + 1] * pr);
        }
      }
      limits.push(max);
    } else if (mode.substr(0, 1) === 'k') {

      /*
      implementation based on
      http://code.google.com/p/figue/source/browse/trunk/figue.js#336
      simplified for 1-d input values
       */
      n = values.length;
      assignments = new Array(n);
      clusterSizes = new Array(num);
      repeat = true;
      nb_iters = 0;
      centroids = null;
      centroids = [];
      centroids.push(min);
      for (i = ab = 1, ref3 = num - 1; 1 <= ref3 ? ab <= ref3 : ab >= ref3; i = 1 <= ref3 ? ++ab : --ab) {
        centroids.push(min + (i / num) * (max - min));
      }
      centroids.push(max);
      while (repeat) {
        for (j = ac = 0, ref4 = num - 1; 0 <= ref4 ? ac <= ref4 : ac >= ref4; j = 0 <= ref4 ? ++ac : --ac) {
          clusterSizes[j] = 0;
        }
        for (i = ad = 0, ref5 = n - 1; 0 <= ref5 ? ad <= ref5 : ad >= ref5; i = 0 <= ref5 ? ++ad : --ad) {
          value = values[i];
          mindist = Number.MAX_VALUE;
          for (j = ae = 0, ref6 = num - 1; 0 <= ref6 ? ae <= ref6 : ae >= ref6; j = 0 <= ref6 ? ++ae : --ae) {
            dist = abs(centroids[j] - value);
            if (dist < mindist) {
              mindist = dist;
              best = j;
            }
          }
          clusterSizes[best]++;
          assignments[i] = best;
        }
        newCentroids = new Array(num);
        for (j = af = 0, ref7 = num - 1; 0 <= ref7 ? af <= ref7 : af >= ref7; j = 0 <= ref7 ? ++af : --af) {
          newCentroids[j] = null;
        }
        for (i = ag = 0, ref8 = n - 1; 0 <= ref8 ? ag <= ref8 : ag >= ref8; i = 0 <= ref8 ? ++ag : --ag) {
          cluster = assignments[i];
          if (newCentroids[cluster] === null) {
            newCentroids[cluster] = values[i];
          } else {
            newCentroids[cluster] += values[i];
          }
        }
        for (j = ah = 0, ref9 = num - 1; 0 <= ref9 ? ah <= ref9 : ah >= ref9; j = 0 <= ref9 ? ++ah : --ah) {
          newCentroids[j] *= 1 / clusterSizes[j];
        }
        repeat = false;
        for (j = ai = 0, ref10 = num - 1; 0 <= ref10 ? ai <= ref10 : ai >= ref10; j = 0 <= ref10 ? ++ai : --ai) {
          if (newCentroids[j] !== centroids[i]) {
            repeat = true;
            break;
          }
        }
        centroids = newCentroids;
        nb_iters++;
        if (nb_iters > 200) {
          repeat = false;
        }
      }
      kClusters = {};
      for (j = aj = 0, ref11 = num - 1; 0 <= ref11 ? aj <= ref11 : aj >= ref11; j = 0 <= ref11 ? ++aj : --aj) {
        kClusters[j] = [];
      }
      for (i = ak = 0, ref12 = n - 1; 0 <= ref12 ? ak <= ref12 : ak >= ref12; i = 0 <= ref12 ? ++ak : --ak) {
        cluster = assignments[i];
        kClusters[cluster].push(values[i]);
      }
      tmpKMeansBreaks = [];
      for (j = al = 0, ref13 = num - 1; 0 <= ref13 ? al <= ref13 : al >= ref13; j = 0 <= ref13 ? ++al : --al) {
        tmpKMeansBreaks.push(kClusters[j][0]);
        tmpKMeansBreaks.push(kClusters[j][kClusters[j].length - 1]);
      }
      tmpKMeansBreaks = tmpKMeansBreaks.sort(function(a, b) {
        return a - b;
      });
      limits.push(tmpKMeansBreaks[0]);
      for (i = am = 1, ref14 = tmpKMeansBreaks.length - 1; am <= ref14; i = am += 2) {
        v = tmpKMeansBreaks[i];
        if (!isNaN(v) && limits.indexOf(v) === -1) {
          limits.push(v);
        }
      }
    }
    return limits;
  };

  hsi2rgb = function(h, s, i) {

    /*
    borrowed from here:
    http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/hsi2rgb.cpp
     */
    var args, b, g, r;
    args = unpack(arguments);
    h = args[0], s = args[1], i = args[2];
    if (isNaN(h)) {
      h = 0;
    }
    h /= 360;
    if (h < 1 / 3) {
      b = (1 - s) / 3;
      r = (1 + s * cos(TWOPI * h) / cos(PITHIRD - TWOPI * h)) / 3;
      g = 1 - (b + r);
    } else if (h < 2 / 3) {
      h -= 1 / 3;
      r = (1 - s) / 3;
      g = (1 + s * cos(TWOPI * h) / cos(PITHIRD - TWOPI * h)) / 3;
      b = 1 - (r + g);
    } else {
      h -= 2 / 3;
      g = (1 - s) / 3;
      b = (1 + s * cos(TWOPI * h) / cos(PITHIRD - TWOPI * h)) / 3;
      r = 1 - (g + b);
    }
    r = limit(i * r * 3);
    g = limit(i * g * 3);
    b = limit(i * b * 3);
    return [r * 255, g * 255, b * 255, args.length > 3 ? args[3] : 1];
  };

  rgb2hsi = function() {

    /*
    borrowed from here:
    http://hummer.stanford.edu/museinfo/doc/examples/humdrum/keyscape2/rgb2hsi.cpp
     */
    var b, g, h, i, min, r, ref, s;
    ref = unpack(arguments), r = ref[0], g = ref[1], b = ref[2];
    TWOPI = Math.PI * 2;
    r /= 255;
    g /= 255;
    b /= 255;
    min = Math.min(r, g, b);
    i = (r + g + b) / 3;
    s = 1 - min / i;
    if (s === 0) {
      h = 0;
    } else {
      h = ((r - g) + (r - b)) / 2;
      h /= Math.sqrt((r - g) * (r - g) + (r - b) * (g - b));
      h = Math.acos(h);
      if (b > g) {
        h = TWOPI - h;
      }
      h /= TWOPI;
    }
    return [h * 360, s, i];
  };

  chroma.hsi = function() {
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(Color, slice.call(arguments).concat(['hsi']), function(){});
  };

  _input.hsi = hsi2rgb;

  Color.prototype.hsi = function() {
    return rgb2hsi(this._rgb);
  };

  interpolate_hsx = function(col1, col2, f, m) {
    var dh, hue, hue0, hue1, lbv, lbv0, lbv1, res, sat, sat0, sat1, xyz0, xyz1;
    if (m === 'hsl') {
      xyz0 = col1.hsl();
      xyz1 = col2.hsl();
    } else if (m === 'hsv') {
      xyz0 = col1.hsv();
      xyz1 = col2.hsv();
    } else if (m === 'hcg') {
      xyz0 = col1.hcg();
      xyz1 = col2.hcg();
    } else if (m === 'hsi') {
      xyz0 = col1.hsi();
      xyz1 = col2.hsi();
    } else if (m === 'lch' || m === 'hcl') {
      m = 'hcl';
      xyz0 = col1.hcl();
      xyz1 = col2.hcl();
    }
    if (m.substr(0, 1) === 'h') {
      hue0 = xyz0[0], sat0 = xyz0[1], lbv0 = xyz0[2];
      hue1 = xyz1[0], sat1 = xyz1[1], lbv1 = xyz1[2];
    }
    if (!isNaN(hue0) && !isNaN(hue1)) {
      if (hue1 > hue0 && hue1 - hue0 > 180) {
        dh = hue1 - (hue0 + 360);
      } else if (hue1 < hue0 && hue0 - hue1 > 180) {
        dh = hue1 + 360 - hue0;
      } else {
        dh = hue1 - hue0;
      }
      hue = hue0 + f * dh;
    } else if (!isNaN(hue0)) {
      hue = hue0;
      if ((lbv1 === 1 || lbv1 === 0) && m !== 'hsv') {
        sat = sat0;
      }
    } else if (!isNaN(hue1)) {
      hue = hue1;
      if ((lbv0 === 1 || lbv0 === 0) && m !== 'hsv') {
        sat = sat1;
      }
    } else {
      hue = Number.NaN;
    }
    if (sat == null) {
      sat = sat0 + f * (sat1 - sat0);
    }
    lbv = lbv0 + f * (lbv1 - lbv0);
    return res = chroma[m](hue, sat, lbv);
  };

  _interpolators = _interpolators.concat((function() {
    var len, o, ref, results;
    ref = ['hsv', 'hsl', 'hsi', 'hcl', 'lch', 'hcg'];
    results = [];
    for (o = 0, len = ref.length; o < len; o++) {
      m = ref[o];
      results.push([m, interpolate_hsx]);
    }
    return results;
  })());

  interpolate_num = function(col1, col2, f, m) {
    var n1, n2;
    n1 = col1.num();
    n2 = col2.num();
    return chroma.num(n1 + (n2 - n1) * f, 'num');
  };

  _interpolators.push(['num', interpolate_num]);

  interpolate_lab = function(col1, col2, f, m) {
    var res, xyz0, xyz1;
    xyz0 = col1.lab();
    xyz1 = col2.lab();
    return res = new Color(xyz0[0] + f * (xyz1[0] - xyz0[0]), xyz0[1] + f * (xyz1[1] - xyz0[1]), xyz0[2] + f * (xyz1[2] - xyz0[2]), m);
  };

  _interpolators.push(['lab', interpolate_lab]);

}).call(this);

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(25)(module)))

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(Buffer) {

var https = __webpack_require__(35);
var http = __webpack_require__(17);
var jsonStatus = __webpack_require__(37);
var url = __webpack_require__(24);

module.exports = Plotly;

function Plotly(username,apiKey) {
    if (!(this instanceof Plotly)) return new Plotly(username,apiKey);

    var opts = {};

    if (typeof username === 'object') {
        opts = username;
        this.username = opts.username;
        this.apiKey = opts.apiKey;
        this.host = opts.host || 'plot.ly';
        this.port = opts.port || 443;
    } else {
        this.username = username;
        this.apiKey = apiKey;
        this.host = 'plot.ly';
        this.port = 443;
    }
        this.streamHost = '';
        this.version='1.0.4';
        this.platform='nodejs';
        this.origin='plot';
}

Plotly.prototype.plot = function(data, graphOptions, callback) {
    var self = this;
    if (!callback) { callback = function() {}; }

    // allow users to just pass in an object for the data, data = {x:[],y:[]}
    if (!Array.isArray(data)) data = [data];

    var urlencoded = '';
    var pack = {
        'platform': self.platform,
        'version': self.version,
        'args': JSON.stringify(data),
        'kwargs': JSON.stringify(graphOptions),
        'un': self.username,
        'key': self.apiKey,
        'origin': self.origin
    };

    for (var key in pack) {
        urlencoded += key + '=' + pack[key] + '&';
    }

    // trim off last ambersand
    urlencoded = new Buffer(urlencoded.substring(0, urlencoded.length - 1), 'utf8');

    var options = {
        host: self.host,
        port: self.port,
        path: '/clientresp',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': urlencoded.length
        },
        withCredentials: false
    };

    var req = https.request(options, function (res) {
        parseRes(res, function (err, body) {

            /* Try to parse the response */
            try {
                body = JSON.parse(body);
            } catch (e) {
                callback(e);
            }

            if ( body['stream-status'] != undefined) {
                self.streamHost = url.parse(body['stream-host']).hostname;
            }

            if ( body.error.length > 0 ) {
                var error = new Error(body.error);
                error.body = body;
                error.statusCode = res.statusCode;
                callback(error);
            } else {
                callback(null, {
                    streamstatus : body['stream-status'],
                    url: body.url,
                    message: body.message,
                    warning: body.warning,
                    filename: body.filename,
                    error: body.error
                });
            }
        });
    });

    req.on('error', function(err) {
        callback(err);
    });

    req.write(urlencoded);
    req.end();
};

Plotly.prototype.stream = function(token, callback) {
    var self = this;
    var opts = {};

    if (typeof token === 'object') {
        opts = token;
        token = opts.token;
        var host = opts.streamHost || self.streamHost;
        var port = opts.port || 80;
    }

    var options = {
        host: host || self.streamHost || 'stream.plot.ly',
        port: port || 80,
        path: '/',
        method: 'POST',
        agent: false,
        headers: { 'plotly-streamtoken' : token }
    };

    if (!callback) { callback = function() {}; }

    var stream = http.request(options, function (res) {
        var message = jsonStatus[res.statusCode];

        if (res.statusCode !== 200) {
            var error = new Error(message);
            error.statusCode = res.statusCode;
            callback(error);
        } else {
            callback(null, {msg : message, statusCode: res.statusCode});
        }
    });

    stream.on('error', function (err) {
        callback(err);
    });

    if (stream.setTimeout) stream.setTimeout(Math.pow(2, 32) * 1000);

    return stream;
};


Plotly.prototype.getFigure = function (fileOwner, fileId, callback) {
    var self = this;

    if (!callback) { callback = function() {}; }

    var headers = {
        'plotly-username': this.username,
        'plotly-apikey': this.apiKey,
        'plotly-version': this.version,
        'plotly-platform': this.platform
    };

    var resource = '/apigetfile/'+fileOwner+'/'+fileId;

    var options = {
        host: self.host,
        path: resource,
        port: self.port,
        headers: headers,
        method: 'GET'
    };

    var req = https.get(options, function (res) {
        parseRes(res, function (err, body) {

            /* Try to parse the response */
            try {
                body = JSON.parse(body);
            } catch (e) {
                callback(e);
            }
            
            if (body.error) {
                callback(body.error);
            }

            else {
                var figure = body.payload.figure;
                callback(null, figure);
            }

        });
    });

    req.on('error', function (err) {
        callback(err);
    });

    req.end();
};

Plotly.prototype.getImage = function (figure, opts, callback) {
    callback = callback || function () {};
    if (!figure) return new Error('no figure provided!');

    var self = this;
    var payload = JSON.stringify({
        figure: figure,
        format: opts.format || 'png',
        width: opts.width || 700,
        height: opts.height || 500
    });

    var headers = {
        'plotly-username': self.username,
        'plotly-apikey': self.apiKey,
        'plotly-version': self.version,
        'plotly-platform': self.platform,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': payload.length
    };

    var options = {
        hostname: self.host,
        path : '/apigenimage/',
        port: self.port,
        headers: headers,
        method: 'POST',
        agent: false
    };

    function handleResponse(res) {
        if (res.statusCode !== 200) {
            var error = new Error('Bad response status code ' + res.statusCode);
            error.msg = res.body;
            return callback(error, null);
        }

        callback(null, res);
    }

    var req = https.request(options, handleResponse);

    req.on('error', function (err) {
        callback(err);
    });

    req.write(payload);
    req.end();
};

Plotly.prototype.deletePlot = function (fid, callback) {
    if (!callback) callback = function () {};

    var self = this;

    // Create the base64 authstring from buffer
    var encodedAPIAuth = new Buffer(this.username + ':' + this.apiKey).toString('base64');

    var options = {
        host: 'api.plot.ly',
        port: this.port,
        path: '/v2/files/' + this.username + ':' + fid + '/trash',
        method: 'POST',
        agent: false,
        withCredentials: true,
        headers: {
            'Plotly-Client-Platform': 'nodejs ' + this.version,
            'authorization': 'Basic ' + encodedAPIAuth
        }
    };

    var req = https.request(options, function (res) {
        parseRes(res, function (err, body) {

            if (res.statusCode === 200) {

                callback(null, body);

            } else {

                var errObj = {
                    statusCode: res.statusCode,
                    err: body,
                    statusMessage: res.statusMessage
                };

                callback(errObj); // Pass out the error message from the backend
            }

        });
    });

    req.on('error', function (err) {
        callback(err);
    });

    req.end();
};

// response parse helper fn
function parseRes (res, cb) {
    var body = '';
    if ('setEncoding' in res) res.setEncoding('utf-8');

    res.on('data', function (data) {
        body += data;
        if (body.length > 1e10) {
            // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQ
            res.connection.destroy();
            res.writeHead(413, {'Content-Type': 'text/plain'});
            res.end('req body too large');
            return cb(new Error('body overflow'));
        }
    });

    res.on('end', function () {
        cb(null, body);
    });

}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0).Buffer))

/***/ }),
/* 29 */
/***/ (function(module, exports) {

throw new Error("Module build failed: Error: ENOENT: no such file or directory, open '/Users/mikeluz/Documents/Fullstack-Senior-Projects/R-D/pitch.js/src/pitch.js'");

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

/*===========================================================================*\
 * Autocorrelation algorithm based on description by Thibauld Nion
 * http://www.tibonihoo.net/literate_musing/autocorrelations.html
 *
 * (c) 2016 Maximilian Bügler
 *
 *===========================================================================*/

var fft = __webpack_require__(14).fft;
var ifft = __webpack_require__(14).ifft;
var nextpow2 = __webpack_require__(12).nextPow2;


module.exports = {
    
    /**
     * Calculates the autocorrelation of the provided signal
     *
     * @param {1D array} signal 1D time series of values (for instance acceleration)
     * @returns {1D array} an array of autocorrelation values for each time lag
     *
     **/
    autocorrelation: function autocorrelation(signal) {
        
        var n=signal.length;
        
        var i;
        
        var n2=nextpow2(n);

	if (n===0){
	    n2=0;
	}
        
        var paddedSignal=[];
        
        if (n==n2){
            paddedSignal=signal;
        }
        else{
            for (i=0;i<n2;i++){
                if (i<n){
                    paddedSignal[i]=signal[i];
                }
                else{
                    paddedSignal[i]=0;
                }
            }
        }

        var acv=autocovariance(paddedSignal);
        
        var variance=acv[0];
        
        var acf=[];
        
        var i;
        
        if (variance>0){
            for (i=0; i<n; i++){
                acf[i]=acv[i]/variance;    
            }
        }
        else{
            for (i=0; i<n; i++){
                acf[i]=0;    
            }            
        }
        return acf;
    
        function autocovariance(signal) {
            
            var n=signal.length;
            
            if (n===0)
                return [];
            
            var mean=0;
            var i;
            for (i=0; i<n; i++){
                mean+=signal[i];
            }
            mean/=n;
                      
            var padded_signal=[];
            
            for (i=0; i<n; i++){
                padded_signal[i]=signal[i]-mean;
                padded_signal[n+i]=0;
            }
                        
            var ft_signal = fft(padded_signal);
                       
            var pseudo_powerSpectralDensity=[];
            
            for (i=0; i<ft_signal.length; i++){
                pseudo_powerSpectralDensity[i]=complexMultiply(ft_signal[i], complexConjugate(ft_signal[i]));
            }
           
            var pseudo_autocovariance = ifft(pseudo_powerSpectralDensity);
    
            var mask=[];
            
            for (i=0; i<n; i++){
                mask[i]=1;
                mask[i+n]=0;
            }
            
            var ft_mask = fft(mask);
    
            var mask_powerSpectralDensity=[];
            
            for (i=0; i<ft_mask.length; i++){
                mask_powerSpectralDensity[i]=complexMultiply(ft_mask[i], complexConjugate(ft_mask[i]));
            }
            
            var mask_correction_factors = ifft(mask_powerSpectralDensity);
    
            var acv=[];
            
            for (i=0; i<n; i++){
                acv[i]=complexDivideRealPart(pseudo_autocovariance[i],mask_correction_factors[i]);
            }    
            
            return acv;
            /*
             * ComplexMultiply
             * 
             * From complex.js in fft-js in https://github.com/vail-systems/node-fft
             *
             * (c) Vail Systems. Joshua Jung and Ben Bryan. 2015
             */
            function complexMultiply(a, b){
                return [(a[0] * b[0] - a[1] * b[1]), 
                        (a[0] * b[1] + a[1] * b[0])];
            }
            
            function complexConjugate(a){
                return [a[0], -a[1]];
            }
            /*function complexDivide(a,b){
                return [ (a[0]*b[0]+a[1]*b[1])/(b[0]*b[0]+b[1]*b[1]),
                         (a[1]*b[0]-a[0]*b[1])/(b[0]*b[0]+b[1]*b[1])];
            }*/
            //We only need the real part here
            function complexDivideRealPart(a,b){
                return (a[0]*b[0]+a[1]*b[1])/(b[0]*b[0]+b[1]*b[1]);
            }           
            
        }
    }
    
};


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return b64.length * 3 / 4 - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, j, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr(len * 3 / 4 - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}


/***/ }),
/* 32 */
/***/ (function(module, exports) {

module.exports = {
  "100": "Continue",
  "101": "Switching Protocols",
  "102": "Processing",
  "200": "OK",
  "201": "Created",
  "202": "Accepted",
  "203": "Non-Authoritative Information",
  "204": "No Content",
  "205": "Reset Content",
  "206": "Partial Content",
  "207": "Multi-Status",
  "208": "Already Reported",
  "226": "IM Used",
  "300": "Multiple Choices",
  "301": "Moved Permanently",
  "302": "Found",
  "303": "See Other",
  "304": "Not Modified",
  "305": "Use Proxy",
  "307": "Temporary Redirect",
  "308": "Permanent Redirect",
  "400": "Bad Request",
  "401": "Unauthorized",
  "402": "Payment Required",
  "403": "Forbidden",
  "404": "Not Found",
  "405": "Method Not Allowed",
  "406": "Not Acceptable",
  "407": "Proxy Authentication Required",
  "408": "Request Timeout",
  "409": "Conflict",
  "410": "Gone",
  "411": "Length Required",
  "412": "Precondition Failed",
  "413": "Payload Too Large",
  "414": "URI Too Long",
  "415": "Unsupported Media Type",
  "416": "Range Not Satisfiable",
  "417": "Expectation Failed",
  "418": "I'm a teapot",
  "421": "Misdirected Request",
  "422": "Unprocessable Entity",
  "423": "Locked",
  "424": "Failed Dependency",
  "425": "Unordered Collection",
  "426": "Upgrade Required",
  "428": "Precondition Required",
  "429": "Too Many Requests",
  "431": "Request Header Fields Too Large",
  "451": "Unavailable For Legal Reasons",
  "500": "Internal Server Error",
  "501": "Not Implemented",
  "502": "Bad Gateway",
  "503": "Service Unavailable",
  "504": "Gateway Timeout",
  "505": "HTTP Version Not Supported",
  "506": "Variant Also Negotiates",
  "507": "Insufficient Storage",
  "508": "Loop Detected",
  "509": "Bandwidth Limit Exceeded",
  "510": "Not Extended",
  "511": "Network Authentication Required"
}


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

/*===========================================================================*\
 * Discrete Fourier Transform (O(n^2) brute-force method)
 *
 * (c) Vail Systems. Joshua Jung and Ben Bryan. 2015
 *
 * This code is not designed to be highly optimized but as an educational
 * tool to understand the Fast Fourier Transform.
\*===========================================================================*/

//------------------------------------------------
// Note: this code is not optimized and is
// primarily designed as an educational and testing
// tool.
//------------------------------------------------
var complex = __webpack_require__(7);
var fftUtil = __webpack_require__(9);

//-------------------------------------------------
// Calculate brute-force O(n^2) DFT for vector.
//-------------------------------------------------
var dft = function(vector) {
  var X = [],
      N = vector.length;

  for (var k = 0; k < N; k++) {
    X[k] = [0, 0]; //Initialize to a 0-valued complex number.

    for (var i = 0; i < N; i++) {
      var exp = fftUtil.exponent(k * i, N);
      var term = complex.multiply([vector[i], 0], exp); //Complex mult of the signal with the exponential term.
      X[k] = complex.add(X[k], term); //Complex summation of X[k] and exponential
    }
  }

  return X;
};

module.exports = dft;

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

/*===========================================================================*\
 * Inverse Fast Fourier Transform (Cooley-Tukey Method)
 *
 * (c) Maximilian Bügler. 2016
 *
 * Based on and using the code by
 * (c) Vail Systems. Joshua Jung and Ben Bryan. 2015
 *
 * This code is not designed to be highly optimized but as an educational
 * tool to understand the Fast Fourier Transform.
\*===========================================================================*/

//------------------------------------------------
// Note: Some of this code is not optimized and is
// primarily designed as an educational and testing
// tool.
// To get high performace would require transforming
// the recursive calls into a loop and then loop
// unrolling. All of this is best accomplished
// in C or assembly.
//-------------------------------------------------

//-------------------------------------------------
// The following code assumes a complex number is
// an array: [real, imaginary]
//-------------------------------------------------

var fft = __webpack_require__(8).fft;


module.exports = {
    ifft: function ifft(signal){
        //Interchange real and imaginary parts
        var csignal=[];
        for(var i=0; i<signal.length; i++){
            csignal[i]=[signal[i][1], signal[i][0]];
        }
    
        //Apply fft
        var ps=fft(csignal);
        
        //Interchange real and imaginary parts and normalize
        var res=[];
        for(var j=0; j<ps.length; j++){
            res[j]=[ps[j][1]/ps.length, ps[j][0]/ps.length];
        }
        return res;
    }
};


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

var http = __webpack_require__(17);

var https = module.exports;

for (var key in http) {
    if (http.hasOwnProperty(key)) https[key] = http[key];
};

https.request = function (params, cb) {
    if (!params) params = {};
    params.scheme = 'https';
    params.protocol = 'https:';
    return http.request.call(this, params, cb);
}


/***/ }),
/* 36 */
/***/ (function(module, exports) {

exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}


/***/ }),
/* 37 */
/***/ (function(module, exports) {

module.exports = {
	"200": "healthy endpoint disconnect",
	"308": "stream had ended",
	"400": "invalid or malformed request syntax",
	"403": "stream token no longer associated with this plot",
	"404": "streamtoken not registered or valid",
	"405": "bad request method: use POST for streaming",
	"406": "bad request header: missing 'plotly-streamtoken'",
	"408": "timeout on active data",
	"422": "json parse error: please stream newline seperated JSON",
	"423": "connection limit associated with this token has been reached",
	"449": "stream content has changed, reloading clients",
	"500": "internal server error",
	"503": "internal database error",
	"520": "error in request stream"
};

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module, global) {var __WEBPACK_AMD_DEFINE_RESULT__;/*! https://mths.be/punycode v1.4.1 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.4.1',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		true
	) {
		!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
			return punycode;
		}.call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(25)(module), __webpack_require__(1)))

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.decode = exports.parse = __webpack_require__(39);
exports.encode = exports.stringify = __webpack_require__(40);


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, process) {(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var registerImmediate;

    function setImmediate(callback) {
      // Callback can either be a function or a string
      if (typeof callback !== "function") {
        callback = new Function("" + callback);
      }
      // Copy function arguments
      var args = new Array(arguments.length - 1);
      for (var i = 0; i < args.length; i++) {
          args[i] = arguments[i + 1];
      }
      // Store and register the task
      var task = { callback: callback, args: args };
      tasksByHandle[nextHandle] = task;
      registerImmediate(nextHandle);
      return nextHandle++;
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function run(task) {
        var callback = task.callback;
        var args = task.args;
        switch (args.length) {
        case 0:
            callback();
            break;
        case 1:
            callback(args[0]);
            break;
        case 2:
            callback(args[0], args[1]);
            break;
        case 3:
            callback(args[0], args[1], args[2]);
            break;
        default:
            callback.apply(undefined, args);
            break;
        }
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(runIfPresent, 0, handle);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    run(task);
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function installNextTickImplementation() {
        registerImmediate = function(handle) {
            process.nextTick(function () { runIfPresent(handle); });
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        registerImmediate = function(handle) {
            global.postMessage(messagePrefix + handle, "*");
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        registerImmediate = function(handle) {
            channel.port2.postMessage(handle);
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        registerImmediate = function(handle) {
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
        };
    }

    function installSetTimeoutImplementation() {
        registerImmediate = function(handle) {
            setTimeout(runIfPresent, 0, handle);
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(typeof self === "undefined" ? typeof global === "undefined" ? this : global : self));

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1), __webpack_require__(3)))

/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer, global, process) {var capability = __webpack_require__(18)
var inherits = __webpack_require__(2)
var response = __webpack_require__(44)
var stream = __webpack_require__(23)
var toArrayBuffer = __webpack_require__(49)

var IncomingMessage = response.IncomingMessage
var rStates = response.readyStates

function decideMode (preferBinary, useFetch) {
	if (capability.fetch && useFetch) {
		return 'fetch'
	} else if (capability.mozchunkedarraybuffer) {
		return 'moz-chunked-arraybuffer'
	} else if (capability.msstream) {
		return 'ms-stream'
	} else if (capability.arraybuffer && preferBinary) {
		return 'arraybuffer'
	} else if (capability.vbArray && preferBinary) {
		return 'text:vbarray'
	} else {
		return 'text'
	}
}

var ClientRequest = module.exports = function (opts) {
	var self = this
	stream.Writable.call(self)

	self._opts = opts
	self._body = []
	self._headers = {}
	if (opts.auth)
		self.setHeader('Authorization', 'Basic ' + new Buffer(opts.auth).toString('base64'))
	Object.keys(opts.headers).forEach(function (name) {
		self.setHeader(name, opts.headers[name])
	})

	var preferBinary
	var useFetch = true
	if (opts.mode === 'disable-fetch' || 'timeout' in opts) {
		// If the use of XHR should be preferred and includes preserving the 'content-type' header.
		// Force XHR to be used since the Fetch API does not yet support timeouts.
		useFetch = false
		preferBinary = true
	} else if (opts.mode === 'prefer-streaming') {
		// If streaming is a high priority but binary compatibility and
		// the accuracy of the 'content-type' header aren't
		preferBinary = false
	} else if (opts.mode === 'allow-wrong-content-type') {
		// If streaming is more important than preserving the 'content-type' header
		preferBinary = !capability.overrideMimeType
	} else if (!opts.mode || opts.mode === 'default' || opts.mode === 'prefer-fast') {
		// Use binary if text streaming may corrupt data or the content-type header, or for speed
		preferBinary = true
	} else {
		throw new Error('Invalid value for opts.mode')
	}
	self._mode = decideMode(preferBinary, useFetch)

	self.on('finish', function () {
		self._onFinish()
	})
}

inherits(ClientRequest, stream.Writable)

ClientRequest.prototype.setHeader = function (name, value) {
	var self = this
	var lowerName = name.toLowerCase()
	// This check is not necessary, but it prevents warnings from browsers about setting unsafe
	// headers. To be honest I'm not entirely sure hiding these warnings is a good thing, but
	// http-browserify did it, so I will too.
	if (unsafeHeaders.indexOf(lowerName) !== -1)
		return

	self._headers[lowerName] = {
		name: name,
		value: value
	}
}

ClientRequest.prototype.getHeader = function (name) {
	var self = this
	return self._headers[name.toLowerCase()].value
}

ClientRequest.prototype.removeHeader = function (name) {
	var self = this
	delete self._headers[name.toLowerCase()]
}

ClientRequest.prototype._onFinish = function () {
	var self = this

	if (self._destroyed)
		return
	var opts = self._opts

	var headersObj = self._headers
	var body = null
	if (opts.method !== 'GET' && opts.method !== 'HEAD') {
		if (capability.blobConstructor) {
			body = new global.Blob(self._body.map(function (buffer) {
				return toArrayBuffer(buffer)
			}), {
				type: (headersObj['content-type'] || {}).value || ''
			})
		} else {
			// get utf8 string
			body = Buffer.concat(self._body).toString()
		}
	}

	// create flattened list of headers
	var headersList = []
	Object.keys(headersObj).forEach(function (keyName) {
		var name = headersObj[keyName].name
		var value = headersObj[keyName].value
		if (Array.isArray(value)) {
			value.forEach(function (v) {
				headersList.push([name, v])
			})
		} else {
			headersList.push([name, value])
		}
	})

	if (self._mode === 'fetch') {
		global.fetch(self._opts.url, {
			method: self._opts.method,
			headers: headersList,
			body: body || undefined,
			mode: 'cors',
			credentials: opts.withCredentials ? 'include' : 'same-origin'
		}).then(function (response) {
			self._fetchResponse = response
			self._connect()
		}, function (reason) {
			self.emit('error', reason)
		})
	} else {
		var xhr = self._xhr = new global.XMLHttpRequest()
		try {
			xhr.open(self._opts.method, self._opts.url, true)
		} catch (err) {
			process.nextTick(function () {
				self.emit('error', err)
			})
			return
		}

		// Can't set responseType on really old browsers
		if ('responseType' in xhr)
			xhr.responseType = self._mode.split(':')[0]

		if ('withCredentials' in xhr)
			xhr.withCredentials = !!opts.withCredentials

		if (self._mode === 'text' && 'overrideMimeType' in xhr)
			xhr.overrideMimeType('text/plain; charset=x-user-defined')

		if ('timeout' in opts) {
			xhr.timeout = opts.timeout
			xhr.ontimeout = function () {
				self.emit('timeout')
			}
		}

		headersList.forEach(function (header) {
			xhr.setRequestHeader(header[0], header[1])
		})

		self._response = null
		xhr.onreadystatechange = function () {
			switch (xhr.readyState) {
				case rStates.LOADING:
				case rStates.DONE:
					self._onXHRProgress()
					break
			}
		}
		// Necessary for streaming in Firefox, since xhr.response is ONLY defined
		// in onprogress, not in onreadystatechange with xhr.readyState = 3
		if (self._mode === 'moz-chunked-arraybuffer') {
			xhr.onprogress = function () {
				self._onXHRProgress()
			}
		}

		xhr.onerror = function () {
			if (self._destroyed)
				return
			self.emit('error', new Error('XHR error'))
		}

		try {
			xhr.send(body)
		} catch (err) {
			process.nextTick(function () {
				self.emit('error', err)
			})
			return
		}
	}
}

/**
 * Checks if xhr.status is readable and non-zero, indicating no error.
 * Even though the spec says it should be available in readyState 3,
 * accessing it throws an exception in IE8
 */
function statusValid (xhr) {
	try {
		var status = xhr.status
		return (status !== null && status !== 0)
	} catch (e) {
		return false
	}
}

ClientRequest.prototype._onXHRProgress = function () {
	var self = this

	if (!statusValid(self._xhr) || self._destroyed)
		return

	if (!self._response)
		self._connect()

	self._response._onXHRProgress()
}

ClientRequest.prototype._connect = function () {
	var self = this

	if (self._destroyed)
		return

	self._response = new IncomingMessage(self._xhr, self._fetchResponse, self._mode)
	self._response.on('error', function(err) {
		self.emit('error', err)
	})

	self.emit('response', self._response)
}

ClientRequest.prototype._write = function (chunk, encoding, cb) {
	var self = this

	self._body.push(chunk)
	cb()
}

ClientRequest.prototype.abort = ClientRequest.prototype.destroy = function () {
	var self = this
	self._destroyed = true
	if (self._response)
		self._response._destroyed = true
	if (self._xhr)
		self._xhr.abort()
	// Currently, there isn't a way to truly abort a fetch.
	// If you like bikeshedding, see https://github.com/whatwg/fetch/issues/27
}

ClientRequest.prototype.end = function (data, encoding, cb) {
	var self = this
	if (typeof data === 'function') {
		cb = data
		data = undefined
	}

	stream.Writable.prototype.end.call(self, data, encoding, cb)
}

ClientRequest.prototype.flushHeaders = function () {}
ClientRequest.prototype.setTimeout = function () {}
ClientRequest.prototype.setNoDelay = function () {}
ClientRequest.prototype.setSocketKeepAlive = function () {}

// Taken from http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader%28%29-method
var unsafeHeaders = [
	'accept-charset',
	'accept-encoding',
	'access-control-request-headers',
	'access-control-request-method',
	'connection',
	'content-length',
	'cookie',
	'cookie2',
	'date',
	'dnt',
	'expect',
	'host',
	'keep-alive',
	'origin',
	'referer',
	'te',
	'trailer',
	'transfer-encoding',
	'upgrade',
	'user-agent',
	'via'
]

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0).Buffer, __webpack_require__(1), __webpack_require__(3)))

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process, Buffer, global) {var capability = __webpack_require__(18)
var inherits = __webpack_require__(2)
var stream = __webpack_require__(23)

var rStates = exports.readyStates = {
	UNSENT: 0,
	OPENED: 1,
	HEADERS_RECEIVED: 2,
	LOADING: 3,
	DONE: 4
}

var IncomingMessage = exports.IncomingMessage = function (xhr, response, mode) {
	var self = this
	stream.Readable.call(self)

	self._mode = mode
	self.headers = {}
	self.rawHeaders = []
	self.trailers = {}
	self.rawTrailers = []

	// Fake the 'close' event, but only once 'end' fires
	self.on('end', function () {
		// The nextTick is necessary to prevent the 'request' module from causing an infinite loop
		process.nextTick(function () {
			self.emit('close')
		})
	})

	if (mode === 'fetch') {
		self._fetchResponse = response

		self.url = response.url
		self.statusCode = response.status
		self.statusMessage = response.statusText
		
		response.headers.forEach(function(header, key){
			self.headers[key.toLowerCase()] = header
			self.rawHeaders.push(key, header)
		})


		// TODO: this doesn't respect backpressure. Once WritableStream is available, this can be fixed
		var reader = response.body.getReader()
		function read () {
			reader.read().then(function (result) {
				if (self._destroyed)
					return
				if (result.done) {
					self.push(null)
					return
				}
				self.push(new Buffer(result.value))
				read()
			}).catch(function(err) {
				self.emit('error', err)
			})
		}
		read()

	} else {
		self._xhr = xhr
		self._pos = 0

		self.url = xhr.responseURL
		self.statusCode = xhr.status
		self.statusMessage = xhr.statusText
		var headers = xhr.getAllResponseHeaders().split(/\r?\n/)
		headers.forEach(function (header) {
			var matches = header.match(/^([^:]+):\s*(.*)/)
			if (matches) {
				var key = matches[1].toLowerCase()
				if (key === 'set-cookie') {
					if (self.headers[key] === undefined) {
						self.headers[key] = []
					}
					self.headers[key].push(matches[2])
				} else if (self.headers[key] !== undefined) {
					self.headers[key] += ', ' + matches[2]
				} else {
					self.headers[key] = matches[2]
				}
				self.rawHeaders.push(matches[1], matches[2])
			}
		})

		self._charset = 'x-user-defined'
		if (!capability.overrideMimeType) {
			var mimeType = self.rawHeaders['mime-type']
			if (mimeType) {
				var charsetMatch = mimeType.match(/;\s*charset=([^;])(;|$)/)
				if (charsetMatch) {
					self._charset = charsetMatch[1].toLowerCase()
				}
			}
			if (!self._charset)
				self._charset = 'utf-8' // best guess
		}
	}
}

inherits(IncomingMessage, stream.Readable)

IncomingMessage.prototype._read = function () {}

IncomingMessage.prototype._onXHRProgress = function () {
	var self = this

	var xhr = self._xhr

	var response = null
	switch (self._mode) {
		case 'text:vbarray': // For IE9
			if (xhr.readyState !== rStates.DONE)
				break
			try {
				// This fails in IE8
				response = new global.VBArray(xhr.responseBody).toArray()
			} catch (e) {}
			if (response !== null) {
				self.push(new Buffer(response))
				break
			}
			// Falls through in IE8	
		case 'text':
			try { // This will fail when readyState = 3 in IE9. Switch mode and wait for readyState = 4
				response = xhr.responseText
			} catch (e) {
				self._mode = 'text:vbarray'
				break
			}
			if (response.length > self._pos) {
				var newData = response.substr(self._pos)
				if (self._charset === 'x-user-defined') {
					var buffer = new Buffer(newData.length)
					for (var i = 0; i < newData.length; i++)
						buffer[i] = newData.charCodeAt(i) & 0xff

					self.push(buffer)
				} else {
					self.push(newData, self._charset)
				}
				self._pos = response.length
			}
			break
		case 'arraybuffer':
			if (xhr.readyState !== rStates.DONE || !xhr.response)
				break
			response = xhr.response
			self.push(new Buffer(new Uint8Array(response)))
			break
		case 'moz-chunked-arraybuffer': // take whole
			response = xhr.response
			if (xhr.readyState !== rStates.LOADING || !response)
				break
			self.push(new Buffer(new Uint8Array(response)))
			break
		case 'ms-stream':
			response = xhr.response
			if (xhr.readyState !== rStates.LOADING)
				break
			var reader = new global.MSStreamReader()
			reader.onprogress = function () {
				if (reader.result.byteLength > self._pos) {
					self.push(new Buffer(new Uint8Array(reader.result.slice(self._pos))))
					self._pos = reader.result.byteLength
				}
			}
			reader.onload = function () {
				self.push(null)
			}
			// reader.onerror = ??? // TODO: this
			reader.readAsArrayBuffer(response)
			break
	}

	// The ms-stream case handles end separately in reader.onload()
	if (self._xhr.readyState === rStates.DONE && self._mode !== 'ms-stream') {
		self.push(null)
	}
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3), __webpack_require__(0).Buffer, __webpack_require__(1)))

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.



module.exports = PassThrough;

var Transform = __webpack_require__(20);

/*<replacement>*/
var util = __webpack_require__(5);
util.inherits = __webpack_require__(2);
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Buffer = __webpack_require__(0).Buffer;
/*<replacement>*/
var bufferShim = __webpack_require__(6);
/*</replacement>*/

module.exports = BufferList;

function BufferList() {
  this.head = null;
  this.tail = null;
  this.length = 0;
}

BufferList.prototype.push = function (v) {
  var entry = { data: v, next: null };
  if (this.length > 0) this.tail.next = entry;else this.head = entry;
  this.tail = entry;
  ++this.length;
};

BufferList.prototype.unshift = function (v) {
  var entry = { data: v, next: this.head };
  if (this.length === 0) this.tail = entry;
  this.head = entry;
  ++this.length;
};

BufferList.prototype.shift = function () {
  if (this.length === 0) return;
  var ret = this.head.data;
  if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
  --this.length;
  return ret;
};

BufferList.prototype.clear = function () {
  this.head = this.tail = null;
  this.length = 0;
};

BufferList.prototype.join = function (s) {
  if (this.length === 0) return '';
  var p = this.head;
  var ret = '' + p.data;
  while (p = p.next) {
    ret += s + p.data;
  }return ret;
};

BufferList.prototype.concat = function (n) {
  if (this.length === 0) return bufferShim.alloc(0);
  if (this.length === 1) return this.head.data;
  var ret = bufferShim.allocUnsafe(n >>> 0);
  var p = this.head;
  var i = 0;
  while (p) {
    p.data.copy(ret, i);
    i += p.data.length;
    p = p.next;
  }
  return ret;
};

/***/ }),
/* 47 */
/***/ (function(module, exports) {

module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

var apply = Function.prototype.apply;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) {
  if (timeout) {
    timeout.close();
  }
};

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// setimmediate attaches itself to the global object
__webpack_require__(42);
exports.setImmediate = setImmediate;
exports.clearImmediate = clearImmediate;


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

var Buffer = __webpack_require__(0).Buffer

module.exports = function (buf) {
	// If the buffer is backed by a Uint8Array, a faster version will work
	if (buf instanceof Uint8Array) {
		// If the buffer isn't a subarray, return the underlying ArrayBuffer
		if (buf.byteOffset === 0 && buf.byteLength === buf.buffer.byteLength) {
			return buf.buffer
		} else if (typeof buf.buffer.slice === 'function') {
			// Otherwise we need to get a proper copy
			return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
		}
	}

	if (Buffer.isBuffer(buf)) {
		// This is the slow version that will work with any Buffer
		// implementation (even in old browsers)
		var arrayCopy = new Uint8Array(buf.length)
		var len = buf.length
		for (var i = 0; i < len; i++) {
			arrayCopy[i] = buf[i]
		}
		return arrayCopy.buffer
	} else {
		throw new Error('Argument must be a Buffer')
	}
}


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
  isString: function(arg) {
    return typeof(arg) === 'string';
  },
  isObject: function(arg) {
    return typeof(arg) === 'object' && arg !== null;
  },
  isNull: function(arg) {
    return arg === null;
  },
  isNullOrUndefined: function(arg) {
    return arg == null;
  }
};


/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {
/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

const autocorrelation = __webpack_require__(26).autocorrelation;
const chroma = __webpack_require__(27);
let Plotly = __webpack_require__(28)('mikeluz', '3vgNiLnEqG8XudnTUhUg');
const fft = __webpack_require__(11);
const PitchAnalyzer = __webpack_require__(29);

// var data = [{x:[0,1,2], y:[3,2,1], type: 'bar'}];
// var layout = {fileopt : "overwrite", filename : "simple-node-example"};

// Plotly.plot(data, layout, function (err, msg) {
//     if (err) return console.log(err);
//     console.log(msg);
// });

// create the audio context (chrome only for now)
if (! window.AudioContext) {
    if (! window.webkitAudioContext) {
        alert('no audiocontext found');
    }
    window.AudioContext = window.webkitAudioContext;
}

var context = new AudioContext();

var audioBuffer;
var sourceNode;
var analyser;
var javascriptNode;

// get the context from the canvas to draw on
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// load the sound
setupAudioNodes();
loadSound("sandwich.mp3");


function setupAudioNodes() {

    // setup a javascript node
    javascriptNode = context.createScriptProcessor(2048, 1, 1);
    // connect to destination, else it isn't called
    javascriptNode.connect(context.destination);


    // setup a analyzer
    analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0;
    analyser.fftSize = 4096;

    // create a buffer source node
    sourceNode = context.createBufferSource();
    sourceNode.connect(analyser);
    analyser.connect(javascriptNode);

    sourceNode.connect(context.destination);
}

// load the specified sound
function loadSound(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    // When loaded decode the data
    request.onload = function () {

        // decode the data
        context.decodeAudioData(request.response, function (buffer) {
            // when the audio is decoded play the sound
            playSound(buffer);
        }, onError);
    }
    request.send();
}


function playSound(buffer) {
    sourceNode.buffer = buffer;
    // sourceNode.start(0);
    // sourceNode.loop = false;
}

// log if an error occurs
function onError(e) {
    console.log(e);
}

// when the javascript node is called
// we use information from the analyzer node
// to draw the volume
javascriptNode.onaudioprocess = function () {

    // get the average for the first channel
    var array = new Float32Array(analyser.frequencyBinCount);
    analyser.getFloatFrequencyData(array);

    // console.log("sourceNode", sourceNode.buffer);
    // var data = sourceNode.buffer.getChannelData(0);

    /* Create a new pitch detector */
    var pitchOne = new PitchAnalyzer(44100);

    // console.log("data", data);

    /* Copy samples to the internal buffer */
    // pitchOne.input(sourceNode.buffer.getChannelData(0).slice(1000,10000));

    var n = 1001;
    var i = 1;

    var tones = [];
    var vols = [];

    // while (n < data.length && i < 50000) {
    //     pitchOne.input(data.slice(n-1000, n));
    //     /* Process the current input in the internal buffer */
    //     pitchOne.process();
    //     // console.log("pitchOne instance", pitchOne);

    //     var toneOne = pitchOne.findTone();

    //     if (toneOne === null) {
    //         // console.log('No tone found!');
    //         tones.push(0);
    //         vols.push(0);
    //     } else {
    //         // console.log('Found a toneOne, frequency:', toneOne.freq, 'volume:', toneOne.db);
    //         tones.push(toneOne.freq);
    //         vols.push(toneOne.db);
    //     }
    //     n = n+1000;
    //     i++;
    // }
    // console.log("tones.length / tones", tones.length, tones);
    // console.log("vols.length / vols", vols.length, vols);
}

// mic situation

var hpFilter = context.createBiquadFilter();
hpFilter.type = "highpass";
hpFilter.frequency.value = 85;
hpFilter.gain.value = 10;

var lpFilter = context.createBiquadFilter();
lpFilter.type = "lowpass";
lpFilter.frequency.value = 900;
lpFilter.gain.value = 10;

var viz = context.createAnalyser();
viz.fftSize = 2048;

var arrayOne = new Float32Array(viz.frequencyBinCount);
var arrayTwo = new Uint8Array(viz.frequencyBinCount);

function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // ctx.fillStyle = 'rgb(214, 68, 68)';
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 10;
    ctx.strokeStyle = 'rgb(0, 0, 0)';

    ctx.beginPath();

    var sliceWidth = canvas.width * 1.0 / viz.frequencyBinCount;
    var x = 0;

    for(var i = 0; i < viz.frequencyBinCount; i++) {

        var v = arrayTwo[i] / 128.0;
        var y = v * canvas.height/2;

        if(i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height/2);
    ctx.stroke();

}

draw();

var constraints = { audio: true, video: false };
navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {

    var mediaRecorder = new MediaRecorder(stream);

    var recording = [];

    mediaRecorder.ondataavailable = function(e) {
        recording.push(e.data);
    };

    var source = context.createMediaStreamSource(stream);
    // viz.getByteTimeDomainData(arrayOne);
    source.connect(lpFilter);
    lpFilter.connect(hpFilter);
    hpFilter.connect(viz);

    var record = document.getElementById("record");
    var stop = document.getElementById("stop");

    var repeatDraw;

    // viz.getByteTimeDomainData(arrayTwo);

    var newArray = new Uint8Array(2048);

    record.onclick = function() {
    viz.connect(context.destination);
        mediaRecorder.start();
        repeatDraw = setInterval(() => {
            // mediaRecorder.requestData();
            viz.getByteTimeDomainData(arrayTwo);
            draw();
        }, 1000);
        record.style.background = "red";
        record.style.color = "black";
    }

    stop.onclick = function() {
    viz.disconnect(context.destination);
      mediaRecorder.requestData();
      mediaRecorder.stop();
      record.style.background = "";
      record.style.color = "";
      clearInterval(repeatDraw);
    }

    mediaRecorder.onstop = function(e) {
      console.log("recorder stopped");

      console.log("arrayOne", arrayOne);

      var clipName = prompt('Enter a name for your sound clip');

      var clipContainer = document.createElement('article');
      var clipLabel = document.createElement('p');
      var audio = document.createElement('audio');
      var deleteButton = document.createElement('button');

      clipContainer.classList.add('clip');
      audio.setAttribute('controls', '');
      deleteButton.innerHTML = "Delete";
      clipLabel.innerHTML = clipName;

      clipContainer.appendChild(audio);
      clipContainer.appendChild(clipLabel);
      clipContainer.appendChild(deleteButton);
      soundClips.appendChild(clipContainer);

      var blob = new Blob(recording, { 'type' : 'audio/ogg; codecs=opus' });
      recording = [];
      var audioURL = window.URL.createObjectURL(blob);
      audio.src = audioURL;

        var reader = new FileReader();
        reader.addEventListener("loadend", function() {
            // while (reader.result.byteLength % 4 !== 0) {
            //     console.log("BAD");

            // }
            var buffer = new Uint8Array(reader.result);

            const findFundamentalFreq = (buffer, sampleRate) => {
                // We use autocorrelation to find the fundamental frequency.

                // In order to correlate the signal with itself (hence the name of the algorithm), we will check two points 'k' frames away.
                // The autocorrelation index will be the average of these products. At the same time, we normalize the values.
                // Source: http://www.phy.mty.edu/~suits/autocorrelation.html

                // the default sample rate, depending on the hardware, is 44100Hz or 48000Hz.
                // a 'k' range between 120 and 650 covers signals ranging from ~70Hz to ~350Hz, which is just a little broader than the average frequency range for human speech (80-260Hz, per Wikipedia).
                var n = 1024, bestR = 0, bestK = -1;
                for(var k = 120; k <= 650; k++){
                    var sum = 0;

                    for(var i = 0; i < n; i++){
                        sum += ((buffer[i] - 128) / 128) * ((buffer[i + k] - 128) / 128);
                    }

                    var r = sum  / (n + k);

                    if(r > bestR){
                        bestR = r;
                        bestK = k;
                    }

                    if(r > 0.95) {
                        // Let's assume that this is good enough and stop right here
                        break;
                    }
                }

                console.log("bestR", bestR);

                if(bestR > 0.0025) {
                    // The period (in frames) of the fundamental frequency is 'bestK'. Getting the frequency from there is trivial.
                    var fundamentalFreq = sampleRate / bestK;
                    return fundamentalFreq;
                }
                else {
                    // We haven't found a good correlation
                    return -1;
                }
            };

            var pitchCon = new PitchAnalyzer(44100);

            var n = 1001;
            var i = 1;

            var tones = [];
            var vols = [];

            while (n < buffer.length && i < 50000) {

                console.log("f0....", findFundamentalFreq(newArray.slice(n-1000, n-99), 44100));
                // console.log("newArray", newArray);
                console.log("f0", findFundamentalFreq(buffer.slice(n-1000, n-99), 44100));

                pitchCon.input(buffer.slice(n-1000, n));
                /* Process the current input in the internal buffer */
                pitchCon.process();
                // console.log("pitchCon instance", pitchCon);

                var toneOne = pitchCon.findTone();

                if (toneOne === null) {
                    console.log('No tone found!');
                    tones.push(300);
                    vols.push(0);
                } else {
                    console.log('Found a toneOne, frequency:', toneOne.freq, 'volume:', toneOne.db);
                    tones.push(toneOne.freq);
                    vols.push(toneOne.db);
                }
                n = n+1000;
                i++;
            }

            var tonesY = function() {
                var array = [];
                for (let i = 0; i < tones.length; i++) {
                    array.push(i);
                }
                return array;
            }

            var data = [{x:tonesY(), y:tones, type: 'tones'}];
            var layout = {fileopt : "overwrite", filename : "tones"};

            Plotly.plot(data, layout, function (err, msg) {
                if (err) return console.log(err);
                console.log(msg);
            });

            console.log('tones', tones);
            console.log('vols', vols);

        });
        reader.readAsArrayBuffer(blob);

      deleteButton.onclick = function(e) {
        var evtTgt = e.target;
        evtTgt.parentNode.parentNode.removeChild(evtTgt.parentNode);
      }
    }

}).catch(function(err) {
    console.log(err);
});



/***/ }),
/* 53 */
/***/ (function(module, exports) {

/* (ignored) */

/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map
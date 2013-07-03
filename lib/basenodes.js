var inherits = require('util').inherits
	, EventEmitter = require('events').EventEmitter
	, async = require('async')
	, _ = require('underscore')
	, utils = require('./utils')

var AudioNode = module.exports.AudioNode = function() {
	this.init.apply(this, arguments)
  this.closed = false
}
inherits(AudioNode, EventEmitter)

_.extend(AudioNode.prototype, {

	init: function() {},

  close: function() {
    this.closed = true
    this.getBlock = function(done) { done(null, []) }
  },

  // Returns the next block of values from the node. The size of the block doesn't matter.
  // If there is no block left, this should return an empty array.
  getBlock: function(done) { throw new Error('implement me') }

})

var HasOutput = {

	initOutput: function() {
		this._buffer = []
	},

	connect: function(other) {
		if (other.input) {
			other.input = this
      return other
		} else {
			throw new Error('the node you are trying to connect to has no input')
		}
	},
	
	// TODO: is it better to use concat to create the buffer? or splice?
	read: function(blockSize, done) {
		var self = this
		async.whilst(
    	function () { return self._buffer.length < blockSize },
    	function (next) {
    		self.getBlock(function(err, block) {
    			if (err) next(err)
    			else if (block.length === 0) {
    			  var padding = _.range(blockSize - self._buffer.length).map(function() { return 0 })
    			  self._buffer = self._buffer.concat(padding)
    			  next()
    			} else {
    				self._buffer = self._buffer.concat(block)
    				next()
    			}
    		})
    	},
    	function(err) {
    		if (err) done(err)
    		else done(null, self._buffer.splice(0, blockSize))
    	}
    )
	}
	
}

var HasInput = {

	initInput: function() {
		this.input = null
	}

}

var DuplexNode = module.exports.DuplexNode = function(inBlockSize) {
	AudioNode.apply(this, arguments)
	this.initInput(inBlockSize)
	this.initOutput()
}
inherits(DuplexNode, AudioNode)
_.extend(DuplexNode.prototype, HasOutput, HasInput)
DuplexNode.extend = utils.chainExtend


var SourceNode = module.exports.SourceNode = function() {
	AudioNode.apply(this, arguments)
	this.initOutput()
}
inherits(SourceNode, AudioNode)
_.extend(SourceNode.prototype, HasOutput)
SourceNode.extend = utils.chainExtend


var SinkNode = module.exports.SinkNode = function(inBlockSize) {
	AudioNode.apply(this, arguments)
	this.initInput(inBlockSize)
}
inherits(SinkNode, AudioNode)
_.extend(SinkNode.prototype, HasInput)
SinkNode.extend = utils.chainExtend
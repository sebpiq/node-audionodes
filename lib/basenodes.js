var inherits = require('util').inherits
	, EventEmitter = require('events').EventEmitter
	, async = require('async')
	, _ = require('underscore')
	, utils = require('./utils')

var AudioNode = module.exports.AudioNode = function() {
	this.init.apply(this, arguments)
}
inherits(AudioNode, EventEmitter)

_.extend(AudioNode.prototype, {

	init: function() {},

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
	
	read: function(blockSize, done) {
		var self = this
		async.whilst(
    	function () { return self._buffer.length < blockSize },
    	function (next) {
    		self.getBlock(function(err, block) {
    			if (err) next(err)
    			else {
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
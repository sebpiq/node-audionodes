var fs = require('fs')
	, wav = require('wav')
	, basenodes = require('./basenodes')
	, utils = require('./utils')

module.exports.SoundFile = basenodes.SourceNode.extend({

  init: function(filename, blockSize) {
	  var self = this
	  
	  // This block size is not guaranteed if for the example EOF is reached
	  // it is just to configure how much data is read at once for the decoding.
    self.blockSize = blockSize || 1024
		self._dataAvail = false
		self._reader = new wav.Reader()
		self._reader.on('readable', function() { self._dataAvail = true })
		self._reader.on('format', function (format) { self.format = format })
		    
	  this.file = fs.createReadStream(filename)
	  
	  this.file.on('open', function() {
		  self.file.pipe(self._reader)
		  self.emit('ready')
	  })
	  this.file.on('error', function(err) {
	    self.emit('error', err)
	  })
  },

  getBlock: function(next) {
    var self = this
      , data = this._reader.read(this.blockSize)
    if (data === null) {
      this.file.once('readable', function() {
        next(null, utils.decodePCM(self._reader.read(self.blockSize)))
      })
    } else next(null, utils.decodePCM(data))
  }

})
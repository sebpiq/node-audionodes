var fs = require('fs')
	, wav = require('wav')
	, basenodes = require('./basenodes')
	, utils = require('./utils')

module.exports.SoundFile = basenodes.SourceNode.extend({

  init: function(filename, blockSize) {
    var self = this
	  
	  // This block size is not guaranteed if for the example EOF is reached
	  // it is just to configure how much data is read at once for the decoding.
    this.blockSize = blockSize || 1024
  	this._decoder = null
    this._eof = false

    // This is the stream from which we'll read wav data
  	this._reader = new wav.Reader()
  	this._reader.on('format', function (format) {
  	  self.format = format
  	  self._decoder = utils.PCMDecoder(format)
  	})
		
    // This is the file stream. We pipe it to the wav stream once open.
	  this._file = fs.createReadStream(filename)
	  this._file.on('open', function() {
		  self._file.pipe(self._reader)
		  self.emit('ready')
	  })
	  this._file.on('error', function(err) {
	    self.emit('error', err)
	  })
  },

  getBlock: function(next) {
    var self = this
      , data = this._reader.read(this.blockSize) || this._reader.read()

    // If the data read from the strean is null there's 2 possibilities:
    // either this is the end of the stream, or we need to request more data
    if (data === null) {
      var onEnd = function() {
          self._reader.removeListener('readable', onReadable)
          self.closed = true
          self.getBlock = function(next) { next(null, []) }
          next(null, [])
        }
        , onReadable = function() {
          self._reader.removeListener('end', onEnd)
          next(null, self._decoder(self._reader.read(self.blockSize)))
        }
        this._reader.once('end', onEnd)
        this._reader.once('readable', onReadable)
    } else next(null, self._decoder(data))
  }

})
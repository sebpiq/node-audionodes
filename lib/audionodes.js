var fs = require('fs')
  , _ = require('underscore')
  , PassThrough = require('stream').PassThrough
	, wav = require('wav')
  , mime = require('mime')
  , ffmpeg = require('fluent-ffmpeg')
	, basenodes = require('./basenodes')
	, utils = require('./utils')


module.exports.SoundFile = basenodes.SourceNode.extend({

  init: function(filename, opts) {
    var self = this
    this.filename = filename
    this._decoder = null
    this._reader = null
    this._file = null

    this.opts = _.defaults(opts || {}, {
      loop: false,
      // This block size is not guaranteed if for the example EOF is reached
      // it is just to configure how much data is read at once for the decoding.
      blockSize: 1024
    })

    this._initStreams(function(err) {
      if (err) self.emit('error', err)
      else self.emit('ready')
    })
  },

  _initStreams: function(done) {
    var self = this

    // If the file is already wav, we directly open a stream to it
    // otherwise, we use a ffmpeg stream to convert it to wav
    if (mime.lookup(this.filename) === 'audio/x-wav') {
      // the stream that decodes the wav file
      this._reader = new wav.Reader()
      this._reader.on('format', function (format) {
        self.format = format
        self._decoder = utils.PCMDecoder(format)
      })
      // the stream that reads the file
      this._file = fs.createReadStream(this.filename)
      this._file.once('open', function() {
        self._file.pipe(self._reader)
        done()
      })
      this._file.once('error', done)
    } else {
      this._reader = new PassThrough()
      this.format = {bitDepth: 16, channels: 1}
      this._decoder = utils.PCMDecoder(this.format)
      this._file = new ffmpeg({source: this.filename, nolog: false})
        .toFormat('s16le')
        .writeToStream(this._reader, function(retCode, err) {
          if (retCode !== 0) done(err)
          else done()
        })
    }
  },

  getBlock: function(done) {
    var self = this
      , data = this._reader.read(this.opts.blockSize) || this._reader.read()

    // If the data read from the strean is null there's 2 possibilities:
    // either this is the end of the stream, or we need to request more data
    if (data === null) {
      var onEnd = function() {
          self._reader.removeListener('readable', onReadable)

          // If loop, we reinit te streams, and get a new block when that's done
          if (self.opts.loop) {
            self._initStreams(function(err) {
              if (err) self.emit('error', err)
              self.getBlock(done)
            })
          // else we just close the node
          } else {
            self.close()
            self.getBlock(done)
          }
        }
        , onReadable = function() {
          self._reader.removeListener('end', onEnd)
          self.getBlock(done)
        }
        this._reader.once('end', onEnd)
        this._reader.once('readable', onReadable)
    } else done(null, self._decoder(data))
  }

})
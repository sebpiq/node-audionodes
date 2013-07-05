var fs = require('fs')
  , _ = require('underscore')
  , PassThrough = require('stream').PassThrough
  , ffmpeg = require('fluent-ffmpeg')
	, basenodes = require('./basenodes')
	, utils = require('./utils')


module.exports.SoundFile = basenodes.SourceNode.extend({

  init: function(filename, opts) {
    var self = this
    this.filename = filename
    this._decoder = null
    this._PCMStream = null
    this._fileStream = null

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

    ffmpeg.Metadata(this.filename, function(metadata, err) {
      if (err) done(err)
      else {
        self._onFormat(metadata)
        self._PCMStream = new PassThrough()
        self._fileStream = new ffmpeg({source: self.filename, nolog: false})
          .toFormat('s16le')
          .writeToStream(self._PCMStream, function(retCode, err) {
            if (retCode !== 0) done(err)
            else done()
          })
      }
    })
  },

  _onFormat: function(obj) {
    var sampleRate = obj.audio.sample_rate
      , bitDepth = 16 //obj.audio.codec // 'pcm_s16le'
      , channels = obj.audio.channels || Math.round(obj.audio.bitrate * 1000 / (sampleRate * bitDepth))
    this.format = {
      sampleRate: sampleRate,
      bitDepth: bitDepth,
      channels: channels
    }
    this._decoder = utils.PCMDecoder(this.format)
  },

  getBlock: function(done) {
    var self = this
      , data = this._PCMStream.read(this.opts.blockSize) || this._PCMStream.read()

    // If the data read from the stream is null there's 2 possibilities:
    // either this is the end of the stream, or we need to request more data
    if (data === null) {
      var onEnd = function() {
          self._PCMStream.removeListener('readable', onReadable)

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
          self._PCMStream.removeListener('end', onEnd)
          self.getBlock(done)
        }
        this._PCMStream.once('end', onEnd)
        this._PCMStream.once('readable', onReadable)
    } else done(null, self._decoder(data))
  }

})
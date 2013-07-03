var assert = require('assert')
  , async = require('async')
  , _ = require('underscore')
  , audionodes = require('../lib/audionodes')
  
describe('SoundFile', function() {

  describe('getBlock', function() {
  
    var round = function(array, dec) { return array.map(function(val) {
      dec = dec || 3
      return Math.round(val * Math.pow(10, dec)) / Math.pow(10, dec)
    })}
  
    it('should read basic wav files', function(done) {
      var soundfile = new audionodes.SoundFile(__dirname + '/sounds/steps.wav', 4410 * 2)
        , blocks = []
        
      soundfile.on('error', function(err) { console.error(err) })
      soundfile.on('ready', function() {
        var sampleCount = 0
        async.whilst(
          function() { return blocks.length < 22 },
          function(next) {
            soundfile.read(4410, function(err, block) {
              if (err) next(err)
              assert.equal(block.length, 4410)
              blocks.push(block.slice(100, 105)) // Pd is not exact with timing
              next()
            })
          },
          function(err) {
            if (err) throw err
            assert.deepEqual(round(blocks[0]), [-1, -1, -1, -1, -1])
            assert.deepEqual(round(blocks[1]), [-0.9, -0.9, -0.9, -0.9, -0.9])
            assert.deepEqual(round(blocks[2]), [-0.8, -0.8, -0.8, -0.8, -0.8])
            assert.deepEqual(round(blocks[3]), [-0.7, -0.7, -0.7, -0.7, -0.7])
            assert.deepEqual(round(blocks[4]), [-0.6, -0.6, -0.6, -0.6, -0.6])
            assert.deepEqual(round(blocks[5]), [-0.5, -0.5, -0.5, -0.5, -0.5])
            assert.deepEqual(round(blocks[6]), [-0.4, -0.4, -0.4, -0.4, -0.4])
            assert.deepEqual(round(blocks[7]), [-0.3, -0.3, -0.3, -0.3, -0.3])
            assert.deepEqual(round(blocks[8]), [-0.2, -0.2, -0.2, -0.2, -0.2])
            assert.deepEqual(round(blocks[9]), [-0.1, -0.1, -0.1, -0.1, -0.1])
            assert.deepEqual(round(blocks[10]), [0, 0, 0, 0, 0])
            assert.deepEqual(round(blocks[11]), [0.1, 0.1, 0.1, 0.1, 0.1])
            assert.deepEqual(round(blocks[12]), [0.2, 0.2, 0.2, 0.2, 0.2])
            assert.deepEqual(round(blocks[13]), [0.3, 0.3, 0.3, 0.3, 0.3])
            assert.deepEqual(round(blocks[14]), [0.4, 0.4, 0.4, 0.4, 0.4])
            assert.deepEqual(round(blocks[15]), [0.5, 0.5, 0.5, 0.5, 0.5])
            assert.deepEqual(round(blocks[16]), [0.6, 0.6, 0.6, 0.6, 0.6])
            assert.deepEqual(round(blocks[17]), [0.7, 0.7, 0.7, 0.7, 0.7])
            assert.deepEqual(round(blocks[18]), [0.8, 0.8, 0.8, 0.8, 0.8])
            assert.deepEqual(round(blocks[19]), [0.9, 0.9, 0.9, 0.9, 0.9])
            assert.deepEqual(round(blocks[20]), [1, 1, 1, 1, 1])
            assert.deepEqual(round(blocks[21]), [0, 0, 0, 0, 0])
            assert.equal(soundfile.closed, true)
            done()
          }
        )
        
        
      })
    })
  
  })

})
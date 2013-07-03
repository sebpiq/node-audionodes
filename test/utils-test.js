var _ = require('underscore')
  , fs = require('fs')
  , assert = require('assert')
  , utils = require('../lib/utils')


describe('utils', function() {

  describe('chainExtend', function() {

    A = function() {}
    A.extend = utils.chainExtend
    A.prototype.blo = 456
    A.prototype.bli = 987
    A.prototype.func = function() { return 'blabla' }

    var B = A.extend({ 'bla': 113, 'bli': 654 })
      , C = B.extend({ 'bla': 112 })
      , b = new B()
      , c = new C()

    it('should work with instanceof', function() {
      assert.ok(b instanceof B)
      assert.ok(b instanceof A)
    })

    it('should work with inherited parameters', function() {
      assert.equal(b.bla, 113)
      assert.equal(b.bli, 654)
      assert.equal(b.blo, 456)

      assert.equal(c.bla, 112)
      assert.equal(c.bli, 654)
      assert.equal(c.blo, 456)
    })

  })
  
  describe('decodePCM', function() {
    
    var round = function(array, dec) { return array.map(function(val) {
      dec = dec || 4
      return Math.round(val * Math.pow(10, 4)) / Math.pow(10, 4)
    })}
    
    it('should decode 16-bits mono', function(done) {
      fs.readFile(__dirname + '/sounds/steps.wav', function(err, data) {
        if (err) throw err
        var buffers = _.range(11).map(function(i) {
          return data.slice(1000 + (4410 * 2) * i, 1000 + (4410 * 2) * i + 10)
        })

        assert.deepEqual(round(utils.decodePCM(buffers[0])), [0, 0, 0, 0, 0])
        assert.deepEqual(round(utils.decodePCM(buffers[1])), [0.1, 0.1, 0.1, 0.1, 0.1])
        assert.deepEqual(round(utils.decodePCM(buffers[2])), [0.2, 0.2, 0.2, 0.2, 0.2])
        assert.deepEqual(round(utils.decodePCM(buffers[3])), [0.3, 0.3, 0.3, 0.3, 0.3])
        assert.deepEqual(round(utils.decodePCM(buffers[4])), [0.4, 0.4, 0.4, 0.4, 0.4])
        assert.deepEqual(round(utils.decodePCM(buffers[5])), [0.5, 0.5, 0.5, 0.5, 0.5])
        assert.deepEqual(round(utils.decodePCM(buffers[6])), [0.6, 0.6, 0.6, 0.6, 0.6])
        assert.deepEqual(round(utils.decodePCM(buffers[7])), [0.7, 0.7, 0.7, 0.7, 0.7])
        assert.deepEqual(round(utils.decodePCM(buffers[8])), [0.8, 0.8, 0.8, 0.8, 0.8])
        assert.deepEqual(round(utils.decodePCM(buffers[9])), [0.9, 0.9, 0.9, 0.9, 0.9])
        assert.deepEqual(round(utils.decodePCM(buffers[10])), [1, 1, 1, 1, 1])
        done()
      })
    })
    
  })

})
var assert = require('assert')
  , _ = require('underscore')
  , async = require('async')
  , audionodes = require('../lib/basenodes')

describe('SourceNode', function() {

  describe('read', function() {
    
    var MySourceNode = audionodes.SourceNode.extend({
    
      init: function() {
        this.counter = -1
      },
    
      getBlock: function(next) {
        this.counter++
        next(null, _.range(this.counter * 10, (this.counter + 1) * 10))
      }
      
    })
    
    it('should read the right amount of data', function(done) {
      var node = new MySourceNode()
      assert.deepEqual(node._buffer, [])
      
      async.waterfall([
        function(next) {
          node.read(5, next)
        },
        function(block, next) {
          assert.deepEqual(block, [0, 1, 2, 3, 4])
          assert.deepEqual(node._buffer, [5, 6, 7, 8, 9])
          node.read(5, next)
        },
        function(block, next) {
          assert.deepEqual(block, [5, 6, 7, 8, 9])
          assert.deepEqual(node._buffer, [])
          node.read(12, next)
        },
        function(block) {
          assert.deepEqual(block, [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21])
          assert.deepEqual(node._buffer, [22, 23, 24, 25, 26, 27, 28, 29])
          done()
        }
      ])
    })
    
  })

})

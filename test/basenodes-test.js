var assert = require('assert')
  , _ = require('underscore')
  , async = require('async')
  , audionodes = require('../lib/basenodes')

describe('SourceNode', function() {

  describe('read', function() {
    
    var MySourceNode = audionodes.SourceNode.extend({
    
      init: function(channels) {
        this.counter = -1
        this.channels = channels || 1
      },
    
      getBlock: function(next) {
        this.counter++
        if (this.counter < 3) {
          if (this.channels === 1) {
            next(null, [_.range(this.counter * 10, (this.counter + 1) * 10)])
          } else {
            next(null, [
              _.range(this.counter * 10, (this.counter + 1) * 10),
              _.range(this.counter * 20, (this.counter + 1) * 20, 2)
            ])
          }
        } else {
          this.close()
          this.getBlock(next)
        }
      }
      
    })
    
    it('should read the right amount of data and buffer the surplus', function(done) {
      var node = new MySourceNode()
      assert.deepEqual(node._buffers, [[]])
      
      async.waterfall([
        function(next) {
          node.read(5, next)
        },
        function(block, next) {
          assert.deepEqual(block, [[0, 1, 2, 3, 4]])
          assert.deepEqual(node._buffers, [[5, 6, 7, 8, 9]])
          node.read(5, next)
        },
        function(block, next) {
          assert.deepEqual(block, [[5, 6, 7, 8, 9]])
          assert.deepEqual(node._buffers, [[]])
          node.read(12, next)
        },
        function(block) {
          assert.deepEqual(block, [[10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]])
          assert.deepEqual(node._buffers, [[22, 23, 24, 25, 26, 27, 28, 29]])
          done()
        }
      ])
    })
    
    it('should read the right amount of data and pad the missing data', function(done) {
      var node = new MySourceNode(2)
      assert.deepEqual(node._buffers, [[], []])
      
      async.waterfall([
        function(next) {
          node.read(25, next)
        },
        function(block, next) {
          assert.deepEqual(node._buffers, [[25, 26, 27, 28, 29], [50, 52, 54, 56, 58]])
          node.read(10, next)
        },
        function(block, next) {
          assert.deepEqual(block, [[25, 26, 27, 28, 29, 0, 0, 0, 0, 0], [50, 52, 54, 56, 58, 0, 0, 0, 0, 0]])
          assert.deepEqual(node._buffers, [[], []])
          node.read(5, next)
        },
        function(block) {
          assert.deepEqual(block, [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0]])
          assert.deepEqual(node._buffers, [[], []])
          done()
        }
      ])
    })
    
  })

})

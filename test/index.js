
/**
 * Module dependencies.
 */

var tiq = require('..')({file: ''}),
    should = require('chai').should();

beforeEach(function() {
  tiq.store = {};
})

describe('TiqJSON#associate', function() {
  it('should associate tags with tokens', function() {
    tiq.associate(['john'], ['hello', 'yes']);
    tiq.store.should.deep.equal({
      'john': ['hello', 'yes'],
      'hello': ['john'],
      'yes': ['john']
    });
  })

  it('should associate tags with tokens using namespaces', function() {
    tiq.associate(['john'], ['hello', 'yes'], 'private');
    tiq.store.should.deep.equal({
      'private:::john': ['hello', 'yes'],
      'private:::hello': ['john'],
      'private:::yes': ['john']
    });
  })

  it('should associate only unique values', function() {
    tiq.associate(['john'], ['hello', 'yes']);
    tiq.associate(['another'], ['john', 'peter']);
    tiq.store.should.deep.equal({
      'john': ['hello', 'yes', 'another'],
      'hello': ['john'],
      'yes': ['john'],
      'another': ['john', 'peter'],
      'peter': ['another']
    });
  })
});

describe('TiqJSON#describe', function() {
  beforeEach(function() {
    this.currentTest.data = {
      'peter': ['what'],
      'what': ['peter'],
      'private:::nope': ['peter'],
      'private:::peter': ['nope']
    };
  })

  it('should return the tags associated with the tokens', function() {
    tiq.store = this._runnable.data;
    tiq.describe(['what']).should.deep.equal(['peter']);
    tiq.describe(['peter']).should.deep.equal(['what']);
  })

  it('should return the tags associated with the tokens using namespaces', function() {
    tiq.store = this._runnable.data;
    tiq.describe(['nope'], 'private').should.deep.equal(['peter']);
    tiq.describe(['peter'], 'private').should.deep.equal(['nope']);
  })
});

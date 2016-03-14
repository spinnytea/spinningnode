'use strict';
var expect = require('chai').expect;
var auto = require('../../lib/battlesudoku/auto');

describe('auto', function() {
  it('init', function() {
    expect(Object.keys(auto)).to.deep.equal(['generate', 'solve']);
  });

  it.skip('generate');

  it.skip('solve');

  describe('units', function() {
    it('init', function() {
      expect(Object.keys(auto.units)).to.deep.equal([]);
    });
  }); // end units
}); // end auto
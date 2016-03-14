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
      expect(Object.keys(auto.units)).to.deep.equal(['availableBoard', 'redoCounts']);
    });

    it('availableBoard', function() {
      var a = auto.units.availableBoard(1, 1);
      expect(a.length).to.equal(1);
      expect(a[0]).to.deep.equal([true]);
      expect(a.row).to.deep.equal([0]);
      expect(a.col).to.deep.equal([0]);

      a = auto.units.availableBoard(2, 3);
      expect(a.length).to.equal(2);
      expect(a[0]).to.deep.equal([true, true, true]);
      expect(a.row).to.deep.equal([0, 0]);
      expect(a.col).to.deep.equal([0, 0, 0]);
    });

    it('redoCounts', function() {
      var a = auto.units.availableBoard(2, 3);
      auto.units.redoCounts(a);

      expect(a.row).to.deep.equal([0, 0]);
      expect(a.col).to.deep.equal([0, 0, 0]);

      a[0][0] = false;
      a[0][1] = false;
      a[1][1] = false;
      auto.units.redoCounts(a);

      expect(a.row).to.deep.equal([2, 1]);
      expect(a.col).to.deep.equal([1, 2, 0]);
    });
  }); // end units
}); // end auto
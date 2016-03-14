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
      expect(Object.keys(auto.units)).to.deep.equal(['availableBoard', 'redoCounts', 'canPlace', 'doPlace']);
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

    it('canPlace', function() {
      var a = auto.units.availableBoard(4, 4);

      expect(auto.units.canPlace(a, 1, 1, 1, true)).to.equal(true);
      expect(auto.units.canPlace(a, 1, 1, 1, false)).to.equal(true);
      expect(auto.units.canPlace(a, 0, 0, 4, true)).to.equal(true);
      expect(auto.units.canPlace(a, 0, 0, 4, false)).to.equal(true);

      expect(auto.units.canPlace(a, -1, 1, 1, true)).to.equal(false);
      expect(auto.units.canPlace(a, 1, -1, 1, true)).to.equal(false);
      expect(auto.units.canPlace(a, 1, 1, 5, true)).to.equal(false);
      expect(auto.units.canPlace(a, 1, 1, 5, false)).to.equal(false);

      a[3][3] = false;

      expect(auto.units.canPlace(a, 0, 0, 4, true)).to.equal(true);
      expect(auto.units.canPlace(a, 1, 0, 4, true)).to.equal(true);
      expect(auto.units.canPlace(a, 2, 0, 4, true)).to.equal(false);
      expect(auto.units.canPlace(a, 3, 0, 4, true)).to.equal(false);
      expect(auto.units.canPlace(a, 2, 0, 2, true)).to.equal(true);
      expect(auto.units.canPlace(a, 3, 0, 2, true)).to.equal(true);

      expect(auto.units.canPlace(a, 0, 0, 3, false)).to.equal(true);
      expect(auto.units.canPlace(a, 0, 1, 3, false)).to.equal(true);
      expect(auto.units.canPlace(a, 0, 2, 3, false)).to.equal(false);
      expect(auto.units.canPlace(a, 0, 3, 3, false)).to.equal(false);
      expect(auto.units.canPlace(a, 0, 2, 2, false)).to.equal(true);
      expect(auto.units.canPlace(a, 0, 3, 2, false)).to.equal(true);
    });

    it('doPlace', function() {
      var a = auto.units.availableBoard(4, 4);

      auto.units.doPlace(a, 0, 0, 4, true);
      expect(a[0]).to.deep.equal([false, false, false, false]);
      expect(a[1]).to.deep.equal([true, true, true, true]);
      expect(a[2]).to.deep.equal([true, true, true, true]);
      expect(a[3]).to.deep.equal([true, true, true, true]);

      auto.units.doPlace(a, 2, 0, 2, false);
      expect(a[0]).to.deep.equal([false, false, false, false]);
      expect(a[1]).to.deep.equal([true, true, true, true]);
      expect(a[2]).to.deep.equal([false, true, true, true]);
      expect(a[3]).to.deep.equal([false, true, true, true]);

      auto.units.doPlace(a, 2, 2, 1, false);
      expect(a[0]).to.deep.equal([false, false, false, false]);
      expect(a[1]).to.deep.equal([true, true, true, true]);
      expect(a[2]).to.deep.equal([false, true, false, true]);
      expect(a[3]).to.deep.equal([false, true, true, true]);
    });
  }); // end units
}); // end auto
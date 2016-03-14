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
      expect(Object.keys(auto.units)).to.deep.equal(['availableBoard', 'getCounts', 'canPlace', 'doPlace', 'pickAPiece']);
    });

    it('availableBoard', function() {
      var a = auto.units.availableBoard(1, 1);
      expect(a).to.deep.equal([[true]]);

      a = auto.units.availableBoard(2, 3);
      expect(a).to.deep.equal([[true, true, true],[true, true, true]]);
    });

    it('getCounts', function() {
      var a = auto.units.availableBoard(2, 3);
      var c = auto.units.getCounts(a);

      expect(c.row).to.deep.equal([0, 0]);
      expect(c.col).to.deep.equal([0, 0, 0]);

      a[0][0] = false;
      a[0][1] = false;
      a[1][1] = false;
      c =  auto.units.getCounts(a);

      expect(c.row).to.deep.equal([2, 1]);
      expect(c.col).to.deep.equal([1, 2, 0]);
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

      expect(a).to.deep.equal([
        [true, true, true, true],
        [true, true, true, true],
        [true, true, true, true],
        [true, true, true, false]
      ]);
    });

    it('doPlace', function() {
      var a = auto.units.availableBoard(4, 4);

      auto.units.doPlace(a, 0, 0, 4, true);
      expect(a).to.deep.equal([
        [false, false, false, false],
        [true, true, true, true],
        [true, true, true, true],
        [true, true, true, true]
      ]);

      auto.units.doPlace(a, 2, 0, 2, false);
      expect(a).to.deep.equal([
        [false, false, false, false],
        [true, true, true, true],
        [false, true, true, true],
        [false, true, true, true]
      ]);

      auto.units.doPlace(a, 2, 2, 1, false);
      expect(a).to.deep.equal([
        [false, false, false, false],
        [true, true, true, true],
        [false, true, false, true],
        [false, true, true, true]
      ]);
    });

    // I'm not sure how to unit test this
    it.skip('pickAPiece');
  }); // end units
}); // end auto
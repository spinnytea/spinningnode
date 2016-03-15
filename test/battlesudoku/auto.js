'use strict';
var _ = require('lodash');
var expect = require('chai').expect;
var auto = require('../../lib/battlesudoku/auto');
var board = require('../../lib/battlesudoku/board');

describe('auto', function() {
  it('init', function() {
    expect(Object.keys(auto)).to.deep.equal(['generate', 'solve']);
  });

  it('generate', function() {
    var b = auto.generate(1);
    expect(b.row).to.deep.equal([{count: 0, total: 1}]);
    expect(b.col).to.deep.equal([{count: 0, total: 1}]);
    expect(b.len).to.deep.equal([{size: 1, done: false}]);
    expect(b[0][0]).to.deep.equal({state: 'none'});

    b = auto.generate(4, 6);
    expect(b.row.length).to.equal(4);
    expect(b.col.length).to.equal(6);
    expect(b.len.length).to.be.greaterThan(0);
    var rowCount = _.sumBy(b.row, 'total');
    var colCount = _.sumBy(b.col, 'total');
    var lenCount = _.sumBy(b.len, 'size');
    expect(lenCount).to.equal(colCount);
    expect(lenCount).to.equal(rowCount);
  });

  // init board with one solution
  // solve, check result
  it('solve', function() {
    var b = board.initBoard([1, 2, 1], [1, 0, 3], [3, 1]);

    expect(b.map(function(r) { return _.map(r, 'state'); })).to.deep.equal([
      ['none', 'none', 'none'],
      ['none', 'none', 'none'],
      ['none', 'none', 'none'],
    ]);

    auto.solve(b);

    expect(b.map(function(r) { return _.map(r, 'state'); })).to.deep.equal([
      ['empty', 'empty', 'fill'],
      ['fill', 'empty', 'fill'],
      ['empty', 'empty', 'fill'],
    ]);
  });

  describe('units', function() {
    it('init', function() {
      expect(Object.keys(auto.units)).to.deep.equal([
        'availableBoard', 'getCounts', 'canPlace', 'doPlace',
        'pickALength', 'findRowLengths', 'findColLengths', 'findAllLengths',
        'recursiveSolve', 'updateRecursiveCounts',
      ]);
    });

    it('availableBoard', function() {
      var a = auto.units.availableBoard(1, 1);
      expect(a).to.deep.equal([[true]]);

      a = auto.units.availableBoard(2, 3);
      expect(a).to.deep.equal([[true, true, true],[true, true, true]]);


      var b = board.initBoard([1, 2, 1], [1, 0, 3], [3, 1]);
      a = auto.units.availableBoard(b);
      expect(a).to.deep.equal([
        [true, true, true],
        [true, true, true],
        [true, true, true],
      ]);

      b[0][2].state = 'fill';
      b[1][2].state = 'fill';
      a = auto.units.availableBoard(b);
      expect(a).to.deep.equal([
        [true, true, false],
        [true, true, false],
        [true, true, true],
      ]);
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
    it.skip('pickALength');

    it('findRowLengths', function() {
      var a = auto.units.availableBoard(4, 3);
      a[3][2] = false;

      expect(auto.units.findRowLengths(a, 1)).to.deep.equal([{r:1,c:0,l:3,d:true}]);
      expect(auto.units.findRowLengths(a, 2)).to.deep.equal([{r:2,c:0,l:1,d:true}]);

      expect(auto.units.findRowLengths(a, 0, 2)).to.deep.equal([{r:0,c:0,l:2,d:true}, {r:0,c:1,l:2,d:true}]);
      expect(auto.units.findRowLengths(a, 3, 2)).to.deep.equal([]);

      expect(auto.units.findRowLengths(a, 0, 2, [1, 1, 0])).to.deep.equal([{r:0,c:0,l:2,d:true}]);
    });

    it('findColLengths', function() {
      var a = auto.units.availableBoard(4, 3);
      a[3][2] = false;

      expect(auto.units.findColLengths(a, 0)).to.deep.equal([{r:0,c:0,l:4,d:false}]);
      expect(auto.units.findColLengths(a, 2)).to.deep.equal([{r:0,c:2,l:2,d:false}]);

      expect(auto.units.findColLengths(a, 0, 3)).to.deep.equal([{r:0,c:0,l:3,d:false}, {r:1,c:0,l:3,d:false}]);
      expect(auto.units.findColLengths(a, 2, 3)).to.deep.equal([]);

      expect(auto.units.findColLengths(a, 0, 3, [1, 1, 1, 0])).to.deep.equal([{r:0,c:0,l:3,d:false}]);
    });

    it('findAllLengths', function() {
      var a = auto.units.availableBoard(4, 3);
      a[3][2] = false;
      expect(auto.units.findAllLengths(a)).to.deep.equal([{r:0,c:0,l:4,d:false}]);
      expect(auto.units.findAllLengths(a, 3)).to.deep.equal([
        {r:0,c:0,l:3,d:true}, {r:1,c:0,l:3,d:true},
        {r:0,c:0,l:3,d:false}, {r:1,c:0,l:3,d:false}
      ]);
      expect(auto.units.findAllLengths(a, 2).length).to.equal(9);
      // 311 9
      // ---+
      // 000|2
      // 000|2
      // 000|0
      // 001|0
    });

    it('recursiveSolve', function() {
      expect(auto.units.recursiveSolve([[false]], [], {row:[0],col:[0]})).to.deep.equal([[false]]);
      expect(auto.units.recursiveSolve([[true]], [1], {row:[1],col:[1]})).to.deep.equal([[false]]);
      expect(auto.units.recursiveSolve([[true, true]], [2], {row:[2],col:[1, 1]})).to.deep.equal([[false, false]]);
    });

    it('updateRecursiveCounts', function() {
      expect(auto.units.updateRecursiveCounts({ row: [1, 2, 1], col: [1, 0, 3] }, {r:1,c:0,l:1,d:true}))
        .to.deep.equal({ row: [1, 1, 1], col: [0, 0, 3] });
      expect(auto.units.updateRecursiveCounts({ row: [1, 2, 1], col: [1, 0, 3] }, {r:0,c:2,l:3,d:false}))
        .to.deep.equal({ row: [0, 1, 0], col: [1, 0, 0] });
    });
  }); // end units
}); // end auto
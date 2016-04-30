'use strict';
var _ = require('lodash');
var expect = require('chai').expect;
var auto = require('../../lib/battlesudoku/auto');
var board = require('../../lib/battlesudoku/board');

function invalid_resolve() {
  throw new Error('this test should fail');
}
function invalid_reject() {
  if(_.isError(arguments[0])) throw arguments[0];
  throw new Error('this test should succeed');
}
function board_state(b) {
  return b.map(function(r) { return _.map(r, 'state'); })
}

describe('auto', function() {
  it('init', function() {
    expect(Object.keys(auto)).to.deep.equal(['generate', 'solve']);
  });

  it('generate', function() {
    var b = auto.generate(1);
    expect(b.row).to.deep.equal([{count: 0, total: 1}]);
    expect(b.col).to.deep.equal([{count: 0, total: 1}]);
    expect(b.len).to.deep.equal([{size: 1, done: false, over: false}]);
    expect(b.hints.length).to.equal(1);
    expect(b[0][0]).to.deep.equal({state: 'none'});

    b = auto.generate(4, 6);
    expect(b.row.length).to.equal(4);
    expect(b.col.length).to.equal(6);
    expect(b.len.length).to.be.greaterThan(0);
    expect(b.hints.length).to.equal(3);
    var rowCount = _.sumBy(b.row, 'total');
    var colCount = _.sumBy(b.col, 'total');
    var lenCount = _.sumBy(b.len, 'size');
    expect(lenCount).to.equal(colCount);
    expect(lenCount).to.equal(rowCount);
  });

  // init board with one solution
  // solve, check result
  it('solve', function(done) {
    var b = board.initBoard([1, 2, 1], [1, 0, 3], [3, 1]);

    expect(board_state(b)).to.deep.equal([
      ['none', 'none', 'none'],
      ['none', 'none', 'none'],
      ['none', 'none', 'none'],
    ]);

    auto.solve(b, Promise).then(function() {
      expect(board.checkWin(b)).to.equal(true);
      expect(board_state(b)).to.deep.equal([
        ['empty', 'empty', 'fill'],
        ['fill', 'empty', 'fill'],
        ['empty', 'empty', 'fill'],
      ]);
    }, invalid_reject).then(done, done);
  });

  describe('units', function() {
    it('init', function() {
      expect(Object.keys(auto.units)).to.deep.equal([
        'availableBoard', 'getCounts', 'canPlace', 'doPlace',
        'pickALength', 'findRowLengths', 'findColLengths', 'findAllLengths', 'findAllLengthsForL',
        'recursiveSolve', 'updateRecursiveCounts', 'updateBoard',
        'findRowMust', 'findColMust', 'findAllMust', 'findMustPossibilities', 'pickAMust',
        'recursiveMust',
      ]);
    });

    it('availableBoard', function() {
      var a = auto.units.availableBoard(1, 1);
      expect(a).to.deep.equal([['none']]);

      a = auto.units.availableBoard(2, 3);
      expect(a).to.deep.equal([['none', 'none', 'none'],['none', 'none', 'none']]);


      var b = board.initBoard([1, 2, 1], [1, 0, 3], [3, 1]);
      a = auto.units.availableBoard(b);
      expect(a).to.deep.equal([
        ['none', 'none', 'none'],
        ['none', 'none', 'none'],
        ['none', 'none', 'none'],
      ]);

      b[0][2].state = 'fill';
      b[1][2].state = 'fill';
      a = auto.units.availableBoard(b);
      expect(a).to.deep.equal([
        ['none', 'none', 'must'],
        ['none', 'none', 'must'],
        ['none', 'none', 'none'],
      ]);
    });

    it('getCounts', function() {
      var a = auto.units.availableBoard(2, 3);
      var c = auto.units.getCounts(a);

      expect(c.row).to.deep.equal([0, 0]);
      expect(c.col).to.deep.equal([0, 0, 0]);

      a[0][0] = 'fill';
      a[0][1] = 'fill';
      a[1][1] = 'fill';
      c = auto.units.getCounts(a);

      expect(c.row).to.deep.equal([2, 1]);
      expect(c.col).to.deep.equal([1, 2, 0]);

      c = auto.units.getCounts(a, 'none');

      expect(c.row).to.deep.equal([1, 2]);
      expect(c.col).to.deep.equal([1, 0, 2]);
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

      a[3][3] = 'fill';

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

      a[1][1] = 'empty';

      expect(auto.units.canPlace(a, 0, 0, 4, true)).to.equal(true);
      expect(auto.units.canPlace(a, 1, 0, 4, true)).to.equal(false);
      expect(auto.units.canPlace(a, 2, 0, 2, true)).to.equal(true);
      expect(auto.units.canPlace(a, 0, 0, 3, false)).to.equal(true);
      expect(auto.units.canPlace(a, 0, 1, 3, false)).to.equal(false);
      expect(auto.units.canPlace(a, 0, 2, 2, false)).to.equal(true);

      a[1][1] = 'must';

      expect(auto.units.canPlace(a, 0, 0, 4, true)).to.equal(false);
      expect(auto.units.canPlace(a, 1, 0, 4, true)).to.equal(true);
      expect(auto.units.canPlace(a, 1, 0, 1, true)).to.equal(false);
      expect(auto.units.canPlace(a, 2, 0, 2, true)).to.equal(false);
      expect(auto.units.canPlace(a, 0, 0, 3, false)).to.equal(false);
      expect(auto.units.canPlace(a, 0, 1, 3, false)).to.equal(true);
      expect(auto.units.canPlace(a, 0, 1, 1, false)).to.equal(false);
      expect(auto.units.canPlace(a, 0, 2, 2, false)).to.equal(false);

      expect(a).to.deep.equal([
        ['none', 'none', 'none', 'none'],
        ['none', 'must', 'none', 'none'],
        ['none', 'none', 'none', 'none'],
        ['none', 'none', 'none', 'fill']
      ]);
    });

    it('canPlace lengths', function() {
      var a = auto.units.availableBoard(3, 3);
      expect(auto.units.canPlace(a, 0, 0, 3, true, {row:[3,0,0], col:[1,1,1]})).to.equal(true);
      expect(auto.units.canPlace(a, 0, 0, 3, true, {row:[3,0,0], col:[1,1,0]})).to.equal(false);
      expect(auto.units.canPlace(a, 0, 0, 3, true, {row:[2,0,0], col:[1,1,1]})).to.equal(false);
      expect(auto.units.canPlace(a, 0, 0, 3, false, {row:[1,1,1], col:[3,0,0]})).to.equal(true);
      expect(auto.units.canPlace(a, 0, 0, 3, false, {row:[1,1,0], col:[3,0,0]})).to.equal(false);
      expect(auto.units.canPlace(a, 0, 0, 3, false, {row:[1,1,1], col:[2,0,0]})).to.equal(false);
    });

    it('doPlace', function() {
      var a = auto.units.availableBoard(4, 4);

      auto.units.doPlace(a, 0, 0, 4, true);
      expect(a).to.deep.equal([
        ['fill', 'fill', 'fill', 'fill'],
        ['none', 'none', 'none', 'none'],
        ['none', 'none', 'none', 'none'],
        ['none', 'none', 'none', 'none']
      ]);

      auto.units.doPlace(a, 2, 0, 2, false);
      expect(a).to.deep.equal([
        ['fill', 'fill', 'fill', 'fill'],
        ['none', 'none', 'none', 'none'],
        ['fill', 'none', 'none', 'none'],
        ['fill', 'none', 'none', 'none']
      ]);

      auto.units.doPlace(a, 2, 2, 1, false);
      expect(a).to.deep.equal([
        ['fill', 'fill', 'fill', 'fill'],
        ['none', 'none', 'none', 'none'],
        ['fill', 'none', 'fill', 'none'],
        ['fill', 'none', 'none', 'none']
      ]);
    });

    // I'm not sure how to unit test this
    it.skip('pickALength');

    it('findRowLengths', function() {
      var a = auto.units.availableBoard(4, 3);
      a[3][2] = 'fill';

      expect(auto.units.findRowLengths(a, 1)).to.deep.equal([{r:1,c:0,l:3,d:true}]);
      expect(auto.units.findRowLengths(a, 2)).to.deep.equal([{r:2,c:0,l:1,d:true}]);

      expect(auto.units.findRowLengths(a, 0, 2)).to.deep.equal([{r:0,c:0,l:2,d:true}, {r:0,c:1,l:2,d:true}]);
      expect(auto.units.findRowLengths(a, 3, 2)).to.deep.equal([]);

      expect(auto.units.findRowLengths(a, 0, 2, [1, 1, 0])).to.deep.equal([{r:0,c:0,l:2,d:true}]);
    });

    it('findColLengths', function() {
      var a = auto.units.availableBoard(4, 3);
      a[3][2] = 'fill';

      expect(auto.units.findColLengths(a, 0)).to.deep.equal([{r:0,c:0,l:4,d:false}]);
      expect(auto.units.findColLengths(a, 2)).to.deep.equal([{r:0,c:2,l:2,d:false}]);

      expect(auto.units.findColLengths(a, 0, 3)).to.deep.equal([{r:0,c:0,l:3,d:false}, {r:1,c:0,l:3,d:false}]);
      expect(auto.units.findColLengths(a, 2, 3)).to.deep.equal([]);

      expect(auto.units.findColLengths(a, 0, 3, [1, 1, 1, 0])).to.deep.equal([{r:0,c:0,l:3,d:false}]);
    });

    it('findAllLengths', function() {
      var a = auto.units.availableBoard(4, 3);
      a[3][2] = 'fill';
      expect(auto.units.findAllLengths(a, true)).to.deep.equal([
        {r:0,c:0,l:3,d:true}, {r:1,c:0,l:3,d:true},
      ]);
      expect(auto.units.findAllLengths(a, false)).to.deep.equal([
        {r:0,c:0,l:4,d:false},
      ]);
    });

    it('findAllLengthsForL', function() {
      var a = auto.units.availableBoard(4, 3);
      a[3][2] = 'fill';

      expect(auto.units.findAllLengthsForL(a, 2, { row:[0,0,0,0],col:[0,0,0] })).to.deep.equal([]);
      expect(auto.units.findAllLengthsForL(a, 2, { row:[0,2,2,0],col:[2,2,0] })).to.deep.equal([
        {r:1,c:0,l:2,d:true}, {r:1,c:0,l:2,d:false},
      ]);
      expect(auto.units.findAllLengthsForL(a, 3, { row:[3,3,1,0],col:[3,1,1] })).to.deep.equal([
        {r:0,c:0,l:3,d:true}, {r:1,c:0,l:3,d:true},
        {r:0,c:0,l:3,d:false},
      ]);
    });

    describe('recursiveSolve', function() {
      it('nothing to do', function(done) {
        auto.units.recursiveSolve([['fill']], [], {row:[0],col:[0]}, Promise).then(function(result) {
          expect(result).to.deep.equal([['fill']]);
        }, invalid_reject).then(done, done);
      });

      it('nowhere to place piece', function(done) {
        var count = 0;
        function notify() { count++; }
        auto.units.recursiveSolve([['none', 'none']], [1], {row:[0],col:[0]}, Promise, notify)
          .then(invalid_resolve, function() {
            expect(count).to.equal(1);
          })
          .then(done, done);
      });

      it('marked empty', function(done) {
        var count = 0;
        function notify() { count++; }
        auto.units.recursiveSolve([['empty']], [1], {row:[1],col:[1]}, Promise, notify)
          .then(invalid_resolve, function() {
            expect(count).to.equal(1);
          })
          .then(done, done);
      });

      it('only one', function(done) {
        auto.units.recursiveSolve([['none']], [1], {row:[1],col:[1]}, Promise).then(function(result) {
          expect(result).to.deep.equal([['fill']]);
        }, invalid_reject).then(done, done);
      });

      it('simple', function(done) {
        auto.units.recursiveSolve([['none', 'none']], [2], {row:[2],col:[1, 1]}, Promise).then(function(result) {
          expect(result).to.deep.equal([['fill', 'fill']]);
        }, invalid_reject).then(done, done);
      });

      it.skip('verify recursive copy/no copy');

      it.skip('complicated');
    }); // end recursiveSolve

    it('updateRecursiveCounts', function() {
      expect(auto.units.updateRecursiveCounts({ row: [1, 2, 1], col: [1, 0, 3] }, {r:1,c:0,l:1,d:true}))
        .to.deep.equal({ row: [1, 1, 1], col: [0, 0, 3] });
      expect(auto.units.updateRecursiveCounts({ row: [1, 2, 1], col: [1, 0, 3] }, {r:0,c:2,l:3,d:false}))
        .to.deep.equal({ row: [0, 1, 0], col: [1, 0, 0] });
    });

    it('updateBoard', function() {
      var b = board.initBoard([1, 0], [1, 0], [1]);
      auto.units.updateBoard([['fill', 'none'], ['empty', 'none']], b, true);
      expect(board_state(b)).to.deep.equal([
        ['fill', 'empty'],
        ['empty', 'empty'],
      ]);

      auto.units.updateBoard([['fill', 'none'], ['empty', 'none']], b);
      expect(board_state(b)).to.deep.equal([
        ['fill', 'none'],
        ['empty', 'none'],
      ]);
    });

    it('findRowMust', function() {
      expect(auto.units.findRowMust([['none']], 0))
        .to.deep.equal([]);
      expect(auto.units.findRowMust([['must', 'none', 'must', 'must']], 0))
        .to.deep.equal([{r:0,c:0,l:1,d:true},{r:0,c:2,l:2,d:true}]);
      expect(auto.units.findRowMust([['none', 'none', 'none', 'none'],['none', 'must', 'must', 'none'],['none', 'none', 'none', 'none']], 1))
        .to.deep.equal([{r:1,c:1,l:2,d:true}]);
      expect(auto.units.findRowMust([['must'],['must']], 0))
        .to.deep.equal([]);
      expect(auto.units.findRowMust([['must'],['must']], 1))
        .to.deep.equal([]);
    });

    it('findColMust', function() {
      expect(auto.units.findColMust([['none']], 0))
        .to.deep.equal([]);
      expect(auto.units.findColMust([['must'],['none'],['must'],['must']], 0))
        .to.deep.equal([{r:0,c:0,l:1,d:false},{r:2,c:0,l:2,d:false}]);
      expect(auto.units.findColMust([['none','none','none'],['none','must','none'],['none','must','none'],['none','none','none']], 1))
        .to.deep.equal([{r:1,c:1,l:2,d:false}]);
      expect(auto.units.findColMust([['must','must']], 0))
        .to.deep.equal([]);
      expect(auto.units.findColMust([['must','must']], 1))
        .to.deep.equal([]);
    });

    it('findAllMust', function() {
      expect(auto.units.findAllMust([
        ['must', 'must', 'must', 'none'],
        ['none', 'none', 'none', 'none'],
        ['must', 'none', 'must', 'none'],
        ['none', 'none', 'none', 'none']
      ])).to.deep.equal([
        {r:0,c:0,l:3,d:true},{r:2,c:0,l:1,d:true},{r:2,c:2,l:1,d:true},
        {r:2,c:0,l:1,d:false},{r:2,c:2,l:1,d:false},
      ]);

      expect(auto.units.findAllMust([
        ['fill', 'fill', 'fill', 'fill'],
        ['none', 'none', 'none', 'none'],
        ['must', 'none', 'must', 'none'],
        ['none', 'none', 'none', 'none']
      ])).to.deep.equal([
        {r:2,c:0,l:1,d:true},{r:2,c:2,l:1,d:true},
        {r:2,c:0,l:1,d:false},{r:2,c:2,l:1,d:false},
      ]);
    });

    it('findMustPossibilities', function() {
      expect(auto.units.findMustPossibilities([['none','must','none']], {r:0,c:1,l:1,d:true}, [2], {row:[2],col:[1,1,1]}))
        .to.deep.equal([{r:0,c:1,l:2,d:true},{r:0,c:0,l:2,d:true}]);
      expect(auto.units.findMustPossibilities([['none'],['must'],['none']], {r:1,c:0,l:1,d:false}, [2], {row:[1,1,1],col:[2]}))
        .to.deep.equal([{r:1,c:0,l:2,d:false},{r:0,c:0,l:2,d:false}]);

      expect(auto.units.findMustPossibilities([['none', 'none','must','none']], {r:0,c:2,l:1,d:true}, [2], {row:[2],col:[0, 1,1,0]}))
        .to.deep.equal([{r:0,c:1,l:2,d:true}]);

      expect(auto.units.findMustPossibilities([
        ['must', 'must', 'must', 'none'],
        ['none', 'none', 'none', 'none'],
        ['must', 'none', 'must', 'none'],
        ['none', 'none', 'none', 'none']
      ], {r:0,c:0,l:3,d:true}, [4, 2, 1], {row:[4,0,2,1],col:[3,1,2,1]})).to.deep.equal([
        {r:0,c:0,l:4,d:true}
      ]);

      expect(auto.units.findMustPossibilities([
        ['must', 'must', 'must', 'none'],
        ['none', 'none', 'none', 'none'],
        ['must', 'none', 'must', 'none'],
        ['none', 'none', 'none', 'none']
      ], {r:2,c:0,l:1,d:true}, [4, 2, 1], {row:[4,0,2,1],col:[3,1,2,1]})).to.deep.equal([
        {r:2,c:0,l:1,d:true}
      ]);

      expect(auto.units.findMustPossibilities([
        ['must', 'must', 'must', 'none'],
        ['none', 'none', 'none', 'none'],
        ['must', 'none', 'must', 'none'],
        ['none', 'none', 'none', 'none']
      ], {r:2,c:2,l:1,d:true}, [4, 2, 1], {row:[4,0,2,1],col:[3,1,2,1]})).to.deep.equal([
        {r:2,c:2,l:2,d:true}, {r:2,c:2,l:1,d:true}
      ]);

      expect(auto.units.findMustPossibilities([
        ['must', 'must', 'must', 'none'],
        ['none', 'none', 'none', 'none'],
        ['must', 'none', 'must', 'none'],
        ['none', 'none', 'none', 'none']
      ], {r:2,c:0,l:1,d:false}, [4, 2, 1], {row:[4,0,2,1],col:[3,1,2,1]})).to.deep.equal([
        {r:2,c:0,l:2,d:false}, {r:2,c:0,l:1,d:false}
      ]);

      expect(auto.units.findMustPossibilities([
        ['must', 'must', 'must', 'none'],
        ['none', 'none', 'none', 'none'],
        ['must', 'none', 'must', 'none'],
        ['none', 'none', 'none', 'none']
      ], {r:2,c:2,l:1,d:false}, [4, 2, 1], {row:[4,0,2,1],col:[3,1,2,1]})).to.deep.equal([
        {r:2,c:2,l:2,d:false}, {r:2,c:2,l:1,d:false}
      ]);

      expect(auto.units.findMustPossibilities([
        ['none', 'none', 'none'],
        ['none', 'none', 'none'],
        ['none', 'must', 'none'],
      ], {r:2,c:1,l:1,d:true}, [2, 1], {row:[2,0,1],col:[0,2,1]})).to.deep.equal([
        {r:2,c:1,l:1,d:true}
      ]);
      expect(auto.units.findMustPossibilities([
        ['none', 'none', 'none'],
        ['none', 'none', 'none'],
        ['none', 'must', 'none'],
      ], {r:2,c:1,l:1,d:false}, [2, 1], {row:[2,0,1],col:[0,2,1]})).to.deep.equal([
        {r:2,c:1,l:1,d:false}
      ]);
    });

    it('pickAMust', function() {
      expect(auto.units.pickAMust([
        ['must', 'must', 'must', 'none'],
        ['none', 'none', 'none', 'none'],
        ['must', 'none', 'must', 'none'],
        ['none', 'none', 'none', 'none']
      ], [4, 2, 1], {row:[4,0,2,1],col:[3,1,2,1]})).to.deep.equal([
        {r:0,c:0,l:4,d:true}
      ]);

      var dupLengths = [2, 2, 2, 2, 2, 1];
      expect(auto.units.pickAMust([
        ['fill', 'fill', 'fill', 'fill'],
        ['none', 'none', 'none', 'none'],
        ['must', 'none', 'must', 'none'],
        ['none', 'none', 'none', 'none']
      ], dupLengths, {row:[4,0,2,1],col:[3,1,2,1]})).to.deep.equal([
        {r:2,c:0,l:1,d:true}, {r:2,c:0,l:2,d:false}, {r:2,c:0,l:1,d:false}
      ]);

      expect(auto.units.pickAMust([
        ['fill', 'fill', 'fill', 'fill'],
        ['none', 'none', 'none', 'none'],
        ['fill', 'none', 'none', 'none'],
        ['fill', 'none', 'none', 'none']
      ], [1], {row:[4,0,2,1],col:[3,1,2,1]})).to.deep.equal([]);
    });

    describe('recursiveMust', function() {
      it('nothing to do', function(done) {
        auto.units.recursiveMust([['fill']], [], {row:[0],col:[0]}, Promise).then(function(result) {
          expect(result).to.deep.equal([['fill']]);
        }, invalid_reject).then(done, done);
      });

      it('only one', function(done) {
        auto.units.recursiveMust([['must']], [1], {row:[1],col:[1]}, Promise).then(function(result) {
          expect(result).to.deep.equal([['fill']]);
        }, invalid_reject).then(done, done);
      });

      it('simple', function(done) {
        auto.units.recursiveMust([
          ['must', 'must', 'must', 'none'],
          ['none', 'none', 'none', 'none'],
          ['must', 'none', 'none', 'none'],
          ['none', 'none', 'none', 'none']
        ], [4, 2, 1], {row:[4,0,2,1],col:[3,1,2,1]}, Promise).then(function(result) {
          expect(result).to.deep.equal([
            ['fill', 'fill', 'fill', 'fill'],
            ['none', 'none', 'none', 'none'],
            ['fill', 'none', 'fill', 'none'],
            ['fill', 'none', 'none', 'none']
          ]);
        }, invalid_reject).then(done, done);
      });

      it('impossible', function(done) {
        var count = 0;
        function notify() { count++; }
        auto.units.recursiveMust([
          ['must', 'must', 'must', 'none'],
          ['none', 'none', 'none', 'none'],
          ['must', 'none', 'none', 'none'],
          ['none', 'none', 'none', 'none']
        ], [4, 2, 2, 1], {row:[4,0,2,1],col:[3,1,2,1]}, Promise, notify).then(invalid_resolve, function() {
          expect(count).to.equal(3);
        }).then(done, done);
      });
    }); // end recursiveMust
  }); // end units

  describe('integration', function() {
    describe('solve', function() {
      it('optimized failure', function(done) {
        // an unintelligent solver will fail after 7680 attempts
        var b = board.initBoard([3, 1, 3, 1, 2], [3, 0, 4, 0, 3], [4, 1, 1, 1, 1, 1, 1]);
        b[1][2].state = 'fill';
        b[2][2].state = 'fill';
        b[3][2].state = 'fill';
        b[4][2].state = 'fill';
        board.checkWin(b);

        var count = 0;
        function notify() { count++; }
        auto.solve(b, Promise, notify).then(invalid_resolve, function() {
          // check the async path
          // verify our steps
          expect(count).to.equal(48);
          // after some improvements, we can do even better
          // expect(count).to.equal(1);
        }).then(function() {
          // check the inline path
          // this this will timeout if not optimized
          return auto.solve(b, Promise);
        }, invalid_reject).then(invalid_resolve, done);
      });

      describe('can handle musts', function() {
        it('A', function(done) {
          var b = board.initBoard([1, 2, 1], [2, 0, 2], [2, 2]);
          b[0][0].state = 'fill';
          b[1][0].state = 'fill';
          board.checkWin(b);
          auto.solve(b, Promise).then(function() {
            expect(board_state(b)).to.deep.equal([
              ['fill', 'empty', 'empty'],
              ['fill', 'empty', 'fill'],
              ['empty', 'empty', 'fill'],
            ]);
          }, invalid_reject).then(done, done);
        });

        it('B', function(done) {
          var b = board.initBoard([1, 2, 1], [2, 0, 2], [2, 2]);
          b[0][2].state = 'fill';
          board.checkWin(b);
          auto.solve(b, Promise).then(function() {
            expect(board_state(b)).to.deep.equal([
              ['empty', 'empty', 'fill'],
              ['fill', 'empty', 'fill'],
              ['fill', 'empty', 'empty'],
            ]);
          }, invalid_reject).then(done, done);
        });
      }); // end can handle must


      it('found a bug with counts', function(done) {
        var b = board.initBoard([2, 0, 1], [0, 2, 1], [2, 1]);
        b[2][1].state = 'fill';
        board.checkWin(b);
        auto.solve(b, Promise).then(function() {
          expect(board_state(b)).to.deep.equal([
            ['empty', 'fill', 'fill'],
            ['empty', 'empty', 'empty'],
            ['empty', 'fill', 'empty'],
          ]);
        }, invalid_reject).then(done, done);
      });
    }); // end solve
  }); // end integration
}); // end auto
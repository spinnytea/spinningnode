'use strict';
var expect = require('chai').expect;
var board = require('../../lib/battlesudoku/board');

describe('board', function() {
  it('init', function() {
    expect(Object.keys(board)).to.deep.equal(['initBoard', 'reset', 'hint', 'redoCounts', 'checkWin']);
  });

  it('initBoard', function() {
    var b = board.initBoard([1, 2, 1], [2, 0, 0, 2], [2, 2]);

    expect(b.length).to.equal(3);
    expect(b[0].length).to.equal(4);
    expect(b[1].length).to.equal(4);
    expect(b[2].length).to.equal(4);

    expect(b[0][0]).to.deep.equal({state:'none'});
    expect(b.col[0]).to.deep.equal({count:0,total:2});
    expect(b.row[0]).to.deep.equal({count:0,total:1});
    expect(b.len[0]).to.deep.equal({size:2,done:false,over:false});
  });

  it.skip('reset');

  it('hint', function() {
    var b = board.initBoard([1, 0, 1], [1, 0, 1], [1, 1], [{r:1,c:1,state:'empty'},{r:2,c:0,state:'fill'}]);
    expect(b[1][1].state).to.equal('none');
    expect(b[2][0].state).to.equal('none');

    board.hint(b);

    expect(b[1][1].state).to.equal('empty');
    expect(b[2][0].state).to.equal('fill');
  });

  it.skip('redoCounts');

  it.skip('checkWin'); // this is sort of an integration test

  describe('units', function() {
    var b = board.initBoard([1, 0, 1], [1, 0, 1], [1, 1]);
    afterEach(function() {
      b[0][0].state = 'none';
      b[0][1].state = 'none';
      b[1][0].state = 'none';
      b[1][1].state = 'none';
    });

    it('init', function() {
      expect(Object.keys(board.units)).to.deep.equal(['getCell', 'getCellFill', 'checkInvalid', 'checkLengths']);
    });

    it('getCell', function() {
      expect(board.units.getCell(b, 0, 0)).to.equal(b[0][0]);
      expect(board.units.getCell(b, 1, 0)).to.equal(b[1][0]);
      expect(board.units.getCell(b, 3, 0)).to.equal(undefined);
      expect(board.units.getCell(b, -1, 0)).to.equal(undefined);
      expect(board.units.getCell(b, 0, -1)).to.equal(undefined);
      expect(board.units.getCell(b, 0, 3)).to.equal(undefined);
    });

    it('getCellFill', function() {
      expect(board.units.getCellFill(b, 0, 0)).to.equal(false);
      b[1][1].state = 'fill';
      expect(board.units.getCellFill(b, 1, 1)).to.equal(true);
      b[1][1].state = 'empty';
      expect(board.units.getCellFill(b, 1, 1)).to.equal(false);
      expect(b[1][3]).to.equal(undefined);
      expect(board.units.getCellFill(b, 1, 3)).to.equal(false);
    });

    it.skip('checkInvalid');

    it('checkInvalid.checkDiagonal', function() {
      b[0][1].state = 'fill';
      expect(board.units.checkInvalid.checkDiagonal(b, 0, 1)).to.equal(false);
      b[1][0].state = 'fill';
      expect(board.units.checkInvalid.checkDiagonal(b, 0, 1)).to.equal(true);
    });

    it('checkLengths', function() {
      b[0][0].state = 'fill';
      b[1][0].state = 'fill';
      b[2][0].state = 'fill';
      b[2][2].state = 'fill';

      board.units.checkLengths(b);
      expect(b.len).to.deep.equal([{size:1,done:true,over:false},{size:1,done:false,over:false}]);

      b[0][2].state = 'fill';

      board.units.checkLengths(b);
      expect(b.len).to.deep.equal([{size:1,done:true,over:false},{size:1,done:true,over:false}]);

      b[2][2].state = 'empty';
      b[0][2].state = 'empty';

      board.units.checkLengths(b);
      expect(b.len).to.deep.equal([{size:1,done:false,over:false},{size:1,done:false,over:false}]);

      b[1][0].state = 'empty';

      board.units.checkLengths(b);
      expect(b.len).to.deep.equal([{size:1,done:true,over:false},{size:1,done:true,over:false}]);

      b[2][2].state = 'fill';
      
      board.units.checkLengths(b);
      expect(b.len).to.deep.equal([{size:1,done:false,over:true},{size:1,done:false,over:true}]);

      b[1][0].state = 'fill';

      board.units.checkLengths(b);
      expect(b.len).to.deep.equal([{size:1,done:true,over:false},{size:1,done:false,over:false}]);
    });

    it('checkLengths.project', function() {
      b[0][0].state = 'fill';
      b[1][0].state = 'fill';
      b[2][0].state = 'fill';
      expect(board.units.checkLengths.project(b, 0, 0, 1, 0)).to.equal(3);
      expect(board.units.checkLengths.project(b, 0, 0, 0, 1)).to.equal(1);
      b[1][0].invalid = true;
      expect(board.units.checkLengths.project(b, 0, 0, 1, 0)).to.equal(undefined);
      expect(board.units.checkLengths.project(b, 0, 0, 0, 1)).to.equal(1);
    });
  }); // end units
}); // end board
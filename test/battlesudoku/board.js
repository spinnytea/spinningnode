'use strict';
var expect = require('chai').expect;
var board = require('../../lib/battlesudoku/board');

describe('board', function() {
  it('initBoard', function() {
    var b = board.initBoard([1, 2, 1], [2, 0, 0, 2], [2, 2]);

    expect(b.length).to.equal(3);
    expect(b[0].length).to.equal(4);
    expect(b[1].length).to.equal(4);
    expect(b[2].length).to.equal(4);

    expect(b[0][0]).to.deep.equal({state:'none'});
    expect(b.col[0]).to.deep.equal({count:0,total:2});
    expect(b.row[0]).to.deep.equal({count:0,total:1});
    expect(b.len[0]).to.deep.equal({size:2,done:false});
  });

  it.skip('redoCounts');

  it.skip('checkWin'); // this is sort of an integration test

  describe('units', function() {
    var b = board.initBoard([1, 0], [1, 0], [1]);
    afterEach(function() {
      b[0][0].state = 'none';
      b[0][1].state = 'none';
      b[1][0].state = 'none';
      b[1][1].state = 'none';
    });

    it('getCell', function() {
      expect(board.units.getCell(b, 0, 0)).to.equal(b[0][0]);
      expect(board.units.getCell(b, 1, 0)).to.equal(b[1][0]);
      expect(board.units.getCell(b, 2, 0)).to.equal(undefined);
      expect(board.units.getCell(b, -1, 0)).to.equal(undefined);
      expect(board.units.getCell(b, 0, -1)).to.equal(undefined);
      expect(board.units.getCell(b, 0, 2)).to.equal(undefined);
    });

    it('getCellFill', function() {
      expect(board.units.getCellFill(b, 0, 0)).to.equal(false);
      b[1][1].state = 'fill';
      expect(board.units.getCellFill(b, 1, 1)).to.equal(true);
      b[1][1].state = 'empty';
      expect(board.units.getCellFill(b, 1, 1)).to.equal(false);
      expect(board.units.getCellFill(b, 1, 2)).to.equal(false);
    });

    it.skip('checkInvalid');

    it('checkInvalid.checkDiagonal', function() {
      b[0][1].state = 'fill';
      expect(board.units.checkInvalid.checkDiagonal(b, 0, 1)).to.equal(false);
      b[1][0].state = 'fill';
      expect(board.units.checkInvalid.checkDiagonal(b, 0, 1)).to.equal(true);
    });

    it.skip('checkLengths');

    it.skip('checkLengths.project');
  }); // end units
}); // end board
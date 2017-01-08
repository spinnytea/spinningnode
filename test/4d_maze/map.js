'use strict';

var expect = require('chai').expect;

var map = require('../../lib/4d_maze/map');

describe.only('4d_maze', function() {
  describe('map', function() {
    describe('Room', function() {
      it('empty constructor', function() {
        var room = new map.Room();
        expect(room.d.length).to.equal(1);
        expect(room.d[0]).to.be.an.instanceof(map.Connection);

        expect(room).to.deep.equal({ d: [ { b: false, f: false } ] });
      });

      it('constructor', function() {
        var room = new map.Room(3);
        expect(room.d.length).to.equal(3);
        expect(room.d[0]).to.be.an.instanceof(map.Connection);
        expect(room.d[1]).to.be.an.instanceof(map.Connection);
        expect(room.d[2]).to.be.an.instanceof(map.Connection);
      });
    }); // end Room

    describe('Map', function() {
      describe('constructor', function() {
        it('0', function() {
          var m = new map.Map();
          expect(m.rooms.length).to.equal(0);
        });

        it('1', function() {
          var m = new map.Map(2);
          expect(arrayDepth(m.rooms)).to.equal(1);
          expect(m.rooms.length).to.equal(2);
          expect(m.rooms[0].d.length).to.equal(1);
          expect(m.rooms[1].d.length).to.equal(1);

          expect(m.rooms).to.deep.equal([
            { d: [ { b: false, f: false } ] },
            { d: [ { b: false, f: false } ] },
          ]);
        });

        it('2', function() {
          var m = new map.Map(2, 2);
          expect(arrayDepth(m.rooms)).to.equal(2);
          expect(m.rooms.length).to.equal(2);
          expect(m.rooms[0].length).to.equal(2);
          expect(m.rooms[0][0].d.length).to.equal(2);
          expect(m.rooms[0][1].d.length).to.equal(2);
          expect(m.rooms[1].length).to.equal(2);
          expect(m.rooms[1][0].d.length).to.equal(2);
          expect(m.rooms[1][1].d.length).to.equal(2);

          expect(m.rooms).to.deep.equal([
            [
              { d: [ { b: false, f: false }, { b: false, f: false } ] },
              { d: [ { b: false, f: false }, { b: false, f: false } ] },
            ],
            [
              { d: [ { b: false, f: false }, { b: false, f: false } ] },
              { d: [ { b: false, f: false }, { b: false, f: false } ] },
            ],
          ]);
        });

        it('3', function() {
          var m = new map.Map(2, 2, 2);
          expect(arrayDepth(m.rooms)).to.equal(3);
          expect(m.rooms.length).to.equal(2);
          expect(m.rooms[0].length).to.equal(2);
          expect(m.rooms[0][0].length).to.equal(2);
          expect(m.rooms[0][0][0].d.length).to.equal(3);
          expect(m.rooms[0][0][1].d.length).to.equal(3);
          expect(m.rooms[0][1].length).to.equal(2);
          expect(m.rooms[0][1][0].d.length).to.equal(3);
          expect(m.rooms[0][1][1].d.length).to.equal(3);
          expect(m.rooms[1].length).to.equal(2);
          expect(m.rooms[1][0].length).to.equal(2);
          expect(m.rooms[1][0][0].d.length).to.equal(3);
          expect(m.rooms[1][0][1].d.length).to.equal(3);
          expect(m.rooms[1][1].length).to.equal(2);
          expect(m.rooms[1][1][0].d.length).to.equal(3);
          expect(m.rooms[1][1][1].d.length).to.equal(3);

          expect(m.rooms).to.deep.equal([
            [
              [
                { d: [ { b: false, f: false }, { b: false, f: false }, { b: false, f: false } ] },
                { d: [ { b: false, f: false }, { b: false, f: false }, { b: false, f: false } ] },
              ],
              [
                { d: [ { b: false, f: false }, { b: false, f: false }, { b: false, f: false } ] },
                { d: [ { b: false, f: false }, { b: false, f: false }, { b: false, f: false } ] },
              ],
            ],
            [
              [
                { d: [ { b: false, f: false }, { b: false, f: false }, { b: false, f: false } ] },
                { d: [ { b: false, f: false }, { b: false, f: false }, { b: false, f: false } ] },
              ],
              [
                { d: [ { b: false, f: false }, { b: false, f: false }, { b: false, f: false } ] },
                { d: [ { b: false, f: false }, { b: false, f: false }, { b: false, f: false } ] },
              ],
            ],
          ]);
        });

        it('4', function() {
          var m = new map.Map(3, 3, 3, 3);
          expect(arrayDepth(m.rooms)).to.equal(4);
          expect(m.rooms.length).to.equal(3);
          expect(m.rooms[0].length).to.equal(3);
          expect(m.rooms[0][0].length).to.equal(3);
          expect(m.rooms[0][0][0].length).to.equal(3);
          expect(m.rooms[0][0][0][0].d.length).to.equal(4);
        });
      }); // end constructor

      describe('door', function() {
        it('basic', function() {
          var m = new map.Map(2);
          expect(m.rooms[0].d[0]).to.deep.equal({ b: false, f: false });
          expect(m.rooms[1].d[0]).to.deep.equal({ b: false, f: false });

          m.door([0], 0, true);

          expect(m.rooms[0].d[0]).to.deep.equal({ b: false, f: true });
          expect(m.rooms[1].d[0]).to.deep.equal({ b: true, f: false });
        });

        it('complicated', function() {
          var m = new map.Map(5, 5, 5, 5);
          expect(m.rooms[0][1][2][3].d[2]).to.deep.equal({ b: false, f: false });
          expect(m.rooms[0][1][2][3].d[2]).to.deep.equal({ b: false, f: false });

          m.door([0, 1, 3, 3], 2, false);

          expect(m.rooms[0][1][2][3].d[2]).to.deep.equal({ b: false, f: true });
          expect(m.rooms[0][1][3][3].d[2]).to.deep.equal({ b: true, f: false });
        });
      }); // end door
    }); // end Map
  }); // end map
}); // end 4d_maze

function arrayDepth(array) {
  if(array[0] instanceof Array)
    return arrayDepth(array[0]) + 1;
  return 1;
}

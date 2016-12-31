'use strict';
const _ = require('lodash');
const expect = require('chai').expect;
const Skill = require('../../lib/saomvp/skills');

describe('saomvp', function() {
  describe('skills', function() {
    describe('add', function() {
      function curr(s) { return _.pick(s, ['curr', 'level']); }

      it('2', function() {
        let s = new Skill('test 2', 'desc 2', 2, 10);
        expect(curr(s)).to.deep.equal({ curr: 0, level: 1 });
        s.add();
        expect(curr(s)).to.deep.equal({ curr: 1, level: 1 });
        s.add();
        expect(curr(s)).to.deep.equal({ curr: 0, level: 2 });
        s.add(3);
        expect(curr(s)).to.deep.equal({ curr: 3, level: 2 });
        s.add();
        expect(curr(s)).to.deep.equal({ curr: 0, level: 3});
      });

      it('100', function() {
        let s = new Skill('test 100', 'desc 100', 100, 10);
        expect(curr(s)).to.deep.equal({ curr: 0, level: 1 });
        s.add();
        expect(curr(s)).to.deep.equal({ curr: 1, level: 1 });
        s.add(98);
        expect(curr(s)).to.deep.equal({ curr: 99, level: 1 });
        s.add();
        expect(curr(s)).to.deep.equal({ curr: 0, level: 2 });
        s.add(199);
        expect(curr(s)).to.deep.equal({ curr: 199, level: 2 });
        s.add();
        expect(curr(s)).to.deep.equal({ curr: 0, level: 3 });
      });

      it('previous', function() {
        let s = new Skill('test previous', 'desc previous', 2, 10);
        s.previous_level = 3;
        expect(curr(s)).to.deep.equal({ curr: 0, level: 1 });
        s.add();
        expect(curr(s)).to.deep.equal({ curr: 0, level: 2 });
        s.add();
        expect(curr(s)).to.deep.equal({ curr: 2, level: 2 });
        s.add();
        expect(curr(s)).to.deep.equal({ curr: 0, level: 3 });
        s.add();
        expect(curr(s)).to.deep.equal({ curr: 1, level: 3 });
      });

      it('max', function() {
        let s = new Skill('test 2', 'desc 2', 2, 10);
        expect(curr(s)).to.deep.equal({ curr: 0, level: 1 });
        s.add(89);
        expect(curr(s)).to.deep.equal({ curr: 17, level: 9 });
        s.add(100);
        expect(curr(s)).to.deep.equal({ curr: 0, level: 10 });
        s.add();
        expect(curr(s)).to.deep.equal({ curr: 0, level: 10 });
      });

      it('level', function() {
        let s = new Skill('test level', 'desc level', 2, 10, -1);
        expect(curr(s)).to.deep.equal({ curr: 0, level: -1 });
        s.add(3);
        expect(curr(s)).to.deep.equal({ curr: 1, level: 0 });
        s.add(3);
        expect(curr(s)).to.deep.equal({ curr: 0, level: 2 });
        s.add(3);
        expect(curr(s)).to.deep.equal({ curr: 3, level: 2 });
        s.add(3);
        expect(curr(s)).to.deep.equal({ curr: 2, level: 3 });
      });

      it.skip('add large w/ previous');
    }); // end add
  }); // end skills
}); // end saomvp
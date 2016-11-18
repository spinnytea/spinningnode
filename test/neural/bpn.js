'use strict';
const expect = require('chai').expect;
const NeuralNetwork = require('../../lib/neural/bpn');

describe('bpn', function() {
  describe('NeuralNetwork', function() {
    it('constructor', function() {
      const nn = new NeuralNetwork(3, 2, 1);
      expect(nn.input).to.deep.equal([0,0,0]);
      expect(nn.hidden).to.deep.equal([0,0]);
      expect(nn.output).to.deep.equal([0]);
    });

    it('feed', function() {
      const nn = new NeuralNetwork(2, 1, 2);
      nn.ih[0][0] = 2;
      nn.ih[1][0] = 3;
      nn.ho[0][0] = 4;
      nn.ho[0][1] = 5;

      nn.feed([1, 2]);

      // these values work without normalization
      // XXX I'm not sure what to test with normalization on
      // expect(nn.input).to.deep.equal([1, 2]);
      // expect(nn.ih).to.deep.equal([[2], [3]]);
      // expect(nn.hidden).to.deep.equal([8]);
      // expect(nn.ho).to.deep.equal([[4, 5]]);
      // expect(nn.output).to.deep.equal([32, 40]);
    });

    describe('train', function() {
      it('a', function() {
        const nn = new NeuralNetwork(2, 2, 2);
        nn.learning_rate = 0.5;
        // XXX init ih and ho, drop the loop count
        for(let loop=0; loop<200; loop++) {
          nn.train([1,0], [1,0]);
          nn.train([0,1], [0,1]);
        }
        nn.feed([1,0]);
        expect(nn.output[0]).to.be.above(0.5);
        expect(nn.output[1]).to.be.below(0.5);
        nn.feed([0,1]);
        expect(nn.output[0]).to.be.below(0.5);
        expect(nn.output[1]).to.be.above(0.5);
      });

      it('b', function() {
        const nn = new NeuralNetwork(2, 2, 2);
        nn.learning_rate = 0.5;
        // XXX init ih and ho, drop the loop count
        for(let loop=0; loop<200; loop++) {
          nn.train([1,0], [0,1]);
          nn.train([0,1], [1,0]);
        }
        nn.feed([1,0]);
        expect(nn.output[0]).to.be.below(0.5);
        expect(nn.output[1]).to.be.above(0.5);
        nn.feed([0,1]);
        expect(nn.output[0]).to.be.above(0.5);
        expect(nn.output[1]).to.be.below(0.5);
      });
    }); // end train
  }); // end NeuralNetwork

  describe('units', function() {
    it('matrix', function() {
      expect(NeuralNetwork.units.matrix(2, 3)).to.deep.equal([[0,0,0],[0,0,0]]);
    });

    it('random', function() {
      const r = NeuralNetwork.units.random([[0,0,0],[0,0,0]]);
      // XXX should we really test the values themselves?
      expect(r[0][0]).to.be.at.least(0);
      expect(r[0][0]).to.be.below(1);
      expect(r[0][1]).to.be.at.least(0);
      expect(r[0][1]).to.be.below(1);
      expect(r[0][2]).to.be.at.least(0);
      expect(r[0][2]).to.be.below(1);
      expect(r[1][0]).to.be.at.least(0);
      expect(r[1][0]).to.be.below(1);
      expect(r[1][1]).to.be.at.least(0);
      expect(r[1][1]).to.be.below(1);
      expect(r[1][2]).to.be.at.least(0);
      expect(r[1][2]).to.be.below(1);
    });

    describe('matmul', function() {
      const A = [
        [ 1, 2, 3 ],
        [ 4, 5, 6 ],
      ];
      const B = [
        [  7,  8 ],
        [  9, 10 ],
        [ 11, 12 ],
      ];
      const R = [
        [  58,  64 ],
        [ 139, 154 ],
      ];

      it('basic', function() {
        expect(NeuralNetwork.units.matmul(A, B)).to.deep.equal(R);
      });

      it('with arg', function() {
        const r = NeuralNetwork.units.matrix(2, 2);
        NeuralNetwork.units.matmul(A, B, r);
        expect(r).to.deep.equal(R);
      });
    }); // end matmul
  }); // end units
}); // end bpn
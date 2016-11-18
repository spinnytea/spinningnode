'use strict';
const expect = require('chai').expect;
const NeuralNetwork = require('../../lib/neural/bpn');

describe.only('bpn', function() {
  describe('units', function() {
    it('matrix', function() {
      expect(NeuralNetwork.units.matrix(2, 3)).to.deep.equal([[0,0,0],[0,0,0]]);
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
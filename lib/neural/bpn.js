'use strict';

module.exports = exports = NeuralNetwork;
function NeuralNetwork() {

}

Object.defineProperty(exports, 'units', { value: {} });
exports.units.matrix = matrix;
exports.units.matmul = matmul;

function matrix(h, w) {
  const r = [];
  while(r.length < h)
    r.push(new Array(w).fill(0));
  return r;
}

function matmul(A, B, r) {
  if(!r) r = matrix(A.length, B[0].length);

  let i, j, k;
  for(i=0; i<A.length; i++)
    for(j=0; j<B[0].length; j++) {
      let sum = 0;
      for(k=0; k<B.length; k++)
        sum += A[i][k]*B[k][j];
      r[i][j] = sum;
    }

  return r;
}

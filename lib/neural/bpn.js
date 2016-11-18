'use strict';

module.exports = exports = NeuralNetwork;
function NeuralNetwork() {

}

Object.defineProperty(exports, 'units', { value: {} });
exports.units.matrix = matrix;
exports.units.random = random;
exports.units.matmul = matmul;

function matrix(h, w) {
  const r = [];
  while(r.length < h)
    r.push(new Array(w).fill(0));
  return r;
}

function random(r) {
  for(let i=0; i<r.length; i++)
    for(let j=0; j<r[0].length; j++)
      r[i][j] = Math.random();
  return r;
}

function matmul(A, B, r) {
  if(!r) r = matrix(A.length, B[0].length);

  for(let i=0; i<A.length; i++)
    for(let j=0; j<B[0].length; j++) {
      let sum = 0;
      for(let k=0; k<B.length; k++)
        sum += A[i][k]*B[k][j];
      r[i][j] = sum;
    }

  return r;
}

'use strict';

module.exports = exports = NeuralNetwork;
function NeuralNetwork(i, h, o) {
  this.input = new Array(i).fill(0);
  this.wrapped_input = [this.input];
  this.ih = random(matrix(i, h));
  this.hidden = new Array(h).fill(0);
  this.wrapped_hidden = [this.hidden];
  this.ho = random(matrix(h, o));
  this.output = new Array(o).fill(0);
  this.wrapped_output = [this.output];

  this.normalize = (val) => (1 / (1 + Math.pow(Math.E, -val)));
  // this.denormalize = (val) => (val * (1 - val));
}
NeuralNetwork.prototype.feed = function(input) {
  // if input is provided, copy the values
  if(input) for(let i=0; i<input.length; i++) this.input[i] = input[i];

  matmul(this.wrapped_input, this.ih, this.wrapped_hidden);
  callOnEach(this.hidden, this.normalize);
  matmul(this.wrapped_hidden, this.ho, this.wrapped_output);
  callOnEach(this.output, this.normalize);
};

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

function callOnEach(array, fn) {
  array.forEach(function(val, idx) {
    array[idx] = fn(val);
  });
}

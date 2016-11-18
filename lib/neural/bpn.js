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
  this.denormalize = (val) => (val * (1 - val));

  this.learning_rate = 0.08;
}

// @param input: input (optional) - input can be prepared directly
NeuralNetwork.prototype.feed = function(input) {
  // if input is provided, copy the values
  if(input) for(let i=0; i<input.length; i++) this.input[i] = input[i];

  matmul(this.wrapped_input, this.ih, this.wrapped_hidden);
  callOnEach(this.hidden, this.normalize);
  matmul(this.wrapped_hidden, this.ho, this.wrapped_output);
  callOnEach(this.output, this.normalize);
};

// @param expected: output
// @param example: input (optional)
NeuralNetwork.prototype.train = function(expected, example) {
  // prepare the layers with the training data
  this.feed(example);

  // prepare the error rates of the output layer
  for(let o=0; o<this.output.length; o++)
    this.output[o] = this.denormalize(this.output[o]) * (expected[o] - this.output[o]);

  // correct the weights
  for(let h=0; h<this.hidden.length; h++)
    for(let o=0; o<this.output.length; o++)
      this.ho[h][o] += this.learning_rate * this.output[o] * this.hidden[h];

  // prepare the error rates of the hidden layer
  for(let h=0; h<this.hidden.length; h++)
    this.hidden[h] = this.denormalize(this.hidden[h]) * this.output.reduce((ret, val, o)=>(this.output[o]*this.ho[h][o]), 0);

  // correct the weights
  for(let i=0; i<this.input.length; i++)
    for(let h=0; h<this.hidden.length; h++)
      this.ih[i][h] += this.learning_rate * this.hidden[h] * this.input[i];

  // the input is untouched
  // the hidden and output should be discarded
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

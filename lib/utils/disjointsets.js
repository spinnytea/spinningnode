'use strict';

module.exports = DisjointSets;

function DisjointSets(size) {
  this.array = [];
  while(this.array.length < size)
    this.array.push(-1);
}

DisjointSets.prototype.union = function(root1, root2) {
  if(this.array[root1] < this.array[root2]) {
    this.array[root1] = root2;
  } else {
    if(this.array[root1] === this.array[root2])
      this.array[root1]--;
    this.array[root2] = root1;
  }
};

DisjointSets.prototype.find = function(x) {
  if(this.array[x] < 0) {
    return x;
  } else {
    return (this.array[x] = this.find(this.array[x]));
  }
};

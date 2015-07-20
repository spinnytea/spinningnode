var diffApp = angular.module('spinningnode.utils.diff.app', [
  require('./recursionhelper').name
]);
module.exports = diffApp;

diffApp.controller('spinningnode.utils.diff.controller', ['$scope',
  function($scope) {
    // these are the value
    $scope.input = { one: undefined, two: undefined, hideSame: false };
    $scope.output = { one: undefined, two: undefined, diff: undefined };

    $scope.demoData = function() {
      $scope.input.one = '"{"a":1,"b":{"x":1,"y":1},"c":{"x":1,"y":1},"d":1,"e":[1,2,3,4,5]}"';
      $scope.input.two = '"{"a":2,"b":{"x":1,"y":1},"c":{"x":1,"y":2},"e":[1,2,3,6]}"';
    };

    $scope.$on('$destroy', $scope.$watch('input.one', function(newValue) {
      if(newValue) {
        if(newValue.indexOf('"') === 0 && newValue.lastIndexOf('"') === newValue.length-1)
          newValue = newValue.slice(1, -1);
        $scope.output.one = JSON.parse(newValue);
        $scope.output.diff = diff($scope.output.one, $scope.output.two);
      }
    }));

    $scope.$on('$destroy', $scope.$watch('input.two', function(newValue) {
      if(newValue) {
        if(newValue.indexOf('"') === 0 && newValue.lastIndexOf('"') === newValue.length-1)
          newValue = newValue.slice(1, -1);
        $scope.output.two = JSON.parse(newValue);
        $scope.output.diff = diff($scope.output.one, $scope.output.two);
      }
    }));

    $scope.isObject = function(arg) {
      return angular.isObject(arg);
    };
  }
]);

diffApp.directive('objectDiff', [
  'RecursionHelper',
  function(RecursionHelper) {
    return {
      restrict: 'E',
      scope: {
        obj: '=object',
        diff: '=',
        only: '=',
        hideSame: '='
      },
      templateUrl: 'template/utils/objectDiff.html',
      compile: function(element) {
        return RecursionHelper.compile(element, function(scope) {
          console.log('obj', scope.obj);
          console.log('diff', scope.diff);
          console.log('only', scope.only);

          scope.isObject = function(arg) {
            return angular.isObject(arg);
          };
        });
      }
    };
  }
]);

function diff(one, two) {
  one = one || {};
  two = two || {};

  var ret = {};

  // for objects, we want to cache the deep equality
  ret.$own = angular.equals(one, two);

  Object.keys(one).forEach(function(k) {
    if(k in two) {
      // if k is in two, then we can compare the values
      var o = one[k];
      var t = two[k];
      if(angular.isObject(o)) {
        if(angular.isObject(t))
          ret[k] = diff(o, t);
        else
          ret[k] = 'diff';
      } else {
        if(angular.isObject(t))
          ret[k] = 'diff';
        else if(o === t)
          ret[k] = 'same';
        else
          ret[k] = 'diff';
      }
    } else {
      // if k is only in one, then mark it
      ret[k] = 'one';
    }
  });
  Object.keys(two).forEach(function(k) {
    // we only need to check for the non-existence in one
    // the both existence is already handled
    if(!(k in one))
      ret[k] = 'two';
  });

  return ret;
}

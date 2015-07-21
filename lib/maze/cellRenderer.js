'use strict';

module.exports = angular.module('spinningnode.mazes.cellrenderer', [
]).directive('mazeCell', [
  function() {
    var wallColor = 'darkslategray';
    var playerColor = 'grey';
    var visitedColor = 'lightgrey';
    var blankColor = 'white';

    return {
      scope: {
        cell: '=mazeCell'
      },
      link: function($scope, elem, attr, ngModelController) {
        elem.css('border', '1px solid ' + blankColor);

        $scope.$on('$destroy', $scope.$watch('cell._east', function(newValue) {
          elem.css('border-right-color', newValue?blankColor:wallColor);
        }));
        $scope.$on('$destroy', $scope.$watch('cell._west', function(newValue) {
          elem.css('border-left-color', newValue?blankColor:wallColor);
        }));
        $scope.$on('$destroy', $scope.$watch('cell._north', function(newValue) {
          elem.css('border-top-color', newValue?blankColor:wallColor);
        }));
        $scope.$on('$destroy', $scope.$watch('cell._south', function(newValue) {
          elem.css('border-bottom-color', newValue?blankColor:wallColor);
        }));

        $scope.$on('$destroy', $scope.$watch(function() { return $scope.cell.dynamic; }, function(dynamic) {
          if(dynamic.player) {
            elem.css('background', playerColor);
          } else if(dynamic.visited) {
            elem.css('background', visitedColor);
          } else {
            elem.css('background', blankColor);
          }

          if(dynamic.visited) {
            if($scope.cell._east && $scope.cell._east.dynamic.visited)
              elem.css('border-right-color', visitedColor);
            if($scope.cell._south && $scope.cell._south.dynamic.visited)
              elem.css('border-bottom-color', visitedColor);
          }
        }, true));
      } // end link
    }
  }
]);

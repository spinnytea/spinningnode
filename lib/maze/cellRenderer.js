'use strict';

module.exports = angular.module('spinningnode.mazes.cellrenderer', [
]).directive('mazeCell', [
  function() {
    return {
      scope: {
        cell: '=mazeCell'
      },
      link: function($scope, elem, attr, ngModelController) {
        elem.css('border', '1px solid white');

        // set borders
        angular.forEach({
          _east: 'border-right-color', _west: 'border-left-color',
          _north: 'border-top-color', _south: 'border-bottom-color'
        }, function(style, key) {
          if($scope.cell[key] === undefined)
            elem.css(style, 'darkslategray');
        });

        $scope.$on('$destroy', $scope.$watch(function() { return $scope.cell.dynamic; }, function(dynamic) {
          if(dynamic.player) {
            elem.css('background', 'grey');
          } else if(dynamic.visited) {
            elem.css('background', 'lightgrey');
          } else {
            elem.css('background', 'white');
          }

          if(dynamic.visited) {
            if($scope.cell._east && $scope.cell._east.dynamic.visited)
              elem.css('border-right-color', 'lightgrey');
            if($scope.cell._south && $scope.cell._south.dynamic.visited)
              elem.css('border-bottom-color', 'lightgrey');
          }
        }, true));
      } // end link
    }
  }
]);

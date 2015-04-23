'use strict';

module.exports = angular.module('spinningnode.mazes.cellrenderer', [
]).directive('mazeCell', [
  function() {
    return {
      scope: {
        cell: '=mazeCell'
      },
      link: function($scope, elem, attr, ngModelController) {
        // set borders
        angular.forEach({
          _east: 'border-right', _west: 'border-left',
          _north: 'border-top', _south: 'border-bottom'
        }, function(style, key) {
          if($scope.cell[key]) elem.css(style, '0');
          else elem.css(style, '1px solid darkslategray');
        });

        $scope.$on('$destroy', $scope.$watch(function() { return $scope.cell.dynamic; }, function(dynamic) {
          if(dynamic.player) {
            elem.css('background', 'grey');
          } else if(dynamic.visited) {
            elem.css('background', 'lightgrey');
          } else {
            elem.css('background', 'white');
          }
        }, true));
      } // end link
    }
  }
]);

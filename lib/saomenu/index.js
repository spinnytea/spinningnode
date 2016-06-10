'use strict';

module.exports = angular.module('spinningnode.sao.menu', []);
module.exports.controller('spinningnode.sao.menu.main.controller', [
  '$scope', 'bindKeys',
  function($scope, bindKeys) {
    $scope.showMenu = false;

    bindKeys($scope, {
      'Esc': function() { $scope.showMenu = !$scope.showMenu; },
    });
  }
]);

module.exports.directive('saoMainMenu', function() {
  return {
    restrict: 'A',
    replace: true,
    scope: true,
    templateUrl: 'saomenu/mainMenu.html',
    controller: [
      '$scope', 'bindKeys',
      SaoMainMenuController
    ]
  };
});

function SaoMainMenuController($scope, bindKeys) {
  $scope.items = [
    { icon: 'Config' },
    { icon: 'Man' },
    { icon: 'Men' },
    { icon: 'Message' },
    { icon: 'Location' },
  ];

  var selectedIdx = 0;
  $scope.isSelected = function(i) {
    return ($scope.items[selectedIdx] === i);
  };
  function selectUp() {
    selectedIdx--;
    if(selectedIdx < 0) selectedIdx = $scope.items.length-1;
  }
  function selectDown() {
    selectedIdx++;
    if(selectedIdx >= $scope.items.length) selectedIdx = 0;
  }

  bindKeys($scope, {
    'up': selectUp,
    'down': selectDown,
  });
}

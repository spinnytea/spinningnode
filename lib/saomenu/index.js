'use strict';
/**
 * This is a first pass. It's ugly, it's just solves the "current problem" every time I come to it.
 * Once I've finished, I want to basically redo it all.
 */

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
    link: function($scope, element) {
      $scope.wrapperElement = element.find('.menu-wrapper');
    },
    controller: [
      '$scope', 'bindKeys',
      SaoMainMenuController
    ]
  };
});

function SaoMainMenuController($scope, bindKeys) {
  // TODO preload sounds?
  var startSound = new Audio('saomenu/sounds/menu open.wav');
  var selectSound = new Audio('saomenu/sounds/menu select.wav');

  // play a sound on init
  startSound.play();
  $scope.$on('$destroy', function() { startSound.pause(); });

  var items = $scope.items = [
    { icon: 'Config', submenu: [
      { icon: '', label: 'Option' },
      { icon: '', label: 'Help' },
      { icon: '', label: 'Logout' },
    ] },
    { icon: 'Man', submenu: [
      { icon: '', label: 'Items' },
      { icon: '', label: 'Skills' },
      { icon: '', label: 'Equipment' },
    ] },
    { icon: 'Men', submenu: [
      { icon: '', label: 'Party' },
      { icon: '', label: 'Friend' },
      { icon: '', label: 'Guild' },
    ] },
    { icon: 'Message', submenu: [
      { icon: '', label: 'Peggy' },
      { icon: '', label: 'Sue' },
    ] },
    { icon: 'Location', submenu: [
      { icon: '', label: 'Invalid' },
      { icon: '', label: 'Open a Map' },
    ] },
  ];

  // idx 0 for top menu
  // idx 1 for submenu, etc
  var selectedIndexes = [0];
  var currentMenuIdx = 0; // XXX remove, it should === submenus.length
  var submenus = $scope.submenus = [];
  $scope.isSelected = function(menuIdx, item) {
    return (items[selectedIndexes[menuIdx]] === item);
  };
  function selectUp() {
    // XXX play sound?
    selectedIndexes[currentMenuIdx]--;
    if(selectedIndexes[currentMenuIdx] < 0) selectedIndexes[currentMenuIdx] = items.length-1;
  }
  function selectDown() {
    // XXX play sound?
    selectedIndexes[currentMenuIdx]++;
    if(selectedIndexes[currentMenuIdx] >= items.length) selectedIndexes[currentMenuIdx] = 0;
  }
  function select() {
    selectSound.currentTime = 0;
    selectSound.play();

    // XXX what if there isn't a submenu
    // play a different sound, and don't push it!
    submenus.push(items[currentMenuIdx].submenu);
    currentMenuIdx++;
  }
  function deselect() {
    // XXX play sound?
    if(submenus.length) {
      submenus.pop(); // XXX is this popping the right menu? test when there is more than one sub
      currentMenuIdx--;
    }
  }

  bindKeys($scope, {
    'up': selectUp,
    'down': selectDown,
    'right': select,
    'left': deselect,
    'enter': select,
  });
}

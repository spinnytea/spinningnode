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
      { icon: 'Option', label: 'Option' },
      { icon: 'Help & Unknown', label: 'Help' },
      { icon: 'Logout', label: 'Logout' },
    ] },
    { icon: 'Man', submenu: [
      { icon: 'Items', label: 'Items' },
      { icon: 'Skills', label: 'Skills' },
      { icon: 'Equipment', label: 'Equipment' },
    ] },
    { icon: 'Men', submenu: [
      { icon: 'Party & Profile', label: 'Party' },
      { icon: 'Friend', label: 'Friend' },
      { icon: 'Guild', label: 'Guild' },
    ] },
    { icon: 'Message', submenu: [
      { icon: 'Player', label: 'Peggy' },
      { icon: 'Player', label: 'Sue' },
    ] },
    { icon: 'Location' },
  ];

  // idx 0 for top menu
  // idx 1 for submenu, etc
  var selectedIndexes = [0];
  var currentMenuIdx = 0; // XXX remove, it should === submenus.length
  var submenus = $scope.submenus = [];
  function currentMenu(menuIdx) {
    if(menuIdx === 0)
      return items;
    else
      return submenus[menuIdx-1];
  }
  function currentMenuSelection(menuIdx) {
    return currentMenu(menuIdx)[selectedIndexes[menuIdx]];
  }
  $scope.isSelected = function(menuIdx, item) {
    return currentMenuSelection(menuIdx) === item;
  };
  function selectUp() {
    // XXX play sound?
    selectedIndexes[currentMenuIdx]--;
    var menu = currentMenu(currentMenuIdx);
    if(selectedIndexes[currentMenuIdx] < 0) selectedIndexes[currentMenuIdx] = menu.length-1;
  }
  function selectDown() {
    // XXX play sound?
    selectedIndexes[currentMenuIdx]++;
    var menu = currentMenu(currentMenuIdx);
    if(selectedIndexes[currentMenuIdx] >= menu.length) selectedIndexes[currentMenuIdx] = 0;
  }
  function select() {
    var submenu = currentMenuSelection(currentMenuIdx).submenu;

    if(submenu) {
      selectSound.currentTime = 0;
      selectSound.play();

      // play a different sound, and don't push it!
      submenus.push(submenu);
      currentMenuIdx++;
      selectedIndexes.push(0);
    } else {
      // if there isn't a submenu, then this should be an action we can perform
    }
  }
  function deselect() {
    // XXX play sound?
    if(submenus.length) {
      submenus.pop(); // XXX is this popping the right menu? test when there is more than one sub
      selectedIndexes.pop();
      currentMenuIdx--;
    } else {
      // XXX close the menu
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

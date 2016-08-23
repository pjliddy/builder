// Instantiate tool app & tool controller

var toolApp = angular.module('toolApp', []);



toolApp.controller('toolCtrl', function($scope) {
  $scope.vars = [
    {
      name: "gray-base"
      , displayLabel: "Base Gray"
      , value: "#ff0000"
      , type: "color"
      , displayValue: "#ff0000"
    },
    {
      name: "brand-primary"
      , displayLabel: "Brand Primary"
      , value: "#337ab7"
      , type: "color"
      , displayValue: "#337ab7"
    }
  ];

  $scope.options = {
    required: [false, true],
    disabled: [false, true],
    round: [false, true],
    format: ['hsl', 'hsv', 'rgb', 'hex', 'hex8'],
    hue: [true, false],
    alpha: [true, false],
    swatch: [true, false],
    swatchPos: ['left', 'right'],
    swatchBootstrap: [true, false],
    swatchOnly: [true, false],
    pos: ['bottom left', 'bottom right', 'top left', 'top right'],
    case: ['upper', 'lower'],
    inline: [false, true],
    placeholder: '',
    close: {
        show: [false, true],
        label: 'Close',
        class: '',
    },
    clear: {
        show: [false, true],
        label: 'Clear',
        class: '',
    },
    reset: {
        show: [false, true],
        label: 'Reset',
        class: '',
    },
  };
  angular.module('toolApp', ['color.picker']);

});



//angular.module('toolApp', ['color.picker']);


//(function functionName(){
//
//})();


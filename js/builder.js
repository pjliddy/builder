// builder.js

// Declare global array of objects, one for each variable


// ADD MORE ATTRIBUTES TO GLOBAL VARIABLE STRUCTURE

var variables = [
  {
    name: "brand-primary"
    , displayName: "Brand Primary"
    , value: "#337ab7"
    , varType: "color"
    , configType: "colorpicker"
    , displayValue: "#337ab7"
    , variable: ""
    , color: "#337ab7"
    , configFunction: ""
    , tint: "0"
    }
    , {
    name: "brand-success"
    , displayName: "Brand Success"
    , value: "#5cb85c"
    , varType: "color"
    , configType: "colorpicker"
    , displayValue: "#5cb85c"
    , variable: ""
    , color: "#5cb85c"
    , configFunction: ""
    , tint: "0"
    }
    , {
    name: "brand-info"
    , displayName: "Brand Info"
    , value: "#5bc0de"
    , varType: "color"
    , configType: "colorpicker"
    , displayValue: "#5bc0de"
    , variable: ""
    , color: "#5bc0de"
    , configFunction: ""
    , tint: "0"
    }
    , {
    name: "brand-warning"
    , displayName: "Brand Warning"
    , value: "#f0ad4e"
    , varType: "color"
    , configType: "colorpicker"
    , displayValue: "#f0ad4e"
    , variable: ""
    , color: "#f0ad4e"
    , configFunction: ""
    , tint: "0"
    }
    , {
    name: "brand-danger"
    , displayName: "Brand Danger"
    , value: "#d9534f"
    , varType: "color"
    , configType: "colorpicker"
    , displayValue: "#d9534f"
    , variable: ""
    , color: "#d9534f"
    , configFunction: ""
    , tint: "0"
    }
    , {
    name: "gray-base"           // variable name for Less
    , displayName: "Base Gray"  // name to use in tool panel
    , value: "#000"             // actual calculated value (use for local CSS)
    , varType: "color"             // variable type = color
    , configType: "colorpicker" // config type determines controllor activity based on type
    , displayValue: "#000000"   // display value field (hex, @variable, or formula)
    , variable: ""              // @variable if specified
    , color: "#000000"          // color picked
    , configFunction: ""                  // function chosen
    , tint: "0"               // tint value chosen
    }
];

//
// TEMPLATE SCRIPTS
//

var colorVarTemplate = _.template( $('#colorvar-template').html());
var colorVarTools = "";

_.each(variables, function(variable, index, variables) {
  colorVarTools += colorVarTemplate({
    variable: variable
  });
});

$('#collapse-grays').append(colorVarTools);


$(function () {

  // GET & HANDLE JSON FILE WITH VARS & DATA

  // CREATE UI ELEMENTS

  // create color pickers
  _.each( _.where(variables, { varType: "color" }), function( colorVar ) {
    createColorPicker( colorVar.name );
    $('#' + colorVar.name).find('.color-picker').css('background-color', getVar( colorVar.name, 'value'));
  });

  // create sliders
  $("input.slider").slider();

  // EVENT LISTENERS

  // export link clicked
  $('#link-export').click( generateVariables );

  // color config type menu item selected
  $('.config-type a').click( updateConfigType );

  // color picker updated
  $('.color-picker').colorpicker().on('changeColor', function ( pickerEvt ) {
    updateColorPicker( pickerEvt);
  });

  // config variable selected
  $('.config-variables a').click( updateConfigVariable );

  // config slider updated
  $(".config-tint .slider").on("slide", function( slideEvt ) {
    updateConfigTint( slideEvt );
  });

  $('.variable-display').each(function(){
    updateDisplayValue( $(this).attr("id") );
  });
});

//
// DATA HANDLING FUNCTIONS
//

function setVar( varID, valueID, value ){
  var myDataObj = _.findWhere(variables, { name: varID });
  myDataObj[valueID]=value;
  // update layout iframe's css value
  //  $("#layoutframe").contents().find("." + varName).css("background-color", value);
}

function getVar(varID, valueID) {
  // finds the varID object with valueID and returns the value property
  return  _.propertyOf( _.findWhere(variables, { name: varID }) )( valueID );
}

// SETUP SCRIPTS

function createColorPicker( varID ) {
  // create color picker object with the specified hex color
  $('#' + varID + ' .color-picker').colorpicker({ color: getVar( varID, 'color'), align: 'left'  });
}

// COLOR CONFIG EVENT HANDLERS

function updateConfigType(){
  var myVarContainer = $(this).closest('.variable-display');
  var myVarID = $(myVarContainer).attr('id');
  var myConfigType = $(this).data('value');

  switch( myConfigType ) {
    case 'colorpicker':
    default:
      $(myVarContainer).find('.config-variables').hide();
      $(myVarContainer).find('.config-tint').hide();
      setVar( myVarID, 'configType', 'colorpicker');
      setVar( myVarID, 'variable', '');
      setVar( myVarID, 'displayValue', getVar(myVarID, 'value'));
      break;
    case 'variable':
      $(myVarContainer).find('.config-variables').show();
      $(myVarContainer).find('.config-tint').hide();
      break;
    case 'function':
      $(myVarContainer).find('.config-variables').hide();
      $(myVarContainer).find('.config-tint').show();
      setVar( myVarID, 'configType', 'function' );
      setVar( myVarID, 'configFunction', $(this).data('option'));

      updateConfigFunction( $(myVarContainer) ); // should be "update varfunction" function

      break;
  }
  updateDisplayValue( myVarID );
}

function updateColorPicker( evt ){
  var myVarContainer = $(evt.target).closest('.variable-display');
  var myVarID = $(myVarContainer).attr('id');

  // set "color" value of data object
  setVar( myVarID, 'color', evt.color.toHex() );

  // set config type = color picker (m ay not change mode if current mode = formula)
  if ( getVar(myVarID, 'configType')!= 'function'){
    setVar( myVarID, 'configType', 'colorpicker' );
    setVar( myVarID, 'value', evt.color.toHex() );
    setVar( myVarID, 'displayValue', evt.color.toHex() );
  } else {
    setVar( myVarID, 'variable', '');
    updateConfigFunction( $(myVarContainer) );
  }

  updateDisplayValue( myVarID );
}

function updateConfigVariable(){
  var myVarContainer = $(this).closest('.variable-display');
  var myVarID = $(myVarContainer).attr('id');
  var configVar = $(this).data("value");

  // hide variables list
  $(myVarContainer).find('.config-variables').hide();

  // get configVar's value
  var colorValue = getVar( configVar, 'value');
  setVar( myVarID, 'variable', "@" + configVar );

  if ( getVar(myVarID, 'configType') == 'function'){
    updateConfigFunction( $(myVarContainer) );

  } else {
    // if picker or var, replace all values
    setVar( myVarID, 'configType', 'variable');
    setVar( myVarID, 'color', colorValue);
    setVar( myVarID, 'value', colorValue);
    setVar( myVarID, 'displayValue', getVar( myVarID, 'variable'));
  }

  updateDisplayValue( myVarID );
}

function updateConfigFunction ( thisObj ) {
  var myVarContainer = thisObj.closest('.variable-display');
  var myVarID = $(myVarContainer).attr('id')

  var varFunc = getVar( myVarID, 'configFunction' );
  var color = getVar( myVarID, 'color' );
  var tint = getVar( myVarID, 'tint' );

  // decide on variable name or color for formula
  var varValue = getVar( myVarID, 'variable');

  if (varValue != "") {
    var color = getVar( varValue.replace("@",''), 'value');
    var myFunc = varFunc + "(" + varValue + "," + tint + "%)";
  } else{
    var myFunc = varFunc + "(" + color + "," + tint + "%)";
  }

  switch( varFunc ) {
    case 'lighten':
      var value = tinycolor( color ).lighten(tint).toString();
      break;
    case 'darken':
      var value = tinycolor( color ).darken(tint).toString();
      break;
  }

  setVar( myVarID, 'value', value );
  setVar( myVarID, 'displayValue', myFunc );

  updateDisplayValue( myVarID );
}

function updateConfigTint( slideEvt ){
  var myVarContainer = slideEvt.target.closest('.variable-display');
  var myVarID = myVarContainer.id;
  var tintValue = slideEvt.value;

  setVar( myVarID, 'tint', tintValue );
  updateConfigFunction( myVarContainer );
  updateDisplayValue( myVarID );
}

function updateColorSwatch ( myVarID ){
  $('#' + myVarID).find('.color-picker').css('background-color', getVar( myVarID, 'value'));
}

function updateDisplayValue ( myVarID ){
  $('#' + myVarID).find('.config-display').val( getVar( myVarID, 'displayValue'));
  updateColorSwatch( myVarID );
   $("#layoutframe").contents().find( "." + myVarID ).css( "background-color", getVar( myVarID, 'value') );
  //showVar( _.where(variables, { name: myVarID }) );
}


//
// LESS/CSS SCRIPTS
//

function generateVariables() {
  // when the user clicks the "export" link a version of variables.less is generated
  // and displayed in a new window
  var lessText = "<div style='font-family:\"Lucida Console\", Monaco, monospace;'>";
  for (i = 0; i < variables.length; i++) {
    name = variables[i].name;
    value = variables[i].displayValue;
    lessText += ("<span style='display:block;'>@" + name + ":\t" + value + ";" + "</span>");
  }
  lessText += "</div>";
  var w = window.open();
  $(w.document.body).html(lessText);
}

//
// CONSOLE SCRIPTS
//

function console(showtext) {
  $("#console").text(showtext);
}

function showVar( vars ) {
  // show string version of global variables array in the console
  console(JSON.stringify( vars ));
}






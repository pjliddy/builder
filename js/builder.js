// builder.js

// Declare global array of objects, one for each variable


// ADD MORE ATTRIBUTES TO GLOBAL VARIABLE STRUCTURE

var varData = [
  {
    name: "brand-primary"
    , category: "Colors"
    , subcategory: "Brand Colors"
    , displayName: "Brand Primary"
    , value: "#337ab7"
    , varType: "color"
    , configType: "function"
    , displayValue: "darken(#428bca, 6.5%)" //#337ab7
    , variable: ""
    , color: "#428bca"
    , configFunction: "darken"
    , tint: "6.5"
    }
    , {
    name: "brand-success"
    , category: "Colors"
    , subcategory: "Brand Colors"
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
    , category: "Colors"
    , subcategory: "Brand Colors"
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
    , category: "Colors"
    , subcategory: "Brand Colors"
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
    , category: "Colors"
    , subcategory: "Brand Colors"
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
    , category: "Colors"
    , subcategory: "Grays"
    , displayName: "Base Gray"  // name to use in tool panel
    , value: "#000"             // actual calculated value (use for local CSS)
    , varType: "color"          // variable type = color
    , configType: "colorpicker" // config type determines controllor activity based on type
    , displayValue: "#000000"   // display value field (hex, @variable, or formula)
    , variable: ""              // @variable if specified
    , color: "#000000"          // color picked
    , configFunction: ""        // function chosen
    , tint: "0"                 // tint value chosen
    }
    , {
    name: "gray-darker"
    , category: "Colors"
    , subcategory: "Grays"
    , displayName: "Darker Gray"
    , value: "#222"
    , varType: "color"
    , configType: "function"
    , displayValue: "lighten(@gray-base, 13.5%)"
    , variable: "@gray-base"
    , color: ""
    , configFunction: "lighten"
    , tint: "13.5"
    }
  , {
    name: "gray-dark"
    , category: "Colors"
    , subcategory: "Grays"
    , displayName: "Dark Gray"
    , value: "#333"
    , varType: "color"
    , configType: "function"
    , displayValue: "lighten(@gray-base, 20%)"
    , variable: "@gray-base"
    , color: ""
    , configFunction: "lighten"
    , tint: "20"
    }
  , {
    name: "gray"
    , category: "Colors"
    , subcategory: "Grays"
    , displayName: "Gray"
    , value: "#555"
    , varType: "color"
    , configType: "function"
    , displayValue: "lighten(@gray-base, 33.5%)"
    , variable: "@gray-base"
    , color: ""
    , configFunction: "lighten"
    , tint: "33.5"
    }
  , {
    name: "gray-light"
    , category: "Colors"
    , subcategory: "Grays"
    , displayName: "Light Gray"
    , value: "#777"
    , varType: "color"
    , configType: "function"
    , displayValue: "lighten(@gray-base, 46.7%)"
    , variable: "@gray-base"
    , color: ""
    , configFunction: "lighten"
    , tint: "46.7"
    }
  , {
    name: "gray-lighter"
    , category: "Colors"
    , subcategory: "Grays"
    , displayName: "Lighter Gray"
    , value: "#eee"
    , varType: "color"
    , configType: "function"
    , displayValue: "lighten(@gray-base, 93.5%)"
    , variable: "@gray-base"
    , color: ""
    , configFunction: "lighten"
    , tint: "93.5"
    }
  ,{
    name: "body-bg"
    , category: "Colors"
    , subcategory: "Scaffolding Colors"
    , displayName: "Body Background"
    , value: "#fff"
    , varType: "color"
    , configType: "colorpicker"
    , displayValue: "#ffffff"
    , variable: ""
    , color: "#ffffff"
    , configFunction: ""
    , tint: "0"
  }
  , {
    name: "text-color"
    , category: "Colors"
    , subcategory: "Scaffolding Colors"
    , displayName: "Text Color"
    , value: "#333333"
    , varType: "color"
    , configType: "colorpicker"
    , displayValue: "#333333"
    , variable: ""
    , color: "#333333"
    , configFunction: ""
    , tint: "0"
    }
];

//
// TEMPLATE SCRIPTS
//

var categoryVars = _.filter(varData, function(colorVar){ return colorVar.category == 'Colors'; });

var categoryTemplate = _.template( $('#category-template').html());

var categoryLayout = "";

categoryLayout += categoryTemplate({
  categoryVars: categoryVars,
  category: 'Colors'
});

$('.tool-panel').append(categoryLayout);


function layoutSubcategories ( catVars ){
  var subcategoryTemplate = _.template( $('#subcategory-template').html());
  var subcategoryVars = _.toArray(_.groupBy(catVars, function(catVar){ return catVar.subcategory; }));
  var subcategoryLayout = "";

  _.each( subcategoryVars, function( subcategoryVar, index, subcategoryVars ){
    var subcategory = subcategoryVar[0].subcategory;
    subcategoryLayout += subcategoryTemplate({ subcategoryVar: subcategoryVar, subcategory });
  });

  //alert (JSON.stringify( subcategoryVars ) );
  return subcategoryLayout;
}

function layoutVariables( variables ){
  var varTemplate = _.template( $('#colorvar-template').html());
  var varLayout = "";

  _.each( variables, function( variable, index, variables ){
    varLayout += varTemplate({ variable: variable });
  });
  return varLayout;
}


//
// INITIALIZE APP
//

$(function () {

  // GET & HANDLE JSON FILE WITH VARS & DATA

  // CREATE UI ELEMENTS

  // create color pickers
  _(_( varData ).where({ varType: "color" })).each( function( colorVar ){
    createColorPicker( colorVar.name );
    $( '#' + colorVar.name ).find( '.color-picker' ).css( 'background-color', getVar( colorVar.name, 'value' ));
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
   _(varData).findWhere({ name: varID })[valueID]=value;
  //myDataObj[valueID]=value;
}

function getVar(varID, valueID) {
  // finds the varID object with valueID and returns the value property
  return _(_(varData).findWhere({ name: varID })).propertyOf( )( valueID );
  //return  _.propertyOf( _.findWhere(varData, { name: varID }) )( valueID );
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
  //showVar( _(varData).where({ name: myVarID }) );
}


//
// LESS/CSS SCRIPTS
//

function generateVariables() {
  // when the user clicks the "export" link a version of variables.less is generated
  // and displayed in a new window
  var lessText = "<div style='font-family:\"Lucida Console\", Monaco, monospace;'>";
  for (i = 0; i < varData.length; i++) {
    name = varData[i].name;
    value = varData[i].displayValue;
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






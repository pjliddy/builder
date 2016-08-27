// builder.js

//
// INIT SCRIPTS
//

// load global variable data
var varData =  data;

// LAYOUT TOOL PANEL

var categoryVars = _.filter(varData, function(colorVar){ return colorVar.category == 'Colors'; });
var categoryTemplate = _.template( $('#category-template').html());
var categoryLayout = "";

categoryLayout += categoryTemplate({
  categoryVars: categoryVars,
  category: 'Colors'
});

$('.tool-panel').append(categoryLayout);

$(function () {
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

  // set config type menu fly up or down
  $('.config-type button').on('click', function ( clickEvt ) {
    setFlyup( clickEvt );
  });

  // color config type menu item selected
  $('.config-type a').click( updateConfigType );

  // color picker updated
  $('.color-picker').colorpicker().on('changeColor', function ( pickerEvt ) {
    updateColorPicker( pickerEvt);
  });

  // config variable close clicked
  $('.config-close').click( configClose );

  // config slider updated
  $(".config-tint .slider").on("slide", function( slideEvt ) {
    updateConfigTint( slideEvt );
  });

  $('.variable-display').each(function(){
    updateDisplayValue( $(this).attr("id") );
  });
});

//
// TEMPLATE SCRIPTS
//

function layoutSubcategories ( catVars ){
  var subcategoryTemplate = _.template( $('#subcategory-template').html());
  var subcategoryVars = _.toArray(_.groupBy(catVars, function(catVar){ return catVar.subcategory; }));
  var subcategoryLayout = "";

  _.each( subcategoryVars, function( subcategoryVar, index, subcategoryVars ){
    var subcategory = subcategoryVar[0].subcategory;
    subcategoryLayout += subcategoryTemplate({ subcategoryVar: subcategoryVar, subcategory });
  });

  return subcategoryLayout;
}

function layoutVariables( variables ){
  var varTemplate = _.template( $('#colorvar-template').html());
  var varLayout = "";

  _.each( variables, function( variable, index, variables ){
    varLayout += varTemplate({ variable: variable });

    if (variable.variable !=""){
      var watchObj = _.find(varData, function(varObj){ return varObj.name == variable.variable.replace("@", "") });

      watch( watchObj, 'value', function(){
        if ( getVar( variable.name, 'configType' ) == 'function'){
          setVar( variable.name, 'color', watchObj.value);
          updateConfigFunction( $('#' + variable.name));
        } else {
          setVar( variable.name, 'value', watchObj.value);
          updateDisplayValue( variable.name );
        }
      });
    }
  });
  return varLayout;
}

function layoutVarMenu( myVarID, varType ){
  var colorVars = _.filter( varData, function( varObj ){ return varObj.category == 'Colors'; });
  // exclude self from list (prevent circular refernces)
  var colorVars = _.reject( colorVars, function( varObj ){ return varObj.name == myVarID; });
  var menuItemTemplate = _.template( $( '#varmenu-template').html( ));
  var menuLayout = "";

  _.each( colorVars, function( colorVar, index, colorVars ){
    menuLayout += menuItemTemplate({ colorVar: colorVar });

    // create watch function
    watch(colorVar, "value", function(){
      $( '.var-menu-item:contains("@' + colorVar.name + '")').find('.swatch-dropdown').css('background-color', colorVar.value);
    });
  });
  return menuLayout;
}

//
// DATA HANDLING FUNCTIONS
//

function setVar( varID, valueID, value ){
   _(varData).findWhere({ name: varID })[valueID]=value;
}

function getVar(varID, valueID) {
  // finds the varID object with valueID and returns the value property
  return _(_(varData).findWhere({ name: varID })).propertyOf( )( valueID );
}

//
// UI OBJECT SETUP SCRIPTS
//

function createColorPicker( varID ) {
  // create color picker object with the specified hex color
  $('#' + varID + ' .color-picker').colorpicker({ color: getVar( varID, 'color'), align: 'left'  });
}

//
// COLOR CONFIG EVENT HANDLERS
//

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
      var menuLayout = layoutVarMenu( myVarID, 'color' );
      $(myVarContainer).find('.config-variables ul').append( menuLayout);
      $(myVarContainer).find('.config-variables').show();
      $(myVarContainer).find('.config-tint').hide();
      // config variable selected
      $('.config-variables a').click( updateConfigVariable );
      break;
    case 'function':
      $(myVarContainer).find('.config-variables').hide();
      $(myVarContainer).find('.config-tint').show();
      setVar( myVarID, 'configType', 'function' );
      setVar( myVarID, 'configFunction', $(this).data('option'));

      updateConfigFunction( $(myVarContainer) );
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

  var watchObj = _.find(varData, function(varObj){ return varObj.name == configVar });
  watch( watchObj, 'value', function(){
    if ( getVar( myVarID, 'configType' ) == 'function'){
      setVar( myVarID, 'color', watchObj.value);
      updateConfigFunction( $(myVarContainer));
    } else {
      setVar( myVarID, 'value', watchObj.value);
      updateDisplayValue( myVarID );
    }
  });

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

function configClose( ){
  var myVarContainer = $(this).closest('div').hide();
}

function setFlyup( clickEvt ){
  if ( $(window).height() - $( clickEvt.target).offset().top < 200 ){
    $( clickEvt.target).closest('div').removeClass( "dropdown" );
    $( clickEvt.target).closest('div').addClass( "dropup" );
  } else {
    $( clickEvt.target).closest('div').addClass( "dropdown" );
    $( clickEvt.target).closest('div').removeClass( "dropup" );
  }
}

function updateDisplayValue ( myVarID ){
  // if function, also call update function
  $('#' + myVarID).find('.config-display').val( getVar( myVarID, 'displayValue'));
  updateColorSwatch( myVarID );
   $("#layoutframe").contents().find( "." + myVarID ).css( "background-color", getVar( myVarID, 'value') );
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



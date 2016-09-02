// builder.js

//
// INIT SCRIPTS
//

// load global variable data
var fontData =  fonts;
var varData =  variables;

// layout tool panel
layoutCategories( _.groupBy(varData, function(varObj){ return varObj.category; }), '#tool-panel');

$(function () {
// CREATE UI ELEMENTS

  // create color pickers
  _(_( varData ).where({ varType: "color" })).each( function( colorVar ){
    createColorPicker( colorVar.name );
    $( '#' + colorVar.name ).find( '.color-picker' ).css( 'background-color', getVar( colorVar.name, 'value' ));
  });

  // create sliders
  $("input.slider").slider();

// EVENT LISTENERS -- move to where they are created (template scripts)

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

  // scroll to panel

  $('.panel-inner > .collapse').on("shown.bs.collapse", function( evt ) {
    var dest = s.strRight($(this).attr('id'), 'collapse-');
    $('#layoutframe')[0].contentWindow.$('body').trigger('scrollTo', dest );
  });

  $('.variable-display').each(function(){
    updateDisplayValue( $(this).attr("id") );
  });
});

//
// TEMPLATE SCRIPTS
//

function layoutCategories( categoryGroups, target ){
  _.each(categoryGroups, function( categoryGroup, categoryName, categoryGroups ){
    var categoryTemplate = _.template( $('#category-template').html());
    var categoryLayout = "";

    categoryLayout += categoryTemplate({
      categoryVars: categoryGroup,
      categoryName: categoryName
    });

    $(target).append(categoryLayout);
  });
}

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
  var varLayout = "";

  _.each( variables, function( variable, index, variables ){
     // use correct template based on varType
    switch( variable.varType ) {
      case 'color':
        var varTemplate = _.template( $('#colorvar-template').html());
        break;
      case 'font-family':
        var varTemplate = _.template( $('#fontfamilyvar-template').html());
        break;
      case 'font-size':
        var varTemplate = _.template( $('#fontsizevar-template').html());
        break;
      case 'attribute':
        var varTemplate = _.template( $('#attributevar-template').html());
        break;
    }

    varLayout += varTemplate({ variable: variable });
    var watchObj = _.find(varData, function(varObj){ return varObj.name == variable.variable.replace("@", "") });

    if (variable.variable ){
      watch( watchObj, 'value', function(){
        if ( getVar( variable.name, 'configType' ) == 'function'){
          setVar( variable.name, 'color', watchObj.value); // update to handle more than just color
          updateConfigFunction( $('#' + variable.name));
        } else {
          setVar( variable.name, 'value', watchObj.value);
          updateDisplayValue( variable.name );
        }
      });
    } else {
      // no variable. if there's a watcher, it needs to be removed
    }
  });
  return varLayout;
}

function layoutVarMenu( myVarID, varType ){
  var menuVars = _.filter( varData, function( varObj ){ return varObj.varType == varType; });

  // exclude self from list (prevent circular refernces)
  var menuVars = _.reject( menuVars, function( varObj ){ return varObj.name == myVarID; });
  var menuLayout = "";

  switch( varType ) {
      case 'color':
        var menuItemTemplate = _.template(
            '<a href="#" class="list-group-item var-menu-item text-nowrap" data-value="<%= menuVar.name %>">'
            + '<span class="swatch-dropdown" style="background-color: <%= menuVar.value %>"></span>@<%= menuVar.name %>'
          + '</a>'
        );
        break;
      case 'font-family':
        var menuItemTemplate = _.template(
          '<a href="#" class="list-group-item var-menu-item text-nowrap" data-value="<%= menuVar.name %>">'
          + '</span>@<%= menuVar.name %>'
          + '</a>'
        );
        break;
      case 'font-size':
        var menuItemTemplate = _.template(
          '<a href="#" class="list-group-item var-menu-item text-nowrap" data-value="<%= menuVar.name %>">'
          + '</span>@<%= menuVar.name %>'
          + '</a>'
        );
        break;
      case 'attribute':
         var menuItemTemplate = _.template(
          '<a href="#" class="list-group-item var-menu-item text-nowrap" data-value="<%= attribute %>">'
          + '</span>@<%= attribute %>'
          + '</a>'
        );
        break;
    }

    _.each( menuVars, function( menuVar, index, menuVars ){
      menuLayout += menuItemTemplate({ menuVar: menuVar });

      if (menuVar.varType == 'color') {
        // tell color swatches to update
        watch(menuVar, "value", function(){
        $( '.var-menu-item:contains("@' + menuVar.name + '")').find('.swatch-dropdown').css('background-color', menuVar.value);
      });
    }
  });
  return menuLayout;
}

function layoutFontMenu( myVarID ){
  var fontGroups = _.groupBy(fontData, function(fontObj){ return fontObj.familyType; });
  var familyType = s.strRight(myVarID, 'font-family-');
  var menuLayout = "";

  switch( familyType ) {
    case 'serif':
      var menuFonts = _.sortBy(fontGroups.serif, 'name');
      break;
    case 'sans-serif':
      var menuFonts = _.sortBy(fontGroups.sansserif, 'name');
      break;
    case 'monospace':
      var menuFonts = _.sortBy(fontGroups.monospace, 'name');
      break;
    default:
      var menuFonts = _.sortBy(fontData, 'name');
      break;
  }

  var menuItemTemplate = _.template(
    '<a href="#" class="list-group-item var-menu-item text-nowrap" data-value="<%= menuFont.name %>" style="font-family: <%= menuFont.value %>">'
    + '<%= menuFont.name %>'
    + '</a>'
  );

  _.each( menuFonts, function( menuFont, index, menuFonts ){
    menuLayout += menuItemTemplate({ menuFont:menuFont });
  });

  return menuLayout;
}

function layoutAttributeMenu( myVarID ){
  var attributes = [ "none", "underline", "overline", "overline underline", "line-through" ];
  var menuLayout = "";

  var menuItemTemplate = _.template(
    '<a href="#" class="list-group-item var-menu-item text-nowrap" data-value="<%= attribute %>" style="text-decoration: <%= attribute %>">'
    + '<%= attribute %>'
    + '</a>'
  );

  _.each( attributes, function( attribute, index, attributes ){
    menuLayout += menuItemTemplate({ attribute:attribute });
  });

  return menuLayout;
}

//
// DATA HANDLING FUNCTIONS
//

function setVar( varID, valueID, value ){
   _(varData).findWhere({ name: varID })[valueID]=value;
  // passes every var change; leaves it up to the layout to decide
  $('#layoutframe')[0].contentWindow.$('body').trigger('updateVar', {varID: varID, valueID:valueID, value:value});
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
  $('#' + varID + ' .color-picker').colorpicker({ color: getVar( varID, 'value'), align: 'left'  });
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
      // destroy existing menu
      $(myVarContainer).find('.config-variables ul').empty();
      var menuLayout = layoutVarMenu( myVarID, getVar( myVarID, 'varType') );
      $(myVarContainer).find('.config-variables ul').append( menuLayout);
      $(myVarContainer).find('.config-variables').show();
      $(myVarContainer).find('.config-tint').hide();
      $(myVarContainer).find('.config-fonts').hide();
      $(myVarContainer).find('.config-attribute').show();
      // config variable selected
      $('.config-variables a').click( updateConfigVariable );
      break;
    case 'function':
      $(myVarContainer).find('.config-tint').show();
      $(myVarContainer).find('.config-variables').hide();
      $(myVarContainer).find('.config-fonts').hide(); setVar( myVarID, 'configType', 'function' );
      setVar( myVarID, 'configFunction', $(this).data('option'));

      updateConfigFunction( $(myVarContainer) );
      break;
    case 'fontfamily':
      $(myVarContainer).find('.config-fonts ul').empty();
      var menuLayout = layoutFontMenu( myVarID );
      $(myVarContainer).find('.config-fonts ul').append( menuLayout);
      $(myVarContainer).find('.config-fonts').show();
      $(myVarContainer).find('.config-variables').hide();
      // config font family selected
      $('.config-fonts a').click( updateConfigFontFamily );
      break;
    case 'attribute':
      $(myVarContainer).find('.config-attribute ul').empty();
      var menuLayout = layoutAttributeMenu( myVarID );
      $(myVarContainer).find('.config-attribute ul').append( menuLayout);
      $(myVarContainer).find('.config-attribute').show();
      $(myVarContainer).find('.config-variables').hide();
      // config font family selected
      $('.config-attribute a').click( updateConfigAttribute );
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

function updateConfigFontFamily(){
  var myVarContainer = $(this).closest('.variable-display');
  var myVarID = $(myVarContainer).attr('id');
  var fontName = $(this).data("value");
  var fontAttr = _.find( fontData, function(font){ return font.name == fontName });

  setVar( myVarID, 'configType', 'fontfamily');
  setVar( myVarID, 'value', fontAttr.value);
  setVar( myVarID, 'displayValue', fontAttr.value);

  updateDisplayValue( myVarID );
}

function updateConfigAttribute(){
  var myVarContainer = $(this).closest('.variable-display');
  var myVarID = $(myVarContainer).attr('id');
  var myAttribute = $(this).data("value");

  setVar( myVarID, 'configType', 'attribute' );
  setVar( myVarID, 'displayValue', myAttribute );
  setVar( myVarID, 'value', myAttribute );

  // apply to display value
  $(myVarContainer).find('.config-display').css('text-decoration', myAttribute );

  updateDisplayValue( myVarID ); // bind display to value when created ?
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
  lessText += "// default values //";
  for (i = 0; i < defaults.length; i++) {
    name = defaults[i].name;
    value = defaults[i].displayValue;
    lessText += ("<span style='display:block;'>" + name + ":\t" + value + ";" + "</span>");
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



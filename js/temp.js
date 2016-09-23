// builder.js

//
// INIT SCRIPTS
//

var gFontData =  fonts;                     // load global font data
var gVarData = {};                          // initialize global variable data

getVarData( variables );                    // create variable object structure
layoutCategories( '#tool-panel');           // layout tool panel

// load variable data

function getVarData( varObjects ){
  var output = {};
  _.each( variables, function( varObject, index, varObjects ){
    switch( varObject.varType ) {
      case 'color':
        varObj = new ColorVar( varObject );
        break;
      default:
        varObj = new Variable( varObject );
        break;
    }

    // add to gVarData with each iteration so other vars can use them
    // may have an issue if referenced out of order
    gVarData[varObject.name] = varObj;
  });
}

function getVarObj ( variable ){
  variable = variable.replace("@", "");
  var varObj = gVarData[ variable ]
  return varObj;
}

//
// LAYOUT SCRIPTS
//

// layout categories in tool panel

function layoutCategories( target ){
  var categoryGroups = _.groupBy(gVarData, function(varObj){ return varObj.category; })
  var categoryTemplate = _.template( $('#category-template').html());

  _.each(categoryGroups, function( categoryGroup, categoryName, categoryGroups ){

    var categoryLayout = categoryTemplate({
      categoryName: categoryName
    });

    $( target ).append( categoryLayout );

    var subTarget = $( '#collapse-' + s.slugify(categoryName.toLowerCase()));
    layoutSubcategories( categoryGroup, subTarget );
  });
}

// layout subcategories in tool panel

function layoutSubcategories ( dataObjects, target ){
  var subcategoryTemplate = _.template( $('#subcategory-template').html());
  var subcategoryGroup = _.toArray(_.groupBy(dataObjects, function(varObj){ return varObj.subcategory; }));
  var subcategoryLayout = "";

  _.each( subcategoryGroup, function( subcategoryVar, index, subcategoryVars ){
    var subcategory = subcategoryVar[0].subcategory;
    subcategoryLayout = subcategoryTemplate({
      subcategoryVar: subcategoryVar, subcategory
    });

    $( target ).append( subcategoryLayout );

    var varTarget = $( '#collapse-' + s.slugify(subcategory.toLowerCase()));
    layoutVariables( subcategoryVar, varTarget );
  });
}

// layout variables in tool panel

function layoutVariables( dataObjects, target ){
  var varTemplate = _.template( $('#var-template').html());

  _.each( dataObjects, function( varObject, index, varObjects ){
    varObject.renderTemplate( target );
  });
}



//$(function () {
//// CREATE UI ELEMENTS


//  // create sliders
//  $("input.slider").slider();
//
//// EVENT LISTENERS -- move to where they are created (template scripts)
//
//  // export link clicked
//  $('#link-export').click( generateVariables );
//
//
//  // config variable close clicked
//  $('.config-close').click( configClose );
//
//  // config slider updated
//  $(".config-tint .slider").on("slide", function( slideEvt ) {
//    updateConfigTint( slideEvt );
//  });
//
//  // scroll to panel
//
//  $('.panel-inner > .collapse').on("shown.bs.collapse", function( evt ) {
//    var dest = s.strRight($(this).attr('id'), 'collapse-');
//    $('#layoutframe')[0].contentWindow.$('body').trigger('scrollTo', dest );
//  });
//
//  $('.variable-display').each(function(){
//    updateoutput( $(this).attr("id") );
//  });
//});


////
//// TEMPLATE SCRIPTS
////


//function layoutVarMenu( myVarID, varType ){
//  var menuVars = _.filter( varData, function( varObj ){ return varObj.varType == varType; });
//
//  // exclude self from list (prevent circular refernces)
//  var menuVars = _.reject( menuVars, function( varObj ){ return varObj.name == myVarID; });
//  var menuLayout = "";
//
//  switch( varType ) {
//      case 'color':
//        var menuItemTemplate = _.template(
//            '<a href="#" class="list-group-item var-menu-item text-nowrap" data-value="<%= menuVar.name %>">'
//            + '<span class="swatch-dropdown" style="background-color: <%= menuVar.value %>"></span>@<%= menuVar.name %>'
//          + '</a>'
//        );
//        break;
//      case 'font-family':
//        var menuItemTemplate = _.template(
//          '<a href="#" class="list-group-item var-menu-item text-nowrap" data-value="<%= menuVar.name %>">'
//          + '@<%= menuVar.name %>'
//          + '</a>'
//        );
//        break;
//      case 'font-size':
//        var menuItemTemplate = _.template(
//          '<a href="#" class="list-group-item var-menu-item text-nowrap" data-value="<%= menuVar.name %>">'
//          + '@<%= menuVar.name %>'
//          + '</a>'
//        );
//        break;
//      case 'attribute':
//         var menuItemTemplate = _.template(
//          '<a href="#" class="list-group-item var-menu-item text-nowrap" data-value="<%= attribute %>">'
//          + '@<%= attribute %>'
//          + '</a>'
//        );
//        break;
//    }
//
//


//  });
//  return menuLayout;
//}


//function layoutFontMenu( myVarID ){
//  var fontGroups = _.groupBy(fontData, function(fontObj){ return fontObj.familyType; });
//  var familyType = s.strRight(myVarID, 'font-family-');
//  var menuLayout = "";
//
//  switch( familyType ) {
//    case 'serif':
//      var menuFonts = _.sortBy(fontGroups.serif, 'name');
//      break;
//    case 'sans-serif':
//      var menuFonts = _.sortBy(fontGroups.sansserif, 'name');
//      break;
//    case 'monospace':
//      var menuFonts = _.sortBy(fontGroups.monospace, 'name');
//      break;
//    default:
//      var menuFonts = _.sortBy(fontData, 'name');
//      break;
//  }
//
//  var menuItemTemplate = _.template(
//    '<a href="#" class="list-group-item var-menu-item text-nowrap" data-value="<%= menuFont.name %>" style="font-family: <%= menuFont.value %>">'
//    + '<%= menuFont.name %>'
//    + '</a>'
//  );
//
//  _.each( menuFonts, function( menuFont, index, menuFonts ){
//    menuLayout += menuItemTemplate({ menuFont:menuFont });
//  });
//
//  return menuLayout;
//}


//function layoutAttributeMenu( myVarID ){
//  var attributes = [ "none", "underline", "overline", "overline underline", "line-through" ];
//  var menuLayout = "";
//
//  var menuItemTemplate = _.template(
//    '<a href="#" class="list-group-item var-menu-item text-nowrap" data-value="<%= attribute %>" style="text-decoration: <%= attribute %>">'
//    + '<%= attribute %>'
//    + '</a>'
//  );
//
//  _.each( attributes, function( attribute, index, attributes ){
//    menuLayout += menuItemTemplate({ attribute:attribute });
//  });
//
//  return menuLayout;
//}


////
//// COLOR CONFIG EVENT HANDLERS
////


//function updateConfigVariable(){
//  var myVarContainer = $(this).closest('.variable-display');
//  var myVarID = $(myVarContainer).attr('id');
//  var configVar = $(this).data("value");
//
//  // get configVar's value
//  var colorValue = getVar( configVar, 'value');
//  setVar( myVarID, 'variable', "@" + configVar );
//
//  var watchObj = _.find(varData, function(varObj){ return varObj.name == configVar });
//  watch( watchObj, 'value', function(){
//    if ( getVar( myVarID, 'configType' ) == 'function'){
//      setVar( myVarID, 'color', watchObj.value);
//      updateConfigFunction( $(myVarContainer));
//    } else {
//      setVar( myVarID, 'value', watchObj.value);
//      updateoutput( myVarID );
//    }
//  });
//
//  if ( getVar(myVarID, 'configType') == 'function'){
//    updateConfigFunction( $(myVarContainer) );
//  } else {
//    // if picker or var, replace all values
//    setVar( myVarID, 'configType', 'variable');
//    setVar( myVarID, 'color', colorValue);
//    setVar( myVarID, 'value', colorValue);
//    setVar( myVarID, 'output', getVar( myVarID, 'variable'));
//  }
//  updateoutput( myVarID );
//}



//function updateConfigTint( slideEvt ){
//  var myVarContainer = slideEvt.target.closest('.variable-display');
//  var myVarID = myVarContainer.id;
//  var tintValue = slideEvt.value;
//
//  setVar( myVarID, 'tint', tintValue );
//  updateConfigFunction( myVarContainer );
//  updateoutput( myVarID );
//}


//function updateConfigFontFamily(){
//  var myVarContainer = $(this).closest('.variable-display');
//  var myVarID = $(myVarContainer).attr('id');
//  var fontName = $(this).data("value");
//  var fontAttr = _.find( fontData, function(font){ return font.name == fontName });
//
//  setVar( myVarID, 'configType', 'fontfamily');
//  setVar( myVarID, 'value', fontAttr.value);
//  setVar( myVarID, 'output', fontAttr.value);
//
//  updateoutput( myVarID );
//}


//function updateConfigAttribute(){
//  var myVarContainer = $(this).closest('.variable-display');
//  var myVarID = $(myVarContainer).attr('id');
//  var myAttribute = $(this).data("value");
//
//  setVar( myVarID, 'configType', 'attribute' );
//  setVar( myVarID, 'output', myAttribute );
//  setVar( myVarID, 'value', myAttribute );
//
//  // apply to display value
//  $(myVarContainer).find('.config-display').css('text-decoration', myAttribute );
//
//  updateoutput( myVarID ); // bind display to value when created ?
//}


//function configClose( ){
//  var myVarContainer = $(this).closest('div').hide();
//}


//
// LESS/CSS SCRIPTS
//

function generateVariables() {
  // when the user clicks the "export" link a version of variables.less is generated
  // and displayed in a new window
  var lessText = "<div style='font-family:\"Lucida Console\", Monaco, monospace;'>";
  for (i = 0; i < varData.length; i++) {
    name = varData[i].name;
    value = varData[i].output;
    lessText += ("<span style='display:block;'>@" + name + ":\t" + value + ";" + "</span>");
  }
  lessText += "// default values //";
  for (i = 0; i < defaults.length; i++) {
    name = defaults[i].name;
    value = defaults[i].output;
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
  $("#console").append(showtext + '<br/>');
}

function showVar( vars ) {
  // show string version of global variables array in the console
  console(JSON.stringify( vars ));
}



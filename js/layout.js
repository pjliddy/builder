// layout frame event listeners go here

// load global variable data
var fontdata =  fonts;
var varData =  variables;

_.each( varData, function( variable, index, varData ){
  var name = variable.name;
  var value = variable.value

  // same as function for setting display values (called too frequently by parent frame)
  switch( variable.varType ) {
    case 'color':
      $("#" + variable.name ).css('background-color', variable.value);
//      less.modifyVars({
//        name: value
//      });
      break;
    case 'font-family':
      $("#" + variable.name ).css('font-family', variable.value);
//      less.modifyVars({
//        name: value
//      });
      break;
  }
});

$('body').on('updateVar', function(evt, attr ) {
  setDisplayVal( attr.varID, attr.valueID, attr.value );
});

$('html, body').on('scrollTo', function( evt, dest ){
  $('html, body').animate({
      scrollTop: ( $('#' + dest ).offset().top )
    },300);
  ;
});

function setDisplayVal( varID, varName, varValue ){
//  varName = '@'+ varName;
//  less.modifyVars({
//    varName: varValue
//  });

  var varObj = _( varData ).findWhere({ name: varID })

  varObj[varName] = varValue;

  // replace this approach with LESS real time updates

  switch( varObj.varType ) {
    case 'color':
      $( "." + varID ).css( 'background-color', varObj.value );

      if ( varID == 'link-color' ) {
        $( 'a' ).css( 'color', varObj.value );
      } else if ( varID == 'link-hover-color' ) {
        // can't change value of hover CSS directly with JS (need to define classes and switch them out)
        $('<style>').text('.custom-link:hover { color: ' + varObj.value + '; }').appendTo('head');
        $('#custom-link').removeClass('custom-link');
        $('#custom-link').addClass('custom-link');
      }
      break;
    case 'font-family':
      $( "." + varID ).css( 'font-family', varObj.value );

      if ( varID == 'font-family-base' ) {
        $( 'h1, h2, h3, label' ).css( 'font-family', varObj.value );
      }
      break;
//    case 'attribute': // only works for text-decoration
//      $( "." + varID ).css( 'text-decoration', varObj.value );
//
//      if ( varID == 'link-hover-decoration' ) {
//        // can't change value of hover CSS directly with JS (need to define classes and switch them out)
//        $('<style>').text('.custom-underline:hover { text-decoration: ' + varObj.value + '; }').appendTo('head');
//        $('#custom-link').removeClass('custom-underline');
//        $('#custom-link').addClass('custom-underline');
//
//        // SOMEWHERE THE LINK AND HOVER COLORS ARE CONFICTING WHEN VARIABLES ARE SELECTED
//      }
//      break;
  }

  // being called 3 times (something wrong here)
  console.log(varObj);
};


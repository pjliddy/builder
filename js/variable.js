/*******************************
*
*  Variable Object Base Class
*
*******************************/

/*
 *
 *  Variable Definition
 *
 */

Variable = function( data ) {
  // set object properties
  this.name = data.name;
  this.varType = data.varType;
  this.displayName = data.displayName;
  this.category = data.category;
  this.subcategory = data.subcategory
  this.output = data.output;

  this.template = _.template( $( '#var-template' ).html( ));
};


/*
 *
 *  Variable Setup
 *
 */

Variable.prototype.initValue = function( ){
  if ( s.startsWith( this.output, '@' )){

    // is a variable
    this.configType = 'variable';
    this.variable = this.output;
    this.value = getVarObj( this.output ).valueOf();
    this.setVarListener( this );
  }
};

Variable.prototype.renderTemplate = function( wrapper ){
  var varLayout = this.template({
    variable: this
  });

  // add layout to UI and store HTML element for variable config UI
  $( wrapper ).append( varLayout );
  this.element = $('#' + this.name );

  // set config type menu fly up or down
  this.flyUpListener( this );
};


/*
 *
 *  Variable Functions
 *
 */

Variable.prototype.updateConfigType = function( evt ){
  var configTypeSelect = evt.target.getAttribute( 'data-value' );
  var useClass = false;

  switch( configTypeSelect ) {
    case 'function':
//      $(this.element).find('.config-tint').show();
//      $(this.element).find('.config-variables').hide();
//      $(this.element).find('.config-fonts').hide();
      this.configType = configTypeSelect;
      this.configFunction = evt.target.getAttribute( 'data-option' );
      this.updateFunction();
      useClass = true;
      break;
    case 'variable':
      this.varWidgetObj = new ConfigWidget( this, 'variable' );
      this.varWidgetObj.renderTemplate( this );
      break;
  }

  if ( useClass ) {
    this.calcValue();
  }
};

Variable.prototype.updateDisplay = function( ){
  $( this.element ).find( '.config-display' ).val( this.output );
};

Variable.prototype.setVariable = function( variable ){
  this.variable = variable;
  this.color = "";

  if (this.configType == 'function'){
    this.value = this.updateFunction();
  } else {
     this.configType = 'variable';
  }

  this.setVarListener( this );
  this.calcValue();
}


/*
 *
 *  Variable Utilities
 *
 */

Variable.prototype.valueOf = function( ) {
  // returns calculated output value
  return this.value;
};

Variable.prototype.toString = function( ){
  return JSON.stringify( this );
}


/*
 *
 *  Variable Event Listeners
 *
 */

Variable.prototype.setConfigTypeListener = function( thisObj ){

  // config type menu item selected
  $(thisObj.element).find('.config-type a').on('click', function ( evt ) {
    thisObj.updateConfigType( evt, thisObj );
  });
};

Variable.prototype.flyUpListener = function( thisObj ){

  // config type menu selected
  $(thisObj.element).find('.config-type button').on('click', function ( evt ) {
    thisObj.handleFlyup( evt );
  });
};


/*
 *
 *  Variable Event Handlers
 *
 */

Variable.prototype.handleFlyup = function ( clickEvt ){
  if ( $(window).height() - $( clickEvt.target).offset().top < 200 ){
    $( clickEvt.target).closest('.dropdown').addClass( "dropup" );
    $( clickEvt.target).closest('.dropdown').removeClass( "dropdown" );
  } else {
    $( clickEvt.target).closest('.dropup').removeClass( "dropup" );
    $( clickEvt.target).closest('.dropup').addClass( "dropdown" );
  }
};

/********************************
*                               *
*  ColorVar Object Class        *
*  Extends Variable Base Class  *
*                               *
*********************************/

/*
 *
 *  ColorVar Definition
 *
 */

ColorVar = function ( data ) {
  Variable.call( this, data );
  this.initValue( );
};

ColorVar.prototype = Object.create( Variable.prototype );


/*
 *
 *  ColorVar Setup
 *
 */

ColorVar.prototype.initValue = function( ){
  Variable.prototype.initValue.call( this );
  this.tint = 0;

  if ( s.startsWith( this.output, '#' )){
    // is a hex color
    this.configType = 'colorpicker';
    this.color = this.output;
    this.value = this.output;
    this.variable = "";
  } else if ( s.startsWith( this.output, 'lighten' ) || s.startsWith( this.output, 'darken' )){
    // is a color function
    this.configType = 'function';
    this.parseFunction();
  }
};

ColorVar.prototype.parseFunction = function( ){

  // functions specific for color (for now)

  this.configFunction = this.output.match(/^[\w]*/).toString();
  this.tint = s.strLeft(this.output.match(/[\d\.]*%/), '%');

  if ( match = this.output.match( /#[\da-f]*/ )){
    // has hex color
    this.color = match.toString();
  } else if ( match = this.output.match( /@[\w-]*/ )){
    // has variable
    this.variable = match.toString();
    this.setVarListener( this );
  }

  this.updateFunction();
};

ColorVar.prototype.renderTemplate = function( wrapper ){

  //  call super method from base class to render Variable layout
  Variable.prototype.renderTemplate.call( this, wrapper );

  // add color picker to UI
  this.addColorPicker( wrapper );

  // add configTypes to configType dropdown
  this.addConfigMenu( );
};

ColorVar.prototype.addColorPicker = function( wrapper ){
  // set up underscore template
  var myTemplate = _.template( '<a href="#" class="btn btn-default input-group-addon color-picker"></a>' );
  var myTarget = $(this.element).find( '.input-group input' );
  var varLayout = myTemplate({
    color:this.value
  });

  // add picker to UI
  $( myTarget ).before( varLayout );

  // create color picker object with the the value of this colorVar
  $(this.element).find( '.color-picker' ).colorpicker({ color: this.valueOf( ), align: 'left' });

  // update UI values
  this.updateDisplay();

  // set up color picker listener
  this.colorPickerListener( this );
}

ColorVar.prototype.addConfigMenu = function( ){

  // CREATE FUNCTION FOR BASE VARIABLE CLASS (choose variable) AND UPDATE BY CHILD CLASSES?

  var menuLayout = '<li><a href="#" data-value="colorpicker">Color Picker</a></li>'
    + '<li><a href="#" data-value="variable">Choose Variable</a></li>'
    + '<li><a href="#" data-value="function" data-option="darken">Darken</a></li>'
    + '<li><a href="#" data-value="function" data-option="lighten">Lighten</a></li>';
  var myTarget = $(this.element).find('.config-type ul');

  $( myTarget ).html( menuLayout );
  this.setConfigTypeListener( this );
}


/*
 *
 *  ColorVar Functions
 *
 */

ColorVar.prototype.updateFunction = function( ){

  // only valid for color now; may move to base class with more var types

  if ( this.variable ) {
    var myColor = getVarObj( this.variable ).valueOf();
    this.output = this.configFunction + "(" + this.variable + "," + this.tint + "%)";
  } else {
    var myColor = this.color;
    this.output = this.configFunction + "(" + this.color + "," + this.tint + "%)";
  }

  switch( this.configFunction ) {
    case 'lighten':
     this.value = tinycolor( myColor ).lighten( this.tint ).toString();
      break;
    case 'darken':
     this.value = tinycolor( myColor ).darken( this.tint ).toString();
      break;
  }

  this.updateDisplay();
};

ColorVar.prototype.calcValue = function(){

  // should be part of parent class with super call

  var oldValue = this.valueOf();

  switch( this.configType ) {
    case 'colorpicker':
      this.value = this.output;
      break;
    case 'variable':
      this.value = tinycolor( getVarObj( this.variable ).valueOf()).toString();
      this.output = this.variable;
      break;
    case 'function':
      this.updateFunction();
      break;
  }

  this.updateDisplay();

  if (this.valueOf() != oldValue ){
    // prevents unecessary events triggered by color picker
    $( this ).trigger( "updateValue" );
  }
};


/*
 *
 *  ColorVar Utilities
 *
 */

ColorVar.prototype.updateDisplay = function( ){

  // update display field
  Variable.prototype.updateDisplay.call( this );

  // set color picker display color
  $(this.element).find( '.color-picker' ).css( 'background-color', this.valueOf( ));
}


/*
 *
 *  ColorVar Event Listeners
 *
 */

ColorVar.prototype.setVarListener = function( thisObj ){
  var target = getVarObj( thisObj.variable );

  $( target ).bind( "updateValue", function( ) {
    thisObj.calcValue( );
  });
};

ColorVar.prototype.colorPickerListener = function( thisObj ){
  $( thisObj.element ).find( '.color-picker' ).colorpicker( ).on( 'changeColor', function ( evt ) {
    thisObj.updateColorPicker( evt );
  });
};


/*
 *
 *  ColorVar Event Handlers
 *
 */

ColorVar.prototype.updateConfigType = function( evt ){
  Variable.prototype.updateConfigType.call(this, evt);
  var configTypeSelect = evt.target.getAttribute( 'data-value' );
  var useClass = false;

  switch( configTypeSelect ) {
    case 'colorpicker':
      $(this.element).find('.config-variables').hide();
//      $(this.element).find('.config-tint').hide();
      this.configType = configTypeSelect;
      this.variable = '';
      this.color =this.value;
      this.output =this.value;
      useClass = true;
      break;
  }

  if ( useClass ){
    this.calcValue();
  }
};

ColorVar.prototype.updateColorPicker = function( evt ){
  var tempColor = this.value;
  this.color = evt.color.toHex();

  if ( this.color != tempColor ){
    if ( this.configType == 'function'){
      this.variable = '';
    } else {
      this.configType = 'colorpicker';
      this.output = this.color;
    }
    this.calcValue();
  }
};



//function updateConfigType(){
//  switch( this.configType ) {

//    case 'variable':
//      // destroy existing menu (should be on close widget)
//      $(this.element).find('.config-variables ul').empty();
//      var menuLayout = layoutVarMenu( this.name, getVar( this.name, 'varType') );
//      $(this.element).find('.config-variables ul').append( menuLayout);
//      $(this.element).find('.config-variables').show();
//      $(this.element).find('.config-tint').hide();
//      $(this.element).find('.config-fonts').hide();
//      $(this.element).find('.config-attribute').show();
//      // config variable selected
//      $('.config-variables a').click( updateConfigVariable );
//      break;

//    case 'fontfamily':
//      $(this.element).find('.config-fonts ul').empty();
//      var menuLayout = layoutFontMenu( this.name );
//      $(this.element).find('.config-fonts ul').append( menuLayout);
//      $(this.element).find('.config-fonts').show();
//      $(this.element).find('.config-variables').hide();
//      // config font family selected
//      $('.config-fonts a').click( updateConfigFontFamily );
//      break;

//    case 'attribute':
//      $(this.element).find('.config-attribute ul').empty();
//      var menuLayout = layoutAttributeMenu( this.name );
//      $(this.element).find('.config-attribute ul').append( menuLayout);
//      $(this.element).find('.config-attribute').show();
//      $(this.element).find('.config-variables').hide();
//      // config font family selected
//      $('.config-attribute a').click( updateConfigAttribute );
//      break;
//  }

//  updateoutput( this.name );
//}
//




/**********************
*
*  ConfigWidget Class
*
***********************/

/*
 *
 *  Class Definition
 *
 */

// DEFINE / SEPARATE THIS.ELEMENT FROM BASE INSTANTIATOR

ConfigWidget = function( varObj, widgetType ) {
  this.varObj = varObj;

  // get varObjects with the matching varType (excluding self)
  this.variables = _.filter( gVarData, function( varData ){
      return (varData.varType == varObj.varType); // && (varData != varObj))
    }
  );

  this.element = $( this.varObj.element ).find('.config-variables .list-group');
};


/*
 *
 *  ConfigWidget Setup
 *
 */


// COLOR VAR WIDGET CLASS (BREAK DOWN INTO WIDGET, VAR, AND COLOR VAR)


ConfigWidget.prototype.renderTemplate = function( varObj ){
  var menuItemTemplate = _.template(
      '<a href="#" class="list-group-item var-menu-item text-nowrap" data-value="<%= varObj.name %>">'
      + '<span class="swatch-dropdown" style="background-color: <%= varObj.value %>"></span>@<%= varObj.name %>'
      + '</a>'
    );

  var thisObj = this;  //needed because _.each treats this as the window
  _.each( varObj.varWidgetObj.variables, function( variable, index, variables ){
    var label = "@"+variable.name;
    var menuItemLayout = menuItemTemplate({
      varObj: variable
    });

    $( thisObj.element ).append( menuItemLayout );

    // listener for change in variable values (update display if changes)
    thisObj.setVarListener( thisObj, variable );

    // listener for click on config menu item
    thisObj.setVarSelectListener( thisObj, variable );

    // if self, disable this one or if the variable references this varObj
    // should go through chain to avoid circular references (can't select shared ancestor?)
    if (( variable == varObj ) || ( variable.variable == "@" + varObj.name )){
      $( varObj.element ).find( '.var-menu-item[data-value=' + variable.name + ']').addClass('disabled');
    }
  });

  // set listener for close
  this.setCloseListener( this );

  // show configWidget
  $( this.element ).closest('.config-variables').show();
};


/*
 *
 *  ConfigWidget Functions
 *
 */


/*
 *
 *  ConfigWidget Utilities
 *
 */


/*
 *
 *  ConfigWidget Event Listeners
 *
 */

// WIDGET CLASS

ConfigWidget.prototype.setCloseListener = function( thisObj ){
  $( thisObj.element ).closest( '.config-variables' ).find( '.config-close' ).on( 'click', function ( evt ){
    thisObj.closeWidget( evt, thisObj );
  });
};

// COLOR VAR WIDGET SUB CLASS

ConfigWidget.prototype.setVarListener = function( thisObj, varObj ){
  //var targetObj = getVarObj( '@' + varObj.name );

  $( varObj ).on( "updateValue", function( ) {
    // set swatch color
    $( thisObj.element ).find('.var-menu-item[data-value=' + varObj.name + '] .swatch-dropdown').css('background-color', varObj.valueOf());
  });
};

// VAR WIDGET CLASS

ConfigWidget.prototype.endVarListener = function( thisObj, varObj ){
  $( varObj ).off( "updateValue" );
};

// VAR WIDGET CLASS

ConfigWidget.prototype.setVarSelectListener = function( thisObj, varObj ){
  $( thisObj.element ).find( '.var-menu-item[data-value=' + varObj.name + ']' ).on( 'click', function ( evt ){
    thisObj.updateVariable( evt, thisObj );
  });
};


/*
 *
 *  ConfigWidget Event Handlers
 *
 */

ConfigWidget.prototype.closeWidget = function( evt, thisObj ){
  var wrapper = $( thisObj.element ).closest( '.config-variables' )

  // hide .config-variables
  $( wrapper ).hide();

  // clear .list-group wrapper html
  $( wrapper ).find( '.list-group' ).empty();

  // remove close event handler
  $( thisObj.element ).closest( '.config-variables' ).find( '.config-close' ).off( 'click' );

  // need to destroy object? generate close event & have parent destroy?
};

ConfigWidget.prototype.updateVariable = function( evt, thisObj ){
  var newVariable = evt.target.getAttribute( 'data-value' );
  thisObj.varObj.setVariable( '@' + newVariable );
};



//function layoutVarMenu( myVarID, varType ){

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




/*******************************
*
*  Class Name
*
*******************************/

/*
 *
 *  Class Definition
 *
 */

/*
 *
 *  Class Setup
 *
 */

/*
 *
 *  Class Functions
 *
 */

/*
 *
 *  Class Utilities
 *
 */

/*
 *
 *  Class Event Listeners
 *
 */

/*
 *
 *  ColorVar Event Handlers
 *
 */


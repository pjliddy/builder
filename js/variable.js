//
// VARIABLE CLASS
//

Variable = function( data ) {
  // set object properties
  this.name = data.name;
  this.varType = data.varType;
  this.displayName = data.displayName;
  this.category = data.category;
  this.subcategory = data.subcategory
  this.output = data.output;
  this.variable = data.variable;
  this.tint = data.tint;
  this.template = _.template( $('#var-template').html());
};

Variable.prototype.valueOf = function( ) {
  // returns calculated output value
  return this.value;
};

Variable.prototype.parseFunction = function() {
  this.configFunction = this.output.match(/^[\w]*/).toString();
  this.tint = s.strLeft(this.output.match(/[\d\.]*%/), '%');

  if (( match = this.output.match(/#[\da-f]*/)) ||  (match = this.output.match(/@[\w-]*/)))  {
    // if value is a var (treats it as a color == NO)
    this.color = match.toString();
    this.value = this.updateFunction();
  }
};

Variable.prototype.updateFunction = function(){
  switch( this.configFunction ) {
    case 'lighten':
     this.value = tinycolor( this.color ).lighten( this.tint ).toString();
      break;
    case 'darken':
     this.value = tinycolor( this.color ).darken( this.tint ).toString();
      break;
  }

  if (this.variable != "") {
    this.color = getVarObj( this.variable ).valueOf();
    this.output = this.configFunction + "(" + this.variable + "," + this.tint + "%)";
  } else {
    this.output = this.configFunction + "(" + this.color + "," + this.tint + "%)";
  }

  return this.value;
};

Variable.prototype.getTemplate = function( target ){
  var varLayout = this.template({
    variable: this
  });

  $( target ).append( varLayout );
  this.element = $('#' + this.name );

  // set config type menu fly up or down
  this.flyUpListener( this );
};

Variable.prototype.flyUpListener = function( thisObj ){
  $(thisObj.element).find('.config-type button').on('click', function ( evt ) {
    thisObj.setFlyup( evt );
  });
};

Variable.prototype.setFlyup = function ( clickEvt ){
  if ( $(window).height() - $( clickEvt.target).offset().top < 200 ){
    $( clickEvt.target).closest('.dropdown').addClass( "dropup" );
    $( clickEvt.target).closest('.dropdown').removeClass( "dropdown" );
  } else {
    $( clickEvt.target).closest('.dropup').removeClass( "dropup" );
    $( clickEvt.target).closest('.dropup').addClass( "dropdown" );
  }
};

Variable.prototype.updateDisplay = function (){
  $(this.element).find('.config-display').val( this.output );
};

//
// COLORVAR SUBCLASS
//

ColorVar = function ( data ) {
  // Call the parent constructor
  Variable.call( this, data );
  this.initValue( );
};

ColorVar.prototype = Object.create(Variable.prototype);

ColorVar.prototype.initValue = function( ){
  // output could be hex (colorpicker), @variable, or function
  if ( s.startsWith( this.output, '#' )){
    this.configType = 'colorpicker';
    this.color = this.output;
    this.value = this.output;
  } else if ( s.startsWith( this.output, '@' )){
    this.configType = 'variable';
    this.value = tinycolor( getVarObj( this.output ).valueOf()).toString();
  } else if ( s.startsWith( this.output, 'lighten' ) || s.startsWith( this.output, 'darken' )){
    this.configType = 'function';
    this.parseFunction();
  }

  if (this.variable){
    // set listener to var -- needs to be at parent class level
    this.setVarListener( this );
  }
};

ColorVar.prototype.setVarListener = function( thisObj ){
  var target = getVarObj( thisObj.variable );

  $( target ).bind( "updateValue", function() {
    thisObj.color = target.valueOf();
    thisObj.calcValue();
  });
};

ColorVar.prototype.calcValue = function(){
  switch( this.configType ) {
    case 'colorpicker':
      this.value = this.output;
      break;
    case 'variable':
      this.value = tinycolor( getVarObj( this.output ).valueOf()).toString();
      break;
    case 'function':
      this.updateFunction();
      break;
  }

  this.updateDisplay();
  this.setDisplayColor();
  $( this ).trigger( "updateValue" );
};

ColorVar.prototype.updateTemplate = function( ){
  // add color picker to varible UI
  var myTemplate = _.template('<a href="#" class="btn btn-default input-group-addon color-picker"></a>');
  var target = $(this.element).find('.input-group input');
  var varLayout = myTemplate({
    color:this.value
  });

  $( target ).before( varLayout );

  this.updateDisplay();

  // create color picker object with the specified hex color
  $(this.element).find( '.color-picker' ).colorpicker({ color: this.valueOf( ), align: 'left' });

  this.setDisplayColor();
  this.colorPickerListener( this );

  // add configTypes to configType dropdown
  var menuLayout = '<li><a href="#" data-value="colorpicker">Color Picker</a></li>'
    + '<li><a href="#" data-value="variable">Choose Variable</a></li>'
    + '<li><a href="#" data-value="function" data-option="darken">Darken</a></li>'
    + '<li><a href="#" data-value="function" data-option="lighten">Lighten</a></li>';
  var target = $(this.element).find('.config-type ul');

  $( target ).html( menuLayout );
  this.configTypeListener( this );
  // set menu listener
};

ColorVar.prototype.setDisplayColor = function( ){
  // set color picker display color
  $(this.element).find( '.color-picker' ).css( 'background-color', this.valueOf( ));
}

ColorVar.prototype.configTypeListener = function( thisObj ){
   // color config type menu item selected
  $(thisObj.element).find('.config-type a').on('click', function ( evt ) {
    thisObj.updateConfigType( evt, thisObj );
  });
};

ColorVar.prototype.updateConfigType = function( evt ){
  // TEMP CONSOLE
  //console( evt.target.getAttribute( 'data-value' ) + ": " +this.name );

  var configTypeSelect = evt.target.getAttribute( 'data-value' );
  switch( configTypeSelect ) {
    case 'colorpicker':
//      $(this.element).find('.config-variables').hide();
//      $(this.element).find('.config-tint').hide();
      this.configType = configTypeSelect;
      this.variable = '';
      this.color =this.value;
      this.output =this.value;
      break;
    case 'function':
//      $(this.element).find('.config-tint').show();
//      $(this.element).find('.config-variables').hide();
//      $(this.element).find('.config-fonts').hide();
      this.configType = configTypeSelect;
      this.configFunction = evt.target.getAttribute( 'data-option' );
      this.updateFunction();
      break;
  }

  this.calcValue();

  // TEMP CONSOLE
  //console( JSON.stringify( this ));
};

//function updateConfigType(){
//  switch( this.configType ) {

//    case 'variable':
//      // destroy existing menu
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


//  watch( this, 'value', function(){
//    if ( getVar( variable.name, 'configType' ) == 'function'){
//      setVar( variable.name, 'color', this.output); // update to handle more than just color
//      updateConfigFunction( $('#' + variable.name));
//    } else {
//      setVar( variable.name, 'value', this.output);
//      updateoutput( variable.name );
//    }
//  });


ColorVar.prototype.colorPickerListener = function( thisObj ){
  $(thisObj.element).find('.color-picker').colorpicker().on('changeColor', function ( evt ) {
    thisObj.updateColorPicker( evt );
  });
};


ColorVar.prototype.updateColorPicker = function( evt ){

  var tempColor = this.value;
  this.color = evt.color.toHex()
  if ( this.color != tempColor ){
    // set config type = color picker (m ay not change mode if current mode = formula)
    if ( this.configType != 'function'){
      this.configType = 'colorpicker';
      this.output = this.color;
     this.value = this.color;
    } else {
      this.variable = '';
    }
    this.calcValue();
  }
};



( function () {
  var el = wp.element.createElement;
  var __ = wp.i18n.__;
  var registerBlockType = wp.blocks.registerBlockType;
  var InspectorControls = wp.blockEditor.InspectorControls;
  var PanelBody = wp.components.PanelBody;
  var PanelColorSettings = wp.blockEditor.PanelColorSettings;
  var SelectControl = wp.components.SelectControl;
  var ToggleControl = wp.components.ToggleControl;
  var RangeControl = wp.components.RangeControl;
  var TextControl = wp.components.TextControl;
  var Button = wp.components.Button;

  var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
  var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

  function buildSteps( attrs, setAttr ) {
    return attrs.steps.map( function ( step, i ) {
      return el( 'div', { key: i, style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 } },
        el( TextControl, {
          label: __( 'Step', 'blockenberg' ) + ' ' + ( i + 1 ),
          value: step.label,
          onChange: function ( v ) {
            var next = attrs.steps.slice();
            next[ i ] = Object.assign( {}, step, { label: v } );
            setAttr( { steps: next } );
          }
        } ),
        el( Button, {
          isSmall: true, isDestructive: true,
          onClick: function () {
            var next = attrs.steps.filter( function ( _, j ) { return j !== i; } );
            setAttr( { steps: next } );
          }
        }, '✕' )
      );
    } );
  }

  function renderStepBar( attrs ) {
    var _tvf = getTypoCssVars();
    var wrapStyle = {
      '--bksp-done':    attrs.completedColor,
      '--bksp-active':  attrs.activeColor,
      '--bksp-pending': attrs.pendingColor,
      '--bksp-cSize':   attrs.circleSize + 'px',
      '--bksp-barH':    attrs.barHeight + 'px',
      '--bksp-lSz':     attrs.labelSz + 'px'
    };
    Object.assign(wrapStyle, _tvf(attrs.labelTypo, '--bksp-lb-'));
    var children = [];
    attrs.steps.forEach( function ( step, i ) {
      var idx = i + 1;
      var isDone   = idx < attrs.currentStep;
      var isActive = idx === attrs.currentStep;
      var stClass  = isDone ? 'bksp-done' : isActive ? 'bksp-active' : 'bksp-pending';
      children.push( el( 'div', { key: 'step-' + i, className: 'bksp-step ' + stClass },
        el( 'div', { className: 'bksp-circle' },
          isDone
            ? el( 'svg', { viewBox: '0 0 20 20', fill: 'currentColor', width: 14, height: 14 },
                el( 'path', { d: 'M7 10.4l-2.8-2.8L3 8.8l4 4 8-8-1.2-1.2z' } ) )
            : attrs.showNumbers ? String( idx ) : null
        ),
        el( 'span', { className: 'bksp-label' }, step.label )
      ) );
      /* connector */
      if ( i < attrs.steps.length - 1 ) {
        var connDone = idx < attrs.currentStep;
        children.push( el( 'div', { key: 'conn-' + i, className: 'bksp-connector ' + ( connDone ? 'bksp-conn-done' : '' ) } ) );
      }
    } );
    return el( 'div', { className: 'bksp-wrap', style: wrapStyle }, children );
  }

  registerBlockType( 'blockenberg/step-progress', {
    edit: function ( props ) {
      var attrs = props.attributes;
      var setAttr = props.setAttributes;

      return el( 'div', null,
        el( InspectorControls, null,
          el( PanelBody, { title: __( 'Steps', 'blockenberg' ), initialOpen: true },
            buildSteps( attrs, setAttr ),
            el( Button, {
              variant: 'secondary',
              onClick: function () {
                setAttr( { steps: attrs.steps.concat( [ { label: 'New Step' } ] ) } );
              },
              style: { marginTop: 8 }
            }, __( '+ Add Step', 'blockenberg' ) ),
            el( RangeControl, {
              label: __( 'Current Step', 'blockenberg' ),
              value: attrs.currentStep, min: 1, max: attrs.steps.length,
              onChange: function (v) { setAttr({ currentStep: v }); }
            } )
          ),
          el( PanelBody, { title: __( 'Appearance', 'blockenberg' ), initialOpen: false },
            el( ToggleControl, {
              label: __( 'Show Step Numbers', 'blockenberg' ),
              checked: attrs.showNumbers,
              onChange: function (v) { setAttr({ showNumbers: v }); },
              __nextHasNoMarginBottom: true
            } ),
            el( RangeControl, {
              label: __( 'Circle Size (px)', 'blockenberg' ),
              value: attrs.circleSize, min: 24, max: 60,
              onChange: function (v) { setAttr({ circleSize: v }); }
            } ),
            el( RangeControl, {
              label: __( 'Bar / Connector Height (px)', 'blockenberg' ),
              value: attrs.barHeight, min: 2, max: 12,
              onChange: function (v) { setAttr({ barHeight: v }); }
            } ),
            el( SelectControl, {
              label: __( 'Connector Style', 'blockenberg' ),
              value: attrs.connectorStyle,
              options: [
                { label: 'Solid',  value: 'solid' },
                { label: 'Dashed', value: 'dashed' },
                { label: 'Dotted', value: 'dotted' }
              ],
              onChange: function (v) { setAttr({ connectorStyle: v }); }
            } )
          ),
          
          el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
              getTypoControl() && getTypoControl()({ label: __('Label', 'blockenberg'), value: attrs.labelTypo, onChange: function (v) { setAttr({ labelTypo: v }); } })
          ),
el( PanelBody, { title: __( 'Colors', 'blockenberg' ), initialOpen: false },
            el( PanelColorSettings, {
              title: __( 'Colors', 'blockenberg' ),
              colorSettings: [
                { value: attrs.completedColor, onChange: function(v){setAttr({completedColor:v||'#22c55e'});}, label: __('Completed') },
                { value: attrs.activeColor,    onChange: function(v){setAttr({activeColor:v||'#6c3fb5'});},    label: __('Active / Current') },
                { value: attrs.pendingColor,   onChange: function(v){setAttr({pendingColor:v||'#e5e7eb'});},   label: __('Pending') }
              ]
            } )
          )
        ),
        renderStepBar( attrs )
      );
    },
    save: function ( props ) {
      var attrs = props.attributes;
      return renderStepBar( attrs );
    }
  } );
} )();

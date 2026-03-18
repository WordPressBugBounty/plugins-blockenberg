( function () {
  var el = wp.element.createElement;
  var __ = wp.i18n.__;
  var registerBlockType = wp.blocks.registerBlockType;
  var InspectorControls = wp.blockEditor.InspectorControls;
  var RichText = wp.blockEditor.RichText;
  var PanelBody = wp.components.PanelBody;
  var PanelColorSettings = wp.blockEditor.PanelColorSettings;
  var SelectControl = wp.components.SelectControl;
  var ToggleControl = wp.components.ToggleControl;
  var RangeControl = wp.components.RangeControl;
  var TextControl = wp.components.TextControl;

  var _tc, _tv;
  function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
  function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

  function buildRing( attrs, opts ) {
    opts = opts || {};
    var it = opts.inlineTypo;
    var pct    = Math.min( 1, attrs.current / ( attrs.goal || 100 ) );
    var r      = ( attrs.size / 2 ) - ( attrs.strokeWidth / 2 ) - 2;
    var circ   = 2 * Math.PI * r;
    var offset = circ * ( 1 - pct );
    var cx     = attrs.size / 2;
    var cy     = attrs.size / 2;

    var centerText = attrs.centerLabel === 'auto'
      ? Math.round( pct * 100 ) + '%'
      : ( attrs.centerLabel === 'value' ? attrs.current + '/' + attrs.goal : attrs.customCenterLabel );

    var wrapStyle = {
      '--bkml-text':    attrs.textColor,
      '--bkml-lSz':     attrs.labelSz + 'px',
      '--bkml-cSz':     attrs.centerSz + 'px',
      '--bkml-size':    attrs.size + 'px',
      '--bkml-glow':    attrs.glow ? 'drop-shadow(0 0 6px ' + attrs.ringColor + ')' : 'none'
    };
    if (!it) {
      var _tvf = getTypoCssVars();
      Object.assign(wrapStyle, _tvf(attrs.centerTypo, '--bkml-ct-'));
      Object.assign(wrapStyle, _tvf(attrs.labelTypo, '--bkml-lb-'));
    }

    var pctSt = it ? { fontWeight: (attrs.centerFontWeight || 700), lineHeight: (attrs.centerLineHeight || 1.2) } : {};
    var lblSt = it ? { fontWeight: (attrs.labelFontWeight || 600) } : {};

    return el( 'div', {
      className: 'bkml-wrap',
      style: wrapStyle,
      'data-current': attrs.current,
      'data-goal':    attrs.goal,
      'data-animate': attrs.animateOnView ? '1' : '0'
    },
      el( 'svg', {
        className: 'bkml-svg',
        viewBox: '0 0 ' + attrs.size + ' ' + attrs.size,
        width: attrs.size,
        height: attrs.size,
        'aria-hidden': 'true'
      },
        el( 'circle', {
          className: 'bkml-track',
          cx: cx, cy: cy, r: r,
          strokeWidth: attrs.strokeWidth,
          stroke: attrs.trackColor,
          fill: 'none'
        } ),
        el( 'circle', {
          className: 'bkml-ring',
          cx: cx, cy: cy, r: r,
          strokeWidth: attrs.strokeWidth,
          stroke: attrs.ringColor,
          fill: 'none',
          strokeDasharray: circ,
          strokeDashoffset: offset,
          strokeLinecap: 'round',
          style: { transform: 'rotate(-90deg)', transformOrigin: 'center', filter: 'var(--bkml-glow)' }
        } )
      ),
      el( 'div', { className: 'bkml-center' },
        el( 'span', { className: 'bkml-pct', style: pctSt }, centerText )
      ),
      el( 'p', { className: 'bkml-label', style: lblSt }, attrs.label )
    );
  }

  registerBlockType( 'blockenberg/milestone', {
    deprecated: [{
      save: function ( props ) {
        return buildRing( props.attributes, { inlineTypo: true } );
      }
    }],
    edit: function ( props ) {
      var attrs = props.attributes;
      var setAttr = props.setAttributes;

      return el( 'div', null,
        el( InspectorControls, null,
          el( PanelBody, { title: __( 'Values', 'blockenberg' ), initialOpen: true },
            el( RangeControl, {
              label: __( 'Current Value', 'blockenberg' ),
              value: attrs.current, min: 0, max: attrs.goal,
              onChange: function (v) { setAttr({ current: v }); }
            } ),
            el( RangeControl, {
              label: __( 'Goal Value', 'blockenberg' ),
              value: attrs.goal, min: 1, max: 1000,
              onChange: function (v) { setAttr({ goal: v }); }
            } ),
            el( SelectControl, {
              label: __( 'Center Label', 'blockenberg' ),
              value: attrs.centerLabel,
              options: [
                { label: 'Percentage (%)', value: 'auto' },
                { label: 'Value / Goal',   value: 'value' },
                { label: 'Custom Text',    value: 'custom' }
              ],
              onChange: function (v) { setAttr({ centerLabel: v }); }
            } ),
            attrs.centerLabel === 'custom' && el( TextControl, {
              label: __( 'Custom Center Text', 'blockenberg' ),
              value: attrs.customCenterLabel,
              onChange: function (v) { setAttr({ customCenterLabel: v }); }
            } )
          ),
          el( PanelBody, { title: __( 'Appearance', 'blockenberg' ), initialOpen: false },
            el( RangeControl, {
              label: __( 'Ring Size (px)', 'blockenberg' ),
              value: attrs.size, min: 80, max: 280,
              onChange: function (v) { setAttr({ size: v }); }
            } ),
            el( RangeControl, {
              label: __( 'Ring Thickness (px)', 'blockenberg' ),
              value: attrs.strokeWidth, min: 4, max: 30,
              onChange: function (v) { setAttr({ strokeWidth: v }); }
            } ),
            el( ToggleControl, {
              label: __( 'Glow Effect', 'blockenberg' ),
              checked: attrs.glow,
              onChange: function (v) { setAttr({ glow: v }); },
              __nextHasNoMarginBottom: true
            } ),
            el( ToggleControl, {
              label: __( 'Animate on Scroll', 'blockenberg' ),
              checked: attrs.animateOnView,
              onChange: function (v) { setAttr({ animateOnView: v }); },
              __nextHasNoMarginBottom: true
            } )
          ),
          
          el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
              el( getTypoControl(), { label: __( 'Center Label', 'blockenberg' ), value: attrs.centerTypo, onChange: function (v) { setAttr({ centerTypo: v }); } }),
              el( getTypoControl(), { label: __( 'Label', 'blockenberg' ), value: attrs.labelTypo, onChange: function (v) { setAttr({ labelTypo: v }); } })
          ),
el( PanelBody, { title: __( 'Colors', 'blockenberg' ), initialOpen: false },
            el( PanelColorSettings, {
              title: __( 'Colors', 'blockenberg' ),
              colorSettings: [
                { value: attrs.ringColor,  onChange: function(v){setAttr({ringColor:v||'#6c3fb5'});},  label: __('Progress Ring') },
                { value: attrs.trackColor, onChange: function(v){setAttr({trackColor:v||'#e9e3ff'});}, label: __('Track') },
                { value: attrs.textColor,  onChange: function(v){setAttr({textColor:v||'#222'});},     label: __('Text') }
              ]
            } )
          )
        ),
        buildRing( attrs )
      );
    },
    save: function ( props ) {
      return buildRing( props.attributes );
    }
  } );
} )();

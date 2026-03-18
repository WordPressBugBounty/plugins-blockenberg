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

  var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
  var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

  var PRESETS = {
    yellow: { note: '#fef08a', text: '#333' },
    pink:   { note: '#fce7f3', text: '#831843' },
    green:  { note: '#bbf7d0', text: '#14532d' },
    blue:   { note: '#bfdbfe', text: '#1e3a5f' },
    orange: { note: '#fed7aa', text: '#7c2d12' },
    custom: null
  };

  registerBlockType( 'blockenberg/sticky-note', {
    edit: function ( props ) {
      var attrs = props.attributes;
      var setAttr = props.setAttributes;

      var noteColor = attrs.preset !== 'custom' && PRESETS[ attrs.preset ]
        ? PRESETS[ attrs.preset ].note : attrs.noteColor;
      var textColor = attrs.preset !== 'custom' && PRESETS[ attrs.preset ]
        ? PRESETS[ attrs.preset ].text : attrs.textColor;

      var _tvf = getTypoCssVars();
      var wrapStyle = {
        '--bksn-bg':    noteColor,
        '--bksn-text':  textColor,
        '--bksn-w':     attrs.width + 'px',
        '--bksn-p':     attrs.padding + 'px',
        '--bksn-fs':    attrs.fontSize + 'px',
        '--bksn-fw':    attrs.fontWeight,
        '--bksn-lh':    attrs.lineHeight,
        '--bksn-rot':   attrs.rotated ? attrs.rotationDeg + 'deg' : '0deg',
        '--bksn-shadow': attrs.shadow ? '4px 6px 16px rgba(0,0,0,.2)' : 'none'
      };
      Object.assign(wrapStyle, _tvf(attrs.headingTypo, '--bksn-hd-'));
      Object.assign(wrapStyle, _tvf(attrs.textTypo, '--bksn-tx-'));

      var classes = [
        'bksn-wrap',
        attrs.handwrittenFont ? 'bksn-handwritten' : '',
        attrs.curlCorner ? 'bksn-curl' : ''
      ].filter(Boolean).join( ' ' );

      return el( 'div', null,
        el( InspectorControls, null,
          el( PanelBody, { title: __( 'Note Style', 'blockenberg' ), initialOpen: true },
            el( SelectControl, {
              label: __( 'Color Preset', 'blockenberg' ),
              value: attrs.preset,
              options: [
                { label: 'Yellow', value: 'yellow' },
                { label: 'Pink',   value: 'pink' },
                { label: 'Green',  value: 'green' },
                { label: 'Blue',   value: 'blue' },
                { label: 'Orange', value: 'orange' },
                { label: 'Custom', value: 'custom' }
              ],
              onChange: function (v) { setAttr({ preset: v }); }
            } ),
            el( ToggleControl, {
              label: __( 'Rotate Note', 'blockenberg' ),
              checked: attrs.rotated,
              onChange: function (v) { setAttr({ rotated: v }); },
              __nextHasNoMarginBottom: true
            } ),
            attrs.rotated && el( RangeControl, {
              label: __( 'Rotation (degrees)', 'blockenberg' ),
              value: attrs.rotationDeg, min: -10, max: 10,
              onChange: function (v) { setAttr({ rotationDeg: v }); }
            } ),
            el( ToggleControl, {
              label: __( 'Handwritten Font', 'blockenberg' ),
              checked: attrs.handwrittenFont,
              onChange: function (v) { setAttr({ handwrittenFont: v }); },
              __nextHasNoMarginBottom: true
            } ),
            el( ToggleControl, {
              label: __( 'Curl Corner', 'blockenberg' ),
              checked: attrs.curlCorner,
              onChange: function (v) { setAttr({ curlCorner: v }); },
              __nextHasNoMarginBottom: true
            } ),
            el( ToggleControl, {
              label: __( 'Shadow', 'blockenberg' ),
              checked: attrs.shadow,
              onChange: function (v) { setAttr({ shadow: v }); },
              __nextHasNoMarginBottom: true
            } ),
            el( RangeControl, {
              label: __( 'Width (px)', 'blockenberg' ),
              value: attrs.width, min: 120, max: 500,
              onChange: function (v) { setAttr({ width: v }); }
            } ),
            el( RangeControl, {
              label: __( 'Padding (px)', 'blockenberg' ),
              value: attrs.padding, min: 10, max: 40,
              onChange: function (v) { setAttr({ padding: v }); }
            } ),
            ),
          el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
              getTypoControl() && getTypoControl()({ label: __('Heading', 'blockenberg'), value: attrs.headingTypo, onChange: function (v) { setAttr({ headingTypo: v }); } }),
              getTypoControl() && getTypoControl()({ label: __('Text', 'blockenberg'), value: attrs.textTypo, onChange: function (v) { setAttr({ textTypo: v }); } })
          ),
el( PanelBody, { title: __( 'Custom Colors', 'blockenberg' ), initialOpen: false },
            el( PanelColorSettings, {
              title: __( 'Colors', 'blockenberg' ),
              colorSettings: [
                { value: attrs.noteColor, onChange: function(v){setAttr({noteColor:v||'#fef08a'});}, label: __('Note Background') },
                { value: attrs.textColor, onChange: function(v){setAttr({textColor:v||'#333'});},   label: __('Text') }
              ]
            } )
          )
        ),
        el( 'div', { className: classes, style: wrapStyle },
          attrs.headingText && el( RichText, {
            tagName: 'strong',
            className: 'bksn-heading',
            value: attrs.headingText,
            onChange: function (v) { setAttr({ headingText: v }); },
            placeholder: __( 'Heading (optional)…', 'blockenberg' )
          } ),
          el( RichText, {
            tagName: 'p',
            className: 'bksn-text',
            value: attrs.text,
            onChange: function (v) { setAttr({ text: v }); },
            placeholder: __( 'Note text…', 'blockenberg' )
          } )
        )
      );
    },
    save: function ( props ) {
      var attrs = props.attributes;
      var noteColor = attrs.preset !== 'custom' && PRESETS[ attrs.preset ]
        ? PRESETS[ attrs.preset ].note : attrs.noteColor;
      var textColor = attrs.preset !== 'custom' && PRESETS[ attrs.preset ]
        ? PRESETS[ attrs.preset ].text : attrs.textColor;
      var classes = [
        'bksn-wrap',
        attrs.handwrittenFont ? 'bksn-handwritten' : '',
        attrs.curlCorner ? 'bksn-curl' : ''
      ].filter(Boolean).join( ' ' );
      var _tvf2 = getTypoCssVars();
      var saveStyle = {
          '--bksn-bg':     noteColor,
          '--bksn-text':   textColor,
          '--bksn-w':      attrs.width + 'px',
          '--bksn-p':      attrs.padding + 'px',
          '--bksn-fs':     attrs.fontSize + 'px',
          '--bksn-fw':     attrs.fontWeight,
          '--bksn-lh':     attrs.lineHeight,
          '--bksn-rot':    attrs.rotated ? attrs.rotationDeg + 'deg' : '0deg',
          '--bksn-shadow': attrs.shadow ? '4px 6px 16px rgba(0,0,0,.2)' : 'none'
      };
      Object.assign(saveStyle, _tvf2(attrs.headingTypo, '--bksn-hd-'));
      Object.assign(saveStyle, _tvf2(attrs.textTypo, '--bksn-tx-'));
      return el( 'div', {
        className: classes,
        style: saveStyle
      },
        attrs.headingText && el( RichText.Content, { tagName: 'strong', className: 'bksn-heading', value: attrs.headingText } ),
        el( RichText.Content, { tagName: 'p', className: 'bksn-text', value: attrs.text } )
      );
    }
  } );

} )();

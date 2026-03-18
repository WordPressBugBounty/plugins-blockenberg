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

  var _ddTC, _ddTV;
  function _tc() { return _ddTC || (_ddTC = window.bkbgTypographyControl); }
  function _tv(t, p) { return (_ddTV || (_ddTV = window.bkbgTypoCssVars)) ? _ddTV(t, p) : {}; }

  var FORMAT_MAP = {
    'long-date':    { opts: { weekday:'long', year:'numeric', month:'long', day:'numeric' } },
    'short-date':   { opts: { year:'numeric', month:'short', day:'numeric' } },
    'numeric-date': { opts: { year:'numeric', month:'2-digit', day:'2-digit' } },
    'year-only':    null,
    'time-12':      { opts: { hour:'numeric', minute:'2-digit', hour12: true } },
    'time-24':      { opts: { hour:'2-digit', minute:'2-digit', hour12: false } },
    'datetime':     { opts: { year:'numeric', month:'short', day:'numeric', hour:'numeric', minute:'2-digit' } }
  };

  function formatDate( format, tz ) {
    var now = new Date();
    if ( format === 'year-only' ) return String( now.getFullYear() );
    var entry = FORMAT_MAP[ format ];
    if ( !entry ) return now.toLocaleDateString();
    try {
      var opts = Object.assign( {}, entry.opts );
      if ( tz ) opts.timeZone = tz;
      return now.toLocaleString( navigator.language || 'en', opts );
    } catch (e) {
      return now.toLocaleString();
    }
  }

  var TIMEZONES = [
    'UTC','America/New_York','America/Chicago','America/Denver','America/Los_Angeles',
    'America/Sao_Paulo','Europe/London','Europe/Paris','Europe/Berlin','Europe/Moscow',
    'Asia/Dubai','Asia/Kolkata','Asia/Tokyo','Asia/Shanghai','Australia/Sydney'
  ];

  registerBlockType( 'blockenberg/dynamic-date', {
    edit: function ( props ) {
      var attrs = props.attributes;
      var setAttr = props.setAttributes;
      var state = wp.element.useState( null );
      var displayed = wp.element.useState( formatDate( attrs.format, attrs.timezone === 'custom' ? attrs.customTz : undefined ) );

      /* Recompute whenever attrs change */
      var tz = attrs.timezone === 'custom' ? attrs.customTz : undefined;
      var preview = formatDate( attrs.format, tz );

      var wrapStyle = Object.assign({
        '--bkdd-color':  attrs.textColor || 'inherit',
        '--bkdd-fs':     attrs.fontSize + 'px',
        '--bkdd-fw':     attrs.fontWeight,
        '--bkdd-lh':     attrs.lineHeight,
        '--bkdd-align':  attrs.align
      }, _tv(attrs.typoText || {}, '--bkbg-dd-txt-'));

      return el( 'div', null,
        el( InspectorControls, null,
          el( PanelBody, { title: __( 'Date Settings', 'blockenberg' ), initialOpen: true },
            el( SelectControl, {
              label: __( 'Format', 'blockenberg' ),
              value: attrs.format,
              options: [
                { label: 'Long Date (Monday, Jan 1, 2024)',     value: 'long-date' },
                { label: 'Short Date (Jan 1, 2024)',            value: 'short-date' },
                { label: 'Numeric Date (01/01/2024)',           value: 'numeric-date' },
                { label: 'Year Only (2024)',                    value: 'year-only' },
                { label: 'Time 12h (1:30 PM)',                  value: 'time-12' },
                { label: 'Time 24h (13:30)',                    value: 'time-24' },
                { label: 'Date & Time',                         value: 'datetime' }
              ],
              onChange: function (v) { setAttr({ format: v }); }
            } ),
            el( SelectControl, {
              label: __( 'Timezone', 'blockenberg' ),
              value: attrs.timezone,
              options: [
                { label: 'Site Timezone', value: 'site' },
                { label: 'UTC',           value: 'utc' },
                { label: 'Custom',        value: 'custom' }
              ],
              onChange: function (v) { setAttr({ timezone: v }); }
            } ),
            attrs.timezone === 'custom' && el( SelectControl, {
              label: __( 'Custom Timezone', 'blockenberg' ),
              value: attrs.customTz,
              options: TIMEZONES.map( function (tz) { return { label: tz, value: tz }; } ),
              onChange: function (v) { setAttr({ customTz: v }); }
            } ),
            el( ToggleControl, {
              label: __( 'Live Clock (auto-update)', 'blockenberg' ),
              checked: attrs.liveClock,
              onChange: function (v) { setAttr({ liveClock: v }); },
              __nextHasNoMarginBottom: true
            } )
          ),
          el( PanelBody, { title: __( 'Text & Style', 'blockenberg' ), initialOpen: false },
            el( TextControl, {
              label: __( 'Prefix Text', 'blockenberg' ),
              value: attrs.prefix,
              onChange: function (v) { setAttr({ prefix: v }); }
            } ),
            el( TextControl, {
              label: __( 'Suffix Text', 'blockenberg' ),
              value: attrs.suffix,
              onChange: function (v) { setAttr({ suffix: v }); }
            } ),
            el( SelectControl, {
              label: __( 'HTML Tag', 'blockenberg' ),
              value: attrs.tag,
              options: [
                { label: 'span', value: 'span' },
                { label: 'p',    value: 'p' },
                { label: 'div',  value: 'div' }
              ],
              onChange: function (v) { setAttr({ tag: v }); }
            } ),
            el( SelectControl, {
              label: __( 'Alignment', 'blockenberg' ),
              value: attrs.align,
              options: [
                { label: 'Left',   value: 'left' },
                { label: 'Center', value: 'center' },
                { label: 'Right',  value: 'right' }
              ],
              onChange: function (v) { setAttr({ align: v }); }
            } ),
            ),
          
          el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
              _tc() && el(_tc(), { label: __('Text'), typo: attrs.typoText || {}, onChange: function (v) { setAttr({ typoText: v }); }, defaultSize: attrs.fontSize || 16 })
          ),
el( PanelBody, { title: __( 'Color', 'blockenberg' ), initialOpen: false },
            el( PanelColorSettings, {
              title: __( 'Color', 'blockenberg' ),
              colorSettings: [
                { value: attrs.textColor, onChange: function(v){setAttr({textColor:v||''});}, label: __('Text Color') }
              ]
            } )
          )
        ),
        el( 'div', { className: 'bkdd-wrap', style: wrapStyle },
          el( attrs.tag || 'span', { className: 'bkdd-output' },
            attrs.prefix && el( 'span', { className: 'bkdd-prefix' }, attrs.prefix ),
            el( 'span', { className: 'bkdd-date' }, preview ),
            attrs.suffix && el( 'span', { className: 'bkdd-suffix' }, attrs.suffix )
          )
        )
      );
    },
    save: function ( props ) {
      var attrs = props.attributes;
      return el( 'div', {
        className: 'bkdd-wrap',
        style: Object.assign({
          '--bkdd-color': attrs.textColor || 'inherit',
          '--bkdd-fs':    attrs.fontSize + 'px',
          '--bkdd-fw':    attrs.fontWeight,
          '--bkdd-lh':    attrs.lineHeight,
          '--bkdd-align': attrs.align
        }, _tv(attrs.typoText || {}, '--bkbg-dd-txt-')),
        'data-format':   attrs.format,
        'data-tz':       attrs.timezone === 'custom' ? attrs.customTz : attrs.timezone,
        'data-live':     attrs.liveClock ? '1' : '0'
      },
        el( attrs.tag || 'span', { className: 'bkdd-output' },
          attrs.prefix && el( 'span', { className: 'bkdd-prefix' }, attrs.prefix ),
          el( 'span', { className: 'bkdd-date' }, '' ),
          attrs.suffix && el( 'span', { className: 'bkdd-suffix' }, attrs.suffix )
        )
      );
    }
  } );
} )();

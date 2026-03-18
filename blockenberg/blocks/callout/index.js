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
  var TextareaControl = wp.components.TextareaControl;

  // ── Typography helpers ─────────────────────────────────────────────────
  function getTypographyControl() {
      return (window.bkbgTypographyControl || function () { return null; });
  }

  function _tv(typo, prefix) {
      if (!typo) return {};
      var s = {};
      if (typo.family)     s[prefix + 'font-family'] = "'" + typo.family + "', sans-serif";
      if (typo.weight)     s[prefix + 'font-weight'] = typo.weight;
      if (typo.transform)  s[prefix + 'text-transform'] = typo.transform;
      if (typo.style)      s[prefix + 'font-style'] = typo.style;
      if (typo.decoration) s[prefix + 'text-decoration'] = typo.decoration;
      var su = typo.sizeUnit || 'px';
      if (typo.sizeDesktop !== '' && typo.sizeDesktop != null) s[prefix + 'font-size-d'] = typo.sizeDesktop + su;
      if (typo.sizeTablet  !== '' && typo.sizeTablet  != null) s[prefix + 'font-size-t'] = typo.sizeTablet + su;
      if (typo.sizeMobile  !== '' && typo.sizeMobile  != null) s[prefix + 'font-size-m'] = typo.sizeMobile + su;
      var lhu = typo.lineHeightUnit || '';
      if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) s[prefix + 'line-height-d'] = typo.lineHeightDesktop + lhu;
      if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) s[prefix + 'line-height-t'] = typo.lineHeightTablet + lhu;
      if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) s[prefix + 'line-height-m'] = typo.lineHeightMobile + lhu;
      var lsu = typo.letterSpacingUnit || 'px';
      if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) s[prefix + 'letter-spacing-d'] = typo.letterSpacingDesktop + lsu;
      if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) s[prefix + 'letter-spacing-t'] = typo.letterSpacingTablet + lsu;
      if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) s[prefix + 'letter-spacing-m'] = typo.letterSpacingMobile + lsu;
      var wsu = typo.wordSpacingUnit || 'px';
      if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) s[prefix + 'word-spacing-d'] = typo.wordSpacingDesktop + wsu;
      if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) s[prefix + 'word-spacing-t'] = typo.wordSpacingTablet + wsu;
      if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) s[prefix + 'word-spacing-m'] = typo.wordSpacingMobile + wsu;
      return s;
  }

  var PRESET_TYPES = {
    info:    { bg: '#e8f4fd', border: '#2196f3', text: '#1565c0', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>' },
    success: { bg: '#e8f5e9', border: '#4caf50', text: '#2e7d32', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm-2 14.4-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4-7 7z"/></svg>' },
    warning: { bg: '#fff8e1', border: '#ff9800', text: '#e65100', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 21L12 2l11 19H1zm11-3h2v-2h-2v2zm0-4h2v-4h-2v4z"/></svg>' },
    danger:  { bg: '#ffebee', border: '#f44336', text: '#b71c1c', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>' },
    custom:  { bg: '#f5f0ff', border: '#9c27b0', text: '#4a148c', icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm1 14h-2v-5h2v5zm0-7h-2V7h2v2z"/></svg>' }
  };

  registerBlockType( 'blockenberg/callout', {
    edit: function ( props ) {
      var attrs = props.attributes;
      var setAttr = props.setAttributes;
      var preset = PRESET_TYPES[ attrs.calloutType ] || PRESET_TYPES.info;
      var bg     = attrs.bgColor     || preset.bg;
      var brd    = attrs.borderColor || preset.border;
      var txt    = attrs.textColor   || preset.text;

      var wrapStyle = Object.assign({
        '--bkco-bg':     bg,
        '--bkco-border': brd,
        '--bkco-text':   txt,
        '--bkco-pv':     attrs.paddingV + 'px',
        '--bkco-ph':     attrs.paddingH + 'px',
        '--bkco-radius': attrs.borderRadius + 'px'
      }, _tv(attrs.typoTitle, '--bkco-tt-'), _tv(attrs.typoBody, '--bkco-tb-'));

      return el( 'div', null,
        el( InspectorControls, null,
          el( PanelBody, { title: __( 'Type & Style', 'blockenberg' ), initialOpen: true },
            el( SelectControl, {
              label: __( 'Callout Type', 'blockenberg' ),
              value: attrs.calloutType,
              options: [
                { label: 'Info',    value: 'info' },
                { label: 'Success', value: 'success' },
                { label: 'Warning', value: 'warning' },
                { label: 'Danger',  value: 'danger' },
                { label: 'Custom',  value: 'custom' }
              ],
              onChange: function ( v ) { setAttr( { calloutType: v, bgColor: '', borderColor: '', textColor: '' } ); }
            } ),
            el( SelectControl, {
              label: __( 'Border Style', 'blockenberg' ),
              value: attrs.borderStyle,
              options: [
                { label: 'Left accent',  value: 'left' },
                { label: 'Top ribbon',   value: 'top' },
                { label: 'All sides',    value: 'all' },
                { label: 'No border',    value: 'none' }
              ],
              onChange: function ( v ) { setAttr( { borderStyle: v } ); }
            } ),
            el( ToggleControl, {
              label: __( 'Show Icon', 'blockenberg' ),
              checked: attrs.showIcon,
              onChange: function ( v ) { setAttr( { showIcon: v } ); },
              __nextHasNoMarginBottom: true
            } ),
            el( ToggleControl, {
              label: __( 'Dismissible', 'blockenberg' ),
              checked: attrs.dismissible,
              onChange: function ( v ) { setAttr( { dismissible: v } ); },
              __nextHasNoMarginBottom: true
            } ),
            el( RangeControl, {
              label: __( 'Vertical Padding', 'blockenberg' ),
              value: attrs.paddingV, min: 8, max: 48,
              onChange: function ( v ) { setAttr( { paddingV: v } ); }
            } ),
            el( RangeControl, {
              label: __( 'Horizontal Padding', 'blockenberg' ),
              value: attrs.paddingH, min: 8, max: 64,
              onChange: function ( v ) { setAttr( { paddingH: v } ); }
            } ),
            el( RangeControl, {
              label: __( 'Border Radius', 'blockenberg' ),
              value: attrs.borderRadius, min: 0, max: 24,
              onChange: function ( v ) { setAttr( { borderRadius: v } ); }
            } )
          ),
          el( PanelBody, { title: __( 'Custom Colors', 'blockenberg' ), initialOpen: false },
            el( PanelColorSettings, {
              title: __( 'Colors', 'blockenberg' ),
              colorSettings: [
                { value: attrs.bgColor,     onChange: function(v){setAttr({bgColor:v||''});},     label: __('Background') },
                { value: attrs.borderColor, onChange: function(v){setAttr({borderColor:v||''});}, label: __('Border / Accent') },
                { value: attrs.textColor,   onChange: function(v){setAttr({textColor:v||''});},   label: __('Text') }
              ]
            } )
          ),
          el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
            el( 'p', { style: { margin: '0 0 4px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888' } }, __( 'Title', 'blockenberg' ) ),
            el( getTypographyControl(), {
              label: __( 'Title Typography', 'blockenberg' ),
              value: attrs.typoTitle,
              onChange: function ( v ) { setAttr( { typoTitle: v } ); }
            } ),
            el( 'hr', {} ),
            el( 'p', { style: { margin: '8px 0 4px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', color: '#888' } }, __( 'Body', 'blockenberg' ) ),
            el( getTypographyControl(), {
              label: __( 'Body Typography', 'blockenberg' ),
              value: attrs.typoBody,
              onChange: function ( v ) { setAttr( { typoBody: v } ); }
            } )
          )
        ),
        el( 'div', { className: 'bkco-wrap bkco-border-' + attrs.borderStyle + ' bkco-type-' + attrs.calloutType, style: wrapStyle },
          attrs.showIcon && el( 'span', {
            className: 'bkco-icon',
            dangerouslySetInnerHTML: { __html: preset.icon }
          } ),
          el( 'div', { className: 'bkco-content' },
            el( RichText, {
              tagName: 'strong',
              className: 'bkco-title',
              value: attrs.title,
              onChange: function ( v ) { setAttr( { title: v } ); },
              placeholder: __( 'Callout title…', 'blockenberg' )
            } ),
            el( RichText, {
              tagName: 'p',
              className: 'bkco-body',
              value: attrs.body,
              onChange: function ( v ) { setAttr( { body: v } ); },
              placeholder: __( 'Callout body text…', 'blockenberg' )
            } )
          ),
          attrs.dismissible && el( 'button', { className: 'bkco-close', 'aria-label': 'Close' }, '×' )
        )
      );
    },
    save: function ( props ) {
      var attrs = props.attributes;
      var preset = PRESET_TYPES[ attrs.calloutType ] || PRESET_TYPES.info;
      var bg     = attrs.bgColor     || preset.bg;
      var brd    = attrs.borderColor || preset.border;
      var txt    = attrs.textColor   || preset.text;
      return el( 'div', {
        className: 'bkco-wrap bkco-border-' + attrs.borderStyle + ' bkco-type-' + attrs.calloutType,
        style: Object.assign({
          '--bkco-bg':     bg,
          '--bkco-border': brd,
          '--bkco-text':   txt,
          '--bkco-pv':     attrs.paddingV + 'px',
          '--bkco-ph':     attrs.paddingH + 'px',
          '--bkco-radius': attrs.borderRadius + 'px'
        }, _tv(attrs.typoTitle, '--bkco-tt-'), _tv(attrs.typoBody, '--bkco-tb-')),
        'data-dismissible': attrs.dismissible ? '1' : '0'
      },
        attrs.showIcon && el( 'span', {
          className: 'bkco-icon',
          dangerouslySetInnerHTML: { __html: preset.icon }
        } ),
        el( 'div', { className: 'bkco-content' },
          el( RichText.Content, { tagName: 'strong', className: 'bkco-title', value: attrs.title } ),
          el( RichText.Content, { tagName: 'p', className: 'bkco-body', value: attrs.body } )
        ),
        attrs.dismissible && el( 'button', { className: 'bkco-close', 'aria-label': 'Close' }, '×' )
      );
    }
  } );

  /* Expose presets for save() */
  window.BKCO_PRESETS = PRESET_TYPES;
} )();

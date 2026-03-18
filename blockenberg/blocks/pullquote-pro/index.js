( function () {
  var el = wp.element.createElement;
  var __ = wp.i18n.__;
  var registerBlockType = wp.blocks.registerBlockType;
  var InspectorControls = wp.blockEditor.InspectorControls;
  var MediaUpload = wp.blockEditor.MediaUpload;
  var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
  var RichText = wp.blockEditor.RichText;
  var PanelBody = wp.components.PanelBody;
  var PanelColorSettings = wp.blockEditor.PanelColorSettings;
  var SelectControl = wp.components.SelectControl;
  var ToggleControl = wp.components.ToggleControl;
  var RangeControl = wp.components.RangeControl;
  var Button = wp.components.Button;

  var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
  var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

  var QUOTE_MARKS = {
    curved:   '\u201C\u201D',
    straight: '"\u0022"',
    double:   '\u00AB\u00BB',
    none:     ''
  };

  var v1Attributes = {
      quoteText: { type: 'string', default: 'Design is not just what it looks like and feels like. Design is how it works.' },
      authorName: { type: 'string', default: 'Steve Jobs' },
      authorRole: { type: 'string', default: 'Co-founder, Apple' },
      showAvatar: { type: 'boolean', default: false },
      avatarUrl: { type: 'string', default: '' },
      avatarId: { type: 'number', default: 0 },
      avatarSize: { type: 'number', default: 56 },
      quoteMarkStyle: { type: 'string', default: 'curved' },
      layout: { type: 'string', default: 'center' },
      showAccent: { type: 'boolean', default: true },
      accentPosition: { type: 'string', default: 'left' },
      accentColor: { type: 'string', default: '#6c3fb5' },
      accentWidth: { type: 'number', default: 4 },
      bgColor: { type: 'string', default: '' },
      textColor: { type: 'string', default: '#222222' },
      markColor: { type: 'string', default: '#d1c4e9' },
      quoteSz: { type: 'number', default: 22 },
      authorSz: { type: 'number', default: 14 },
      preset: { type: 'string', default: 'editorial' },
      borderRadius: { type: 'number', default: 8 },
      paddingV: { type: 'number', default: 40 },
      paddingH: { type: 'number', default: 40 },
      shadow: { type: 'boolean', default: false },
      quoteFontWeight: { type: 'number', default: 400 },
      quoteLineHeight: { type: 'number', default: 1.7 },
      authorFontWeight: { type: 'number', default: 600 },
      authorLineHeight: { type: 'number', default: 1.4 }
  };

  registerBlockType( 'blockenberg/pullquote-pro', {
    deprecated: [{
        attributes: v1Attributes,
        save: function (props) {
            var attrs = props.attributes;
            var RichText = wp.blockEditor.RichText;
            var mark = QUOTE_MARKS[attrs.quoteMarkStyle] || QUOTE_MARKS.curved;
            var openMark = mark ? mark[0] : '';
            return el('blockquote', {
                className: [
                    'bkqp-wrap',
                    'bkqp-layout-' + attrs.layout,
                    'bkqp-preset-' + attrs.preset,
                    attrs.showAccent ? 'bkqp-accent-' + attrs.accentPosition : '',
                    attrs.shadow ? 'bkqp-shadow' : ''
                ].filter(Boolean).join(' '),
                style: {
                    '--bkqp-bg':       attrs.bgColor || 'transparent',
                    '--bkqp-text':     attrs.textColor,
                    '--bkqp-mark':     attrs.markColor,
                    '--bkqp-accent':   attrs.accentColor,
                    '--bkqp-accentW':  attrs.accentWidth + 'px',
                    '--bkqp-qSz':      attrs.quoteSz + 'px',
                    '--bkqp-qFw':      attrs.quoteFontWeight,
                    '--bkqp-qLh':      attrs.quoteLineHeight,
                    '--bkqp-aSz':      attrs.authorSz + 'px',
                    '--bkqp-aFw':      attrs.authorFontWeight,
                    '--bkqp-aLh':      attrs.authorLineHeight,
                    '--bkqp-pv':       attrs.paddingV + 'px',
                    '--bkqp-ph':       attrs.paddingH + 'px',
                    '--bkqp-radius':   attrs.borderRadius + 'px',
                    '--bkqp-avatarSz': attrs.avatarSize + 'px'
                }
            },
                attrs.quoteMarkStyle !== 'none' && el('span', { className: 'bkqp-mark', 'aria-hidden': 'true' }, openMark),
                el(RichText.Content, { tagName: 'p', className: 'bkqp-text', value: attrs.quoteText }),
                el('footer', { className: 'bkqp-footer' },
                    attrs.showAvatar && attrs.avatarUrl && el('img', {
                        className: 'bkqp-avatar',
                        src: attrs.avatarUrl,
                        alt: attrs.authorName,
                        loading: 'lazy'
                    }),
                    el('div', { className: 'bkqp-cite' },
                        el(RichText.Content, { tagName: 'cite', className: 'bkqp-author', value: attrs.authorName }),
                        el(RichText.Content, { tagName: 'small', className: 'bkqp-role', value: attrs.authorRole })
                    )
                )
            );
        }
    }],
    edit: function ( props ) {
      var attrs = props.attributes;
      var setAttr = props.setAttributes;
      var mark = QUOTE_MARKS[ attrs.quoteMarkStyle ] || QUOTE_MARKS.curved;
      var openMark = mark ? mark[0] : '';

      var TC = getTypoControl();
      var wrapStyle = (function () {
          var _tv = getTypoCssVars();
          var s = {
              '--bkqp-bg':       attrs.bgColor || 'transparent',
              '--bkqp-text':     attrs.textColor,
              '--bkqp-mark':     attrs.markColor,
              '--bkqp-accent':   attrs.accentColor,
              '--bkqp-accentW':  attrs.accentWidth + 'px',
              '--bkqp-pv':       attrs.paddingV + 'px',
              '--bkqp-ph':       attrs.paddingH + 'px',
              '--bkqp-radius':   attrs.borderRadius + 'px',
              '--bkqp-avatarSz': attrs.avatarSize + 'px'
          };
          if (_tv) {
              Object.assign(s, _tv(attrs.quoteTypo || {}, '--bkqp-qt-'));
              Object.assign(s, _tv(attrs.authorTypo || {}, '--bkqp-au-'));
          }
          return s;
      })();

      return el( 'div', null,
        el( InspectorControls, null,
          el( PanelBody, { title: __( 'Quote Style', 'blockenberg' ), initialOpen: true },
            el( SelectControl, {
              label: __( 'Quote Mark Style', 'blockenberg' ),
              value: attrs.quoteMarkStyle,
              options: [
                { label: 'Curved (" ")',   value: 'curved' },
                { label: 'Straight (" ")', value: 'straight' },
                { label: 'Guillemets (« »)', value: 'double' },
                { label: 'None',           value: 'none' }
              ],
              onChange: function (v) { setAttr({ quoteMarkStyle: v }); }
            } ),
            el( SelectControl, {
              label: __( 'Layout / Alignment', 'blockenberg' ),
              value: attrs.layout,
              options: [
                { label: 'Center',     value: 'center' },
                { label: 'Left',       value: 'left' },
                { label: 'Right',      value: 'right' },
                { label: 'Float Left', value: 'float-left' }
              ],
              onChange: function (v) { setAttr({ layout: v }); }
            } ),
            el( SelectControl, {
              label: __( 'Typography Preset', 'blockenberg' ),
              value: attrs.preset,
              options: [
                { label: 'Editorial', value: 'editorial' },
                { label: 'Elegant',   value: 'elegant' },
                { label: 'Loud',      value: 'loud' }
              ],
              onChange: function (v) { setAttr({ preset: v }); }
            } ),
            el( ToggleControl, {
              label: __( 'Show Accent Line', 'blockenberg' ),
              checked: attrs.showAccent,
              onChange: function (v) { setAttr({ showAccent: v }); },
              __nextHasNoMarginBottom: true
            } ),
            attrs.showAccent && el( SelectControl, {
              label: __( 'Accent Position', 'blockenberg' ),
              value: attrs.accentPosition,
              options: [
                { label: 'Left',   value: 'left' },
                { label: 'Top',    value: 'top' },
                { label: 'Bottom', value: 'bottom' }
              ],
              onChange: function (v) { setAttr({ accentPosition: v }); }
            } ),
            attrs.showAccent && el( RangeControl, {
              label: __( 'Accent Width (px)', 'blockenberg' ),
              value: attrs.accentWidth, min: 2, max: 12,
              onChange: function (v) { setAttr({ accentWidth: v }); }
            } ),
            el( RangeControl, {
              label: __( 'Vertical Padding (px)', 'blockenberg' ),
              value: attrs.paddingV, min: 16, max: 80,
              onChange: function (v) { setAttr({ paddingV: v }); }
            } ),
            el( RangeControl, {
              label: __( 'Horizontal Padding (px)', 'blockenberg' ),
              value: attrs.paddingH, min: 16, max: 80,
              onChange: function (v) { setAttr({ paddingH: v }); }
            } ),
            el( RangeControl, {
              label: __( 'Border Radius (px)', 'blockenberg' ),
              value: attrs.borderRadius, min: 0, max: 24,
              onChange: function (v) { setAttr({ borderRadius: v }); }
            } ),
            el( ToggleControl, {
              label: __( 'Box Shadow', 'blockenberg' ),
              checked: attrs.shadow,
              onChange: function (v) { setAttr({ shadow: v }); },
              __nextHasNoMarginBottom: true
            } )
          ),
          el( PanelBody, { title: __( 'Author', 'blockenberg' ), initialOpen: false },
            el( ToggleControl, {
              label: __( 'Show Avatar', 'blockenberg' ),
              checked: attrs.showAvatar,
              onChange: function (v) { setAttr({ showAvatar: v }); },
              __nextHasNoMarginBottom: true
            } ),
            attrs.showAvatar && el( MediaUploadCheck, null,
              el( MediaUpload, {
                onSelect: function (img) { setAttr({ avatarUrl: img.url, avatarId: img.id }); },
                allowedTypes: ['image'],
                value: attrs.avatarId,
                render: function ( ref ) {
                  return el( Button, {
                    onClick: ref.open,
                    variant: attrs.avatarUrl ? 'secondary' : 'primary',
                    style: { marginBottom: '8px' }
                  }, attrs.avatarUrl ? __( 'Change Avatar', 'blockenberg' ) : __( 'Select Avatar', 'blockenberg' ) );
                }
              } )
            ),
            attrs.showAvatar && el( RangeControl, {
              label: __( 'Avatar Size (px)', 'blockenberg' ),
              value: attrs.avatarSize, min: 32, max: 100,
              onChange: function (v) { setAttr({ avatarSize: v }); }
            } )
          ),
          
          el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
              TC && el(TC, { label: __('Quote Text', 'blockenberg'), value: attrs.quoteTypo || {}, onChange: function(v) { setAttr({ quoteTypo: v }); } }),
              TC && el(TC, { label: __('Author', 'blockenberg'), value: attrs.authorTypo || {}, onChange: function(v) { setAttr({ authorTypo: v }); } })
          ),
el( PanelBody, { title: __( 'Colors', 'blockenberg' ), initialOpen: false },
            el( PanelColorSettings, {
              title: __( 'Colors', 'blockenberg' ),
              colorSettings: [
                { value: attrs.bgColor,     onChange: function(v){setAttr({bgColor:v||''});},     label: __('Background') },
                { value: attrs.textColor,   onChange: function(v){setAttr({textColor:v||'#222'});}, label: __('Quote Text') },
                { value: attrs.markColor,   onChange: function(v){setAttr({markColor:v||'#d1c4e9'});}, label: __('Quote Mark') },
                { value: attrs.accentColor, onChange: function(v){setAttr({accentColor:v||'#6c3fb5'});}, label: __('Accent Line') }
              ]
            } )
          )
        ),
        el( 'blockquote', {
          className: [
            'bkqp-wrap',
            'bkqp-layout-' + attrs.layout,
            'bkqp-preset-' + attrs.preset,
            attrs.showAccent ? 'bkqp-accent-' + attrs.accentPosition : '',
            attrs.shadow ? 'bkqp-shadow' : ''
          ].filter(Boolean).join(' '),
          style: wrapStyle
        },
          attrs.quoteMarkStyle !== 'none' && el( 'span', { className: 'bkqp-mark', 'aria-hidden': 'true' }, openMark ),
          el( RichText, {
            tagName: 'p',
            className: 'bkqp-text',
            value: attrs.quoteText,
            onChange: function (v) { setAttr({ quoteText: v }); },
            placeholder: __( 'Your inspiring quote…', 'blockenberg' )
          } ),
          el( 'footer', { className: 'bkqp-footer' },
            attrs.showAvatar && attrs.avatarUrl && el( 'img', {
              className: 'bkqp-avatar',
              src: attrs.avatarUrl,
              alt: attrs.authorName
            } ),
            el( 'div', { className: 'bkqp-cite' },
              el( RichText, {
                tagName: 'cite',
                className: 'bkqp-author',
                value: attrs.authorName,
                onChange: function (v) { setAttr({ authorName: v }); },
                placeholder: __( 'Author Name', 'blockenberg' )
              } ),
              el( RichText, {
                tagName: 'small',
                className: 'bkqp-role',
                value: attrs.authorRole,
                onChange: function (v) { setAttr({ authorRole: v }); },
                placeholder: __( 'Title / Role', 'blockenberg' )
              } )
            )
          )
        )
      );
    },
    save: function ( props ) {
      var attrs = props.attributes;
      var mark = QUOTE_MARKS[ attrs.quoteMarkStyle ] || QUOTE_MARKS.curved;
      var openMark = mark ? mark[0] : '';
      return el( 'blockquote', {
        className: [
          'bkqp-wrap',
          'bkqp-layout-' + attrs.layout,
          'bkqp-preset-' + attrs.preset,
          attrs.showAccent ? 'bkqp-accent-' + attrs.accentPosition : '',
          attrs.shadow ? 'bkqp-shadow' : ''
        ].filter(Boolean).join(' '),
        style: (function () {
            var _tv = getTypoCssVars();
            var s = {
                '--bkqp-bg':       attrs.bgColor || 'transparent',
                '--bkqp-text':     attrs.textColor,
                '--bkqp-mark':     attrs.markColor,
                '--bkqp-accent':   attrs.accentColor,
                '--bkqp-accentW':  attrs.accentWidth + 'px',
                '--bkqp-pv':       attrs.paddingV + 'px',
                '--bkqp-ph':       attrs.paddingH + 'px',
                '--bkqp-radius':   attrs.borderRadius + 'px',
                '--bkqp-avatarSz': attrs.avatarSize + 'px'
            };
            if (_tv) {
                Object.assign(s, _tv(attrs.quoteTypo || {}, '--bkqp-qt-'));
                Object.assign(s, _tv(attrs.authorTypo || {}, '--bkqp-au-'));
            }
            return s;
        })()
      },
        attrs.quoteMarkStyle !== 'none' && el( 'span', { className: 'bkqp-mark', 'aria-hidden': 'true' }, openMark ),
        el( RichText.Content, { tagName: 'p', className: 'bkqp-text', value: attrs.quoteText } ),
        el( 'footer', { className: 'bkqp-footer' },
          attrs.showAvatar && attrs.avatarUrl && el( 'img', {
            className: 'bkqp-avatar',
            src: attrs.avatarUrl,
            alt: attrs.authorName,
            loading: 'lazy'
          } ),
          el( 'div', { className: 'bkqp-cite' },
            el( RichText.Content, { tagName: 'cite', className: 'bkqp-author', value: attrs.authorName } ),
            el( RichText.Content, { tagName: 'small', className: 'bkqp-role', value: attrs.authorRole } )
          )
        )
      );
    }
  } );

} )();

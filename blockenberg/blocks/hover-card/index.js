( function () {
  const el = window.wp.element.createElement;
  const { registerBlockType } = window.wp.blocks;
  const { InspectorControls, MediaUpload, MediaUploadCheck, PanelColorSettings } = window.wp.blockEditor;
  const { PanelBody, RangeControl, SelectControl, TextControl, ToggleControl, Button, __experimentalInputControl: InputControl } = window.wp.components;
  const { __ } = window.wp.i18n;
  const useRef = window.wp.element.useRef;

  var _TypographyControl, _typoCssVars;
  function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
  function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

  registerBlockType( 'blockenberg/hover-card', {
    edit: function ( props ) {
      const { attributes: attr, setAttributes } = props;
      const ref = useRef();

      function onSelectImage( media ) {
        setAttributes( { imageUrl: media.url, imageId: media.id, imageAlt: media.alt || '' } );
      }
      function removeImage() {
        setAttributes( { imageUrl: '', imageId: 0, imageAlt: '' } );
      }

      const cssVars = {
        '--bkhc-width': attr.cardWidth + 'px',
        '--bkhc-height': attr.cardHeight + 'px',
        '--bkhc-radius': attr.borderRadius + 'px',
        '--bkhc-overlay': attr.overlayBg,
        '--bkhc-text': attr.textColor,
        '--bkhc-duration': attr.duration + 'ms',
        '--bkhc-heading-sz': attr.headingSz + 'px',
        '--bkhc-heading-weight': attr.headingFontWeight || '700',
        '--bkhc-heading-lh': attr.headingLineHeight || 1.3,
        '--bkhc-text-sz': attr.textSz + 'px',
        '--bkhc-text-weight': attr.textFontWeight || '400',
        '--bkhc-text-lh': attr.textLineHeight || 1.6,
        '--bkhc-bg': attr.bgColor,
      };

      const dirClass = 'bkhc-reveal-' + attr.revealDirection;

      return el(
        'div',
        { className: 'bkhc-wrap', style: { display: 'inline-flex' } },

        el( InspectorControls, null,

          el( PanelBody, { title: __( 'Image' ), initialOpen: true },
            attr.imageUrl
              ? el( 'div', { style: { marginBottom: '8px' } },
                  el( 'img', { src: attr.imageUrl, style: { width: '100%', borderRadius: '6px', display: 'block', marginBottom: '6px' } } ),
                  el( Button, { isDestructive: true, isSmall: true, onClick: removeImage }, __( 'Remove Image' ) )
                )
              : el( MediaUploadCheck, null,
                  el( MediaUpload, {
                    onSelect: onSelectImage,
                    allowedTypes: ['image'],
                    value: attr.imageId,
                    render: ( { open } ) => el( Button, { onClick: open, variant: 'secondary' }, __( 'Upload Image' ) )
                  } )
                )
          ),

          el( PanelBody, { title: __( 'Reveal Content' ), initialOpen: true },
            el( TextControl, {
              label: __( 'Heading' ),
              value: attr.heading,
              onChange: v => setAttributes( { heading: v } )
            } ),
            el( TextControl, {
              label: __( 'Text' ),
              value: attr.text,
              onChange: v => setAttributes( { text: v } )
            } ),
            el( ToggleControl, {
              label: __( 'Show Button' ),
              checked: attr.showBtn,
              onChange: v => setAttributes( { showBtn: v } ),
              __nextHasNoMarginBottom: true
            } ),
            attr.showBtn && el( TextControl, {
              label: __( 'Button Label' ),
              value: attr.btnLabel,
              onChange: v => setAttributes( { btnLabel: v } )
            } ),
            attr.showBtn && el( TextControl, {
              label: __( 'Button URL' ),
              value: attr.btnUrl,
              onChange: v => setAttributes( { btnUrl: v } )
            } )
          ),

          el( PanelBody, { title: __( 'Reveal Effect' ), initialOpen: false },
            el( SelectControl, {
              label: __( 'Reveal Direction' ),
              value: attr.revealDirection,
              options: [
                { label: __( 'From Bottom' ), value: 'bottom' },
                { label: __( 'From Top' ), value: 'top' },
                { label: __( 'From Left' ), value: 'left' },
                { label: __( 'From Right' ), value: 'right' },
                { label: __( 'Fade In' ), value: 'fade' },
              ],
              onChange: v => setAttributes( { revealDirection: v } )
            } ),
            el( RangeControl, {
              label: __( 'Transition Duration (ms)' ),
              value: attr.duration,
              min: 100, max: 1000, step: 50,
              onChange: v => setAttributes( { duration: v } )
            } )
          ),

          el( PanelBody, { title: __( 'Card Size' ), initialOpen: false },
            el( RangeControl, {
              label: __( 'Card Width (px)' ),
              value: attr.cardWidth,
              min: 160, max: 700,
              onChange: v => setAttributes( { cardWidth: v } )
            } ),
            el( RangeControl, {
              label: __( 'Card Height (px)' ),
              value: attr.cardHeight,
              min: 120, max: 700,
              onChange: v => setAttributes( { cardHeight: v } )
            } ),
            el( RangeControl, {
              label: __( 'Border Radius (px)' ),
              value: attr.borderRadius,
              min: 0, max: 40,
              onChange: v => setAttributes( { borderRadius: v } )
            } )
          ),

          el( PanelBody, { title: __( 'Typography' ), initialOpen: false },
            getTypographyControl() && el( getTypographyControl(), {
              label: __( 'Heading' ),
              typo: attr.headingTypo || {},
              onChange: function(v){ setAttributes({ headingTypo: v }); }
            }),
            getTypographyControl() && el( getTypographyControl(), {
              label: __( 'Text' ),
              typo: attr.textTypo || {},
              onChange: function(v){ setAttributes({ textTypo: v }); }
            })
          ),

          el( PanelColorSettings, {
            title: __( 'Colors' ),
            initialOpen: false,
            colorSettings: [
              { label: __( 'Card Background' ), value: attr.bgColor, onChange: v => setAttributes( { bgColor: v || '#1e0a3c' } ) },
              { label: __( 'Overlay Color' ), value: attr.overlayBg, onChange: v => setAttributes( { overlayBg: v || 'rgba(108,63,181,0.92)' } ) },
              { label: __( 'Text Color' ), value: attr.textColor, onChange: v => setAttributes( { textColor: v || '#ffffff' } ) },
            ]
          } )
        ),

        el( 'div',
          {
            className: 'bkhc-card bkhc-preview ' + dirClass,
            style: cssVars,
            ref,
          },
          attr.imageUrl
            ? el( 'img', { src: attr.imageUrl, alt: attr.imageAlt, className: 'bkhc-img' } )
            : el( 'div', { className: 'bkhc-img bkhc-img-placeholder' },
                el( 'span', { className: 'dashicons dashicons-format-image' } )
              ),
          el( 'div', { className: 'bkhc-overlay' },
            el( 'h3', { className: 'bkhc-heading' }, attr.heading ),
            el( 'p', { className: 'bkhc-text' }, attr.text ),
            attr.showBtn && el( 'span', { className: 'bkhc-btn' }, attr.btnLabel )
          )
        )
      );
    },

    save: function ( { attributes: attr } ) {
      const dirClass = 'bkhc-reveal-' + attr.revealDirection;
      const cssVars = {
        '--bkhc-width': attr.cardWidth + 'px',
        '--bkhc-height': attr.cardHeight + 'px',
        '--bkhc-radius': attr.borderRadius + 'px',
        '--bkhc-overlay': attr.overlayBg,
        '--bkhc-text': attr.textColor,
        '--bkhc-duration': attr.duration + 'ms',
        '--bkhc-bg': attr.bgColor,
      };
      var _tv = getTypoCssVars();
      if (_tv) {
        Object.assign(cssVars, _tv(attr.headingTypo || {}, '--bkhc-h-'));
        Object.assign(cssVars, _tv(attr.textTypo || {}, '--bkhc-t-'));
      }
      if (attr.headingSz && attr.headingSz !== 18) cssVars['--bkhc-h-sz'] = attr.headingSz + 'px';
      if (attr.headingFontWeight && attr.headingFontWeight !== '700') cssVars['--bkhc-h-fw'] = attr.headingFontWeight;
      if (attr.headingLineHeight && attr.headingLineHeight !== 1.3) cssVars['--bkhc-h-lh'] = String(attr.headingLineHeight);
      if (attr.textSz && attr.textSz !== 14) cssVars['--bkhc-t-sz'] = attr.textSz + 'px';
      if (attr.textFontWeight && attr.textFontWeight !== '400') cssVars['--bkhc-t-fw'] = attr.textFontWeight;
      if (attr.textLineHeight && attr.textLineHeight !== 1.6) cssVars['--bkhc-t-lh'] = String(attr.textLineHeight);

      return el( 'div', { className: 'bkhc-wrap' },
        el( 'div', { className: 'bkhc-card ' + dirClass, style: cssVars },
          attr.imageUrl
            ? el( 'img', { src: attr.imageUrl, alt: attr.imageAlt, className: 'bkhc-img' } )
            : null,
          el( 'div', { className: 'bkhc-overlay' },
            el( 'h3', { className: 'bkhc-heading' }, attr.heading ),
            el( 'p', { className: 'bkhc-text' }, attr.text ),
            attr.showBtn
              ? el( 'a', { href: attr.btnUrl, className: 'bkhc-btn' }, attr.btnLabel )
              : null
          )
        )
      );
    }
  } );
} )();

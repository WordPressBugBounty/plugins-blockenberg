/**
 * Blockenberg Typography Control
 *
 * Reusable Elementor-like typography popover control.
 * Exposed as: window.bkbgTypographyControl
 *
 * Usage in a block's index.js:
 *   var TypographyControl = window.bkbgTypographyControl;
 *   el(TypographyControl, {
 *       label: __('Title Typography'),
 *       value: attributes.titleTypo || {},
 *       onChange: function(v) { setAttributes({ titleTypo: v }); }
 *   })
 */
( function () {
    'use strict';

    var el          = wp.element.createElement;
    var useState    = wp.element.useState;
    var useEffect   = wp.element.useEffect;
    var useRef      = wp.element.useRef;
    var Button      = wp.components.Button;
    var Popover     = wp.components.Popover;
    var SelectControl = wp.components.SelectControl;
    var __          = wp.i18n.__;

    /* -------------------------------------------------------
       Default typography object shape
       ------------------------------------------------------- */
    var DEFAULT_TYPO = {
        family            : '',
        sizeDesktop       : '', sizeTablet       : '', sizeMobile       : '', sizeUnit       : 'px',
        weight            : '',
        transform         : '',
        style             : '',
        decoration        : '',
        lineHeightDesktop : '', lineHeightTablet : '', lineHeightMobile : '', lineHeightUnit : 'px',
        letterSpacingDesktop: '', letterSpacingTablet: '', letterSpacingMobile: '', letterSpacingUnit: 'px',
        wordSpacingDesktop  : '', wordSpacingTablet  : '', wordSpacingMobile  : '', wordSpacingUnit  : 'px'
    };

    /* -------------------------------------------------------
       System fonts (never loaded from Google)
       ------------------------------------------------------- */
    var SYSTEM_FONTS = [
        'Arial', 'Georgia', 'Helvetica', 'Tahoma',
        'Times New Roman', 'Trebuchet MS', 'Verdana'
    ];

    /* -------------------------------------------------------
       Load a Google Font into a document's <head>
       ------------------------------------------------------- */
    function injectFontLink( targetDoc, id, href ) {
        if ( ! targetDoc || ! targetDoc.head ) return;
        if ( targetDoc.getElementById( id ) ) return;
        var link  = targetDoc.createElement( 'link' );
        link.id   = id;
        link.rel  = 'stylesheet';
        link.href = href;
        targetDoc.head.appendChild( link );
    }

    function loadGoogleFont( family ) {
        if ( ! family ) return;
        if ( SYSTEM_FONTS.indexOf( family ) !== -1 ) return;

        var id   = 'bkbg-gf-' + family.replace( /\s+/g, '-' ).toLowerCase();
        var href = 'https://fonts.googleapis.com/css2?family=' +
                   encodeURIComponent( family ) +
                   ':wght@300;400;500;600;700;800;900&display=swap';

        // 1. Outer document (admin page shell)
        injectFontLink( document, id, href );

        // 2. Editor iframe — WordPress 5.9+ uses an iframe canvas.
        //    The iframe may not exist yet on first call; we also retry once
        //    after a short delay to handle late-mounting iframes.
        function injectIntoEditorIframe() {
            // Selectors used by different WP versions
            var selectors = [
                'iframe[name="editor-canvas"]',
                '.editor-canvas__iframe',
                'iframe.editor-canvas__iframe',
                '.block-editor-iframe__container iframe'
            ];
            var i, iframe;
            for ( i = 0; i < selectors.length; i++ ) {
                iframe = document.querySelector( selectors[ i ] );
                if ( iframe ) break;
            }
            if ( iframe && iframe.contentDocument ) {
                injectFontLink( iframe.contentDocument, id, href );
            }
        }

        injectIntoEditorIframe();
        // Retry after 500 ms in case the iframe wasn't mounted yet
        setTimeout( injectIntoEditorIframe, 500 );
    }

    /* -------------------------------------------------------
       SVG Icons
       ------------------------------------------------------- */
    function iconDevice( type, isActive ) {
        var c = isActive ? '#e50087' : 'currentColor';
        if ( type === 'desktop' ) {
            return el( 'svg', { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none' },
                el( 'path', { d: 'M20 3H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h6l-1 2H8v2h8v-2h-1l-1-2h6c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12H4V5h16v10z', fill: c } )
            );
        }
        if ( type === 'tablet' ) {
            return el( 'svg', { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none' },
                el( 'path', { d: 'M18.5 0h-14A2.5 2.5 0 0 0 2 2.5v19A2.5 2.5 0 0 0 4.5 24h14a2.5 2.5 0 0 0 2.5-2.5v-19A2.5 2.5 0 0 0 18.5 0zm-7 23c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm7.5-4H4V3h15v16z', fill: c } )
            );
        }
        // mobile
        return el( 'svg', { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none' },
            el( 'path', { d: 'M15.5 1h-8A2.5 2.5 0 0 0 5 3.5v17A2.5 2.5 0 0 0 7.5 23h8a2.5 2.5 0 0 0 2.5-2.5v-17A2.5 2.5 0 0 0 15.5 1zm-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5-4H7V4h9v14z', fill: c } )
        );
    }

    function iconPencil() {
        return el( 'svg', { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none' },
            el( 'path', { d: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z', fill: 'currentColor' } )
        );
    }

    function iconReset() {
        return el( 'svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none' },
            el( 'path', { d: 'M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z', fill: 'currentColor' } )
        );
    }

    function iconClose() {
        return el( 'svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none' },
            el( 'path', { d: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z', fill: 'currentColor' } )
        );
    }

    /* -------------------------------------------------------
       Unit Selector (reused from inspector-tabs pattern)
       ------------------------------------------------------- */
    function UnitSelector( props ) {
        var unit     = props.unit || 'px';
        var units    = props.units || [ 'px', 'em', 'rem' ];
        var onChange = props.onChange;

        var _pop = useState( false );
        var isOpen  = _pop[ 0 ];
        var setOpen = _pop[ 1 ];

        return el( 'div', { className: 'bkbg-unit-selector' },
            el( Button, {
                className: 'bkbg-unit-btn',
                onClick: function () { setOpen( ! isOpen ); }
            },
                el( 'span', { className: 'bkbg-unit-value' }, unit ),
                el( 'span', { className: 'dashicons dashicons-arrow-down-alt2 bkbg-unit-caret', 'aria-hidden': true } )
            ),
            isOpen && el( Popover, {
                position: 'bottom right',
                onClose: function () { setOpen( false ); },
                noArrow: true,
                focusOnMount: 'container',
                className: 'bkbg-unit-popover'
            },
                el( 'div', { className: 'bkbg-unit-list' },
                    units.map( function ( u ) {
                        return el( Button, {
                            key: u,
                            className: 'bkbg-unit-option' + ( u === unit ? ' is-active' : '' ),
                            onClick: function () { onChange( u ); setOpen( false ); }
                        }, u );
                    } )
                )
            )
        );
    }

    /* -------------------------------------------------------
       Editor preview device sync helpers
       (mirrors the same helpers in inspector-tabs.js)
       ------------------------------------------------------- */
    function normalizePreviewDeviceName( raw ) {
        if ( ! raw ) return 'desktop';
        var v = String( raw ).toLowerCase();
        if ( v === 'tablet' ) return 'tablet';
        if ( v === 'mobile' ) return 'mobile';
        return 'desktop';
    }

    function getEditorPreviewDevice() {
        var stores = [ 'core/edit-post', 'core/edit-site' ];
        for ( var i = 0; i < stores.length; i++ ) {
            var sel = wp.data && wp.data.select ? wp.data.select( stores[ i ] ) : null;
            if ( ! sel ) continue;
            if ( typeof sel.__experimentalGetPreviewDeviceType === 'function' ) {
                return normalizePreviewDeviceName( sel.__experimentalGetPreviewDeviceType() );
            }
            if ( typeof sel.getDeviceType === 'function' ) {
                return normalizePreviewDeviceName( sel.getDeviceType() );
            }
        }
        return 'desktop';
    }

    function setEditorPreviewDevice( deviceName ) {
        var mapped = deviceName === 'desktop' ? 'Desktop' : ( deviceName === 'tablet' ? 'Tablet' : 'Mobile' );
        var stores = [ 'core/edit-post', 'core/edit-site' ];
        stores.forEach( function ( storeName ) {
            var dispatcher = wp.data && wp.data.dispatch ? wp.data.dispatch( storeName ) : null;
            if ( ! dispatcher ) return;
            if ( typeof dispatcher.__experimentalSetPreviewDeviceType === 'function' ) {
                dispatcher.__experimentalSetPreviewDeviceType( mapped );
            } else if ( typeof dispatcher.setDeviceType === 'function' ) {
                dispatcher.setDeviceType( mapped );
            }
        } );
    }

    /* -------------------------------------------------------
       Device Switcher (compact, inline for typo panel)
       ------------------------------------------------------- */
    function TypoDeviceSwitcher( props ) {
        var device   = props.device;
        var onChange = props.onChange;

        var _pop = useState( false );
        var isOpen  = _pop[ 0 ];
        var setOpen = _pop[ 1 ];

        return el( 'div', { className: 'bkbg-device-switcher' },
            el( Button, {
                className: 'bkbg-device-btn',
                onClick: function () { setOpen( ! isOpen ); },
                'aria-label': __( 'Switch device', 'blockenberg' )
            }, iconDevice( device, false ) ),
            isOpen && el( Popover, {
                position: 'bottom center',
                onClose: function () { setOpen( false ); },
                noArrow: true,
                focusOnMount: 'container',
                className: 'bkbg-device-popover'
            },
                el( 'div', { className: 'bkbg-device-list' },
                    [ 'desktop', 'tablet', 'mobile' ].map( function ( d ) {
                        return el( Button, {
                            key: d,
                            className: 'bkbg-device-option' + ( d === device ? ' is-active' : '' ),
                            onClick: function () {
                                onChange( d );
                                setEditorPreviewDevice( d );
                                setOpen( false );
                            }
                        }, iconDevice( d, d === device ) );
                    } )
                )
            )
        );
    }

    /* -------------------------------------------------------
       Responsive Slider+Input control
       prefix   : 'size' | 'lineHeight' | 'letterSpacing' | 'wordSpacing'
       unitKey  : 'sizeUnit' | 'lineHeightUnit' | etc.
       ------------------------------------------------------- */
    function ResponsiveSliderControl( props ) {
        var label          = props.label;
        var prefix         = props.prefix;          // e.g. 'size'
        var unitKey        = props.unitKey;          // e.g. 'sizeUnit'
        var units          = props.units || [ 'px', 'em', 'rem' ];
        var minVal         = props.min !== undefined ? props.min : 0;
        var maxVal         = props.max !== undefined ? props.max : 200;
        var stepVal        = props.step || 1;
        var typo           = props.typo;
        var onChange       = props.onChange;
        var device         = props.device;
        var onDeviceChange = props.onDeviceChange;

        // Build the responsive attribute key, e.g. 'sizeDesktop'
        var suffix    = device === 'desktop' ? 'Desktop' : ( device === 'tablet' ? 'Tablet' : 'Mobile' );
        var actualKey = prefix + suffix;             // e.g. 'sizeDesktop'
        var value     = typo[ actualKey ] !== undefined ? typo[ actualKey ] : '';
        var unit      = typo[ unitKey ] || units[ 0 ];

        // Adjust max for relative units
        var effectiveMax = maxVal;
        if ( unit === 'em' || unit === 'rem' ) { effectiveMax = 20; }
        if ( unit === 'vw' )                   { effectiveMax = 100; }
        if ( unit === 'lh' || unit === 'rlh' ) { effectiveMax = 10; }

        var effectiveStep = ( unit === 'em' || unit === 'rem' || unit === 'lh' || unit === 'rlh' ) ? 0.1 : stepVal;

        function updateValue( v ) {
            var upd = {};
            upd[ actualKey ] = v;
            onChange( upd );
        }

        function updateUnit( u ) {
            var upd = {};
            upd[ unitKey ] = u;
            onChange( upd );
        }

        return el( 'div', { className: 'bkbg-typo-field bkbg-typo-responsive-field' },
            // Row: label + device switcher + unit selector
            el( 'div', { className: 'bkbg-typo-field-header' },
                el( 'span', { className: 'bkbg-typo-field-label' }, label ),
                el( 'div', { className: 'bkbg-typo-field-header-right' },
                    el( TypoDeviceSwitcher, { device: device, onChange: onDeviceChange } ),
                    el( UnitSelector, { unit: unit, units: units, onChange: updateUnit } )
                )
            ),
            // Row: slider + number input
            el( 'div', { className: 'bkbg-typo-slider-row' },
                el( 'input', {
                    type      : 'range',
                    className : 'bkbg-typo-range',
                    min       : minVal,
                    max       : effectiveMax,
                    step      : effectiveStep,
                    value     : value !== '' ? parseFloat( value ) : minVal,
                    onChange  : function ( e ) { updateValue( e.target.value ); }
                } ),
                el( 'input', {
                    type      : 'number',
                    className : 'bkbg-typo-number',
                    value     : value,
                    min       : minVal,
                    max       : effectiveMax,
                    step      : effectiveStep,
                    placeholder: '',
                    onChange  : function ( e ) { updateValue( e.target.value ); }
                } )
            )
        );
    }

    /* -------------------------------------------------------
       Main TypographyControl Component
       ------------------------------------------------------- */
    function TypographyControl( props ) {
        var label    = props.label;
        var value    = props.value || {};
        var onChange = props.onChange;

        // Merge stored value with defaults
        var typo = {};
        var k;
        for ( k in DEFAULT_TYPO ) { typo[ k ] = DEFAULT_TYPO[ k ]; }
        for ( k in value )        { if ( value[ k ] !== undefined && value[ k ] !== null ) typo[ k ] = value[ k ]; }

        var _open   = useState( false );
        var isOpen  = _open[ 0 ];
        var setOpen = _open[ 1 ];

        var _device   = useState( getEditorPreviewDevice() );
        var device    = _device[ 0 ];
        var setDevice = _device[ 1 ];

        var anchorRef = useRef( null );

        // Sync device with the editor's responsive preview toolbar (two-way)
        useEffect( function () {
            if ( ! wp.data || typeof wp.data.subscribe !== 'function' ) return;
            var unsubscribe = wp.data.subscribe( function () {
                var editorDevice = getEditorPreviewDevice();
                setDevice( function ( current ) {
                    return current === editorDevice ? current : editorDevice;
                } );
            } );
            return function () {
                if ( typeof unsubscribe === 'function' ) unsubscribe();
            };
        }, [] );

        // Load font in editor whenever family changes
        useEffect( function () {
            if ( typo.family ) { loadGoogleFont( typo.family ); }
        }, [ typo.family ] );

        function update( updates ) {
            var next = {};
            for ( k in typo ) { next[ k ] = typo[ k ]; }
            for ( k in updates ) { next[ k ] = updates[ k ]; }
            onChange( next );
        }

        function reset() { onChange( {} ); }

        // Detect if any non-default value is set
        function hasValue() {
            for ( k in DEFAULT_TYPO ) {
                var v = typo[ k ];
                if ( v !== null && v !== undefined && v !== '' && v !== DEFAULT_TYPO[ k ] ) { return true; }
            }
            return false;
        }

        /* ----- Font family options ----- */
        var fontOptions = [ { label: __( 'Default', 'blockenberg' ), value: '' } ];

        // System fonts group
        SYSTEM_FONTS.forEach( function ( f ) {
            fontOptions.push( { label: f, value: f } );
        } );

        // Google Fonts (injected by PHP via wp_localize_script → window.bkbgGoogleFonts)
        var gFonts = ( typeof window.bkbgGoogleFonts !== 'undefined' ) ? window.bkbgGoogleFonts : [];
        gFonts.forEach( function ( f ) {
            fontOptions.push( { label: f, value: f } );
        } );

        /* ----- Option lists ----- */
        var weightOptions = [
            { label: __( 'Default',      'blockenberg' ), value: '' },
            { label: __( '100 (Thin)',        'blockenberg' ), value: '100' },
            { label: __( '200 (Extra Light)', 'blockenberg' ), value: '200' },
            { label: __( '300 (Light)',        'blockenberg' ), value: '300' },
            { label: __( '400 (Normal)',       'blockenberg' ), value: '400' },
            { label: __( '500 (Medium)',       'blockenberg' ), value: '500' },
            { label: __( '600 (Semi Bold)',    'blockenberg' ), value: '600' },
            { label: __( '700 (Bold)',         'blockenberg' ), value: '700' },
            { label: __( '800 (Extra Bold)',   'blockenberg' ), value: '800' },
            { label: __( '900 (Black)',        'blockenberg' ), value: '900' },
            { label: __( 'Normal',             'blockenberg' ), value: 'normal' },
            { label: __( 'Bold',               'blockenberg' ), value: 'bold' }
        ];

        var transformOptions = [
            { label: __( 'Default',    'blockenberg' ), value: '' },
            { label: __( 'Uppercase',  'blockenberg' ), value: 'uppercase' },
            { label: __( 'Lowercase',  'blockenberg' ), value: 'lowercase' },
            { label: __( 'Capitalize', 'blockenberg' ), value: 'capitalize' },
            { label: __( 'Normal',     'blockenberg' ), value: 'none' }
        ];

        var styleOptions = [
            { label: __( 'Default', 'blockenberg' ), value: '' },
            { label: __( 'Normal',  'blockenberg' ), value: 'normal' },
            { label: __( 'Italic',  'blockenberg' ), value: 'italic' },
            { label: __( 'Oblique', 'blockenberg' ), value: 'oblique' }
        ];

        var decorationOptions = [
            { label: __( 'Default',      'blockenberg' ), value: '' },
            { label: __( 'Underline',    'blockenberg' ), value: 'underline' },
            { label: __( 'Overline',     'blockenberg' ), value: 'overline' },
            { label: __( 'Line Through', 'blockenberg' ), value: 'line-through' },
            { label: __( 'None',         'blockenberg' ), value: 'none' }
        ];

        /* ----- Render ----- */
        return el( 'div', { className: 'bkbg-typo-control' },

            // Label row with pencil button
            el( 'div', {
                ref       : anchorRef,
                className : 'bkbg-typo-label-row'
            },
                el( 'span', { className: 'bkbg-typo-label' + ( hasValue() ? ' has-value' : '' ) }, label ),
                el( Button, {
                    className : 'bkbg-typo-edit-btn' + ( hasValue() ? ' has-value' : '' ),
                    onClick   : function () { setOpen( ! isOpen ); },
                    'aria-label': __( 'Edit Typography', 'blockenberg' )
                }, iconPencil() )
            ),

            // Typography popover panel
            isOpen && el( Popover, {
                anchor       : anchorRef.current,
                placement    : 'left-start',
                offset       : 12,
                onClose      : function () { setOpen( false ); },
                noArrow      : true,
                focusOnMount : 'container',
                className    : 'bkbg-typo-popover'
            },
                el( 'div', { className: 'bkbg-typo-panel' },

                    // Panel header
                    el( 'div', { className: 'bkbg-typo-panel-header' },
                        el( 'span', { className: 'bkbg-typo-panel-title' }, __( 'Typography', 'blockenberg' ) ),
                        el( 'div', { className: 'bkbg-typo-panel-actions' },
                            el( Button, {
                                className   : 'bkbg-typo-header-btn',
                                onClick     : reset,
                                'aria-label': __( 'Reset typography', 'blockenberg' ),
                                isSmall     : true
                            }, iconReset() ),
                            el( Button, {
                                className   : 'bkbg-typo-header-btn',
                                onClick     : function () { setOpen( false ); },
                                'aria-label': __( 'Close', 'blockenberg' ),
                                isSmall     : true
                            }, iconClose() )
                        )
                    ),

                    // Family
                    el( 'div', { className: 'bkbg-typo-field' },
                        el( 'label', { className: 'bkbg-typo-field-label' }, __( 'Family', 'blockenberg' ) ),
                        el( SelectControl, {
                            value    : typo.family,
                            options  : fontOptions,
                            onChange : function ( v ) { update( { family: v } ); },
                            __nextHasNoMarginBottom: true
                        } )
                    ),

                    // Size (responsive)
                    el( ResponsiveSliderControl, {
                        label        : __( 'Size', 'blockenberg' ),
                        prefix       : 'size',
                        unitKey      : 'sizeUnit',
                        units        : [ 'px', 'em', 'rem', 'vw' ],
                        min          : 0,
                        max          : 200,
                        typo         : typo,
                        onChange     : update,
                        device       : device,
                        onDeviceChange: setDevice
                    } ),

                    // Weight
                    el( 'div', { className: 'bkbg-typo-field' },
                        el( 'label', { className: 'bkbg-typo-field-label' }, __( 'Weight', 'blockenberg' ) ),
                        el( SelectControl, {
                            value    : typo.weight,
                            options  : weightOptions,
                            onChange : function ( v ) { update( { weight: v } ); },
                            __nextHasNoMarginBottom: true
                        } )
                    ),

                    // Transform
                    el( 'div', { className: 'bkbg-typo-field' },
                        el( 'label', { className: 'bkbg-typo-field-label' }, __( 'Transform', 'blockenberg' ) ),
                        el( SelectControl, {
                            value    : typo.transform,
                            options  : transformOptions,
                            onChange : function ( v ) { update( { transform: v } ); },
                            __nextHasNoMarginBottom: true
                        } )
                    ),

                    // Style
                    el( 'div', { className: 'bkbg-typo-field' },
                        el( 'label', { className: 'bkbg-typo-field-label' }, __( 'Style', 'blockenberg' ) ),
                        el( SelectControl, {
                            value    : typo.style,
                            options  : styleOptions,
                            onChange : function ( v ) { update( { style: v } ); },
                            __nextHasNoMarginBottom: true
                        } )
                    ),

                    // Decoration
                    el( 'div', { className: 'bkbg-typo-field' },
                        el( 'label', { className: 'bkbg-typo-field-label' }, __( 'Decoration', 'blockenberg' ) ),
                        el( SelectControl, {
                            value    : typo.decoration,
                            options  : decorationOptions,
                            onChange : function ( v ) { update( { decoration: v } ); },
                            __nextHasNoMarginBottom: true
                        } )
                    ),

                    // Line Height (responsive)
                    el( ResponsiveSliderControl, {
                        label        : __( 'Line Height', 'blockenberg' ),
                        prefix       : 'lineHeight',
                        unitKey      : 'lineHeightUnit',
                        units        : [ 'px', 'em', 'rem', 'lh', 'rlh' ],
                        min          : 0,
                        max          : 200,
                        typo         : typo,
                        onChange     : update,
                        device       : device,
                        onDeviceChange: setDevice
                    } ),

                    // Letter Spacing (responsive)
                    el( ResponsiveSliderControl, {
                        label        : __( 'Letter Spacing', 'blockenberg' ),
                        prefix       : 'letterSpacing',
                        unitKey      : 'letterSpacingUnit',
                        units        : [ 'px', 'em', 'rem' ],
                        min          : -10,
                        max          : 50,
                        typo         : typo,
                        onChange     : update,
                        device       : device,
                        onDeviceChange: setDevice
                    } ),

                    // Word Spacing (responsive)
                    el( ResponsiveSliderControl, {
                        label        : __( 'Word Spacing', 'blockenberg' ),
                        prefix       : 'wordSpacing',
                        unitKey      : 'wordSpacingUnit',
                        units        : [ 'px', 'em', 'rem' ],
                        min          : -10,
                        max          : 50,
                        typo         : typo,
                        onChange     : update,
                        device       : device,
                        onDeviceChange: setDevice
                    } )

                ) // end bkbg-typo-panel
            ) // end Popover
        ); // end bkbg-typo-control
    }

    /* -------------------------------------------------------
       Utility: convert a typography object to CSS vars
       prefix  : CSS variable prefix, e.g. '--bkbg-ac-header-'

       Responsive properties (size, line-height, letter-spacing,
       word-spacing) are output as three device-specific vars:
         prefix + 'font-size-d'  (desktop)
         prefix + 'font-size-t'  (tablet)
         prefix + 'font-size-m'  (mobile)
       CSS then picks the right one via @media + var() fallback.

       Non-responsive properties (family, weight, transform,
       style, decoration) are output as a single var.
       ------------------------------------------------------- */
    function typoCssVars( typo, prefix ) {
        if ( ! typo ) return {};
        var vars = {};

        // --- Non-responsive ---
        if ( typo.family ) {
            vars[ prefix + 'font-family' ] = '\'' + typo.family + '\', sans-serif';
        }
        if ( typo.weight )     { vars[ prefix + 'font-weight' ]    = typo.weight; }
        if ( typo.transform )  { vars[ prefix + 'text-transform' ] = typo.transform; }
        if ( typo.style )      { vars[ prefix + 'font-style' ]     = typo.style; }
        if ( typo.decoration ) { vars[ prefix + 'text-decoration'] = typo.decoration; }

        // --- Responsive: size ---
        var sizeUnit = typo.sizeUnit || 'px';
        if ( typo.sizeDesktop !== '' && typo.sizeDesktop !== undefined && typo.sizeDesktop !== null ) {
            vars[ prefix + 'font-size-d' ] = typo.sizeDesktop + sizeUnit;
        }
        if ( typo.sizeTablet !== '' && typo.sizeTablet !== undefined && typo.sizeTablet !== null ) {
            vars[ prefix + 'font-size-t' ] = typo.sizeTablet + sizeUnit;
        }
        if ( typo.sizeMobile !== '' && typo.sizeMobile !== undefined && typo.sizeMobile !== null ) {
            vars[ prefix + 'font-size-m' ] = typo.sizeMobile + sizeUnit;
        }

        // --- Responsive: line-height ---
        var lhUnit = typo.lineHeightUnit || 'px';
        if ( typo.lineHeightDesktop !== '' && typo.lineHeightDesktop !== undefined && typo.lineHeightDesktop !== null ) {
            vars[ prefix + 'line-height-d' ] = typo.lineHeightDesktop + lhUnit;
        }
        if ( typo.lineHeightTablet !== '' && typo.lineHeightTablet !== undefined && typo.lineHeightTablet !== null ) {
            vars[ prefix + 'line-height-t' ] = typo.lineHeightTablet + lhUnit;
        }
        if ( typo.lineHeightMobile !== '' && typo.lineHeightMobile !== undefined && typo.lineHeightMobile !== null ) {
            vars[ prefix + 'line-height-m' ] = typo.lineHeightMobile + lhUnit;
        }

        // --- Responsive: letter-spacing ---
        var lsUnit = typo.letterSpacingUnit || 'px';
        if ( typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop !== undefined && typo.letterSpacingDesktop !== null ) {
            vars[ prefix + 'letter-spacing-d' ] = typo.letterSpacingDesktop + lsUnit;
            vars[ prefix + 'letter-spacing'   ] = typo.letterSpacingDesktop + lsUnit; // base alias so CSS always picks it up
        }
        if ( typo.letterSpacingTablet !== '' && typo.letterSpacingTablet !== undefined && typo.letterSpacingTablet !== null ) {
            vars[ prefix + 'letter-spacing-t' ] = typo.letterSpacingTablet + lsUnit;
        }
        if ( typo.letterSpacingMobile !== '' && typo.letterSpacingMobile !== undefined && typo.letterSpacingMobile !== null ) {
            vars[ prefix + 'letter-spacing-m' ] = typo.letterSpacingMobile + lsUnit;
        }

        // --- Responsive: word-spacing ---
        var wsUnit = typo.wordSpacingUnit || 'px';
        if ( typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop !== undefined && typo.wordSpacingDesktop !== null ) {
            vars[ prefix + 'word-spacing-d' ] = typo.wordSpacingDesktop + wsUnit;
            vars[ prefix + 'word-spacing'   ] = typo.wordSpacingDesktop + wsUnit; // base alias
        }
        if ( typo.wordSpacingTablet !== '' && typo.wordSpacingTablet !== undefined && typo.wordSpacingTablet !== null ) {
            vars[ prefix + 'word-spacing-t' ] = typo.wordSpacingTablet + wsUnit;
        }
        if ( typo.wordSpacingMobile !== '' && typo.wordSpacingMobile !== undefined && typo.wordSpacingMobile !== null ) {
            vars[ prefix + 'word-spacing-m' ] = typo.wordSpacingMobile + wsUnit;
        }

        return vars;
    }

    /* -------------------------------------------------------
       Expose globally
       ------------------------------------------------------- */
    window.bkbgTypographyControl = TypographyControl;
    window.bkbgTypoCssVars       = typoCssVars;
    window.bkbgLoadGoogleFont    = loadGoogleFont;

    /* -------------------------------------------------------
       Auto-load fonts on editor init
       Scans all blocks for *Typo attributes and loads their
       Google Fonts so they appear in the canvas immediately,
       not only after the inspector panel is opened.
       ------------------------------------------------------- */
    wp.domReady( function () {
        if ( ! wp.data || ! wp.data.select ) { return; }

        function loadFontsForBlocks( blockList ) {
            if ( ! blockList || ! blockList.length ) { return; }
            blockList.forEach( function ( block ) {
                if ( block.attributes ) {
                    Object.keys( block.attributes ).forEach( function ( key ) {
                        var isTypoKey = ( key.length > 4 && key.slice( -4 ) === 'Typo' ) || ( key.indexOf( 'typo' ) === 0 );
                        if ( isTypoKey ) {
                            var typo = block.attributes[ key ];
                            if ( typo && typo.family ) {
                                loadGoogleFont( typo.family );
                            }
                        }
                    } );
                }
                // Recurse into inner blocks
                if ( block.innerBlocks && block.innerBlocks.length ) {
                    loadFontsForBlocks( block.innerBlocks );
                }
            } );
        }

        function scanAllBlocks() {
            var blocks = wp.data.select( 'core/block-editor' ).getBlocks();
            loadFontsForBlocks( blocks );
        }

        // Run immediately (outer document fonts), then after delays
        // to catch the editor iframe at different stages of readiness.
        scanAllBlocks();
        setTimeout( scanAllBlocks, 800 );
        setTimeout( scanAllBlocks, 2500 );
    } );

} )();

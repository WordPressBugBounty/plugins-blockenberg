( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, SelectControl, ToggleControl, TextControl, Button } = window.wp.components;
    const { __ } = window.wp.i18n;
    function getTypographyControl() {
        return (window.bkbgTypographyControl || function () { return null; });
    }
    var _tv = (function () {
        var fn = window.bkbgTypoCssVars;
        return fn ? fn : function () { return {}; };
    })();

    // ── Helpers ───────────────────────────────────────────────────────────────
    function hexToRgb( hex ) {
        const r = parseInt( hex.slice( 1, 3 ), 16 );
        const g = parseInt( hex.slice( 3, 5 ), 16 );
        const b = parseInt( hex.slice( 5, 7 ), 16 );
        if ( isNaN( r ) ) return '';
        return `rgb(${ r }, ${ g }, ${ b })`;
    }

    function isLight( hex ) {
        const r = parseInt( hex.slice( 1, 3 ), 16 );
        const g = parseInt( hex.slice( 3, 5 ), 16 );
        const b = parseInt( hex.slice( 5, 7 ), 16 );
        return ( r * 299 + g * 587 + b * 114 ) / 1000 > 155;
    }

    // ── Swatch card ───────────────────────────────────────────────────────────
    function SwatchCard( props ) {
        const { swatch, a } = props;
        const hex = swatch.hex || '#6366f1';
        const onSwatch = isLight( hex ) ? '#000000' : '#ffffff';

        return el( 'div', {
            className: 'bkbg-cs-card',
            style: {
                background: a.cardBg,
                border: `1px solid ${ a.borderColor }`,
                borderRadius: a.borderRadius + 'px',
                overflow: 'hidden',
                boxSizing: 'border-box',
            }
        },
            // Color tile
            el( 'div', { className: 'bkbg-cs-tile', style: { height: a.swatchHeight + 'px', background: hex, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start', padding: '8px 10px' } },
                a.showTag && swatch.tag && el( 'span', { style: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: onSwatch, background: 'rgba(0,0,0,0.18)', borderRadius: 99 + 'px', padding: '2px 7px' } }, swatch.tag ),
            ),

            // Info section
            el( 'div', { className: 'bkbg-cs-info', style: { padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 4 } },
                a.showName && swatch.name && el( 'div', { className: 'bkbg-cs-name', style: { color: a.nameColor } }, swatch.name ),
                a.showHex && el( 'div', { className: 'bkbg-cs-hex', style: { color: a.metaColor } }, hex.toUpperCase() + ' · ' + hexToRgb( hex ) ),
                a.showUsage && swatch.usage && el( 'div', { className: 'bkbg-cs-usage', style: { color: a.metaColor, marginTop: 2 } }, swatch.usage ),
            ),
        );
    }

    function renderSwatches( a ) {
        return el( 'div', { className: 'bkbg-cs-grid', style: { display: 'grid', gridTemplateColumns: `repeat(${ a.columns }, 1fr)`, gap: 16 } },
            ( a.swatches || [] ).map( ( sw, i ) => el( SwatchCard, { key: i, swatch: sw, a } ) )
        );
    }

    function updSwatch( setAttributes, swatches, si, field, val ) {
        setAttributes( { swatches: swatches.map( ( s, i ) => i === si ? { ...s, [field]: val } : s ) } );
    }

    // ── Block ─────────────────────────────────────────────────────────────────
    registerBlockType( 'blockenberg/color-swatch', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            var bpStyle = { background: a.bgColor, boxSizing: 'border-box' };
            Object.assign(bpStyle, _tv(a.typoTitle, '--bkbg-cs-tt'));
            Object.assign(bpStyle, _tv(a.typoLabel, '--bkbg-cs-lb'));
            const blockProps = useBlockProps( { className: 'bkbg-cs-wrap', style: bpStyle } );

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl,   { label: __( 'Title', 'blockenberg' ),          value: a.title,    onChange: v => setAttributes( { title:    v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),     checked: a.showTitle,    onChange: v => setAttributes( { showTitle:    v } ) } ),
                        el( TextControl,   { label: __( 'Subtitle', 'blockenberg' ),       value: a.subtitle, onChange: v => setAttributes( { subtitle: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Subtitle', 'blockenberg' ),  checked: a.showSubtitle, onChange: v => setAttributes( { showSubtitle: v } ) } ),
                        el( RangeControl,  { label: __( 'Columns', 'blockenberg' ),        value: a.columns,  onChange: v => setAttributes( { columns:  v } ), min: 1, max: 8 } ),
                        el( ToggleControl, { label: __( 'Show Name', 'blockenberg' ),      checked: a.showName,  onChange: v => setAttributes( { showName:  v } ) } ),
                        el( ToggleControl, { label: __( 'Show HEX/RGB', 'blockenberg' ),   checked: a.showHex,   onChange: v => setAttributes( { showHex:   v } ) } ),
                        el( ToggleControl, { label: __( 'Show Usage', 'blockenberg' ),     checked: a.showUsage, onChange: v => setAttributes( { showUsage: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Tag', 'blockenberg' ),       checked: a.showTag,   onChange: v => setAttributes( { showTag:   v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Style', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Swatch Height', 'blockenberg' ), value: a.swatchHeight, onChange: v => setAttributes( { swatchHeight: v } ), min: 40, max: 200 } ),
                        el( RangeControl, { label: __( 'Border Radius', 'blockenberg' ), value: a.borderRadius, onChange: v => setAttributes( { borderRadius: v } ), min: 0, max: 28 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        (function () {
                            var TC = getTypographyControl();
                            return el( window.wp.element.Fragment, {},
                                el( TC, { label: __( 'Title', 'blockenberg' ), value: a.typoTitle || {}, onChange: function (v) { setAttributes({ typoTitle: v }); } }),
                                el( TC, { label: __( 'Label', 'blockenberg' ), value: a.typoLabel || {}, onChange: function (v) { setAttributes({ typoLabel: v }); } })
                            );
                        })()
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Wrapper BG', 'blockenberg' ),  value: a.bgColor,      onChange: v => setAttributes( { bgColor:      v || '#ffffff' } ) },
                            { label: __( 'Card BG', 'blockenberg' ),     value: a.cardBg,       onChange: v => setAttributes( { cardBg:       v || '#f9fafb' } ) },
                            { label: __( 'Border', 'blockenberg' ),      value: a.borderColor,  onChange: v => setAttributes( { borderColor:  v || '#e5e7eb' } ) },
                            { label: __( 'Heading', 'blockenberg' ),     value: a.headingColor, onChange: v => setAttributes( { headingColor: v || '#111827' } ) },
                            { label: __( 'Subtitle', 'blockenberg' ),    value: a.subtitleColor,onChange: v => setAttributes( { subtitleColor:v || '#6b7280' } ) },
                            { label: __( 'Name', 'blockenberg' ),        value: a.nameColor,    onChange: v => setAttributes( { nameColor:    v || '#111827' } ) },
                            { label: __( 'Meta/HEX', 'blockenberg' ),    value: a.metaColor,    onChange: v => setAttributes( { metaColor:    v || '#6b7280' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Swatches', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { swatches: [ ...( a.swatches || [] ), { name: 'New Color', hex: '#6366f1', tag: '', usage: '' } ] } ) }, __( '+ Add Swatch', 'blockenberg' ) ),
                        a.swatches.map( ( sw, si ) =>
                            el( PanelBody, { key: si, title: `${ sw.name } — ${ sw.hex }`, initialOpen: false },
                                el( TextControl, { label: __( 'Name', 'blockenberg' ),  value: sw.name,  onChange: v => updSwatch( setAttributes, a.swatches, si, 'name',  v ) } ),
                                el( 'div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 } },
                                    el( 'label', { style: { fontSize: 12 } }, __( 'Color', 'blockenberg' ) ),
                                    el( 'input', { type: 'color', value: sw.hex, style: { width: 40, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer' }, onChange: e => updSwatch( setAttributes, a.swatches, si, 'hex', e.target.value ) } ),
                                    el( TextControl, { value: sw.hex, onChange: v => updSwatch( setAttributes, a.swatches, si, 'hex', v ), style: { flex: 1, fontFamily: 'monospace' } } ),
                                ),
                                el( TextControl, { label: __( 'Tag', 'blockenberg' ),   value: sw.tag,   onChange: v => updSwatch( setAttributes, a.swatches, si, 'tag',   v ) } ),
                                el( TextControl, { label: __( 'Usage', 'blockenberg' ), value: sw.usage, onChange: v => updSwatch( setAttributes, a.swatches, si, 'usage', v ) } ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { swatches: a.swatches.filter( ( _, x ) => x !== si ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                el( 'div', { style: { marginBottom: 24 } },
                    a.showTitle    && a.title    && el( 'h2', { className: 'bkbg-cs-title', style: { color: a.headingColor, margin: '0 0 6px' } }, a.title ),
                    a.showSubtitle && a.subtitle && el( 'p',  { className: 'bkbg-cs-subtitle', style: { color: a.subtitleColor, margin: 0 } }, a.subtitle ),
                ),

                renderSwatches( a ),
            );
        },

        save: function ( { attributes: a } ) {
            var bpStyle = { background: a.bgColor, boxSizing: 'border-box' };
            Object.assign(bpStyle, _tv(a.typoTitle, '--bkbg-cs-tt'));
            Object.assign(bpStyle, _tv(a.typoLabel, '--bkbg-cs-lb'));
            const blockProps = useBlockProps.save( { className: 'bkbg-cs-wrap', style: bpStyle } );
            return el( 'div', blockProps,
                el( 'div', { style: { marginBottom: 24 } },
                    a.showTitle    && a.title    ? el( 'h2', { className: 'bkbg-cs-title', style: { color: a.headingColor, margin: '0 0 6px' } }, a.title )    : null,
                    a.showSubtitle && a.subtitle ? el( 'p',  { className: 'bkbg-cs-subtitle', style: { color: a.subtitleColor, margin: 0 } }, a.subtitle ) : null,
                ),
                renderSwatches( a ),
            );
        },
    } );
}() );

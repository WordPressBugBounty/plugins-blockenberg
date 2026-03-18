( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, SelectControl, Button } = window.wp.components;
    const { __ } = window.wp.i18n;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    // ── Formatters ────────────────────────────────────────────────────────────
    function fmtValue( v, fmt, unit ) {
        const n = parseFloat( v ) || 0;
        let str;
        if ( fmt === 'currency' ) {
            str = unit + n.toLocaleString( 'en-US', { maximumFractionDigits: 0 } );
        } else if ( fmt === 'percent' ) {
            str = n.toFixed( 1 ) + '%';
        } else {
            str = n.toLocaleString( 'en-US', { maximumFractionDigits: 2 } );
            if ( unit ) str += ' ' + unit;
        }
        return str;
    }

    function changePct( before, after ) {
        const b = parseFloat( before ) || 0;
        const a = parseFloat( after )  || 0;
        if ( b === 0 ) return null;
        return ( ( a - b ) / Math.abs( b ) ) * 100;
    }

    function barFraction( before, after ) {
        const b = Math.abs( parseFloat( before ) ) || 0;
        const a = Math.abs( parseFloat( after )  ) || 0;
        const mx = Math.max( b, a ) || 1;
        return { bFrac: b / mx, aFrac: a / mx };
    }

    // ── One card ─────────────────────────────────────────────────────────────
    function MetricCard( props ) {
        const { m, a, inlineTypo } = props;
        const pct    = changePct( m.valueBefore, m.valueAfter );
        const isPos  = m.higherIsBetter ? pct >= 0 : pct <= 0;
        const isNeg  = ! isPos;
        const isNull = pct === null;
        const chgColor = isNull ? a.neutralColor : isPos ? a.posColor : a.negColor;
        const arrow  = pct === null ? '↔' : pct > 0 ? '▲' : pct < 0 ? '▼' : '↔';
        const { bFrac, aFrac } = barFraction( m.valueBefore, m.valueAfter );
        const cardStyle = {
            background: a.cardBg,
            borderRadius: a.borderRadius + 'px',
            padding: a.cardPadding + 'px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
        };
        var labelSt = { color: a.labelColor };
        if (inlineTypo) { labelSt.fontSize = (a.labelFontSize || 13); labelSt.fontWeight = 600; labelSt.lineHeight = (a.lineHeight || 1.3); labelSt.textTransform = 'uppercase'; labelSt.letterSpacing = '0.05em'; }
        var valueSt = { color: a.textColor };
        if (inlineTypo) { valueSt.fontSize = (a.valueFontSize || 32); valueSt.fontWeight = (a.titleFontWeight || 700); valueSt.lineHeight = (a.lineHeight || 1.3); }

        return el( 'div', { className: 'bkbg-mc-card', style: cardStyle },
            // Label
            el( 'div', { className: 'bkbg-mc-label', style: labelSt }, m.label ),

            // Main value (after)
            el( 'div', { className: 'bkbg-mc-value', style: valueSt },
                fmtValue( m.valueAfter, m.format, m.unit )
            ),

            // Change row
            a.showChange && el( 'div', { className: 'bkbg-mc-change', style: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 } },
                a.showArrows && el( 'span', { style: { color: chgColor, fontWeight: 700, fontSize: 15 } }, arrow ),
                el( 'span', { style: { color: chgColor, fontWeight: 600 } }, pct !== null ? Math.abs( pct ).toFixed( 1 ) + '%' : '—' ),
                el( 'span', { style: { color: a.labelColor, fontSize: 11 } }, `vs ${ a.beforeLabel }: ${ fmtValue( m.valueBefore, m.format, m.unit ) }` ),
            ),

            // Mini bar
            a.showBar && el( 'div', { className: 'bkbg-mc-bars', style: { marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 } },
                el( 'div', { style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: a.labelColor } },
                    el( 'span', { style: { width: 24, textAlign: 'right', flexShrink: 0 } }, a.beforeLabel ),
                    el( 'div', { style: { flex: 1, height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' } },
                        el( 'div', { style: { width: ( bFrac * 100 ) + '%', height: '100%', background: a.neutralColor, borderRadius: 3 } } )
                    ),
                ),
                el( 'div', { style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: a.labelColor } },
                    el( 'span', { style: { width: 24, textAlign: 'right', flexShrink: 0 } }, a.afterLabel ),
                    el( 'div', { style: { flex: 1, height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' } },
                        el( 'div', { style: { width: ( aFrac * 100 ) + '%', height: '100%', background: chgColor, borderRadius: 3 } } )
                    ),
                ),
            ),
        );
    }

    // ── Grid renderer ─────────────────────────────────────────────────────────
    function renderGrid( a, opts ) {
        opts = opts || {};
        const metrics = a.metrics || [];
        return el( 'div', {
            className: 'bkbg-mc-grid',
            style: {
                display: 'grid',
                gridTemplateColumns: `repeat(${ a.columns }, 1fr)`,
                gap: '16px',
            }
        }, ...metrics.map( ( m, i ) => el( MetricCard, { key: i, m, a, inlineTypo: opts.inlineTypo } ) ) );
    }

    function updMetric( setAttributes, metrics, mi, field, val ) {
        setAttributes( { metrics: metrics.map( ( m, i ) => i === mi ? { ...m, [field]: val } : m ) } );
    }

    registerBlockType( 'blockenberg/metric-comparison', {
        deprecated: [{
            save: function ( { attributes: a } ) {
                var blockProps = useBlockProps.save( { className: 'bkbg-mc-wrap' } );
                return el( 'div', blockProps,
                    el( 'div', { className: 'bkbg-mc-inner', style: { background: a.bgColor, padding: '16px', borderRadius: 8, boxSizing: 'border-box' } },
                        a.showTitle && a.title ? el( 'h3', { className: 'bkbg-mc-title', style: { color: a.titleColor, margin: '0 0 16px', fontSize: (a.titleFontSize || 20) + 'px', fontWeight: (a.titleFontWeight || 700) } }, a.title ) : null,
                        renderGrid( a, { inlineTypo: true } ),
                    ),
                );
            },
        }],
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            var blockProps = useBlockProps((function () {
                var _tvf = getTypoCssVars();
                var s = {};
                Object.assign(s, _tvf(a.titleTypo, '--bkbg-mc-tt-'));
                Object.assign(s, _tvf(a.labelTypo, '--bkbg-mc-lb-'));
                Object.assign(s, _tvf(a.valueTypo, '--bkbg-mc-vl-'));
                return { className: 'bkbg-mc-wrap', style: s };
            })());

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl,   { label: __( 'Title', 'blockenberg' ),        value: a.title,       onChange: v => setAttributes( { title:       v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),   checked: a.showTitle, onChange: v => setAttributes( { showTitle:   v } ) } ),
                        el( TextControl,   { label: __( 'Before Label', 'blockenberg' ), value: a.beforeLabel, onChange: v => setAttributes( { beforeLabel: v } ) } ),
                        el( TextControl,   { label: __( 'After Label', 'blockenberg' ),  value: a.afterLabel,  onChange: v => setAttributes( { afterLabel:  v } ) } ),
                        el( RangeControl, { label: __( 'Columns', 'blockenberg' ), value: a.columns, onChange: v => setAttributes( { columns: v } ), min: 1, max: 6 } ),
                        el( ToggleControl, { label: __( 'Show Change', 'blockenberg' ),  checked: a.showChange, onChange: v => setAttributes( { showChange: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Arrows', 'blockenberg' ),  checked: a.showArrows, onChange: v => setAttributes( { showArrows: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Bar', 'blockenberg' ),     checked: a.showBar,    onChange: v => setAttributes( { showBar:    v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Card Style', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Border Radius', 'blockenberg' ), value: a.borderRadius, onChange: v => setAttributes( { borderRadius: v } ), min: 0, max: 30 } ),
                        el( RangeControl, { label: __( 'Padding', 'blockenberg' ),       value: a.cardPadding,  onChange: v => setAttributes( { cardPadding:  v } ), min: 8, max: 48 } ),
                    ),

                    el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Wrapper BG', 'blockenberg' ),  value: a.bgColor,      onChange: v => setAttributes( { bgColor:      v || '#ffffff' } ) },
                            { label: __( 'Card BG', 'blockenberg' ),     value: a.cardBg,       onChange: v => setAttributes( { cardBg:       v || '#f9fafb' } ) },
                            { label: __( 'Positive', 'blockenberg' ),    value: a.posColor,     onChange: v => setAttributes( { posColor:     v || '#10b981' } ) },
                            { label: __( 'Negative', 'blockenberg' ),    value: a.negColor,     onChange: v => setAttributes( { negColor:     v || '#ef4444' } ) },
                            { label: __( 'Neutral', 'blockenberg' ),     value: a.neutralColor, onChange: v => setAttributes( { neutralColor: v || '#6b7280' } ) },
                            { label: __( 'Title', 'blockenberg' ),       value: a.titleColor,   onChange: v => setAttributes( { titleColor:   v || '#111827' } ) },
                            { label: __( 'Value Text', 'blockenberg' ),  value: a.textColor,    onChange: v => setAttributes( { textColor:    v || '#111827' } ) },
                            { label: __( 'Labels', 'blockenberg' ),      value: a.labelColor,   onChange: v => setAttributes( { labelColor:   v || '#6b7280' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el( getTypoControl(), { label: __( 'Title', 'blockenberg' ), value: a.titleTypo, onChange: function (v) { setAttributes({ titleTypo: v }); } }),
                        el( getTypoControl(), { label: __( 'Label', 'blockenberg' ), value: a.labelTypo, onChange: function (v) { setAttributes({ labelTypo: v }); } }),
                        el( getTypoControl(), { label: __( 'Value', 'blockenberg' ), value: a.valueTypo, onChange: function (v) { setAttributes({ valueTypo: v }); } })
                    ),

                    el( PanelBody, { title: __( 'Metrics', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { metrics: [ ...( a.metrics || [] ), { label: 'New Metric', valueBefore: 100, valueAfter: 120, unit: '', format: 'number', higherIsBetter: true } ] } ) }, __( '+ Add Metric', 'blockenberg' ) ),
                        a.metrics.map( ( m, mi ) =>
                            el( PanelBody, { key: mi, title: m.label, initialOpen: false },
                                el( TextControl,   { label: __( 'Label', 'blockenberg' ),        value: m.label,       onChange: v => updMetric( setAttributes, a.metrics, mi, 'label',       v ) } ),
                                el( TextControl,   { label: `${ a.beforeLabel } value`, value: String( m.valueBefore ), type: 'number', onChange: v => updMetric( setAttributes, a.metrics, mi, 'valueBefore', parseFloat( v ) || 0 ) } ),
                                el( TextControl,   { label: `${ a.afterLabel } value`,  value: String( m.valueAfter  ), type: 'number', onChange: v => updMetric( setAttributes, a.metrics, mi, 'valueAfter',  parseFloat( v ) || 0 ) } ),
                                el( TextControl,   { label: __( 'Unit', 'blockenberg' ),          value: m.unit,        onChange: v => updMetric( setAttributes, a.metrics, mi, 'unit',        v ) } ),
                                el( SelectControl, {
                                    label: __( 'Format', 'blockenberg' ),
                                    value: m.format,
                                    options: [
                                        { label: __( 'Number', 'blockenberg' ), value: 'number' },
                                        { label: __( 'Currency', 'blockenberg' ), value: 'currency' },
                                        { label: __( 'Percent', 'blockenberg' ), value: 'percent' },
                                    ],
                                    onChange: v => updMetric( setAttributes, a.metrics, mi, 'format', v ),
                                } ),
                                el( ToggleControl, { label: __( 'Higher is better', 'blockenberg' ), checked: m.higherIsBetter, onChange: v => updMetric( setAttributes, a.metrics, mi, 'higherIsBetter', v ) } ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { metrics: a.metrics.filter( ( _, x ) => x !== mi ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                el( 'div', { className: 'bkbg-mc-inner', style: { background: a.bgColor, padding: '16px', borderRadius: 8, boxSizing: 'border-box' } },
                    a.showTitle && a.title && el( 'h3', { className: 'bkbg-mc-title', style: { color: a.titleColor, margin: '0 0 16px' } }, a.title ),
                    renderGrid( a ),
                ),
            );
        },

        save: function ( { attributes: a } ) {
            var blockProps = useBlockProps.save((function () {
                var _tvf = getTypoCssVars();
                var s = {};
                Object.assign(s, _tvf(a.titleTypo, '--bkbg-mc-tt-'));
                Object.assign(s, _tvf(a.labelTypo, '--bkbg-mc-lb-'));
                Object.assign(s, _tvf(a.valueTypo, '--bkbg-mc-vl-'));
                return { className: 'bkbg-mc-wrap', style: s };
            })());
            return el( 'div', blockProps,
                el( 'div', { className: 'bkbg-mc-inner', style: { background: a.bgColor, padding: '16px', borderRadius: 8, boxSizing: 'border-box' } },
                    a.showTitle && a.title ? el( 'h3', { className: 'bkbg-mc-title', style: { color: a.titleColor, margin: '0 0 16px' } }, a.title ) : null,
                    renderGrid( a ),
                ),
            );
        },
    } );
}() );

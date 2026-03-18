( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, Button } = window.wp.components;
    const { __ } = window.wp.i18n;

    var _dbTC, _dbTV;
    function _tc() { return _dbTC || (_dbTC = window.bkbgTypographyControl); }
    function _tv(t, p) { return (_dbTV || (_dbTV = window.bkbgTypoCssVars)) ? _dbTV(t, p) : {}; }

    // ── Renderer ──────────────────────────────────────────────────────────────
    function renderDumbbell( a ) {
        const items = a.items || [];
        const W  = a.svgWidth;
        const RH = a.rowHeight;
        const PT = a.padTop;
        const PL = a.padLeft;
        const PR = a.padRight;
        const DR = a.dotRadius;

        const allVals = items.flatMap( it => [ it.a || 0, it.b || 0 ] );
        const minVal  = Math.min( 0, ...allVals );
        const maxVal  = Math.max( ...allVals, 1 );
        const chartW  = W - PL - PR;
        const legH    = a.showLegend ? 36 : 0;
        const H       = PT + items.length * RH + legH + 20;

        function xScale( v ) {
            return PL + ( ( v - minVal ) / ( maxVal - minVal ) ) * chartW;
        }

        const svgEls = [];
        svgEls.push( el( 'rect', { key: 'bg', x: 0, y: 0, width: W, height: H, fill: a.bgColor || '#ffffff', rx: 8 } ) );

        // Grid lines & tick labels
        if ( a.showGridLines ) {
            const ticks = 5;
            for ( let i = 0; i <= ticks; i++ ) {
                const v  = minVal + ( maxVal - minVal ) * i / ticks;
                const gx = xScale( v );
                svgEls.push( el( 'line', { key: 'gl' + i, x1: gx, y1: PT - 8, x2: gx, y2: H - legH - 10, stroke: a.gridColor || '#f3f4f6', strokeWidth: 1 } ) );
                svgEls.push( el( 'text', { key: 'gt' + i, x: gx, y: PT - 14, textAnchor: 'middle', fill: '#9ca3af', fontSize: 10, fontFamily: 'inherit' }, String( parseFloat( v.toFixed( 1 ) ) ) ) );
            }
        }

        // Rows
        items.forEach( ( item, i ) => {
            const cy  = PT + i * RH + RH / 2;
            const xA  = xScale( item.a || 0 );
            const xB  = xScale( item.b || 0 );
            const x0  = Math.min( xA, xB );
            const x1  = Math.max( xA, xB );

            // Connector line
            svgEls.push( el( 'line', { key: 'con' + i, x1: x0, y1: cy, x2: x1, y2: cy, stroke: a.connectorColor || '#e5e7eb', strokeWidth: 4, strokeLinecap: 'round' } ) );

            // Dot A (before)
            svgEls.push( el( 'circle', { key: 'dA' + i, cx: xA, cy, r: DR, fill: a.colorA || '#9ca3af' } ) );
            // Dot B (after)
            svgEls.push( el( 'circle', { key: 'dB' + i, cx: xB, cy, r: DR, fill: a.colorB || '#4f46e5' } ) );

            // Value labels on dots
            if ( a.showValues ) {
                const fmtA = String( parseFloat( ( item.a || 0 ).toFixed( 1 ) ) );
                const fmtB = String( parseFloat( ( item.b || 0 ).toFixed( 1 ) ) );
                svgEls.push( el( 'text', { key: 'vA' + i, x: xA, y: cy, textAnchor: 'middle', dominantBaseline: 'middle', fill: '#ffffff', fontSize: a.valueFontSize, fontWeight: a.valueFontWeight || '700', fontFamily: 'inherit' }, fmtA ) );
                svgEls.push( el( 'text', { key: 'vB' + i, x: xB, y: cy, textAnchor: 'middle', dominantBaseline: 'middle', fill: '#ffffff', fontSize: a.valueFontSize, fontWeight: a.valueFontWeight || '700', fontFamily: 'inherit' }, fmtB ) );
            }

            // Row label
            svgEls.push( el( 'text', { key: 'lbl' + i, x: PL - 10, y: cy, textAnchor: 'end', dominantBaseline: 'middle', fill: a.labelColor || '#374151', fontSize: a.labelFontSize, fontWeight: a.labelFontWeight || '400', fontFamily: 'inherit' }, item.label || '' ) );
        } );

        // Legend
        if ( a.showLegend ) {
            const ly   = H - legH + 8;
            const lcx  = W / 2;
            svgEls.push( el( 'circle', { key: 'lgA', cx: lcx - 60, cy: ly + 8,  r: 8,  fill: a.colorA } ) );
            svgEls.push( el( 'text',   { key: 'ltA', x:  lcx - 48, y:  ly + 8,  dominantBaseline: 'middle', fill: a.labelColor, fontSize: a.legendFontSize || 12, fontWeight: a.legendFontWeight || '400', fontFamily: 'inherit' }, a.labelA || 'Before' ) );
            svgEls.push( el( 'circle', { key: 'lgB', cx: lcx + 30, cy: ly + 8,  r: 8,  fill: a.colorB } ) );
            svgEls.push( el( 'text',   { key: 'ltB', x:  lcx + 42, y:  ly + 8,  dominantBaseline: 'middle', fill: a.labelColor, fontSize: a.legendFontSize || 12, fontWeight: a.legendFontWeight || '400', fontFamily: 'inherit' }, a.labelB || 'After' ) );
        }

        return el( 'svg', { viewBox: `0 0 ${ W } ${ H }`, width: '100%', style: { display: 'block', maxWidth: W + 'px', margin: '0 auto' } }, ...svgEls );
    }

    function updItem( setAttributes, items, idx, field, val ) {
        setAttributes( { items: items.map( ( it, i ) => i === idx ? { ...it, [field]: val } : it ) } );
    }

    registerBlockType( 'blockenberg/dumbbell-chart', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps( { className: 'bkbg-dumbbell-wrap', style: Object.assign(
                { '--bkbg-db-ttl-fs': (a.titleFontSize || 20) + 'px' },
                _tv(a.typoTitle || {}, '--bkbg-db-ttl-')
            ) } );

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Chart Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl, { label: __( 'Title', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),      checked: a.showTitle,     onChange: v => setAttributes( { showTitle: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Values', 'blockenberg' ),     checked: a.showValues,    onChange: v => setAttributes( { showValues: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Grid Lines', 'blockenberg' ), checked: a.showGridLines, onChange: v => setAttributes( { showGridLines: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Legend', 'blockenberg' ),     checked: a.showLegend,    onChange: v => setAttributes( { showLegend: v } ) } ),
                        el( TextControl, { label: __( 'Label A (Before)', 'blockenberg' ),  value: a.labelA, onChange: v => setAttributes( { labelA: v } ) } ),
                        el( TextControl, { label: __( 'Label B (After)', 'blockenberg' ),   value: a.labelB, onChange: v => setAttributes( { labelB: v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Layout', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Canvas Width', 'blockenberg' ),    value: a.svgWidth,      onChange: v => setAttributes( { svgWidth: v } ),      min: 300, max: 1200, step: 20 } ),
                        el( RangeControl, { label: __( 'Row Height', 'blockenberg' ),      value: a.rowHeight,     onChange: v => setAttributes( { rowHeight: v } ),     min: 28, max: 100 } ),
                        el( RangeControl, { label: __( 'Label Column Width', 'blockenberg' ), value: a.padLeft,    onChange: v => setAttributes( { padLeft: v } ),       min: 60, max: 320 } ),
                        el( RangeControl, { label: __( 'Dot Radius', 'blockenberg' ),      value: a.dotRadius,     onChange: v => setAttributes( { dotRadius: v } ),     min: 5, max: 28 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        _tc() && el(_tc(), { label: __('Title'), typo: a.typoTitle || {}, onChange: v => setAttributes( { typoTitle: v } ), defaultSize: a.titleFontSize || 20 }),
                        el( RangeControl, { label: __( 'Label Font Size', 'blockenberg' ), value: a.labelFontSize, onChange: v => setAttributes( { labelFontSize: v } ), min: 9, max: 22 } ),
                        el( wp.components.SelectControl, { label: __( 'Label Font Weight', 'blockenberg' ), value: a.labelFontWeight || '400',
                            options: [{label:'Normal (400)',value:'400'},{label:'Medium (500)',value:'500'},{label:'Bold (700)',value:'700'}],
                            onChange: v => setAttributes( { labelFontWeight: v } ) } ),
                        el( RangeControl, { label: __( 'Value Font Size', 'blockenberg' ), value: a.valueFontSize, onChange: v => setAttributes( { valueFontSize: v } ), min: 7, max: 16 } ),
                        el( wp.components.SelectControl, { label: __( 'Value Font Weight', 'blockenberg' ), value: a.valueFontWeight || '700',
                            options: [{label:'Normal (400)',value:'400'},{label:'Bold (700)',value:'700'},{label:'Extra-Bold (800)',value:'800'}],
                            onChange: v => setAttributes( { valueFontWeight: v } ) } ),
                        el( RangeControl, { label: __( 'Legend Font Size', 'blockenberg' ), value: a.legendFontSize, onChange: v => setAttributes( { legendFontSize: v } ), min: 9, max: 18, __nextHasNoMarginBottom: true } ),
                        el( wp.components.SelectControl, { label: __( 'Legend Font Weight', 'blockenberg' ), value: a.legendFontWeight || '400',
                            options: [{label:'Normal (400)',value:'400'},{label:'Medium (500)',value:'500'},{label:'Bold (700)',value:'700'}],
                            onChange: v => setAttributes( { legendFontWeight: v } ) } )
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Dot A Color', 'blockenberg' ),      value: a.colorA,         onChange: v => setAttributes( { colorA:         v || '#9ca3af' } ) },
                            { label: __( 'Dot B Color', 'blockenberg' ),      value: a.colorB,         onChange: v => setAttributes( { colorB:         v || '#4f46e5' } ) },
                            { label: __( 'Connector Color', 'blockenberg' ),  value: a.connectorColor, onChange: v => setAttributes( { connectorColor: v || '#e5e7eb' } ) },
                            { label: __( 'Background', 'blockenberg' ),       value: a.bgColor,        onChange: v => setAttributes( { bgColor:        v || '#ffffff' } ) },
                            { label: __( 'Grid Lines', 'blockenberg' ),       value: a.gridColor,      onChange: v => setAttributes( { gridColor:      v || '#f3f4f6' } ) },
                            { label: __( 'Title Color', 'blockenberg' ),      value: a.titleColor,     onChange: v => setAttributes( { titleColor:     v || '#111827' } ) },
                            { label: __( 'Label Color', 'blockenberg' ),      value: a.labelColor,     onChange: v => setAttributes( { labelColor:     v || '#374151' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Data', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { items: [ ...a.items, { label: 'New Item', a: 30, b: 60 } ] } ) }, __( '+ Add Row', 'blockenberg' ) ),
                        a.items.map( ( item, i ) =>
                            el( PanelBody, { key: i, title: item.label || `Row ${ i + 1 }`, initialOpen: false },
                                el( TextControl, { label: __( 'Label', 'blockenberg' ),                   value: item.label, onChange: v => updItem( setAttributes, a.items, i, 'label', v ) } ),
                                el( RangeControl, { label: `${ a.labelA || 'A' } Value`, value: item.a, onChange: v => updItem( setAttributes, a.items, i, 'a', v ), min: -1000, max: 10000, step: 0.1 } ),
                                el( RangeControl, { label: `${ a.labelB || 'B' } Value`, value: item.b, onChange: v => updItem( setAttributes, a.items, i, 'b', v ), min: -1000, max: 10000, step: 0.1 } ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { items: a.items.filter( ( _, x ) => x !== i ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-db-title', style: { color: a.titleColor } }, a.title ),
                el( 'div', { className: 'bkbg-db-svg' }, renderDumbbell( a ) ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save( { className: 'bkbg-dumbbell-wrap', style: Object.assign(
                { '--bkbg-db-ttl-fs': (a.titleFontSize || 20) + 'px' },
                _tv(a.typoTitle || {}, '--bkbg-db-ttl-')
            ) } );
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-db-title', style: { color: a.titleColor } }, a.title ) : null,
                el( 'div', { className: 'bkbg-db-svg' }, renderDumbbell( a ) ),
            );
        },
    } );
}() );

( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, Button } = window.wp.components;
    const { __ } = window.wp.i18n;

    var _tc, _tvf;
    Object.defineProperty(window, '_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, key, attrs, setA) { return _tc(label, key, attrs, setA); }
    function getTypoCssVars(attrs) {
        var v = {};
        _tvf(v, 'titleTypo', attrs, '--bkwfb-tt-');
        return v;
    }

    // ── Renderer ──────────────────────────────────────────────────────────────
    function renderWaterfall( a ) {
        const items = a.items || [];
        const W  = a.svgWidth;
        const H  = a.svgHeight;
        const PT = a.padTop;
        const PL = a.padLeft;
        const PR = a.padRight;
        const PB = a.padBottom;
        const BW = a.barWidth;
        const chartW = W - PL - PR;
        const chartH = H - PT - PB;
        const n = items.length;
        if ( ! n ) return el( 'svg', { viewBox: `0 0 ${ W } ${ H }`, width: '100%' } );

        // Compute running totals
        const barData = [];
        let running = 0;
        items.forEach( ( it, i ) => {
            if ( it.isTotal ) {
                // auto-calc for last total, or use explicit value if non-zero
                const total = ( it.value !== 0 ) ? it.value : running;
                barData.push( { ...it, base: 0, end: total, displayVal: total } );
                running = total;
            } else {
                const base = running;
                const end  = running + it.value;
                barData.push( { ...it, base, end, displayVal: it.value } );
                running = end;
            }
        } );

        // Y range
        const allVals = barData.flatMap( b => [ b.base, b.end ] );
        const minV = Math.min( 0, ...allVals );
        const maxV = Math.max( 0, ...allVals );
        const range = ( maxV - minV ) || 1;
        const pad   = range * 0.1;

        function yPos( v ) { return PT + chartH - ( ( v - ( minV - pad ) ) / ( range + pad * 2 ) ) * chartH; }
        const y0 = yPos( 0 );

        // X positions (bar centres)
        const step = chartW / n;
        function xCentre( i ) { return PL + i * step + step / 2; }

        const svgEls = [];
        svgEls.push( el( 'rect', { key: 'bg', x: 0, y: 0, width: W, height: H, fill: a.bgColor || '#ffffff', rx: 8 } ) );

        // Grid lines
        if ( a.showGridLines ) {
            const ticks = 5;
            for ( let t = 0; t <= ticks; t++ ) {
                const gy = PT + ( t / ticks ) * chartH;
                svgEls.push( el( 'line', { key: `gl${ t }`, x1: PL, y1: gy, x2: W - PR, y2: gy, stroke: a.gridColor || '#f3f4f6', strokeWidth: 1 } ) );
                const yLbl = Math.round( ( minV - pad ) + ( 1 - t / ticks ) * ( range + pad * 2 ) );
                svgEls.push( el( 'text', { key: `gy${ t }`, x: PL - 6, y: gy, textAnchor: 'end', dominantBaseline: 'middle', fill: a.labelColor, fontSize: a.labelFontSize - 1, fontFamily: 'inherit' }, yLbl ) );
            }
        }

        // Zero baseline
        svgEls.push( el( 'line', { key: 'zero', x1: PL, y1: y0, x2: W - PR, y2: y0, stroke: a.labelColor, strokeWidth: 1, strokeOpacity: 0.4 } ) );

        // Bars + connectors
        barData.forEach( ( b, i ) => {
            const cx   = xCentre( i );
            const bx   = cx - BW / 2;
            const yTop = Math.min( yPos( b.base ), yPos( b.end ) );
            const bH   = Math.abs( yPos( b.end ) - yPos( b.base ) ) || 2;

            const color = b.isTotal
                ? ( a.totalColor || '#6366f1' )
                : b.value >= 0
                    ? ( a.posColor || '#10b981' )
                    : ( a.negColor || '#ef4444' );

            svgEls.push( el( 'rect', { key: `bar${ i }`, x: bx, y: yTop, width: BW, height: bH, fill: color, rx: 3 } ) );

            // Connector to next bar
            if ( a.showConnectors && i < n - 1 ) {
                const connY = yPos( b.end );
                svgEls.push( el( 'line', { key: `con${ i }`, x1: bx + BW, y1: connY, x2: xCentre( i + 1 ) - BW / 2, y2: connY, stroke: a.connectorColor || '#d1d5db', strokeWidth: 1.5, strokeDasharray: '4 3' } ) );
            }

            // Value label
            if ( a.showValues ) {
                const sign = b.displayVal > 0 ? '+' : '';
                const lbl  = b.isTotal ? String( b.displayVal ) : `${ sign }${ b.displayVal }`;
                svgEls.push( el( 'text', { key: `vl${ i }`, x: cx, y: yTop - 5, textAnchor: 'middle', fill: color, fontSize: a.valueFontSize, fontWeight: 700, fontFamily: 'inherit' }, lbl ) );
            }

            // X label (rotated if needed)
            if ( a.labelRotate ) {
                svgEls.push( el( 'text', { key: `xl${ i }`, x: cx, y: H - PB + 14, textAnchor: 'end', fill: a.labelColor, fontSize: a.labelFontSize, fontFamily: 'inherit', transform: `rotate(-40,${ cx },${ H - PB + 14 })` }, b.label ) );
            } else {
                svgEls.push( el( 'text', { key: `xl${ i }`, x: cx, y: H - PB + 16, textAnchor: 'middle', fill: a.labelColor, fontSize: a.labelFontSize, fontFamily: 'inherit' }, b.label ) );
            }
        } );

        return el( 'svg', { viewBox: `0 0 ${ W } ${ H }`, width: '100%', style: { display: 'block', maxWidth: W + 'px', margin: '0 auto' } }, ...svgEls );
    }

    function updItem( setAttributes, items, ii, field, val ) {
        setAttributes( { items: items.map( ( it, i ) => i === ii ? { ...it, [field]: val } : it ) } );
    }

    registerBlockType( 'blockenberg/waterfall-bar', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps( { className: 'bkbg-waterfall-wrap', style: getTypoCssVars( a ) } );

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Chart Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl,  { label: __( 'Title', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),      checked: a.showTitle,    onChange: v => setAttributes( { showTitle: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Values', 'blockenberg' ),     checked: a.showValues,   onChange: v => setAttributes( { showValues: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Grid Lines', 'blockenberg' ), checked: a.showGridLines, onChange: v => setAttributes( { showGridLines: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Connectors', 'blockenberg' ), checked: a.showConnectors, onChange: v => setAttributes( { showConnectors: v } ) } ),
                        el( ToggleControl, { label: __( 'Rotate X Labels', 'blockenberg' ), checked: a.labelRotate,  onChange: v => setAttributes( { labelRotate: v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Layout', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Canvas Width', 'blockenberg' ),  value: a.svgWidth,  onChange: v => setAttributes( { svgWidth: v } ),  min: 300, max: 1200, step: 20 } ),
                        el( RangeControl, { label: __( 'Canvas Height', 'blockenberg' ), value: a.svgHeight, onChange: v => setAttributes( { svgHeight: v } ), min: 200, max: 800 } ),
                        el( RangeControl, { label: __( 'Bar Width', 'blockenberg' ),     value: a.barWidth,  onChange: v => setAttributes( { barWidth: v } ),  min: 10, max: 100 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Label Font Size', 'blockenberg' ), value: a.labelFontSize, onChange: v => setAttributes( { labelFontSize: v } ), min: 8, max: 20 } ),
                        el( RangeControl, { label: __( 'Value Font Size', 'blockenberg' ),  value: a.valueFontSize, onChange: v => setAttributes( { valueFontSize: v } ),  min: 7, max: 18 } ),
                        getTypoControl( __( 'Title', 'blockenberg' ), 'titleTypo', a, setAttributes ),
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Positive bars',   'blockenberg' ), value: a.posColor,       onChange: v => setAttributes( { posColor:       v || '#10b981' } ) },
                            { label: __( 'Negative bars',   'blockenberg' ), value: a.negColor,       onChange: v => setAttributes( { negColor:       v || '#ef4444' } ) },
                            { label: __( 'Total bars',      'blockenberg' ), value: a.totalColor,     onChange: v => setAttributes( { totalColor:     v || '#6366f1' } ) },
                            { label: __( 'Connector lines', 'blockenberg' ), value: a.connectorColor, onChange: v => setAttributes( { connectorColor: v || '#d1d5db' } ) },
                            { label: __( 'Background',      'blockenberg' ), value: a.bgColor,        onChange: v => setAttributes( { bgColor:        v || '#ffffff' } ) },
                            { label: __( 'Title',           'blockenberg' ), value: a.titleColor,     onChange: v => setAttributes( { titleColor:     v || '#111827' } ) },
                            { label: __( 'Labels',          'blockenberg' ), value: a.labelColor,     onChange: v => setAttributes( { labelColor:     v || '#374151' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Items', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { items: [ ...a.items, { label: 'New Item', value: 100, isTotal: false } ] } ) }, __( '+ Add Item', 'blockenberg' ) ),
                        a.items.map( ( it, ii ) =>
                            el( PanelBody, { key: ii, title: it.label || `Item ${ ii + 1 }`, initialOpen: false },
                                el( TextControl,  { label: __( 'Label', 'blockenberg' ),  value: it.label,   onChange: v => updItem( setAttributes, a.items, ii, 'label',   v ) } ),
                                el( TextControl,  { label: __( 'Value', 'blockenberg' ),  value: String( it.value ), type: 'number', onChange: v => updItem( setAttributes, a.items, ii, 'value', parseFloat( v ) || 0 ) } ),
                                el( ToggleControl, { label: __( 'Is Total bar', 'blockenberg' ), checked: it.isTotal, onChange: v => updItem( setAttributes, a.items, ii, 'isTotal', v ) } ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { items: a.items.filter( ( _, x ) => x !== ii ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-waterfall-title', style: { color: a.titleColor } }, a.title ),
                el( 'div', { className: 'bkbg-waterfall-svg' }, renderWaterfall( a ) ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save( { className: 'bkbg-waterfall-wrap', style: getTypoCssVars( a ) } );
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-waterfall-title', style: { color: a.titleColor } }, a.title ) : null,
                el( 'div', { className: 'bkbg-waterfall-svg' }, renderWaterfall( a ) ),
            );
        },
    } );
}() );

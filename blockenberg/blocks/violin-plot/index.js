( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, TextareaControl, Button, ColorPicker, Popover } = window.wp.components;
    const { __ } = window.wp.i18n;
    const { useState } = window.wp.element;

    var _tc, _tvf;
    Object.defineProperty(window, '_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, key, attrs, setA) { return _tc(label, key, attrs, setA); }
    function getTypoCssVars(attrs) {
        var v = {};
        _tvf(v, 'titleTypo', attrs, '--bkvip-tt-');
        return v;
    }

    // ── Stats helpers ─────────────────────────────────────────────────────────
    function sorted( arr ) { return [ ...arr ].sort( ( a, b ) => a - b ); }
    function quantile( s, q ) {
        const pos = ( s.length - 1 ) * q;
        const base = Math.floor( pos );
        const rest = pos - base;
        return s[ base + 1 ] !== undefined ? s[ base ] + rest * ( s[ base + 1 ] - s[ base ] ) : s[ base ];
    }
    // Kernel Density Estimation (Gaussian, bandwidth = Silverman's rule)
    function kde( sortedVals, bandwidth, steps ) {
        const mn = sortedVals[ 0 ];
        const mx = sortedVals[ sortedVals.length - 1 ];
        const result = [];
        for ( let i = 0; i <= steps; i++ ) {
            const x  = mn + ( i / steps ) * ( mx - mn );
            let density = 0;
            sortedVals.forEach( v => {
                const u = ( x - v ) / bandwidth;
                density += Math.exp( -0.5 * u * u );
            } );
            density /= ( sortedVals.length * bandwidth * Math.sqrt( 2 * Math.PI ) );
            result.push( { x, d: density } );
        }
        return result;
    }
    function bandwidth( n, std ) { return 1.06 * std * Math.pow( n, -0.2 ); }
    function stddev( vals ) {
        const m = vals.reduce( ( s, v ) => s + v, 0 ) / vals.length;
        return Math.sqrt( vals.reduce( ( s, v ) => s + ( v - m ) ** 2, 0 ) / vals.length );
    }

    // ── Renderer ──────────────────────────────────────────────────────────────
    function renderViolin( a ) {
        const groups = a.groups || [];
        const W  = a.svgWidth;
        const H  = a.svgHeight;
        const PT = a.padTop;
        const PL = a.padLeft;
        const PR = a.padRight;
        const PB = a.padBottom;
        const chartW = W - PL - PR;
        const chartH = H - PT - PB;
        const VW = Math.min( a.violinWidth, ( chartW / groups.length ) * 0.8 );
        const KDE_STEPS = 40;
        const opacity = ( a.fillOpacity || 75 ) / 100;

        if ( ! groups.length ) return el( 'svg', { viewBox: `0 0 ${ W } ${ H }`, width: '100%' } );

        // Global Y range across all groups
        const allVals = groups.flatMap( g => g.values || [] );
        if ( ! allVals.length ) return el( 'svg', { viewBox: `0 0 ${ W } ${ H }`, width: '100%' } );
        const globalMin = Math.min( ...allVals );
        const globalMax = Math.max( ...allVals );
        const yRange    = ( globalMax - globalMin ) || 1;
        const yPad      = yRange * 0.05;
        function sy( v ) { return PT + chartH - ( ( v - ( globalMin - yPad ) ) / ( yRange + yPad * 2 ) ) * chartH; }

        // Step width per group
        const step = chartW / groups.length;
        function cx( gi ) { return PL + gi * step + step / 2; }

        const svgEls = [];
        svgEls.push( el( 'rect', { key: 'bg', x: 0, y: 0, width: W, height: H, fill: a.bgColor || '#ffffff', rx: 8 } ) );

        // Grid + Y axis ticks
        if ( a.showGrid ) {
            const ticks = 5;
            for ( let t = 0; t <= ticks; t++ ) {
                const gy = PT + ( t / ticks ) * chartH;
                const yV = Math.round( ( globalMin - yPad ) + ( 1 - t / ticks ) * ( yRange + yPad * 2 ) );
                svgEls.push( el( 'line', { key: `gl${ t }`, x1: PL, y1: gy, x2: W - PR, y2: gy, stroke: a.gridColor || '#f3f4f6', strokeWidth: 1 } ) );
                svgEls.push( el( 'text', { key: `gy${ t }`, x: PL - 6, y: gy, textAnchor: 'end', dominantBaseline: 'middle', fill: a.textColor, fontSize: a.labelFontSize - 1, fontFamily: 'inherit' }, yV ) );
            }
        }

        // Y axis label
        svgEls.push( el( 'text', { key: 'ylabel', x: 14, y: PT + chartH / 2, textAnchor: 'middle', fill: a.textColor, fontSize: a.labelFontSize, fontFamily: 'inherit', transform: `rotate(-90, 14, ${ PT + chartH / 2 })` }, a.yAxisLabel ) );

        // Violins
        groups.forEach( ( g, gi ) => {
            const vals = g.values || [];
            if ( ! vals.length ) return;
            const s   = sorted( vals );
            const std = stddev( s );
            const bw  = bandwidth( s.length, std || 1 );
            const kde_ = kde( s, bw, KDE_STEPS );
            const clr  = g.color || '#6366f1';

            // Max density → half-width mapping
            const maxD = Math.max( ...kde_.map( p => p.d ) ) || 1;
            function dx( d ) { return ( d / maxD ) * ( VW / 2 ); }

            // Build polygon: right side top→bottom, then left side bottom→top
            const rightPts = kde_.map( p => `${ cx( gi ) + dx( p.d ) },${ sy( p.x ) }` );
            const leftPts  = [ ...kde_ ].reverse().map( p => `${ cx( gi ) - dx( p.d ) },${ sy( p.x ) }` );
            const polyPts  = [ ...rightPts, ...leftPts ].join( ' ' );

            svgEls.push( el( 'polygon', { key: `vio${ gi }`, points: polyPts, fill: clr, fillOpacity: opacity, stroke: clr, strokeWidth: 1.5 } ) );

            // IQR box
            if ( a.showIQR ) {
                const q1  = quantile( s, 0.25 );
                const q3  = quantile( s, 0.75 );
                const iqrH = sy( q1 ) - sy( q3 );
                svgEls.push( el( 'rect', { key: `iqr${ gi }`, x: cx( gi ) - VW * 0.12, y: sy( q3 ), width: VW * 0.24, height: Math.max( 2, iqrH ), fill: '#ffffff', fillOpacity: 0.85, stroke: clr, strokeWidth: 1.5, rx: 2 } ) );
            }

            // Median line
            if ( a.showMedian ) {
                const med = quantile( s, 0.5 );
                svgEls.push( el( 'line', { key: `med${ gi }`, x1: cx( gi ) - VW * 0.18, y1: sy( med ), x2: cx( gi ) + VW * 0.18, y2: sy( med ), stroke: clr, strokeWidth: 2.5 } ) );
                svgEls.push( el( 'circle', { key: `medpt${ gi }`, cx: cx( gi ), cy: sy( med ), r: 3.5, fill: '#fff', stroke: clr, strokeWidth: 2 } ) );
            }

            // X label
            svgEls.push( el( 'text', { key: `xl${ gi }`, x: cx( gi ), y: H - PB + 18, textAnchor: 'middle', fill: a.textColor, fontSize: a.labelFontSize, fontFamily: 'inherit', fontWeight: 500 }, g.label ) );
        } );

        // Axes
        svgEls.push( el( 'line', { key: 'xax', x1: PL, y1: PT + chartH, x2: W - PR, y2: PT + chartH, stroke: a.textColor, strokeWidth: 1, strokeOpacity: 0.3 } ) );
        svgEls.push( el( 'line', { key: 'yax', x1: PL, y1: PT, x2: PL, y2: PT + chartH, stroke: a.textColor, strokeWidth: 1, strokeOpacity: 0.3 } ) );

        // Legend
        if ( a.showLegend ) {
            const legY    = H - PB + 36;
            const legStep = Math.min( 140, chartW / groups.length );
            groups.forEach( ( g, gi ) => {
                const lx = PL + gi * legStep;
                svgEls.push( el( 'rect', { key: `lgn${ gi }`, x: lx, y: legY - 7, width: 18, height: 10, fill: g.color || '#6366f1', rx: 2, fillOpacity: opacity } ) );
                svgEls.push( el( 'text', { key: `lgt${ gi }`, x: lx + 22, y: legY, dominantBaseline: 'middle', fill: a.textColor, fontSize: a.labelFontSize - 1, fontFamily: 'inherit' }, g.label ) );
            } );
        }

        return el( 'svg', { viewBox: `0 0 ${ W } ${ H }`, width: '100%', style: { display: 'block', maxWidth: W + 'px', margin: '0 auto' } }, ...svgEls );
    }

    function updGrp( setAttributes, groups, gi, field, val ) {
        setAttributes( { groups: groups.map( ( g, i ) => i === gi ? { ...g, [field]: val } : g ) } );
    }

    /* ── colour-swatch + popover ── */
    function BkbgColorSwatch(p) {
        var st = useState(false), open = st[0], setOpen = st[1];
        return el('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'4px 0', gap:'8px' } },
            el('span', { style:{ fontSize:'12px', color:'#1e1e1e', flex:1, lineHeight:1.4 } }, p.label),
            el('div', { style:{ position:'relative', flexShrink:0 } },
                el('button', { type:'button', title: p.value||'none', onClick: function(){ setOpen(!open); },
                    style:{ width:'28px', height:'28px', borderRadius:'4px', border: open ? '2px solid #007cba' : '2px solid #ddd', cursor:'pointer', padding:0, display:'block', background: p.value||'#ffffff', flexShrink:0 } }),
                open && el(Popover, { position:'bottom left', onClose: function(){ setOpen(false); } },
                    el('div', { style:{ padding:'8px' }, onMouseDown: function(e){ e.stopPropagation(); } },
                        el('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' } },
                            el('strong', { style:{ fontSize:'12px' } }, p.label),
                            el(Button, { icon:'no-alt', isSmall:true, onClick: function(){ setOpen(false); } })
                        ),
                        el(ColorPicker, { color: p.value, enableAlpha:true, onChange: p.onChange })
                    )
                )
            )
        );
    }

    registerBlockType( 'blockenberg/violin-plot', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps( { className: 'bkbg-violin-wrap', style: getTypoCssVars( a ) } );

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Chart Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl,   { label: __( 'Title', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),    checked: a.showTitle,  onChange: v => setAttributes( { showTitle:  v } ) } ),
                        el( ToggleControl, { label: __( 'Show Grid', 'blockenberg' ),     checked: a.showGrid,   onChange: v => setAttributes( { showGrid:   v } ) } ),
                        el( ToggleControl, { label: __( 'Show Median', 'blockenberg' ),   checked: a.showMedian, onChange: v => setAttributes( { showMedian: v } ) } ),
                        el( ToggleControl, { label: __( 'Show IQR Box', 'blockenberg' ),  checked: a.showIQR,    onChange: v => setAttributes( { showIQR:    v } ) } ),
                        el( ToggleControl, { label: __( 'Show Legend', 'blockenberg' ),   checked: a.showLegend, onChange: v => setAttributes( { showLegend: v } ) } ),
                        el( RangeControl,  { label: __( 'Fill Opacity %', 'blockenberg' ), value: a.fillOpacity, onChange: v => setAttributes( { fillOpacity: v } ), min: 10, max: 100 } ),
                        el( TextControl,   { label: __( 'Y Axis Label', 'blockenberg' ), value: a.yAxisLabel, onChange: v => setAttributes( { yAxisLabel: v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Layout', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Canvas Width', 'blockenberg' ),  value: a.svgWidth,     onChange: v => setAttributes( { svgWidth:     v } ), min: 300, max: 1200, step: 20 } ),
                        el( RangeControl, { label: __( 'Canvas Height', 'blockenberg' ), value: a.svgHeight,    onChange: v => setAttributes( { svgHeight:    v } ), min: 200, max: 700 } ),
                        el( RangeControl, { label: __( 'Violin Width', 'blockenberg' ),  value: a.violinWidth,  onChange: v => setAttributes( { violinWidth:  v } ), min: 20, max: 160 } ),
                        el( RangeControl, { label: __( 'Left Padding', 'blockenberg' ),  value: a.padLeft,      onChange: v => setAttributes( { padLeft:      v } ), min: 20, max: 120 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl( __( 'Title', 'blockenberg' ), 'titleTypo', a, setAttributes ),
                        el( RangeControl, { label: __( 'Label Font Size', 'blockenberg' ), value: a.labelFontSize, onChange: v => setAttributes( { labelFontSize: v } ), min: 8, max: 20 } )
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Background', 'blockenberg' ), value: a.bgColor,    onChange: v => setAttributes( { bgColor:    v || '#ffffff' } ) },
                            { label: __( 'Grid',       'blockenberg' ), value: a.gridColor,  onChange: v => setAttributes( { gridColor:  v || '#f3f4f6' } ) },
                            { label: __( 'Title',      'blockenberg' ), value: a.titleColor, onChange: v => setAttributes( { titleColor: v || '#111827' } ) },
                            { label: __( 'Text/Axes',  'blockenberg' ), value: a.textColor,  onChange: v => setAttributes( { textColor:  v || '#374151' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Groups', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { groups: [ ...a.groups, { label: 'New Group', color: '#8b5cf6', values: [ 40, 55, 65, 70, 75, 80, 85 ] } ] } ) }, __( '+ Add Group', 'blockenberg' ) ),
                        a.groups.map( ( g, gi ) =>
                            el( PanelBody, { key: gi, title: g.label || `Group ${ gi + 1 }`, initialOpen: false },
                                el( TextControl, { label: __( 'Label', 'blockenberg' ),      value: g.label, onChange: v => updGrp( setAttributes, a.groups, gi, 'label', v ) } ),
                                el( BkbgColorSwatch, { label: __( 'Color', 'blockenberg' ), value: g.color, onChange: v => updGrp( setAttributes, a.groups, gi, 'color', v ) } ),
                                el( TextareaControl, {
                                    label: __( 'Values (comma-separated)', 'blockenberg' ),
                                    value: ( g.values || [] ).join( ', ' ),
                                    onChange: v => updGrp( setAttributes, a.groups, gi, 'values', v.split( ',' ).map( n => parseFloat( n.trim() ) ).filter( n => ! isNaN( n ) ) ),
                                    rows: 4,
                                } ),
                                el( Button, { isDestructive: true, isSmall: true, style: { marginTop: 6 }, onClick: () => setAttributes( { groups: a.groups.filter( ( _, x ) => x !== gi ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-violin-title', style: { color: a.titleColor } }, a.title ),
                el( 'div', { className: 'bkbg-violin-svg' }, renderViolin( a ) ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save( { className: 'bkbg-violin-wrap', style: getTypoCssVars( a ) } );
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-violin-title', style: { color: a.titleColor } }, a.title ) : null,
                el( 'div', { className: 'bkbg-violin-svg' }, renderViolin( a ) ),
            );
        },
    } );
}() );

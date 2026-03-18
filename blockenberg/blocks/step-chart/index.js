( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, SelectControl, ToggleControl, TextControl, Button, ColorPicker, Popover } = window.wp.components;
    const { __ } = window.wp.i18n;
    const { useState } = window.wp.element;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    // ── Renderer ──────────────────────────────────────────────────────────────
    function renderStepChart( a ) {
        const series  = a.series  || [];
        const xLabels = a.xLabels || [];
        const W       = a.svgWidth;
        const H       = a.svgHeight;
        const PT      = a.padTop;
        const PL      = a.padLeft;
        const PR      = a.padRight;
        const PB      = a.padBottom;

        const allVals = series.flatMap( s => s.values || [] );
        const maxVal  = Math.max( ...allVals, 1 );
        const minVal  = 0;
        const chartW  = W - PL - PR;
        const chartH  = H - PT - PB;

        // x positions evenly spaced at each point index
        const nPts   = Math.max( ...series.map( s => ( s.values || [] ).length ), xLabels.length, 2 );
        function xAt( i ) { return PL + ( i / ( nPts - 1 ) ) * chartW; }
        function yAt( v ) { return H - PB - ( ( v - minVal ) / ( maxVal - minVal ) ) * chartH; }

        // Build step path for a series (step-after style: H then V)
        function stepPath( values ) {
            if ( !values || values.length === 0 ) return '';
            let d = `M ${ xAt( 0 ) } ${ yAt( values[0] ) }`;
            for ( let i = 1; i < values.length; i++ ) {
                d += ` H ${ xAt( i ) } V ${ yAt( values[i] ) }`;
            }
            return d;
        }

        function fillPath( values ) {
            if ( !values || values.length === 0 ) return '';
            const base = H - PB;
            let d = `M ${ xAt( 0 ) } ${ yAt( values[0] ) }`;
            for ( let i = 1; i < values.length; i++ ) {
                d += ` H ${ xAt( i ) } V ${ yAt( values[i] ) }`;
            }
            d += ` V ${ base } H ${ xAt( 0 ) } Z`;
            return d;
        }

        const svgEls = [];
        svgEls.push( el( 'rect', { key: 'bg', x: 0, y: 0, width: W, height: H, fill: a.bgColor || '#ffffff', rx: 8 } ) );

        // Grid lines (horizontal)
        if ( a.showGridLines ) {
            const ticks = 5;
            for ( let i = 0; i <= ticks; i++ ) {
                const v  = minVal + ( maxVal - minVal ) * i / ticks;
                const gy = yAt( v );
                svgEls.push( el( 'line', { key: `gy${ i }`, x1: PL, y1: gy, x2: W - PR, y2: gy, stroke: a.gridColor || '#f3f4f6', strokeWidth: 1 } ) );
                svgEls.push( el( 'text', { key: `gyl${ i }`, x: PL - 6, y: gy, textAnchor: 'end', dominantBaseline: 'middle', fill: '#9ca3af', fontSize: a.labelFontSize, fontFamily: 'inherit' }, String( parseFloat( v.toFixed( 0 ) ) ) ) );
            }
        }

        // Axes
        svgEls.push( el( 'line', { key: 'axX', x1: PL, y1: H - PB, x2: W - PR, y2: H - PB, stroke: '#d1d5db', strokeWidth: 1 } ) );
        svgEls.push( el( 'line', { key: 'axY', x1: PL, y1: PT,      x2: PL,     y2: H - PB,  stroke: '#d1d5db', strokeWidth: 1 } ) );

        // X-axis labels
        for ( let i = 0; i < nPts; i++ ) {
            const lbl = xLabels[i] !== undefined ? String( xLabels[i] ) : String( i + 1 );
            svgEls.push( el( 'text', { key: `xl${ i }`, x: xAt( i ), y: H - PB + 16, textAnchor: 'middle', fill: '#9ca3af', fontSize: a.labelFontSize, fontFamily: 'inherit' }, lbl ) );
        }

        // Series
        series.forEach( ( ser, si ) => {
            const vals = ser.values || [];
            const clr  = ser.color  || '#6366f1';

            // Fill area
            if ( a.fillArea ) {
                svgEls.push( el( 'path', { key: `fill${ si }`, d: fillPath( vals ), fill: clr, opacity: ( a.fillOpacity || 20 ) / 100 } ) );
            }

            // Step line
            svgEls.push( el( 'path', { key: `line${ si }`, d: stepPath( vals ), fill: 'none', stroke: clr, strokeWidth: a.lineThickness, strokeLinecap: 'round', strokeLinejoin: 'round' } ) );

            // Dots and value labels
            vals.forEach( ( v, i ) => {
                const cx = xAt( i );
                const cy = yAt( v );
                if ( a.showDots ) {
                    svgEls.push( el( 'circle', { key: `dot${ si }${ i }`, cx, cy, r: a.dotRadius, fill: clr, stroke: '#ffffff', strokeWidth: 1.5 } ) );
                }
                if ( a.showValues ) {
                    svgEls.push( el( 'text', { key: `val${ si }${ i }`, x: cx, y: cy - a.dotRadius - 4, textAnchor: 'middle', fill: clr, fontSize: a.valueFontSize, fontFamily: 'inherit', fontWeight: 600 }, String( v ) ) );
                }
            } );
        } );

        // Legend
        if ( a.showLegend && series.length > 0 ) {
            series.forEach( ( ser, si ) => {
                const lx = PL + si * 130;
                const ly = PT - 14;
                svgEls.push( el( 'line',   { key: `ll${ si }`, x1: lx, y1: ly, x2: lx + 22, y2: ly, stroke: ser.color, strokeWidth: 3 } ) );
                svgEls.push( el( 'circle', { key: `lc${ si }`, cx: lx + 11, cy: ly, r: 4, fill: ser.color } ) );
                svgEls.push( el( 'text',   { key: `lt${ si }`, x:  lx + 26, y: ly, dominantBaseline: 'middle', fill: a.textColor, fontSize: 11, fontFamily: 'inherit' }, ser.label ) );
            } );
        }

        return el( 'svg', { viewBox: `0 0 ${ W } ${ H }`, width: '100%', style: { display: 'block', maxWidth: W + 'px', margin: '0 auto' } }, ...svgEls );
    }

    function updSer( setAttributes, series, si, field, val ) {
        setAttributes( { series: series.map( ( s, i ) => i === si ? { ...s, [field]: val } : s ) } );
    }

    function parseVals( raw ) {
        return raw.split( /[\s,]+/ ).map( Number ).filter( v => !isNaN( v ) );
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

    registerBlockType( 'blockenberg/step-chart', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps( (function () {
                var _tvf = getTypoCssVars();
                var s = { '--bkst-title-color': a.titleColor };
                Object.assign(s, _tvf(a.titleTypo, '--bkst-tt-'));
                return { className: 'bkbg-step-wrap', style: s };
            })() );

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Chart Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl, { label: __( 'Title', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),      checked: a.showTitle,    onChange: v => setAttributes( { showTitle: v } ) } ),
                        el( ToggleControl, { label: __( 'Fill Area', 'blockenberg' ),       checked: a.fillArea,     onChange: v => setAttributes( { fillArea: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Grid Lines', 'blockenberg' ), checked: a.showGridLines, onChange: v => setAttributes( { showGridLines: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Dots', 'blockenberg' ),       checked: a.showDots,     onChange: v => setAttributes( { showDots: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Values', 'blockenberg' ),     checked: a.showValues,   onChange: v => setAttributes( { showValues: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Legend', 'blockenberg' ),     checked: a.showLegend,   onChange: v => setAttributes( { showLegend: v } ) } ),
                        el( TextControl, { label: __( 'X-Axis Labels (comma separated)', 'blockenberg' ), value: ( a.xLabels || [] ).join( ', ' ), onChange: v => setAttributes( { xLabels: v.split( /[\s,]+/ ).filter( Boolean ) } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Layout', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Canvas Width', 'blockenberg' ),    value: a.svgWidth,      onChange: v => setAttributes( { svgWidth: v } ),       min: 300, max: 1200, step: 20 } ),
                        el( RangeControl, { label: __( 'Canvas Height', 'blockenberg' ),   value: a.svgHeight,     onChange: v => setAttributes( { svgHeight: v } ),      min: 120, max: 700 } ),
                        el( RangeControl, { label: __( 'Line Thickness', 'blockenberg' ),  value: a.lineThickness, onChange: v => setAttributes( { lineThickness: v } ),  min: 1, max: 10 } ),
                        el( RangeControl, { label: __( 'Dot Radius', 'blockenberg' ),      value: a.dotRadius,     onChange: v => setAttributes( { dotRadius: v } ),      min: 2, max: 18 } ),
                        el( RangeControl, { label: __( 'Fill Opacity %', 'blockenberg' ),  value: a.fillOpacity,   onChange: v => setAttributes( { fillOpacity: v } ),    min: 0, max: 70 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl() && getTypoControl()({ label: __('Title', 'blockenberg'), value: a.titleTypo, onChange: function (v) { setAttributes({ titleTypo: v }); } }),
                        el( RangeControl, { label: __( 'Label Font Size', 'blockenberg' ), value: a.labelFontSize, onChange: v => setAttributes( { labelFontSize: v } ),  min: 8, max: 22 } ),
                        el( RangeControl, { label: __( 'Value Font Size', 'blockenberg' ), value: a.valueFontSize, onChange: v => setAttributes( { valueFontSize: v } ),  min: 7, max: 16 } )
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Background',  'blockenberg' ), value: a.bgColor,    onChange: v => setAttributes( { bgColor:    v || '#ffffff' } ) },
                            { label: __( 'Grid Lines',  'blockenberg' ), value: a.gridColor,  onChange: v => setAttributes( { gridColor:  v || '#f3f4f6' } ) },
                            { label: __( 'Title Color', 'blockenberg' ), value: a.titleColor, onChange: v => setAttributes( { titleColor: v || '#111827' } ) },
                            { label: __( 'Text Color',  'blockenberg' ), value: a.textColor,  onChange: v => setAttributes( { textColor:  v || '#374151' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Series', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { series: [ ...a.series, { label: 'New Series', color: '#6366f1', values: [10, 20, 20, 40] } ] } ) }, __( '+ Add Series', 'blockenberg' ) ),
                        a.series.map( ( ser, si ) =>
                            el( PanelBody, { key: si, title: ser.label || `Series ${ si + 1 }`, initialOpen: false },
                                el( TextControl, { label: __( 'Label', 'blockenberg' ),  value: ser.label, onChange: v => updSer( setAttributes, a.series, si, 'label',  v ) } ),
                                el( BkbgColorSwatch, { label: __( 'Color', 'blockenberg' ), value: ser.color, onChange: v => updSer( setAttributes, a.series, si, 'color',  v ) } ),
                                el( TextControl, { label: __( 'Values (comma separated)', 'blockenberg' ), value: ( ser.values || [] ).join( ', ' ), onChange: v => updSer( setAttributes, a.series, si, 'values', parseVals( v ) ) } ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { series: a.series.filter( ( _, x ) => x !== si ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-step-title' }, a.title ),
                el( 'div', { className: 'bkbg-step-svg' }, renderStepChart( a ) ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save( (function () {
                var _tvf = getTypoCssVars();
                var s = { '--bkst-title-color': a.titleColor };
                Object.assign(s, _tvf(a.titleTypo, '--bkst-tt-'));
                return { className: 'bkbg-step-wrap', style: s };
            })() );
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-step-title' }, a.title ) : null,
                el( 'div', { className: 'bkbg-step-svg' }, renderStepChart( a ) ),
            );
        },
    } );
}() );

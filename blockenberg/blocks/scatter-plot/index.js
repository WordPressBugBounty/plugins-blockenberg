( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, TextareaControl, Button, ColorPicker, Popover } = window.wp.components;
    const { __ } = window.wp.i18n;
    const { useState } = window.wp.element;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    // ── Renderer ──────────────────────────────────────────────────────────────
    function renderScatterPlot( a ) {
        const series = a.series || [];
        const W  = a.svgWidth;
        const H  = a.svgHeight;
        const PT = a.padTop;
        const PL = a.padLeft;
        const PR = a.padRight;
        const PB = a.padBottom;
        const chartW = W - PL - PR;
        const chartH = H - PT - PB;
        const xMin = a.xMin, xMax = a.xMax, yMin = a.yMin, yMax = a.yMax;
        const xRange = ( xMax - xMin ) || 1;
        const yRange = ( yMax - yMin ) || 1;
        const DR = a.dotRadius;

        function sx( v ) { return PL + ( ( v - xMin ) / xRange ) * chartW; }
        function sy( v ) { return PT + chartH - ( ( v - yMin ) / yRange ) * chartH; }

        const svgEls = [];
        svgEls.push( el( 'rect', { key: 'bg', x: 0, y: 0, width: W, height: H, fill: a.bgColor || '#ffffff', rx: 8 } ) );

        // Grid
        if ( a.showGrid ) {
            const ticks = 5;
            for ( let t = 0; t <= ticks; t++ ) {
                const gx = PL + ( t / ticks ) * chartW;
                const gy = PT + ( t / ticks ) * chartH;
                svgEls.push( el( 'line', { key: `gx${ t }`, x1: gx, y1: PT, x2: gx, y2: PT + chartH, stroke: a.gridColor || '#f3f4f6', strokeWidth: 1 } ) );
                svgEls.push( el( 'line', { key: `gy${ t }`, x1: PL, y1: gy, x2: PL + chartW, y2: gy, stroke: a.gridColor || '#f3f4f6', strokeWidth: 1 } ) );
                const xV = xMin + ( t / ticks ) * xRange;
                const yV = yMax - ( t / ticks ) * yRange;
                svgEls.push( el( 'text', { key: `xl${ t }`, x: gx, y: PT + chartH + 16, textAnchor: 'middle', fill: a.textColor, fontSize: a.labelFontSize - 1, fontWeight: a.labelFontWeight, fontFamily: 'inherit' }, Math.round( xV ) ) );
                svgEls.push( el( 'text', { key: `yl${ t }`, x: PL - 8, y: gy, textAnchor: 'end', dominantBaseline: 'middle', fill: a.textColor, fontSize: a.labelFontSize - 1, fontWeight: a.labelFontWeight, fontFamily: 'inherit' }, Math.round( yV ) ) );
            }
        }

        // Axes
        svgEls.push( el( 'line', { key: 'xax', x1: PL, y1: PT + chartH, x2: W - PR, y2: PT + chartH, stroke: a.textColor, strokeWidth: 1, strokeOpacity: 0.4 } ) );
        svgEls.push( el( 'line', { key: 'yax', x1: PL, y1: PT, x2: PL, y2: PT + chartH, stroke: a.textColor, strokeWidth: 1, strokeOpacity: 0.4 } ) );

        // Axis labels
        svgEls.push( el( 'text', { key: 'xaxlbl', x: PL + chartW / 2, y: H - 8, textAnchor: 'middle', fill: a.textColor, fontSize: a.labelFontSize, fontWeight: a.labelFontWeight, fontFamily: 'inherit' }, a.xAxisLabel ) );
        svgEls.push( el( 'text', { key: 'yaxlbl', x: 14, y: PT + chartH / 2, textAnchor: 'middle', fill: a.textColor, fontSize: a.labelFontSize, fontWeight: a.labelFontWeight, fontFamily: 'inherit', transform: `rotate(-90, 14, ${ PT + chartH / 2 })` }, a.yAxisLabel ) );

        // Series dots
        series.forEach( ( s, si ) => {
            ( s.points || [] ).forEach( ( p, pi ) => {
                const px = sx( p.x || 0 );
                const py = sy( p.y || 0 );
                svgEls.push( el( 'circle', { key: `dot${ si }${ pi }`, cx: px, cy: py, r: DR, fill: s.color || '#6366f1', stroke: '#fff', strokeWidth: 1.5, fillOpacity: 0.85 } ) );
                if ( a.showLabels && p.label ) {
                    svgEls.push( el( 'text', { key: `lbl${ si }${ pi }`, x: px, y: py - DR - 3, textAnchor: 'middle', fill: s.color || '#6366f1', fontSize: a.labelFontSize - 2, fontWeight: a.labelFontWeight, fontFamily: 'inherit' }, p.label ) );
                }
            } );
        } );

        // Legend
        if ( a.showLegend ) {
            const legY    = H - PB + 34;
            const legStep = Math.min( 150, chartW / series.length );
            series.forEach( ( s, si ) => {
                const lx = PL + si * legStep;
                svgEls.push( el( 'circle', { key: `lgc${ si }`, cx: lx + 6, cy: legY, r: 6, fill: s.color || '#6366f1' } ) );
                svgEls.push( el( 'text', { key: `lgt${ si }`, x: lx + 16, y: legY, dominantBaseline: 'middle', fill: a.textColor, fontSize: a.labelFontSize - 1, fontWeight: a.labelFontWeight, fontFamily: 'inherit' }, s.label || `Series ${ si + 1 }` ) );
            } );
        }

        return el( 'svg', { viewBox: `0 0 ${ W } ${ H }`, width: '100%', style: { display: 'block', maxWidth: W + 'px', margin: '0 auto' } }, ...svgEls );
    }

    function updSer( setAttributes, series, si, field, val ) {
        setAttributes( { series: series.map( ( s, i ) => i === si ? { ...s, [field]: val } : s ) } );
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

    registerBlockType( 'blockenberg/scatter-plot', {
        icon: el('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', width: 24, height: 24 },
          el('path', { d: 'M3 3v18h18', stroke: 'currentColor', strokeWidth: 1.5, fill: 'none' }),
          el('circle', { cx: 8, cy: 16, r: 1.5, fill: 'currentColor' }),
          el('circle', { cx: 11, cy: 11, r: 1.5, fill: 'currentColor' }),
          el('circle', { cx: 15, cy: 14, r: 1.5, fill: 'currentColor' }),
          el('circle', { cx: 14, cy: 8, r: 1.5, fill: 'currentColor' }),
          el('circle', { cx: 18, cy: 6, r: 1.5, fill: 'currentColor' }),
          el('circle', { cx: 7, cy: 10, r: 1.5, fill: 'currentColor' })
        ),
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps( (function() {
                var _tv = getTypoCssVars();
                var s = {};
                if (_tv) Object.assign(s, _tv(a.titleTypo || {}, '--bksp-tt-'));
                return { className: 'bkbg-scatter-wrap', style: s };
            })() );

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Chart Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl,   { label: __( 'Title', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),  checked: a.showTitle,  onChange: v => setAttributes( { showTitle:  v } ) } ),
                        el( ToggleControl, { label: __( 'Show Grid', 'blockenberg' ),   checked: a.showGrid,   onChange: v => setAttributes( { showGrid:   v } ) } ),
                        el( ToggleControl, { label: __( 'Show Legend', 'blockenberg' ), checked: a.showLegend, onChange: v => setAttributes( { showLegend: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Point Labels', 'blockenberg' ), checked: a.showLabels, onChange: v => setAttributes( { showLabels: v } ) } ),
                        el( TextControl, { label: __( 'X Axis Label', 'blockenberg' ), value: a.xAxisLabel, onChange: v => setAttributes( { xAxisLabel: v } ) } ),
                        el( TextControl, { label: __( 'Y Axis Label', 'blockenberg' ), value: a.yAxisLabel, onChange: v => setAttributes( { yAxisLabel: v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Axis Range', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'X Min', 'blockenberg' ), value: a.xMin, onChange: v => setAttributes( { xMin: v } ), min: -10000, max: 10000 } ),
                        el( RangeControl, { label: __( 'X Max', 'blockenberg' ), value: a.xMax, onChange: v => setAttributes( { xMax: v } ), min: -10000, max: 10000 } ),
                        el( RangeControl, { label: __( 'Y Min', 'blockenberg' ), value: a.yMin, onChange: v => setAttributes( { yMin: v } ), min: -10000, max: 10000 } ),
                        el( RangeControl, { label: __( 'Y Max', 'blockenberg' ), value: a.yMax, onChange: v => setAttributes( { yMax: v } ), min: -10000, max: 10000 } ),
                    ),

                    el( PanelBody, { title: __( 'Layout', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Canvas Width', 'blockenberg' ),  value: a.svgWidth,  onChange: v => setAttributes( { svgWidth:  v } ), min: 300, max: 1200, step: 20 } ),
                        el( RangeControl, { label: __( 'Canvas Height', 'blockenberg' ), value: a.svgHeight, onChange: v => setAttributes( { svgHeight: v } ), min: 160, max: 700 } ),
                        el( RangeControl, { label: __( 'Dot Radius', 'blockenberg' ),    value: a.dotRadius, onChange: v => setAttributes( { dotRadius: v } ), min: 2, max: 20 } ),
                        el( RangeControl, { label: __( 'Left Padding', 'blockenberg' ),  value: a.padLeft,   onChange: v => setAttributes( { padLeft: v } ),   min: 20, max: 120 } ),
                        el( RangeControl, { label: __( 'Bottom Padding', 'blockenberg' ),value: a.padBottom, onChange: v => setAttributes( { padBottom: v } ), min: 30, max: 120 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl() && el( getTypoControl(), { label: __( 'Title Typography', 'blockenberg' ), value: a.titleTypo || {}, onChange: function(v){ setAttributes({ titleTypo: v }); } }),
                        el( RangeControl, { label: __( 'Label Font Size', 'blockenberg' ), value: a.labelFontSize, onChange: v => setAttributes( { labelFontSize: v } ), min: 8, max: 20 } ),
                        el( RangeControl, { label: __( 'Label Font Weight', 'blockenberg' ), value: a.labelFontWeight, onChange: v => setAttributes( { labelFontWeight: v } ), min: 300, max: 900, step: 100, __nextHasNoMarginBottom: true } )
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

                    el( PanelBody, { title: __( 'Series', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { series: [ ...a.series, { label: 'New Series', color: '#8b5cf6', points: [ { x: 50, y: 50, label: 'Point' } ] } ] } ) }, __( '+ Add Series', 'blockenberg' ) ),
                        a.series.map( ( s, si ) =>
                            el( PanelBody, { key: si, title: s.label || `Series ${ si + 1 }`, initialOpen: false },
                                el( TextControl, { label: __( 'Label', 'blockenberg' ),      value: s.label, onChange: v => updSer( setAttributes, a.series, si, 'label', v ) } ),
                                el( BkbgColorSwatch, { label: __( 'Color', 'blockenberg' ), value: s.color, onChange: v => updSer( setAttributes, a.series, si, 'color', v ) } ),
                                el( 'p', { style: { fontSize: 12, color: '#6b7280', marginTop: 8, marginBottom: 4 } }, __( 'Points — one per line: x, y, Label', 'blockenberg' ) ),
                                el( TextareaControl, {
                                    label: __( 'Points (x, y, Label)', 'blockenberg' ),
                                    value: ( s.points || [] ).map( p => `${ p.x }, ${ p.y }, ${ p.label || '' }` ).join( '\n' ),
                                    onChange: v => updSer( setAttributes, a.series, si, 'points',
                                        v.split( '\n' ).filter( Boolean ).map( line => {
                                            const parts = line.split( ',' );
                                            return { x: parseFloat( parts[0] ) || 0, y: parseFloat( parts[1] ) || 0, label: ( parts[2] || '' ).trim() };
                                        } )
                                    ),
                                    rows: 6,
                                } ),
                                el( Button, { isDestructive: true, isSmall: true, style: { marginTop: 6 }, onClick: () => setAttributes( { series: a.series.filter( ( _, x ) => x !== si ) } ) }, __( 'Remove Series', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-scatter-title', style: { color: a.titleColor } }, a.title ),
                el( 'div', { className: 'bkbg-scatter-svg' }, renderScatterPlot( a ) ),
            );
        },

        save: function ( { attributes: a } ) {
            var _tv = getTypoCssVars();
            var s = {};
            if (_tv) Object.assign(s, _tv(a.titleTypo || {}, '--bksp-tt-'));
            const blockProps = useBlockProps.save( { className: 'bkbg-scatter-wrap', style: s } );
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-scatter-title', style: { color: a.titleColor } }, a.title ) : null,
                el( 'div', { className: 'bkbg-scatter-svg' }, renderScatterPlot( a ) ),
            );
        },
        deprecated: [ {
            attributes: {"title":{"type":"string","default":"Performance vs Satisfaction"},"showTitle":{"type":"boolean","default":true},"svgWidth":{"type":"number","default":680},"svgHeight":{"type":"number","default":380},"padTop":{"type":"number","default":30},"padLeft":{"type":"number","default":60},"padRight":{"type":"number","default":30},"padBottom":{"type":"number","default":60},"dotRadius":{"type":"number","default":6},"showGrid":{"type":"boolean","default":true},"showLegend":{"type":"boolean","default":true},"showLabels":{"type":"boolean","default":false},"xAxisLabel":{"type":"string","default":"Performance Score"},"yAxisLabel":{"type":"string","default":"Satisfaction Index"},"xMin":{"type":"number","default":0},"xMax":{"type":"number","default":100},"yMin":{"type":"number","default":0},"yMax":{"type":"number","default":100},"labelFontSize":{"type":"number","default":12},"labelFontWeight":{"type":"number","default":400},"bgColor":{"type":"string","default":"#ffffff"},"gridColor":{"type":"string","default":"#f3f4f6"},"textColor":{"type":"string","default":"#374151"},"titleColor":{"type":"string","default":"#111827"},"series":{"type":"array","default":[{"label":"Team A","color":"#6366f1","points":[{"x":72,"y":68,"label":"Alice"},{"x":85,"y":80,"label":"Bob"},{"x":61,"y":74,"label":"Carol"},{"x":90,"y":88,"label":"Dave"},{"x":78,"y":72,"label":"Eve"}]},{"label":"Team B","color":"#10b981","points":[{"x":45,"y":52,"label":"Frank"},{"x":58,"y":64,"label":"Grace"},{"x":39,"y":45,"label":"Henry"},{"x":67,"y":70,"label":"Iris"},{"x":53,"y":58,"label":"Jack"}]},{"label":"Team C","color":"#f59e0b","points":[{"x":20,"y":35,"label":"Kim"},{"x":32,"y":28,"label":"Leo"},{"x":15,"y":42,"label":"Mia"},{"x":28,"y":31,"label":"Ned"},{"x":40,"y":38,"label":"Ora"}]}],"items":{"type":"object"}}},
            save: function ( { attributes: a } ) {
                const blockProps = useBlockProps.save( { className: 'bkbg-scatter-wrap' } );
                return el( 'div', blockProps,
                    a.showTitle && a.title ? el( 'h3', { className: 'bkbg-scatter-title', style: { color: a.titleColor } }, a.title ) : null,
                    el( 'div', { className: 'bkbg-scatter-svg' }, renderScatterPlot( a ) ),
                );
            },
        } ],
    } );
}() );

( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, Button, ColorPicker, Popover } = window.wp.components;
    const { __ } = window.wp.i18n;
    const { useState } = window.wp.element;

    var _dotplotTC, _dotplotTV;
    function _tc() { return _dotplotTC || (_dotplotTC = window.bkbgTypographyControl); }
    function _tv(t, p) { return (_dotplotTV || (_dotplotTV = window.bkbgTypoCssVars)) ? _dotplotTV(t, p) : {}; }

    // ── Deterministic jitter (seeded by index so save() matches edit()) ───────
    function pseudoJitter( seed, range ) {
        const x = Math.sin( seed * 127.1 ) * 43758.5453123;
        return ( x - Math.floor( x ) - 0.5 ) * 2 * range;
    }

    // ── Renderer ──────────────────────────────────────────────────────────────
    function renderDotPlot( a ) {
        const series  = a.series || [];
        const W       = a.svgWidth;
        const H       = a.svgHeight;
        const PT      = a.padTop;
        const PL      = a.padLeft;
        const PR      = a.padRight;
        const PB      = a.padBottom;
        const DR      = a.dotRadius;
        const jitter  = a.jitter || 0;

        const allPts  = series.flatMap( s => s.points || [] );
        const minVal  = Math.min( ...allPts, 0 );
        const maxVal  = Math.max( ...allPts, 1 );
        const chartW  = W - PL - PR;
        const chartH  = H - PT - PB;
        const rowH    = series.length > 0 ? chartH / series.length : chartH;

        function xScale( v ) { return PL + ( ( v - minVal ) / ( maxVal - minVal ) ) * chartW; }

        const svgEls = [];
        svgEls.push( el( 'rect', { key: 'bg', x: 0, y: 0, width: W, height: H, fill: a.bgColor || '#ffffff', rx: 8 } ) );

        // Grid lines
        if ( a.showGridLines ) {
            const ticks = 5;
            for ( let i = 0; i <= ticks; i++ ) {
                const v  = minVal + ( maxVal - minVal ) * i / ticks;
                const gx = xScale( v );
                svgEls.push( el( 'line', { key: `gl${ i }`, x1: gx, y1: PT, x2: gx, y2: H - PB, stroke: a.gridColor || '#f3f4f6', strokeWidth: 1 } ) );
                svgEls.push( el( 'text', { key: `glt${ i }`, x: gx, y: H - PB + 14, textAnchor: 'middle', fill: '#9ca3af', fontSize: a.axisFontSize, fontWeight: a.axisFontWeight || '400', fontFamily: 'inherit' }, String( parseFloat( v.toFixed( 0 ) ) ) ) );
            }
        }

        // Axis baseline
        svgEls.push( el( 'line', { key: 'axis', x1: PL, y1: H - PB, x2: W - PR, y2: H - PB, stroke: '#d1d5db', strokeWidth: 1 } ) );

        // Series rows
        series.forEach( ( ser, si ) => {
            const pts   = ser.points || [];
            const cy    = PT + si * rowH + rowH / 2;
            const clr   = ser.color || '#6366f1';
            const opac  = ( a.dotOpacity || 75 ) / 100;

            // Mean line
            if ( a.showMeanLine && pts.length > 0 ) {
                const mean = pts.reduce( ( s, v ) => s + v, 0 ) / pts.length;
                const mx   = xScale( mean );
                svgEls.push( el( 'line', { key: `ml${ si }`, x1: mx, y1: cy - rowH * 0.38, x2: mx, y2: cy + rowH * 0.38, stroke: clr, strokeWidth: 2.5, strokeDasharray: '4 3', opacity: 0.9 } ) );
            }

            // Dots
            pts.forEach( ( v, pi ) => {
                const cx  = xScale( v );
                const jy  = pseudoJitter( si * 1000 + pi, jitter );
                svgEls.push( el( 'circle', { key: `d${ si }${ pi }`, cx, cy: cy + jy, r: DR, fill: clr, opacity: opac } ) );
            } );

            // Row label
            svgEls.push( el( 'text', { key: `lbl${ si }`, x: PL - 8, y: cy, textAnchor: 'end', dominantBaseline: 'middle', fill: a.textColor || '#374151', fontSize: a.labelFontSize, fontWeight: a.labelFontWeight || '400', fontFamily: 'inherit' }, ser.label || '' ) );
        } );

        // Legend (top right)
        if ( a.showLegend && series.length > 0 ) {
            series.forEach( ( ser, si ) => {
                const lx = W - PR - 10;
                const ly = PT + si * 20;
                svgEls.push( el( 'circle', { key: `lc${ si }`, cx: lx - 90, cy: ly, r: 6, fill: ser.color } ) );
                svgEls.push( el( 'text',   { key: `lt${ si }`, x:  lx - 80, y: ly, dominantBaseline: 'middle', fill: a.textColor, fontSize: 11, fontFamily: 'inherit' }, ser.label ) );
            } );
        }

        return el( 'svg', { viewBox: `0 0 ${ W } ${ H }`, width: '100%', style: { display: 'block', maxWidth: W + 'px', margin: '0 auto' } }, ...svgEls );
    }

    function updPts( setAttributes, series, si, raw ) {
        const pts = raw.split( /[\s,]+/ ).map( Number ).filter( v => !isNaN( v ) );
        setAttributes( { series: series.map( ( s, i ) => i === si ? { ...s, points: pts } : s ) } );
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

    registerBlockType( 'blockenberg/dot-plot', {
        icon: el('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', width: 24, height: 24 },
          el('circle', { cx: 6, cy: 8, r: 2, fill: 'currentColor' }),
          el('circle', { cx: 10, cy: 8, r: 2, fill: 'currentColor' }),
          el('circle', { cx: 14, cy: 8, r: 2, fill: 'currentColor', opacity: 0.4 }),
          el('circle', { cx: 6, cy: 14, r: 2, fill: 'currentColor' }),
          el('circle', { cx: 10, cy: 14, r: 2, fill: 'currentColor', opacity: 0.4 }),
          el('circle', { cx: 6, cy: 20, r: 2, fill: 'currentColor' }),
          el('circle', { cx: 10, cy: 20, r: 2, fill: 'currentColor' }),
          el('circle', { cx: 14, cy: 20, r: 2, fill: 'currentColor' }),
          el('circle', { cx: 18, cy: 20, r: 2, fill: 'currentColor' })
        ),
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps( { className: 'bkbg-dotplot-wrap', style: Object.assign(
                { '--bkbg-dotplot-ttl-fs': (a.titleFontSize || 18) + 'px' },
                _tv(a.typoTitle || {}, '--bkbg-dotplot-ttl-')
            ) } );

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Chart Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl, { label: __( 'Title', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),     checked: a.showTitle,    onChange: v => setAttributes( { showTitle: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Grid Lines', 'blockenberg' ), checked: a.showGridLines, onChange: v => setAttributes( { showGridLines: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Mean Line', 'blockenberg' ),  checked: a.showMeanLine,  onChange: v => setAttributes( { showMeanLine: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Legend', 'blockenberg' ),     checked: a.showLegend,    onChange: v => setAttributes( { showLegend: v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Layout', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Canvas Width', 'blockenberg' ),   value: a.svgWidth,  onChange: v => setAttributes( { svgWidth: v } ),  min: 300, max: 1200, step: 20 } ),
                        el( RangeControl, { label: __( 'Canvas Height', 'blockenberg' ),  value: a.svgHeight, onChange: v => setAttributes( { svgHeight: v } ), min: 140, max: 700 } ),
                        el( RangeControl, { label: __( 'Label Column Width', 'blockenberg' ), value: a.padLeft, onChange: v => setAttributes( { padLeft: v } ), min: 50, max: 280 } ),
                        el( RangeControl, { label: __( 'Dot Radius', 'blockenberg' ),     value: a.dotRadius, onChange: v => setAttributes( { dotRadius: v } ), min: 2, max: 22 } ),
                        el( RangeControl, { label: __( 'Dot Opacity %', 'blockenberg' ),  value: a.dotOpacity, onChange: v => setAttributes( { dotOpacity: v } ), min: 10, max: 100 } ),
                        el( RangeControl, { label: __( 'Jitter Range', 'blockenberg' ),   value: a.jitter,    onChange: v => setAttributes( { jitter: v } ),    min: 0, max: 30 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        _tc() && el(_tc(), { label: __('Title'), typo: a.typoTitle || {}, onChange: v => setAttributes( { typoTitle: v } ), defaultSize: a.titleFontSize || 18 }),
                        el( RangeControl, { label: __( 'Label Font Size', 'blockenberg' ), value: a.labelFontSize, onChange: v => setAttributes( { labelFontSize: v } ), min: 9, max: 22 } ),
                        el( wp.components.SelectControl, { label: __( 'Label Font Weight', 'blockenberg' ), value: a.labelFontWeight || '400',
                            options: [{label:'Normal (400)',value:'400'},{label:'Medium (500)',value:'500'},{label:'Bold (700)',value:'700'}],
                            onChange: v => setAttributes( { labelFontWeight: v } ) } ),
                        el( RangeControl, { label: __( 'Axis Font Size (px)', 'blockenberg' ), value: a.axisFontSize, min: 8, max: 18, onChange: v => setAttributes( { axisFontSize: v } ) } ),
                        el( wp.components.SelectControl, { label: __( 'Axis Font Weight', 'blockenberg' ), value: a.axisFontWeight || '400',
                            options: [{label:'Normal (400)',value:'400'},{label:'Medium (500)',value:'500'},{label:'Bold (700)',value:'700'}],
                            onChange: v => setAttributes( { axisFontWeight: v } ) } )
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
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { series: [ ...a.series, { label: 'New Series', color: '#6366f1', points: [50, 80, 60, 100, 70] } ] } ) }, __( '+ Add Series', 'blockenberg' ) ),
                        a.series.map( ( ser, si ) =>
                            el( PanelBody, { key: si, title: ser.label || `Series ${ si + 1 }`, initialOpen: false },
                                el( TextControl, { label: __( 'Label', 'blockenberg' ),        value: ser.label, onChange: v => updSer( setAttributes, a.series, si, 'label', v ) } ),
                                el( BkbgColorSwatch, { label: __( 'Color', 'blockenberg' ), value: ser.color, onChange: v => updSer( setAttributes, a.series, si, 'color', v ) } ),
                                el( TextControl, { label: __( 'Data Points (comma/space separated)', 'blockenberg' ), value: ( ser.points || [] ).join( ', ' ), onChange: v => updPts( setAttributes, a.series, si, v ) } ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { series: a.series.filter( ( _, x ) => x !== si ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-dotplot-title', style: { color: a.titleColor } }, a.title ),
                el( 'div', { className: 'bkbg-dotplot-svg' }, renderDotPlot( a ) ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save( { className: 'bkbg-dotplot-wrap', style: Object.assign(
                { '--bkbg-dotplot-ttl-fs': (a.titleFontSize || 18) + 'px' },
                _tv(a.typoTitle || {}, '--bkbg-dotplot-ttl-')
            ) } );
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-dotplot-title', style: { color: a.titleColor } }, a.title ) : null,
                el( 'div', { className: 'bkbg-dotplot-svg' }, renderDotPlot( a ) ),
            );
        },
    } );
}() );

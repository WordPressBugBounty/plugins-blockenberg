( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, SelectControl, ToggleControl, TextControl, TextareaControl, Button, ColorPicker, Popover } = window.wp.components;
    const { __ } = window.wp.i18n;
    const { useState } = window.wp.element;

    // ── Renderer ──────────────────────────────────────────────────────────────
    function renderStackedArea( a ) {
        const series  = a.series || [];
        const xLabels = a.xLabels || [];
        const W = a.svgWidth;
        const H = a.svgHeight;
        const PT = a.padTop;
        const PL = a.padLeft;
        const PR = a.padRight;
        const PB = a.padBottom;
        const chartW = W - PL - PR;
        const chartH = H - PT - PB;
        const n = xLabels.length;

        if ( ! series.length || ! n ) return el( 'svg', { viewBox: `0 0 ${ W } ${ H }`, width: '100%' } );

        // Compute cumulative stacks at each x-index
        const stacks = []; // stacks[i][j] = cumulative value at x=j for series up to i
        series.forEach( ( s, si ) => {
            stacks[ si ] = [];
            for ( let j = 0; j < n; j++ ) {
                const prev  = si === 0 ? 0 : stacks[ si - 1 ][ j ];
                stacks[ si ][ j ] = prev + ( ( s.values || [] )[ j ] || 0 );
            }
        } );

        // Max across all stacks
        const maxVal = Math.max( ...stacks[ stacks.length - 1 ] ) || 1;

        function xPos( j ) { return PL + ( j / ( n - 1 ) ) * chartW; }
        function yPos( v ) { return PT + chartH - ( v / maxVal ) * chartH; }

        const opacity = ( a.fillOpacity || 80 ) / 100;
        const svgEls = [];

        svgEls.push( el( 'rect', { key: 'bg', x: 0, y: 0, width: W, height: H, fill: a.bgColor || '#ffffff', rx: 8 } ) );

        // Grid lines
        if ( a.showGridLines ) {
            const ticks = 5;
            for ( let t = 0; t <= ticks; t++ ) {
                const gy = PT + ( t / ticks ) * chartH;
                svgEls.push( el( 'line', { key: `gl${ t }`, x1: PL, y1: gy, x2: W - PR, y2: gy, stroke: a.gridColor || '#f3f4f6', strokeWidth: 1 } ) );
                const yLbl = Math.round( maxVal * ( 1 - t / ticks ) );
                svgEls.push( el( 'text', { key: `yl${ t }`, x: PL - 6, y: gy, textAnchor: 'end', dominantBaseline: 'middle', fill: a.textColor, fontSize: a.labelFontSize - 1, fontFamily: 'inherit' }, yLbl ) );
            }
        }

        // Area fills (reverse order so bottom series paints on top correctly when overlapping)
        for ( let si = series.length - 1; si >= 0; si-- ) {
            const s    = series[ si ];
            const topY = stacks[ si ];
            const botY = si === 0 ? Array( n ).fill( 0 ) : stacks[ si - 1 ];

            // Build polygon points: top-edge L→R, bottom-edge R→L
            const pts = [];
            for ( let j = 0; j < n; j++ ) {
                pts.push( `${ xPos( j ) },${ yPos( topY[ j ] ) }` );
            }
            for ( let j = n - 1; j >= 0; j-- ) {
                pts.push( `${ xPos( j ) },${ yPos( botY[ j ] ) }` );
            }

            svgEls.push( el( 'polygon', {
                key:     `area${ si }`,
                points:  pts.join( ' ' ),
                fill:    s.color || '#6366f1',
                fillOpacity: opacity,
                stroke:  s.color || '#6366f1',
                strokeWidth: 1.5,
                strokeOpacity: 1,
            } ) );

            // Dots
            if ( a.showDots ) {
                for ( let j = 0; j < n; j++ ) {
                    svgEls.push( el( 'circle', { key: `dot${ si }${ j }`, cx: xPos( j ), cy: yPos( topY[ j ] ), r: 4, fill: s.color || '#6366f1', strokeWidth: 2, stroke: '#fff' } ) );
                }
            }

            // Value labels
            if ( a.showValues ) {
                for ( let j = 0; j < n; j++ ) {
                    const raw = ( s.values || [] )[ j ] || 0;
                    svgEls.push( el( 'text', { key: `sv${ si }${ j }`, x: xPos( j ), y: yPos( topY[ j ] ) - 8, textAnchor: 'middle', fill: s.color || '#6366f1', fontSize: a.valueFontSize, fontWeight: 700, fontFamily: 'inherit' }, raw ) );
                }
            }
        }

        // X-axis labels
        for ( let j = 0; j < n; j++ ) {
            svgEls.push( el( 'text', { key: `xl${ j }`, x: xPos( j ), y: H - PB + 16, textAnchor: 'middle', fill: a.textColor, fontSize: a.labelFontSize, fontFamily: 'inherit' }, xLabels[ j ] || '' ) );
        }

        // X-axis baseline
        svgEls.push( el( 'line', { key: 'xax', x1: PL, y1: PT + chartH, x2: W - PR, y2: PT + chartH, stroke: a.textColor, strokeWidth: 1, strokeOpacity: 0.3 } ) );
        svgEls.push( el( 'line', { key: 'yax', x1: PL, y1: PT, x2: PL, y2: PT + chartH, stroke: a.textColor, strokeWidth: 1, strokeOpacity: 0.3 } ) );

        // Legend
        if ( a.showLegend ) {
            const legY    = H - 10;
            const legStep = Math.min( chartW / series.length, 160 );
            series.forEach( ( s, si ) => {
                const lx = PL + si * legStep;
                svgEls.push( el( 'rect', { key: `lgn${ si }`, x: lx, y: legY - 7, width: 18, height: 10, fill: s.color || '#6366f1', rx: 2, fillOpacity: opacity } ) );
                svgEls.push( el( 'text', { key: `lgt${ si }`, x: lx + 22, y: legY, dominantBaseline: 'middle', fill: a.textColor, fontSize: a.labelFontSize - 1, fontFamily: 'inherit' }, s.label || `Series ${ si + 1 }` ) );
            } );
        }

        return el( 'svg', { viewBox: `0 0 ${ W } ${ H }`, width: '100%', style: { display: 'block', maxWidth: W + 'px', margin: '0 auto' } }, ...svgEls );
    }

    function updSer( setAttributes, series, si, field, val ) {
        setAttributes( { series: series.map( ( s, i ) => i === si ? { ...s, [field]: val } : s ) } );
    }

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function buildWrapStyle(a) {
        var tv = getTypoCssVars();
        var s = {};
        Object.assign(s, tv(a.titleTypo, '--bksa-tt-'));
        return s;
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

    registerBlockType( 'blockenberg/stacked-area', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps( { className: 'bkbg-stackedarea-wrap', style: buildWrapStyle(a) } );

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Chart Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl,  { label: __( 'Title', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),      checked: a.showTitle,    onChange: v => setAttributes( { showTitle: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Grid Lines', 'blockenberg' ), checked: a.showGridLines, onChange: v => setAttributes( { showGridLines: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Legend', 'blockenberg' ),     checked: a.showLegend,   onChange: v => setAttributes( { showLegend: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Dots', 'blockenberg' ),       checked: a.showDots,     onChange: v => setAttributes( { showDots: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Values', 'blockenberg' ),     checked: a.showValues,   onChange: v => setAttributes( { showValues: v } ) } ),
                        el( RangeControl, { label: __( 'Fill Opacity %', 'blockenberg' ),   value: a.fillOpacity, onChange: v => setAttributes( { fillOpacity: v } ), min: 10, max: 100 } ),
                    ),

                    el( PanelBody, { title: __( 'Layout', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Canvas Width', 'blockenberg' ),  value: a.svgWidth,  onChange: v => setAttributes( { svgWidth: v } ),  min: 300, max: 1200, step: 20 } ),
                        el( RangeControl, { label: __( 'Canvas Height', 'blockenberg' ), value: a.svgHeight, onChange: v => setAttributes( { svgHeight: v } ), min: 160, max: 700 } ),
                        el( RangeControl, { label: __( 'Left Padding (Y-axis)', 'blockenberg' ), value: a.padLeft,   onChange: v => setAttributes( { padLeft: v } ),   min: 20, max: 120 } ),
                        el( RangeControl, { label: __( 'Bottom Padding', 'blockenberg' ), value: a.padBottom, onChange: v => setAttributes( { padBottom: v } ), min: 20, max: 100 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl()({ label: __('Chart Title', 'blockenberg'), value: a.titleTypo, onChange: v => setAttributes({ titleTypo: v }) }),
                        el( RangeControl, { label: __( 'Label Font Size', 'blockenberg' ), value: a.labelFontSize, onChange: v => setAttributes( { labelFontSize: v } ), min: 8, max: 20 } ),
                        el( RangeControl, { label: __( 'Value Font Size', 'blockenberg' ),  value: a.valueFontSize, onChange: v => setAttributes( { valueFontSize: v } ),  min: 7, max: 16 } ),
                        el( SelectControl, { label: __( 'Label Font Weight', 'blockenberg' ), value: a.labelFontWeight, options: [{label:'400 Regular',value:'400'},{label:'500 Medium',value:'500'},{label:'600 Semi-bold',value:'600'},{label:'700 Bold',value:'700'}], __nextHasNoMarginBottom: true, onChange: v => setAttributes( { labelFontWeight: v } ) } ),
                        el( RangeControl, { label: __( 'Label Line Height', 'blockenberg' ), value: a.labelLineHeight, min: 1.0, max: 2.5, step: 0.05, __nextHasNoMarginBottom: true, onChange: v => setAttributes( { labelLineHeight: v } ) } )
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Background', 'blockenberg' ), value: a.bgColor,    onChange: v => setAttributes( { bgColor:    v || '#ffffff' } ) },
                            { label: __( 'Grid',       'blockenberg' ), value: a.gridColor,  onChange: v => setAttributes( { gridColor:  v || '#f3f4f6' } ) },
                            { label: __( 'Title',      'blockenberg' ), value: a.titleColor, onChange: v => setAttributes( { titleColor: v || '#111827' } ) },
                            { label: __( 'Text / Axes','blockenberg' ), value: a.textColor,  onChange: v => setAttributes( { textColor:  v || '#374151' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'X-Axis Labels', 'blockenberg' ), initialOpen: false },
                        el( TextareaControl, {
                            label: __( 'Labels (one per line)', 'blockenberg' ),
                            value: ( a.xLabels || [] ).join( '\n' ),
                            onChange: v => setAttributes( { xLabels: v.split( '\n' ).map( s => s.trim() ).filter( Boolean ) } ),
                        } ),
                    ),

                    el( PanelBody, { title: __( 'Series', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { series: [ ...a.series, { label: 'New Series', color: '#8b5cf6', values: ( a.xLabels || [] ).map( () => 50 ) } ] } ) }, __( '+ Add Series', 'blockenberg' ) ),
                        a.series.map( ( s, si ) =>
                            el( PanelBody, { key: si, title: s.label || `Series ${ si + 1 }`, initialOpen: false },
                                el( TextControl, { label: __( 'Label', 'blockenberg' ),      value: s.label, onChange: v => updSer( setAttributes, a.series, si, 'label', v ) } ),
                                el( BkbgColorSwatch, { label: __( 'Color', 'blockenberg' ), value: s.color, onChange: v => updSer( setAttributes, a.series, si, 'color', v ) } ),
                                el( TextareaControl, {
                                    label: __( 'Values (comma-separated)', 'blockenberg' ),
                                    value: ( s.values || [] ).join( ', ' ),
                                    onChange: v => updSer( setAttributes, a.series, si, 'values', v.split( ',' ).map( n => parseFloat( n.trim() ) || 0 ) ),
                                } ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { series: a.series.filter( ( _, x ) => x !== si ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-stackedarea-title', style: { color: a.titleColor } }, a.title ),
                el( 'div', { className: 'bkbg-stackedarea-svg' }, renderStackedArea( a ) ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save( { className: 'bkbg-stackedarea-wrap', style: buildWrapStyle(a) } );
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-stackedarea-title', style: { color: a.titleColor } }, a.title ) : null,
                el( 'div', { className: 'bkbg-stackedarea-svg' }, renderStackedArea( a ) ),
            );
        },
    } );
}() );

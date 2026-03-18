( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, Button, ColorPicker, Popover } = window.wp.components;
    const { __ } = window.wp.i18n;
    const { useState } = window.wp.element;

    function getTypographyControl() {
        return (window.bkbgTypographyControl || function () { return null; });
    }

    function _tv(typo, prefix) {
        if (!typo) return {};
        var s = {};
        if (typo.family)     s[prefix + 'font-family'] = "'" + typo.family + "', sans-serif";
        if (typo.weight)     s[prefix + 'font-weight'] = typo.weight;
        if (typo.transform)  s[prefix + 'text-transform'] = typo.transform;
        if (typo.style)      s[prefix + 'font-style'] = typo.style;
        if (typo.decoration) s[prefix + 'text-decoration'] = typo.decoration;
        var su = typo.sizeUnit || 'px';
        if (typo.sizeDesktop !== '' && typo.sizeDesktop != null) s[prefix + 'font-size-d'] = typo.sizeDesktop + su;
        if (typo.sizeTablet  !== '' && typo.sizeTablet  != null) s[prefix + 'font-size-t'] = typo.sizeTablet + su;
        if (typo.sizeMobile  !== '' && typo.sizeMobile  != null) s[prefix + 'font-size-m'] = typo.sizeMobile + su;
        var lhu = typo.lineHeightUnit || '';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) s[prefix + 'line-height-d'] = typo.lineHeightDesktop + lhu;
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) s[prefix + 'line-height-t'] = typo.lineHeightTablet + lhu;
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) s[prefix + 'line-height-m'] = typo.lineHeightMobile + lhu;
        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) s[prefix + 'letter-spacing-d'] = typo.letterSpacingDesktop + lsu;
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) s[prefix + 'letter-spacing-t'] = typo.letterSpacingTablet + lsu;
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) s[prefix + 'letter-spacing-m'] = typo.letterSpacingMobile + lsu;
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) s[prefix + 'word-spacing-d'] = typo.wordSpacingDesktop + wsu;
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) s[prefix + 'word-spacing-t'] = typo.wordSpacingTablet + wsu;
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) s[prefix + 'word-spacing-m'] = typo.wordSpacingMobile + wsu;
        return s;
    }

    // ── Renderer ──────────────────────────────────────────────────────────────
    function renderBoxPlot( a ) {
        const series = a.series || [];
        const W  = a.svgWidth;
        const H  = a.svgHeight;
        const PT = a.padTop;
        const PL = a.padLeft;
        const PR = a.padRight;
        const PB = a.padBottom;
        const BW = a.boxWidth;
        const WW = a.whiskerWidth;

        const allVals = series.flatMap( s => [
            s.min, s.q1, s.median, s.mean, s.q3, s.max,
            ...( s.outliers || [] )
        ].filter( v => v !== undefined ) );
        const minVal = Math.min( ...allVals );
        const maxVal = Math.max( ...allVals );
        const range  = maxVal - minVal || 1;
        const chartH = H - PT - PB;
        const chartW = W - PL - PR;

        function yAt( v ) { return H - PB - ( ( v - minVal ) / range ) * chartH; }
        function xAt( i ) { return PL + ( i + 0.5 ) * ( chartW / series.length ); }

        const svgEls = [];
        svgEls.push( el( 'rect', { key: 'bg', x: 0, y: 0, width: W, height: H, fill: a.bgColor || '#ffffff', rx: 8 } ) );

        // Horizontal grid lines
        if ( a.showGridLines ) {
            const ticks = 5;
            for ( let i = 0; i <= ticks; i++ ) {
                const v  = minVal + range * i / ticks;
                const gy = yAt( v );
                svgEls.push( el( 'line', { key: `gy${ i }`, x1: PL, y1: gy, x2: W - PR, y2: gy, stroke: a.gridColor || '#f3f4f6', strokeWidth: 1 } ) );
                svgEls.push( el( 'text', { key: `gyt${ i }`, x: PL - 6, y: gy, textAnchor: 'end', dominantBaseline: 'middle', fill: '#9ca3af', fontSize: a.valueFontSize, fontFamily: 'inherit' }, String( Math.round( v ) ) ) );
            }
        }

        // Axes
        svgEls.push( el( 'line', { key: 'axX', x1: PL, y1: H - PB, x2: W - PR, y2: H - PB, stroke: '#d1d5db', strokeWidth: 1 } ) );
        svgEls.push( el( 'line', { key: 'axY', x1: PL, y1: PT,      x2: PL,     y2: H - PB, stroke: '#d1d5db', strokeWidth: 1 } ) );

        // Boxes
        series.forEach( ( s, i ) => {
            const cx  = xAt( i );
            const clr = s.color || '#6366f1';
            const yQ1     = yAt( s.q1 );
            const yQ3     = yAt( s.q3 );
            const yMed    = yAt( s.median );
            const yMin    = yAt( s.min );
            const yMax    = yAt( s.max );
            const yMean   = a.showMean ? yAt( s.mean ) : null;
            const boxX    = cx - BW / 2;

            // Whisker: min to Q1
            svgEls.push( el( 'line', { key: `wlo${ i }`, x1: cx, y1: yMin, x2: cx, y2: yQ1, stroke: clr, strokeWidth: 1.5, strokeDasharray: '4 2' } ) );
            // Whisker cap min
            svgEls.push( el( 'line', { key: `wlc${ i }`, x1: cx - WW / 2, y1: yMin, x2: cx + WW / 2, y2: yMin, stroke: clr, strokeWidth: 2 } ) );
            // Whisker: Q3 to max
            svgEls.push( el( 'line', { key: `wup${ i }`, x1: cx, y1: yQ3, x2: cx, y2: yMax, stroke: clr, strokeWidth: 1.5, strokeDasharray: '4 2' } ) );
            // Whisker cap max
            svgEls.push( el( 'line', { key: `wuc${ i }`, x1: cx - WW / 2, y1: yMax, x2: cx + WW / 2, y2: yMax, stroke: clr, strokeWidth: 2 } ) );

            // IQR box
            svgEls.push( el( 'rect', { key: `box${ i }`, x: boxX, y: yQ3, width: BW, height: Math.abs( yQ1 - yQ3 ), fill: clr, fillOpacity: 0.2, stroke: clr, strokeWidth: 2, rx: 3 } ) );
            // Median line
            svgEls.push( el( 'line', { key: `med${ i }`, x1: boxX, y1: yMed, x2: boxX + BW, y2: yMed, stroke: clr, strokeWidth: 3 } ) );

            // Mean diamond
            if ( yMean !== null ) {
                const dm = 5;
                svgEls.push( el( 'polygon', { key: `mean${ i }`, points: `${ cx },${ yMean - dm } ${ cx + dm },${ yMean } ${ cx },${ yMean + dm } ${ cx - dm },${ yMean }`, fill: '#ffffff', stroke: clr, strokeWidth: 2 } ) );
            }

            // Outliers
            if ( a.showOutliers ) {
                ( s.outliers || [] ).forEach( ( ov, oi ) => {
                    svgEls.push( el( 'circle', { key: `out${ i }${ oi }`, cx, cy: yAt( ov ), r: 4, fill: 'none', stroke: clr, strokeWidth: 2 } ) );
                } );
            }

            // X label
            svgEls.push( el( 'text', { key: `lbl${ i }`, x: cx, y: H - PB + 16, textAnchor: 'middle', fill: a.textColor || '#374151', fontSize: a.labelFontSize, fontFamily: 'inherit' }, s.label || '' ) );
        } );

        // Legend
        if ( a.showLegend ) {
            const items = [
                { label: 'Median', shape: 'line' },
                { label: 'Mean',   shape: 'diamond' },
                { label: 'IQR Box', shape: 'rect' },
                { label: 'Outlier', shape: 'circle' },
            ];
            items.forEach( ( it, li ) => {
                const lx = PL + li * 120;
                const ly = PT - 18;
                if ( it.shape === 'line' ) {
                    svgEls.push( el( 'line', { key: `leg${ li }`, x1: lx, y1: ly, x2: lx + 18, y2: ly, stroke: '#6b7280', strokeWidth: 3 } ) );
                } else if ( it.shape === 'diamond' ) {
                    svgEls.push( el( 'polygon', { key: `leg${ li }`, points: `${ lx + 9 },${ ly - 5 } ${ lx + 14 },${ ly } ${ lx + 9 },${ ly + 5 } ${ lx + 4 },${ ly }`, fill: '#fff', stroke: '#6b7280', strokeWidth: 2 } ) );
                } else if ( it.shape === 'rect' ) {
                    svgEls.push( el( 'rect', { key: `leg${ li }`, x: lx, y: ly - 5, width: 18, height: 10, fill: '#6b728033', stroke: '#6b7280', strokeWidth: 2, rx: 2 } ) );
                } else {
                    svgEls.push( el( 'circle', { key: `leg${ li }`, cx: lx + 9, cy: ly, r: 4, fill: 'none', stroke: '#6b7280', strokeWidth: 2 } ) );
                }
                svgEls.push( el( 'text', { key: `legt${ li }`, x: lx + 22, y: ly, dominantBaseline: 'middle', fill: a.textColor, fontSize: 11, fontFamily: 'inherit' }, it.label ) );
            } );
        }

        return el( 'svg', { viewBox: `0 0 ${ W } ${ H }`, width: '100%', style: { display: 'block', maxWidth: W + 'px', margin: '0 auto' } }, ...svgEls );
    }

    function updSer( setAttributes, series, si, field, val ) {
        setAttributes( { series: series.map( ( s, i ) => i === si ? { ...s, [field]: val } : s ) } );
    }
    function parseOutliers( raw ) {
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

    registerBlockType( 'blockenberg/box-plot', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps( { className: 'bkbg-boxplot-wrap', style: Object.assign({}, _tv(a.typoTitle, '--bkbg-boxplot-title-')) } );

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Chart Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl,  { label: __( 'Title', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),     checked: a.showTitle,    onChange: v => setAttributes( { showTitle: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Grid Lines', 'blockenberg' ), checked: a.showGridLines, onChange: v => setAttributes( { showGridLines: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Mean Diamond', 'blockenberg' ), checked: a.showMean,  onChange: v => setAttributes( { showMean: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Outliers', 'blockenberg' ),  checked: a.showOutliers, onChange: v => setAttributes( { showOutliers: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Legend', 'blockenberg' ),    checked: a.showLegend,   onChange: v => setAttributes( { showLegend: v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Layout', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Canvas Width', 'blockenberg' ),    value: a.svgWidth,      onChange: v => setAttributes( { svgWidth: v } ),      min: 300, max: 1200, step: 20 } ),
                        el( RangeControl, { label: __( 'Canvas Height', 'blockenberg' ),   value: a.svgHeight,     onChange: v => setAttributes( { svgHeight: v } ),     min: 150, max: 700 } ),
                        el( RangeControl, { label: __( 'Box Width', 'blockenberg' ),       value: a.boxWidth,      onChange: v => setAttributes( { boxWidth: v } ),      min: 16, max: 100 } ),
                        el( RangeControl, { label: __( 'Whisker Cap Width', 'blockenberg' ), value: a.whiskerWidth, onChange: v => setAttributes( { whiskerWidth: v } ), min: 8, max: 80 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el(getTypographyControl(), { label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: v => setAttributes({ typoTitle: v }) }),
                        el( RangeControl, { label: __( 'Label Font Size', 'blockenberg' ), value: a.labelFontSize, onChange: v => setAttributes( { labelFontSize: v } ), min: 9, max: 22 } ),
                        el(RangeControl, { label: __('Value Font Size (px)', 'blockenberg'), value: a.valueFontSize, min: 8, max: 18, onChange: v => setAttributes({ valueFontSize: v }) })
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
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { series: [ ...a.series, { label: 'New Group', color: '#6366f1', min: 30, q1: 45, median: 60, mean: 58, q3: 72, max: 90, outliers: [] } ] } ) }, __( '+ Add Group', 'blockenberg' ) ),
                        a.series.map( ( s, si ) =>
                            el( PanelBody, { key: si, title: s.label || `Group ${ si + 1 }`, initialOpen: false },
                                el( TextControl,  { label: __( 'Label', 'blockenberg' ),                value: s.label,    onChange: v => updSer( setAttributes, a.series, si, 'label', v ) } ),
                                el( BkbgColorSwatch, { label: __( 'Color', 'blockenberg' ), value: s.color, onChange: v => updSer( setAttributes, a.series, si, 'color', v ) } ),
                                el( RangeControl, { label: __( 'Min', 'blockenberg' ),                  value: s.min,      onChange: v => updSer( setAttributes, a.series, si, 'min', v ),    min: -1000, max: 10000, step: 1 } ),
                                el( RangeControl, { label: __( 'Q1 (25th pct)', 'blockenberg' ),        value: s.q1,       onChange: v => updSer( setAttributes, a.series, si, 'q1', v ),     min: -1000, max: 10000, step: 1 } ),
                                el( RangeControl, { label: __( 'Median (Q2)', 'blockenberg' ),          value: s.median,   onChange: v => updSer( setAttributes, a.series, si, 'median', v ), min: -1000, max: 10000, step: 1 } ),
                                el( RangeControl, { label: __( 'Mean', 'blockenberg' ),                 value: s.mean,     onChange: v => updSer( setAttributes, a.series, si, 'mean', v ),   min: -1000, max: 10000, step: 1 } ),
                                el( RangeControl, { label: __( 'Q3 (75th pct)', 'blockenberg' ),        value: s.q3,       onChange: v => updSer( setAttributes, a.series, si, 'q3', v ),     min: -1000, max: 10000, step: 1 } ),
                                el( RangeControl, { label: __( 'Max', 'blockenberg' ),                  value: s.max,      onChange: v => updSer( setAttributes, a.series, si, 'max', v ),    min: -1000, max: 10000, step: 1 } ),
                                el( TextControl,  { label: __( 'Outliers (comma separated)', 'blockenberg' ), value: ( s.outliers || [] ).join( ', ' ), onChange: v => updSer( setAttributes, a.series, si, 'outliers', parseOutliers( v ) ) } ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { series: a.series.filter( ( _, x ) => x !== si ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-boxplot-title', style: { color: a.titleColor } }, a.title ),
                el( 'div', { className: 'bkbg-boxplot-svg' }, renderBoxPlot( a ) ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save( { className: 'bkbg-boxplot-wrap', style: Object.assign({}, _tv(a.typoTitle, '--bkbg-boxplot-title-')) } );
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-boxplot-title', style: { color: a.titleColor } }, a.title ) : null,
                el( 'div', { className: 'bkbg-boxplot-svg' }, renderBoxPlot( a ) ),
            );
        },
    } );
}() );

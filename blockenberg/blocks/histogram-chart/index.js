( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, Button } = window.wp.components;
    const { __ } = window.wp.i18n;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    // ── Renderer ──────────────────────────────────────────────────────────────
    function renderHistogram( a ) {
        const bins = a.bins || [];
        const W  = a.svgWidth;
        const H  = a.svgHeight;
        const PT = a.padTop;
        const PL = a.padLeft;
        const PR = a.padRight;
        const PB = a.padBottom;
        const chartW = W - PL - PR;
        const chartH = H - PT - PB;
        const n = bins.length;
        if ( ! n ) return el( 'svg', { viewBox: `0 0 ${ W } ${ H }`, width: '100%' } );

        const maxCount = Math.max( ...bins.map( b => b.count || 0 ) ) || 1;
        const barW     = chartW / n;
        const gap      = a.barGap || 2;

        function sy( v ) { return PT + chartH - ( v / maxCount ) * chartH; }
        function sh( v ) { return ( v / maxCount ) * chartH; }

        const svgEls = [];
        svgEls.push( el( 'rect', { key: 'bg', x: 0, y: 0, width: W, height: H, fill: a.bgColor || '#ffffff', rx: 8 } ) );

        // Grid lines + Y ticks
        if ( a.showGrid ) {
            const ticks = 5;
            for ( let t = 0; t <= ticks; t++ ) {
                const gy  = PT + ( t / ticks ) * chartH;
                const yV  = Math.round( maxCount * ( 1 - t / ticks ) );
                svgEls.push( el( 'line', { key: `gl${ t }`, x1: PL, y1: gy, x2: W - PR, y2: gy, stroke: a.gridColor || '#f3f4f6', strokeWidth: 1 } ) );
                svgEls.push( el( 'text', { key: `gy${ t }`, x: PL - 8, y: gy, textAnchor: 'end', dominantBaseline: 'middle', fill: a.textColor, fontSize: a.labelFontSize - 1, fontFamily: 'inherit' }, yV ) );
            }
        }

        // Bars
        bins.forEach( ( bin, i ) => {
            const bx  = PL + i * barW + gap / 2;
            const bw  = barW - gap;
            const bh  = sh( bin.count || 0 );
            const by  = sy( bin.count || 0 );
            svgEls.push( el( 'rect', { key: `bar${ i }`, x: bx, y: by, width: bw, height: bh, fill: a.barColor || '#6366f1', rx: 3, fillOpacity: 0.88 } ) );

            // Value label above bar
            if ( a.showValues && bh > 12 ) {
                svgEls.push( el( 'text', { key: `val${ i }`, x: bx + bw / 2, y: by - 4, textAnchor: 'middle', fill: a.barColor || '#6366f1', fontSize: a.valueFontSize, fontWeight: 700, fontFamily: 'inherit' }, bin.count ) );
            }

            // X label
            svgEls.push( el( 'text', { key: `xl${ i }`, x: bx + bw / 2, y: PT + chartH + 18, textAnchor: 'middle', fill: a.textColor, fontSize: a.labelFontSize - 2, fontFamily: 'inherit', transform: n > 6 ? `rotate(-35,${ bx + bw / 2 },${ PT + chartH + 18 })` : undefined }, bin.label ) );
        } );

        // Density curve (optional) — quadratic smooth through bar midpoints
        if ( a.showCurve && bins.length > 2 ) {
            const pts = bins.map( ( b, i ) => [ PL + i * barW + barW / 2, sy( b.count || 0 ) ] );
            let d = `M ${ pts[0][0] } ${ pts[0][1] }`;
            for ( let i = 1; i < pts.length; i++ ) {
                const mx = ( pts[ i - 1 ][0] + pts[ i ][0] ) / 2;
                d += ` Q ${ pts[ i - 1 ][0] } ${ pts[ i - 1 ][1] } ${ mx } ${ ( pts[ i - 1 ][1] + pts[ i ][1] ) / 2 }`;
            }
            d += ` Q ${ pts[ pts.length - 2 ][0] } ${ pts[ pts.length - 2 ][1] } ${ pts[ pts.length - 1 ][0] } ${ pts[ pts.length - 1 ][1] }`;
            svgEls.push( el( 'path', { key: 'curve', d, fill: 'none', stroke: a.curveColor || '#ef4444', strokeWidth: 2.5, strokeLinejoin: 'round' } ) );
        }

        // Axes
        svgEls.push( el( 'line', { key: 'xax', x1: PL, y1: PT + chartH, x2: W - PR, y2: PT + chartH, stroke: a.textColor, strokeWidth: 1, strokeOpacity: 0.4 } ) );
        svgEls.push( el( 'line', { key: 'yax', x1: PL, y1: PT, x2: PL, y2: PT + chartH, stroke: a.textColor, strokeWidth: 1, strokeOpacity: 0.4 } ) );

        // Axis labels
        svgEls.push( el( 'text', { key: 'xlab', x: PL + chartW / 2, y: H - 6, textAnchor: 'middle', fill: a.textColor, fontSize: a.labelFontSize, fontFamily: 'inherit' }, a.xAxisLabel ) );
        svgEls.push( el( 'text', { key: 'ylab', x: 14, y: PT + chartH / 2, textAnchor: 'middle', fill: a.textColor, fontSize: a.labelFontSize, fontFamily: 'inherit', transform: `rotate(-90, 14, ${ PT + chartH / 2 })` }, a.yAxisLabel ) );

        return el( 'svg', { viewBox: `0 0 ${ W } ${ H }`, width: '100%', style: { display: 'block', maxWidth: W + 'px', margin: '0 auto' } }, ...svgEls );
    }

    registerBlockType( 'blockenberg/histogram-chart', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            var _tv = getTypoCssVars();
            var wrapStyle = {};
            Object.assign(wrapStyle, _tv(a.titleTypo || {}, '--bkbg-hist-tt-'));
            if (a.titleFontSize && a.titleFontSize !== 18) wrapStyle['--bkbg-hist-tt-sz'] = a.titleFontSize + 'px';
            if (a.titleFontWeight && a.titleFontWeight !== '700') wrapStyle['--bkbg-hist-tt-fw'] = a.titleFontWeight;
            if (a.titleLineHeight && a.titleLineHeight !== 1.2) wrapStyle['--bkbg-hist-tt-lh'] = String(a.titleLineHeight);
            const blockProps = useBlockProps( { className: 'bkbg-histogram-wrap', style: wrapStyle } );

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Chart Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl,   { label: __( 'Title', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),   checked: a.showTitle,  onChange: v => setAttributes( { showTitle:  v } ) } ),
                        el( ToggleControl, { label: __( 'Show Grid', 'blockenberg' ),    checked: a.showGrid,   onChange: v => setAttributes( { showGrid:   v } ) } ),
                        el( ToggleControl, { label: __( 'Show Values', 'blockenberg' ),  checked: a.showValues, onChange: v => setAttributes( { showValues: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Density Curve', 'blockenberg' ), checked: a.showCurve,  onChange: v => setAttributes( { showCurve:  v } ) } ),
                        el( TextControl, { label: __( 'X Axis Label', 'blockenberg' ), value: a.xAxisLabel, onChange: v => setAttributes( { xAxisLabel: v } ) } ),
                        el( TextControl, { label: __( 'Y Axis Label', 'blockenberg' ), value: a.yAxisLabel, onChange: v => setAttributes( { yAxisLabel: v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Layout', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Canvas Width', 'blockenberg' ),  value: a.svgWidth,      onChange: v => setAttributes( { svgWidth:      v } ), min: 300, max: 1200, step: 20 } ),
                        el( RangeControl, { label: __( 'Canvas Height', 'blockenberg' ), value: a.svgHeight,     onChange: v => setAttributes( { svgHeight:     v } ), min: 160, max: 700 } ),
                        el( RangeControl, { label: __( 'Bar Gap (px)', 'blockenberg' ),  value: a.barGap,        onChange: v => setAttributes( { barGap:        v } ), min: 0, max: 20 } ),
                        el( RangeControl, { label: __( 'Left Padding', 'blockenberg' ),  value: a.padLeft,       onChange: v => setAttributes( { padLeft:       v } ), min: 20, max: 120 } ),
                        el( RangeControl, { label: __( 'Bottom Padding', 'blockenberg' ),value: a.padBottom,     onChange: v => setAttributes( { padBottom:     v } ), min: 30, max: 120 } ),
                    ),

                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el(getTypographyControl(), { label: __('Title Typography', 'blockenberg'), value: a.titleTypo || {}, onChange: v => setAttributes({ titleTypo: v }) }),
                        el( RangeControl, { label: __( 'Label Font Size', 'blockenberg' ), value: a.labelFontSize, onChange: v => setAttributes( { labelFontSize: v } ), min: 8, max: 20 } ),
                        el( RangeControl, { label: __( 'Value Font Size', 'blockenberg' ),  value: a.valueFontSize, onChange: v => setAttributes( { valueFontSize:  v } ), min: 7, max: 16 } )
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Bar fill',      'blockenberg' ), value: a.barColor,   onChange: v => setAttributes( { barColor:   v || '#6366f1' } ) },
                            { label: __( 'Density curve', 'blockenberg' ), value: a.curveColor, onChange: v => setAttributes( { curveColor: v || '#ef4444' } ) },
                            { label: __( 'Background',    'blockenberg' ), value: a.bgColor,    onChange: v => setAttributes( { bgColor:    v || '#ffffff' } ) },
                            { label: __( 'Grid',          'blockenberg' ), value: a.gridColor,  onChange: v => setAttributes( { gridColor:  v || '#f3f4f6' } ) },
                            { label: __( 'Title',         'blockenberg' ), value: a.titleColor, onChange: v => setAttributes( { titleColor: v || '#111827' } ) },
                            { label: __( 'Text/Axes',     'blockenberg' ), value: a.textColor,  onChange: v => setAttributes( { textColor:  v || '#374151' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Bins', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { bins: [ ...a.bins, { label: 'New bin', count: 10 } ] } ) }, __( '+ Add Bin', 'blockenberg' ) ),
                        a.bins.map( ( bin, bi ) =>
                            el( 'div', { key: bi, style: { display: 'flex', gap: 6, alignItems: 'flex-end', marginBottom: 6 } },
                                el( TextControl, { label: bi === 0 ? __( 'Label', 'blockenberg' ) : undefined, value: bin.label, onChange: v => setAttributes( { bins: a.bins.map( ( b, j ) => j === bi ? { ...b, label: v } : b ) } ), style: { flex: 2 } } ),
                                el( TextControl, { label: bi === 0 ? __( 'Count', 'blockenberg' ) : undefined, value: String( bin.count ), type: 'number', onChange: v => setAttributes( { bins: a.bins.map( ( b, j ) => j === bi ? { ...b, count: parseInt( v ) || 0 } : b ) } ), style: { flex: 1 } } ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { bins: a.bins.filter( ( _, j ) => j !== bi ) } ) }, '✕' ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-histogram-title', style: { color: a.titleColor } }, a.title ),
                el( 'div', { className: 'bkbg-histogram-svg' }, renderHistogram( a ) ),
            );
        },

        save: function ( { attributes: a } ) {
            var _tv = getTypoCssVars();
            var saveStyle = {};
            Object.assign(saveStyle, _tv(a.titleTypo || {}, '--bkbg-hist-tt-'));
            if (a.titleFontSize && a.titleFontSize !== 18) saveStyle['--bkbg-hist-tt-sz'] = a.titleFontSize + 'px';
            if (a.titleFontWeight && a.titleFontWeight !== '700') saveStyle['--bkbg-hist-tt-fw'] = a.titleFontWeight;
            if (a.titleLineHeight && a.titleLineHeight !== 1.2) saveStyle['--bkbg-hist-tt-lh'] = String(a.titleLineHeight);
            const blockProps = useBlockProps.save( { className: 'bkbg-histogram-wrap', style: saveStyle } );
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-histogram-title', style: { color: a.titleColor } }, a.title ) : null,
                el( 'div', { className: 'bkbg-histogram-svg' }, renderHistogram( a ) ),
            );
        },
    } );
}() );

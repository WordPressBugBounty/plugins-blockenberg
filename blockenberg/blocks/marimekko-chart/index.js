( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, Button } = window.wp.components;
    const { __ } = window.wp.i18n;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    // ── Renderer ──────────────────────────────────────────────────────────────
    function renderMarimekko( a ) {
        const cols   = a.columns || [];
        const colors = a.segmentColors || [ '#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899' ];
        const W  = a.svgWidth;
        const H  = a.svgHeight;
        const PT = a.padTop;
        const PL = a.padLeft;
        const PR = a.padRight;
        const PB = a.padBottom;
        const CG = a.colGap;
        const chartW = W - PL - PR;
        const chartH = H - PT - PB;

        if ( ! cols.length ) return el( 'svg', { viewBox: `0 0 ${ W } ${ H }`, width: '100%' } );

        // Total size (normalise columns so they fill 100%)
        const totalSize = cols.reduce( ( s, c ) => s + ( c.size || 0 ), 0 ) || 1;

        // Collect all unique segment labels in order
        const segLabels = [];
        cols.forEach( c => {
            ( c.segments || [] ).forEach( seg => {
                if ( ! segLabels.includes( seg.label ) ) segLabels.push( seg.label );
            } );
        } );

        const svgEls = [];
        svgEls.push( el( 'rect', { key: 'bg', x: 0, y: 0, width: W, height: H, fill: a.bgColor || '#ffffff', rx: 8 } ) );

        // Y axis grid (0–100%)
        if ( a.showYAxis ) {
            for ( let t = 0; t <= 5; t++ ) {
                const gy = PT + ( t / 5 ) * chartH;
                svgEls.push( el( 'line', { key: `gl${ t }`, x1: PL, y1: gy, x2: W - PR, y2: gy, stroke: a.gridColor || '#f3f4f6', strokeWidth: 1 } ) );
                svgEls.push( el( 'text', { key: `gy${ t }`, x: PL - 6, y: gy, textAnchor: 'end', dominantBaseline: 'middle', fill: a.textColor, fontSize: a.labelFontSize - 1, fontFamily: 'inherit' }, `${ 100 - t * 20 }%` ) );
            }
            // Y axis line
            svgEls.push( el( 'line', { key: 'yax', x1: PL, y1: PT, x2: PL, y2: PT + chartH, stroke: a.textColor, strokeWidth: 1, strokeOpacity: 0.3 } ) );
        }

        // Render columns
        let xCursor = 0;
        cols.forEach( ( col, ci ) => {
            const colW    = ( ( col.size || 0 ) / totalSize ) * chartW - CG;
            const colX    = PL + ( xCursor / totalSize ) * chartW;
            const segs    = col.segments || [];
            const segTotal = segs.reduce( ( s, sg ) => s + ( sg.value || 0 ), 0 ) || 1;

            let yCursor = 0;
            segs.forEach( ( seg, si ) => {
                const segPct = ( seg.value || 0 ) / segTotal;
                const segH   = segPct * chartH;
                const segY   = PT + yCursor;
                const colorIdx = segLabels.indexOf( seg.label );
                const clr    = colors[ colorIdx % colors.length ] || '#6366f1';

                svgEls.push( el( 'rect', { key: `seg${ ci }${ si }`, x: colX, y: segY, width: Math.max( 1, colW ), height: segH, fill: clr, stroke: '#fff', strokeWidth: 1 } ) );

                // Segment value label
                if ( a.showValues && segH > 18 && colW > 24 ) {
                    svgEls.push( el( 'text', { key: `sv${ ci }${ si }`, x: colX + colW / 2, y: segY + segH / 2, textAnchor: 'middle', dominantBaseline: 'middle', fill: '#ffffff', fontSize: a.valueFontSize, fontFamily: 'inherit', fontWeight: 600 }, `${ Math.round( seg.value ) }%` ) );
                }

                yCursor += segH;
            } );

            // Column label below
            if ( a.showColLabels ) {
                const lx = colX + colW / 2;
                const ly1 = H - PB + 14;
                const ly2 = H - PB + 26;
                svgEls.push( el( 'text', { key: `clbl${ ci }`, x: lx, y: ly1, textAnchor: 'middle', fill: a.textColor, fontSize: a.labelFontSize, fontFamily: 'inherit', fontWeight: a.labelFontWeight || 600 }, col.label ) );
                svgEls.push( el( 'text', { key: `csz${ ci }`, x: lx, y: ly2, textAnchor: 'middle', fill: a.textColor, fontSize: a.labelFontSize - 1, fontFamily: 'inherit', fillOpacity: 0.7 }, `${ col.size || 0 }%` ) );
            }

            xCursor += col.size || 0;
        } );

        // X baseline
        svgEls.push( el( 'line', { key: 'xax', x1: PL, y1: PT + chartH, x2: W - PR, y2: PT + chartH, stroke: a.textColor, strokeWidth: 1, strokeOpacity: 0.3 } ) );

        // Legend
        if ( a.showLegend ) {
            const legY    = H - 12;
            const legStep = Math.min( 140, chartW / segLabels.length );
            segLabels.forEach( ( lbl, li ) => {
                const lx = PL + li * legStep;
                svgEls.push( el( 'rect', { key: `lgn${ li }`, x: lx, y: legY - 7, width: 14, height: 10, fill: colors[ li % colors.length ], rx: 2 } ) );
                svgEls.push( el( 'text', { key: `lgt${ li }`, x: lx + 18, y: legY, dominantBaseline: 'middle', fill: a.textColor, fontSize: a.labelFontSize - 1, fontFamily: 'inherit' }, lbl ) );
            } );
        }

        return el( 'svg', { viewBox: `0 0 ${ W } ${ H }`, width: '100%', style: { display: 'block', maxWidth: W + 'px', margin: '0 auto' } }, ...svgEls );
    }

    function updCol( setAttributes, columns, ci, field, val ) {
        setAttributes( { columns: columns.map( ( c, i ) => i === ci ? { ...c, [field]: val } : c ) } );
    }
    function updSeg( setAttributes, columns, ci, si, field, val ) {
        setAttributes( { columns: columns.map( ( c, i ) => i !== ci ? c : {
            ...c,
            segments: ( c.segments || [] ).map( ( sg, j ) => j === si ? { ...sg, [field]: val } : sg ),
        } ) } );
    }

    registerBlockType( 'blockenberg/marimekko-chart', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps( (function () {
                var _tvFn = getTypoCssVars();
                var s = {};
                if (_tvFn) Object.assign(s, _tvFn(a.titleTypo, '--bkbg-mk-tt-'));
                return { className: 'bkbg-marimekko-wrap', style: s };
            })() );

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Chart Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl,   { label: __( 'Title', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),        checked: a.showTitle,    onChange: v => setAttributes( { showTitle:    v } ) } ),
                        el( ToggleControl, { label: __( 'Show Values', 'blockenberg' ),       checked: a.showValues,   onChange: v => setAttributes( { showValues:   v } ) } ),
                        el( ToggleControl, { label: __( 'Show Legend', 'blockenberg' ),       checked: a.showLegend,   onChange: v => setAttributes( { showLegend:   v } ) } ),
                        el( ToggleControl, { label: __( 'Show Column Labels', 'blockenberg' ),checked: a.showColLabels,onChange: v => setAttributes( { showColLabels: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Y Axis', 'blockenberg' ),       checked: a.showYAxis,    onChange: v => setAttributes( { showYAxis:    v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Layout', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Canvas Width', 'blockenberg' ),  value: a.svgWidth,      onChange: v => setAttributes( { svgWidth:      v } ), min: 300, max: 1200, step: 20 } ),
                        el( RangeControl, { label: __( 'Canvas Height', 'blockenberg' ), value: a.svgHeight,     onChange: v => setAttributes( { svgHeight:     v } ), min: 200, max: 800 } ),
                        el( RangeControl, { label: __( 'Column Gap', 'blockenberg' ),    value: a.colGap,        onChange: v => setAttributes( { colGap:        v } ), min: 0, max: 20 } ),
                        el( RangeControl, { label: __( 'Left Padding', 'blockenberg' ),  value: a.padLeft,       onChange: v => setAttributes( { padLeft:       v } ), min: 20, max: 120 } ),
                        el( RangeControl, { label: __( 'Bottom Padding', 'blockenberg' ),value: a.padBottom,     onChange: v => setAttributes( { padBottom:     v } ), min: 30, max: 120 } ),
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

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        (function () { var C = getTypoControl(); return C ? el(C, { label: 'Title', value: a.titleTypo, onChange: v => setAttributes( { titleTypo: v } ) }) : null; })(),
                        el( RangeControl, { label: __( 'Label Font Size', 'blockenberg' ),   value: a.labelFontSize, onChange: v => setAttributes( { labelFontSize: v } ), min: 8, max: 20 } ),
                        el( RangeControl, { label: __( 'Label Font Weight', 'blockenberg' ), value: a.labelFontWeight || 600, onChange: v => setAttributes( { labelFontWeight: v } ), min: 300, max: 900, step: 100 } ),
                        el( RangeControl, { label: __( 'Value Font Size', 'blockenberg' ),   value: a.valueFontSize, onChange: v => setAttributes( { valueFontSize:  v } ), min: 7, max: 16 } )
                    ),
el( PanelBody, { title: __( 'Segment Colors', 'blockenberg' ), initialOpen: false },
                        el( 'p', { style: { fontSize: 12, color: '#6b7280', marginBottom: 8 } }, __( 'Colors are applied in order to segments across all columns.', 'blockenberg' ) ),
                        ( a.segmentColors || [] ).map( ( clr, ci ) =>
                            el( 'div', { key: ci, style: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 } },
                                el( 'input', { type: 'color', value: clr, style: { width: 40, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer' }, onChange: e => setAttributes( { segmentColors: a.segmentColors.map( ( c, j ) => j === ci ? e.target.value : c ) } ) } ),
                                el( TextControl, { value: clr, onChange: v => setAttributes( { segmentColors: a.segmentColors.map( ( c, j ) => j === ci ? v : c ) } ), style: { flex: 1 } } ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { segmentColors: a.segmentColors.filter( ( _, j ) => j !== ci ) } ) }, '✕' ),
                            )
                        ),
                        el( Button, { variant: 'secondary', style: { marginTop: 6 }, onClick: () => setAttributes( { segmentColors: [ ...( a.segmentColors || [] ), '#94a3b8' ] } ) }, __( '+ Add Color', 'blockenberg' ) ),
                    ),

                    el( PanelBody, { title: __( 'Columns', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { columns: [ ...a.columns, { label: 'New Region', size: 10, segments: [ { label: 'Segment A', value: 60 }, { label: 'Segment B', value: 40 } ] } ] } ) }, __( '+ Add Column', 'blockenberg' ) ),
                        a.columns.map( ( col, ci ) =>
                            el( PanelBody, { key: ci, title: `${ col.label } (${ col.size }%)`, initialOpen: false },
                                el( TextControl,  { label: __( 'Column Label', 'blockenberg' ), value: col.label, onChange: v => updCol( setAttributes, a.columns, ci, 'label', v ) } ),
                                el( RangeControl, { label: __( 'Column Width % (relative size)', 'blockenberg' ), value: col.size, onChange: v => updCol( setAttributes, a.columns, ci, 'size', v ), min: 1, max: 100 } ),
                                el( 'strong', { style: { display: 'block', marginTop: 8, marginBottom: 4, fontSize: 12 } }, __( 'Segments', 'blockenberg' ) ),
                                el( Button, { variant: 'secondary', isSmall: true, style: { marginBottom: 8 }, onClick: () => updCol( setAttributes, a.columns, ci, 'segments', [ ...( col.segments || [] ), { label: 'New Segment', value: 20 } ] ) }, __( '+ Add Segment', 'blockenberg' ) ),
                                ( col.segments || [] ).map( ( seg, si ) =>
                                    el( 'div', { key: si, style: { display: 'flex', gap: 6, alignItems: 'flex-end', marginBottom: 4 } },
                                        el( TextControl,  { label: si === 0 ? __( 'Label', 'blockenberg' ) : undefined, value: seg.label, onChange: v => updSeg( setAttributes, a.columns, ci, si, 'label', v ), style: { flex: 2 } } ),
                                        el( TextControl,  { label: si === 0 ? __( 'Value', 'blockenberg' ) : undefined, value: String( seg.value ), type: 'number', onChange: v => updSeg( setAttributes, a.columns, ci, si, 'value', parseFloat( v ) || 0 ), style: { flex: 1 } } ),
                                        el( Button, { isDestructive: true, isSmall: true, onClick: () => updCol( setAttributes, a.columns, ci, 'segments', ( col.segments || [] ).filter( ( _, j ) => j !== si ) ) }, '✕' ),
                                    )
                                ),
                                el( Button, { isDestructive: true, isSmall: true, style: { marginTop: 8 }, onClick: () => setAttributes( { columns: a.columns.filter( ( _, x ) => x !== ci ) } ) }, __( 'Remove Column', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-marimekko-title', style: { color: a.titleColor } }, a.title ),
                el( 'div', { className: 'bkbg-marimekko-svg' }, renderMarimekko( a ) ),
            );
        },

        save: function ( { attributes: a } ) {
            const _tvFn = getTypoCssVars();
            const blockProps = useBlockProps.save( (function () {
                var s = {};
                if (_tvFn) Object.assign(s, _tvFn(a.titleTypo, '--bkbg-mk-tt-'));
                return { className: 'bkbg-marimekko-wrap', style: s };
            })() );
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-marimekko-title', style: { color: a.titleColor } }, a.title ) : null,
                el( 'div', { className: 'bkbg-marimekko-svg' }, renderMarimekko( a ) ),
            );
        },
    } );
}() );

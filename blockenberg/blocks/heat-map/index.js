( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, TextareaControl, Button } = window.wp.components;
    const { __ } = window.wp.i18n;

    /* ── Typography lazy getters ──────────────────────────────── */
    var _ttTC, _ttTV;
    function _tc() { return _ttTC || (_ttTC = window.bkbgTypographyControl); }
    function _tv() { return _ttTV || (_ttTV = window.bkbgTypoCssVars); }

    // ── Colour lerp helper ────────────────────────────────────────────────────
    function hexToRgb( hex ) {
        const h = hex.replace( '#', '' );
        return [ parseInt( h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16) ];
    }
    function lerpColor( hexA, hexB, t ) {
        const a = hexToRgb( hexA ), b = hexToRgb( hexB );
        const r = Math.round( a[0] + ( b[0] - a[0] ) * t );
        const g = Math.round( a[1] + ( b[1] - a[1] ) * t );
        const bl = Math.round( a[2] + ( b[2] - a[2] ) * t );
        return `rgb(${ r },${ g },${ bl })`;
    }
    function cellColor( v, minV, maxV, colorLow, colorMid, colorHigh ) {
        const t = maxV === minV ? 0.5 : ( v - minV ) / ( maxV - minV );
        if ( t <= 0.5 ) return lerpColor( colorLow, colorMid, t * 2 );
        return lerpColor( colorMid, colorHigh, ( t - 0.5 ) * 2 );
    }
    function textOnBg( hex ) {
        const [ r, g, b ] = hexToRgb( hex );
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        return lum > 160 ? '#111827' : '#ffffff';
    }

    // ── Renderer ──────────────────────────────────────────────────────────────
    function renderHeatMap( a ) {
        const rows   = a.rowLabels || [];
        const cols   = a.colLabels || [];
        const vals   = a.cellValues || [];
        const nR     = rows.length;
        const nC     = cols.length;
        if ( ! nR || ! nC ) return el( 'svg', { viewBox: '0 0 400 200', width: '100%' } );

        const CS  = a.cellSize;
        const GAP = a.cellGap;
        const PT  = a.padTop;
        const PL  = a.padLeft;
        const PB  = a.padBottom;
        const PR  = a.padRight;
        const W   = PL + nC * ( CS + GAP ) - GAP + PR;
        const legendH = a.showLegend ? 30 : 0;
        const H   = PT + nR * ( CS + GAP ) - GAP + PB + legendH;

        const minV = Math.min( ...vals );
        const maxV = Math.max( ...vals );

        const svgEls = [];
        svgEls.push( el( 'rect', { key: 'bg', x: 0, y: 0, width: W, height: H, fill: a.bgColor || '#ffffff', rx: 8 } ) );

        // Column headers
        cols.forEach( ( c, ci ) => {
            const cx = PL + ci * ( CS + GAP ) + CS / 2;
            svgEls.push( el( 'text', { key: `ch${ ci }`, x: cx, y: PT - 8, textAnchor: 'middle', fill: a.textColor, fontSize: a.labelFontSize, fontFamily: 'inherit', transform: `rotate(-40,${ cx },${ PT - 8 })` }, c ) );
        } );

        // Row headers + cells
        rows.forEach( ( r, ri ) => {
            const cy = PT + ri * ( CS + GAP ) + CS / 2;
            svgEls.push( el( 'text', { key: `rh${ ri }`, x: PL - 8, y: cy, textAnchor: 'end', dominantBaseline: 'middle', fill: a.textColor, fontSize: a.labelFontSize, fontFamily: 'inherit' }, r ) );

            cols.forEach( ( _, ci ) => {
                const v    = vals[ ri * nC + ci ] !== undefined ? vals[ ri * nC + ci ] : 0;
                const bg   = cellColor( v, minV, maxV, a.colorLow || '#dbeafe', a.colorMid || '#93c5fd', a.colorHigh || '#1d4ed8' );
                const cx   = PL + ci * ( CS + GAP );
                const cy2  = PT + ri * ( CS + GAP );
                svgEls.push( el( 'rect', { key: `cell${ ri }${ ci }`, x: cx, y: cy2, width: CS, height: CS, fill: bg, rx: 4 } ) );
                if ( a.showValues ) {
                    const fgColor = textOnBg( bg.startsWith('rgb') ? '#888888' : bg );
                    svgEls.push( el( 'text', { key: `cv${ ri }${ ci }`, x: cx + CS / 2, y: cy2 + CS / 2, textAnchor: 'middle', dominantBaseline: 'middle', fill: '#333333', fontSize: a.valueFontSize, fontFamily: 'inherit', fontWeight: 600 }, parseFloat( v.toFixed(2) ) ) );
                }
            } );
        } );

        // Legend
        if ( a.showLegend ) {
            const legY   = PT + nR * ( CS + GAP ) - GAP + 12;
            const legW   = Math.min( 200, nC * ( CS + GAP ) );
            const legX   = PL;
            const steps  = 20;
            for ( let s = 0; s < steps; s++ ) {
                const t   = s / ( steps - 1 );
                const lc  = cellColor( minV + t * ( maxV - minV ), minV, maxV, a.colorLow || '#dbeafe', a.colorMid || '#93c5fd', a.colorHigh || '#1d4ed8' );
                svgEls.push( el( 'rect', { key: `leg${ s }`, x: legX + ( s / steps ) * legW, y: legY, width: legW / steps + 1, height: 12, fill: lc } ) );
            }
            svgEls.push( el( 'text', { key: 'legMin', x: legX, y: legY + 24, fill: a.textColor, fontSize: 10, fontFamily: 'inherit' }, parseFloat( minV.toFixed(2) ) ) );
            svgEls.push( el( 'text', { key: 'legMax', x: legX + legW, y: legY + 24, textAnchor: 'end', fill: a.textColor, fontSize: 10, fontFamily: 'inherit' }, parseFloat( maxV.toFixed(2) ) ) );
        }

        return el( 'svg', { viewBox: `0 0 ${ W } ${ H }`, width: '100%', style: { display: 'block', maxWidth: W + 'px', margin: '0 auto' } }, ...svgEls );
    }

    registerBlockType( 'blockenberg/heat-map', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps( { className: 'bkbg-heatmap-wrap', style: Object.assign( {}, _tv() && _tv()( a.typoTitle, '--bkbg-hm-tt-' ) ) } );

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Chart Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl,   { label: __( 'Title', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),  checked: a.showTitle,  onChange: v => setAttributes( { showTitle:  v } ) } ),
                        el( ToggleControl, { label: __( 'Show Values', 'blockenberg' ), checked: a.showValues, onChange: v => setAttributes( { showValues: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Legend', 'blockenberg' ), checked: a.showLegend, onChange: v => setAttributes( { showLegend: v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Layout', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Cell Size (px)', 'blockenberg' ),    value: a.cellSize,      onChange: v => setAttributes( { cellSize:      v } ), min: 20, max: 120 } ),
                        el( RangeControl, { label: __( 'Cell Gap (px)', 'blockenberg' ),     value: a.cellGap,       onChange: v => setAttributes( { cellGap:       v } ), min: 0, max: 12 } ),
                        el( RangeControl, { label: __( 'Row Label Width', 'blockenberg' ),   value: a.padLeft,       onChange: v => setAttributes( { padLeft:       v } ), min: 40, max: 240 } ),
                        el( RangeControl, { label: __( 'Column Header Height', 'blockenberg' ), value: a.padTop,     onChange: v => setAttributes( { padTop:        v } ), min: 30, max: 160 } ),
                    ),

                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        _tc() && _tc()({ label: __('Title','blockenberg'), value: a.typoTitle, onChange: v => setAttributes( { typoTitle: v } ) }),
                        el( RangeControl, { label: __( 'Label Font Size', 'blockenberg' ),   value: a.labelFontSize, onChange: v => setAttributes( { labelFontSize: v } ), min: 8, max: 20 } ),
                        el( RangeControl, { label: __( 'Value Font Size', 'blockenberg' ),   value: a.valueFontSize, onChange: v => setAttributes( { valueFontSize: v } ), min: 7, max: 18 } )
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Low value',   'blockenberg' ), value: a.colorLow,  onChange: v => setAttributes( { colorLow:  v || '#dbeafe' } ) },
                            { label: __( 'Mid value',   'blockenberg' ), value: a.colorMid,  onChange: v => setAttributes( { colorMid:  v || '#93c5fd' } ) },
                            { label: __( 'High value',  'blockenberg' ), value: a.colorHigh, onChange: v => setAttributes( { colorHigh: v || '#1d4ed8' } ) },
                            { label: __( 'Background',  'blockenberg' ), value: a.bgColor,   onChange: v => setAttributes( { bgColor:   v || '#ffffff' } ) },
                            { label: __( 'Title',       'blockenberg' ), value: a.titleColor,onChange: v => setAttributes( { titleColor: v || '#111827' } ) },
                            { label: __( 'Labels/Text', 'blockenberg' ), value: a.textColor, onChange: v => setAttributes( { textColor:  v || '#374151' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Row Labels', 'blockenberg' ), initialOpen: false },
                        el( TextareaControl, {
                            label: __( 'One label per line', 'blockenberg' ),
                            value: ( a.rowLabels || [] ).join( '\n' ),
                            onChange: v => setAttributes( { rowLabels: v.split( '\n' ).map( s => s.trim() ).filter( Boolean ) } ),
                        } ),
                    ),

                    el( PanelBody, { title: __( 'Column Labels', 'blockenberg' ), initialOpen: false },
                        el( TextareaControl, {
                            label: __( 'One label per line', 'blockenberg' ),
                            value: ( a.colLabels || [] ).join( '\n' ),
                            onChange: v => setAttributes( { colLabels: v.split( '\n' ).map( s => s.trim() ).filter( Boolean ) } ),
                        } ),
                    ),

                    el( PanelBody, { title: __( 'Cell Values', 'blockenberg' ), initialOpen: false },
                        el( 'p', { style: { fontSize: 12, color: '#6b7280', marginBottom: 8 } }, __( 'Row-major order, comma-separated. Rows × Columns values.', 'blockenberg' ) ),
                        el( TextareaControl, {
                            label: __( 'Values', 'blockenberg' ),
                            value: ( a.cellValues || [] ).join( ', ' ),
                            onChange: v => setAttributes( { cellValues: v.split( ',' ).map( n => parseFloat( n.trim() ) || 0 ) } ),
                            rows: 6,
                        } ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-heatmap-title', style: { color: a.titleColor } }, a.title ),
                el( 'div', { className: 'bkbg-heatmap-svg' }, renderHeatMap( a ) ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save( { className: 'bkbg-heatmap-wrap', style: Object.assign( {}, _tv() && _tv()( a.typoTitle, '--bkbg-hm-tt-' ) ) } );
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-heatmap-title', style: { color: a.titleColor } }, a.title ) : null,
                el( 'div', { className: 'bkbg-heatmap-svg' }, renderHeatMap( a ) ),
            );
        },
    } );
}() );

( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, Button, ColorPicker, Popover } = window.wp.components;
    const { __ } = window.wp.i18n;
    const { useState } = window.wp.element;

    var _tc, _tvf;
    Object.defineProperty(window, '_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, key, attrs, setA) { return _tc(label, key, attrs, setA); }
    function getTypoCssVars(attrs) {
        var v = {};
        _tvf(v, 'titleTypo',  attrs, '--bkwc-tt-');
        _tvf(v, 'legendTypo', attrs, '--bkwc-lg-');
        return v;
    }

    const COLS = 10, ROWS = 10, TOTAL = COLS * ROWS;

    // ── Build cell color map from segments ────────────────────────────────────
    // Fills cells from bottom-left to top-right, row by row from bottom.
    function buildCellMap( segments ) {
        const total = segments.reduce( ( s, seg ) => s + ( seg.value || 0 ), 0 ) || 100;

        // Allocate exact cells per segment using largest-remainder method
        const raw   = segments.map( seg => ( ( seg.value || 0 ) / total ) * TOTAL );
        const floor = raw.map( Math.floor );
        let remaining = TOTAL - floor.reduce( ( s, v ) => s + v, 0 );

        const fracs = raw.map( ( v, i ) => ( { i, frac: v - floor[i] } ) )
                         .sort( ( a, b ) => b.frac - a.frac );
        for ( let k = 0; k < remaining; k++ ) floor[ fracs[k].i ]++;

        // Build cell array [100] with segment index (or -1 for empty)
        const cells = new Array( TOTAL ).fill( -1 );
        let cursor = 0;
        segments.forEach( ( _, segIdx ) => {
            for ( let c = 0; c < floor[segIdx]; c++ ) {
                if ( cursor < TOTAL ) cells[cursor++] = segIdx;
            }
        } );
        return cells;
    }

    // ── Render waffle grid (SVG) ──────────────────────────────────────────────
    function renderWaffle( a ) {
        const { cellSize: CS, cellGap: CG, cellRadius: CR } = a;
        const segments = a.segments || [];
        const cells    = buildCellMap( segments );

        const total = segments.reduce( ( s, seg ) => s + ( seg.value || 0 ), 0 ) || 100;

        const W = COLS * CS + ( COLS - 1 ) * CG;
        const H = ROWS * CS + ( ROWS - 1 ) * CG;

        const svgEls = [];

        // Background
        svgEls.push( el( 'rect', { key: 'bg', x: 0, y: 0, width: W, height: H, fill: a.bgColor || '#ffffff', rx: 8 } ) );

        // Cells — rendered bottom-to-top (row 0 = bottom)
        cells.forEach( ( segIdx, cellIdx ) => {
            const col  = cellIdx % COLS;
            const row  = ROWS - 1 - Math.floor( cellIdx / COLS ); // flip so row 0 is at bottom
            const x    = col * ( CS + CG );
            const y    = row * ( CS + CG );
            const fill = segIdx >= 0 ? ( segments[segIdx].color || '#4f46e5' ) : ( a.emptyColor || '#f3f4f6' );

            svgEls.push( el( 'rect', {
                key: 'c' + cellIdx,
                x, y, width: CS, height: CS,
                fill, rx: CR,
            } ) );
        } );

        return el( 'svg', {
            viewBox: `0 0 ${ W } ${ H }`, width: '100%',
            style: { display: 'block', maxWidth: W + 'px', margin: '0 auto' }
        }, ...svgEls );
    }

    // ── Render legend ─────────────────────────────────────────────────────────
    function renderLegend( a ) {
        const segments = a.segments || [];
        const total    = segments.reduce( ( s, seg ) => s + ( seg.value || 0 ), 0 ) || 100;

        return el( 'div', { className: 'bkbg-wc-legend' },
            segments.map( ( seg, i ) => {
                const pct = ( ( seg.value || 0 ) / total * 100 ).toFixed( 1 );
                return el( 'div', { key: i, className: 'bkbg-wc-legend-item' },
                    el( 'span', { className: 'bkbg-wc-swatch', style: { background: seg.color || '#4f46e5' } } ),
                    el( 'span', { className: 'bkbg-wc-seg-label', style: { color: a.textColor } }, seg.label || '' ),
                    el( 'span', { className: 'bkbg-wc-seg-val', style: { color: seg.color || '#4f46e5' } },
                        a.showPercent ? pct + '%'
                            : a.showValues ? String( seg.value || 0 )
                            : pct + '%'
                    ),
                );
            } )
        );
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    function updSeg( setAttributes, segments, idx, field, val ) {
        setAttributes( { segments: segments.map( ( s, i ) => i === idx ? { ...s, [field]: val } : s ) } );
    }

    // ── Block ─────────────────────────────────────────────────────────────────    /* ── colour-swatch + popover ── */
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
    registerBlockType( 'blockenberg/waffle-chart', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps( { className: 'bkbg-waffle-wrap', style: getTypoCssVars( a ) } );
            const segs = a.segments || [];

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Chart Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl, { label: __( 'Title', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),   checked: a.showTitle,   onChange: v => setAttributes( { showTitle: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Legend', 'blockenberg' ),  checked: a.showLegend,  onChange: v => setAttributes( { showLegend: v } ) } ),
                        el( ToggleControl, { label: __( 'Show as Percent', 'blockenberg' ), checked: a.showPercent, onChange: v => setAttributes( { showPercent: v, showValues: v ? false : a.showValues } ) } ),
                        el( ToggleControl, { label: __( 'Show Raw Values', 'blockenberg' ), checked: a.showValues, onChange: v => setAttributes( { showValues: v, showPercent: v ? false : a.showPercent } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Grid Appearance', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Cell Gap (px)', 'blockenberg' ),     value: a.cellGap,        onChange: v => setAttributes( { cellGap: v } ),        min: 0, max: 16 } ),
                        el( RangeControl, { label: __( 'Cell Radius (px)', 'blockenberg' ),  value: a.cellRadius,     onChange: v => setAttributes( { cellRadius: v } ),     min: 0, max: 20 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Cell Size (px)', 'blockenberg' ),    value: a.cellSize,       onChange: v => setAttributes( { cellSize: v } ),       min: 14, max: 60 } ),
                        getTypoControl( __( 'Title', 'blockenberg' ),  'titleTypo',  a, setAttributes ),
                        getTypoControl( __( 'Legend', 'blockenberg' ), 'legendTypo', a, setAttributes ),
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Background', 'blockenberg' ),  value: a.bgColor,    onChange: v => setAttributes( { bgColor:    v || '#ffffff' } ) },
                            { label: __( 'Empty Cell', 'blockenberg' ),  value: a.emptyColor, onChange: v => setAttributes( { emptyColor: v || '#f3f4f6' } ) },
                            { label: __( 'Title Color', 'blockenberg' ), value: a.titleColor, onChange: v => setAttributes( { titleColor: v || '#111827' } ) },
                            { label: __( 'Text Color', 'blockenberg' ),  value: a.textColor,  onChange: v => setAttributes( { textColor:  v || '#374151' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Segments', 'blockenberg' ), initialOpen: false },
                        el( 'p', { style: { fontSize: 12, color: '#6b7280', marginBottom: 8 } }, __( 'Values are normalized to 100 cells total automatically.', 'blockenberg' ) ),
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { segments: [ ...segs, { label: 'New Segment', value: 10, color: '#6b7280' } ] } ) }, __( '+ Add Segment', 'blockenberg' ) ),
                        segs.map( ( seg, i ) =>
                            el( PanelBody, { key: i, title: `${ seg.label || `Seg ${ i + 1 }` } (${ seg.value })`, initialOpen: false },
                                el( TextControl, { label: __( 'Label', 'blockenberg' ),       value: seg.label, onChange: v => updSeg( setAttributes, segs, i, 'label', v ) } ),
                                el( RangeControl, { label: __( 'Value', 'blockenberg' ),      value: seg.value, onChange: v => updSeg( setAttributes, segs, i, 'value', v ), min: 0, max: 10000 } ),
                                el( BkbgColorSwatch, { label: __( 'Color', 'blockenberg' ), value: seg.color, onChange: v => updSeg( setAttributes, segs, i, 'color', v ) } ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { segments: segs.filter( ( _, x ) => x !== i ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-wc-title', style: { color: a.titleColor } }, a.title ),
                el( 'div', { className: 'bkbg-wc-grid' }, renderWaffle( a ) ),
                a.showLegend && renderLegend( a ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save( { className: 'bkbg-waffle-wrap', style: getTypoCssVars( a ) } );
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-wc-title', style: { color: a.titleColor } }, a.title ) : null,
                el( 'div', { className: 'bkbg-wc-grid' }, renderWaffle( a ) ),
                a.showLegend ? renderLegend( a ) : null,
            );
        },
    } );
}() );

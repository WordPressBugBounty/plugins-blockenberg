( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, SelectControl, ToggleControl, TextControl, Button, ColorPicker, Popover } = window.wp.components;
    const { __ } = window.wp.i18n;
    const { useState } = window.wp.element;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    // ── Arc path helpers ──────────────────────────────────────────────────────
    function polarXY( cx, cy, r, angle ) {
        return [ cx + r * Math.cos( angle ), cy + r * Math.sin( angle ) ];
    }

    function arcPath( cx, cy, r1, r2, startAngle, endAngle ) {
        const large = endAngle - startAngle > Math.PI ? 1 : 0;
        const [ x1, y1 ] = polarXY( cx, cy, r2, startAngle );
        const [ x2, y2 ] = polarXY( cx, cy, r2, endAngle   );
        const [ x3, y3 ] = polarXY( cx, cy, r1, endAngle   );
        const [ x4, y4 ] = polarXY( cx, cy, r1, startAngle );
        const f = v => v.toFixed( 3 );
        return `M ${ f(x1) } ${ f(y1) } A ${ r2 } ${ r2 } 0 ${ large } 1 ${ f(x2) } ${ f(y2) } L ${ f(x3) } ${ f(y3) } A ${ r1 } ${ r1 } 0 ${ large } 0 ${ f(x4) } ${ f(y4) } Z`;
    }

    // Lighten a hex colour (percentage 0-1)
    function lighten( hex, amount ) {
        const num = parseInt( ( hex || '#6366f1' ).replace( '#', '' ), 16 );
        const r   = Math.min( 255, ( ( num >> 16 ) & 0xff ) + Math.round( 255 * amount ) );
        const g   = Math.min( 255, ( ( num >> 8  ) & 0xff ) + Math.round( 255 * amount ) );
        const b   = Math.min( 255, (   num         & 0xff ) + Math.round( 255 * amount ) );
        return `#${ [ r, g, b ].map( v => v.toString( 16 ).padStart( 2, '0' ) ).join( '' ) }`;
    }

    // ── Renderer ──────────────────────────────────────────────────────────────
    function renderSunburst( a ) {
        const segs  = a.segments || [];
        const S     = a.svgSize;
        const cx    = S / 2;
        const cy    = S / 2;
        const r1    = a.innerRadius;   // donut hole
        const r2    = a.midRadius;     // inner ring outer edge
        const r3    = a.outerRadius;   // outer ring outer edge

        const TAU   = 2 * Math.PI;
        const START = -Math.PI / 2;   // start from top

        // Total of all leaf values
        const totalVal = segs.reduce( ( s, seg ) =>
            s + ( seg.children || [] ).reduce( ( cs, ch ) => cs + ( ch.value || 0 ), 0 ), 0 ) || 1;

        // Each segment's arc span = sum of its children / total
        const segTotals   = segs.map( seg => ( seg.children || [] ).reduce( ( s, ch ) => s + ( ch.value || 0 ), 0 ) );
        const segAngleFns = [];   // will hold { start, end } per segment

        let cursor = START;
        segTotals.forEach( ( st, si ) => {
            const span = ( st / totalVal ) * TAU;
            segAngleFns.push( { start: cursor, end: cursor + span } );
            cursor += span;
        } );

        const svgEls = [];
        svgEls.push( el( 'rect', { key: 'bg', x: 0, y: 0, width: S, height: S, fill: a.bgColor || '#ffffff', rx: 8 } ) );

        // Inner ring (segments) + outer ring (children)
        segs.forEach( ( seg, si ) => {
            const { start: sa, end: ea } = segAngleFns[si];
            const midA  = ( sa + ea ) / 2;
            const clr   = seg.color || '#6366f1';
            const children = seg.children || [];
            const childTotal = segTotals[si] || 1;

            // Inner ring arc
            svgEls.push( el( 'path', { key: `inner${ si }`, d: arcPath( cx, cy, r1, r2, sa, ea ), fill: clr, stroke: '#ffffff', strokeWidth: 2 } ) );

            // Inner label
            if ( a.showLabels ) {
                const [ lx, ly ] = polarXY( cx, cy, ( r1 + r2 ) / 2, midA );
                svgEls.push( el( 'text', { key: `ilbl${ si }`, x: lx, y: ly, textAnchor: 'middle', dominantBaseline: 'middle', fill: '#ffffff', fontSize: a.labelFontSize, fontWeight: 700, fontFamily: 'inherit' }, seg.label || '' ) );
            }

            // Outer ring: each child
            let childCursor = sa;
            children.forEach( ( child, ci ) => {
                const span = ( ( child.value || 0 ) / childTotal ) * ( ea - sa );
                const cs   = childCursor;
                const ce   = childCursor + span;
                childCursor = ce;
                const cMid = ( cs + ce ) / 2;

                // Alternate lightened colours for children
                const childClr = lighten( clr, ci * 0.15 );
                svgEls.push( el( 'path', { key: `outer${ si }${ ci }`, d: arcPath( cx, cy, r2 + 4, r3, cs, ce ), fill: childClr, stroke: '#ffffff', strokeWidth: 2 } ) );

                if ( a.showLabels && ( ce - cs ) > 0.15 ) {
                    const [ lx, ly ] = polarXY( cx, cy, ( r2 + 4 + r3 ) / 2, cMid );
                    svgEls.push( el( 'text', { key: `olbl${ si }${ ci }`, x: lx, y: ly - ( a.showValues ? 5 : 0 ), textAnchor: 'middle', dominantBaseline: 'middle', fill: '#ffffff', fontSize: a.labelFontSize, fontFamily: 'inherit' }, child.label || '' ) );
                    if ( a.showValues ) {
                        svgEls.push( el( 'text', { key: `oval${ si }${ ci }`, x: lx, y: ly + 8, textAnchor: 'middle', dominantBaseline: 'middle', fill: '#ffffffcc', fontSize: a.valueFontSize, fontFamily: 'inherit' }, String( child.value || 0 ) ) );
                    }
                }
            } );
        } );

        // Centre label — total
        svgEls.push( el( 'text', { key: 'total', x: cx, y: cy - 8, textAnchor: 'middle', dominantBaseline: 'middle', fill: a.textColor, fontSize: 22, fontWeight: 700, fontFamily: 'inherit' }, String( totalVal ) ) );
        svgEls.push( el( 'text', { key: 'totlbl', x: cx, y: cy + 12, textAnchor: 'middle', fill: a.textColor, fontSize: 11, fontFamily: 'inherit' }, 'Total' ) );

        // Legend
        if ( a.showLegend ) {
            const perRow = 2;
            const legY   = S - Math.ceil( segs.length / perRow ) * 22 - 12;
            segs.forEach( ( seg, si ) => {
                const lx = 10 + ( si % perRow ) * ( S / perRow );
                const ly = legY + Math.floor( si / perRow ) * 22;
                svgEls.push( el( 'rect',   { key: `lr${ si }`, x: lx, y: ly, width: 14, height: 14, fill: seg.color || '#6366f1', rx: 3 } ) );
                svgEls.push( el( 'text',   { key: `lt${ si }`, x: lx + 18, y: ly + 7, dominantBaseline: 'middle', fill: a.textColor, fontSize: a.labelFontSize, fontFamily: 'inherit' }, `${ seg.label } – ${ segTotals[si] }` ) );
            } );
        }

        return el( 'svg', { viewBox: `0 0 ${ S } ${ S }`, width: '100%', style: { display: 'block', maxWidth: S + 'px', margin: '0 auto' } }, ...svgEls );
    }

    function updSeg( setAttributes, segs, si, field, val ) {
        setAttributes( { segments: segs.map( ( s, i ) => i === si ? { ...s, [field]: val } : s ) } );
    }
    function updChild( setAttributes, segs, si, ci, field, val ) {
        setAttributes( { segments: segs.map( ( s, i ) => i !== si ? s : {
            ...s,
            children: ( s.children || [] ).map( ( ch, k ) => k === ci ? { ...ch, [field]: val } : ch )
        } ) } );
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

    registerBlockType( 'blockenberg/sunburst-chart', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps((function () {
                var _tvf = getTypoCssVars();
                var s = {};
                if (_tvf) Object.assign(s, _tvf(a.titleTypo, '--bksbc-tt-'));
                return { className: 'bkbg-sunburst-wrap', style: s };
            })());

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Chart Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl,  { label: __( 'Title', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),  checked: a.showTitle,  onChange: v => setAttributes( { showTitle: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Labels', 'blockenberg' ), checked: a.showLabels, onChange: v => setAttributes( { showLabels: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Values', 'blockenberg' ), checked: a.showValues, onChange: v => setAttributes( { showValues: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Legend', 'blockenberg' ), checked: a.showLegend, onChange: v => setAttributes( { showLegend: v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Layout', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Canvas Size (px)', 'blockenberg' ),   value: a.svgSize,     onChange: v => setAttributes( { svgSize: v } ),     min: 300, max: 800 } ),
                        el( RangeControl, { label: __( 'Donut Hole Radius', 'blockenberg' ),  value: a.innerRadius, onChange: v => setAttributes( { innerRadius: v } ), min: 20, max: 200 } ),
                        el( RangeControl, { label: __( 'Inner Ring Radius', 'blockenberg' ),  value: a.midRadius,   onChange: v => setAttributes( { midRadius: v } ),   min: 60, max: 350 } ),
                        el( RangeControl, { label: __( 'Outer Ring Radius', 'blockenberg' ),  value: a.outerRadius, onChange: v => setAttributes( { outerRadius: v } ), min: 80, max: 400 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl()({ label: __('Title', 'blockenberg'), value: a.titleTypo, onChange: v => setAttributes({ titleTypo: v }) }),
                        el( RangeControl, { label: __( 'Label Font Size', 'blockenberg' ),    value: a.labelFontSize, onChange: v => setAttributes( { labelFontSize: v } ), min: 7, max: 20 } ),
                        el( RangeControl, { label: __( 'Value Font Size', 'blockenberg' ),    value: a.valueFontSize, onChange: v => setAttributes( { valueFontSize: v } ), min: 6, max: 16 } ),
                        el( SelectControl, { label: __( 'Label Font Weight', 'blockenberg' ), value: a.labelFontWeight, options: [{label:'400 Regular',value:'400'},{label:'500 Medium',value:'500'},{label:'600 Semi-bold',value:'600'},{label:'700 Bold',value:'700'}], __nextHasNoMarginBottom: true, onChange: v => setAttributes( { labelFontWeight: v } ) } ),
                        el( RangeControl, { label: __( 'Label Line Height', 'blockenberg' ), value: a.labelLineHeight, min: 1.0, max: 2.5, step: 0.05, __nextHasNoMarginBottom: true, onChange: v => setAttributes( { labelLineHeight: v } ) } )
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Background',  'blockenberg' ), value: a.bgColor,    onChange: v => setAttributes( { bgColor:    v || '#ffffff' } ) },
                            { label: __( 'Title Color', 'blockenberg' ), value: a.titleColor, onChange: v => setAttributes( { titleColor: v || '#111827' } ) },
                            { label: __( 'Text Color',  'blockenberg' ), value: a.textColor,  onChange: v => setAttributes( { textColor:  v || '#374151' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Segments', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { segments: [ ...a.segments, { label: 'New Segment', color: '#6366f1', children: [ { label: 'Item 1', value: 20 } ] } ] } ) }, __( '+ Add Segment', 'blockenberg' ) ),
                        a.segments.map( ( seg, si ) =>
                            el( PanelBody, { key: si, title: seg.label || `Segment ${ si + 1 }`, initialOpen: false },
                                el( TextControl, { label: __( 'Label', 'blockenberg' ),     value: seg.label, onChange: v => updSeg( setAttributes, a.segments, si, 'label', v ) } ),
                                el( BkbgColorSwatch, { label: __( 'Color', 'blockenberg' ), value: seg.color, onChange: v => updSeg( setAttributes, a.segments, si, 'color', v ) } ),
                                el( Button, { variant: 'tertiary', isSmall: true, style: { marginBottom: 6 }, onClick: () => updSeg( setAttributes, a.segments, si, 'children', [ ...( seg.children || [] ), { label: 'Item', value: 10 } ] ) }, __( '+ Child', 'blockenberg' ) ),
                                ( seg.children || [] ).map( ( ch, ci ) =>
                                    el( 'div', { key: ci, style: { paddingLeft: 12, borderLeft: '2px solid #e5e7eb', marginBottom: 8 } },
                                        el( TextControl,  { label: `Child ${ ci + 1 } Label`, value: ch.label, onChange: v => updChild( setAttributes, a.segments, si, ci, 'label', v ) } ),
                                        el( RangeControl, { label: 'Value', value: ch.value, onChange: v => updChild( setAttributes, a.segments, si, ci, 'value', v ), min: 0, max: 9999 } ),
                                        el( Button, { isDestructive: true, isSmall: true, onClick: () => updSeg( setAttributes, a.segments, si, 'children', seg.children.filter( ( _, ki ) => ki !== ci ) ) }, __( '✕', 'blockenberg' ) ),
                                    )
                                ),
                                el( Button, { isDestructive: true, isSmall: true, style: { marginTop: 6 }, onClick: () => setAttributes( { segments: a.segments.filter( ( _, x ) => x !== si ) } ) }, __( 'Remove Segment', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-sunburst-title', style: { color: a.titleColor } }, a.title ),
                el( 'div', { className: 'bkbg-sunburst-svg' }, renderSunburst( a ) ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save((function () {
                var _tvf = getTypoCssVars();
                var s = {};
                if (_tvf) Object.assign(s, _tvf(a.titleTypo, '--bksbc-tt-'));
                return { className: 'bkbg-sunburst-wrap', style: s };
            })());
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-sunburst-title', style: { color: a.titleColor } }, a.title ) : null,
                el( 'div', { className: 'bkbg-sunburst-svg' }, renderSunburst( a ) ),
            );
        },
    } );
}() );

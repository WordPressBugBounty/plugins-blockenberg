( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, Button, ColorPicker, Popover } = window.wp.components;
    const { __ } = window.wp.i18n;
    const { useState } = window.wp.element;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var IP = function () { return window.bkbgIconPicker; };

    // ── Renderer ──────────────────────────────────────────────────────────────
    function renderPictograph( a ) {
        const segs     = a.segments || [];
        const total    = a.totalUnits  || 100;
        const cols     = a.gridCols    || 10;
        const cs       = a.cellSize    || 36;
        const gap      = a.cellGap     || 4;
        const fs       = a.iconFontSize || 22;
        const emptyClr = a.emptyColor  || '#e5e7eb';

        // ── Largest-remainder allocation ──────────────────────────────────────
        const sumVals = segs.reduce( ( s, seg ) => s + ( seg.value || 0 ), 0 ) || 1;
        const exact   = segs.map( seg => ( seg.value || 0 ) / sumVals * total );
        const floored = exact.map( v => Math.floor( v ) );
        let remaining = total - floored.reduce( ( s, v ) => s + v, 0 );
        const order   = exact.map( ( v, i ) => [ i, v - floored[i] ] ).sort( ( a, b ) => b[1] - a[1] );
        order.forEach( ( [ i ] ) => { if ( remaining > 0 ) { floored[i]++; remaining--; } } );

        // Build flat colour array for each cell
        const palette = [];
        floored.forEach( ( count, si ) => {
            for ( let k = 0; k < count; k++ ) palette.push( segs[si] ? segs[si].color : '#cccccc' );
        } );
        while ( palette.length < total ) palette.push( emptyClr );

        const rows   = Math.ceil( total / cols );
        const W      = cols * ( cs + gap ) - gap;
        const gridH  = rows * ( cs + gap ) - gap;
        const legH   = a.showLegend ? Math.ceil( segs.length / 3 ) * 26 + 16 : 0;
        const H      = gridH + legH;

        const svgEls = [];
        svgEls.push( el( 'rect', { key: 'bg', x: 0, y: 0, width: W, height: H, fill: a.bgColor || '#ffffff', rx: 8 } ) );

        for ( let idx = 0; idx < total; idx++ ) {
            const col  = idx % cols;
            const row  = Math.floor( idx / cols );
            const cx   = col * ( cs + gap ) + cs / 2;
            const cy   = row * ( cs + gap ) + cs / 2;
            const clr  = palette[idx] || emptyClr;

            svgEls.push(
                el( 'text', {
                    key: `ic${ idx }`,
                    x: cx, y: cy,
                    textAnchor: 'middle', dominantBaseline: 'middle',
                    fontSize: fs,
                    fill: clr,
                    style: { filter: clr === emptyClr ? 'grayscale(1) opacity(0.35)' : 'none' },
                    fontFamily: 'inherit',
                }, a.icon || '●' )
            );
        }

        // Legend
        if ( a.showLegend ) {
            const perRow = 3;
            const legY   = gridH + 16;
            const legFS  = a.legendFontSize || 13;

            segs.forEach( ( seg, si ) => {
                const lx = ( si % perRow ) * ( W / perRow );
                const ly = legY + Math.floor( si / perRow ) * 26;
                svgEls.push( el( 'circle', { key: `lc${ si }`, cx: lx + 7, cy: ly + 7,   r: 7,   fill: seg.color } ) );
                svgEls.push( el( 'text',   { key: `lt${ si }`, x:  lx + 18, y: ly + 7, dominantBaseline: 'middle', fill: a.textColor || '#374151', fontSize: legFS, fontFamily: 'inherit' }, `${ seg.label } (${ seg.value || 0 })` ) );
            } );
        }

        return el( 'svg', { viewBox: `0 0 ${ W } ${ H }`, width: '100%', style: { display: 'block', maxWidth: W + 'px', margin: '0 auto' } }, ...svgEls );
    }

    function updSeg( setAttributes, segs, idx, field, val ) {
        setAttributes( { segments: segs.map( ( s, i ) => i === idx ? { ...s, [field]: val } : s ) } );
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

    registerBlockType( 'blockenberg/pictograph', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps((function () {
                var tv = getTypoCssVars();
                var s = {};
                Object.assign(s, tv(a.titleTypo, '--bkbg-picto-tt-'));
                return { className: 'bkbg-picto-wrap', style: s };
            })());

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Chart Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl, { label: __( 'Title', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),  checked: a.showTitle,  onChange: v => setAttributes( { showTitle: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Legend', 'blockenberg' ), checked: a.showLegend, onChange: v => setAttributes( { showLegend: v } ) } ),
                        el( IP().IconPickerControl, IP().iconPickerProps( a, setAttributes, { charAttr: 'icon', typeAttr: 'iconType', dashiconAttr: 'iconDashicon', imageUrlAttr: 'iconImageUrl' } ) ),
                        el( RangeControl, { label: __( 'Total Units', 'blockenberg' ), value: a.totalUnits, onChange: v => setAttributes( { totalUnits: v } ), min: 10, max: 200 } ),
                    ),

                    el( PanelBody, { title: __( 'Layout', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Columns', 'blockenberg' ),         value: a.gridCols,       onChange: v => setAttributes( { gridCols: v } ),       min: 4,  max: 25 } ),
                        el( RangeControl, { label: __( 'Cell Gap (px)', 'blockenberg' ),    value: a.cellGap,        onChange: v => setAttributes( { cellGap: v } ),        min: 0,  max: 24 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el(getTypoControl(), { label: __('Title', 'blockenberg'), value: a.titleTypo, onChange: v => setAttributes({ titleTypo: v }) }),
                        el( RangeControl, { label: __( 'Cell Size (px)', 'blockenberg' ),   value: a.cellSize,       onChange: v => setAttributes( { cellSize: v } ),       min: 16, max: 80 } ),
                        el( RangeControl, { label: __( 'Icon Font Size', 'blockenberg' ),   value: a.iconFontSize,   onChange: v => setAttributes( { iconFontSize: v } ),   min: 8,  max: 60 } ),
                        el( RangeControl, { label: __( 'Legend Font Size', 'blockenberg' ), value: a.legendFontSize, onChange: v => setAttributes( { legendFontSize: v } ), min: 9,  max: 22 } )
                    ),
                    el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Background',   'blockenberg' ), value: a.bgColor,    onChange: v => setAttributes( { bgColor:    v || '#ffffff' } ) },
                            { label: __( 'Title Color',  'blockenberg' ), value: a.titleColor, onChange: v => setAttributes( { titleColor: v || '#111827' } ) },
                            { label: __( 'Text Color',   'blockenberg' ), value: a.textColor,  onChange: v => setAttributes( { textColor:  v || '#374151' } ) },
                            { label: __( 'Empty Icon',   'blockenberg' ), value: a.emptyColor, onChange: v => setAttributes( { emptyColor: v || '#e5e7eb' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Segments', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { segments: [ ...a.segments, { label: 'New Segment', value: 10, color: '#6366f1' } ] } ) }, __( '+ Add Segment', 'blockenberg' ) ),
                        a.segments.map( ( seg, i ) =>
                            el( PanelBody, { key: i, title: seg.label || `Segment ${ i + 1 }`, initialOpen: false },
                                el( TextControl,  { label: __( 'Label', 'blockenberg' ),  value: seg.label,  onChange: v => updSeg( setAttributes, a.segments, i, 'label',  v ) } ),
                                el( RangeControl, { label: __( 'Value', 'blockenberg' ),  value: seg.value,  onChange: v => updSeg( setAttributes, a.segments, i, 'value',  v ), min: 0, max: a.totalUnits } ),
                                el( BkbgColorSwatch, { label: __( 'Color', 'blockenberg' ), value: seg.color, onChange: v => updSeg( setAttributes, a.segments, i, 'color',  v ) } ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { segments: a.segments.filter( ( _, x ) => x !== i ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-picto-title', style: { color: a.titleColor } }, a.title ),
                el( 'div', { className: 'bkbg-picto-svg' }, renderPictograph( a ) ),
            );
        },

        deprecated: [{
            attributes: {
                title: { type: "string", default: "Population by Age Group" },
                showTitle: { type: "boolean", default: true },
                icon: { type: "string", default: "\ud83d\udc64" },
                gridCols: { type: "integer", default: 10 },
                totalUnits: { type: "integer", default: 100 },
                cellSize: { type: "integer", default: 36 },
                cellGap: { type: "integer", default: 4 },
                iconFontSize: { type: "integer", default: 22 },
                showLegend: { type: "boolean", default: true },
                legendFontSize: { type: "integer", default: 13 },
                bgColor: { type: "string", default: "#ffffff" },
                titleColor: { type: "string", default: "#111827" },
                textColor: { type: "string", default: "#374151" },
                emptyColor: { type: "string", default: "#e5e7eb" },
                segments: { type: "array", default: [
                    { label: "Under 18", value: 22, color: "#6366f1" },
                    { label: "18 \u2013 34", value: 28, color: "#0ea5e9" },
                    { label: "35 \u2013 54", value: 30, color: "#10b981" },
                    { label: "55 \u2013 74", value: 14, color: "#f59e0b" },
                    { label: "75+", value: 6, color: "#ef4444" }
                ]},
                iconFontWeight: { type: "string", default: "400" },
                legendFontWeight: { type: "string", default: "400" }
            },
            save: function ( { attributes: a } ) {
                const blockProps = useBlockProps.save( { className: 'bkbg-picto-wrap' } );
                return el( 'div', blockProps,
                    a.showTitle && a.title ? el( 'h3', { className: 'bkbg-picto-title', style: { color: a.titleColor } }, a.title ) : null,
                    el( 'div', { className: 'bkbg-picto-svg' }, renderPictograph( a ) ),
                );
            }
        }],
        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save((function () {
                var tv = getTypoCssVars();
                var s = {};
                Object.assign(s, tv(a.titleTypo, '--bkbg-picto-tt-'));
                return { className: 'bkbg-picto-wrap', style: s };
            })());
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-picto-title', style: { color: a.titleColor } }, a.title ) : null,
                el( 'div', { className: 'bkbg-picto-svg' }, renderPictograph( a ) ),
            );
        },
    } );
}() );

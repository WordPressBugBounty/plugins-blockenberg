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
    function renderBullet( a ) {
        const series = a.series || [];
        const W   = a.svgWidth;
        const PT  = a.padTop;
        const PL  = a.padLeft;
        const PR  = a.padRight;
        const RH  = a.rowHeight;
        const BT  = a.barThickness;
        const TW  = a.targetWidth;

        const H      = PT + series.length * RH + 20;
        const chartW = W - PL - PR;

        function scaleX( v, max ) { return PL + ( v / ( max || 1 ) ) * chartW; }

        const svgEls = [];
        svgEls.push( el( 'rect', { key: 'bg', x: 0, y: 0, width: W, height: H, fill: a.bgColor || '#ffffff', rx: 8 } ) );

        // Grid ticks at top
        if ( a.showGridLines ) {
            const ticks = 5;
            for ( let t = 0; t <= ticks; t++ ) {
                const gx = PL + ( t / ticks ) * chartW;
                svgEls.push( el( 'line', { key: `gt${ t }`, x1: gx, y1: PT - 4, x2: gx, y2: H - 10, stroke: a.gridColor || '#f3f4f6', strokeWidth: 1, strokeDasharray: '3 3' } ) );
            }
        }

        series.forEach( ( s, i ) => {
            const max  = s.max  || 100;
            const cy   = PT + i * RH + RH / 2;
            const bh   = BT;
            const by   = cy - bh / 2;
            const clr  = s.color || '#6366f1';

            // Background bands: poor → sat → good → max
            const bands = [
                { from: 0,      to: s.poor || 0, color: a.bandColorPoor || '#f3f4f6' },
                { from: s.poor, to: s.sat  || 0, color: a.bandColorSat  || '#e5e7eb' },
                { from: s.sat,  to: s.good || 0, color: a.bandColorGood || '#d1d5db' },
                { from: s.good, to: max,          color: '#c8cdd5' },
            ];
            const bandH = RH * 0.72;
            bands.forEach( ( band, bi ) => {
                if ( band.to <= band.from ) return;
                const bx  = scaleX( band.from, max );
                const bw  = scaleX( band.to, max ) - bx;
                svgEls.push( el( 'rect', { key: `band${ i }${ bi }`, x: bx, y: cy - bandH / 2, width: bw, height: bandH, fill: band.color, rx: bi === 0 ? 3 : 0 } ) );
            } );

            // Actual bar
            const actualW = scaleX( s.actual || 0, max ) - PL;
            svgEls.push( el( 'rect', { key: `bar${ i }`, x: PL, y: by, width: Math.max( 0, actualW ), height: bh, fill: clr, rx: 3 } ) );

            // Target marker
            const tx = scaleX( s.target || 0, max );
            svgEls.push( el( 'rect', { key: `tgt${ i }`, x: tx - TW / 2, y: cy - bandH * 0.55, width: TW, height: bandH * 1.1, fill: a.targetColor || '#111827', rx: 1 } ) );

            // Row label
            svgEls.push( el( 'text', { key: `lbl${ i }`, x: PL - 8, y: cy, textAnchor: 'end', dominantBaseline: 'middle', fill: a.labelColor, fontSize: a.labelFontSize, fontFamily: 'inherit' }, s.label || '' ) );

            // Value label (actual / target)
            if ( a.showValues ) {
                const dispA = parseFloat( ( s.actual || 0 ).toFixed( 1 ) );
                const dispT = parseFloat( ( s.target || 0 ).toFixed( 1 ) );
                svgEls.push( el( 'text', { key: `val${ i }`, x: W - PR + 6, y: cy, dominantBaseline: 'middle', fill: clr, fontSize: a.valueFontSize, fontWeight: 700, fontFamily: 'inherit' }, `${ dispA } / ${ dispT }` ) );
            }
        } );

        // Legend row
        const legY = H - 14;
        [
            { label: 'Poor',        color: a.bandColorPoor || '#f3f4f6' },
            { label: 'Satisfactory', color: a.bandColorSat || '#e5e7eb' },
            { label: 'Good',        color: a.bandColorGood || '#d1d5db' },
            { label: 'Target',      color: a.targetColor || '#111827', isLine: true },
        ].forEach( ( it, li ) => {
            const lx = PL + li * 130;
            if ( it.isLine ) {
                svgEls.push( el( 'rect', { key: `lgn${ li }`, x: lx, y: legY - 6, width: 4, height: 12, fill: it.color } ) );
            } else {
                svgEls.push( el( 'rect', { key: `lgn${ li }`, x: lx, y: legY - 5, width: 18, height: 10, fill: it.color, rx: 2 } ) );
            }
            svgEls.push( el( 'text', { key: `lgt${ li }`, x: lx + 22, y: legY, dominantBaseline: 'middle', fill: a.labelColor, fontSize: 10, fontFamily: 'inherit' }, it.label ) );
        } );

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

    registerBlockType( 'blockenberg/bullet-chart', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps( { className: 'bkbg-bullet-wrap', style: Object.assign( {}, _tv( a.typoTitle, '--bkbg-bullet-title-' ) ) } );

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Chart Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl,  { label: __( 'Title', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),      checked: a.showTitle,    onChange: v => setAttributes( { showTitle: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Values', 'blockenberg' ),     checked: a.showValues,   onChange: v => setAttributes( { showValues: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Grid Lines', 'blockenberg' ), checked: a.showGridLines, onChange: v => setAttributes( { showGridLines: v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Layout', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Canvas Width', 'blockenberg' ),      value: a.svgWidth,      onChange: v => setAttributes( { svgWidth: v } ),      min: 300, max: 1200, step: 20 } ),
                        el( RangeControl, { label: __( 'Row Height', 'blockenberg' ),        value: a.rowHeight,     onChange: v => setAttributes( { rowHeight: v } ),     min: 28, max: 100 } ),
                        el( RangeControl, { label: __( 'Bar Thickness', 'blockenberg' ),     value: a.barThickness,  onChange: v => setAttributes( { barThickness: v } ),  min: 4, max: 40 } ),
                        el( RangeControl, { label: __( 'Target Marker Width', 'blockenberg' ), value: a.targetWidth, onChange: v => setAttributes( { targetWidth: v } ),   min: 2, max: 12 } ),
                        el( RangeControl, { label: __( 'Label Column Width', 'blockenberg' ), value: a.padLeft,      onChange: v => setAttributes( { padLeft: v } ),       min: 60, max: 300 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el(getTypographyControl(), { label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: function (v) { setAttributes({ typoTitle: v }); } }),
                        el( RangeControl, { label: __( 'Label Font Size', 'blockenberg' ),   value: a.labelFontSize, onChange: v => setAttributes( { labelFontSize: v } ), min: 9, max: 22 } ),
                        el( RangeControl, { label: __( 'Value Font Size', 'blockenberg' ),   value: a.valueFontSize, onChange: v => setAttributes( { valueFontSize: v } ), min: 7, max: 16 } )
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Band: Poor',         'blockenberg' ), value: a.bandColorPoor, onChange: v => setAttributes( { bandColorPoor: v || '#f3f4f6' } ) },
                            { label: __( 'Band: Satisfactory', 'blockenberg' ), value: a.bandColorSat,  onChange: v => setAttributes( { bandColorSat:  v || '#e5e7eb' } ) },
                            { label: __( 'Band: Good',         'blockenberg' ), value: a.bandColorGood, onChange: v => setAttributes( { bandColorGood: v || '#d1d5db' } ) },
                            { label: __( 'Target Marker',      'blockenberg' ), value: a.targetColor,   onChange: v => setAttributes( { targetColor:   v || '#111827' } ) },
                            { label: __( 'Background',         'blockenberg' ), value: a.bgColor,       onChange: v => setAttributes( { bgColor:       v || '#ffffff' } ) },
                            { label: __( 'Title Color',        'blockenberg' ), value: a.titleColor,    onChange: v => setAttributes( { titleColor:    v || '#111827' } ) },
                            { label: __( 'Label Color',        'blockenberg' ), value: a.labelColor,    onChange: v => setAttributes( { labelColor:    v || '#374151' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Series', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { series: [ ...a.series, { label: 'New KPI', color: '#6366f1', actual: 60, target: 80, poor: 20, sat: 50, good: 80, max: 100 } ] } ) }, __( '+ Add KPI', 'blockenberg' ) ),
                        a.series.map( ( s, si ) =>
                            el( PanelBody, { key: si, title: s.label || `KPI ${ si + 1 }`, initialOpen: false },
                                el( TextControl,  { label: __( 'Label', 'blockenberg' ),   value: s.label,  onChange: v => updSer( setAttributes, a.series, si, 'label',  v ) } ),
                                el( BkbgColorSwatch, { label: __( 'Color', 'blockenberg' ), value: s.color, onChange: v => updSer( setAttributes, a.series, si, 'color', v ) } ),
                                el( RangeControl, { label: __( 'Actual Value', 'blockenberg' ), value: s.actual, onChange: v => updSer( setAttributes, a.series, si, 'actual', v ), min: 0, max: s.max || 500, step: 0.1 } ),
                                el( RangeControl, { label: __( 'Target', 'blockenberg' ),   value: s.target, onChange: v => updSer( setAttributes, a.series, si, 'target', v ), min: 0, max: s.max || 500, step: 0.1 } ),
                                el( RangeControl, { label: __( 'Poor threshold', 'blockenberg' ),  value: s.poor,  onChange: v => updSer( setAttributes, a.series, si, 'poor',  v ), min: 0, max: s.max || 500 } ),
                                el( RangeControl, { label: __( 'Satisfactory thresh.', 'blockenberg' ), value: s.sat, onChange: v => updSer( setAttributes, a.series, si, 'sat', v ), min: 0, max: s.max || 500 } ),
                                el( RangeControl, { label: __( 'Good threshold', 'blockenberg' ),  value: s.good,  onChange: v => updSer( setAttributes, a.series, si, 'good',  v ), min: 0, max: s.max || 500 } ),
                                el( RangeControl, { label: __( 'Max (axis end)', 'blockenberg' ),  value: s.max,   onChange: v => updSer( setAttributes, a.series, si, 'max',   v ), min: 1, max: 100000 } ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { series: a.series.filter( ( _, x ) => x !== si ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-bullet-title', style: { color: a.titleColor } }, a.title ),
                el( 'div', { className: 'bkbg-bullet-svg' }, renderBullet( a ) ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save( { className: 'bkbg-bullet-wrap', style: Object.assign( {}, _tv( a.typoTitle, '--bkbg-bullet-title-' ) ) } );
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-bullet-title', style: { color: a.titleColor } }, a.title ) : null,
                el( 'div', { className: 'bkbg-bullet-svg' }, renderBullet( a ) ),
            );
        },
    } );
}() );

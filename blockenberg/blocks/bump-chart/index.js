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
    function renderBumpChart( a ) {
        const series  = a.series  || [];
        const xLabels = a.xLabels || [];
        const W   = a.svgWidth;
        const H   = a.svgHeight;
        const PT  = a.padTop;
        const PL  = a.padLeft;
        const PR  = a.padRight;
        const DR  = a.dotRadius;
        const LT  = a.lineThickness;

        const nCols    = Math.max( ...series.map( s => ( s.ranks || [] ).length ), xLabels.length, 2 );
        const maxRank  = Math.max( ...series.flatMap( s => s.ranks || [] ), 1 );
        const chartW   = W - PL - PR;
        const chartH   = H - PT - 20;

        function xAt( col ) { return PL + col * ( chartW / ( nCols - 1 ) ); }
        function yAt( rank ) { return PT + ( ( rank - 1 ) / Math.max( maxRank - 1, 1 ) ) * chartH; }

        // Cubic bezier S-curve between two rank points
        function curvePath( x0, y0, x1, y1 ) {
            const cpX = ( x0 + x1 ) / 2;
            return `M ${ x0 } ${ y0 } C ${ cpX } ${ y0 }, ${ cpX } ${ y1 }, ${ x1 } ${ y1 }`;
        }

        const svgEls = [];
        svgEls.push( el( 'rect', { key: 'bg', x: 0, y: 0, width: W, height: H, fill: a.bgColor || '#ffffff', rx: 8 } ) );

        // Vertical column guide lines
        if ( a.showColumnLabels ) {
            for ( let c = 0; c < nCols; c++ ) {
                const gx = xAt( c );
                svgEls.push( el( 'line', { key: `col${ c }`, x1: gx, y1: PT - 14, x2: gx, y2: H - 10, stroke: a.gridColor || '#f3f4f6', strokeWidth: 1 } ) );
                const lbl = xLabels[c] !== undefined ? String( xLabels[c] ) : String( c + 1 );
                svgEls.push( el( 'text', { key: `clt${ c }`, x: gx, y: PT - 20, textAnchor: 'middle', fill: a.textColor || '#374151', fontSize: a.labelFontSize, fontFamily: 'inherit', fontWeight: 600 }, lbl ) );
            }
        }

        // Series lines and dots
        series.forEach( ( ser, si ) => {
            const ranks = ser.ranks || [];
            const clr   = ser.color || '#6366f1';

            // Bezier segments between consecutive points
            for ( let c = 0; c < ranks.length - 1; c++ ) {
                const x0 = xAt( c );
                const y0 = yAt( ranks[c] );
                const x1 = xAt( c + 1 );
                const y1 = yAt( ranks[c + 1] );
                svgEls.push( el( 'path', { key: `seg${ si }${ c }`, d: curvePath( x0, y0, x1, y1 ), fill: 'none', stroke: clr, strokeWidth: LT, strokeLinecap: 'round' } ) );
            }

            // Dots and rank numbers
            ranks.forEach( ( rank, c ) => {
                const cx = xAt( c );
                const cy = yAt( rank );
                svgEls.push( el( 'circle', { key: `dot${ si }${ c }`, cx, cy, r: DR, fill: clr } ) );
                if ( a.showRankLabels ) {
                    svgEls.push( el( 'text', { key: `rk${ si }${ c }`, x: cx, y: cy, textAnchor: 'middle', dominantBaseline: 'middle', fill: '#ffffff', fontSize: a.rankFontSize, fontWeight: 700, fontFamily: 'inherit' }, String( rank ) ) );
                }
            } );

            // Left label
            if ( a.showEndLabels && ranks.length > 0 ) {
                svgEls.push( el( 'text', { key: `lblL${ si }`, x: xAt( 0 ) - DR - 6, y: yAt( ranks[0] ), textAnchor: 'end', dominantBaseline: 'middle', fill: clr, fontSize: a.labelFontSize, fontWeight: 600, fontFamily: 'inherit' }, ser.label || '' ) );
            }
            // Right label
            if ( a.showEndLabels && ranks.length > 0 ) {
                svgEls.push( el( 'text', { key: `lblR${ si }`, x: xAt( ranks.length - 1 ) + DR + 6, y: yAt( ranks[ranks.length - 1] ), textAnchor: 'start', dominantBaseline: 'middle', fill: clr, fontSize: a.labelFontSize, fontWeight: 600, fontFamily: 'inherit' }, ser.label || '' ) );
            }
        } );

        return el( 'svg', { viewBox: `0 0 ${ W } ${ H }`, width: '100%', style: { display: 'block', maxWidth: W + 'px', margin: '0 auto' } }, ...svgEls );
    }

    function updSer( setAttributes, series, si, field, val ) {
        setAttributes( { series: series.map( ( s, i ) => i === si ? { ...s, [field]: val } : s ) } );
    }
    function parseRanks( raw ) {
        return raw.split( /[\s,]+/ ).map( Number ).filter( v => !isNaN( v ) && v > 0 );
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

    registerBlockType( 'blockenberg/bump-chart', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps( { className: 'bkbg-bump-wrap', style: Object.assign( {}, _tv( a.typoTitle, '--bkbg-bump-title-' ) ) } );

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Chart Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl,  { label: __( 'Title', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),          checked: a.showTitle,         onChange: v => setAttributes( { showTitle: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Column Labels', 'blockenberg' ),  checked: a.showColumnLabels,  onChange: v => setAttributes( { showColumnLabels: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Rank Numbers', 'blockenberg' ),   checked: a.showRankLabels,    onChange: v => setAttributes( { showRankLabels: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Series Labels', 'blockenberg' ),  checked: a.showEndLabels,     onChange: v => setAttributes( { showEndLabels: v } ) } ),
                        el( TextControl,  { label: __( 'Column Labels (comma separated)', 'blockenberg' ), value: ( a.xLabels || [] ).join( ', ' ), onChange: v => setAttributes( { xLabels: v.split( /[\s,]+/ ).filter( Boolean ) } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Layout', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Canvas Width', 'blockenberg' ),    value: a.svgWidth,     onChange: v => setAttributes( { svgWidth: v } ),     min: 300, max: 1200, step: 20 } ),
                        el( RangeControl, { label: __( 'Canvas Height', 'blockenberg' ),   value: a.svgHeight,    onChange: v => setAttributes( { svgHeight: v } ),    min: 150, max: 700 } ),
                        el( RangeControl, { label: __( 'Dot Radius', 'blockenberg' ),      value: a.dotRadius,    onChange: v => setAttributes( { dotRadius: v } ),    min: 8,  max: 36 } ),
                        el( RangeControl, { label: __( 'Line Thickness', 'blockenberg' ),  value: a.lineThickness, onChange: v => setAttributes( { lineThickness: v } ), min: 1, max: 10 } ),
                        el( RangeControl, { label: __( 'Left Pad (label space)', 'blockenberg' ), value: a.padLeft, onChange: v => setAttributes( { padLeft: v } ),     min: 40, max: 280 } ),
                        el( RangeControl, { label: __( 'Right Pad (label space)', 'blockenberg' ), value: a.padRight, onChange: v => setAttributes( { padRight: v } ),  min: 40, max: 280 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el(getTypographyControl(), { label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: function (v) { setAttributes({ typoTitle: v }); } }),
                        el( RangeControl, { label: __( 'Label Font Size', 'blockenberg' ), value: a.labelFontSize, onChange: v => setAttributes( { labelFontSize: v } ), min: 9, max: 22 } ),
                        el( RangeControl, { label: __( 'Rank Font Size', 'blockenberg' ),  value: a.rankFontSize,  onChange: v => setAttributes( { rankFontSize: v } ),  min: 7, max: 18 } )
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Background',    'blockenberg' ), value: a.bgColor,    onChange: v => setAttributes( { bgColor:    v || '#ffffff' } ) },
                            { label: __( 'Column Lines',  'blockenberg' ), value: a.gridColor,  onChange: v => setAttributes( { gridColor:  v || '#f3f4f6' } ) },
                            { label: __( 'Title Color',   'blockenberg' ), value: a.titleColor, onChange: v => setAttributes( { titleColor: v || '#111827' } ) },
                            { label: __( 'Text Color',    'blockenberg' ), value: a.textColor,  onChange: v => setAttributes( { textColor:  v || '#374151' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Series', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { series: [ ...a.series, { label: 'New Series', color: '#6366f1', ranks: [1, 2, 3, 2, 1] } ] } ) }, __( '+ Add Series', 'blockenberg' ) ),
                        a.series.map( ( ser, si ) =>
                            el( PanelBody, { key: si, title: ser.label || `Series ${ si + 1 }`, initialOpen: false },
                                el( TextControl, { label: __( 'Label', 'blockenberg' ),         value: ser.label, onChange: v => updSer( setAttributes, a.series, si, 'label', v ) } ),
                                el( BkbgColorSwatch, { label: __( 'Color', 'blockenberg' ), value: ser.color, onChange: v => updSer( setAttributes, a.series, si, 'color', v ) } ),
                                el( TextControl, { label: __( 'Ranks (comma separated, 1=top)', 'blockenberg' ), value: ( ser.ranks || [] ).join( ', ' ), onChange: v => updSer( setAttributes, a.series, si, 'ranks', parseRanks( v ) ) } ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { series: a.series.filter( ( _, x ) => x !== si ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-bump-title', style: { color: a.titleColor } }, a.title ),
                el( 'div', { className: 'bkbg-bump-svg' }, renderBumpChart( a ) ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save( { className: 'bkbg-bump-wrap', style: Object.assign( {}, _tv( a.typoTitle, '--bkbg-bump-title-' ) ) } );
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-bump-title', style: { color: a.titleColor } }, a.title ) : null,
                el( 'div', { className: 'bkbg-bump-svg' }, renderBumpChart( a ) ),
            );
        },
    } );
}() );

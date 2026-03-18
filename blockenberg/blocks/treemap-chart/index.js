( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, Button, ColorPicker, Popover } = window.wp.components;
    const { __ } = window.wp.i18n;
    const { useState } = window.wp.element;

    var _tc, _tvf;
    Object.defineProperty(window, '_bkbgTypoCtrlCache', { get: function () { if (!_tc) { _tc = window.bkbgTypographyControl; } return _tc; } });
    Object.defineProperty(window, '_bkbgTypoVarsCache', { get: function () { if (!_tvf) { _tvf = window.bkbgTypoCssVars; } return _tvf; } });
    function getTypoControl(props, attrName, label) { return window._bkbgTypoCtrlCache(props, attrName, label); }

    // ── Binary partition treemap algorithm ───────────────────────────────────
    // Recursively splits the rectangle between items based on value ratio.
    // Alternates split direction (horizontal → vertical) based on aspect ratio.
    function partition( items, x, y, w, h ) {
        if ( !items || items.length === 0 ) return [];
        if ( items.length === 1 ) return [ { ...items[0], x, y, w, h } ];

        const total = items.reduce( ( s, it ) => s + ( it.value || 0 ), 0 );
        if ( total === 0 ) return [];

        // Find balanced split index (left total ≥ right total)
        let cumul = 0, splitIdx = Math.floor( items.length / 2 );
        for ( let i = 0; i < items.length - 1; i++ ) {
            cumul += ( items[i].value || 0 );
            if ( cumul * 2 >= total ) { splitIdx = i + 1; break; }
        }

        const leftItems  = items.slice( 0, splitIdx );
        const rightItems = items.slice( splitIdx );
        const leftTotal  = leftItems.reduce( ( s, it ) => s + ( it.value || 0 ), 0 );
        const ratio      = leftTotal / total;

        if ( w >= h ) {
            // Split horizontally
            const leftW = w * ratio;
            return [
                ...partition( leftItems,  x,          y, leftW,     h ),
                ...partition( rightItems, x + leftW,  y, w - leftW, h ),
            ];
        } else {
            // Split vertically
            const topH = h * ratio;
            return [
                ...partition( leftItems,  x, y,      w, topH     ),
                ...partition( rightItems, x, y + topH, w, h - topH ),
            ];
        }
    }

    // ── Apply gap inset to a cell ─────────────────────────────────────────────
    function inset( cell, gap ) {
        const half = gap / 2;
        return {
            x: cell.x + half, y: cell.y + half,
            w: Math.max( 0, cell.w - gap ),
            h: Math.max( 0, cell.h - gap ),
        };
    }

    // ── Helper to check if text fits in a cell ───────────────────────────────
    function fits( str, cell, fontSize ) {
        const charW = fontSize * 0.65;
        return cell.w >= str.length * charW && cell.h >= fontSize * 2;
    }

    // ── Render treemap SVG ───────────────────────────────────────────────────
    function renderTreemap( a ) {
        const W = a.svgWidth, H = a.svgHeight;
        const sorted = [ ...( a.items || [] ) ].sort( ( a, b ) => ( b.value || 0 ) - ( a.value || 0 ) );
        const cells  = partition( sorted, 0, 0, W, H );
        const total  = sorted.reduce( ( s, it ) => s + ( it.value || 0 ), 0 );

        const svgEls = [];

        // Background
        svgEls.push( el( 'rect', { key: 'bg', x: 0, y: 0, width: W, height: H, fill: a.bgColor || '#ffffff', rx: 6 } ) );

        cells.forEach( ( cell, i ) => {
            const pad  = inset( cell, a.gap );
            const rx   = a.cornerRadius;
            const pct  = total > 0 ? ( ( cell.value / total ) * 100 ).toFixed( 1 ) : '0';
            const labelVisible = a.showLabels && fits( cell.label || '', pad, a.labelFontSize );
            const valueVisible = a.showValues && pad.h >= a.labelFontSize * 2.5 && pad.w > 24;

            // Cell background
            svgEls.push( el( 'rect', {
                key: 'r' + i,
                x: pad.x, y: pad.y, width: pad.w, height: pad.h,
                fill: cell.color || '#4f46e5', rx,
            } ) );

            // Overlay for text contrast
            svgEls.push( el( 'rect', {
                key: 'ov' + i,
                x: pad.x, y: pad.y, width: pad.w, height: pad.h,
                fill: 'rgba(0,0,0,0.12)', rx,
            } ) );

            if ( labelVisible ) {
                const midX = pad.x + pad.w / 2;
                const midY = pad.y + pad.h / 2;
                const offset = valueVisible ? -( a.labelFontSize * 0.7 ) : 0;

                svgEls.push( el( 'text', {
                    key: 'lbl' + i,
                    x: midX, y: midY + offset,
                    textAnchor: 'middle', dominantBaseline: 'middle',
                    fill: '#ffffff', fontSize: a.labelFontSize, fontWeight: 700,
                    fontFamily: 'inherit',
                }, cell.label || '' ) );
            }

            if ( valueVisible ) {
                const midX = pad.x + pad.w / 2;
                const midY = pad.y + pad.h / 2;
                const offset = labelVisible ? a.valueFontSize * 0.9 : 0;
                const text   = a.showPercent ? pct + '%' : ( cell.value || 0 );

                svgEls.push( el( 'text', {
                    key: 'val' + i,
                    x: midX, y: midY + offset,
                    textAnchor: 'middle', dominantBaseline: 'middle',
                    fill: 'rgba(255,255,255,0.85)', fontSize: a.valueFontSize,
                    fontFamily: 'inherit',
                }, String( text ) ) );
            }
        } );

        return el( 'svg', {
            viewBox: `0 0 ${ W } ${ H }`, width: '100%',
            style: { display: 'block', maxWidth: W + 'px', margin: '0 auto' }
        }, ...svgEls );
    }

    // ── Legend row ────────────────────────────────────────────────────────────
    function renderLegend( a ) {
        const total = ( a.items || [] ).reduce( ( s, it ) => s + ( it.value || 0 ), 0 );
        const sorted = [ ...( a.items || [] ) ].sort( ( a, b ) => ( b.value || 0 ) - ( a.value || 0 ) );
        return el( 'div', { className: 'bkbg-tm-legend' },
            sorted.map( ( item, i ) => {
                const pct = total > 0 ? ( ( item.value / total ) * 100 ).toFixed( 1 ) : '0';
                return el( 'div', { key: i, className: 'bkbg-tm-legend-item' },
                    el( 'span', { className: 'bkbg-tm-swatch', style: { background: item.color } } ),
                    el( 'span', { className: 'bkbg-tm-legend-label' }, item.label || '' ),
                    el( 'span', { className: 'bkbg-tm-legend-val' }, `${ item.value } (${ pct }%)` ),
                );
            } )
        );
    }

    // ── Block registration ────────────────────────────────────────────────────    /* ── colour-swatch + popover ── */
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
    registerBlockType( 'blockenberg/treemap-chart', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = ( function () {
                var s = {};
                Object.assign( s, window._bkbgTypoVarsCache( a.titleTypo, '--bktmc-tt-' ) );
                return useBlockProps( { className: 'bkbg-treemap-wrap', style: Object.keys( s ).length ? s : undefined } );
            } )();

            function updItem( idx, field, val ) {
                const next = a.items.map( ( it, i ) => i === idx ? { ...it, [field]: val } : it );
                setAttributes( { items: next } );
            }

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Chart Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl, { label: __( 'Title', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ), checked: a.showTitle, onChange: v => setAttributes( { showTitle: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Labels', 'blockenberg' ), checked: a.showLabels, onChange: v => setAttributes( { showLabels: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Values', 'blockenberg' ), checked: a.showValues, onChange: v => setAttributes( { showValues: v } ) } ),
                        el( ToggleControl, { label: __( 'Show as Percent', 'blockenberg' ), checked: a.showPercent, onChange: v => setAttributes( { showPercent: v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Canvas & Style', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Width', 'blockenberg' ),        value: a.svgWidth,      onChange: v => setAttributes( { svgWidth: v } ),      min: 300, max: 1200, step: 50 } ),
                        el( RangeControl, { label: __( 'Height', 'blockenberg' ),       value: a.svgHeight,     onChange: v => setAttributes( { svgHeight: v } ),     min: 200, max: 800, step: 50 } ),
                        el( RangeControl, { label: __( 'Cell Gap', 'blockenberg' ),     value: a.gap,           onChange: v => setAttributes( { gap: v } ),           min: 0, max: 16 } ),
                        el( RangeControl, { label: __( 'Corner Radius', 'blockenberg' ), value: a.cornerRadius, onChange: v => setAttributes( { cornerRadius: v } ), min: 0, max: 20 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl( props, 'titleTypo', __( 'Title', 'blockenberg' ) ),
                        el( RangeControl, { label: __( 'Label Font Size', 'blockenberg' ), value: a.labelFontSize, onChange: v => setAttributes( { labelFontSize: v } ), min: 8, max: 24 } ),
                        el( RangeControl, { label: __( 'Value Font Size', 'blockenberg' ), value: a.valueFontSize, onChange: v => setAttributes( { valueFontSize: v } ), min: 8, max: 20 } )
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ),
                        initialOpen: false,
                        colorSettings: [
                            { label: __( 'Background', 'blockenberg' ),  value: a.bgColor,    onChange: v => setAttributes( { bgColor:    v || '#ffffff' } ) },
                            { label: __( 'Title Color', 'blockenberg' ), value: a.titleColor, onChange: v => setAttributes( { titleColor: v || '#111827' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Data Items', 'blockenberg' ), initialOpen: false },
                        el( Button, {
                            variant: 'secondary', style: { marginBottom: 10 },
                            onClick: () => setAttributes( { items: [ ...a.items, { label: 'New Item', value: 5, color: '#6b7280' } ] } )
                        }, __( '+ Add Item', 'blockenberg' ) ),

                        a.items.map( ( item, i ) =>
                            el( PanelBody, { key: i, title: ( item.label || `Item ${ i + 1 }` ) + ` (${ item.value })`, initialOpen: false },
                                el( TextControl, { label: __( 'Label', 'blockenberg' ),    value: item.label, onChange: v => updItem( i, 'label', v ) } ),
                                el( BkbgColorSwatch, { label: __( 'Color', 'blockenberg' ), value: item.color, onChange: v => updItem( i, 'color', v ) } ),
                                el( RangeControl, { label: __( 'Value', 'blockenberg' ),   value: item.value, onChange: v => updItem( i, 'value', v ), min: 1, max: 1000 } ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { items: a.items.filter( ( _, x ) => x !== i ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-tm-title', style: { color: a.titleColor } }, a.title ),
                el( 'div', { className: 'bkbg-tm-svg' }, renderTreemap( a ) ),
                renderLegend( a ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockProps = ( function () {
                var tv = window._bkbgTypoVarsCache( a.titleTypo, '--bktmc-tt-' );
                var parts = []; Object.keys( tv ).forEach( function ( k ) { parts.push( k + ':' + tv[k] ); } );
                return useBlockProps.save( { className: 'bkbg-treemap-wrap', style: parts.length ? parts.join( ';' ) : undefined } );
            } )();
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-tm-title', style: { color: a.titleColor } }, a.title ) : null,
                el( 'div', { className: 'bkbg-tm-svg' }, renderTreemap( a ) ),
                renderLegend( a ),
            );
        },
    } );
}() );

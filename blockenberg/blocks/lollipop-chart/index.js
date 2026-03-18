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

    // ── Renderer ──────────────────────────────────────────────────────────────
    function renderLollipop( a ) {
        const items = a.sortDesc
            ? [ ...( a.items || [] ) ].sort( ( x, y ) => ( y.value || 0 ) - ( x.value || 0 ) )
            : [ ...( a.items || [] ) ];

        const maxVal  = Math.max( ...items.map( it => it.value || 0 ), 1 );
        const n       = items.length;
        const W       = a.svgWidth;
        const H       = a.padTop * 2 + n * a.rowHeight;
        const chartW  = W - a.padLeft - a.padRight;
        const DR      = a.dotRadius;

        const svgEls = [];
        svgEls.push( el( 'rect', { key: 'bg', x: 0, y: 0, width: W, height: H, fill: a.bgColor || '#ffffff', rx: 8 } ) );

        // Grid lines (vertical)
        if ( a.showGridLines ) {
            const ticks = 4;
            for ( let i = 0; i <= ticks; i++ ) {
                const x = a.padLeft + ( chartW * i / ticks );
                svgEls.push( el( 'line', {
                    key: 'grid' + i,
                    x1: x, y1: a.padTop, x2: x, y2: H - a.padTop,
                    stroke: a.gridColor || '#f3f4f6', strokeWidth: 1,
                } ) );
                svgEls.push( el( 'text', {
                    key: 'tick' + i,
                    x, y: a.padTop - 8,
                    textAnchor: 'middle', fill: '#d1d5db',
                    fontSize: 10, fontFamily: 'inherit',
                }, String( Math.round( maxVal * i / ticks ) ) ) );
            }
        }

        items.forEach( ( item, i ) => {
            const cy   = a.padTop + i * a.rowHeight + a.rowHeight / 2;
            const barX = a.padLeft;
            const dotX = barX + ( ( item.value || 0 ) / maxVal ) * ( chartW - DR );
            const color = item.color || '#4f46e5';

            // Stem (from left edge to dot)
            svgEls.push( el( 'line', {
                key: 'stem' + i,
                x1: barX, y1: cy, x2: dotX, y2: cy,
                stroke: a.stemColor || '#e5e7eb', strokeWidth: a.stemThickness,
                strokeLinecap: 'round',
            } ) );

            // Dot (filled)
            svgEls.push( el( 'circle', { key: 'dot_bg' + i, cx: dotX, cy, r: DR,     fill: color, opacity: 0.15 } ) );
            svgEls.push( el( 'circle', { key: 'dot'    + i, cx: dotX, cy, r: DR - 2, fill: color } ) );

            // Value label inside dot
            if ( a.showValues ) {
                svgEls.push( el( 'text', {
                    key: 'val' + i,
                    x: dotX, y: cy,
                    textAnchor: 'middle', dominantBaseline: 'middle',
                    fill: '#ffffff', fontSize: a.valueFontSize, fontWeight: 700, fontFamily: 'inherit',
                }, String( item.value || 0 ) ) );
            }

            // Row label (left)
            svgEls.push( el( 'text', {
                key: 'lbl' + i,
                x: barX - 10, y: cy,
                textAnchor: 'end', dominantBaseline: 'middle',
                fill: a.labelColor || '#374151',
                fontSize: a.labelFontSize, fontFamily: 'inherit',
            }, item.label || '' ) );
        } );

        return el( 'svg', {
            viewBox: `0 0 ${ W } ${ H }`, width: '100%',
            style: { display: 'block', maxWidth: W + 'px', margin: '0 auto' }
        }, ...svgEls );
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    function updItem( setAttributes, items, idx, field, val ) {
        setAttributes( { items: items.map( ( it, i ) => i === idx ? { ...it, [field]: val } : it ) } );
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
    registerBlockType( 'blockenberg/lollipop-chart', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps( (function () {
                var _tvFn = getTypoCssVars();
                var s = {};
                if (_tvFn) Object.assign(s, _tvFn(a.titleTypo, '--bkbg-lp-tt-'));
                return { className: 'bkbg-lollipop-wrap', style: s };
            })() );

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Chart Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl, { label: __( 'Title', 'blockenberg' ),       value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),     checked: a.showTitle,    onChange: v => setAttributes( { showTitle: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Values', 'blockenberg' ),    checked: a.showValues,   onChange: v => setAttributes( { showValues: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Grid Lines', 'blockenberg' ), checked: a.showGridLines, onChange: v => setAttributes( { showGridLines: v } ) } ),
                        el( ToggleControl, { label: __( 'Sort High → Low', 'blockenberg' ), checked: a.sortDesc,    onChange: v => setAttributes( { sortDesc: v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Layout', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Canvas Width', 'blockenberg' ),    value: a.svgWidth,      onChange: v => setAttributes( { svgWidth: v } ),      min: 300, max: 1200, step: 20 } ),
                        el( RangeControl, { label: __( 'Row Height', 'blockenberg' ),      value: a.rowHeight,     onChange: v => setAttributes( { rowHeight: v } ),     min: 24, max: 100 } ),
                        el( RangeControl, { label: __( 'Label Column Width', 'blockenberg' ), value: a.padLeft,    onChange: v => setAttributes( { padLeft: v } ),       min: 60, max: 300 } ),
                        el( RangeControl, { label: __( 'Dot Radius', 'blockenberg' ),      value: a.dotRadius,     onChange: v => setAttributes( { dotRadius: v } ),     min: 8, max: 30 } ),
                        el( RangeControl, { label: __( 'Stem Thickness', 'blockenberg' ),  value: a.stemThickness, onChange: v => setAttributes( { stemThickness: v } ), min: 1, max: 8 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el(getTypoControl(), { label: __('Title', 'blockenberg'), value: a.titleTypo, onChange: v => setAttributes({ titleTypo: v }) }),
                        el( RangeControl, { label: __( 'Label Font Size', 'blockenberg' ), value: a.labelFontSize, onChange: v => setAttributes( { labelFontSize: v } ), min: 9, max: 22 } ),
                        el( RangeControl, { label: __( 'Value Font Size', 'blockenberg' ), value: a.valueFontSize, onChange: v => setAttributes( { valueFontSize: v } ), min: 8, max: 18 } )
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Background', 'blockenberg' ),  value: a.bgColor,    onChange: v => setAttributes( { bgColor:    v || '#ffffff' } ) },
                            { label: __( 'Grid Lines', 'blockenberg' ),  value: a.gridColor,  onChange: v => setAttributes( { gridColor:  v || '#f3f4f6' } ) },
                            { label: __( 'Stem Color', 'blockenberg' ),  value: a.stemColor,  onChange: v => setAttributes( { stemColor:  v || '#e5e7eb' } ) },
                            { label: __( 'Title Color', 'blockenberg' ), value: a.titleColor, onChange: v => setAttributes( { titleColor: v || '#111827' } ) },
                            { label: __( 'Label Color', 'blockenberg' ), value: a.labelColor, onChange: v => setAttributes( { labelColor: v || '#374151' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Data', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { items: [ ...a.items, { label: 'New Entry', value: 50, color: '#6b7280' } ] } ) }, __( '+ Add Item', 'blockenberg' ) ),
                        a.items.map( ( item, i ) =>
                            el( PanelBody, { key: i, title: ( item.label || `Item ${ i + 1 }` ) + ` — ${ item.value }`, initialOpen: false },
                                el( TextControl, { label: __( 'Label', 'blockenberg' ),       value: item.label, onChange: v => updItem( setAttributes, a.items, i, 'label', v ) } ),
                                el( RangeControl, { label: __( 'Value', 'blockenberg' ),      value: item.value, onChange: v => updItem( setAttributes, a.items, i, 'value', v ), min: 0, max: 10000 } ),
                                el( BkbgColorSwatch, { label: __( 'Color', 'blockenberg' ), value: item.color, onChange: v => updItem( setAttributes, a.items, i, 'color', v ) } ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { items: a.items.filter( ( _, x ) => x !== i ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-lp-title', style: { color: a.titleColor } }, a.title ),
                el( 'div', { className: 'bkbg-lp-svg' }, renderLollipop( a ) ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockPropsSave = useBlockProps.save( (function () {
                var _tvFn = window.bkbgTypoCssVars;
                var s = {};
                if (_tvFn) Object.assign(s, _tvFn(a.titleTypo, '--bkbg-lp-tt-'));
                return { className: 'bkbg-lollipop-wrap', style: s };
            })() );
            return el( 'div', blockPropsSave,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-lp-title', style: { color: a.titleColor } }, a.title ) : null,
                el( 'div', { className: 'bkbg-lp-svg' }, renderLollipop( a ) ),
            );
        },
    } );
}() );

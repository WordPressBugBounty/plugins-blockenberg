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

    // ── Helpers ──────────────────────────────────────────────────────────────
    function updBranch( setAttributes, branches, idx, field, val ) {
        const next = branches.map( ( b, i ) => i === idx ? { ...b, [field]: val } : b );
        setAttributes( { branches: next } );
    }

    function updItem( setAttributes, branches, bIdx, iIdx, val ) {
        const next = branches.map( ( b, i ) => {
            if ( i !== bIdx ) return b;
            const items = b.items.map( ( it, j ) => j === iIdx ? val : it );
            return { ...b, items };
        } );
        setAttributes( { branches: next } );
    }

    // ── SVG renderer ─────────────────────────────────────────────────────────
    function renderMindMap( a, opts ) {
        opts = opts || {};
        var it = opts.inlineTypo;
        const W = a.svgWidth, H = a.svgHeight;
        const cx = W / 2, cy = H / 2;
        const count = a.branches.length || 1;
        const CR = a.centralRadius;
        const BR = a.branchRadius;
        const dist = Math.min( W, H ) * 0.31;
        const nodes = [];

        // Effective sizes (read from typo if available, else old attr)
        var cfSize = (!it && a.centralTypo && a.centralTypo.sizeDesktop) || a.centralFontSize;
        var bfSize = (!it && a.branchTypo && a.branchTypo.sizeDesktop) || a.branchFontSize;
        var ifSize = (!it && a.itemTypo && a.itemTypo.sizeDesktop) || a.itemFontSize;

        // Text element props: inline attrs (old) or CSS classes (new)
        var ctProps = it ? { fontSize: a.centralFontSize, fontWeight: (a.fontWeight || 600), fontFamily: 'inherit' } : { className: 'bkbg-mmap-central' };
        var brProps = it ? { fontSize: a.branchFontSize, fontWeight: (a.fontWeight || 600), fontFamily: 'inherit' } : { className: 'bkbg-mmap-branch' };
        var itProps = it ? { fontSize: a.itemFontSize, fontFamily: 'inherit' } : { className: 'bkbg-mmap-item' };

        // Background
        nodes.push( el( 'rect', { key: 'bg', x: 0, y: 0, width: W, height: H, fill: a.bgColor || '#f9fafb', rx: 10 } ) );

        // Render branches
        a.branches.forEach( ( branch, i ) => {
            const angle = ( 2 * Math.PI * i / count ) - Math.PI / 2;
            const bx = cx + dist * Math.cos( angle );
            const by = cy + dist * Math.sin( angle );
            const color = branch.color || '#4f46e5';

            // Connector line: center edge → branch edge
            if ( a.showLines ) {
                nodes.push( el( 'line', {
                    key: 'ln' + i,
                    x1: cx + CR * Math.cos( angle ),
                    y1: cy + CR * Math.sin( angle ),
                    x2: bx - BR * Math.cos( angle ),
                    y2: by - BR * Math.sin( angle ),
                    stroke: color, strokeWidth: 2.5, strokeOpacity: 0.55,
                    strokeDasharray: a.dashedLines ? '7 5' : null,
                } ) );
            }

            // Branch circle fill + stroke
            nodes.push( el( 'circle', { key: 'bf' + i, cx: bx, cy: by, r: BR, fill: color, opacity: 0.14 } ) );
            nodes.push( el( 'circle', { key: 'bs' + i, cx: bx, cy: by, r: BR, fill: 'none', stroke: color, strokeWidth: 2 } ) );

            // Branch label
            nodes.push( el( 'text', Object.assign({
                key: 'bl' + i, x: bx, y: by,
                textAnchor: 'middle', dominantBaseline: 'middle',
                fill: color
            }, brProps), branch.label || __( 'Branch', 'blockenberg' ) ) );

            // Sub-items
            if ( branch.items && branch.items.length > 0 ) {
                const subDist = BR + 20 + ifSize * 3.5;
                const spread  = Math.min( 1.1, ( branch.items.length - 1 ) * 0.35 );
                branch.items.forEach( ( item, j ) => {
                    if ( !item ) return;
                    const off      = branch.items.length > 1 ? -spread / 2 + spread * j / ( branch.items.length - 1 ) : 0;
                    const sa       = angle + off;
                    const sx       = bx + subDist * Math.cos( sa );
                    const sy       = by + subDist * Math.sin( sa );
                    const anchor   = Math.cos( sa ) >= 0 ? 'start' : 'end';

                    // Sub-connector
                    nodes.push( el( 'line', {
                        key: 'sl' + i + '_' + j,
                        x1: bx + BR * Math.cos( sa ), y1: by + BR * Math.sin( sa ),
                        x2: sx - 6 * Math.cos( sa ),  y2: sy - 6 * Math.sin( sa ),
                        stroke: color, strokeWidth: 1.5, strokeOpacity: 0.45
                    } ) );

                    // Dot
                    nodes.push( el( 'circle', { key: 'sd' + i + '_' + j, cx: sx, cy: sy, r: 5, fill: color, opacity: 0.7 } ) );

                    // Label
                    nodes.push( el( 'text', Object.assign({
                        key: 'st' + i + '_' + j,
                        x: sx + ( Math.cos( sa ) >= 0 ? 9 : -9 ), y: sy,
                        textAnchor: anchor, dominantBaseline: 'middle',
                        fill: a.textColor || '#374151'
                    }, itProps), item ) );
                } );
            }
        } );

        // Central circle (on top of lines)
        nodes.push( el( 'circle', { key: 'cc', cx, cy, r: CR, fill: a.centralColor || '#4f46e5' } ) );

        // Central topic text — split on spaces for multi-word wrapping
        const words  = ( a.centralTopic || 'Main Topic' ).split( ' ' );
        const lineH  = cfSize * ( ((!it && a.centralTypo && a.centralTypo.lineHeightDesktop) || a.lineHeight || 1.3) );
        const startY = cy - ( ( words.length - 1 ) / 2 ) * lineH;
        words.forEach( ( w, i ) => {
            nodes.push( el( 'text', Object.assign({
                key: 'ct' + i, x: cx, y: startY + i * lineH,
                textAnchor: 'middle', dominantBaseline: 'middle',
                fill: '#ffffff'
            }, ctProps), w ) );
        } );

        return el( 'svg', {
            viewBox: `0 0 ${ W } ${ H }`, width: '100%',
            style: { display: 'block', maxWidth: W + 'px', margin: '0 auto' }
        }, ...nodes );
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
    registerBlockType( 'blockenberg/mind-map', {
        deprecated: [{
            save: function ( { attributes: a } ) {
                var blockProps = useBlockProps.save( { className: 'bkbg-mind-map-wrap' } );
                return el( 'div', blockProps,
                    el( 'div', { className: 'bkbg-mind-map-svg' }, renderMindMap( a, { inlineTypo: true } ) ),
                );
            },
        }],
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            var blockProps = useBlockProps((function () {
                var _tvf = getTypoCssVars();
                var s = {};
                Object.assign(s, _tvf(a.centralTypo, '--bkbg-mmap-ct-'));
                Object.assign(s, _tvf(a.branchTypo, '--bkbg-mmap-br-'));
                Object.assign(s, _tvf(a.itemTypo, '--bkbg-mmap-it-'));
                return { className: 'bkbg-mind-map-wrap', style: s };
            })());

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Central Topic', 'blockenberg' ), initialOpen: true },
                        el( TextControl, { label: __( 'Topic Text', 'blockenberg' ), value: a.centralTopic, onChange: v => setAttributes( { centralTopic: v } ) } ),
                        el( RangeControl, { label: __( 'Central Radius', 'blockenberg' ), value: a.centralRadius, onChange: v => setAttributes( { centralRadius: v } ), min: 30, max: 100 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el( getTypoControl(), { label: __( 'Central Topic', 'blockenberg' ), value: a.centralTypo, onChange: function (v) { setAttributes({ centralTypo: v }); } }),
                        el( getTypoControl(), { label: __( 'Branch Label', 'blockenberg' ), value: a.branchTypo, onChange: function (v) { setAttributes({ branchTypo: v }); } }),
                        el( getTypoControl(), { label: __( 'Item Label', 'blockenberg' ), value: a.itemTypo, onChange: function (v) { setAttributes({ itemTypo: v }); } })
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ),
                        initialOpen: false,
                        colorSettings: [
                            { label: __( 'Central Color', 'blockenberg' ),  value: a.centralColor, onChange: v => setAttributes( { centralColor: v || '#4f46e5' } ) },
                            { label: __( 'Item Text Color', 'blockenberg' ), value: a.textColor,    onChange: v => setAttributes( { textColor:    v || '#374151' } ) },
                            { label: __( 'Background', 'blockenberg' ),      value: a.bgColor,      onChange: v => setAttributes( { bgColor:      v || '#f9fafb' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Layout', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Canvas Width', 'blockenberg' ),   value: a.svgWidth,       onChange: v => setAttributes( { svgWidth: v } ),       min: 400, max: 1200, step: 50 } ),
                        el( RangeControl, { label: __( 'Canvas Height', 'blockenberg' ),  value: a.svgHeight,      onChange: v => setAttributes( { svgHeight: v } ),      min: 300, max: 900,  step: 50 } ),
                        el( RangeControl, { label: __( 'Branch Radius', 'blockenberg' ),  value: a.branchRadius,   onChange: v => setAttributes( { branchRadius: v } ),   min: 20, max: 80 } ),
                        el( ToggleControl, { label: __( 'Show Lines', 'blockenberg' ),  checked: a.showLines,  onChange: v => setAttributes( { showLines: v } ) } ),
                        el( ToggleControl, { label: __( 'Dashed Lines', 'blockenberg' ), checked: a.dashedLines, onChange: v => setAttributes( { dashedLines: v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Branches', 'blockenberg' ), initialOpen: false },
                        el( Button, {
                            variant: 'secondary', style: { marginBottom: 12 },
                            onClick: () => setAttributes( { branches: [ ...a.branches, { label: __( 'New Branch', 'blockenberg' ), color: '#6b7280', items: [] } ] } )
                        }, __( '+ Add Branch', 'blockenberg' ) ),

                        a.branches.map( ( branch, i ) =>
                            el( PanelBody, { key: i, title: ( branch.label || `Branch ${ i + 1 }` ), initialOpen: false },
                                el( TextControl, { label: __( 'Label', 'blockenberg' ),  value: branch.label, onChange: v => updBranch( setAttributes, a.branches, i, 'label', v ) } ),
                                el( BkbgColorSwatch, { label: __( 'Color', 'blockenberg' ), value: branch.color, onChange: v => updBranch( setAttributes, a.branches, i, 'color', v ) } ),

                                el( 'p', { style: { fontWeight: 600, margin: '10px 0 4px' } }, __( 'Sub-items', 'blockenberg' ) ),

                                branch.items.map( ( item, j ) =>
                                    el( 'div', { key: j, style: { display: 'flex', gap: 4, marginBottom: 4, alignItems: 'center' } },
                                        el( TextControl, { value: item, hideLabelFromVision: true, label: `Item ${ j + 1 }`, onChange: v => updItem( setAttributes, a.branches, i, j, v ), style: { flex: 1 } } ),
                                        el( Button, { isDestructive: true, isSmall: true, onClick: () => { const items = branch.items.filter( ( _, x ) => x !== j ); updBranch( setAttributes, a.branches, i, 'items', items ); } }, '×' ),
                                    )
                                ),

                                el( 'div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 } },
                                    el( Button, { variant: 'secondary', isSmall: true, onClick: () => updBranch( setAttributes, a.branches, i, 'items', [ ...branch.items, '' ] ) }, __( '+ Sub-item', 'blockenberg' ) ),
                                    el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { branches: a.branches.filter( ( _, x ) => x !== i ) } ) }, __( 'Remove Branch', 'blockenberg' ) ),
                                ),
                            )
                        ),
                    ),
                ),

                el( 'div', { className: 'bkbg-mind-map-svg' }, renderMindMap( a ) ),
            );
        },

        save: function ( { attributes: a } ) {
            var blockProps = useBlockProps.save((function () {
                var _tvf = getTypoCssVars();
                var s = {};
                Object.assign(s, _tvf(a.centralTypo, '--bkbg-mmap-ct-'));
                Object.assign(s, _tvf(a.branchTypo, '--bkbg-mmap-br-'));
                Object.assign(s, _tvf(a.itemTypo, '--bkbg-mmap-it-'));
                return { className: 'bkbg-mind-map-wrap', style: s };
            })());
            return el( 'div', blockProps,
                el( 'div', { className: 'bkbg-mind-map-svg' }, renderMindMap( a ) ),
            );
        },
    } );
}() );

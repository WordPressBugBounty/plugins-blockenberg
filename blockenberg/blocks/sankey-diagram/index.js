( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, Button, SelectControl, ColorPicker, Popover } = window.wp.components;
    const { __ } = window.wp.i18n;
    const { useState } = window.wp.element;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    // ── Sankey layout engine ──────────────────────────────────────────────────
    // Assigns columns (x-layers) by BFS traversal, then distributes nodes
    // vertically and draws cubic-bezier flow paths.

    function buildSankey( nodes, links, W, H, nodeWidth, nodePad ) {
        if ( !nodes.length || !links.length ) return { svgNodes: [], svgLinks: [] };

        const nMap = {};
        nodes.forEach( n => nMap[n.id] = { ...n, inValue: 0, outValue: 0, col: -1 } );

        // Sum flows
        links.forEach( lk => {
            if ( nMap[lk.source] ) nMap[lk.source].outValue += lk.value || 0;
            if ( nMap[lk.target] ) nMap[lk.target].inValue  += lk.value || 0;
        } );

        // BFS column assignment — nodes with no in-links are col 0
        const hasIn  = new Set( links.map( lk => lk.target ) );
        const colMap = {};
        const queue  = nodes.filter( n => !hasIn.has( n.id ) ).map( n => n.id );
        queue.forEach( id => { colMap[id] = 0; } );

        let head = 0;
        while ( head < queue.length ) {
            const id = queue[head++];
            links.forEach( lk => {
                if ( lk.source === id ) {
                    const newCol = ( colMap[id] || 0 ) + 1;
                    if ( colMap[lk.target] === undefined || colMap[lk.target] < newCol ) {
                        colMap[lk.target] = newCol;
                        if ( !queue.includes( lk.target ) ) queue.push( lk.target );
                    }
                }
            } );
        }
        // Fallback for isolated nodes
        nodes.forEach( n => { if ( colMap[n.id] === undefined ) colMap[n.id] = 0; } );

        const maxCol = Math.max( ...nodes.map( n => colMap[n.id] ), 0 );
        const colCnt = maxCol + 1;

        // Group nodes per column
        const byCols = Array.from( { length: colCnt }, () => [] );
        nodes.forEach( n => byCols[colCnt - 1 - colMap[n.id]].push( n.id ) ); // reverse: sinks on right

        // Actually keep sources on left
        nodes.forEach( n => {
            byCols[ colMap[n.id] ] = byCols[ colMap[n.id] ] || [];
        } );
        // Redo groups
        for ( let i = 0; i <= maxCol; i++ ) byCols[i] = [];
        nodes.forEach( n => byCols[ colMap[n.id] ].push( n.id ) );

        // Column x positions
        const colX = {};
        const colW = ( W - nodeWidth ) / Math.max( maxCol, 1 );
        for ( let c = 0; c <= maxCol; c++ ) {
            colX[c] = c * colW;
        }

        // Node value = max( inValue, outValue ), min 1 for display
        nodes.forEach( n => {
            const nd = nMap[n.id];
            nd.totalValue = Math.max( nd.inValue, nd.outValue, 1 );
        } );

        // For each column: distribute heights proportionally
        const totalH = H - nodePad;
        const nodePos = {}; // id → { x, y, h }

        for ( let c = 0; c <= maxCol; c++ ) {
            const colNodes = byCols[c];
            if ( !colNodes.length ) continue;
            const colTotal = colNodes.reduce( ( s, id ) => s + nMap[id].totalValue, 0 );
            const available = totalH - ( colNodes.length - 1 ) * nodePad;
            let y = nodePad / 2;
            colNodes.forEach( id => {
                const h = Math.max( 6, ( nMap[id].totalValue / colTotal ) * available );
                nodePos[id] = { x: colX[c], y, h };
                y += h + nodePad;
            } );
        }

        // ── Build SVG nodes list ──────────────────────────────────────────────
        const svgNodes = nodes.map( ( n, i ) => {
            const pos = nodePos[n.id];
            if ( !pos ) return null;
            const color  = n.color || '#4f46e5';
            const labelX = colMap[n.id] === maxCol ? pos.x - 6 : pos.x + nodeWidth + 6;
            const anchor = colMap[n.id] === maxCol ? 'end' : 'start';

            return {
                key: 'node_' + n.id + i,
                rect: { x: pos.x, y: pos.y, w: nodeWidth, h: pos.h, color },
                label: { x: labelX, y: pos.y + pos.h / 2, text: n.label || n.id, color, anchor },
                value: nMap[n.id].totalValue,
            };
        } ).filter( Boolean );

        // ── Build SVG flow paths ──────────────────────────────────────────────
        // Track how much of each node's height is consumed by flows
        const nodeOutY = {};
        const nodeInY  = {};
        nodes.forEach( n => {
            const pos = nodePos[n.id];
            if ( pos ) { nodeOutY[n.id] = pos.y; nodeInY[n.id] = pos.y; }
        } );

        // Total in/out per node
        const totalOut = {};
        const totalIn  = {};
        links.forEach( lk => {
            totalOut[lk.source] = ( totalOut[lk.source] || 0 ) + ( lk.value || 0 );
            totalIn[lk.target]  = ( totalIn[lk.target]  || 0 ) + ( lk.value || 0 );
        } );

        const svgLinks = links.map( ( lk, i ) => {
            const src = nodePos[lk.source];
            const tgt = nodePos[lk.target];
            if ( !src || !tgt ) return null;

            const srcNode = nMap[lk.source];
            const tgtNode = nMap[lk.target];

            const srcH = src.h * ( ( lk.value || 0 ) / Math.max( totalOut[lk.source] || 1, 1 ) );
            const tgtH = src.h * ( ( lk.value || 0 ) / Math.max( totalIn[lk.target]  || 1, 1 ) );

            const sy0 = nodeOutY[lk.source] || src.y;
            const sy1 = sy0 + srcH;
            const ty0 = nodeInY[lk.target]  || tgt.y;
            const ty1 = ty0 + tgtH;

            nodeOutY[lk.source] = sy1;
            nodeInY[lk.target]  = ty1;

            const x0 = src.x + nodeWidth;
            const x1 = tgt.x;
            const midX = ( x0 + x1 ) / 2;

            const d = `M ${ x0 } ${ sy0 } C ${ midX } ${ sy0 }, ${ midX } ${ ty0 }, ${ x1 } ${ ty0 } L ${ x1 } ${ ty1 } C ${ midX } ${ ty1 }, ${ midX } ${ sy1 }, ${ x0 } ${ sy1 } Z`;

            return {
                key:   'link_' + lk.source + '_' + lk.target + '_' + i,
                d,
                color: srcNode.color || '#4f46e5',
                value: lk.value,
            };
        } ).filter( Boolean );

        return { svgNodes, svgLinks };
    }

    // ── Render ────────────────────────────────────────────────────────────────
    function renderSankey( a ) {
        const W = a.svgWidth, H = a.svgHeight;
        const { svgNodes, svgLinks } = buildSankey( a.nodes, a.links, W, H, a.nodeWidth, a.nodePad );
        const op = ( a.flowOpacity || 40 ) / 100;

        const svgEls = [];
        svgEls.push( el( 'rect', { key: 'bg', x: 0, y: 0, width: W, height: H, fill: a.bgColor || '#ffffff', rx: 8 } ) );

        // Links (behind nodes)
        svgLinks.forEach( lk => {
            svgEls.push( el( 'path', { key: lk.key, d: lk.d, fill: lk.color, opacity: op } ) );
        } );

        // Nodes
        svgNodes.forEach( n => {
            svgEls.push( el( 'rect', { key: n.key + 'r', x: n.rect.x, y: n.rect.y, width: n.rect.w, height: n.rect.h, fill: n.rect.color, rx: 3 } ) );
            svgEls.push( el( 'text', {
                key: n.key + 'l', x: n.label.x, y: n.label.y,
                textAnchor: n.label.anchor, dominantBaseline: 'middle',
                fill: a.textColor || '#374151', fontSize: a.labelFontSize, fontWeight: a.labelFontWeight, fontFamily: 'inherit',
            }, n.label.text ) );
            if ( a.showValues ) {
                svgEls.push( el( 'text', {
                    key: n.key + 'v', x: n.label.x, y: n.label.y + a.labelFontSize + 2,
                    textAnchor: n.label.anchor, dominantBaseline: 'middle',
                    fill: n.rect.color, fontSize: a.valueFontSize, fontFamily: 'inherit', opacity: 0.85,
                }, String( n.value ) ) );
            }
        } );

        return el( 'svg', {
            viewBox: `0 0 ${ W } ${ H }`, width: '100%',
            style: { display: 'block', maxWidth: W + 'px', margin: '0 auto' }
        }, ...svgEls );
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    let _nid = 100;
    function nid() { return 'n' + ( ++_nid ); }

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
    registerBlockType( 'blockenberg/sankey-diagram', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps((function () {
                var _tv = getTypoCssVars();
                var s = {};
                if (_tv) {
                    Object.assign(s, _tv(a.titleTypo, '--bksk-tt-'));
                }
                return { className: 'bkbg-sankey-wrap', style: s };
            })());

            const nodeOptions = [
                { label: __( '— Select —', 'blockenberg' ), value: '' },
                ...a.nodes.map( n => ( { label: n.label || n.id, value: n.id } ) ),
            ];

            function updNode( idx, field, val ) {
                setAttributes( { nodes: a.nodes.map( ( n, i ) => i === idx ? { ...n, [field]: val } : n ) } );
            }
            function updLink( idx, field, val ) {
                setAttributes( { links: a.links.map( ( lk, i ) => i === idx ? { ...lk, [field]: val } : lk ) } );
            }

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Chart Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl, { label: __( 'Title', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),  checked: a.showTitle,  onChange: v => setAttributes( { showTitle: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Values', 'blockenberg' ), checked: a.showValues, onChange: v => setAttributes( { showValues: v } ) } ),
                        el( RangeControl, { label: __( 'Canvas Width', 'blockenberg' ),  value: a.svgWidth,   onChange: v => setAttributes( { svgWidth: v } ),   min: 300, max: 1200, step: 50 } ),
                        el( RangeControl, { label: __( 'Canvas Height', 'blockenberg' ), value: a.svgHeight,  onChange: v => setAttributes( { svgHeight: v } ),  min: 200, max: 900, step: 50 } ),
                        el( RangeControl, { label: __( 'Node Width', 'blockenberg' ),    value: a.nodeWidth,  onChange: v => setAttributes( { nodeWidth: v } ),  min: 8, max: 60 } ),
                        el( RangeControl, { label: __( 'Node Padding', 'blockenberg' ),  value: a.nodePad,    onChange: v => setAttributes( { nodePad: v } ),    min: 4, max: 60 } ),
                        el( RangeControl, { label: __( 'Flow Opacity %', 'blockenberg' ), value: a.flowOpacity, onChange: v => setAttributes( { flowOpacity: v } ), min: 5, max: 95 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl() && el( getTypoControl(), { label: __('Title Typography'), value: a.titleTypo || {}, onChange: function(v){ setAttributes({ titleTypo: v }); } }),
                        el( RangeControl, { label: __( 'Label Font Size', 'blockenberg' ), value: a.labelFontSize, onChange: v => setAttributes( { labelFontSize: v } ), min: 8, max: 22, __nextHasNoMarginBottom: true } ),
                        el( RangeControl, { label: __( 'Label Font Weight', 'blockenberg' ), value: a.labelFontWeight, onChange: v => setAttributes( { labelFontWeight: v } ), min: 100, max: 900, step: 100, __nextHasNoMarginBottom: true } ),
                        el( RangeControl, { label: __( 'Label Line Height', 'blockenberg' ), value: a.labelLineHeight, onChange: v => setAttributes( { labelLineHeight: v } ), min: 1, max: 3, step: 0.1, __nextHasNoMarginBottom: true } ),
                        el( RangeControl, { label: __( 'Value Font Size', 'blockenberg' ), value: a.valueFontSize, onChange: v => setAttributes( { valueFontSize: v } ), min: 8, max: 18, __nextHasNoMarginBottom: true } ),
                        el( RangeControl, { label: __( 'Value Font Weight', 'blockenberg' ), value: a.valueFontWeight, onChange: v => setAttributes( { valueFontWeight: v } ), min: 100, max: 900, step: 100, __nextHasNoMarginBottom: true } ),
                        el( RangeControl, { label: __( 'Value Line Height', 'blockenberg' ), value: a.valueLineHeight, onChange: v => setAttributes( { valueLineHeight: v } ), min: 1, max: 3, step: 0.1, __nextHasNoMarginBottom: true } )
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Background', 'blockenberg' ),  value: a.bgColor,    onChange: v => setAttributes( { bgColor:    v || '#ffffff' } ) },
                            { label: __( 'Title Color', 'blockenberg' ), value: a.titleColor, onChange: v => setAttributes( { titleColor: v || '#111827' } ) },
                            { label: __( 'Text Color', 'blockenberg' ),  value: a.textColor,  onChange: v => setAttributes( { textColor:  v || '#374151' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Nodes', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { nodes: [ ...a.nodes, { id: nid(), label: 'New Node', color: '#6b7280' } ] } ) }, __( '+ Add Node', 'blockenberg' ) ),
                        a.nodes.map( ( n, i ) =>
                            el( PanelBody, { key: n.id, title: n.label || `Node ${ i + 1 }`, initialOpen: false },
                                el( TextControl, { label: __( 'ID (unique)', 'blockenberg' ), value: n.id,    onChange: v => updNode( i, 'id', v.replace( /\s/g, '-' ) ) } ),
                                el( TextControl, { label: __( 'Label', 'blockenberg' ),       value: n.label, onChange: v => updNode( i, 'label', v ) } ),
                                el( BkbgColorSwatch, { label: __( 'Color', 'blockenberg' ), value: n.color, onChange: v => updNode( i, 'color', v ) } ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { nodes: a.nodes.filter( ( _, x ) => x !== i ) } ) }, __( 'Remove Node', 'blockenberg' ) ),
                            )
                        ),
                    ),

                    el( PanelBody, { title: __( 'Flows (Links)', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { links: [ ...a.links, { source: '', target: '', value: 100 } ] } ) }, __( '+ Add Flow', 'blockenberg' ) ),
                        a.links.map( ( lk, i ) =>
                            el( PanelBody, { key: i, title: `${ lk.source || '?' } → ${ lk.target || '?' } (${ lk.value })`, initialOpen: false },
                                el( SelectControl, { label: __( 'From (source)', 'blockenberg' ), value: lk.source, options: nodeOptions, onChange: v => updLink( i, 'source', v ) } ),
                                el( SelectControl, { label: __( 'To (target)', 'blockenberg' ),   value: lk.target, options: nodeOptions, onChange: v => updLink( i, 'target', v ) } ),
                                el( RangeControl, { label: __( 'Flow Value', 'blockenberg' ),     value: lk.value,  onChange: v => updLink( i, 'value', v ), min: 1, max: 100000, step: 1 } ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { links: a.links.filter( ( _, x ) => x !== i ) } ) }, __( 'Remove Flow', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-sk-title', style: { color: a.titleColor } }, a.title ),
                el( 'div', { className: 'bkbg-sk-svg' }, renderSankey( a ) ),
            );
        },

        deprecated: [{
            save: function ( { attributes: a } ) {
                const blockProps = useBlockProps.save( { className: 'bkbg-sankey-wrap' } );
                return el( 'div', blockProps,
                    a.showTitle && a.title ? el( 'h3', { className: 'bkbg-sk-title', style: { color: a.titleColor } }, a.title ) : null,
                    el( 'div', { className: 'bkbg-sk-svg' }, renderSankey( a ) ),
                );
            },
        }],

        save: function ( { attributes: a } ) {
            var _tv = getTypoCssVars();
            var s = {};
            if (_tv) {
                Object.assign(s, _tv(a.titleTypo, '--bksk-tt-'));
            }
            const blockProps = useBlockProps.save( { className: 'bkbg-sankey-wrap', style: s } );
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-sk-title', style: { color: a.titleColor } }, a.title ) : null,
                el( 'div', { className: 'bkbg-sk-svg' }, renderSankey( a ) ),
            );
        },
    } );
}() );

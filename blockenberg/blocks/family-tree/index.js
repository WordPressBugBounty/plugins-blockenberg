( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, SelectControl, Button, ColorPicker, Popover } = window.wp.components;
    const { __ } = window.wp.i18n;
    const { useState } = window.wp.element;

    var _ftTC, _ftTV;
    function _tc() { return _ftTC || (_ftTC = window.bkbgTypographyControl); }
    function _tv(t, p) { return (_ftTV || (_ftTV = window.bkbgTypoCssVars)) ? _ftTV(t, p) : {}; }
    var IP = function () { return window.bkbgIconPicker; };

    // ── Layout engine ─────────────────────────────────────────────────────────
    function calcLayout( persons, nodeW, nodeGap, levelGap, padY, svgW ) {
        if ( !persons || !persons.length ) return {};
        const pMap = {};
        persons.forEach( p => pMap[p.id] = p );

        // BFS to assign generation depth
        const genMap = {};
        const roots   = persons.filter( p => !p.parentId );
        const queue   = roots.map( r => r.id );
        roots.forEach( r => { genMap[r.id] = 0; } );

        while ( queue.length ) {
            const id   = queue.shift();
            const children = persons.filter( p => p.parentId === id );
            children.forEach( c => {
                if ( genMap[c.id] === undefined ) {
                    genMap[c.id] = genMap[id] + 1;
                    queue.push( c.id );
                }
            } );
        }

        // Spouses inherit their partner's generation
        let changed = true;
        while ( changed ) {
            changed = false;
            persons.forEach( p => {
                if ( p.spouseId && pMap[p.spouseId] && genMap[p.spouseId] !== undefined && genMap[p.id] === undefined ) {
                    genMap[p.id] = genMap[p.spouseId];
                    changed = true;
                }
            } );
        }
        persons.forEach( p => { if ( genMap[p.id] === undefined ) genMap[p.id] = 0; } );

        // Group by generation, keeping spouse pairs adjacent
        const genGroups = {};
        persons.forEach( p => {
            const g = genMap[p.id];
            if ( !genGroups[g] ) genGroups[g] = [];
            genGroups[g].push( p );
        } );

        const ordered = {};
        Object.keys( genGroups ).forEach( g => {
            const seen = new Set();
            const row  = [];
            genGroups[g].forEach( p => {
                if ( seen.has( p.id ) ) return;
                seen.add( p.id );
                row.push( p );
                if ( p.spouseId && pMap[p.spouseId] && genMap[p.spouseId] === Number( g ) && !seen.has( p.spouseId ) ) {
                    seen.add( p.spouseId );
                    row.push( pMap[p.spouseId] );
                }
            } );
            ordered[g] = row;
        } );

        // Assign x/y positions
        const posMap = {};
        Object.keys( ordered ).forEach( g => {
            const row    = ordered[g];
            const totalW = row.length * nodeW + ( row.length - 1 ) * nodeGap;
            const startX = Math.max( 16, ( svgW - totalW ) / 2 );
            row.forEach( ( p, i ) => {
                posMap[p.id] = {
                    x:   startX + i * ( nodeW + nodeGap ),
                    y:   padY + Number( g ) * levelGap,
                    gen: Number( g ),
                };
            } );
        } );

        return posMap;
    }

    // ── SVG renderer ──────────────────────────────────────────────────────────
    function renderFamilyTree( a ) {
        const { svgWidth: W, nodeW, levelGap, nodeGap, padY } = a;
        const CR      = Math.round( nodeW * 0.28 ); // circle radius
        const posMap  = calcLayout( a.persons, nodeW, nodeGap, levelGap, padY, W );
        const pMap    = {};
        a.persons.forEach( p => pMap[p.id] = p );

        // Auto SVG height
        const maxGen = Object.values( posMap ).reduce( ( m, p ) => Math.max( m, p.gen ), 0 );
        const nodeHeight = CR * 2 + a.nameFontSize + a.yearFontSize + 16;
        const H      = padY + ( maxGen + 1 ) * levelGap + nodeHeight + 20;

        const nodes = [];

        // Background
        nodes.push( el( 'rect', { key: 'bg', x: 0, y: 0, width: W, height: H, fill: a.bgColor || '#fafafa', rx: 10 } ) );

        // ── Spouse connection lines (dashed horizontal) ──────────────────────
        const drawnSpouses = new Set();
        a.persons.forEach( p => {
            if ( !p.spouseId || !posMap[p.id] || !posMap[p.spouseId] ) return;
            const key = [ p.id, p.spouseId ].sort().join( '_' );
            if ( drawnSpouses.has( key ) ) return;
            drawnSpouses.add( key );

            const p1  = posMap[p.id];
            const p2  = posMap[p.spouseId];
            const cx1 = p1.x + nodeW / 2;
            const cx2 = p2.x + nodeW / 2;
            const cy  = p1.y + CR;
            const x1  = Math.min( cx1, cx2 ) + CR + 4;
            const x2  = Math.max( cx1, cx2 ) - CR - 4;
            const mx  = ( x1 + x2 ) / 2;

            if ( x2 > x1 ) {
                nodes.push( el( 'line', { key: 'spouse_' + key, x1, y1: cy, x2, y2: cy, stroke: a.lineColor, strokeWidth: 1.5, strokeDasharray: '4 3' } ) );
                nodes.push( el( 'text', { key: 'heart_' + key, x: mx, y: cy + 1, textAnchor: 'middle', dominantBaseline: 'middle', fontSize: 11, fontFamily: 'inherit' }, '♥' ) );
            }
        } );

        // ── Parent → child elbow lines ────────────────────────────────────────
        a.persons.forEach( p => {
            if ( !p.parentId || !posMap[p.id] || !posMap[p.parentId] ) return;
            const par  = posMap[p.parentId];
            const chd  = posMap[p.id];
            const pcx  = par.x + nodeW / 2;
            const pcy  = par.y + CR * 2 + 4;
            const ccx  = chd.x + nodeW / 2;
            const ccy  = chd.y - 4;
            const midY = ( pcy + ccy ) / 2;

            nodes.push( el( 'path', {
                key: 'link_' + p.id,
                d: `M ${ pcx } ${ pcy } V ${ midY } H ${ ccx } V ${ ccy }`,
                stroke: a.lineColor, strokeWidth: 2, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round',
            } ) );
        } );

        // ── Person nodes ──────────────────────────────────────────────────────
        a.persons.forEach( p => {
            if ( !posMap[p.id] ) return;
            const pos   = posMap[p.id];
            const cx    = pos.x + nodeW / 2;
            const cy    = pos.y + CR;
            const color = p.color || '#4f46e5';

            nodes.push( el( 'circle', { key: 'pbg_' + p.id, cx, cy, r: CR, fill: color, opacity: 0.15 } ) );
            nodes.push( el( 'circle', { key: 'pst_' + p.id, cx, cy, r: CR, fill: 'none', stroke: color, strokeWidth: 2.5 } ) );

            // Emoji
            nodes.push( el( 'text', {
                key: 'em_' + p.id, x: cx, y: cy,
                textAnchor: 'middle', dominantBaseline: 'middle',
                fontSize: Math.max( 12, Math.floor( CR * 0.88 ) ), fontFamily: 'inherit',
            }, p.emoji || '👤' ) );

            // Name
            nodes.push( el( 'text', {
                key: 'nm_' + p.id, x: cx, y: pos.y + CR * 2 + 13,
                textAnchor: 'middle', dominantBaseline: 'middle',
                fill: a.textColor, fontSize: a.nameFontSize, fontWeight: a.nameFontWeight || 600, fontFamily: 'inherit',
            }, p.name || '' ) );

            // Years
            if ( p.years ) {
                nodes.push( el( 'text', {
                    key: 'yr_' + p.id, x: cx, y: pos.y + CR * 2 + 13 + a.nameFontSize + 3,
                    textAnchor: 'middle', dominantBaseline: 'middle',
                    fill: color, fontSize: a.yearFontSize, fontFamily: 'inherit', opacity: 0.8,
                }, p.years ) );
            }
        } );

        return el( 'svg', {
            viewBox: `0 0 ${ W } ${ H }`, width: '100%',
            style: { display: 'block', maxWidth: W + 'px', margin: '0 auto' },
        }, ...nodes );
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    let _nextId = 100;
    function genId() { return String( ++_nextId ); }

    function updPerson( setAttributes, persons, idx, field, val ) {
        const next = persons.map( ( p, i ) => i === idx ? { ...p, [field]: val } : p );
        setAttributes( { persons: next } );
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
    registerBlockType( 'blockenberg/family-tree', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps( { className: 'bkbg-family-tree-wrap', style: Object.assign( {},
                _tv( a.typoTitle || {}, '--bkbg-ft-ttl-' )
            ) } );

            const personOptions = [
                { label: __( '— None —', 'blockenberg' ), value: '' },
                ...a.persons.map( p => ( { label: p.name || `Person ${ p.id }`, value: p.id } ) ),
            ];

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Tree Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl, { label: __( 'Title', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ), checked: a.showTitle, onChange: v => setAttributes( { showTitle: v } ) } ),
                        el( RangeControl, { label: __( 'Canvas Width', 'blockenberg' ),    value: a.svgWidth,     onChange: v => setAttributes( { svgWidth: v } ),     min: 400, max: 1200, step: 20 } ),
                        el( RangeControl, { label: __( 'Node Width', 'blockenberg' ),      value: a.nodeW,        onChange: v => setAttributes( { nodeW: v } ),        min: 70, max: 160 } ),
                        el( RangeControl, { label: __( 'Level Gap', 'blockenberg' ),       value: a.levelGap,     onChange: v => setAttributes( { levelGap: v } ),     min: 100, max: 250 } ),
                        el( RangeControl, { label: __( 'Node Spacing', 'blockenberg' ),    value: a.nodeGap,      onChange: v => setAttributes( { nodeGap: v } ),      min: 4, max: 60 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        _tc() && el( _tc(), { label: 'Title', typo: a.typoTitle || {}, onChange: v => setAttributes( { typoTitle: v } ) } ),
                        el( RangeControl, { label: __( 'Name Font Size', 'blockenberg' ),  value: a.nameFontSize, onChange: v => setAttributes( { nameFontSize: v } ), min: 8, max: 18 } ),
                        el( SelectControl, { label: __( 'Name Font Weight', 'blockenberg' ), value: a.nameFontWeight, onChange: v => setAttributes( { nameFontWeight: v } ), options: [ { label: 'Normal (400)', value: '400' }, { label: 'Medium (500)', value: '500' }, { label: 'Semi-Bold (600)', value: '600' }, { label: 'Bold (700)', value: '700' }, { label: 'Extra-Bold (800)', value: '800' } ] } ),
                        el( RangeControl, { label: __( 'Year Font Size', 'blockenberg' ),  value: a.yearFontSize, onChange: v => setAttributes( { yearFontSize: v } ), min: 8, max: 16 } )
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ),
                        initialOpen: false,
                        colorSettings: [
                            { label: __( 'Background', 'blockenberg' ),   value: a.bgColor,    onChange: v => setAttributes( { bgColor:    v || '#fafafa' } ) },
                            { label: __( 'Line Color', 'blockenberg' ),   value: a.lineColor,  onChange: v => setAttributes( { lineColor:  v || '#9ca3af' } ) },
                            { label: __( 'Title Color', 'blockenberg' ),  value: a.titleColor, onChange: v => setAttributes( { titleColor: v || '#111827' } ) },
                            { label: __( 'Text Color', 'blockenberg' ),   value: a.textColor,  onChange: v => setAttributes( { textColor:  v || '#111827' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'People', 'blockenberg' ), initialOpen: false },
                        el( Button, {
                            variant: 'secondary', style: { marginBottom: 10 },
                            onClick: () => setAttributes( { persons: [ ...a.persons, { id: genId(), name: 'New Person', years: '', emoji: '🧑', parentId: '', spouseId: '', color: '#6b7280', emojiType: 'custom-char', emojiDashicon: '', emojiImageUrl: '' } ] } )
                        }, __( '+ Add Person', 'blockenberg' ) ),

                        a.persons.map( ( person, i ) =>
                            el( PanelBody, { key: person.id, title: person.name || `Person ${ i + 1 }`, initialOpen: false },
                                el( TextControl, { label: __( 'Name', 'blockenberg' ),         value: person.name,    onChange: v => updPerson( setAttributes, a.persons, i, 'name', v ) } ),
                                el( TextControl, { label: __( 'Years / Dates', 'blockenberg' ), value: person.years,   onChange: v => updPerson( setAttributes, a.persons, i, 'years', v ) } ),
                                el(IP().IconPickerControl, {
                                    iconType: person.emojiType, customChar: person.emoji, dashicon: person.emojiDashicon, imageUrl: person.emojiImageUrl,
                                    onChangeType: v => updPerson( setAttributes, a.persons, i, 'emojiType', v ),
                                    onChangeChar: v => updPerson( setAttributes, a.persons, i, 'emoji', v ),
                                    onChangeDashicon: v => updPerson( setAttributes, a.persons, i, 'emojiDashicon', v ),
                                    onChangeImageUrl: v => updPerson( setAttributes, a.persons, i, 'emojiImageUrl', v )
                                }),
                                el( BkbgColorSwatch, { label: __( 'Color', 'blockenberg' ), value: person.color, onChange: v => updPerson( setAttributes, a.persons, i, 'color', v ) } ),
                                el( SelectControl, { label: __( 'Parent (father/mother)', 'blockenberg' ), value: person.parentId, options: personOptions, onChange: v => updPerson( setAttributes, a.persons, i, 'parentId', v ) } ),
                                el( SelectControl, { label: __( 'Spouse / Partner', 'blockenberg' ),       value: person.spouseId, options: personOptions, onChange: v => updPerson( setAttributes, a.persons, i, 'spouseId', v ) } ),
                                el( Button, { isDestructive: true, isSmall: true, style: { marginTop: 4 }, onClick: () => setAttributes( { persons: a.persons.filter( ( _, x ) => x !== i ) } ) }, __( 'Remove Person', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-ft-title', style: { color: a.titleColor } }, a.title ),
                el( 'div', { className: 'bkbg-ft-svg' }, renderFamilyTree( a ) ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save( { className: 'bkbg-family-tree-wrap', style: Object.assign( {},
                _tv( a.typoTitle || {}, '--bkbg-ft-ttl-' )
            ) } );
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-ft-title', style: { color: a.titleColor } }, a.title ) : null,
                el( 'div', { className: 'bkbg-ft-svg' }, renderFamilyTree( a ) ),
            );
        },
    } );
}() );

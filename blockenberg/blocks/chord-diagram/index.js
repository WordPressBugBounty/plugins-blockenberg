( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, Button, ColorPicker, Popover } = window.wp.components;
    const { __ } = window.wp.i18n;
    const { useState } = window.wp.element;
    function getTypographyControl() { return (window.bkbgTypographyControl || function () { return null; }); }
    function getTypoCssVars() { return (window.bkbgTypoCssVars || function () { return {}; }); }
    function _tv(typo, prefix) { var fn = getTypoCssVars(); return fn(typo || {}, prefix); }

    const TAU = 2 * Math.PI;

    // ── Arc path helper ───────────────────────────────────────────────────────
    function arcPath( cx, cy, r, startAngle, endAngle, thickness ) {
        const innerR = r - thickness;
        const cos0 = Math.cos, sin0 = Math.sin;
        const sx1 = cx + r     * cos0( startAngle ), sy1 = cy + r     * sin0( startAngle );
        const sx2 = cx + r     * cos0( endAngle ),   sy2 = cy + r     * sin0( endAngle );
        const ix1 = cx + innerR * cos0( endAngle ),   iy1 = cy + innerR * sin0( endAngle );
        const ix2 = cx + innerR * cos0( startAngle ), iy2 = cy + innerR * sin0( startAngle );
        const largeArc = ( endAngle - startAngle ) > Math.PI ? 1 : 0;
        return `M ${ sx1 } ${ sy1 } A ${ r } ${ r } 0 ${ largeArc } 1 ${ sx2 } ${ sy2 } L ${ ix1 } ${ iy1 } A ${ innerR } ${ innerR } 0 ${ largeArc } 0 ${ ix2 } ${ iy2 } Z`;
    }

    // ── Chord path helper (ribbon between two arc segments) ───────────────────
    function chordPath( cx, cy, r, sa0, sa1, ta0, ta1 ) {
        const innerR = r;
        const p = ( a ) => ( { x: cx + innerR * Math.cos( a ), y: cy + innerR * Math.sin( a ) } );
        const s0 = p( sa0 ), s1 = p( sa1 ), t0 = p( ta0 ), t1 = p( ta1 );
        return `M ${ s0.x } ${ s0.y } A ${ innerR } ${ innerR } 0 0 1 ${ s1.x } ${ s1.y } Q ${ cx } ${ cy } ${ t0.x } ${ t0.y } A ${ innerR } ${ innerR } 0 0 1 ${ t1.x } ${ t1.y } Q ${ cx } ${ cy } ${ s0.x } ${ s0.y } Z`;
    }

    // ── Main renderer ─────────────────────────────────────────────────────────
    function renderChord( a ) {
        const S     = a.svgSize;
        const cx    = S / 2, cy = S / 2;
        const R     = S / 2 - 60;           // outer radius (leave room for labels)
        const inner = R - a.arcThickness;
        const gapAngle = ( a.arcGap / 180 ) * Math.PI; // gap in radians
        const groups = a.groups || [];
        const matrix = a.matrix || [];
        const n      = groups.length;
        if ( n < 2 ) return el( 'svg', { viewBox: `0 0 ${ S } ${ S }`, width: '100%' }, el( 'text', { x: cx, y: cy, textAnchor: 'middle', fill: '#9ca3af' }, __( 'Add at least 2 groups', 'blockenberg' ) ) );

        // Row totals → group "size"
        const totals = groups.map( ( _, i ) => {
            const row = matrix[i] || [];
            return row.reduce( ( s, v ) => s + ( v || 0 ), 0 );
        } );
        const grand = totals.reduce( ( s, v ) => s + v, 0 ) || 1;

        // Angle spans per group
        const totalAngle = TAU - n * gapAngle;
        const spans = totals.map( t => ( t / grand ) * totalAngle );

        // Start angles
        const startAngles = [];
        let angle = -Math.PI / 2; // start at top
        for ( let i = 0; i < n; i++ ) {
            startAngles.push( angle );
            angle += spans[i] + gapAngle;
        }

        // Track sub-angle offsets for chords
        const outOffset = startAngles.slice();

        const svgEls = [];
        svgEls.push( el( 'rect', { key: 'bg', x: 0, y: 0, width: S, height: S, fill: a.bgColor || '#ffffff', rx: 10 } ) );

        // ── Draw chords (behind arcs) ─────────────────────────────────────────
        const op = ( a.chordOpacity || 55 ) / 100;

        for ( let i = 0; i < n; i++ ) {
            for ( let j = i + 1; j < n; j++ ) {
                const val = ( matrix[i] && matrix[i][j] ) || 0;
                const valji = ( matrix[j] && matrix[j][i] ) || 0;
                if ( val + valji === 0 ) continue;

                // Source slice for i→j
                const iFrac = spans[i] / totalAngle; // proportional
                const jFrac = spans[j] / totalAngle;

                const sa0 = outOffset[i];
                const sa1 = sa0 + ( ( val / grand ) * totalAngle );
                outOffset[i] = sa1;

                const ta0 = outOffset[j];
                const ta1 = ta0 + ( ( valji / grand ) * totalAngle );
                outOffset[j] = ta1;

                const d = chordPath( cx, cy, inner, sa0, sa1, ta0, ta1 );
                svgEls.push( el( 'path', { key: `chord_${ i }_${ j }`, d, fill: groups[i].color || '#4f46e5', opacity: op } ) );
            }
        }

        // ── Draw arcs (on top of chords) ──────────────────────────────────────
        for ( let i = 0; i < n; i++ ) {
            const sa = startAngles[i];
            const ea = sa + spans[i];
            const color = groups[i].color || '#4f46e5';
            const d = arcPath( cx, cy, R, sa, ea, a.arcThickness );
            svgEls.push( el( 'path', { key: `arc_${ i }`, d, fill: color } ) );

            // Labels
            if ( a.showLabels ) {
                const midAngle = ( sa + ea ) / 2;
                const labelR   = R + 14;
                const lx = cx + labelR * Math.cos( midAngle );
                const ly = cy + labelR * Math.sin( midAngle );
                const anchor = Math.cos( midAngle ) > 0.1 ? 'start' : Math.cos( midAngle ) < -0.1 ? 'end' : 'middle';

                svgEls.push( el( 'text', {
                    key: `lbl_${ i }`, x: lx, y: ly,
                    textAnchor: anchor, dominantBaseline: 'middle',
                    fill: color, fontSize: a.labelFontSize, fontWeight: a.labelFontWeight, fontFamily: 'inherit',
                }, groups[i].label || `Group ${ i + 1 }` ) );
            }
        }

        return el( 'svg', {
            viewBox: `0 0 ${ S } ${ S }`, width: '100%',
            style: { display: 'block', maxWidth: S + 'px', margin: '0 auto' }
        }, ...svgEls );
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    function ensureMatrix( groups, matrix ) {
        const n = groups.length;
        return Array.from( { length: n }, ( _, i ) =>
            Array.from( { length: n }, ( _, j ) =>
                ( matrix[i] && matrix[i][j] !== undefined ) ? matrix[i][j] : 0
            )
        );
    }

    function addGroup( a, setAttributes ) {
        const newGroups = [ ...a.groups, { label: `Group ${ a.groups.length + 1 }`, color: '#6b7280' } ];
        const n = newGroups.length;
        const newMatrix = Array.from( { length: n }, ( _, i ) =>
            Array.from( { length: n }, ( _, j ) =>
                ( a.matrix[i] && a.matrix[i][j] !== undefined ) ? a.matrix[i][j] : 0
            )
        );
        setAttributes( { groups: newGroups, matrix: newMatrix } );
    }

    function removeGroup( a, setAttributes, idx ) {
        const newGroups = a.groups.filter( ( _, i ) => i !== idx );
        const newMatrix = a.matrix.filter( ( _, i ) => i !== idx ).map( row => row.filter( ( _, j ) => j !== idx ) );
        setAttributes( { groups: newGroups, matrix: newMatrix } );
    }

    function updMatrix( a, setAttributes, i, j, val ) {
        const m = ensureMatrix( a.groups, a.matrix );
        m[i][j] = val;
        setAttributes( { matrix: m } );
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
    registerBlockType( 'blockenberg/chord-diagram', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps( { className: 'bkbg-chord-wrap', style: Object.assign({}, _tv(a.typoTitle, '--bkbg-chord-tt-')) } );
            const m = ensureMatrix( a.groups, a.matrix );

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Chart Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl, { label: __( 'Title', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),  checked: a.showTitle,  onChange: v => setAttributes( { showTitle: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Labels', 'blockenberg' ), checked: a.showLabels, onChange: v => setAttributes( { showLabels: v } ) } ),
                        el( RangeControl, { label: __( 'Canvas Size', 'blockenberg' ),     value: a.svgSize,      onChange: v => setAttributes( { svgSize: v } ),      min: 280, max: 900, step: 20 } ),
                        el( RangeControl, { label: __( 'Arc Thickness', 'blockenberg' ),   value: a.arcThickness, onChange: v => setAttributes( { arcThickness: v } ), min: 8, max: 60 } ),
                        el( RangeControl, { label: __( 'Arc Gap (°)', 'blockenberg' ),     value: a.arcGap,       onChange: v => setAttributes( { arcGap: v } ),       min: 1, max: 30 } ),
                        el( RangeControl, { label: __( 'Chord Opacity %', 'blockenberg' ), value: a.chordOpacity, onChange: v => setAttributes( { chordOpacity: v } ), min: 10, max: 95 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el(getTypographyControl(), { label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: v => setAttributes( { typoTitle: v } ) }),
                        el( RangeControl, { label: __( 'Label Font Size', 'blockenberg' ), value: a.labelFontSize, onChange: v => setAttributes( { labelFontSize: v } ), min: 9, max: 22 } ),
                        el( SelectControl, { label: __( 'Label Font Weight', 'blockenberg' ), value: a.labelFontWeight, options: [
                            { label: 'Normal (400)', value: '400' },
                            { label: 'Medium (500)', value: '500' },
                            { label: 'Semi Bold (600)', value: '600' },
                            { label: 'Bold (700)', value: '700' },
                            { label: 'Extra Bold (800)', value: '800' },
                        ], onChange: v => setAttributes( { labelFontWeight: v } ) } )
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Background', 'blockenberg' ),  value: a.bgColor,    onChange: v => setAttributes( { bgColor:    v || '#ffffff' } ) },
                            { label: __( 'Title Color', 'blockenberg' ), value: a.titleColor, onChange: v => setAttributes( { titleColor: v || '#111827' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Groups', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => addGroup( a, setAttributes ) }, __( '+ Add Group', 'blockenberg' ) ),
                        a.groups.map( ( g, i ) =>
                            el( PanelBody, { key: i, title: g.label || `Group ${ i + 1 }`, initialOpen: false },
                                el( TextControl, { label: __( 'Label', 'blockenberg' ),       value: g.label, onChange: v => setAttributes( { groups: a.groups.map( ( x, xi ) => xi === i ? { ...x, label: v } : x ) } ) } ),
                                el( BkbgColorSwatch, { label: __( 'Color', 'blockenberg' ), value: g.color, onChange: v => setAttributes( { groups: a.groups.map( ( x, xi ) => xi === i ? { ...x, color: v } : x ) } ) } ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => removeGroup( a, setAttributes, i ) }, __( 'Remove Group', 'blockenberg' ) ),
                            )
                        ),
                    ),

                    el( PanelBody, { title: __( 'Relationship Matrix', 'blockenberg' ), initialOpen: false },
                        el( 'p', { style: { fontSize: 12, color: '#6b7280', marginBottom: 10 } }, __( 'Row → Column flow values. Diagonal (same group) = 0.', 'blockenberg' ) ),
                        a.groups.map( ( rowG, i ) =>
                            el( PanelBody, { key: i, title: `${ rowG.label || `Group ${ i + 1 }` } →`, initialOpen: false },
                                a.groups.map( ( colG, j ) =>
                                    i === j ? null :
                                    el( RangeControl, {
                                        key: j,
                                        label: `→ ${ colG.label || `Group ${ j + 1 }` }`,
                                        value: m[i][j] || 0,
                                        onChange: v => updMatrix( a, setAttributes, i, j, v ),
                                        min: 0, max: 1000,
                                    } )
                                )
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-chord-title', style: { color: a.titleColor } }, a.title ),
                el( 'div', { className: 'bkbg-chord-svg' }, renderChord( a ) ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save( { className: 'bkbg-chord-wrap', style: Object.assign({}, _tv(a.typoTitle, '--bkbg-chord-tt-')) } );
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-chord-title', style: { color: a.titleColor } }, a.title ) : null,
                el( 'div', { className: 'bkbg-chord-svg' }, renderChord( a ) ),
            );
        },
    } );
}() );

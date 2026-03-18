( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, Button } = window.wp.components;
    const { __ } = window.wp.i18n;

    var _tc; function getTC() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTV() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function buildTypoVars( a ) {
        var fn = getTV();
        if ( !fn ) return {};
        var v = {};
        Object.assign( v, fn( a.titleTypo || {}, '--bksb-tt-' ) );
        Object.assign( v, fn( a.labelTypo || {}, '--bksb-lt-' ) );
        Object.assign( v, fn( a.valueTypo || {}, '--bksb-vt-' ) );
        return v;
    }

    // ── Renderer (legacy — for deprecated) ─────────────────────────────────────────────
    function renderSkillBars( a ) {
        const skills = a.skills || [];
        return el( 'div', { className: 'bkbg-sb-bars', style: { display: 'flex', flexDirection: 'column', gap: a.gap + 'px' } },
            skills.map( ( skill, i ) => {
                const pct = Math.min( 100, Math.max( 0, skill.value || 0 ) );
                const clr = skill.color || '#6366f1';
                return el( 'div', { key: i, className: 'bkbg-sb-item' },
                    // Label row
                    el( 'div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 } },
                        el( 'span', { style: { fontSize: a.labelFontSize + 'px', fontWeight: a.labelFontWeight, color: a.labelColor } }, skill.label ),
                        ( a.showValue || a.showPercent ) && el( 'span', { style: { fontSize: a.valueFontSize + 'px', color: a.valueColor, fontWeight: a.valueFontWeight } },
                            a.showPercent ? pct + '%' : pct
                        ),
                    ),
                    // Track
                    el( 'div', { style: { height: a.barHeight + 'px', background: a.trackColor, borderRadius: a.barRadius + 'px', overflow: 'hidden' } },
                        el( 'div', { style: {
                            height: '100%',
                            width: pct + '%',
                            background: clr,
                            borderRadius: a.barRadius + 'px',
                        } } )
                    ),
                );
            } )
        );
    }

    // ── Renderer (new — no inline font styles) ───────────────────────────────
    function renderSkillBarsNew( a ) {
        const skills = a.skills || [];
        return el( 'div', { className: 'bkbg-sb-bars', style: { display: 'flex', flexDirection: 'column', gap: a.gap + 'px' } },
            skills.map( ( skill, i ) => {
                const pct = Math.min( 100, Math.max( 0, skill.value || 0 ) );
                const clr = skill.color || '#6366f1';
                return el( 'div', { key: i, className: 'bkbg-sb-item' },
                    el( 'div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 } },
                        el( 'span', { className: 'bkbg-sb-label', style: { color: a.labelColor } }, skill.label ),
                        ( a.showValue || a.showPercent ) && el( 'span', { className: 'bkbg-sb-value', style: { color: a.valueColor } },
                            a.showPercent ? pct + '%' : pct
                        ),
                    ),
                    el( 'div', { style: { height: a.barHeight + 'px', background: a.trackColor, borderRadius: a.barRadius + 'px', overflow: 'hidden' } },
                        el( 'div', { style: { height: '100%', width: pct + '%', background: clr, borderRadius: a.barRadius + 'px' } } )
                    ),
                );
            } )
        );
    }

    function updSkill( setAttributes, skills, si, field, val ) {
        setAttributes( { skills: skills.map( ( s, i ) => i === si ? { ...s, [field]: val } : s ) } );
    }

    // ── Block ─────────────────────────────────────────────────────────────────
    registerBlockType( 'blockenberg/skill-bar', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps( { className: 'bkbg-sb-wrap', style: Object.assign( { background: a.bgColor, boxSizing: 'border-box' }, buildTypoVars( a ) ) } );

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl,   { label: __( 'Title', 'blockenberg' ),          value: a.title,     onChange: v => setAttributes( { title:     v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),     checked: a.showTitle,   onChange: v => setAttributes( { showTitle:   v } ) } ),
                        el( ToggleControl, { label: __( 'Show Percentage', 'blockenberg' ),checked: a.showPercent, onChange: v => setAttributes( { showPercent: v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Style', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Bar Height', 'blockenberg' ),     value: a.barHeight,    onChange: v => setAttributes( { barHeight:    v } ), min: 4, max: 40 } ),
                        el( RangeControl, { label: __( 'Bar Radius', 'blockenberg' ),     value: a.barRadius,    onChange: v => setAttributes( { barRadius:    v } ), min: 0, max: 99 } ),
                        el( RangeControl, { label: __( 'Gap Between Bars', 'blockenberg' ),value: a.gap,         onChange: v => setAttributes( { gap:          v } ), min: 6, max: 48 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el( getTC(), { label: __( 'Title', 'blockenberg' ), value: a.titleTypo || {}, onChange: function( v ) { setAttributes( { titleTypo: v } ); } } ),
                        el( getTC(), { label: __( 'Label', 'blockenberg' ), value: a.labelTypo || {}, onChange: function( v ) { setAttributes( { labelTypo: v } ); } } ),
                        el( getTC(), { label: __( 'Value', 'blockenberg' ), value: a.valueTypo || {}, onChange: function( v ) { setAttributes( { valueTypo: v } ); } } ),
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Background', 'blockenberg' ), value: a.bgColor,    onChange: v => setAttributes( { bgColor:    v || '#ffffff' } ) },
                            { label: __( 'Track', 'blockenberg' ),      value: a.trackColor, onChange: v => setAttributes( { trackColor: v || '#f1f5f9' } ) },
                            { label: __( 'Label', 'blockenberg' ),      value: a.labelColor, onChange: v => setAttributes( { labelColor: v || '#111827' } ) },
                            { label: __( 'Value', 'blockenberg' ),      value: a.valueColor, onChange: v => setAttributes( { valueColor: v || '#6b7280' } ) },
                            { label: __( 'Title', 'blockenberg' ),      value: a.titleColor, onChange: v => setAttributes( { titleColor: v || '#111827' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Skills', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { skills: [ ...( a.skills || [] ), { label: 'New Skill', value: 75, color: '#6366f1' } ] } ) }, __( '+ Add Skill', 'blockenberg' ) ),
                        a.skills.map( ( skill, si ) =>
                            el( PanelBody, { key: si, title: `${ skill.label } — ${ skill.value }%`, initialOpen: false },
                                el( TextControl,  { label: __( 'Skill Label', 'blockenberg' ), value: skill.label, onChange: v => updSkill( setAttributes, a.skills, si, 'label', v ) } ),
                                el( RangeControl, { label: __( 'Level (%)', 'blockenberg' ), value: skill.value, onChange: v => updSkill( setAttributes, a.skills, si, 'value', v ), min: 0, max: 100 } ),
                                el( 'div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 } },
                                    el( 'label', { style: { fontSize: 12 } }, __( 'Bar Color', 'blockenberg' ) ),
                                    el( 'input', { type: 'color', value: skill.color || '#6366f1', style: { width: 40, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer' }, onChange: e => updSkill( setAttributes, a.skills, si, 'color', e.target.value ) } ),
                                ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { skills: a.skills.filter( ( _, x ) => x !== si ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-sb-title', style: { color: a.titleColor, margin: '0 0 20px' } }, a.title ),
                renderSkillBarsNew( a ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save( { className: 'bkbg-sb-wrap', style: Object.assign( { background: a.bgColor, boxSizing: 'border-box' }, buildTypoVars( a ) ) } );
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-sb-title', style: { color: a.titleColor, margin: '0 0 20px' } }, a.title ) : null,
                renderSkillBarsNew( a ),
            );
        },

        deprecated: [ {
            save: function ( { attributes: a } ) {
                var bp = useBlockProps.save( { className: 'bkbg-sb-wrap', style: { background: a.bgColor, boxSizing: 'border-box' } } );
                return el( 'div', bp,
                    a.showTitle && a.title ? el( 'h3', { className: 'bkbg-sb-title', style: { color: a.titleColor, margin: '0 0 20px', fontSize: ( a.labelFontSize + 4 ) + 'px' } }, a.title ) : null,
                    renderSkillBars( a ),
                );
            },
            migrate: function ( attrs ) {
                var n = Object.assign( {}, attrs );
                n.titleTypo = { sizeDesktop: ( attrs.labelFontSize || 14 ) + 4, weight: String( attrs.labelFontWeight || 600 ) };
                n.labelTypo = { sizeDesktop: attrs.labelFontSize || 14, weight: String( attrs.labelFontWeight || 600 ) };
                n.valueTypo = { sizeDesktop: attrs.valueFontSize || 13, weight: String( attrs.valueFontWeight || 500 ) };
                return n;
            },
        } ],
    } );
}() );

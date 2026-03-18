( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, Button } = window.wp.components;
    const { __ } = window.wp.i18n;
    var IP = function () { return window.bkbgIconPicker; };

    function getTypographyControl() {
        return (typeof window.bkbgTypographyControl !== 'undefined') ? window.bkbgTypographyControl : null;
    }
    function getTypoCssVars() {
        return (typeof window.bkbgTypoCssVars !== 'undefined') ? window.bkbgTypoCssVars : function() { return {}; };
    }

    function buildWrapStyle( a ) {
        var _tv = getTypoCssVars();
        var s = { background: a.bgColor || undefined, boxSizing: 'border-box' };
        Object.assign( s, _tv( a.headingTypo  || {}, '--bkbg-bw-heading-' ) );
        Object.assign( s, _tv( a.subtitleTypo || {}, '--bkbg-bw-sub-' ) );
        Object.assign( s, _tv( a.labelTypo   || {}, '--bkbg-bw-label-' ) );
        Object.assign( s, _tv( a.issuerTypo  || {}, '--bkbg-bw-issuer-' ) );
        return s;
    }

    // ── Badge card ────────────────────────────────────────────────────────────
    function BadgeCard( props ) {
        const { badge, a, forSave } = props;
        const accentClr = badge.accentColor || '#6366f1';
        return el( 'div', {
            className: 'bkbg-bw-card',
            style: {
                background: a.cardBg,
                border: `1px solid ${ a.borderColor }`,
                borderRadius: a.borderRadius + 'px',
                padding: a.cardPadding + 'px',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 8,
                position: 'relative',
                overflow: 'hidden',
            }
        },
            // Soft accent glow in top-right
            el( 'div', { style: { position: 'absolute', top: -20, right: -20, width: 70, height: 70, borderRadius: '50%', background: accentClr, opacity: 0.12 } } ),

            // Icon
            a.showIcon && badge.icon && el( 'div', { className: 'bkbg-bw-icon', style: { fontSize: a.iconSize + 'px', lineHeight: 1 } }, (badge.iconType || 'custom-char') !== 'custom-char' ? (forSave ? IP().buildSaveIcon(badge.iconType, badge.icon, badge.iconDashicon, badge.iconImageUrl, badge.iconDashiconColor) : IP().buildEditorIcon(badge.iconType, badge.icon, badge.iconDashicon, badge.iconImageUrl, badge.iconDashiconColor)) : badge.icon ),

            // Label
            a.showLabel && badge.label && el( 'div', { className: 'bkbg-bw-label', style: { color: a.labelColor } }, badge.label ),

            // Issuer
            a.showIssuer && badge.issuer && el( 'div', { className: 'bkbg-bw-issuer', style: { color: a.issuerColor } }, badge.issuer ),

            // Year pill
            a.showYear && badge.year && el( 'span', { className: 'bkbg-bw-year', style: { color: accentClr, background: accentClr + '1a' } }, badge.year ),
        );
    }

    function renderBadgeWall( a, forSave ) {
        return el( 'div', { className: 'bkbg-bw-grid', style: { display: 'grid', gridTemplateColumns: `repeat(${ a.columns }, 1fr)`, gap: 16 } },
            ( a.badges || [] ).map( ( badge, i ) => el( BadgeCard, { key: i, badge, a, forSave } ) )
        );
    }

    function updBadge( setAttributes, badges, bi, field, val ) {
        setAttributes( { badges: badges.map( ( b, i ) => i === bi ? { ...b, [field]: val } : b ) } );
    }

    // ── Block ─────────────────────────────────────────────────────────────────
    registerBlockType( 'blockenberg/badge-wall', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps( { className: 'bkbg-bw-wrap', style: buildWrapStyle( a ) } );

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl,   { label: __( 'Title', 'blockenberg' ),    value: a.title,    onChange: v => setAttributes( { title:    v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),    checked: a.showTitle,    onChange: v => setAttributes( { showTitle:    v } ) } ),
                        el( TextControl,   { label: __( 'Subtitle', 'blockenberg' ), value: a.subtitle, onChange: v => setAttributes( { subtitle: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Subtitle', 'blockenberg' ), checked: a.showSubtitle, onChange: v => setAttributes( { showSubtitle: v } ) } ),
                        el( RangeControl,  { label: __( 'Columns', 'blockenberg' ),  value: a.columns,  onChange: v => setAttributes( { columns:  v } ), min: 1, max: 8 } ),
                        el( ToggleControl, { label: __( 'Show Icons', 'blockenberg' ),   checked: a.showIcon,   onChange: v => setAttributes( { showIcon:   v } ) } ),
                        el( ToggleControl, { label: __( 'Show Labels', 'blockenberg' ),  checked: a.showLabel,  onChange: v => setAttributes( { showLabel:  v } ) } ),
                        el( ToggleControl, { label: __( 'Show Issuers', 'blockenberg' ), checked: a.showIssuer, onChange: v => setAttributes( { showIssuer: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Years', 'blockenberg' ),   checked: a.showYear,   onChange: v => setAttributes( { showYear:   v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Style', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Icon Size', 'blockenberg' ),     value: a.iconSize,     onChange: v => setAttributes( { iconSize:     v } ), min: 20, max: 80 } ),
                        el( RangeControl, { label: __( 'Border Radius', 'blockenberg' ), value: a.borderRadius, onChange: v => setAttributes( { borderRadius: v } ), min: 0, max: 32 } ),
                        el( RangeControl, { label: __( 'Card Padding', 'blockenberg' ),  value: a.cardPadding,  onChange: v => setAttributes( { cardPadding:  v } ), min: 8, max: 48 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        (function () {
                            var TC = getTypographyControl();
                            if (!TC) return el('p', { style: { color: '#999', fontSize: '12px', padding: '8px 0' } }, __('Typography control loading…', 'blockenberg'));
                            return el(window.wp.element.Fragment, {},
                                el(TC, { label: __('Heading', 'blockenberg'), value: a.headingTypo || {}, onChange: function (v) { setAttributes({ headingTypo: v }); } }),
                                el(TC, { label: __('Subtitle', 'blockenberg'), value: a.subtitleTypo || {}, onChange: function (v) { setAttributes({ subtitleTypo: v }); } }),
                                el(TC, { label: __('Label', 'blockenberg'), value: a.labelTypo || {}, onChange: function (v) { setAttributes({ labelTypo: v }); } }),
                                el(TC, { label: __('Issuer', 'blockenberg'), value: a.issuerTypo || {}, onChange: function (v) { setAttributes({ issuerTypo: v }); } })
                            );
                        })()
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Wrapper BG', 'blockenberg' ),  value: a.bgColor,      onChange: v => setAttributes( { bgColor:      v || '#ffffff' } ) },
                            { label: __( 'Card BG', 'blockenberg' ),     value: a.cardBg,       onChange: v => setAttributes( { cardBg:       v || '#f9fafb' } ) },
                            { label: __( 'Border', 'blockenberg' ),      value: a.borderColor,  onChange: v => setAttributes( { borderColor:  v || '#e5e7eb' } ) },
                            { label: __( 'Heading', 'blockenberg' ),     value: a.headingColor, onChange: v => setAttributes( { headingColor: v || '#111827' } ) },
                            { label: __( 'Subtitle', 'blockenberg' ),    value: a.subtitleColor,onChange: v => setAttributes( { subtitleColor:v || '#6b7280' } ) },
                            { label: __( 'Label', 'blockenberg' ),       value: a.labelColor,   onChange: v => setAttributes( { labelColor:   v || '#111827' } ) },
                            { label: __( 'Issuer', 'blockenberg' ),      value: a.issuerColor,  onChange: v => setAttributes( { issuerColor:  v || '#6b7280' } ) },
                            { label: __( 'Year', 'blockenberg' ),        value: a.yearColor,    onChange: v => setAttributes( { yearColor:    v || '#9ca3af' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Badges', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { badges: [ ...( a.badges || [] ), { icon: '⭐', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', accentColor: '#6366f1', label: 'New Badge', issuer: 'Issuer', year: '2024' } ] } ) }, __( '+ Add Badge', 'blockenberg' ) ),
                        a.badges.map( ( badge, bi ) =>
                            el( PanelBody, { key: bi, title: badge.label || `Badge ${ bi + 1 }`, initialOpen: false },
                                el(IP().IconPickerControl, {
                                    iconType: badge.iconType, customChar: badge.icon, dashicon: badge.iconDashicon, imageUrl: badge.iconImageUrl,
                                    onChangeType: function(v) { updBadge(setAttributes, a.badges, bi, 'iconType', v); },
                                    onChangeChar: function(v) { updBadge(setAttributes, a.badges, bi, 'icon', v); },
                                    onChangeDashicon: function(v) { updBadge(setAttributes, a.badges, bi, 'iconDashicon', v); },
                                    onChangeImageUrl: function(v) { updBadge(setAttributes, a.badges, bi, 'iconImageUrl', v); }
                                }),
                                el( TextControl, { label: __( 'Label', 'blockenberg' ),         value: badge.label,  onChange: v => updBadge( setAttributes, a.badges, bi, 'label',  v ) } ),
                                el( TextControl, { label: __( 'Issuer', 'blockenberg' ),        value: badge.issuer, onChange: v => updBadge( setAttributes, a.badges, bi, 'issuer', v ) } ),
                                el( TextControl, { label: __( 'Year', 'blockenberg' ),          value: badge.year,   onChange: v => updBadge( setAttributes, a.badges, bi, 'year',   v ) } ),
                                el( 'div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 } },
                                    el( 'label', { style: { fontSize: 12 } }, __( 'Accent Color', 'blockenberg' ) ),
                                    el( 'input', { type: 'color', value: badge.accentColor || '#6366f1', style: { width: 40, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer' }, onChange: e => updBadge( setAttributes, a.badges, bi, 'accentColor', e.target.value ) } ),
                                ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { badges: a.badges.filter( ( _, x ) => x !== bi ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                // Header
                el( 'div', { style: { marginBottom: 24 } },
                    a.showTitle    && a.title    && el( 'h2', { className: 'bkbg-bw-heading', style: { color: a.headingColor, margin: '0 0 6px' } }, a.title ),
                    a.showSubtitle && a.subtitle && el( 'p',  { className: 'bkbg-bw-sub', style: { color: a.subtitleColor, margin: 0 } }, a.subtitle ),
                ),

                renderBadgeWall( a ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save( { className: 'bkbg-bw-wrap', style: buildWrapStyle( a ) } );
            return el( 'div', blockProps,
                el( 'div', { style: { marginBottom: 24 } },
                    a.showTitle    && a.title    ? el( 'h2', { className: 'bkbg-bw-heading', style: { color: a.headingColor, margin: '0 0 6px' } }, a.title )    : null,
                    a.showSubtitle && a.subtitle ? el( 'p',  { className: 'bkbg-bw-sub', style: { color: a.subtitleColor, margin: 0 } }, a.subtitle ) : null,
                ),
                renderBadgeWall( a, true ),
            );
        },
    } );
}() );

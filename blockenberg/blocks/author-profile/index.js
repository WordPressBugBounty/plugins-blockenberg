( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, Button, SelectControl } = window.wp.components;
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
        var s = { background: a.bgColor || undefined };
        Object.assign( s, _tv( a.nameTypo || {}, '--bkbg-ap-name-' ) );
        Object.assign( s, _tv( a.roleTypo || {}, '--bkbg-ap-role-' ) );
        Object.assign( s, _tv( a.bioTypo || {}, '--bkbg-ap-bio-' ) );
        Object.assign( s, _tv( a.statValueTypo || {}, '--bkbg-ap-stat-val-' ) );
        Object.assign( s, _tv( a.statLabelTypo || {}, '--bkbg-ap-stat-lbl-' ) );
        return s;
    }

    // ── Avatar ────────────────────────────────────────────────────────────────
    function Avatar( { avatarUrl, avatarInitials, avatarColor, avatarSize } ) {
        const circle = { width: avatarSize, height: avatarSize, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', background: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center' };
        if ( avatarUrl ) {
            return el( 'div', { style: circle }, el( 'img', { src: avatarUrl, alt: avatarInitials, style: { width: '100%', height: '100%', objectFit: 'cover' } } ) );
        }
        return el( 'div', { style: circle },
            el( 'span', { style: { color: '#fff', fontWeight: 700, fontSize: ( avatarSize * 0.35 ) + 'px', letterSpacing: 1 } }, avatarInitials )
        );
    }

    // ── Stats row ─────────────────────────────────────────────────────────────
    function StatsRow( { stats, statValueColor, statLabelColor, fontSize, borderColor } ) {
        return el( 'div', { className: 'bkbg-ap-stats', style: { display: 'flex', gap: 0, margin: '16px 0 0', borderTop: '1px solid ' + borderColor, paddingTop: 16 } },
            ( stats || [] ).map( ( s, i ) =>
                el( 'div', { key: i, style: { flex: 1, textAlign: 'center', borderRight: i < ( stats.length - 1 ) ? '1px solid ' + borderColor : 'none' } },
                    el( 'div', { className: 'bkbg-ap-stat-val', style: { color: statValueColor } }, s.value ),
                    el( 'div', { className: 'bkbg-ap-stat-lbl', style: { color: statLabelColor, marginTop: 2 } }, s.label ),
                )
            ),
        );
    }

    // ── Social links ──────────────────────────────────────────────────────────
    function SocialLinks( { socialLinks, textColor, fontSize, forSave } ) {
        return el( 'div', { className: 'bkbg-ap-social', style: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 } },
            ( socialLinks || [] ).map( ( link, i ) =>
                el( 'a', { key: i, href: link.url || '#', style: { display: 'flex', alignItems: 'center', gap: 5, fontSize: fontSize + 'px', color: textColor, textDecoration: 'none', padding: '4px 10px', borderRadius: 99, background: 'rgba(0,0,0,0.05)' } },
                    el( 'span', { className: 'bkbg-ap-social-icon' }, (link.iconType || 'custom-char') !== 'custom-char' ? (forSave ? IP().buildSaveIcon(link.iconType, link.icon, link.iconDashicon, link.iconImageUrl, link.iconDashiconColor) : IP().buildEditorIcon(link.iconType, link.icon, link.iconDashicon, link.iconImageUrl, link.iconDashiconColor)) : link.icon ),
                    el( 'span', {}, link.label ),
                )
            ),
        );
    }

    // ── Renderer ──────────────────────────────────────────────────────────────
    function renderAuthorProfile( a, forSave ) {
        const isHoriz = a.layout === 'horizontal';
        return el( 'div', {
            className: 'bkbg-ap-card',
            style: {
                background: a.cardBg,
                border: '1px solid ' + a.borderColor,
                borderRadius: a.borderRadius + 'px',
                padding: a.padding + 'px',
                display: 'flex',
                flexDirection: isHoriz ? 'row' : 'column',
                alignItems: isHoriz ? 'flex-start' : 'center',
                gap: isHoriz ? 24 : 16,
                boxSizing: 'border-box',
            }
        },
            // Avatar
            a.showAvatar && el( Avatar, { avatarUrl: a.avatarUrl, avatarInitials: a.avatarInitials, avatarColor: a.avatarColor, avatarSize: a.avatarSize } ),

            // Body column
            el( 'div', { style: { flex: 1, textAlign: isHoriz ? 'left' : 'center', minWidth: 0 } },
                el( 'div', { className: 'bkbg-ap-name', style: { color: a.nameColor } }, a.name ),
                a.showRole && el( 'div', { className: 'bkbg-ap-role', style: { color: a.roleColor, marginTop: 4 } }, a.role ),
                a.showBio  && el( 'p',   { className: 'bkbg-ap-bio', style: { color: a.textColor, margin: '10px 0 0' } }, a.bio ),
                a.showSocial && el( SocialLinks, { socialLinks: a.socialLinks, textColor: a.textColor, fontSize: a.fontSize, forSave: forSave } ),
                a.showStats  && el( StatsRow,   { stats: a.stats, statValueColor: a.statValueColor, statLabelColor: a.statLabelColor, fontSize: a.fontSize, borderColor: a.borderColor } ),
            ),
        );
    }

    // ── Helpers for array editing ─────────────────────────────────────────────
    function updItem( setAttributes, arr, key, idx, field, val ) {
        setAttributes( { [key]: arr.map( ( x, i ) => i === idx ? { ...x, [field]: val } : x ) } );
    }

    // ── Block ─────────────────────────────────────────────────────────────────
    registerBlockType( 'blockenberg/author-profile', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps( { className: 'bkbg-ap-wrap', style: buildWrapStyle( a ) } );

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Author', 'blockenberg' ), initialOpen: true },
                        el( TextControl, { label: __( 'Name', 'blockenberg' ),   value: a.name, onChange: v => setAttributes( { name: v } ) } ),
                        el( TextControl, { label: __( 'Role', 'blockenberg' ),   value: a.role, onChange: v => setAttributes( { role: v } ) } ),
                        el( TextControl, { label: __( 'Bio', 'blockenberg' ),    value: a.bio,  onChange: v => setAttributes( { bio:  v } ) } ),
                        el( SelectControl, { label: __( 'Layout', 'blockenberg' ), value: a.layout, options: [ { label: 'Horizontal', value: 'horizontal' }, { label: 'Vertical', value: 'vertical' } ], onChange: v => setAttributes( { layout: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Avatar', 'blockenberg' ),  checked: a.showAvatar,  onChange: v => setAttributes( { showAvatar:  v } ) } ),
                        el( ToggleControl, { label: __( 'Show Role', 'blockenberg' ),    checked: a.showRole,    onChange: v => setAttributes( { showRole:    v } ) } ),
                        el( ToggleControl, { label: __( 'Show Bio', 'blockenberg' ),     checked: a.showBio,     onChange: v => setAttributes( { showBio:     v } ) } ),
                        el( ToggleControl, { label: __( 'Show Stats', 'blockenberg' ),   checked: a.showStats,   onChange: v => setAttributes( { showStats:   v } ) } ),
                        el( ToggleControl, { label: __( 'Show Social', 'blockenberg' ),  checked: a.showSocial,  onChange: v => setAttributes( { showSocial:  v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Avatar', 'blockenberg' ), initialOpen: false },
                        el( TextControl, { label: __( 'Avatar URL (optional)', 'blockenberg' ), value: a.avatarUrl,      onChange: v => setAttributes( { avatarUrl:      v } ) } ),
                        el( TextControl, { label: __( 'Initials', 'blockenberg' ),              value: a.avatarInitials, onChange: v => setAttributes( { avatarInitials: v } ) } ),
                        el( 'div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 } },
                            el( 'label', { style: { fontSize: 12 } }, __( 'Avatar Color', 'blockenberg' ) ),
                            el( 'input', { type: 'color', value: a.avatarColor, style: { width: 40, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer' }, onChange: e => setAttributes( { avatarColor: e.target.value } ) } ),
                        ),
                        el( RangeControl, { label: __( 'Avatar Size', 'blockenberg' ), value: a.avatarSize, onChange: v => setAttributes( { avatarSize: v } ), min: 40, max: 160 } ),
                    ),

                    el( PanelBody, { title: __( 'Style', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Border Radius', 'blockenberg' ), value: a.borderRadius,  onChange: v => setAttributes( { borderRadius:  v } ), min: 0, max: 32 } ),
                        el( RangeControl, { label: __( 'Padding', 'blockenberg' ),       value: a.padding,       onChange: v => setAttributes( { padding:       v } ), min: 12, max: 60 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        (function () {
                            var TC = getTypographyControl();
                            if (!TC) return el('p', { style: { color: '#999', fontSize: '12px', padding: '8px 0' } }, __('Typography control loading…', 'blockenberg'));
                            return el(window.wp.element.Fragment, {},
                                el(TC, { label: __('Name', 'blockenberg'), value: a.nameTypo || {}, onChange: function (v) { setAttributes({ nameTypo: v }); } }),
                                el(TC, { label: __('Role', 'blockenberg'), value: a.roleTypo || {}, onChange: function (v) { setAttributes({ roleTypo: v }); } }),
                                el(TC, { label: __('Bio', 'blockenberg'), value: a.bioTypo || {}, onChange: function (v) { setAttributes({ bioTypo: v }); } }),
                                el(TC, { label: __('Stat Value', 'blockenberg'), value: a.statValueTypo || {}, onChange: function (v) { setAttributes({ statValueTypo: v }); } }),
                                el(TC, { label: __('Stat Label', 'blockenberg'), value: a.statLabelTypo || {}, onChange: function (v) { setAttributes({ statLabelTypo: v }); } })
                            );
                        })()
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Page Background', 'blockenberg' ),  value: a.bgColor,        onChange: v => setAttributes( { bgColor:        v || '#ffffff' } ) },
                            { label: __( 'Card Background', 'blockenberg' ),  value: a.cardBg,         onChange: v => setAttributes( { cardBg:         v || '#f9fafb' } ) },
                            { label: __( 'Border', 'blockenberg' ),           value: a.borderColor,    onChange: v => setAttributes( { borderColor:    v || '#e5e7eb' } ) },
                            { label: __( 'Name', 'blockenberg' ),             value: a.nameColor,      onChange: v => setAttributes( { nameColor:      v || '#111827' } ) },
                            { label: __( 'Role', 'blockenberg' ),             value: a.roleColor,      onChange: v => setAttributes( { roleColor:      v || '#6366f1' } ) },
                            { label: __( 'Body Text', 'blockenberg' ),        value: a.textColor,      onChange: v => setAttributes( { textColor:      v || '#374151' } ) },
                            { label: __( 'Stat Value', 'blockenberg' ),       value: a.statValueColor, onChange: v => setAttributes( { statValueColor: v || '#111827' } ) },
                            { label: __( 'Stat Label', 'blockenberg' ),       value: a.statLabelColor, onChange: v => setAttributes( { statLabelColor: v || '#6b7280' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Stats', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 8 }, onClick: () => setAttributes( { stats: [ ...( a.stats || [] ), { label: 'Label', value: '0' } ] } ) }, __( '+ Add Stat', 'blockenberg' ) ),
                        a.stats.map( ( s, i ) =>
                            el( 'div', { key: i, style: { marginBottom: 12, padding: '10px', background: '#f3f4f6', borderRadius: 8 } },
                                el( TextControl, { label: __( 'Value', 'blockenberg' ), value: s.value, onChange: v => updItem( setAttributes, a.stats, 'stats', i, 'value', v ) } ),
                                el( TextControl, { label: __( 'Label', 'blockenberg' ), value: s.label, onChange: v => updItem( setAttributes, a.stats, 'stats', i, 'label', v ) } ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { stats: a.stats.filter( ( _, j ) => j !== i ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),

                    el( PanelBody, { title: __( 'Social Links', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 8 }, onClick: () => setAttributes( { socialLinks: [ ...( a.socialLinks || [] ), { icon: '🔗', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', label: 'Link', url: '' } ] } ) }, __( '+ Add Link', 'blockenberg' ) ),
                        a.socialLinks.map( ( link, i ) =>
                            el( 'div', { key: i, style: { marginBottom: 12, padding: '10px', background: '#f3f4f6', borderRadius: 8 } },
                                el(IP().IconPickerControl, {
                                    iconType: link.iconType, customChar: link.icon, dashicon: link.iconDashicon, imageUrl: link.iconImageUrl,
                                    onChangeType: function(v) { updItem(setAttributes, a.socialLinks, 'socialLinks', i, 'iconType', v); },
                                    onChangeChar: function(v) { updItem(setAttributes, a.socialLinks, 'socialLinks', i, 'icon', v); },
                                    onChangeDashicon: function(v) { updItem(setAttributes, a.socialLinks, 'socialLinks', i, 'iconDashicon', v); },
                                    onChangeImageUrl: function(v) { updItem(setAttributes, a.socialLinks, 'socialLinks', i, 'iconImageUrl', v); }
                                }),
                                el( TextControl, { label: __( 'Label', 'blockenberg' ),         value: link.label, onChange: v => updItem( setAttributes, a.socialLinks, 'socialLinks', i, 'label', v ) } ),
                                el( TextControl, { label: __( 'URL', 'blockenberg' ),           value: link.url,   onChange: v => updItem( setAttributes, a.socialLinks, 'socialLinks', i, 'url',   v ) } ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { socialLinks: a.socialLinks.filter( ( _, j ) => j !== i ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                renderAuthorProfile( a ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save( { className: 'bkbg-ap-wrap', style: buildWrapStyle( a ) } );
            return el( 'div', blockProps, renderAuthorProfile( a, true ) );
        },
    } );
}() );

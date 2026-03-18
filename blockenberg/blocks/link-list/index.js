( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, Button } = window.wp.components;
    const { __ } = window.wp.i18n;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    // ── Single link item ──────────────────────────────────────────────────────
    function LinkItem( { link, a } ) {
        return el( 'a', {
            href: link.url || '#',
            className: 'bkbg-ll-item',
            style: {
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                background: a.cardBg,
                border: '1px solid ' + a.borderColor,
                borderRadius: a.itemRadius + 'px',
                padding: a.itemPadding + 'px',
                textDecoration: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                borderLeft: '3px solid ' + ( link.accentColor || a.linkColor ),
            }
        },
            // Icon
            a.showIcon && link.icon && el( 'div', { className: 'bkbg-ll-icon', style: {
                width: 38, height: 38, borderRadius: 8,
                background: ( link.accentColor || a.linkColor ) + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0,
            } }, (link.iconType || 'custom-char') !== 'custom-char' && IP() ? IP().buildSaveIcon(link.iconType, link.icon, link.iconDashicon, link.iconImageUrl, link.iconDashiconColor) : link.icon ),

            // Content
            el( 'div', { style: { flex: 1, minWidth: 0 } },
                el( 'div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
                    el( 'span', { className: 'bkbg-ll-title', style: { color: a.titleColor } }, link.title ),
                    a.showBadge && link.badge && el( 'span', { className: 'bkbg-ll-badge', style: {
                        background: a.badgeBg, color: a.badgeColor,
                        padding: '1px 8px', borderRadius: 99,
                    } }, link.badge ),
                ),
                a.showDescription && link.desc && el( 'p', { className: 'bkbg-ll-desc', style: {
                    margin: '3px 0 0', color: a.textColor,
                } }, link.desc ),
            ),

            // Chevron
            el( 'div', { style: { fontSize: 16, color: a.textColor, opacity: 0.5, alignSelf: 'center', flexShrink: 0 } }, '›' ),
        );
    }

    // ── Full render ───────────────────────────────────────────────────────────
    function renderLinkList( a ) {
        return el( 'div', { className: 'bkbg-ll-grid', style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)',
            gap: a.gap + 'px',
        } },
            ( a.links || [] ).map( ( link, i ) => el( LinkItem, { key: i, link, a } ) )
        );
    }

    function updLink( setAttributes, links, li, field, val ) {
        setAttributes( { links: links.map( ( l, i ) => i === li ? { ...l, [field]: val } : l ) } );
    }

    // ── Block ─────────────────────────────────────────────────────────────────
    registerBlockType( 'blockenberg/link-list', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps( (function () {
                var _tvFn = getTypoCssVars();
                var s = { background: a.bgColor };
                if (_tvFn) {
                    Object.assign(s, _tvFn(a.headingTypo, '--bkbg-ll-h-'));
                    Object.assign(s, _tvFn(a.subtitleTypo, '--bkbg-ll-st-'));
                    Object.assign(s, _tvFn(a.linkTitleTypo, '--bkbg-ll-lt-'));
                    Object.assign(s, _tvFn(a.descTypo, '--bkbg-ll-d-'));
                }
                return { className: 'bkbg-ll-wrap', style: s };
            })() );

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Settings', 'blockenberg' ), initialOpen: true },
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),       checked: a.showTitle,       onChange: v => setAttributes( { showTitle:       v } ) } ),
                        a.showTitle    && el( TextControl, { label: __( 'Title', 'blockenberg' ),       value: a.title,    onChange: v => setAttributes( { title:       v } ) } ),
                        el( ToggleControl, { label: __( 'Show Subtitle', 'blockenberg' ),    checked: a.showSubtitle,    onChange: v => setAttributes( { showSubtitle:    v } ) } ),
                        a.showSubtitle && el( TextControl, { label: __( 'Subtitle', 'blockenberg' ),    value: a.subtitle, onChange: v => setAttributes( { subtitle:    v } ) } ),
                        el( RangeControl,  { label: __( 'Columns', 'blockenberg' ),          value: a.columns,           onChange: v => setAttributes( { columns:         v } ), min: 1, max: 3 } ),
                        el( ToggleControl, { label: __( 'Show Icons', 'blockenberg' ),       checked: a.showIcon,        onChange: v => setAttributes( { showIcon:        v } ) } ),
                        el( ToggleControl, { label: __( 'Show Descriptions', 'blockenberg' ),checked: a.showDescription, onChange: v => setAttributes( { showDescription: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Badges', 'blockenberg' ),      checked: a.showBadge,       onChange: v => setAttributes( { showBadge:       v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Style', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Item Radius', 'blockenberg' ),   value: a.itemRadius,  onChange: v => setAttributes( { itemRadius:  v } ), min: 0, max: 24 } ),
                        el( RangeControl, { label: __( 'Item Padding', 'blockenberg' ),  value: a.itemPadding, onChange: v => setAttributes( { itemPadding: v } ), min: 8, max: 40 } ),
                        el( RangeControl, { label: __( 'Gap', 'blockenberg' ),           value: a.gap,         onChange: v => setAttributes( { gap:         v } ), min: 4, max: 32 } ),
                    ),

                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl() && el(getTypoControl(), { label: __('Heading'), value: a.headingTypo || {}, onChange: v => setAttributes( { headingTypo: v } ) }),
                        getTypoControl() && el(getTypoControl(), { label: __('Subtitle'), value: a.subtitleTypo || {}, onChange: v => setAttributes( { subtitleTypo: v } ) }),
                        getTypoControl() && el(getTypoControl(), { label: __('Link Title'), value: a.linkTitleTypo || {}, onChange: v => setAttributes( { linkTitleTypo: v } ) }),
                        getTypoControl() && el(getTypoControl(), { label: __('Description'), value: a.descTypo || {}, onChange: v => setAttributes( { descTypo: v } ) })
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Background', 'blockenberg' ),     value: a.bgColor,      onChange: v => setAttributes( { bgColor:      v || '#ffffff' } ) },
                            { label: __( 'Card Background', 'blockenberg' ),value: a.cardBg,       onChange: v => setAttributes( { cardBg:       v || '#f9fafb' } ) },
                            { label: __( 'Border', 'blockenberg' ),         value: a.borderColor,  onChange: v => setAttributes( { borderColor:  v || '#e5e7eb' } ) },
                            { label: __( 'Heading', 'blockenberg' ),        value: a.headingColor, onChange: v => setAttributes( { headingColor: v || '#111827' } ) },
                            { label: __( 'Subtitle', 'blockenberg' ),       value: a.subtitleColor,onChange: v => setAttributes( { subtitleColor:v || '#6b7280' } ) },
                            { label: __( 'Link Title', 'blockenberg' ),     value: a.titleColor,   onChange: v => setAttributes( { titleColor:   v || '#111827' } ) },
                            { label: __( 'Description', 'blockenberg' ),    value: a.textColor,    onChange: v => setAttributes( { textColor:    v || '#6b7280' } ) },
                            { label: __( 'Default Accent', 'blockenberg' ), value: a.linkColor,    onChange: v => setAttributes( { linkColor:    v || '#6366f1' } ) },
                            { label: __( 'Badge Background', 'blockenberg' ),value: a.badgeBg,     onChange: v => setAttributes( { badgeBg:      v || '#ede9fe' } ) },
                            { label: __( 'Badge Text', 'blockenberg' ),     value: a.badgeColor,   onChange: v => setAttributes( { badgeColor:   v || '#6366f1' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Links', 'blockenberg' ), initialOpen: false },
                        el( Button, {
                            variant: 'secondary', style: { marginBottom: 10 },
                            onClick: () => setAttributes( { links: [ ...( a.links || [] ), { icon: '🔗', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', title: 'New Link', desc: 'A short description.', url: '', badge: 'New', accentColor: '#6366f1' } ] } ),
                        }, __( '+ Add Link', 'blockenberg' ) ),
                        a.links.map( ( link, li ) =>
                            el( PanelBody, { key: li, title: ( link.icon ? link.icon + ' ' : '' ) + link.title, initialOpen: false },
                                IP() && el(IP().IconPickerControl, {
                                    iconType: link.iconType || 'custom-char',
                                    customChar: link.icon || '',
                                    dashicon: link.iconDashicon || '',
                                    imageUrl: link.iconImageUrl || '',
                                    onChangeType: v => updLink( setAttributes, a.links, li, 'iconType', v ),
                                    onChangeChar: v => updLink( setAttributes, a.links, li, 'icon', v ),
                                    onChangeDashicon: v => updLink( setAttributes, a.links, li, 'iconDashicon', v ),
                                    onChangeImageUrl: v => updLink( setAttributes, a.links, li, 'iconImageUrl', v )
                                }),
                                el( TextControl, { label: __( 'Title', 'blockenberg' ),        value: link.title, onChange: v => updLink( setAttributes, a.links, li, 'title', v ) } ),
                                el( TextControl, { label: __( 'Description', 'blockenberg' ),  value: link.desc,  onChange: v => updLink( setAttributes, a.links, li, 'desc',  v ) } ),
                                el( TextControl, { label: __( 'URL', 'blockenberg' ),          value: link.url,   onChange: v => updLink( setAttributes, a.links, li, 'url',   v ) } ),
                                el( TextControl, { label: __( 'Badge', 'blockenberg' ),        value: link.badge, onChange: v => updLink( setAttributes, a.links, li, 'badge', v ) } ),
                                el( 'div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 } },
                                    el( 'label', { style: { fontSize: 11 } }, __( 'Accent Color', 'blockenberg' ) ),
                                    el( 'input', { type: 'color', value: link.accentColor || '#6366f1', style: { width: 40, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer' }, onChange: e => updLink( setAttributes, a.links, li, 'accentColor', e.target.value ) } ),
                                ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { links: a.links.filter( ( _, x ) => x !== li ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                ( a.showTitle && a.title ) && el( 'h3', { className: 'bkbg-ll-heading', style: { color: a.headingColor, margin: '0 0 6px' } }, a.title ),
                ( a.showSubtitle && a.subtitle ) && el( 'p', { className: 'bkbg-ll-subtitle', style: { color: a.subtitleColor, margin: '0 0 16px' } }, a.subtitle ),
                renderLinkList( a ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save( (function () {
                var _tvFn = getTypoCssVars();
                var s = { background: a.bgColor };
                if (_tvFn) {
                    Object.assign(s, _tvFn(a.headingTypo, '--bkbg-ll-h-'));
                    Object.assign(s, _tvFn(a.subtitleTypo, '--bkbg-ll-st-'));
                    Object.assign(s, _tvFn(a.linkTitleTypo, '--bkbg-ll-lt-'));
                    Object.assign(s, _tvFn(a.descTypo, '--bkbg-ll-d-'));
                }
                return { className: 'bkbg-ll-wrap', style: s };
            })() );
            return el( 'div', blockProps,
                ( a.showTitle    && a.title )    ? el( 'h3', { className: 'bkbg-ll-heading',  style: { color: a.headingColor,  margin: '0 0 6px' } }, a.title )    : null,
                ( a.showSubtitle && a.subtitle ) ? el( 'p',  { className: 'bkbg-ll-subtitle', style: { color: a.subtitleColor, margin: '0 0 16px' } }, a.subtitle ) : null,
                renderLinkList( a ),
            );
        },
    } );
}() );

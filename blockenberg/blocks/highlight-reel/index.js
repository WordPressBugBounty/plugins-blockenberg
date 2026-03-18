( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, Button, SelectControl } = window.wp.components;
    const { __ } = window.wp.i18n;

    /* ── Typography lazy getters ──────────────────────────────── */
    var _ttTC, _ttTV;
    function _tc() { return _ttTC || (_ttTC = window.bkbgTypographyControl); }
    function _tv() { return _ttTV || (_ttTV = window.bkbgTypoCssVars); }    var IP = function () { return window.bkbgIconPicker; };
    // ── Card renderer ─────────────────────────────────────────────────────────
    function HighlightCard( props ) {
        const { item, a } = props;
        const accentClr = item.accentColor || '#6366f1';

        const cardStyle = {
            background: a.cardBg,
            borderRadius: a.borderRadius + 'px',
            padding: a.cardPadding + 'px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            overflow: 'hidden',
            position: 'relative',
        };

        return el( 'div', { className: 'bkbg-hr-card', style: cardStyle },
            // Accent bar at top
            a.accentLine && el( 'div', { className: 'bkbg-hr-accent', style: { position: 'absolute', top: 0, left: 0, right: 0, height: a.accentHeight + 'px', background: accentClr } } ),

            // Icon
            a.showIcon && item.icon && el( 'div', { className: 'bkbg-hr-icon', style: { fontSize: a.iconSize + 'px', lineHeight: 1, paddingTop: a.accentLine ? ( a.accentHeight + 4 ) + 'px' : 0 } }, (item.iconType || 'custom-char') !== 'custom-char' && IP() ? IP().buildSaveIcon(el, item.iconType, item.icon, item.iconDashicon, item.iconImageUrl, item.iconDashiconColor) : item.icon ),

            // Tag
            a.showTag && item.tag && el( 'span', { className: 'bkbg-hr-tag', style: { color: a.tagColor, background: a.tagBg, borderRadius: 99 + 'px', padding: '3px 10px', alignSelf: 'flex-start' } }, item.tag ),

            // Title
            el( 'div', { className: 'bkbg-hr-item-title', style: { color: a.headingColor } }, item.title ),

            // Description
            a.showDesc && item.description && el( 'p', { className: 'bkbg-hr-desc', style: { color: a.textColor, margin: 0 } }, item.description ),
        );
    }

    function renderReel( a ) {
        const items = a.items || [];
        return el( 'div', { className: 'bkbg-hr-grid', style: { display: 'grid', gridTemplateColumns: `repeat(${ a.columns }, 1fr)`, gap: 20 } },
            items.map( ( item, i ) => el( HighlightCard, { key: i, item, a } ) )
        );
    }

    function updItem( setAttributes, items, ii, field, val ) {
        setAttributes( { items: items.map( ( m, i ) => i === ii ? { ...m, [field]: val } : m ) } );
    }

    // ── Block ─────────────────────────────────────────────────────────────────
    registerBlockType( 'blockenberg/highlight-reel', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps( { className: 'bkbg-hr-wrap', style: Object.assign( { background: a.bgColor, boxSizing: 'border-box' }, _tv() && _tv()( a.typoHeading, '--bkbg-hr-hl-' ), _tv() && _tv()( a.typoCardTitle, '--bkbg-hr-ct-' ), _tv() && _tv()( a.typoBody, '--bkbg-hr-bd-' ) ) } );

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl,   { label: __( 'Title', 'blockenberg' ),    value: a.title,    onChange: v => setAttributes( { title:    v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),    checked: a.showTitle,    onChange: v => setAttributes( { showTitle:    v } ) } ),
                        el( TextControl,   { label: __( 'Subtitle', 'blockenberg' ), value: a.subtitle, onChange: v => setAttributes( { subtitle: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Subtitle', 'blockenberg' ), checked: a.showSubtitle, onChange: v => setAttributes( { showSubtitle: v } ) } ),
                        el( RangeControl,  { label: __( 'Columns', 'blockenberg' ),  value: a.columns,  onChange: v => setAttributes( { columns:  v } ), min: 1, max: 6 } ),
                        el( ToggleControl, { label: __( 'Show Icons', 'blockenberg' ),       checked: a.showIcon, onChange: v => setAttributes( { showIcon: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Tags', 'blockenberg' ),        checked: a.showTag,  onChange: v => setAttributes( { showTag:  v } ) } ),
                        el( ToggleControl, { label: __( 'Show Descriptions', 'blockenberg' ),checked: a.showDesc, onChange: v => setAttributes( { showDesc: v } ) } ),
                        el( ToggleControl, { label: __( 'Accent Line', 'blockenberg' ),      checked: a.accentLine, onChange: v => setAttributes( { accentLine: v } ) } ),
                    ),

                    el( PanelBody, { title: __( 'Style', 'blockenberg' ), initialOpen: false },
                        el( RangeControl, { label: __( 'Icon Size', 'blockenberg' ),     value: a.iconSize,     onChange: v => setAttributes( { iconSize:     v } ), min: 18, max: 72 } ),
                        el( RangeControl, { label: __( 'Border Radius', 'blockenberg' ), value: a.borderRadius, onChange: v => setAttributes( { borderRadius: v } ), min: 0, max: 32 } ),
                        el( RangeControl, { label: __( 'Card Padding', 'blockenberg' ),  value: a.cardPadding,  onChange: v => setAttributes( { cardPadding:  v } ), min: 8, max: 48 } ),
                        a.accentLine && el( RangeControl, { label: __( 'Accent Height', 'blockenberg' ), value: a.accentHeight, onChange: v => setAttributes( { accentHeight: v } ), min: 2, max: 12 } ),
                    ),

                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        _tc() && _tc()({ label: __('Section Heading','blockenberg'), value: a.typoHeading, onChange: v => setAttributes({ typoHeading: v }) }),
                        _tc() && _tc()({ label: __('Card Title','blockenberg'), value: a.typoCardTitle, onChange: v => setAttributes({ typoCardTitle: v }) }),
                        _tc() && _tc()({ label: __('Body / Subtitle','blockenberg'), value: a.typoBody, onChange: v => setAttributes({ typoBody: v }) })
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Wrapper BG', 'blockenberg' ),  value: a.bgColor,      onChange: v => setAttributes( { bgColor:      v || '#ffffff' } ) },
                            { label: __( 'Card BG', 'blockenberg' ),     value: a.cardBg,       onChange: v => setAttributes( { cardBg:       v || '#f9fafb' } ) },
                            { label: __( 'Heading', 'blockenberg' ),     value: a.headingColor, onChange: v => setAttributes( { headingColor: v || '#111827' } ) },
                            { label: __( 'Subtitle', 'blockenberg' ),    value: a.subtitleColor,onChange: v => setAttributes( { subtitleColor:v || '#6b7280' } ) },
                            { label: __( 'Body Text', 'blockenberg' ),   value: a.textColor,    onChange: v => setAttributes( { textColor:    v || '#374151' } ) },
                            { label: __( 'Tag BG', 'blockenberg' ),      value: a.tagBg,        onChange: v => setAttributes( { tagBg:        v || '#ede9fe' } ) },
                            { label: __( 'Tag Text', 'blockenberg' ),    value: a.tagColor,     onChange: v => setAttributes( { tagColor:     v || '#6d28d9' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Items', 'blockenberg' ), initialOpen: false },
                        el( Button, { variant: 'secondary', style: { marginBottom: 10 }, onClick: () => setAttributes( { items: [ ...( a.items || [] ), { icon: '⭐', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', accentColor: '#6366f1', tag: 'Highlight', title: 'New Highlight', description: 'Describe this moment or achievement.' } ] } ) }, __( '+ Add Item', 'blockenberg' ) ),
                        a.items.map( ( item, ii ) =>
                            el( PanelBody, { key: ii, title: item.title.length > 28 ? item.title.slice( 0, 26 ) + '…' : item.title, initialOpen: false },
                                IP() ? el( IP().IconPickerControl, {
                                    iconType: item.iconType || 'custom-char',
                                    customChar: item.icon || '',
                                    dashicon: item.iconDashicon || '',
                                    imageUrl: item.iconImageUrl || '',
                                    onChangeType: v => updItem( setAttributes, a.items, ii, 'iconType', v ),
                                    onChangeChar: v => updItem( setAttributes, a.items, ii, 'icon', v ),
                                    onChangeDashicon: v => updItem( setAttributes, a.items, ii, 'iconDashicon', v ),
                                    onChangeImageUrl: v => updItem( setAttributes, a.items, ii, 'iconImageUrl', v ),
                                    label: __( 'Icon', 'blockenberg' )
                                } ) : el( TextControl, { label: __( 'Icon (emoji or text)', 'blockenberg' ), value: item.icon,  onChange: v => updItem( setAttributes, a.items, ii, 'icon',  v ) } ),
                                el( TextControl, { label: __( 'Tag', 'blockenberg' ),    value: item.tag,   onChange: v => updItem( setAttributes, a.items, ii, 'tag',   v ) } ),
                                el( TextControl, { label: __( 'Title', 'blockenberg' ),  value: item.title, onChange: v => updItem( setAttributes, a.items, ii, 'title', v ) } ),
                                el( 'div', { style: { marginBottom: 8 } },
                                    el( 'label', { style: { fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 } }, __( 'Description', 'blockenberg' ) ),
                                    el( 'textarea', { value: item.description, rows: 3, onChange: e => updItem( setAttributes, a.items, ii, 'description', e.target.value ), style: { width: '100%', fontSize: 12, padding: '6px 8px', borderRadius: 4, border: '1px solid #d1d5db', resize: 'vertical', boxSizing: 'border-box' } } ),
                                ),
                                el( 'div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 } },
                                    el( 'label', { style: { fontSize: 12 } }, __( 'Accent Color', 'blockenberg' ) ),
                                    el( 'input', { type: 'color', value: item.accentColor || '#6366f1', style: { width: 40, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer' }, onChange: e => updItem( setAttributes, a.items, ii, 'accentColor', e.target.value ) } ),
                                ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { items: a.items.filter( ( _, x ) => x !== ii ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                // Header
                el( 'div', { className: 'bkbg-hr-header', style: { marginBottom: 28 } },
                    a.showTitle && a.title && el( 'h2', { className: 'bkbg-hr-title', style: { color: a.headingColor, margin: '0 0 6px' } }, a.title ),
                    a.showSubtitle && a.subtitle && el( 'p', { className: 'bkbg-hr-subtitle', style: { color: a.subtitleColor, margin: 0 } }, a.subtitle ),
                ),

                renderReel( a ),
            );
        },

        save: function ( { attributes: a } ) {
            const blockProps = useBlockProps.save( { className: 'bkbg-hr-wrap', style: Object.assign( { background: a.bgColor, boxSizing: 'border-box' }, _tv() && _tv()( a.typoHeading, '--bkbg-hr-hl-' ), _tv() && _tv()( a.typoCardTitle, '--bkbg-hr-ct-' ), _tv() && _tv()( a.typoBody, '--bkbg-hr-bd-' ) ) } );
            return el( 'div', blockProps,
                el( 'div', { className: 'bkbg-hr-header', style: { marginBottom: 28 } },
                    a.showTitle    && a.title    ? el( 'h2', { className: 'bkbg-hr-title',    style: { color: a.headingColor,  margin: '0 0 6px' } }, a.title )    : null,
                    a.showSubtitle && a.subtitle ? el( 'p',  { className: 'bkbg-hr-subtitle', style: { color: a.subtitleColor, margin: 0 } },              a.subtitle ) : null,
                ),
                renderReel( a ),
            );
        },
    } );
}() );

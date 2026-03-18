( function () {
    const el = window.wp.element.createElement;
    const { useState } = window.wp.element;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, TextareaControl, SelectControl, Button, ColorPicker, Popover } = window.wp.components;
    const { __ } = window.wp.i18n;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    // ── Render one notification row ───────────────────────────────────────────
    function renderItem( notif, idx, a, isLast ) {
        const isCard    = a.layout === 'card';
        const itemStyle = {
            display:        'flex',
            alignItems:     'flex-start',
            gap:            '14px',
            padding:        a.itemPad + 'px',
            borderBottom:   ( !isLast && a.showDividers && !isCard ) ? `1px solid ${ a.dividerColor }` : 'none',
            background:     notif.unread ? ( isCard ? 'rgba(79,70,229,0.03)' : 'transparent' ) : 'transparent',
            borderRadius:   isCard ? '10px' : 0,
            border:         isCard ? `1px solid ${ a.cardBorder }` : null,
            position:       'relative',
        };

        return el( 'div', { key: idx, className: 'bkbg-nf-item' + ( notif.unread ? ' bkbg-nf-unread' : '' ), style: itemStyle },

            // Unread indicator dot
            notif.unread && el( 'span', {
                className: 'bkbg-nf-dot',
                style: { background: a.unreadDotColor, position: 'absolute', top: a.itemPad + 4 + 'px', right: a.itemPad + 'px', width: '8px', height: '8px', borderRadius: '50%', display: 'block' }
            } ),

            // Icon badge
            el( 'div', {
                className: 'bkbg-nf-icon',
                style: {
                    width:          a.iconSize + 'px',
                    height:         a.iconSize + 'px',
                    borderRadius:   '10px',
                    background:     notif.iconBg || '#ede9fe',
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    fontSize:       Math.round( a.iconSize * 0.52 ) + 'px',
                    flexShrink:     0,
                }
            }, (function () {
                var _nt = notif.iconType || 'custom-char';
                if (_nt !== 'custom-char' && IP()) {
                    var _n = IP().buildSaveIcon(_nt, notif.icon, notif.iconDashicon, notif.iconImageUrl, notif.iconDashiconColor);
                    if (_n) return _n;
                }
                return notif.icon || '🔔';
            })() ),

            // Content
            el( 'div', { className: 'bkbg-nf-content', style: { flex: 1, minWidth: 0 } },
                el( 'div', { className: 'bkbg-nf-row1', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' } },
                    el( 'span', {
                        className: 'bkbg-nf-title',
                        style: { color: a.titleColor }
                    }, notif.title || '' ),
                    a.showTimestamp && notif.time && el( 'span', {
                        className: 'bkbg-nf-time',
                        style: { fontSize: a.timeFontSize + 'px', color: a.timeColor, flexShrink: 0, whiteSpace: 'nowrap' }
                    }, notif.time ),
                ),
                notif.body && el( 'p', {
                    className: 'bkbg-nf-body',
                    style: { color: a.bodyColor, margin: '4px 0 0' }
                }, notif.body ),
            ),
        );
    }

    // ── Render full feed ──────────────────────────────────────────────────────
    function renderFeed( a ) {
        const items = a.notifications || [];
        const wrap  = {
            background:   a.bgColor,
            maxWidth:     a.maxWidth + 'px',
            borderRadius: a.layout === 'card' ? 0 : '12px',
            overflow:     'hidden',
            border:       a.layout === 'card' ? 'none' : `1px solid ${ a.cardBorder }`,
        };

        return el( 'div', { className: 'bkbg-nf-list', style: wrap },
            a.layout === 'card'
                ? el( 'div', { style: { display: 'flex', flexDirection: 'column', gap: a.itemPad + 'px' } },
                    items.map( ( notif, i ) => renderItem( notif, i, a, i === items.length - 1 ) )
                )
                : items.map( ( notif, i ) => renderItem( notif, i, a, i === items.length - 1 ) )
        );
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    function updNotif( setAttributes, notifications, idx, field, val ) {
        setAttributes( { notifications: notifications.map( ( n, i ) => i === idx ? { ...n, [field]: val } : n ) } );
    }

    // ── Block ─────────────────────────────────────────────────────────────────
    var BkbgColorSwatch = function (props) {
        var _st = useState(false); var isOpen = _st[0]; var setOpen = _st[1];
        return el('div', {},
            el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' } },
                el('span', { style: { fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', color: '#1e1e1e' } }, props.label),
                el('button', {
                    type: 'button',
                    onClick: function () { setOpen(!isOpen); },
                    style: { width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #ccc', background: props.value || '#ffffff', cursor: 'pointer', padding: 0 }
                })
            ),
            isOpen && el(Popover, { onClose: function () { setOpen(false); } },
                el('div', { style: { padding: '8px' } },
                    el(ColorPicker, { color: props.value, onChangeComplete: function (c) { props.onChange(c.hex); }, enableAlpha: true })
                )
            )
        );
    };

    registerBlockType( 'blockenberg/notification-feed', {
        edit: function ( props ) {
            const { attributes: a, setAttributes } = props;
            const blockProps = useBlockProps( (function () {
                var _tvf = getTypoCssVars();
                var s = {};
                if (_tvf) { Object.assign(s, _tvf(a.titleTypo, '--bkbg-nf-tt-')); Object.assign(s, _tvf(a.bodyTypo, '--bkbg-nf-bd-')); }
                return { className: 'bkbg-notification-feed-wrap', style: s };
            })() );

            const notifs = a.notifications || [];

            return el( 'div', blockProps,
                el( InspectorControls, {},

                    el( PanelBody, { title: __( 'Feed Settings', 'blockenberg' ), initialOpen: true },
                        el( TextControl, { label: __( 'Title', 'blockenberg' ), value: a.title, onChange: v => setAttributes( { title: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Title', 'blockenberg' ),         checked: a.showTitle,      onChange: v => setAttributes( { showTitle: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Timestamps', 'blockenberg' ),    checked: a.showTimestamp,  onChange: v => setAttributes( { showTimestamp: v } ) } ),
                        el( ToggleControl, { label: __( 'Show Dividers', 'blockenberg' ),      checked: a.showDividers,   onChange: v => setAttributes( { showDividers: v } ) } ),
                        el( ToggleControl, { label: __( 'Bold Unread Titles', 'blockenberg' ), checked: a.markUnreadBold, onChange: v => setAttributes( { markUnreadBold: v } ) } ),
                        el( SelectControl, {
                            label: __( 'Layout', 'blockenberg' ),
                            value: a.layout,
                            options: [ { label: __( 'Cards (spaced)', 'blockenberg' ), value: 'card' }, { label: __( 'List (bordered box)', 'blockenberg' ), value: 'list' } ],
                            onChange: v => setAttributes( { layout: v } ),
                        } ),
                        el( RangeControl, { label: __( 'Max Width (px)', 'blockenberg' ),  value: a.maxWidth,       onChange: v => setAttributes( { maxWidth: v } ),       min: 300, max: 1200, step: 10 } ),
                        el( RangeControl, { label: __( 'Item Padding', 'blockenberg' ),    value: a.itemPad,        onChange: v => setAttributes( { itemPad: v } ),        min: 8, max: 40 } ),
                        el( RangeControl, { label: __( 'Icon Size', 'blockenberg' ),       value: a.iconSize,       onChange: v => setAttributes( { iconSize: v } ),       min: 28, max: 72 } ),
                    ),

                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl() && el(getTypoControl(), { label: __('Title Typography', 'blockenberg'), value: a.titleTypo || {}, onChange: function (v) { return setAttributes( { titleTypo: v } ); } }),
                        getTypoControl() && el(getTypoControl(), { label: __('Body Typography', 'blockenberg'), value: a.bodyTypo || {}, onChange: function (v) { return setAttributes( { bodyTypo: v } ); } }),
                        el( RangeControl, { label: __( 'Time Font Size', 'blockenberg' ),  value: a.timeFontSize,   onChange: v => setAttributes( { timeFontSize: v } ),   min: 9, max: 16, __nextHasNoMarginBottom: true } )
                    ),
el( PanelColorSettings, {
                        title: __( 'Colors', 'blockenberg' ), initialOpen: false,
                        colorSettings: [
                            { label: __( 'Background', 'blockenberg' ),      value: a.bgColor,      onChange: v => setAttributes( { bgColor:      v || '#ffffff' } ) },
                            { label: __( 'Title Color', 'blockenberg' ),     value: a.titleColor,   onChange: v => setAttributes( { titleColor:   v || '#111827' } ) },
                            { label: __( 'Body Color', 'blockenberg' ),      value: a.bodyColor,    onChange: v => setAttributes( { bodyColor:    v || '#4b5563' } ) },
                            { label: __( 'Time Color', 'blockenberg' ),      value: a.timeColor,    onChange: v => setAttributes( { timeColor:    v || '#9ca3af' } ) },
                            { label: __( 'Divider Color', 'blockenberg' ),   value: a.dividerColor, onChange: v => setAttributes( { dividerColor: v || '#f3f4f6' } ) },
                            { label: __( 'Card Border', 'blockenberg' ),     value: a.cardBorder,   onChange: v => setAttributes( { cardBorder:   v || '#e5e7eb' } ) },
                            { label: __( 'Unread Dot', 'blockenberg' ),      value: a.unreadDotColor, onChange: v => setAttributes( { unreadDotColor: v || '#4f46e5' } ) },
                        ]
                    } ),

                    el( PanelBody, { title: __( 'Notifications', 'blockenberg' ), initialOpen: false },
                        el( Button, {
                            variant: 'secondary', style: { marginBottom: 10 },
                            onClick: () => setAttributes( { notifications: [ ...notifs, { icon: '🔔', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', iconBg: '#ede9fe', title: 'New notification', body: '', time: 'Just now', unread: true } ] } )
                        }, __( '+ Add Notification', 'blockenberg' ) ),

                        notifs.map( ( notif, i ) =>
                            el( PanelBody, { key: i, title: ( notif.unread ? '🔵 ' : '' ) + ( notif.title || `Notification ${ i + 1 }` ), initialOpen: false },
                                el(IP().IconPickerControl, {
                                    iconType: notif.iconType || 'custom-char',
                                    customChar: notif.icon || '',
                                    dashicon: notif.iconDashicon || '',
                                    imageUrl: notif.iconImageUrl || '',
                                    onChangeType: v => updNotif( setAttributes, notifs, i, 'iconType', v ),
                                    onChangeChar: v => updNotif( setAttributes, notifs, i, 'icon', v ),
                                    onChangeDashicon: v => updNotif( setAttributes, notifs, i, 'iconDashicon', v ),
                                    onChangeImageUrl: v => updNotif( setAttributes, notifs, i, 'iconImageUrl', v ),
                                    label: __( 'Icon', 'blockenberg' )
                                }),
                                el( BkbgColorSwatch, { label: __( 'Icon BG (hex)', 'blockenberg' ), value: notif.iconBg, onChange: v => updNotif( setAttributes, notifs, i, 'iconBg', v ) } ),
                                el( TextControl, { label: __( 'Title', 'blockenberg' ),         value: notif.title,  onChange: v => updNotif( setAttributes, notifs, i, 'title',  v ) } ),
                                el( TextareaControl, { label: __( 'Body Text', 'blockenberg' ), value: notif.body,   onChange: v => updNotif( setAttributes, notifs, i, 'body',   v ), rows: 2 } ),
                                el( TextControl, { label: __( 'Timestamp', 'blockenberg' ),     value: notif.time,   onChange: v => updNotif( setAttributes, notifs, i, 'time',   v ) } ),
                                el( ToggleControl, { label: __( 'Mark as Unread', 'blockenberg' ), checked: !! notif.unread, onChange: v => updNotif( setAttributes, notifs, i, 'unread', v ) } ),
                                el( Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes( { notifications: notifs.filter( ( _, x ) => x !== i ) } ) }, __( 'Remove', 'blockenberg' ) ),
                            )
                        ),
                    ),
                ),

                a.showTitle && a.title && el( 'h3', { className: 'bkbg-nf-heading', style: { color: a.titleColor } }, a.title ),
                renderFeed( a ),
            );
        },

        save: function ( { attributes: a } ) {
            var _tvf = getTypoCssVars();
            var blockProps = useBlockProps.save( (function () {
                var s = {};
                if (_tvf) { Object.assign(s, _tvf(a.titleTypo, '--bkbg-nf-tt-')); Object.assign(s, _tvf(a.bodyTypo, '--bkbg-nf-bd-')); }
                return { className: 'bkbg-notification-feed-wrap', style: s };
            })() );
            return el( 'div', blockProps,
                a.showTitle && a.title ? el( 'h3', { className: 'bkbg-nf-heading', style: { color: a.titleColor } }, a.title ) : null,
                renderFeed( a ),
            );
        },

        deprecated: [{
            attributes: {
                title:          { type: 'string',  default: 'Recent Activity' },
                showTitle:      { type: 'boolean', default: true },
                layout:         { type: 'string',  default: 'card' },
                showTimestamp:  { type: 'boolean', default: true },
                showDividers:   { type: 'boolean', default: true },
                markUnreadBold: { type: 'boolean', default: true },
                maxWidth:       { type: 'number',  default: 600 },
                itemPad:        { type: 'number',  default: 16 },
                iconSize:       { type: 'number',  default: 42 },
                titleFontSize:  { type: 'number',  default: 15 },
                bodyFontSize:   { type: 'number',  default: 13 },
                timeFontSize:   { type: 'number',  default: 11 },
                fontWeight:     { type: 'number',  default: 600 },
                bodyFontWeight: { type: 'number',  default: 400 },
                bgColor:        { type: 'string',  default: '#ffffff' },
                titleColor:     { type: 'string',  default: '#111827' },
                bodyColor:      { type: 'string',  default: '#4b5563' },
                timeColor:      { type: 'string',  default: '#9ca3af' },
                dividerColor:   { type: 'string',  default: '#f3f4f6' },
                unreadDotColor: { type: 'string',  default: '#4f46e5' },
                cardBorder:     { type: 'string',  default: '#e5e7eb' },
                notifications:  { type: 'array',   default: [] }
            },
            save: function ( { attributes: a } ) {
                var blockProps = useBlockProps.save( { className: 'bkbg-notification-feed-wrap' } );
                return el( 'div', blockProps,
                    a.showTitle && a.title ? el( 'h3', { className: 'bkbg-nf-heading', style: { color: a.titleColor } }, a.title ) : null,
                    renderFeed( a ),
                );
            }
        }],
    } );
}() );

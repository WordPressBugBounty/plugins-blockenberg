( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    var POSITION_OPTIONS = [
        { label: 'Bottom Left',  value: 'bottom-left' },
        { label: 'Bottom Right', value: 'bottom-right' },
        { label: 'Top Left',     value: 'top-left' },
        { label: 'Top Right',    value: 'top-right' },
    ];
    var ANIMATE_OPTIONS = [
        { label: 'Slide in',  value: 'slide' },
        { label: 'Fade in',   value: 'fade' },
        { label: 'Pop in',    value: 'pop' },
    ];
    var STYLE_OPTIONS = [
        { label: 'Shadow (elevated)', value: 'shadow' },
        { label: 'Bordered',          value: 'bordered' },
        { label: 'Flat (minimal)',    value: 'flat' },
    ];

    var BG_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9', '#ec4899', '#14b8a6'];

    function updateNotif(arr, idx, field, val) {
        return arr.map(function (n, i) {
            if (i !== idx) return n;
            var p = {}; p[field] = val;
            return Object.assign({}, n, p);
        });
    }

    function initials(name) {
        return (name || 'U').split(' ').map(function (w) { return w[0] || ''; }).join('').slice(0, 2).toUpperCase();
    }

    function buildToastPreview(notif, a) {
        return el('div', {
            style: {
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px',
                background: a.toastBg,
                borderRadius: a.borderRadius + 'px',
                border: a.toastStyle === 'bordered' ? '1px solid ' + a.toastBorder : 'none',
                boxShadow: (a.toastStyle === 'shadow' && a.toastShadow) ? '0 4px 18px rgba(0,0,0,0.12)' : 'none',
                maxWidth: a.maxWidth + 'px',
            }
        },
            a.showAvatar && el('div', {
                style: {
                    width: a.avatarSize + 'px', height: a.avatarSize + 'px', borderRadius: '50%',
                    background: notif.avatarBg || '#6366f1', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: Math.round(a.avatarSize * 0.35) + 'px', fontWeight: 700, flexShrink: 0,
                }
            }, initials(notif.name)),
            el('div', { style: { flex: 1, minWidth: 0 } },
                el('div', { style: { display: 'flex', alignItems: 'center', gap: 4 } },
                    a.showIcon && el('span', { style: { fontSize: a.iconSize + 'px' } }, (notif.iconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(notif.iconType, notif.icon, notif.iconDashicon, notif.iconImageUrl, notif.iconDashiconColor) : (notif.icon || '🔔')),
                    el('span', { className: 'bkbg-ntst-name', style: { color: a.nameColor } }, notif.name || 'User')
                ),
                el('div', { className: 'bkbg-ntst-msg', style: { color: a.textColor, marginTop: 2, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' } }, notif.text || 'notification text'),
                a.showTimeAgo && el('div', { className: 'bkbg-ntst-time', style: { fontSize: a.timeSize + 'px', color: a.timeColor, marginTop: 2 } }, notif.timeAgo || 'just now')
            )
        );
    }

    registerBlockType('blockenberg/notification-toast', {
        title: __('Notification Toast', 'blockenberg'),
        icon: 'megaphone',
        category: 'bkbg-effects',
        description: __('Social-proof toast notifications that cycle in the page corner.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var _tvf = getTypoCssVars();
                var s = {};
                if (_tvf) { Object.assign(s, _tvf(a.nameTypo, '--bkbg-ntst-nm-')); Object.assign(s, _tvf(a.textTypo, '--bkbg-ntst-tx-')); }
                return { style: s };
            })());
            var firstNotif = a.notifications[0] || { icon: '🎉', name: 'User', text: 'Notification text', timeAgo: 'just now', avatarBg: '#6366f1' };

            return el(Fragment, null,
                el(InspectorControls, null,

                    // Notifications list
                    el(PanelBody, { title: 'Notifications (' + a.notifications.length + ')', initialOpen: true },
                        a.notifications.map(function (n, i) {
                            return el('div', {
                                key: i,
                                style: { border: '1px solid #e5e7eb', borderRadius: 8, padding: 10, marginBottom: 8, background: '#fafafa' }
                            },
                                el('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 } },
                                    el('div', { style: { width: 28, height: 28, borderRadius: '50%', background: n.avatarBg || '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 } }, initials(n.name)),
                                    el('span', { style: { fontSize: 12, fontWeight: 600, color: '#374151' } }, n.name),
                                    el('span', { style: { fontSize: 16 } }, (n.iconType || 'custom-char') !== 'custom-char' ? IP().buildEditorIcon(n.iconType, n.icon, n.iconDashicon, n.iconImageUrl, n.iconDashiconColor) : n.icon)
                                ),
                                el(TextControl, { label: 'Name', value: n.name, onChange: function (v) { set({ notifications: updateNotif(a.notifications, i, 'name', v) }); }, __nextHasNoMarginBottom: true }),
                                el('div', { style: { height: 6 } }),
                                el(IP().IconPickerControl, { iconType: n.iconType || 'custom-char', customChar: n.icon || '', dashicon: n.iconDashicon || '', imageUrl: n.iconImageUrl || '', onChangeType: function (v) { set({ notifications: updateNotif(a.notifications, i, 'iconType', v) }); }, onChangeChar: function (v) { set({ notifications: updateNotif(a.notifications, i, 'icon', v) }); }, onChangeDashicon: function (v) { set({ notifications: updateNotif(a.notifications, i, 'iconDashicon', v) }); }, onChangeImageUrl: function (v) { set({ notifications: updateNotif(a.notifications, i, 'iconImageUrl', v) }); } }),
                                el('div', { style: { height: 6 } }),
                                el(TextControl, { label: 'Message', value: n.text, onChange: function (v) { set({ notifications: updateNotif(a.notifications, i, 'text', v) }); }, __nextHasNoMarginBottom: true }),
                                el('div', { style: { height: 6 } }),
                                el(TextControl, { label: 'Time label', value: n.timeAgo, onChange: function (v) { set({ notifications: updateNotif(a.notifications, i, 'timeAgo', v) }); }, __nextHasNoMarginBottom: true }),
                                el('div', { style: { height: 6 } }),
                                el('p', { style: { fontSize: 11, color: '#6b7280', margin: '0 0 4px' } }, 'Avatar color:'),
                                el('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
                                    BG_COLORS.map(function (c) {
                                        return el('button', {
                                            key: c,
                                            onClick: function () { set({ notifications: updateNotif(a.notifications, i, 'avatarBg', c) }); },
                                            style: { width: 24, height: 24, borderRadius: '50%', background: c, border: n.avatarBg === c ? '3px solid #374151' : '2px solid #e5e7eb', cursor: 'pointer' }
                                        });
                                    }),
                                    el('input', {
                                        type: 'color', value: n.avatarBg || '#6366f1',
                                        onChange: function (e) { set({ notifications: updateNotif(a.notifications, i, 'avatarBg', e.target.value) }); },
                                        style: { width: 24, height: 24, border: 'none', borderRadius: '50%', cursor: 'pointer', padding: 0 }
                                    })
                                ),
                                el('div', { style: { height: 6 } }),
                                el(Button, { isDestructive: true, variant: 'link', size: 'small', onClick: function () { set({ notifications: a.notifications.filter(function (_, idx) { return idx !== i; }) }); }, __nextHasNoMarginBottom: true }, 'Remove')
                            );
                        }),
                        el(Button, {
                            variant: 'secondary',
                            onClick: function () { set({ notifications: a.notifications.concat([{ icon: '✅', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', name: 'New User', text: 'just took an action', timeAgo: 'just now', avatarBg: '#6366f1' }]) }); },
                            style: { width: '100%', justifyContent: 'center' }, __nextHasNoMarginBottom: true
                        }, '+ Add Notification')
                    ),

                    // Behaviour
                    el(PanelBody, { title: 'Behaviour', initialOpen: false },
                        el(SelectControl, { label: 'Position', value: a.position, options: POSITION_OPTIONS, onChange: function (v) { set({ position: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Interval between toasts (s)', value: a.interval, min: 1, max: 20, onChange: function (v) { set({ interval: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Display duration (s)', value: a.displayDuration, min: 1, max: 10, onChange: function (v) { set({ displayDuration: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(SelectControl, { label: 'Animation', value: a.animateType, options: ANIMATE_OPTIONS, onChange: function (v) { set({ animateType: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(ToggleControl, { label: 'Loop notifications', checked: a.loop, onChange: function (v) { set({ loop: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 4 } }),
                        el(ToggleControl, { label: 'Show each session only once', checked: a.showOnce, onChange: function (v) { set({ showOnce: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    // Appearance
                    el(PanelBody, { title: 'Appearance', initialOpen: false },
                        el(SelectControl, { label: 'Toast Style', value: a.toastStyle, options: STYLE_OPTIONS, onChange: function (v) { set({ toastStyle: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Max Width (px)', value: a.maxWidth, min: 200, max: 500, onChange: function (v) { set({ maxWidth: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(RangeControl, { label: 'Border Radius (px)', value: a.borderRadius, min: 0, max: 24, onChange: function (v) { set({ borderRadius: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el(ToggleControl, { label: 'Show avatar', checked: a.showAvatar, onChange: function (v) { set({ showAvatar: v }); }, __nextHasNoMarginBottom: true }),
                        a.showAvatar && el(Fragment, null,
                            el('div', { style: { height: 8 } }),
                            el(RangeControl, { label: 'Avatar Size (px)', value: a.avatarSize, min: 28, max: 60, onChange: function (v) { set({ avatarSize: v }); }, __nextHasNoMarginBottom: true })
                        ),
                        el('div', { style: { height: 4 } }),
                        el(ToggleControl, { label: 'Show icon/emoji', checked: a.showIcon, onChange: function (v) { set({ showIcon: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 4 } }),
                        el(ToggleControl, { label: 'Show time label', checked: a.showTimeAgo, onChange: function (v) { set({ showTimeAgo: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { height: 10 } }),
                        el('div', { style: { height: 10 } }),
                        ),

                    // Colors
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl() && el(getTypoControl(), { label: __('Name Typography', 'blockenberg'), value: a.nameTypo || {}, onChange: function (v) { set({ nameTypo: v }); } }),
                        getTypoControl() && el(getTypoControl(), { label: __('Text Typography', 'blockenberg'), value: a.textTypo || {}, onChange: function (v) { set({ textTypo: v }); } }),
                        el(RangeControl, { label: __('Icon Size (px)', 'blockenberg'), value: a.iconSize, min: 12, max: 40, __nextHasNoMarginBottom: true, onChange: function (v) { set({ iconSize: v }); } }),
                        el(RangeControl, { label: __('Time Size (px)', 'blockenberg'), value: a.timeSize, min: 8, max: 18, __nextHasNoMarginBottom: true, onChange: function (v) { set({ timeSize: v }); } })
                    ),
el(PanelColorSettings, {
                        title: 'Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Toast Background', value: a.toastBg,     onChange: function (v) { set({ toastBg: v || '#ffffff' }); } },
                            { label: 'Toast Border',     value: a.toastBorder, onChange: function (v) { set({ toastBorder: v || '#e5e7eb' }); } },
                            { label: 'Name Color',       value: a.nameColor,   onChange: function (v) { set({ nameColor: v || '#111827' }); } },
                            { label: 'Message Color',    value: a.textColor,   onChange: function (v) { set({ textColor: v || '#6b7280' }); } },
                            { label: 'Time Color',       value: a.timeColor,   onChange: function (v) { set({ timeColor: v || '#9ca3af' }); } },
                        ]
                    })
                ),

                // ── Editor Preview ──
                el('div', blockProps,
                    el('p', { style: { fontSize: 11, color: '#9ca3af', textAlign: 'center', margin: '0 0 12px' } },
                        'Notification Toast — appears fixed in the "' + a.position + '" corner on the frontend'
                    ),
                    el('div', { style: { display: 'flex', justifyContent: 'center' } },
                        buildToastPreview(firstNotif, a)
                    ),
                    a.notifications.length > 1 && el('p', { style: { fontSize: 11, color: '#9ca3af', textAlign: 'center', margin: '10px 0 0' } }, '+ ' + (a.notifications.length - 1) + ' more notifications cycling every ' + a.interval + 's')
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-ntst-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );

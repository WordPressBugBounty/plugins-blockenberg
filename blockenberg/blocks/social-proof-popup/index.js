( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function updateEntry(entries, idx, field, val) {
        return entries.map(function (e, i) {
            if (i !== idx) return e;
            var upd = {}; upd[field] = val;
            return Object.assign({}, e, upd);
        });
    }

    function PopupPreview(props) {
        var a = props.a;
        var entry = a.entries && a.entries[0];
        if (!entry) return el('div', { className: 'bkbg-spop-empty' }, 'Add entries in the sidebar panel.');

        var wrapStyle = {
            background: a.bgColor,
            color: a.textColor,
            borderColor: a.borderColor,
            borderRadius: a.borderRadius + 'px',
            maxWidth: a.maxWidth + 'px',
            boxShadow: a.shadow ? '0 4px 24px rgba(0,0,0,.12)' : 'none'
        };

        var avatarInitial = (entry.name || 'U').charAt(0).toUpperCase();

        return el('div', { className: 'bkbg-spop-preview-wrap' },
            el('p', { className: 'bkbg-spop-preview-label' }, '👁 Preview (first entry)'),
            el('div', { className: 'bkbg-spop-popup', style: wrapStyle },
                a.showAvatar && el('div', {
                    className: 'bkbg-spop-avatar',
                    style: { background: a.avatarBg }
                }, entry.emoji
                    ? el('span', { className: 'bkbg-spop-emoji' }, entry.emoji)
                    : el('span', { className: 'bkbg-spop-initial' }, avatarInitial)
                ),
                el('div', { className: 'bkbg-spop-content' },
                    el('div', { className: 'bkbg-spop-name', style: { color: a.nameColor } },
                        entry.name,
                        entry.location && el('span', { className: 'bkbg-spop-location' }, ' · ' + entry.location)
                    ),
                    el('div', { className: 'bkbg-spop-action', style: { color: a.actionColor } }, entry.action),
                    a.showTime && entry.timeAgo && el('div', { className: 'bkbg-spop-time', style: { color: a.timeColor } }, entry.timeAgo)
                ),
                a.showClose && el('button', { className: 'bkbg-spop-close', style: { color: a.closeBtnColor } }, '×')
            )
        );
    }

    registerBlockType('blockenberg/social-proof-popup', {
        title: __('Social Proof Popup', 'blockenberg'),
        icon: 'heart',
        category: 'bkbg-marketing',
        description: __('Floating FOMO notification popups cycling through social proof entries.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openState = useState(null);
            var openIdx = openState[0]; var setOpenIdx = openState[1];

            var positionOpts = [
                { label: 'Bottom Left', value: 'bottom-left' },
                { label: 'Bottom Right', value: 'bottom-right' },
                { label: 'Top Left', value: 'top-left' },
                { label: 'Top Right', value: 'top-right' }
            ];
            var animOpts = [
                { label: 'Slide Up', value: 'slide' },
                { label: 'Fade', value: 'fade' },
                { label: 'Bounce', value: 'bounce' }
            ];

            function addEntry() {
                setAttributes({ entries: a.entries.concat([{ emoji: '🔔', name: 'Someone', location: 'City, Country', action: 'just took action', timeAgo: 'just now' }]) });
            }
            function removeEntry(idx) {
                setAttributes({ entries: a.entries.filter(function (_, i) { return i !== idx; }) });
            }

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Behaviour', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Position', 'blockenberg'),
                        value: a.position,
                        options: positionOpts,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ position: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Animation', 'blockenberg'),
                        value: a.animationType,
                        options: animOpts,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ animationType: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Display Time (ms)', 'blockenberg'),
                        value: a.displayTime,
                        min: 1000, max: 10000, step: 500,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ displayTime: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Pause Between (ms)', 'blockenberg'),
                        value: a.pauseBetween,
                        min: 500, max: 8000, step: 500,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ pauseBetween: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Start Delay (ms)', 'blockenberg'),
                        value: a.startDelay,
                        min: 0, max: 10000, step: 500,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ startDelay: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Loop', 'blockenberg'),
                        checked: a.loop,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ loop: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Avatar / Emoji', 'blockenberg'),
                        checked: a.showAvatar,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showAvatar: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Timestamp', 'blockenberg'),
                        checked: a.showTime,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showTime: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Close Button', 'blockenberg'),
                        checked: a.showClose,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showClose: v }); }
                    })
                ),
                el(PanelBody, { title: __('Style', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Border Radius', 'blockenberg'),
                        value: a.borderRadius,
                        min: 0, max: 24,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ borderRadius: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Max Width (px)', 'blockenberg'),
                        value: a.maxWidth,
                        min: 200, max: 480,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ maxWidth: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Drop Shadow', 'blockenberg'),
                        checked: a.shadow,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ shadow: v }); }
                    })
                ),
                el(PanelBody, { title: __('Entries (' + a.entries.length + ')', 'blockenberg'), initialOpen: false },
                    a.entries.map(function (entry, i) {
                        var isOpen = openIdx === i;
                        return el('div', { key: i, className: 'bkbg-spop-entry-editor' },
                            el('div', {
                                className: 'bkbg-spop-entry-head',
                                onClick: function () { setOpenIdx(isOpen ? null : i); }
                            },
                                el('span', {}, entry.emoji + ' ' + (entry.name || 'Entry ' + (i + 1))),
                                el('div', { style: { marginLeft: 'auto', display: 'flex', gap: '4px' } },
                                    el('span', {}, isOpen ? '▲' : '▼'),
                                    el(Button, { isSmall: true, isDestructive: true, onClick: function (e) { e.stopPropagation(); removeEntry(i); } }, '✕')
                                )
                            ),
                            isOpen && el('div', { className: 'bkbg-spop-entry-fields' },
                                el(TextControl, {
                                    label: __('Emoji / Icon', 'blockenberg'),
                                    value: entry.emoji,
                                    __nextHasNoMarginBottom: true,
                                    onChange: function (v) { setAttributes({ entries: updateEntry(a.entries, i, 'emoji', v) }); }
                                }),
                                el(TextControl, {
                                    label: __('Name', 'blockenberg'),
                                    value: entry.name,
                                    __nextHasNoMarginBottom: true,
                                    onChange: function (v) { setAttributes({ entries: updateEntry(a.entries, i, 'name', v) }); }
                                }),
                                el(TextControl, {
                                    label: __('Location', 'blockenberg'),
                                    value: entry.location,
                                    __nextHasNoMarginBottom: true,
                                    onChange: function (v) { setAttributes({ entries: updateEntry(a.entries, i, 'location', v) }); }
                                }),
                                el(TextControl, {
                                    label: __('Action Text', 'blockenberg'),
                                    value: entry.action,
                                    __nextHasNoMarginBottom: true,
                                    onChange: function (v) { setAttributes({ entries: updateEntry(a.entries, i, 'action', v) }); }
                                }),
                                el(TextControl, {
                                    label: __('Time Ago', 'blockenberg'),
                                    value: entry.timeAgo,
                                    __nextHasNoMarginBottom: true,
                                    onChange: function (v) { setAttributes({ entries: updateEntry(a.entries, i, 'timeAgo', v) }); }
                                })
                            )
                        );
                    }),
                    el(Button, {
                        variant: 'secondary',
                        style: { marginTop: '8px', width: '100%' },
                        onClick: addEntry
                    }, __('+ Add Entry', 'blockenberg'))
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl() && el(getTypoControl(), {
                        label: __('Name', 'blockenberg'),
                        value: a.nameTypo || {},
                        onChange: function (v) { setAttributes({ nameTypo: v }); }
                    }),
                    getTypoControl() && el(getTypoControl(), {
                        label: __('Action / Time', 'blockenberg'),
                        value: a.actionTypo || {},
                        onChange: function (v) { setAttributes({ actionTypo: v }); }
                    })
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.bgColor, onChange: function (c) { setAttributes({ bgColor: c || '#ffffff' }); }, label: __('Background', 'blockenberg') },
                        { value: a.borderColor, onChange: function (c) { setAttributes({ borderColor: c || '#e2e8f0' }); }, label: __('Border', 'blockenberg') },
                        { value: a.nameColor, onChange: function (c) { setAttributes({ nameColor: c || '#0f172a' }); }, label: __('Name', 'blockenberg') },
                        { value: a.actionColor, onChange: function (c) { setAttributes({ actionColor: c || '#475569' }); }, label: __('Action Text', 'blockenberg') },
                        { value: a.timeColor, onChange: function (c) { setAttributes({ timeColor: c || '#94a3b8' }); }, label: __('Timestamp', 'blockenberg') },
                        { value: a.avatarBg, onChange: function (c) { setAttributes({ avatarBg: c || '#f0f9ff' }); }, label: __('Avatar Background', 'blockenberg') },
                        { value: a.closeBtnColor, onChange: function (c) { setAttributes({ closeBtnColor: c || '#94a3b8' }); }, label: __('Close Button', 'blockenberg') }
                    ]
                })
            );

            var blockProps = useBlockProps((function () {
                var p = { className: 'bkbg-editor-wrap', 'data-block-label': 'Social Proof Popup' };
                var _tvFn = getTypoCssVars();
                if (_tvFn) {
                    var s = {};
                    Object.assign(s, _tvFn(a.nameTypo || {}, '--bkspop-nm-'));
                    Object.assign(s, _tvFn(a.actionTypo || {}, '--bkspop-ac-'));
                    p.style = s;
                }
                return p;
            }()));

            return el('div', blockProps,
                inspector,
                el(PopupPreview, { a: a })
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-spop-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );

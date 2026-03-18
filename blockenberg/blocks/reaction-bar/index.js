(function () {
        var el = wp.element.createElement;
        var Fragment = wp.element.Fragment;
        var registerBlockType = wp.blocks.registerBlockType;
        var __ = wp.i18n.__;
        var InspectorControls = wp.blockEditor.InspectorControls;
        var PanelColorSettings = wp.blockEditor.PanelColorSettings;
        var useBlockProps = wp.blockEditor.useBlockProps;
        var useState = wp.element.useState;
        var PanelBody = wp.components.PanelBody;
        var TextControl = wp.components.TextControl;
        var ToggleControl = wp.components.ToggleControl;
        var RangeControl = wp.components.RangeControl;
        var SelectControl = wp.components.SelectControl;
        var Button = wp.components.Button;
        var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
        var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

        // ── helpers ────────────────────────────────────────────────────
        function upd(arr, idx, field, val) {
            return arr.map(function (e, i) {
                if (i !== idx) return e;
                var u = {}; u[field] = val;
                return Object.assign({}, e, u);
            });
        }

        var LAYOUT_OPTIONS = [
            { value: 'buttons',  label: 'Pill buttons (GitHub style)' },
            { value: 'compact',  label: 'Compact row' },
            { value: 'cards',    label: 'Cards grid' },
        ];

        // ── reaction item renderer ─────────────────────────────────────
        function renderReactionItem(r, a, isActive, layout) {
            var isCards = layout === 'cards';
            var isCompact = layout === 'compact';

            // Common base styles
            var itemStyle = {
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: isCards ? 'center' : 'flex-start',
                flexDirection: isCards ? 'column' : 'row',
                gap: isCards ? '6px' : '6px',
                padding: isCards ? '16px 12px' : isCompact ? '4px 12px' : '7px 14px',
                borderRadius: (a.itemRadius || 100) + 'px',
                border: '1.5px solid ' + (isActive ? a.activeItemBorder : a.itemBorderColor),
                background: isActive ? a.activeItemBg : a.itemBg,
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'all .15s ease',
                flexShrink: '0'
            };
            if (isCards) {
                itemStyle.borderRadius = '12px';
                itemStyle.minWidth = '90px';
            }

            var emojiEl = el('span', { style: { fontSize: a.emojiSize + 'px', lineHeight: '1' } }, r.emoji);
            var countEl = a.showCount ? el('span', {
                className: 'bkrab-count',
                style: { color: isActive ? a.activeCountColor : a.countColor }
            }, String(r.count)) : null;
            var labelEl = (a.showLabel && !isCompact) ? el('span', {
                className: 'bkrab-label',
                style: { color: a.labelColor }
            }, r.label) : null;

            return el('div', { style: itemStyle },
                emojiEl,
                el('div', { style: { display: 'flex', flexDirection: isCards ? 'column' : 'row', alignItems: 'center', gap: '4px' } },
                    countEl, labelEl
                )
            );
        }

        // ── edit ──────────────────────────────────────────────────────
        function Edit(props) {
            var a   = props.attributes;
            var set = props.setAttributes;
            var TC = getTypoControl();
            var activeIdx = useState(0)[0];

            var total = a.reactions.reduce(function (s, r) { return s + (r.count || 0); }, 0);

            var colorSettings = [
                { label: __('Background'),     value: a.bgColor,          onChange: function (v) { set({ bgColor: v || '#ffffff' }); } },
                { label: __('Border'),          value: a.borderColor,      onChange: function (v) { set({ borderColor: v || '#e5e7eb' }); } },
                { label: __('Title'),           value: a.titleColor,       onChange: function (v) { set({ titleColor: v || '#111827' }); } },
                { label: __('Item BG'),         value: a.itemBg,           onChange: function (v) { set({ itemBg: v || '#f9fafb' }); } },
                { label: __('Item Border'),     value: a.itemBorderColor,  onChange: function (v) { set({ itemBorderColor: v || '#e5e7eb' }); } },
                { label: __('Count'),           value: a.countColor,       onChange: function (v) { set({ countColor: v || '#374151' }); } },
                { label: __('Label'),           value: a.labelColor,       onChange: function (v) { set({ labelColor: v || '#6b7280' }); } },
                { label: __('Total count'),     value: a.totalColor,       onChange: function (v) { set({ totalColor: v || '#9ca3af' }); } },
                { label: __('Active BG'),       value: a.activeItemBg,     onChange: function (v) { set({ activeItemBg: v || '#eff6ff' }); } },
                { label: __('Active Border'),   value: a.activeItemBorder, onChange: function (v) { set({ activeItemBorder: v || '#bfdbfe' }); } },
                { label: __('Active Count'),    value: a.activeCountColor, onChange: function (v) { set({ activeCountColor: v || '#1d4ed8' }); } },
            ];

            var inspector = el(InspectorControls, {},
                // Settings
                el(PanelBody, { title: __('Settings'), initialOpen: true },
                    el(TextControl, {
                        label: __('Title'), value: a.title, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ title: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show title'), checked: a.showTitle, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showTitle: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Layout'), value: a.layout, options: LAYOUT_OPTIONS, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ layout: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show count'), checked: a.showCount, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showCount: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show label'), checked: a.showLabel, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showLabel: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show total'), checked: a.showTotal, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showTotal: v }); }
                    }),
                    a.showTotal ? el(TextControl, {
                        label: __('Total label'), value: a.totalLabel, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ totalLabel: v }); }
                    }) : null
                ),
                // Typography
                el(PanelBody, { title: __('Typography'), initialOpen: false },
                    TC && el(TC, { label: __('Title', 'blockenberg'), value: a.titleTypo || {}, onChange: function(v) { set({ titleTypo: v }); } }),
                    TC && el(TC, { label: __('Count / Label', 'blockenberg'), value: a.countTypo || {}, onChange: function(v) { set({ countTypo: v }); } }),
                    el(RangeControl, { label: __('Emoji size'), value: a.emojiSize, min: 14, max: 40, __nextHasNoMarginBottom: true, onChange: function (v) { set({ emojiSize: v }); } })
                ),
                // Appearance
                el(PanelBody, { title: __('Appearance'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Card radius'), value: a.borderRadius, min: 0, max: 40, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ borderRadius: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Item radius'), value: a.itemRadius, min: 0, max: 100, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ itemRadius: v }); }
                    })
                ),
                // Reactions editor
                el(PanelBody, { title: __('Reactions (' + a.reactions.length + ')'), initialOpen: false },
                    a.reactions.map(function (r, idx) {
                        return el(PanelBody, {
                            key: idx,
                            title: r.emoji + ' ' + r.label + ' (' + r.count + ')',
                            initialOpen: false
                        },
                            el(TextControl, {
                                label: __('Emoji'), value: r.emoji, __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ reactions: upd(a.reactions, idx, 'emoji', v) }); }
                            }),
                            el(TextControl, {
                                label: __('Label'), value: r.label, __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ reactions: upd(a.reactions, idx, 'label', v) }); }
                            }),
                            el(TextControl, {
                                label: __('Count'), value: String(r.count), __nextHasNoMarginBottom: true,
                                onChange: function (v) { var n = parseInt(v, 10); if (!isNaN(n) && n >= 0) set({ reactions: upd(a.reactions, idx, 'count', n) }); }
                            }),
                            el(Button, {
                                variant: 'secondary', isDestructive: true, __nextHasNoMarginBottom: true,
                                onClick: function () { var n = a.reactions.slice(); n.splice(idx, 1); set({ reactions: n }); }
                            }, __('Remove'))
                        );
                    }),
                    a.reactions.length < 12 ? el(Button, {
                        variant: 'primary', __nextHasNoMarginBottom: true,
                        onClick: function () {
                            set({ reactions: a.reactions.concat([{ emoji: '⭐', label: 'Star', count: 0 }]) });
                        }
                    }, __('+ Add reaction')) : null
                ),
                el(PanelColorSettings, {
                    title: __('Colors'),
                    initialOpen: false,
                    colorSettings: colorSettings
                })
            );

            // ── Preview ───────────────────────────────────────────────
            var total = a.reactions.reduce(function (s, r) { return s + (r.count || 0); }, 0);
            var isCards = a.layout === 'cards';

            var titleRow = a.showTitle ? el('div', {
                className: 'bkrab-title',
                style: { color: a.titleColor, marginBottom: '14px' }
            }, a.title) : null;

            var reactionEls = el('div', {
                style: {
                    display: isCards ? 'grid' : 'flex',
                    gridTemplateColumns: isCards ? 'repeat(auto-fill, minmax(90px, 1fr))' : undefined,
                    flexWrap: isCards ? undefined : 'wrap',
                    gap: '8px'
                }
            },
                a.reactions.map(function (r, idx) {
                    return el('div', { key: idx }, renderReactionItem(r, a, idx === activeIdx, a.layout));
                })
            );

            var totalEl = (a.showTotal) ? el('div', {
                className: 'bkrab-total',
                style: { marginTop: '12px', color: a.totalColor }
            }, total + ' ' + a.totalLabel) : null;

            return el(Fragment, {},
                inspector,
                el('div', useBlockProps((function() {
                    var _tvFn = getTypoCssVars();
                    var s = {
                        background: a.bgColor,
                        border: '1px solid ' + a.borderColor,
                        borderRadius: a.borderRadius + 'px',
                        padding: '20px 24px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                    };
                    if (_tvFn) {
                        Object.assign(s, _tvFn(a.titleTypo || {}, '--bkrab-tt-'));
                        Object.assign(s, _tvFn(a.countTypo || {}, '--bkrab-ct-'));
                    }
                    return { style: s };
                })()), titleRow, reactionEls, totalEl)
            );
        }

        registerBlockType('blockenberg/reaction-bar', {
            edit: Edit,
            save: function (props) {
                return el('div', useBlockProps.save(),
                    el('div', { className: 'bkbg-reaction-bar-app', 'data-opts': JSON.stringify(props.attributes) })
                );
            }
        });
})();

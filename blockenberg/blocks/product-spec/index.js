( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var Button = wp.components.Button;
    var TextControl = wp.components.TextControl;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var CheckboxControl = wp.components.CheckboxControl;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    // ── ES5 safe update helpers ──────────────────────────────────
    function updateGroup(groups, gIdx, field, val) {
        return groups.map(function (g, i) {
            if (i !== gIdx) return g;
            var u = {}; u[field] = val;
            return Object.assign({}, g, u);
        });
    }

    function updateSpec(groups, gIdx, sIdx, field, val) {
        return groups.map(function (g, i) {
            if (i !== gIdx) return g;
            var newSpecs = g.specs.map(function (s, j) {
                if (j !== sIdx) return s;
                var u = {}; u[field] = val;
                return Object.assign({}, s, u);
            });
            return Object.assign({}, g, { specs: newSpecs });
        });
    }

    function addSpec(groups, gIdx) {
        return groups.map(function (g, i) {
            if (i !== gIdx) return g;
            return Object.assign({}, g, { specs: g.specs.concat([{ key: 'Spec', value: 'Value', highlight: false }]) });
        });
    }

    function removeSpec(groups, gIdx, sIdx) {
        return groups.map(function (g, i) {
            if (i !== gIdx) return g;
            return Object.assign({}, g, { specs: g.specs.filter(function (_, j) { return j !== sIdx; }) });
        });
    }

    registerBlockType('blockenberg/product-spec', {
        title: __('Product Spec Sheet', 'blockenberg'),
        icon: 'editor-table',
        category: 'bkbg-marketing',
        description: __('Structured product specification sheet with grouped categories and rich styling.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var TC = getTypoControl();

            var layoutOptions = [
                { label: __('Table', 'blockenberg'), value: 'table' },
                { label: __('Cards', 'blockenberg'), value: 'cards' },
                { label: __('Compact (2 cols)', 'blockenberg'), value: 'compact' }
            ];
            var styleOptions = [
                { label: __('Striped rows', 'blockenberg'), value: 'striped' },
                { label: __('Bordered', 'blockenberg'), value: 'bordered' },
                { label: __('Minimal', 'blockenberg'), value: 'minimal' }
            ];

            var inspector = el(InspectorControls, {},
                // Header
                el(PanelBody, { title: __('Product Header', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, {
                        label: __('Show product header', 'blockenberg'), checked: a.showHeader, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showHeader: v }); }
                    }),
                    a.showHeader && el(TextControl, {
                        label: __('Product name', 'blockenberg'), value: a.productName, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ productName: v }); }
                    }),
                    a.showHeader && el(TextControl, {
                        label: __('Tagline', 'blockenberg'), value: a.productTagline, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ productTagline: v }); }
                    }),
                    ),

                // Spec Groups
                el(PanelBody, { title: __('Spec Groups', 'blockenberg'), initialOpen: false },
                    a.groups.map(function (group, gIdx) {
                        return el('div', { key: 'g-' + gIdx, style: { marginBottom: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' } },
                            el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc' } },
                                el(TextControl, {
                                    label: '',
                                    value: group.title, __nextHasNoMarginBottom: true,
                                    style: { fontWeight: 700, margin: 0 },
                                    onChange: function (v) { set({ groups: updateGroup(a.groups, gIdx, 'title', v) }); }
                                }),
                                el('div', { style: { display: 'flex', gap: '4px' } },
                                    el(Button, {
                                        isSmall: true, icon: 'plus-alt2',
                                        onClick: function () { set({ groups: addSpec(a.groups, gIdx) }); }
                                    }),
                                    el(Button, {
                                        isSmall: true, isDestructive: true, icon: 'trash',
                                        disabled: a.groups.length <= 1,
                                        onClick: function () { set({ groups: a.groups.filter(function (_, i) { return i !== gIdx; }) }); }
                                    })
                                )
                            ),
                            el('div', { style: { padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '6px' } },
                                group.specs.map(function (spec, sIdx) {
                                    return el('div', { key: 's-' + sIdx, style: { display: 'flex', gap: '6px', alignItems: 'center' } },
                                        el(TextControl, {
                                            label: '', value: spec.key, __nextHasNoMarginBottom: true,
                                            placeholder: __('Key', 'blockenberg'),
                                            onChange: function (v) { set({ groups: updateSpec(a.groups, gIdx, sIdx, 'key', v) }); }
                                        }),
                                        el(TextControl, {
                                            label: '', value: spec.value, __nextHasNoMarginBottom: true,
                                            placeholder: __('Value', 'blockenberg'),
                                            onChange: function (v) { set({ groups: updateSpec(a.groups, gIdx, sIdx, 'value', v) }); }
                                        }),
                                        el(Button, {
                                            isSmall: true, isDestructive: true, icon: 'trash',
                                            disabled: group.specs.length <= 1,
                                            onClick: function () { set({ groups: removeSpec(a.groups, gIdx, sIdx) }); }
                                        })
                                    );
                                })
                            )
                        );
                    }),
                    el(Button, {
                        variant: 'secondary', isSmall: true, icon: 'plus-alt2',
                        onClick: function () {
                            set({ groups: a.groups.concat([{ title: 'New Group', specs: [{ key: 'Spec', value: 'Value', highlight: false }] }]) });
                        }
                    }, __('Add Group', 'blockenberg'))
                ),

                // Display
                el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Layout', 'blockenberg'), value: a.layout, options: layoutOptions, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ layout: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Style', 'blockenberg'), value: a.style, options: styleOptions, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ style: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show group titles', 'blockenberg'), checked: a.showGroupTitles, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showGroupTitles: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Highlight starred rows', 'blockenberg'), checked: a.showHighlight, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showHighlight: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border radius', 'blockenberg'), value: a.borderRadius, min: 0, max: 24, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ borderRadius: v }); }
                    })
                ),

                // Typography
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    TC && el(TC, { label: __('Product Header', 'blockenberg'), typo: a.headerTypo || {}, onChange: function (v) { set({ headerTypo: v }); } }),
                    TC && el(TC, { label: __('Group Title', 'blockenberg'), typo: a.groupTitleTypo || {}, onChange: function (v) { set({ groupTitleTypo: v }); } }),
                    TC && el(TC, { label: __('Row Text', 'blockenberg'), typo: a.rowTypo || {}, onChange: function (v) { set({ rowTypo: v }); } })
                ),

                // Colors
                el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                    el(PanelColorSettings, {
                        title: __('Table Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: a.bgColor,        label: __('Background', 'blockenberg'),      onChange: function (c) { set({ bgColor:        c }); } },
                            { value: a.borderColor,    label: __('Borders', 'blockenberg'),         onChange: function (c) { set({ borderColor:    c }); } },
                            { value: a.keyColor,       label: __('Key text', 'blockenberg'),        onChange: function (c) { set({ keyColor:       c }); } },
                            { value: a.valueColor,     label: __('Value text', 'blockenberg'),      onChange: function (c) { set({ valueColor:     c }); } },
                            { value: a.stripeBg,       label: __('Stripe row bg', 'blockenberg'),   onChange: function (c) { set({ stripeBg:       c }); } },
                            { value: a.accentColor,    label: __('Accent', 'blockenberg'),          onChange: function (c) { set({ accentColor:    c }); } }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: __('Header & Group Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: a.headerBg,        label: __('Header background', 'blockenberg'), onChange: function (c) { set({ headerBg:        c }); } },
                            { value: a.headerColor,     label: __('Header text', 'blockenberg'),        onChange: function (c) { set({ headerColor:     c }); } },
                            { value: a.groupTitleBg,    label: __('Group title bg', 'blockenberg'),     onChange: function (c) { set({ groupTitleBg:    c }); } },
                            { value: a.groupTitleColor, label: __('Group title text', 'blockenberg'),   onChange: function (c) { set({ groupTitleColor: c }); } }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: __('Highlight Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: a.highlightBg,    label: __('Highlight background', 'blockenberg'), onChange: function (c) { set({ highlightBg:    c }); } },
                            { value: a.highlightColor, label: __('Highlight text', 'blockenberg'),       onChange: function (c) { set({ highlightColor: c }); } }
                        ]
                    })
                )
            );

            // ── Preview ──────────────────────────────────────────────
            var isCards = a.layout === 'cards';
            var isCompact = a.layout === 'compact';

            var tablePreview = el('div', {
                style: {
                    border: '1px solid ' + a.borderColor,
                    borderRadius: a.borderRadius + 'px',
                    overflow: 'hidden'
                }
            },
                a.showHeader && el('div', {
                    style: {
                        background: a.headerBg,
                        padding: '20px 24px',
                        color: a.headerColor
                    }
                },
                    el('div', { className: 'bkbg-ps-product-name', style: { color: a.headerColor } }, a.productName),
                    a.productTagline && el('div', { style: { fontSize: '14px', opacity: 0.75, marginTop: '4px' } }, a.productTagline)
                ),

                isCards
                    ? el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '16px' } },
                        a.groups.map(function (group, gIdx) {
                            return el('div', { key: 'gc-' + gIdx, style: { border: '1px solid ' + a.borderColor, borderRadius: '8px', overflow: 'hidden' } },
                                a.showGroupTitles && el('div', {
                                    className: 'bkbg-ps-group-title',
                                    style: { background: a.groupTitleBg, padding: '8px 14px', color: a.groupTitleColor, borderBottom: '1px solid ' + a.borderColor }
                                }, group.title),
                                el('div', { style: { padding: '0' } },
                                    group.specs.map(function (spec, sIdx) {
                                        var isHighlighted = a.showHighlight && spec.highlight;
                                        var isStripe = a.style === 'striped' && sIdx % 2 === 1;
                                        return el('div', {
                                            key: 'sc-' + sIdx,
                                            style: {
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                padding: '8px 14px',
                                                background: isHighlighted ? a.highlightBg : isStripe ? a.stripeBg : a.bgColor,
                                                borderBottom: '1px solid ' + a.borderColor
                                            }
                                        },
                                            el('span', { className: 'bkbg-ps-key', style: { color: isHighlighted ? a.highlightColor : a.keyColor } }, spec.key),
                                            el('span', { className: 'bkbg-ps-value', style: { color: isHighlighted ? a.highlightColor : a.valueColor, textAlign: 'right', maxWidth: '55%' } }, spec.value)
                                        );
                                    })
                                )
                            );
                        })
                    )
                    : el('table', { style: { width: '100%', borderCollapse: 'collapse' } },
                        a.groups.map(function (group, gIdx) {
                            return el(Fragment, { key: 'gf-' + gIdx },
                                a.showGroupTitles && el('tr', {},
                                    el('td', {
                                        className: 'bkbg-ps-group-title',
                                        colSpan: isCompact ? 4 : 2,
                                        style: {
                                            background: a.groupTitleBg, padding: '8px 16px',
                                            color: a.groupTitleColor,
                                            borderBottom: '1px solid ' + a.borderColor
                                        }
                                    }, group.title)
                                ),
                                group.specs.map(function (spec, sIdx) {
                                    var isHighlighted = a.showHighlight && spec.highlight;
                                    var isStripe = a.style === 'striped' && sIdx % 2 === 1;
                                    return el('tr', { key: 'sr-' + sIdx },
                                        el('td', {
                                            className: 'bkbg-ps-key',
                                            style: {
                                                padding: '10px 16px',
                                                color: isHighlighted ? a.highlightColor : a.keyColor,
                                                background: isHighlighted ? a.highlightBg : isStripe ? a.stripeBg : a.bgColor,
                                                borderBottom: '1px solid ' + a.borderColor
                                            }
                                        }, spec.key),
                                        el('td', {
                                            className: 'bkbg-ps-value',
                                            style: {
                                                padding: '10px 16px',
                                                color: isHighlighted ? a.highlightColor : a.valueColor,
                                                background: isHighlighted ? a.highlightBg : isStripe ? a.stripeBg : a.bgColor,
                                                borderBottom: '1px solid ' + a.borderColor
                                            }
                                        }, spec.value)
                                    );
                                })
                            );
                        })
                    )
            );

            var blockProps = useBlockProps((function () {
                var fn = getTypoCssVars();
                var s = {};
                if (fn) {
                    Object.assign(s, fn(a.headerTypo || {}, '--bkbg-pspec-hd-'));
                    Object.assign(s, fn(a.groupTitleTypo || {}, '--bkbg-pspec-gt-'));
                    Object.assign(s, fn(a.rowTypo || {}, '--bkbg-pspec-rw-'));
                }
                return { className: 'bkbg-editor-wrap', 'data-block-label': 'Product Spec Sheet', style: s };
            })());

            return el('div', blockProps, inspector, tablePreview);
        },

        save: function (props) {
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', {
                    className: 'bkbg-product-spec-app',
                    'data-opts': JSON.stringify(props.attributes)
                })
            );
        }
    });
}() );

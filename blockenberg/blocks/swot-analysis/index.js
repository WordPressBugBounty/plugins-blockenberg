( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
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
    var TextareaControl = wp.components.TextareaControl;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var QUADRANT_COLOR_KEYS = ['strengthsColor', 'weaknessesColor', 'opportunitiesColor', 'threatsColor'];
    var QUADRANT_IDS = ['strengths', 'weaknesses', 'opportunities', 'threats'];

    function getColor(a, idx) {
        return a[QUADRANT_COLOR_KEYS[idx]] || '#3b82f6';
    }

    function updateQuadrant(quadrants, idx, field, val) {
        return quadrants.map(function (q, i) {
            if (i !== idx) return q;
            var updated = {}; updated[field] = val;
            return Object.assign({}, q, updated);
        });
    }

    function updateItem(quadrants, qIdx, itemIdx, val) {
        return quadrants.map(function (q, i) {
            if (i !== qIdx) return q;
            var newItems = q.items.map(function (it, j) { return j === itemIdx ? val : it; });
            return Object.assign({}, q, { items: newItems });
        });
    }

    function addItem(quadrants, qIdx) {
        return quadrants.map(function (q, i) {
            if (i !== qIdx) return q;
            return Object.assign({}, q, { items: q.items.concat(['New item']) });
        });
    }

    function removeItem(quadrants, qIdx, itemIdx) {
        return quadrants.map(function (q, i) {
            if (i !== qIdx) return q;
            return Object.assign({}, q, { items: q.items.filter(function (_, j) { return j !== itemIdx; }) });
        });
    }

    function hexToRgba(hex, alpha) {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
    }

    function getBullet(listStyle, idx) {
        if (listStyle === 'number') return (idx + 1) + '.';
        if (listStyle === 'check') return '✓';
        if (listStyle === 'dash') return '—';
        return '•';
    }

    registerBlockType('blockenberg/swot-analysis', {
        title: __('SWOT Analysis', 'blockenberg'),
        icon: 'grid-view',
        category: 'bkbg-business',
        description: __('2×2 SWOT matrix with per-quadrant item lists, colors, and icons.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;
            var q = a.quadrants;

            var listStyleOptions = [
                { label: __('Bullet •', 'blockenberg'), value: 'bullet' },
                { label: __('Number 1.', 'blockenberg'), value: 'number' },
                { label: __('Check ✓', 'blockenberg'), value: 'check' },
                { label: __('Dash —', 'blockenberg'), value: 'dash' },
                { label: __('None', 'blockenberg'), value: 'none' }
            ];

            var fontWeightOptions = [
                { label: '400', value: 400 }, { label: '500', value: 500 },
                { label: '600', value: 600 }, { label: '700', value: 700 }, { label: '800', value: 800 }
            ];

            // Inspector
            var inspector = el(InspectorControls, {},
                // Title
                el(PanelBody, { title: __('Title', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, {
                        label: __('Show block title', 'blockenberg'),
                        checked: a.showTitle, __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showTitle: v }); }
                    }),
                    a.showTitle && el(TextControl, {
                        label: __('Title text', 'blockenberg'),
                        value: a.blockTitle, __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ blockTitle: v }); }
                    }),
                    ),

                // Quadrant Labels
                el(PanelBody, { title: __('Quadrant Labels', 'blockenberg'), initialOpen: false },
                    q.map(function (quad, i) {
                        return el('div', { key: 'label-' + i, style: { marginBottom: '12px' } },
                            el(TextControl, {
                                label: __('Q' + (i + 1) + ' label', 'blockenberg'),
                                value: quad.label, __nextHasNoMarginBottom: true,
                                onChange: function (v) { setAttributes({ quadrants: updateQuadrant(q, i, 'label', v) }); }
                            }),
                            a.showIcons && el(TextControl, {
                                label: __('Icon / Emoji', 'blockenberg'),
                                value: quad.icon, __nextHasNoMarginBottom: true,
                                onChange: function (v) { setAttributes({ quadrants: updateQuadrant(q, i, 'icon', v) }); }
                            })
                        );
                    })
                ),

                // Display
                el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show icons / emojis', 'blockenberg'),
                        checked: a.showIcons, __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showIcons: v }); }
                    }),
                    el(SelectControl, {
                        label: __('List style', 'blockenberg'),
                        value: a.listStyle, options: listStyleOptions, __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ listStyle: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Enable shadow', 'blockenberg'),
                        checked: a.enableShadow, __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ enableShadow: v }); }
                    })
                ),

                // Spacing
                el(PanelBody, { title: __('Spacing & Shape', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Border radius', 'blockenberg'),
                        value: a.borderRadius, min: 0, max: 32, __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ borderRadius: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Gap between quadrants', 'blockenberg'),
                        value: a.gap, min: 0, max: 40, __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ gap: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Header padding (vertical)', 'blockenberg'),
                        value: a.headerPaddingV, min: 8, max: 40, __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ headerPaddingV: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Header padding (horizontal)', 'blockenberg'),
                        value: a.headerPaddingH, min: 8, max: 48, __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ headerPaddingH: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Body padding (vertical)', 'blockenberg'),
                        value: a.bodyPaddingV, min: 8, max: 40, __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ bodyPaddingV: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Body padding (horizontal)', 'blockenberg'),
                        value: a.bodyPaddingH, min: 8, max: 48, __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ bodyPaddingH: v }); }
                    })
                ),

                // Typography
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl()({ label: __('Title', 'blockenberg'), value: a.titleTypo, onChange: function (v) { setAttributes({ titleTypo: v }); } }),
                    getTypoControl()({ label: __('Header Label', 'blockenberg'), value: a.headerTypo, onChange: function (v) { setAttributes({ headerTypo: v }); } }),
                    getTypoControl()({ label: __('Item Text', 'blockenberg'), value: a.itemTypo, onChange: function (v) { setAttributes({ itemTypo: v }); } })
                ),

                // Colors
                el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                    el(PanelColorSettings, {
                        title: __('Quadrant Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: a.strengthsColor, label: __('Strengths', 'blockenberg'), onChange: function (c) { setAttributes({ strengthsColor: c }); } },
                            { value: a.weaknessesColor, label: __('Weaknesses', 'blockenberg'), onChange: function (c) { setAttributes({ weaknessesColor: c }); } },
                            { value: a.opportunitiesColor, label: __('Opportunities', 'blockenberg'), onChange: function (c) { setAttributes({ opportunitiesColor: c }); } },
                            { value: a.threatsColor, label: __('Threats', 'blockenberg'), onChange: function (c) { setAttributes({ threatsColor: c }); } }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: __('General Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: a.bgColor, label: __('Card background', 'blockenberg'), onChange: function (c) { setAttributes({ bgColor: c }); } },
                            { value: a.borderColor, label: __('Border', 'blockenberg'), onChange: function (c) { setAttributes({ borderColor: c }); } },
                            { value: a.titleColor, label: __('Block title', 'blockenberg'), onChange: function (c) { setAttributes({ titleColor: c }); } },
                            { value: a.textColor, label: __('Item text', 'blockenberg'), onChange: function (c) { setAttributes({ textColor: c }); } },
                            { value: a.headerTextColor, label: __('Header text', 'blockenberg'), onChange: function (c) { setAttributes({ headerTextColor: c }); } }
                        ]
                    })
                )
            );

            // Render a single quadrant for the editor
            function renderQuadrant(quad, i) {
                var color = getColor(a, i);
                var headerBg = color;
                var bodyBg = hexToRgba(color, 0.06);
                var borderCol = hexToRgba(color, 0.3);

                return el('div', {
                    key: 'q-' + i,
                    className: 'bkbg-swot-quadrant',
                    style: {
                        background: a.bgColor,
                        border: '1px solid ' + borderCol,
                        borderRadius: a.borderRadius + 'px',
                        overflow: 'hidden',
                        boxShadow: a.enableShadow ? '0 2px 12px rgba(0,0,0,0.07)' : 'none'
                    }
                },
                    // Header
                    el('div', {
                        className: 'bkbg-swot-header',
                        style: {
                            background: headerBg,
                            padding: a.headerPaddingV + 'px ' + a.headerPaddingH + 'px',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }
                    },
                        a.showIcons && el('span', { style: { fontSize: '20px', lineHeight: 1 } }, quad.icon),
                        el('input', {
                            type: 'text',
                            value: quad.label,
                            className: 'bkbg-swot-label',
                            style: {
                                background: 'transparent', border: 'none', outline: 'none',
                                color: a.headerTextColor,
                                flex: '1', cursor: 'text'
                            },
                            onChange: function (e) { setAttributes({ quadrants: updateQuadrant(q, i, 'label', e.target.value) }); }
                        })
                    ),
                    // Items
                    el('div', {
                        className: 'bkbg-swot-body',
                        style: {
                            background: bodyBg,
                            padding: a.bodyPaddingV + 'px ' + a.bodyPaddingH + 'px',
                            minHeight: '80px'
                        }
                    },
                        quad.items.map(function (item, itemIdx) {
                            return el('div', {
                                key: 'item-' + itemIdx,
                                style: { display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }
                            },
                                a.listStyle !== 'none' && el('span', {
                                    className: 'bkbg-swot-bullet',
                                    style: {
                                        color: color, fontWeight: 700,
                                        flexShrink: 0, minWidth: '16px', paddingTop: '1px'
                                    }
                                }, getBullet(a.listStyle, itemIdx)),
                                el('input', {
                                    type: 'text',
                                    value: item,
                                    className: 'bkbg-swot-item-text',
                                    style: {
                                        flex: 1, border: 'none', outline: 'none', background: 'transparent',
                                        color: a.textColor, width: '100%'
                                    },
                                    onChange: function (e) {
                                        setAttributes({ quadrants: updateItem(q, i, itemIdx, e.target.value) });
                                    }
                                }),
                                el('button', {
                                    onClick: function () { setAttributes({ quadrants: removeItem(q, i, itemIdx) }); },
                                    style: {
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: '#94a3b8', fontSize: '14px', padding: '0 2px', lineHeight: 1,
                                        flexShrink: 0
                                    },
                                    title: __('Remove item', 'blockenberg')
                                }, '✕')
                            );
                        }),
                        el('button', {
                            onClick: function () { setAttributes({ quadrants: addItem(q, i) }); },
                            style: {
                                background: 'none', border: '1px dashed ' + borderCol, borderRadius: '6px',
                                cursor: 'pointer', color: color, fontSize: '12px', padding: '4px 10px',
                                marginTop: '6px', width: '100%', textAlign: 'center', fontWeight: 600
                            }
                        }, '+ ' + __('Add item', 'blockenberg'))
                    )
                );
            }

            var blockProps = useBlockProps((function () {
                var _tvf = getTypoCssVars();
                var s = {};
                if (_tvf) {
                    Object.assign(s, _tvf(a.titleTypo, '--bkswa-tt-'));
                    Object.assign(s, _tvf(a.headerTypo, '--bkswa-ht-'));
                    Object.assign(s, _tvf(a.itemTypo, '--bkswa-it-'));
                }
                return { className: 'bkbg-swot-block', 'data-block-label': 'SWOT Analysis', style: s };
            })());

            return el('div', blockProps,
                inspector,
                a.showTitle && el('h3', {
                    className: 'bkbg-swot-title',
                    style: {
                        textAlign: 'center', color: a.titleColor,
                        margin: '0 0 20px'
                    }
                }, a.blockTitle),
                el('div', {
                    className: 'bkbg-swot-grid',
                    style: {
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: a.gap + 'px'
                    }
                },
                    q.map(function (quad, i) { return renderQuadrant(quad, i); })
                )
            );
        },

        save: function (props) {
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', {
                    className: 'bkbg-swot-analysis-app',
                    'data-opts': JSON.stringify(props.attributes)
                })
            );
        }
    });
}() );

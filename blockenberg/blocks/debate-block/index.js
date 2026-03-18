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
    var TextareaControl = wp.components.TextareaControl;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;

    function hexToRgba(hex, alpha) {
        if (!hex || hex.length < 7) return 'rgba(180,180,180,' + alpha + ')';
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
    }

    var _dbTC, _dbTV;
    function _tc() { return _dbTC || (_dbTC = window.bkbgTypographyControl); }
    function _tv(t, p) { return (_dbTV || (_dbTV = window.bkbgTypoCssVars)) ? _dbTV(t, p) : {}; }

    function renderSideEditor(a, set, side) {
        var isLeft = side === 'left';
        var label    = isLeft ? a.leftLabel    : a.rightLabel;
        var icon     = isLeft ? a.leftIcon     : a.rightIcon;
        var points   = isLeft ? a.leftPoints   : a.rightPoints;
        var color    = isLeft ? a.leftColor    : a.rightColor;
        var bg       = isLeft ? a.leftBg       : a.rightBg;
        var labelKey = isLeft ? 'leftLabel'    : 'rightLabel';
        var iconKey  = isLeft ? 'leftIcon'     : 'rightIcon';
        var ptsKey   = isLeft ? 'leftPoints'   : 'rightPoints';

        var headerBg = color;
        var bodyBg   = hexToRgba(color, 0.07);
        var borderCol= hexToRgba(color, 0.35);

        var cardStyle = {
            overflow: 'hidden',
            border: '1px solid ' + borderCol,
            borderRadius: a.borderRadius + 'px',
            flexShrink: '0',
            flex: '1',
            minWidth: '0',
            boxShadow: a.style === 'card' ? '0 2px 12px rgba(0,0,0,.07)' : 'none',
            background: a.style === 'minimal' ? 'transparent' : bg
        };

        function updatePoint(idx, val) {
            var newPts = points.map(function (p, i) { return i === idx ? val : p; });
            var u = {}; u[ptsKey] = newPts;
            set(u);
        }

        function removePoint(idx) {
            var newPts = points.filter(function (_, i) { return i !== idx; });
            var u = {}; u[ptsKey] = newPts;
            set(u);
        }

        function addPoint() {
            var u = {}; u[ptsKey] = points.concat(['New argument point']);
            set(u);
        }

        return el('div', { key: 'side-' + side, style: cardStyle },
            // Header
            el('div', {
                style: {
                    background: headerBg,
                    padding: '14px ' + a.gap + 'px',
                    display: 'flex', alignItems: 'center', gap: '10px'
                }
            },
                a.showIcons && el('span', { style: { fontSize: '22px' } }, icon),
                el('input', {
                    type: 'text', value: label,
                    className: 'bkbg-db-side-label',
                    style: {
                        background: 'transparent', border: 'none', outline: 'none',
                        color: a.headerTextColor, flex: '1'
                    },
                    onChange: function (e) { var u = {}; u[labelKey] = e.target.value; set(u); }
                })
            ),
            // Points list
            el('div', { style: { padding: '16px ' + a.gap + 'px' } },
                points.map(function (point, idx) {
                    return el('div', {
                        key: 'pt-' + idx,
                        style: {
                            display: 'flex', alignItems: 'flex-start', gap: '8px',
                            marginBottom: '10px'
                        }
                    },
                        a.showBullets && el('span', {
                            style: {
                                color: color, fontWeight: 800, fontSize: '18px',
                                lineHeight: '1', flexShrink: 0, paddingTop: '1px'
                            }
                        }, isLeft ? '✓' : '✗'),
                        el('input', {
                            type: 'text',
                            value: point,
                            className: 'bkbg-db-point-text',
                            style: {
                                flex: '1', border: 'none', outline: 'none',
                                background: 'transparent',
                                color: a.textColor, fontFamily: 'inherit'
                            },
                            onChange: function (e) { updatePoint(idx, e.target.value); }
                        }),
                        el('button', {
                            onClick: function () { removePoint(idx); },
                            title: __('Remove', 'blockenberg'),
                            style: {
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: '#94a3b8', fontSize: '13px', padding: '0 2px',
                                flexShrink: 0
                            }
                        }, '✕')
                    );
                }),
                el('button', {
                    onClick: addPoint,
                    style: {
                        background: 'none', border: '1px dashed ' + borderCol,
                        borderRadius: '6px', cursor: 'pointer', color: color,
                        fontSize: '12px', padding: '5px 12px', width: '100%',
                        textAlign: 'center', fontWeight: 600, marginTop: '4px'
                    }
                }, '+ ' + __('Add point', 'blockenberg'))
            )
        );
    }

    registerBlockType('blockenberg/debate-block', {
        title: __('Debate Block', 'blockenberg'),
        icon: 'editor-justify',
        category: 'bkbg-content',
        description: __('Two-column argument block: Pro vs Con, Side A vs Side B, and more.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;

            var styleOptions = [
                { label: __('Card (shadow)', 'blockenberg'), value: 'card' },
                { label: __('Bordered', 'blockenberg'), value: 'bordered' },
                { label: __('Minimal', 'blockenberg'), value: 'minimal' }
            ];
            var layoutOptions = [
                { label: __('Two columns', 'blockenberg'), value: 'columns' },
                { label: __('Stacked', 'blockenberg'), value: 'stacked' }
            ];
            var fontWeightOptions = [
                { label: '400', value: 400 }, { label: '600', value: 600 }, { label: '700', value: 700 }
            ];

            var inspector = el(InspectorControls, {},
                // Title
                el(PanelBody, { title: __('Title', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, {
                        label: __('Show title', 'blockenberg'), checked: a.showTitle, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showTitle: v }); }
                    }),
                    a.showTitle && el(TextControl, {
                        label: __('Title', 'blockenberg'), value: a.blockTitle, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ blockTitle: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show subtitle', 'blockenberg'), checked: a.showSubtitle, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showSubtitle: v }); }
                    }),
                    a.showSubtitle && el(TextControl, {
                        label: __('Subtitle', 'blockenberg'), value: a.blockSubtitle, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ blockSubtitle: v }); }
                    })
                ),

                // Side Labels
                el(PanelBody, { title: __('Side Labels & Icons', 'blockenberg'), initialOpen: false },
                    el(TextControl, {
                        label: __('Left side icon', 'blockenberg'), value: a.leftIcon, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ leftIcon: v }); }
                    }),
                    el(TextControl, {
                        label: __('Left side label', 'blockenberg'), value: a.leftLabel, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ leftLabel: v }); }
                    }),
                    el(TextControl, {
                        label: __('Right side icon', 'blockenberg'), value: a.rightIcon, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ rightIcon: v }); }
                    }),
                    el(TextControl, {
                        label: __('Right side label', 'blockenberg'), value: a.rightLabel, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ rightLabel: v }); }
                    })
                ),

                // Verdict
                el(PanelBody, { title: __('Verdict', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show verdict', 'blockenberg'), checked: a.showVerdict, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showVerdict: v }); }
                    }),
                    a.showVerdict && el(TextControl, {
                        label: __('Verdict label', 'blockenberg'), value: a.verdictLabel, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ verdictLabel: v }); }
                    }),
                    a.showVerdict && el(TextareaControl, {
                        label: __('Verdict text', 'blockenberg'), value: a.verdict, rows: 4, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ verdict: v }); }
                    })
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
                        label: __('Show icons', 'blockenberg'), checked: a.showIcons, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showIcons: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show ✓/✗ bullets', 'blockenberg'), checked: a.showBullets, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showBullets: v }); }
                    })
                ),

                // Spacing & Shape
                el(PanelBody, { title: __('Spacing & Shape', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Border radius', 'blockenberg'), value: a.borderRadius, min: 0, max: 32, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ borderRadius: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Gap / padding', 'blockenberg'), value: a.gap, min: 8, max: 48, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ gap: v }); }
                    }),
                    ),

                // Colors
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    _tc() && _tc()({ label: __('Title typography', 'blockenberg'), value: a.typoTitle || {}, onChange: function (v) { set({ typoTitle: v }); } }),
                    _tc() && _tc()({ label: __('Subtitle typography', 'blockenberg'), value: a.typoSubtitle || {}, onChange: function (v) { set({ typoSubtitle: v }); } }),
                    _tc() && _tc()({ label: __('Header typography', 'blockenberg'), value: a.typoHeader || {}, onChange: function (v) { set({ typoHeader: v }); } }),
                    _tc() && _tc()({ label: __('Point typography', 'blockenberg'), value: a.typoPoint || {}, onChange: function (v) { set({ typoPoint: v }); } })
                ),
el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                    el(PanelColorSettings, {
                        title: __('Side Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: a.leftColor,  label: __('Left header', 'blockenberg'),  onChange: function (c) { set({ leftColor:  c }); } },
                            { value: a.leftBg,     label: __('Left body bg', 'blockenberg'), onChange: function (c) { set({ leftBg:     c }); } },
                            { value: a.rightColor, label: __('Right header', 'blockenberg'), onChange: function (c) { set({ rightColor: c }); } },
                            { value: a.rightBg,    label: __('Right body bg', 'blockenberg'),onChange: function (c) { set({ rightBg:    c }); } }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: __('General', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: a.bgColor,         label: __('Block background', 'blockenberg'),  onChange: function (c) { set({ bgColor:         c }); } },
                            { value: a.textColor,       label: __('Text', 'blockenberg'),              onChange: function (c) { set({ textColor:       c }); } },
                            { value: a.headerTextColor, label: __('Header text', 'blockenberg'),       onChange: function (c) { set({ headerTextColor: c }); } },
                            { value: a.titleColor,      label: __('Title', 'blockenberg'),             onChange: function (c) { set({ titleColor:      c }); } },
                            { value: a.subtitleColor,   label: __('Subtitle', 'blockenberg'),          onChange: function (c) { set({ subtitleColor:   c }); } }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: __('Verdict', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: a.verdictBg,          label: __('Verdict background', 'blockenberg'), onChange: function (c) { set({ verdictBg:          c }); } },
                            { value: a.verdictColor,       label: __('Verdict text', 'blockenberg'),       onChange: function (c) { set({ verdictColor:       c }); } },
                            { value: a.verdictBorderColor, label: __('Verdict border', 'blockenberg'),     onChange: function (c) { set({ verdictBorderColor: c }); } }
                        ]
                    })
                )
            );

            var isColumns = a.layout === 'columns';
            var blockProps = useBlockProps({ className: 'bkbg-editor-wrap', 'data-block-label': 'Debate Block',
                style: Object.assign(
                    { '--bkbg-db-ttl-fs': (a.blockTitleFontSize || 22) + 'px',
                      '--bkbg-db-sub-fs': (a.blockSubtitleFontSize || 14) + 'px',
                      '--bkbg-db-hdr-fs': (a.headerFontSize || 18) + 'px',
                      '--bkbg-db-pt-fs': (a.fontSize || 14) + 'px' },
                    _tv(a.typoTitle||{}, '--bkbg-db-ttl-'),
                    _tv(a.typoSubtitle||{}, '--bkbg-db-sub-'),
                    _tv(a.typoHeader||{}, '--bkbg-db-hdr-'),
                    _tv(a.typoPoint||{}, '--bkbg-db-pt-')
                )
            });

            return el('div', blockProps,
                inspector,
                el('div', { className: 'bkbg-db-block', style: { background: a.bgColor, borderRadius: a.borderRadius + 'px', overflow: 'hidden' } },
                    // Title area
                    (a.showTitle || a.showSubtitle) && el('div', { style: { textAlign: 'center', padding: '28px ' + a.gap + 'px ' + (a.gap) + 'px', borderBottom: '1px solid #f1f5f9' } },
                        a.showTitle && el('h3', {
                            className: 'bkbg-db-title',
                            style: { margin: 0, color: a.titleColor }
                        }, a.blockTitle),
                        a.showSubtitle && el('p', {
                            className: 'bkbg-db-subtitle',
                            style: { margin: '8px 0 0', color: a.subtitleColor }
                        }, a.blockSubtitle)
                    ),

                    // Sides
                    el('div', {
                        style: {
                            display: isColumns ? 'flex' : 'block',
                            gap: isColumns ? '0' : '0',
                            flexWrap: 'wrap'
                        }
                    },
                        renderSideEditor(a, set, 'left'),
                        // VS divider
                        isColumns && el('div', {
                            style: {
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: '48px', flexShrink: 0, background: '#f1f5f9',
                                color: '#64748b', fontWeight: 900, fontSize: '13px',
                                letterSpacing: '.05em'
                            }
                        }, 'VS'),
                        renderSideEditor(a, set, 'right')
                    ),

                    // Verdict
                    a.showVerdict && el('div', {
                        style: {
                            margin: a.gap + 'px',
                            background: a.verdictBg,
                            border: '1px solid ' + a.verdictBorderColor,
                            borderRadius: a.borderRadius + 'px',
                            padding: '16px ' + (a.gap) + 'px'
                        }
                    },
                        el('div', {
                            style: { fontWeight: 700, color: a.verdictColor, marginBottom: '8px', fontSize: '15px' }
                        }, a.verdictLabel),
                        el('div', { className: 'bkbg-db-verdict-text', style: { color: a.verdictColor, lineHeight: '1.65' } }, a.verdict)
                    )
                )
            );
        },

        save: function (props) {
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', {
                    className: 'bkbg-debate-block-app',
                    'data-opts': JSON.stringify(props.attributes)
                })
            );
        }
    });
}() );

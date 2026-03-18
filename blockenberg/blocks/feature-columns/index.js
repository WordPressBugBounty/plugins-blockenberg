( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    var _fcTC, _fcTV;
    function _tc() { return _fcTC || (_fcTC = window.bkbgTypographyControl); }
    function _tv() { return _fcTV || (_fcTV = window.bkbgTypoCssVars); }

    var styleOptions = [
        { label: __('Plain', 'blockenberg'), value: 'plain' },
        { label: __('Card', 'blockenberg'), value: 'card' },
        { label: __('Bordered', 'blockenberg'), value: 'bordered' },
        { label: __('Filled Card', 'blockenberg'), value: 'filled' },
        { label: __('Numbered', 'blockenberg'), value: 'numbered' }
    ];

    var iconStyleOptions = [
        { label: __('Box', 'blockenberg'), value: 'box' },
        { label: __('Circle', 'blockenberg'), value: 'circle' },
        { label: __('Line / Underline', 'blockenberg'), value: 'line' },
        { label: __('None / Inline', 'blockenberg'), value: 'none' }
    ];

    var alignOptions = [
        { label: __('Left', 'blockenberg'), value: 'left' },
        { label: __('Center', 'blockenberg'), value: 'center' }
    ];

    var columnOptions = [
        { label: '2', value: 2 },
        { label: '3', value: 3 },
        { label: '4', value: 4 }
    ];

    // Dashicons available for features
    var featureIcons = [
        'performance', 'shield', 'admin-customizer', 'heart', 'networking',
        'chart-line', 'chart-bar', 'star-filled', 'thumbs-up', 'smiley',
        'admin-users', 'groups', 'clipboard', 'update', 'cloud',
        'email-alt', 'megaphone', 'flag', 'info', 'yes-alt',
        'category', 'tag', 'edit', 'trash', 'visibility',
        'lock', 'unlock', 'rss', 'share', 'search',
        'format-image', 'format-video', 'format-audio', 'media-document', 'code-standards'
    ];

    registerBlockType('blockenberg/feature-columns', {
        title: __('Feature Columns', 'blockenberg'),
        icon: 'columns',
        category: 'bkbg-marketing',
        description: __('Responsive 2–4 column feature grid with icon, title, and description.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;
            var openState = useState(null);
            var openIndex = openState[0];
            var setOpenIndex = openState[1];

            function wrapStyle(a) {
                return Object.assign({
                    '--bkbg-fc-cols': a.columns,
                    '--bkbg-fc-gap': a.gap + 'px',
                    '--bkbg-fc-row-gap': a.rowGap + 'px',
                    '--bkbg-fc-icon-c': a.iconColor,
                    '--bkbg-fc-icon-bg': a.iconBg,
                    '--bkbg-fc-icon-sz': a.iconSize + 'px',
                    '--bkbg-fc-num-sz': a.numberSize + 'px',
                    '--bkbg-fc-num-c': a.numberColor,
                    '--bkbg-fc-title-c': a.titleColor,
                    '--bkbg-fc-body-c': a.bodyColor,
                    '--bkbg-fc-accent': a.accentColor,
                    '--bkbg-fc-card-bg': a.cardBg,
                    '--bkbg-fc-card-border': a.cardBorder,
                    '--bkbg-fc-card-p': a.cardPadding + 'px',
                    '--bkbg-fc-card-r': a.cardRadius + 'px',
                    '--bkbg-fc-pt': a.paddingTop + 'px',
                    '--bkbg-fc-pb': a.paddingBottom + 'px'
                }, _tv()(a.typoTitle, '--bkbg-fc-tt-'), _tv()(a.typoBody, '--bkbg-fc-bd-'));
            }

            function updateFeature(index, key, value) {
                var updated = a.features.slice();
                updated[index] = Object.assign({}, updated[index]);
                updated[index][key] = value;
                setAttributes({ features: updated });
            }

            function addFeature() {
                var icons = featureIcons;
                var newIcon = icons[a.features.length % icons.length];
                setAttributes({
                    features: a.features.concat([{
                        id: 'f' + Date.now(),
                        icon: newIcon,
                        title: __('Feature Title', 'blockenberg'),
                        body: __('Describe this feature in one or two short sentences.', 'blockenberg')
                    }])
                });
            }

            function removeFeature(index) {
                setAttributes({ features: a.features.filter(function (_, i) { return i !== index; }) });
            }

            function moveFeature(index, dir) {
                var newIndex = index + dir;
                if (newIndex < 0 || newIndex >= a.features.length) return;
                var updated = a.features.slice();
                var tmp = updated[index]; updated[index] = updated[newIndex]; updated[newIndex] = tmp;
                setAttributes({ features: updated });
            }

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Features', 'blockenberg'), initialOpen: true },
                    a.features.map(function (feat, index) {
                        var isOpen = openIndex === index;
                        return el('div', { key: feat.id, className: 'bkbg-fc-feat-ctrl' },
                            el('div', { className: 'bkbg-fc-feat-head', onClick: function () { setOpenIndex(isOpen ? null : index); } },
                                el('span', { className: 'dashicons dashicons-' + feat.icon, style: { color: a.iconColor } }),
                                el('strong', {}, feat.title || __('Feature', 'blockenberg') + ' ' + (index + 1)),
                                el('span', { className: 'dashicons dashicons-' + (isOpen ? 'arrow-up-alt2' : 'arrow-down-alt2') })
                            ),
                            isOpen && el('div', { className: 'bkbg-fc-feat-body' },
                                el(SelectControl, {
                                    label: __('Icon', 'blockenberg'),
                                    value: feat.icon,
                                    options: featureIcons.map(function (ic) { return { label: ic, value: ic }; }),
                                    onChange: function (v) { updateFeature(index, 'icon', v); }
                                }),
                                el(TextControl, {
                                    label: __('Title', 'blockenberg'),
                                    value: feat.title,
                                    onChange: function (v) { updateFeature(index, 'title', v); }
                                }),
                                el('div', { className: 'bkbg-fc-feat-actions' },
                                    el(Button, { icon: 'arrow-up-alt2', size: 'small', disabled: index === 0, onClick: function () { moveFeature(index, -1); } }),
                                    el(Button, { icon: 'arrow-down-alt2', size: 'small', disabled: index === a.features.length - 1, onClick: function () { moveFeature(index, 1); } }),
                                    el(Button, { icon: 'trash', size: 'small', isDestructive: true, onClick: function () { removeFeature(index); } })
                                )
                            )
                        );
                    }),
                    el(Button, { variant: 'secondary', onClick: addFeature }, __('+ Add Feature', 'blockenberg'))
                ),

                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Columns', 'blockenberg'),
                        value: a.columns,
                        options: columnOptions,
                        onChange: function (v) { setAttributes({ columns: parseInt(v, 10) }); }
                    }),
                    el(SelectControl, {
                        label: __('Visual Style', 'blockenberg'),
                        value: a.style,
                        options: styleOptions,
                        onChange: function (v) { setAttributes({ style: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Icon Style', 'blockenberg'),
                        value: a.iconStyle,
                        options: iconStyleOptions,
                        onChange: function (v) { setAttributes({ iconStyle: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Text Alignment', 'blockenberg'),
                        value: a.align,
                        options: alignOptions,
                        onChange: function (v) { setAttributes({ align: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Icon', 'blockenberg'),
                        checked: a.showIcon,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showIcon: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Step Numbers', 'blockenberg'),
                        checked: a.showNumber,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showNumber: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Column Gap (px)', 'blockenberg'),
                        value: a.gap,
                        onChange: function (v) { setAttributes({ gap: v }); },
                        min: 8, max: 80
                    }),
                    el(RangeControl, {
                        label: __('Row Gap (px)', 'blockenberg'),
                        value: a.rowGap,
                        onChange: function (v) { setAttributes({ rowGap: v }); },
                        min: 8, max: 80
                    }),
                    el(RangeControl, {
                        label: __('Card Padding (px)', 'blockenberg'),
                        value: a.cardPadding,
                        onChange: function (v) { setAttributes({ cardPadding: v }); },
                        min: 0, max: 60
                    }),
                    el(RangeControl, {
                        label: __('Card Radius (px)', 'blockenberg'),
                        value: a.cardRadius,
                        onChange: function (v) { setAttributes({ cardRadius: v }); },
                        min: 0, max: 32
                    }),
                    el(RangeControl, {
                        label: __('Padding Top (px)', 'blockenberg'),
                        value: a.paddingTop,
                        onChange: function (v) { setAttributes({ paddingTop: v }); },
                        min: 0, max: 120
                    }),
                    el(RangeControl, {
                        label: __('Padding Bottom (px)', 'blockenberg'),
                        value: a.paddingBottom,
                        onChange: function (v) { setAttributes({ paddingBottom: v }); },
                        min: 0, max: 120
                    })
                ),

                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    _tc() && el(_tc(), {
                        label: __('Title Typography', 'blockenberg'),
                        value: a.typoTitle,
                        onChange: function (v) { setAttributes({ typoTitle: v }); }
                    }),
                    _tc() && el(_tc(), {
                        label: __('Body Typography', 'blockenberg'),
                        value: a.typoBody,
                        onChange: function (v) { setAttributes({ typoBody: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Icon Size (px)', 'blockenberg'),
                        value: a.iconSize,
                        onChange: function (v) { setAttributes({ iconSize: v }); },
                        min: 14, max: 56
                    }),
                    el(RangeControl, {
                        label: __('Number Size (px)', 'blockenberg'),
                        value: a.numberSize,
                        onChange: function (v) { setAttributes({ numberSize: v }); },
                        min: 20, max: 72
                    })
                ),

                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.iconColor, onChange: function (v) { setAttributes({ iconColor: v || '#6c3fb5' }); }, label: __('Icon Color', 'blockenberg') },
                        { value: a.iconBg, onChange: function (v) { setAttributes({ iconBg: v || '#f0ebff' }); }, label: __('Icon Background', 'blockenberg') },
                        { value: a.titleColor, onChange: function (v) { setAttributes({ titleColor: v || '#0f172a' }); }, label: __('Title Color', 'blockenberg') },
                        { value: a.bodyColor, onChange: function (v) { setAttributes({ bodyColor: v || '#64748b' }); }, label: __('Body Color', 'blockenberg') },
                        { value: a.numberColor, onChange: function (v) { setAttributes({ numberColor: v || '#6c3fb5' }); }, label: __('Number Color', 'blockenberg') },
                        { value: a.accentColor, onChange: function (v) { setAttributes({ accentColor: v || '#6c3fb5' }); }, label: __('Accent Color', 'blockenberg') },
                        { value: a.cardBg, onChange: function (v) { setAttributes({ cardBg: v || '#ffffff' }); }, label: __('Card Background', 'blockenberg') },
                        { value: a.cardBorder, onChange: function (v) { setAttributes({ cardBorder: v || '#e2e8f0' }); }, label: __('Card Border', 'blockenberg') }
                    ]
                })
            );

            function renderFeature(feat, index) {
                var iconEl = null;
                if (a.showNumber) {
                    iconEl = el('div', { className: 'bkbg-fc-number bkbg-fc-icon-style--' + a.iconStyle }, index + 1);
                } else if (a.showIcon) {
                    iconEl = el('div', { className: 'bkbg-fc-icon-wrap bkbg-fc-icon-style--' + a.iconStyle },
                        el('span', { className: 'bkbg-fc-icon dashicons dashicons-' + feat.icon })
                    );
                }
                return el('div', { key: feat.id, className: 'bkbg-fc-feature' },
                    iconEl,
                    el('div', { className: 'bkbg-fc-text' },
                        el(RichText, {
                            tagName: 'h3',
                            className: 'bkbg-fc-title',
                            value: feat.title,
                            onChange: function (v) { updateFeature(index, 'title', v); },
                            placeholder: __('Feature Title', 'blockenberg')
                        }),
                        el(RichText, {
                            tagName: 'p',
                            className: 'bkbg-fc-body',
                            value: feat.body,
                            onChange: function (v) { updateFeature(index, 'body', v); },
                            placeholder: __('Feature description…', 'blockenberg')
                        })
                    )
                );
            }

            var wrapClass = 'bkbg-fc-wrap bkbg-fc-style--' + a.style + ' bkbg-fc-align--' + a.align;
            var blockProps = useBlockProps({ className: wrapClass, style: wrapStyle(a) });

            return el(Fragment, {},
                inspector,
                el('div', blockProps,
                    el('div', { className: 'bkbg-fc-grid' },
                        a.features.map(function (feat, index) { return renderFeature(feat, index); })
                    ),
                    el('div', { className: 'bkbg-editor-actions' },
                        el(Button, { variant: 'secondary', icon: 'plus-alt2', onClick: addFeature }, __('Add Feature', 'blockenberg'))
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;

            function wrapStyle(a) {
                return Object.assign({
                    '--bkbg-fc-cols': a.columns,
                    '--bkbg-fc-gap': a.gap + 'px',
                    '--bkbg-fc-row-gap': a.rowGap + 'px',
                    '--bkbg-fc-icon-c': a.iconColor,
                    '--bkbg-fc-icon-bg': a.iconBg,
                    '--bkbg-fc-icon-sz': a.iconSize + 'px',
                    '--bkbg-fc-num-sz': a.numberSize + 'px',
                    '--bkbg-fc-num-c': a.numberColor,
                    '--bkbg-fc-title-c': a.titleColor,
                    '--bkbg-fc-body-c': a.bodyColor,
                    '--bkbg-fc-accent': a.accentColor,
                    '--bkbg-fc-card-bg': a.cardBg,
                    '--bkbg-fc-card-border': a.cardBorder,
                    '--bkbg-fc-card-p': a.cardPadding + 'px',
                    '--bkbg-fc-card-r': a.cardRadius + 'px',
                    '--bkbg-fc-pt': a.paddingTop + 'px',
                    '--bkbg-fc-pb': a.paddingBottom + 'px'
                }, _tv()(a.typoTitle, '--bkbg-fc-tt-'), _tv()(a.typoBody, '--bkbg-fc-bd-'));
            }

            var wrapClass = 'bkbg-fc-wrap bkbg-fc-style--' + a.style + ' bkbg-fc-align--' + a.align;
            var blockProps = wp.blockEditor.useBlockProps.save({ className: wrapClass, style: wrapStyle(a) });

            return el('div', blockProps,
                el('div', { className: 'bkbg-fc-grid' },
                    a.features.map(function (feat, index) {
                        var iconEl = null;
                        if (a.showNumber) {
                            iconEl = el('div', { className: 'bkbg-fc-number bkbg-fc-icon-style--' + a.iconStyle }, index + 1);
                        } else if (a.showIcon) {
                            iconEl = el('div', { className: 'bkbg-fc-icon-wrap bkbg-fc-icon-style--' + a.iconStyle },
                                el('span', { className: 'bkbg-fc-icon dashicons dashicons-' + feat.icon })
                            );
                        }
                        return el('div', { key: feat.id, className: 'bkbg-fc-feature' },
                            iconEl,
                            el('div', { className: 'bkbg-fc-text' },
                                el(RichText.Content, { tagName: 'h3', className: 'bkbg-fc-title', value: feat.title }),
                                el(RichText.Content, { tagName: 'p', className: 'bkbg-fc-body', value: feat.body })
                            )
                        );
                    })
                )
            );
        }
    });
}() );

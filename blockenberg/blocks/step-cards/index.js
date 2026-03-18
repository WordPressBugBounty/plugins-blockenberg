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

    var layoutOptions = [
        { label: __('Horizontal (Row)', 'blockenberg'), value: 'horizontal' },
        { label: __('Grid', 'blockenberg'), value: 'grid' },
        { label: __('Vertical Stack', 'blockenberg'), value: 'vertical' }
    ];

    var cardStyleOptions = [
        { label: __('Card (shadow)', 'blockenberg'), value: 'card' },
        { label: __('Bordered', 'blockenberg'), value: 'bordered' },
        { label: __('Flat', 'blockenberg'), value: 'flat' },
        { label: __('Ghost', 'blockenberg'), value: 'ghost' }
    ];

    var numberStyleOptions = [
        { label: __('Circle (filled)', 'blockenberg'), value: 'circle' },
        { label: __('Circle (outlined)', 'blockenberg'), value: 'circle-outline' },
        { label: __('Square', 'blockenberg'), value: 'square' },
        { label: __('Large Background', 'blockenberg'), value: 'large-bg' }
    ];

    var stepIcons = [
        'edit', 'admin-customizer', 'update', 'chart-line', 'shield', 'star-filled',
        'admin-users', 'email-alt', 'performance', 'cloud', 'networking', 'yes-alt',
        'admin-links', 'clipboard', 'migrate', 'info', 'flag', 'heart', 'cart', 'search'
    ];

    var columnOptions = [
        { label: '2', value: 2 },
        { label: '3', value: 3 },
        { label: '4', value: 4 }
    ];

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    registerBlockType('blockenberg/step-cards', {
        title: __('Step Cards', 'blockenberg'),
        icon: 'list-ul',
        category: 'bkbg-business',
        description: __('Process steps as cards with sequential numbers, icons, and connector lines.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;
            var openState = useState(null);
            var openIndex = openState[0];
            var setOpenIndex = openState[1];

            function wrapStyle(a) {
                var _tvf = getTypoCssVars();
                var s = {
                    '--bkbg-sc-cols': a.columns,
                    '--bkbg-sc-gap': a.gap + 'px',
                    '--bkbg-sc-num-bg': a.numberBg,
                    '--bkbg-sc-num-c': a.numberColor,
                    '--bkbg-sc-num-sz': a.numberSize + 'px',
                    '--bkbg-sc-icon-c': a.iconColor,
                    '--bkbg-sc-icon-sz': a.iconSize + 'px',
                    '--bkbg-sc-title-c': a.titleColor,
                    '--bkbg-sc-title-sz': a.titleSize + 'px',
                    '--bkbg-sc-title-w': a.titleWeight,
                    '--bkbg-sc-title-lh': a.titleLineHeight,
                    '--bkbg-sc-body-c': a.bodyColor,
                    '--bkbg-sc-body-sz': a.bodySize + 'px',
                    '--bkbg-sc-body-lh': a.bodyLineHeight,
                    '--bkbg-sc-card-bg': a.cardBg,
                    '--bkbg-sc-card-border': a.cardBorder,
                    '--bkbg-sc-card-p': a.cardPadding + 'px',
                    '--bkbg-sc-card-r': a.cardRadius + 'px',
                    '--bkbg-sc-connector': a.connectorColor,
                    '--bkbg-sc-accent': a.accentColor,
                    '--bkbg-sc-pt': a.paddingTop + 'px',
                    '--bkbg-sc-pb': a.paddingBottom + 'px'
                };
                Object.assign(s, _tvf(a.titleTypo, '--bkbg-sc-tt-'));
                Object.assign(s, _tvf(a.bodyTypo, '--bkbg-sc-bd-'));
                return s;
            }

            function updateStep(index, key, value) {
                var updated = a.steps.slice();
                updated[index] = Object.assign({}, updated[index]);
                updated[index][key] = value;
                setAttributes({ steps: updated });
            }

            function addStep() {
                var icons = stepIcons;
                var newIcon = icons[a.steps.length % icons.length];
                setAttributes({
                    steps: a.steps.concat([{
                        id: 's' + Date.now(),
                        icon: newIcon,
                        title: __('Step Title', 'blockenberg'),
                        body: __('Describe what happens at this step.', 'blockenberg')
                    }])
                });
            }

            function removeStep(index) {
                setAttributes({ steps: a.steps.filter(function (_, i) { return i !== index; }) });
            }

            function moveStep(index, dir) {
                var newIndex = index + dir;
                if (newIndex < 0 || newIndex >= a.steps.length) return;
                var updated = a.steps.slice();
                var tmp = updated[index]; updated[index] = updated[newIndex]; updated[newIndex] = tmp;
                setAttributes({ steps: updated });
            }

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Steps', 'blockenberg'), initialOpen: true },
                    a.steps.map(function (step, index) {
                        var isOpen = openIndex === index;
                        return el('div', { key: step.id, className: 'bkbg-sc-step-ctrl' },
                            el('div', { className: 'bkbg-sc-step-head', onClick: function () { setOpenIndex(isOpen ? null : index); } },
                                el('span', { className: 'bkbg-sc-step-num' }, index + 1),
                                el('strong', {}, step.title || __('Step', 'blockenberg') + ' ' + (index + 1)),
                                el('span', { className: 'dashicons dashicons-' + (isOpen ? 'arrow-up-alt2' : 'arrow-down-alt2') })
                            ),
                            isOpen && el('div', { className: 'bkbg-sc-step-body' },
                                el(SelectControl, {
                                    label: __('Icon', 'blockenberg'),
                                    value: step.icon,
                                    options: stepIcons.map(function (ic) { return { label: ic, value: ic }; }),
                                    onChange: function (v) { updateStep(index, 'icon', v); }
                                }),
                                el(TextControl, {
                                    label: __('Title', 'blockenberg'),
                                    value: step.title,
                                    onChange: function (v) { updateStep(index, 'title', v); }
                                }),
                                el('div', { className: 'bkbg-sc-step-actions' },
                                    el(Button, { icon: 'arrow-up-alt2', size: 'small', disabled: index === 0, onClick: function () { moveStep(index, -1); } }),
                                    el(Button, { icon: 'arrow-down-alt2', size: 'small', disabled: index === a.steps.length - 1, onClick: function () { moveStep(index, 1); } }),
                                    el(Button, { icon: 'trash', size: 'small', isDestructive: true, onClick: function () { removeStep(index); } })
                                )
                            )
                        );
                    }),
                    el(Button, { variant: 'secondary', onClick: addStep }, __('+ Add Step', 'blockenberg'))
                ),

                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Layout', 'blockenberg'),
                        value: a.layout,
                        options: layoutOptions,
                        onChange: function (v) { setAttributes({ layout: v }); }
                    }),
                    (a.layout === 'horizontal' || a.layout === 'grid') && el(SelectControl, {
                        label: __('Columns', 'blockenberg'),
                        value: a.columns,
                        options: columnOptions,
                        onChange: function (v) { setAttributes({ columns: parseInt(v, 10) }); }
                    }),
                    el(SelectControl, {
                        label: __('Card Style', 'blockenberg'),
                        value: a.cardStyle,
                        options: cardStyleOptions,
                        onChange: function (v) { setAttributes({ cardStyle: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Number Style', 'blockenberg'),
                        value: a.numberStyle,
                        options: numberStyleOptions,
                        onChange: function (v) { setAttributes({ numberStyle: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Connector Line', 'blockenberg'),
                        checked: a.showConnector,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showConnector: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Icon', 'blockenberg'),
                        checked: a.showIcon,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ showIcon: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Gap (px)', 'blockenberg'),
                        value: a.gap,
                        onChange: function (v) { setAttributes({ gap: v }); },
                        min: 8, max: 80
                    }),
                    el(RangeControl, {
                        label: __('Card Padding (px)', 'blockenberg'),
                        value: a.cardPadding,
                        onChange: function (v) { setAttributes({ cardPadding: v }); },
                        min: 12, max: 60
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
                    el(RangeControl, {
                        label: __('Number Size (px)', 'blockenberg'),
                        value: a.numberSize,
                        onChange: function (v) { setAttributes({ numberSize: v }); },
                        min: 20, max: 80
                    }),
                    el(RangeControl, {
                        label: __('Icon Size (px)', 'blockenberg'),
                        value: a.iconSize,
                        onChange: function (v) { setAttributes({ iconSize: v }); },
                        min: 14, max: 48
                    }),
                    getTypoControl() && getTypoControl()({ label: __('Title', 'blockenberg'), value: a.titleTypo, onChange: function (v) { setAttributes({ titleTypo: v }); } }),
                    getTypoControl() && getTypoControl()({ label: __('Body', 'blockenberg'), value: a.bodyTypo, onChange: function (v) { setAttributes({ bodyTypo: v }); } })
                ),

                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.numberBg, onChange: function (v) { setAttributes({ numberBg: v || '#6c3fb5' }); }, label: __('Number Background', 'blockenberg') },
                        { value: a.numberColor, onChange: function (v) { setAttributes({ numberColor: v || '#ffffff' }); }, label: __('Number Color', 'blockenberg') },
                        { value: a.iconColor, onChange: function (v) { setAttributes({ iconColor: v || '#6c3fb5' }); }, label: __('Icon Color', 'blockenberg') },
                        { value: a.titleColor, onChange: function (v) { setAttributes({ titleColor: v || '#0f172a' }); }, label: __('Title Color', 'blockenberg') },
                        { value: a.bodyColor, onChange: function (v) { setAttributes({ bodyColor: v || '#64748b' }); }, label: __('Body Color', 'blockenberg') },
                        { value: a.cardBg, onChange: function (v) { setAttributes({ cardBg: v || '#ffffff' }); }, label: __('Card Background', 'blockenberg') },
                        { value: a.cardBorder, onChange: function (v) { setAttributes({ cardBorder: v || '#e2e8f0' }); }, label: __('Card Border', 'blockenberg') },
                        { value: a.connectorColor, onChange: function (v) { setAttributes({ connectorColor: v || '#e2e8f0' }); }, label: __('Connector Color', 'blockenberg') },
                        { value: a.accentColor, onChange: function (v) { setAttributes({ accentColor: v || '#6c3fb5' }); }, label: __('Accent Color', 'blockenberg') }
                    ]
                })
            );

            function renderStep(step, index) {
                var isLast = index === a.steps.length - 1;

                var numberEl = el('div', { className: 'bkbg-sc-num bkbg-sc-num--' + a.numberStyle },
                    a.showIcon
                        ? el('span', { className: 'bkbg-sc-num-icon dashicons dashicons-' + step.icon })
                        : el('span', { className: 'bkbg-sc-num-digit' }, index + 1)
                );

                var connectorEl = (a.showConnector && !isLast && a.layout !== 'vertical')
                    ? el('div', { className: 'bkbg-sc-connector' })
                    : null;

                return el('div', { key: step.id, className: 'bkbg-sc-step bkbg-sc-card-style--' + a.cardStyle },
                    el('div', { className: 'bkbg-sc-step-header' },
                        numberEl,
                        connectorEl
                    ),
                    el('div', { className: 'bkbg-sc-step-content' },
                        el(RichText, {
                            tagName: 'h3',
                            className: 'bkbg-sc-title',
                            value: step.title,
                            onChange: function (v) { updateStep(index, 'title', v); },
                            placeholder: __('Step Title', 'blockenberg')
                        }),
                        el(RichText, {
                            tagName: 'p',
                            className: 'bkbg-sc-body',
                            value: step.body,
                            onChange: function (v) { updateStep(index, 'body', v); },
                            placeholder: __('Step description…', 'blockenberg')
                        })
                    )
                );
            }

            var wrapClass = 'bkbg-sc-wrap bkbg-sc-layout--' + a.layout;
            var blockProps = useBlockProps({ className: wrapClass, style: wrapStyle(a) });

            return el(Fragment, {},
                inspector,
                el('div', blockProps,
                    el('div', { className: 'bkbg-sc-steps' },
                        a.steps.map(function (step, index) { return renderStep(step, index); })
                    ),
                    el('div', { className: 'bkbg-editor-actions' },
                        el(Button, { variant: 'secondary', icon: 'plus-alt2', onClick: addStep }, __('Add Step', 'blockenberg'))
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;

            function wrapStyle(a) {
                var _tvf = getTypoCssVars();
                var s = {
                    '--bkbg-sc-cols': a.columns,
                    '--bkbg-sc-gap': a.gap + 'px',
                    '--bkbg-sc-num-bg': a.numberBg,
                    '--bkbg-sc-num-c': a.numberColor,
                    '--bkbg-sc-num-sz': a.numberSize + 'px',
                    '--bkbg-sc-icon-c': a.iconColor,
                    '--bkbg-sc-icon-sz': a.iconSize + 'px',
                    '--bkbg-sc-title-c': a.titleColor,
                    '--bkbg-sc-title-sz': a.titleSize + 'px',
                    '--bkbg-sc-title-w': a.titleWeight,
                    '--bkbg-sc-title-lh': a.titleLineHeight,
                    '--bkbg-sc-body-c': a.bodyColor,
                    '--bkbg-sc-body-sz': a.bodySize + 'px',
                    '--bkbg-sc-body-lh': a.bodyLineHeight,
                    '--bkbg-sc-card-bg': a.cardBg,
                    '--bkbg-sc-card-border': a.cardBorder,
                    '--bkbg-sc-card-p': a.cardPadding + 'px',
                    '--bkbg-sc-card-r': a.cardRadius + 'px',
                    '--bkbg-sc-connector': a.connectorColor,
                    '--bkbg-sc-accent': a.accentColor,
                    '--bkbg-sc-pt': a.paddingTop + 'px',
                    '--bkbg-sc-pb': a.paddingBottom + 'px'
                };
                Object.assign(s, _tvf(a.titleTypo, '--bkbg-sc-tt-'));
                Object.assign(s, _tvf(a.bodyTypo, '--bkbg-sc-bd-'));
                return s;
            }

            var wrapClass = 'bkbg-sc-wrap bkbg-sc-layout--' + a.layout;
            var blockProps = wp.blockEditor.useBlockProps.save({ className: wrapClass, style: wrapStyle(a) });

            return el('div', blockProps,
                el('div', { className: 'bkbg-sc-steps' },
                    a.steps.map(function (step, index) {
                        var isLast = index === a.steps.length - 1;
                        return el('div', { key: step.id, className: 'bkbg-sc-step bkbg-sc-card-style--' + a.cardStyle },
                            el('div', { className: 'bkbg-sc-step-header' },
                                el('div', { className: 'bkbg-sc-num bkbg-sc-num--' + a.numberStyle },
                                    a.showIcon
                                        ? el('span', { className: 'bkbg-sc-num-icon dashicons dashicons-' + step.icon })
                                        : el('span', { className: 'bkbg-sc-num-digit' }, index + 1)
                                ),
                                (a.showConnector && !isLast && a.layout !== 'vertical')
                                    ? el('div', { className: 'bkbg-sc-connector' })
                                    : null
                            ),
                            el('div', { className: 'bkbg-sc-step-content' },
                                el(RichText.Content, { tagName: 'h3', className: 'bkbg-sc-title', value: step.title }),
                                el(RichText.Content, { tagName: 'p', className: 'bkbg-sc-body', value: step.body })
                            )
                        );
                    })
                )
            );
        }
    });
}() );

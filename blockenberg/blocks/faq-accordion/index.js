( function () {
    var el = wp.element.createElement;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText = wp.blockEditor.RichText;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var ToggleControl = wp.components.ToggleControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;
    var TextareaControl = wp.components.TextareaControl;

    var _faTC, _faTV;
    function _tc() { return _faTC || (_faTC = window.bkbgTypographyControl); }
    function _tv(t, p) { return (_faTV || (_faTV = window.bkbgTypoCssVars)) ? _faTV(t, p) : {}; }

    function wrapStyle(a) {
        return Object.assign({
            '--bkbg-fa-bg': a.bgColor,
            '--bkbg-fa-heading-c': a.headingColor,
            '--bkbg-fa-sub-c': a.subColor,
            '--bkbg-fa-q-c': a.questionColor,
            '--bkbg-fa-a-c': a.answerColor,
            '--bkbg-fa-accent': a.accentColor,
            '--bkbg-fa-border': a.borderColor,
            '--bkbg-fa-card-bg': a.cardBg,
            '--bkbg-fa-icon-c': a.iconColor,
            '--bkbg-fa-pt': a.paddingTop + 'px',
            '--bkbg-fa-pb': a.paddingBottom + 'px',
            '--bkbg-fa-q-pad': a.questionPadding + 'px',
            '--bkbg-fa-radius': a.cardRadius + 'px',
            '--bkbg-fa-icon-sz': a.iconSize + 'px',
            '--bkbg-fa-sect-gap': a.sectionGap + 'px',
            '--bkbg-fa-item-gap': a.itemGap + 'px',
            '--bkbg-fa-max-w': a.maxWidth + 'px',
        },
            _tv(a.typoHeading || {}, '--bkbg-fa-hd-'),
            _tv(a.typoSubheading || {}, '--bkbg-fa-sh-'),
            _tv(a.typoQuestion || {}, '--bkbg-fa-qt-'),
            _tv(a.typoAnswer || {}, '--bkbg-fa-an-')
        );
    }

    function getIconEl(iconStyle, isOpen) {
        if (iconStyle === 'chevron') {
            return el('span', { className: 'bkbg-fa-icon dashicons ' + (isOpen ? 'dashicons-arrow-up-alt2' : 'dashicons-arrow-down-alt2') });
        }
        if (iconStyle === 'arrow') {
            return el('span', { className: 'bkbg-fa-icon dashicons ' + (isOpen ? 'dashicons-arrow-up' : 'dashicons-arrow-down') });
        }
        // plus/minus
        return el('span', { className: 'bkbg-fa-icon bkbg-fa-plus-icon', style: { fontSize: 'var(--bkbg-fa-icon-sz, 20px)' } }, isOpen ? '−' : '+');
    }

    registerBlockType('blockenberg/faq-accordion', {
        title: __('FAQ Accordion', 'blockenberg'),
        icon: 'editor-help',
        category: 'bkbg-business',

        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;

            var expandedState = useState(0);
            var expanded = expandedState[0];
            var setExpanded = expandedState[1];

            var editingState = useState(null);
            var editing = editingState[0];
            var setEditing = editingState[1];

            var styleOptions = [
                { label: __('Minimal (lines)', 'blockenberg'), value: 'minimal' },
                { label: __('Bordered', 'blockenberg'), value: 'bordered' },
                { label: __('Card', 'blockenberg'), value: 'card' },
                { label: __('Boxed', 'blockenberg'), value: 'boxed' },
                { label: __('Dark', 'blockenberg'), value: 'dark' },
            ];
            var iconStyleOptions = [
                { label: __('Plus / Minus', 'blockenberg'), value: 'plus' },
                { label: __('Chevron (arrow)', 'blockenberg'), value: 'chevron' },
                { label: __('Arrow', 'blockenberg'), value: 'arrow' },
            ];
            var alignOptions = [
                { label: __('Left', 'blockenberg'), value: 'left' },
                { label: __('Center', 'blockenberg'), value: 'center' },
            ];

            function addItem() {
                var ns = a.items.concat([{ question: __('New Question?', 'blockenberg'), answer: __('Your answer here.', 'blockenberg'), defaultOpen: false }]);
                set({ items: ns });
                setEditing(ns.length - 1);
            }
            function removeItem(i) {
                set({ items: a.items.filter(function (_, idx) { return idx !== i; }) });
                if (editing === i) setEditing(null);
            }
            function moveItem(i, dir) {
                var ni = i + dir;
                if (ni < 0 || ni >= a.items.length) return;
                var ns = a.items.slice();
                var tmp = ns[i]; ns[i] = ns[ni]; ns[ni] = tmp;
                set({ items: ns });
            }
            function updateItem(i, key, val) {
                var ns = a.items.slice();
                ns[i] = Object.assign({}, ns[i]);
                ns[i][key] = val;
                set({ items: ns });
            }

            var blockProps = useBlockProps({
                className: 'bkbg-fa-wrap bkbg-fa-style--' + a.style + ' bkbg-fa-heading-align--' + a.headingAlign,
                style: wrapStyle(a)
            });

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Section Header', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, {
                        label: __('Show Heading', 'blockenberg'),
                        checked: a.showHeading,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showHeading: v }); }
                    }),
                    a.showHeading && el(TextControl, {
                        label: __('Heading', 'blockenberg'),
                        value: a.heading,
                        onChange: function (v) { set({ heading: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Subheading', 'blockenberg'),
                        checked: a.showSubheading,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showSubheading: v }); }
                    }),
                    a.showSubheading && el(TextControl, {
                        label: __('Subheading', 'blockenberg'),
                        value: a.subheading,
                        onChange: function (v) { set({ subheading: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Heading Alignment', 'blockenberg'),
                        value: a.headingAlign,
                        options: alignOptions,
                        onChange: function (v) { set({ headingAlign: v }); }
                    })
                ),
                el(PanelBody, { title: __('Style & Behavior', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Accordion Style', 'blockenberg'),
                        value: a.style,
                        options: styleOptions,
                        onChange: function (v) { set({ style: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Icon Style', 'blockenberg'),
                        value: a.iconStyle,
                        options: iconStyleOptions,
                        onChange: function (v) { set({ iconStyle: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Icon', 'blockenberg'),
                        checked: a.showIcon,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showIcon: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Numbers', 'blockenberg'),
                        checked: a.showNumbers,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showNumbers: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Allow Multiple Open', 'blockenberg'),
                        checked: a.allowMultiple,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ allowMultiple: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Add Schema.org Markup', 'blockenberg'),
                        checked: a.addSchema,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ addSchema: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Max Content Width (px)', 'blockenberg'),
                        value: a.maxWidth,
                        onChange: function (v) { set({ maxWidth: v }); },
                        min: 400, max: 1100, step: 20
                    }),
                    el(RangeControl, {
                        label: __('Card Radius (px)', 'blockenberg'),
                        value: a.cardRadius,
                        onChange: function (v) { set({ cardRadius: v }); },
                        min: 0, max: 24
                    }),
                    el(RangeControl, {
                        label: __('Item Gap (px)', 'blockenberg'),
                        value: a.itemGap,
                        onChange: function (v) { set({ itemGap: v }); },
                        min: 0, max: 32
                    }),
                    el(RangeControl, {
                        label: __('Padding Top (px)', 'blockenberg'),
                        value: a.paddingTop,
                        onChange: function (v) { set({ paddingTop: v }); },
                        min: 0, max: 180
                    }),
                    el(RangeControl, {
                        label: __('Padding Bottom (px)', 'blockenberg'),
                        value: a.paddingBottom,
                        onChange: function (v) { set({ paddingBottom: v }); },
                        min: 0, max: 180
                    })
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    _tc() && el(_tc(), { label: 'Heading', typo: a.typoHeading || {}, onChange: function (v) { set({ typoHeading: v }); } }),
                    _tc() && el(_tc(), { label: 'Subheading', typo: a.typoSubheading || {}, onChange: function (v) { set({ typoSubheading: v }); } }),
                    _tc() && el(_tc(), { label: 'Question', typo: a.typoQuestion || {}, onChange: function (v) { set({ typoQuestion: v }); } }),
                    _tc() && el(_tc(), { label: 'Answer', typo: a.typoAnswer || {}, onChange: function (v) { set({ typoAnswer: v }); } }),
                    el(RangeControl, { label: __('Icon Size (px)', 'blockenberg'), value: a.iconSize, onChange: function (v) { set({ iconSize: v }); }, min: 12, max: 32 }),
                    el(RangeControl, { label: __('Section-to-FAQ Gap (px)', 'blockenberg'), value: a.sectionGap, onChange: function (v) { set({ sectionGap: v }); }, min: 16, max: 96 })
                ),
                el(PanelBody, { title: __('FAQ Items', 'blockenberg') + ' (' + a.items.length + ')', initialOpen: false },
                    a.items.map(function (item, i) {
                        var isEditing = editing === i;
                        return el('div', {
                            key: i,
                            className: 'bkbg-fa-item-ctrl' + (isEditing ? ' bkbg-fa-item-ctrl--open' : ''),
                            style: { marginBottom: '8px' }
                        },
                            el('div', {
                                className: 'bkbg-fa-item-head',
                                style: { cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
                                onClick: function () { setEditing(isEditing ? null : i); }
                            },
                                el('span', { style: { fontSize: '13px', fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } },
                                    (i + 1) + '. ' + (item.question || __('(empty)', 'blockenberg'))
                                ),
                                el('span', { style: { color: isEditing ? '#6c3fb5' : '#94a3b8' } }, isEditing ? '▲' : '▼')
                            ),
                            isEditing && el('div', { className: 'bkbg-fa-item-body', style: { marginTop: '10px' } },
                                el(TextControl, {
                                    label: __('Question', 'blockenberg'),
                                    value: item.question,
                                    onChange: function (v) { updateItem(i, 'question', v); }
                                }),
                                el(TextareaControl, {
                                    label: __('Answer', 'blockenberg'),
                                    value: item.answer,
                                    rows: 4,
                                    onChange: function (v) { updateItem(i, 'answer', v); }
                                }),
                                el(ToggleControl, {
                                    label: __('Open by default', 'blockenberg'),
                                    checked: item.defaultOpen,
                                    __nextHasNoMarginBottom: true,
                                    onChange: function (v) { updateItem(i, 'defaultOpen', v); }
                                }),
                                el('div', { style: { display: 'flex', gap: '6px', marginTop: '8px' } },
                                    el(Button, { onClick: function () { moveItem(i, -1); }, variant: 'secondary', isSmall: true, disabled: i === 0 }, '↑'),
                                    el(Button, { onClick: function () { moveItem(i, 1); }, variant: 'secondary', isSmall: true, disabled: i === a.items.length - 1 }, '↓'),
                                    el(Button, { onClick: function () { removeItem(i); }, variant: 'tertiary', isDestructive: true, isSmall: true }, __('Remove', 'blockenberg'))
                                )
                            )
                        );
                    }),
                    el(Button, {
                        onClick: addItem,
                        variant: 'primary',
                        isSmall: true,
                        style: { marginTop: '8px', width: '100%', justifyContent: 'center' }
                    }, __('+ Add Question', 'blockenberg'))
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: a.bgColor, onChange: function (v) { set({ bgColor: v || '#ffffff' }); } },
                        { label: __('Accent Color', 'blockenberg'), value: a.accentColor, onChange: function (v) { set({ accentColor: v || '#6c3fb5' }); } },
                        { label: __('Heading', 'blockenberg'), value: a.headingColor, onChange: function (v) { set({ headingColor: v || '#0f172a' }); } },
                        { label: __('Subheading', 'blockenberg'), value: a.subColor, onChange: function (v) { set({ subColor: v || '#64748b' }); } },
                        { label: __('Question Text', 'blockenberg'), value: a.questionColor, onChange: function (v) { set({ questionColor: v || '#0f172a' }); } },
                        { label: __('Answer Text', 'blockenberg'), value: a.answerColor, onChange: function (v) { set({ answerColor: v || '#475569' }); } },
                        { label: __('Icon', 'blockenberg'), value: a.iconColor, onChange: function (v) { set({ iconColor: v || '#6c3fb5' }); } },
                        { label: __('Border', 'blockenberg'), value: a.borderColor, onChange: function (v) { set({ borderColor: v || '#e2e8f0' }); } },
                        { label: __('Card Background', 'blockenberg'), value: a.cardBg, onChange: function (v) { set({ cardBg: v || '#ffffff' }); } },
                    ]
                })
            );

            // Canvas accordion
            var canvas = el('div', blockProps,
                (a.showHeading || a.showSubheading) && el('div', { className: 'bkbg-fa-header' },
                    a.showHeading && el('h2', { className: 'bkbg-fa-heading' }, a.heading),
                    a.showSubheading && el('p', { className: 'bkbg-fa-sub' }, a.subheading)
                ),
                el('div', { className: 'bkbg-fa-list' },
                    a.items.map(function (item, i) {
                        var isOpen = expanded === i;
                        return el('div', {
                            key: i,
                            className: 'bkbg-fa-item' + (isOpen ? ' bkbg-fa-item--open' : ''),
                            onClick: function () { setExpanded(isOpen ? null : i); }
                        },
                            el('div', { className: 'bkbg-fa-question' },
                                a.showNumbers && el('span', { className: 'bkbg-fa-num' }, ('0' + (i + 1)).slice(-2)),
                                el('span', { className: 'bkbg-fa-question-text' }, item.question),
                                a.showIcon && getIconEl(a.iconStyle, isOpen)
                            ),
                            isOpen && el('div', { className: 'bkbg-fa-answer' },
                                el('p', {}, item.answer)
                            )
                        );
                    })
                )
            );

            return el('div', {}, inspector, canvas);
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = useBlockProps.save({
                className: 'bkbg-fa-wrap bkbg-fa-style--' + a.style + ' bkbg-fa-heading-align--' + a.headingAlign,
                style: wrapStyle(a),
                'data-allow-multiple': a.allowMultiple ? '1' : '0'
            });

            var schemaItems = a.addSchema ? JSON.stringify(a.items.map(function (item) {
                return { '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } };
            })) : null;

            return el('div', blockProps,
                a.addSchema && el('script', {
                    type: 'application/ld+json',
                    dangerouslySetInnerHTML: {
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'FAQPage',
                            mainEntity: a.items.map(function (item) {
                                return { '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } };
                            })
                        })
                    }
                }),
                (a.showHeading || a.showSubheading) && el('div', { className: 'bkbg-fa-header' },
                    a.showHeading && el('h2', { className: 'bkbg-fa-heading' }, a.heading),
                    a.showSubheading && el('p', { className: 'bkbg-fa-sub' }, a.subheading)
                ),
                el('div', { className: 'bkbg-fa-list' },
                    a.items.map(function (item, i) {
                        return el('div', {
                            key: i,
                            className: 'bkbg-fa-item' + (item.defaultOpen ? ' bkbg-fa-item--open' : ''),
                            'data-faq-item': '1'
                        },
                            el('button', { className: 'bkbg-fa-question', 'aria-expanded': item.defaultOpen ? 'true' : 'false' },
                                a.showNumbers && el('span', { className: 'bkbg-fa-num' }, ('0' + (i + 1)).slice(-2)),
                                el('span', { className: 'bkbg-fa-question-text' }, item.question),
                                a.showIcon && el('span', { className: 'bkbg-fa-icon', 'aria-hidden': 'true' })
                            ),
                            el('div', { className: 'bkbg-fa-answer', hidden: !item.defaultOpen },
                                el('p', {}, item.answer)
                            )
                        );
                    })
                )
            );
        }
    });
}() );

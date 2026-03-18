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
    var Button = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;

    var _fqsTC, _fqsTV;
    function _tc() { return _fqsTC || (_fqsTC = window.bkbgTypographyControl); }
    function _tv(o, p) { if (!_fqsTV) _fqsTV = window.bkbgTypoCssVars; return _fqsTV ? _fqsTV(o, p) : {}; }
    function _tvStr(o, p) { var obj = _tv(o, p); return Object.keys(obj).map(function (k) { return k + ':' + obj[k]; }); }

    // SVG icons
    var icons = {
        chevron: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
        plus: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
        arrow: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>'
    };

    function getIconEl(type) {
        var svg = icons[type] || icons.chevron;
        return el('span', {
            className: 'bkbg-faq-icon',
            'aria-hidden': 'true',
            dangerouslySetInnerHTML: { __html: svg }
        });
    }

    var layoutOptions = [
        { label: __('Default (Separated)', 'blockenberg'), value: 'default' },
        { label: __('Boxed', 'blockenberg'), value: 'boxed' },
        { label: __('Minimal', 'blockenberg'), value: 'minimal' },
        { label: __('Bordered Left', 'blockenberg'), value: 'bordered-left' }
    ];

    var iconTypeOptions = [
        { label: __('Chevron', 'blockenberg'), value: 'chevron' },
        { label: __('Plus / Minus', 'blockenberg'), value: 'plus' },
        { label: __('Arrow', 'blockenberg'), value: 'arrow' },
        { label: __('None', 'blockenberg'), value: 'none' }
    ];

    var iconPositionOptions = [
        { label: __('Right', 'blockenberg'), value: 'right' },
        { label: __('Left', 'blockenberg'), value: 'left' }
    ];

    var fontWeightOptions = [
        { label: '300', value: 300 },
        { label: '400', value: 400 },
        { label: '500', value: 500 },
        { label: '600', value: 600 },
        { label: '700', value: 700 },
        { label: '800', value: 800 }
    ];

    registerBlockType('blockenberg/faq-schema', {
        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var a = attributes;

            var activeItems = a.activeItems || [0];

            function setActiveItems(newActive) {
                setAttributes({ activeItems: newActive });
            }

            function toggleItem(index) {
                var isActive = activeItems.indexOf(index) !== -1;
                var newActive;
                if (isActive) {
                    newActive = activeItems.filter(function (i) { return i !== index; });
                } else {
                    if (a.allowMultiple) {
                        newActive = activeItems.concat([index]);
                    } else {
                        newActive = [index];
                    }
                }
                setActiveItems(newActive);
            }

            function updateItem(index, field, value) {
                var newItems = a.items.map(function (item, i) {
                    if (i !== index) return item;
                    var updated = {};
                    for (var k in item) { updated[k] = item[k]; }
                    updated[field] = value;
                    return updated;
                });
                setAttributes({ items: newItems });
            }

            function addItem() {
                setAttributes({
                    items: a.items.concat([{ question: __('New Question', 'blockenberg'), answer: __('Answer goes here...', 'blockenberg') }])
                });
                setActiveItems(activeItems.concat([a.items.length]));
            }

            function removeItem(index) {
                if (a.items.length <= 1) return;
                setAttributes({ items: a.items.filter(function (_, i) { return i !== index; }) });
                setActiveItems(activeItems.filter(function (i) { return i !== index; }).map(function (i) { return i > index ? i - 1 : i; }));
            }

            function moveItem(index, dir) {
                var newIndex = index + dir;
                if (newIndex < 0 || newIndex >= a.items.length) return;
                var newItems = a.items.slice();
                var tmp = newItems[index];
                newItems[index] = newItems[newIndex];
                newItems[newIndex] = tmp;
                setAttributes({ items: newItems });
            }

            var wrapStyle = Object.assign({
                '--bkbg-faq-spacing': a.spacing + 'px',
                '--bkbg-faq-radius': a.borderRadius + 'px',
                '--bkbg-faq-q-padding': a.questionPadding + 'px',
                '--bkbg-faq-a-padding': a.answerPadding + 'px',
                '--bkbg-faq-speed': a.animationSpeed + 'ms',
                '--bkbg-faq-q-color': a.questionColor,
                '--bkbg-faq-q-bg': a.questionBg,
                '--bkbg-faq-q-hover-bg': a.questionHoverBg,
                '--bkbg-faq-q-active-bg': a.activeQuestionBg,
                '--bkbg-faq-q-active-color': a.activeQuestionColor,
                '--bkbg-faq-a-color': a.answerColor,
                '--bkbg-faq-a-bg': a.answerBg,
                '--bkbg-faq-icon-color': a.iconColor,
                '--bkbg-faq-icon-active-color': a.iconActiveColor,
                '--bkbg-faq-border-color': a.borderColor,
                '--bkbg-faq-divider-color': a.dividerColor
            },
            _tv(a.typoQuestion, '--bkbg-fqs-qt-'),
            _tv(a.typoAnswer, '--bkbg-fqs-an-'));

            var blockProps = useBlockProps({
                className: 'bkbg-faq-wrap bkbg-faq-editor',
                style: wrapStyle,
                'data-layout': a.layout,
                'data-icon': a.iconType,
                'data-icon-pos': a.iconPosition
            });

            var inspector = el(InspectorControls, {},

                // Items panel
                el(PanelBody, { title: __('FAQ Items', 'blockenberg'), initialOpen: true },
                    el('p', { style: { color: '#6b7280', fontSize: '12px', margin: '0 0 12px' } },
                        __('Click a question to expand/collapse it in the editor.', 'blockenberg')
                    ),
                    el(ToggleControl, {
                        label: __('Allow multiple open', 'blockenberg'),
                        checked: a.allowMultiple,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ allowMultiple: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('First item open by default', 'blockenberg'),
                        checked: a.expandFirst,
                        __nextHasNoMarginBottom: true,
                        onChange: function (v) { setAttributes({ expandFirst: v }); }
                    })
                ),

                // Layout panel
                el(PanelBody, { title: __('Layout & Style', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Layout', 'blockenberg'),
                        value: a.layout,
                        options: layoutOptions,
                        onChange: function (v) { setAttributes({ layout: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Icon Type', 'blockenberg'),
                        value: a.iconType,
                        options: iconTypeOptions,
                        onChange: function (v) { setAttributes({ iconType: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Icon Position', 'blockenberg'),
                        value: a.iconPosition,
                        options: iconPositionOptions,
                        onChange: function (v) { setAttributes({ iconPosition: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Gap Between Items (px)', 'blockenberg'),
                        value: a.spacing,
                        min: 0,
                        max: 40,
                        onChange: function (v) { setAttributes({ spacing: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Radius (px)', 'blockenberg'),
                        value: a.borderRadius,
                        min: 0,
                        max: 24,
                        onChange: function (v) { setAttributes({ borderRadius: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Question Padding (px)', 'blockenberg'),
                        value: a.questionPadding,
                        min: 8,
                        max: 40,
                        onChange: function (v) { setAttributes({ questionPadding: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Answer Padding (px)', 'blockenberg'),
                        value: a.answerPadding,
                        min: 8,
                        max: 40,
                        onChange: function (v) { setAttributes({ answerPadding: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Animation Speed (ms)', 'blockenberg'),
                        value: a.animationSpeed,
                        min: 0,
                        max: 800,
                        step: 50,
                        onChange: function (v) { setAttributes({ animationSpeed: v }); }
                    })
                ),

                // Typography panel
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    _tc() && _tc()({ label: __('Question', 'blockenberg'), typo: a.typoQuestion, onChange: function (v) { setAttributes({ typoQuestion: v }); } }),
                    _tc() && _tc()({ label: __('Answer', 'blockenberg'), typo: a.typoAnswer, onChange: function (v) { setAttributes({ typoAnswer: v }); } })
                ),

                // Colors panel
                el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                    el(PanelColorSettings, {
                        title: __('Question Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { value: a.questionColor, onChange: function (c) { setAttributes({ questionColor: c || '#111827' }); }, label: __('Text', 'blockenberg') },
                            { value: a.questionBg, onChange: function (c) { setAttributes({ questionBg: c || '#ffffff' }); }, label: __('Background', 'blockenberg') },
                            { value: a.questionHoverBg, onChange: function (c) { setAttributes({ questionHoverBg: c || '#f9fafb' }); }, label: __('Background (Hover)', 'blockenberg') },
                            { value: a.activeQuestionColor, onChange: function (c) { setAttributes({ activeQuestionColor: c || '#1d4ed8' }); }, label: __('Text (Active)', 'blockenberg') },
                            { value: a.activeQuestionBg, onChange: function (c) { setAttributes({ activeQuestionBg: c || '#eff6ff' }); }, label: __('Background (Active)', 'blockenberg') }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: __('Answer Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { value: a.answerColor, onChange: function (c) { setAttributes({ answerColor: c || '#374151' }); }, label: __('Text', 'blockenberg') },
                            { value: a.answerBg, onChange: function (c) { setAttributes({ answerBg: c || '#ffffff' }); }, label: __('Background', 'blockenberg') }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: __('Icon & Border Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { value: a.iconColor, onChange: function (c) { setAttributes({ iconColor: c || '#6b7280' }); }, label: __('Icon', 'blockenberg') },
                            { value: a.iconActiveColor, onChange: function (c) { setAttributes({ iconActiveColor: c || '#2563eb' }); }, label: __('Icon (Active)', 'blockenberg') },
                            { value: a.borderColor, onChange: function (c) { setAttributes({ borderColor: c || '#e5e7eb' }); }, label: __('Border', 'blockenberg') },
                            { value: a.dividerColor, onChange: function (c) { setAttributes({ dividerColor: c || '#f3f4f6' }); }, label: __('Divider', 'blockenberg') }
                        ]
                    })
                )
            );

            // Build item list in editor
            var itemsEl = a.items.map(function (item, index) {
                var isActive = activeItems.indexOf(index) !== -1;
                return el('div', {
                    className: 'bkbg-faq-item' + (isActive ? ' is-active' : ''),
                    key: 'faq-' + index
                },
                    el('div', { className: 'bkbg-faq-item-actions' },
                        el(Button, {
                            icon: 'arrow-up-alt2',
                            label: __('Move up', 'blockenberg'),
                            onClick: function () { moveItem(index, -1); },
                            disabled: index === 0,
                            isSmall: true
                        }),
                        el(Button, {
                            icon: 'arrow-down-alt2',
                            label: __('Move down', 'blockenberg'),
                            onClick: function () { moveItem(index, 1); },
                            disabled: index === a.items.length - 1,
                            isSmall: true
                        }),
                        el(Button, {
                            icon: 'trash',
                            label: __('Remove', 'blockenberg'),
                            onClick: function () { removeItem(index); },
                            isDestructive: true,
                            isSmall: true,
                            disabled: a.items.length <= 1
                        })
                    ),
                    el('button', {
                        className: 'bkbg-faq-question',
                        'aria-expanded': isActive ? 'true' : 'false',
                        onClick: function (e) {
                            if (e.target.tagName === 'INPUT') return;
                            toggleItem(index);
                        }
                    },
                        a.iconPosition === 'left' && a.iconType !== 'none' && getIconEl(a.iconType),
                        el('input', {
                            className: 'bkbg-faq-q-input',
                            type: 'text',
                            value: item.question,
                            placeholder: __('Enter question...', 'blockenberg'),
                            onChange: function (e) { updateItem(index, 'question', e.target.value); },
                            onClick: function (e) { e.stopPropagation(); }
                        }),
                        a.iconPosition === 'right' && a.iconType !== 'none' && getIconEl(a.iconType)
                    ),
                    el('div', { className: 'bkbg-faq-answer', 'aria-hidden': isActive ? 'false' : 'true' },
                        el('div', { className: 'bkbg-faq-answer-inner' },
                            el(RichText, {
                                tagName: 'div',
                                className: 'bkbg-faq-answer-body',
                                value: item.answer,
                                onChange: function (val) { updateItem(index, 'answer', val); },
                                placeholder: __('Enter answer...', 'blockenberg')
                            })
                        )
                    )
                );
            });

            return el(Fragment, {},
                inspector,
                el('div', blockProps,
                    el('div', { className: 'bkbg-faq-schema-badge' },
                        el('span', {}, '✓ FAQ Schema (JSON-LD)')
                    ),
                    itemsEl,
                    el('div', { className: 'bkbg-faq-add-wrap' },
                        el(Button, {
                            variant: 'secondary',
                            className: 'bkbg-faq-add-btn',
                            onClick: addItem
                        }, '+ ' + __('Add Question', 'blockenberg'))
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var RichTextContent = wp.blockEditor.RichText.Content;

            // Build JSON-LD
            var schemaItems = a.items.map(function (item) {
                return {
                    '@type': 'Question',
                    'name': item.question,
                    'acceptedAnswer': {
                        '@type': 'Answer',
                        'text': item.answer.replace(/<[^>]+>/g, '')
                    }
                };
            });

            var schema = JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                'mainEntity': schemaItems
            });

            var wrapStyle = [
                '--bkbg-faq-spacing:' + a.spacing + 'px',
                '--bkbg-faq-radius:' + a.borderRadius + 'px',
                '--bkbg-faq-q-padding:' + a.questionPadding + 'px',
                '--bkbg-faq-a-padding:' + a.answerPadding + 'px',
                '--bkbg-faq-speed:' + a.animationSpeed + 'ms',
                '--bkbg-faq-q-color:' + a.questionColor,
                '--bkbg-faq-q-bg:' + a.questionBg,
                '--bkbg-faq-q-hover-bg:' + a.questionHoverBg,
                '--bkbg-faq-q-active-bg:' + a.activeQuestionBg,
                '--bkbg-faq-q-active-color:' + a.activeQuestionColor,
                '--bkbg-faq-a-color:' + a.answerColor,
                '--bkbg-faq-a-bg:' + a.answerBg,
                '--bkbg-faq-icon-color:' + a.iconColor,
                '--bkbg-faq-icon-active-color:' + a.iconActiveColor,
                '--bkbg-faq-border-color:' + a.borderColor,
                '--bkbg-faq-divider-color:' + a.dividerColor
            ].concat(_tvStr(a.typoQuestion, '--bkbg-fqs-qt-'))
             .concat(_tvStr(a.typoAnswer, '--bkbg-fqs-an-')).join(';');

            var blockProps = wp.blockEditor.useBlockProps.save({
                className: 'bkbg-faq-wrap',
                style: wrapStyle,
                'data-layout': a.layout,
                'data-icon': a.iconType,
                'data-icon-pos': a.iconPosition,
                'data-allow-multiple': a.allowMultiple ? '1' : '0',
                'data-expand-first': a.expandFirst ? '1' : '0',
                'data-speed': a.animationSpeed
            });

            var itemsEl = a.items.map(function (item, index) {
                var isFirst = index === 0 && a.expandFirst;
                return el('div', {
                    className: 'bkbg-faq-item' + (isFirst ? ' is-active' : ''),
                    key: 'faq-' + index,
                    itemScope: true,
                    itemProp: 'mainEntity',
                    itemType: 'https://schema.org/Question'
                },
                    el('button', {
                        className: 'bkbg-faq-question',
                        'aria-expanded': isFirst ? 'true' : 'false',
                        itemProp: 'name'
                    },
                        a.iconPosition === 'left' && a.iconType !== 'none' && el('span', {
                            className: 'bkbg-faq-icon',
                            'aria-hidden': 'true',
                            dangerouslySetInnerHTML: { __html: a.iconType === 'plus' ? icons.plus : a.iconType === 'arrow' ? icons.arrow : icons.chevron }
                        }),
                        el('span', { className: 'bkbg-faq-q-text' }, item.question),
                        a.iconPosition === 'right' && a.iconType !== 'none' && el('span', {
                            className: 'bkbg-faq-icon',
                            'aria-hidden': 'true',
                            dangerouslySetInnerHTML: { __html: a.iconType === 'plus' ? icons.plus : a.iconType === 'arrow' ? icons.arrow : icons.chevron }
                        })
                    ),
                    el('div', {
                        className: 'bkbg-faq-answer',
                        'aria-hidden': isFirst ? 'false' : 'true',
                        itemScope: true,
                        itemProp: 'acceptedAnswer',
                        itemType: 'https://schema.org/Answer'
                    },
                        el('div', { className: 'bkbg-faq-answer-inner', itemProp: 'text' },
                            el(RichTextContent, { tagName: 'div', className: 'bkbg-faq-answer-body', value: item.answer })
                        )
                    )
                );
            });

            return el('div', blockProps,
                itemsEl,
                el('script', {
                    type: 'application/ld+json',
                    dangerouslySetInnerHTML: { __html: schema }
                })
            );
        }
    });

    // SVG strings for save
    var icons = {
        chevron: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
        plus: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
        arrow: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>'
    };
}() );

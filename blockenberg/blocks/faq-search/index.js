( function () {
    var el = wp.element.createElement;
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
    var TextareaControl = wp.components.TextareaControl;
    var Button = wp.components.Button;

    var _fsTC, _fsTV;
    function _tc() { return _fsTC || (_fsTC = window.bkbgTypographyControl); }
    function _tv() { return _fsTV || (_fsTV = window.bkbgTypoCssVars); }

    function defaultItem() {
        return { question: 'New question?', answer: 'Answer goes here.' };
    }

    registerBlockType('blockenberg/faq-search', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var items = attr.items || [];

            var blockProps = useBlockProps({ className: 'bkbg-fs-editor', style: Object.assign({}, _tv()(attr.typoQuestion, '--bkbg-fsrch-qt-'), _tv()(attr.typoAnswer, '--bkbg-fsrch-an-')) });

            function updateItem(i, key, value) {
                var updated = items.map(function (it, idx) {
                    if (idx !== i) return it;
                    var copy = Object.assign({}, it);
                    copy[key] = value;
                    return copy;
                });
                setAttr({ items: updated });
            }

            function removeItem(i) {
                setAttr({ items: items.filter(function (_, idx) { return idx !== i; }) });
            }

            var itemControls = items.map(function (item, i) {
                return el('div', {
                    key: i,
                    style: { borderLeft: '3px solid #7c3aed', paddingLeft: '12px', marginBottom: '20px' }
                },
                    el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' } },
                        el('strong', {}, 'Q' + (i + 1)),
                        el(Button, { isSmall: true, isDestructive: true, onClick: function () { removeItem(i); } }, '✕')
                    ),
                    el(TextControl, {
                        label: __('Question', 'blockenberg'),
                        value: item.question,
                        onChange: function (v) { updateItem(i, 'question', v); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(TextareaControl, {
                        label: __('Answer', 'blockenberg'),
                        value: item.answer,
                        rows: 3,
                        onChange: function (v) { updateItem(i, 'answer', v); },
                        __nextHasNoMarginBottom: true
                    })
                );
            });

            // Preview of items in editor
            var wrapStyle = {
                background: attr.bgColor || 'transparent',
                paddingTop: attr.paddingTop + 'px',
                paddingBottom: attr.paddingBottom + 'px'
            };

            var innerStyle = {
                maxWidth: attr.maxWidth + 'px',
                margin: '0 auto'
            };

            var previewItems = items.map(function (item, i) {
                var itemStyle = {};
                if (attr.itemStyle === 'bordered') {
                    itemStyle = {
                        border: '1px solid ' + attr.borderColor,
                        borderRadius: attr.borderRadius + 'px',
                        padding: '16px 20px',
                        marginBottom: '8px',
                        background: attr.itemBg || '#fff'
                    };
                } else if (attr.itemStyle === 'boxed') {
                    itemStyle = {
                        background: attr.itemBg || '#f9fafb',
                        borderRadius: attr.borderRadius + 'px',
                        padding: '16px 20px',
                        marginBottom: '8px'
                    };
                } else {
                    itemStyle = {
                        borderBottom: '1px solid ' + attr.borderColor,
                        padding: '16px 0',
                        marginBottom: '0'
                    };
                }

                return el('div', { key: i, style: itemStyle },
                    el('div', {
                        style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'default'
                        }
                    },
                        el('span', {
                            className: 'bkbg-fs-question-text',
                            style: { color: attr.questionColor }
                        }, item.question),
                        el('span', {
                            style: {
                                color: attr.accentColor,
                                fontSize: '20px',
                                lineHeight: 1
                            }
                        }, '+')
                    )
                );
            });

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('FAQ Items', 'blockenberg'), initialOpen: true },
                    itemControls,
                    el(Button, { isPrimary: true, isSmall: true, onClick: function () { setAttr({ items: items.concat(defaultItem()) }); }, style: { marginTop: '8px' } }, '+ Add FAQ')
                ),
                el(PanelBody, { title: __('Search Settings', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show Search Bar', 'blockenberg'),
                        checked: attr.showSearch,
                        onChange: function (v) { setAttr({ showSearch: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(TextControl, {
                        label: __('Search Placeholder', 'blockenberg'),
                        value: attr.searchPlaceholder,
                        onChange: function (v) { setAttr({ searchPlaceholder: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(TextControl, {
                        label: __('No Results Text', 'blockenberg'),
                        value: attr.noResultsText,
                        onChange: function (v) { setAttr({ noResultsText: v }); },
                        __nextHasNoMarginBottom: true
                    })
                ),
                el(PanelBody, { title: __('Accordion Behaviour', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Open First Item by Default', 'blockenberg'),
                        checked: attr.openFirst,
                        onChange: function (v) { setAttr({ openFirst: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, {
                        label: __('Allow Multiple Open', 'blockenberg'),
                        checked: attr.allowMultiple,
                        onChange: function (v) { setAttr({ allowMultiple: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(SelectControl, {
                        label: __('Item Style', 'blockenberg'),
                        value: attr.itemStyle,
                        options: [
                            { label: 'Bordered', value: 'bordered' },
                            { label: 'Boxed', value: 'boxed' },
                            { label: 'Plain (dividers)', value: 'plain' }
                        ],
                        onChange: function (v) { setAttr({ itemStyle: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Border Radius (px)', 'blockenberg'),
                        value: attr.borderRadius,
                        min: 0, max: 30,
                        onChange: function (v) { setAttr({ borderRadius: v }); },
                        __nextHasNoMarginBottom: true
                    })
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    _tc() && el(_tc(), { label: __('Question', 'blockenberg'), value: attr.typoQuestion, onChange: function (v) { setAttr({ typoQuestion: v }); } }),
                    _tc() && el(_tc(), { label: __('Answer', 'blockenberg'), value: attr.typoAnswer, onChange: function (v) { setAttr({ typoAnswer: v }); } })
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { label: __('Question Text', 'blockenberg'), value: attr.questionColor, onChange: function (v) { setAttr({ questionColor: v || '#111827' }); } },
                        { label: __('Answer Text', 'blockenberg'), value: attr.answerColor, onChange: function (v) { setAttr({ answerColor: v || '#4b5563' }); } },
                        { label: __('Accent / Icon', 'blockenberg'), value: attr.accentColor, onChange: function (v) { setAttr({ accentColor: v || '#7c3aed' }); } },
                        { label: __('Border', 'blockenberg'), value: attr.borderColor, onChange: function (v) { setAttr({ borderColor: v || '#e5e7eb' }); } },
                        { label: __('Item Background', 'blockenberg'), value: attr.itemBg, onChange: function (v) { setAttr({ itemBg: v || '#ffffff' }); } },
                        { label: __('Section Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { setAttr({ bgColor: v || '' }); } }
                    ]
                }),
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Max Width (px)', 'blockenberg'),
                        value: attr.maxWidth,
                        min: 400, max: 1200,
                        onChange: function (v) { setAttr({ maxWidth: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Padding Top (px)', 'blockenberg'),
                        value: attr.paddingTop,
                        min: 0, max: 200,
                        onChange: function (v) { setAttr({ paddingTop: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Padding Bottom (px)', 'blockenberg'),
                        value: attr.paddingBottom,
                        min: 0, max: 200,
                        onChange: function (v) { setAttr({ paddingBottom: v }); },
                        __nextHasNoMarginBottom: true
                    })
                )
            );

            return el('div', blockProps, controls,
                el('div', { style: wrapStyle },
                    el('div', { style: innerStyle },
                        attr.showSearch && el('div', {
                            style: {
                                marginBottom: '24px',
                                position: 'relative'
                            }
                        },
                            el('input', {
                                type: 'text',
                                placeholder: attr.searchPlaceholder,
                                readOnly: true,
                                style: {
                                    width: '100%',
                                    padding: '12px 16px 12px 40px',
                                    border: '1px solid ' + attr.searchBorderColor,
                                    borderRadius: '8px',
                                    fontSize: '15px',
                                    boxSizing: 'border-box',
                                    background: attr.searchBg || '#fff'
                                }
                            }),
                            el('span', {
                                style: {
                                    position: 'absolute',
                                    left: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#9ca3af'
                                }
                            }, '🔍')
                        ),
                        el('div', {},  previewItems)
                    )
                )
            );
        },

        save: function (props) {
            var attr = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save();
            return el('div', blockProps,
                el('div', {
                    className: 'bkbg-fs-app',
                    'data-opts': JSON.stringify(attr)
                })
            );
        }
    });
}() );

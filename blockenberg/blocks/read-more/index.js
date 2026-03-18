( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __ = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var RichText = wp.blockEditor.RichText;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var ToggleControl = wp.components.ToggleControl;
    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var v1Attributes = {
        "content":{"type":"string","default":"This is the full content that will be hidden behind the read more button. Add as much text as you like here \u2014 the block will collapse it to the preview height and show a gradient fade. The user can expand the full text with a click."},
        "collapsedHeight":{"type":"number","default":180},
        "readMoreLabel":{"type":"string","default":"Read more"},
        "showLessLabel":{"type":"string","default":"Show less"},
        "buttonStyle":{"type":"string","default":"solid"},
        "buttonAlign":{"type":"string","default":"center"},
        "showIcon":{"type":"boolean","default":true},
        "animateDuration":{"type":"number","default":400},
        "fadeHeight":{"type":"number","default":80},
        "fadeColor":{"type":"string","default":"#ffffff"},
        "borderRadius":{"type":"number","default":8},
        "fontSize":{"type":"number","default":16},
        "lineHeight":{"type":"number","default":1.7},
        "textColor":{"type":"string","default":"#374151"},
        "bgColor":{"type":"string","default":""},
        "btnBg":{"type":"string","default":"#6c3fb5"},
        "btnColor":{"type":"string","default":"#ffffff"},
        "btnBorderColor":{"type":"string","default":"#6c3fb5"},
        "paddingTop":{"type":"number","default":0},
        "paddingBottom":{"type":"number","default":0}
    };

    registerBlockType('blockenberg/read-more', {

        edit: function (props) {
            var attrs = props.attributes;
            var setAttr = props.setAttributes;
            var TC = getTypoControl();

            var contentStyle = {
                color: attrs.textColor,
                position: 'relative'
            };

            // Editor preview: show gradient overlay at bottom to simulate collapsed state
            var previewContentStyle = Object.assign({}, contentStyle, {
                maxHeight: attrs.collapsedHeight + 'px',
                overflow: 'hidden',
                position: 'relative'
            });

            var btnStyle = {};
            var bs = attrs.buttonStyle;
            if (bs === 'solid') {
                btnStyle = {
                    background: attrs.btnBg,
                    color: attrs.btnColor,
                    border: 'none',
                    borderRadius: attrs.borderRadius + 'px',
                    padding: '10px 24px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '14px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                };
            } else if (bs === 'outlined') {
                btnStyle = {
                    background: 'transparent',
                    color: attrs.btnBg,
                    border: '2px solid ' + attrs.btnBorderColor,
                    borderRadius: attrs.borderRadius + 'px',
                    padding: '8px 22px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '14px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                };
            } else {
                // link
                btnStyle = {
                    background: 'transparent',
                    color: attrs.btnBg,
                    border: 'none',
                    padding: '4px 0',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '14px',
                    textDecoration: 'underline',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                };
            }

            var blockProps = useBlockProps((function() {
                var _tvFn = getTypoCssVars();
                var s = {};
                if (attrs.paddingTop) s.paddingTop = attrs.paddingTop + 'px';
                if (attrs.paddingBottom) s.paddingBottom = attrs.paddingBottom + 'px';
                if (attrs.bgColor) s.background = attrs.bgColor;
                if (_tvFn) {
                    Object.assign(s, _tvFn(attrs.contentTypo || {}, '--bkrm-ct-'));
                }
                return { className: 'bkrm-wrap', style: s };
            })());

            return el(Fragment, null,
                el(InspectorControls, null,

                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el('p', { style: { color: '#6b7280', fontSize: '12px', margin: '0 0 12px' } },
                            __('Edit the text directly in the block. Use the settings below to control how it collapses.', 'blockenberg')
                        ),
                        el(RangeControl, {
                            label: __('Collapsed height (px)', 'blockenberg'),
                            value: attrs.collapsedHeight, min: 60, max: 600,
                            onChange: function (v) { setAttr({ collapsedHeight: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Fade gradient height (px)', 'blockenberg'),
                            value: attrs.fadeHeight, min: 20, max: 200,
                            onChange: function (v) { setAttr({ fadeHeight: v }); }
                        })
                    ),

                    el(PanelBody, { title: __('Button', 'blockenberg'), initialOpen: true },
                        el(TextControl, {
                            label: __('Read more label', 'blockenberg'),
                            value: attrs.readMoreLabel,
                            onChange: function (v) { setAttr({ readMoreLabel: v }); }
                        }),
                        el(TextControl, {
                            label: __('Show less label', 'blockenberg'),
                            value: attrs.showLessLabel,
                            onChange: function (v) { setAttr({ showLessLabel: v }); }
                        }),
                        el(SelectControl, {
                            label: __('Button style', 'blockenberg'),
                            value: attrs.buttonStyle,
                            options: [
                                { label: 'Solid', value: 'solid' },
                                { label: 'Outlined', value: 'outlined' },
                                { label: 'Link', value: 'link' }
                            ],
                            onChange: function (v) { setAttr({ buttonStyle: v }); }
                        }),
                        el(SelectControl, {
                            label: __('Button alignment', 'blockenberg'),
                            value: attrs.buttonAlign,
                            options: [
                                { label: 'Left', value: 'left' },
                                { label: 'Center', value: 'center' },
                                { label: 'Right', value: 'right' }
                            ],
                            onChange: function (v) { setAttr({ buttonAlign: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Show chevron icon', 'blockenberg'),
                            checked: attrs.showIcon,
                            onChange: function (v) { setAttr({ showIcon: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(RangeControl, {
                            label: __('Border radius (px)', 'blockenberg'),
                            value: attrs.borderRadius, min: 0, max: 50,
                            onChange: function (v) { setAttr({ borderRadius: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Animate duration (ms)', 'blockenberg'),
                            value: attrs.animateDuration, min: 100, max: 1200, step: 50,
                            onChange: function (v) { setAttr({ animateDuration: v }); }
                        })
                    ),

                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        TC && el(TC, { label: __('Content', 'blockenberg'), value: attrs.contentTypo || {}, onChange: function(v) { setAttr({ contentTypo: v }); } })
                    ),

                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                        el(RangeControl, {
                            label: __('Padding Top (px)', 'blockenberg'),
                            value: attrs.paddingTop, min: 0, max: 200,
                            onChange: function (v) { setAttr({ paddingTop: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Padding Bottom (px)', 'blockenberg'),
                            value: attrs.paddingBottom, min: 0, max: 200,
                            onChange: function (v) { setAttr({ paddingBottom: v }); }
                        })
                    ),

                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Text Color', 'blockenberg'), value: attrs.textColor, onChange: function (v) { setAttr({ textColor: v || '#374151' }); } },
                            { label: __('Fade / Background', 'blockenberg'), value: attrs.fadeColor, onChange: function (v) { setAttr({ fadeColor: v || '#ffffff' }); } },
                            { label: __('Button Background', 'blockenberg'), value: attrs.btnBg, onChange: function (v) { setAttr({ btnBg: v || '#6c3fb5' }); } },
                            { label: __('Button Text', 'blockenberg'), value: attrs.btnColor, onChange: function (v) { setAttr({ btnColor: v || '#ffffff' }); } },
                            { label: __('Button Border', 'blockenberg'), value: attrs.btnBorderColor, onChange: function (v) { setAttr({ btnBorderColor: v || '#6c3fb5' }); } },
                            { label: __('Section Background', 'blockenberg'), value: attrs.bgColor, onChange: function (v) { setAttr({ bgColor: v || '' }); } }
                        ]
                    })
                ),

                el('div', blockProps,
                    // Content area (editor shows trimmed preview)
                    el('div', {
                        className: 'bkrm-content',
                        style: previewContentStyle
                    },
                        el(RichText, {
                            tagName: 'div',
                            className: 'bkrm-text',
                            value: attrs.content,
                            onChange: function (v) { setAttr({ content: v }); },
                            placeholder: __('Add your full content here…', 'blockenberg'),
                            style: { color: attrs.textColor }
                        }),
                        // Gradient fade overlay preview
                        el('div', {
                            className: 'bkrm-fade',
                            style: {
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: attrs.fadeHeight + 'px',
                                background: 'linear-gradient(to bottom, transparent, ' + (attrs.fadeColor || '#ffffff') + ')',
                                pointerEvents: 'none'
                            }
                        })
                    ),
                    el('div', {
                        className: 'bkrm-btn-wrap',
                        style: { textAlign: attrs.buttonAlign, marginTop: '16px' }
                    },
                        el('button', { className: 'bkrm-btn', style: btnStyle, type: 'button' },
                            attrs.readMoreLabel,
                            attrs.showIcon && el('span', { className: 'bkrm-chevron', style: { fontSize: '12px', lineHeight: 1 } }, ' ▼')
                        )
                    )
                )
            );
        },

        deprecated: [{
            attributes: v1Attributes,
            save: function (props) {
                var a = props.attributes;
                var RichText = wp.blockEditor.RichText;

                var wrapStyle = {
                    paddingTop: a.paddingTop + 'px',
                    paddingBottom: a.paddingBottom + 'px',
                    '--bkrm-collapsed': a.collapsedHeight + 'px',
                    '--bkrm-fade-h': a.fadeHeight + 'px',
                    '--bkrm-fade-c': a.fadeColor || '#ffffff',
                    '--bkrm-dur': a.animateDuration + 'ms'
                };
                if (a.bgColor) wrapStyle.background = a.bgColor;

                var contentStyle = {
                    fontSize: a.fontSize + 'px',
                    lineHeight: a.lineHeight,
                    color: a.textColor
                };

                var bs = a.buttonStyle;
                var btnStyle = {};
                if (bs === 'solid') {
                    btnStyle = { background: a.btnBg, color: a.btnColor, borderRadius: a.borderRadius + 'px' };
                } else if (bs === 'outlined') {
                    btnStyle = { color: a.btnBg, borderColor: a.btnBorderColor, borderRadius: a.borderRadius + 'px' };
                } else {
                    btnStyle = { color: a.btnBg };
                }

                var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkrm-wrap', style: wrapStyle });

                return el('div', blockProps,
                    el('div', { className: 'bkrm-content bkrm-collapsed' },
                        el(RichText.Content, {
                            tagName: 'div',
                            className: 'bkrm-text',
                            value: a.content,
                            style: contentStyle
                        }),
                        el('div', { className: 'bkrm-fade', 'aria-hidden': 'true' })
                    ),
                    el('div', {
                        className: 'bkrm-btn-wrap',
                        style: { textAlign: a.buttonAlign }
                    },
                        el('button', {
                            className: 'bkrm-btn bkrm-btn--' + bs,
                            style: btnStyle,
                            type: 'button',
                            'aria-expanded': 'false'
                        },
                            el('span', { className: 'bkrm-label' }, a.readMoreLabel),
                            a.showIcon && el('span', { className: 'bkrm-chevron', 'aria-hidden': 'true' })
                        )
                    )
                );
            }
        }],

        save: function (props) {
            var a = props.attributes;

            var _tvFn = window.bkbgTypoCssVars;
            var wrapStyle = {
                paddingTop: a.paddingTop + 'px',
                paddingBottom: a.paddingBottom + 'px',
                '--bkrm-collapsed': a.collapsedHeight + 'px',
                '--bkrm-fade-h': a.fadeHeight + 'px',
                '--bkrm-fade-c': a.fadeColor || '#ffffff',
                '--bkrm-dur': a.animateDuration + 'ms'
            };
            if (a.bgColor) wrapStyle.background = a.bgColor;
            if (_tvFn) {
                Object.assign(wrapStyle, _tvFn(a.contentTypo || {}, '--bkrm-ct-'));
            }

            var contentStyle = {
                color: a.textColor
            };

            var bs = a.buttonStyle;
            var btnStyle = {};
            if (bs === 'solid') {
                btnStyle = { background: a.btnBg, color: a.btnColor, borderRadius: a.borderRadius + 'px' };
            } else if (bs === 'outlined') {
                btnStyle = { color: a.btnBg, borderColor: a.btnBorderColor, borderRadius: a.borderRadius + 'px' };
            } else {
                btnStyle = { color: a.btnBg };
            }

            var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkrm-wrap', style: wrapStyle });

            return el('div', blockProps,
                el('div', { className: 'bkrm-content bkrm-collapsed' },
                    el(RichText.Content, {
                        tagName: 'div',
                        className: 'bkrm-text',
                        value: a.content,
                        style: contentStyle
                    }),
                    el('div', { className: 'bkrm-fade', 'aria-hidden': 'true' })
                ),
                el('div', {
                    className: 'bkrm-btn-wrap',
                    style: { textAlign: a.buttonAlign }
                },
                    el('button', {
                        className: 'bkrm-btn bkrm-btn--' + bs,
                        style: btnStyle,
                        type: 'button',
                        'aria-expanded': 'false'
                    },
                        el('span', { className: 'bkrm-label' }, a.readMoreLabel),
                        a.showIcon && el('span', { className: 'bkrm-chevron', 'aria-hidden': 'true' })
                    )
                )
            );
        }
    });
}() );

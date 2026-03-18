( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var __ = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var ToggleControl = wp.components.ToggleControl;
    var Button = wp.components.Button;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    function uid() {
        return 'hs-' + Math.random().toString(36).slice(2, 9);
    }

    function ItemEditor(props) {
        var item = props.item;
        var label = props.label;
        var onChange = props.onChange;
        var onRemove = props.onRemove;

        return el(PanelBody, {
            title: (item.name || __('(empty)', 'blockenberg')).slice(0, 28),
            initialOpen: false
        },
            el(TextControl, {
                label: label + ' ' + __('name', 'blockenberg'),
                value: item.name,
                onChange: function (v) { onChange({ name: v }); }
            }),
            el(Button, {
                isDestructive: true, isSmall: true,
                onClick: onRemove
            }, __('Remove', 'blockenberg'))
        );
    }

    function StepEditor(props) {
        var step = props.step;
        var idx = props.idx;
        var onChange = props.onChange;
        var onRemove = props.onRemove;

        return el(PanelBody, {
            title: __('Step', 'blockenberg') + ' ' + (idx + 1) + ': ' + (step.name || '').slice(0, 20),
            initialOpen: false
        },
            el(TextControl, {
                label: __('Step title', 'blockenberg'),
                value: step.name,
                onChange: function (v) { onChange({ name: v }); }
            }),
            el(TextareaControl, {
                label: __('Step description', 'blockenberg'),
                value: step.text,
                rows: 3,
                onChange: function (v) { onChange({ text: v }); }
            }),
            el('div', { style: { marginBottom: '12px' } },
                el('p', { style: { fontSize: '11px', color: '#757575', margin: '0 0 6px' } }, __('Step image (optional)', 'blockenberg')),
                el(MediaUploadCheck, null,
                    el(MediaUpload, {
                        onSelect: function (media) { onChange({ imageUrl: media.url, imageId: media.id }); },
                        allowedTypes: ['image'],
                        value: step.imageId,
                        render: function (mediaProps) {
                            return el(Fragment, null,
                                step.imageUrl && el('img', {
                                    src: step.imageUrl,
                                    style: { width: '100%', height: '120px', objectFit: 'cover', borderRadius: '6px', display: 'block', marginBottom: '6px' }
                                }),
                                el(Button, { isSmall: true, variant: 'secondary', onClick: mediaProps.open },
                                    step.imageUrl ? __('Replace image', 'blockenberg') : __('Set image', 'blockenberg')),
                                step.imageUrl && el(Button, {
                                    isSmall: true, isDestructive: true,
                                    style: { marginLeft: '8px' },
                                    onClick: function () { onChange({ imageUrl: '', imageId: 0 }); }
                                }, __('Remove', 'blockenberg'))
                            );
                        }
                    })
                )
            ),
            el(Button, { isDestructive: true, isSmall: true, onClick: onRemove }, __('Remove step', 'blockenberg'))
        );
    }

    function StepPreview(props) {
        var step = props.step;
        var idx = props.idx;
        var a = props.attrs;

        return el('div', {
            className: 'bkbg-hs-step',
            style: {
                display: 'flex',
                gap: '20px',
                background: a.cardBg || '#ffffff',
                border: '1px solid ' + (a.cardBorder || '#e5e7eb'),
                borderRadius: a.cardRadius + 'px',
                padding: '20px',
                marginBottom: '16px',
                alignItems: 'flex-start'
            }
        },
            a.showStepNumbers && el('div', {
                className: 'bkbg-hs-step-num',
                style: {
                    minWidth: a.stepNumSize * 2 + 'px',
                    height: a.stepNumSize * 2 + 'px',
                    borderRadius: '50%',
                    background: a.stepNumBg || '#6c3fb5',
                    color: a.stepNumColor || '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: a.stepNumSize + 'px',
                    fontWeight: 800,
                    flexShrink: 0
                }
            }, idx + 1),
            el('div', { className: 'bkbg-hs-step-content', style: { flex: 1 } },
                el('div', {
                    className: 'bkbg-hs-step-name',
                    style: { color: a.stepNameColor || '#1e1b4b', marginBottom: '6px' }
                }, step.name || __('Step title', 'blockenberg')),
                el('div', {
                    className: 'bkbg-hs-step-text',
                    style: { color: a.stepTextColor || '#374151' }
                }, step.text || __('Step description…', 'blockenberg')),
                a.showStepImages && step.imageUrl && el('img', {
                    src: step.imageUrl,
                    alt: step.name,
                    style: { width: '100%', maxWidth: '480px', borderRadius: '8px', marginTop: '12px', display: 'block' }
                })
            )
        );
    }

    registerBlockType('blockenberg/howto-schema', {
        edit: function (props) {
            var attrs = props.attributes;
            var setAttr = function (obj) { props.setAttributes(obj); };

            var steps = attrs.steps || [];
            var supplies = attrs.supplies || [];
            var tools = attrs.tools || [];

            function addStep() {
                setAttr({ steps: steps.concat([{ id: uid(), name: '', text: '', imageUrl: '', imageId: 0 }]) });
            }
            function updateStep(id, patch) {
                setAttr({ steps: steps.map(function (s) { return s.id === id ? Object.assign({}, s, patch) : s; }) });
            }
            function removeStep(id) {
                setAttr({ steps: steps.filter(function (s) { return s.id !== id; }) });
            }

            function addSupply() {
                setAttr({ supplies: supplies.concat([{ id: uid(), name: '' }]) });
            }
            function updateSupply(id, patch) {
                setAttr({ supplies: supplies.map(function (s) { return s.id === id ? Object.assign({}, s, patch) : s; }) });
            }
            function removeSupply(id) {
                setAttr({ supplies: supplies.filter(function (s) { return s.id !== id; }) });
            }

            function addTool() {
                setAttr({ tools: tools.concat([{ id: uid(), name: '' }]) });
            }
            function updateTool(id, patch) {
                setAttr({ tools: tools.map(function (t) { return t.id === id ? Object.assign({}, t, patch) : t; }) });
            }
            function removeTool(id) {
                setAttr({ tools: tools.filter(function (t) { return t.id !== id; }) });
            }

            var wrapStyle = { paddingTop: attrs.paddingTop + 'px', paddingBottom: attrs.paddingBottom + 'px' };
            if (attrs.bgColor) wrapStyle.background = attrs.bgColor;
            var _tv = getTypoCssVars();
            if (_tv) {
                Object.assign(wrapStyle, _tv(attrs.titleTypo, '--bkbg-hts-tt-'));
                Object.assign(wrapStyle, _tv(attrs.stepNameTypo, '--bkbg-hts-sn-'));
                Object.assign(wrapStyle, _tv(attrs.stepTextTypo, '--bkbg-hts-st-'));
            }
            wrapStyle['--bkbg-hts-tt-sz'] = (attrs.titleSize || 30) + 'px';
            wrapStyle['--bkbg-hts-sn-sz'] = (attrs.stepNameSize || 17) + 'px';
            wrapStyle['--bkbg-hts-st-sz'] = (attrs.stepTextSize || 14) + 'px';

            var blockProps = useBlockProps({ className: 'bkbg-hs-wrap', style: wrapStyle });

            return el(Fragment, null,
                el(InspectorControls, null,

                    el(PanelBody, { title: __('Steps', 'blockenberg'), initialOpen: true },
                        steps.map(function (s, i) {
                            return el(StepEditor, {
                                key: s.id,
                                step: s,
                                idx: i,
                                onChange: function (patch) { updateStep(s.id, patch); },
                                onRemove: function () { removeStep(s.id); }
                            });
                        }),
                        el(Button, {
                            variant: 'primary', isSmall: true,
                            style: { marginTop: '12px', width: '100%', justifyContent: 'center' },
                            onClick: addStep
                        }, __('+ Add Step', 'blockenberg'))
                    ),

                    el(PanelBody, { title: __('Supplies', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, {
                            label: __('Show supplies section', 'blockenberg'),
                            checked: attrs.showSupplies,
                            onChange: function (v) { setAttr({ showSupplies: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        supplies.map(function (s) {
                            return el(ItemEditor, {
                                key: s.id,
                                item: s,
                                label: __('Supply', 'blockenberg'),
                                onChange: function (patch) { updateSupply(s.id, patch); },
                                onRemove: function () { removeSupply(s.id); }
                            });
                        }),
                        el(Button, {
                            isSmall: true, variant: 'secondary',
                            style: { marginTop: '8px' },
                            onClick: addSupply
                        }, __('+ Add Supply', 'blockenberg'))
                    ),

                    el(PanelBody, { title: __('Tools', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, {
                            label: __('Show tools section', 'blockenberg'),
                            checked: attrs.showTools,
                            onChange: function (v) { setAttr({ showTools: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        tools.map(function (t) {
                            return el(ItemEditor, {
                                key: t.id,
                                item: t,
                                label: __('Tool', 'blockenberg'),
                                onChange: function (patch) { updateTool(t.id, patch); },
                                onRemove: function () { removeTool(t.id); }
                            });
                        }),
                        el(Button, {
                            isSmall: true, variant: 'secondary',
                            style: { marginTop: '8px' },
                            onClick: addTool
                        }, __('+ Add Tool', 'blockenberg'))
                    ),

                    el(PanelBody, { title: __('Guide Info', 'blockenberg'), initialOpen: false },
                        el(TextControl, {
                            label: __('Total time (ISO 8601 – e.g. PT30M, PT2H)', 'blockenberg'),
                            value: attrs.totalTime,
                            onChange: function (v) { setAttr({ totalTime: v }); }
                        }),
                        el(TextControl, {
                            label: __('Time label (displayed)', 'blockenberg'),
                            value: attrs.totalTimeLabel,
                            onChange: function (v) { setAttr({ totalTimeLabel: v }); }
                        }),
                        el(TextControl, {
                            label: __('Estimated cost (number only)', 'blockenberg'),
                            value: attrs.estimatedCost,
                            onChange: function (v) { setAttr({ estimatedCost: v }); }
                        }),
                        el(TextControl, {
                            label: __('Currency (e.g. USD, EUR)', 'blockenberg'),
                            value: attrs.costCurrency,
                            onChange: function (v) { setAttr({ costCurrency: v }); }
                        })
                    ),

                    el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show title', 'blockenberg'), checked: attrs.showTitle, onChange: function (v) { setAttr({ showTitle: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show description', 'blockenberg'), checked: attrs.showDescription, onChange: function (v) { setAttr({ showDescription: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show meta bar (time/cost)', 'blockenberg'), checked: attrs.showMeta, onChange: function (v) { setAttr({ showMeta: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Numbered steps', 'blockenberg'), checked: attrs.showStepNumbers, onChange: function (v) { setAttr({ showStepNumbers: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show step images', 'blockenberg'), checked: attrs.showStepImages, onChange: function (v) { setAttr({ showStepImages: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Step number size (px)', 'blockenberg'), value: attrs.stepNumSize, min: 12, max: 32, onChange: function (v) { setAttr({ stepNumSize: v }); } }),
                        getTypographyControl() && el(getTypographyControl(), { label: __('Title', 'blockenberg'), typo: attrs.titleTypo || {}, onChange: function(v){ setAttr({ titleTypo: v }); } }),
                        getTypographyControl() && el(getTypographyControl(), { label: __('Step Title', 'blockenberg'), typo: attrs.stepNameTypo || {}, onChange: function(v){ setAttr({ stepNameTypo: v }); } }),
                        getTypographyControl() && el(getTypographyControl(), { label: __('Step Text', 'blockenberg'), typo: attrs.stepTextTypo || {}, onChange: function(v){ setAttr({ stepTextTypo: v }); } })
                    ),

                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top (px)', 'blockenberg'), value: attrs.paddingTop, min: 0, max: 200, onChange: function (v) { setAttr({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: attrs.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttr({ paddingBottom: v }); } })
                    ),

                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { label: __('Accent', 'blockenberg'), value: attrs.accentColor, onChange: function (v) { setAttr({ accentColor: v || '#6c3fb5' }); } },
                            { label: __('Title', 'blockenberg'), value: attrs.titleColor, onChange: function (v) { setAttr({ titleColor: v || '#1e1b4b' }); } },
                            { label: __('Description', 'blockenberg'), value: attrs.descColor, onChange: function (v) { setAttr({ descColor: v || '#374151' }); } },
                            { label: __('Step number background', 'blockenberg'), value: attrs.stepNumBg, onChange: function (v) { setAttr({ stepNumBg: v || '#6c3fb5' }); } },
                            { label: __('Step number text', 'blockenberg'), value: attrs.stepNumColor, onChange: function (v) { setAttr({ stepNumColor: v || '#ffffff' }); } },
                            { label: __('Step title', 'blockenberg'), value: attrs.stepNameColor, onChange: function (v) { setAttr({ stepNameColor: v || '#1e1b4b' }); } },
                            { label: __('Step text', 'blockenberg'), value: attrs.stepTextColor, onChange: function (v) { setAttr({ stepTextColor: v || '#374151' }); } },
                            { label: __('Meta bar background', 'blockenberg'), value: attrs.metaBg, onChange: function (v) { setAttr({ metaBg: v || '#f5f3ff' }); } },
                            { label: __('Meta bar border', 'blockenberg'), value: attrs.metaBorder, onChange: function (v) { setAttr({ metaBorder: v || '#ede9fe' }); } },
                            { label: __('Meta bar text', 'blockenberg'), value: attrs.metaColor, onChange: function (v) { setAttr({ metaColor: v || '#374151' }); } },
                            { label: __('Card background', 'blockenberg'), value: attrs.cardBg, onChange: function (v) { setAttr({ cardBg: v || '#ffffff' }); } },
                            { label: __('Card border', 'blockenberg'), value: attrs.cardBorder, onChange: function (v) { setAttr({ cardBorder: v || '#e5e7eb' }); } },
                            { label: __('Supply/tool background', 'blockenberg'), value: attrs.supplyBg, onChange: function (v) { setAttr({ supplyBg: v || '#f9fafb' }); } },
                            { label: __('Supply/tool border', 'blockenberg'), value: attrs.supplyBorder, onChange: function (v) { setAttr({ supplyBorder: v || '#e5e7eb' }); } },
                            { label: __('Block background', 'blockenberg'), value: attrs.bgColor, onChange: function (v) { setAttr({ bgColor: v || '' }); } }
                        ]
                    })
                ),

                el('div', blockProps,
                    attrs.showTitle && el(RichText, {
                        tagName: 'h2',
                        className: 'bkbg-hs-title',
                        style: { color: attrs.titleColor, margin: '0 0 12px' },
                        value: attrs.title,
                        onChange: function (v) { setAttr({ title: v }); },
                        placeholder: __('How To…', 'blockenberg')
                    }),
                    attrs.showDescription && el(RichText, {
                        tagName: 'p',
                        className: 'bkbg-hs-desc',
                        style: { color: attrs.descColor, margin: '0 0 16px', lineHeight: 1.7 },
                        value: attrs.description,
                        onChange: function (v) { setAttr({ description: v }); },
                        placeholder: __('Describe what readers will learn to do…', 'blockenberg')
                    }),

                    attrs.showMeta && el('div', {
                        className: 'bkbg-hs-meta',
                        style: {
                            display: 'flex', flexWrap: 'wrap', gap: '16px',
                            background: attrs.metaBg || '#f5f3ff',
                            border: '1px solid ' + (attrs.metaBorder || '#ede9fe'),
                            borderRadius: attrs.cardRadius + 'px',
                            padding: '12px 16px', marginBottom: '24px'
                        }
                    },
                        attrs.totalTimeLabel && el('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', color: attrs.metaColor || '#374151', fontSize: '14px' } },
                            el('span', { style: { fontWeight: 700 } }, '⏱'),
                            el('span', null, attrs.totalTimeLabel)
                        ),
                        attrs.estimatedCost && el('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', color: attrs.metaColor || '#374151', fontSize: '14px' } },
                            el('span', { style: { fontWeight: 700 } }, '💰'),
                            el('span', null, attrs.estimatedCost + ' ' + (attrs.costCurrency || 'USD'))
                        )
                    ),

                    (attrs.showSupplies && supplies.length > 0) && el('div', { className: 'bkbg-hs-supplies', style: { marginBottom: '24px' } },
                        el('h3', { style: { fontSize: '16px', fontWeight: 700, color: attrs.titleColor, margin: '0 0 10px' } }, __('What You Need', 'blockenberg')),
                        el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } },
                            supplies.map(function (s) {
                                return el('span', {
                                    key: s.id,
                                    style: { background: attrs.supplyBg || '#f9fafb', border: '1px solid ' + (attrs.supplyBorder || '#e5e7eb'), borderRadius: '6px', padding: '4px 12px', fontSize: '13px', color: attrs.stepTextColor || '#374151' }
                                }, s.name || __('Supply', 'blockenberg'));
                            })
                        )
                    ),

                    (attrs.showTools && tools.length > 0) && el('div', { className: 'bkbg-hs-tools', style: { marginBottom: '24px' } },
                        el('h3', { style: { fontSize: '16px', fontWeight: 700, color: attrs.titleColor, margin: '0 0 10px' } }, __('Tools', 'blockenberg')),
                        el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } },
                            tools.map(function (t) {
                                return el('span', {
                                    key: t.id,
                                    style: { background: attrs.supplyBg || '#f9fafb', border: '1px solid ' + (attrs.supplyBorder || '#e5e7eb'), borderRadius: '6px', padding: '4px 12px', fontSize: '13px', color: attrs.stepTextColor || '#374151' }
                                }, t.name || __('Tool', 'blockenberg'));
                            })
                        )
                    ),

                    el('div', { className: 'bkbg-hs-steps' },
                        steps.length === 0
                            ? el('p', { style: { color: '#9ca3af', textAlign: 'center', padding: '40px 0' } }, __('Add your first step in the sidebar →', 'blockenberg'))
                            : steps.map(function (s, i) {
                                return el(StepPreview, { key: s.id, step: s, idx: i, attrs: attrs });
                            })
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var steps = a.steps || [];
            var supplies = a.supplies || [];
            var tools = a.tools || [];

            var wrapStyle = { paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px' };
            if (a.bgColor) wrapStyle.background = a.bgColor;
            var _tv = getTypoCssVars();
            if (_tv) {
                Object.assign(wrapStyle, _tv(a.titleTypo, '--bkbg-hts-tt-'));
                Object.assign(wrapStyle, _tv(a.stepNameTypo, '--bkbg-hts-sn-'));
                Object.assign(wrapStyle, _tv(a.stepTextTypo, '--bkbg-hts-st-'));
            }
            wrapStyle['--bkbg-hts-tt-sz'] = (a.titleSize || 30) + 'px';
            wrapStyle['--bkbg-hts-sn-sz'] = (a.stepNameSize || 17) + 'px';
            wrapStyle['--bkbg-hts-st-sz'] = (a.stepTextSize || 14) + 'px';

            var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkbg-hs-wrap', style: wrapStyle });

            // Build HowTo JSON-LD
            var schemaData = {
                '@context': 'https://schema.org',
                '@type': 'HowTo',
                'name': a.title || '',
                'description': a.description || '',
                'totalTime': a.totalTime || undefined
            };
            if (a.estimatedCost) {
                schemaData.estimatedCost = { '@type': 'MonetaryAmount', 'currency': a.costCurrency || 'USD', 'value': a.estimatedCost };
            }
            if (supplies.length > 0) {
                schemaData.supply = supplies.map(function (s) { return { '@type': 'HowToSupply', 'name': s.name }; });
            }
            if (tools.length > 0) {
                schemaData.tool = tools.map(function (t) { return { '@type': 'HowToTool', 'name': t.name }; });
            }
            schemaData.step = steps.map(function (s, i) {
                var step = { '@type': 'HowToStep', 'position': i + 1, 'name': s.name, 'text': s.text };
                if (s.imageUrl) step.image = s.imageUrl;
                return step;
            });

            return el('div', blockProps,
                a.showTitle && el('h2', {
                    className: 'bkbg-hs-title',
                    style: { color: a.titleColor, margin: '0 0 12px' },
                    dangerouslySetInnerHTML: { __html: a.title }
                }),
                a.showDescription && el('p', {
                    className: 'bkbg-hs-desc',
                    style: { color: a.descColor, margin: '0 0 16px', lineHeight: 1.7 },
                    dangerouslySetInnerHTML: { __html: a.description }
                }),

                a.showMeta && el('div', {
                    className: 'bkbg-hs-meta',
                    style: {
                        display: 'flex', flexWrap: 'wrap', gap: '16px',
                        background: a.metaBg || '#f5f3ff',
                        border: '1px solid ' + (a.metaBorder || '#ede9fe'),
                        borderRadius: a.cardRadius + 'px',
                        padding: '12px 16px', marginBottom: '24px'
                    }
                },
                    a.totalTimeLabel && el('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', color: a.metaColor || '#374151', fontSize: '14px' } },
                        el('span', { style: { fontWeight: 700 }, 'aria-hidden': 'true' }, '⏱'),
                        el('span', null, a.totalTimeLabel)
                    ),
                    a.estimatedCost && el('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', color: a.metaColor || '#374151', fontSize: '14px' } },
                        el('span', { style: { fontWeight: 700 }, 'aria-hidden': 'true' }, '💰'),
                        el('span', null, a.estimatedCost + ' ' + (a.costCurrency || 'USD'))
                    )
                ),

                (a.showSupplies && supplies.length > 0) && el('div', { className: 'bkbg-hs-supplies', style: { marginBottom: '24px' } },
                    el('h3', { style: { fontSize: '16px', fontWeight: 700, color: a.titleColor, margin: '0 0 10px' } }, __('What You Need', 'blockenberg')),
                    el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } },
                        supplies.map(function (s) {
                            return el('span', {
                                key: s.id,
                                style: { background: a.supplyBg || '#f9fafb', border: '1px solid ' + (a.supplyBorder || '#e5e7eb'), borderRadius: '6px', padding: '4px 12px', fontSize: '13px', color: a.stepTextColor || '#374151' }
                            }, s.name);
                        })
                    )
                ),

                (a.showTools && tools.length > 0) && el('div', { className: 'bkbg-hs-tools', style: { marginBottom: '24px' } },
                    el('h3', { style: { fontSize: '16px', fontWeight: 700, color: a.titleColor, margin: '0 0 10px' } }, __('Tools', 'blockenberg')),
                    el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } },
                        tools.map(function (t) {
                            return el('span', {
                                key: t.id,
                                style: { background: a.supplyBg || '#f9fafb', border: '1px solid ' + (a.supplyBorder || '#e5e7eb'), borderRadius: '6px', padding: '4px 12px', fontSize: '13px', color: a.stepTextColor || '#374151' }
                            }, t.name);
                        })
                    )
                ),

                el('ol', { className: 'bkbg-hs-steps', style: { listStyle: 'none', margin: 0, padding: 0 } },
                    steps.map(function (s, i) {
                        return el('li', {
                            key: s.id,
                            className: 'bkbg-hs-step',
                            style: {
                                display: 'flex',
                                gap: '20px',
                                background: a.cardBg || '#ffffff',
                                border: '1px solid ' + (a.cardBorder || '#e5e7eb'),
                                borderRadius: a.cardRadius + 'px',
                                padding: '20px',
                                marginBottom: '16px',
                                alignItems: 'flex-start'
                            }
                        },
                            a.showStepNumbers && el('div', {
                                className: 'bkbg-hs-step-num',
                                'aria-hidden': 'true',
                                style: {
                                    minWidth: a.stepNumSize * 2 + 'px',
                                    height: a.stepNumSize * 2 + 'px',
                                    borderRadius: '50%',
                                    background: a.stepNumBg || '#6c3fb5',
                                    color: a.stepNumColor || '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: a.stepNumSize + 'px',
                                    fontWeight: 800,
                                    flexShrink: 0
                                }
                            }, i + 1),
                            el('div', { className: 'bkbg-hs-step-content', style: { flex: 1 } },
                                el('h3', {
                                    className: 'bkbg-hs-step-name',
                                    style: { color: a.stepNameColor || '#1e1b4b', margin: '0 0 6px' }
                                }, s.name),
                                el('p', {
                                    className: 'bkbg-hs-step-text',
                                    style: { color: a.stepTextColor || '#374151', margin: 0 }
                                }, s.text),
                                a.showStepImages && s.imageUrl && el('img', {
                                    src: s.imageUrl,
                                    alt: s.name,
                                    loading: 'lazy',
                                    style: { width: '100%', maxWidth: '480px', borderRadius: '8px', marginTop: '12px', display: 'block' }
                                })
                            )
                        );
                    })
                ),

                // HowTo JSON-LD structured data
                el('script', {
                    type: 'application/ld+json',
                    dangerouslySetInnerHTML: { __html: JSON.stringify(schemaData, null, 2) }
                })
            );
        }
    });
}() );

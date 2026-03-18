( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, ToggleControl, TextControl, TextareaControl, SelectControl, Button } = window.wp.components;
    const { __ } = window.wp.i18n;

    var _dtrTC, _dtrTV;
    function _tc() { return _dtrTC || (_dtrTC = window.bkbgTypographyControl); }
    function _tv(typo, prefix) { return (_dtrTV || (_dtrTV = window.bkbgTypoCssVars))(typo, prefix); }
    var IP = function () { return window.bkbgIconPicker; };

    function nodeById(nodes, id) { return nodes.find(n => n.id === id) || null; }
    function updNode(nodes, id, field, val) { return nodes.map(n => n.id === id ? { ...n, [field]: val } : n); }

    // Unique ID generator
    let _uid = Date.now();
    function uid() { return 'n' + (++_uid); }

    // ── Editor preview ────────────────────────────────────────────────
    // Shows a static non-interactive rendering of the first question
    function renderPreviewNode(node, a) {
        if (!node) return el('div', { style: { padding: '20px', color: '#999' } }, __('Root node not found. Check node IDs.'));

        if (node.type === 'result') {
            return el('div', {
                className: 'bkbg-dt-result-card',
                style: {
                    background: node.resultColor || '#6c3fb5', color: a.resultTextColor,
                    borderRadius: a.cardRadius + 'px', padding: '28px 32px', textAlign: 'center'
                }
            },
                el('div', { style: { fontSize: '36px', marginBottom: '12px' } }, '🎯'),
                el('p', { style: { fontSize: a.fontSize + 'px', lineHeight: 1.6, margin: 0 } }, node.text),
            );
        }

        // Question node (static preview)
        return el('div', {
            className: 'bkbg-dt-question-card',
            style: { background: a.cardBg, border: '1px solid ' + a.cardBorder, borderRadius: a.cardRadius + 'px', padding: '28px 32px' }
        },
            el('p', { style: { fontSize: a.questionSize + 'px', fontWeight: 700, color: a.questionColor, margin: '0 0 24px', lineHeight: 1.4 } }, node.text),
            el('div', { style: { display: 'flex', gap: '12px' } },
                el('button', {
                    style: {
                        flex: 1, background: a.yesBg, color: a.yesText, border: 'none',
                        borderRadius: '8px', padding: '12px 20px', fontSize: a.fontSize + 'px',
                        fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }
                }, el('span', { className: 'bkbg-dt-btn-icon' },
                    (!a.yesIconType || a.yesIconType === 'custom-char') ? a.yesIcon : IP().buildEditorIcon(a.yesIconType, a.yesIcon, a.yesIconDashicon, a.yesIconImageUrl, a.yesIconDashiconColor)
                ), node.yesLabel || __('Yes')),
                el('button', {
                    style: {
                        flex: 1, background: a.noBg, color: a.noText, border: 'none',
                        borderRadius: '8px', padding: '12px 20px', fontSize: a.fontSize + 'px',
                        fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }
                }, el('span', { className: 'bkbg-dt-btn-icon' },
                    (!a.noIconType || a.noIconType === 'custom-char') ? a.noIcon : IP().buildEditorIcon(a.noIconType, a.noIcon, a.noIconDashicon, a.noIconImageUrl, a.noIconDashiconColor)
                ), node.noLabel || __('No')),
            ),
            el('div', { style: { marginTop: '16px', fontSize: (a.breadcrumbFontSize || 12) + 'px', color: a.breadcrumbColor, textAlign: 'center' } },
                __('Interactive in preview — visitors follow branches to personalised results')
            )
        );
    }

    // ── Node ID select options ─────────────────────────────────────────
    function nodeOptions(nodes) {
        return [{ value: '', label: __('— none —') }].concat(nodes.map(n => ({ value: n.id, label: (n.type === 'result' ? '🎯 ' : '❓ ') + n.id + ': ' + n.text.substring(0, 40) })));
    }

    function wrapStyle(a) {
        return { background: a.bgColor, borderRadius: a.borderRadius + 'px', paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px', paddingLeft: '32px', paddingRight: '32px' };
    }

    registerBlockType('blockenberg/decision-tree', {
        edit: function ({ attributes: a, setAttributes }) {
            const blockProps = useBlockProps({ style: Object.assign(wrapStyle(a), { '--bkbg-dtr-ttl-fs': (a.titleSize || 24) + 'px', '--bkbg-dtr-sub-fs': (a.subtitleFontSize || 16) + 'px' }, _tv(a.typoTitle || {}, '--bkbg-dtr-ttl-'), _tv(a.typoSubtitle || {}, '--bkbg-dtr-sub-')) });
            const root = nodeById(a.nodes, a.rootId);
            const opts = nodeOptions(a.nodes);

            // Count question nodes (for progress estimate)
            const questionCount = a.nodes.filter(n => n.type === 'question').length;

            return el('div', blockProps,
                el(InspectorControls, {},
                    el(PanelBody, { title: __('Content'), initialOpen: true },
                        el(TextControl, { label: __('Title'), value: a.title, onChange: v => setAttributes({ title: v }) }),
                        el(ToggleControl, { label: __('Show title'), checked: a.showTitle, onChange: v => setAttributes({ showTitle: v }) }),
                        el(TextControl, { label: __('Subtitle'), value: a.subtitle, onChange: v => setAttributes({ subtitle: v }) }),
                        el(ToggleControl, { label: __('Show subtitle'), checked: a.showSubtitle, onChange: v => setAttributes({ showSubtitle: v }) }),
                        el(SelectControl, { label: __('Root (starting) node'), value: a.rootId, options: opts, onChange: v => setAttributes({ rootId: v }) }),
                        el(ToggleControl, { label: __('Show breadcrumb trail'), checked: a.showBreadcrumb, onChange: v => setAttributes({ showBreadcrumb: v }) }),
                        el(ToggleControl, { label: __('Show step progress'), checked: a.showProgress, onChange: v => setAttributes({ showProgress: v }) }),
                        el('p', { style: { fontSize: '11px', fontWeight: 600, marginTop: '12px' } }, __('Yes button icon')),
                        el(IP().IconPickerControl, IP().iconPickerProps(a, setAttributes, { charAttr: 'yesIcon', typeAttr: 'yesIconType', dashiconAttr: 'yesIconDashicon', imageUrlAttr: 'yesIconImageUrl', colorAttr: 'yesIconDashiconColor' })),
                        el('p', { style: { fontSize: '11px', fontWeight: 600, marginTop: '12px' } }, __('No button icon')),
                        el(IP().IconPickerControl, IP().iconPickerProps(a, setAttributes, { charAttr: 'noIcon', typeAttr: 'noIconType', dashiconAttr: 'noIconDashicon', imageUrlAttr: 'noIconImageUrl', colorAttr: 'noIconDashiconColor' })),
                    ),
                    el(PanelBody, { title: __('Nodes (' + a.nodes.length + ')'), initialOpen: false },
                        a.nodes.map((node, i) =>
                            el(PanelBody, { key: i, title: (node.type === 'result' ? '🎯 ' : '❓ ') + node.id, initialOpen: false },
                                el(TextControl, { label: __('Node ID'), value: node.id, onChange: v => setAttributes({ nodes: updNode(a.nodes, node.id, 'id', v) }) }),
                                el(SelectControl, { label: __('Type'), value: node.type, options: [{ value: 'question', label: 'Question (has branches)' }, { value: 'result', label: 'Result (leaf node)' }], onChange: v => setAttributes({ nodes: updNode(a.nodes, node.id, 'type', v) }) }),
                                el(TextareaControl, { label: node.type === 'result' ? __('Result text') : __('Question text'), value: node.text, rows: 3, onChange: v => setAttributes({ nodes: updNode(a.nodes, node.id, 'text', v) }) }),
                                node.type === 'question' && [
                                    el(TextControl, { key: 'yl', label: __('Yes label'), value: node.yesLabel || 'Yes', onChange: v => setAttributes({ nodes: updNode(a.nodes, node.id, 'yesLabel', v) }) }),
                                    el(SelectControl, { key: 'yi', label: __('Yes → goes to node'), value: node.yesId || '', options: opts, onChange: v => setAttributes({ nodes: updNode(a.nodes, node.id, 'yesId', v) }) }),
                                    el(TextControl, { key: 'nl', label: __('No label'), value: node.noLabel || 'No', onChange: v => setAttributes({ nodes: updNode(a.nodes, node.id, 'noLabel', v) }) }),
                                    el(SelectControl, { key: 'ni', label: __('No → goes to node'), value: node.noId || '', options: opts, onChange: v => setAttributes({ nodes: updNode(a.nodes, node.id, 'noId', v) }) }),
                                ],
                                node.type === 'result' && el('div', { style: { marginBottom: '8px' } },
                                    el('label', { style: { display: 'block', marginBottom: '6px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' } }, __('Result card color')),
                                    el('input', { type: 'color', value: node.resultColor || '#6c3fb5', style: { width: '100%', height: '36px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }, onChange: e => setAttributes({ nodes: updNode(a.nodes, node.id, 'resultColor', e.target.value) }) }),
                                ),
                                el(Button, {
                                    variant: 'secondary', isDestructive: true, isSmall: true,
                                    onClick: () => setAttributes({ nodes: a.nodes.filter(n => n.id !== node.id) })
                                }, __('Remove node')),
                            )
                        ),
                        el('div', { style: { display: 'flex', gap: '8px', marginTop: '8px' } },
                            el(Button, { variant: 'secondary', onClick: () => { const id = uid(); setAttributes({ nodes: a.nodes.concat([{ id, type: 'question', text: 'New question?', yesId: '', noId: '', yesLabel: 'Yes', noLabel: 'No' }]) }); } }, __('+ Question')),
                            el(Button, { variant: 'secondary', onClick: () => { const id = uid(); setAttributes({ nodes: a.nodes.concat([{ id, type: 'result', text: 'Result description goes here.', resultColor: '#6c3fb5' }]) }); } }, __('+ Result')),
                        ),
                    ),
                    el(PanelBody, { title: __('Typography'), initialOpen: false },
                        _tc() && el(_tc(), { label: __('Title'), typo: a.typoTitle || {}, onChange: v => setAttributes({ typoTitle: v }), defaultSize: a.titleSize || 24 }),
                        _tc() && el(_tc(), { label: __('Subtitle'), typo: a.typoSubtitle || {}, onChange: v => setAttributes({ typoSubtitle: v }), defaultSize: a.subtitleFontSize || 16 }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Question size'), value: a.questionSize, min: 14, max: 30, onChange: v => setAttributes({ questionSize: v }) }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Body font size'), value: a.fontSize, min: 12, max: 20, onChange: v => setAttributes({ fontSize: v }) }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Breadcrumb font size'), value: a.breadcrumbFontSize, min: 9, max: 18, onChange: v => setAttributes({ breadcrumbFontSize: v }) }),
                    ),
                    el(PanelBody, { title: __('Spacing'), initialOpen: false },
                        el(RangeControl, { label: __('Border radius'), value: a.borderRadius, min: 0, max: 32, onChange: v => setAttributes({ borderRadius: v }) }),
                        el(RangeControl, { label: __('Card radius'), value: a.cardRadius, min: 0, max: 24, onChange: v => setAttributes({ cardRadius: v }) }),
                        el(RangeControl, { label: __('Padding top'), value: a.paddingTop, min: 0, max: 120, onChange: v => setAttributes({ paddingTop: v }) }),
                        el(RangeControl, { label: __('Padding bottom'), value: a.paddingBottom, min: 0, max: 120, onChange: v => setAttributes({ paddingBottom: v }) }),
                    ),
                    el(PanelColorSettings, {
                        title: __('Colors'), initialOpen: false,
                        colorSettings: [
                            { label: __('Background'),     value: a.bgColor,       onChange: v => setAttributes({ bgColor:       v || '#ffffff' }) },
                            { label: __('Card BG'),        value: a.cardBg,        onChange: v => setAttributes({ cardBg:        v || '#f8fafc' }) },
                            { label: __('Card border'),    value: a.cardBorder,    onChange: v => setAttributes({ cardBorder:    v || '#e2e8f0' }) },
                            { label: __('Title'),          value: a.titleColor,    onChange: v => setAttributes({ titleColor:    v || '#0f172a' }) },
                            { label: __('Subtitle'),       value: a.subtitleColor, onChange: v => setAttributes({ subtitleColor: v || '#64748b' }) },
                            { label: __('Question text'),  value: a.questionColor, onChange: v => setAttributes({ questionColor: v || '#0f172a' }) },
                            { label: __('Yes button BG'),  value: a.yesBg,         onChange: v => setAttributes({ yesBg:         v || '#22c55e' }) },
                            { label: __('Yes button text'),value: a.yesText,       onChange: v => setAttributes({ yesText:       v || '#ffffff' }) },
                            { label: __('No button BG'),   value: a.noBg,          onChange: v => setAttributes({ noBg:          v || '#ef4444' }) },
                            { label: __('No button text'), value: a.noText,        onChange: v => setAttributes({ noText:        v || '#ffffff' }) },
                            { label: __('Back button BG'), value: a.backBg,        onChange: v => setAttributes({ backBg:        v || '#f1f5f9' }) },
                            { label: __('Back button text'),value: a.backText,     onChange: v => setAttributes({ backText:      v || '#374151' }) },
                            { label: __('Breadcrumb'),     value: a.breadcrumbColor, onChange: v => setAttributes({ breadcrumbColor: v || '#94a3b8' }) },
                            { label: __('Result text'),    value: a.resultTextColor, onChange: v => setAttributes({ resultTextColor: v || '#ffffff' }) },
                        ]
                    }),
                ),

                // ── Canvas ──────────────────────────────────────────
                a.showTitle && el('h3', { className: 'bkbg-dt-title', style: { color: a.titleColor, margin: '0 0 8px', textAlign: 'center' } }, a.title),
                a.showSubtitle && el('p', { className: 'bkbg-dt-subtitle', style: { color: a.subtitleColor, textAlign: 'center', margin: '0 0 28px' } }, a.subtitle),

                // Tree map (all question nodes as an overview)
                el('div', { className: 'bkbg-dt-node-map', style: { marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '8px' } },
                    a.nodes.map((node, i) =>
                        el('span', {
                            key: i,
                            style: {
                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                background: node.type === 'result' ? (node.resultColor || '#6c3fb5') : a.cardBg,
                                color: node.type === 'result' ? a.resultTextColor : a.questionColor,
                                border: '1px solid ' + (node.type === 'result' ? 'transparent' : a.cardBorder),
                                borderRadius: '8px', padding: '4px 10px', fontSize: '12px', fontWeight: 600
                            }
                        }, node.type === 'result' ? '🎯' : '❓', node.id)
                    )
                ),

                // Preview of root node
                renderPreviewNode(root, a),
            );
        },

        save: function ({ attributes: a }) {
            return el('div', window.wp.blockEditor.useBlockProps.save(),
                el('div', { className: 'bkbg-decision-tree-app', 'data-opts': JSON.stringify(a) })
            );
        }
    });
}() );

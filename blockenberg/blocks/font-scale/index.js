( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, SelectControl, ToggleControl, TextControl, Button } = window.wp.components;
    const { __ } = window.wp.i18n;

    var _fsTC, _fsTV;
    function _tc() { return _fsTC || (_fsTC = window.bkbgTypographyControl); }
    function _tv() { return _fsTV || (_fsTV = window.bkbgTypoCssVars); }

    const FONT_OPTIONS = [
        { value: 'inherit',                           label: 'Theme default' },
        { value: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', label: 'System UI (San Francisco / Segoe)' },
        { value: 'Georgia, "Times New Roman", serif',  label: 'Georgia (Serif)' },
        { value: '"Courier New", Courier, monospace',  label: 'Courier (Mono)' },
        { value: 'Arial, Helvetica, sans-serif',       label: 'Arial / Helvetica' },
        { value: '"Palatino Linotype", Palatino, serif', label: 'Palatino (Serif)' },
        { value: '"Trebuchet MS", sans-serif',          label: 'Trebuchet MS' },
        { value: 'Verdana, Geneva, sans-serif',         label: 'Verdana' },
    ];

    function updStep(steps, idx, field, val) {
        return steps.map((s, i) => i === idx ? { ...s, [field]: val } : s);
    }

    // ── Render the scale ──────────────────────────────────────────────
    function renderScale(a) {
        const ff = a.fontFamily === 'inherit' ? 'inherit' : a.fontFamily;
        return el('div', { className: 'bkbg-fs-scale' },
            a.steps.map((step, i) => {
                const metaEl = a.showMeta && el('div', {
                    className: 'bkbg-fs-meta',
                    style: { color: a.metaColor, fontSize: '12px', lineHeight: 1.6, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end', minWidth: '80px', paddingTop: '4px' }
                },
                    el('span', { style: { fontWeight: 600 } }, step.size + 'px'),
                    el('span', null, step.weight),
                    el('span', null, 'lh ' + step.lineHeight),
                );

                return el('div', {
                    key: i,
                    className: 'bkbg-fs-row',
                    style: {
                        display: 'flex', alignItems: 'flex-start', gap: '16px',
                        padding: '16px 0',
                        borderBottom: a.showDividers ? '1px solid ' + a.dividerColor : 'none',
                    }
                },
                    // Step name badge
                    el('div', {
                        style: {
                            background: a.nameBg, color: a.nameColor,
                            fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em',
                            padding: '3px 8px', borderRadius: '6px',
                            flexShrink: 0, alignSelf: 'flex-start', marginTop: '6px',
                            fontFamily: '-apple-system, sans-serif',
                            minWidth: '44px', textAlign: 'center',
                        }
                    }, step.name),
                    // Sample text
                    el('div', {
                        className: 'bkbg-fs-sample',
                        style: {
                            flex: 1,
                            fontFamily: ff,
                            fontSize: step.size + 'px',
                            fontWeight: step.weight,
                            lineHeight: step.lineHeight,
                            color: a.textColor,
                            wordBreak: 'break-word',
                            minWidth: 0,
                        }
                    }, step.text),
                    // Meta (right side)
                    a.metaPosition === 'right' && metaEl,
                );
            })
        );
    }

    function wrapStyle(a) {
        return Object.assign(
            { background: a.bgColor, borderRadius: a.borderRadius + 'px', paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px', paddingLeft: '36px', paddingRight: '36px' },
            _tv()(a.typoTitle, '--bkbg-fs-tt-'),
            _tv()(a.typoSubtitle, '--bkbg-fs-ts-')
        );
    }

    registerBlockType('blockenberg/font-scale', {
        edit: function ({ attributes: a, setAttributes }) {
            const blockProps = useBlockProps({ style: wrapStyle(a) });
            return el('div', blockProps,
                el(InspectorControls, {},
                    el(PanelBody, { title: __('Content'), initialOpen: true },
                        el(TextControl, { label: __('Title'), value: a.title, onChange: v => setAttributes({ title: v }) }),
                        el(ToggleControl, { label: __('Show title'), checked: a.showTitle, onChange: v => setAttributes({ showTitle: v }) }),
                        el(TextControl, { label: __('Subtitle'), value: a.subtitle, onChange: v => setAttributes({ subtitle: v }) }),
                        el(ToggleControl, { label: __('Show subtitle'), checked: a.showSubtitle, onChange: v => setAttributes({ showSubtitle: v }) }),
                        el(ToggleControl, { label: __('Show size/weight meta'), checked: a.showMeta, onChange: v => setAttributes({ showMeta: v }) }),
                        el(ToggleControl, { label: __('Show row dividers'), checked: a.showDividers, onChange: v => setAttributes({ showDividers: v }) }),
                    ),
                    el(PanelBody, { title: __('Scale Steps'), initialOpen: false },
                        a.steps.map((step, i) =>
                            el(PanelBody, { key: i, title: step.name + ' — ' + step.size + 'px', initialOpen: false },
                                el(TextControl, { label: __('Step name'), value: step.name, onChange: v => setAttributes({ steps: updStep(a.steps, i, 'name', v) }) }),
                                el(RangeControl, { label: __('Size (px)'), value: step.size, min: 8, max: 128, onChange: v => setAttributes({ steps: updStep(a.steps, i, 'size', v) }) }),
                                el(RangeControl, { label: __('Weight'), value: step.weight, min: 100, max: 900, step: 100, onChange: v => setAttributes({ steps: updStep(a.steps, i, 'weight', v) }) }),
                                el(RangeControl, { label: __('Line height (×10)'), value: Math.round(step.lineHeight * 10), min: 8, max: 25, onChange: v => setAttributes({ steps: updStep(a.steps, i, 'lineHeight', v / 10) }) }),
                                el(TextControl, { label: __('Sample text'), value: step.text, onChange: v => setAttributes({ steps: updStep(a.steps, i, 'text', v) }) }),
                                el(Button, { variant: 'secondary', isDestructive: true, onClick: () => { const s = a.steps.slice(); s.splice(i, 1); setAttributes({ steps: s }); } }, __('Remove step')),
                            )
                        ),
                        el(Button, { variant: 'primary', onClick: () => setAttributes({ steps: a.steps.concat([{ name: 'new', size: 16, weight: 400, lineHeight: 1.5, text: 'Sample text' }]) }) }, __('+ Add step')),
                    ),
                    el(PanelBody, { title: __('Spacing & Style'), initialOpen: false },
                        el(RangeControl, { label: __('Border radius'), value: a.borderRadius, min: 0, max: 32, onChange: v => setAttributes({ borderRadius: v }) }),
                        el(RangeControl, { label: __('Padding top'), value: a.paddingTop, min: 0, max: 120, onChange: v => setAttributes({ paddingTop: v }) }),
                        el(RangeControl, { label: __('Padding bottom'), value: a.paddingBottom, min: 0, max: 120, onChange: v => setAttributes({ paddingBottom: v }) }),
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el(SelectControl, { label: __('Specimen Font Family'), value: a.fontFamily, options: FONT_OPTIONS, onChange: v => setAttributes({ fontFamily: v }) }),
                        _tc()({ label: __('Title', 'blockenberg'), value: a.typoTitle, onChange: v => setAttributes({ typoTitle: v }) }),
                        _tc()({ label: __('Subtitle', 'blockenberg'), value: a.typoSubtitle, onChange: v => setAttributes({ typoSubtitle: v }) })
                    ),
el(PanelColorSettings, {
                        title: __('Colors'), initialOpen: false,
                        colorSettings: [
                            { label: __('Background'),   value: a.bgColor,       onChange: v => setAttributes({ bgColor:       v || '#ffffff' }) },
                            { label: __('Title'),        value: a.titleColor,    onChange: v => setAttributes({ titleColor:    v || '#0f172a' }) },
                            { label: __('Subtitle'),     value: a.subtitleColor, onChange: v => setAttributes({ subtitleColor: v || '#64748b' }) },
                            { label: __('Sample text'),  value: a.textColor,     onChange: v => setAttributes({ textColor:     v || '#0f172a' }) },
                            { label: __('Meta text'),    value: a.metaColor,     onChange: v => setAttributes({ metaColor:     v || '#94a3b8' }) },
                            { label: __('Name badge BG'),value: a.nameBg,        onChange: v => setAttributes({ nameBg:        v || '#f1f5f9' }) },
                            { label: __('Name badge text'), value: a.nameColor,  onChange: v => setAttributes({ nameColor:     v || '#475569' }) },
                            { label: __('Divider'),      value: a.dividerColor,  onChange: v => setAttributes({ dividerColor:  v || '#f1f5f9' }) },
                        ]
                    }),
                ),

                a.showTitle && el('h3', { className: 'bkbg-fs-title', style: { color: a.titleColor, margin: '0 0 8px' } }, a.title),
                a.showSubtitle && el('p', { className: 'bkbg-fs-subtitle', style: { color: a.subtitleColor, margin: '0 0 24px' } }, a.subtitle),
                renderScale(a),
            );
        },

        save: function ({ attributes: a }) {
            return el('div', { className: 'bkbg-fs-wrap', style: wrapStyle(a) },
                a.showTitle && el('h3', { className: 'bkbg-fs-title', style: { color: a.titleColor, margin: '0 0 8px' } }, a.title),
                a.showSubtitle && el('p', { className: 'bkbg-fs-subtitle', style: { color: a.subtitleColor, margin: '0 0 24px' } }, a.subtitle),
                renderScale(a),
            );
        }
    });
}() );

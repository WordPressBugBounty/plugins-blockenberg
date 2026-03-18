( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var Button = wp.components.Button;

    var _tc, _tvf;
    Object.defineProperty(window, '_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, key, attrs, setA) { return _tc(label, key, attrs, setA); }
    function getTypoCssVars(attrs) {
        var v = {};
        _tvf(v, 'labelTypo', attrs, '--bkupn-lb-');
        _tvf(v, 'summaryTypo', attrs, '--bkupn-sm-');
        return v;
    }

    var TYPES = [
        { value: 'updated',    icon: '🔄', label: 'Updated' },
        { value: 'corrected',  icon: '✏️',  label: 'Correction' },
        { value: 'added',      icon: '➕',  label: 'Addition' },
        { value: 'deprecated', icon: '⚠️',  label: 'Deprecated' },
        { value: 'reviewed',   icon: '✅',  label: 'Reviewed' }
    ];

    function getType(val) {
        return TYPES.find(function (t) { return t.value === val; }) || TYPES[0];
    }

    registerBlockType('blockenberg/update-notice', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;
            var t = getType(attr.type);

            var blockProps = useBlockProps((function () { var _tv = getTypoCssVars(attr); var s = {}; Object.assign(s, _tv); s.padding = attr.paddingTop + 'px 0 ' + attr.paddingBottom + 'px'; return { style: s }; })());

            function updateHistory(idx, key, val) {
                var arr = (attr.history || []).map(function (h, i) {
                    if (i !== idx) return h;
                    var c = Object.assign({}, h); c[key] = val; return c;
                });
                set({ history: arr });
            }

            var wrapStyle = {
                background: attr.bgColor,
                borderRadius: attr.borderRadius + 'px',
                overflow: 'hidden'
            };
            if (attr.style === 'banner') {
                wrapStyle.borderLeft = '4px solid ' + attr.accentColor;
                wrapStyle.padding = '12px 16px';
            } else if (attr.style === 'box') {
                wrapStyle.border = '1px solid ' + attr.borderColor;
                wrapStyle.borderLeft = '4px solid ' + attr.accentColor;
                wrapStyle.padding = '14px 18px';
            } else {
                /* pill / inline */
                wrapStyle.display = 'inline-flex';
                wrapStyle.alignItems = 'center';
                wrapStyle.gap = '8px';
                wrapStyle.padding = '6px 14px';
                wrapStyle.border = '1px solid ' + attr.borderColor;
            }

            var topRow = el('div', { style: { display: 'flex', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap' } },
                el('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 } },
                    el('span', { style: { fontSize: '16px' } }, t.icon),
                    el('span', { className: 'bkbg-upn-label', style: { color: attr.labelColor } }, t.label + ':'))
                ),
                attr.primaryDate && el('span', { className: 'bkbg-upn-date', style: { color: attr.dateColor } }, attr.primaryDate),
                attr.showOriginalDate && attr.originalPublishDate && el('span', { style: { fontSize: '12px', color: attr.textColor, opacity: 0.7 } }, '(originally published ' + attr.originalPublishDate + ')')
            );

            var summaryEl = el(RichText, { tagName: 'p', className: 'bkbg-upn-summary', value: attr.primarySummary, allowedFormats: ['core/bold', 'core/italic', 'core/link'], placeholder: __('Describe what was updated or corrected…', 'blockenberg'), style: { margin: attr.style === 'pill' ? '0' : '8px 0 0', color: attr.textColor }, onChange: function (v) { set({ primarySummary: v }); } });

            var historyEl = attr.showHistory && (attr.history || []).length > 0 && el('div', { style: { marginTop: '12px', paddingTop: '10px', borderTop: '1px solid ' + attr.borderColor } },
                el('div', { style: { fontSize: '11px', fontWeight: 600, color: attr.labelColor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' } }, __('Change History', 'blockenberg')),
                el('ul', { style: { margin: 0, paddingLeft: '16px' } },
                    (attr.history || []).map(function (h, i) {
                        return el('li', { key: i, style: { fontSize: '12px', color: attr.historyTextColor, marginBottom: '4px' } },
                            el('strong', {}, h.date + ': '),
                            h.summary
                        );
                    })
                )
            );

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Notice', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Notice Type', 'blockenberg'), value: attr.type, __nextHasNoMarginBottom: true,
                        options: TYPES.map(function (t) { return { label: t.icon + ' ' + t.label, value: t.value }; }),
                        onChange: function (v) { set({ type: v }); }
                    }),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Update Date', 'blockenberg'), value: attr.primaryDate, placeholder: 'e.g. February 24, 2026', __nextHasNoMarginBottom: true, onChange: function (v) { set({ primaryDate: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(ToggleControl, { label: __('Show Original Publish Date', 'blockenberg'), checked: attr.showOriginalDate, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showOriginalDate: v }); } })
                    ),
                    attr.showOriginalDate && el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Original Publish Date', 'blockenberg'), value: attr.originalPublishDate, placeholder: 'e.g. January 10, 2025', __nextHasNoMarginBottom: true, onChange: function (v) { set({ originalPublishDate: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Change History', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Change History', 'blockenberg'), checked: attr.showHistory, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showHistory: v }); } }),
                    attr.showHistory && el('div', { style: { marginTop: '10px' } },
                        (attr.history || []).map(function (h, idx) {
                            return el('div', { key: idx, style: { marginBottom: '10px', padding: '8px', background: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' } },
                                el(TextControl, { label: __('Date', 'blockenberg'), value: h.date, placeholder: 'Feb 10, 2026', __nextHasNoMarginBottom: true, onChange: function (v) { updateHistory(idx, 'date', v); } }),
                                el('div', { style: { marginTop: '4px' } },
                                    el(TextareaControl, { label: __('Summary', 'blockenberg'), value: h.summary, rows: 2, __nextHasNoMarginBottom: true, onChange: function (v) { updateHistory(idx, 'summary', v); } })
                                ),
                                el(Button, { variant: 'link', isDestructive: true, style: { fontSize: '11px' }, onClick: function () { set({ history: (attr.history || []).filter(function (_, i) { return i !== idx; }) }); } }, __('Remove', 'blockenberg'))
                            );
                        }),
                        el(Button, { variant: 'secondary', style: { marginTop: '4px' }, onClick: function () { set({ history: (attr.history || []).concat([{ date: '', summary: '' }]) }); } }, __('+ Add History Entry', 'blockenberg'))
                    )
                ),
                el(PanelBody, { title: __('Style', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Style', 'blockenberg'), value: attr.style, __nextHasNoMarginBottom: true,
                        options: [{ label: 'Banner (left accent strip)', value: 'banner' }, { label: 'Box (full border)', value: 'box' }, { label: 'Pill (compact inline)', value: 'pill' }],
                        onChange: function (v) { set({ style: v }); }
                    }),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Border Radius', 'blockenberg'), value: attr.borderRadius, min: 0, max: 20, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: attr.paddingTop, min: 0, max: 80, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingTop: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 80, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingBottom: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl(__('Label / Date', 'blockenberg'), 'labelTypo', attr, set),
                    getTypoControl(__('Summary', 'blockenberg'), 'summaryTypo', attr, set)
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { set({ bgColor: v || '#eff6ff' }); } },
                        { label: __('Border', 'blockenberg'), value: attr.borderColor, onChange: function (v) { set({ borderColor: v || '#bfdbfe' }); } },
                        { label: __('Accent', 'blockenberg'), value: attr.accentColor, onChange: function (v) { set({ accentColor: v || '#2563eb' }); } },
                        { label: __('Label', 'blockenberg'), value: attr.labelColor, onChange: function (v) { set({ labelColor: v || '#1d4ed8' }); } },
                        { label: __('Date', 'blockenberg'), value: attr.dateColor, onChange: function (v) { set({ dateColor: v || '#3b82f6' }); } },
                        { label: __('Text', 'blockenberg'), value: attr.textColor, onChange: function (v) { set({ textColor: v || '#1e3a8a' }); } },
                        { label: __('History Text', 'blockenberg'), value: attr.historyTextColor, onChange: function (v) { set({ historyTextColor: v || '#1e40af' }); } }
                    ]
                })
            );

            return el('div', blockProps,
                controls,
                el('div', { style: wrapStyle },
                    topRow,
                    attr.style !== 'pill' && summaryEl,
                    attr.style !== 'pill' && historyEl
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save((function () { var _tv = getTypoCssVars(attr); var s = {}; Object.assign(s, _tv); return { style: s }; })()),
                el('div', { className: 'bkbg-upn-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );

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
    var Button = wp.components.Button;

    var _evrTC, _evrTV;
    function _tc() { return _evrTC || (_evrTC = window.bkbgTypographyControl); }
    function _tv(t, p) { return (_evrTV || (_evrTV = window.bkbgTypoCssVars)) ? _evrTV(t, p) : {}; }
    var IP = function () { return window.bkbgIconPicker; };

    function updateArr(arr, idx, key, val) {
        return arr.map(function (item, i) {
            if (i !== idx) return item;
            var c = Object.assign({}, item); c[key] = val; return c;
        });
    }

    registerBlockType('blockenberg/event-recap', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;
            var stats = attr.stats || [];
            var highlights = attr.highlights || [];

            var blockProps = useBlockProps({ style: Object.assign({ padding: attr.paddingTop + 'px 0 ' + attr.paddingBottom + 'px', background: attr.bgColor, borderRadius: attr.borderRadius + 'px', overflow: 'hidden' },
                _tv(attr.typoTitle || {}, '--bkbg-evr-ttl-'),
                _tv(attr.typoSummary || {}, '--bkbg-evr-sm-')
            ) });

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Event Info', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, { label: __('Show Date & Location', 'blockenberg'), checked: attr.showMeta, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showMeta: v }); } }),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Summary', 'blockenberg'), checked: attr.showSummary, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showSummary: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Stats Bar', 'blockenberg'), checked: attr.showStats, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showStats: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Highlights', 'blockenberg'), checked: attr.showHighlights, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showHighlights: v }); } })
                    ),
                    attr.showHighlights && el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Highlights Label', 'blockenberg'), value: attr.highlightsLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ highlightsLabel: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Next Event', 'blockenberg'), checked: attr.showNextEvent, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showNextEvent: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Border Radius', 'blockenberg'), value: attr.borderRadius, min: 0, max: 30, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } }),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: attr.paddingTop, min: 0, max: 100, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingTop: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 100, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingBottom: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    _tc() && el(_tc(), { label: 'Event Title', typo: attr.typoTitle || {}, onChange: function (v) { set({ typoTitle: v }); } }),
                    _tc() && el(_tc(), { label: 'Summary', typo: attr.typoSummary || {}, onChange: function (v) { set({ typoSummary: v }); } })
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { set({ bgColor: v || '#f8fafc' }); } },
                        { label: __('Border', 'blockenberg'), value: attr.borderColor, onChange: function (v) { set({ borderColor: v || '#e2e8f0' }); } },
                        { label: __('Accent', 'blockenberg'), value: attr.accentColor, onChange: function (v) { set({ accentColor: v || '#7c3aed' }); } },
                        { label: __('Header Background', 'blockenberg'), value: attr.headerBg, onChange: function (v) { set({ headerBg: v || '#7c3aed' }); } },
                        { label: __('Event Title', 'blockenberg'), value: attr.titleColor, onChange: function (v) { set({ titleColor: v || '#ffffff' }); } },
                        { label: __('Date / Location', 'blockenberg'), value: attr.metaColor, onChange: function (v) { set({ metaColor: v || '#ddd6fe' }); } },
                        { label: __('Summary Text', 'blockenberg'), value: attr.summaryColor, onChange: function (v) { set({ summaryColor: v || '#374151' }); } },
                        { label: __('Stats Bar BG', 'blockenberg'), value: attr.statsBg, onChange: function (v) { set({ statsBg: v || '#7c3aed' }); } },
                        { label: __('Stat Number', 'blockenberg'), value: attr.statNumColor, onChange: function (v) { set({ statNumColor: v || '#ffffff' }); } },
                        { label: __('Stat Label', 'blockenberg'), value: attr.statLabelColor, onChange: function (v) { set({ statLabelColor: v || '#ddd6fe' }); } },
                        { label: __('Highlight BG', 'blockenberg'), value: attr.highlightBg, onChange: function (v) { set({ highlightBg: v || '#ffffff' }); } },
                        { label: __('Highlight Border', 'blockenberg'), value: attr.highlightBorder, onChange: function (v) { set({ highlightBorder: v || '#e2e8f0' }); } },
                        { label: __('Highlight Text', 'blockenberg'), value: attr.highlightColor, onChange: function (v) { set({ highlightColor: v || '#374151' }); } },
                        { label: __('Next Event BG', 'blockenberg'), value: attr.nextBg, onChange: function (v) { set({ nextBg: v || '#ede9fe' }); } },
                        { label: __('Next Event Text', 'blockenberg'), value: attr.nextTextColor, onChange: function (v) { set({ nextTextColor: v || '#5b21b6' }); } }
                    ]
                })
            );

            /* Header */
            var headerEl = el('div', { style: { background: attr.headerBg, padding: '24px 24px 20px' } },
                el(RichText, { tagName: 'h2', className: 'bkbg-evr-title', value: attr.eventName, allowedFormats: ['core/bold'], placeholder: __('Event Name', 'blockenberg'), style: { margin: '0 0 8px', color: attr.titleColor }, onChange: function (v) { set({ eventName: v }); } }),
                attr.showMeta && el('div', { style: { display: 'flex', gap: '16px', flexWrap: 'wrap' } },
                    el(TextControl, { value: attr.eventDate, label: '', placeholder: '📅 Date', __nextHasNoMarginBottom: true, style: { color: attr.metaColor, fontSize: '14px', width: '180px' }, onChange: function (v) { set({ eventDate: v }); } }),
                    el(TextControl, { value: attr.eventLocation, label: '', placeholder: '📍 Location', __nextHasNoMarginBottom: true, style: { color: attr.metaColor, fontSize: '14px', width: '200px' }, onChange: function (v) { set({ eventLocation: v }); } })
                )
            );

            /* Stats */
            var statsEl = attr.showStats && el('div', { style: { background: attr.statsBg, padding: '2px 24px' } },
                el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(' + Math.min(stats.length, 4) + ', 1fr)', gap: '2px' } },
                    stats.map(function (s, idx) {
                        return el('div', { key: idx, style: { textAlign: 'center', padding: '16px 8px' } },
                            el(TextControl, { value: s.number, label: '', placeholder: '0', __nextHasNoMarginBottom: true, style: { fontWeight: 800, fontSize: '26px', color: attr.statNumColor, textAlign: 'center' }, onChange: function (v) { set({ stats: updateArr(stats, idx, 'number', v) }); } }),
                            el(TextControl, { value: s.label, label: '', placeholder: __('Label', 'blockenberg'), __nextHasNoMarginBottom: true, style: { fontSize: '11px', color: attr.statLabelColor, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }, onChange: function (v) { set({ stats: updateArr(stats, idx, 'label', v) }); } }),
                            el(Button, { variant: 'link', isDestructive: true, style: { fontSize: '10px', color: attr.statLabelColor }, onClick: function () { set({ stats: stats.filter(function (_, i) { return i !== idx; }) }); } }, '×')
                        );
                    }),
                    el('div', { style: { textAlign: 'center', padding: '16px 8px' } },
                        el(Button, { variant: 'secondary', isSmall: true, onClick: function () { set({ stats: stats.concat([{ number: '0', label: 'Metric' }]) }); } }, '+')
                    )
                )
            );

            /* Body */
            var bodyEl = el('div', { style: { padding: '20px 24px' } },
                attr.showSummary && el(RichText, { tagName: 'p', className: 'bkbg-evr-summary', value: attr.summary, allowedFormats: ['core/bold', 'core/italic', 'core/link'], placeholder: __('Event summary paragraph…', 'blockenberg'), style: { margin: '0 0 20px', color: attr.summaryColor }, onChange: function (v) { set({ summary: v }); } }),
                attr.showHighlights && el('div', {},
                    el('div', { style: { fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: attr.accentColor, marginBottom: '12px' } }, attr.highlightsLabel || 'Key Highlights'),
                    el('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
                        highlights.map(function (h, idx) {
                            return el('div', { key: idx, style: { display: 'flex', alignItems: 'center', gap: '10px', background: attr.highlightBg, border: '1px solid ' + attr.highlightBorder, borderRadius: '8px', padding: '10px 14px' } },
                                el('div', { style: { flexShrink: 0 } },
                                    el(IP().IconPickerControl, {
                                        iconType: h.iconType, customChar: h.icon, dashicon: h.iconDashicon, imageUrl: h.iconImageUrl,
                                        onChangeType: function (v) { set({ highlights: updateArr(highlights, idx, 'iconType', v) }); },
                                        onChangeChar: function (v) { set({ highlights: updateArr(highlights, idx, 'icon', v) }); },
                                        onChangeDashicon: function (v) { set({ highlights: updateArr(highlights, idx, 'iconDashicon', v) }); },
                                        onChangeImageUrl: function (v) { set({ highlights: updateArr(highlights, idx, 'iconImageUrl', v) }); }
                                    })
                                ),
                                el(TextControl, { value: h.text, label: '', placeholder: __('Highlight text…', 'blockenberg'), __nextHasNoMarginBottom: true, style: { flex: '1', fontSize: '14px', color: attr.highlightColor }, onChange: function (v) { set({ highlights: updateArr(highlights, idx, 'text', v) }); } }),
                                el(Button, { variant: 'link', isDestructive: true, style: { fontSize: '11px' }, onClick: function () { set({ highlights: highlights.filter(function (_, i) { return i !== idx; }) }); } }, '×')
                            );
                        }),
                        el(Button, { variant: 'secondary', style: { marginTop: '6px' }, onClick: function () { set({ highlights: highlights.concat([{ icon: '⭐', text: '', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '' }]) }); } }, __('+ Add Highlight', 'blockenberg'))
                    )
                ),
                attr.showNextEvent && el('div', { style: { marginTop: '20px', background: attr.nextBg, borderRadius: '8px', padding: '12px 16px' } },
                    el(TextControl, { value: attr.nextEventInfo, label: __('Next Event Info', 'blockenberg'), placeholder: __('Next event: March 2027 — Berlin', 'blockenberg'), __nextHasNoMarginBottom: true, style: { color: attr.nextTextColor, fontSize: '14px', fontWeight: 600 }, onChange: function (v) { set({ nextEventInfo: v }); } })
                )
            );

            return el('div', blockProps,
                controls,
                headerEl,
                statsEl,
                bodyEl
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-evr-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );

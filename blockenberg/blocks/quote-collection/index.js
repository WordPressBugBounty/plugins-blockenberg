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
    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var LAYOUT_OPTIONS = [
        { value: 'grid', label: 'Grid' },
        { value: 'list', label: 'List (single column)' },
        { value: 'masonry', label: 'Masonry (CSS columns)' }
    ];

    var STYLE_OPTIONS = [
        { value: 'classic',   label: 'Classic (large quote mark)' },
        { value: 'minimal',   label: 'Minimal (no border)' },
        { value: 'highlight', label: 'Highlight (accent left border)' },
        { value: 'card',      label: 'Card (shadow + border)' }
    ];

    function emptyQuote() { return { text: '', author: '', role: '', source: '' }; }

    registerBlockType('blockenberg/quote-collection', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;
            var quotes = attr.quotes || [emptyQuote()];
            var TC = getTypoControl();

            var blockProps = useBlockProps({ style: { background: attr.bgColor, paddingTop: attr.paddingTop + 'px', paddingBottom: attr.paddingBottom + 'px' } });

            function updateQuote(idx, field, val) {
                set({ quotes: quotes.map(function (q, i) {
                    if (i !== idx) return q;
                    var patch = {}; patch[field] = val;
                    return Object.assign({}, q, patch);
                }) });
            }

            var gridStyle = {};
            if (attr.layout === 'grid') {
                gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(' + attr.columns + ', 1fr)', gap: attr.gap + 'px' };
            } else if (attr.layout === 'list') {
                gridStyle = { display: 'flex', flexDirection: 'column', gap: attr.gap + 'px' };
            } else if (attr.layout === 'masonry') {
                gridStyle = { columnCount: attr.columns, columnGap: attr.gap + 'px' };
            }

            function cardStyle() {
                var s = {
                    background: attr.cardBg,
                    borderRadius: attr.cardRadius + 'px',
                    padding: '20px 22px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxSizing: 'border-box'
                };
                if (attr.quoteStyle === 'classic') {
                    s.border = '1px solid ' + attr.cardBorder;
                } else if (attr.quoteStyle === 'minimal') {
                    /* no extra border */
                } else if (attr.quoteStyle === 'highlight') {
                    s.borderLeft = '4px solid ' + attr.accentColor;
                    s.border = '1px solid ' + attr.cardBorder;
                } else if (attr.quoteStyle === 'card') {
                    s.border = '1px solid ' + attr.cardBorder;
                    s.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                }
                return s;
            }

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                    el(SelectControl, { label: __('Layout', 'blockenberg'), value: attr.layout, options: LAYOUT_OPTIONS, __nextHasNoMarginBottom: true, onChange: function (v) { set({ layout: v }); } }),
                    el('div', { style: { marginTop: '10px' } },
                        el(RangeControl, { label: __('Columns', 'blockenberg'), value: attr.columns, min: 1, max: 4, __nextHasNoMarginBottom: true, onChange: function (v) { set({ columns: v }); } })
                    ),
                    el('div', { style: { marginTop: '10px' } },
                        el(RangeControl, { label: __('Gap', 'blockenberg'), value: attr.gap, min: 0, max: 60, __nextHasNoMarginBottom: true, onChange: function (v) { set({ gap: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(SelectControl, { label: __('Card Style', 'blockenberg'), value: attr.quoteStyle, options: STYLE_OPTIONS, __nextHasNoMarginBottom: true, onChange: function (v) { set({ quoteStyle: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(RangeControl, { label: __('Card Radius', 'blockenberg'), value: attr.cardRadius, min: 0, max: 30, __nextHasNoMarginBottom: true, onChange: function (v) { set({ cardRadius: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Decorative Quote Mark', 'blockenberg'), checked: attr.showQuoteMark, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showQuoteMark: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    TC && el(TC, { label: __('Quote Text', 'blockenberg'), value: attr.quoteTypo || {}, onChange: function (v) { set({ quoteTypo: v }); } }),
                    TC && el(TC, { label: __('Author', 'blockenberg'), value: attr.authorTypo || {}, onChange: function (v) { set({ authorTypo: v }); } })
                ),
                el(PanelBody, { title: __('Section Header', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Section Header', 'blockenberg'), checked: attr.showHeader, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showHeader: v }); } }),
                    attr.showHeader && el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Title', 'blockenberg'), value: attr.sectionTitle, __nextHasNoMarginBottom: true, onChange: function (v) { set({ sectionTitle: v }); } })
                    ),
                    attr.showHeader && el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Subtitle', 'blockenberg'), value: attr.sectionSubtitle, __nextHasNoMarginBottom: true, onChange: function (v) { set({ sectionSubtitle: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: attr.paddingTop, min: 0, max: 120, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingTop: v }); } }),
                    el('div', { style: { marginTop: '10px' } },
                        el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 120, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingBottom: v }); } })
                    )
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Section Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { set({ bgColor: v || '#f8f9fa' }); } },
                        { label: __('Card Background', 'blockenberg'), value: attr.cardBg, onChange: function (v) { set({ cardBg: v || '#ffffff' }); } },
                        { label: __('Card Border', 'blockenberg'), value: attr.cardBorder, onChange: function (v) { set({ cardBorder: v || '#e9ecef' }); } },
                        { label: __('Accent', 'blockenberg'), value: attr.accentColor, onChange: function (v) { set({ accentColor: v || '#6366f1' }); } },
                        { label: __('Quote Mark Decoration', 'blockenberg'), value: attr.quoteMarkColor, onChange: function (v) { set({ quoteMarkColor: v || '#e0e7ff' }); } },
                        { label: __('Quote Text', 'blockenberg'), value: attr.quoteColor, onChange: function (v) { set({ quoteColor: v || '#111827' }); } },
                        { label: __('Author Name', 'blockenberg'), value: attr.authorColor, onChange: function (v) { set({ authorColor: v || '#374151' }); } },
                        { label: __('Author Role', 'blockenberg'), value: attr.roleColor, onChange: function (v) { set({ roleColor: v || '#9ca3af' }); } },
                        { label: __('Section Title', 'blockenberg'), value: attr.titleColor, onChange: function (v) { set({ titleColor: v || '#111827' }); } },
                        { label: __('Section Subtitle', 'blockenberg'), value: attr.subtitleColor, onChange: function (v) { set({ subtitleColor: v || '#6b7280' }); } }
                    ]
                })
            );

            var header = attr.showHeader && el('div', { style: { textAlign: 'center', marginBottom: '28px' } },
                attr.sectionTitle && el('h2', { style: { margin: '0 0 6px', fontSize: '26px', fontWeight: 800, color: attr.titleColor } }, attr.sectionTitle),
                attr.sectionSubtitle && el('p', { style: { margin: 0, fontSize: '15px', color: attr.subtitleColor } }, attr.sectionSubtitle)
            );

            var quoteCards = el('div', { style: gridStyle },
                quotes.map(function (q, idx) {
                    return el('div', { key: idx, style: Object.assign({ marginBottom: attr.layout === 'masonry' ? attr.gap + 'px' : 0 }, cardStyle()) },
                        attr.showQuoteMark && el('div', { style: { fontSize: '64px', fontFamily: 'Georgia, serif', lineHeight: 0.8, color: attr.quoteMarkColor, marginBottom: '8px', userSelect: 'none', pointerEvents: 'none' } }, '"'),
                        el(RichText, { tagName: 'p', value: q.text, allowedFormats: ['core/bold', 'core/italic'], placeholder: __('Quote text\u2026', 'blockenberg'), className: 'bkbg-qcl-text', style: { margin: '0 0 14px', color: attr.quoteColor, fontStyle: attr.quoteStyle === 'classic' ? 'italic' : 'normal' }, onChange: function (v) { updateQuote(idx, 'text', v); } }),
                        el(TextControl, { value: q.author, label: '', placeholder: __('Author name', 'blockenberg'), __nextHasNoMarginBottom: true, className: 'bkbg-qcl-author', style: { color: attr.authorColor }, onChange: function (v) { updateQuote(idx, 'author', v); } }),
                        el(TextControl, { value: q.role, label: '', placeholder: __('Role / Title', 'blockenberg'), __nextHasNoMarginBottom: true, style: { fontSize: '12px', color: attr.roleColor }, onChange: function (v) { updateQuote(idx, 'role', v); } }),
                        el(TextControl, { value: q.source, label: '', placeholder: __('Source (optional)', 'blockenberg'), __nextHasNoMarginBottom: true, style: { fontSize: '11px', color: attr.roleColor }, onChange: function (v) { updateQuote(idx, 'source', v); } }),
                        el('div', { style: { marginTop: '10px', textAlign: 'right' } },
                            el(Button, { isSmall: true, isDestructive: true, variant: 'tertiary', onClick: function () { set({ quotes: quotes.filter(function (_, i) { return i !== idx; }) }); } }, '× Remove')
                        )
                    );
                })
            );

            return el('div', blockProps,
                controls,
                el('div', { style: { maxWidth: '100%' } },
                    header,
                    quoteCards,
                    el('div', { style: { marginTop: '14px', textAlign: 'center' } },
                        el(Button, { variant: 'primary', isSmall: true, onClick: function () {
                            set({ quotes: quotes.concat([emptyQuote()]) });
                        } }, '+ Add Quote')
                    )
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-qcl-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );

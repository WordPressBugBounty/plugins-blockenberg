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

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    registerBlockType('blockenberg/sources-references', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;

            var blockProps = useBlockProps((function () {
                var _tv = getTypoCssVars();
                var s = { background: attr.bgColor };
                if (_tv) {
                    Object.assign(s, _tv(attr.labelTypo, '--bksrc-lb-'));
                    Object.assign(s, _tv(attr.refTypo, '--bksrc-rf-'));
                }
                return { style: s };
            })());

            function updateRef(idx, key, value) {
                var arr = attr.references.map(function (r, i) {
                    if (i !== idx) return r;
                    var copy = Object.assign({}, r);
                    copy[key] = value;
                    return copy;
                });
                set({ references: arr });
            }

            function RefEditor(ref, idx) {
                return el('div', { key: idx, style: { border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', marginBottom: '8px', background: '#f8fafc' } },
                    el('strong', { style: { fontSize: '11px', color: '#6366f1' } }, '[' + (idx + 1) + '] ' + (ref.title || 'Reference')),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Title', 'blockenberg'), value: ref.title, __nextHasNoMarginBottom: true, onChange: function (v) { updateRef(idx, 'title', v); } })
                    ),
                    el('div', { style: { marginTop: '6px' } },
                        el(TextControl, { label: __('Author(s)', 'blockenberg'), value: ref.author, __nextHasNoMarginBottom: true, onChange: function (v) { updateRef(idx, 'author', v); } })
                    ),
                    el('div', { style: { marginTop: '6px' } },
                        el(TextControl, { label: __('Publication / Source', 'blockenberg'), value: ref.publication, __nextHasNoMarginBottom: true, onChange: function (v) { updateRef(idx, 'publication', v); } })
                    ),
                    el('div', { style: { marginTop: '6px' } },
                        el(TextControl, { label: __('URL', 'blockenberg'), value: ref.url, placeholder: 'https://...', __nextHasNoMarginBottom: true, onChange: function (v) { updateRef(idx, 'url', v); } })
                    ),
                    el('div', { style: { marginTop: '6px' } },
                        el(TextControl, { label: __('Access Date', 'blockenberg'), value: ref.accessDate, placeholder: 'e.g. March 2025', __nextHasNoMarginBottom: true, onChange: function (v) { updateRef(idx, 'accessDate', v); } })
                    ),
                    el('div', { style: { marginTop: '6px' } },
                        el(TextareaControl, { label: __('Note (optional)', 'blockenberg'), value: ref.note, rows: 2, __nextHasNoMarginBottom: true, onChange: function (v) { updateRef(idx, 'note', v); } })
                    ),
                    el(Button, { variant: 'link', isDestructive: true, style: { marginTop: '6px' }, onClick: function () { set({ references: attr.references.filter(function (_, i) { return i !== idx; }) }); } }, __('Remove', 'blockenberg'))
                );
            }

            /* Preview one reference line */
            function RefPreview(ref, idx) {
                var numStyle = { color: attr.numberColor, fontWeight: 700, minWidth: '28px', flexShrink: 0 };

                if (attr.style === 'academic') {
                    return el('div', { key: idx, className: 'bkbg-src-item', style: { display: 'flex', gap: '8px', marginBottom: '12px', lineHeight: '1.6' } },
                        el('span', { className: 'bkbg-src-num', style: numStyle }, '[' + (idx + 1) + ']'),
                        el('div', {},
                            attr.showAuthor && ref.author && el('span', { style: { fontStyle: 'italic', color: attr.authorColor } }, ref.author + '. '),
                            el('span', { style: { color: attr.titleColor, fontWeight: 600 } }, '"' + ref.title + '."'),
                            attr.showPublication && ref.publication && el('span', { style: { color: attr.pubColor } }, ' ' + ref.publication + '.'),
                            attr.showDate && ref.accessDate && el('span', { style: { color: attr.pubColor } }, ' Accessed ' + ref.accessDate + '.'),
                            ' ',
                            attr.showUrl && ref.url && el('a', { href: '#', style: { color: attr.urlColor, wordBreak: 'break-all' } }, ref.url)
                        )
                    );
                }
                if (attr.style === 'cards') {
                    return el('div', { key: idx, className: 'bkbg-src-item', style: { background: attr.cardBg, border: '1px solid ' + attr.borderColor, borderRadius: attr.borderRadius + 'px', padding: '14px 16px', marginBottom: '10px', display: 'flex', gap: '12px' } },
                        el('span', { className: 'bkbg-src-num', style: Object.assign({ alignSelf: 'flex-start', marginTop: '2px' }, numStyle) }, idx + 1),
                        el('div', {},
                            el('div', { className: 'bkbg-src-card-title', style: { color: attr.titleColor } }, ref.title),
                            el('div', { className: 'bkbg-src-card-meta', style: { color: attr.authorColor, marginTop: '2px' } },
                                ref.author && el('span', {}, ref.author),
                                ref.author && ref.publication && el('span', {}, ' · '),
                                attr.showPublication && ref.publication && el('span', { style: { color: attr.pubColor } }, ref.publication),
                                attr.showDate && ref.accessDate && el('span', { style: { color: attr.pubColor } }, ' · ' + ref.accessDate)
                            ),
                            attr.showUrl && ref.url && el('a', { href: '#', className: 'bkbg-src-card-url', style: { display: 'block', marginTop: '4px', color: attr.urlColor, wordBreak: 'break-all' } }, ref.url)
                        )
                    );
                }
                /* minimal */
                return el('li', { key: idx, className: 'bkbg-src-item', style: { marginBottom: '8px', color: attr.titleColor } },
                    el('strong', { className: 'bkbg-src-num', style: { color: attr.numberColor } }, (idx + 1) + '. '),
                    ref.author && attr.showAuthor && el('span', { style: { color: attr.authorColor } }, ref.author + '. '),
                    el('span', { style: { fontWeight: 600 } }, ref.title),
                    attr.showPublication && ref.publication && el('span', { style: { color: attr.pubColor } }, ', ' + ref.publication),
                    attr.showUrl && ref.url && el('span', {}, ' — ', el('a', { href: '#', style: { color: attr.urlColor } }, ref.url))
                );
            }

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('References', 'blockenberg'), initialOpen: true },
                    (attr.references || []).map(function (r, i) { return RefEditor(r, i); }),
                    el(Button, { variant: 'secondary', __nextHasNoMarginBottom: true, style: { marginTop: '8px' }, onClick: function () { set({ references: (attr.references || []).concat([{ title: 'Article Title', author: '', publication: '', url: '', accessDate: '', note: '' }]) }); } }, __('+ Add Reference', 'blockenberg'))
                ),
                el(PanelBody, { title: __('Style & Display', 'blockenberg'), initialOpen: false },
                    el(TextControl, { label: __('Section Label', 'blockenberg'), value: attr.label, __nextHasNoMarginBottom: true, onChange: function (v) { set({ label: v }); } }),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Label', 'blockenberg'), checked: attr.showLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showLabel: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(SelectControl, {
                            label: __('Style', 'blockenberg'), value: attr.style, __nextHasNoMarginBottom: true,
                            options: [{ label: 'Academic (formatted)', value: 'academic' }, { label: 'Cards', value: 'cards' }, { label: 'Minimal list', value: 'minimal' }],
                            onChange: function (v) { set({ style: v }); }
                        })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(ToggleControl, { label: __('Show Author', 'blockenberg'), checked: attr.showAuthor, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showAuthor: v }); } })
                    ),
                    el('div', { style: { marginTop: '4px' } },
                        el(ToggleControl, { label: __('Show Publication', 'blockenberg'), checked: attr.showPublication, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showPublication: v }); } })
                    ),
                    el('div', { style: { marginTop: '4px' } },
                        el(ToggleControl, { label: __('Show Access Date', 'blockenberg'), checked: attr.showDate, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showDate: v }); } })
                    ),
                    el('div', { style: { marginTop: '4px' } },
                        el(ToggleControl, { label: __('Show URL', 'blockenberg'), checked: attr.showUrl, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showUrl: v }); } })
                    ),
                    el('div', { style: { marginTop: '4px' } },
                        el(ToggleControl, { label: __('Open Links in New Tab', 'blockenberg'), checked: attr.openInNewTab, __nextHasNoMarginBottom: true, onChange: function (v) { set({ openInNewTab: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Border Radius (cards)', 'blockenberg'), value: attr.borderRadius, min: 0, max: 16, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: attr.paddingTop, min: 0, max: 120, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingTop: v }); } }),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 120, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingBottom: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl() && el(getTypoControl(), { label: __('Label Typography'), value: attr.labelTypo || {}, onChange: function(v){ set({ labelTypo: v }); } }),
                    getTypoControl() && el(getTypoControl(), { label: __('Reference Typography'), value: attr.refTypo || {}, onChange: function(v){ set({ refTypo: v }); } })
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { set({ bgColor: v || '#f8fafc' }); } },
                        { label: __('Section Label', 'blockenberg'), value: attr.labelColor, onChange: function (v) { set({ labelColor: v || '#111827' }); } },
                        { label: __('Number', 'blockenberg'), value: attr.numberColor, onChange: function (v) { set({ numberColor: v || '#6366f1' }); } },
                        { label: __('Title', 'blockenberg'), value: attr.titleColor, onChange: function (v) { set({ titleColor: v || '#111827' }); } },
                        { label: __('Author', 'blockenberg'), value: attr.authorColor, onChange: function (v) { set({ authorColor: v || '#374151' }); } },
                        { label: __('Publication', 'blockenberg'), value: attr.pubColor, onChange: function (v) { set({ pubColor: v || '#6b7280' }); } },
                        { label: __('URL Link', 'blockenberg'), value: attr.urlColor, onChange: function (v) { set({ urlColor: v || '#6366f1' }); } },
                        { label: __('Border (cards)', 'blockenberg'), value: attr.borderColor, onChange: function (v) { set({ borderColor: v || '#e2e8f0' }); } },
                        { label: __('Card Background', 'blockenberg'), value: attr.cardBg, onChange: function (v) { set({ cardBg: v || '#ffffff' }); } }
                    ]
                })
            );

            var listEl = attr.style === 'minimal' ? 'ol' : 'div';
            return el('div', blockProps,
                controls,
                el('div', { style: { padding: attr.paddingTop + 'px 0 ' + attr.paddingBottom + 'px' } },
                    attr.showLabel && el('h3', { className: 'bkbg-src-label', style: { margin: '0 0 20px', color: attr.labelColor, borderBottom: '2px solid ' + attr.borderColor, paddingBottom: '10px' } }, attr.label),
                    el(listEl, { style: { margin: 0, padding: attr.style === 'minimal' ? '0 0 0 20px' : 0 } },
                        (attr.references || []).map(function (r, i) { return RefPreview(r, i); })
                    )
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-src-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );

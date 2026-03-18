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

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    var DATE_LABELS = [
        { label: 'Week of', value: 'Week of' },
        { label: 'Monthly Roundup', value: 'Monthly Roundup' },
        { label: "This Week's Reads", value: "This Week's Reads" },
        { label: 'Issue #', value: 'Issue #' },
        { label: 'Edition:', value: 'Edition:' }
    ];

    function updateLink(links, idx, key, val) {
        return links.map(function (l, i) {
            if (i !== idx) return l;
            var c = Object.assign({}, l); c[key] = val; return c;
        });
    }

    registerBlockType('blockenberg/link-roundup', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;
            var links = attr.links || [];

            var blockProps = useBlockProps((function () {
                var _tvFn = getTypoCssVars();
                var s = { padding: attr.paddingTop + 'px 0 ' + attr.paddingBottom + 'px', background: attr.bgColor, borderRadius: attr.borderRadius + 'px' };
                if (_tvFn) {
                    Object.assign(s, _tvFn(attr.titleTypo, '--bkbg-lru-tt-'));
                    Object.assign(s, _tvFn(attr.subtitleTypo, '--bkbg-lru-st-'));
                    Object.assign(s, _tvFn(attr.itemTypo, '--bkbg-lru-it-'));
                }
                return { style: s };
            })());

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Header', 'blockenberg'), initialOpen: true },
                    el(TextControl, { label: __('Date Label', 'blockenberg'), value: attr.dateLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ dateLabel: v }); } }),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Date', 'blockenberg'), checked: attr.showDate, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showDate: v }); } })
                    ),
                    attr.showDate && el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Publish Date', 'blockenberg'), value: attr.publishDate, placeholder: 'e.g. February 24, 2026', __nextHasNoMarginBottom: true, onChange: function (v) { set({ publishDate: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Subtitle', 'blockenberg'), checked: attr.showSubtitle, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showSubtitle: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Style', 'blockenberg'), value: attr.style, __nextHasNoMarginBottom: true,
                        options: [{ label: 'Cards', value: 'cards' }, { label: 'List', value: 'list' }, { label: 'Magazine (large)', value: 'magazine' }],
                        onChange: function (v) { set({ style: v }); }
                    }),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Group by Category', 'blockenberg'), checked: attr.groupByCategory, __nextHasNoMarginBottom: true, onChange: function (v) { set({ groupByCategory: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Emoji', 'blockenberg'), checked: attr.showEmoji, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showEmoji: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Source', 'blockenberg'), checked: attr.showSource, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showSource: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Excerpt', 'blockenberg'), checked: attr.showExcerpt, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showExcerpt: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Category Tag', 'blockenberg'), checked: attr.showCategory, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showCategory: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Open Links in New Tab', 'blockenberg'), checked: attr.openInNewTab, __nextHasNoMarginBottom: true, onChange: function (v) { set({ openInNewTab: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Border Radius', 'blockenberg'), value: attr.borderRadius, min: 0, max: 30, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } }),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Card Radius', 'blockenberg'), value: attr.cardRadius, min: 0, max: 20, __nextHasNoMarginBottom: true, onChange: function (v) { set({ cardRadius: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: attr.paddingTop, min: 0, max: 100, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingTop: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 100, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingBottom: v }); } })
                    )
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { set({ bgColor: v || '#f8fafc' }); } },
                        { label: __('Border', 'blockenberg'), value: attr.borderColor, onChange: function (v) { set({ borderColor: v || '#e2e8f0' }); } },
                        { label: __('Heading', 'blockenberg'), value: attr.headingColor, onChange: function (v) { set({ headingColor: v || '#0f172a' }); } },
                        { label: __('Subtitle', 'blockenberg'), value: attr.subtitleColor, onChange: function (v) { set({ subtitleColor: v || '#64748b' }); } },
                        { label: __('Date', 'blockenberg'), value: attr.dateColor, onChange: function (v) { set({ dateColor: v || '#94a3b8' }); } },
                        { label: __('Card Background', 'blockenberg'), value: attr.cardBg, onChange: function (v) { set({ cardBg: v || '#ffffff' }); } },
                        { label: __('Card Border', 'blockenberg'), value: attr.cardBorder, onChange: function (v) { set({ cardBorder: v || '#e2e8f0' }); } },
                        { label: __('Link Color', 'blockenberg'), value: attr.linkColor, onChange: function (v) { set({ linkColor: v || '#2563eb' }); } },
                        { label: __('Source', 'blockenberg'), value: attr.sourceColor, onChange: function (v) { set({ sourceColor: v || '#94a3b8' }); } },
                        { label: __('Excerpt', 'blockenberg'), value: attr.excerptColor, onChange: function (v) { set({ excerptColor: v || '#475569' }); } },
                        { label: __('Category Tag BG', 'blockenberg'), value: attr.catBg, onChange: function (v) { set({ catBg: v || '#e0f2fe' }); } },
                        { label: __('Category Tag Text', 'blockenberg'), value: attr.catColor, onChange: function (v) { set({ catColor: v || '#0369a1' }); } },
                        { label: __('Accent', 'blockenberg'), value: attr.accentColor, onChange: function (v) { set({ accentColor: v || '#2563eb' }); } }
                    ]
                }),
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        getTypoControl() && el(getTypoControl(), { label: __('Title'), value: attr.titleTypo || {}, onChange: function (v) { set({ titleTypo: v }); } }),
                        getTypoControl() && el(getTypoControl(), { label: __('Subtitle'), value: attr.subtitleTypo || {}, onChange: function (v) { set({ subtitleTypo: v }); } }),
                        getTypoControl() && el(getTypoControl(), { label: __('Item Title'), value: attr.itemTypo || {}, onChange: function (v) { set({ itemTypo: v }); } })
                    ),

            );

            var isCards = attr.style === 'cards';
            var isMag = attr.style === 'magazine';
            var gridStyle = isCards
                ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }
                : isMag
                    ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }
                    : { display: 'flex', flexDirection: 'column', gap: '8px' };

            var linkCards = el('div', { style: gridStyle },
                links.map(function (lnk, idx) {
                    var isListStyle = attr.style === 'list';
                    var cardStyle = {
                        background: attr.cardBg,
                        border: '1px solid ' + attr.cardBorder,
                        borderRadius: attr.cardRadius + 'px',
                        padding: isListStyle ? '10px 14px' : '14px 16px',
                        display: isListStyle ? 'flex' : 'block',
                        alignItems: isListStyle ? 'flex-start' : undefined,
                        gap: isListStyle ? '10px' : undefined
                    };
                    if (attr.style === 'magazine') {
                        cardStyle.borderLeft = '4px solid ' + attr.accentColor;
                    }

                    var emojiEl = attr.showEmoji && (function () {
                        var _et = lnk.emojiType || 'custom-char';
                        var _style = { fontSize: isListStyle ? '16px' : '20px', flexShrink: isListStyle ? '0' : undefined, display: isListStyle ? 'inline-flex' : 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: isListStyle ? '0' : '6px', marginBottom: isListStyle ? '0' : '6px' };
                        if (_et !== 'custom-char' && IP()) {
                            var _node = IP().buildEditorIcon(_et, lnk.emoji, lnk.emojiDashicon, lnk.emojiImageUrl, lnk.emojiDashiconColor);
                            if (_node) return el('span', { style: _style }, _node);
                        }
                        return el('span', { style: _style }, lnk.emoji || '🔗');
                    })();

                    return el('div', { key: idx, style: cardStyle },
                        emojiEl,
                        el('div', { style: { flex: 1, minWidth: 0 } },
                            el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' } },
                                el(TextControl, { value: lnk.title, label: '', placeholder: __('Link Title', 'blockenberg'), __nextHasNoMarginBottom: true, style: { fontWeight: 600, fontSize: '14px', color: attr.linkColor, flex: '1' }, onChange: function (v) { set({ links: updateLink(links, idx, 'title', v) }); } }),
                                attr.showCategory && el(TextControl, { value: lnk.category, label: '', placeholder: __('Category', 'blockenberg'), __nextHasNoMarginBottom: true, style: { width: '100px', fontSize: '11px' }, onChange: function (v) { set({ links: updateLink(links, idx, 'category', v) }); } })
                            ),
                            el('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '4px' } },
                                el(TextControl, { value: lnk.url, label: '', placeholder: __('https://…', 'blockenberg'), __nextHasNoMarginBottom: true, style: { flex: '1', fontSize: '12px' }, onChange: function (v) { set({ links: updateLink(links, idx, 'url', v) }); } }),
                                attr.showEmoji && el(IP().IconPickerControl, {
                                    iconType: lnk.emojiType || 'custom-char',
                                    customChar: lnk.emoji || '',
                                    dashicon: lnk.emojiDashicon || '',
                                    imageUrl: lnk.emojiImageUrl || '',
                                    onChangeType: function (v) { set({ links: updateLink(links, idx, 'emojiType', v) }); },
                                    onChangeChar: function (v) { set({ links: updateLink(links, idx, 'emoji', v) }); },
                                    onChangeDashicon: function (v) { set({ links: updateLink(links, idx, 'emojiDashicon', v) }); },
                                    onChangeImageUrl: function (v) { set({ links: updateLink(links, idx, 'emojiImageUrl', v) }); },
                                    label: ''
                                }),
                                attr.showSource && el(TextControl, { value: lnk.source, label: '', placeholder: __('Source', 'blockenberg'), __nextHasNoMarginBottom: true, style: { width: '120px', fontSize: '12px' }, onChange: function (v) { set({ links: updateLink(links, idx, 'source', v) }); } })
                            ),
                            attr.showExcerpt && el(TextareaControl, { value: lnk.excerpt, label: '', placeholder: __('Brief excerpt or summary…', 'blockenberg'), rows: 2, __nextHasNoMarginBottom: true, onChange: function (v) { set({ links: updateLink(links, idx, 'excerpt', v) }); } }),
                            el(Button, { variant: 'link', isDestructive: true, style: { fontSize: '11px', marginTop: '4px' }, onClick: function () { set({ links: links.filter(function (_, i) { return i !== idx; }) }); } }, __('Remove', 'blockenberg'))
                        )
                    );
                })
            );

            return el('div', blockProps,
                controls,
                el('div', { style: { padding: '24px' } },
                    el('div', { style: { marginBottom: '20px' } },
                        attr.showDate && attr.publishDate && el('div', { style: { fontSize: '12px', color: attr.dateColor, marginBottom: '4px', fontWeight: 500 } }, attr.dateLabel + ' ' + attr.publishDate),
                        el(RichText, { tagName: 'h2', className: 'bkbg-lru-title', value: attr.title, allowedFormats: ['core/bold', 'core/italic'], placeholder: __('Roundup Title', 'blockenberg'), style: { margin: '0 0 4px', color: attr.headingColor }, onChange: function (v) { set({ title: v }); } }),
                        attr.showSubtitle && el(RichText, { tagName: 'p', className: 'bkbg-lru-subtitle', value: attr.subtitle, allowedFormats: ['core/bold', 'core/italic'], placeholder: __('Optional subtitle or intro…', 'blockenberg'), style: { margin: '0 0 16px', color: attr.subtitleColor }, onChange: function (v) { set({ subtitle: v }); } })
                    ),
                    linkCards,
                    el('div', { style: { textAlign: 'center', marginTop: '14px' } },
                        el(Button, { variant: 'secondary', onClick: function () { set({ links: links.concat([{ title: '', url: '', source: '', excerpt: '', category: 'General', emoji: '🔗', emojiType: 'custom-char', emojiDashicon: '', emojiImageUrl: '' }]) }); } }, __('+ Add Link', 'blockenberg'))
                    )
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-lru-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );

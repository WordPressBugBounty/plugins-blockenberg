(function () {
        var el = wp.element.createElement;
        var Fragment = wp.element.Fragment;
        var registerBlockType = wp.blocks.registerBlockType;
        var __ = wp.i18n.__;
        var InspectorControls = wp.blockEditor.InspectorControls;
        var PanelColorSettings = wp.blockEditor.PanelColorSettings;
        var useBlockProps = wp.blockEditor.useBlockProps;
        var PanelBody = wp.components.PanelBody;
        var RangeControl = wp.components.RangeControl;
        var ToggleControl = wp.components.ToggleControl;
        var TextControl = wp.components.TextControl;
        var SelectControl = wp.components.SelectControl;
        var Button = wp.components.Button;

        function getTypographyControl() { return (window.bkbgTypographyControl || function () { return null; }); }
        function getTypoCssVars() { return (window.bkbgTypoCssVars || function () { return {}; }); }
        function _tv(typo, prefix) { var fn = getTypoCssVars(); return fn(typo || {}, prefix); }

        var LAYOUT_OPTIONS = [
            { label: 'Timeline (left line)', value: 'timeline' },
            { label: 'Cards', value: 'cards' },
            { label: 'Minimal list', value: 'list' },
        ];

        var CATEGORY_OPTIONS = [
            { label: '✦ New', value: 'new' },
            { label: '↑ Improved', value: 'improved' },
            { label: '✔ Fixed', value: 'fixed' },
            { label: '⚠ Deprecated', value: 'deprecated' },
            { label: '✕ Removed', value: 'removed' },
        ];

        var CATEGORY_LABELS = { new: 'New', improved: 'Improved', fixed: 'Fixed', deprecated: 'Deprecated', removed: 'Removed' };

        function makeId() { return 'x' + Math.random().toString(36).substr(2, 6); }

        function getCategoryColor(cat, a) {
            if (cat === 'new')        return a.newColor;
            if (cat === 'improved')   return a.improvedColor;
            if (cat === 'fixed')      return a.fixedColor;
            if (cat === 'deprecated') return a.deprecatedColor;
            return a.removedColor;
        }

        function renderBadge(text, bg, color, size) {
            return el('span', { className: 'bkbg-changelog-badge', style: { display: 'inline-block', padding: '2px 8px', background: bg + '22', color: bg, borderRadius: '4px', whiteSpace: 'nowrap' } }, text);
        }

        function renderEntry(entry, a, inEditor, onUpdate) {
            var isTimeline = a.layout === 'timeline';
            var isCard = a.layout === 'cards';
            return el('div', {
                key: entry.id,
                className: 'bkbg-changelog-entry bkbg-changelog-entry--' + a.layout,
                style: { display: 'flex', gap: '24px', position: 'relative', marginBottom: isCard ? '0' : '36px' }
            },
                isTimeline && el('div', { className: 'bkbg-changelog-connector', style: { display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 } },
                    el('div', { style: { width: '12px', height: '12px', borderRadius: '50%', background: a.versionBadgeBg, flexShrink: 0, marginTop: '3px' } }),
                    el('div', { className: 'bkbg-changelog-line', style: { flex: 1, width: '2px', background: a.connectorColor, minHeight: '40px' } })
                ),
                el('div', { className: 'bkbg-changelog-content', style: Object.assign({ flex: 1, paddingBottom: isTimeline ? '12px' : '0' }, isCard ? { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px' } : {}) },
                    el('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' } },
                        el('span', { className: 'bkbg-changelog-version', style: { color: a.versionColor } }, 'v' + entry.version),
                        entry.badge && a.showBadge && renderBadge(entry.badge, a.versionBadgeBg, a.versionBadgeColor, 11),
                        a.showDate && entry.date && el('span', { className: 'bkbg-changelog-date', style: { color: a.dateColor } }, entry.date)
                    ),
                    el('ul', { className: 'bkbg-changelog-items', style: { listStyle: 'none', padding: 0, margin: '10px 0 0', display: 'flex', flexDirection: 'column', gap: '6px' } },
                        entry.items.map(function (item) {
                            var catColor = getCategoryColor(item.category, a);
                            return el('li', { key: item.id, className: 'bkbg-changelog-item', style: { display: 'flex', alignItems: 'flex-start', gap: '8px', color: a.itemColor } },
                                renderBadge(CATEGORY_LABELS[item.category] || item.category, catColor, '#fff', 10),
                                el('span', null, item.text)
                            );
                        })
                    )
                )
            );
        }

        registerBlockType('blockenberg/changelog', {
            edit: function (props) {
                var attributes = props.attributes;
                var setAttributes = props.setAttributes;
                var entries = attributes.entries;

                var blockProps = useBlockProps({
                    style: Object.assign({ paddingTop: attributes.paddingTop + 'px', paddingBottom: attributes.paddingBottom + 'px', backgroundColor: attributes.bgColor || undefined }, _tv(attributes.typoTitle, '--bkbg-cl-tt-'), _tv(attributes.typoVersion, '--bkbg-cl-v-'), _tv(attributes.typoItem, '--bkbg-cl-i-'), _tv(attributes.typoDate, '--bkbg-cl-d-'), _tv(attributes.typoBadge, '--bkbg-cl-bg-'))
                });

                function setEntry(id, patch) {
                    setAttributes({ entries: entries.map(function (e) { return e.id === id ? Object.assign({}, e, patch) : e; }) });
                }
                function setItem(entryId, itemId, patch) {
                    setAttributes({ entries: entries.map(function (e) {
                        if (e.id !== entryId) return e;
                        return Object.assign({}, e, { items: e.items.map(function (i) { return i.id === itemId ? Object.assign({}, i, patch) : i; }) });
                    }) });
                }
                function addEntry() {
                    setAttributes({ entries: [{ id: makeId(), version: '0.0.0', date: '', badge: '', items: [{ id: makeId(), category: 'new', text: 'New feature' }] }].concat(entries) });
                }
                function removeEntry(id) {
                    if (entries.length <= 1) return;
                    setAttributes({ entries: entries.filter(function (e) { return e.id !== id; }) });
                }
                function addItem(entryId) {
                    setAttributes({ entries: entries.map(function (e) {
                        if (e.id !== entryId) return e;
                        return Object.assign({}, e, { items: e.items.concat([{ id: makeId(), category: 'new', text: '' }]) });
                    }) });
                }
                function removeItem(entryId, itemId) {
                    setAttributes({ entries: entries.map(function (e) {
                        if (e.id !== entryId) return e;
                        return Object.assign({}, e, { items: e.items.filter(function (i) { return i.id !== itemId; }) });
                    }) });
                }

                return el(Fragment, null,
                    el(InspectorControls, null,
                        el(PanelBody, { title: __('Settings', 'blockenberg'), initialOpen: true },
                            el(SelectControl, { label: __('Layout', 'blockenberg'), value: attributes.layout, options: LAYOUT_OPTIONS, onChange: function (v) { setAttributes({ layout: v }); } }),
                            el(ToggleControl, { label: __('Show section title', 'blockenberg'), checked: attributes.showTitle, onChange: function (v) { setAttributes({ showTitle: v }); }, __nextHasNoMarginBottom: true }),
                            attributes.showTitle && el(TextControl, { label: __('Section title', 'blockenberg'), value: attributes.sectionTitle, onChange: function (v) { setAttributes({ sectionTitle: v }); } }),
                            el(ToggleControl, { label: __('Show date', 'blockenberg'), checked: attributes.showDate, onChange: function (v) { setAttributes({ showDate: v }); }, __nextHasNoMarginBottom: true }),
                            el(ToggleControl, { label: __('Show version badge', 'blockenberg'), checked: attributes.showBadge, onChange: function (v) { setAttributes({ showBadge: v }); }, __nextHasNoMarginBottom: true }),
                            el(RangeControl, { label: __('Max width (px)', 'blockenberg'), value: attributes.maxWidth, min: 400, max: 1200, onChange: function (v) { setAttributes({ maxWidth: v }); } })
                        ),
                        el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                            el(getTypographyControl(), { label: __('Title', 'blockenberg'), value: attributes.typoTitle, onChange: function (v) { setAttributes({ typoTitle: v }); } }),
                            el(getTypographyControl(), { label: __('Version', 'blockenberg'), value: attributes.typoVersion, onChange: function (v) { setAttributes({ typoVersion: v }); } }),
                            el(getTypographyControl(), { label: __('Item', 'blockenberg'), value: attributes.typoItem, onChange: function (v) { setAttributes({ typoItem: v }); } }),
                            el(getTypographyControl(), { label: __('Date', 'blockenberg'), value: attributes.typoDate, onChange: function (v) { setAttributes({ typoDate: v }); } }),
                            el(getTypographyControl(), { label: __('Badge', 'blockenberg'), value: attributes.typoBadge, onChange: function (v) { setAttributes({ typoBadge: v }); } })
                        ),
                        el(PanelColorSettings, {
                            title: __('Category Colors', 'blockenberg'),
                            initialOpen: false,
                            colorSettings: [
                                { value: attributes.newColor,        onChange: function (v) { setAttributes({ newColor: v || '' }); },        label: __('New', 'blockenberg') },
                                { value: attributes.improvedColor,   onChange: function (v) { setAttributes({ improvedColor: v || '' }); },   label: __('Improved', 'blockenberg') },
                                { value: attributes.fixedColor,      onChange: function (v) { setAttributes({ fixedColor: v || '' }); },      label: __('Fixed', 'blockenberg') },
                                { value: attributes.deprecatedColor, onChange: function (v) { setAttributes({ deprecatedColor: v || '' }); }, label: __('Deprecated', 'blockenberg') },
                                { value: attributes.removedColor,    onChange: function (v) { setAttributes({ removedColor: v || '' }); },    label: __('Removed', 'blockenberg') },
                            ]
                        }),
                        el(PanelColorSettings, {
                            title: __('Colors', 'blockenberg'),
                            initialOpen: false,
                            colorSettings: [
                                { value: attributes.versionBadgeBg,    onChange: function (v) { setAttributes({ versionBadgeBg: v || '' }); },    label: __('Version badge', 'blockenberg') },
                                { value: attributes.connectorColor,    onChange: function (v) { setAttributes({ connectorColor: v || '' }); },    label: __('Timeline line', 'blockenberg') },
                                { value: attributes.versionColor,      onChange: function (v) { setAttributes({ versionColor: v || '' }); },      label: __('Version text', 'blockenberg') },
                                { value: attributes.dateColor,         onChange: function (v) { setAttributes({ dateColor: v || '' }); },         label: __('Date text', 'blockenberg') },
                                { value: attributes.itemColor,         onChange: function (v) { setAttributes({ itemColor: v || '' }); },         label: __('Item text', 'blockenberg') },
                                { value: attributes.bgColor,           onChange: function (v) { setAttributes({ bgColor: v || '' }); },           label: __('Section background', 'blockenberg') },
                            ]
                        }),
                        el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                            el(RangeControl, { label: __('Padding top (px)', 'blockenberg'), value: attributes.paddingTop, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop: v }); } }),
                            el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: attributes.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                        ),
                        el(PanelBody, { title: __('Entries', 'blockenberg'), initialOpen: false },
                            entries.map(function (entry, eIdx) {
                                return el(PanelBody, { key: entry.id, title: 'v' + entry.version + (entry.date ? ' — ' + entry.date : '') + ' #' + (eIdx + 1), initialOpen: eIdx === 0 },
                                    el(TextControl, { label: __('Version number', 'blockenberg'), value: entry.version, placeholder: '1.0.0', onChange: function (v) { setEntry(entry.id, { version: v }); } }),
                                    el(TextControl, { label: __('Date', 'blockenberg'), value: entry.date, placeholder: 'Jan 2026', onChange: function (v) { setEntry(entry.id, { date: v }); } }),
                                    el(TextControl, { label: __('Badge label (optional)', 'blockenberg'), value: entry.badge, placeholder: 'Latest', onChange: function (v) { setEntry(entry.id, { badge: v }); } }),
                                    el('p', { style: { margin: '12px 0 6px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' } }, __('Items', 'blockenberg')),
                                    entry.items.map(function (item, iIdx) {
                                        return el('div', { key: item.id, style: { display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px', padding: '8px', background: '#f9fafb', borderRadius: '6px' } },
                                            el(SelectControl, { label: __('Category', 'blockenberg'), value: item.category, options: CATEGORY_OPTIONS, onChange: function (v) { setItem(entry.id, item.id, { category: v }); } }),
                                            el(TextControl, { label: __('Description', 'blockenberg'), value: item.text, onChange: function (v) { setItem(entry.id, item.id, { text: v }); } }),
                                            entry.items.length > 1 && el(Button, { onClick: function () { removeItem(entry.id, item.id); }, variant: 'tertiary', size: 'compact', isDestructive: true }, __('Remove item', 'blockenberg'))
                                        );
                                    }),
                                    el(Button, { onClick: function () { addItem(entry.id); }, variant: 'secondary', size: 'compact', style: { marginBottom: '8px' } }, __('+ Add item', 'blockenberg')),
                                    entries.length > 1 && el(Button, { onClick: function () { removeEntry(entry.id); }, variant: 'tertiary', size: 'compact', isDestructive: true, style: { display: 'block' } }, __('Remove entry', 'blockenberg'))
                                );
                            }),
                            el(Button, { onClick: addEntry, variant: 'primary', style: { marginTop: '8px' } }, __('+ Add Version Entry', 'blockenberg'))
                        )
                    ),

                    el('div', blockProps,
                        el('div', { style: { maxWidth: attributes.maxWidth + 'px', margin: '0 auto' } },
                            attributes.showTitle && attributes.sectionTitle && el('h2', { className: 'bkbg-changelog-title', style: { marginBottom: '40px' } }, attributes.sectionTitle),
                            el('div', { className: 'bkbg-changelog-list bkbg-changelog-list--' + attributes.layout, style: attributes.layout === 'cards' ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' } : {} },
                                entries.map(function (entry) {
                                    return renderEntry(entry, attributes, true, null);
                                })
                            )
                        )
                    )
                );
            },

            deprecated: [{
                save: function (props) {
                    var a = props.attributes;
                    var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkbg-changelog-wrap' });

                    return el('div', Object.assign({}, blockProps, { style: Object.assign({ paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px', backgroundColor: a.bgColor || undefined }, _tv(a.typoTitle, '--bkbg-cl-tt-'), _tv(a.typoVersion, '--bkbg-cl-v-'), _tv(a.typoItem, '--bkbg-cl-i-')) }),
                        el('div', { style: { maxWidth: a.maxWidth + 'px', margin: '0 auto' } },
                            a.showTitle && a.sectionTitle && el('h2', { className: 'bkbg-changelog-title', style: { marginBottom: '40px' } }, a.sectionTitle),
                            el('div', { className: 'bkbg-changelog-list bkbg-changelog-list--' + a.layout, style: a.layout === 'cards' ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' } : {} },
                                a.entries.map(function (entry) {
                                    var isTimeline = a.layout === 'timeline';
                                    var isCard = a.layout === 'cards';
                                    return el('div', { key: entry.id, className: 'bkbg-changelog-entry bkbg-changelog-entry--' + a.layout, style: { display: 'flex', gap: '24px', position: 'relative', marginBottom: isCard ? '0' : '36px' } },
                                        isTimeline && el('div', { className: 'bkbg-changelog-connector', style: { display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 } },
                                            el('div', { style: { width: '12px', height: '12px', borderRadius: '50%', background: a.versionBadgeBg, flexShrink: 0, marginTop: '3px' } }),
                                            el('div', { className: 'bkbg-changelog-line', style: { flex: 1, width: '2px', background: a.connectorColor, minHeight: '40px' } })
                                        ),
                                        el('div', { className: 'bkbg-changelog-content', style: Object.assign({ flex: 1, paddingBottom: isTimeline ? '12px' : '0' }, isCard ? { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px' } : {}) },
                                            el('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' } },
                                                el('span', { className: 'bkbg-changelog-version', style: { color: a.versionColor } }, 'v' + entry.version),
                                                entry.badge && a.showBadge && el('span', { style: { display: 'inline-block', padding: '2px 8px', background: a.versionBadgeBg + '22', color: a.versionBadgeBg, borderRadius: '4px', fontSize: '11px', fontWeight: 700 } }, entry.badge),
                                                a.showDate && entry.date && el('span', { style: { fontSize: a.dateSize + 'px', color: a.dateColor } }, entry.date)
                                            ),
                                            el('ul', { className: 'bkbg-changelog-items', style: { listStyle: 'none', padding: 0, margin: '10px 0 0', display: 'flex', flexDirection: 'column', gap: '6px' } },
                                                entry.items.map(function (item) {
                                                    var catColor = getCategoryColor(item.category, a);
                                                    return el('li', { key: item.id, className: 'bkbg-changelog-item', style: { display: 'flex', alignItems: 'flex-start', gap: '8px', color: a.itemColor } },
                                                        el('span', { className: 'bkbg-changelog-badge bkbg-changelog-badge--' + item.category, style: { display: 'inline-block', padding: '2px 8px', background: catColor + '22', color: catColor, borderRadius: '4px', fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 } }, CATEGORY_LABELS[item.category] || item.category),
                                                        el('span', null, item.text)
                                                    );
                                                })
                                            )
                                        )
                                    );
                                })
                            )
                        )
                    );

                    function getCategoryColor(cat, a) {
                        if (cat === 'new')        return a.newColor;
                        if (cat === 'improved')   return a.improvedColor;
                        if (cat === 'fixed')      return a.fixedColor;
                        if (cat === 'deprecated') return a.deprecatedColor;
                        return a.removedColor;
                    }
                }
            }],

            save: function (props) {
                var a = props.attributes;
                var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkbg-changelog-wrap' });

                return el('div', Object.assign({}, blockProps, { style: Object.assign({ paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px', backgroundColor: a.bgColor || undefined }, _tv(a.typoTitle, '--bkbg-cl-tt-'), _tv(a.typoVersion, '--bkbg-cl-v-'), _tv(a.typoItem, '--bkbg-cl-i-'), _tv(a.typoDate, '--bkbg-cl-d-'), _tv(a.typoBadge, '--bkbg-cl-bg-')) }),
                    el('div', { style: { maxWidth: a.maxWidth + 'px', margin: '0 auto' } },
                        a.showTitle && a.sectionTitle && el('h2', { className: 'bkbg-changelog-title', style: { marginBottom: '40px' } }, a.sectionTitle),
                        el('div', { className: 'bkbg-changelog-list bkbg-changelog-list--' + a.layout, style: a.layout === 'cards' ? { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' } : {} },
                            a.entries.map(function (entry) {
                                var isTimeline = a.layout === 'timeline';
                                var isCard = a.layout === 'cards';
                                return el('div', { key: entry.id, className: 'bkbg-changelog-entry bkbg-changelog-entry--' + a.layout, style: { display: 'flex', gap: '24px', position: 'relative', marginBottom: isCard ? '0' : '36px' } },
                                    isTimeline && el('div', { className: 'bkbg-changelog-connector', style: { display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 } },
                                        el('div', { style: { width: '12px', height: '12px', borderRadius: '50%', background: a.versionBadgeBg, flexShrink: 0, marginTop: '3px' } }),
                                        el('div', { className: 'bkbg-changelog-line', style: { flex: 1, width: '2px', background: a.connectorColor, minHeight: '40px' } })
                                    ),
                                    el('div', { className: 'bkbg-changelog-content', style: Object.assign({ flex: 1, paddingBottom: isTimeline ? '12px' : '0' }, isCard ? { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px' } : {}) },
                                        el('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' } },
                                            el('span', { className: 'bkbg-changelog-version', style: { color: a.versionColor } }, 'v' + entry.version),
                                            entry.badge && a.showBadge && el('span', { className: 'bkbg-changelog-badge', style: { display: 'inline-block', padding: '2px 8px', background: a.versionBadgeBg + '22', color: a.versionBadgeBg, borderRadius: '4px', whiteSpace: 'nowrap' } }, entry.badge),
                                            a.showDate && entry.date && el('span', { className: 'bkbg-changelog-date', style: { color: a.dateColor } }, entry.date)
                                        ),
                                        el('ul', { className: 'bkbg-changelog-items', style: { listStyle: 'none', padding: 0, margin: '10px 0 0', display: 'flex', flexDirection: 'column', gap: '6px' } },
                                            entry.items.map(function (item) {
                                                var catColor = getCategoryColor(item.category, a);
                                                return el('li', { key: item.id, className: 'bkbg-changelog-item', style: { display: 'flex', alignItems: 'flex-start', gap: '8px', color: a.itemColor } },
                                                    el('span', { className: 'bkbg-changelog-badge bkbg-changelog-badge--' + item.category, style: { display: 'inline-block', padding: '2px 8px', background: catColor + '22', color: catColor, borderRadius: '4px', whiteSpace: 'nowrap', flexShrink: 0 } }, CATEGORY_LABELS[item.category] || item.category),
                                                    el('span', null, item.text)
                                                );
                                            })
                                        )
                                    )
                                );
                            })
                        )
                    )
                );

                function getCategoryColor(cat, a) {
                    if (cat === 'new')        return a.newColor;
                    if (cat === 'improved')   return a.improvedColor;
                    if (cat === 'fixed')      return a.fixedColor;
                    if (cat === 'deprecated') return a.deprecatedColor;
                    return a.removedColor;
                }
            }
        });
}());

( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var Button = wp.components.Button;
    var __ = wp.i18n.__;
    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    // ── section type metadata ─────────────────────────────────────
    var sectionTypes = [
        { value: 'added',      label: '✅ Added',      emoji: '✅' },
        { value: 'changed',    label: '🔄 Changed',    emoji: '🔄' },
        { value: 'fixed',      label: '🐛 Fixed',      emoji: '🐛' },
        { value: 'removed',    label: '🗑️ Removed',   emoji: '🗑️' },
        { value: 'security',   label: '🔒 Security',   emoji: '🔒' },
        { value: 'deprecated', label: '⚠️ Deprecated', emoji: '⚠️' }
    ];

    var releaseTypeOptions = [
        { label: '🚀 Major',   value: 'major'   },
        { label: '✨ Minor',   value: 'minor'   },
        { label: '🐛 Patch',   value: 'patch'   },
        { label: '🔥 Hotfix',  value: 'hotfix'  }
    ];

    function releaseTypeInfo(t) {
        if (t === 'major')  return { label: '🚀 Major',  bg: '#fee2e2', color: '#991b1b' };
        if (t === 'patch')  return { label: '🐛 Patch',  bg: '#fef9c3', color: '#713f12' };
        if (t === 'hotfix') return { label: '🔥 Hotfix', bg: '#ffedd5', color: '#9a3412' };
        return                     { label: '✨ Minor',  bg: '#dbeafe', color: '#1e3a8a' };
    }

    function sectionMeta(type, a) {
        if (type === 'added')      return { label: 'Added',      bg: a.addedBg,      color: a.addedColor,      dot: '#16a34a' };
        if (type === 'changed')    return { label: 'Changed',    bg: a.changedBg,    color: a.changedColor,    dot: '#2563eb' };
        if (type === 'fixed')      return { label: 'Fixed',      bg: a.fixedBg,      color: a.fixedColor,      dot: '#ca8a04' };
        if (type === 'removed')    return { label: 'Removed',    bg: a.removedBg,    color: a.removedColor,    dot: '#dc2626' };
        if (type === 'security')   return { label: 'Security',   bg: a.securityBg,   color: a.securityColor,   dot: '#7c3aed' };
        if (type === 'deprecated') return { label: 'Deprecated', bg: a.deprecatedBg, color: a.deprecatedColor, dot: '#64748b' };
        return { label: type, bg: '#f1f5f9', color: '#374151', dot: '#64748b' };
    }

    // Update a single item inside a section
    function updItem(sections, si, ii, val) {
        return sections.map(function (sec, s) {
            if (s !== si) return sec;
            var items = sec.items.map(function (it, i) { return i === ii ? val : it; });
            return Object.assign({}, sec, { items: items });
        });
    }

    registerBlockType('blockenberg/release-notes', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var TC = getTypoControl();
            var blockProps = useBlockProps((function () {
                var _tvFn = getTypoCssVars();
                var s = {};
                if (_tvFn) {
                    Object.assign(s, _tvFn(a.titleTypo || {}, '--bkrn-tt-'));
                    Object.assign(s, _tvFn(a.bodyTypo || {}, '--bkrn-bt-'));
                }
                return { className: 'bkbg-rn-editor-wrap', style: s };
            })());
            var rtInfo = releaseTypeInfo(a.releaseType);

            // ── preview ───────────────────────────────────────────
            var preview = el('div', { style: { border: '1px solid ' + a.borderColor, borderRadius: a.borderRadius + 'px', overflow: 'hidden', background: a.bgColor } },
                // Header
                el('div', { style: { background: a.headerBg, padding: '20px 24px' } },
                    el('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 } },
                        el('span', { className: 'bkbg-rn-version', style: { color: a.headerColor } }, 'v' + a.version),
                        a.showReleaseType && el('span', { style: { background: rtInfo.bg, color: rtInfo.color, padding: '2px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700 } }, rtInfo.label),
                        el('span', { style: { color: a.headerColor, opacity: .6, fontSize: a.productNameSize || 13 } }, a.productName)
                    ),
                    a.showMeta && a.releaseDate && el('div', { style: { fontSize: 12, color: a.headerColor, opacity: .55 } }, '📅 Released ' + a.releaseDate)
                ),
                // Intro
                a.showIntro && a.intro && el('div', { className: 'bkbg-rn-intro', style: { background: a.introBg, borderBottom: '1px solid ' + a.borderColor, padding: '14px 24px', color: a.introColor } }, a.intro),
                // Sections
                el('div', { style: { padding: '20px 24px' } },
                    a.sections.map(function (sec, si) {
                        var m = sectionMeta(sec.type, a);
                        return el('div', { key: si, style: { marginBottom: si < a.sections.length - 1 ? 20 : 0 } },
                            // Section heading
                            el('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 } },
                                el('span', { style: { background: m.bg, color: m.color, padding: '3px 12px 3px 8px', borderRadius: 100, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 } },
                                    el('span', { style: { width: 8, height: 8, borderRadius: '50%', background: m.dot, display: 'inline-block' } }),
                                    m.label
                                ),
                                el('span', { style: { fontSize: 11, color: '#9ca3af' } }, sec.items.length + ' item' + (sec.items.length !== 1 ? 's' : ''))
                            ),
                            // Items
                            el('ul', { style: { margin: 0, padding: 0, listStyle: 'none' } },
                                sec.items.map(function (item, ii) {
                                    return el('li', { key: ii, className: 'bkbg-rn-item', style: { display: 'flex', alignItems: 'flex-start', gap: 8, padding: a.itemSpacing + 'px 0', borderBottom: ii < sec.items.length - 1 ? '1px dashed ' + a.borderColor : 'none', color: a.textColor } },
                                        el('span', { style: { color: m.dot, marginTop: 4, flexShrink: 0, fontWeight: 700 } }, '—'),
                                        el('span', null, item)
                                    );
                                })
                            )
                        );
                    }),
                    // Links
                    a.showLinks && (a.changelogUrl || a.compareUrl) && el('div', { style: { marginTop: 20, paddingTop: 16, borderTop: '1px solid ' + a.borderColor, display: 'flex', gap: 16, flexWrap: 'wrap' } },
                        a.changelogUrl && el('a', { href: a.changelogUrl, style: { fontSize: 13, color: a.accentColor, fontWeight: 600, textDecoration: 'none' } }, '📋 Full Changelog →'),
                        a.compareUrl && el('a', { href: a.compareUrl, style: { fontSize: 13, color: a.accentColor, fontWeight: 600, textDecoration: 'none' } }, '🔀 Compare Changes →')
                    )
                )
            );

            return el(Fragment, null,
                el('div', blockProps, preview),
                el(InspectorControls, null,
                    // Release Info
                    el(PanelBody, { title: 'Release Info', initialOpen: true },
                        el(TextControl, { label: 'Product Name', value: a.productName, __nextHasNoMarginBottom: true, onChange: function (v) { set({ productName: v }); } }),
                        el('div', { style: { marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
                            el(TextControl, { label: 'Version', value: a.version, __nextHasNoMarginBottom: true, onChange: function (v) { set({ version: v }); } }),
                            el(SelectControl, { label: 'Type', value: a.releaseType, options: releaseTypeOptions, __nextHasNoMarginBottom: true, onChange: function (v) { set({ releaseType: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Release Date', value: a.releaseDate, __nextHasNoMarginBottom: true, onChange: function (v) { set({ releaseDate: v }); } })
                        ),
                        el('div', { style: { marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 } },
                            el(ToggleControl, { label: 'Show Meta', checked: a.showMeta, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showMeta: v }); } }),
                            el(ToggleControl, { label: 'Show Type Badge', checked: a.showReleaseType, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showReleaseType: v }); } })
                        )
                    ),
                    // Intro
                    el(PanelBody, { title: 'Introduction', initialOpen: false },
                        el(ToggleControl, { label: 'Show Introduction', checked: a.showIntro, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showIntro: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextareaControl, { value: a.intro, rows: 4, __nextHasNoMarginBottom: true, onChange: function (v) { set({ intro: v }); } })
                        )
                    ),
                    // Change Sections
                    el(PanelBody, { title: 'Change Sections', initialOpen: true },
                        a.sections.map(function (sec, si) {
                            return el('div', { key: si, style: { marginBottom: 16, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' } },
                                // Section header
                                el('div', { style: { background: '#f8fafc', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                                    el(SelectControl, { value: sec.type, options: sectionTypes, __nextHasNoMarginBottom: true, style: { marginBottom: 0 }, onChange: function (v) { set({ sections: a.sections.map(function (s, i) { return i === si ? Object.assign({}, s, { type: v }) : s; }) }); } }),
                                    el(Button, { isDestructive: true, variant: 'link', style: { fontSize: 11 }, onClick: function () { set({ sections: a.sections.filter(function (_, i) { return i !== si; }) }); } }, '✕')
                                ),
                                // Items
                                el('div', { style: { padding: '8px 12px' } },
                                    sec.items.map(function (item, ii) {
                                        return el('div', { key: ii, style: { display: 'flex', gap: 4, alignItems: 'center', marginBottom: 6 } },
                                            el('div', { style: { flex: 1 } },
                                                el(TextControl, { value: item, __nextHasNoMarginBottom: true, onChange: function (v) { set({ sections: updItem(a.sections, si, ii, v) }); } })
                                            ),
                                            el(Button, { variant: 'link', isDestructive: true, style: { fontSize: 11, padding: 0 }, onClick: function () {
                                                var items = sec.items.filter(function (_, i) { return i !== ii; });
                                                set({ sections: a.sections.map(function (s, i) { return i === si ? Object.assign({}, s, { items: items }) : s; }) });
                                            } }, '✕')
                                        );
                                    }),
                                    el(Button, { variant: 'secondary', style: { width: '100%', marginTop: 4, justifyContent: 'center' }, onClick: function () {
                                        var items = sec.items.concat(['New change item']);
                                        set({ sections: a.sections.map(function (s, i) { return i === si ? Object.assign({}, s, { items: items }) : s; }) });
                                    } }, '+ Add Item')
                                )
                            );
                        }),
                        el(Button, { variant: 'primary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () {
                            set({ sections: a.sections.concat([{ type: 'changed', items: ['New change item'] }]) });
                        } }, '+ Add Section')
                    ),
                    // Links
                    el(PanelBody, { title: 'Links', initialOpen: false },
                        el(ToggleControl, { label: 'Show Links', checked: a.showLinks, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showLinks: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Full Changelog URL', value: a.changelogUrl, __nextHasNoMarginBottom: true, onChange: function (v) { set({ changelogUrl: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Compare Changes URL', value: a.compareUrl, __nextHasNoMarginBottom: true, onChange: function (v) { set({ compareUrl: v }); } })
                        )
                    ),
                    // Typography
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        TC && el(TC, { label: __('Title / Version', 'blockenberg'), value: a.titleTypo || {}, onChange: function(v) { set({ titleTypo: v }); } }),
                        TC && el(TC, { label: __('Body Text', 'blockenberg'), value: a.bodyTypo || {}, onChange: function(v) { set({ bodyTypo: v }); } }),
                        el(RangeControl, { label: 'Product Name Size (px)', value: a.productNameSize, min: 10, max: 22, __nextHasNoMarginBottom: true, onChange: function(v) { set({ productNameSize: v }); } })
                    ),
                    el(PanelBody, { title: 'Spacing', initialOpen: false },
                        el(RangeControl, { label: 'Border Radius (px)', value: a.borderRadius, min: 0, max: 24, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(RangeControl, { label: 'Item Spacing (px)', value: a.itemSpacing, min: 2, max: 16, __nextHasNoMarginBottom: true, onChange: function (v) { set({ itemSpacing: v }); } })
                        )
                    ),
                    // Colors
                    el(PanelColorSettings, {
                        title: 'Header & Structure Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Block Background', value: a.bgColor,      onChange: function (v) { set({ bgColor: v || '#ffffff' }); } },
                            { label: 'Border',           value: a.borderColor,  onChange: function (v) { set({ borderColor: v || '#e5e7eb' }); } },
                            { label: 'Header BG',        value: a.headerBg,     onChange: function (v) { set({ headerBg: v || '#0f172a' }); } },
                            { label: 'Header Text',      value: a.headerColor,  onChange: function (v) { set({ headerColor: v || '#ffffff' }); } },
                            { label: 'Intro BG',         value: a.introBg,      onChange: function (v) { set({ introBg: v || '#f8fafc' }); } },
                            { label: 'Intro Text',       value: a.introColor,   onChange: function (v) { set({ introColor: v || '#374151' }); } },
                            { label: 'List Text',        value: a.textColor,    onChange: function (v) { set({ textColor: v || '#374151' }); } },
                            { label: 'Accent (links)',   value: a.accentColor,  onChange: function (v) { set({ accentColor: v || '#3b82f6' }); } }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: 'Section Type Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Added BG',        value: a.addedBg,         onChange: function (v) { set({ addedBg: v || '#dcfce7' }); } },
                            { label: 'Added Text',      value: a.addedColor,      onChange: function (v) { set({ addedColor: v || '#14532d' }); } },
                            { label: 'Changed BG',      value: a.changedBg,       onChange: function (v) { set({ changedBg: v || '#dbeafe' }); } },
                            { label: 'Changed Text',    value: a.changedColor,    onChange: function (v) { set({ changedColor: v || '#1e3a8a' }); } },
                            { label: 'Fixed BG',        value: a.fixedBg,         onChange: function (v) { set({ fixedBg: v || '#fef9c3' }); } },
                            { label: 'Fixed Text',      value: a.fixedColor,      onChange: function (v) { set({ fixedColor: v || '#713f12' }); } },
                            { label: 'Removed BG',      value: a.removedBg,       onChange: function (v) { set({ removedBg: v || '#fee2e2' }); } },
                            { label: 'Removed Text',    value: a.removedColor,    onChange: function (v) { set({ removedColor: v || '#991b1b' }); } },
                            { label: 'Security BG',     value: a.securityBg,      onChange: function (v) { set({ securityBg: v || '#f3e8ff' }); } },
                            { label: 'Security Text',   value: a.securityColor,   onChange: function (v) { set({ securityColor: v || '#581c87' }); } },
                            { label: 'Deprecated BG',   value: a.deprecatedBg,    onChange: function (v) { set({ deprecatedBg: v || '#f1f5f9' }); } },
                            { label: 'Deprecated Text', value: a.deprecatedColor, onChange: function (v) { set({ deprecatedColor: v || '#475569' }); } }
                        ]
                    })
                )
            );
        },

        save: function (props) {
            var useBlockProps = wp.blockEditor.useBlockProps;
            return wp.element.createElement('div', useBlockProps.save(),
                wp.element.createElement('div', {
                    className: 'bkbg-release-notes-app',
                    'data-opts': JSON.stringify(props.attributes)
                })
            );
        }
    });
}() );

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
    var Button = wp.components.Button;

    function getTypographyControl() { return (window.bkbgTypographyControl || function () { return null; }); }
    function getTypoCssVars() { return (window.bkbgTypoCssVars || function () { return {}; }); }
    function _tv(typo, prefix) { var fn = getTypoCssVars(); return fn(typo || {}, prefix); }

    registerBlockType('blockenberg/chapter-navigation', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;

            var blockProps = useBlockProps({ style: Object.assign({ padding: attr.paddingTop + 'px 0 ' + attr.paddingBottom + 'px' }, _tv(attr.typoTitle, '--bkbg-cnv-tt-')) });

            var progress = Math.round((attr.currentPart / attr.totalParts) * 100);

            function updateChapter(idx, key, value) {
                var arr = attr.chapters.map(function (c, i) {
                    if (i !== idx) return c;
                    var copy = Object.assign({}, c);
                    copy[key] = value;
                    return copy;
                });
                set({ chapters: arr });
            }

            var wrapStyle = { background: attr.bgColor, border: '1px solid ' + attr.borderColor, borderRadius: attr.borderRadius + 'px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.06)' };
            if (attr.style === 'banner') {
                wrapStyle = { background: attr.bgColor, borderLeft: '4px solid ' + attr.accentColor, borderTop: '1px solid ' + attr.borderColor, borderBottom: '1px solid ' + attr.borderColor, borderRight: '1px solid ' + attr.borderColor, borderRadius: attr.borderRadius + 'px', overflow: 'hidden' };
            }
            if (attr.style === 'minimal') {
                wrapStyle = { borderTop: '2px solid ' + attr.accentColor, paddingTop: '16px' };
            }

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Series Info', 'blockenberg'), initialOpen: true },
                    el(TextControl, { label: __('Series Title', 'blockenberg'), value: attr.seriesTitle, __nextHasNoMarginBottom: true, onChange: function (v) { set({ seriesTitle: v }); } }),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Current Chapter Title', 'blockenberg'), value: attr.currentTitle, __nextHasNoMarginBottom: true, onChange: function (v) { set({ currentTitle: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Part Label', 'blockenberg'), value: attr.partLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ partLabel: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px', display: 'flex', gap: '8px' } },
                        el('div', { style: { flex: 1 } },
                            el(RangeControl, { label: __('Current Part', 'blockenberg'), value: attr.currentPart, min: 1, max: attr.totalParts, __nextHasNoMarginBottom: true, onChange: function (v) { set({ currentPart: v }); } })
                        ),
                        el('div', { style: { flex: 1 } },
                            el(RangeControl, { label: __('Total Parts', 'blockenberg'), value: attr.totalParts, min: 1, max: 50, __nextHasNoMarginBottom: true, onChange: function (v) { set({ totalParts: v }); } })
                        )
                    )
                ),
                el(PanelBody, { title: __('Prev / Next', 'blockenberg'), initialOpen: false },
                    el(TextControl, { label: __('Previous Chapter Title', 'blockenberg'), value: attr.prevTitle, __nextHasNoMarginBottom: true, onChange: function (v) { set({ prevTitle: v }); } }),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Previous URL', 'blockenberg'), value: attr.prevUrl, placeholder: 'https://...', __nextHasNoMarginBottom: true, onChange: function (v) { set({ prevUrl: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(TextControl, { label: __('Next Chapter Title', 'blockenberg'), value: attr.nextTitle, __nextHasNoMarginBottom: true, onChange: function (v) { set({ nextTitle: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Next URL', 'blockenberg'), value: attr.nextUrl, placeholder: 'https://...', __nextHasNoMarginBottom: true, onChange: function (v) { set({ nextUrl: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Chapter List', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show All Chapters List', 'blockenberg'), checked: attr.showChapterList, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showChapterList: v }); } }),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Open List by Default', 'blockenberg'), checked: attr.chapterListOpen, __nextHasNoMarginBottom: true, onChange: function (v) { set({ chapterListOpen: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        (attr.chapters || []).map(function (ch, idx) {
                            return el('div', { key: idx, style: { marginBottom: '8px', padding: '8px', background: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' } },
                                el('strong', { style: { fontSize: '11px', color: '#6366f1' } }, (idx + 1) + '.'),
                                el('div', { style: { marginTop: '4px' } },
                                    el(TextControl, { label: '', value: ch.title, placeholder: 'Chapter title', __nextHasNoMarginBottom: true, onChange: function (v) { updateChapter(idx, 'title', v); } })
                                ),
                                el('div', { style: { marginTop: '4px' } },
                                    el(TextControl, { label: '', value: ch.url, placeholder: 'URL (https://...)', __nextHasNoMarginBottom: true, onChange: function (v) { updateChapter(idx, 'url', v); } })
                                ),
                                el(Button, { variant: 'link', isDestructive: true, style: { fontSize: '11px' }, onClick: function () { set({ chapters: attr.chapters.filter(function (_, i) { return i !== idx; }) }); } }, __('Remove', 'blockenberg'))
                            );
                        })
                    ),
                    el(Button, { variant: 'secondary', style: { marginTop: '8px' }, onClick: function () { set({ chapters: (attr.chapters || []).concat([{ title: 'New Chapter', url: '' }]) }); } }, __('+ Add Chapter', 'blockenberg'))
                ),
                el(PanelBody, { title: __('Style & Layout', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Style', 'blockenberg'), value: attr.style, __nextHasNoMarginBottom: true,
                        options: [{ label: 'Card (bordered box)', value: 'card' }, { label: 'Banner (left accent)', value: 'banner' }, { label: 'Minimal (top line)', value: 'minimal' }],
                        onChange: function (v) { set({ style: v }); }
                    }),
                    el('div', { style: { marginTop: '12px' } },
                        el(ToggleControl, { label: __('Show Progress Bar', 'blockenberg'), checked: attr.showProgress, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showProgress: v }); } })
                    ),
                    el('div', { style: { marginTop: '4px' } },
                        el(ToggleControl, { label: __('Open Links in New Tab', 'blockenberg'), checked: attr.openInNewTab, __nextHasNoMarginBottom: true, onChange: function (v) { set({ openInNewTab: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Border Radius', 'blockenberg'), value: attr.borderRadius, min: 0, max: 24, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: attr.paddingTop, min: 0, max: 120, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingTop: v }); } }),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 120, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingBottom: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    el(getTypographyControl(), { label: __('Current Title', 'blockenberg'), value: attr.typoTitle, onChange: function (v) { set({ typoTitle: v }); } }),
                    el(RangeControl, { label: __('Series Title Size (px)', 'blockenberg'), value: attr.seriesTitleFontSize, min: 10, max: 20, __nextHasNoMarginBottom: true, onChange: function (v) { set({ seriesTitleFontSize: v }); } }),
                    el(RangeControl, { label: __('Nav Button Size (px)', 'blockenberg'), value: attr.navFontSize, min: 10, max: 20, __nextHasNoMarginBottom: true, onChange: function (v) { set({ navFontSize: v }); } }),
                    el(RangeControl, { label: __('Chapter List Size (px)', 'blockenberg'), value: attr.chapterListFontSize, min: 10, max: 20, __nextHasNoMarginBottom: true, onChange: function (v) { set({ chapterListFontSize: v }); } })
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { set({ bgColor: v || '#ffffff' }); } },
                        { label: __('Border', 'blockenberg'), value: attr.borderColor, onChange: function (v) { set({ borderColor: v || '#e2e8f0' }); } },
                        { label: __('Accent', 'blockenberg'), value: attr.accentColor, onChange: function (v) { set({ accentColor: v || '#6366f1' }); } },
                        { label: __('Series Title', 'blockenberg'), value: attr.seriesTitleColor, onChange: function (v) { set({ seriesTitleColor: v || '#374151' }); } },
                        { label: __('Current Title', 'blockenberg'), value: attr.currentTitleColor, onChange: function (v) { set({ currentTitleColor: v || '#111827' }); } },
                        { label: __('Progress Bar BG', 'blockenberg'), value: attr.progressBg, onChange: function (v) { set({ progressBg: v || '#e2e8f0' }); } },
                        { label: __('Progress Fill', 'blockenberg'), value: attr.progressFill, onChange: function (v) { set({ progressFill: v || '#6366f1' }); } },
                        { label: __('Nav Button BG', 'blockenberg'), value: attr.btnBg, onChange: function (v) { set({ btnBg: v || '#f1f5f9' }); } },
                        { label: __('Nav Button Text', 'blockenberg'), value: attr.btnColor, onChange: function (v) { set({ btnColor: v || '#374151' }); } },
                        { label: __('Pill BG', 'blockenberg'), value: attr.pillBg, onChange: function (v) { set({ pillBg: v || '#eef2ff' }); } },
                        { label: __('Pill Text', 'blockenberg'), value: attr.pillColor, onChange: function (v) { set({ pillColor: v || '#4f46e5' }); } },
                        { label: __('Chapter List BG', 'blockenberg'), value: attr.chapterListBg, onChange: function (v) { set({ chapterListBg: v || '#f8fafc' }); } },
                        { label: __('Active Chapter BG', 'blockenberg'), value: attr.activeChapterBg, onChange: function (v) { set({ activeChapterBg: v || '#eef2ff' }); } },
                        { label: __('Active Chapter Text', 'blockenberg'), value: attr.activeChapterColor, onChange: function (v) { set({ activeChapterColor: v || '#4f46e5' }); } }
                    ]
                })
            );

            /* ── Editor preview ── */
            var header = el('div', { style: { padding: '16px 20px', borderBottom: attr.style !== 'minimal' ? '1px solid ' + attr.borderColor : 'none' } },
                el('div', { style: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' } },
                    el('span', { style: { background: attr.pillBg, color: attr.pillColor, padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 } }, attr.partLabel + ' ' + attr.currentPart + ' of ' + attr.totalParts),
                    el('span', { style: { color: attr.seriesTitleColor, fontSize: attr.seriesTitleFontSize + 'px' } }, attr.seriesTitle)
                ),
                el('div', { className: 'bkbg-cnv-current-title', style: { color: attr.currentTitleColor } }, attr.currentTitle),
                attr.showProgress && el('div', { style: { marginTop: '10px' } },
                    el('div', { style: { background: attr.progressBg, borderRadius: '4px', height: '6px', overflow: 'hidden' } },
                        el('div', { style: { background: attr.progressFill, width: progress + '%', height: '100%', borderRadius: '4px', transition: 'width .3s' } })
                    ),
                    el('div', { style: { fontSize: '11px', color: attr.seriesTitleColor, marginTop: '4px' } }, progress + '% through the series')
                )
            );

            var navRow = el('div', { style: { display: 'flex', gap: '10px', padding: '14px 20px', flexWrap: 'wrap' } },
                attr.prevTitle && el('a', { href: '#', style: { flex: 1, minWidth: '160px', background: attr.btnBg, color: attr.btnColor, padding: '10px 14px', borderRadius: '6px', fontSize: attr.navFontSize + 'px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '2px' } },
                    el('span', { style: { fontSize: '11px', opacity: 0.7 } }, '← Previous'),
                    el('span', { style: { fontWeight: 600 } }, attr.prevTitle)
                ),
                attr.nextTitle && el('a', { href: '#', style: { flex: 1, minWidth: '160px', background: attr.accentColor, color: '#fff', padding: '10px 14px', borderRadius: '6px', fontSize: attr.navFontSize + 'px', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'right' } },
                    el('span', { style: { fontSize: '11px', opacity: 0.8 } }, 'Next →'),
                    el('span', { style: { fontWeight: 600 } }, attr.nextTitle)
                )
            );

            var chapterList = attr.showChapterList && el('details', { open: attr.chapterListOpen || true, style: { borderTop: '1px solid ' + attr.borderColor } },
                el('summary', { style: { padding: '12px 20px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: attr.seriesTitleColor, listStyle: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: attr.chapterListBg } },
                    el('span', {}, 'All ' + attr.totalParts + ' chapters'),
                    el('span', { style: { fontSize: '16px' } }, '▾')
                ),
                el('ol', { style: { margin: 0, padding: '8px 0', listStyle: 'none', background: attr.chapterListBg } },
                    (attr.chapters || []).map(function (ch, i) {
                        var isActive = (i + 1) === attr.currentPart;
                        return el('li', { key: i, style: { padding: '8px 20px 8px 44px', position: 'relative', background: isActive ? attr.activeChapterBg : 'transparent', fontSize: attr.chapterListFontSize + 'px' } },
                            el('span', { style: { position: 'absolute', left: '20px', fontWeight: 700, color: isActive ? attr.activeChapterColor : attr.seriesTitleColor } }, i + 1 + '.'),
                            el('span', { style: { color: isActive ? attr.activeChapterColor : attr.seriesTitleColor, fontWeight: isActive ? 600 : 400 } }, ch.title),
                            isActive && el('span', { style: { marginLeft: '8px', fontSize: '11px', padding: '1px 7px', background: attr.accentColor, color: '#fff', borderRadius: '10px' } }, 'Current')
                        );
                    })
                )
            );

            return el('div', blockProps,
                controls,
                el('div', { style: wrapStyle },
                    header,
                    navRow,
                    chapterList
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-cnv-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );

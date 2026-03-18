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
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var Button = wp.components.Button;

    var resIcon = { article: '📄', video: '🎥', tool: '🛠️', download: '⬇️', link: '🔗' };

    var _tc, _tv;
    function getTC() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTV() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function upd(arr, idx, field, val) {
        return arr.map(function (e, i) {
            if (i !== idx) return e;
            var u = {}; u[field] = val;
            return Object.assign({}, e, u);
        });
    }

    function sectionHead(label, a) {
        return el('div', { style: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.09em', color: a.accentColor, borderBottom: '2px solid ' + a.accentColor, paddingBottom: 5, marginBottom: 10 } }, label);
    }

    registerBlockType('blockenberg/show-notes', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var _tvf = getTV();
                var s = {};
                if (_tvf) {
                    Object.assign(s, _tvf(a.titleTypo, '--bksn-tt-'));
                    Object.assign(s, _tvf(a.bodyTypo, '--bksn-bt-'));
                    Object.assign(s, _tvf(a.typoQuote, '--bksn-qt-'));
                }
                return { className: 'bkbg-sn-editor-wrap', style: s };
            })());

            var preview = el('div', { style: { border: '1px solid ' + a.borderColor, borderRadius: a.borderRadius + 'px', overflow: 'hidden', background: a.bgColor, fontSize: a.fontSize + 'px', lineHeight: (a.lineHeight / 100).toFixed(2) } },
                // Header
                el('div', { style: { background: a.headerBg, padding: '18px 24px' } },
                    a.showEpisodeMeta && el('div', { style: { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' } },
                        el('span', { style: { fontSize: a.podcastNameSize || 11, color: a.metaColor, fontWeight: 600 } }, a.podcastName),
                        el('span', { style: { color: a.metaColor, opacity: .35 } }, '·'),
                        el('span', { style: { fontSize: 11, color: a.metaColor } }, a.episodeNumber),
                        a.season && el('span', { style: { fontSize: 11, color: a.metaColor } }, ' / ' + a.season)
                    ),
                    el('h2', { className: 'bkbg-sn-title', style: { margin: '0 0 10px', color: a.headerColor } }, a.episodeTitle),
                    a.showMeta && el('div', { style: { display: 'flex', gap: 14, flexWrap: 'wrap' } },
                        a.publishDate && el('span', { style: { fontSize: 12, color: a.metaColor } }, '📅 ' + a.publishDate),
                        a.duration && el('span', { style: { fontSize: 12, color: a.metaColor } }, '⏱ ' + a.duration)
                    )
                ),
                // Body
                el('div', { style: { padding: '18px 24px', display: 'grid', gap: 20 } },
                    // Intro
                    a.showIntro && a.intro && el('div', { style: { background: a.introBg, borderRadius: 8, padding: '12px 16px' } },
                        el('p', { style: { margin: 0, color: a.introColor, lineHeight: (a.lineHeight / 100).toFixed(2) } }, a.intro)
                    ),
                    // Quote
                    a.showQuote && a.quoteHighlight && el('figure', { style: { margin: 0, background: a.quoteBg, borderLeft: '4px solid ' + a.quoteBorder, borderRadius: '0 8px 8px 0', padding: '14px 18px' } },
                        el('blockquote', { style: { margin: 0, fontSize: (a.fontSize + 1) + 'px', fontStyle: 'italic', color: a.quoteColor, lineHeight: (a.lineHeight / 100).toFixed(2) } }, '"' + a.quoteHighlight + '"'),
                        a.quoteSpeaker && el('figcaption', { style: { marginTop: 8, fontSize: 12, fontWeight: 700, color: a.quoteColor, opacity: .8 } }, '— ' + a.quoteSpeaker)
                    ),
                    // Sponsors
                    a.showSponsors && a.sponsors.length > 0 && el('div', null,
                        sectionHead(a.sponsorsLabel, a),
                        el('div', { style: { display: 'grid', gap: 8 } },
                            a.sponsors.map(function (sp, i) {
                                return el('div', { key: i, style: { background: a.sponsorBg, border: '1px solid ' + a.sponsorBorder, borderRadius: 8, padding: '10px 14px' } },
                                    el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4, flexWrap: 'wrap', gap: 6 } },
                                        el('strong', { style: { color: '#713f12' } }, sp.name),
                                        sp.code && el('span', { style: { fontSize: 11, background: '#fef9c3', color: '#713f12', padding: '2px 8px', borderRadius: 100, fontWeight: 700 } }, 'Code: ' + sp.code)
                                    ),
                                    el('p', { style: { margin: 0, fontSize: (a.fontSize - 1) + 'px', color: a.sponsorColor } }, sp.description)
                                );
                            })
                        )
                    ),
                    // Chapters
                    a.showChapters && a.chapters.length > 0 && el('div', null,
                        sectionHead(a.chaptersLabel, a),
                        el('div', null,
                            a.chapters.map(function (ch, i) {
                                return el('div', { key: i, style: { display: 'flex', gap: 12, alignItems: 'baseline', padding: '7px 0', borderBottom: i < a.chapters.length - 1 ? '1px dashed ' + a.borderColor : 'none' } },
                                    el('span', { style: { fontFamily: 'monospace', fontSize: 11, fontWeight: 700, background: a.chapterTimeBg, color: a.chapterTimeColor, padding: '2px 7px', borderRadius: 4, flexShrink: 0 } }, ch.time),
                                    el('span', { style: { color: a.chapterTitleColor, fontSize: a.fontSize + 'px' } }, ch.title)
                                );
                            })
                        )
                    ),
                    // Links Mentioned
                    a.showLinks && a.links.length > 0 && el('div', null,
                        sectionHead(a.linksLabel, a),
                        el('div', null,
                            a.links.map(function (lnk, i) {
                                return el('div', { key: i, style: { padding: '7px 0', borderBottom: i < a.links.length - 1 ? '1px solid ' + a.borderColor : 'none' } },
                                    el('div', { style: { fontWeight: 600, color: a.linkColor, marginBottom: 2 } }, lnk.title),
                                    lnk.description && el('div', { style: { fontSize: (a.fontSize - 1) + 'px', color: a.linkDescColor } }, lnk.description)
                                );
                            })
                        )
                    ),
                    // Resources
                    a.showResources && a.resources.length > 0 && el('div', null,
                        sectionHead(a.resourcesLabel, a),
                        el('div', { style: { display: 'grid', gap: 6 } },
                            a.resources.map(function (r, i) {
                                return el('div', { key: i, style: { display: 'flex', gap: 10, alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: 8, borderLeft: '3px solid ' + a.accentColor } },
                                    el('span', null, resIcon[r.type] || '🔗'),
                                    el('span', { style: { color: a.linkColor, fontWeight: 500, fontSize: a.fontSize + 'px' } }, r.title)
                                );
                            })
                        )
                    ),
                    // Tags
                    a.showTags && a.tags.length > 0 && el('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
                        a.tags.map(function (tag, i) {
                            return el('span', { key: i, style: { background: a.tagBg, color: a.tagColor, padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600 } }, tag);
                        })
                    )
                )
            );

            return el(Fragment, null,
                el('div', blockProps, preview),
                el(InspectorControls, null,
                    el(PanelBody, { title: 'Episode Info', initialOpen: true },
                        el(TextControl, { label: 'Podcast Name', value: a.podcastName, __nextHasNoMarginBottom: true, onChange: function (v) { set({ podcastName: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Episode Title', value: a.episodeTitle, __nextHasNoMarginBottom: true, onChange: function (v) { set({ episodeTitle: v }); } })
                        ),
                        el('div', { style: { marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
                            el(TextControl, { label: 'Episode #', value: a.episodeNumber, __nextHasNoMarginBottom: true, onChange: function (v) { set({ episodeNumber: v }); } }),
                            el(TextControl, { label: 'Season', value: a.season, __nextHasNoMarginBottom: true, onChange: function (v) { set({ season: v }); } })
                        ),
                        el('div', { style: { marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
                            el(TextControl, { label: 'Date', value: a.publishDate, __nextHasNoMarginBottom: true, onChange: function (v) { set({ publishDate: v }); } }),
                            el(TextControl, { label: 'Duration', value: a.duration, __nextHasNoMarginBottom: true, onChange: function (v) { set({ duration: v }); } })
                        ),
                        el('div', { style: { marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
                            el(ToggleControl, { label: 'Show Ep #', checked: a.showEpisodeMeta, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showEpisodeMeta: v }); } }),
                            el(ToggleControl, { label: 'Show Date/Dur', checked: a.showMeta, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showMeta: v }); } })
                        )
                    ),
                    el(PanelBody, { title: 'Introduction', initialOpen: false },
                        el(ToggleControl, { label: 'Show Introduction', checked: a.showIntro, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showIntro: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextareaControl, { label: 'Intro Text', value: a.intro, rows: 4, __nextHasNoMarginBottom: true, onChange: function (v) { set({ intro: v }); } })
                        )
                    ),
                    el(PanelBody, { title: 'Featured Quote', initialOpen: false },
                        el(ToggleControl, { label: 'Show Quote', checked: a.showQuote, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showQuote: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextareaControl, { label: 'Quote', value: a.quoteHighlight, rows: 3, __nextHasNoMarginBottom: true, onChange: function (v) { set({ quoteHighlight: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Speaker', value: a.quoteSpeaker, __nextHasNoMarginBottom: true, onChange: function (v) { set({ quoteSpeaker: v }); } })
                        )
                    ),
                    el(PanelBody, { title: 'Sponsors', initialOpen: false },
                        el(ToggleControl, { label: 'Show Sponsors', checked: a.showSponsors, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showSponsors: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Section Label', value: a.sponsorsLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ sponsorsLabel: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            a.sponsors.map(function (sp, i) {
                                return el('div', { key: i, style: { marginBottom: 10, padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f8fafc' } },
                                    el('div', { style: { display: 'flex', justifyContent: 'flex-end', marginBottom: 4 } },
                                        el(Button, { isDestructive: true, variant: 'link', style: { fontSize: 11 }, onClick: function () { set({ sponsors: a.sponsors.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                                    ),
                                    el(TextControl, { label: 'Sponsor Name', value: sp.name, __nextHasNoMarginBottom: true, onChange: function (v) { set({ sponsors: upd(a.sponsors, i, 'name', v) }); } }),
                                    el('div', { style: { marginTop: 8 } },
                                        el(TextareaControl, { label: 'Description', value: sp.description, rows: 2, __nextHasNoMarginBottom: true, onChange: function (v) { set({ sponsors: upd(a.sponsors, i, 'description', v) }); } })
                                    ),
                                    el('div', { style: { marginTop: 8, display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8 } },
                                        el(TextControl, { label: 'URL', value: sp.url, __nextHasNoMarginBottom: true, onChange: function (v) { set({ sponsors: upd(a.sponsors, i, 'url', v) }); } }),
                                        el(TextControl, { label: 'Promo Code', value: sp.code, __nextHasNoMarginBottom: true, onChange: function (v) { set({ sponsors: upd(a.sponsors, i, 'code', v) }); } })
                                    )
                                );
                            }),
                            el(Button, { variant: 'primary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () { set({ sponsors: a.sponsors.concat([{ name: 'Sponsor', description: '', url: '#', code: '' }]) }); } }, '+ Add Sponsor')
                        )
                    ),
                    el(PanelBody, { title: 'Chapters', initialOpen: false },
                        el(ToggleControl, { label: 'Show Chapters', checked: a.showChapters, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showChapters: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Section Label', value: a.chaptersLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ chaptersLabel: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            a.chapters.map(function (ch, i) {
                                return el('div', { key: i, style: { display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 6, marginBottom: 6, alignItems: 'center' } },
                                    el(TextControl, { label: '', value: ch.time, placeholder: '00:00', __nextHasNoMarginBottom: true, onChange: function (v) { set({ chapters: upd(a.chapters, i, 'time', v) }); } }),
                                    el(TextControl, { label: '', value: ch.title, __nextHasNoMarginBottom: true, onChange: function (v) { set({ chapters: upd(a.chapters, i, 'title', v) }); } }),
                                    el(Button, { isDestructive: true, variant: 'link', onClick: function () { set({ chapters: a.chapters.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                                );
                            }),
                            el(Button, { variant: 'primary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () { set({ chapters: a.chapters.concat([{ time: '00:00', title: 'New chapter' }]) }); } }, '+ Add Chapter')
                        )
                    ),
                    el(PanelBody, { title: 'Links Mentioned', initialOpen: false },
                        el(ToggleControl, { label: 'Show Links', checked: a.showLinks, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showLinks: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Section Label', value: a.linksLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ linksLabel: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            a.links.map(function (lnk, i) {
                                return el('div', { key: i, style: { marginBottom: 10, padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f8fafc' } },
                                    el('div', { style: { display: 'flex', justifyContent: 'flex-end', marginBottom: 4 } },
                                        el(Button, { isDestructive: true, variant: 'link', style: { fontSize: 11 }, onClick: function () { set({ links: a.links.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                                    ),
                                    el(TextControl, { label: 'Title', value: lnk.title, __nextHasNoMarginBottom: true, onChange: function (v) { set({ links: upd(a.links, i, 'title', v) }); } }),
                                    el('div', { style: { marginTop: 8 } },
                                        el(TextControl, { label: 'URL', value: lnk.url, __nextHasNoMarginBottom: true, onChange: function (v) { set({ links: upd(a.links, i, 'url', v) }); } })
                                    ),
                                    el('div', { style: { marginTop: 8 } },
                                        el(TextControl, { label: 'Description', value: lnk.description, __nextHasNoMarginBottom: true, onChange: function (v) { set({ links: upd(a.links, i, 'description', v) }); } })
                                    )
                                );
                            }),
                            el(Button, { variant: 'primary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () { set({ links: a.links.concat([{ title: 'Link', url: '#', description: '' }]) }); } }, '+ Add Link')
                        )
                    ),
                    el(PanelBody, { title: 'Resources', initialOpen: false },
                        el(ToggleControl, { label: 'Show Resources', checked: a.showResources, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showResources: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Section Label', value: a.resourcesLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ resourcesLabel: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            a.resources.map(function (r, i) {
                                return el('div', { key: i, style: { display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' } },
                                    el(TextControl, { label: '', value: r.title, __nextHasNoMarginBottom: true, onChange: function (v) { set({ resources: upd(a.resources, i, 'title', v) }); } }),
                                    el(Button, { isDestructive: true, variant: 'link', onClick: function () { set({ resources: a.resources.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                                );
                            }),
                            el(Button, { variant: 'primary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () { set({ resources: a.resources.concat([{ title: 'Resource', url: '#', type: 'article' }]) }); } }, '+ Add Resource')
                        )
                    ),
                    el(PanelBody, { title: 'Tags', initialOpen: false },
                        el(ToggleControl, { label: 'Show Tags', checked: a.showTags, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showTags: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            a.tags.map(function (tag, i) {
                                return el('div', { key: i, style: { display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' } },
                                    el(TextControl, { label: '', value: tag, __nextHasNoMarginBottom: true, onChange: function (v) { set({ tags: a.tags.map(function (x, j) { return j === i ? v : x; }) }); } }),
                                    el(Button, { isDestructive: true, variant: 'link', onClick: function () { set({ tags: a.tags.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                                );
                            }),
                            el(Button, { variant: 'secondary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () { set({ tags: a.tags.concat(['new tag']) }); } }, '+ Add Tag')
                        )
                    ),
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        el(getTC(), { label: 'Title', value: a.titleTypo, onChange: function (v) { set({ titleTypo: v }); } }),
                        el(getTC(), { label: 'Body Text', value: a.bodyTypo, onChange: function (v) { set({ bodyTypo: v }); } }),
                        el(getTC(), { label: __('Featured Quote', 'blockenberg'), value: a.typoQuote, onChange: function (v) { set({ typoQuote: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(RangeControl, { label: 'Podcast Name Size (px)', value: a.podcastNameSize, min: 9, max: 18, __nextHasNoMarginBottom: true, onChange: function (v) { set({ podcastNameSize: v }); } })
                        )
                    ),
                    el(PanelBody, { title: 'Spacing', initialOpen: false },
                        el(RangeControl, { label: 'Border Radius (px)', value: a.borderRadius, min: 0, max: 24, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } })
                    ),
                    el(PanelColorSettings, {
                        title: 'Header & Layout Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Header BG',    value: a.headerBg,    onChange: function (v) { set({ headerBg: v || '#0f172a' }); } },
                            { label: 'Header Text',  value: a.headerColor, onChange: function (v) { set({ headerColor: v || '#ffffff' }); } },
                            { label: 'Meta Text',    value: a.metaColor,   onChange: function (v) { set({ metaColor: v || '#94a3b8' }); } },
                            { label: 'Block BG',     value: a.bgColor,     onChange: function (v) { set({ bgColor: v || '#ffffff' }); } },
                            { label: 'Border',       value: a.borderColor, onChange: function (v) { set({ borderColor: v || '#e5e7eb' }); } },
                            { label: 'Accent',       value: a.accentColor, onChange: function (v) { set({ accentColor: v || '#3b82f6' }); } }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: 'Content Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Intro BG',         value: a.introBg,        onChange: function (v) { set({ introBg: v || '#f8fafc' }); } },
                            { label: 'Intro Text',       value: a.introColor,     onChange: function (v) { set({ introColor: v || '#374151' }); } },
                            { label: 'Sponsor BG',       value: a.sponsorBg,      onChange: function (v) { set({ sponsorBg: v || '#fffbeb' }); } },
                            { label: 'Sponsor Border',   value: a.sponsorBorder,  onChange: function (v) { set({ sponsorBorder: v || '#fbbf24' }); } },
                            { label: 'Chapter Time BG',  value: a.chapterTimeBg,  onChange: function (v) { set({ chapterTimeBg: v || '#f1f5f9' }); } },
                            { label: 'Chapter Time',     value: a.chapterTimeColor,onChange: function (v) { set({ chapterTimeColor: v || '#475569' }); } },
                            { label: 'Link Color',       value: a.linkColor,      onChange: function (v) { set({ linkColor: v || '#2563eb' }); } },
                            { label: 'Quote BG',         value: a.quoteBg,        onChange: function (v) { set({ quoteBg: v || '#f0f9ff' }); } },
                            { label: 'Quote Text',       value: a.quoteColor,     onChange: function (v) { set({ quoteColor: v || '#0369a1' }); } },
                            { label: 'Quote Border',     value: a.quoteBorder,    onChange: function (v) { set({ quoteBorder: v || '#3b82f6' }); } },
                            { label: 'Tag BG',           value: a.tagBg,          onChange: function (v) { set({ tagBg: v || '#eff6ff' }); } },
                            { label: 'Tag Text',         value: a.tagColor,       onChange: function (v) { set({ tagColor: v || '#1d4ed8' }); } }
                        ]
                    })
                )
            );
        },

        save: function (props) {
            var useBlockProps = wp.blockEditor.useBlockProps;
            return wp.element.createElement('div', useBlockProps.save(),
                wp.element.createElement('div', {
                    className: 'bkbg-show-notes-app',
                    'data-opts': JSON.stringify(props.attributes)
                })
            );
        }
    });
}() );

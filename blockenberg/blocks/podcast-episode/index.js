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
    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function upd(arr, idx, field, val) {
        return arr.map(function (e, i) {
            if (i !== idx) return e;
            var u = {}; u[field] = val;
            return Object.assign({}, e, u);
        });
    }

    var resourceTypeOptions = [
        { label: '📄 Article', value: 'article' },
        { label: '📚 Book',    value: 'book'    },
        { label: '🔗 Link',    value: 'link'    },
        { label: '🎥 Video',   value: 'video'   },
        { label: '🛠️ Tool',   value: 'tool'    }
    ];

    function resourceIcon(type) {
        var map = { article: '📄', book: '📚', link: '🔗', video: '🎥', tool: '🛠️' };
        return map[type] || '🔗';
    }

    function sectionHead(label, a) {
        return el('div', { className: 'bkbg-pe-section-head', style: { color: a.sectionHeadColor, marginBottom: 12, paddingBottom: 6, borderBottom: '2px solid ' + a.accentColor, display: 'inline-block' } }, label);
    }

    registerBlockType('blockenberg/podcast-episode', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var _tv = getTypoCssVars();
                var s = {};
                if (_tv) {
                    Object.assign(s, _tv(a.titleTypo, '--bkbg-pe-tt-'));
                    Object.assign(s, _tv(a.bodyTypo, '--bkbg-pe-bd-'));
                }
                return { className: 'bkbg-pe-editor-wrap', style: s };
            })());

            // Preview
            var preview = el('div', { style: { borderRadius: a.borderRadius + 'px', overflow: 'hidden', border: '1px solid ' + a.bodyBorderColor } },

                // Header (dark)
                el('div', { style: { background: a.bgColor, padding: '24px 28px 20px' } },
                    a.showPodcastName && el('div', { style: { fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: a.headerColor, opacity: .55, marginBottom: 8 } }, a.podcastName),
                    el('h2', { className: 'bkbg-pe-title', style: { margin: '0 0 10px', color: a.headerColor, lineHeight: 1.2 } }, a.episodeTitle),
                    el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' } },
                        a.showNumber && el('span', { style: { fontSize: 12, color: a.headerColor, opacity: .6 } }, 'S' + a.season + ' · E' + a.episodeNumber),
                        a.showMeta && a.publishDate && el('span', { style: { fontSize: 12, color: a.headerColor, opacity: .6 } }, '📅 ' + a.publishDate),
                        a.showMeta && a.duration && el('span', { style: { fontSize: 12, color: a.headerColor, opacity: .6 } }, '⏱ ' + a.duration),
                        a.showListenLinks && el('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 } },
                            a.listenLinks.map(function (lnk, i) {
                                return el('a', { key: i, href: lnk.url || '#', style: { background: a.listenBtnBg, color: a.listenBtnColor, padding: '4px 12px', borderRadius: 100, fontSize: 11, fontWeight: 700, textDecoration: 'none' } }, lnk.platform);
                            })
                        )
                    )
                ),

                // Body (white)
                el('div', { className: 'bkbg-pe-body', style: { background: a.bodyBg, padding: '20px 28px' } },
                    // Description
                    a.showDescription && a.description && el('div', { style: { marginBottom: 24 } },
                        el('p', { className: 'bkbg-pe-desc', style: { margin: 0, color: a.textColor } }, a.description)
                    ),
                    // Guests
                    a.showGuests && a.guests.length > 0 && el('div', { style: { marginBottom: 24 } },
                        sectionHead(a.guestsLabel || 'Guests', a),
                        el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12, marginTop: 4 } },
                            a.guests.map(function (g, i) {
                                return el('div', { key: i, style: { background: a.guestBg, border: '1px solid ' + a.guestBorderColor, borderRadius: 8, padding: '12px 14px' } },
                                    el('div', { className: 'bkbg-pe-guest-name', style: { color: a.guestNameColor, marginBottom: 2 } }, g.name),
                                    el('div', { style: { fontSize: 11, fontWeight: 600, color: a.guestRoleColor, marginBottom: 6 } }, g.role),
                                    g.bio && el('p', { className: 'bkbg-pe-guest-bio', style: { margin: 0, color: a.mutedColor } }, g.bio)
                                );
                            })
                        )
                    ),
                    // Chapters
                    a.showTimestamps && a.timestamps.length > 0 && el('div', { style: { marginBottom: 24 } },
                        sectionHead(a.timestampsLabel || 'Chapters', a),
                        el('div', { style: { marginTop: 4 } },
                            a.timestamps.map(function (ts, i) {
                                return el('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: 12, padding: '5px 0', borderBottom: i < a.timestamps.length - 1 ? '1px dashed ' + a.bodyBorderColor : 'none' } },
                                    el('span', { style: { background: a.chapterTimeBg, color: a.chapterTimeColor, fontFamily: 'monospace', fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 4, flexShrink: 0, minWidth: 48, textAlign: 'center' } }, ts.time),
                                    el('span', { className: 'bkbg-pe-chapter-text', style: { color: a.textColor } }, ts.title)
                                );
                            })
                        )
                    ),
                    // Resources
                    a.showResources && a.resources.length > 0 && el('div', { style: { marginBottom: 24 } },
                        sectionHead(a.resourcesLabel || 'Resources & Links', a),
                        el('ul', { style: { margin: '4px 0 0', padding: 0, listStyle: 'none' } },
                            a.resources.map(function (r, i) {
                                return el('li', { key: i, style: { display: 'flex', gap: 8, alignItems: 'center', padding: '5px 0', borderBottom: i < a.resources.length - 1 ? '1px dashed ' + a.bodyBorderColor : 'none' } },
                                    el('span', { style: { flexShrink: 0, fontSize: 15, color: a.resourceIconColor } }, resourceIcon(r.type)),
                                    el('a', { href: r.url || '#', className: 'bkbg-pe-resource-link', style: { color: a.accentColor, textDecoration: 'none' } }, r.title)
                                );
                            })
                        )
                    ),
                    // Transcript/quote
                    a.showTranscript && a.transcript && el('div', { style: { marginBottom: 24 } },
                        sectionHead(a.transcriptLabel || 'Highlighted Quote', a),
                        el('blockquote', { className: 'bkbg-pe-quote', style: { margin: '8px 0 0', padding: '14px 18px', background: a.transcriptBg, borderLeft: '4px solid ' + a.transcriptBorderColor, borderRadius: '0 8px 8px 0', color: a.textColor, whiteSpace: 'pre-line' } }, a.transcript)
                    ),
                    // Tags
                    a.showTags && a.tags.length > 0 && el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } },
                        a.tags.map(function (tag, i) {
                            return el('span', { key: i, style: { background: a.tagBg, color: a.tagColor, padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600 } }, tag);
                        })
                    )
                )
            );

            return el(Fragment, null,
                el('div', blockProps, preview),
                el(InspectorControls, null,
                    // Episode Info
                    el(PanelBody, { title: 'Episode Info', initialOpen: true },
                        el(TextControl, { label: 'Episode Title', value: a.episodeTitle, __nextHasNoMarginBottom: true, onChange: function (v) { set({ episodeTitle: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Podcast Name', value: a.podcastName, __nextHasNoMarginBottom: true, onChange: function (v) { set({ podcastName: v }); } })
                        ),
                        el('div', { style: { marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
                            el(TextControl, { label: 'Episode #', value: a.episodeNumber, __nextHasNoMarginBottom: true, onChange: function (v) { set({ episodeNumber: v }); } }),
                            el(TextControl, { label: 'Season #', value: a.season, __nextHasNoMarginBottom: true, onChange: function (v) { set({ season: v }); } })
                        ),
                        el('div', { style: { marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
                            el(TextControl, { label: 'Publish Date', value: a.publishDate, __nextHasNoMarginBottom: true, onChange: function (v) { set({ publishDate: v }); } }),
                            el(TextControl, { label: 'Duration', value: a.duration, __nextHasNoMarginBottom: true, onChange: function (v) { set({ duration: v }); } })
                        ),
                        el('div', { style: { marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 } },
                            el(ToggleControl, { label: 'Show Number', checked: a.showNumber, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showNumber: v }); } }),
                            el(ToggleControl, { label: 'Show Podcast Name', checked: a.showPodcastName, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showPodcastName: v }); } }),
                            el(ToggleControl, { label: 'Show Meta', checked: a.showMeta, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showMeta: v }); } })
                        )
                    ),
                    // Description
                    el(PanelBody, { title: 'Show Notes / Description', initialOpen: false },
                        el(ToggleControl, { label: 'Show Description', checked: a.showDescription, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showDescription: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextareaControl, { value: a.description, rows: 5, __nextHasNoMarginBottom: true, onChange: function (v) { set({ description: v }); } })
                        )
                    ),
                    // Listen links
                    el(PanelBody, { title: 'Listen Links', initialOpen: false },
                        el(ToggleControl, { label: 'Show Listen Buttons', checked: a.showListenLinks, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showListenLinks: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Label', value: a.listenLinksLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ listenLinksLabel: v }); } })
                        ),
                        a.listenLinks.map(function (lnk, i) {
                            return el('div', { key: i, style: { marginTop: 10, padding: '8px 10px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e5e7eb' } },
                                el('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 } },
                                    el('strong', { style: { fontSize: 11 } }, 'Link ' + (i + 1)),
                                    el(Button, { isDestructive: true, variant: 'link', style: { fontSize: 11 }, onClick: function () { set({ listenLinks: a.listenLinks.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                                ),
                                el(TextControl, { label: 'Platform', value: lnk.platform, __nextHasNoMarginBottom: true, onChange: function (v) { set({ listenLinks: upd(a.listenLinks, i, 'platform', v) }); } }),
                                el('div', { style: { marginTop: 6 } },
                                    el(TextControl, { label: 'URL', value: lnk.url, __nextHasNoMarginBottom: true, onChange: function (v) { set({ listenLinks: upd(a.listenLinks, i, 'url', v) }); } })
                                )
                            );
                        }),
                        el(Button, { variant: 'secondary', style: { marginTop: 8 }, onClick: function () { set({ listenLinks: a.listenLinks.concat([{ platform: 'Platform', url: '#' }]) }); } }, '+ Add Link')
                    ),
                    // Guests
                    el(PanelBody, { title: 'Guests', initialOpen: false },
                        el(ToggleControl, { label: 'Show Guests', checked: a.showGuests, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showGuests: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Section Label', value: a.guestsLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ guestsLabel: v }); } })
                        ),
                        a.guests.map(function (g, i) {
                            return el('div', { key: i, style: { marginTop: 10, padding: '8px 10px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e5e7eb' } },
                                el('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 } },
                                    el('strong', { style: { fontSize: 11 } }, 'Guest ' + (i + 1)),
                                    el(Button, { isDestructive: true, variant: 'link', style: { fontSize: 11 }, onClick: function () { set({ guests: a.guests.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                                ),
                                el(TextControl, { label: 'Name', value: g.name, __nextHasNoMarginBottom: true, onChange: function (v) { set({ guests: upd(a.guests, i, 'name', v) }); } }),
                                el('div', { style: { marginTop: 6 } },
                                    el(TextControl, { label: 'Role / Title', value: g.role, __nextHasNoMarginBottom: true, onChange: function (v) { set({ guests: upd(a.guests, i, 'role', v) }); } })
                                ),
                                el('div', { style: { marginTop: 6 } },
                                    el(TextareaControl, { label: 'Bio', value: g.bio, rows: 2, __nextHasNoMarginBottom: true, onChange: function (v) { set({ guests: upd(a.guests, i, 'bio', v) }); } })
                                )
                            );
                        }),
                        el(Button, { variant: 'secondary', style: { marginTop: 8 }, onClick: function () { set({ guests: a.guests.concat([{ name: 'Guest Name', role: 'Role', bio: '' }]) }); } }, '+ Add Guest')
                    ),
                    // Chapters
                    el(PanelBody, { title: 'Chapter Timestamps', initialOpen: false },
                        el(ToggleControl, { label: 'Show Chapters', checked: a.showTimestamps, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showTimestamps: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Section Label', value: a.timestampsLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ timestampsLabel: v }); } })
                        ),
                        a.timestamps.map(function (ts, i) {
                            return el('div', { key: i, style: { display: 'flex', gap: 6, alignItems: 'center', marginTop: 8 } },
                                el('div', { style: { width: 72, flexShrink: 0 } },
                                    el(TextControl, { value: ts.time, __nextHasNoMarginBottom: true, onChange: function (v) { set({ timestamps: upd(a.timestamps, i, 'time', v) }); } })
                                ),
                                el('div', { style: { flex: 1 } },
                                    el(TextControl, { value: ts.title, __nextHasNoMarginBottom: true, onChange: function (v) { set({ timestamps: upd(a.timestamps, i, 'title', v) }); } })
                                ),
                                el(Button, { isDestructive: true, variant: 'link', style: { fontSize: 11, padding: 0 }, onClick: function () { set({ timestamps: a.timestamps.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                            );
                        }),
                        el(Button, { variant: 'secondary', style: { marginTop: 8 }, onClick: function () { set({ timestamps: a.timestamps.concat([{ time: '00:00', title: 'New chapter' }]) }); } }, '+ Add Chapter')
                    ),
                    // Resources
                    el(PanelBody, { title: 'Resources & Links', initialOpen: false },
                        el(ToggleControl, { label: 'Show Resources', checked: a.showResources, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showResources: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Section Label', value: a.resourcesLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ resourcesLabel: v }); } })
                        ),
                        a.resources.map(function (r, i) {
                            return el('div', { key: i, style: { marginTop: 10, padding: '8px 10px', background: '#f8fafc', borderRadius: 6, border: '1px solid #e5e7eb' } },
                                el('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 } },
                                    el(SelectControl, { value: r.type, options: resourceTypeOptions, style: { marginBottom: 0 }, __nextHasNoMarginBottom: true, onChange: function (v) { set({ resources: upd(a.resources, i, 'type', v) }); } }),
                                    el(Button, { isDestructive: true, variant: 'link', style: { fontSize: 11 }, onClick: function () { set({ resources: a.resources.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                                ),
                                el(TextControl, { label: 'Title', value: r.title, __nextHasNoMarginBottom: true, onChange: function (v) { set({ resources: upd(a.resources, i, 'title', v) }); } }),
                                el('div', { style: { marginTop: 6 } },
                                    el(TextControl, { label: 'URL', value: r.url, __nextHasNoMarginBottom: true, onChange: function (v) { set({ resources: upd(a.resources, i, 'url', v) }); } })
                                )
                            );
                        }),
                        el(Button, { variant: 'secondary', style: { marginTop: 8 }, onClick: function () { set({ resources: a.resources.concat([{ title: 'Resource Title', url: '#', type: 'link' }]) }); } }, '+ Add Resource')
                    ),
                    // Transcript / Quote
                    el(PanelBody, { title: 'Highlighted Quote / Transcript', initialOpen: false },
                        el(ToggleControl, { label: 'Show Quote', checked: a.showTranscript, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showTranscript: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Section Label', value: a.transcriptLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ transcriptLabel: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(TextareaControl, { value: a.transcript, rows: 4, __nextHasNoMarginBottom: true, onChange: function (v) { set({ transcript: v }); } })
                        )
                    ),
                    // Tags
                    el(PanelBody, { title: 'Tags', initialOpen: false },
                        el(ToggleControl, { label: 'Show Tags', checked: a.showTags, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showTags: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Tags (comma-separated)', value: a.tags.join(', '), __nextHasNoMarginBottom: true, onChange: function (v) { set({ tags: v.split(',').map(function (t) { return t.trim(); }).filter(Boolean) }); } })
                        )
                    ),
                    // Typography
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        (function () {
                            var TC = getTypoControl();
                            if (!TC) return el('p', null, 'Loading\u2026');
                            return el(Fragment, null,
                                el(TC, { label: 'Title Typography', value: a.titleTypo, onChange: function (v) { set({ titleTypo: v }); } }),
                                el(TC, { label: 'Body Typography', value: a.bodyTypo, onChange: function (v) { set({ bodyTypo: v }); } })
                            );
                        })()
                    ),
                    el(PanelBody, { title: 'Spacing', initialOpen: false },
                        el(RangeControl, { label: 'Border Radius (px)', value: a.borderRadius, min: 0, max: 24, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } })
                    ),
                    // Header Colors
                    el(PanelColorSettings, {
                        title: 'Header Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Header BG',         value: a.bgColor,       onChange: function (v) { set({ bgColor: v || '#0f172a' }); } },
                            { label: 'Header Text',       value: a.headerColor,   onChange: function (v) { set({ headerColor: v || '#ffffff' }); } },
                            { label: 'Listen Button BG',  value: a.listenBtnBg,   onChange: function (v) { set({ listenBtnBg: v || '#3b82f6' }); } },
                            { label: 'Listen Button Text',value: a.listenBtnColor, onChange: function (v) { set({ listenBtnColor: v || '#ffffff' }); } }
                        ]
                    }),
                    // Body Colors
                    el(PanelColorSettings, {
                        title: 'Body Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Body BG',          value: a.bodyBg,           onChange: function (v) { set({ bodyBg: v || '#ffffff' }); } },
                            { label: 'Body Border',      value: a.bodyBorderColor,  onChange: function (v) { set({ bodyBorderColor: v || '#e5e7eb' }); } },
                            { label: 'Text',             value: a.textColor,        onChange: function (v) { set({ textColor: v || '#374151' }); } },
                            { label: 'Muted Text',       value: a.mutedColor,       onChange: function (v) { set({ mutedColor: v || '#6b7280' }); } },
                            { label: 'Accent',           value: a.accentColor,      onChange: function (v) { set({ accentColor: v || '#3b82f6' }); } },
                            { label: 'Section Headings', value: a.sectionHeadColor, onChange: function (v) { set({ sectionHeadColor: v || '#0f172a' }); } },
                            { label: 'Chapter Time BG',  value: a.chapterTimeBg,    onChange: function (v) { set({ chapterTimeBg: v || '#f1f5f9' }); } },
                            { label: 'Chapter Time Text',value: a.chapterTimeColor, onChange: function (v) { set({ chapterTimeColor: v || '#1e293b' }); } },
                            { label: 'Guest Card BG',    value: a.guestBg,          onChange: function (v) { set({ guestBg: v || '#f8fafc' }); } },
                            { label: 'Guest Name',       value: a.guestNameColor,   onChange: function (v) { set({ guestNameColor: v || '#0f172a' }); } },
                            { label: 'Guest Role',       value: a.guestRoleColor,   onChange: function (v) { set({ guestRoleColor: v || '#3b82f6' }); } },
                            { label: 'Tag BG',           value: a.tagBg,            onChange: function (v) { set({ tagBg: v || '#eff6ff' }); } },
                            { label: 'Tag Text',         value: a.tagColor,         onChange: function (v) { set({ tagColor: v || '#1d4ed8' }); } },
                            { label: 'Quote BG',         value: a.transcriptBg,     onChange: function (v) { set({ transcriptBg: v || '#f8fafc' }); } },
                            { label: 'Quote Border',     value: a.transcriptBorderColor, onChange: function (v) { set({ transcriptBorderColor: v || '#3b82f6' }); } }
                        ]
                    })
                )
            );
        },

        save: function (props) {
            var useBlockProps = wp.blockEditor.useBlockProps;
            return wp.element.createElement('div', useBlockProps.save(),
                wp.element.createElement('div', {
                    className: 'bkbg-podcast-episode-app',
                    'data-opts': JSON.stringify(props.attributes)
                })
            );
        },

        deprecated: [{
            attributes: {
                episodeTitle:{type:"string",default:"The Future of AI-Assisted Development"},
                episodeNumber:{type:"string",default:"147"},
                season:{type:"string",default:"6"},
                showNumber:{type:"boolean",default:true},
                podcastName:{type:"string",default:"Dev Stories Podcast"},
                showPodcastName:{type:"boolean",default:true},
                publishDate:{type:"string",default:"February 24, 2026"},
                duration:{type:"string",default:"58 min"},
                showMeta:{type:"boolean",default:true},
                description:{type:"string",default:""},
                showDescription:{type:"boolean",default:true},
                guests:{type:"array",default:[]},
                showGuests:{type:"boolean",default:true},
                guestsLabel:{type:"string",default:"Guests"},
                timestamps:{type:"array",default:[]},
                showTimestamps:{type:"boolean",default:true},
                timestampsLabel:{type:"string",default:"Chapters"},
                listenLinks:{type:"array",default:[]},
                showListenLinks:{type:"boolean",default:true},
                listenLinksLabel:{type:"string",default:"Listen on"},
                resources:{type:"array",default:[]},
                showResources:{type:"boolean",default:true},
                resourcesLabel:{type:"string",default:"Resources & Links"},
                transcript:{type:"string",default:""},
                showTranscript:{type:"boolean",default:true},
                transcriptLabel:{type:"string",default:"Highlighted Quote"},
                tags:{type:"array",default:[]},
                showTags:{type:"boolean",default:true},
                fontSize:{type:"number",default:14},
                titleFontSize:{type:"number",default:22},
                lineHeight:{type:"number",default:168},
                borderRadius:{type:"number",default:12},
                bgColor:{type:"string",default:"#0f172a"},
                headerColor:{type:"string",default:"#ffffff"},
                bodyBg:{type:"string",default:"#ffffff"},
                bodyBorderColor:{type:"string",default:"#e5e7eb"},
                textColor:{type:"string",default:"#374151"},
                mutedColor:{type:"string",default:"#6b7280"},
                accentColor:{type:"string",default:"#3b82f6"},
                sectionHeadColor:{type:"string",default:"#0f172a"},
                chapterTimeBg:{type:"string",default:"#f1f5f9"},
                chapterTimeColor:{type:"string",default:"#1e293b"},
                guestBg:{type:"string",default:"#f8fafc"},
                guestBorderColor:{type:"string",default:"#e5e7eb"},
                guestNameColor:{type:"string",default:"#0f172a"},
                guestRoleColor:{type:"string",default:"#3b82f6"},
                resourceIconColor:{type:"string",default:"#3b82f6"},
                tagBg:{type:"string",default:"#eff6ff"},
                tagColor:{type:"string",default:"#1d4ed8"},
                listenBtnBg:{type:"string",default:"#3b82f6"},
                listenBtnColor:{type:"string",default:"#ffffff"},
                transcriptBg:{type:"string",default:"#f8fafc"},
                transcriptBorderColor:{type:"string",default:"#3b82f6"},
                titleFontWeight:{type:"string",default:"700"},
                fontWeight:{type:"string",default:"400"}
            },
            save: function(props) {
                var useBlockProps = wp.blockEditor.useBlockProps;
                return wp.element.createElement('div', useBlockProps.save(),
                    wp.element.createElement('div', {
                        className: 'bkbg-podcast-episode-app',
                        'data-opts': JSON.stringify(props.attributes)
                    })
                );
            }
        }]
    });
}() );

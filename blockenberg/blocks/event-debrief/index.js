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
    var SelectControl = wp.components.SelectControl;
    var Button = wp.components.Button;

    var _edTC, _edTV;
    function _tc() { return _edTC || (_edTC = window.bkbgTypographyControl); }
    function _tv(t, p) { return (_edTV || (_edTV = window.bkbgTypoCssVars)) ? _edTV(t, p) : {}; }

    var eventTypeOptions = [
        { label: '🎪 Conference',  value: 'conference' },
        { label: '💻 Webinar',     value: 'webinar'    },
        { label: '🤝 Meetup',      value: 'meetup'     },
        { label: '🛠️ Workshop',    value: 'workshop'   }
    ];
    var eventTypeInfo = {
        conference: { label: 'Conference', bg: '#ede9fe', color: '#5b21b6' },
        webinar:    { label: 'Webinar',    bg: '#dbeafe', color: '#1e40af' },
        meetup:     { label: 'Meetup',     bg: '#dcfce7', color: '#14532d' },
        workshop:   { label: 'Workshop',   bg: '#fef3c7', color: '#78350f' }
    };

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

    function badge(text, bg, color) {
        return el('span', { style: { display: 'inline-block', padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: bg, color: color } }, text);
    }

    function statTile(label, value, a) {
        return el('div', { style: { textAlign: 'center', background: a.statBg, borderRadius: 8, padding: '12px 10px', flex: '1 1 90px' } },
            el('div', { style: { fontSize: 22, fontWeight: 800, color: a.statColor } }, typeof value === 'number' ? value.toLocaleString() : value),
            el('div', { style: { fontSize: 11, color: '#6b7280', marginTop: 4 } }, label)
        );
    }

    registerBlockType('blockenberg/event-debrief', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps({ className: 'bkbg-ed-editor-wrap', style: Object.assign({},
                _tv(a.typoTitle || {}, '--bkbg-ed-ttl-'),
                _tv(a.typoBody || {}, '--bkbg-ed-bdy-')
            ) });
            var tInfo = eventTypeInfo[a.eventType] || eventTypeInfo.conference;
            var lh = (a.lineHeight / 100).toFixed(2);

            var preview = el('div', { className: 'bkbg-ed-wrap', style: { border: '1px solid ' + a.borderColor, borderRadius: a.borderRadius + 'px', overflow: 'hidden', background: a.bgColor } },
                // Header
                el('div', { style: { background: a.headerBg, padding: '20px 24px' } },
                    el('div', { style: { marginBottom: 10, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' } },
                        badge(tInfo.label, tInfo.bg, tInfo.color),
                        a.eventLocation && el('span', { style: { fontSize: 12, color: a.metaColor } }, '📍 ' + a.eventLocation),
                        a.eventDate     && el('span', { style: { fontSize: 12, color: a.metaColor } }, '📅 ' + a.eventDate)
                    ),
                    el('h2', { className: 'bkbg-ed-title', style: { margin: 0, color: a.headerColor } }, a.eventName)
                ),
                // Stats
                a.showStats && el('div', { style: { padding: '14px 24px', borderBottom: '1px solid ' + a.borderColor, display: 'flex', gap: 10, flexWrap: 'wrap' } },
                    statTile('In-Person', a.attendees, a),
                    statTile('Online', a.onlineAttendees, a),
                    statTile('NPS Score', a.nps, a)
                ),
                // Body
                el('div', { style: { padding: '18px 24px', display: 'grid', gap: 20 } },
                    // Summary
                    a.showSummary && a.summary && el('div', { className: 'bkbg-ed-summary', style: { background: a.summaryBg, borderRadius: 8, padding: '12px 16px', color: a.summaryColor } }, a.summary),
                    // Highlights
                    a.showHighlights && a.highlights.length > 0 && el('div', null,
                        sectionHead(a.highlightsLabel, a),
                        el('div', { style: { display: 'grid', gap: 10 } },
                            a.highlights.map(function (h, i) {
                                return el('div', { key: i, style: { padding: '12px 14px', background: a.highlightBg, borderLeft: '4px solid ' + a.highlightBorder, borderRadius: '0 8px 8px 0' } },
                                    el('strong', { style: { display: 'block', marginBottom: 5, color: '#111827' } }, h.title),
                                    el('p', { style: { margin: 0, color: a.summaryColor } }, h.description)
                                );
                            })
                        )
                    ),
                    // Quotes
                    a.showQuotes && a.quotes.length > 0 && el('div', null,
                        sectionHead(a.quotesLabel, a),
                        el('div', { style: { display: 'grid', gap: 10 } },
                            a.quotes.map(function (q, i) {
                                return el('figure', { key: i, style: { margin: 0, background: a.quoteBg, borderLeft: '4px solid ' + a.quoteBorder, borderRadius: '0 8px 8px 0', padding: '12px 16px' } },
                                    el('blockquote', { style: { margin: '0 0 6px', fontStyle: 'italic', color: a.quoteColor } }, '\u201c' + q.quote + '\u201d'),
                                    el('figcaption', { style: { fontSize: 12, fontWeight: 700, color: a.quoteColor, opacity: .75 } }, '— ' + q.speaker + (q.role ? ', ' + q.role : ''))
                                );
                            })
                        )
                    ),
                    // Outcomes
                    a.showOutcomes && a.outcomes.length > 0 && el('div', null,
                        sectionHead(a.outcomesLabel, a),
                        el('ul', { style: { margin: 0, padding: '0 0 0 18px', color: a.outcomeColor } },
                            a.outcomes.map(function (o, i) {
                                return el('li', { key: i, style: { marginBottom: 5 } }, o);
                            })
                        )
                    ),
                    // Lessons
                    a.showLessons && a.lessonsLearned.length > 0 && el('div', null,
                        sectionHead(a.lessonsLabel, a),
                        el('ul', { style: { margin: 0, padding: '0 0 0 18px', color: a.lessonColor } },
                            a.lessonsLearned.map(function (l, i) {
                                return el('li', { key: i, style: { marginBottom: 5 } }, l);
                            })
                        )
                    ),
                    // Next Event
                    a.showNextEvent && a.nextEventName && el('div', { style: { background: a.nextEventBg, borderRadius: 8, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 } },
                        el('div', null,
                            el('div', { style: { fontSize: 11, color: 'rgba(255,255,255,.55)', marginBottom: 4 } }, 'UP NEXT'),
                            el('div', { style: { fontWeight: 700, color: a.nextEventColor } }, a.nextEventName),
                            a.nextEventDate && el('div', { style: { fontSize: 12, color: 'rgba(255,255,255,.65)', marginTop: 2 } }, '📅 ' + a.nextEventDate)
                        ),
                        el('span', { style: { background: a.accentColor, color: '#fff', padding: '7px 16px', borderRadius: 6, fontWeight: 700, fontSize: 13 } }, 'Learn More →')
                    )
                )
            );

            return el(Fragment, null,
                el('div', blockProps, preview),
                el(InspectorControls, null,
                    el(PanelBody, { title: 'Event Info', initialOpen: true },
                        el(TextControl, { label: 'Event Name', value: a.eventName, __nextHasNoMarginBottom: true, onChange: function (v) { set({ eventName: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(SelectControl, { label: 'Event Type', value: a.eventType, options: eventTypeOptions, __nextHasNoMarginBottom: true, onChange: function (v) { set({ eventType: v }); } })
                        ),
                        el('div', { style: { marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
                            el(TextControl, { label: 'Date', value: a.eventDate, __nextHasNoMarginBottom: true, onChange: function (v) { set({ eventDate: v }); } }),
                            el(TextControl, { label: 'Location', value: a.eventLocation, __nextHasNoMarginBottom: true, onChange: function (v) { set({ eventLocation: v }); } })
                        )
                    ),
                    el(PanelBody, { title: 'Stats', initialOpen: false },
                        el(ToggleControl, { label: 'Show Stats', checked: a.showStats, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showStats: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'In-Person Attendees', value: String(a.attendees), type: 'number', __nextHasNoMarginBottom: true, onChange: function (v) { set({ attendees: parseInt(v, 10) || 0 }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Online Attendees', value: String(a.onlineAttendees), type: 'number', __nextHasNoMarginBottom: true, onChange: function (v) { set({ onlineAttendees: parseInt(v, 10) || 0 }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            el(RangeControl, { label: 'NPS Score', value: a.nps, min: 0, max: 100, __nextHasNoMarginBottom: true, onChange: function (v) { set({ nps: v }); } })
                        )
                    ),
                    el(PanelBody, { title: 'Summary', initialOpen: false },
                        el(ToggleControl, { label: 'Show Summary', checked: a.showSummary, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showSummary: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextareaControl, { label: 'Summary', value: a.summary, rows: 4, __nextHasNoMarginBottom: true, onChange: function (v) { set({ summary: v }); } })
                        )
                    ),
                    el(PanelBody, { title: 'Highlights', initialOpen: false },
                        el(ToggleControl, { label: 'Show Highlights', checked: a.showHighlights, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showHighlights: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Section Label', value: a.highlightsLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ highlightsLabel: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            a.highlights.map(function (h, i) {
                                return el('div', { key: i, style: { marginBottom: 10, padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f8fafc' } },
                                    el('div', { style: { display: 'flex', justifyContent: 'flex-end', marginBottom: 4 } },
                                        el(Button, { isDestructive: true, variant: 'link', style: { fontSize: 11 }, onClick: function () { set({ highlights: a.highlights.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                                    ),
                                    el(TextControl, { label: 'Title', value: h.title, __nextHasNoMarginBottom: true, onChange: function (v) { set({ highlights: upd(a.highlights, i, 'title', v) }); } }),
                                    el('div', { style: { marginTop: 8 } },
                                        el(TextareaControl, { label: 'Description', value: h.description, rows: 2, __nextHasNoMarginBottom: true, onChange: function (v) { set({ highlights: upd(a.highlights, i, 'description', v) }); } })
                                    )
                                );
                            }),
                            el(Button, { variant: 'primary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () { set({ highlights: a.highlights.concat([{ title: 'Highlight', description: '' }]) }); } }, '+ Add Highlight')
                        )
                    ),
                    el(PanelBody, { title: 'Attendee Quotes', initialOpen: false },
                        el(ToggleControl, { label: 'Show Quotes', checked: a.showQuotes, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showQuotes: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Section Label', value: a.quotesLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ quotesLabel: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            a.quotes.map(function (q, i) {
                                return el('div', { key: i, style: { marginBottom: 10, padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f8fafc' } },
                                    el('div', { style: { display: 'flex', justifyContent: 'flex-end', marginBottom: 4 } },
                                        el(Button, { isDestructive: true, variant: 'link', style: { fontSize: 11 }, onClick: function () { set({ quotes: a.quotes.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                                    ),
                                    el(TextareaControl, { label: 'Quote', value: q.quote, rows: 2, __nextHasNoMarginBottom: true, onChange: function (v) { set({ quotes: upd(a.quotes, i, 'quote', v) }); } }),
                                    el('div', { style: { marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
                                        el(TextControl, { label: 'Speaker', value: q.speaker, __nextHasNoMarginBottom: true, onChange: function (v) { set({ quotes: upd(a.quotes, i, 'speaker', v) }); } }),
                                        el(TextControl, { label: 'Role / Company', value: q.role, __nextHasNoMarginBottom: true, onChange: function (v) { set({ quotes: upd(a.quotes, i, 'role', v) }); } })
                                    )
                                );
                            }),
                            el(Button, { variant: 'primary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () { set({ quotes: a.quotes.concat([{ quote: 'Quote text.', speaker: 'Speaker', role: 'Role, Company' }]) }); } }, '+ Add Quote')
                        )
                    ),
                    el(PanelBody, { title: 'Key Outcomes', initialOpen: false },
                        el(ToggleControl, { label: 'Show Outcomes', checked: a.showOutcomes, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showOutcomes: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Section Label', value: a.outcomesLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ outcomesLabel: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            a.outcomes.map(function (o, i) {
                                return el('div', { key: i, style: { display: 'flex', gap: 6, marginBottom: 6, alignItems: 'flex-start' } },
                                    el(TextControl, { label: '', value: o, __nextHasNoMarginBottom: true, onChange: function (v) { set({ outcomes: a.outcomes.map(function (x, j) { return j === i ? v : x; }) }); } }),
                                    el(Button, { isDestructive: true, variant: 'link', style: { flexShrink: 0 }, onClick: function () { set({ outcomes: a.outcomes.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                                );
                            }),
                            el(Button, { variant: 'secondary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () { set({ outcomes: a.outcomes.concat(['New outcome']) }); } }, '+ Add Outcome')
                        )
                    ),
                    el(PanelBody, { title: 'Lessons Learned', initialOpen: false },
                        el(ToggleControl, { label: 'Show Lessons', checked: a.showLessons, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showLessons: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Section Label', value: a.lessonsLabel, __nextHasNoMarginBottom: true, onChange: function (v) { set({ lessonsLabel: v }); } })
                        ),
                        el('div', { style: { marginTop: 8 } },
                            a.lessonsLearned.map(function (l, i) {
                                return el('div', { key: i, style: { display: 'flex', gap: 6, marginBottom: 6, alignItems: 'flex-start' } },
                                    el(TextControl, { label: '', value: l, __nextHasNoMarginBottom: true, onChange: function (v) { set({ lessonsLearned: a.lessonsLearned.map(function (x, j) { return j === i ? v : x; }) }); } }),
                                    el(Button, { isDestructive: true, variant: 'link', style: { flexShrink: 0 }, onClick: function () { set({ lessonsLearned: a.lessonsLearned.filter(function (_, j) { return j !== i; }) }); } }, '✕')
                                );
                            }),
                            el(Button, { variant: 'secondary', style: { width: '100%', justifyContent: 'center', marginTop: 4 }, onClick: function () { set({ lessonsLearned: a.lessonsLearned.concat(['New lesson']) }); } }, '+ Add Lesson')
                        )
                    ),
                    el(PanelBody, { title: 'Next Event', initialOpen: false },
                        el(ToggleControl, { label: 'Show Next Event', checked: a.showNextEvent, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showNextEvent: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(TextControl, { label: 'Event Name', value: a.nextEventName, __nextHasNoMarginBottom: true, onChange: function (v) { set({ nextEventName: v }); } })
                        ),
                        el('div', { style: { marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
                            el(TextControl, { label: 'Date', value: a.nextEventDate, __nextHasNoMarginBottom: true, onChange: function (v) { set({ nextEventDate: v }); } }),
                            el(TextControl, { label: 'URL', value: a.nextEventUrl, __nextHasNoMarginBottom: true, onChange: function (v) { set({ nextEventUrl: v }); } })
                        )
                    ),
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        _tc() && el(_tc(), { label: 'Title', typo: a.typoTitle || {}, onChange: function (v) { set({ typoTitle: v }); } }),
                        _tc() && el(_tc(), { label: 'Body Text', typo: a.typoBody || {}, onChange: function (v) { set({ typoBody: v }); } }),
                        el('div', { style: { marginTop: 8 } },
                            el(RangeControl, { label: 'Border Radius (px)', value: a.borderRadius, min: 0, max: 24, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } })
                        )
                    ),
                    el(PanelColorSettings, {
                        title: 'Header & Layout',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Header BG',    value: a.headerBg,     onChange: function (v) { set({ headerBg: v || '#1e1b4b' }); } },
                            { label: 'Header Text',  value: a.headerColor,  onChange: function (v) { set({ headerColor: v || '#ffffff' }); } },
                            { label: 'Meta Text',    value: a.metaColor,    onChange: function (v) { set({ metaColor: v || '#a5b4fc' }); } },
                            { label: 'Block BG',     value: a.bgColor,      onChange: function (v) { set({ bgColor: v || '#ffffff' }); } },
                            { label: 'Border',       value: a.borderColor,  onChange: function (v) { set({ borderColor: v || '#e5e7eb' }); } },
                            { label: 'Accent',       value: a.accentColor,  onChange: function (v) { set({ accentColor: v || '#6366f1' }); } }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: 'Content Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Stat BG',          value: a.statBg,         onChange: function (v) { set({ statBg: v || '#f5f3ff' }); } },
                            { label: 'Stat Number',      value: a.statColor,      onChange: function (v) { set({ statColor: v || '#4338ca' }); } },
                            { label: 'Highlight BG',     value: a.highlightBg,    onChange: function (v) { set({ highlightBg: v || '#f8fafc' }); } },
                            { label: 'Highlight Border', value: a.highlightBorder, onChange: function (v) { set({ highlightBorder: v || '#6366f1' }); } },
                            { label: 'Quote BG',         value: a.quoteBg,        onChange: function (v) { set({ quoteBg: v || '#f5f3ff' }); } },
                            { label: 'Quote Text',       value: a.quoteColor,     onChange: function (v) { set({ quoteColor: v || '#4338ca' }); } },
                            { label: 'Quote Border',     value: a.quoteBorder,    onChange: function (v) { set({ quoteBorder: v || '#818cf8' }); } },
                            { label: 'Outcomes Color',   value: a.outcomeColor,   onChange: function (v) { set({ outcomeColor: v || '#166534' }); } },
                            { label: 'Lessons Color',    value: a.lessonColor,    onChange: function (v) { set({ lessonColor: v || '#92400e' }); } },
                            { label: 'Next Event BG',    value: a.nextEventBg,    onChange: function (v) { set({ nextEventBg: v || '#1e1b4b' }); } }
                        ]
                    })
                )
            );
        },

        save: function (props) {
            var useBlockProps = wp.blockEditor.useBlockProps;
            return wp.element.createElement('div', useBlockProps.save(),
                wp.element.createElement('div', {
                    className: 'bkbg-event-debrief-app',
                    'data-opts': JSON.stringify(props.attributes)
                })
            );
        }
    });
}() );

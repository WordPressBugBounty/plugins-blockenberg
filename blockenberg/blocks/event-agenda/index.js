( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText = wp.blockEditor.RichText;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var PanelBody     = wp.components.PanelBody;
    var Button        = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl  = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl   = wp.components.TextControl;
    var ColorPicker   = wp.components.ColorPicker;
    var Popover       = wp.components.Popover;

    var TAB_STYLE_OPTIONS = [
        { label: __('Pill',        'blockenberg'), value: 'pill' },
        { label: __('Underline',   'blockenberg'), value: 'underline' },
        { label: __('Flat',        'blockenberg'), value: 'flat' },
    ];
    var SESSION_STYLE_OPTIONS = [
        { label: __('Cards', 'blockenberg'), value: 'card' },
        { label: __('List',  'blockenberg'), value: 'list' },
    ];
    var TIME_FORMAT_OPTIONS = [
        { label: __('12-hour (9:00 AM)', 'blockenberg'), value: '12h' },
        { label: __('24-hour (09:00)',   'blockenberg'), value: '24h' },
    ];
    var SESSION_TYPE_ICONS = { keynote: '🎤', talk: '💬', workshop: '🛠', break: '☕' };

    var _eaTC, _eaTV;
    function _tc() { return _eaTC || (_eaTC = window.bkbgTypographyControl); }
    function _tv(t, p) { return (_eaTV || (_eaTV = window.bkbgTypoCssVars)) ? _eaTV(t, p) : {}; }

    function makeId() { return 'ea' + Math.random().toString(36).substr(2, 5); }

    function buildWrapStyle(a) {
        return Object.assign({
            '--bkbg-ea-accent':           a.accentColor,
            '--bkbg-ea-active-tab-bg':    a.activeTabBg,
            '--bkbg-ea-active-tab-color': a.activeTabColor,
            '--bkbg-ea-inactive-tab-bg':  a.inactiveTabBg,
            '--bkbg-ea-inactive-tab-color': a.inactiveTabColor,
            '--bkbg-ea-session-title':    a.sessionTitleColor,
            '--bkbg-ea-speaker-name':     a.speakerNameColor,
            '--bkbg-ea-meta':             a.metaColor,
            '--bkbg-ea-time-color':       a.timeColor,
            '--bkbg-ea-card-bg':          a.cardBg,
            '--bkbg-ea-card-border':      a.cardBorderColor,
            '--bkbg-ea-break-card-bg':    a.breakCardBg,
            '--bkbg-ea-timeline-bar':     a.timelineBarColor,
            '--bkbg-ea-time-sz':          a.timeLabelSize + 'px',
            '--bkbg-ea-session-title-sz': a.sessionTitleSize + 'px',
            '--bkbg-ea-speaker-sz':       a.speakerNameSize + 'px',
            '--bkbg-ea-meta-sz':          a.metaSize + 'px',
            '--bkbg-ea-tag-sz':           a.tagSize + 'px',
            '--bkbg-ea-tab-sz':           a.tabSize + 'px',
            '--bkbg-ea-avatar-sz':        a.avatarSize + 'px',
            '--bkbg-ea-tag-r':            a.tagRadius + 'px',
            '--bkbg-ea-card-r':           a.cardRadius + 'px',
            '--bkbg-ea-card-pad':         a.cardPadding + 'px',
            paddingTop:    a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
            backgroundColor: a.bgColor || undefined,
        },
            _tv(a.typoSessionTitle || {}, '--bkbg-ea-st-'),
            _tv(a.typoSpeaker || {}, '--bkbg-ea-sp-'),
            _tv(a.typoMeta || {}, '--bkbg-ea-mt-'),
            _tv(a.typoTab || {}, '--bkbg-ea-tb-')
        );
    }

    function renderColorControl(key, label, value, onChange, openKey, setOpenKey) {
        var isOpen = openKey === key;
        return el('div', { key: key, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: '8px' } },
            el('span', { style: { fontSize: '12px', color: '#1e1e1e', flex: 1, lineHeight: 1.4 } }, label),
            el('div', { style: { position: 'relative', flexShrink: 0 } },
                el('button', { type: 'button', onClick: function () { setOpenKey(isOpen ? null : key); }, style: { width: '28px', height: '28px', borderRadius: '4px', border: isOpen ? '2px solid #007cba' : '2px solid #ddd', cursor: 'pointer', padding: 0, background: value || '#ccc' } }),
                isOpen && el(Popover, { position: 'bottom left', onClose: function () { setOpenKey(null); } },
                    el('div', { style: { padding: '8px' } },
                        el(ColorPicker, { color: value, enableAlpha: true, onChange: onChange })
                    )
                )
            )
        );
    }

    /* ── Get color for session type ────────────────────────────────── */
    function getSessionTypeColor(sessionTypes, type) {
        var found = (sessionTypes || []).filter(function (t) { return t.type === type; })[0];
        return found ? found.color : '#9ca3af';
    }
    function getSessionTypeLabel(sessionTypes, type) {
        var found = (sessionTypes || []).filter(function (t) { return t.type === type; })[0];
        return found ? found.label : type;
    }

    /* ── Session card ───────────────────────────────────────────────── */
    function SessionCard(props) {
        var s    = props.session;
        var a    = props.a;
        var typeColor = getSessionTypeColor(a.sessionTypes, s.type);
        var typeLabel = getSessionTypeLabel(a.sessionTypes, s.type);
        var isBreak = s.type === 'break';
        var cardBg = isBreak ? a.breakCardBg : a.cardBg;

        var cardStyle = {
            background: cardBg,
            borderRadius: a.cardRadius + 'px',
            padding: a.cardPadding + 'px',
            border: '1px solid ' + a.cardBorderColor,
            position: 'relative',
            flex: 1,
            boxSizing: 'border-box',
        };
        if (a.timelineBar) {
            cardStyle.borderLeft = '4px solid ' + typeColor;
        }

        return el('div', { className: 'bkbg-ea-session bkbg-ea-session--' + s.type, style: { display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '12px' } },
            /* Time column */
            el('div', { className: 'bkbg-ea-time-col', style: { minWidth: '72px', flexShrink: 0, paddingTop: '4px', textAlign: 'right' } },
                el('span', { className: 'bkbg-ea-time-label', style: { color: a.timeColor, display: 'block' } }, s.time),
                a.showDuration && s.duration && el('span', { className: 'bkbg-ea-duration', style: { color: a.metaColor, display: 'block' } }, s.duration)
            ),
            /* Card */
            el('div', { className: 'bkbg-ea-session-card', style: cardStyle },
                el('div', { className: 'bkbg-ea-session-header', style: { display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: s.speaker ? '10px' : '0' } },
                    /* Avatar */
                    a.showSpeakerAvatar && !isBreak && el('div', { className: 'bkbg-ea-avatar', style: { width: a.avatarSize + 'px', height: a.avatarSize + 'px', borderRadius: '50%', background: typeColor + '22', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: a.avatarSize * 0.44 + 'px' } },
                        s.avatarUrl ? el('img', { src: s.avatarUrl, alt: s.speaker, style: { width: '100%', height: '100%', objectFit: 'cover' } }) : el('span', null, SESSION_TYPE_ICONS[s.type] || '👤')
                    ),
                    el('div', { style: { flex: 1, minWidth: 0 } },
                        el('div', { className: 'bkbg-ea-session-meta-row', style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' } },
                            el('span', { className: 'bkbg-ea-type-badge', style: { display: 'inline-block', padding: '2px 9px', borderRadius: '99px', background: typeColor + '18', color: typeColor } }, SESSION_TYPE_ICONS[s.type] + ' ' + typeLabel),
                            a.showRoom && s.room && el('span', { className: 'bkbg-ea-room', style: { color: a.metaColor } }, '📍 ' + s.room)
                        ),
                        el('div', { className: 'bkbg-ea-session-title', style: { color: a.sessionTitleColor } }, s.title),
                        s.speaker && el('div', { className: 'bkbg-ea-speaker-info', style: { marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' } },
                            el('span', { className: 'bkbg-ea-speaker-name', style: { color: a.speakerNameColor } }, s.speaker),
                            a.showSpeakerRole && s.role && el('span', { className: 'bkbg-ea-speaker-role', style: { color: a.metaColor } }, s.role),
                            a.showSpeakerCompany && s.company && el('span', { className: 'bkbg-ea-speaker-company', style: { color: a.metaColor } }, '@ ' + s.company)
                        ),
                        a.showTags && s.tags && s.tags.length > 0 && el('div', { className: 'bkbg-ea-tags', style: { marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '5px' } },
                            s.tags.map(function (tag, ti) {
                                return el('span', { key: ti, className: 'bkbg-ea-tag', style: { display: 'inline-block', padding: '2px 8px', borderRadius: a.tagRadius + 'px', background: '#f3f4f6', color: '#374151' } }, tag);
                            })
                        )
                    )
                )
            )
        );
    }

    registerBlockType('blockenberg/event-agenda', {
        title: __('Event Agenda', 'blockenberg'),
        icon: 'calendar-alt',
        category: 'bkbg-business',

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            var activeDayState = useState(0);
            var activeDay = activeDayState[0];
            var setActiveDay = activeDayState[1];

            var blockProps = useBlockProps({ style: buildWrapStyle(a) });

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            function updateDay(dayId, key, val) {
                setAttributes({ days: a.days.map(function (d) {
                    if (d.id !== dayId) return d;
                    var u = Object.assign({}, d); u[key] = val; return u;
                }) });
            }

            function updateSession(dayId, sessionId, key, val) {
                setAttributes({ days: a.days.map(function (d) {
                    if (d.id !== dayId) return d;
                    return Object.assign({}, d, { sessions: d.sessions.map(function (s) {
                        if (s.id !== sessionId) return s;
                        var u = Object.assign({}, s); u[key] = val; return u;
                    }) });
                }) });
            }

            function addSession(dayId) {
                setAttributes({ days: a.days.map(function (d) {
                    if (d.id !== dayId) return d;
                    return Object.assign({}, d, { sessions: d.sessions.concat([{ id: makeId(), time: '10:00 AM', duration: '30 min', type: 'talk', title: __('Session title', 'blockenberg'), speaker: __('Speaker Name', 'blockenberg'), role: '', company: '', avatarUrl: '', avatarId: 0, room: '', tags: [] }]) });
                }) });
            }

            var safeDay = Math.min(activeDay, a.days.length - 1);
            var currentDay = a.days[safeDay];

            /* Tab bar */
            var tabBar = a.showDayTabs && el('div', { className: 'bkbg-ea-tab-bar', style: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '28px' } },
                a.days.map(function (day, di) {
                    var isActive = di === safeDay;
                    return el('button', { key: day.id, type: 'button', onClick: function () { setActiveDay(di); }, className: 'bkbg-ea-tab-btn' + (isActive ? ' is-active' : ''), style: { padding: '9px 20px', borderRadius: a.tabStyle === 'pill' ? '99px' : '8px', border: a.tabStyle === 'underline' ? ('none') : 'none', borderBottom: a.tabStyle === 'underline' ? (isActive ? '3px solid ' + a.accentColor : '3px solid transparent') : undefined, fontFamily: 'inherit', cursor: 'pointer', background: a.tabStyle === 'underline' ? 'transparent' : (isActive ? a.activeTabBg : a.inactiveTabBg), color: isActive ? a.activeTabColor : a.inactiveTabColor, transition: 'all 0.2s' } },
                        day.label
                    );
                })
            );

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: true },
                        el(ToggleControl, { label: __('Show day tabs',        'blockenberg'), checked: a.showDayTabs,         onChange: function (v) { setAttributes({ showDayTabs:         v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Speaker avatar',       'blockenberg'), checked: a.showSpeakerAvatar,   onChange: function (v) { setAttributes({ showSpeakerAvatar:   v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Speaker role',         'blockenberg'), checked: a.showSpeakerRole,     onChange: function (v) { setAttributes({ showSpeakerRole:     v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Speaker company',      'blockenberg'), checked: a.showSpeakerCompany,  onChange: function (v) { setAttributes({ showSpeakerCompany:  v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Room',                 'blockenberg'), checked: a.showRoom,            onChange: function (v) { setAttributes({ showRoom:            v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Duration',             'blockenberg'), checked: a.showDuration,        onChange: function (v) { setAttributes({ showDuration:        v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Tags',                 'blockenberg'), checked: a.showTags,            onChange: function (v) { setAttributes({ showTags:            v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Timeline bar',         'blockenberg'), checked: a.timelineBar,         onChange: function (v) { setAttributes({ timelineBar:         v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Style', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Session style', 'blockenberg'), value: a.sessionStyle, options: SESSION_STYLE_OPTIONS, onChange: function (v) { setAttributes({ sessionStyle: v }); } }),
                        el(SelectControl, { label: __('Tab style',     'blockenberg'), value: a.tabStyle,     options: TAB_STYLE_OPTIONS,   onChange: function (v) { setAttributes({ tabStyle:     v }); } }),
                        el(SelectControl, { label: __('Time format',   'blockenberg'), value: a.timeFormat,   options: TIME_FORMAT_OPTIONS, onChange: function (v) { setAttributes({ timeFormat:   v }); } })
                    ),
                    el(PanelBody, { title: __('Session Types', 'blockenberg'), initialOpen: false },
                        a.sessionTypes.map(function (st) {
                            return el('div', { key: st.type, style: { marginBottom: '8px' } },
                                el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                                    el('span', { style: { fontSize: '14px' } }, SESSION_TYPE_ICONS[st.type]),
                                    el(TextControl, { label: __('Label', 'blockenberg'), value: st.label, style: { flex: 1 }, onChange: function (v) { setAttributes({ sessionTypes: a.sessionTypes.map(function (t) { if (t.type !== st.type) return t; return Object.assign({}, t, { label: v }); }) }); } }),
                                    renderColorControl('stype-' + st.type, __('Color', 'blockenberg'), st.color, function (val) {
                                        setAttributes({ sessionTypes: a.sessionTypes.map(function (t) { if (t.type !== st.type) return t; return Object.assign({}, t, { color: val }); }) });
                                    }, openColorKey, setOpenColorKey)
                                )
                            );
                        })
                    ),
                    el(PanelBody, { title: __('Card & Sizes', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Card radius (px)',  'blockenberg'), value: a.cardRadius,  min: 0, max: 24, onChange: function (v) { setAttributes({ cardRadius:  v }); } }),
                        el(RangeControl, { label: __('Card padding (px)', 'blockenberg'), value: a.cardPadding, min: 8, max: 40, onChange: function (v) { setAttributes({ cardPadding: v }); } }),
                        el(RangeControl, { label: __('Avatar size (px)',  'blockenberg'), value: a.avatarSize,  min: 28, max: 72, onChange: function (v) { setAttributes({ avatarSize:  v }); } }),
                        el(RangeControl, { label: __('Tag radius (px)',   'blockenberg'), value: a.tagRadius,   min: 0, max: 12, onChange: function (v) { setAttributes({ tagRadius:   v }); } })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        _tc() && el(_tc(), { label: __('Session Title', 'blockenberg'), typo: a.typoSessionTitle || {}, onChange: function (v) { setAttributes({ typoSessionTitle: v }); } }),
                        _tc() && el(_tc(), { label: __('Speaker Name', 'blockenberg'), typo: a.typoSpeaker || {}, onChange: function (v) { setAttributes({ typoSpeaker: v }); } }),
                        _tc() && el(_tc(), { label: __('Meta / Time / Tags', 'blockenberg'), typo: a.typoMeta || {}, onChange: function (v) { setAttributes({ typoMeta: v }); } }),
                        _tc() && el(_tc(), { label: __('Tab Label', 'blockenberg'), typo: a.typoTab || {}, onChange: function (v) { setAttributes({ typoTab: v }); } })
                    ),
                    el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                        cc('accentColor',       __('Accent',                'blockenberg'), 'accentColor'),
                        cc('activeTabBg',       __('Active tab bg',         'blockenberg'), 'activeTabBg'),
                        cc('activeTabColor',    __('Active tab text',       'blockenberg'), 'activeTabColor'),
                        cc('inactiveTabBg',     __('Inactive tab bg',       'blockenberg'), 'inactiveTabBg'),
                        cc('inactiveTabColor',  __('Inactive tab text',     'blockenberg'), 'inactiveTabColor'),
                        cc('timeColor',         __('Time label',            'blockenberg'), 'timeColor'),
                        cc('sessionTitleColor', __('Session title',         'blockenberg'), 'sessionTitleColor'),
                        cc('speakerNameColor',  __('Speaker name',          'blockenberg'), 'speakerNameColor'),
                        cc('metaColor',         __('Meta / room / role',    'blockenberg'), 'metaColor'),
                        cc('cardBg',            __('Card background',       'blockenberg'), 'cardBg'),
                        cc('cardBorderColor',   __('Card border',           'blockenberg'), 'cardBorderColor'),
                        cc('breakCardBg',       __('Break card background', 'blockenberg'), 'breakCardBg'),
                        cc('timelineBarColor',  __('Timeline bar (idle)',   'blockenberg'), 'timelineBarColor'),
                        cc('bgColor',           __('Section background',    'blockenberg'), 'bgColor')
                    ),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top (px)',    'blockenberg'), value: a.paddingTop,    min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop:    v }); } }),
                        el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    ),
                    el(PanelBody, { title: __('Agenda Days & Sessions', 'blockenberg'), initialOpen: false },
                        a.days.map(function (day, di) {
                            return el(PanelBody, { key: day.id, title: day.label || 'Day ' + (di + 1), initialOpen: false },
                                el(TextControl, { label: __('Day label', 'blockenberg'), value: day.label, onChange: function (v) { updateDay(day.id, 'label', v); } }),
                                el('p', { style: { fontSize: '12px', fontWeight: 600, margin: '6px 0 4px' } }, __('Sessions', 'blockenberg')),
                                day.sessions.map(function (s, si) {
                                    return el(PanelBody, { key: s.id, title: (s.time || '') + ' ' + (s.title ? s.title.substring(0,20) : 'Session ' + (si+1)), initialOpen: false },
                                        el(TextControl, { label: __('Time',     'blockenberg'), value: s.time,    onChange: function (v) { updateSession(day.id, s.id, 'time',    v); } }),
                                        el(TextControl, { label: __('Duration', 'blockenberg'), value: s.duration, onChange: function (v) { updateSession(day.id, s.id, 'duration', v); } }),
                                        el(SelectControl, { label: __('Type',   'blockenberg'), value: s.type, options: [{ label: 'Keynote', value: 'keynote' }, { label: 'Talk', value: 'talk' }, { label: 'Workshop', value: 'workshop' }, { label: 'Break', value: 'break' }], onChange: function (v) { updateSession(day.id, s.id, 'type', v); } }),
                                        el(TextControl, { label: __('Title',   'blockenberg'), value: s.title,   onChange: function (v) { updateSession(day.id, s.id, 'title',   v); } }),
                                        el(TextControl, { label: __('Speaker', 'blockenberg'), value: s.speaker, onChange: function (v) { updateSession(day.id, s.id, 'speaker', v); } }),
                                        el(TextControl, { label: __('Role',    'blockenberg'), value: s.role,    onChange: function (v) { updateSession(day.id, s.id, 'role',    v); } }),
                                        el(TextControl, { label: __('Company', 'blockenberg'), value: s.company, onChange: function (v) { updateSession(day.id, s.id, 'company', v); } }),
                                        el(TextControl, { label: __('Room',    'blockenberg'), value: s.room,    onChange: function (v) { updateSession(day.id, s.id, 'room',    v); } }),
                                        el(TextControl, { label: __('Tags (comma-separated)', 'blockenberg'), value: (s.tags || []).join(', '), onChange: function (v) { updateSession(day.id, s.id, 'tags', v.split(',').map(function (t) { return t.trim(); }).filter(Boolean)); } }),
                                        el(MediaUploadCheck, null,
                                            el(MediaUpload, { onSelect: function (m) { updateSession(day.id, s.id, 'avatarUrl', m.url); updateSession(day.id, s.id, 'avatarId', m.id); }, allowedTypes: ['image'], value: s.avatarId, render: function (rp) {
                                                return el(Button, { variant: 'secondary', size: 'compact', onClick: rp.open, style: { marginTop: '4px' } }, s.avatarUrl ? __('Change avatar', 'blockenberg') : __('Upload avatar', 'blockenberg'));
                                            } })
                                        ),
                                        el(Button, { onClick: function () { updateDay(day.id, 'sessions', day.sessions.filter(function (se) { return se.id !== s.id; })); }, isDestructive: true, variant: 'tertiary', size: 'compact', style: { marginTop: '6px' } }, __('Remove session', 'blockenberg'))
                                    );
                                }),
                                el(Button, { variant: 'secondary', size: 'compact', onClick: function () { addSession(day.id); }, style: { marginTop: '4px' } }, __('+ Add Session', 'blockenberg')),
                                el(Button, { onClick: function () { setAttributes({ days: a.days.filter(function (d) { return d.id !== day.id; }) }); setActiveDay(Math.max(0, safeDay - 1)); }, isDestructive: true, variant: 'tertiary', size: 'compact', style: { marginTop: '6px', display: 'block' } }, __('Remove day', 'blockenberg'))
                            );
                        }),
                        el(Button, { variant: 'primary', onClick: function () { setAttributes({ days: a.days.concat([{ id: makeId(), label: __('New Day', 'blockenberg'), sessions: [] }]) }); }, style: { marginTop: '8px' } }, __('+ Add Day', 'blockenberg'))
                    )
                ),

                el('div', blockProps,
                    tabBar,
                    currentDay && el('div', { className: 'bkbg-ea-sessions', 'data-day': currentDay.id },
                        currentDay.sessions.map(function (s) {
                            return el(SessionCard, { key: s.id, session: s, a: a });
                        }),
                        currentDay.sessions.length === 0 && el('p', { style: { textAlign: 'center', color: '#9ca3af', padding: '32px' } }, __('No sessions yet. Add sessions in the panel →', 'blockenberg'))
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-ea-wrapper bkbg-ea-session-style--' + a.sessionStyle, style: buildWrapStyle(a) }),
                a.showDayTabs && el('nav', { className: 'bkbg-ea-tab-bar bkbg-ea-tab-bar--' + a.tabStyle, role: 'tablist' },
                    a.days.map(function (day, di) {
                        return el('button', { key: day.id, type: 'button', role: 'tab', className: 'bkbg-ea-tab-btn' + (di === 0 ? ' is-active' : ''), 'data-day': day.id, 'aria-selected': di === 0 ? 'true' : 'false' }, day.label);
                    })
                ),
                el('div', { className: 'bkbg-ea-body' },
                    a.days.map(function (day, di) {
                        return el('div', { key: day.id, className: 'bkbg-ea-day-panel' + (di === 0 ? ' is-active' : ''), 'data-day': day.id, role: 'tabpanel', 'aria-hidden': di === 0 ? 'false' : 'true', style: { display: di === 0 ? 'block' : 'none' } },
                            el('div', { className: 'bkbg-ea-sessions' },
                                day.sessions.map(function (s) {
                                    return el('div', { key: s.id, className: 'bkbg-ea-session bkbg-ea-session--' + s.type, 'data-type': s.type },
                                        el('div', { className: 'bkbg-ea-time-col' },
                                            el('span', { className: 'bkbg-ea-time-label' }, s.time),
                                            a.showDuration && s.duration && el('span', { className: 'bkbg-ea-duration' }, s.duration)
                                        ),
                                        el('div', { className: 'bkbg-ea-session-card' },
                                            a.showSpeakerAvatar && el('div', { className: 'bkbg-ea-avatar' },
                                                s.avatarUrl ? el('img', { src: s.avatarUrl, alt: s.speaker || '', loading: 'lazy' }) : el('span', { 'aria-hidden': 'true' }, SESSION_TYPE_ICONS[s.type] || '👤')
                                            ),
                                            el('div', { className: 'bkbg-ea-session-info' },
                                                el('div', { className: 'bkbg-ea-session-meta-row' },
                                                    el('span', { className: 'bkbg-ea-type-badge' }, SESSION_TYPE_ICONS[s.type] + ' ' + getSessionTypeLabel(a.sessionTypes, s.type)),
                                                    a.showRoom && s.room && el('span', { className: 'bkbg-ea-room' }, '📍 ' + s.room)
                                                ),
                                                el('div', { className: 'bkbg-ea-session-title' }, s.title),
                                                s.speaker && el('div', { className: 'bkbg-ea-speaker-info' },
                                                    el('span', { className: 'bkbg-ea-speaker-name' }, s.speaker),
                                                    a.showSpeakerRole && s.role && el('span', { className: 'bkbg-ea-speaker-role' }, s.role),
                                                    a.showSpeakerCompany && s.company && el('span', { className: 'bkbg-ea-speaker-company' }, '@ ' + s.company)
                                                ),
                                                a.showTags && s.tags && s.tags.length > 0 && el('div', { className: 'bkbg-ea-tags' },
                                                    s.tags.map(function (tag, ti) { return el('span', { key: ti, className: 'bkbg-ea-tag' }, tag); })
                                                )
                                            )
                                        )
                                    );
                                })
                            )
                        );
                    })
                )
            );
        }
    });
}() );

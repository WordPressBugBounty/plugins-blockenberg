(function () {
        var el = wp.element.createElement;
        var Fragment = wp.element.Fragment;
        var registerBlockType = wp.blocks.registerBlockType;
        var __ = wp.i18n.__;
        var InspectorControls = wp.blockEditor.InspectorControls;
        var PanelColorSettings = wp.blockEditor.PanelColorSettings;
        var useBlockProps = wp.blockEditor.useBlockProps;
        var PanelBody = wp.components.PanelBody;
        var TextControl = wp.components.TextControl;
        var TextareaControl = wp.components.TextareaControl;
        var ToggleControl = wp.components.ToggleControl;
        var RangeControl = wp.components.RangeControl;
        var SelectControl = wp.components.SelectControl;
        var Button = wp.components.Button;

        var _espTC, _espTV;
        function _tc() { return _espTC || (_espTC = window.bkbgTypographyControl); }
        function _tv(t, p) { return (_espTV || (_espTV = window.bkbgTypoCssVars)) ? _espTV(t, p) : {}; }

        // ── helpers ────────────────────────────────────────────────────
        function upd(arr, idx, field, val) {
            return arr.map(function (e, i) {
                if (i !== idx) return e;
                var u = {}; u[field] = val;
                return Object.assign({}, e, u);
            });
        }

        // ── speaker card renderer ──────────────────────────────────────
        function renderSpeakerCard(spk, a) {
            // Avatar
            var avatar = el('div', {
                style: {
                    width: a.avatarSize + 'px', height: a.avatarSize + 'px',
                    borderRadius: '50%',
                    background: spk.avatarBg || '#6366f1',
                    color: '#ffffff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: Math.round(a.avatarSize * 0.35) + 'px',
                    fontWeight: '700', flexShrink: '0', marginBottom: '14px'
                }
            }, spk.avatarInitials || '?');

            // Name + title/company
            var nameEl = el('div', { className: 'bkbg-esp-name', style: { color: a.nameColor, marginBottom: '4px' } }, spk.name);
            var jobEl = el('div', { className: 'bkbg-esp-body', style: { color: a.jobTitleColor, marginBottom: '2px' } }, spk.title);
            var compEl = el('div', { className: 'bkbg-esp-body bkbg-esp-company', style: { color: a.companyColor, marginBottom: '12px' } }, '@ ' + spk.company);

            // Bio
            var bioEl = (a.showBio && spk.bio) ? el('p', { className: 'bkbg-esp-body', style: { color: a.bioColor, margin: '0 0 14px' } }, spk.bio) : null;

            // Session block
            var sessionEl = null;
            if (a.showSession && spk.session) {
                sessionEl = el('div', {
                    style: {
                        background: a.sessionBg,
                        border: '1px solid ' + a.sessionBorderColor,
                        borderRadius: '10px', padding: '10px 12px', marginBottom: '12px'
                    }
                },
                    el('div', { className: 'bkbg-esp-session-time', style: { color: a.sessionTimeColor, marginBottom: '4px' } }, '🕐 ' + (spk.sessionTime || '')),
                    el('div', { className: 'bkbg-esp-body', style: { color: a.sessionTitleColor } }, spk.session)
                );
            }

            // Twitter
            var twitterEl = (a.showTwitter && spk.twitterHandle) ? el('div', {
                className: 'bkbg-esp-body bkbg-esp-twitter', style: { color: a.twitterColor }
            }, '𝕏 ' + spk.twitterHandle) : null;

            return el('div', {
                className: 'bkbg-esp-card',
                style: {
                    background: a.cardBgColor,
                    border: '1px solid ' + a.cardBorderColor,
                    borderRadius: a.borderRadius + 'px',
                    padding: '24px', display: 'flex', flexDirection: 'column'
                }
            }, avatar, nameEl, jobEl, compEl, bioEl, sessionEl, twitterEl);
        }

        // ── edit ───────────────────────────────────────────────────────
        function Edit(props) {
            var a   = props.attributes;
            var set = props.setAttributes;

            var LAYOUT_OPTIONS = [
                { value: 'grid', label: __('Grid') },
                { value: 'list', label: __('List') }
            ];

            var colorSettings = [
                { label: __('Page Background'),   value: a.bgColor,           onChange: function (v) { set({ bgColor: v || '#f8fafc' }); } },
                { label: __('Header Background'), value: a.headerBgColor,     onChange: function (v) { set({ headerBgColor: v || '#ffffff' }); } },
                { label: __('Outer Border'),       value: a.borderColor,       onChange: function (v) { set({ borderColor: v || '#e2e8f0' }); } },
                { label: __('Event Title'),        value: a.titleColor,        onChange: function (v) { set({ titleColor: v || '#0f172a' }); } },
                { label: __('Subtitle'),           value: a.subtitleColor,     onChange: function (v) { set({ subtitleColor: v || '#64748b' }); } },
                { label: __('Card Background'),    value: a.cardBgColor,       onChange: function (v) { set({ cardBgColor: v || '#ffffff' }); } },
                { label: __('Card Border'),        value: a.cardBorderColor,   onChange: function (v) { set({ cardBorderColor: v || '#e2e8f0' }); } },
                { label: __('Speaker Name'),       value: a.nameColor,         onChange: function (v) { set({ nameColor: v || '#0f172a' }); } },
                { label: __('Job Title'),          value: a.jobTitleColor,     onChange: function (v) { set({ jobTitleColor: v || '#6366f1' }); } },
                { label: __('Company'),            value: a.companyColor,      onChange: function (v) { set({ companyColor: v || '#64748b' }); } },
                { label: __('Bio Text'),           value: a.bioColor,          onChange: function (v) { set({ bioColor: v || '#374151' }); } },
                { label: __('Session Card BG'),    value: a.sessionBg,         onChange: function (v) { set({ sessionBg: v || '#f0f9ff' }); } },
                { label: __('Session Border'),     value: a.sessionBorderColor,onChange: function (v) { set({ sessionBorderColor: v || '#bae6fd' }); } },
                { label: __('Session Title'),      value: a.sessionTitleColor, onChange: function (v) { set({ sessionTitleColor: v || '#0c4a6e' }); } },
                { label: __('Session Time'),       value: a.sessionTimeColor,  onChange: function (v) { set({ sessionTimeColor: v || '#0369a1' }); } },
                { label: __('Twitter Handle'),     value: a.twitterColor,      onChange: function (v) { set({ twitterColor: v || '#0ea5e9' }); } },
            ];

            var AVATAR_COLORS = ['#6366f1','#0ea5e9','#f59e0b','#22c55e','#ef4444','#ec4899','#8b5cf6','#14b8a6'];

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Event Settings'), initialOpen: true },
                    el(TextControl, {
                        label: __('Event title'), value: a.eventTitle, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ eventTitle: v }); }
                    }),
                    el(TextControl, {
                        label: __('Subtitle'), value: a.eventSubtitle, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ eventSubtitle: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show subtitle'), checked: a.showSubtitle, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showSubtitle: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Layout'), value: a.layout, options: LAYOUT_OPTIONS, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ layout: v }); }
                    }),
                    a.layout === 'grid' ? el(RangeControl, {
                        label: __('Columns'), value: a.columns, min: 1, max: 4, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ columns: v }); }
                    }) : null,
                    el(ToggleControl, {
                        label: __('Show session info'), checked: a.showSession, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showSession: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show bio'), checked: a.showBio, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showBio: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Twitter handle'), checked: a.showTwitter, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showTwitter: v }); }
                    })
                ),
                el(PanelBody, { title: __('Typography'), initialOpen: false },
                    _tc() && el(_tc(), { label: 'Event Title', typo: a.typoTitle || {}, onChange: function (v) { set({ typoTitle: v }); } }),
                    _tc() && el(_tc(), { label: 'Subtitle', typo: a.typoSubtitle || {}, onChange: function (v) { set({ typoSubtitle: v }); } }),
                    _tc() && el(_tc(), { label: 'Speaker Name', typo: a.typoName || {}, onChange: function (v) { set({ typoName: v }); } }),
                    _tc() && el(_tc(), { label: 'Body Text', typo: a.typoBody || {}, onChange: function (v) { set({ typoBody: v }); } })
                ),
                el(PanelBody, { title: __('Appearance'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Border radius'), value: a.borderRadius, min: 0, max: 32, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ borderRadius: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Avatar size (px)'), value: a.avatarSize, min: 40, max: 120, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ avatarSize: v }); }
                    })
                ),
                el(PanelBody, { title: __('Speakers (' + a.speakers.length + ')'), initialOpen: false },
                    a.speakers.map(function (spk, idx) {
                        return el(PanelBody, {
                            key: idx,
                            title: (idx + 1) + '. ' + (spk.name || 'Speaker'),
                            initialOpen: false
                        },
                            el(TextControl, {
                                label: __('Name'), value: spk.name, __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ speakers: upd(a.speakers, idx, 'name', v) }); }
                            }),
                            el(TextControl, {
                                label: __('Job title'), value: spk.title, __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ speakers: upd(a.speakers, idx, 'title', v) }); }
                            }),
                            el(TextControl, {
                                label: __('Company'), value: spk.company, __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ speakers: upd(a.speakers, idx, 'company', v) }); }
                            }),
                            el(TextareaControl, {
                                label: __('Bio'), value: spk.bio, __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ speakers: upd(a.speakers, idx, 'bio', v) }); }
                            }),
                            el(TextControl, {
                                label: __('Session title'), value: spk.session, __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ speakers: upd(a.speakers, idx, 'session', v) }); }
                            }),
                            el(TextControl, {
                                label: __('Session time'), value: spk.sessionTime, __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ speakers: upd(a.speakers, idx, 'sessionTime', v) }); }
                            }),
                            el(TextControl, {
                                label: __('Avatar initials (1–2 chars)'), value: spk.avatarInitials, __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ speakers: upd(a.speakers, idx, 'avatarInitials', v.substring(0, 2).toUpperCase()) }); }
                            }),
                            el('div', { style: { marginBottom: '12px' } },
                                el('p', { style: { margin: '0 0 8px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' } }, __('Avatar color')),
                                el('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
                                    AVATAR_COLORS.map(function (c) {
                                        return el('button', {
                                            key: c,
                                            onClick: function () { set({ speakers: upd(a.speakers, idx, 'avatarBg', c) }); },
                                            style: {
                                                width: '28px', height: '28px', borderRadius: '50%', border: spk.avatarBg === c ? '3px solid #1e293b' : '2px solid #e2e8f0',
                                                background: c, cursor: 'pointer', padding: '0'
                                            }
                                        });
                                    })
                                )
                            ),
                            el(TextControl, {
                                label: __('Twitter handle (e.g. @user)'), value: spk.twitterHandle, __nextHasNoMarginBottom: true,
                                onChange: function (v) { set({ speakers: upd(a.speakers, idx, 'twitterHandle', v) }); }
                            }),
                            el(Button, {
                                variant: 'secondary', isDestructive: true, __nextHasNoMarginBottom: true,
                                onClick: function () {
                                    var next = a.speakers.slice(); next.splice(idx, 1);
                                    set({ speakers: next });
                                }
                            }, __('Remove speaker'))
                        );
                    }),
                    el(Button, {
                        variant: 'primary', __nextHasNoMarginBottom: true,
                        onClick: function () {
                            var colors = ['#6366f1','#0ea5e9','#f59e0b','#22c55e'];
                            var bgC = colors[a.speakers.length % colors.length];
                            set({ speakers: a.speakers.concat([{
                                name: 'New Speaker', title: 'Job Title', company: 'Company',
                                bio: 'Speaker bio goes here.',
                                session: 'Talk Title', sessionTime: '10:00 AM – 10:45 AM',
                                avatarInitials: 'NS', avatarBg: bgC, twitterHandle: ''
                            }]) });
                        }
                    }, __('+ Add speaker'))
                ),
                el(PanelColorSettings, {
                    title: __('Colors'),
                    initialOpen: false,
                    colorSettings: colorSettings
                })
            );

            // ── Preview ───────────────────────────────────────────────
            var headerSection = el('div', {
                style: {
                    background: a.headerBgColor,
                    borderBottom: '1px solid ' + a.borderColor,
                    padding: '32px 32px 24px'
                }
            },
                el('h2', { className: 'bkbg-esp-title', style: { color: a.titleColor, margin: '0 0 8px' } }, a.eventTitle),
                a.showSubtitle ? el('p', { className: 'bkbg-esp-subtitle', style: { color: a.subtitleColor, margin: '0' } }, a.eventSubtitle) : null
            );

            var gridCols = a.layout === 'grid' ? 'repeat(' + a.columns + ', 1fr)' : '1fr';
            var grid = el('div', {
                style: {
                    display: 'grid',
                    gridTemplateColumns: gridCols,
                    gap: '20px',
                    padding: '28px'
                }
            },
                a.speakers.map(function (spk, idx) {
                    return el('div', { key: idx }, renderSpeakerCard(spk, a));
                })
            );

            return el(Fragment, {},
                inspector,
                el('div', Object.assign({}, useBlockProps(), {
                    className: 'bkbg-esp-wrap',
                    style: Object.assign({
                        background: a.bgColor,
                        border: '1px solid ' + a.borderColor,
                        borderRadius: a.borderRadius + 'px',
                        overflow: 'hidden'
                    },
                        _tv(a.typoTitle || {}, '--bkbg-esp-ttl-'),
                        _tv(a.typoSubtitle || {}, '--bkbg-esp-sub-'),
                        _tv(a.typoName || {}, '--bkbg-esp-nm-'),
                        _tv(a.typoBody || {}, '--bkbg-esp-bd-')
                    )
                }), headerSection, grid)
            );
        }

        registerBlockType('blockenberg/event-speaker', {
            edit: Edit,
            save: function (props) {
                return el('div', useBlockProps.save(),
                    el('div', { className: 'bkbg-event-speaker-app', 'data-opts': JSON.stringify(props.attributes) })
                );
            }
        });
})();

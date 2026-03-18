( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    var _tc, _tvf;
    Object.defineProperty(window, '_tc',  { get: function () { return _tc  || (_tc  = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_tvf', { get: function () { return _tvf || (_tvf = window.bkbgTypoCssVars); } });
    function getTypoControl(label, key, attrs, setA) { return _tc(label, key, attrs, setA); }
    function getTypoCssVars(attrs) {
        var v = {};
        _tvf(v, 'headingTypo', attrs, '--bkwbn-hd-');
        _tvf(v, 'subtextTypo', attrs, '--bkwbn-st-');
        _tvf(v, 'topicsHeadingTypo', attrs, '--bkwbn-th-');
        _tvf(v, 'ctaTypo', attrs, '--bkwbn-ct-');
        return v;
    }

    registerBlockType('blockenberg/webinar-section', {
        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var a = attributes;

            var blockProps = useBlockProps((function () {
                var s = getTypoCssVars(a);
                s.backgroundColor = a.bgColor;
                s.paddingTop = a.paddingTop + 'px';
                s.paddingBottom = a.paddingBottom + 'px';
                return { className: 'bkbg-wbn-wrap', style: s };
            })());

            function updateSpeaker(idx, key, val) {
                setAttributes({ speakers: a.speakers.map(function (s, i) { return i === idx ? Object.assign({}, s, { [key]: val }) : s; }) });
            }
            function addSpeaker() {
                setAttributes({ speakers: a.speakers.concat([{ name: 'New Speaker', title: 'Role', bio: '', avatarUrl: '', avatarId: 0 }]) });
            }
            function removeSpeaker(idx) {
                setAttributes({ speakers: a.speakers.filter(function (_, i) { return i !== idx; }) });
            }
            function updateTopic(idx, val) {
                setAttributes({ topics: a.topics.map(function (t, i) { return i === idx ? Object.assign({}, t, { text: val }) : t; }) });
            }
            function addTopic() {
                setAttributes({ topics: a.topics.concat([{ text: 'New topic' }]) });
            }
            function removeTopic(idx) {
                setAttributes({ topics: a.topics.filter(function (_, i) { return i !== idx; }) });
            }

            var isSplit = a.layout === 'split';

            var innerStyle = { maxWidth: a.maxWidth + 'px', margin: '0 auto', padding: '0 24px' };

            // Left column content
            var leftContent = el('div', { className: 'bkbg-wbn-left' },
                a.showBadge && el('span', { style: { display: 'inline-block', background: a.badgeBg, color: a.badgeColor, fontWeight: 800, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '5px 14px', borderRadius: 999, marginBottom: 20 } }, a.badge),
                el(RichText, { tagName: 'h2', className: 'bkbg-wbn-heading', value: a.heading, onChange: function (v) { setAttributes({ heading: v }); }, placeholder: __('Webinar Title…', 'blockenberg'), style: { color: a.headingColor } }),
                a.showSubtext && el(RichText, { tagName: 'p', className: 'bkbg-wbn-subtext', value: a.subtext, onChange: function (v) { setAttributes({ subtext: v }); }, placeholder: __('Description…', 'blockenberg'), style: { color: a.subtextColor, margin: '0 0 28px' } }),

                // Date/time row
                a.showDateTime && el('div', { style: { display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 32 } },
                    el('div', { style: { background: a.dateBg, border: '1px solid ' + a.dateBorder, borderRadius: 10, padding: '14px 20px' } },
                        el('p', { style: { fontSize: 11, color: a.subtextColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' } }, __('Date', 'blockenberg')),
                        el('p', { style: { fontSize: 18, fontWeight: 800, color: a.dateColor, margin: 0 } }, a.eventDate || __('Set date…', 'blockenberg'))
                    ),
                    el('div', { style: { background: a.dateBg, border: '1px solid ' + a.dateBorder, borderRadius: 10, padding: '14px 20px' } },
                        el('p', { style: { fontSize: 11, color: a.subtextColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' } }, __('Time', 'blockenberg')),
                        el('p', { style: { fontSize: 18, fontWeight: 800, color: a.dateColor, margin: 0 } }, a.eventTime + ' ' + a.eventTimezone)
                    )
                ),

                // Topics
                a.showTopics && el('div', { style: { marginBottom: 32 } },
                    el('h3', { style: { color: a.headingColor, fontSize: 18, fontWeight: 700, margin: '0 0 16px' } }, a.topicsHeading),
                    el('ul', { style: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 } },
                        a.topics.map(function (t, idx) {
                            return el('li', { key: idx, style: { display: 'flex', alignItems: 'flex-start', gap: 10 } },
                                el('span', { style: { color: a.checkColor, fontSize: 16, marginTop: 1, flexShrink: 0 } }, '✓'),
                                el(RichText, { tagName: 'span', value: t.text, onChange: function (v) { updateTopic(idx, v); }, placeholder: __('Topic…', 'blockenberg'), style: { color: a.topicColor, fontSize: 15, lineHeight: 1.5 } }),
                                el(Button, { isDestructive: true, size: 'small', onClick: function () { removeTopic(idx); }, style: { marginLeft: 'auto', fontSize: 10, flexShrink: 0 } }, '✕')
                            );
                        }),
                        el('li', null, el(Button, { variant: 'secondary', size: 'small', onClick: addTopic, __nextHasNoMarginBottom: true }, '+ Add Topic'))
                    )
                ),

                // CTA
                el('div', null,
                    el('a', { href: '#', style: { display: 'inline-block', background: a.ctaBg, color: a.ctaColor, fontWeight: 800, fontSize: 16, padding: '16px 36px', borderRadius: 8, textDecoration: 'none', marginBottom: a.showCtaSubtext ? 12 : 0 } }, a.ctaLabel),
                    a.showCtaSubtext && el('p', { style: { color: a.ctaSubtextColor, fontSize: 13, margin: '10px 0 0' } }, a.ctaSubtext)
                )
            );

            // Right column: speakers + countdown
            var rightContent = el('div', { className: 'bkbg-wbn-right' },
                a.showSpeakers && el('div', { style: { marginBottom: 28 } },
                    el('h3', { style: { color: a.headingColor, fontSize: 16, fontWeight: 700, margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.06em' } }, __('Your Hosts', 'blockenberg')),
                    el('div', { style: { display: 'flex', flexDirection: 'column', gap: 14 } },
                        a.speakers.map(function (s, idx) {
                            return el('div', { key: idx, style: { background: a.speakerCardBg, borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'center', position: 'relative' } },
                                el(MediaUploadCheck, null,
                                    el(MediaUpload, {
                                        onSelect: function (media) { setAttributes({ speakers: a.speakers.map(function (s, i) { return i === idx ? Object.assign({}, s, { avatarUrl: media.url, avatarId: media.id }) : s; }) }); },
                                        allowedTypes: ['image'],
                                        value: s.avatarId,
                                        render: function (ref) {
                                            return el('div', { onClick: ref.open, style: { cursor: 'pointer', flexShrink: 0 } },
                                                s.avatarUrl
                                                    ? el('img', { src: s.avatarUrl, style: { width: 52, height: 52, borderRadius: '50%', objectFit: 'cover' } })
                                                    : el('div', { style: { width: 52, height: 52, borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 } }, '🎤')
                                            );
                                        }
                                    })
                                ),
                                el('div', { style: { flex: 1 } },
                                    el(RichText, { tagName: 'p', value: s.name, onChange: function (v) { updateSpeaker(idx, 'name', v); }, placeholder: __('Name…', 'blockenberg'), style: { color: a.speakerNameColor, fontWeight: 700, fontSize: 15, margin: '0 0 2px' } }),
                                    el(RichText, { tagName: 'p', value: s.title, onChange: function (v) { updateSpeaker(idx, 'title', v); }, placeholder: __('Title…', 'blockenberg'), style: { color: a.speakerTitleColor, fontSize: 13, margin: '0 0 4px' } }),
                                    el(RichText, { tagName: 'p', value: s.bio, onChange: function (v) { updateSpeaker(idx, 'bio', v); }, placeholder: __('Short bio…', 'blockenberg'), style: { color: a.subtextColor, fontSize: 12, margin: 0 } })
                                ),
                                el(Button, { isDestructive: true, size: 'small', onClick: function () { removeSpeaker(idx); }, style: { position: 'absolute', top: 8, right: 8, fontSize: 10 } }, '✕')
                            );
                        }),
                        el(Button, { variant: 'secondary', size: 'small', onClick: addSpeaker, __nextHasNoMarginBottom: true }, '+ Add Speaker')
                    )
                ),

                // Countdown preview
                a.showCountdown && el('div', { style: { background: a.countdownBg, borderRadius: 12, padding: 24 } },
                    el('p', { style: { color: a.subtextColor, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 14px', textAlign: 'center' } }, __('Starts In', 'blockenberg')),
                    el('div', { className: 'bkbg-wbn-countdown-preview', style: { display: 'flex', justifyContent: 'center', gap: 16 } },
                        ['00', '00', '00', '00'].map(function (n, i) {
                            return el('div', { key: i, style: { textAlign: 'center' } },
                                el('div', { style: { fontSize: 32, fontWeight: 800, color: a.countdownNumColor, lineHeight: 1 } }, n),
                                el('div', { style: { fontSize: 11, color: a.countdownLabelColor, marginTop: 4 } }, ['Days', 'Hours', 'Mins', 'Secs'][i])
                            );
                        })
                    )
                )
            );

            return el('div', blockProps,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                        el(ToggleControl, { label: __('Show Badge', 'blockenberg'), checked: a.showBadge, onChange: function (v) { setAttributes({ showBadge: v }); }, __nextHasNoMarginBottom: true }),
                        a.showBadge && el(TextControl, { label: __('Badge Text', 'blockenberg'), value: a.badge, onChange: function (v) { setAttributes({ badge: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Subtext', 'blockenberg'), checked: a.showSubtext, onChange: function (v) { setAttributes({ showSubtext: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Date/Time', 'blockenberg'), checked: a.showDateTime, onChange: function (v) { setAttributes({ showDateTime: v }); }, __nextHasNoMarginBottom: true }),
                        a.showDateTime && el(TextControl, { label: __('Event Date', 'blockenberg'), value: a.eventDate, placeholder: 'e.g. Thursday, March 28', onChange: function (v) { setAttributes({ eventDate: v }); }, __nextHasNoMarginBottom: true }),
                        a.showDateTime && el(TextControl, { label: __('Time', 'blockenberg'), value: a.eventTime, onChange: function (v) { setAttributes({ eventTime: v }); }, __nextHasNoMarginBottom: true }),
                        a.showDateTime && el(TextControl, { label: __('Timezone', 'blockenberg'), value: a.eventTimezone, onChange: function (v) { setAttributes({ eventTimezone: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Topics', 'blockenberg'), checked: a.showTopics, onChange: function (v) { setAttributes({ showTopics: v }); }, __nextHasNoMarginBottom: true }),
                        a.showTopics && el(TextControl, { label: __('Topics Heading', 'blockenberg'), value: a.topicsHeading, onChange: function (v) { setAttributes({ topicsHeading: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Speakers', 'blockenberg'), checked: a.showSpeakers, onChange: function (v) { setAttributes({ showSpeakers: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Countdown', 'blockenberg'), checked: a.showCountdown, onChange: function (v) { setAttributes({ showCountdown: v }); }, __nextHasNoMarginBottom: true }),
                        a.showCountdown && el(TextControl, { label: __('Countdown End (ISO date)', 'blockenberg'), value: a.countdownEnd, placeholder: '2025-09-15T14:00:00', onChange: function (v) { setAttributes({ countdownEnd: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: __('CTA Label', 'blockenberg'), value: a.ctaLabel, onChange: function (v) { setAttributes({ ctaLabel: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: __('CTA URL', 'blockenberg'), value: a.ctaUrl, onChange: function (v) { setAttributes({ ctaUrl: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show CTA Subtext', 'blockenberg'), checked: a.showCtaSubtext, onChange: function (v) { setAttributes({ showCtaSubtext: v }); }, __nextHasNoMarginBottom: true }),
                        a.showCtaSubtext && el(TextControl, { label: __('CTA Subtext', 'blockenberg'), value: a.ctaSubtext, onChange: function (v) { setAttributes({ ctaSubtext: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Layout', 'blockenberg'), value: a.layout, options: [{ label: 'Split (info + speakers)', value: 'split' }, { label: 'Centered', value: 'centered' }], onChange: function (v) { setAttributes({ layout: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), value: a.maxWidth, min: 600, max: 1400, onChange: function (v) { setAttributes({ maxWidth: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: a.paddingTop, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        getTypoControl(__('Heading', 'blockenberg'), 'headingTypo', a, setAttributes),
                        getTypoControl(__('Subtext', 'blockenberg'), 'subtextTypo', a, setAttributes),
                        getTypoControl(__('Topics Heading', 'blockenberg'), 'topicsHeadingTypo', a, setAttributes),
                        getTypoControl(__('CTA Button', 'blockenberg'), 'ctaTypo', a, setAttributes)
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Background', 'blockenberg'), value: a.bgColor, onChange: function (v) { setAttributes({ bgColor: v || '#0f172a' }); } },
                            { label: __('Heading Color', 'blockenberg'), value: a.headingColor, onChange: function (v) { setAttributes({ headingColor: v || '#ffffff' }); } },
                            { label: __('Subtext Color', 'blockenberg'), value: a.subtextColor, onChange: function (v) { setAttributes({ subtextColor: v || '#94a3b8' }); } },
                            { label: __('Accent Color', 'blockenberg'), value: a.accentColor, onChange: function (v) { setAttributes({ accentColor: v || '#a78bfa' }); } },
                            { label: __('Badge BG', 'blockenberg'), value: a.badgeBg, onChange: function (v) { setAttributes({ badgeBg: v || '#7c3aed' }); } },
                            { label: __('Check/Topic Color', 'blockenberg'), value: a.checkColor, onChange: function (v) { setAttributes({ checkColor: v || '#a78bfa' }); } },
                            { label: __('Date Block BG', 'blockenberg'), value: a.dateBg, onChange: function (v) { setAttributes({ dateBg: v || '#1e293b' }); } },
                            { label: __('Speaker Card BG', 'blockenberg'), value: a.speakerCardBg, onChange: function (v) { setAttributes({ speakerCardBg: v || '#1e293b' }); } },
                            { label: __('CTA Button BG', 'blockenberg'), value: a.ctaBg, onChange: function (v) { setAttributes({ ctaBg: v || '#7c3aed' }); } }
                        ]
                    })
                ),

                el('div', { style: innerStyle },
                    isSplit
                        ? el('div', { className: 'bkbg-wbn-grid', style: { display: 'grid', gridTemplateColumns: '1fr 420px', gap: 48, alignItems: 'start' } }, leftContent, rightContent)
                        : el('div', { className: 'bkbg-wbn-centered', style: { maxWidth: 700, margin: '0 auto', textAlign: 'center' } }, leftContent)
                )
            );
        },
        save: function (props) {
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save({ style: getTypoCssVars(props.attributes) }),
                el('div', { className: 'bkbg-wbn-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );

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

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    registerBlockType('blockenberg/speaker-lineup', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;

            function updateSpeaker(idx, key, val) {
                var speakers = (attr.speakers || []).map(function (s, i) {
                    return i === idx ? Object.assign({}, s, {[key]: val}) : s;
                });
                setAttr({ speakers: speakers });
            }

            function addSpeaker() {
                setAttr({ speakers: (attr.speakers || []).concat([{ name: 'New Speaker', title: 'Title', company: 'Company', topic: 'Topic', bio: 'Speaker bio...', avatarUrl: '', twitterUrl: '', linkedinUrl: '' }]) });
            }

            function removeSpeaker(idx) {
                setAttr({ speakers: (attr.speakers || []).filter(function (_, i) { return i !== idx; }) });
            }

            var inspector = el(InspectorControls, null,
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Layout', 'blockenberg'),
                        value: attr.layout,
                        options: [
                            { label: 'Grid', value: 'grid' },
                            { label: 'List (horizontal card)', value: 'list' },
                            { label: 'Featured (large first)', value: 'featured' }
                        ],
                        onChange: function (v) { setAttr({ layout: v }); }
                    }),
                    el(SelectControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Card Style', 'blockenberg'),
                        value: attr.cardStyle,
                        options: [
                            { label: 'Card (elevated)', value: 'card' },
                            { label: 'Bordered', value: 'bordered' },
                            { label: 'Clean (no border)', value: 'clean' }
                        ],
                        onChange: function (v) { setAttr({ cardStyle: v }); }
                    }),
                    el(RangeControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Columns (grid)', 'blockenberg'),
                        value: attr.columns,
                        min: 1, max: 4,
                        onChange: function (v) { setAttr({ columns: v }); }
                    }),
                    el(RangeControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Max Width (px)', 'blockenberg'),
                        value: attr.maxWidth, min: 600, max: 1600,
                        onChange: function (v) { setAttr({ maxWidth: v }); }
                    }),
                    el(RangeControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Padding Top (px)', 'blockenberg'),
                        value: attr.paddingTop, min: 0, max: 200,
                        onChange: function (v) { setAttr({ paddingTop: v }); }
                    }),
                    el(RangeControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Padding Bottom (px)', 'blockenberg'),
                        value: attr.paddingBottom, min: 0, max: 200,
                        onChange: function (v) { setAttr({ paddingBottom: v }); }
                    })
                ),
                el(PanelBody, { title: __('Card Content', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Show Bio', 'blockenberg'),
                        checked: attr.showBio,
                        onChange: function (v) { setAttr({ showBio: v }); }
                    }),
                    el(ToggleControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Show Topic Badge', 'blockenberg'),
                        checked: attr.showTopic,
                        onChange: function (v) { setAttr({ showTopic: v }); }
                    }),
                    el(ToggleControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Show Social Links', 'blockenberg'),
                        checked: attr.showSocials,
                        onChange: function (v) { setAttr({ showSocials: v }); }
                    })
                ),
                el(PanelBody, { title: __('Speakers', 'blockenberg'), initialOpen: false },
                    (attr.speakers || []).map(function (speaker, idx) {
                        return el(PanelBody, { key: idx, title: (speaker.name || 'Speaker ' + (idx + 1)), initialOpen: false },
                            el(TextControl, { __nextHasNoMarginBottom: true, label: __('Name', 'blockenberg'), value: speaker.name, onChange: function (v) { updateSpeaker(idx, 'name', v); } }),
                            el(TextControl, { __nextHasNoMarginBottom: true, label: __('Title', 'blockenberg'), value: speaker.title, onChange: function (v) { updateSpeaker(idx, 'title', v); } }),
                            el(TextControl, { __nextHasNoMarginBottom: true, label: __('Company', 'blockenberg'), value: speaker.company, onChange: function (v) { updateSpeaker(idx, 'company', v); } }),
                            el(TextControl, { __nextHasNoMarginBottom: true, label: __('Talk Topic', 'blockenberg'), value: speaker.topic, onChange: function (v) { updateSpeaker(idx, 'topic', v); } }),
                            el(TextareaControl, { __nextHasNoMarginBottom: true, label: __('Bio', 'blockenberg'), value: speaker.bio, onChange: function (v) { updateSpeaker(idx, 'bio', v); } }),
                            el(TextControl, { __nextHasNoMarginBottom: true, label: __('Avatar URL', 'blockenberg'), value: speaker.avatarUrl, onChange: function (v) { updateSpeaker(idx, 'avatarUrl', v); } }),
                            el(TextControl, { __nextHasNoMarginBottom: true, label: __('Twitter URL', 'blockenberg'), value: speaker.twitterUrl, onChange: function (v) { updateSpeaker(idx, 'twitterUrl', v); } }),
                            el(TextControl, { __nextHasNoMarginBottom: true, label: __('LinkedIn URL', 'blockenberg'), value: speaker.linkedinUrl, onChange: function (v) { updateSpeaker(idx, 'linkedinUrl', v); } }),
                            el(Button, { isDestructive: true, variant: 'secondary', onClick: function () { removeSpeaker(idx); } }, __('Remove Speaker', 'blockenberg'))
                        );
                    }),
                    el(Button, { isPrimary: true, variant: 'primary', onClick: addSpeaker }, __('+ Add Speaker', 'blockenberg'))
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { setAttr({ bgColor: v || '#ffffff' }); } },
                        { label: __('Heading', 'blockenberg'), value: attr.headingColor, onChange: function (v) { setAttr({ headingColor: v || '#111827' }); } },
                        { label: __('Subtext', 'blockenberg'), value: attr.subColor, onChange: function (v) { setAttr({ subColor: v || '#6b7280' }); } },
                        { label: __('Eyebrow', 'blockenberg'), value: attr.eyebrowColor, onChange: function (v) { setAttr({ eyebrowColor: v || '#6366f1' }); } },
                        { label: __('Card Background', 'blockenberg'), value: attr.cardBg, onChange: function (v) { setAttr({ cardBg: v || '#f8fafc' }); } },
                        { label: __('Card Border', 'blockenberg'), value: attr.cardBorder, onChange: function (v) { setAttr({ cardBorder: v || '#e2e8f0' }); } },
                        { label: __('Speaker Name', 'blockenberg'), value: attr.nameColor, onChange: function (v) { setAttr({ nameColor: v || '#111827' }); } },
                        { label: __('Speaker Title', 'blockenberg'), value: attr.titleColor, onChange: function (v) { setAttr({ titleColor: v || '#6b7280' }); } },
                        { label: __('Topic Badge BG', 'blockenberg'), value: attr.topicBg, onChange: function (v) { setAttr({ topicBg: v || '#ede9fe' }); } },
                        { label: __('Topic Badge Text', 'blockenberg'), value: attr.topicColor, onChange: function (v) { setAttr({ topicColor: v || '#5b21b6' }); } },
                        { label: __('Bio Text', 'blockenberg'), value: attr.bioColor, onChange: function (v) { setAttr({ bioColor: v || '#4b5563' }); } },
                        { label: __('Social Icons', 'blockenberg'), value: attr.socialColor, onChange: function (v) { setAttr({ socialColor: v || '#6366f1' }); } }
                    ]
                }),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl() ? el(getTypoControl(), { label: __('Eyebrow Typography', 'blockenberg'), value: attr.eyebrowTypo || {}, onChange: function (v) { setAttr({ eyebrowTypo: v }); } }) : null,
                    getTypoControl() ? el(getTypoControl(), { label: __('Heading Typography', 'blockenberg'), value: attr.headingTypo || {}, onChange: function (v) { setAttr({ headingTypo: v }); } }) : null,
                    getTypoControl() ? el(getTypoControl(), { label: __('Subtext Typography', 'blockenberg'), value: attr.subtextTypo || {}, onChange: function (v) { setAttr({ subtextTypo: v }); } }) : null,
                    getTypoControl() ? el(getTypoControl(), { label: __('Name Typography', 'blockenberg'), value: attr.nameTypo || {}, onChange: function (v) { setAttr({ nameTypo: v }); } }) : null,
                    getTypoControl() ? el(getTypoControl(), { label: __('Description Typography', 'blockenberg'), value: attr.descTypo || {}, onChange: function (v) { setAttr({ descTypo: v }); } }) : null
                )
            );

            var blockProps = useBlockProps((function () {
                var s = { className: 'bkbg-spk-editor' };
                var tv = getTypoCssVars();
                if (tv) {
                    var st = {};
                    Object.assign(st, tv(attr.eyebrowTypo, '--bkspk-ey-'));
                    Object.assign(st, tv(attr.headingTypo, '--bkspk-hd-'));
                    Object.assign(st, tv(attr.subtextTypo, '--bkspk-st-'));
                    Object.assign(st, tv(attr.nameTypo, '--bkspk-nm-'));
                    Object.assign(st, tv(attr.descTypo, '--bkspk-ds-'));
                    s.style = st;
                }
                return s;
            })());

            /* Preview grid */
            return el('div', blockProps,
                inspector,
                el('div', { style: { background: attr.bgColor, padding: '40px', borderRadius: '8px', fontFamily: 'sans-serif' } },
                    el('div', { style: { textAlign: 'center', marginBottom: '40px' } },
                        el(RichText, {
                            tagName: 'p', value: attr.eyebrow,
                            onChange: function (v) { setAttr({ eyebrow: v }); },
                            placeholder: __('Eyebrow…', 'blockenberg'),
                            className: 'bkbg-spk-eyebrow',
                            style: { color: attr.eyebrowColor, margin: '0 0 8px' }
                        }),
                        el(RichText, {
                            tagName: 'h2', value: attr.heading,
                            onChange: function (v) { setAttr({ heading: v }); },
                            placeholder: __('Section heading…', 'blockenberg'),
                            className: 'bkbg-spk-heading',
                            style: { color: attr.headingColor, margin: '0 0 12px' }
                        }),
                        el(RichText, {
                            tagName: 'p', value: attr.subtext,
                            onChange: function (v) { setAttr({ subtext: v }); },
                            placeholder: __('Subtext…', 'blockenberg'),
                            className: 'bkbg-spk-sub',
                            style: { color: attr.subColor, maxWidth: '600px', margin: '0 auto' }
                        })
                    ),
                    el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(' + attr.columns + ',1fr)', gap: '24px' } },
                        (attr.speakers || []).map(function (s, i) {
                            return el('div', { key: i, style: { background: attr.cardBg, border: '1px solid ' + attr.cardBorder, borderRadius: '12px', padding: '24px', textAlign: 'center' } },
                                el('div', { style: { width: '80px', height: '80px', borderRadius: '50%', background: attr.accentColor, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: '#fff', overflow: 'hidden' } },
                                    s.avatarUrl ? el('img', { src: s.avatarUrl, style: { width: '100%', height: '100%', objectFit: 'cover' } }) : '👤'
                                ),
                                el('div', { className: 'bkbg-spk-name', style: { color: attr.nameColor } }, s.name),
                                el('div', { className: 'bkbg-spk-title-co', style: { color: attr.titleColor, marginTop: '2px' } }, s.title + (s.company ? ' · ' + s.company : '')),
                                attr.showTopic && s.topic && el('div', { style: { display: 'inline-block', background: attr.topicBg, color: attr.topicColor, fontSize: '12px', fontWeight: 600, borderRadius: '20px', padding: '3px 10px', marginTop: '8px' } }, s.topic),
                                attr.showBio && s.bio && el('p', { className: 'bkbg-spk-bio', style: { color: attr.bioColor, marginTop: '10px' } }, s.bio)
                            );
                        })
                    )
                )
            );
        },

        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-spk-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );

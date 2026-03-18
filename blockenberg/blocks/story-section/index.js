( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var Button = wp.components.Button;
    var __ = wp.i18n.__;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    // ─── helpers ────────────────────────────────────────────────────────────────
    function updateMilestone(list, idx, field, val) {
        return list.map(function (m, i) {
            if (i !== idx) return m;
            var u = {}; u[field] = val;
            return Object.assign({}, m, u);
        });
    }

    // ─── StoryPreview ────────────────────────────────────────────────────────────
    function StoryPreview(props) {
        var a = props.attributes;
        var setAttributes = props.setAttributes;
        var openMedia = props.openMedia;

        var isPhotoLeft = a.layout === 'photo-left';
        var isCentered = a.layout === 'centered';

        // photo column
        function PhotoCol() {
            return el('div', { className: 'bkbg-stry-photo-col' },
                el('div', {
                    className: 'bkbg-stry-photo-wrap',
                    style: { borderRadius: a.photoBorderRadius + 'px' }
                },
                    a.founderPhotoUrl
                        ? el('img', {
                            src: a.founderPhotoUrl,
                            alt: a.founderName,
                            className: 'bkbg-stry-photo',
                            style: { borderRadius: a.photoBorderRadius + 'px' }
                        })
                        : el('div', {
                            className: 'bkbg-stry-photo-placeholder',
                            style: { borderRadius: a.photoBorderRadius + 'px', borderColor: a.accentColor }
                        },
                            el('div', {
                                className: 'bkbg-stry-photo-btn',
                                style: { color: a.accentColor },
                                onClick: openMedia
                            }, '+ Add Photo')
                        ),
                    a.founderPhotoUrl && a.photoCaption && el('div', {
                        className: 'bkbg-stry-founder-caption',
                        style: { color: a.subColor }
                    },
                        el('strong', { style: { color: a.headlineColor } }, a.founderName),
                        a.founderTitle && el('span', null, ', ' + a.founderTitle)
                    )
                )
            );
        }

        // content column
        function ContentCol() {
            return el('div', { className: 'bkbg-stry-content-col' },
                el('h2', {
                    className: 'bkbg-stry-headline',
                    style: { color: a.headlineColor },
                    contentEditable: true,
                    suppressContentEditableWarning: true,
                    onBlur: function (e) { setAttributes({ headline: e.target.textContent }); }
                }, a.headline),
                el('p', {
                    className: 'bkbg-stry-subheadline',
                    style: { color: a.subColor },
                    contentEditable: true,
                    suppressContentEditableWarning: true,
                    onBlur: function (e) { setAttributes({ subheadline: e.target.textContent }); }
                }, a.subheadline),
                el('p', {
                    className: 'bkbg-stry-body',
                    style: { color: a.bodyColor },
                    contentEditable: true,
                    suppressContentEditableWarning: true,
                    onBlur: function (e) { setAttributes({ bodyText: e.target.textContent }); }
                }, a.bodyText),
                a.showPullQuote && el('blockquote', {
                    className: 'bkbg-stry-quote',
                    style: {
                        color: a.quoteColor,
                        borderLeftColor: a.accentColor
                    },
                    contentEditable: true,
                    suppressContentEditableWarning: true,
                    onBlur: function (e) { setAttributes({ pullQuote: e.target.textContent }); }
                }, a.pullQuote),
                a.showCta && el('div', { className: 'bkbg-stry-cta-row' },
                    el('span', {
                        className: 'bkbg-stry-cta-btn',
                        style: {
                            background: a.ctaBg,
                            color: a.ctaColor,
                            borderRadius: a.borderRadius + 'px'
                        },
                        contentEditable: true,
                        suppressContentEditableWarning: true,
                        onBlur: function (e) { setAttributes({ ctaLabel: e.target.textContent }); }
                    }, a.ctaLabel)
                )
            );
        }

        // milestones
        function MilestonesSection() {
            if (!a.showMilestones) return null;
            return el('div', { className: 'bkbg-stry-milestones' },
                el('div', { className: 'bkbg-stry-milestone-line', style: { background: a.accentColor } }),
                el('div', { className: 'bkbg-stry-milestone-list' },
                    a.milestones.map(function (m, i) {
                        return el('div', { key: i, className: 'bkbg-stry-milestone' },
                            el('div', { className: 'bkbg-stry-milestone-dot', style: { background: a.accentColor } }),
                            el('div', { className: 'bkbg-stry-milestone-year', style: { color: a.yearColor } }, m.year),
                            el('div', { className: 'bkbg-stry-milestone-title', style: { color: a.milestoneTitleColor } }, m.title),
                            el('div', { className: 'bkbg-stry-milestone-desc', style: { color: a.milestoneTextColor } }, m.description)
                        );
                    })
                )
            );
        }

        var mainClass = 'bkbg-stry-main bkbg-stry-layout-' + a.layout;

        return el('div', { className: 'bkbg-stry-block', style: { background: a.bgColor } },
            el('div', { className: mainClass },
                !isCentered && a.showPhoto && (isPhotoLeft
                    ? el(Fragment, null, el(PhotoCol, null), el(ContentCol, null))
                    : el(Fragment, null, el(ContentCol, null), el(PhotoCol, null))
                ),
                isCentered && el(Fragment, null,
                    a.showPhoto && el(PhotoCol, null),
                    el(ContentCol, null)
                )
            ),
            el(MilestonesSection, null)
        );
    }

    // ─── MilestoneEditor ─────────────────────────────────────────────────────────
    function MilestoneEditor(props) {
        var milestones = props.milestones;
        var setAttributes = props.setAttributes;
        var accentColor = props.accentColor;

        var openStates = useState(
            milestones.map(function () { return false; })
        );
        var open = openStates[0];
        var setOpen = openStates[1];

        function toggle(i) {
            setOpen(open.map(function (v, j) { return j === i ? !v : v; }));
        }

        function removeAt(i) {
            setAttributes({ milestones: milestones.filter(function (_, j) { return j !== i; }) });
            setOpen(open.filter(function (_, j) { return j !== i; }));
        }

        function addMilestone() {
            var newList = milestones.concat([{ year: '2025', title: 'New Milestone', description: 'Describe this milestone.' }]);
            setAttributes({ milestones: newList });
            setOpen(open.concat([true]));
        }

        return el('div', null,
            milestones.map(function (m, i) {
                return el('div', { key: i, className: 'bkbg-stry-milestone-editor' },
                    el('div', {
                        className: 'bkbg-stry-milestone-header',
                        onClick: function () { toggle(i); },
                        style: { borderLeftColor: accentColor }
                    },
                        el('strong', null, m.year + ' — ' + m.title),
                        el('span', null, open[i] ? '▲' : '▼')
                    ),
                    open[i] && el('div', { className: 'bkbg-stry-milestone-fields' },
                        el(TextControl, {
                            label: __('Year'),
                            value: m.year,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ milestones: updateMilestone(milestones, i, 'year', v) }); }
                        }),
                        el(TextControl, {
                            label: __('Title'),
                            value: m.title,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ milestones: updateMilestone(milestones, i, 'title', v) }); }
                        }),
                        el(TextareaControl, {
                            label: __('Description'),
                            value: m.description,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ milestones: updateMilestone(milestones, i, 'description', v) }); }
                        }),
                        el(Button, {
                            variant: 'link',
                            isDestructive: true,
                            onClick: function () { removeAt(i); }
                        }, __('Remove milestone'))
                    )
                );
            }),
            el(Button, {
                variant: 'secondary',
                onClick: addMilestone,
                style: { marginTop: '8px' }
            }, __('+ Add Milestone'))
        );
    }

    // ─── register ────────────────────────────────────────────────────────────────
    registerBlockType('blockenberg/story-section', {
        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            function inspector() {
                return el(InspectorControls, null,

                    el(PanelBody, { title: __('Layout'), initialOpen: true },
                        el(SelectControl, {
                            label: __('Layout'),
                            value: a.layout,
                            __nextHasNoMarginBottom: true,
                            options: [
                                { value: 'photo-left', label: 'Photo Left' },
                                { value: 'photo-right', label: 'Photo Right' },
                                { value: 'centered', label: 'Centered' }
                            ],
                            onChange: function (v) { setAttributes({ layout: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Show founder photo'),
                            checked: a.showPhoto,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ showPhoto: v }); }
                        }),
                        a.showPhoto && a.founderPhotoUrl && el(ToggleControl, {
                            label: __('Show name & title caption'),
                            checked: a.photoCaption,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ photoCaption: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Show pull quote'),
                            checked: a.showPullQuote,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ showPullQuote: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Show milestones'),
                            checked: a.showMilestones,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ showMilestones: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Show CTA button'),
                            checked: a.showCta,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ showCta: v }); }
                        })
                    ),

                    el(PanelBody, { title: __('Founder Info'), initialOpen: false },
                        el(TextControl, {
                            label: __('Founder / Author Name'),
                            value: a.founderName,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ founderName: v }); }
                        }),
                        el(TextControl, {
                            label: __('Title / Role'),
                            value: a.founderTitle,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ founderTitle: v }); }
                        })
                    ),

                    el(PanelBody, { title: __('Founder Photo'), initialOpen: false },
                        el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect: function (media) {
                                    setAttributes({ founderPhotoUrl: media.url, founderPhotoId: media.id });
                                },
                                allowedTypes: ['image'],
                                value: a.founderPhotoId,
                                render: function (ref) {
                                    return el(Fragment, null,
                                        a.founderPhotoUrl && el('img', {
                                            src: a.founderPhotoUrl,
                                            style: { width: '100%', borderRadius: '8px', marginBottom: '8px', display: 'block' }
                                        }),
                                        el(Button, {
                                            variant: a.founderPhotoUrl ? 'secondary' : 'primary',
                                            onClick: ref.open
                                        }, a.founderPhotoUrl ? __('Replace Photo') : __('Select Photo')),
                                        a.founderPhotoUrl && el(Button, {
                                            variant: 'link',
                                            isDestructive: true,
                                            onClick: function () { setAttributes({ founderPhotoUrl: '', founderPhotoId: 0 }); },
                                            style: { marginLeft: '8px' }
                                        }, __('Remove'))
                                    );
                                }
                            })
                        )
                    ),

                    a.showCta && el(PanelBody, { title: __('CTA Button'), initialOpen: false },
                        el(TextControl, {
                            label: __('Button Label'),
                            value: a.ctaLabel,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ ctaLabel: v }); }
                        }),
                        el(TextControl, {
                            label: __('Button URL'),
                            value: a.ctaUrl,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ ctaUrl: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Open in new tab'),
                            checked: a.ctaNewTab,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ ctaNewTab: v }); }
                        })
                    ),

                    a.showMilestones && el(PanelBody, { title: __('Milestones'), initialOpen: false },
                        el(MilestoneEditor, {
                            milestones: a.milestones,
                            setAttributes: setAttributes,
                            accentColor: a.accentColor
                        })
                    ),

                    el(PanelBody, { title: __('Typography'), initialOpen: false },
                        getTypoControl()({ label: __('Headline', 'blockenberg'), value: a.headlineTypo, onChange: function (v) { setAttributes({ headlineTypo: v }); } }),
                        getTypoControl()({ label: __('Subheadline', 'blockenberg'), value: a.subheadlineTypo, onChange: function (v) { setAttributes({ subheadlineTypo: v }); } }),
                        getTypoControl()({ label: __('Body', 'blockenberg'), value: a.bodyTypo, onChange: function (v) { setAttributes({ bodyTypo: v }); } }),
                        getTypoControl()({ label: __('Pull Quote', 'blockenberg'), value: a.quoteTypo, onChange: function (v) { setAttributes({ quoteTypo: v }); } })
                    ),

                    el(PanelBody, { title: __('Shape'), initialOpen: false },
                        el(RangeControl, {
                            label: __('Button border radius (px)'),
                            value: a.borderRadius,
                            min: 0, max: 40,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ borderRadius: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Photo border radius (px)'),
                            value: a.photoBorderRadius,
                            min: 0, max: 40,
                            __nextHasNoMarginBottom: true,
                            onChange: function (v) { setAttributes({ photoBorderRadius: v }); }
                        })
                    ),

                    el(PanelColorSettings, {
                        title: __('Colors'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Background'), value: a.bgColor, onChange: function (v) { setAttributes({ bgColor: v || '#ffffff' }); } },
                            { label: __('Accent'), value: a.accentColor, onChange: function (v) { setAttributes({ accentColor: v || '#6366f1' }); } },
                            { label: __('Headline'), value: a.headlineColor, onChange: function (v) { setAttributes({ headlineColor: v || '#0f172a' }); } },
                            { label: __('Subheadline'), value: a.subColor, onChange: function (v) { setAttributes({ subColor: v || '#475569' }); } },
                            { label: __('Body text'), value: a.bodyColor, onChange: function (v) { setAttributes({ bodyColor: v || '#334155' }); } },
                            { label: __('Pull quote'), value: a.quoteColor, onChange: function (v) { setAttributes({ quoteColor: v || '#1e293b' }); } },
                            { label: __('Milestone year'), value: a.yearColor, onChange: function (v) { setAttributes({ yearColor: v || '#6366f1' }); } },
                            { label: __('Milestone title'), value: a.milestoneTitleColor, onChange: function (v) { setAttributes({ milestoneTitleColor: v || '#0f172a' }); } },
                            { label: __('Milestone text'), value: a.milestoneTextColor, onChange: function (v) { setAttributes({ milestoneTextColor: v || '#475569' }); } },
                            { label: __('CTA button bg'), value: a.ctaBg, onChange: function (v) { setAttributes({ ctaBg: v || '#6366f1' }); } },
                            { label: __('CTA button text'), value: a.ctaColor, onChange: function (v) { setAttributes({ ctaColor: v || '#ffffff' }); } }
                        ]
                    })
                );
            }

            return el(Fragment, null,
                inspector(),
                el('div', useBlockProps((function () {
                    var _tvf = getTypoCssVars();
                    var s = {};
                    Object.assign(s, _tvf(a.headlineTypo,    '--bkstry-hl-'));
                    Object.assign(s, _tvf(a.subheadlineTypo, '--bkstry-sh-'));
                    Object.assign(s, _tvf(a.bodyTypo,        '--bkstry-bd-'));
                    Object.assign(s, _tvf(a.quoteTypo,       '--bkstry-qt-'));
                    return { className: 'bkbg-stry-editor-wrap', style: s };
                })()),
                    el(MediaUpload, {
                        onSelect: function (media) {
                            props.setAttributes({ founderPhotoUrl: media.url, founderPhotoId: media.id });
                        },
                        allowedTypes: ['image'],
                        value: a.founderPhotoId,
                        render: function (ref) {
                            return el(StoryPreview, {
                                attributes: a,
                                setAttributes: setAttributes,
                                openMedia: ref.open
                            });
                        }
                    })
                )
            );
        },

        save: function (props) {
            return el('div', useBlockProps.save(),
                el('div', {
                    className: 'bkbg-stry-app',
                    'data-opts': JSON.stringify(props.attributes)
                })
            );
        }
    });
}() );

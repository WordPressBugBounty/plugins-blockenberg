( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var Button = wp.components.Button;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;

    var _TC, _tv;
    Object.defineProperty(window, '_bkbgCOgetTC', { get: function () { return _TC || (_TC = window.bkbgTypographyControl); } });
    Object.defineProperty(window, '_bkbgCOgetTV', { get: function () { return _tv || (_tv = window.bkbgTypoCssVars); } });

    var STATUS_OPTIONS = [
        { label: __('— None', 'blockenberg'), value: 'none' },
        { label: __('✓ Done', 'blockenberg'), value: 'done' },
        { label: __('⟳ In Progress', 'blockenberg'), value: 'in-progress' },
        { label: __('○ Planned', 'blockenberg'), value: 'planned' }
    ];

    function updateSection(sections, sIdx, field, val) {
        return sections.map(function (s, i) {
            if (i !== sIdx) return s;
            var u = {}; u[field] = val;
            return Object.assign({}, s, u);
        });
    }

    function updatePoint(sections, sIdx, pIdx, field, val) {
        return sections.map(function (s, i) {
            if (i !== sIdx) return s;
            var newPts = s.points.map(function (p, j) {
                if (j !== pIdx) return p;
                var u = {}; u[field] = val;
                return Object.assign({}, p, u);
            });
            return Object.assign({}, s, { points: newPts });
        });
    }

    function addPoint(sections, sIdx) {
        return sections.map(function (s, i) {
            if (i !== sIdx) return s;
            return Object.assign({}, s, { points: s.points.concat([{ text: 'New sub-point', status: 'planned' }]) });
        });
    }

    function removePoint(sections, sIdx, pIdx) {
        return sections.map(function (s, i) {
            if (i !== sIdx) return s;
            return Object.assign({}, s, { points: s.points.filter(function (_, j) { return j !== pIdx; }) });
        });
    }

    function getStatusStyle(status, a) {
        if (status === 'done')        return { background: a.doneBg,       color: a.doneColor       };
        if (status === 'in-progress') return { background: a.inProgressBg, color: a.inProgressColor };
        if (status === 'planned')     return { background: a.plannedBg,    color: a.plannedColor    };
        return null;
    }

    function getStatusLabel(status) {
        if (status === 'done')        return '✓ Done';
        if (status === 'in-progress') return '⟳ In Progress';
        if (status === 'planned')     return '○ Planned';
        return '';
    }

    registerBlockType('blockenberg/content-outline', {
        title: __('Content Outline', 'blockenberg'),
        icon: 'list-view',
        category: 'bkbg-blog',
        description: __('Structured article outline with numbered sections, sub-points, and status badges.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var TC = window._bkbgCOgetTC;
            var tv = window._bkbgCOgetTV || function () { return {}; };

            var styleOptions = [
                { label: __('Card', 'blockenberg'), value: 'card' },
                { label: __('List', 'blockenberg'), value: 'list' },
                { label: __('Compact', 'blockenberg'), value: 'compact' }
            ];

            var inspector = el(InspectorControls, {},
                // Header
                el(PanelBody, { title: __('Title & Intro', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, {
                        label: __('Show title', 'blockenberg'), checked: a.showTitle, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showTitle: v }); }
                    }),
                    a.showTitle && el(TextControl, {
                        label: __('Title', 'blockenberg'), value: a.outlineTitle, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ outlineTitle: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show intro', 'blockenberg'), checked: a.showIntro, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showIntro: v }); }
                    }),
                    a.showIntro && el(TextareaControl, {
                        label: __('Intro text', 'blockenberg'), value: a.intro, rows: 2, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ intro: v }); }
                    })
                ),

                // Sections
                el(PanelBody, { title: __('Sections', 'blockenberg'), initialOpen: false },
                    a.sections.map(function (section, sIdx) {
                        return el('div', { key: 's-' + sIdx, style: { marginBottom: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' } },
                            el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', gap: '6px' } },
                                el('strong', { style: { color: '#6366f1', flexShrink: 0, fontSize: '13px' } }, (sIdx + 1) + '.'),
                                el(TextControl, {
                                    label: '', value: section.title, __nextHasNoMarginBottom: true,
                                    placeholder: __('Section title', 'blockenberg'),
                                    onChange: function (v) { set({ sections: updateSection(a.sections, sIdx, 'title', v) }); }
                                }),
                                el('div', { style: { display: 'flex', gap: '4px' } },
                                    el(Button, {
                                        isSmall: true, icon: 'plus-alt2',
                                        onClick: function () { set({ sections: addPoint(a.sections, sIdx) }); }
                                    }),
                                    el(Button, {
                                        isSmall: true, isDestructive: true, icon: 'trash',
                                        disabled: a.sections.length <= 1,
                                        onClick: function () { set({ sections: a.sections.filter(function (_, i) { return i !== sIdx; }) }); }
                                    })
                                )
                            ),
                            el('div', { style: { padding: '8px 12px', borderBottom: '1px solid #f1f5f9' } },
                                el(TextControl, {
                                    label: __('Description', 'blockenberg'), value: section.description || '', __nextHasNoMarginBottom: true,
                                    onChange: function (v) { set({ sections: updateSection(a.sections, sIdx, 'description', v) }); }
                                }),
                                el(RangeControl, {
                                    label: __('Estimated read time (min)', 'blockenberg'),
                                    value: section.readTime || 0, min: 0, max: 60, __nextHasNoMarginBottom: true,
                                    onChange: function (v) { set({ sections: updateSection(a.sections, sIdx, 'readTime', v) }); }
                                })
                            ),
                            el('div', { style: { padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '6px' } },
                                section.points.map(function (point, pIdx) {
                                    return el('div', { key: 'p-' + pIdx, style: { display: 'flex', gap: '6px', alignItems: 'center' } },
                                        el(SelectControl, {
                                            label: '', value: point.status || 'none', options: STATUS_OPTIONS, __nextHasNoMarginBottom: true,
                                            onChange: function (v) { set({ sections: updatePoint(a.sections, sIdx, pIdx, 'status', v) }); }
                                        }),
                                        el(TextControl, {
                                            label: '', value: point.text, __nextHasNoMarginBottom: true,
                                            placeholder: __('Sub-point', 'blockenberg'),
                                            onChange: function (v) { set({ sections: updatePoint(a.sections, sIdx, pIdx, 'text', v) }); }
                                        }),
                                        el(Button, {
                                            isSmall: true, isDestructive: true, icon: 'trash',
                                            disabled: section.points.length <= 1,
                                            onClick: function () { set({ sections: removePoint(a.sections, sIdx, pIdx) }); }
                                        })
                                    );
                                })
                            )
                        );
                    }),
                    el(Button, {
                        variant: 'secondary', isSmall: true, icon: 'plus-alt2',
                        onClick: function () {
                            set({ sections: a.sections.concat([{ title: 'New Section', description: '', readTime: 3, points: [{ text: 'Sub-point', status: 'planned' }] }]) });
                        }
                    }, __('Add Section', 'blockenberg'))
                ),

                // Display
                el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Style', 'blockenberg'), value: a.style, options: styleOptions, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ style: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show section numbers', 'blockenberg'), checked: a.showNumbers, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showNumbers: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show status badges', 'blockenberg'), checked: a.showStatus, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showStatus: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show read time', 'blockenberg'), checked: a.showReadTime, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showReadTime: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show section descriptions', 'blockenberg'), checked: a.showDescription, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showDescription: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show sub-points', 'blockenberg'), checked: a.showPoints, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showPoints: v }); }
                    })
                ),

                // Spacing
                el(PanelBody, { title: __('Spacing & Shape', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Border radius', 'blockenberg'), value: a.borderRadius, min: 0, max: 32, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ borderRadius: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Gap between sections', 'blockenberg'), value: a.gap, min: 4, max: 48, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ gap: v }); }
                    }),
                    ),

                // Colors
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    TC && el(TC, { label: __('Outline Title', 'blockenberg'), value: a.typoTitle, onChange: function (v) { set({ typoTitle: v }); } }),
                    TC && el(TC, { label: __('Section Title', 'blockenberg'), value: a.typoSection, onChange: function (v) { set({ typoSection: v }); } }),
                    el(RangeControl, {
                                            label: __('Point font size', 'blockenberg'), value: a.fontSize, min: 11, max: 20, __nextHasNoMarginBottom: true,
                                            onChange: function (v) { set({ fontSize: v }); }
                                        })
                ),
el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                    el(PanelColorSettings, {
                        title: __('Layout Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: a.bgColor,          label: __('Background', 'blockenberg'),    onChange: function (c) { set({ bgColor:          c }); } },
                            { value: a.cardBg,           label: __('Card bg', 'blockenberg'),       onChange: function (c) { set({ cardBg:           c }); } },
                            { value: a.borderColor,      label: __('Border', 'blockenberg'),        onChange: function (c) { set({ borderColor:      c }); } },
                            { value: a.accentColor,      label: __('Accent', 'blockenberg'),        onChange: function (c) { set({ accentColor:      c }); } },
                            { value: a.numberBg,         label: __('Number bg', 'blockenberg'),     onChange: function (c) { set({ numberBg:         c }); } },
                            { value: a.numberColor,      label: __('Number text', 'blockenberg'),   onChange: function (c) { set({ numberColor:      c }); } }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: __('Text Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: a.titleColor,       label: __('Outline title', 'blockenberg'), onChange: function (c) { set({ titleColor:       c }); } },
                            { value: a.sectionTitleColor,label: __('Section title', 'blockenberg'), onChange: function (c) { set({ sectionTitleColor: c }); } },
                            { value: a.descriptionColor, label: __('Description', 'blockenberg'),   onChange: function (c) { set({ descriptionColor: c }); } },
                            { value: a.pointColor,       label: __('Point text', 'blockenberg'),    onChange: function (c) { set({ pointColor:       c }); } },
                            { value: a.introColor,       label: __('Intro', 'blockenberg'),         onChange: function (c) { set({ introColor:       c }); } }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: __('Status Badge Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: a.doneBg,         label: __('Done background', 'blockenberg'),           onChange: function (c) { set({ doneBg:         c }); } },
                            { value: a.doneColor,      label: __('Done text', 'blockenberg'),                 onChange: function (c) { set({ doneColor:      c }); } },
                            { value: a.inProgressBg,   label: __('In Progress background', 'blockenberg'),    onChange: function (c) { set({ inProgressBg:   c }); } },
                            { value: a.inProgressColor,label: __('In Progress text', 'blockenberg'),          onChange: function (c) { set({ inProgressColor: c }); } },
                            { value: a.plannedBg,      label: __('Planned background', 'blockenberg'),        onChange: function (c) { set({ plannedBg:      c }); } },
                            { value: a.plannedColor,   label: __('Planned text', 'blockenberg'),              onChange: function (c) { set({ plannedColor:   c }); } }
                        ]
                    })
                )
            );

            // ── Preview ──────────────────────────────────────────────
            var isCard = a.style === 'card';
            var isList = a.style === 'list';

            var sectionsPreview = a.sections.map(function (section, sIdx) {
                var cardStyle = {
                    background: a.cardBg,
                    border: '1px solid ' + a.borderColor,
                    borderRadius: a.borderRadius + 'px',
                    overflow: 'hidden'
                };
                if (isList || a.style === 'compact') {
                    cardStyle.border = 'none';
                    cardStyle.borderBottom = '1px solid ' + a.borderColor;
                    cardStyle.borderRadius = '0';
                    cardStyle.background = 'transparent';
                }

                return el('div', { key: 'sec-' + sIdx, className: 'bkbg-co-section', style: cardStyle },
                    el('div', {
                        style: {
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: isCard ? '16px 20px' : '12px 0',
                            borderBottom: a.showPoints && section.points.length ? '1px solid ' + a.borderColor : 'none'
                        }
                    },
                        a.showNumbers && el('span', {
                            style: {
                                background: a.numberBg, color: a.numberColor, width: '28px', height: '28px',
                                borderRadius: '50%', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontWeight: 800, fontSize: '12px', flexShrink: 0
                            }
                        }, sIdx + 1),
                        el('div', { style: { flex: 1, minWidth: 0 } },
                            el('div', { className: 'bkbg-co-section-title', style: { color: a.sectionTitleColor } }, section.title),
                            a.showDescription && section.description && el('div', {
                                style: { fontSize: '12px', color: a.descriptionColor, marginTop: '2px' }
                            }, section.description)
                        ),
                        a.showReadTime && section.readTime > 0 && el('span', {
                            style: { fontSize: '11px', color: a.descriptionColor, flexShrink: 0, fontWeight: 500 }
                        }, section.readTime + ' min')
                    ),
                    a.showPoints && section.points.length > 0 && el('ul', {
                        style: { margin: 0, padding: isCard ? '12px 20px 16px' : '8px 0 12px 28px', listStyle: 'none' }
                    },
                        section.points.map(function (point, pIdx) {
                            var statusStyle = a.showStatus && getStatusStyle(point.status, a);
                            var statusLabel = getStatusLabel(point.status);
                            return el('li', {
                                key: 'pt-' + pIdx,
                                style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: a.fontSize + 'px' }
                            },
                                el('span', { style: { color: a.accentColor, fontSize: '10px', flexShrink: 0 } }, '▸'),
                                el('span', { style: { color: a.pointColor, flex: 1 } }, point.text),
                                a.showStatus && statusStyle && el('span', {
                                    style: Object.assign({
                                        fontSize: '10px', fontWeight: 700, padding: '2px 7px',
                                        borderRadius: '100px', flexShrink: 0, whiteSpace: 'nowrap'
                                    }, statusStyle)
                                }, statusLabel)
                            );
                        })
                    )
                );
            });

            var blockProps = useBlockProps({ className: 'bkbg-editor-wrap', 'data-block-label': 'Content Outline' });

            return el('div', blockProps,
                inspector,
                el('div', {
                    className: 'bkbg-co-block',
                    style: Object.assign({ background: a.bgColor, borderRadius: a.borderRadius + 'px', padding: '4px 0' }, tv(a.typoTitle, '--bkco-title-'), tv(a.typoSection, '--bkco-sec-'))
                },
                    (a.showTitle || a.showIntro) && el('div', {
                        style: { padding: '20px 0 16px', borderBottom: '1px solid ' + a.borderColor, marginBottom: a.gap + 'px' }
                    },
                        a.showTitle && el('h3', {
                            className: 'bkbg-co-title', style: { margin: '0 0 6px', color: a.titleColor }
                        }, a.outlineTitle),
                        a.showIntro && el('p', {
                            style: { margin: 0, fontSize: '14px', color: a.introColor, lineHeight: '1.5' }
                        }, a.intro)
                    ),
                    el('div', {
                        style: {
                            display: 'flex', flexDirection: 'column', gap: a.gap + 'px'
                        }
                    }, sectionsPreview)
                )
            );
        },

        save: function (props) {
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', {
                    className: 'bkbg-content-outline-app',
                    'data-opts': JSON.stringify(props.attributes)
                })
            );
        }
    });
}() );

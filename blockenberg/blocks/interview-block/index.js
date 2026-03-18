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

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    function defaultItem() {
        return { question: 'Your question here?', answer: 'The answer goes here.' };
    }

    registerBlockType('blockenberg/interview-block', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var items = attr.items || [];

            var blockProps = useBlockProps((function () {
                var _tv = getTypoCssVars();
                var s = {};
                Object.assign(s, _tv(attr.questionTypo, '--bkbg-ib-q-'));
                Object.assign(s, _tv(attr.answerTypo, '--bkbg-ib-a-'));
                return { className: 'bkbg-ib-editor', style: s };
            })());

            function updateItem(i, key, val) {
                setAttr({ items: items.map(function (it, idx) {
                    if (idx !== i) return it;
                    var c = Object.assign({}, it); c[key] = val; return c;
                })});
            }

            // ---- Controls ----
            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Speaker Info', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, {
                        label: __('Show Speaker Header', 'blockenberg'),
                        checked: attr.showSpeakerHeader,
                        onChange: function (v) { setAttr({ showSpeakerHeader: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(TextControl, {
                        label: __('Interviewee Name', 'blockenberg'),
                        value: attr.intervieweeName,
                        onChange: function (v) { setAttr({ intervieweeName: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(TextControl, {
                        label: __('Interviewee Role / Title', 'blockenberg'),
                        value: attr.intervieweeRole,
                        onChange: function (v) { setAttr({ intervieweeRole: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(TextControl, {
                        label: __('Interviewer Name (optional)', 'blockenberg'),
                        value: attr.interviewerName,
                        onChange: function (v) { setAttr({ interviewerName: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el('p', { style: { margin: '8px 0 4px', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, color: '#9ca3af' } }, __('Interviewee Photo', 'blockenberg')),
                    el(MediaUploadCheck, {},
                        el(MediaUpload, {
                            onSelect: function (m) { setAttr({ intervieweeAvatarUrl: m.url, intervieweeAvatarId: m.id }); },
                            allowedTypes: ['image'], value: attr.intervieweeAvatarId,
                            render: function (ref) {
                                return attr.intervieweeAvatarUrl
                                    ? el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                                        el('img', { src: attr.intervieweeAvatarUrl, style: { width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' } }),
                                        el(Button, { isSmall: true, isDestructive: true, onClick: function () { setAttr({ intervieweeAvatarUrl: '', intervieweeAvatarId: 0 }); } }, '✕')
                                      )
                                    : el(Button, { isSecondary: true, isSmall: true, onClick: ref.open }, __('Upload Photo', 'blockenberg'));
                            }
                        })
                    )
                ),
                el(PanelBody, { title: __('Q&A Style', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Layout Style', 'blockenberg'),
                        value: attr.layout,
                        options: [
                            { label: 'Classic (prefix badge)', value: 'classic' },
                            { label: 'Magazine (large Q)', value: 'magazine' },
                            { label: 'Card (each item in card)', value: 'card' },
                            { label: 'Minimal (subtle divider)', value: 'minimal' }
                        ],
                        onChange: function (v) { setAttr({ layout: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(TextControl, {
                        label: __('Question Prefix Label', 'blockenberg'),
                        value: attr.questionPrefix,
                        onChange: function (v) { setAttr({ questionPrefix: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(TextControl, {
                        label: __('Answer Prefix Label', 'blockenberg'),
                        value: attr.answerPrefix,
                        onChange: function (v) { setAttr({ answerPrefix: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, {
                        label: __('Show Prefix Labels (Q / A)', 'blockenberg'),
                        checked: attr.showPrefixLabel,
                        onChange: function (v) { setAttr({ showPrefixLabel: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, {
                        label: __('Show Dividers Between Items', 'blockenberg'),
                        checked: attr.showDivider,
                        onChange: function (v) { setAttr({ showDivider: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Border Radius (px)', 'blockenberg'),
                        value: attr.borderRadius, min: 0, max: 32,
                        onChange: function (v) { setAttr({ borderRadius: v }); },
                        __nextHasNoMarginBottom: true
                    })
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    el(getTypographyControl(), { label: 'Question', value: attr.questionTypo, onChange: function (v) { setAttr({ questionTypo: v }); } }),
                    el(getTypographyControl(), { label: 'Answer', value: attr.answerTypo, onChange: function (v) { setAttr({ answerTypo: v }); } }),
                    el(RangeControl, { label: __('Name Size (px)', 'blockenberg'), value: attr.nameSize, min: 12, max: 32, __nextHasNoMarginBottom: true, onChange: function (v) { setAttr({ nameSize: v }); } }),
                    el(RangeControl, { label: __('Prefix Size (px)', 'blockenberg'), value: attr.prefixSize, min: 10, max: 24, __nextHasNoMarginBottom: true, onChange: function (v) { setAttr({ prefixSize: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Question Color', 'blockenberg'), value: attr.questionColor, onChange: function (v) { setAttr({ questionColor: v || '#111827' }); } },
                        { label: __('Answer Color', 'blockenberg'), value: attr.answerColor, onChange: function (v) { setAttr({ answerColor: v || '#374151' }); } },
                        { label: __('Prefix Badge BG', 'blockenberg'), value: attr.prefixBg, onChange: function (v) { setAttr({ prefixBg: v || '#7c3aed' }); } },
                        { label: __('Prefix Badge Text', 'blockenberg'), value: attr.prefixColor, onChange: function (v) { setAttr({ prefixColor: v || '#ffffff' }); } },
                        { label: __('Accent Color', 'blockenberg'), value: attr.accentColor, onChange: function (v) { setAttr({ accentColor: v || '#7c3aed' }); } },
                        { label: __('Card Background', 'blockenberg'), value: attr.cardBg, onChange: function (v) { setAttr({ cardBg: v || '#ffffff' }); } },
                        { label: __('Header Background', 'blockenberg'), value: attr.headerBg, onChange: function (v) { setAttr({ headerBg: v || '#f9fafb' }); } },
                        { label: __('Section Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { setAttr({ bgColor: v || '' }); } }
                    ]
                }),
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Max Width (px)', 'blockenberg'),
                        value: attr.maxWidth, min: 400, max: 1200,
                        onChange: function (v) { setAttr({ maxWidth: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Padding Top (px)', 'blockenberg'),
                        value: attr.paddingTop, min: 0, max: 200,
                        onChange: function (v) { setAttr({ paddingTop: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Padding Bottom (px)', 'blockenberg'),
                        value: attr.paddingBottom, min: 0, max: 200,
                        onChange: function (v) { setAttr({ paddingBottom: v }); },
                        __nextHasNoMarginBottom: true
                    })
                )
            );

            // ---- Preview ----
            function prefixBadge(letter, isQ) {
                if (!attr.showPrefixLabel) return null;
                var bg = isQ ? attr.prefixBg : 'transparent';
                var color = isQ ? attr.prefixColor : attr.accentColor;
                var border = isQ ? 'none' : ('2px solid ' + attr.accentColor);
                if (attr.layout === 'magazine') {
                    return el('span', {
                        style: {
                            fontSize: isQ ? '48px' : '36px',
                            fontWeight: '900',
                            color: isQ ? attr.accentColor : attr.answerColor,
                            lineHeight: '0.85',
                            marginRight: '12px',
                            opacity: isQ ? 1 : 0.2,
                            fontFamily: 'Georgia, serif',
                            flexShrink: 0
                        }
                    }, letter);
                }
                return el('span', {
                    style: {
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '28px', height: '28px', borderRadius: '6px',
                        background: bg, color: color, border: border,
                        fontSize: attr.prefixSize + 'px', fontWeight: '700',
                        flexShrink: 0, lineHeight: 1
                    }
                }, letter);
            }

            var containerStyle = {
                background: attr.bgColor || 'transparent',
                paddingTop: attr.paddingTop + 'px',
                paddingBottom: attr.paddingBottom + 'px'
            };

            var interviewItems = items.map(function (item, i) {
                var isCard = attr.layout === 'card';
                var rowStyle = {
                    marginBottom: i < items.length - 1 ? '0' : '0'
                };
                var qRow = el('div', { style: { display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' } },
                    prefixBadge(attr.questionPrefix, true),
                    el(RichText, {
                        tagName: 'p',
                        className: 'bkbg-ib-q-text',
                        style: { margin: 0, color: attr.questionColor },
                        value: item.question,
                        onChange: function (v) { updateItem(i, 'question', v); },
                        placeholder: __('Question…', 'blockenberg')
                    })
                );
                var aRow = el('div', { style: { display: 'flex', alignItems: 'flex-start', gap: '12px' } },
                    prefixBadge(attr.answerPrefix, false),
                    el(RichText, {
                        tagName: 'p',
                        className: 'bkbg-ib-a-text',
                        style: { margin: 0, color: attr.answerColor },
                        value: item.answer,
                        onChange: function (v) { updateItem(i, 'answer', v); },
                        placeholder: __('Answer…', 'blockenberg')
                    })
                );
                var itemContent;
                if (isCard) {
                    itemContent = el('div', {
                        style: {
                            background: attr.cardBg, border: '1px solid ' + attr.cardBorderColor,
                            borderRadius: attr.borderRadius + 'px', padding: '24px 28px'
                        }
                    }, qRow, aRow);
                } else {
                    itemContent = el('div', {}, qRow, aRow);
                }
                var divider = (attr.showDivider && !isCard && i < items.length - 1)
                    ? el('hr', { style: { border: 'none', borderTop: '1px solid ' + attr.dividerColor, margin: '24px 0' } })
                    : (isCard ? el('div', { style: { height: '12px' } }) : el('div', { style: { height: '24px' } }));
                return el('div', { key: i }, itemContent, divider,
                    el('div', { style: { display: 'flex', gap: '8px', marginTop: isCard ? '0' : '-8px', marginBottom: isCard ? '0' : '8px' } },
                        el(Button, { isSmall: true, isDestructive: true, onClick: function () { setAttr({ items: items.filter(function (_, idx) { return idx !== i; }) }); } }, '✕ Remove')
                    )
                );
            });

            return el('div', blockProps, controls,
                el('div', { style: containerStyle },
                    el('div', { style: { maxWidth: attr.maxWidth + 'px', margin: '0 auto' } },
                        attr.showSpeakerHeader && el('div', {
                            style: {
                                display: 'flex', alignItems: 'center', gap: '16px',
                                background: attr.headerBg, borderRadius: attr.borderRadius + 'px',
                                padding: '20px 24px', marginBottom: '32px'
                            }
                        },
                            attr.intervieweeAvatarUrl
                                ? el('img', { src: attr.intervieweeAvatarUrl, style: { width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 } })
                                : el('div', { style: { width: '56px', height: '56px', borderRadius: '50%', background: attr.prefixBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } },
                                    el('span', { style: { color: '#fff', fontSize: '22px', fontWeight: '700' } }, (attr.intervieweeName || 'J').charAt(0))
                                  ),
                            el('div', {},
                                el('div', { style: { fontWeight: '700', fontSize: attr.nameSize + 'px', color: attr.nameColor } }, attr.intervieweeName || '—'),
                                el('div', { style: { fontSize: '14px', color: attr.roleColor, marginTop: '2px' } }, attr.intervieweeRole),
                                attr.interviewerName && el('div', { style: { fontSize: '12px', color: attr.roleColor, marginTop: '4px', opacity: 0.7 } }, __('Interviewed by', 'blockenberg') + ': ' + attr.interviewerName)
                            )
                        ),
                        interviewItems,
                        el('div', { style: { marginTop: '16px' } },
                            el(Button, {
                                isPrimary: true, isSmall: true,
                                onClick: function () { setAttr({ items: items.concat(defaultItem()) }); }
                            }, '+ ' + __('Add Q&A', 'blockenberg'))
                        )
                    )
                )
            );
        },

        save: function (props) {
            var attr = props.attributes;
            var _tv = getTypoCssVars();
            var s = {};
            Object.assign(s, _tv(attr.questionTypo, '--bkbg-ib-q-'));
            Object.assign(s, _tv(attr.answerTypo, '--bkbg-ib-a-'));
            return el('div', wp.blockEditor.useBlockProps.save({ style: s }),
                el('div', { className: 'bkbg-ib-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );

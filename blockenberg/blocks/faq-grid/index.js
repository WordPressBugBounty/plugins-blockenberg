( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText = wp.blockEditor.RichText;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    var _fgTC, _fgTV;
    function _tc() { return _fgTC || (_fgTC = window.bkbgTypographyControl); }
    function _tv(o, p) { if (!_fgTV) _fgTV = window.bkbgTypoCssVars; return _fgTV ? _fgTV(o, p) : {}; }

    registerBlockType('blockenberg/faq-grid', {
        title: __('FAQ Grid', 'blockenberg'),
        icon: 'editor-help',
        category: 'bkbg-business',

        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;

            var expandedState = useState(null);
            var expanded = expandedState[0];
            var setExpanded = expandedState[1];

            function wrapStyle(a) {
                return Object.assign({
                    '--bkbg-fg-accent': a.accentColor,
                    '--bkbg-fg-bg': a.bgColor,
                    '--bkbg-fg-text': a.textColor,
                    '--bkbg-fg-heading-c': a.headingColor,
                    '--bkbg-fg-sub-c': a.subColor,
                    '--bkbg-fg-q-c': a.questionColor,
                    '--bkbg-fg-a-c': a.answerColor,
                    '--bkbg-fg-card-bg': a.cardBg,
                    '--bkbg-fg-card-border': a.cardBorder,
                    '--bkbg-fg-card-p': a.cardPadding + 'px',
                    '--bkbg-fg-card-r': a.cardRadius + 'px',
                    '--bkbg-fg-gap': a.gap + 'px',
                    '--bkbg-fg-cols': a.columns,
                    '--bkbg-fg-num-c': a.numberColor,
                    '--bkbg-fg-sect-gap': a.sectionGap + 'px',
                    '--bkbg-fg-pt': a.paddingTop + 'px',
                    '--bkbg-fg-pb': a.paddingBottom + 'px',
                },
                _tv(a.typoHeading, '--bkbg-fg-hd-'),
                _tv(a.typoSubheading, '--bkbg-fg-sh-'),
                _tv(a.typoQuestion, '--bkbg-fg-qt-'),
                _tv(a.typoAnswer, '--bkbg-fg-an-'));
            }

            function updateItem(index, key, value) {
                var arr = a.items.slice();
                arr[index] = Object.assign({}, arr[index]);
                arr[index][key] = value;
                set({ items: arr });
            }

            function addItem() {
                set({ items: a.items.concat([{ question: __('Your question here?', 'blockenberg'), answer: __('Your answer here. Keep it concise and helpful for your visitors.', 'blockenberg') }]) });
            }

            function removeItem(idx) {
                set({ items: a.items.filter(function (_, i) { return i !== idx; }) });
            }

            function moveItem(idx, dir) {
                var ni = idx + dir;
                if (ni < 0 || ni >= a.items.length) return;
                var arr = a.items.slice();
                var tmp = arr[idx]; arr[idx] = arr[ni]; arr[ni] = tmp;
                set({ items: arr });
            }

            var styleOptions = [
                { label: __('Card', 'blockenberg'), value: 'card' },
                { label: __('Bordered', 'blockenberg'), value: 'bordered' },
                { label: __('Flat', 'blockenberg'), value: 'flat' },
                { label: __('Gradient', 'blockenberg'), value: 'gradient' },
                { label: __('Dark', 'blockenberg'), value: 'dark' },
            ];

            var alignOptions = [
                { label: __('Left', 'blockenberg'), value: 'left' },
                { label: __('Center', 'blockenberg'), value: 'center' },
            ];

            var weightOpts = [
                { label: '400', value: 400 }, { label: '500', value: 500 },
                { label: '600', value: 600 }, { label: '700', value: 700 }, { label: '800', value: 800 }
            ];

            var inspector = el(InspectorControls, {},

                el(PanelBody, { title: __('Section Header', 'blockenberg'), initialOpen: true },
                    el(ToggleControl, {
                        label: __('Show Heading', 'blockenberg'), checked: a.showHeading, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showHeading: v }); }
                    }),
                    a.showHeading && el(TextControl, { label: __('Heading', 'blockenberg'), value: a.heading, onChange: function (v) { set({ heading: v }); } }),
                    el(ToggleControl, {
                        label: __('Show Subheading', 'blockenberg'), checked: a.showSubheading, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showSubheading: v }); }
                    }),
                    a.showSubheading && el(TextControl, { label: __('Subheading', 'blockenberg'), value: a.subheading, onChange: function (v) { set({ subheading: v }); } }),
                    el(SelectControl, { label: __('Heading Align', 'blockenberg'), value: a.headingAlign, options: alignOptions, onChange: function (v) { set({ headingAlign: v }); } }),
                    el(RangeControl, { label: __('Section Gap', 'blockenberg'), value: a.sectionGap, onChange: function (v) { set({ sectionGap: v }); }, min: 16, max: 80 })
                ),

                el(PanelBody, { title: __('Grid & Style', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Card Style', 'blockenberg'), value: a.style,
                        options: styleOptions, onChange: function (v) { set({ style: v }); }
                    }),
                    el(RangeControl, { label: __('Columns', 'blockenberg'), value: a.columns, onChange: function (v) { set({ columns: v }); }, min: 1, max: 4 }),
                    el(ToggleControl, {
                        label: __('Show Number', 'blockenberg'), checked: a.showNumber, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showNumber: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show Divider', 'blockenberg'), checked: a.showDivider, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showDivider: v }); }
                    }),
                    el(RangeControl, { label: __('Card Padding', 'blockenberg'), value: a.cardPadding, onChange: function (v) { set({ cardPadding: v }); }, min: 12, max: 60 }),
                    el(RangeControl, { label: __('Border Radius', 'blockenberg'), value: a.cardRadius, onChange: function (v) { set({ cardRadius: v }); }, min: 0, max: 32 }),
                    el(RangeControl, { label: __('Gap', 'blockenberg'), value: a.gap, onChange: function (v) { set({ gap: v }); }, min: 8, max: 48 })
                ),

                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    _tc() && _tc()({ label: __('Heading', 'blockenberg'), typo: a.typoHeading, onChange: function (v) { set({ typoHeading: v }); } }),
                    _tc() && _tc()({ label: __('Subheading', 'blockenberg'), typo: a.typoSubheading, onChange: function (v) { set({ typoSubheading: v }); } }),
                    _tc() && _tc()({ label: __('Question', 'blockenberg'), typo: a.typoQuestion, onChange: function (v) { set({ typoQuestion: v }); } }),
                    _tc() && _tc()({ label: __('Answer', 'blockenberg'), typo: a.typoAnswer, onChange: function (v) { set({ typoAnswer: v }); } })
                ),

                el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: a.paddingTop, onChange: function (v) { set({ paddingTop: v }); }, min: 0, max: 200 }),
                    el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: a.paddingBottom, onChange: function (v) { set({ paddingBottom: v }); }, min: 0, max: 200 })
                ),

                el(PanelBody, { title: __('FAQ Items', 'blockenberg'), initialOpen: false },
                    a.items.map(function (item, idx) {
                        var isOpen = expanded === idx;
                        return el('div', { key: idx, className: 'bkbg-fg-item-ctrl' + (isOpen ? ' bkbg-fg-item-ctrl--open' : '') },
                            el('div', {
                                className: 'bkbg-fg-item-head',
                                onClick: function () { setExpanded(isOpen ? null : idx); }
                            },
                                el('strong', {}, '#' + (idx + 1) + ' ' + (item.question ? item.question.substring(0, 28) + (item.question.length > 28 ? '…' : '') : '')),
                                el('div', { className: 'bkbg-fg-item-actions' },
                                    el(Button, { icon: 'arrow-up-alt2', size: 'small', disabled: idx === 0, onClick: function (e) { e.stopPropagation(); moveItem(idx, -1); } }),
                                    el(Button, { icon: 'arrow-down-alt2', size: 'small', disabled: idx === a.items.length - 1, onClick: function (e) { e.stopPropagation(); moveItem(idx, 1); } }),
                                    el(Button, { icon: 'trash', size: 'small', isDestructive: true, onClick: function (e) { e.stopPropagation(); removeItem(idx); } })
                                )
                            ),
                            isOpen && el('div', { className: 'bkbg-fg-item-body' },
                                el(TextControl, { label: __('Question', 'blockenberg'), value: item.question, onChange: function (v) { updateItem(idx, 'question', v); } }),
                                el('label', { style: { display: 'block', marginBottom: 4, fontWeight: 500, fontSize: 11, textTransform: 'uppercase' } }, __('Answer', 'blockenberg')),
                                el('textarea', {
                                    style: { width: '100%', minHeight: 80, padding: 8, borderRadius: 4, border: '1px solid #e2e8f0', resize: 'vertical' },
                                    value: item.answer,
                                    onChange: function (e) { updateItem(idx, 'answer', e.target.value); }
                                })
                            )
                        );
                    }),
                    el(Button, { variant: 'secondary', onClick: addItem }, __('+ Add FAQ Item', 'blockenberg'))
                ),

                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { value: a.accentColor, onChange: function (v) { set({ accentColor: v || '#6c3fb5' }); }, label: __('Accent Color', 'blockenberg') },
                        { value: a.bgColor, onChange: function (v) { set({ bgColor: v || '#ffffff' }); }, label: __('Section Background', 'blockenberg') },
                        { value: a.headingColor, onChange: function (v) { set({ headingColor: v || '#0f172a' }); }, label: __('Heading Color', 'blockenberg') },
                        { value: a.subColor, onChange: function (v) { set({ subColor: v || '#64748b' }); }, label: __('Subheading Color', 'blockenberg') },
                        { value: a.questionColor, onChange: function (v) { set({ questionColor: v || '#0f172a' }); }, label: __('Question Color', 'blockenberg') },
                        { value: a.answerColor, onChange: function (v) { set({ answerColor: v || '#475569' }); }, label: __('Answer Color', 'blockenberg') },
                        { value: a.cardBg, onChange: function (v) { set({ cardBg: v || '#ffffff' }); }, label: __('Card Background', 'blockenberg') },
                        { value: a.cardBorder, onChange: function (v) { set({ cardBorder: v || '#e2e8f0' }); }, label: __('Card Border', 'blockenberg') },
                        { value: a.numberColor, onChange: function (v) { set({ numberColor: v || '#6c3fb5' }); }, label: __('Number Color', 'blockenberg') },
                    ]
                })
            );

            var blockProps = useBlockProps({
                className: 'bkbg-fg-wrap bkbg-fg-style--' + a.style,
                style: wrapStyle(a)
            });

            return el('div', blockProps,
                inspector,
                (a.showHeading || a.showSubheading) && el('div', {
                    className: 'bkbg-fg-header',
                    style: { textAlign: a.headingAlign }
                },
                    a.showHeading && el(RichText, {
                        tagName: 'h2', className: 'bkbg-fg-heading',
                        value: a.heading, placeholder: __('FAQ Heading…', 'blockenberg'),
                        onChange: function (v) { set({ heading: v }); }
                    }),
                    a.showSubheading && el(RichText, {
                        tagName: 'p', className: 'bkbg-fg-subheading',
                        value: a.subheading, placeholder: __('Subheading…', 'blockenberg'),
                        onChange: function (v) { set({ subheading: v }); }
                    })
                ),
                el('div', { className: 'bkbg-fg-grid' },
                    a.items.map(function (item, idx) {
                        return el('div', { key: idx, className: 'bkbg-fg-card' },
                            a.showNumber && el('div', { className: 'bkbg-fg-num' }, (idx + 1) + '.'),
                            el('div', { className: 'bkbg-fg-q' }, item.question),
                            a.showDivider && el('div', { className: 'bkbg-fg-divider' }),
                            el('div', { className: 'bkbg-fg-a' }, item.answer)
                        );
                    })
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var el = wp.element.createElement;

            function wrapStyle(a) {
                return Object.assign({
                    '--bkbg-fg-accent': a.accentColor,
                    '--bkbg-fg-bg': a.bgColor,
                    '--bkbg-fg-text': a.textColor,
                    '--bkbg-fg-heading-c': a.headingColor,
                    '--bkbg-fg-sub-c': a.subColor,
                    '--bkbg-fg-q-c': a.questionColor,
                    '--bkbg-fg-a-c': a.answerColor,
                    '--bkbg-fg-card-bg': a.cardBg,
                    '--bkbg-fg-card-border': a.cardBorder,
                    '--bkbg-fg-card-p': a.cardPadding + 'px',
                    '--bkbg-fg-card-r': a.cardRadius + 'px',
                    '--bkbg-fg-gap': a.gap + 'px',
                    '--bkbg-fg-cols': a.columns,
                    '--bkbg-fg-num-c': a.numberColor,
                    '--bkbg-fg-sect-gap': a.sectionGap + 'px',
                    '--bkbg-fg-pt': a.paddingTop + 'px',
                    '--bkbg-fg-pb': a.paddingBottom + 'px',
                },
                _tv(a.typoHeading, '--bkbg-fg-hd-'),
                _tv(a.typoSubheading, '--bkbg-fg-sh-'),
                _tv(a.typoQuestion, '--bkbg-fg-qt-'),
                _tv(a.typoAnswer, '--bkbg-fg-an-'));
            }

            var blockProps = wp.blockEditor.useBlockProps.save({
                className: 'bkbg-fg-wrap bkbg-fg-style--' + a.style,
                style: wrapStyle(a)
            });

            return el('div', blockProps,
                (a.showHeading || a.showSubheading) && el('div', {
                    className: 'bkbg-fg-header',
                    style: { textAlign: a.headingAlign }
                },
                    a.showHeading && el(RichText.Content, { tagName: 'h2', className: 'bkbg-fg-heading', value: a.heading }),
                    a.showSubheading && el(RichText.Content, { tagName: 'p', className: 'bkbg-fg-subheading', value: a.subheading })
                ),
                el('div', { className: 'bkbg-fg-grid' },
                    a.items.map(function (item, idx) {
                        return el('div', { key: idx, className: 'bkbg-fg-card' },
                            a.showNumber && el('div', { className: 'bkbg-fg-num' }, (idx + 1) + '.'),
                            el('div', { className: 'bkbg-fg-q' }, item.question),
                            a.showDivider && el('div', { className: 'bkbg-fg-divider' }),
                            el('div', { className: 'bkbg-fg-a' }, item.answer)
                        );
                    })
                )
            );
        }
    });
}() );

( function () {
    var el = wp.element.createElement;
    var useState = wp.element.useState;
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
    var Button = wp.components.Button;

    var _fsecTC, _fsecTV;
    function _tc() { return _fsecTC || (_fsecTC = window.bkbgTypographyControl); }
    function _tv() { return _fsecTV || (_fsecTV = window.bkbgTypoCssVars); }

    registerBlockType('blockenberg/faq-section', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps({ style: Object.assign({}, _tv()(a.typoEyebrow, '--bkbg-fsec-eb-'), _tv()(a.typoHeading, '--bkbg-fsec-hd-'), _tv()(a.typoSubtext, '--bkbg-fsec-st-'), _tv()(a.typoQuestion, '--bkbg-fsec-qt-'), _tv()(a.typoAnswer, '--bkbg-fsec-an-')) });

            var openState = useState(a.expandFirst ? 0 : null);
            var openIdx = openState[0];
            var setOpenIdx = openState[1];

            function updateItem(idx, key, val) {
                var next = a.items.map(function (it, i) {
                    return i === idx ? Object.assign({}, it, { [key]: val }) : it;
                });
                set({ items: next });
            }

            function removeItem(idx) {
                set({ items: a.items.filter(function (_, i) { return i !== idx; }) });
            }

            /* --- Icon helpers --- */
            function iconEl(open) {
                if (a.iconType === 'plus') return el('span', { style: { fontSize: '20px', lineHeight: 1, color: a.iconColor, transition: 'transform .2s' } }, open ? '−' : '+');
                if (a.iconType === 'arrow') return el('span', { style: { fontSize: '14px', color: a.iconColor, display: 'inline-block', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .2s' } }, '→');
                return el('span', { style: { fontSize: '14px', color: a.iconColor, display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' } }, '▾');
            }

            var isSplit = a.layout === 'split';
            var isTwoCol = a.layout === 'two-column';

            /* --- Accordion items --- */
            var accordionItems = el('div', { className: 'bkbg-faqs-accordion' },
                a.items.map(function (item, idx) {
                    var isOpen = openIdx === idx;
                    return el('div', {
                        key: idx,
                        className: 'bkbg-faqs-item' + (isOpen ? ' bkbg-faqs-item--open' : ''),
                        style: {
                            borderBottom: a.showDividers ? '1px solid ' + a.dividerColor : 'none',
                            borderRadius: a.itemRadius + 'px'
                        }
                    },
                        el('div', {
                            className: 'bkbg-faqs-question-row',
                            style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', cursor: 'pointer', padding: '16px 0' },
                            onClick: function () { setOpenIdx(isOpen ? null : idx); }
                        },
                            el(RichText, {
                                tagName: 'span',
                                value: item.question,
                                className: 'bkbg-faqs-question',
                                style: { color: isOpen ? a.activeAccent : a.questionColor, flex: 1, display: 'block' },
                                onChange: function (v) { updateItem(idx, 'question', v); }
                            }),
                            iconEl(isOpen)
                        ),
                        isOpen && el('div', { className: 'bkbg-faqs-answer', style: { paddingBottom: '16px' } },
                            el(RichText, {
                                tagName: 'p',
                                value: item.answer,
                                className: 'bkbg-faqs-answer-p',
                                style: { color: a.answerColor, margin: 0 },
                                onChange: function (v) { updateItem(idx, 'answer', v); }
                            }),
                            el(Button, { isDestructive: true, isSmall: true, style: { marginTop: '8px', opacity: 0.6 }, onClick: function (e) { e.stopPropagation(); removeItem(idx); } }, '✕ Remove')
                        )
                    );
                }),
                el(Button, { isSecondary: true, isSmall: true, style: { marginTop: '12px' }, onClick: function () { set({ items: a.items.concat([{ question: 'New question', answer: 'Your answer here.' }]) }); } }, '+ Add Question')
            );

            /* --- Section header --- */
            var header = el('div', { className: 'bkbg-faqs-header', style: { textAlign: isSplit ? 'left' : 'center', marginBottom: isSplit ? '0' : '48px' } },
                a.showEyebrow && el('span', { className: 'bkbg-faqs-eyebrow', style: { background: a.eyebrowBg, color: a.eyebrowColor, padding: '4px 14px', borderRadius: '999px', display: 'inline-block', marginBottom: '16px' } },
                    el(RichText, { tagName: 'span', value: a.eyebrow, onChange: function (v) { set({ eyebrow: v }); } })
                ),
                el(RichText, { tagName: 'h2', className: 'bkbg-faqs-heading', value: a.heading, style: { color: a.headingColor, margin: '0 0 16px' }, onChange: function (v) { set({ heading: v }); } }),
                a.showSubtext && el(RichText, { tagName: 'p', className: 'bkbg-faqs-subtext', value: a.subtext, style: { color: a.subtextColor, maxWidth: '560px', margin: isSplit ? '0' : '0 auto' }, onChange: function (v) { set({ subtext: v }); } })
            );

            /* --- CTA row --- */
            var ctaRowEl = a.showCta && el('div', { style: { textAlign: 'center', marginTop: '40px', borderTop: '1px solid ' + a.dividerColor, paddingTop: '24px' } },
                el('span', { className: 'bkbg-faqs-cta-text', style: { color: a.subtextColor, marginRight: '8px' } }, el(RichText, { tagName: 'span', value: a.ctaText, onChange: function (v) { set({ ctaText: v }); } })),
                el('a', { href: '#editor', className: 'bkbg-faqs-cta-link', style: { color: a.ctaLinkColor, textDecoration: 'underline' } }, el(RichText, { tagName: 'span', value: a.ctaLabel, onChange: function (v) { set({ ctaLabel: v }); } }))
            );

            var inner = isSplit
                ? el('div', { style: { display: 'flex', gap: '64px', alignItems: 'flex-start' } }, el('div', { style: { flex: '0 0 320px' } }, header), el('div', { style: { flex: 1 } }, accordionItems, ctaRowEl))
                : el('div', { style: { maxWidth: a.maxWidth + 'px', margin: '0 auto' } }, header, isTwoCol ? el('div', { style: { columns: 2, gap: '24px' } }, accordionItems) : accordionItems, ctaRowEl);

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                    el(SelectControl, { label: __('Layout', 'blockenberg'), value: a.layout, options: [{ label: 'Centered', value: 'centered' }, { label: 'Split (header left)', value: 'split' }, { label: 'Two columns', value: 'two-column' }], onChange: function (v) { set({ layout: v }); }, __nextHasNoMarginBottom: true }),
                    el(SelectControl, { label: __('Icon Style', 'blockenberg'), value: a.iconType, options: [{ label: 'Chevron ▾', value: 'chevron' }, { label: 'Plus +/−', value: 'plus' }, { label: 'Arrow →', value: 'arrow' }], onChange: function (v) { set({ iconType: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Eyebrow', 'blockenberg'), checked: a.showEyebrow, onChange: function (v) { set({ showEyebrow: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Subtext', 'blockenberg'), checked: a.showSubtext, onChange: function (v) { set({ showSubtext: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show Dividers', 'blockenberg'), checked: a.showDividers, onChange: function (v) { set({ showDividers: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Expand First Item', 'blockenberg'), checked: a.expandFirst, onChange: function (v) { set({ expandFirst: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Allow Multiple Open', 'blockenberg'), checked: a.allowMultiple, onChange: function (v) { set({ allowMultiple: v }); }, __nextHasNoMarginBottom: true }),
                    el(ToggleControl, { label: __('Show CTA', 'blockenberg'), checked: a.showCta, onChange: function (v) { set({ showCta: v }); }, __nextHasNoMarginBottom: true }),
                    a.showCta && el(TextControl, { label: __('CTA URL', 'blockenberg'), value: a.ctaUrl, onChange: function (v) { set({ ctaUrl: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Item Border Radius', 'blockenberg'), value: a.itemRadius, min: 0, max: 20, onChange: function (v) { set({ itemRadius: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), value: a.maxWidth, min: 500, max: 1400, onChange: function (v) { set({ maxWidth: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: a.paddingTop, min: 0, max: 160, onChange: function (v) { set({ paddingTop: v }); }, __nextHasNoMarginBottom: true }),
                    el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: a.paddingBottom, min: 0, max: 160, onChange: function (v) { set({ paddingBottom: v }); }, __nextHasNoMarginBottom: true })
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    _tc() && el(_tc(), { label: __('Eyebrow', 'blockenberg'), value: a.typoEyebrow, onChange: function (v) { set({ typoEyebrow: v }); } }),
                    _tc() && el(_tc(), { label: __('Heading', 'blockenberg'), value: a.typoHeading, onChange: function (v) { set({ typoHeading: v }); } }),
                    _tc() && el(_tc(), { label: __('Subtext', 'blockenberg'), value: a.typoSubtext, onChange: function (v) { set({ typoSubtext: v }); } }),
                    _tc() && el(_tc(), { label: __('Question', 'blockenberg'), value: a.typoQuestion, onChange: function (v) { set({ typoQuestion: v }); } }),
                    _tc() && el(_tc(), { label: __('Answer', 'blockenberg'), value: a.typoAnswer, onChange: function (v) { set({ typoAnswer: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: a.bgColor, onChange: function (v) { set({ bgColor: v || '#ffffff' }); } },
                        { label: __('Heading', 'blockenberg'), value: a.headingColor, onChange: function (v) { set({ headingColor: v || '#111827' }); } },
                        { label: __('Eyebrow Text', 'blockenberg'), value: a.eyebrowColor, onChange: function (v) { set({ eyebrowColor: v || '#7c3aed' }); } },
                        { label: __('Eyebrow BG', 'blockenberg'), value: a.eyebrowBg, onChange: function (v) { set({ eyebrowBg: v || '#f3f0ff' }); } },
                        { label: __('Subtext', 'blockenberg'), value: a.subtextColor, onChange: function (v) { set({ subtextColor: v || '#6b7280' }); } },
                        { label: __('Question', 'blockenberg'), value: a.questionColor, onChange: function (v) { set({ questionColor: v || '#111827' }); } },
                        { label: __('Answer', 'blockenberg'), value: a.answerColor, onChange: function (v) { set({ answerColor: v || '#4b5563' }); } },
                        { label: __('Icon', 'blockenberg'), value: a.iconColor, onChange: function (v) { set({ iconColor: v || '#7c3aed' }); } },
                        { label: __('Divider', 'blockenberg'), value: a.dividerColor, onChange: function (v) { set({ dividerColor: v || '#e5e7eb' }); } },
                        { label: __('Active Accent', 'blockenberg'), value: a.activeAccent, onChange: function (v) { set({ activeAccent: v || '#7c3aed' }); } },
                        { label: __('CTA Link', 'blockenberg'), value: a.ctaLinkColor, onChange: function (v) { set({ ctaLinkColor: v || '#7c3aed' }); } }
                    ]
                })
            );

            return el('div', blockProps,
                controls,
                el('div', { style: { background: a.bgColor, paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px' } }, inner)
            );
        },

        save: function (props) {
            return el('div', wp.blockEditor.useBlockProps.save(),
                el('div', { className: 'bkbg-faqs-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );

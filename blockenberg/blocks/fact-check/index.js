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
    var Button = wp.components.Button;

    var _fckTC, _fckTV;
    function _tc() { return _fckTC || (_fckTC = window.bkbgTypographyControl); }
    function _tv(t, p) { return (_fckTV || (_fckTV = window.bkbgTypoCssVars)) ? _fckTV(t, p) : {}; }

    var VERDICTS = [
        { value: 'true',          label: '✅ True',          icon: '✅', color: '#15803d', bg: '#f0fdf4', border: '#86efac' },
        { value: 'mostly-true',   label: '🟢 Mostly True',   icon: '🟢', color: '#166534', bg: '#dcfce7', border: '#4ade80' },
        { value: 'mixed',         label: '🟡 Mixed',          icon: '🟡', color: '#92400e', bg: '#fffbeb', border: '#fcd34d' },
        { value: 'mostly-false',  label: '🟠 Mostly False',  icon: '🟠', color: '#9a3412', bg: '#fff7ed', border: '#fdba74' },
        { value: 'false',         label: '❌ False',          icon: '❌', color: '#991b1b', bg: '#fef2f2', border: '#fca5a5' },
        { value: 'unverified',    label: '❓ Unverified',     icon: '❓', color: '#1e3a5f', bg: '#eff6ff', border: '#93c5fd' },
        { value: 'misleading',    label: '⚠️ Misleading',    icon: '⚠️', color: '#713f12', bg: '#fefce8', border: '#fde047' },
        { value: 'satire',        label: '🎭 Satire',         icon: '🎭', color: '#4c1d95', bg: '#f5f3ff', border: '#c4b5fd' }
    ];

    var RATING_SCALE = ['true', 'mostly-true', 'mixed', 'mostly-false', 'false'];

    function getVerdict(val) {
        return VERDICTS.find(function (v) { return v.value === val; }) || VERDICTS[3];
    }

    registerBlockType('blockenberg/fact-check', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;
            var verdict = getVerdict(attr.verdict);

            var blockProps = useBlockProps({ className: 'bkbg-fck-outer', style: Object.assign(
                { padding: attr.paddingTop + 'px 0 ' + attr.paddingBottom + 'px' },
                _tv(attr.typoClaim || {}, '--bkbg-fck-cl-'),
                _tv(attr.typoExplanation || {}, '--bkbg-fck-ex-')
            ) });

            function updateSource(idx, key, val) {
                var arr = (attr.sources || []).map(function (s, i) {
                    if (i !== idx) return s;
                    var c = Object.assign({}, s); c[key] = val; return c;
                });
                set({ sources: arr });
            }

            var wrapStyle = {
                background: attr.bgColor,
                border: '1px solid ' + attr.borderColor,
                borderRadius: attr.borderRadius + 'px',
                overflow: 'hidden',
                boxShadow: '0 1px 6px rgba(0,0,0,.06)'
            };

            /* Verdict banner */
            var verdictBanner = el('div', { style: { background: verdict.bg, borderBottom: '1px solid ' + verdict.border, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' } },
                el('span', { style: { fontSize: '32px', lineHeight: 1, flexShrink: 0 } }, verdict.icon),
                el('div', {},
                    el('div', { style: { fontSize: '11px', fontWeight: 600, color: attr.labelColor, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' } }, __('Verdict', 'blockenberg')),
                    el('div', { style: { fontSize: '20px', fontWeight: 800, color: verdict.color } }, verdict.label.replace(/^[^\s]+\s/, ''))
                )
            );

            /* Rating scale */
            var ratingScale = attr.showRatingScale && el('div', { style: { display: 'flex', gap: '4px', padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid ' + attr.borderColor } },
                RATING_SCALE.map(function (v) {
                    var vd = getVerdict(v);
                    var isActive = attr.verdict === v || (attr.verdict === 'misleading' && v === 'mostly-false') || (attr.verdict === 'unverified' && v === 'mixed') || (attr.verdict === 'satire' && v === 'true');
                    var isExact = attr.verdict === v;
                    return el('div', { key: v, title: vd.label, style: { flex: 1, height: '8px', borderRadius: '4px', background: isExact ? vd.color : (isActive ? vd.border : '#e2e8f0'), transition: 'background .2s', cursor: 'default' } });
                })
            );

            /* Claim */
            var claimEl = el('div', { style: { background: attr.claimBg, borderBottom: '1px solid ' + attr.borderColor, padding: '14px 20px' } },
                el('div', { style: { fontSize: '11px', fontWeight: 600, color: attr.labelColor, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' } }, __('Claim', 'blockenberg')),
                el(RichText, { tagName: 'p', className: 'bkbg-fck-claim-text', value: attr.claim, allowedFormats: ['core/bold', 'core/italic'], placeholder: __('Enter the claim being fact-checked…', 'blockenberg'), style: { color: attr.claimColor, margin: 0 }, onChange: function (v) { set({ claim: v }); } })
            );

            /* Explanation */
            var explanationEl = el('div', { style: { padding: '16px 20px', borderBottom: (attr.showSources && (attr.sources || []).length) ? '1px solid ' + attr.borderColor : 'none' } },
                el('div', { style: { fontSize: '11px', fontWeight: 600, color: attr.labelColor, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' } }, __('Our Analysis', 'blockenberg')),
                el(RichText, { tagName: 'div', className: 'bkbg-fck-explanation-body', value: attr.explanation, allowedFormats: ['core/bold', 'core/italic', 'core/link'], placeholder: __('Write your fact-check analysis and explanation here…', 'blockenberg'), style: { color: attr.explanationColor }, onChange: function (v) { set({ explanation: v }); } })
            );

            /* Sources */
            var sourcesEl = attr.showSources && (attr.sources || []).length > 0 && el('div', { style: { padding: '14px 20px', background: '#fafafa' } },
                el('div', { style: { fontSize: '11px', fontWeight: 600, color: attr.labelColor, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' } }, __('Sources', 'blockenberg')),
                el('ol', { style: { margin: 0, paddingLeft: '18px' } },
                    (attr.sources || []).map(function (s, i) {
                        return el('li', { key: i, style: { marginBottom: '4px', fontSize: '13px' } },
                            s.url
                                ? el('a', { href: '#', style: { color: attr.sourceLinkColor } }, s.title)
                                : el('span', { style: { color: attr.sourceTitleColor } }, s.title)
                        );
                    })
                )
            );

            /* Reviewer */
            var reviewerEl = attr.showReviewer && (attr.reviewerName || attr.reviewDate) && el('div', { style: { padding: '10px 20px', borderTop: '1px solid ' + attr.borderColor, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', fontSize: '12px', color: attr.reviewerColor } },
                el('span', {}, attr.reviewerName && (attr.reviewerTitle ? attr.reviewerName + ' · ' + attr.reviewerTitle : attr.reviewerName)),
                attr.reviewDate && el('span', {}, '📅 ' + attr.reviewDate)
            );

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Verdict', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Verdict', 'blockenberg'), value: attr.verdict, __nextHasNoMarginBottom: true,
                        options: VERDICTS.map(function (v) { return { label: v.label, value: v.value }; }),
                        onChange: function (v) { set({ verdict: v }); }
                    }),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Rating Scale Bar', 'blockenberg'), checked: attr.showRatingScale, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showRatingScale: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Sources', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Sources', 'blockenberg'), checked: attr.showSources, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showSources: v }); } }),
                    attr.showSources && el('div', { style: { marginTop: '10px' } },
                        (attr.sources || []).map(function (s, idx) {
                            return el('div', { key: idx, style: { marginBottom: '10px', padding: '8px', background: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' } },
                                el(TextControl, { label: __('Source Title', 'blockenberg'), value: s.title, __nextHasNoMarginBottom: true, onChange: function (v) { updateSource(idx, 'title', v); } }),
                                el('div', { style: { marginTop: '4px' } },
                                    el(TextControl, { label: __('URL', 'blockenberg'), value: s.url, placeholder: 'https://...', __nextHasNoMarginBottom: true, onChange: function (v) { updateSource(idx, 'url', v); } })
                                ),
                                el(Button, { variant: 'link', isDestructive: true, style: { marginTop: '4px', fontSize: '11px' }, onClick: function () { set({ sources: (attr.sources || []).filter(function (_, i) { return i !== idx; }) }); } }, __('Remove', 'blockenberg'))
                            );
                        }),
                        el(Button, { variant: 'secondary', style: { marginTop: '4px' }, onClick: function () { set({ sources: (attr.sources || []).concat([{ title: '', url: '' }]) }); } }, __('+ Add Source', 'blockenberg')),
                        el('div', { style: { marginTop: '8px' } },
                            el(ToggleControl, { label: __('Open Links in New Tab', 'blockenberg'), checked: attr.openInNewTab, __nextHasNoMarginBottom: true, onChange: function (v) { set({ openInNewTab: v }); } })
                        )
                    )
                ),
                el(PanelBody, { title: __('Reviewer', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Reviewer', 'blockenberg'), checked: attr.showReviewer, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showReviewer: v }); } }),
                    attr.showReviewer && el('div', { style: { marginTop: '8px' } },
                        el(TextControl, { label: __('Reviewer Name', 'blockenberg'), value: attr.reviewerName, __nextHasNoMarginBottom: true, onChange: function (v) { set({ reviewerName: v }); } }),
                        el('div', { style: { marginTop: '6px' } },
                            el(TextControl, { label: __('Reviewer Title', 'blockenberg'), value: attr.reviewerTitle, __nextHasNoMarginBottom: true, onChange: function (v) { set({ reviewerTitle: v }); } })
                        ),
                        el('div', { style: { marginTop: '6px' } },
                            el(TextControl, { label: __('Review Date', 'blockenberg'), value: attr.reviewDate, placeholder: 'e.g. February 24, 2026', __nextHasNoMarginBottom: true, onChange: function (v) { set({ reviewDate: v }); } })
                        )
                    )
                ),
                el(PanelBody, { title: __('Style', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Border Radius', 'blockenberg'), value: attr.borderRadius, min: 0, max: 20, __nextHasNoMarginBottom: true, onChange: function (v) { set({ borderRadius: v }); } }),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: attr.paddingTop, min: 0, max: 120, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingTop: v }); } })
                    ),
                    el('div', { style: { marginTop: '12px' } },
                        el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 120, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingBottom: v }); } })
                    )
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    _tc() && el(_tc(), { label: 'Claim', typo: attr.typoClaim || {}, onChange: function (v) { set({ typoClaim: v }); } }),
                    _tc() && el(_tc(), { label: 'Analysis', typo: attr.typoExplanation || {}, onChange: function (v) { set({ typoExplanation: v }); } })
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Card Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { set({ bgColor: v || '#ffffff' }); } },
                        { label: __('Border', 'blockenberg'), value: attr.borderColor, onChange: function (v) { set({ borderColor: v || '#e2e8f0' }); } },
                        { label: __('Claim Background', 'blockenberg'), value: attr.claimBg, onChange: function (v) { set({ claimBg: v || '#f8fafc' }); } },
                        { label: __('Claim Text', 'blockenberg'), value: attr.claimColor, onChange: function (v) { set({ claimColor: v || '#1e293b' }); } },
                        { label: __('Label Text', 'blockenberg'), value: attr.labelColor, onChange: function (v) { set({ labelColor: v || '#64748b' }); } },
                        { label: __('Analysis Text', 'blockenberg'), value: attr.explanationColor, onChange: function (v) { set({ explanationColor: v || '#374151' }); } },
                        { label: __('Source Link', 'blockenberg'), value: attr.sourceLinkColor, onChange: function (v) { set({ sourceLinkColor: v || '#3b82f6' }); } },
                        { label: __('Source Title', 'blockenberg'), value: attr.sourceTitleColor, onChange: function (v) { set({ sourceTitleColor: v || '#374151' }); } },
                        { label: __('Reviewer Text', 'blockenberg'), value: attr.reviewerColor, onChange: function (v) { set({ reviewerColor: v || '#6b7280' }); } }
                    ]
                })
            );

            return el('div', blockProps,
                controls,
                el('div', { style: wrapStyle },
                    verdictBanner,
                    ratingScale,
                    claimEl,
                    explanationEl,
                    sourcesEl,
                    reviewerEl
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-fck-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );

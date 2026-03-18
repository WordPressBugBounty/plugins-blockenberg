( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __ = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var ToggleControl = wp.components.ToggleControl;
    var SelectControl = wp.components.SelectControl;

    var _tc, _tvf;
    Object.defineProperty(window, '_bkbgTypoCtrlCache', { get: function () { if (!_tc) { _tc = window.bkbgTypographyControl; } return _tc; } });
    Object.defineProperty(window, '_bkbgTypoVarsCache', { get: function () { if (!_tvf) { _tvf = window.bkbgTypoCssVars; } return _tvf; } });
    function getTypoControl(props, attrName, label) { return window._bkbgTypoCtrlCache(props, attrName, label); }

    var CATEGORIES = [
        { label: 'Mixed (all)', value: 'mixed' },
        { label: 'Science & Nature', value: 'science' },
        { label: 'History', value: 'history' },
        { label: 'Geography', value: 'geography' },
        { label: 'Pop Culture & Entertainment', value: 'popculture' },
        { label: 'Sports', value: 'sports' },
        { label: 'Technology', value: 'technology' }
    ];

    var DEMO_Q = 'How many bones are in the adult human body?';
    var DEMO_A = ['206', '187', '215', '232'];

    function EditorPreview(props) {
        var a = props.attributes;
        var setAttributes = props.setAttributes;
        var blockProps = (function () {
                var s = { background: a.sectionBg || '#f0f4ff', padding: '28px 20px' };
                Object.assign(s, window._bkbgTypoVarsCache(a.titleTypo, '--bktrv-tt-'), window._bkbgTypoVarsCache(a.subtitleTypo, '--bktrv-st-'));
                return useBlockProps({ style: s });
            })();

        return el(Fragment, null,
            el(InspectorControls, null,
                el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: true },
                    ),
                el(PanelBody, { title: __('Game Settings', 'blockenberg'), initialOpen: false },
                    el(SelectControl, { label: __('Category', 'blockenberg'), value: a.category, options: CATEGORIES,
                        onChange: function (v) { setAttributes({ category: v }); } }),
                    el(SelectControl, { label: __('Difficulty', 'blockenberg'), value: a.difficulty,
                        options: [{ label: 'Mixed', value: 'mixed' }, { label: 'Easy', value: 'easy' }, { label: 'Medium', value: 'medium' }, { label: 'Hard', value: 'hard' }],
                        onChange: function (v) { setAttributes({ difficulty: v }); } }),
                    el(RangeControl, { label: __('Questions per Round', 'blockenberg'), value: a.questionsPerRound, min: 3, max: 30,
                        onChange: function (v) { setAttributes({ questionsPerRound: v }); } }),
                    el(RangeControl, { label: __('Seconds per Question', 'blockenberg'), value: a.timePerQuestion, min: 5, max: 60,
                        onChange: function (v) { setAttributes({ timePerQuestion: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Timer', 'blockenberg'), checked: a.showTimer, onChange: function (v) { setAttributes({ showTimer: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Progress Bar', 'blockenberg'), checked: a.showProgress, onChange: function (v) { setAttributes({ showProgress: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Answer Explanation', 'blockenberg'), checked: a.showExplanation, onChange: function (v) { setAttributes({ showExplanation: v }); } })
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    getTypoControl(props, 'titleTypo', __('Title', 'blockenberg')),
                    getTypoControl(props, 'subtitleTypo', __('Subtitle', 'blockenberg'))
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Accent', 'blockenberg'), value: a.accentColor, onChange: function (v) { setAttributes({ accentColor: v || '#6366f1' }); } },
                        { label: __('Correct Answer', 'blockenberg'), value: a.correctColor, onChange: function (v) { setAttributes({ correctColor: v || '#22c55e' }); } },
                        { label: __('Wrong Answer', 'blockenberg'), value: a.wrongColor, onChange: function (v) { setAttributes({ wrongColor: v || '#ef4444' }); } },
                        { label: __('Card Background', 'blockenberg'), value: a.cardBg, onChange: function (v) { setAttributes({ cardBg: v || '#ffffff' }); } },
                        { label: __('Section Background', 'blockenberg'), value: a.sectionBg, onChange: function (v) { setAttributes({ sectionBg: v || '#f0f4ff' }); } },
                        { label: __('Title Color', 'blockenberg'), value: a.titleColor, onChange: function (v) { setAttributes({ titleColor: v || '#1e1b4b' }); } }
                    ]
                })
            ),
            el('div', blockProps,
                el(RichText, { tagName: 'h3', className: 'bkbg-trv-title', value: a.title,
                    onChange: function (v) { setAttributes({ title: v }); },
                    placeholder: 'Trivia Challenge',
                    style: { color: a.titleColor, textAlign: 'center', margin: '0 0 4px' } }),
                el(RichText, { tagName: 'p', className: 'bkbg-trv-subtitle', value: a.subtitle,
                    onChange: function (v) { setAttributes({ subtitle: v }); },
                    placeholder: 'Test your knowledge!',
                    style: { color: a.titleColor, opacity: 0.65, textAlign: 'center', margin: '0 0 18px' } }),

                // Question card preview
                el('div', { style: { maxWidth: 640, margin: '0 auto' } },
                    // Progress bar
                    a.showProgress && el('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 } },
                        el('div', { style: { flex: 1, height: 8, background: '#e5e7eb', borderRadius: 99 } },
                            el('div', { style: { width: '30%', height: '100%', background: a.accentColor, borderRadius: 99, transition: 'width 0.4s' } })
                        ),
                        el('span', { style: { fontSize: 13, fontWeight: 600, color: a.titleColor, opacity: 0.6 } }, '3 / ' + a.questionsPerRound)
                    ),
                    // Timer
                    a.showTimer && el('div', { style: { display: 'flex', justifyContent: 'center', marginBottom: 12 } },
                        el('div', { style: { display: 'flex', alignItems: 'center', gap: 6, background: a.accentColor + '18', borderRadius: 99, padding: '4px 14px' } },
                            el('div', { style: { width: 8, height: 8, borderRadius: '50%', background: a.accentColor, animation: 'none' } }),
                            el('span', { style: { fontWeight: 700, fontSize: 15, color: a.accentColor } }, a.timePerQuestion + 's')
                        )
                    ),
                    // Question card
                    el('div', { style: { background: a.cardBg, borderRadius: 14, boxShadow: '0 2px 20px rgba(0,0,0,0.08)', padding: '24px 20px', marginBottom: 14 } },
                        el('div', { style: { fontSize: 13, color: a.accentColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 } }, 'Science & Nature'),
                        el('div', { style: { fontSize: 19, fontWeight: 700, color: a.titleColor, lineHeight: 1.4, marginBottom: 18 } }, DEMO_Q),
                        el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 } },
                            DEMO_A.map(function (ans, i) {
                                return el('button', {
                                    key: i,
                                    style: {
                                        border: '2px solid ' + a.accentColor + '44',
                                        borderRadius: 10, padding: '12px 14px',
                                        background: 'transparent', cursor: 'pointer',
                                        fontSize: 15, fontWeight: 600, color: a.titleColor,
                                        textAlign: 'left', transition: 'all 0.15s'
                                    }
                                }, ans);
                            })
                        )
                    )
                )
            )
        );
    }

    registerBlockType('blockenberg/trivia-game', {
        edit: EditorPreview,
        save: function (props) {
            var a = props.attributes;
            var bp = (function () {
                var tv = Object.assign({}, window._bkbgTypoVarsCache(a.titleTypo, '--bktrv-tt-'), window._bkbgTypoVarsCache(a.subtitleTypo, '--bktrv-st-'));
                var parts = []; Object.keys(tv).forEach(function (k) { parts.push(k + ':' + tv[k]); });
                return useBlockProps.save(parts.length ? { style: parts.join(';') } : {});
            })();
            return el('div', bp,
                el('div', { className: 'bkbg-trv-app', 'data-opts': JSON.stringify(a) },
                    el(RichText.Content, { tagName: 'h3', className: 'bkbg-trv-title', value: a.title }),
                    el(RichText.Content, { tagName: 'p', className: 'bkbg-trv-subtitle', value: a.subtitle })
                )
            );
        }
    });
}() );

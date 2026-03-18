( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var ToggleControl = wp.components.ToggleControl;
    var TextControl = wp.components.TextControl;
    var SelectControl = wp.components.SelectControl;
    var Button = wp.components.Button;
    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var LAYOUT_OPTIONS = [
        { label: __('Horizontal (score left, bars right)', 'blockenberg'), value: 'horizontal' },
        { label: __('Vertical (score top, bars below)',   'blockenberg'), value: 'vertical' },
        { label: __('Compact (inline)',                   'blockenberg'), value: 'compact' },
    ];
    var BAR_STYLE_OPTIONS = [
        { label: __('Rounded', 'blockenberg'), value: 'rounded' },
        { label: __('Flat',    'blockenberg'), value: 'flat' },
    ];
    var PLATFORM_OPTIONS = [
        { label: 'Google',   value: 'Google' },
        { label: 'G2',       value: 'G2' },
        { label: 'Capterra', value: 'Capterra' },
        { label: 'Trustpilot', value: 'Trustpilot' },
        { label: 'Yelp',    value: 'Yelp' },
        { label: 'Amazon',  value: 'Amazon' },
    ];

    /* ── Star renderer ─────────────────────────────────────── */
    function renderStars(score, max, size, color) {
        return el('div', { style: { display: 'flex', gap: '2px', alignItems: 'center' } },
            Array.from({ length: max }).map(function (_, i) {
                var fill = i < Math.floor(score) ? color : (i < score ? color : 'none');
                var opacity = i < Math.floor(score) ? 1 : (i < score ? 0.5 : 1);
                return el('svg', { key: i, width: size, height: size, viewBox: '0 0 24 24', fill: fill, stroke: color, strokeWidth: 1.5, strokeLinejoin: 'round', style: { opacity: opacity } },
                    el('path', { d: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' })
                );
            })
        );
    }

    /* ── Score color helper (green/yellow/red) ─────────────── */
    function scorePhrase(score, max) {
        var pct = score / max;
        if (pct >= 0.9) return 'Excellent';
        if (pct >= 0.75) return 'Very Good';
        if (pct >= 0.6) return 'Good';
        if (pct >= 0.4) return 'Fair';
        return 'Poor';
    }

    /* ── Bar renderer ──────────────────────────────────────── */
    function BreakdownBars(props) {
        var a = props.a;
        var breakdowns = a.breakdowns;
        var totalCount = breakdowns.reduce(function (s, r) { return s + (r.count || 0); }, 0) || 1;
        var barRadius = a.barStyle === 'rounded' ? a.barRadius + 'px' : '0';

        return el('div', { className: 'bkbg-rs-bars', style: { flex: 1, display: 'flex', flexDirection: 'column', gap: a.gap + 'px' } },
            breakdowns.map(function (row, i) {
                var pct = Math.round((row.count / totalCount) * 100);
                return el('div', { key: i, className: 'bkbg-rs-row', style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                    el('span', { className: 'bkbg-rs-bar-label', style: { color: a.labelColor, whiteSpace: 'nowrap', minWidth: '36px', textAlign: 'right' } }, row.stars + ' ★'),
                    el('div', { style: { flex: 1, height: a.barHeight + 'px', background: a.barTrackColor, borderRadius: barRadius, overflow: 'hidden' } },
                        el('div', { className: 'bkbg-rs-fill', style: { height: '100%', width: pct + '%', background: a.barColor, borderRadius: barRadius, transition: 'width 0.8s ease' } })
                    ),
                    el('span', { className: 'bkbg-rs-bar-count', style: { color: a.countColor, minWidth: '36px', fontVariantNumeric: 'tabular-nums' } }, pct + '%')
                );
            })
        );
    }

    /* ── Score block ────────────────────────────────────────── */
    function ScoreBlock(props) {
        var a = props.a;
        return el('div', { className: 'bkbg-rs-score', style: { display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, gap: '6px', minWidth: '100px' } },
            a.showOverallScore && el('span', { className: 'bkbg-rs-score-value', style: { color: a.scoreColor } }, a.overallScore.toFixed(1)),
            a.showStars && renderStars(a.overallScore, a.maxScore, a.starSize, a.starColor),
            el('span', { className: 'bkbg-rs-label', style: { color: a.labelColor } }, scorePhrase(a.overallScore, a.maxScore)),
            a.showTotalReviews && el('span', { className: 'bkbg-rs-total', style: { color: a.countColor } }, a.totalReviews.toLocaleString() + ' ' + a.totalReviewsLabel),
            a.showPlatformBadge && el('span', { className: 'bkbg-rs-platform', style: { fontWeight: 700, background: '#f3f4f6', borderRadius: '6px', padding: '2px 10px', marginTop: '4px', color: '#374151' } }, a.platformName)
        );
    }

    /* ── Full preview ─────────────────────────────────────── */
    function Preview(props) {
        var a = props.a;
        var isHoriz = a.layout === 'horizontal';
        return el('div', { className: 'bkbg-rating-summary bkbg-rs--' + a.layout, style: { display: 'flex', flexDirection: isHoriz ? 'row' : 'column', alignItems: isHoriz ? 'center' : 'flex-start', gap: '24px' } },
            el(ScoreBlock, { a: a }),
            el(BreakdownBars, { a: a })
        );
    }

    registerBlockType('blockenberg/rating-summary', {
        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;
            var TC = getTypoControl();
            var blockProps = useBlockProps((function() {
                var _tvFn = getTypoCssVars();
                var s = { paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px', backgroundColor: a.bgColor || undefined };
                if (_tvFn) {
                    Object.assign(s, _tvFn(a.scoreTypo || {}, '--bkrs-sc-'));
                    Object.assign(s, _tvFn(a.labelTypo || {}, '--bkrs-lb-'));
                }
                return { style: s };
            })());

            function setBreakdown(index, key, val) {
                var updated = a.breakdowns.map(function (b, i) { return i === index ? Object.assign({}, b, { [key]: val }) : b; });
                setAttributes({ breakdowns: updated });
            }

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Rating Settings', 'blockenberg'), initialOpen: true },
                        el('p', { style: { margin: '0 0 8px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#757575' } }, __('Overall Score', 'blockenberg')),
                        el(RangeControl, { label: __('Score', 'blockenberg'), value: a.overallScore, min: 0, max: a.maxScore, step: 0.1, onChange: function (v) { setAttributes({ overallScore: v }); } }),
                        el(RangeControl, { label: __('Max score', 'blockenberg'), value: a.maxScore, min: 3, max: 10, onChange: function (v) { setAttributes({ maxScore: v }); } }),
                        el(RangeControl, { label: __('Total reviews', 'blockenberg'), value: a.totalReviews, min: 0, max: 100000, step: 1, onChange: function (v) { setAttributes({ totalReviews: v }); } }),
                        el(TextControl, { label: __('Reviews label', 'blockenberg'), value: a.totalReviewsLabel, onChange: function (v) { setAttributes({ totalReviewsLabel: v }); } }),
                        el(ToggleControl, { label: __('Show overall score number', 'blockenberg'), checked: a.showOverallScore, onChange: function (v) { setAttributes({ showOverallScore: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show stars', 'blockenberg'), checked: a.showStars, onChange: function (v) { setAttributes({ showStars: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show total reviews', 'blockenberg'), checked: a.showTotalReviews, onChange: function (v) { setAttributes({ showTotalReviews: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show platform badge', 'blockenberg'), checked: a.showPlatformBadge, onChange: function (v) { setAttributes({ showPlatformBadge: v }); }, __nextHasNoMarginBottom: true }),
                        a.showPlatformBadge && el(SelectControl, { label: __('Platform', 'blockenberg'), value: a.platformName, options: PLATFORM_OPTIONS, onChange: function (v) { setAttributes({ platformName: v }); } })
                    ),
                    el(PanelBody, { title: __('Star Breakdown', 'blockenberg'), initialOpen: false },
                        a.breakdowns.map(function (b, i) {
                            return el('div', { key: i, style: { marginBottom: '12px', padding: '10px', background: '#f9fafb', borderRadius: '8px' } },
                                el('p', { style: { margin: '0 0 6px', fontWeight: 600, fontSize: '12px' } }, b.stars + ' ★'),
                                el(RangeControl, { label: __('Count', 'blockenberg'), value: b.count, min: 0, max: 9999, onChange: function (v) { setBreakdown(i, 'count', v); } })
                            );
                        })
                    ),
                    el(PanelBody, { title: __('Layout & Style', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Layout', 'blockenberg'), value: a.layout, options: LAYOUT_OPTIONS, onChange: function (v) { setAttributes({ layout: v }); } }),
                        el(SelectControl, { label: __('Bar style', 'blockenberg'), value: a.barStyle, options: BAR_STYLE_OPTIONS, onChange: function (v) { setAttributes({ barStyle: v }); } }),
                        el(RangeControl, { label: __('Bar height (px)', 'blockenberg'), value: a.barHeight, min: 4, max: 24, onChange: function (v) { setAttributes({ barHeight: v }); } }),
                        el(RangeControl, { label: __('Bar radius (px)', 'blockenberg'), value: a.barRadius, min: 0, max: 99, onChange: function (v) { setAttributes({ barRadius: v }); } }),
                        el(RangeControl, { label: __('Row gap (px)', 'blockenberg'), value: a.gap, min: 2, max: 24, onChange: function (v) { setAttributes({ gap: v }); } })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        TC && el(TC, { label: __('Score', 'blockenberg'), value: a.scoreTypo || {}, onChange: function(v) { setAttributes({ scoreTypo: v }); } }),
                        TC && el(TC, { label: __('Labels', 'blockenberg'), value: a.labelTypo || {}, onChange: function(v) { setAttributes({ labelTypo: v }); } }),
                        el(RangeControl, { label: __('Star size (px)', 'blockenberg'), value: a.starSize, min: 12, max: 40, onChange: function (v) { setAttributes({ starSize: v }); } })
                    ),
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: a.barColor,     onChange: function (v) { setAttributes({ barColor: v || '' }); },     label: __('Bar fill', 'blockenberg') },
                            { value: a.barTrackColor,onChange: function (v) { setAttributes({ barTrackColor: v || '' }); },label: __('Bar track', 'blockenberg') },
                            { value: a.starColor,    onChange: function (v) { setAttributes({ starColor: v || '' }); },    label: __('Stars', 'blockenberg') },
                            { value: a.scoreColor,   onChange: function (v) { setAttributes({ scoreColor: v || '' }); },   label: __('Score number', 'blockenberg') },
                            { value: a.labelColor,   onChange: function (v) { setAttributes({ labelColor: v || '' }); },   label: __('Labels', 'blockenberg') },
                            { value: a.countColor,   onChange: function (v) { setAttributes({ countColor: v || '' }); },   label: __('Counts / %', 'blockenberg') },
                            { value: a.bgColor,      onChange: function (v) { setAttributes({ bgColor: v || '' }); },      label: __('Section background', 'blockenberg') },
                        ]
                    }),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top (px)', 'blockenberg'),    value: a.paddingTop,    min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    )
                ),

                el('div', blockProps, el(Preview, { a: a }))
            );
        },

        save: function (props) {
            var a = props.attributes;
            var _tvFn = window.bkbgTypoCssVars;
            var saveStyle = { paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px', backgroundColor: a.bgColor || undefined };
            if (_tvFn) {
                Object.assign(saveStyle, _tvFn(a.scoreTypo || {}, '--bkrs-sc-'));
                Object.assign(saveStyle, _tvFn(a.labelTypo || {}, '--bkrs-lb-'));
            }
            var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkbg-rating-summary-wrap', style: saveStyle });
            var isHoriz = a.layout === 'horizontal';
            var totalCount = a.breakdowns.reduce(function (s, r) { return s + (r.count || 0); }, 0) || 1;
            var barRadius = a.barStyle === 'rounded' ? a.barRadius + 'px' : '0';

            function starsSVG(score, max, size, color) {
                return el('div', { style: { display: 'flex', gap: '2px', alignItems: 'center' } },
                    Array.from({ length: max }).map(function (_, i) {
                        var fill = i < Math.floor(score) ? color : (i < score ? color : 'none');
                        var opacity = i < Math.floor(score) ? 1 : (i < score ? 0.5 : 1);
                        return el('svg', { key: i, width: size, height: size, viewBox: '0 0 24 24', fill: fill, stroke: color, strokeWidth: 1.5, strokeLinejoin: 'round', 'aria-hidden': 'true', style: { opacity: opacity } },
                            el('path', { d: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' })
                        );
                    })
                );
            }

            return el('div', blockProps,
                el('div', { className: 'bkbg-rating-summary bkbg-rs--' + a.layout, style: { display: 'flex', flexDirection: isHoriz ? 'row' : 'column', alignItems: isHoriz ? 'center' : 'flex-start', gap: '24px' } },
                    el('div', { className: 'bkbg-rs-score', style: { display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, gap: '6px', minWidth: '100px' } },
                        a.showOverallScore && el('span', { className: 'bkbg-rs-score-value', style: { color: a.scoreColor } }, a.overallScore.toFixed(1)),
                        a.showStars && starsSVG(a.overallScore, a.maxScore, a.starSize, a.starColor),
                        el('span', { className: 'bkbg-rs-label', style: { color: a.labelColor } }, scorePhrase(a.overallScore, a.maxScore)),
                        a.showTotalReviews && el('span', { className: 'bkbg-rs-total', style: { color: a.countColor } }, a.totalReviews.toLocaleString() + ' ' + a.totalReviewsLabel),
                        a.showPlatformBadge && el('span', { className: 'bkbg-rs-platform', style: { fontWeight: 700, background: '#f3f4f6', borderRadius: '6px', padding: '2px 10px', marginTop: '4px', color: '#374151' } }, a.platformName)
                    ),
                    el('div', { className: 'bkbg-rs-bars', style: { flex: 1, display: 'flex', flexDirection: 'column', gap: a.gap + 'px' } },
                        a.breakdowns.map(function (row, i) {
                            var pct = Math.round((row.count / totalCount) * 100);
                            return el('div', { key: i, className: 'bkbg-rs-row', style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                                el('span', { className: 'bkbg-rs-bar-label', style: { color: a.labelColor, whiteSpace: 'nowrap', minWidth: '36px', textAlign: 'right' } }, row.stars + ' ★'),
                                el('div', { style: { flex: 1, height: a.barHeight + 'px', background: a.barTrackColor, borderRadius: barRadius, overflow: 'hidden' } },
                                    el('div', { className: 'bkbg-rs-fill', 'data-pct': pct, style: { height: '100%', width: pct + '%', background: a.barColor, borderRadius: barRadius } })
                                ),
                                el('span', { className: 'bkbg-rs-bar-count', style: { color: a.countColor, minWidth: '36px', fontVariantNumeric: 'tabular-nums' } }, pct + '%')
                            );
                        })
                    )
                )
            );
        },

        deprecated: [{
            attributes: {
                "overallScore":{"type":"number","default":4.3},
                "maxScore":{"type":"number","default":5},
                "totalReviews":{"type":"number","default":124},
                "showTotalReviews":{"type":"boolean","default":true},
                "totalReviewsLabel":{"type":"string","default":"reviews"},
                "showOverallScore":{"type":"boolean","default":true},
                "showStars":{"type":"boolean","default":true},
                "showPlatformBadge":{"type":"boolean","default":false},
                "platformName":{"type":"string","default":"Google"},
                "breakdowns":{"type":"array","default":[{"stars":5,"count":89},{"stars":4,"count":22},{"stars":3,"count":8},{"stars":2,"count":3},{"stars":1,"count":2}]},
                "layout":{"type":"string","default":"horizontal"},
                "barStyle":{"type":"string","default":"rounded"},
                "textAlign":{"type":"string","default":"left"},
                "starSize":{"type":"number","default":20},
                "scoreSize":{"type":"number","default":52},
                "labelSize":{"type":"number","default":13},
                "barHeight":{"type":"number","default":8},
                "barRadius":{"type":"number","default":99},
                "gap":{"type":"number","default":6},
                "barColor":{"type":"string","default":"#f59e0b"},
                "barTrackColor":{"type":"string","default":"#e5e7eb"},
                "starColor":{"type":"string","default":"#f59e0b"},
                "scoreColor":{"type":"string","default":"#1e293b"},
                "labelColor":{"type":"string","default":"#6b7280"},
                "countColor":{"type":"string","default":"#6b7280"},
                "bgColor":{"type":"string","default":""},
                "paddingTop":{"type":"number","default":40},
                "paddingBottom":{"type":"number","default":40}
            },
            save: function (props) {
                var a = props.attributes;
                var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkbg-rating-summary-wrap' });
                var isHoriz = a.layout === 'horizontal';
                var totalCount = a.breakdowns.reduce(function (s, r) { return s + (r.count || 0); }, 0) || 1;
                var barRadius = a.barStyle === 'rounded' ? a.barRadius + 'px' : '0';

                function starsSVG(score, max, size, color) {
                    return el('div', { style: { display: 'flex', gap: '2px', alignItems: 'center' } },
                        Array.from({ length: max }).map(function (_, i) {
                            var fill = i < Math.floor(score) ? color : (i < score ? color : 'none');
                            var opacity = i < Math.floor(score) ? 1 : (i < score ? 0.5 : 1);
                            return el('svg', { key: i, width: size, height: size, viewBox: '0 0 24 24', fill: fill, stroke: color, strokeWidth: 1.5, strokeLinejoin: 'round', 'aria-hidden': 'true', style: { opacity: opacity } },
                                el('path', { d: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' })
                            );
                        })
                    );
                }

                return el('div', Object.assign({}, blockProps, { style: { paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px', backgroundColor: a.bgColor || undefined } }),
                    el('div', { className: 'bkbg-rating-summary bkbg-rs--' + a.layout, style: { display: 'flex', flexDirection: isHoriz ? 'row' : 'column', alignItems: isHoriz ? 'center' : 'flex-start', gap: '24px' } },
                        el('div', { className: 'bkbg-rs-score', style: { display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, gap: '6px', minWidth: '100px' } },
                            a.showOverallScore && el('span', { style: { fontSize: a.scoreSize + 'px', fontWeight: 800, color: a.scoreColor, lineHeight: 1 } }, a.overallScore.toFixed(1)),
                            a.showStars && starsSVG(a.overallScore, a.maxScore, a.starSize, a.starColor),
                            el('span', { style: { fontSize: a.labelSize + 'px', color: a.labelColor, fontWeight: 500 } }, scorePhrase(a.overallScore, a.maxScore)),
                            a.showTotalReviews && el('span', { style: { fontSize: (a.labelSize - 1) + 'px', color: a.countColor } }, a.totalReviews.toLocaleString() + ' ' + a.totalReviewsLabel),
                            a.showPlatformBadge && el('span', { style: { fontSize: a.labelSize + 'px', fontWeight: 700, background: '#f3f4f6', borderRadius: '6px', padding: '2px 10px', marginTop: '4px', color: '#374151' } }, a.platformName)
                        ),
                        el('div', { className: 'bkbg-rs-bars', style: { flex: 1, display: 'flex', flexDirection: 'column', gap: a.gap + 'px' } },
                            a.breakdowns.map(function (row, i) {
                                var pct = Math.round((row.count / totalCount) * 100);
                                return el('div', { key: i, className: 'bkbg-rs-row', style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                                    el('span', { style: { fontSize: a.labelSize + 'px', color: a.labelColor, whiteSpace: 'nowrap', minWidth: '36px', textAlign: 'right', fontWeight: 500 } }, row.stars + ' ★'),
                                    el('div', { style: { flex: 1, height: a.barHeight + 'px', background: a.barTrackColor, borderRadius: barRadius, overflow: 'hidden' } },
                                        el('div', { className: 'bkbg-rs-fill', 'data-pct': pct, style: { height: '100%', width: pct + '%', background: a.barColor, borderRadius: barRadius } })
                                    ),
                                    el('span', { style: { fontSize: a.labelSize + 'px', color: a.countColor, minWidth: '36px', fontVariantNumeric: 'tabular-nums' } }, pct + '%')
                                );
                            })
                        )
                    )
                );
            }
        }]
    });
}() );

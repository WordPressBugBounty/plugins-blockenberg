( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var useEffect = wp.element.useEffect;
    var useRef = wp.element.useRef;
    var registerBlockType = wp.blocks.registerBlockType;
    var __ = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var ToggleControl = wp.components.ToggleControl;
    var Button = wp.components.Button;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    var CHART_CDN = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js';

    function calcLoan(amount, annualRate, years) {
        if (!amount || !annualRate || !years) return { monthly: 0, totalPayment: 0, totalInterest: 0 };
        var r = annualRate / 1200;
        var n = years * 12;
        var monthly = amount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        var totalPayment = monthly * n;
        var totalInterest = totalPayment - amount;
        return {
            monthly: Math.round(monthly * 100) / 100,
            totalPayment: Math.round(totalPayment * 100) / 100,
            totalInterest: Math.round(totalInterest * 100) / 100
        };
    }

    function formatMoney(val, currency, pos) {
        var rounded = Math.round(val).toLocaleString('en-US');
        return pos === 'after' ? rounded + currency : currency + rounded;
    }

    function buildAmortTable(amount, annualRate, years, rows) {
        var r = annualRate / 1200;
        var n = years * 12;
        var monthly = amount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        var balance = amount;
        var result = [];
        for (var i = 1; i <= n && i <= rows; i++) {
            var interest = balance * r;
            var principal = monthly - interest;
            balance = balance - principal;
            result.push({ month: i, payment: monthly, principal: principal, interest: interest, balance: Math.max(0, balance) });
        }
        return result;
    }

    // Editor live preview component
    function LoanPreview(props) {
        var a = props.attrs;
        var chartRef = useRef(null);
        var chartInstance = useRef(null);

        var amount = a.loanAmountDefault || 300000;
        var rate = a.interestDefault || 5.5;
        var years = a.termDefault || 25;
        var result = calcLoan(amount, rate, years);

        function loadChartAndRender() {
            if (typeof Chart !== 'undefined') {
                renderChart();
                return;
            }
            if (document.getElementById('bkbg-chartjs-cdn')) return;
            var s = document.createElement('script');
            s.id = 'bkbg-chartjs-cdn';
            s.src = CHART_CDN;
            s.onload = function () { renderChart(); };
            document.head.appendChild(s);
        }

        function renderChart() {
            if (!chartRef.current || typeof Chart === 'undefined') return;
            if (chartInstance.current) { chartInstance.current.destroy(); }
            chartInstance.current = new Chart(chartRef.current, {
                type: 'doughnut',
                data: {
                    labels: [__('Principal', 'blockenberg'), __('Interest', 'blockenberg')],
                    datasets: [{
                        data: [amount, result.totalInterest],
                        backgroundColor: [a.principalColor || '#6c3fb5', a.interestColor || '#f59e0b'],
                        borderWidth: 0
                    }]
                },
                options: {
                    cutout: '70%',
                    plugins: { legend: { position: 'bottom', labels: { padding: 16 } } },
                    animation: false
                }
            });
        }

        useEffect(function () {
            if (a.showChart) loadChartAndRender();
            return function () {
                if (chartInstance.current) { chartInstance.current.destroy(); chartInstance.current = null; }
            };
        }, [a.showChart, a.loanAmountDefault, a.interestDefault, a.termDefault, a.principalColor, a.interestColor]);

        var cardStyle = { background: a.cardBg || '#ffffff', border: '1px solid ' + (a.cardBorder || '#e5e7eb'), borderRadius: a.cardRadius + 'px', padding: '24px' };

        return el('div', { className: 'bkbg-lc-inner', style: { maxWidth: a.maxWidth + 'px', margin: '0 auto' } },

            el('div', { className: 'bkbg-lc-sliders', style: cardStyle },
                // Loan amount
                el('div', { className: 'bkbg-lc-slider-group', style: { marginBottom: '24px' } },
                    el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' } },
                        el('label', { style: { fontSize: '14px', fontWeight: 600, color: a.labelColor || '#374151' } }, a.loanLabel || __('Loan Amount', 'blockenberg')),
                        el('span', { style: { fontSize: '20px', fontWeight: 700, color: a.accentColor || '#6c3fb5' } }, formatMoney(amount, a.currency || '$', a.currencyPos))
                    ),
                    el('input', {
                        type: 'range',
                        className: 'bkbg-lc-range',
                        min: a.loanAmountMin, max: a.loanAmountMax, step: a.loanAmountStep,
                        defaultValue: amount,
                        style: { width: '100%', accentColor: a.accentColor || '#6c3fb5' },
                        readOnly: true
                    }),
                    el('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af', marginTop: '4px' } },
                        el('span', null, formatMoney(a.loanAmountMin || 10000, a.currency || '$', a.currencyPos)),
                        el('span', null, formatMoney(a.loanAmountMax || 2000000, a.currency || '$', a.currencyPos))
                    )
                ),

                // Interest rate
                el('div', { className: 'bkbg-lc-slider-group', style: { marginBottom: '24px' } },
                    el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' } },
                        el('label', { style: { fontSize: '14px', fontWeight: 600, color: a.labelColor || '#374151' } }, a.interestLabel || __('Annual Interest Rate', 'blockenberg')),
                        el('span', { style: { fontSize: '20px', fontWeight: 700, color: a.accentColor || '#6c3fb5' } }, rate + '%')
                    ),
                    el('input', {
                        type: 'range',
                        className: 'bkbg-lc-range',
                        min: a.interestMin, max: a.interestMax, step: a.interestStep,
                        defaultValue: rate,
                        style: { width: '100%', accentColor: a.accentColor || '#6c3fb5' },
                        readOnly: true
                    }),
                    el('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af', marginTop: '4px' } },
                        el('span', null, a.interestMin + '%'),
                        el('span', null, a.interestMax + '%')
                    )
                ),

                // Term
                el('div', { className: 'bkbg-lc-slider-group' },
                    el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' } },
                        el('label', { style: { fontSize: '14px', fontWeight: 600, color: a.labelColor || '#374151' } }, a.termLabel || __('Loan Term', 'blockenberg')),
                        el('span', { style: { fontSize: '20px', fontWeight: 700, color: a.accentColor || '#6c3fb5' } }, years + ' ' + __('years', 'blockenberg'))
                    ),
                    el('input', {
                        type: 'range',
                        className: 'bkbg-lc-range',
                        min: a.termMin, max: a.termMax, step: a.termStep,
                        defaultValue: years,
                        style: { width: '100%', accentColor: a.accentColor || '#6c3fb5' },
                        readOnly: true
                    }),
                    el('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af', marginTop: '4px' } },
                        el('span', null, a.termMin + ' yr'),
                        el('span', null, a.termMax + ' yr')
                    )
                )
            ),

            // Results
            el('div', { className: 'bkbg-lc-results', style: { background: a.resultBg || '#f5f3ff', border: '1px solid ' + (a.resultBorder || '#ede9fe'), borderRadius: a.cardRadius + 'px', padding: '24px', marginTop: '16px', textAlign: 'center' } },
                el('div', { style: { fontSize: '13px', color: '#6b7280', marginBottom: '4px', fontWeight: 500 } }, __('Monthly Payment', 'blockenberg')),
                el('div', { className: 'bkbg-lc-monthly', style: { fontSize: a.monthlySize + 'px', fontWeight: 800, color: a.monthlyColor || '#6c3fb5', lineHeight: 1.1, marginBottom: '16px' } },
                    formatMoney(result.monthly, a.currency || '$', a.currencyPos)
                ),
                el('div', { style: { display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' } },
                    el('div', { style: { textAlign: 'center' } },
                        el('div', { style: { fontSize: '20px', fontWeight: 700, color: a.principalColor || '#6c3fb5' } }, formatMoney(amount, a.currency || '$', a.currencyPos)),
                        el('div', { style: { fontSize: '11px', color: '#9ca3af' } }, __('Principal', 'blockenberg'))
                    ),
                    el('div', { style: { textAlign: 'center' } },
                        el('div', { style: { fontSize: '20px', fontWeight: 700, color: a.interestColor || '#f59e0b' } }, formatMoney(result.totalInterest, a.currency || '$', a.currencyPos)),
                        el('div', { style: { fontSize: '11px', color: '#9ca3af' } }, __('Total Interest', 'blockenberg'))
                    ),
                    el('div', { style: { textAlign: 'center' } },
                        el('div', { style: { fontSize: '20px', fontWeight: 700, color: '#374151' } }, formatMoney(result.totalPayment, a.currency || '$', a.currencyPos)),
                        el('div', { style: { fontSize: '11px', color: '#9ca3af' } }, __('Total Payment', 'blockenberg'))
                    )
                )
            ),

            a.showChart && el('div', { className: 'bkbg-lc-chart-wrap', style: { maxWidth: '280px', margin: '16px auto 0' } },
                el('canvas', { ref: chartRef, width: 280, height: 280 })
            ),

            a.showCta && el('div', { style: { textAlign: 'center', marginTop: '24px' } },
                el('a', {
                    href: a.ctaUrl || '#',
                    className: 'bkbg-lc-cta',
                    style: { display: 'inline-block', background: a.ctaBg || a.accentColor || '#6c3fb5', color: a.ctaColor || '#fff', borderRadius: a.btnRadius + 'px', padding: '12px 32px', fontWeight: 700, fontSize: '15px', textDecoration: 'none' }
                }, a.ctaLabel || __('Apply Now', 'blockenberg'))
            ),

            a.showDisclaimer && a.disclaimer && el('p', {
                style: { fontSize: '11px', color: '#9ca3af', textAlign: 'center', marginTop: '16px', lineHeight: 1.6 }
            }, a.disclaimer)
        );
    }

    registerBlockType('blockenberg/loan-calculator', {
        edit: function (props) {
            var attrs = props.attributes;
            var setAttr = function (obj) { props.setAttributes(obj); };

            var wrapStyle = { paddingTop: attrs.paddingTop + 'px', paddingBottom: attrs.paddingBottom + 'px' };
            if (attrs.bgColor) wrapStyle.background = attrs.bgColor;

            var blockProps = useBlockProps((function () {
                var _tvFn = getTypoCssVars();
                var s = Object.assign({}, wrapStyle);
                if (_tvFn) {
                    Object.assign(s, _tvFn(attrs.titleTypo,    '--bkbg-lcalc-tt-'));
                    Object.assign(s, _tvFn(attrs.subtitleTypo, '--bkbg-lcalc-st-'));
                }
                return { style: s };
            })());

            return el(Fragment, null,
                el(InspectorControls, null,

                    el(PanelBody, { title: __('Loan Amount', 'blockenberg'), initialOpen: true },
                        el(TextControl, { label: __('Label', 'blockenberg'), value: attrs.loanLabel, onChange: function (v) { setAttr({ loanLabel: v }); } }),
                        el(RangeControl, { label: __('Default ($)', 'blockenberg'), value: attrs.loanAmountDefault, min: 1000, max: attrs.loanAmountMax, step: attrs.loanAmountStep, onChange: function (v) { setAttr({ loanAmountDefault: v }); } }),
                        el(RangeControl, { label: __('Minimum ($)', 'blockenberg'), value: attrs.loanAmountMin, min: 1000, max: 500000, step: 1000, onChange: function (v) { setAttr({ loanAmountMin: v }); } }),
                        el(RangeControl, { label: __('Maximum ($)', 'blockenberg'), value: attrs.loanAmountMax, min: 50000, max: 10000000, step: 10000, onChange: function (v) { setAttr({ loanAmountMax: v }); } }),
                        el(RangeControl, { label: __('Step ($)', 'blockenberg'), value: attrs.loanAmountStep, min: 100, max: 50000, step: 100, onChange: function (v) { setAttr({ loanAmountStep: v }); } })
                    ),

                    el(PanelBody, { title: __('Interest Rate', 'blockenberg'), initialOpen: false },
                        el(TextControl, { label: __('Label', 'blockenberg'), value: attrs.interestLabel, onChange: function (v) { setAttr({ interestLabel: v }); } }),
                        el(RangeControl, { label: __('Default (%)', 'blockenberg'), value: attrs.interestDefault, min: 0.1, max: attrs.interestMax, step: attrs.interestStep, onChange: function (v) { setAttr({ interestDefault: v }); } }),
                        el(RangeControl, { label: __('Minimum (%)', 'blockenberg'), value: attrs.interestMin, min: 0.1, max: 5, step: 0.1, onChange: function (v) { setAttr({ interestMin: v }); } }),
                        el(RangeControl, { label: __('Maximum (%)', 'blockenberg'), value: attrs.interestMax, min: 5, max: 30, step: 0.5, onChange: function (v) { setAttr({ interestMax: v }); } }),
                        el(RangeControl, { label: __('Step (%)', 'blockenberg'), value: attrs.interestStep, min: 0.05, max: 1, step: 0.05, onChange: function (v) { setAttr({ interestStep: v }); } })
                    ),

                    el(PanelBody, { title: __('Loan Term', 'blockenberg'), initialOpen: false },
                        el(TextControl, { label: __('Label', 'blockenberg'), value: attrs.termLabel, onChange: function (v) { setAttr({ termLabel: v }); } }),
                        el(RangeControl, { label: __('Default (years)', 'blockenberg'), value: attrs.termDefault, min: 1, max: attrs.termMax, step: 1, onChange: function (v) { setAttr({ termDefault: v }); } }),
                        el(RangeControl, { label: __('Minimum (years)', 'blockenberg'), value: attrs.termMin, min: 1, max: 10, step: 1, onChange: function (v) { setAttr({ termMin: v }); } }),
                        el(RangeControl, { label: __('Maximum (years)', 'blockenberg'), value: attrs.termMax, min: 5, max: 50, step: 1, onChange: function (v) { setAttr({ termMax: v }); } })
                    ),

                    el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: false },
                        el(SelectControl, {
                            label: __('Currency symbol', 'blockenberg'),
                            value: attrs.currency,
                            options: [
                                { label: '$ (Dollar)', value: '$' },
                                { label: '€ (Euro)', value: '€' },
                                { label: '£ (Pound)', value: '£' },
                                { label: '¥ (Yen)', value: '¥' },
                                { label: 'A$ (AUD)', value: 'A$' },
                                { label: 'C$ (CAD)', value: 'C$' }
                            ],
                            onChange: function (v) { setAttr({ currency: v }); }
                        }),
                        el(SelectControl, {
                            label: __('Currency position', 'blockenberg'),
                            value: attrs.currencyPos,
                            options: [
                                { label: __('Before ($ 500)', 'blockenberg'), value: 'before' },
                                { label: __('After (500 $)', 'blockenberg'), value: 'after' }
                            ],
                            onChange: function (v) { setAttr({ currencyPos: v }); }
                        }),
                        el(RangeControl, { label: __('Max width (px)', 'blockenberg'), value: attrs.maxWidth, min: 400, max: 1200, onChange: function (v) { setAttr({ maxWidth: v }); } }),
                        el(ToggleControl, { label: __('Show donut chart', 'blockenberg'), checked: attrs.showChart, onChange: function (v) { setAttr({ showChart: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show amortization table', 'blockenberg'), checked: attrs.showAmortization, onChange: function (v) { setAttr({ showAmortization: v }); }, __nextHasNoMarginBottom: true }),
                        attrs.showAmortization && el(RangeControl, { label: __('Amortization rows', 'blockenberg'), value: attrs.amortizationRows, min: 3, max: 60, onChange: function (v) { setAttr({ amortizationRows: v }); } }),
                        el(ToggleControl, { label: __('Show CTA button', 'blockenberg'), checked: attrs.showCta, onChange: function (v) { setAttr({ showCta: v }); }, __nextHasNoMarginBottom: true }),
                        attrs.showCta && el(TextControl, { label: __('CTA label', 'blockenberg'), value: attrs.ctaLabel, onChange: function (v) { setAttr({ ctaLabel: v }); } }),
                        attrs.showCta && el(TextControl, { label: __('CTA URL', 'blockenberg'), value: attrs.ctaUrl, type: 'url', onChange: function (v) { setAttr({ ctaUrl: v }); } }),
                        attrs.showCta && el(ToggleControl, { label: __('Open in new tab', 'blockenberg'), checked: attrs.ctaNewTab, onChange: function (v) { setAttr({ ctaNewTab: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show disclaimer', 'blockenberg'), checked: attrs.showDisclaimer, onChange: function (v) { setAttr({ showDisclaimer: v }); }, __nextHasNoMarginBottom: true }),
                        attrs.showDisclaimer && el(TextareaControl, { label: __('Disclaimer text', 'blockenberg'), value: attrs.disclaimer, rows: 3, onChange: function (v) { setAttr({ disclaimer: v }); } })
                    ),

                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        getTypoControl() && el(getTypoControl(), { label: __('Title', 'blockenberg'), value: attrs.titleTypo || {}, onChange: function (v) { setAttr({ titleTypo: v }); } }),
                        getTypoControl() && el(getTypoControl(), { label: __('Subtitle', 'blockenberg'), value: attrs.subtitleTypo || {}, onChange: function (v) { setAttr({ subtitleTypo: v }); } }),
                        el(RangeControl, { label: __('Monthly payment size (px)', 'blockenberg'), value: attrs.monthlySize, min: 24, max: 80, onChange: function (v) { setAttr({ monthlySize: v }); } }),
                        el(RangeControl, { label: __('Card radius (px)', 'blockenberg'), value: attrs.cardRadius, min: 0, max: 32, onChange: function (v) { setAttr({ cardRadius: v }); } }),
                        el(RangeControl, { label: __('Button radius (px)', 'blockenberg'), value: attrs.btnRadius, min: 0, max: 32, onChange: function (v) { setAttr({ btnRadius: v }); } })
                    ),

                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top (px)', 'blockenberg'), value: attrs.paddingTop, min: 0, max: 200, onChange: function (v) { setAttr({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: attrs.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttr({ paddingBottom: v }); } })
                    ),

                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { label: __('Accent', 'blockenberg'), value: attrs.accentColor, onChange: function (v) { setAttr({ accentColor: v || '#6c3fb5' }); } },
                            { label: __('Principal color', 'blockenberg'), value: attrs.principalColor, onChange: function (v) { setAttr({ principalColor: v || '#6c3fb5' }); } },
                            { label: __('Interest color', 'blockenberg'), value: attrs.interestColor, onChange: function (v) { setAttr({ interestColor: v || '#f59e0b' }); } },
                            { label: __('Monthly payment', 'blockenberg'), value: attrs.monthlyColor, onChange: function (v) { setAttr({ monthlyColor: v || '#6c3fb5' }); } },
                            { label: __('Label text', 'blockenberg'), value: attrs.labelColor, onChange: function (v) { setAttr({ labelColor: v || '#374151' }); } },
                            { label: __('Card background', 'blockenberg'), value: attrs.cardBg, onChange: function (v) { setAttr({ cardBg: v || '#ffffff' }); } },
                            { label: __('Card border', 'blockenberg'), value: attrs.cardBorder, onChange: function (v) { setAttr({ cardBorder: v || '#e5e7eb' }); } },
                            { label: __('Results background', 'blockenberg'), value: attrs.resultBg, onChange: function (v) { setAttr({ resultBg: v || '#f5f3ff' }); } },
                            { label: __('CTA background', 'blockenberg'), value: attrs.ctaBg, onChange: function (v) { setAttr({ ctaBg: v || '#6c3fb5' }); } },
                            { label: __('CTA text', 'blockenberg'), value: attrs.ctaColor, onChange: function (v) { setAttr({ ctaColor: v || '#ffffff' }); } },
                            { label: __('Block background', 'blockenberg'), value: attrs.bgColor, onChange: function (v) { setAttr({ bgColor: v || '' }); } }
                        ]
                    })
                ),

                el('div', blockProps,
                    attrs.showTitle && el(RichText, {
                        tagName: 'h2',
                        className: 'bkbg-lc-title',
                        style: { color: attrs.titleColor },
                        value: attrs.title,
                        onChange: function (v) { setAttr({ title: v }); },
                        placeholder: __('Loan Calculator…', 'blockenberg')
                    }),
                    attrs.showSubtitle && el(RichText, {
                        tagName: 'p',
                        className: 'bkbg-lc-subtitle',
                        style: { color: attrs.subtitleColor },
                        value: attrs.subtitle,
                        onChange: function (v) { setAttr({ subtitle: v }); },
                        placeholder: __('Subtitle…', 'blockenberg')
                    }),
                    el(LoanPreview, { attrs: attrs })
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var opts = {
                loanAmountDefault: a.loanAmountDefault,
                loanAmountMin: a.loanAmountMin,
                loanAmountMax: a.loanAmountMax,
                loanAmountStep: a.loanAmountStep,
                interestDefault: a.interestDefault,
                interestMin: a.interestMin,
                interestMax: a.interestMax,
                interestStep: a.interestStep,
                termDefault: a.termDefault,
                termMin: a.termMin,
                termMax: a.termMax,
                termStep: a.termStep,
                currency: a.currency,
                currencyPos: a.currencyPos,
                showChart: a.showChart,
                showAmortization: a.showAmortization,
                amortizationRows: a.amortizationRows,
                showCta: a.showCta,
                ctaLabel: a.ctaLabel,
                ctaUrl: a.ctaUrl,
                ctaNewTab: a.ctaNewTab,
                showDisclaimer: a.showDisclaimer,
                disclaimer: a.disclaimer,
                loanLabel: a.loanLabel,
                interestLabel: a.interestLabel,
                termLabel: a.termLabel,
                accentColor: a.accentColor,
                principalColor: a.principalColor,
                interestColor: a.interestColor,
                monthlyColor: a.monthlyColor,
                labelColor: a.labelColor,
                cardBg: a.cardBg,
                cardBorder: a.cardBorder,
                resultBg: a.resultBg,
                resultBorder: a.resultBorder,
                ctaBg: a.ctaBg,
                ctaColor: a.ctaColor,
                cardRadius: a.cardRadius,
                btnRadius: a.btnRadius,
                maxWidth: a.maxWidth,
                monthlySize: a.monthlySize
            };

            var wrapStyle = { paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px' };
            if (a.bgColor) wrapStyle.background = a.bgColor;

            var _tvFn = (typeof window.bkbgTypoCssVars !== 'undefined') ? window.bkbgTypoCssVars : null;
            if (_tvFn) {
                Object.assign(wrapStyle, _tvFn(a.titleTypo,    '--bkbg-lcalc-tt-'));
                Object.assign(wrapStyle, _tvFn(a.subtitleTypo, '--bkbg-lcalc-st-'));
            }

            var blockProps = wp.blockEditor.useBlockProps.save({ style: wrapStyle });

            return el('div', blockProps,
                a.showTitle && el('h2', {
                    className: 'bkbg-lc-title',
                    style: { color: a.titleColor },
                    dangerouslySetInnerHTML: { __html: a.title }
                }),
                a.showSubtitle && el('p', {
                    className: 'bkbg-lc-subtitle',
                    style: { color: a.subtitleColor },
                    dangerouslySetInnerHTML: { __html: a.subtitle }
                }),
                el('div', {
                    className: 'bkbg-lc-app',
                    'data-opts': JSON.stringify(opts),
                    style: { maxWidth: a.maxWidth + 'px', margin: '0 auto' }
                },
                    // Slider card placeholder
                    el('div', {
                        className: 'bkbg-lc-sliders',
                        style: { background: a.cardBg || '#ffffff', border: '1px solid ' + (a.cardBorder || '#e5e7eb'), borderRadius: a.cardRadius + 'px', padding: '24px' }
                    },
                        el('div', { className: 'bkbg-lc-slider-group', 'data-slider': 'amount', style: { marginBottom: '24px' } },
                            el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' } },
                                el('label', { className: 'bkbg-lc-slider-label', style: { fontSize: '14px', fontWeight: 600, color: a.labelColor || '#374151' } }, a.loanLabel || __('Loan Amount', 'blockenberg')),
                                el('span', { className: 'bkbg-lc-slider-val', style: { fontSize: '20px', fontWeight: 700, color: a.accentColor || '#6c3fb5' } }, '--')
                            ),
                            el('input', { type: 'range', className: 'bkbg-lc-range', style: { width: '100%', accentColor: a.accentColor || '#6c3fb5' } }),
                            el('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af', marginTop: '4px' } },
                                el('span', { className: 'bkbg-lc-range-min' }),
                                el('span', { className: 'bkbg-lc-range-max' })
                            )
                        ),
                        el('div', { className: 'bkbg-lc-slider-group', 'data-slider': 'interest', style: { marginBottom: '24px' } },
                            el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' } },
                                el('label', { className: 'bkbg-lc-slider-label', style: { fontSize: '14px', fontWeight: 600, color: a.labelColor || '#374151' } }, a.interestLabel || __('Annual Interest Rate', 'blockenberg')),
                                el('span', { className: 'bkbg-lc-slider-val', style: { fontSize: '20px', fontWeight: 700, color: a.accentColor || '#6c3fb5' } }, '--')
                            ),
                            el('input', { type: 'range', className: 'bkbg-lc-range', style: { width: '100%', accentColor: a.accentColor || '#6c3fb5' } }),
                            el('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af', marginTop: '4px' } },
                                el('span', { className: 'bkbg-lc-range-min' }),
                                el('span', { className: 'bkbg-lc-range-max' })
                            )
                        ),
                        el('div', { className: 'bkbg-lc-slider-group', 'data-slider': 'term' },
                            el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' } },
                                el('label', { className: 'bkbg-lc-slider-label', style: { fontSize: '14px', fontWeight: 600, color: a.labelColor || '#374151' } }, a.termLabel || __('Loan Term', 'blockenberg')),
                                el('span', { className: 'bkbg-lc-slider-val', style: { fontSize: '20px', fontWeight: 700, color: a.accentColor || '#6c3fb5' } }, '--')
                            ),
                            el('input', { type: 'range', className: 'bkbg-lc-range', style: { width: '100%', accentColor: a.accentColor || '#6c3fb5' } }),
                            el('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af', marginTop: '4px' } },
                                el('span', { className: 'bkbg-lc-range-min' }),
                                el('span', { className: 'bkbg-lc-range-max' })
                            )
                        )
                    ),
                    // Results
                    el('div', {
                        className: 'bkbg-lc-results',
                        style: { background: a.resultBg || '#f5f3ff', border: '1px solid ' + (a.resultBorder || '#ede9fe'), borderRadius: a.cardRadius + 'px', padding: '24px', marginTop: '16px', textAlign: 'center' }
                    },
                        el('div', { style: { fontSize: '13px', color: '#6b7280', marginBottom: '4px', fontWeight: 500 } }, __('Monthly Payment', 'blockenberg')),
                        el('div', { className: 'bkbg-lc-monthly', style: { fontSize: a.monthlySize + 'px', fontWeight: 800, color: a.monthlyColor || '#6c3fb5', lineHeight: 1.1, marginBottom: '16px' } }, '--'),
                        el('div', { className: 'bkbg-lc-summary', style: { display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' } },
                            el('div', { 'data-result': 'principal', style: { textAlign: 'center' } },
                                el('div', { className: 'bkbg-lc-res-val', style: { fontSize: '20px', fontWeight: 700, color: a.principalColor || '#6c3fb5' } }, '--'),
                                el('div', { style: { fontSize: '11px', color: '#9ca3af' } }, __('Principal', 'blockenberg'))
                            ),
                            el('div', { 'data-result': 'interest', style: { textAlign: 'center' } },
                                el('div', { className: 'bkbg-lc-res-val', style: { fontSize: '20px', fontWeight: 700, color: a.interestColor || '#f59e0b' } }, '--'),
                                el('div', { style: { fontSize: '11px', color: '#9ca3af' } }, __('Total Interest', 'blockenberg'))
                            ),
                            el('div', { 'data-result': 'total', style: { textAlign: 'center' } },
                                el('div', { className: 'bkbg-lc-res-val', style: { fontSize: '20px', fontWeight: 700, color: '#374151' } }, '--'),
                                el('div', { style: { fontSize: '11px', color: '#9ca3af' } }, __('Total Payment', 'blockenberg'))
                            )
                        )
                    ),
                    a.showChart && el('div', { className: 'bkbg-lc-chart-wrap', style: { maxWidth: '280px', margin: '16px auto 0' } },
                        el('canvas', { className: 'bkbg-lc-chart', width: 280, height: 280 })
                    ),
                    a.showAmortization && el('div', { className: 'bkbg-lc-amort-wrap', style: { marginTop: '24px', overflowX: 'auto' } }),
                    a.showCta && el('div', { style: { textAlign: 'center', marginTop: '24px' } },
                        el('a', {
                            href: a.ctaUrl || '#',
                            className: 'bkbg-lc-cta',
                            target: a.ctaNewTab ? '_blank' : undefined,
                            rel: a.ctaNewTab ? 'noopener noreferrer' : undefined,
                            style: { display: 'inline-block', background: a.ctaBg || a.accentColor || '#6c3fb5', color: a.ctaColor || '#fff', borderRadius: a.btnRadius + 'px', padding: '12px 32px', fontWeight: 700, fontSize: '15px', textDecoration: 'none' }
                        }, a.ctaLabel || 'Apply Now')
                    ),
                    a.showDisclaimer && a.disclaimer && el('p', {
                        style: { fontSize: '11px', color: '#9ca3af', textAlign: 'center', marginTop: '16px', lineHeight: 1.6 }
                    }, a.disclaimer)
                )
            );
        }
    });
}() );

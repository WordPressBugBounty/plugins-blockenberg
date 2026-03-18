( function () {
    var el = wp.element.createElement;
    var useState = wp.element.useState;
    var Fragment = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __ = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var TextControl = wp.components.TextControl;
    var RangeControl = wp.components.RangeControl;
    var ToggleControl = wp.components.ToggleControl;
    var SelectControl = wp.components.SelectControl;

    var _exptTC, _exptTV;
    function _tc() { return _exptTC || (_exptTC = window.bkbgTypographyControl); }
    function _tv(t, p) { return (_exptTV || (_exptTV = window.bkbgTypoCssVars)) ? _exptTV(t, p) : {}; }

    var CATS = ['Housing','Food','Transport','Entertainment','Health','Shopping','Utilities','Other'];
    var CAT_COLORS = ['#6366f1','#f59e0b','#10b981','#ec4899','#ef4444','#3b82f6','#14b8a6','#8b5cf6'];

    registerBlockType('blockenberg/expense-tracker', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps({ className: 'bkbg-expt-root', style: Object.assign({},
                _tv(a.typoTitle || {}, '--bkbg-expt-ttl-'),
                _tv(a.typoSubtitle || {}, '--bkbg-expt-sub-')
            ) });

            var previewExpenses = [
                { id: 1, name: 'Rent', amount: 800, category: 'Housing', date: '2024-01-01' },
                { id: 2, name: 'Groceries', amount: 120, category: 'Food', date: '2024-01-03' },
                { id: 3, name: 'Bus Pass', amount: 45, category: 'Transport', date: '2024-01-05' },
                { id: 4, name: 'Netflix', amount: 15, category: 'Entertainment', date: '2024-01-06' }
            ];
            var total = previewExpenses.reduce(function (s, e) { return s + e.amount; }, 0);
            var catTotals = {};
            previewExpenses.forEach(function (e) {
                catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
            });

            function previewBlock() {
                return el('div', { style: { background: a.sectionBg, padding: '24px', borderRadius: '12px', maxWidth: a.contentMaxWidth + 'px', fontFamily: 'system-ui,sans-serif' } },
                    a.showTitle && el('h2', { className: 'bkbg-expt-title', style: { margin: '0 0 4px', color: a.titleColor } }, a.title),
                    a.showSubtitle && el('p', { className: 'bkbg-expt-subtitle', style: { margin: '0 0 20px', color: a.subtitleColor } }, a.subtitle),

                    /* Summary cards */
                    el('div', { style: { display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' } },
                        el('div', { style: { background: a.cardBg, borderRadius: '8px', padding: '14px 18px', flex: '1', minWidth: '120px', border: '1px solid ' + a.borderColor } },
                            el('div', { style: { color: a.accentColor, fontSize: '22px', fontWeight: 700 } }, a.currency + total.toFixed(2)),
                            el('div', { style: { color: a.subtitleColor, fontSize: '12px', marginTop: '2px' } }, 'Total Spent')
                        ),
                        a.showBudget && el('div', { style: { background: a.cardBg, borderRadius: '8px', padding: '14px 18px', flex: '1', minWidth: '120px', border: '1px solid ' + a.borderColor } },
                            el('div', { style: { color: total > a.defaultBudget ? a.dangerColor : a.labelColor, fontSize: '22px', fontWeight: 700 } }, a.currency + (a.defaultBudget - total).toFixed(2)),
                            el('div', { style: { color: a.subtitleColor, fontSize: '12px', marginTop: '2px' } }, 'Remaining Budget')
                        )
                    ),

                    /* Chart preview */
                    a.showChart && el('div', { style: { background: a.cardBg, borderRadius: '8px', padding: '16px', marginBottom: '16px', border: '1px solid ' + a.borderColor } },
                        el('div', { style: { fontWeight: 600, color: a.labelColor, marginBottom: '12px' } }, 'By Category'),
                        el('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
                            Object.keys(catTotals).map(function (cat, i) {
                                var pct = Math.round((catTotals[cat] / total) * 100);
                                return el('div', { key: cat },
                                    el('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '3px', color: a.labelColor } },
                                        el('span', null, cat),
                                        el('span', null, a.currency + catTotals[cat].toFixed(2))
                                    ),
                                    el('div', { style: { height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' } },
                                        el('div', { style: { height: '100%', width: pct + '%', background: CAT_COLORS[CATS.indexOf(cat) % CAT_COLORS.length], borderRadius: '4px', transition: 'width 0.4s' } })
                                    )
                                );
                            })
                        )
                    ),

                    /* Expense list preview */
                    el('div', { style: { background: a.cardBg, borderRadius: '8px', border: '1px solid ' + a.borderColor, overflow: 'hidden' } },
                        previewExpenses.map(function (exp) {
                            var catIdx = CATS.indexOf(exp.category);
                            var catColor = CAT_COLORS[catIdx % CAT_COLORS.length] || a.accentColor;
                            return el('div', { key: exp.id, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid ' + a.borderColor, fontSize: '14px' } },
                                el('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                                    el('div', { style: { width: '8px', height: '8px', borderRadius: '50%', background: catColor, flexShrink: 0 } }),
                                    el('div', null,
                                        el('div', { style: { color: a.labelColor, fontWeight: 500 } }, exp.name),
                                        el('div', { style: { color: a.subtitleColor, fontSize: '12px' } }, exp.category + ' · ' + exp.date)
                                    )
                                ),
                                el('div', { style: { color: a.labelColor, fontWeight: 600 } }, a.currency + exp.amount.toFixed(2))
                            );
                        })
                    )
                );
            }

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: 'Content', initialOpen: true },
                        el(TextControl, { label: 'Title', value: a.title, onChange: function (v) { set({ title: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { marginBottom: '16px' } }),
                        el(TextControl, { label: 'Subtitle', value: a.subtitle, onChange: function (v) { set({ subtitle: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { marginBottom: '16px' } }),
                        el(ToggleControl, { label: 'Show Title', checked: a.showTitle, onChange: function (v) { set({ showTitle: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: 'Show Subtitle', checked: a.showSubtitle, onChange: function (v) { set({ showSubtitle: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: 'Settings', initialOpen: false },
                        el(SelectControl, { label: 'Currency Symbol', value: a.currency, options: [{ label: 'USD ($)', value: '$' }, { label: 'EUR (€)', value: '€' }, { label: 'GBP (£)', value: '£' }, { label: 'JPY (¥)', value: '¥' }, { label: 'RUB (₽)', value: '₽' }], onChange: function (v) { set({ currency: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { marginBottom: '16px' } }),
                        el(ToggleControl, { label: 'Show Budget', checked: a.showBudget, onChange: function (v) { set({ showBudget: v }); }, __nextHasNoMarginBottom: true }),
                        a.showBudget && el(RangeControl, { label: 'Default Monthly Budget', value: a.defaultBudget, min: 100, max: 100000, step: 50, onChange: function (v) { set({ defaultBudget: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { marginBottom: '16px' } }),
                        el(ToggleControl, { label: 'Show Category Chart', checked: a.showChart, onChange: function (v) { set({ showChart: v }); }, __nextHasNoMarginBottom: true }),
                        el('div', { style: { marginBottom: '16px' } }),
                        el(RangeControl, { label: 'Max Width (px)', value: a.contentMaxWidth, min: 400, max: 1200, step: 10, onChange: function (v) { set({ contentMaxWidth: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        _tc() && el(_tc(), { label: 'Title', typo: a.typoTitle || {}, onChange: function (v) { set({ typoTitle: v }); } }),
                        _tc() && el(_tc(), { label: 'Subtitle', typo: a.typoSubtitle || {}, onChange: function (v) { set({ typoSubtitle: v }); } })
                    ),
                    el(PanelColorSettings, {
                        title: 'Colors',
                        initialOpen: false,
                        colorSettings: [
                            { label: 'Accent Color', value: a.accentColor, onChange: function (v) { set({ accentColor: v || '#10b981' }); } },
                            { label: 'Danger / Over-Budget', value: a.dangerColor, onChange: function (v) { set({ dangerColor: v || '#ef4444' }); } },
                            { label: 'Section Background', value: a.sectionBg, onChange: function (v) { set({ sectionBg: v || '#f0fdf4' }); } },
                            { label: 'Card Background', value: a.cardBg, onChange: function (v) { set({ cardBg: v || '#ffffff' }); } },
                            { label: 'Title Color', value: a.titleColor, onChange: function (v) { set({ titleColor: v || '#064e3b' }); } },
                            { label: 'Label Color', value: a.labelColor, onChange: function (v) { set({ labelColor: v || '#374151' }); } },
                            { label: 'Subtitle Color', value: a.subtitleColor, onChange: function (v) { set({ subtitleColor: v || '#6b7280' }); } },
                            { label: 'Border Color', value: a.borderColor, onChange: function (v) { set({ borderColor: v || '#d1fae5' }); } }
                        ]
                    })
                ),
                el('div', blockProps, previewBlock())
            );
        },
        save: function (props) {
            var a = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-expt-app', 'data-opts': JSON.stringify(a) })
            );
        }
    });
}() );

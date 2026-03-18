( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var PanelBody = wp.components.PanelBody;
    var Button = wp.components.Button;
    var __ = wp.i18n.__;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    var levelOptions = [
        { label: 'Junior', value: 'Junior' },
        { label: 'Mid', value: 'Mid' },
        { label: 'Senior', value: 'Senior' },
        { label: 'Lead', value: 'Lead' },
        { label: 'Principal', value: 'Principal' }
    ];
    var periodOptions = [
        { label: 'per year', value: 'year' },
        { label: 'per month', value: 'month' },
        { label: 'per hour', value: 'hour' }
    ];

    function upd(arr, idx, field, val) {
        return arr.map(function (e, i) {
            if (i !== idx) return e;
            var u = {}; u[field] = val;
            return Object.assign({}, e, u);
        });
    }

    function formatSalary(n, currency) {
        if (n >= 1000) return currency + Math.round(n / 1000) + 'k';
        return currency + n;
    }

    function getGlobalMinMax(roles) {
        var allVals = [];
        roles.forEach(function (r) { allVals.push(r.min, r.max); });
        return { gMin: Math.min.apply(null, allVals), gMax: Math.max.apply(null, allVals) };
    }

    function renderBar(role, a, gMin, gMax) {
        var range = gMax - gMin || 1;
        var leftPct = ((role.min - gMin) / range) * 100;
        var widthPct = ((role.max - role.min) / range) * 100;
        var medPct = ((role.median - gMin) / range) * 100;

        return el('div', { className: 'bkbg-sg-bar-wrap' },
            el('div', { className: 'bkbg-sg-bar-track', style: { height: a.barHeight + 'px', background: a.barTrackColor, borderRadius: a.barHeight + 'px', position: 'relative', overflow: 'visible' } },
                el('div', { className: 'bkbg-sg-bar-fill', style: {
                    position: 'absolute', left: leftPct.toFixed(2) + '%', width: widthPct.toFixed(2) + '%',
                    height: '100%', background: a.barFillColor, borderRadius: a.barHeight + 'px'
                } }),
                a.showMedian && el('div', { className: 'bkbg-sg-bar-median', style: {
                    position: 'absolute', left: medPct.toFixed(2) + '%',
                    top: '-3px', width: '3px', height: (a.barHeight + 6) + 'px',
                    background: a.medianColor, borderRadius: 2, transform: 'translateX(-50%)'
                } })
            )
        );
    }

    function renderRow(role, a, gMin, gMax) {
        return el('div', { className: 'bkbg-sg-row', key: role.title + role.level, style: { borderTopColor: a.borderColor } },
            el('div', { className: 'bkbg-sg-row-header' },
                el('div', { className: 'bkbg-sg-role-info' },
                    el('span', { className: 'bkbg-sg-role-title', style: { color: a.roleTitleColor } }, role.title),
                    a.showLevel && el('span', { className: 'bkbg-sg-level-badge', style: { background: a.levelBg, color: a.levelColor } }, role.level)
                ),
                el('div', { className: 'bkbg-sg-range-labels', style: { color: a.rangeLabelColor } },
                    el('span', null, formatSalary(role.min, a.currency)),
                    a.showMedian && el('span', { className: 'bkbg-sg-median-label', style: { color: a.medianColor, fontWeight: 600 } }, formatSalary(role.median, a.currency) + ' median'),
                    el('span', null, formatSalary(role.max, a.currency))
                )
            ),
            a.showBars && renderBar(role, a, gMin, gMax)
        );
    }

    function getCategories(roles) {
        var cats = [], seen = {};
        roles.forEach(function (r) { if (!seen[r.category]) { seen[r.category] = 1; cats.push(r.category); } });
        return cats;
    }

    wp.blocks.registerBlockType('blockenberg/salary-guide', {
        edit: function (props) {
            var a = props.attributes;
            var setAttr = props.setAttributes;
            var mm = getGlobalMinMax(a.roles.length ? a.roles : [{ min: 0, max: 100, median: 50 }]);

            var rows;
            if (a.groupByCategory) {
                var cats = getCategories(a.roles);
                rows = cats.map(function (cat) {
                    var catRoles = a.roles.filter(function (r) { return r.category === cat; });
                    return el('div', { key: cat, className: 'bkbg-sg-category-group' },
                        el('div', { className: 'bkbg-sg-category-head', style: { color: a.categoryHeadColor, background: a.categoryHeadBg, borderColor: a.borderColor } }, cat),
                        catRoles.map(function (role) { return renderRow(role, a, mm.gMin, mm.gMax); })
                    );
                });
            } else {
                rows = a.roles.map(function (role) { return renderRow(role, a, mm.gMin, mm.gMax); });
            }

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Guide Settings'), initialOpen: true },
                        el(TextControl, { label: __('Title'), value: a.guideTitle, onChange: function (v) { setAttr({ guideTitle: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextareaControl, { label: __('Description'), value: a.description, onChange: function (v) { setAttr({ description: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Description'), checked: a.showDescription, onChange: function (v) { setAttr({ showDescription: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: __('Currency Symbol'), value: a.currency, onChange: function (v) { setAttr({ currency: v }); }, __nextHasNoMarginBottom: true }),
                        el(SelectControl, { label: __('Period'), value: a.period, options: periodOptions, onChange: function (v) { setAttr({ period: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: __('Location'), value: a.location, onChange: function (v) { setAttr({ location: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Location'), checked: a.showLocation, onChange: function (v) { setAttr({ showLocation: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Bars'), checked: a.showBars, onChange: function (v) { setAttr({ showBars: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Median Marker'), checked: a.showMedian, onChange: function (v) { setAttr({ showMedian: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Level Badge'), checked: a.showLevel, onChange: function (v) { setAttr({ showLevel: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Group by Category'), checked: a.groupByCategory, onChange: function (v) { setAttr({ groupByCategory: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Roles'), initialOpen: false },
                        a.roles.map(function (role, i) {
                            return el('div', { key: i, style: { border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginBottom: 12, background: '#fafafa' } },
                                el('strong', { style: { display: 'block', marginBottom: 6 } }, role.title + ' — ' + role.level),
                                el(TextControl, { label: __('Role Title'), value: role.title, onChange: function (v) { setAttr({ roles: upd(a.roles, i, 'title', v) }); }, __nextHasNoMarginBottom: true }),
                                el(SelectControl, { label: __('Level'), value: role.level, options: levelOptions, onChange: function (v) { setAttr({ roles: upd(a.roles, i, 'level', v) }); }, __nextHasNoMarginBottom: true }),
                                el(TextControl, { label: __('Category'), value: role.category, onChange: function (v) { setAttr({ roles: upd(a.roles, i, 'category', v) }); }, __nextHasNoMarginBottom: true }),
                                el(TextControl, { label: __('Min'), type: 'number', value: String(role.min), onChange: function (v) { setAttr({ roles: upd(a.roles, i, 'min', parseInt(v, 10) || 0) }); }, __nextHasNoMarginBottom: true }),
                                el(TextControl, { label: __('Median'), type: 'number', value: String(role.median), onChange: function (v) { setAttr({ roles: upd(a.roles, i, 'median', parseInt(v, 10) || 0) }); }, __nextHasNoMarginBottom: true }),
                                el(TextControl, { label: __('Max'), type: 'number', value: String(role.max), onChange: function (v) { setAttr({ roles: upd(a.roles, i, 'max', parseInt(v, 10) || 0) }); }, __nextHasNoMarginBottom: true }),
                                el(Button, { isDestructive: true, variant: 'secondary', onClick: function () { setAttr({ roles: a.roles.filter(function (_, j) { return j !== i; }) }); } }, __('Remove'))
                            );
                        }),
                        el(Button, { variant: 'primary', onClick: function () { setAttr({ roles: a.roles.concat([{ title: 'New Role', level: 'Mid', min: 80000, median: 100000, max: 130000, category: 'Engineering' }]) }); } }, __('+ Add Role'))
                    ),
                    el(PanelBody, { title: __('Typography'), initialOpen: false },
                        el(RangeControl, { label: __('Base Font Size'), value: a.fontSize, min: 10, max: 22, onChange: function (v) { setAttr({ fontSize: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Line Height (%)'), value: a.lineHeight, min: 120, max: 220, onChange: function (v) { setAttr({ lineHeight: v }); }, __nextHasNoMarginBottom: true }),
                        getTypoControl() && el( getTypoControl(), { label: __('Title Typography'), value: a.titleTypo || {}, onChange: function(v){ setAttr({ titleTypo: v }); } }),
                        getTypoControl() && el( getTypoControl(), { label: __('Description Typography'), value: a.descTypo || {}, onChange: function(v){ setAttr({ descTypo: v }); } })
                    ),
                    el(PanelBody, { title: __('Appearance'), initialOpen: false },
                        el(RangeControl, { label: __('Border Radius'), value: a.borderRadius, min: 0, max: 32, onChange: function (v) { setAttr({ borderRadius: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Bar Height (px)'), value: a.barHeight, min: 4, max: 24, onChange: function (v) { setAttr({ barHeight: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelColorSettings, {
                        title: __('Colors'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Background'), value: a.bgColor, onChange: function (v) { setAttr({ bgColor: v || '#ffffff' }); } },
                            { label: __('Border'), value: a.borderColor, onChange: function (v) { setAttr({ borderColor: v || '#e5e7eb' }); } },
                            { label: __('Title'), value: a.titleColor, onChange: function (v) { setAttr({ titleColor: v || '#111827' }); } },
                            { label: __('Description'), value: a.descColor, onChange: function (v) { setAttr({ descColor: v || '#6b7280' }); } },
                            { label: __('Role Title'), value: a.roleTitleColor, onChange: function (v) { setAttr({ roleTitleColor: v || '#1f2937' }); } },
                            { label: __('Level Badge BG'), value: a.levelBg, onChange: function (v) { setAttr({ levelBg: v || '#f3f4f6' }); } },
                            { label: __('Level Badge Text'), value: a.levelColor, onChange: function (v) { setAttr({ levelColor: v || '#374151' }); } },
                            { label: __('Range Labels'), value: a.rangeLabelColor, onChange: function (v) { setAttr({ rangeLabelColor: v || '#6b7280' }); } },
                            { label: __('Bar Track'), value: a.barTrackColor, onChange: function (v) { setAttr({ barTrackColor: v || '#e5e7eb' }); } },
                            { label: __('Bar Fill'), value: a.barFillColor, onChange: function (v) { setAttr({ barFillColor: v || '#3b82f6' }); } },
                            { label: __('Median Marker'), value: a.medianColor, onChange: function (v) { setAttr({ medianColor: v || '#0f172a' }); } },
                            { label: __('Category Heading'), value: a.categoryHeadColor, onChange: function (v) { setAttr({ categoryHeadColor: v || '#374151' }); } },
                            { label: __('Category Heading BG'), value: a.categoryHeadBg, onChange: function (v) { setAttr({ categoryHeadBg: v || '#f8fafc' }); } }
                        ]
                    })
                ),
                el('div', useBlockProps((function () {
                    var _tv = getTypoCssVars();
                    var s = { background: a.bgColor, borderRadius: a.borderRadius + 'px', border: '1px solid ' + a.borderColor, overflow: 'hidden', fontSize: a.fontSize + 'px', lineHeight: (a.lineHeight / 100).toFixed(2) };
                    if (_tv) {
                        Object.assign(s, _tv(a.titleTypo, '--bksg-tt-'));
                        Object.assign(s, _tv(a.descTypo, '--bksg-dt-'));
                    }
                    return { className: 'bkbg-sg-wrap', style: s };
                })()),
                    el('div', { className: 'bkbg-sg-header', style: { padding: '24px 28px', borderBottom: '1px solid ' + a.borderColor } },
                        el('h2', { className: 'bkbg-sg-title', style: { color: a.titleColor } }, a.guideTitle),
                        el('div', { className: 'bkbg-sg-meta', style: { color: a.descColor } },
                            a.showDescription && a.description && el('p', { style: { margin: 0 } }, a.description),
                            a.showLocation && el('span', { className: 'bkbg-sg-location' }, '📍 ' + a.location + ' · ' + a.currency + ' / ' + a.period)
                        )
                    ),
                    el('div', { className: 'bkbg-sg-body' }, rows)
                )
            );
        },
        save: function (props) {
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-salary-guide-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );

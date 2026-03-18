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

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var ringOptions = [
        { label: 'Adopt', value: 'adopt' },
        { label: 'Trial', value: 'trial' },
        { label: 'Assess', value: 'assess' },
        { label: 'Hold', value: 'hold' }
    ];
    var quadrantOptions = [
        { label: 'Languages & Frameworks', value: 'Languages & Frameworks' },
        { label: 'Platforms', value: 'Platforms' },
        { label: 'Tools', value: 'Tools' },
        { label: 'Techniques', value: 'Techniques' }
    ];
    var ringOrder = ['adopt', 'trial', 'assess', 'hold'];

    function upd(arr, idx, field, val) {
        return arr.map(function (e, i) {
            if (i !== idx) return e;
            var u = {}; u[field] = val;
            return Object.assign({}, e, u);
        });
    }

    function ringInfo(r, a) {
        var map = {
            adopt:  { label: 'Adopt',  bg: a.adoptBg,  color: a.adoptColor,  border: a.adoptBorder },
            trial:  { label: 'Trial',  bg: a.trialBg,  color: a.trialColor,  border: a.trialBorder },
            assess: { label: 'Assess', bg: a.assessBg, color: a.assessColor, border: a.assessBorder },
            hold:   { label: 'Hold',   bg: a.holdBg,   color: a.holdColor,   border: a.holdBorder }
        };
        return map[r] || map.adopt;
    }

    function renderRingSection(ring, blips, a) {
        var ri = ringInfo(ring, a);
        return el('div', { className: 'bkbg-tr-ring-section', key: ring, style: { borderLeft: '4px solid ' + ri.border, background: a.bgColor } },
            el('div', { className: 'bkbg-tr-ring-head', style: { background: ri.bg } },
                el('span', { className: 'bkbg-tr-ring-label', style: { color: ri.color, fontSize: a.ringLabelSize + 'px' } }, ri.label.toUpperCase()),
                el('span', { className: 'bkbg-tr-ring-count', style: { color: ri.color } }, blips.length + ' ' + (blips.length === 1 ? 'entry' : 'entries'))
            ),
            el('div', { className: 'bkbg-tr-blip-list' },
                blips.map(function (blip, i) {
                    return el('div', { className: 'bkbg-tr-blip', key: i, style: { borderTopColor: a.borderColor } },
                        el('div', { className: 'bkbg-tr-blip-top' },
                            el('span', { className: 'bkbg-tr-blip-name', style: { color: a.blipNameColor, fontSize: a.blipNameSize + 'px' } }, blip.name),
                            a.showIsNew && blip.isNew && el('span', { className: 'bkbg-tr-new-badge', style: { background: a.newBadgeBg, color: a.newBadgeColor } }, 'NEW')
                        ),
                        blip.description && el('div', { className: 'bkbg-tr-blip-desc', style: { color: a.blipDescColor } }, blip.description)
                    );
                })
            )
        );
    }

    function getGrouped(blips) {
        var groups = {};
        ringOrder.forEach(function (r) { groups[r] = []; });
        blips.forEach(function (b) { if (groups[b.ring]) groups[b.ring].push(b); });
        return groups;
    }

    function getByQuadrant(blips) {
        var quads = {};
        quadrantOptions.forEach(function (q) { quads[q.value] = []; });
        blips.forEach(function (b) { if (quads[b.quadrant] !== undefined) quads[b.quadrant].push(b); });
        return quads;
    }

    wp.blocks.registerBlockType('blockenberg/tech-radar', {
        edit: function (props) {
            var a = props.attributes;
            var setAttr = props.setAttributes;
            var lh = (a.lineHeight / 100).toFixed(2);

            var grouped = getGrouped(a.blips);

            var preview;
            if (a.groupByQuadrant) {
                var byQuad = getByQuadrant(a.blips);
                preview = el('div', { className: 'bkbg-tr-quadrants' },
                    quadrantOptions.map(function (q) {
                        var qBlips = byQuad[q.value];
                        if (!qBlips || !qBlips.length) return null;
                        var qGrouped = getGrouped(qBlips);
                        return el('div', { className: 'bkbg-tr-quadrant', key: q.value, style: { border: '1px solid ' + a.borderColor, borderRadius: 8 } },
                            el('div', { className: 'bkbg-tr-quadrant-head', style: { color: a.quadrantHeadColor, borderBottomColor: a.borderColor } }, q.value),
                            ringOrder.map(function (ring) {
                                var rb = qGrouped[ring];
                                if (!rb || !rb.length) return null;
                                return renderRingSection(ring, rb, a);
                            })
                        );
                    })
                );
            } else {
                preview = el('div', { className: 'bkbg-tr-rings' },
                    ringOrder.map(function (ring) {
                        var rb = grouped[ring];
                        if (!rb || !rb.length) return null;
                        return renderRingSection(ring, rb, a);
                    })
                );
            }

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Radar Settings'), initialOpen: true },
                        el(TextControl, { label: __('Radar Title'), value: a.radarTitle, onChange: function (v) { setAttr({ radarTitle: v }); }, __nextHasNoMarginBottom: true }),
                        el(TextareaControl, { label: __('Description'), value: a.description, onChange: function (v) { setAttr({ description: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Description'), checked: a.showDescription, onChange: function (v) { setAttr({ showDescription: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Group by Quadrant'), checked: a.groupByQuadrant, onChange: function (v) { setAttr({ groupByQuadrant: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show NEW badge'), checked: a.showIsNew, onChange: function (v) { setAttr({ showIsNew: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Blips'), initialOpen: false },
                        a.blips.map(function (blip, i) {
                            return el('div', { key: i, style: { border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginBottom: 12, background: '#fafafa' } },
                                el('strong', { style: { display: 'block', marginBottom: 6 } }, blip.name || ('Blip ' + (i + 1))),
                                el(TextControl, { label: __('Name'), value: blip.name, onChange: function (v) { setAttr({ blips: upd(a.blips, i, 'name', v) }); }, __nextHasNoMarginBottom: true }),
                                el(SelectControl, { label: __('Ring'), value: blip.ring, options: ringOptions, onChange: function (v) { setAttr({ blips: upd(a.blips, i, 'ring', v) }); }, __nextHasNoMarginBottom: true }),
                                el(SelectControl, { label: __('Quadrant'), value: blip.quadrant, options: quadrantOptions, onChange: function (v) { setAttr({ blips: upd(a.blips, i, 'quadrant', v) }); }, __nextHasNoMarginBottom: true }),
                                el(TextareaControl, { label: __('Description'), value: blip.description, onChange: function (v) { setAttr({ blips: upd(a.blips, i, 'description', v) }); }, __nextHasNoMarginBottom: true }),
                                el(ToggleControl, { label: __('Mark as NEW'), checked: blip.isNew, onChange: function (v) { setAttr({ blips: upd(a.blips, i, 'isNew', v) }); }, __nextHasNoMarginBottom: true }),
                                el(Button, { isDestructive: true, variant: 'secondary', onClick: function () { setAttr({ blips: a.blips.filter(function (_, j) { return j !== i; }) }); } }, __('Remove'))
                            );
                        }),
                        el(Button, { variant: 'primary', onClick: function () { setAttr({ blips: a.blips.concat([{ name: 'New Technology', ring: 'assess', quadrant: 'Tools', description: '', isNew: true }]) }); } }, __('+ Add Blip'))
                    ),
                    el(PanelBody, { title: __('Typography'), initialOpen: false },
                        getTypoControl()({ label: __('Title'), value: a.titleTypo, onChange: function (v) { setAttr({ titleTypo: v }); } }),
                        el(RangeControl, { label: __('Base Font Size'), value: a.fontSize, min: 10, max: 22, onChange: function (v) { setAttr({ fontSize: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Ring Label Size'), value: a.ringLabelSize, min: 8, max: 18, onChange: function (v) { setAttr({ ringLabelSize: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Blip Name Size'), value: a.blipNameSize, min: 10, max: 20, onChange: function (v) { setAttr({ blipNameSize: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Line Height (%)'), value: a.lineHeight, min: 120, max: 220, onChange: function (v) { setAttr({ lineHeight: v }); }, __nextHasNoMarginBottom: true }),
                        el(SelectControl, { label: __('Font Weight'), value: a.fontWeight, options: [{label:'400 Regular',value:'400'},{label:'500 Medium',value:'500'},{label:'600 Semi-bold',value:'600'},{label:'700 Bold',value:'700'},{label:'800 Extra Bold',value:'800'}], __nextHasNoMarginBottom: true, onChange: function (v) { setAttr({ fontWeight: v }); } }),
                        el(RangeControl, { label: __('Border Radius'), value: a.borderRadius, min: 0, max: 32, onChange: function (v) { setAttr({ borderRadius: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelColorSettings, {
                        title: __('Layout Colors'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Background'), value: a.bgColor, onChange: function (v) { setAttr({ bgColor: v || '#ffffff' }); } },
                            { label: __('Border'), value: a.borderColor, onChange: function (v) { setAttr({ borderColor: v || '#e5e7eb' }); } },
                            { label: __('Title'), value: a.titleColor, onChange: function (v) { setAttr({ titleColor: v || '#111827' }); } },
                            { label: __('Description'), value: a.descColor, onChange: function (v) { setAttr({ descColor: v || '#6b7280' }); } },
                            { label: __('Blip Name'), value: a.blipNameColor, onChange: function (v) { setAttr({ blipNameColor: v || '#1f2937' }); } },
                            { label: __('Blip Desc'), value: a.blipDescColor, onChange: function (v) { setAttr({ blipDescColor: v || '#6b7280' }); } },
                            { label: __('Quadrant Heading'), value: a.quadrantHeadColor, onChange: function (v) { setAttr({ quadrantHeadColor: v || '#374151' }); } },
                            { label: __('NEW Badge BG'), value: a.newBadgeBg, onChange: function (v) { setAttr({ newBadgeBg: v || '#fef9c3' }); } },
                            { label: __('NEW Badge Text'), value: a.newBadgeColor, onChange: function (v) { setAttr({ newBadgeColor: v || '#713f12' }); } }
                        ]
                    }),
                    el(PanelColorSettings, {
                        title: __('Ring Colors'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Adopt BG'), value: a.adoptBg, onChange: function (v) { setAttr({ adoptBg: v || '#dcfce7' }); } },
                            { label: __('Adopt Text'), value: a.adoptColor, onChange: function (v) { setAttr({ adoptColor: v || '#14532d' }); } },
                            { label: __('Adopt Border'), value: a.adoptBorder, onChange: function (v) { setAttr({ adoptBorder: v || '#16a34a' }); } },
                            { label: __('Trial BG'), value: a.trialBg, onChange: function (v) { setAttr({ trialBg: v || '#dbeafe' }); } },
                            { label: __('Trial Text'), value: a.trialColor, onChange: function (v) { setAttr({ trialColor: v || '#1e40af' }); } },
                            { label: __('Trial Border'), value: a.trialBorder, onChange: function (v) { setAttr({ trialBorder: v || '#2563eb' }); } },
                            { label: __('Assess BG'), value: a.assessBg, onChange: function (v) { setAttr({ assessBg: v || '#fef9c3' }); } },
                            { label: __('Assess Text'), value: a.assessColor, onChange: function (v) { setAttr({ assessColor: v || '#713f12' }); } },
                            { label: __('Assess Border'), value: a.assessBorder, onChange: function (v) { setAttr({ assessBorder: v || '#d97706' }); } },
                            { label: __('Hold BG'), value: a.holdBg, onChange: function (v) { setAttr({ holdBg: v || '#f3f4f6' }); } },
                            { label: __('Hold Text'), value: a.holdColor, onChange: function (v) { setAttr({ holdColor: v || '#374151' }); } },
                            { label: __('Hold Border'), value: a.holdBorder, onChange: function (v) { setAttr({ holdBorder: v || '#9ca3af' }); } }
                        ]
                    })
                ),
                el('div', useBlockProps((function () {
                    var _tvf = getTypoCssVars();
                    var s = { background: a.bgColor, borderRadius: a.borderRadius + 'px', border: '1px solid ' + a.borderColor, padding: 32, fontSize: a.fontSize + 'px', lineHeight: (a.lineHeight / 100).toFixed(2) };
                    if (_tvf) { Object.assign(s, _tvf(a.titleTypo, '--bktr-tt-')); }
                    return { className: 'bkbg-tr-wrap', style: s };
                })()),
                    el('div', { className: 'bkbg-tr-header' },
                        el('h2', { className: 'bkbg-tr-title', style: { color: a.titleColor } }, a.radarTitle),
                        a.showDescription && el('p', { className: 'bkbg-tr-desc', style: { color: a.descColor } }, a.description)
                    ),
                    preview
                )
            );
        },
        save: function (props) {
            var useBlockProps = wp.blockEditor.useBlockProps;
            var _tvf = getTypoCssVars();
            var s = {};
            if (_tvf) { Object.assign(s, _tvf(props.attributes.titleTypo, '--bktr-tt-')); }
            return el('div', useBlockProps.save({ style: Object.keys(s).length ? s : undefined }),
                el('div', { className: 'bkbg-tech-radar-app', 'data-opts': JSON.stringify(props.attributes) })
            );
        }
    });
}() );

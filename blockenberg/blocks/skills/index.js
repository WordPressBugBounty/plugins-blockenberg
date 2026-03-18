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

    var _tc; function getTC() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTV() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function buildTypoVars(a) {
        var fn = getTV(); if (!fn) return {};
        return Object.assign({},
            fn(a.titleTypo    || {}, '--bksk-tt-'),
            fn(a.categoryTypo || {}, '--bksk-ct-'),
            fn(a.skillTypo    || {}, '--bksk-sn-'),
            fn(a.levelTypo    || {}, '--bksk-lv-')
        );
    }

    var DISPLAY_OPTIONS = [
        { label: __('Bars',    'blockenberg'), value: 'bars' },
        { label: __('Dots',    'blockenberg'), value: 'dots' },
        { label: __('Tags',    'blockenberg'), value: 'tags' },
        { label: __('Circles', 'blockenberg'), value: 'circles' },
    ];

    function makeId() { return 'sk' + Math.random().toString(36).substr(2, 6); }

    /* ── Render a single skill item ─────────────────────────── */
    function SkillItem(props) {
        var skill = props.skill;
        var a = props.a;
        var levelLabel = a.levelLabels[skill.level - 1] || '';

        if (a.displayStyle === 'dots') {
            return el('div', { className: 'bkbg-skills-item bkbg-skills-item--dots', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' } },
                el('span', { className: 'bkbg-skills-name', style: { color: a.skillNameColor } }, skill.name),
                el('div', { style: { display: 'flex', gap: a.dotGap + 'px' } },
                    Array.from({ length: a.maxLevel }).map(function (_, i) {
                        return el('div', { key: i, style: { width: a.dotSize + 'px', height: a.dotSize + 'px', borderRadius: '50%', background: i < skill.level ? a.accentColor : a.trackColor } });
                    })
                )
            );
        }

        if (a.displayStyle === 'tags') {
            return el('span', { className: 'bkbg-skills-tag', style: { display: 'inline-block', background: a.accentColor + '16', color: a.accentColor, borderRadius: '99px', padding: '4px 14px' } }, skill.name);
        }

        if (a.displayStyle === 'circles') {
            var pct = Math.round((skill.level / a.maxLevel) * 100);
            var r = (a.circleSize / 2) - a.circleThickness;
            var circ = 2 * Math.PI * r;
            var dash = (pct / 100) * circ;
            return el('div', { className: 'bkbg-skills-item bkbg-skills-item--circle', style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' } },
                el('svg', { width: a.circleSize, height: a.circleSize, viewBox: '0 0 ' + a.circleSize + ' ' + a.circleSize, style: { transform: 'rotate(-90deg)' } },
                    el('circle', { cx: a.circleSize / 2, cy: a.circleSize / 2, r: r, fill: 'none', stroke: a.trackColor, strokeWidth: a.circleThickness }),
                    el('circle', { className: 'bkbg-skills-arc', cx: a.circleSize / 2, cy: a.circleSize / 2, r: r, fill: 'none', stroke: a.accentColor, strokeWidth: a.circleThickness, strokeLinecap: 'round', strokeDasharray: circ, strokeDashoffset: circ - dash, 'data-pct': pct })
                ),
                el('span', { className: 'bkbg-skills-name', style: { color: a.skillNameColor, textAlign: 'center' } }, skill.name),
                a.showLevels && el('span', { className: 'bkbg-skills-level', style: { color: a.levelColor } }, pct + '%')
            );
        }

        /* Default: bars */
        var pctBar = Math.round((skill.level / a.maxLevel) * 100);
        return el('div', { className: 'bkbg-skills-item bkbg-skills-item--bar' },
            el('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' } },
                el('span', { className: 'bkbg-skills-name', style: { color: a.skillNameColor } }, skill.name),
                a.showLevels && el('span', { className: 'bkbg-skills-level', style: { color: a.levelColor } }, levelLabel)
            ),
            el('div', { style: { height: a.barHeight + 'px', background: a.trackColor, borderRadius: a.barRadius + 'px', overflow: 'hidden' } },
                el('div', { className: 'bkbg-skills-fill', 'data-pct': pctBar, style: { height: '100%', width: pctBar + '%', background: a.accentColor, borderRadius: a.barRadius + 'px', transition: 'width 0.9s ease' } })
            )
        );
    }

    /* ── Render all categories ──────────────────────────────── */
    function SkillsPreview(props) {
        var a = props.a;
        var isCircles = a.displayStyle === 'circles';
        var isTags = a.displayStyle === 'tags';

        var gridStyle = {
            display: 'grid',
            gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)',
            gap: a.gap + 'px',
        };

        return el('div', { className: 'bkbg-skills bkbg-skills--' + a.displayStyle },
            a.showTitle && a.title && el('h2', { className: 'bkbg-skills-title', style: { color: a.titleColor, margin: '0 0 24px' } }, a.title),
            el('div', { style: gridStyle },
                a.categories.map(function (cat) {
                    var itemsWrap = isTags
                        ? { display: 'flex', flexWrap: 'wrap', gap: '8px' }
                        : isCircles
                        ? { display: 'flex', flexWrap: 'wrap', gap: a.dotGap + 'px' }
                        : { display: 'flex', flexDirection: 'column', gap: a.itemGap + 'px' };
                    return el('div', { key: cat.id, className: 'bkbg-skills-cat' },
                        a.showCategories && el('p', { className: 'bkbg-skills-cat-label', style: { color: a.categoryColor, margin: '0 0 14px' } }, cat.label),
                        el('div', { style: itemsWrap },
                            cat.items.map(function (skill) {
                                return el(SkillItem, { key: skill.id, skill: skill, a: a });
                            })
                        )
                    );
                })
            )
        );
    }

    registerBlockType('blockenberg/skills', {
        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var s = { paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px', backgroundColor: a.bgColor || undefined };
                Object.assign(s, buildTypoVars(a));
                return { style: s };
            })());

            function setCat(id, patch) {
                setAttributes({ categories: a.categories.map(function (c) { return c.id === id ? Object.assign({}, c, patch) : c; }) });
            }
            function addCat() {
                setAttributes({ categories: a.categories.concat([{ id: makeId(), label: 'New Category', items: [{ id: makeId(), name: 'New Skill', level: 3 }] }]) });
            }
            function removeCat(id) {
                if (a.categories.length <= 1) return;
                setAttributes({ categories: a.categories.filter(function (c) { return c.id !== id; }) });
            }
            function addSkill(catId) {
                setCat(catId, { items: a.categories.find(function (c) { return c.id === catId; }).items.concat([{ id: makeId(), name: 'New Skill', level: 3 }]) });
            }
            function removeSkill(catId, skillId) {
                var cat = a.categories.find(function (c) { return c.id === catId; });
                setCat(catId, { items: cat.items.filter(function (s) { return s.id !== skillId; }) });
            }
            function setSkill(catId, skillId, patch) {
                var cat = a.categories.find(function (c) { return c.id === catId; });
                setCat(catId, { items: cat.items.map(function (s) { return s.id === skillId ? Object.assign({}, s, patch) : s; }) });
            }

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: true },
                        el(SelectControl, { label: __('Display style', 'blockenberg'), value: a.displayStyle, options: DISPLAY_OPTIONS, onChange: function (v) { setAttributes({ displayStyle: v }); } }),
                        el(RangeControl, { label: __('Columns', 'blockenberg'), value: a.columns, min: 1, max: 4, onChange: function (v) { setAttributes({ columns: v }); } }),
                        el(ToggleControl, { label: __('Show categories', 'blockenberg'), checked: a.showCategories, onChange: function (v) { setAttributes({ showCategories: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show proficiency labels', 'blockenberg'), checked: a.showLevels, onChange: function (v) { setAttributes({ showLevels: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Animate on scroll', 'blockenberg'), checked: a.animateOnScroll, onChange: function (v) { setAttributes({ animateOnScroll: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show title', 'blockenberg'), checked: a.showTitle, onChange: function (v) { setAttributes({ showTitle: v }); }, __nextHasNoMarginBottom: true }),
                        a.showTitle && el(TextControl, { label: __('Title', 'blockenberg'), value: a.title, onChange: function (v) { setAttributes({ title: v }); } })
                    ),
                    a.displayStyle === 'bars' && el(PanelBody, { title: __('Bar Settings', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Bar height (px)', 'blockenberg'), value: a.barHeight, min: 4, max: 24, onChange: function (v) { setAttributes({ barHeight: v }); } }),
                        el(RangeControl, { label: __('Bar radius (px)', 'blockenberg'), value: a.barRadius, min: 0, max: 99, onChange: function (v) { setAttributes({ barRadius: v }); } })
                    ),
                    a.displayStyle === 'dots' && el(PanelBody, { title: __('Dot Settings', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Dot size (px)', 'blockenberg'), value: a.dotSize, min: 8, max: 24, onChange: function (v) { setAttributes({ dotSize: v }); } }),
                        el(RangeControl, { label: __('Dot gap (px)', 'blockenberg'), value: a.dotGap, min: 2, max: 12, onChange: function (v) { setAttributes({ dotGap: v }); } })
                    ),
                    a.displayStyle === 'circles' && el(PanelBody, { title: __('Circle Settings', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Circle size (px)', 'blockenberg'), value: a.circleSize, min: 48, max: 160, onChange: function (v) { setAttributes({ circleSize: v }); } }),
                        el(RangeControl, { label: __('Stroke thickness (px)', 'blockenberg'), value: a.circleThickness, min: 2, max: 20, onChange: function (v) { setAttributes({ circleThickness: v }); } })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        el(getTC(), { label: __('Title', 'blockenberg'), value: a.titleTypo || {}, onChange: function (v) { setAttributes({ titleTypo: v }); } }),
                        el(getTC(), { label: __('Category Label', 'blockenberg'), value: a.categoryTypo || {}, onChange: function (v) { setAttributes({ categoryTypo: v }); } }),
                        el(getTC(), { label: __('Skill Name', 'blockenberg'), value: a.skillTypo || {}, onChange: function (v) { setAttributes({ skillTypo: v }); } }),
                        el(getTC(), { label: __('Level Label', 'blockenberg'), value: a.levelTypo || {}, onChange: function (v) { setAttributes({ levelTypo: v }); } })
                    ),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Column gap (px)', 'blockenberg'), value: a.gap, min: 8, max: 80, onChange: function (v) { setAttributes({ gap: v }); } }),
                        el(RangeControl, { label: __('Item gap (px)', 'blockenberg'), value: a.itemGap, min: 4, max: 40, onChange: function (v) { setAttributes({ itemGap: v }); } }),
                        el(RangeControl, { label: __('Padding top (px)', 'blockenberg'), value: a.paddingTop, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    ),
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: a.accentColor,    onChange: function (v) { setAttributes({ accentColor: v || '' }); },    label: __('Accent / fill', 'blockenberg') },
                            { value: a.trackColor,     onChange: function (v) { setAttributes({ trackColor: v || '' }); },     label: __('Track', 'blockenberg') },
                            { value: a.titleColor,     onChange: function (v) { setAttributes({ titleColor: v || '' }); },     label: __('Title', 'blockenberg') },
                            { value: a.categoryColor,  onChange: function (v) { setAttributes({ categoryColor: v || '' }); },  label: __('Category label', 'blockenberg') },
                            { value: a.skillNameColor, onChange: function (v) { setAttributes({ skillNameColor: v || '' }); }, label: __('Skill name', 'blockenberg') },
                            { value: a.levelColor,     onChange: function (v) { setAttributes({ levelColor: v || '' }); },     label: __('Level label', 'blockenberg') },
                            { value: a.bgColor,        onChange: function (v) { setAttributes({ bgColor: v || '' }); },        label: __('Section background', 'blockenberg') },
                        ]
                    }),
                    el(PanelBody, { title: __('Categories & Skills', 'blockenberg'), initialOpen: false },
                        a.categories.map(function (cat) {
                            return el(PanelBody, { key: cat.id, title: cat.label || __('Category', 'blockenberg'), initialOpen: false },
                                el(TextControl, { label: __('Category name', 'blockenberg'), value: cat.label, onChange: function (v) { setCat(cat.id, { label: v }); } }),
                                cat.items.map(function (skill) {
                                    return el('div', { key: skill.id, style: { padding: '10px', background: '#f9fafb', borderRadius: '8px', marginBottom: '8px' } },
                                        el(TextControl, { label: __('Skill name', 'blockenberg'), value: skill.name, onChange: function (v) { setSkill(cat.id, skill.id, { name: v }); } }),
                                        el(RangeControl, { label: __('Level (1–' + a.maxLevel + ')', 'blockenberg'), value: skill.level, min: 1, max: a.maxLevel, onChange: function (v) { setSkill(cat.id, skill.id, { level: v }); } }),
                                        cat.items.length > 1 && el(Button, { onClick: function () { removeSkill(cat.id, skill.id); }, variant: 'tertiary', isDestructive: true, size: 'compact' }, __('Remove skill', 'blockenberg'))
                                    );
                                }),
                                el(Button, { onClick: function () { addSkill(cat.id); }, variant: 'secondary', size: 'compact', style: { marginBottom: '8px' } }, __('+ Add Skill', 'blockenberg')),
                                a.categories.length > 1 && el(Button, { onClick: function () { removeCat(cat.id); }, variant: 'tertiary', isDestructive: true, size: 'compact' }, __('Remove category', 'blockenberg'))
                            );
                        }),
                        el(Button, { onClick: addCat, variant: 'primary', style: { marginTop: '8px' } }, __('+ Add Category', 'blockenberg'))
                    )
                ),

                el('div', blockProps, el(SkillsPreview, { a: a }))
            );
        },

        deprecated: [{
            attributes: Object.assign({},
                wp.blocks.getBlockType('blockenberg/skills') && wp.blocks.getBlockType('blockenberg/skills').attributes || {},
                { titleTypo: { type: 'object', default: {} }, categoryTypo: { type: 'object', default: {} }, skillTypo: { type: 'object', default: {} }, levelTypo: { type: 'object', default: {} } }
            ),
            migrate: function (a) {
                return Object.assign({}, a, {
                    titleTypo: { sizeDesktop: a.titleSize || 22, weight: String(a.titleFontWeight || 700) },
                    categoryTypo: { sizeDesktop: a.categorySize || 13 },
                    skillTypo: { sizeDesktop: a.skillNameSize || 14, weight: String(a.skillNameFontWeight || 500) },
                    levelTypo: { sizeDesktop: a.levelSize || 12 }
                });
            },
            save: function (props) {
                var a = props.attributes;
                var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkbg-skills-wrap' });
                var isCircles = a.displayStyle === 'circles';
                var isTags = a.displayStyle === 'tags';

                return el('div', Object.assign({}, blockProps, { style: { paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px', backgroundColor: a.bgColor || undefined } }),
                    el('div', { className: 'bkbg-skills bkbg-skills--' + a.displayStyle, 'data-animate': a.animateOnScroll ? '1' : '0' },
                        a.showTitle && a.title && el('h2', { style: { fontSize: a.titleSize + 'px', color: a.titleColor, margin: '0 0 24px' } }, a.title),
                        el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)', gap: a.gap + 'px' } },
                            a.categories.map(function (cat) {
                                var itemsWrap = isTags ? { display: 'flex', flexWrap: 'wrap', gap: '8px' }
                                    : isCircles ? { display: 'flex', flexWrap: 'wrap', gap: a.dotGap + 'px' }
                                    : { display: 'flex', flexDirection: 'column', gap: a.itemGap + 'px' };
                                return el('div', { key: cat.id, className: 'bkbg-skills-cat' },
                                    a.showCategories && el('p', { style: { fontSize: a.categorySize + 'px', color: a.categoryColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 14px' } }, cat.label),
                                    el('div', { style: itemsWrap },
                                        cat.items.map(function (skill) {
                                            var levelLabel = a.levelLabels[skill.level - 1] || '';
                                            var pct = Math.round((skill.level / a.maxLevel) * 100);

                                            if (a.displayStyle === 'dots') {
                                                return el('div', { key: skill.id, className: 'bkbg-skills-item bkbg-skills-item--dots', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' } },
                                                    el('span', { style: { fontSize: a.skillNameSize + 'px', color: a.skillNameColor, fontWeight: 500 } }, skill.name),
                                                    el('div', { style: { display: 'flex', gap: a.dotGap + 'px' } },
                                                        Array.from({ length: a.maxLevel }).map(function (_, i) {
                                                            return el('div', { key: i, style: { width: a.dotSize + 'px', height: a.dotSize + 'px', borderRadius: '50%', background: i < skill.level ? a.accentColor : a.trackColor } });
                                                        })
                                                    )
                                                );
                                            }
                                            if (a.displayStyle === 'tags') {
                                                return el('span', { key: skill.id, className: 'bkbg-skills-tag', style: { display: 'inline-block', background: a.accentColor + '16', color: a.accentColor, borderRadius: '99px', padding: '4px 14px', fontSize: a.skillNameSize + 'px', fontWeight: 600 } }, skill.name);
                                            }
                                            if (a.displayStyle === 'circles') {
                                                var r = (a.circleSize / 2) - a.circleThickness;
                                                var circ = 2 * Math.PI * r;
                                                var dash = (pct / 100) * circ;
                                                return el('div', { key: skill.id, className: 'bkbg-skills-item bkbg-skills-item--circle', style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' } },
                                                    el('svg', { width: a.circleSize, height: a.circleSize, viewBox: '0 0 ' + a.circleSize + ' ' + a.circleSize, style: { transform: 'rotate(-90deg)' } },
                                                        el('circle', { cx: a.circleSize / 2, cy: a.circleSize / 2, r: r, fill: 'none', stroke: a.trackColor, strokeWidth: a.circleThickness }),
                                                        el('circle', { className: 'bkbg-skills-arc', cx: a.circleSize / 2, cy: a.circleSize / 2, r: r, fill: 'none', stroke: a.accentColor, strokeWidth: a.circleThickness, strokeLinecap: 'round', strokeDasharray: circ, strokeDashoffset: circ - dash, 'data-pct': pct, 'data-circ': circ })
                                                    ),
                                                    el('span', { style: { fontSize: a.skillNameSize + 'px', color: a.skillNameColor, fontWeight: 600, textAlign: 'center' } }, skill.name),
                                                    a.showLevels && el('span', { style: { fontSize: a.levelSize + 'px', color: a.levelColor } }, pct + '%')
                                                );
                                            }
                                            /* bars */
                                            return el('div', { key: skill.id, className: 'bkbg-skills-item bkbg-skills-item--bar' },
                                                el('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' } },
                                                    el('span', { style: { fontSize: a.skillNameSize + 'px', color: a.skillNameColor, fontWeight: 500 } }, skill.name),
                                                    a.showLevels && el('span', { style: { fontSize: a.levelSize + 'px', color: a.levelColor } }, levelLabel)
                                                ),
                                                el('div', { style: { height: a.barHeight + 'px', background: a.trackColor, borderRadius: a.barRadius + 'px', overflow: 'hidden' } },
                                                    el('div', { className: 'bkbg-skills-fill', 'data-pct': pct, style: { height: '100%', width: '0%', background: a.accentColor, borderRadius: a.barRadius + 'px' } })
                                                )
                                            );
                                        })
                                    )
                                );
                            })
                        )
                    )
                );
            }
        }],

        save: function (props) {
            var a = props.attributes;
            var bp = wp.blockEditor.useBlockProps.save((function () {
                var s = { paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px', backgroundColor: a.bgColor || undefined };
                Object.assign(s, buildTypoVars(a));
                return { className: 'bkbg-skills-wrap', style: s };
            })());
            var isCircles = a.displayStyle === 'circles';
            var isTags = a.displayStyle === 'tags';

            return el('div', bp,
                el('div', { className: 'bkbg-skills bkbg-skills--' + a.displayStyle, 'data-animate': a.animateOnScroll ? '1' : '0' },
                    a.showTitle && a.title && el('h2', { className: 'bkbg-skills-title', style: { color: a.titleColor, margin: '0 0 24px' } }, a.title),
                    el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)', gap: a.gap + 'px' } },
                        a.categories.map(function (cat) {
                            var itemsWrap = isTags ? { display: 'flex', flexWrap: 'wrap', gap: '8px' }
                                : isCircles ? { display: 'flex', flexWrap: 'wrap', gap: a.dotGap + 'px' }
                                : { display: 'flex', flexDirection: 'column', gap: a.itemGap + 'px' };
                            return el('div', { key: cat.id, className: 'bkbg-skills-cat' },
                                a.showCategories && el('p', { className: 'bkbg-skills-cat-label', style: { color: a.categoryColor, margin: '0 0 14px' } }, cat.label),
                                el('div', { style: itemsWrap },
                                    cat.items.map(function (skill) {
                                        var levelLabel = a.levelLabels[skill.level - 1] || '';
                                        var pct = Math.round((skill.level / a.maxLevel) * 100);

                                        if (a.displayStyle === 'dots') {
                                            return el('div', { key: skill.id, className: 'bkbg-skills-item bkbg-skills-item--dots', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' } },
                                                el('span', { className: 'bkbg-skills-name', style: { color: a.skillNameColor } }, skill.name),
                                                el('div', { style: { display: 'flex', gap: a.dotGap + 'px' } },
                                                    Array.from({ length: a.maxLevel }).map(function (_, i) {
                                                        return el('div', { key: i, style: { width: a.dotSize + 'px', height: a.dotSize + 'px', borderRadius: '50%', background: i < skill.level ? a.accentColor : a.trackColor } });
                                                    })
                                                )
                                            );
                                        }
                                        if (a.displayStyle === 'tags') {
                                            return el('span', { key: skill.id, className: 'bkbg-skills-tag', style: { display: 'inline-block', background: a.accentColor + '16', color: a.accentColor, borderRadius: '99px', padding: '4px 14px' } }, skill.name);
                                        }
                                        if (a.displayStyle === 'circles') {
                                            var r = (a.circleSize / 2) - a.circleThickness;
                                            var circ = 2 * Math.PI * r;
                                            var dash = (pct / 100) * circ;
                                            return el('div', { key: skill.id, className: 'bkbg-skills-item bkbg-skills-item--circle', style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' } },
                                                el('svg', { width: a.circleSize, height: a.circleSize, viewBox: '0 0 ' + a.circleSize + ' ' + a.circleSize, style: { transform: 'rotate(-90deg)' } },
                                                    el('circle', { cx: a.circleSize / 2, cy: a.circleSize / 2, r: r, fill: 'none', stroke: a.trackColor, strokeWidth: a.circleThickness }),
                                                    el('circle', { className: 'bkbg-skills-arc', cx: a.circleSize / 2, cy: a.circleSize / 2, r: r, fill: 'none', stroke: a.accentColor, strokeWidth: a.circleThickness, strokeLinecap: 'round', strokeDasharray: circ, strokeDashoffset: circ - dash, 'data-pct': pct, 'data-circ': circ })
                                                ),
                                                el('span', { className: 'bkbg-skills-name', style: { color: a.skillNameColor, textAlign: 'center' } }, skill.name),
                                                a.showLevels && el('span', { className: 'bkbg-skills-level', style: { color: a.levelColor } }, pct + '%')
                                            );
                                        }
                                        /* bars */
                                        return el('div', { key: skill.id, className: 'bkbg-skills-item bkbg-skills-item--bar' },
                                            el('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px' } },
                                                el('span', { className: 'bkbg-skills-name', style: { color: a.skillNameColor } }, skill.name),
                                                a.showLevels && el('span', { className: 'bkbg-skills-level', style: { color: a.levelColor } }, levelLabel)
                                            ),
                                            el('div', { style: { height: a.barHeight + 'px', background: a.trackColor, borderRadius: a.barRadius + 'px', overflow: 'hidden' } },
                                                el('div', { className: 'bkbg-skills-fill', 'data-pct': pct, style: { height: '100%', width: '0%', background: a.accentColor, borderRadius: a.barRadius + 'px' } })
                                            )
                                        );
                                    })
                                )
                            );
                        })
                    )
                )
            );
        }
    });
}() );

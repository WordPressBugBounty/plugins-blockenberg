( function () {
    var el                = wp.element.createElement;
    var useState          = wp.element.useState;
    var Fragment          = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __                = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps     = wp.blockEditor.useBlockProps;
    var PanelBody         = wp.components.PanelBody;
    var RangeControl      = wp.components.RangeControl;
    var SelectControl     = wp.components.SelectControl;
    var TextControl       = wp.components.TextControl;
    var ToggleControl     = wp.components.ToggleControl;
    var Button            = wp.components.Button;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }

    /* ── Daily Value reference amounts ─────────────────── */
    var DV = {
        totalFat: 78, saturatedFat: 20, cholesterol: 300,
        sodium: 2300, totalCarbs: 275, dietaryFiber: 28,
        addedSugars: 50, protein: 50,
        vitaminD: 20, calcium: 1300, iron: 18, potassium: 4700
    };

    function pct(val, key) {
        if (!DV[key] || !val) return null;
        return Math.round((val / DV[key]) * 100);
    }

    /* ── Nutrition label renderer ───────────────────────── */
    function NutritionLabelPreview(props) {
        var a = props.attributes;
        var set = props.setAttributes;

        function field(label, val, key, unit, bold, indent) {
            var dv = pct(val, key);
            return el('div', {
                className: 'bkbg-nl-row' + (bold ? ' bkbg-nl-bold' : '') + (indent ? ' bkbg-nl-indent' : ''),
                style: { borderTop: '1px solid ' + a.borderColor }
            },
                el('span', { className: 'bkbg-nl-nutrient' },
                    el('span', { style: { fontWeight: bold ? '700' : '400' } }, label),
                    el('span', { style: { fontWeight: '400', marginLeft: 2 } }, ' ' + val + unit)
                ),
                dv !== null ? el('span', {
                    className: 'bkbg-nl-dv',
                    style: { color: a.dvColor }
                }, el('strong', null, dv + '%')) : null
            );
        }

        var containerStyle = {
            paddingTop: a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
            background: a.containerBg || undefined,
            display: 'flex',
            justifyContent: 'center'
        };

        var labelStyle = {
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: a.fontSize + 'px',
            background: a.bgColor,
            color: a.accentColor,
            border: a.borderWidth + 'px solid ' + a.borderColor,
            borderRadius: a.borderRadius + 'px',
            width: a.labelWidth + 'px',
            maxWidth: '100%',
            padding: '8px 8px 4px',
            boxSizing: 'border-box'
        };

        return el(Fragment, null,
            el('div', { className: 'bkbg-nl-wrap', style: containerStyle },
                el('div', { className: 'bkbg-nl-label', style: labelStyle },

                    /* header */
                    el('div', { className: 'bkbg-nl-header' },
                        el('div', { className: 'bkbg-nl-title' }, 'Nutrition Facts'),
                        a.foodName ? el('div', { className: 'bkbg-nl-foodname', style: { fontSize: a.fontSize * 0.9 + 'px', marginTop: 2 } }, a.foodName) : null,
                        el('div', { className: 'bkbg-nl-servings', style: { borderTop: '4px solid ' + a.borderColor, borderBottom: '4px solid ' + a.borderColor, padding: '2px 0', margin: '4px 0', fontSize: a.fontSize * 0.85 + 'px' } },
                            el('div', null, a.servingsPerContainer + ' servings per container'),
                            el('div', { style: { display: 'flex', justifyContent: 'space-between', fontWeight: '700' } },
                                el('span', null, 'Serving size'),
                                el('span', null, a.servingSize)
                            )
                        )
                    ),

                    /* calories */
                    el('div', { className: 'bkbg-nl-calories-block', style: { borderBottom: '8px solid ' + a.borderColor, paddingBottom: 4 } },
                        el('div', { style: { fontSize: a.fontSize * 0.75 + 'px', fontWeight: '700' } }, 'Amount per serving'),
                        el('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' } },
                            el('div', { style: { fontSize: a.fontSize * 1.1 + 'px', fontWeight: '700' } }, 'Calories'),
                            el('div', { style: { fontSize: a.fontSize * 2.8 + 'px', fontWeight: '900', lineHeight: 1, color: a.calorieColor } }, a.calories)
                        )
                    ),

                    /* % DV header */
                    el('div', { style: { textAlign: 'right', fontSize: a.fontSize * 0.75 + 'px', borderBottom: '1px solid ' + a.borderColor, paddingBottom: 2 } },
                        el('strong', null, '% Daily Value*')
                    ),

                    /* fats */
                    field('Total Fat', a.totalFat, 'totalFat', 'g', true, false),
                    field('Saturated Fat', a.saturatedFat, 'saturatedFat', 'g', false, true),
                    el('div', { className: 'bkbg-nl-row bkbg-nl-indent', style: { borderTop: '1px solid ' + a.borderColor } },
                        el('span', { className: 'bkbg-nl-nutrient' },
                            el('em', null, 'Trans'), ' Fat ', a.transFat + 'g'
                        )
                    ),
                    a.showPolyMono ? field('Polyunsaturated Fat', a.polyFat, null, 'g', false, true) : null,
                    a.showPolyMono ? field('Monounsaturated Fat', a.monoFat, null, 'g', false, true) : null,

                    /* cholesterol / sodium */
                    field('Cholesterol', a.cholesterol, 'cholesterol', 'mg', true, false),
                    field('Sodium', a.sodium, 'sodium', 'mg', true, false),

                    /* carbs */
                    field('Total Carbohydrate', a.totalCarbs, 'totalCarbs', 'g', true, false),
                    field('Dietary Fiber', a.dietaryFiber, 'dietaryFiber', 'g', false, true),
                    el('div', { className: 'bkbg-nl-row bkbg-nl-indent', style: { borderTop: '1px solid ' + a.borderColor } },
                        el('span', { className: 'bkbg-nl-nutrient' }, 'Total Sugars ', a.totalSugars + 'g')
                    ),
                    a.showAddedSugars ? el('div', { className: 'bkbg-nl-row bkbg-nl-indent2', style: { borderTop: '1px solid ' + a.borderColor } },
                        el('span', { className: 'bkbg-nl-nutrient' }, 'Includes ' + a.addedSugars + 'g Added Sugars'),
                        el('span', { className: 'bkbg-nl-dv', style: { color: a.dvColor } }, el('strong', null, pct(a.addedSugars, 'addedSugars') + '%'))
                    ) : null,

                    /* protein */
                    el('div', { className: 'bkbg-nl-row', style: { borderTop: '4px solid ' + a.borderColor } },
                        el('span', { className: 'bkbg-nl-nutrient' }, el('strong', null, 'Protein '), a.protein + 'g')
                    ),

                    /* vitamins */
                    a.showVitamins ? el(Fragment, null,
                        el('div', { style: { borderTop: '8px solid ' + a.borderColor } }),
                        el('div', { className: 'bkbg-nl-vitamins', style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 8px', padding: '4px 0', fontSize: a.fontSize * 0.85 + 'px' } },
                            el('span', null, 'Vitamin D ' + a.vitaminD + 'mcg'),
                            el('span', null, pct(a.vitaminD, 'vitaminD') + '%'),
                            el('span', null, 'Calcium ' + a.calcium + 'mg'),
                            el('span', null, pct(a.calcium, 'calcium') + '%'),
                            el('span', null, 'Iron ' + a.iron + 'mg'),
                            el('span', null, pct(a.iron, 'iron') + '%'),
                            el('span', null, 'Potassium ' + a.potassium + 'mg'),
                            el('span', null, pct(a.potassium, 'potassium') + '%')
                        )
                    ) : null,

                    /* footnote */
                    a.showFootnote ? el('div', { className: 'bkbg-nl-footnote', style: { borderTop: '4px solid ' + a.borderColor, fontSize: a.fontSize * 0.72 + 'px', paddingTop: 4 } },
                        '* The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. ' + a.dvRef + ' calories a day is used for general nutrition advice.'
                    ) : null
                )
            )
        );
    }

    /* ── Inspector ──────────────────────────────────────── */
    function NutritionLabelEdit(props) {
        var a = props.attributes;
        var set = props.setAttributes;
        var blockProps = useBlockProps((function () {
            var _tvf = getTypoCssVars();
            var s = {};
            if (_tvf) { Object.assign(s, _tvf(a.titleTypo, '--bkbg-nutl-tt-')); }
            return { className: 'bkbg-nl-editor-wrap', style: s };
        })());

        function n(key) { return function(v) { var o = {}; o[key] = typeof v === 'number' ? v : Number(v) || 0; set(o); }; }
        function s(key) { return function(v) { var o = {}; o[key] = v; set(o); }; }
        function t(key) { return function(v) { var o = {}; o[key] = v; set(o); }; }

        return el(Fragment, null,
            el(InspectorControls, null,

                /* Serving */
                el(PanelBody, { title: __('Serving Info', 'blockenberg'), initialOpen: true },
                    el(TextControl, { label: __('Food Name (optional)', 'blockenberg'), value: a.foodName, onChange: s('foodName') }),
                    el(TextControl, { label: __('Serving Size', 'blockenberg'), value: a.servingSize, onChange: s('servingSize'), help: __('e.g. 1 cup (240g)', 'blockenberg') }),
                    el(TextControl, { label: __('Servings Per Container', 'blockenberg'), value: a.servingsPerContainer, onChange: s('servingsPerContainer') }),
                    el(TextControl, { label: __('Calories', 'blockenberg'), value: String(a.calories), onChange: n('calories'), type: 'number' })
                ),

                /* Fats */
                el(PanelBody, { title: __('Fats', 'blockenberg'), initialOpen: false },
                    el(TextControl, { label: __('Total Fat (g)', 'blockenberg'), value: String(a.totalFat), onChange: n('totalFat'), type: 'number' }),
                    el(TextControl, { label: __('Saturated Fat (g)', 'blockenberg'), value: String(a.saturatedFat), onChange: n('saturatedFat'), type: 'number' }),
                    el(TextControl, { label: __('Trans Fat (g)', 'blockenberg'), value: String(a.transFat), onChange: n('transFat'), type: 'number' }),
                    el(ToggleControl, { label: __('Show Poly/Mono Fat', 'blockenberg'), checked: a.showPolyMono, onChange: t('showPolyMono'), __nextHasNoMarginBottom: true }),
                    a.showPolyMono ? el(TextControl, { label: __('Polyunsaturated Fat (g)', 'blockenberg'), value: String(a.polyFat), onChange: n('polyFat'), type: 'number' }) : null,
                    a.showPolyMono ? el(TextControl, { label: __('Monounsaturated Fat (g)', 'blockenberg'), value: String(a.monoFat), onChange: n('monoFat'), type: 'number' }) : null
                ),

                /* Carbs & Other */
                el(PanelBody, { title: __('Carbs & Other', 'blockenberg'), initialOpen: false },
                    el(TextControl, { label: __('Cholesterol (mg)', 'blockenberg'), value: String(a.cholesterol), onChange: n('cholesterol'), type: 'number' }),
                    el(TextControl, { label: __('Sodium (mg)', 'blockenberg'), value: String(a.sodium), onChange: n('sodium'), type: 'number' }),
                    el(TextControl, { label: __('Total Carbohydrate (g)', 'blockenberg'), value: String(a.totalCarbs), onChange: n('totalCarbs'), type: 'number' }),
                    el(TextControl, { label: __('Dietary Fiber (g)', 'blockenberg'), value: String(a.dietaryFiber), onChange: n('dietaryFiber'), type: 'number' }),
                    el(TextControl, { label: __('Total Sugars (g)', 'blockenberg'), value: String(a.totalSugars), onChange: n('totalSugars'), type: 'number' }),
                    el(ToggleControl, { label: __('Show Added Sugars', 'blockenberg'), checked: a.showAddedSugars, onChange: t('showAddedSugars'), __nextHasNoMarginBottom: true }),
                    a.showAddedSugars ? el(TextControl, { label: __('Added Sugars (g)', 'blockenberg'), value: String(a.addedSugars), onChange: n('addedSugars'), type: 'number' }) : null,
                    el(TextControl, { label: __('Protein (g)', 'blockenberg'), value: String(a.protein), onChange: n('protein'), type: 'number' })
                ),

                /* Vitamins */
                el(PanelBody, { title: __('Vitamins & Minerals', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Vitamins Section', 'blockenberg'), checked: a.showVitamins, onChange: t('showVitamins'), __nextHasNoMarginBottom: true }),
                    a.showVitamins ? el(Fragment, null,
                        el(TextControl, { label: __('Vitamin D (mcg)', 'blockenberg'), value: String(a.vitaminD), onChange: n('vitaminD'), type: 'number' }),
                        el(TextControl, { label: __('Calcium (mg)', 'blockenberg'), value: String(a.calcium), onChange: n('calcium'), type: 'number' }),
                        el(TextControl, { label: __('Iron (mg)', 'blockenberg'), value: String(a.iron), onChange: n('iron'), type: 'number' }),
                        el(TextControl, { label: __('Potassium (mg)', 'blockenberg'), value: String(a.potassium), onChange: n('potassium'), type: 'number' })
                    ) : null
                ),

                /* Display */
                el(PanelBody, { title: __('Display', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, { label: __('Show Footnote', 'blockenberg'), checked: a.showFootnote, onChange: t('showFootnote'), __nextHasNoMarginBottom: true }),
                    el(TextControl, { label: __('Daily Value Reference (cal)', 'blockenberg'), value: a.dvRef, onChange: s('dvRef'), type: 'number' })
                ),

                /* Colors */
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    el(getTypoControl(), { label: __('Title Typography', 'blockenberg'), value: a.titleTypo, onChange: function(v){ set({titleTypo:v}); } }),
                    el(RangeControl, { label: __('Base Font Size (px)', 'blockenberg'), value: a.fontSize, onChange: n('fontSize'), min: 10, max: 20 })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: a.bgColor, onChange: s('bgColor'), label: __('Label Background', 'blockenberg') },
                        { value: a.accentColor, onChange: s('accentColor'), label: __('Text Color', 'blockenberg') },
                        { value: a.borderColor, onChange: s('borderColor'), label: __('Border Color', 'blockenberg') },
                        { value: a.calorieColor, onChange: s('calorieColor'), label: __('Calorie Number', 'blockenberg') },
                        { value: a.dvColor, onChange: s('dvColor'), label: __('% DV Color', 'blockenberg') },
                        { value: a.containerBg, onChange: s('containerBg'), label: __('Section Background', 'blockenberg') }
                    ]
                }),

                /* Sizing */
                el(PanelBody, { title: __('Sizing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, { label: __('Label Width (px)', 'blockenberg'), value: a.labelWidth, onChange: n('labelWidth'), min: 200, max: 600, step: 10 }),
                    el(RangeControl, { label: __('Border Width (px)', 'blockenberg'), value: a.borderWidth, onChange: n('borderWidth'), min: 1, max: 8 }),
                    el(RangeControl, { label: __('Border Radius (px)', 'blockenberg'), value: a.borderRadius, onChange: n('borderRadius'), min: 0, max: 24 }),
                    el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), value: a.paddingTop, onChange: n('paddingTop'), min: 0, max: 120 }),
                    el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), value: a.paddingBottom, onChange: n('paddingBottom'), min: 0, max: 120 })
                )
            ),

            el('div', blockProps,
                el(NutritionLabelPreview, { attributes: a, setAttributes: set })
            )
        );
    }

    registerBlockType('blockenberg/nutrition-label', {
        edit: NutritionLabelEdit,
        save: function (props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save({
                className: 'bkbg-nl-app',
                'data-opts': JSON.stringify(a)
            }));
        }
    });
}() );

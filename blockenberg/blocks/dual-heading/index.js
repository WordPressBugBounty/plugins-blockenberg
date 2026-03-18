( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelBody = wp.components.PanelBody;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var ToggleControl = wp.components.ToggleControl;

    var _dhTC, _dhTV;
    function _tc() { return _dhTC || (_dhTC = window.bkbgTypographyControl); }
    function _tv(t, p) { return (_dhTV || (_dhTV = window.bkbgTypoCssVars)) ? _dhTV(t, p) : {}; }

    function buildLineStyle(color, effect, effectColor, effectColor2, strokeColor, strokeWidth) {
        var base = {
            display: 'block',
            color: color
        };
        if (effect === 'gradient') {
            base.background = 'linear-gradient(90deg, ' + effectColor + ', ' + effectColor2 + ')';
            base.WebkitBackgroundClip = 'text';
            base.WebkitTextFillColor = 'transparent';
            base.backgroundClip = 'text';
        } else if (effect === 'stroke') {
            base.color = 'transparent';
            base.WebkitTextStroke = strokeWidth + 'px ' + strokeColor;
        } else if (effect === 'highlight') {
            base.background = effectColor;
            base.display = 'inline';
            base.padding = '2px 8px';
            base.borderRadius = '4px';
        } else if (effect === 'marker') {
            base.background = 'linear-gradient(transparent 60%, ' + effectColor + ' 60%)';
            base.display = 'inline';
        }
        return base;
    }

    var effectOptions = [
        { label: __('None', 'blockenberg'), value: 'none' },
        { label: __('Gradient (color wash)', 'blockenberg'), value: 'gradient' },
        { label: __('Highlight (box behind)', 'blockenberg'), value: 'highlight' },
        { label: __('Marker (underline wash)', 'blockenberg'), value: 'marker' },
        { label: __('Stroke (outline only)', 'blockenberg'), value: 'stroke' }
    ];

    var weightOptions = [
        { label: '300 – Light', value: '300' },
        { label: '400 – Regular', value: '400' },
        { label: '500 – Medium', value: '500' },
        { label: '600 – Semibold', value: '600' },
        { label: '700 – Bold', value: '700' },
        { label: '800 – Extrabold', value: '800' },
        { label: '900 – Black', value: '900' }
    ];

    registerBlockType('blockenberg/dual-heading', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;
            var blockProps = useBlockProps({ className: 'bkbg-dh-wrap bkbg-dh-editor', style: Object.assign(
                { '--bkbg-dh-l1-fs': (attr.line1Size || 52) + 'px', '--bkbg-dh-l2-fs': (attr.line2Size || 52) + 'px', '--bkbg-dh-sub-fs': (attr.subtextSize || 18) + 'px' },
                _tv(attr.typoLine1 || {}, '--bkbg-dh-l1-'),
                _tv(attr.typoLine2 || {}, '--bkbg-dh-l2-'),
                _tv(attr.typoSubtext || {}, '--bkbg-dh-sub-')
            ) });

            var line1Style = buildLineStyle(attr.line1Color, attr.line1Effect, attr.effectColor, attr.effectColor2, attr.strokeColor, attr.strokeWidth);
            var line2Style = buildLineStyle(attr.line2Color, attr.line2Effect, attr.effectColor, attr.effectColor2, attr.strokeColor, attr.strokeWidth);

            var wrapStyle = {
                background: attr.bgColor || undefined,
                paddingTop: attr.paddingTop + 'px',
                paddingBottom: attr.paddingBottom + 'px'
            };
            var innerStyle = {
                maxWidth: attr.maxWidth + 'px',
                margin: '0 auto',
                padding: '0 20px',
                textAlign: attr.textAlign
            };
            var headingWrapStyle = attr.layout === 'inline'
                ? { display: 'flex', flexWrap: 'wrap', gap: '0 12px', alignItems: 'baseline', justifyContent: attr.textAlign === 'center' ? 'center' : (attr.textAlign === 'right' ? 'flex-end' : 'flex-start') }
                : { display: 'flex', flexDirection: 'column', gap: attr.lineGap + 'px' };

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                        el(SelectControl, { label: __('Tag', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.tag,
                            options: ['h1','h2','h3','h4','h5','p'].map(function (t) { return { label: t.toUpperCase(), value: t }; }),
                            onChange: function (v) { setAttr({ tag: v }); } }),
                        el(SelectControl, { label: __('Arrangement', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.layout,
                            options: [{ label: __('Stacked (one line per row)', 'blockenberg'), value: 'stacked' }, { label: __('Inline (both on same line)', 'blockenberg'), value: 'inline' }],
                            onChange: function (v) { setAttr({ layout: v }); } }),
                        el(SelectControl, { label: __('Text Align', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.textAlign,
                            options: [{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }],
                            onChange: function (v) { setAttr({ textAlign: v }); } }),
                        attr.layout === 'stacked' && el(RangeControl, { label: __('Gap Between Lines (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.lineGap, min: 0, max: 40, onChange: function (v) { setAttr({ lineGap: v }); } })
                    ),
                    el(PanelBody, { title: __('Line 1 Typography', 'blockenberg'), initialOpen: false },
                        _tc() && el(_tc(), { label: __('Line 1', 'blockenberg'), typo: attr.typoLine1 || {}, onChange: function (v) { setAttr({ typoLine1: v }); }, defaultSize: attr.line1Size || 52 }),
                        el(SelectControl, { label: __('Effect', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.line1Effect, options: effectOptions, onChange: function (v) { setAttr({ line1Effect: v }); } })
                    ),
                    el(PanelBody, { title: __('Line 2 Typography', 'blockenberg'), initialOpen: false },
                        _tc() && el(_tc(), { label: __('Line 2', 'blockenberg'), typo: attr.typoLine2 || {}, onChange: function (v) { setAttr({ typoLine2: v }); }, defaultSize: attr.line2Size || 52 }),
                        el(SelectControl, { label: __('Effect', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.line2Effect, options: effectOptions, onChange: function (v) { setAttr({ line2Effect: v }); } })
                    ),
                    el(PanelBody, { title: __('Subtext Typography', 'blockenberg'), initialOpen: false },
                        _tc() && el(_tc(), { label: __('Subtext', 'blockenberg'), typo: attr.typoSubtext || {}, onChange: function (v) { setAttr({ typoSubtext: v }); }, defaultSize: attr.subtextSize || 18 }),
                        el(ToggleControl, { label: __('Show Subtext', 'blockenberg'), __nextHasNoMarginBottom: true, checked: attr.showSubtext, onChange: function (v) { setAttr({ showSubtext: v }); } })
                    ),
                    el(PanelBody, { title: __('Effect Colors', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Stroke Width (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.strokeWidth, min: 1, max: 6, onChange: function (v) { setAttr({ strokeWidth: v }); } }),
                        el(RangeControl, { label: __('Max Width (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.maxWidth, min: 300, max: 1400, step: 10, onChange: function (v) { setAttr({ maxWidth: v }); } }),
                        el(RangeControl, { label: __('Padding Top (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.paddingTop, min: 0, max: 200, onChange: function (v) { setAttr({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding Bottom (px)', 'blockenberg'), __nextHasNoMarginBottom: true, value: attr.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttr({ paddingBottom: v }); } }),
                        ),
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { value: attr.bgColor,       onChange: function (v) { setAttr({ bgColor: v || '' }); },       label: __('Background', 'blockenberg') },
                            { value: attr.line1Color,    onChange: function (v) { setAttr({ line1Color: v || '#111827' }); },    label: __('Line 1 Color', 'blockenberg') },
                            { value: attr.line2Color,    onChange: function (v) { setAttr({ line2Color: v || '#7c3aed' }); },    label: __('Line 2 Color', 'blockenberg') },
                            { value: attr.effectColor,   onChange: function (v) { setAttr({ effectColor: v || '#fef08a' }); },   label: __('Effect Color 1 (gradient/highlight)', 'blockenberg') },
                            { value: attr.effectColor2,  onChange: function (v) { setAttr({ effectColor2: v || '#f97316' }); },  label: __('Effect Color 2 (gradient end)', 'blockenberg') },
                            { value: attr.strokeColor,   onChange: function (v) { setAttr({ strokeColor: v || '#7c3aed' }); },   label: __('Stroke Color', 'blockenberg') },
                            { value: attr.subtextColor,  onChange: function (v) { setAttr({ subtextColor: v || '#6b7280' }); },  label: __('Subtext', 'blockenberg') }
                        ]
                    })
                ),
                el('div', blockProps,
                    el('div', { style: wrapStyle },
                        el('div', { style: innerStyle },
                            el(attr.tag, { style: { margin: 0 } },
                                el('span', { style: headingWrapStyle },
                                    el(RichText, { tagName: 'span', className: 'bkbg-dh-line bkbg-dh-line-1', value: attr.line1, onChange: function (v) { setAttr({ line1: v }); },
                                        style: line1Style, placeholder: __('Line 1…', 'blockenberg') }),
                                    el(RichText, { tagName: 'span', className: 'bkbg-dh-line bkbg-dh-line-2', value: attr.line2, onChange: function (v) { setAttr({ line2: v }); },
                                        style: line2Style, placeholder: __('Line 2…', 'blockenberg') })
                                )
                            ),
                            attr.showSubtext && el(RichText, { tagName: 'p', className: 'bkbg-dh-subtext', value: attr.subtext, onChange: function (v) { setAttr({ subtext: v }); },
                                style: { color: attr.subtextColor, margin: '16px 0 0' },
                                placeholder: __('Subtext…', 'blockenberg') })
                        )
                    )
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-dual-heading-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );

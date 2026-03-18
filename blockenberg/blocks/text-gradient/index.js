( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText = wp.blockEditor.RichText;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var TAG_OPTIONS = [
        { label: 'H1', value: 'h1' }, { label: 'H2', value: 'h2' },
        { label: 'H3', value: 'h3' }, { label: 'H4', value: 'h4' },
        { label: 'H5', value: 'h5' }, { label: 'H6', value: 'h6' },
        { label: 'p',  value: 'p'  }, { label: 'span / div', value: 'div' },
    ];
    var ALIGN_OPTIONS = [
        { label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }
    ];
    var WEIGHT_OPTIONS = [
        { label: '300 — Light',   value: 300 }, { label: '400 — Regular', value: 400 },
        { label: '500 — Medium',  value: 500 }, { label: '600 — SemiBold', value: 600 },
        { label: '700 — Bold',    value: 700 }, { label: '800 — ExtraBold', value: 800 },
        { label: '900 — Black',   value: 900 },
    ];

    function buildGradient(a) {
        var stops = a.color1 + ' ' + a.color1Stop + '%';
        if (a.useColor3) stops += ', ' + a.color3 + ' ' + a.color3Stop + '%';
        stops += ', ' + a.color2 + ' ' + a.color2Stop + '%';
        return 'linear-gradient(' + a.gradientAngle + 'deg, ' + stops + ')';
    }

    function buildTextStyle(a) {
        var grad = buildGradient(a);
        var style = {
            '--bktgr-gradient': grad,
            '--bktgr-speed': a.animationSpeed + 's',
            textAlign: a.textAlign,
            backgroundImage: grad,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundSize: a.animate ? '200% 200%' : '100% 100%',
            display: 'inline-block',
            padding: a.padding + 'px 2px',
        };
        if (a.showOutline) {
            style.WebkitTextStroke = a.outlineWidth + 'px ' + a.outlineColor;
        }
        if (a.showShadow) {
            style.filter = 'drop-shadow(' + a.shadowX + 'px ' + a.shadowY + 'px ' + a.shadowBlur + 'px ' + a.shadowColor + ')';
        }
        if (a.animate) {
            style.animation = 'bktgrShift var(--bktgr-speed, 4s) ease infinite alternate';
        }
        return style;
    }

    registerBlockType('blockenberg/text-gradient', {
        edit: function (props) {
            var a = props.attributes;
            var set = props.setAttributes;
            var blockProps = useBlockProps((function () {
                var s = { textAlign: a.textAlign, padding: a.padding + 'px 0' };
                var _tvf = getTypoCssVars();
                if (_tvf) { Object.assign(s, _tvf(a.titleTypo, '--bktgr-tt-'), _tvf(a.subtextTypo, '--bktgr-st-')); }
                return { style: s };
            })());

            return el('div', blockProps,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('General', 'blockenberg'), initialOpen: true },
                        el(SelectControl, {
                            label: __('HTML Tag', 'blockenberg'), value: a.tag, options: TAG_OPTIONS,
                            onChange: function (v) { set({ tag: v }); }
                        }),
                        el(SelectControl, {
                            label: __('Text Align', 'blockenberg'), value: a.textAlign, options: ALIGN_OPTIONS,
                            onChange: function (v) { set({ textAlign: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Padding (px)', 'blockenberg'), value: a.padding, min: 0, max: 60,
                            onChange: function (v) { set({ padding: v }); }
                        }),
                    ),
                    el(PanelBody, { title: __('Gradient', 'blockenberg'), initialOpen: false },
                        el(RangeControl, {
                            label: __('Gradient Angle °', 'blockenberg'), value: a.gradientAngle, min: 0, max: 360,
                            onChange: function (v) { set({ gradientAngle: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Use 3rd Color Stop', 'blockenberg'), checked: a.useColor3,
                            onChange: function (v) { set({ useColor3: v }); }, __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Animate Gradient', 'blockenberg'), checked: a.animate,
                            onChange: function (v) { set({ animate: v }); }, __nextHasNoMarginBottom: true
                        }),
                        a.animate && el(RangeControl, {
                            label: __('Animation Speed (s)', 'blockenberg'), value: a.animationSpeed, min: 1, max: 20,
                            onChange: function (v) { set({ animationSpeed: v }); }
                        }),
                    ),
                    el(PanelBody, { title: __('Outline & Shadow', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, {
                            label: __('Text Outline', 'blockenberg'), checked: a.showOutline,
                            onChange: function (v) { set({ showOutline: v }); }, __nextHasNoMarginBottom: true
                        }),
                        a.showOutline && el(RangeControl, {
                            label: __('Outline Width (px)', 'blockenberg'), value: a.outlineWidth, min: 1, max: 8,
                            onChange: function (v) { set({ outlineWidth: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Drop Shadow', 'blockenberg'), checked: a.showShadow,
                            onChange: function (v) { set({ showShadow: v }); }, __nextHasNoMarginBottom: true
                        }),
                        a.showShadow && el(RangeControl, {
                            label: __('Shadow X (px)', 'blockenberg'), value: a.shadowX, min: -20, max: 20,
                            onChange: function (v) { set({ shadowX: v }); }
                        }),
                        a.showShadow && el(RangeControl, {
                            label: __('Shadow Y (px)', 'blockenberg'), value: a.shadowY, min: -20, max: 20,
                            onChange: function (v) { set({ shadowY: v }); }
                        }),
                        a.showShadow && el(RangeControl, {
                            label: __('Shadow Blur (px)', 'blockenberg'), value: a.shadowBlur, min: 0, max: 60,
                            onChange: function (v) { set({ shadowBlur: v }); }
                        }),
                    ),
                    el(PanelBody, { title: __('Subtext', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, {
                            label: __('Show Subtext', 'blockenberg'), checked: a.showSubtext,
                            onChange: function (v) { set({ showSubtext: v }); }, __nextHasNoMarginBottom: true
                        }),
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        getTypoControl() && getTypoControl()({
                            label: __('Gradient Text', 'blockenberg'),
                            value: a.titleTypo || {},
                            onChange: function (v) { set({ titleTypo: v }); }
                        }),
                        a.showSubtext && getTypoControl() && getTypoControl()({
                            label: __('Subtext', 'blockenberg'),
                            value: a.subtextTypo || {},
                            onChange: function (v) { set({ subtextTypo: v }); }
                        }),
                    ),
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'), initialOpen: false,
                        colorSettings: [
                            { label: __('Color 1', 'blockenberg'), value: a.color1, onChange: function (v) { set({ color1: v || '#6c3fb5' }); } },
                            { label: __('Color 2', 'blockenberg'), value: a.color2, onChange: function (v) { set({ color2: v || '#ec4899' }); } },
                            a.useColor3 && { label: __('Color 3 (mid)', 'blockenberg'), value: a.color3, onChange: function (v) { set({ color3: v || '#f59e0b' }); } },
                            a.showOutline && { label: __('Outline Color', 'blockenberg'), value: a.outlineColor, onChange: function (v) { set({ outlineColor: v || '#6c3fb5' }); } },
                            a.showShadow && { label: __('Shadow Color', 'blockenberg'), value: a.shadowColor, onChange: function (v) { set({ shadowColor: v || 'rgba(108,63,181,0.35)' }); } },
                            a.showSubtext && { label: __('Subtext Color', 'blockenberg'), value: a.subtextColor, onChange: function (v) { set({ subtextColor: v || '#6b7280' }); } },
                        ].filter(Boolean)
                    }),
                ),
                el('div', { style: { textAlign: a.textAlign } },
                    el(RichText, {
                        tagName: a.tag,
                        className: 'bktgr-text',
                        value: a.text,
                        onChange: function (v) { set({ text: v }); },
                        placeholder: __('Your gradient text here…', 'blockenberg'),
                        style: buildTextStyle(a),
                        allowedFormats: [],
                    }),
                    a.showSubtext && el(RichText, {
                        tagName: 'p',
                        className: 'bktgr-sub',
                        value: a.subtext,
                        onChange: function (v) { set({ subtext: v }); },
                        placeholder: __('Subtitle or description…', 'blockenberg'),
                        style: { color: a.subtextColor, marginTop: '12px' },
                    }),
                ),
            );
        },

        save: function (props) {
            var a = props.attributes;
            var _tvf = getTypoCssVars();
            var grad = buildGradient(a);
            var textStyle = {
                '--bktgr-gradient': grad,
                '--bktgr-speed': a.animationSpeed + 's',
                textAlign: a.textAlign,
                backgroundImage: grad,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: a.animate ? '200% 200%' : '100% 100%',
                display: 'inline-block',
                padding: a.padding + 'px 2px',
            };
            if (a.showOutline) textStyle.WebkitTextStroke = a.outlineWidth + 'px ' + a.outlineColor;
            if (a.showShadow)  textStyle.filter = 'drop-shadow(' + a.shadowX + 'px ' + a.shadowY + 'px ' + a.shadowBlur + 'px ' + a.shadowColor + ')';
            if (a.animate)     textStyle.animation = 'bktgrShift var(--bktgr-speed, 4s) ease infinite alternate';

            return el('div', useBlockProps.save((function () {
                var s = { textAlign: a.textAlign, padding: a.padding + 'px 0' };
                if (_tvf) { Object.assign(s, _tvf(a.titleTypo, '--bktgr-tt-'), _tvf(a.subtextTypo, '--bktgr-st-')); }
                return { className: 'bktgr-wrap', style: s };
            })()),
                el(RichText.Content, { tagName: a.tag, value: a.text, className: 'bktgr-text', style: textStyle }),
                a.showSubtext && el(RichText.Content, {
                    tagName: 'p', value: a.subtext, className: 'bktgr-sub',
                    style: { color: a.subtextColor, marginTop: '12px' }
                }),
            );

            function buildGradient(a) {
                var stops = a.color1 + ' ' + a.color1Stop + '%';
                if (a.useColor3) stops += ', ' + a.color3 + ' ' + a.color3Stop + '%';
                stops += ', ' + a.color2 + ' ' + a.color2Stop + '%';
                return 'linear-gradient(' + a.gradientAngle + 'deg, ' + stops + ')';
            }
        }
    });
}() );

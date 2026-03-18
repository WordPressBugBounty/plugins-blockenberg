( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText = wp.blockEditor.RichText;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody     = wp.components.PanelBody;
    var Button        = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl  = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl   = wp.components.TextControl;
    var URLInput      = wp.blockEditor.URLInput;
    var ColorPicker   = wp.components.ColorPicker;
    var Popover       = wp.components.Popover;

    /* ── typography lazy-getters ── */
    function _tc() { return window.bkbgTypographyControl || null; }
    function _tv() { return window.bkbgTypoCssVars       || function () { return {}; }; }

    var BTN_STYLE_OPTIONS = [
        { label: __('Filled',  'blockenberg'), value: 'filled' },
        { label: __('Outline', 'blockenberg'), value: 'outline' },
        { label: __('Ghost',   'blockenberg'), value: 'ghost' },
    ];
    var ALIGN_OPTIONS = [
        { label: __('Center', 'blockenberg'), value: 'center' },
        { label: __('Left',   'blockenberg'), value: 'left' },
        { label: __('Right',  'blockenberg'), value: 'right' },
    ];
    var TAG_OPTIONS = [
        { label: 'H1', value: 'h1' },
        { label: 'H2', value: 'h2' },
        { label: 'H3', value: 'h3' },
        { label: 'H4', value: 'h4' },
    ];

    function makeId() { return 'gs' + Math.random().toString(36).substr(2, 5); }

    function buildGradientCSS(gradient, angle) {
        if (!gradient || !gradient.length) return 'linear-gradient(' + angle + 'deg, #6c3fb5, #3b82f6)';
        var stops = gradient.map(function (g) { return g.color; }).join(', ');
        return 'linear-gradient(' + angle + 'deg, ' + stops + ')';
    }

    function buildWrapStyle(a) {
        var grad = buildGradientCSS(a.gradient, a.gradientAngle);
        return Object.assign({
            '--bkbg-gs-headline-color':    a.headlineColor,
            '--bkbg-gs-subtext-color':     a.subtextColor,
            '--bkbg-gs-badge-bg':          a.badgeBg,
            '--bkbg-gs-badge-color':       a.badgeColor,
            '--bkbg-gs-badge-r':           a.badgeRadius + 'px',
            '--bkbg-gs-btn-bg':            a.btnBg,
            '--bkbg-gs-btn-color':         a.btnColor,
            '--bkbg-gs-btn2-color':        a.btn2Color,
            '--bkbg-gs-btn2-border':       a.btn2BorderColor,
            '--bkbg-gs-btn-r':             a.btnRadius + 'px',
            '--bkbg-gs-gradient':          grad,
            '--bkbg-gs-angle':             a.gradientAngle + 'deg',
            '--bkbg-gs-anim-dur':          a.animationDuration + 's',
            '--bkbg-gs-btn-sz':            a.btnSize + 'px',
            '--bkbg-gs-min-height':        a.minHeight + 'px',
            background:    grad,
            paddingTop:    a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
        }, _tv()(a.typoHeadline, '--bkbg-gs-hl-'), _tv()(a.typoSubtext, '--bkbg-gs-st-'), _tv()(a.typoBadge, '--bkbg-gs-bg-'));
    }

    function renderColorControl(key, label, value, onChange, openKey, setOpenKey) {
        var isOpen = openKey === key;
        return el('div', { key: key, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: '8px' } },
            el('span', { style: { fontSize: '12px', color: '#1e1e1e', flex: 1, lineHeight: 1.4 } }, label),
            el('div', { style: { position: 'relative', flexShrink: 0 } },
                el('button', { type: 'button', onClick: function () { setOpenKey(isOpen ? null : key); }, style: { width: '28px', height: '28px', borderRadius: '4px', border: isOpen ? '2px solid #007cba' : '2px solid #ddd', cursor: 'pointer', padding: 0, background: value || '#ccc' } }),
                isOpen && el(Popover, { position: 'bottom left', onClose: function () { setOpenKey(null); } },
                    el('div', { style: { padding: '8px' } },
                        el(ColorPicker, { color: value, enableAlpha: true, onChange: onChange })
                    )
                )
            )
        );
    }

    registerBlockType('blockenberg/gradient-section', {
        title: __('Gradient Section', 'blockenberg'),
        icon: 'art',
        category: 'bkbg-layout',

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            var blockProps = useBlockProps({ style: buildWrapStyle(a), className: 'bkbg-gs-wrapper' + (a.animate ? ' bkbg-gs--animate' : ''), 'data-animate': a.animate ? 'true' : undefined });

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            function updateGradientColor(id, color) {
                setAttributes({ gradient: a.gradient.map(function (g) { if (g.id !== id) return g; return Object.assign({}, g, { color: color }); }) });
            }

            var headlineTag = a.headlineTag || 'h2';
            var overlayStyle = a.overlay ? { position: 'absolute', inset: 0, background: a.overlayColor, pointerEvents: 'none', zIndex: 0 } : null;
            var innerStyle = { position: 'relative', zIndex: 1, maxWidth: a.contentMaxWidth + 'px', margin: '0 auto', minHeight: a.minHeight + 'px', display: 'flex', flexDirection: 'column', alignItems: a.textAlign === 'center' ? 'center' : (a.textAlign === 'right' ? 'flex-end' : 'flex-start'), justifyContent: 'center', textAlign: a.textAlign, padding: '40px 24px', boxSizing: 'border-box' };

            var btnBase = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 28px', height: (a.btnSize + 22) + 'px', borderRadius: a.btnRadius + 'px', fontSize: a.btnSize + 'px', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', textDecoration: 'none', boxSizing: 'border-box', transition: 'opacity 0.2s' };
            var btn1Style = Object.assign({}, btnBase, { background: a.btnBg, color: a.btnColor, border: '2px solid transparent' });
            var btn2Style = Object.assign({}, btnBase, { background: 'transparent', color: a.btn2Color, border: '2px solid ' + a.btn2BorderColor });

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Gradient', 'blockenberg'), initialOpen: true },
                        el('p', { style: { fontSize: '12px', fontWeight: 600, margin: '0 0 6px' } }, __('Gradient colors', 'blockenberg')),
                        el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' } },
                            a.gradient.map(function (g) {
                                var isOpenG = openColorKey === g.id;
                                return el('div', { key: g.id, style: { position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' } },
                                    el('button', { type: 'button', onClick: function () { setOpenColorKey(isOpenG ? null : g.id); }, style: { width: '36px', height: '36px', borderRadius: '50%', border: isOpenG ? '3px solid #007cba' : '2px solid #ddd', cursor: 'pointer', background: g.color, padding: 0 } }),
                                    isOpenG && el(Popover, { position: 'bottom left', onClose: function () { setOpenColorKey(null); } },
                                        el('div', { style: { padding: '8px' } },
                                            el(ColorPicker, { color: g.color, onChange: function (val) { updateGradientColor(g.id, val); } })
                                        )
                                    ),
                                    a.gradient.length > 2 && el('button', { type: 'button', onClick: function () { setAttributes({ gradient: a.gradient.filter(function (x) { return x.id !== g.id; }) }); }, style: { fontSize: '10px', color: '#dc3535', background: 'none', border: 'none', cursor: 'pointer', padding: 0 } }, '✕')
                                );
                            }),
                            a.gradient.length < 5 && el('button', { type: 'button', onClick: function () { setAttributes({ gradient: a.gradient.concat([{ id: makeId(), color: '#ffffff' }]) }); }, style: { width: '36px', height: '36px', borderRadius: '50%', border: '2px dashed #ccc', background: 'none', cursor: 'pointer', fontSize: '20px', color: '#999', display: 'flex', alignItems: 'center', justifyContent: 'center' } }, '+')
                        ),
                        el(RangeControl, { label: __('Gradient angle (°)', 'blockenberg'), value: a.gradientAngle, min: 0, max: 360, onChange: function (v) { setAttributes({ gradientAngle: v }); } }),
                        el(ToggleControl, { label: __('Animate gradient', 'blockenberg'), checked: a.animate, onChange: function (v) { setAttributes({ animate: v }); }, __nextHasNoMarginBottom: true }),
                        a.animate && el(RangeControl, { label: __('Animation speed (s)', 'blockenberg'), value: a.animationDuration, min: 3, max: 20, onChange: function (v) { setAttributes({ animationDuration: v }); } }),
                        el(ToggleControl, { label: __('Overlay', 'blockenberg'), checked: a.overlay, onChange: function (v) { setAttributes({ overlay: v }); }, __nextHasNoMarginBottom: true }),
                        a.overlay && cc('overlayColor', __('Overlay color', 'blockenberg'), 'overlayColor')
                    ),
                    el(PanelBody, { title: __('Content', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show badge', 'blockenberg'), checked: a.showBadge, onChange: function (v) { setAttributes({ showBadge: v }); }, __nextHasNoMarginBottom: true }),
                        a.showBadge && el(TextControl, { label: __('Badge text', 'blockenberg'), value: a.badge, onChange: function (v) { setAttributes({ badge: v }); } }),
                        el(SelectControl,  { label: __('Headline tag', 'blockenberg'), value: a.headlineTag, options: TAG_OPTIONS, onChange: function (v) { setAttributes({ headlineTag: v }); } }),
                        el(TextControl,    { label: __('Button 1 label', 'blockenberg'), value: a.btnLabel,   onChange: function (v) { setAttributes({ btnLabel:   v }); } }),
                        el(TextControl,    { label: __('Button 1 URL',   'blockenberg'), value: a.btnUrl,     onChange: function (v) { setAttributes({ btnUrl:     v }); } }),
                        el(SelectControl,  { label: __('Button 1 style', 'blockenberg'), value: a.btnStyle,   options: BTN_STYLE_OPTIONS, onChange: function (v) { setAttributes({ btnStyle:   v }); } }),
                        el(ToggleControl,  { label: __('Show second button', 'blockenberg'), checked: a.showSecondBtn, onChange: function (v) { setAttributes({ showSecondBtn: v }); }, __nextHasNoMarginBottom: true }),
                        a.showSecondBtn && el(TextControl, { label: __('Button 2 label', 'blockenberg'), value: a.btn2Label, onChange: function (v) { setAttributes({ btn2Label: v }); } }),
                        a.showSecondBtn && el(TextControl, { label: __('Button 2 URL',   'blockenberg'), value: a.btn2Url,   onChange: function (v) { setAttributes({ btn2Url:   v }); } })
                    ),
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Text align',        'blockenberg'), value: a.textAlign,       options: ALIGN_OPTIONS, onChange: function (v) { setAttributes({ textAlign:       v }); } }),
                        el(RangeControl,  { label: __('Min height (px)',   'blockenberg'), value: a.minHeight,       min: 200, max: 900, onChange: function (v) { setAttributes({ minHeight:       v }); } }),
                        el(RangeControl,  { label: __('Content max width', 'blockenberg'), value: a.contentMaxWidth, min: 400, max: 1400, onChange: function (v) { setAttributes({ contentMaxWidth: v }); } }),
                        el(RangeControl,  { label: __('Button radius (px)','blockenberg'), value: a.btnRadius,       min: 0, max: 99, onChange: function (v) { setAttributes({ btnRadius:       v }); } }),
                        el(RangeControl,  { label: __('Badge radius (px)', 'blockenberg'), value: a.badgeRadius,     min: 0, max: 99, onChange: function (v) { setAttributes({ badgeRadius:     v }); } })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        _tc() && el(_tc(), { label:__('Headline','blockenberg'), value:a.typoHeadline, onChange:function(v){ setAttributes({typoHeadline:v}); } }),
                        _tc() && el(_tc(), { label:__('Subtext','blockenberg'), value:a.typoSubtext, onChange:function(v){ setAttributes({typoSubtext:v}); } }),
                        _tc() && el(_tc(), { label:__('Badge','blockenberg'), value:a.typoBadge, onChange:function(v){ setAttributes({typoBadge:v}); } }),
                        el(RangeControl, { label: __('Button (px)', 'blockenberg'), value: a.btnSize, min: 13, max: 22, onChange: function (v) { setAttributes({ btnSize: v }); } })
                    ),
                    el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                        cc('headlineColor',   __('Headline',          'blockenberg'), 'headlineColor'),
                        cc('subtextColor',    __('Subtext',           'blockenberg'), 'subtextColor'),
                        cc('badgeBg',         __('Badge background',  'blockenberg'), 'badgeBg'),
                        cc('badgeColor',      __('Badge text',        'blockenberg'), 'badgeColor'),
                        cc('btnBg',           __('Button 1 bg',       'blockenberg'), 'btnBg'),
                        cc('btnColor',        __('Button 1 text',     'blockenberg'), 'btnColor'),
                        cc('btn2Color',       __('Button 2 text',     'blockenberg'), 'btn2Color'),
                        cc('btn2BorderColor', __('Button 2 border',   'blockenberg'), 'btn2BorderColor')
                    ),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top (px)',    'blockenberg'), value: a.paddingTop,    min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop:    v }); } }),
                        el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    )
                ),

                el('div', blockProps,
                    a.overlay && el('div', { className: 'bkbg-gs-overlay', style: overlayStyle }),
                    el('div', { className: 'bkbg-gs-inner', style: innerStyle },
                        a.showBadge && el('span', { className: 'bkbg-gs-badge', style: { display: 'inline-flex', alignItems: 'center', padding: '6px 16px', borderRadius: a.badgeRadius + 'px', background: a.badgeBg, color: a.badgeColor, marginBottom: '20px', backdropFilter: 'blur(10px)' } }, a.badge),
                        el(RichText, { tagName: headlineTag, className: 'bkbg-gs-headline', value: a.headline, onChange: function (v) { setAttributes({ headline: v }); }, placeholder: __('Headline…', 'blockenberg'), style: { color: a.headlineColor, margin: '0 0 16px', maxWidth: '100%' } }),
                        el(RichText, { tagName: 'p', className: 'bkbg-gs-subtext', value: a.subtext, onChange: function (v) { setAttributes({ subtext: v }); }, placeholder: __('Subtext description…', 'blockenberg'), style: { color: a.subtextColor, margin: '0 0 32px', maxWidth: '580px' } }),
                        el('div', { className: 'bkbg-gs-actions', style: { display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: a.textAlign === 'center' ? 'center' : (a.textAlign === 'right' ? 'flex-end' : 'flex-start') } },
                            a.btnLabel && el('span', { className: 'bkbg-gs-btn bkbg-gs-btn--primary', style: btn1Style }, a.btnLabel),
                            a.showSecondBtn && a.btn2Label && el('span', { className: 'bkbg-gs-btn bkbg-gs-btn--secondary', style: btn2Style }, a.btn2Label)
                        )
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var wrapStyle = buildWrapStyle(a);
            var headlineTag = a.headlineTag || 'h2';
            return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-gs-wrapper' + (a.animate ? ' bkbg-gs--animate' : ''), style: wrapStyle, 'data-animate': a.animate ? 'true' : undefined }),
                a.overlay && el('div', { className: 'bkbg-gs-overlay', 'aria-hidden': 'true' }),
                el('div', { className: 'bkbg-gs-inner' },
                    a.showBadge && el('span', { className: 'bkbg-gs-badge' }, a.badge),
                    el(RichText.Content, { tagName: headlineTag, className: 'bkbg-gs-headline', value: a.headline }),
                    el(RichText.Content, { tagName: 'p', className: 'bkbg-gs-subtext', value: a.subtext }),
                    el('div', { className: 'bkbg-gs-actions' },
                        a.btnLabel  && el('a', { href: a.btnUrl  || '#', className: 'bkbg-gs-btn bkbg-gs-btn--primary bkbg-gs-btn--' + a.btnStyle }, a.btnLabel),
                        a.showSecondBtn && a.btn2Label && el('a', { href: a.btn2Url || '#', className: 'bkbg-gs-btn bkbg-gs-btn--secondary' }, a.btn2Label)
                    )
                )
            );
        }
    });
}() );

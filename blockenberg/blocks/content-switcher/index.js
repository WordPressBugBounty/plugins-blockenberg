( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var RichText = wp.blockEditor.RichText;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody    = wp.components.PanelBody;
    var Button       = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl  = wp.components.TextControl;
    var ColorPicker  = wp.components.ColorPicker;
    var Popover      = wp.components.Popover;

    var _bkbgCSWgetTC, _bkbgCSWgetTV;
    function getTC() { return _bkbgCSWgetTC || (_bkbgCSWgetTC = window.bkbgTypographyControl); }
    function getTV() { return _bkbgCSWgetTV || (_bkbgCSWgetTV = window.bkbgTypoCssVars); }
    function _tv(obj, prefix) { var fn = getTV(); return fn ? fn(obj, prefix) : {}; }

    var SWITCH_STYLE_OPTIONS = [
        { label: __('Pill slider',  'blockenberg'), value: 'pill' },
        { label: __('Tabs',         'blockenberg'), value: 'tabs' },
        { label: __('Buttons',      'blockenberg'), value: 'buttons' },
    ];
    var ALIGN_OPTIONS = [
        { label: __('Left',   'blockenberg'), value: 'left' },
        { label: __('Center', 'blockenberg'), value: 'center' },
        { label: __('Right',  'blockenberg'), value: 'right' },
    ];
    var LAYOUT_OPTIONS = [
        { label: __('Image right', 'blockenberg'), value: 'image-right' },
        { label: __('Image left',  'blockenberg'), value: 'image-left' },
        { label: __('Image top',   'blockenberg'), value: 'image-top' },
        { label: __('Text only',   'blockenberg'), value: 'text-only' },
    ];
    var RATIO_OPTIONS = [
        { label: '16/9', value: '16/9' },
        { label: '4/3',  value: '4/3' },
        { label: '1/1',  value: '1/1' },
        { label: '3/4',  value: '3/4' },
    ];
    var BULLET_OPTIONS = [
        { label: __('Check ✓', 'blockenberg'), value: 'check' },
        { label: __('Arrow →', 'blockenberg'), value: 'arrow' },
        { label: __('Dot',     'blockenberg'), value: 'dot' },
    ];

    function bulletChar(type) { return type === 'arrow' ? '→' : type === 'dot' ? '•' : '✓'; }

    function buildWrapStyle(a) {
        return Object.assign({
            '--bkbg-csw-accent':       a.accentColor,
            '--bkbg-csw-switch-bg':    a.switchBg,
            '--bkbg-csw-active-text':  a.switchActiveText,
            '--bkbg-csw-headline':     a.headlineColor,
            '--bkbg-csw-body':         a.bodyColor,
            '--bkbg-csw-bullet':       a.bulletColor,
            '--bkbg-csw-bullet-icon':  a.bulletIconColor,
            '--bkbg-csw-cta-bg':       a.ctaBg,
            '--bkbg-csw-cta-color':    a.ctaColor,
            '--bkbg-csw-switch-r':     a.switchRadius + 'px',
            '--bkbg-csw-cta-r':        a.ctaRadius + 'px',
            '--bkbg-csw-headline-sz':  a.headlineSize + 'px',
            '--bkbg-csw-body-sz':      a.bodySize + 'px',
            '--bkbg-csw-bullet-sz':    a.bulletSize + 'px',
            '--bkbg-csw-badge-sz':     a.badgeSize + 'px',
            '--bkbg-csw-switch-sz':    a.switchSize + 'px',
            paddingTop:    a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
            backgroundColor: a.bgColor || undefined,
        }, _tv(a.typoHeadline, '--bkcsw-head-'), _tv(a.typoBody, '--bkcsw-body-'));
    }

    function renderColorControl(key, label, value, onChange, openKey, setOpenKey) {
        var isOpen = openKey === key;
        return el('div', { key: key, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: '8px' } },
            el('span', { style: { fontSize: '12px', color: '#1e1e1e', flex: 1, lineHeight: 1.4 } }, label),
            el('div', { style: { position: 'relative', flexShrink: 0 } },
                el('button', { type: 'button', title: value || 'default', onClick: function () { setOpenKey(isOpen ? null : key); },
                    style: { width: '28px', height: '28px', borderRadius: '4px', border: isOpen ? '2px solid #007cba' : '2px solid #ddd', cursor: 'pointer', padding: 0, background: value || '#cccccc' }
                }),
                isOpen && el(Popover, { position: 'bottom left', onClose: function () { setOpenKey(null); } },
                    el('div', { style: { padding: '8px' } },
                        el(ColorPicker, { color: value, enableAlpha: true, onChange: onChange })
                    )
                )
            )
        );
    }

    /* ── Panel preview ─────────────────────────────────────────────────── */
    function PanelPreview(props) {
        var panel  = props.panel;
        var a      = props.a;
        var isLeft = a.panelLayout === 'image-left';
        var isTop  = a.panelLayout === 'image-top';
        var isTextOnly = a.panelLayout === 'text-only';

        var ratioParts = a.imageRatio.split('/');
        var ratioVal   = parseInt(ratioParts[1], 10) / parseInt(ratioParts[0], 10);

        var imgBox = !isTextOnly ? el('div', { className: 'bkbg-csw-img-col', style: {
            flex: isTop ? undefined : '0 0 45%',
            width: isTop ? '100%' : undefined,
            position: 'relative',
            borderRadius: a.imageRadius + 'px',
            overflow: 'hidden',
            boxShadow: a.imageShadow ? '0 16px 48px rgba(0,0,0,0.12)' : 'none',
            background: '#f3f4f6',
        } },
            el('div', { style: { paddingBottom: (ratioVal * 100) + '%' } }),
            panel.imageUrl
                ? el('img', { src: panel.imageUrl, alt: '', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } })
                : el('div', { style: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '13px' } }, __('Upload image for this panel', 'blockenberg'))
        ) : null;

        var textBox = el('div', { className: 'bkbg-csw-text-col', style: { flex: '1 1 0', minWidth: 0 } },
            panel.showBadge && panel.badge && el('span', { className: 'bkbg-csw-badge', style: { display: 'inline-block', background: a.accentColor + '18', color: a.accentColor, padding: '4px 14px', borderRadius: '99px', marginBottom: '14px' } }, panel.badge),
            el(RichText, { tagName: 'h2', className: 'bkbg-csw-headline', value: panel.headline, onChange: props.onHeadlineChange, placeholder: __('Panel headline…', 'blockenberg'), style: { color: a.headlineColor, margin: '0 0 14px' } }),
            el(RichText, { tagName: 'p', className: 'bkbg-csw-body', value: panel.body, onChange: props.onBodyChange, placeholder: __('Body text…', 'blockenberg'), style: { color: a.bodyColor, margin: '0 0 18px' } }),
            a.showBullets && panel.bullets && panel.bullets.length > 0 && el('ul', { style: { listStyle: 'none', margin: '0 0 22px', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' } },
                panel.bullets.map(function (b) {
                    return el('li', { key: b.id, className: 'bkbg-csw-bullet', style: { color: a.bulletColor } },
                        el('span', { style: { color: a.bulletIconColor, fontWeight: 700, flexShrink: 0 } }, bulletChar(a.bulletIcon)),
                        el('span', null, b.text)
                    );
                })
            ),
            panel.ctaLabel && el('a', { href: panel.ctaUrl || '#', className: 'bkbg-csw-cta', style: { background: a.ctaBg, color: a.ctaColor, borderRadius: a.ctaRadius + 'px' } }, panel.ctaLabel)
        );

        var flexDir = isTop ? 'column' : isLeft ? 'row-reverse' : 'row';
        return el('div', { className: 'bkbg-csw-panel' + (a.animate ? ' bkbg-csw-anim' : ''), style: { display: 'flex', flexDirection: flexDir, gap: '48px', alignItems: 'center' } },
            imgBox, textBox
        );
    }

    /* ── Switch bar ────────────────────────────────────────────────────── */
    function SwitchBar(props) {
        var panels = props.panels;
        var active = props.active;
        var a = props.a;
        var wrapStyle = { display: 'inline-flex', background: a.switchStyle === 'pill' ? a.switchBg : 'transparent', borderRadius: a.switchRadius + 'px', padding: a.switchStyle === 'pill' ? '4px' : '0', gap: a.switchStyle === 'tabs' ? '0' : '4px' };
        return el('div', { style: { textAlign: a.switchAlign, marginBottom: '40px' } },
            el('div', { style: wrapStyle },
                panels.map(function (panel, i) {
                    var isActive = i === active;
                    var btnStyle = {
                        padding: '10px 22px', borderRadius: a.switchRadius + 'px', border: a.switchStyle === 'buttons' ? '1.5px solid ' + a.accentColor : 'none',
                        background: isActive ? a.accentColor : 'transparent',
                        color: isActive ? a.switchActiveText : a.accentColor,
                        fontWeight: 600, cursor: 'pointer', fontSize: a.switchSize + 'px', transition: 'all 0.18s ease',
                    };
                    return el('button', { key: i, type: 'button', style: btnStyle, onClick: function () { props.onSwitch(i); } }, panel.switchLabel || ('Panel ' + (i + 1)));
                })
            )
        );
    }

    registerBlockType('blockenberg/content-switcher', {
        title: __('Content Switcher', 'blockenberg'),
        icon: 'controls-repeat',
        category: 'bkbg-content',

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            var activeState = useState(a.defaultActive || 0);
            var active = activeState[0];
            var setActive = activeState[1];

            var blockProps = useBlockProps({ style: buildWrapStyle(a) });

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            function updatePanel(id, key, val) {
                setAttributes({ panels: a.panels.map(function (p) { if (p.id !== id) return p; var u = Object.assign({}, p); u[key] = val; return u; }) });
            }
            function addBullet(panelId) {
                var panel = a.panels.find(function (p) { return p.id === panelId; });
                var bullets = (panel.bullets || []).concat([{ id: 'b' + Math.random().toString(36).substr(2,4), text: __('New bullet point', 'blockenberg') }]);
                updatePanel(panelId, 'bullets', bullets);
            }
            function updateBullet(panelId, bulletId, val) {
                var panel = a.panels.find(function (p) { return p.id === panelId; });
                updatePanel(panelId, 'bullets', (panel.bullets || []).map(function (b) { if (b.id !== bulletId) return b; return Object.assign({}, b, { text: val }); }));
            }
            function removeBullet(panelId, bulletId) {
                var panel = a.panels.find(function (p) { return p.id === panelId; });
                updatePanel(panelId, 'bullets', (panel.bullets || []).filter(function (b) { return b.id !== bulletId; }));
            }

            var currentPanel = a.panels[active] || a.panels[0];

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Switch Control', 'blockenberg'), initialOpen: true },
                        el(SelectControl, { label: __('Switch style',    'blockenberg'), value: a.switchStyle, options: SWITCH_STYLE_OPTIONS, onChange: function (v) { setAttributes({ switchStyle: v }); } }),
                        el(SelectControl, { label: __('Alignment',       'blockenberg'), value: a.switchAlign, options: ALIGN_OPTIONS,        onChange: function (v) { setAttributes({ switchAlign: v }); } }),
                        el(RangeControl,  { label: __('Switch radius (px)', 'blockenberg'), value: a.switchRadius, min: 0, max: 99,           onChange: function (v) { setAttributes({ switchRadius: v }); } })
                    ),
                    el(PanelBody, { title: __('Panel Layout', 'blockenberg'), initialOpen: false },
                        el(SelectControl, { label: __('Image position', 'blockenberg'),  value: a.panelLayout, options: LAYOUT_OPTIONS,   onChange: function (v) { setAttributes({ panelLayout: v }); } }),
                        a.panelLayout !== 'text-only' && el(SelectControl, { label: __('Image aspect ratio', 'blockenberg'), value: a.imageRatio, options: RATIO_OPTIONS, onChange: function (v) { setAttributes({ imageRatio: v }); } }),
                        a.panelLayout !== 'text-only' && el(RangeControl, { label: __('Image radius (px)', 'blockenberg'), value: a.imageRadius, min: 0, max: 32, onChange: function (v) { setAttributes({ imageRadius: v }); } }),
                        a.panelLayout !== 'text-only' && el(ToggleControl, { label: __('Image shadow', 'blockenberg'), checked: a.imageShadow, onChange: function (v) { setAttributes({ imageShadow: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show bullets',  'blockenberg'), checked: a.showBullets, onChange: function (v) { setAttributes({ showBullets: v }); }, __nextHasNoMarginBottom: true }),
                        a.showBullets && el(SelectControl, { label: __('Bullet icon', 'blockenberg'), value: a.bulletIcon, options: BULLET_OPTIONS, onChange: function (v) { setAttributes({ bulletIcon: v }); } }),
                        el(RangeControl, { label: __('CTA radius (px)', 'blockenberg'), value: a.ctaRadius, min: 0, max: 99, onChange: function (v) { setAttributes({ ctaRadius: v }); } }),
                        el(ToggleControl, { label: __('Animate on scroll', 'blockenberg'), checked: a.animate, onChange: function (v) { setAttributes({ animate: v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        getTC() && el(getTC(), { label: __('Headline', 'blockenberg'), value: a.typoHeadline, onChange: function (v) { setAttributes({ typoHeadline: v }); } }),
                        getTC() && el(getTC(), { label: __('Body Text', 'blockenberg'), value: a.typoBody, onChange: function (v) { setAttributes({ typoBody: v }); } }),
                        el(RangeControl, { label: __('Switch label (px)',  'blockenberg'), value: a.switchSize,   min: 12, max: 20, onChange: function (v) { setAttributes({ switchSize:   v }); } }),
                        el(RangeControl, { label: __('Bullets (px)',       'blockenberg'), value: a.bulletSize,   min: 12, max: 20, onChange: function (v) { setAttributes({ bulletSize:   v }); } }),
                        el(RangeControl, { label: __('Badge (px)',         'blockenberg'), value: a.badgeSize,    min: 10, max: 17, onChange: function (v) { setAttributes({ badgeSize:    v }); } })
                    ),
                    el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                        cc('accentColor',    __('Accent',              'blockenberg'), 'accentColor'),
                        cc('switchBg',       __('Switch background',   'blockenberg'), 'switchBg'),
                        cc('switchActiveText',__('Active label text',  'blockenberg'), 'switchActiveText'),
                        cc('headlineColor',  __('Headline',            'blockenberg'), 'headlineColor'),
                        cc('bodyColor',      __('Body text',           'blockenberg'), 'bodyColor'),
                        cc('bulletColor',    __('Bullet text',         'blockenberg'), 'bulletColor'),
                        cc('bulletIconColor',__('Bullet icon',         'blockenberg'), 'bulletIconColor'),
                        cc('ctaBg',          __('CTA background',      'blockenberg'), 'ctaBg'),
                        cc('ctaColor',       __('CTA text',            'blockenberg'), 'ctaColor'),
                        cc('bgColor',        __('Section background',  'blockenberg'), 'bgColor')
                    ),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top (px)',    'blockenberg'), value: a.paddingTop,    min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop:    v }); } }),
                        el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    ),
                    /* Per-panel settings */
                    el(PanelBody, { title: __('Panels', 'blockenberg'), initialOpen: false },
                        a.panels.map(function (panel, pi) {
                            return el(PanelBody, { key: panel.id, title: panel.switchLabel || ('Panel ' + (pi + 1)), initialOpen: pi === active },
                                el(TextControl, { label: __('Switch label', 'blockenberg'), value: panel.switchLabel, onChange: function (v) { updatePanel(panel.id, 'switchLabel', v); } }),
                                el(ToggleControl, { label: __('Show badge', 'blockenberg'), checked: panel.showBadge, onChange: function (v) { updatePanel(panel.id, 'showBadge', v); }, __nextHasNoMarginBottom: true }),
                                panel.showBadge && el(TextControl, { label: __('Badge text', 'blockenberg'), value: panel.badge, onChange: function (v) { updatePanel(panel.id, 'badge', v); } }),
                                a.panelLayout !== 'text-only' && el(MediaUploadCheck, null,
                                    el(MediaUpload, {
                                        onSelect: function (media) { setAttributes({ panels: a.panels.map(function (p) { return p.id !== panel.id ? p : Object.assign({}, p, { imageUrl: media.url, imageId: media.id }); }) }); },
                                        allowedTypes: ['image'], value: panel.imageId,
                                        render: function (p) { return el('div', { style: { marginBottom: '8px' } },
                                            panel.imageUrl && el('img', { src: panel.imageUrl, style: { width: '100%', borderRadius: '6px', marginBottom: '6px' } }),
                                            el(Button, { onClick: p.open, variant: panel.imageUrl ? 'secondary' : 'primary', size: 'compact' }, panel.imageUrl ? __('Replace image', 'blockenberg') : __('Add panel image', 'blockenberg'))
                                        ); }
                                    })
                                ),
                                el(TextControl, { label: __('CTA label', 'blockenberg'), value: panel.ctaLabel, onChange: function (v) { updatePanel(panel.id, 'ctaLabel', v); } }),
                                el(TextControl, { label: __('CTA URL', 'blockenberg'), value: panel.ctaUrl, onChange: function (v) { updatePanel(panel.id, 'ctaUrl', v); } }),
                                a.showBullets && el('div', null,
                                    el('strong', { style: { display: 'block', marginBottom: '6px', fontSize: '12px' } }, __('Bullets', 'blockenberg')),
                                    (panel.bullets || []).map(function (b) {
                                        return el('div', { key: b.id, style: { display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' } },
                                            el(TextControl, { value: b.text, onChange: function (v) { updateBullet(panel.id, b.id, v); }, style: { flex: 1 } }),
                                            el(Button, { onClick: function () { removeBullet(panel.id, b.id); }, isDestructive: true, variant: 'tertiary', size: 'compact' }, '✕')
                                        );
                                    }),
                                    el(Button, { onClick: function () { addBullet(panel.id); }, variant: 'secondary', size: 'compact' }, __('+ Bullet', 'blockenberg'))
                                )
                            );
                        })
                    )
                ),

                el('div', blockProps,
                    el(SwitchBar, { panels: a.panels, active: active, a: a, onSwitch: setActive }),
                    el(PanelPreview, {
                        panel: currentPanel, a: a,
                        onHeadlineChange: function (v) { updatePanel(currentPanel.id, 'headline', v); },
                        onBodyChange:     function (v) { updatePanel(currentPanel.id, 'body', v); },
                    })
                )
            );
        },

        save: function (props) {
            var a = props.attributes;

            function renderPanel(panel, isActive) {
                var isLeft    = a.panelLayout === 'image-left';
                var isTop     = a.panelLayout === 'image-top';
                var isTextOnly= a.panelLayout === 'text-only';
                var ratioParts= a.imageRatio.split('/');
                var ratioVal  = parseInt(ratioParts[1], 10) / parseInt(ratioParts[0], 10);
                var flexDir   = isTop ? 'column' : isLeft ? 'row-reverse' : 'row';

                var imgBox = !isTextOnly ? el('div', { className: 'bkbg-csw-img-col', style: { flex: isTop ? undefined : '0 0 45%', borderRadius: a.imageRadius + 'px', overflow: 'hidden', boxShadow: a.imageShadow ? '0 16px 48px rgba(0,0,0,0.12)' : 'none', position: 'relative' } },
                    el('div', { style: { paddingBottom: (ratioVal * 100) + '%' } }),
                    panel.imageUrl && el('img', { src: panel.imageUrl, alt: '', loading: 'lazy', style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } })
                ) : null;

                var textBox = el('div', { className: 'bkbg-csw-text-col', style: { flex: '1 1 0', minWidth: 0 } },
                    panel.showBadge && panel.badge && el('span', { className: 'bkbg-csw-badge', style: { background: a.accentColor + '18', color: a.accentColor } }, panel.badge),
                    el(RichText.Content, { tagName: 'h2', value: panel.headline, className: 'bkbg-csw-headline', style: { color: a.headlineColor } }),
                    el(RichText.Content, { tagName: 'p',  value: panel.body,     className: 'bkbg-csw-body',     style: { color: a.bodyColor } }),
                    a.showBullets && panel.bullets && panel.bullets.length > 0 && el('ul', { className: 'bkbg-csw-bullets' },
                        panel.bullets.map(function (b) {
                            return el('li', { key: b.id, className: 'bkbg-csw-bullet' },
                                el('span', { className: 'bkbg-csw-bullet-icon', style: { color: a.bulletIconColor } }, bulletChar(a.bulletIcon)),
                                el('span', null, b.text)
                            );
                        })
                    ),
                    panel.ctaLabel && el('a', { href: panel.ctaUrl || '#', target: panel.ctaTarget ? '_blank' : undefined, rel: panel.ctaTarget ? 'noopener noreferrer' : undefined, className: 'bkbg-csw-cta', style: { background: a.ctaBg, color: a.ctaColor, borderRadius: a.ctaRadius + 'px' } }, panel.ctaLabel)
                );

                return el('div', { className: 'bkbg-csw-panel' + (isActive ? ' is-active' : '') + (a.animate ? ' bkbg-csw-anim' : ''), 'data-panel': panel.id, 'aria-hidden': isActive ? 'false' : 'true', style: { display: isActive ? undefined : 'none', flexDirection: flexDir, gap: '48px', alignItems: 'center' } },
                    imgBox, textBox
                );
            }

            return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-csw-wrapper', style: buildWrapStyle(a) }),
                el('div', { className: 'bkbg-csw-switch-bar', 'data-style': a.switchStyle, style: { textAlign: a.switchAlign } },
                    el('div', { className: 'bkbg-csw-switch bkbg-csw-switch--' + a.switchStyle, style: { display: 'inline-flex', borderRadius: a.switchRadius + 'px' } },
                        a.panels.map(function (panel, i) {
                            return el('button', { key: i, type: 'button', className: 'bkbg-csw-switch-btn' + (i === (a.defaultActive || 0) ? ' is-active' : ''), 'data-target': panel.id, style: { borderRadius: a.switchRadius + 'px' } }, panel.switchLabel || ('Panel ' + (i + 1)));
                        })
                    )
                ),
                el('div', { className: 'bkbg-csw-panels' },
                    a.panels.map(function (panel, i) { return renderPanel(panel, i === (a.defaultActive || 0)); })
                )
            );
        }
    });
}() );

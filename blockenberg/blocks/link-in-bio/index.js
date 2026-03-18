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
    var PanelBody     = wp.components.PanelBody;
    var Button        = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl  = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl   = wp.components.TextControl;
    var ColorPicker   = wp.components.ColorPicker;
    var Popover       = wp.components.Popover;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars()  { return _tv || (_tv = window.bkbgTypoCssVars); }
    var IP = function () { return window.bkbgIconPicker; };

    function makeId() { return 'lb' + Math.random().toString(36).substr(2, 5); }

    var LINK_STYLE_OPTIONS = [
        { label: __('Filled',  'blockenberg'), value: 'filled' },
        { label: __('Outline', 'blockenberg'), value: 'outline' },
        { label: __('Ghost',   'blockenberg'), value: 'ghost' },
    ];

    function buildWrapStyle(a) {
        var _tvFn = getTypoCssVars();
        var s = {
            '--bkbg-lib-accent':          a.accentColor,
            '--bkbg-lib-name-color':      a.nameColor,
            '--bkbg-lib-title-color':     a.titleColor,
            '--bkbg-lib-bio-color':       a.bioColor,
            '--bkbg-lib-btn-bg':          a.btnBg,
            '--bkbg-lib-btn-color':       a.btnColor,
            '--bkbg-lib-btn-border':      a.btnBorderColor,
            '--bkbg-lib-btn-r':           a.buttonRadius + 'px',
            '--bkbg-lib-btn-gap':         a.buttonGap + 'px',
            '--bkbg-lib-btn-max-w':       a.buttonMaxWidth + 'px',
            '--bkbg-lib-btn-pad-v':       a.buttonPaddingV + 'px',
            '--bkbg-lib-avatar-sz':       a.avatarSize + 'px',
            '--bkbg-lib-avatar-r':        a.avatarRadius + '%',
            '--bkbg-lib-avatar-border-w': a.avatarBorderWidth + 'px',
            '--bkbg-lib-avatar-border-c': a.avatarBorderColor,
            paddingTop:    a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
            backgroundColor: a.bgColor || undefined,
        };
        if (_tvFn) {
            Object.assign(s, _tvFn(a.nameTypo, '--bkbg-lib-n-'));
            Object.assign(s, _tvFn(a.taglineTypo, '--bkbg-lib-tl-'));
            Object.assign(s, _tvFn(a.bioTypo, '--bkbg-lib-b-'));
            Object.assign(s, _tvFn(a.buttonTypo, '--bkbg-lib-bt-'));
        }
        return s;
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

    /* ───────────── Link button preview ─────────────────────────────── */
    function LinkButton(props) {
        var link = props.link;
        var a    = props.a;
        var style = link.style || a.buttonStyle;
        var isFilled  = style === 'filled';
        var isOutline = style === 'outline';
        var bg     = isFilled ? a.btnBg : 'transparent';
        var color  = isFilled ? a.btnColor : a.btnBg;
        var border  = (isFilled ? 'none' : '2px solid ' + (isOutline ? a.btnBorderColor || a.btnBg : 'transparent'));
        return el('div', { className: 'bkbg-lib-btn bkbg-lib-btn--' + style,
            style: {
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: bg, color: color, border: border,
                borderRadius: a.buttonRadius + 'px', padding: a.buttonPaddingV + 'px 20px',
                cursor: 'default',
                width: '100%', boxSizing: 'border-box',
            }},
            a.showIcons && link.icon && el('span', { 'aria-hidden': 'true' }, (link.iconType || 'custom-char') !== 'custom-char' && IP() ? IP().buildEditorIcon(link.iconType, link.icon, link.iconDashicon, link.iconImageUrl, link.iconDashiconColor) : link.icon),
            el('span', null, link.label || __('Link', 'blockenberg'))
        );
    }

    registerBlockType('blockenberg/link-in-bio', {
        title: __('Link in Bio', 'blockenberg'),
        icon: 'admin-links',
        category: 'bkbg-business',

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            var blockProps = useBlockProps({ style: buildWrapStyle(a) });

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            function updateLink(id, key, val) {
                setAttributes({ links: a.links.map(function (l) { if (l.id !== id) return l; var u = Object.assign({}, l); u[key] = val; return u; }) });
            }

            var avatarEl = el('div', { className: 'bkbg-lib-avatar-wrap', style: { textAlign: 'center', marginBottom: '20px' } },
                el(MediaUploadCheck, null,
                    el(MediaUpload, {
                        onSelect: function (m) { setAttributes({ avatarUrl: m.url, avatarId: m.id }); },
                        allowedTypes: ['image'], value: a.avatarId,
                        render: function (p) {
                            return el('div', { style: { display: 'inline-block', cursor: 'pointer' }, onClick: p.open },
                                a.avatarUrl
                                    ? el('img', { src: a.avatarUrl, style: { width: a.avatarSize + 'px', height: a.avatarSize + 'px', borderRadius: a.avatarRadius + '%', objectFit: 'cover', border: a.avatarBorderWidth + 'px solid ' + a.avatarBorderColor, display: 'block' } })
                                    : el('div', { style: { width: a.avatarSize + 'px', height: a.avatarSize + 'px', borderRadius: a.avatarRadius + '%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', cursor: 'pointer', border: a.avatarBorderWidth + 'px solid ' + a.avatarBorderColor } }, '👤')
                            );
                        }
                    })
                )
            );

            var linksEl = el('div', { className: 'bkbg-lib-links', style: { display: 'flex', flexDirection: 'column', gap: a.buttonGap + 'px', maxWidth: a.buttonMaxWidth + 'px', margin: '0 auto', width: '100%' } },
                a.links.map(function (link) {
                    return el('div', { key: link.id }, el(LinkButton, { link: link, a: a }));
                })
            );

            return el(Fragment, null,
                el(InspectorControls, null,
                    el(PanelBody, { title: __('Avatar', 'blockenberg'), initialOpen: true },
                        el(RangeControl, { label: __('Size (px)',          'blockenberg'), value: a.avatarSize,        min: 48,  max: 180, onChange: function (v) { setAttributes({ avatarSize:        v }); } }),
                        el(RangeControl, { label: __('Border radius (%)',  'blockenberg'), value: a.avatarRadius,      min: 0,   max: 50,  onChange: function (v) { setAttributes({ avatarRadius:      v }); } }),
                        el(RangeControl, { label: __('Border width (px)',  'blockenberg'), value: a.avatarBorderWidth, min: 0,   max: 8,   onChange: function (v) { setAttributes({ avatarBorderWidth: v }); } }),
                        renderColorControl('avatarBorderColor', __('Border color', 'blockenberg'), a.avatarBorderColor, function (v) { setAttributes({ avatarBorderColor: v }); }, openColorKey, setOpenColorKey),
                        el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect: function (m) { setAttributes({ avatarUrl: m.url, avatarId: m.id }); },
                                allowedTypes: ['image'], value: a.avatarId,
                                render: function (p) { return el(Button, { onClick: p.open, variant: a.avatarUrl ? 'secondary' : 'primary', size: 'compact' }, a.avatarUrl ? __('Replace avatar', 'blockenberg') : __('Set avatar', 'blockenberg')); }
                            })
                        )
                    ),
                    el(PanelBody, { title: __('Profile', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show title / tagline', 'blockenberg'), checked: a.showTitle, onChange: function (v) { setAttributes({ showTitle: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show bio',             'blockenberg'), checked: a.showBio,   onChange: function (v) { setAttributes({ showBio:   v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Links', 'blockenberg'), initialOpen: false },
                        a.links.map(function (link, li) {
                            return el(PanelBody, { key: link.id, title: (link.icon ? link.icon + ' ' : '') + (link.label || 'Link ' + (li + 1)), initialOpen: false },
                                IP() && el(IP().IconPickerControl, {
                                    iconType: link.iconType || 'custom-char',
                                    customChar: link.icon || '',
                                    dashicon: link.iconDashicon || '',
                                    imageUrl: link.iconImageUrl || '',
                                    onChangeType: function (v) { updateLink(link.id, 'iconType', v); },
                                    onChangeChar: function (v) { updateLink(link.id, 'icon', v); },
                                    onChangeDashicon: function (v) { updateLink(link.id, 'iconDashicon', v); },
                                    onChangeImageUrl: function (v) { updateLink(link.id, 'iconImageUrl', v); }
                                }),
                                el(TextControl, { label: __('Label',        'blockenberg'), value: link.label, onChange: function (v) { updateLink(link.id, 'label', v); } }),
                                el(TextControl, { label: __('URL',          'blockenberg'), value: link.url,   onChange: function (v) { updateLink(link.id, 'url',   v); } }),
                                el(SelectControl, { label: __('Button style', 'blockenberg'), value: link.style || 'filled', options: LINK_STYLE_OPTIONS, onChange: function (v) { updateLink(link.id, 'style', v); } }),
                                el(ToggleControl, { label: __('Open in new tab', 'blockenberg'), checked: link.newTab, onChange: function (v) { updateLink(link.id, 'newTab', v); }, __nextHasNoMarginBottom: true }),
                                el(Button, { onClick: function () { setAttributes({ links: a.links.filter(function (l) { return l.id !== link.id; }) }); }, isDestructive: true, variant: 'tertiary', size: 'compact', style: { marginTop: '6px' } }, __('Remove link', 'blockenberg'))
                            );
                        }),
                        el(Button, { variant: 'primary', onClick: function () { setAttributes({ links: a.links.concat([{ id: makeId(), icon: '🔗', iconType: 'custom-char', iconDashicon: '', iconImageUrl: '', label: __('My Link', 'blockenberg'), url: '', newTab: false, style: 'filled' }]) }); }, style: { marginTop: '8px' } }, __('+ Add Link', 'blockenberg'))
                    ),
                    el(PanelBody, { title: __('Button Styling', 'blockenberg'), initialOpen: false },
                        el(SelectControl,  { label: __('Default button style', 'blockenberg'), value: a.buttonStyle,     options: LINK_STYLE_OPTIONS, onChange: function (v) { setAttributes({ buttonStyle:     v }); } }),
                        el(RangeControl,   { label: __('Border radius (px)',   'blockenberg'), value: a.buttonRadius,    min: 0,   max: 99, onChange: function (v) { setAttributes({ buttonRadius:    v }); } }),
                        el(RangeControl,   { label: __('Gap between buttons', 'blockenberg'), value: a.buttonGap,       min: 4,   max: 32, onChange: function (v) { setAttributes({ buttonGap:       v }); } }),
                        el(RangeControl,   { label: __('Max width (px)',       'blockenberg'), value: a.buttonMaxWidth,  min: 240, max: 700, onChange: function (v) { setAttributes({ buttonMaxWidth:  v }); } }),
                        el(RangeControl,   { label: __('Vertical padding (px)','blockenberg'), value: a.buttonPaddingV, min: 8,   max: 28, onChange: function (v) { setAttributes({ buttonPaddingV:  v }); } }),
                        el(ToggleControl,  { label: __('Show icons',           'blockenberg'), checked: a.showIcons,    onChange: function (v) { setAttributes({ showIcons:      v }); }, __nextHasNoMarginBottom: true })
                    ),
                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        getTypoControl() && el(getTypoControl(), { label: __('Name'), value: a.nameTypo || {}, onChange: function (v) { setAttributes({ nameTypo: v }); } }),
                        getTypoControl() && el(getTypoControl(), { label: __('Tagline'), value: a.taglineTypo || {}, onChange: function (v) { setAttributes({ taglineTypo: v }); } }),
                        getTypoControl() && el(getTypoControl(), { label: __('Bio'), value: a.bioTypo || {}, onChange: function (v) { setAttributes({ bioTypo: v }); } }),
                        getTypoControl() && el(getTypoControl(), { label: __('Button'), value: a.buttonTypo || {}, onChange: function (v) { setAttributes({ buttonTypo: v }); } })
                    ),
                    el(PanelBody, { title: __('Colors', 'blockenberg'), initialOpen: false },
                        cc('accentColor',   __('Accent',           'blockenberg'), 'accentColor'),
                        cc('nameColor',     __('Name',             'blockenberg'), 'nameColor'),
                        cc('titleColor',    __('Title / tagline',  'blockenberg'), 'titleColor'),
                        cc('bioColor',      __('Bio text',         'blockenberg'), 'bioColor'),
                        cc('btnBg',         __('Button background','blockenberg'), 'btnBg'),
                        cc('btnColor',      __('Button text',      'blockenberg'), 'btnColor'),
                        cc('btnBorderColor',__('Button border',    'blockenberg'), 'btnBorderColor'),
                        cc('bgColor',       __('Section background','blockenberg'), 'bgColor')
                    ),
                    el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Padding top (px)',    'blockenberg'), value: a.paddingTop,    min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop:    v }); } }),
                        el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: a.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                    )
                ),

                el('div', blockProps,
                    el('div', { className: 'bkbg-lib-inner', style: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: (a.buttonMaxWidth + 80) + 'px', margin: '0 auto' } },
                        avatarEl,
                        el(RichText, { tagName: 'h2', className: 'bkbg-lib-name', value: a.name, onChange: function (v) { setAttributes({ name: v }); }, placeholder: __('Your Name', 'blockenberg'), style: { color: a.nameColor, margin: '0 0 6px', textAlign: 'center' } }),
                        a.showTitle && el(RichText, { tagName: 'p', className: 'bkbg-lib-title', value: a.title, onChange: function (v) { setAttributes({ title: v }); }, placeholder: __('Your tagline', 'blockenberg'), style: { color: a.titleColor, margin: '0 0 12px', textAlign: 'center' } }),
                        a.showBio && el(RichText, { tagName: 'p', className: 'bkbg-lib-bio', value: a.bio, onChange: function (v) { setAttributes({ bio: v }); }, placeholder: __('A short bio…', 'blockenberg'), style: { color: a.bioColor, margin: '0 0 24px', textAlign: 'center' } }),
                        linksEl
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            return el('div', wp.blockEditor.useBlockProps.save({ className: 'bkbg-lib-wrapper', style: buildWrapStyle(a) }),
                el('div', { className: 'bkbg-lib-inner' },
                    el('div', { className: 'bkbg-lib-avatar-wrap' },
                        a.avatarUrl && el('img', { src: a.avatarUrl, alt: a.name || '', loading: 'lazy', className: 'bkbg-lib-avatar' })
                    ),
                    el(RichText.Content, { tagName: 'h2', className: 'bkbg-lib-name', value: a.name }),
                    a.showTitle && el(RichText.Content, { tagName: 'p', className: 'bkbg-lib-title', value: a.title }),
                    a.showBio && el(RichText.Content, { tagName: 'p', className: 'bkbg-lib-bio', value: a.bio }),
                    el('div', { className: 'bkbg-lib-links' },
                        a.links.map(function (link) {
                            var style = link.style || 'filled';
                            return el('a', { key: link.id, href: link.url || '#', className: 'bkbg-lib-btn bkbg-lib-btn--' + style, target: link.newTab ? '_blank' : undefined, rel: link.newTab ? 'noopener noreferrer' : undefined },
                                a.showIcons && link.icon && el('span', { className: 'bkbg-lib-btn-icon', 'aria-hidden': 'true' }, (link.iconType || 'custom-char') !== 'custom-char' && IP() ? IP().buildSaveIcon(link.iconType, link.icon, link.iconDashicon, link.iconImageUrl, link.iconDashiconColor) : link.icon),
                                el('span', { className: 'bkbg-lib-btn-label' }, link.label)
                            );
                        })
                    )
                )
            );
        }
    });
}() );

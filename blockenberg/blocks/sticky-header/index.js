( function () {
    const el = window.wp.element.createElement;
    const { registerBlockType } = window.wp.blocks;
    const { InspectorControls, useBlockProps, MediaUpload, PanelColorSettings } = window.wp.blockEditor;
    const { PanelBody, RangeControl, SelectControl, ToggleControl, TextControl, Button } = window.wp.components;
    const { useState } = window.wp.element;
    const { __ } = window.wp.i18n;

    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    const STYLES = [
        { label: 'Light',    value: 'light' },
        { label: 'Dark',     value: 'dark' },
        { label: 'Glass',    value: 'glass' },
        { label: 'Gradient', value: 'gradient' },
    ];

    function wrapStyle(a) {
        var _tvf = getTypoCssVars();
        var s = {
            '--bkbg-sth-bg':           a.bgColor,
            '--bkbg-sth-text':         a.textColor,
            '--bkbg-sth-link':         a.linkColor,
            '--bkbg-sth-link-hover':   a.linkHoverColor,
            '--bkbg-sth-accent':       a.accentColor,
            '--bkbg-sth-cta-bg':       a.ctaBg,
            '--bkbg-sth-cta-text':     a.ctaTextColor,
            '--bkbg-sth-border':       a.borderColor,
            '--bkbg-sth-max-w':        a.maxWidth + 'px',
            '--bkbg-sth-h':            a.height + 'px',
            '--bkbg-sth-h-shrunk':     a.heightShrunk + 'px',
            '--bkbg-sth-logo-sz':      a.logoSize + 'px',
            '--bkbg-sth-logo-w':       a.logoWeight,
            '--bkbg-sth-logo-lh':      a.logoLineHeight,
            '--bkbg-sth-link-sz':      a.linkSize + 'px',
            '--bkbg-sth-link-w':       a.linkWeight,
            '--bkbg-sth-link-gap':     a.linkGap + 'px',
            '--bkbg-sth-link-lh':      a.linkLineHeight,
            '--bkbg-sth-cta-sz':       a.ctaSize + 'px',
            '--bkbg-sth-cta-w':        a.ctaWeight,
            '--bkbg-sth-cta-r':        a.ctaRadius + 'px',
        };
        Object.assign(s, _tvf(a.logoTypo, '--bksth-lg-'));
        Object.assign(s, _tvf(a.linkTypo, '--bksth-lk-'));
        Object.assign(s, _tvf(a.ctaTypo, '--bksth-ct-'));
        return s;
    }

    registerBlockType('blockenberg/sticky-header', {
        edit: function (props) {
            const { attributes: a, setAttributes } = props;
            const [editingLink, setEditingLink] = useState(null);

            function updateLink(i, key, val) {
                const next = a.navLinks.slice();
                next[i] = Object.assign({}, next[i], { [key]: val });
                setAttributes({ navLinks: next });
            }
            function addLink() {
                setAttributes({ navLinks: [...a.navLinks, { label: 'New Link', url: '#', openNew: false }] });
            }
            function removeLink(i) {
                setAttributes({ navLinks: a.navLinks.filter((_, x) => x !== i) });
                if (editingLink === i) setEditingLink(null);
            }
            function moveLink(i, dir) {
                const next = a.navLinks.slice();
                const target = i + dir;
                if (target < 0 || target >= next.length) return;
                [next[i], next[target]] = [next[target], next[i]];
                setAttributes({ navLinks: next });
            }

            const classList = [
                'bkbg-sth-header',
                'bkbg-sth-style--' + a.style,
                a.borderBottom ? 'bkbg-sth-border-bottom' : '',
                a.shadow ? 'bkbg-sth-shadow' : '',
            ].filter(Boolean).join(' ');

            const blockProps = useBlockProps({ className: 'bkbg-sth-wrap', style: wrapStyle(a) });

            return el('div', blockProps,
                el(InspectorControls, null,

                    el(PanelBody, { title: __('Logo'), initialOpen: true },
                        el(ToggleControl, { label: __('Show Logo'), checked: a.showLogo, onChange: v => setAttributes({ showLogo: v }), __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: __('Logo Text (fallback)'), value: a.logoText, onChange: v => setAttributes({ logoText: v }) }),
                        a.logoUrl
                            ? el('div', { style: { marginBottom: 8 } },
                                el('img', { src: a.logoUrl, style: { maxWidth: a.logoWidth + 'px', height: 'auto', display: 'block', marginBottom: 8 } }),
                                el(Button, { isDestructive: true, isSmall: true, onClick: () => setAttributes({ logoUrl: '', logoId: 0 }) }, __('Remove Logo')),
                              )
                            : el(MediaUpload, {
                                onSelect: m => setAttributes({ logoUrl: m.url, logoId: m.id }),
                                allowedTypes: ['image'],
                                value: a.logoId,
                                render: ({ open }) => el(Button, { variant: 'secondary', onClick: open, style: { width: '100%', justifyContent: 'center' } }, __('Upload Logo Image')),
                              }),
                        el(RangeControl, { label: __('Logo Image Width (px)'), value: a.logoWidth, min: 40, max: 300, onChange: v => setAttributes({ logoWidth: v }) }),
                        el(TextControl, { label: __('Site URL'), value: a.siteUrl, onChange: v => setAttributes({ siteUrl: v }) }),
                    ),

                    el(PanelBody, { title: __('Navigation Links'), initialOpen: true },
                        a.navLinks.map((lnk, i) =>
                            el('div', { key: i, style: { border: '1px solid ' + (editingLink === i ? '#6c3fb5' : '#e2e8f0'), borderRadius: 8, marginBottom: 8, overflow: 'hidden' } },
                                el('div', {
                                    style: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', cursor: 'pointer', background: editingLink === i ? '#f5f0ff' : '#fafafa' },
                                    onClick: () => setEditingLink(editingLink === i ? null : i),
                                },
                                    el('span', { style: { flex: 1, fontWeight: 600, fontSize: 13 } }, lnk.label || __('Link') + ' ' + (i + 1)),
                                    el('span', { className: 'dashicons dashicons-' + (editingLink === i ? 'arrow-up-alt2' : 'arrow-down-alt2'), style: { fontSize: 16, color: '#94a3b8' } }),
                                ),
                                editingLink === i && el('div', { style: { padding: '0 12px 12px' } },
                                    el(TextControl, { label: __('Label'), value: lnk.label, onChange: v => updateLink(i, 'label', v) }),
                                    el(TextControl, { label: __('URL'), value: lnk.url, onChange: v => updateLink(i, 'url', v) }),
                                    el(ToggleControl, { label: __('Open in New Tab'), checked: lnk.openNew, onChange: v => updateLink(i, 'openNew', v), __nextHasNoMarginBottom: true }),
                                    el('div', { style: { display: 'flex', gap: 6, marginTop: 8 } },
                                        el(Button, { isSmall: true, variant: 'secondary', onClick: () => moveLink(i, -1), disabled: i === 0 }, '↑'),
                                        el(Button, { isSmall: true, variant: 'secondary', onClick: () => moveLink(i, 1),  disabled: i === a.navLinks.length - 1 }, '↓'),
                                        el(Button, { isSmall: true, isDestructive: true, onClick: () => removeLink(i) }, __('Remove')),
                                    ),
                                ),
                            )
                        ),
                        el(Button, { variant: 'secondary', onClick: addLink, style: { width: '100%', justifyContent: 'center', marginTop: 8 } }, __('+ Add Link')),
                    ),

                    el(PanelBody, { title: __('CTA Button'), initialOpen: false },
                        el(ToggleControl, { label: __('Show CTA Button'), checked: a.showCta, onChange: v => setAttributes({ showCta: v }), __nextHasNoMarginBottom: true }),
                        el(TextControl, { label: __('Button Text'), value: a.ctaText, onChange: v => setAttributes({ ctaText: v }) }),
                        el(TextControl, { label: __('Button URL'), value: a.ctaUrl, onChange: v => setAttributes({ ctaUrl: v }) }),
                        el(ToggleControl, { label: __('Open in New Tab'), checked: a.ctaOpenNew, onChange: v => setAttributes({ ctaOpenNew: v }), __nextHasNoMarginBottom: true }),
                    ),

                    el(PanelBody, { title: __('Style & Behavior'), initialOpen: false },
                        el(SelectControl, { label: __('Style'), value: a.style, options: STYLES, onChange: v => setAttributes({ style: v }) }),
                        el(ToggleControl, { label: __('Sticky on Scroll'), checked: a.sticky, onChange: v => setAttributes({ sticky: v }), __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Shrink on Scroll'), checked: a.scrollShrink, onChange: v => setAttributes({ scrollShrink: v }), __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Mobile Menu Toggle'), checked: a.showMobileMenu, onChange: v => setAttributes({ showMobileMenu: v }), __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Border Bottom'), checked: a.borderBottom, onChange: v => setAttributes({ borderBottom: v }), __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Drop Shadow (when scrolled)'), checked: a.shadow, onChange: v => setAttributes({ shadow: v }), __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Header Height (px)'), value: a.height, min: 40, max: 120, onChange: v => setAttributes({ height: v }) }),
                        el(RangeControl, { label: __('Shrunk Height (px)'), value: a.heightShrunk, min: 36, max: 100, onChange: v => setAttributes({ heightShrunk: v }) }),
                        el(RangeControl, { label: __('Max Width (px)'), value: a.maxWidth, min: 760, max: 1600, onChange: v => setAttributes({ maxWidth: v }) }),
                        el(RangeControl, { label: __('z-index'), value: a.zIndex, min: 1, max: 9999, onChange: v => setAttributes({ zIndex: v }) }),
                    ),

                    el(PanelBody, { title: __('Typography'), initialOpen: false },
                        getTypoControl() && getTypoControl()({ label: __('Logo Text'), value: a.logoTypo, onChange: function (v) { setAttributes({ logoTypo: v }); } }),
                        getTypoControl() && getTypoControl()({ label: __('Nav Links'), value: a.linkTypo, onChange: function (v) { setAttributes({ linkTypo: v }); } }),
                        getTypoControl() && getTypoControl()({ label: __('CTA Button'), value: a.ctaTypo, onChange: function (v) { setAttributes({ ctaTypo: v }); } }),
                        el(RangeControl, { label: __('Nav Gap (px)'), value: a.linkGap, min: 8, max: 64, onChange: v => setAttributes({ linkGap: v }) }),
                        el(RangeControl, { label: __('CTA Radius (px)'), value: a.ctaRadius, min: 0, max: 32, onChange: v => setAttributes({ ctaRadius: v }) }),
                    ),

                    el(PanelColorSettings, {
                        title: __('Colors'), initialOpen: false,
                        colorSettings: [
                            { label: __('Background'),    value: a.bgColor,       onChange: v => setAttributes({ bgColor:       v || '#ffffff' }) },
                            { label: __('Text / Logo'),   value: a.textColor,     onChange: v => setAttributes({ textColor:     v || '#0f172a' }) },
                            { label: __('Nav Links'),     value: a.linkColor,     onChange: v => setAttributes({ linkColor:     v || '#374151' }) },
                            { label: __('Link Hover'),    value: a.linkHoverColor,onChange: v => setAttributes({ linkHoverColor:v || '#6c3fb5' }) },
                            { label: __('Accent'),        value: a.accentColor,   onChange: v => setAttributes({ accentColor:   v || '#6c3fb5' }) },
                            { label: __('CTA BG'),        value: a.ctaBg,         onChange: v => setAttributes({ ctaBg:         v || '#6c3fb5' }) },
                            { label: __('CTA Text'),      value: a.ctaTextColor,  onChange: v => setAttributes({ ctaTextColor:  v || '#ffffff' }) },
                            { label: __('Border'),        value: a.borderColor,   onChange: v => setAttributes({ borderColor:   v || '#e2e8f0' }) },
                        ]
                    }),
                ),

                /* ---- Editor Canvas ---- */
                el('header', {
                    className: classList,
                    style: { position: 'relative' },
                },
                    el('div', { className: 'bkbg-sth-inner' },
                        /* Logo */
                        a.showLogo && el('div', { className: 'bkbg-sth-logo' },
                            a.logoUrl
                                ? el('img', { src: a.logoUrl, alt: a.logoText, className: 'bkbg-sth-logo-img' })
                                : el('span', { className: 'bkbg-sth-logo-text' }, a.logoText),
                        ),
                        /* Nav */
                        el('nav', { className: 'bkbg-sth-nav' },
                            a.navLinks.map((lnk, i) =>
                                el('a', { key: i, className: 'bkbg-sth-nav-link', href: lnk.url, onClick: e => e.preventDefault() }, lnk.label)
                            )
                        ),
                        /* CTA + Hamburger */
                        el('div', { className: 'bkbg-sth-actions' },
                            a.showCta && el('a', { className: 'bkbg-sth-cta', href: a.ctaUrl, onClick: e => e.preventDefault() }, a.ctaText),
                            a.showMobileMenu && el('button', { className: 'bkbg-sth-hamburger', 'aria-label': 'Menu' },
                                el('span'), el('span'), el('span'),
                            ),
                        ),
                    ),
                ),
            );
        },

        save: function ({ attributes: a }) {
            const classList = [
                'bkbg-sth-header',
                'bkbg-sth-style--' + a.style,
                a.sticky ? 'bkbg-sth-sticky' : '',
                a.scrollShrink ? 'bkbg-sth-shrink' : '',
                a.borderBottom ? 'bkbg-sth-border-bottom' : '',
                a.shadow ? 'bkbg-sth-shadow' : '',
            ].filter(Boolean).join(' ');

            return el('div', {
                className: 'bkbg-sth-wrap',
                style: { ...wrapStyle(a), '--bkbg-sth-z': a.zIndex },
            },
                el('header', { className: classList, 'data-sticky': a.sticky ? '1' : '0', 'data-shrink': a.scrollShrink ? '1' : '0' },
                    el('div', { className: 'bkbg-sth-inner' },
                        a.showLogo && el('a', { href: a.siteUrl, className: 'bkbg-sth-logo' },
                            a.logoUrl
                                ? el('img', { src: a.logoUrl, alt: a.logoText, className: 'bkbg-sth-logo-img', style: { width: a.logoWidth + 'px' } })
                                : el('span', { className: 'bkbg-sth-logo-text' }, a.logoText),
                        ),
                        el('nav', { className: 'bkbg-sth-nav', 'aria-label': 'Main navigation' },
                            a.navLinks.map((lnk, i) =>
                                el('a', { key: i, className: 'bkbg-sth-nav-link', href: lnk.url, target: lnk.openNew ? '_blank' : undefined, rel: lnk.openNew ? 'noopener noreferrer' : undefined }, lnk.label)
                            )
                        ),
                        el('div', { className: 'bkbg-sth-actions' },
                            a.showCta && el('a', { className: 'bkbg-sth-cta', href: a.ctaUrl, target: a.ctaOpenNew ? '_blank' : undefined, rel: a.ctaOpenNew ? 'noopener noreferrer' : undefined }, a.ctaText),
                            a.showMobileMenu && el('button', { className: 'bkbg-sth-hamburger', 'aria-label': __('Open menu'), 'aria-expanded': 'false', 'aria-controls': 'bkbg-sth-mobile-nav' },
                                el('span'), el('span'), el('span'),
                            ),
                        ),
                    ),
                    a.showMobileMenu && el('div', { id: 'bkbg-sth-mobile-nav', className: 'bkbg-sth-mobile-nav', 'aria-hidden': 'true' },
                        a.navLinks.map((lnk, i) =>
                            el('a', { key: i, className: 'bkbg-sth-mobile-link', href: lnk.url, target: lnk.openNew ? '_blank' : undefined }, lnk.label)
                        ),
                        a.showCta && el('a', { className: 'bkbg-sth-cta bkbg-sth-mobile-cta', href: a.ctaUrl }, a.ctaText),
                    ),
                ),
            );
        }
    });
}() );

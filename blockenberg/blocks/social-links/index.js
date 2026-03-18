( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var useState = wp.element.useState;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var Button = wp.components.Button;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var ColorPicker = wp.components.ColorPicker;
    var Popover = wp.components.Popover;
    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    // ── Platform definitions ──────────────────────────────────────────────────
    var platforms = {
        facebook:  { label: 'Facebook',    color: '#1877F2', svg: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
        instagram: { label: 'Instagram',   color: '#E4405F', svg: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162S8.597 18.163 12 18.163s6.162-2.759 6.162-6.162S15.403 5.838 12 5.838zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' },
        twitter:   { label: 'Twitter / X', color: '#000000', svg: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 5.966zm-1.161 17.52h1.833L7.084 4.126H5.117z' },
        youtube:   { label: 'YouTube',     color: '#FF0000', svg: 'M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z' },
        linkedin:  { label: 'LinkedIn',    color: '#0A66C2', svg: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
        tiktok:    { label: 'TikTok',      color: '#000000', svg: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z' },
        pinterest: { label: 'Pinterest',   color: '#BD081C', svg: 'M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z' },
        github:    { label: 'GitHub',      color: '#181717', svg: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' },
        whatsapp:  { label: 'WhatsApp',    color: '#25D366', svg: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z' },
        telegram:  { label: 'Telegram',    color: '#26A5E4', svg: 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z' },
        reddit:    { label: 'Reddit',      color: '#FF4500', svg: 'M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z' },
        rss:       { label: 'RSS',         color: '#FFA500', svg: 'M19.199 24C19.199 13.467 10.533 4.8 0 4.8V0c13.165 0 24 10.835 24 24h-4.801zM3.291 17.415a3.3 3.3 0 0 1 3.293 3.295A3.308 3.308 0 0 1 3.28 24C1.47 24 0 22.526 0 20.71s1.475-3.294 3.291-3.295zM15.909 24h-4.665c0-6.169-5.075-11.245-11.244-11.245V8.088c8.727 0 15.909 7.184 15.909 15.912z' }
    };

    var platformKeys = Object.keys(platforms);

    // ── Brand colors map ──────────────────────────────────────────────────────
    function getPlatformColor(platform) {
        return (platforms[platform] && platforms[platform].color) || '#555';
    }

    // ── CSS vars ──────────────────────────────────────────────────────────────
    function buildWrapStyle(a) {
        var s = {
            '--bkbg-sl-icon-size'    : a.iconSize + 'px',
            '--bkbg-sl-btn-size'     : a.buttonSize + 'px',
            '--bkbg-sl-gap'          : a.gap + 'px',
            '--bkbg-sl-radius'       : a.borderRadius + 'px',
            '--bkbg-sl-border-w'     : a.borderWidth + 'px',
            '--bkbg-sl-custom-icon'  : a.customIconColor,
            '--bkbg-sl-custom-bg'    : a.customBgColor,
            '--bkbg-sl-custom-icon-h': a.customHoverIconColor,
            '--bkbg-sl-custom-bg-h'  : a.customHoverBgColor,
                '--bkbg-sl-label-size'   : a.labelFontSize + 'px',
                '--bkbg-sl-label-weight' : a.labelFontWeight,
                '--bkbg-sl-label-line-height': a.labelLineHeight,
            '--bkbg-sl-label-color'  : a.labelColor,
            '--bkbg-sl-label-color-h': a.labelColorHover,
            '--bkbg-sl-pad-top'      : a.wrapperPaddingTop + 'px',
            '--bkbg-sl-pad-bottom'   : a.wrapperPaddingBottom + 'px'
        };
        var _tvFn = getTypoCssVars();
        if (_tvFn) Object.assign(s, _tvFn(a.labelTypo || {}, '--bksl-lb-'));
        return s;
    }

    // ── SVG icon builder ──────────────────────────────────────────────────────
    function buildIcon(platform) {
        var p = platforms[platform];
        if (!p) return el('span', { className: 'bkbg-sl-unknown' }, platform[0].toUpperCase());
        return el('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            viewBox: '0 0 24 24',
            'aria-hidden': 'true',
            focusable: 'false',
            className: 'bkbg-sl-svg'
        }, el('path', { d: p.svg }));
    }

    // ── Color swatch ──────────────────────────────────────────────────────────
    function renderColorControl(key, label, value, onChange, openKey, setOpenKey) {
        var isOpen = openKey === key;
        return el('div', { key: key, style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', gap: '8px' } },
            el('span', { style: { fontSize: '12px', color: '#1e1e1e', flex: 1, lineHeight: 1.4 } }, label),
            el('div', { style: { position: 'relative', flexShrink: 0 } },
                el('button', {
                    type: 'button', title: value || 'none',
                    onClick: function () { setOpenKey(isOpen ? null : key); },
                    style: { width: '28px', height: '28px', borderRadius: '4px', border: isOpen ? '2px solid #007cba' : '2px solid #ddd', cursor: 'pointer', padding: 0, background: value || '#fff' }
                }),
                isOpen && el(Popover, { position: 'bottom left', onClose: function () { setOpenKey(null); } },
                    el('div', { style: { padding: '8px' } },
                        el(ColorPicker, { color: value, enableAlpha: true, onChange: onChange })
                    )
                )
            )
        );
    }

    function updateLink(links, i, field, value, setAttributes) {
        var newLinks = links.map(function (link, idx) {
            if (idx !== i) return link;
            var upd = {};
            for (var k in link) { upd[k] = link[k]; }
            upd[field] = value;
            return upd;
        });
        setAttributes({ links: newLinks });
    }

    // ── Register ──────────────────────────────────────────────────────────────
    registerBlockType('blockenberg/social-links', {
        title: __('Social Links', 'blockenberg'),
        icon: 'share',
        category: 'bkbg-marketing',
        description: __('Social media icon links with brand colors and multiple layout options.', 'blockenberg'),

        edit: function (props) {
            var a = props.attributes;
            var setAttributes = props.setAttributes;

            var openColorKeyState = useState(null);
            var openColorKey = openColorKeyState[0];
            var setOpenColorKey = openColorKeyState[1];

            function cc(key, label, attrKey) {
                return renderColorControl(key, label, a[attrKey], function (val) {
                    var upd = {}; upd[attrKey] = val; setAttributes(upd);
                }, openColorKey, setOpenColorKey);
            }

            function addLink() {
                // Find a platform not already added
                var usedPlatforms = a.links.map(function (l) { return l.platform; });
                var next = platformKeys.find(function (k) { return usedPlatforms.indexOf(k) === -1; }) || 'facebook';
                setAttributes({ links: a.links.concat([{ platform: next, url: '', label: platforms[next] ? platforms[next].label : next, enabled: true }]) });
            }

            function removeLink(i) {
                setAttributes({ links: a.links.filter(function (_, idx) { return idx !== i; }) });
            }

            function moveLink(i, dir) {
                var ni = i + dir;
                if (ni < 0 || ni >= a.links.length) return;
                var arr = a.links.slice(); var tmp = arr[i]; arr[i] = arr[ni]; arr[ni] = tmp;
                setAttributes({ links: arr });
            }

            var wrapClass = 'bkbg-sl-wrapper bkbg-sl-layout-' + a.layout + ' bkbg-sl-align-' + a.alignment + ' bkbg-sl-style-' + a.iconStyle + ' bkbg-sl-hover-' + a.hoverEffect + (a.showLabel ? ' bkbg-sl-show-label bkbg-sl-label-' + a.labelPosition : '');
            var blockProps = useBlockProps({ className: wrapClass, style: buildWrapStyle(a) });

            // ── Inspector ─────────────────────────────────────────────────────
            var inspector = el(InspectorControls, {},
                // Links
                el(PanelBody, { title: __('Social Links', 'blockenberg'), initialOpen: true },
                    a.links.map(function (link, i) {
                        return el('div', {
                            key: i,
                            style: { border: '1px solid #ddd', borderRadius: '6px', padding: '10px', marginBottom: '10px', background: link.enabled ? '#fafafa' : '#f5f5f5', opacity: link.enabled ? 1 : 0.6 }
                        },
                            el('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' } },
                                el('div', { style: { width: '20px', height: '20px', borderRadius: '4px', background: getPlatformColor(link.platform), flexShrink: 0 } }),
                                el('span', { style: { fontWeight: '600', fontSize: '12px', flex: 1 } }, link.label || link.platform),
                                el(Button, { isSmall: true, variant: 'tertiary', onClick: function () { moveLink(i, -1); }, disabled: i === 0 }, '↑'),
                                el(Button, { isSmall: true, variant: 'tertiary', onClick: function () { moveLink(i, 1); }, disabled: i === a.links.length - 1 }, '↓'),
                                el(Button, { isSmall: true, isDestructive: true, variant: 'tertiary', onClick: function () { removeLink(i); } }, '✕')
                            ),
                            el(SelectControl, {
                                label: __('Platform', 'blockenberg'), value: link.platform,
                                options: platformKeys.map(function (k) { return { label: platforms[k].label, value: k }; }),
                                onChange: function (v) {
                                    updateLink(a.links, i, 'platform', v, setAttributes);
                                    updateLink(a.links, i, 'label', platforms[v] ? platforms[v].label : v, setAttributes);
                                }
                            }),
                            el(TextControl, {
                                label: __('URL', 'blockenberg'), value: link.url, type: 'url', placeholder: 'https://',
                                onChange: function (v) { updateLink(a.links, i, 'url', v, setAttributes); }
                            }),
                            el(TextControl, {
                                label: __('Custom Label', 'blockenberg'), value: link.label,
                                onChange: function (v) { updateLink(a.links, i, 'label', v, setAttributes); }
                            }),
                            el(ToggleControl, {
                                label: __('Enabled', 'blockenberg'), checked: link.enabled,
                                onChange: function (v) { updateLink(a.links, i, 'enabled', v, setAttributes); }
                            })
                        );
                    }),
                    el(Button, { variant: 'secondary', onClick: addLink, style: { width: '100%', justifyContent: 'center' } },
                        '+ ' + __('Add Platform', 'blockenberg')
                    )
                ),

                // Layout & Style
                el(PanelBody, { title: __('Layout & Style', 'blockenberg'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Layout', 'blockenberg'), value: a.layout,
                        options: [
                            { label: __('Horizontal (row)', 'blockenberg'), value: 'horizontal' },
                            { label: __('Vertical (column)', 'blockenberg'), value: 'vertical' },
                            { label: __('Grid (wrapping)', 'blockenberg'), value: 'grid' }
                        ],
                        onChange: function (v) { setAttributes({ layout: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Alignment', 'blockenberg'), value: a.alignment,
                        options: [
                            { label: __('Left', 'blockenberg'), value: 'left' },
                            { label: __('Center', 'blockenberg'), value: 'center' },
                            { label: __('Right', 'blockenberg'), value: 'right' }
                        ],
                        onChange: function (v) { setAttributes({ alignment: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Icon Style', 'blockenberg'), value: a.iconStyle,
                        options: [
                            { label: __('Brand Color (filled)', 'blockenberg'), value: 'brand-solid' },
                            { label: __('Brand Color (icon only)', 'blockenberg'), value: 'brand-icon' },
                            { label: __('Monochrome (dark)', 'blockenberg'), value: 'mono-dark' },
                            { label: __('Monochrome (light)', 'blockenberg'), value: 'mono-light' },
                            { label: __('Outline (brand color)', 'blockenberg'), value: 'outline-brand' },
                            { label: __('Outline (custom)', 'blockenberg'), value: 'outline-custom' },
                            { label: __('Custom Colors', 'blockenberg'), value: 'custom' }
                        ],
                        onChange: function (v) { setAttributes({ iconStyle: v }); }
                    }),
                    el(SelectControl, {
                        label: __('Hover Effect', 'blockenberg'), value: a.hoverEffect,
                        options: [
                            { label: __('Lift', 'blockenberg'), value: 'lift' },
                            { label: __('Scale', 'blockenberg'), value: 'scale' },
                            { label: __('Fade to Brand', 'blockenberg'), value: 'fade-brand' },
                            { label: __('Fill', 'blockenberg'), value: 'fill' },
                            { label: __('None', 'blockenberg'), value: 'none' }
                        ],
                        onChange: function (v) { setAttributes({ hoverEffect: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Icon Size (px)', 'blockenberg'), value: a.iconSize, min: 10, max: 48,
                        onChange: function (v) { setAttributes({ iconSize: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Button Size (px)', 'blockenberg'), value: a.buttonSize, min: a.iconSize + 4, max: 100,
                        onChange: function (v) { setAttributes({ buttonSize: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Gap Between Icons (px)', 'blockenberg'), value: a.gap, min: 0, max: 40,
                        onChange: function (v) { setAttributes({ gap: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Radius (px)', 'blockenberg'), value: a.borderRadius, min: 0, max: 60,
                        onChange: function (v) { setAttributes({ borderRadius: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Border Width (px)', 'blockenberg'), value: a.borderWidth, min: 0, max: 6,
                        onChange: function (v) { setAttributes({ borderWidth: v }); }
                    })
                ),

                // Labels
                el(PanelBody, { title: __('Labels', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        label: __('Show Platform Labels', 'blockenberg'), checked: a.showLabel,
                        onChange: function (v) { setAttributes({ showLabel: v }); }
                    }),
                    a.showLabel && el(Fragment, {},
                        el(SelectControl, {
                            label: __('Label Position', 'blockenberg'), value: a.labelPosition,
                            options: [
                                { label: __('Right of icon', 'blockenberg'), value: 'right' },
                                { label: __('Below icon', 'blockenberg'), value: 'bottom' }
                            ],
                            onChange: function (v) { setAttributes({ labelPosition: v }); }
                        }),
                        cc('labelColor', __('Label Color', 'blockenberg'), 'labelColor'),
                        cc('labelColorHover', __('Label Hover Color', 'blockenberg'), 'labelColorHover')
                    )
                ),

                // Custom Colors (shown when custom style selected)
                (a.iconStyle === 'custom' || a.iconStyle === 'outline-custom' || a.iconStyle === 'mono-dark' || a.iconStyle === 'mono-light') && el(PanelBody, { title: __('Custom Colors', 'blockenberg'), initialOpen: false },
                    cc('customIconColor', __('Icon Color', 'blockenberg'), 'customIconColor'),
                    cc('customBgColor', __('Background Color', 'blockenberg'), 'customBgColor'),
                    cc('customHoverIconColor', __('Hover Icon Color', 'blockenberg'), 'customHoverIconColor'),
                    cc('customHoverBgColor', __('Hover Background Color', 'blockenberg'), 'customHoverBgColor')
                ),

                // Spacing
                el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                    el(RangeControl, {
                        label: __('Padding Top (px)', 'blockenberg'), value: a.wrapperPaddingTop, min: 0, max: 120,
                        onChange: function (v) { setAttributes({ wrapperPaddingTop: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Padding Bottom (px)', 'blockenberg'), value: a.wrapperPaddingBottom, min: 0, max: 120,
                        onChange: function (v) { setAttributes({ wrapperPaddingBottom: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Open Links in New Tab', 'blockenberg'), checked: a.openNewTab,
                        onChange: function (v) { setAttributes({ openNewTab: v }); }
                    })
                ),

                // Typography
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    getTypoControl() && el(getTypoControl(), {
                        label: __('Label', 'blockenberg'),
                        value: a.labelTypo || {},
                        onChange: function (v) { setAttributes({ labelTypo: v }); }
                    })
                )
            );

            // ── Render ────────────────────────────────────────────────────────
            function renderLinkItem(link, i) {
                if (!link.enabled) return null;
                var brandColor = getPlatformColor(link.platform);
                var iconEl = buildIcon(link.platform);

                return el('a', {
                    key: i,
                    href: link.url || '#',
                    className: 'bkbg-sl-link bkbg-sl-platform-' + link.platform,
                    style: { '--bkbg-sl-brand': brandColor },
                    onClick: function (e) { e.preventDefault(); },
                    title: link.label,
                    'aria-label': link.label
                },
                    el('span', { className: 'bkbg-sl-icon' }, iconEl),
                    a.showLabel && el('span', { className: 'bkbg-sl-label' }, link.label)
                );
            }

            return el(Fragment, {},
                inspector,
                el('div', blockProps,
                    el('div', { className: 'bkbg-sl-inner' },
                        a.links.map(function (link, i) { return renderLinkItem(link, i); })
                    )
                )
            );
        },

        // ── Save ─────────────────────────────────────────────────────────────
        save: function (props) {
            var a = props.attributes;
            var wrapClass = 'bkbg-sl-wrapper bkbg-sl-layout-' + a.layout + ' bkbg-sl-align-' + a.alignment + ' bkbg-sl-style-' + a.iconStyle + ' bkbg-sl-hover-' + a.hoverEffect + (a.showLabel ? ' bkbg-sl-show-label bkbg-sl-label-' + a.labelPosition : '');

            return el('div', wp.blockEditor.useBlockProps.save({ className: wrapClass, style: buildWrapStyle(a) }),
                el('div', { className: 'bkbg-sl-inner' },
                    a.links.filter(function (l) { return l.enabled; }).map(function (link, i) {
                        var brandColor = getPlatformColor(link.platform);
                        var p = platforms[link.platform];
                        var svgEl = p
                            ? el('svg', { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', 'aria-hidden': 'true', focusable: 'false', className: 'bkbg-sl-svg' }, el('path', { d: p.svg }))
                            : null;

                        return el('a', {
                            key: i,
                            href: link.url || '#',
                            className: 'bkbg-sl-link bkbg-sl-platform-' + link.platform,
                            style: { '--bkbg-sl-brand': brandColor },
                            target: a.openNewTab ? '_blank' : undefined,
                            rel: a.openNewTab ? 'noopener noreferrer' : undefined,
                            'aria-label': link.label
                        },
                            el('span', { className: 'bkbg-sl-icon' }, svgEl),
                            a.showLabel && el('span', { className: 'bkbg-sl-label' }, link.label)
                        );
                    })
                )
            );
        }
    });
}() );

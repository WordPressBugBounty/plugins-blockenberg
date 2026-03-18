( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var useState = wp.element.useState;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var Button = wp.components.Button;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    /* ── Placeholder logo SVG ─────────────────────────────────────────────── */
    var PLACEHOLDER_SVG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60" viewBox="0 0 120 60">' +
        '<rect width="120" height="60" fill="#f3f4f6" rx="4"/>' +
        '<text x="60" y="36" text-anchor="middle" fill="#9ca3af" font-size="11" font-family="sans-serif">Logo</text>' +
        '</svg>'
    );

    /* ── Card builder (shared edit/save) ──────────────────────────────────── */
    function buildCardStyle(a) {
        return {
            background: a.cardBg,
            borderRadius: a.cardRadius + 'px',
            padding: a.cardPadding + 'px',
            border: a.showBorder ? '1px solid ' + a.borderColor : 'none',
            boxShadow: a.showShadow ? '0 2px 12px rgba(0,0,0,0.06)' : 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: a.itemAlign === 'left' ? 'flex-start' : 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            cursor: 'default',
        };
    }

    function buildImgStyle(a, logo) {
        return {
            height: a.logoHeight + 'px',
            width: 'auto',
            maxWidth: '100%',
            objectFit: 'contain',
            display: 'block',
            filter: a.grayscale ? 'grayscale(100%)' : 'none',
            opacity: a.logoOpacity / 100,
            transition: 'filter 0.3s ease, opacity 0.3s ease, transform 0.25s ease',
        };
    }

    /* ── Logo item editor row ─────────────────────────────────────────────── */
    function LogoEditor(props) {
        var a = props.attr, logo = props.logo, idx = props.idx;
        var onUpdate = props.onUpdate, onRemove = props.onRemove;
        var expandState = useState(false);
        var expanded = expandState[0], setExpanded = expandState[1];

        return el('div', { style: { border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '8px', overflow: 'hidden' } },
            el('div', {
                style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: '#f9fafb', cursor: 'pointer' },
                onClick: function () { setExpanded(!expanded); }
            },
                logo.url
                    ? el('img', { src: logo.url, alt: logo.alt, style: { height: '28px', width: 'auto', objectFit: 'contain', borderRadius: '3px' } })
                    : el('div', { style: { width: '40px', height: '28px', background: '#e5e7eb', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#9ca3af' } }, 'img'),
                el('span', { style: { flex: 1, fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, logo.name || ('Logo ' + (idx + 1))),
                el('span', { style: { fontSize: '12px', color: '#9ca3af' } }, expanded ? '▲' : '▼'),
                el(Button, {
                    isSmall: true, variant: 'tertiary', isDestructive: true,
                    onClick: function (e) { e.stopPropagation(); onRemove(idx); }
                }, '×')
            ),
            expanded && el('div', { style: { padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' } },
                el(MediaUploadCheck, null,
                    el(MediaUpload, {
                        onSelect: function (m) { onUpdate(idx, 'url', m.url); onUpdate(idx, 'id', m.id); onUpdate(idx, 'alt', m.alt || ''); },
                        allowedTypes: ['image'],
                        value: logo.id,
                        render: function (ref) {
                            return el(Button, { variant: logo.url ? 'secondary' : 'primary', onClick: ref.open, isSmall: true },
                                logo.url ? __('Replace Image', 'blockenberg') : __('Choose Image', 'blockenberg')
                            );
                        }
                    })
                ),
                el(TextControl, { label: __('Name', 'blockenberg'), value: logo.name, onChange: function (v) { onUpdate(idx, 'name', v); } }),
                el(TextControl, { label: __('Link URL', 'blockenberg'), value: logo.link, onChange: function (v) { onUpdate(idx, 'link', v); } }),
                el(ToggleControl, { label: __('Open in new tab', 'blockenberg'), checked: logo.newTab, onChange: function (v) { onUpdate(idx, 'newTab', v); }, __nextHasNoMarginBottom: true })
            )
        );
    }

    registerBlockType('blockenberg/logo-wall', {
        title: __('Logo Wall', 'blockenberg'),
        icon: 'grid-view',
        category: 'bkbg-marketing',
        description: __('Static grid of client/partner logos with hover effects.', 'blockenberg'),

        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var a = attributes;

            function updateLogo(idx, key, val) {
                var arr = a.logos.slice();
                arr[idx] = Object.assign({}, arr[idx]);
                arr[idx][key] = val;
                setAttributes({ logos: arr });
            }
            function addLogo() {
                var n = a.logos.length + 1;
                setAttributes({ logos: a.logos.concat([{ url: '', id: 0, alt: 'Logo ' + n, name: 'Client ' + n, link: '', newTab: false }]) });
            }
            function removeLogo(idx) {
                setAttributes({ logos: a.logos.filter(function (_, i) { return i !== idx; }) });
            }

            var hoverOptions = [
                { label: __('Lift (move up)',   'blockenberg'), value: 'lift' },
                { label: __('Scale (zoom in)',  'blockenberg'), value: 'scale' },
                { label: __('Glow',             'blockenberg'), value: 'glow' },
                { label: __('None',             'blockenberg'), value: 'none' },
            ];
            var alignOptions = [
                { label: __('Center', 'blockenberg'), value: 'center' },
                { label: __('Left',   'blockenberg'), value: 'left' },
            ];

            var blockProps = useBlockProps((function () {
                var _tvFn = getTypoCssVars();
                var s = {};
                if (_tvFn) {
                    Object.assign(s, _tvFn(a.titleTypo, '--bklw-tt-'));
                    Object.assign(s, _tvFn(a.nameTypo, '--bklw-n-'));
                }
                return { className: 'bklw-wrap', style: s };
            })());

            return el(Fragment, null,
                el(InspectorControls, null,

                    /* — Logos — */
                    el(PanelBody, { title: __('Logos', 'blockenberg'), initialOpen: true },
                        a.logos.map(function (logo, idx) {
                            return el(LogoEditor, { key: idx, attr: a, logo: logo, idx: idx, onUpdate: updateLogo, onRemove: removeLogo });
                        }),
                        el(Button, { variant: 'primary', onClick: addLogo, style: { width: '100%', marginTop: '8px' } },
                            __('+ Add Logo', 'blockenberg'))
                    ),

                    /* — Layout — */
                    el(PanelBody, { title: __('Grid Layout', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Columns', 'blockenberg'), value: a.columns, min: 2, max: 8, onChange: function (v) { setAttributes({ columns: v }); } }),
                        el(RangeControl, { label: __('Logo Height (px)', 'blockenberg'), value: a.logoHeight, min: 20, max: 200, onChange: function (v) { setAttributes({ logoHeight: v }); } }),
                        el(RangeControl, { label: __('Gap (px)', 'blockenberg'), value: a.gap, min: 4, max: 80, onChange: function (v) { setAttributes({ gap: v }); } }),
                        el(SelectControl, { label: __('Item Alignment', 'blockenberg'), value: a.itemAlign, options: alignOptions, onChange: function (v) { setAttributes({ itemAlign: v }); } })
                    ),

                    /* — Title — */
                    el(PanelBody, { title: __('Section Title', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Show Title', 'blockenberg'), checked: a.showTitle, onChange: function (v) { setAttributes({ showTitle: v }); }, __nextHasNoMarginBottom: true }),
                        a.showTitle && el(TextControl, { label: __('Title Text', 'blockenberg'), value: a.title, onChange: function (v) { setAttributes({ title: v }); } }),
                        a.showTitle && el(SelectControl, { label: __('Title Align', 'blockenberg'), value: a.titleAlign, options: [{ label: 'Center', value: 'center' }, { label: 'Left', value: 'left' }, { label: 'Right', value: 'right' }], onChange: function (v) { setAttributes({ titleAlign: v }); } })
                    ),

                    /* — Logo Effects — */
                    el(PanelBody, { title: __('Logo Effects', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Grayscale', 'blockenberg'), checked: a.grayscale, onChange: function (v) { setAttributes({ grayscale: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Color on Hover', 'blockenberg'), checked: a.colorOnHover, onChange: function (v) { setAttributes({ colorOnHover: v }); }, __nextHasNoMarginBottom: true }),
                        el(RangeControl, { label: __('Default Opacity (%)', 'blockenberg'), value: a.logoOpacity, min: 10, max: 100, onChange: function (v) { setAttributes({ logoOpacity: v }); } }),
                        el(SelectControl, { label: __('Hover Effect', 'blockenberg'), value: a.hoverEffect, options: hoverOptions, onChange: function (v) { setAttributes({ hoverEffect: v }); } }),
                        el(ToggleControl, { label: __('Show Name', 'blockenberg'), checked: a.showName, onChange: function (v) { setAttributes({ showName: v }); }, __nextHasNoMarginBottom: true }),
                        ),

                    /* — Card Style — */
                    el(PanelBody, { title: __('Card Style', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Card Radius (px)', 'blockenberg'), value: a.cardRadius, min: 0, max: 40, onChange: function (v) { setAttributes({ cardRadius: v }); } }),
                        el(RangeControl, { label: __('Card Padding (px)', 'blockenberg'), value: a.cardPadding, min: 0, max: 60, onChange: function (v) { setAttributes({ cardPadding: v }); } }),
                        el(ToggleControl, { label: __('Show Border', 'blockenberg'), checked: a.showBorder, onChange: function (v) { setAttributes({ showBorder: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Shadow', 'blockenberg'), checked: a.showShadow, onChange: function (v) { setAttributes({ showShadow: v }); }, __nextHasNoMarginBottom: true }),
                        el(ToggleControl, { label: __('Show Divider', 'blockenberg'), checked: a.showDivider, onChange: function (v) { setAttributes({ showDivider: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    /* — Colors — */
                    
                    el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                        el(getTypoControl(), { label: __('Title', 'blockenberg'), value: a.titleTypo, onChange: function (v) { setAttributes({ titleTypo: v }); } }),
                        el(getTypoControl(), { label: __('Name', 'blockenberg'), value: a.nameTypo, onChange: function (v) { setAttributes({ nameTypo: v }); } })
                    ),
el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Card Background', 'blockenberg'), value: a.cardBg, onChange: function (v) { setAttributes({ cardBg: v || 'transparent' }); } },
                            { label: __('Card Background Hover', 'blockenberg'), value: a.cardBgHover, onChange: function (v) { setAttributes({ cardBgHover: v || '#f9fafb' }); } },
                            { label: __('Border Color', 'blockenberg'), value: a.borderColor, onChange: function (v) { setAttributes({ borderColor: v || '#e5e7eb' }); } },
                            { label: __('Divider Color', 'blockenberg'), value: a.dividerColor, onChange: function (v) { setAttributes({ dividerColor: v || '#e5e7eb' }); } },
                            { label: __('Name Color', 'blockenberg'), value: a.nameColor, onChange: function (v) { setAttributes({ nameColor: v || '#374151' }); } },
                            { label: __('Title Color', 'blockenberg'), value: a.titleColor, onChange: function (v) { setAttributes({ titleColor: v || '#6b7280' }); } },
                        ]
                    })
                ),

                /* ── Canvas ─────────────────────────────────────────────────── */
                el('div', blockProps,
                    a.showTitle && el('p', {
                        className: 'bklw-title',
                        style: { textAlign: a.titleAlign, color: a.titleColor, margin: '0 0 24px' }
                    }, a.title),
                    a.showDivider && el('hr', { style: { borderColor: a.dividerColor, margin: '0 0 24px' } }),
                    el('div', {
                        className: 'bklw-grid',
                        style: { display: 'grid', gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)', gap: a.gap + 'px' }
                    },
                        a.logos.map(function (logo, idx) {
                            return el('div', { key: idx, className: 'bklw-card', style: buildCardStyle(a) },
                                el('img', {
                                    src: logo.url || PLACEHOLDER_SVG,
                                    alt: logo.alt || logo.name,
                                    style: buildImgStyle(a, logo),
                                    className: 'bklw-img'
                                }),
                                a.showName && el('p', {
                                    className: 'bklw-name',
                                    style: { margin: '8px 0 0', color: a.nameColor, textAlign: a.itemAlign }
                                }, logo.name)
                            );
                        })
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var _tvFn = window.bkbgTypoCssVars;
            var s = {};
            if (_tvFn) {
                Object.assign(s, _tvFn(a.titleTypo, '--bklw-tt-'));
                Object.assign(s, _tvFn(a.nameTypo, '--bklw-n-'));
            }
            var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bklw-wrap', style: s });
            return el('div', blockProps,
                a.showTitle && el('p', {
                    className: 'bklw-title',
                    style: { textAlign: a.titleAlign, color: a.titleColor, margin: '0 0 24px' }
                }, a.title),
                a.showDivider && el('hr', { className: 'bklw-divider', style: { borderColor: a.dividerColor, margin: '0 0 24px' } }),
                el('div', {
                    className: 'bklw-grid',
                    'data-grayscale':   a.grayscale ? '1' : '0',
                    'data-color-hover': a.colorOnHover ? '1' : '0',
                    'data-opacity':     a.logoOpacity,
                    'data-hover-fx':    a.hoverEffect,
                    'data-card-bg':     a.cardBg,
                    'data-card-hover':  a.cardBgHover,
                    style: { display: 'grid', gridTemplateColumns: 'repeat(' + a.columns + ', 1fr)', gap: a.gap + 'px' }
                },
                    a.logos.map(function (logo, idx) {
                        var inner = [
                            el('img', {
                                key: 'img', src: logo.url, alt: logo.alt || logo.name, className: 'bklw-img',
                                style: buildImgStyle(a, logo)
                            }),
                            a.showName && el('p', {
                                key: 'name', className: 'bklw-name',
                                style: { margin: '8px 0 0', color: a.nameColor, textAlign: a.itemAlign }
                            }, logo.name)
                        ].filter(Boolean);

                        var cardStyle = buildCardStyle(a);
                        if (logo.link) {
                            return el('a', {
                                key: idx, href: logo.link, className: 'bklw-card',
                                target: logo.newTab ? '_blank' : undefined,
                                rel: logo.newTab ? 'noopener noreferrer' : undefined,
                                style: Object.assign({}, cardStyle, { cursor: 'pointer' })
                            }, inner);
                        }
                        return el('div', { key: idx, className: 'bklw-card', style: cardStyle }, inner);
                    })
                )
            );
        }
    });
}() );

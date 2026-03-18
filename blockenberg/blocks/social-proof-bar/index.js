( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __ = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var ToggleControl = wp.components.ToggleControl;
    var Button = wp.components.Button;
    var _tc; function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    var _tv; function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    function buildWrapStyle(a) {
        var s = {
            paddingTop: a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px'
        };
        if (a.bgColor) s.background = a.bgColor;
        if (a.borderTop) s.borderTop = '1px solid ' + (a.dividerColor || '#e5e7eb');
        if (a.borderBottom) s.borderBottom = '1px solid ' + (a.dividerColor || '#e5e7eb');
        var _tvFn = getTypoCssVars();
        if (_tvFn) {
            Object.assign(s, _tvFn(a.ratingTypo || {}, '--bkspb-rt-'));
            Object.assign(s, _tvFn(a.taglineTypo || {}, '--bkspb-tg-'));
        }
        return s;
    }

    function uid() { return 'id-' + Math.random().toString(36).slice(2, 8); }

    // Star rating SVG row
    function StarRating(props) {
        var val = props.value || 0;
        var color = props.color || '#f59e0b';
        var size = props.size || 16;
        var stars = [];
        for (var i = 1; i <= 5; i++) {
            var fill = i <= Math.floor(val) ? color : (i <= val + 0.5 ? 'url(#bksp-half-' + props.uid + ')' : '#e5e7eb');
            stars.push(el('svg', {
                key: i, width: size, height: size, viewBox: '0 0 24 24',
                style: { fill: fill, flexShrink: 0 }
            }, el('path', { d: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z' })));
        }
        return el('div', { style: { display: 'flex', alignItems: 'center', gap: '2px' } }, stars);
    }

    // Avatar circle (initials fallback)
    function Avatar(props) {
        var av = props.avatar;
        var size = props.size || 40;
        var border = props.border || '#ffffff';
        var fallbackBg = props.fallbackBg || '#6c3fb5';

        var style = {
            width: size + 'px', height: size + 'px', borderRadius: '50%',
            border: '2px solid ' + border,
            overflow: 'hidden', flexShrink: 0,
            background: av.imageUrl ? 'transparent' : fallbackBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: Math.round(size * 0.35) + 'px', fontWeight: 700
        };

        if (av.imageUrl) {
            return el('div', { style: style },
                el('img', { src: av.imageUrl, alt: av.name || '', style: { width: '100%', height: '100%', objectFit: 'cover' } })
            );
        }
        return el('div', { style: style }, (av.initials || '?'));
    }

    // Logo placeholder
    function LogoItem(props) {
        var logo = props.logo;
        var height = props.height || 28;
        var opacity = (props.opacity || 50) / 100;
        var grayscale = props.grayscale;

        var imgStyle = {
            height: height + 'px', width: 'auto', display: 'block',
            opacity: opacity,
            filter: grayscale ? 'grayscale(100%)' : 'none'
        };

        if (logo.imageUrl) {
            return el('img', { src: logo.imageUrl, alt: logo.name || '', style: imgStyle });
        }
        // Placeholder
        return el('div', {
            style: {
                height: height + 'px', padding: '0 12px',
                background: '#e5e7eb', borderRadius: '6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', color: '#9ca3af', fontWeight: 600, opacity: opacity,
                whiteSpace: 'nowrap'
            }
        }, logo.name || 'Logo');
    }

    // Main preview component
    function ProofBarPreview(props) {
        var a = props.attrs;
        var isCenter = a.layout !== 'left' && a.layout !== 'spread';
        var isSpread = a.layout === 'spread';

        var wrapStyle = {
            display: 'flex',
            flexDirection: isSpread ? 'row' : 'column',
            alignItems: isSpread ? 'center' : 'center',
            justifyContent: isSpread ? 'space-between' : 'center',
            flexWrap: 'wrap',
            gap: a.gap + 'px',
            textAlign: isCenter ? 'center' : 'left'
        };

        // Avatar bar + rating + tagline (left cluster)
        var socialPart = el('div', {
            style: {
                display: 'flex',
                flexDirection: isSpread ? 'column' : 'row',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
                justifyContent: isCenter ? 'center' : 'flex-start'
            }
        },
            a.showAvatars && (a.avatars || []).length > 0 && el('div', {
                style: {
                    display: 'flex',
                    flexDirection: 'row',
                    paddingLeft: a.avatarSize / 3 + 'px'
                }
            },
                (a.avatars || []).map(function (av, i) {
                    return el('div', {
                        key: av.id,
                        style: { marginLeft: i === 0 ? 0 : ('-' + a.avatarOverlap + 'px') }
                    }, el(Avatar, { avatar: av, size: a.avatarSize, border: a.avatarBorderColor, fallbackBg: a.avatarFallbackBg }));
                })
            ),
            a.showRating && el('div', {
                style: {
                    display: 'flex',
                    flexDirection: isSpread ? 'column' : 'column',
                    alignItems: isCenter ? 'center' : 'flex-start',
                    gap: '2px'
                }
            },
                el('div', { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
                    el(StarRating, { value: a.ratingValue, color: a.starColor, size: a.ratingNumSize, uid: 'ed' }),
                    el('span', { className: 'bksp-rating-val', style: { color: a.textColor } }, a.ratingValue)
                ),
                el('span', { className: 'bksp-review-text', style: { color: a.textColor, opacity: 0.7 } },
                    a.reviewCount + ' ' + a.ratingLabel
                )
            )
        );

        // Tagline
        var taglinePart = a.showTagline && el('div', {
            className: 'bksp-tagline-text', style: { color: a.textColor, opacity: 0.8 }
        }, a.tagline);

        // Divider
        var dividerPart = a.dividerStyle !== 'none' && el('div', {
            style: {
                [isSpread ? 'width' : 'height']: isSpread ? '1px' : 'auto',
                [isSpread ? 'height' : 'width']: isSpread ? '40px' : '1px',
                background: a.dividerColor || '#e5e7eb',
                flexShrink: 0
            }
        });

        // Logo strip
        var logosPart = a.showLogos && el('div', {
            style: {
                display: 'flex',
                flexDirection: isSpread ? 'column' : 'row',
                alignItems: 'center',
                gap: a.logoGap + 'px',
                flexWrap: 'wrap',
                justifyContent: isCenter ? 'center' : 'flex-start'
            }
        },
            a.showLogosLabel && el('span', {
                className: 'bksp-logos-text', style: { color: a.textColor, opacity: 0.5, whiteSpace: 'nowrap' }
            }, a.logosLabel),
            (a.logos || []).map(function (logo) {
                return el('div', { key: logo.id },
                    el(LogoItem, { logo: logo, height: a.logoHeight, opacity: a.logoOpacity, grayscale: a.logoGrayscale })
                );
            })
        );

        if (isSpread) {
            return el('div', { style: wrapStyle }, socialPart, taglinePart, dividerPart, logosPart);
        }

        return el('div', { style: wrapStyle }, socialPart, taglinePart, a.showLogos && dividerPart, logosPart);
    }

    // Avatar editor item
    function AvatarEditor(props) {
        var av = props.av;
        var idx = props.idx;
        var onUpdate = props.onUpdate;
        var onRemove = props.onRemove;

        return el('div', { style: { border: '1px solid #e5e7eb', borderRadius: '6px', padding: '10px', marginBottom: '8px' } },
            el('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' } },
                el('div', {
                    style: {
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: av.imageUrl ? 'transparent' : '#6c3fb5',
                        overflow: 'hidden', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', color: '#fff', fontWeight: 700
                    }
                }, av.imageUrl ? el('img', { src: av.imageUrl, style: { width: '100%', height: '100%', objectFit: 'cover' } }) : (av.initials || '?')),
                el('span', { style: { fontSize: '13px', fontWeight: 600, flexGrow: 1 } }, av.name || ('Avatar ' + (idx + 1)))
            ),
            el(MediaUploadCheck, null,
                el(MediaUpload, {
                    onSelect: function (media) { onUpdate(idx, 'imageUrl', media.url); },
                    allowedTypes: ['image'],
                    render: function (rp) {
                        return el(Button, { variant: 'secondary', isSmall: true, onClick: rp.open },
                            av.imageUrl ? __('Change photo', 'blockenberg') : __('Upload photo', 'blockenberg'));
                    }
                })
            ),
            el(TextControl, { label: __('Name', 'blockenberg'), value: av.name, onChange: function (v) { onUpdate(idx, 'name', v); } }),
            el(TextControl, { label: __('Initials (fallback)', 'blockenberg'), value: av.initials, onChange: function (v) { onUpdate(idx, 'initials', v); } }),
            el(Button, {
                variant: 'secondary', isDestructive: true, isSmall: true,
                onClick: function () { onRemove(idx); }
            }, __('Remove', 'blockenberg'))
        );
    }

    registerBlockType('blockenberg/social-proof-bar', {

        edit: function (props) {
            var attrs = props.attributes;
            var setAttr = props.setAttributes;
            var avatars = attrs.avatars || [];
            var logos   = attrs.logos   || [];

            function updateAvatar(i, key, val) {
                var next = avatars.map(function (av, j) {
                    if (j !== i) return av;
                    var u = Object.assign({}, av); u[key] = val; return u;
                });
                setAttr({ avatars: next });
            }

            function removeAvatar(i) { setAttr({ avatars: avatars.filter(function (_, j) { return j !== i; }) }); }

            function addAvatar() {
                setAttr({ avatars: avatars.concat([{ id: uid(), imageUrl: '', name: '', initials: '' }]) });
            }

            function updateLogo(i, key, val) {
                var next = logos.map(function (l, j) {
                    if (j !== i) return l;
                    var u = Object.assign({}, l); u[key] = val; return u;
                });
                setAttr({ logos: next });
            }

            function removeLogo(i) { setAttr({ logos: logos.filter(function (_, j) { return j !== i; }) }); }

            function addLogo() {
                setAttr({ logos: logos.concat([{ id: uid(), imageUrl: '', name: 'Partner', url: '' }]) });
            }

            var wrapStyle = buildWrapStyle(attrs);

            var blockProps = useBlockProps({ className: 'bksp-wrap', style: wrapStyle });

            return el(Fragment, null,
                el(InspectorControls, null,

                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                        el(SelectControl, {
                            label: __('Layout', 'blockenberg'),
                            value: attrs.layout,
                            options: [
                                { label: 'Centered (stacked)', value: 'centered' },
                                { label: 'Left aligned', value: 'left' },
                                { label: 'Spread (side by side)', value: 'spread' }
                            ],
                            onChange: function (v) { setAttr({ layout: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Gap (px)', 'blockenberg'),
                            value: attrs.gap, min: 8, max: 80,
                            onChange: function (v) { setAttr({ gap: v }); }
                        }),
                        el(SelectControl, {
                            label: __('Divider style', 'blockenberg'),
                            value: attrs.dividerStyle,
                            options: [
                                { label: 'Line', value: 'line' },
                                { label: 'Dot', value: 'dot' },
                                { label: 'None', value: 'none' }
                            ],
                            onChange: function (v) { setAttr({ dividerStyle: v }); }
                        }),
                        el(ToggleControl, {
                            label: __('Border top', 'blockenberg'),
                            checked: attrs.borderTop,
                            onChange: function (v) { setAttr({ borderTop: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(ToggleControl, {
                            label: __('Border bottom', 'blockenberg'),
                            checked: attrs.borderBottom,
                            onChange: function (v) { setAttr({ borderBottom: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        el(RangeControl, {
                            label: __('Padding Top (px)', 'blockenberg'),
                            value: attrs.paddingTop, min: 0, max: 200,
                            onChange: function (v) { setAttr({ paddingTop: v }); }
                        }),
                        el(RangeControl, {
                            label: __('Padding Bottom (px)', 'blockenberg'),
                            value: attrs.paddingBottom, min: 0, max: 200,
                            onChange: function (v) { setAttr({ paddingBottom: v }); }
                        })
                    ),

                    el(PanelBody, { title: __('Avatars', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, {
                            label: __('Show avatars', 'blockenberg'),
                            checked: attrs.showAvatars,
                            onChange: function (v) { setAttr({ showAvatars: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        attrs.showAvatars && el(Fragment, null,
                            el(RangeControl, {
                                label: __('Avatar size (px)', 'blockenberg'),
                                value: attrs.avatarSize, min: 24, max: 80,
                                onChange: function (v) { setAttr({ avatarSize: v }); }
                            }),
                            el(RangeControl, {
                                label: __('Overlap (px)', 'blockenberg'),
                                value: attrs.avatarOverlap, min: 0, max: 30,
                                onChange: function (v) { setAttr({ avatarOverlap: v }); }
                            }),
                            avatars.map(function (av, i) {
                                return el(AvatarEditor, { key: av.id, av: av, idx: i, onUpdate: updateAvatar, onRemove: removeAvatar });
                            }),
                            el(Button, {
                                variant: 'secondary', isSmall: true,
                                style: { width: '100%', justifyContent: 'center', marginTop: '6px' },
                                onClick: addAvatar
                            }, __('+ Add avatar', 'blockenberg'))
                        )
                    ),

                    el(PanelBody, { title: __('Rating', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, {
                            label: __('Show rating', 'blockenberg'),
                            checked: attrs.showRating,
                            onChange: function (v) { setAttr({ showRating: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        attrs.showRating && el(Fragment, null,
                            el(RangeControl, {
                                label: __('Rating value', 'blockenberg'),
                                value: attrs.ratingValue, min: 1, max: 5, step: 0.1,
                                onChange: function (v) { setAttr({ ratingValue: v }); }
                            }),
                            el(TextControl, {
                                label: __('Review count', 'blockenberg'),
                                value: attrs.reviewCount,
                                onChange: function (v) { setAttr({ reviewCount: v }); }
                            }),
                            el(TextControl, {
                                label: __('Rating label', 'blockenberg'),
                                value: attrs.ratingLabel,
                                onChange: function (v) { setAttr({ ratingLabel: v }); }
                            })
                        )
                    ),

                    el(PanelBody, { title: __('Tagline', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, {
                            label: __('Show tagline', 'blockenberg'),
                            checked: attrs.showTagline,
                            onChange: function (v) { setAttr({ showTagline: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        attrs.showTagline && el(TextControl, {
                            label: __('Tagline text', 'blockenberg'),
                            value: attrs.tagline,
                            onChange: function (v) { setAttr({ tagline: v }); }
                        })
                    ),

                    el(PanelBody, { title: __('Logos', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, {
                            label: __('Show logos', 'blockenberg'),
                            checked: attrs.showLogos,
                            onChange: function (v) { setAttr({ showLogos: v }); },
                            __nextHasNoMarginBottom: true
                        }),
                        attrs.showLogos && el(Fragment, null,
                            el(ToggleControl, {
                                label: __('Show "As seen in" label', 'blockenberg'),
                                checked: attrs.showLogosLabel,
                                onChange: function (v) { setAttr({ showLogosLabel: v }); },
                                __nextHasNoMarginBottom: true
                            }),
                            attrs.showLogosLabel && el(TextControl, {
                                label: __('Label text', 'blockenberg'),
                                value: attrs.logosLabel,
                                onChange: function (v) { setAttr({ logosLabel: v }); }
                            }),
                            el(RangeControl, {
                                label: __('Logo height (px)', 'blockenberg'),
                                value: attrs.logoHeight, min: 16, max: 80,
                                onChange: function (v) { setAttr({ logoHeight: v }); }
                            }),
                            el(RangeControl, {
                                label: __('Logo opacity (%)', 'blockenberg'),
                                value: attrs.logoOpacity, min: 10, max: 100,
                                onChange: function (v) { setAttr({ logoOpacity: v }); }
                            }),
                            el(ToggleControl, {
                                label: __('Grayscale logos', 'blockenberg'),
                                checked: attrs.logoGrayscale,
                                onChange: function (v) { setAttr({ logoGrayscale: v }); },
                                __nextHasNoMarginBottom: true
                            }),
                            el(RangeControl, {
                                label: __('Logo gap (px)', 'blockenberg'),
                                value: attrs.logoGap, min: 8, max: 80,
                                onChange: function (v) { setAttr({ logoGap: v }); }
                            }),
                            logos.map(function (logo, i) {
                                return el('div', {
                                    key: logo.id,
                                    style: { border: '1px solid #e5e7eb', borderRadius: '6px', padding: '10px', marginBottom: '8px' }
                                },
                                    el(TextControl, { label: __('Name', 'blockenberg'), value: logo.name, onChange: function (v) { updateLogo(i, 'name', v); } }),
                                    el(MediaUploadCheck, null,
                                        el(MediaUpload, {
                                            onSelect: function (media) { updateLogo(i, 'imageUrl', media.url); },
                                            allowedTypes: ['image'],
                                            render: function (rp) {
                                                return el(Button, { variant: 'secondary', isSmall: true, onClick: rp.open },
                                                    logo.imageUrl ? __('Change logo', 'blockenberg') : __('Upload logo', 'blockenberg'));
                                            }
                                        })
                                    ),
                                    el(TextControl, { label: __('Link URL', 'blockenberg'), value: logo.url, type: 'url', onChange: function (v) { updateLogo(i, 'url', v); } }),
                                    el(Button, {
                                        variant: 'secondary', isDestructive: true, isSmall: true, style: { marginTop: '6px' },
                                        onClick: function () { removeLogo(i); }
                                    }, __('Remove', 'blockenberg'))
                                );
                            }),
                            el(Button, {
                                variant: 'secondary', isSmall: true,
                                style: { width: '100%', justifyContent: 'center', marginTop: '6px' },
                                onClick: addLogo
                            }, __('+ Add logo', 'blockenberg'))
                        )
                    ),

                    el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                        getTypoControl() && el(getTypoControl(), {
                            label: __('Rating Number', 'blockenberg'),
                            value: attrs.ratingTypo || {},
                            onChange: function (v) { setAttr({ ratingTypo: v }); }
                        }),
                        getTypoControl() && el(getTypoControl(), {
                            label: __('Tagline / Labels', 'blockenberg'),
                            value: attrs.taglineTypo || {},
                            onChange: function (v) { setAttr({ taglineTypo: v }); }
                        })
                    ),

                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Text Color', 'blockenberg'), value: attrs.textColor, onChange: function (v) { setAttr({ textColor: v || '#374151' }); } },
                            { label: __('Star Color', 'blockenberg'), value: attrs.starColor, onChange: function (v) { setAttr({ starColor: v || '#f59e0b' }); } },
                            { label: __('Avatar Border', 'blockenberg'), value: attrs.avatarBorderColor, onChange: function (v) { setAttr({ avatarBorderColor: v || '#ffffff' }); } },
                            { label: __('Avatar Fallback BG', 'blockenberg'), value: attrs.avatarFallbackBg, onChange: function (v) { setAttr({ avatarFallbackBg: v || '#6c3fb5' }); } },
                            { label: __('Divider / Border', 'blockenberg'), value: attrs.dividerColor, onChange: function (v) { setAttr({ dividerColor: v || '#e5e7eb' }); } },
                            { label: __('Background', 'blockenberg'), value: attrs.bgColor, onChange: function (v) { setAttr({ bgColor: v || '' }); } }
                        ]
                    })
                ),

                el('div', blockProps,
                    el(ProofBarPreview, { attrs: attrs })
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var hasTypo = a.ratingTypo !== undefined;

            var wrapStyle = buildWrapStyle(a);

            var isSpread = a.layout === 'spread';
            var isCenter = a.layout !== 'left' && a.layout !== 'spread';

            var blockProps = wp.blockEditor.useBlockProps.save({
                className: 'bksp-wrap bksp-layout--' + a.layout,
                style: wrapStyle
            });

            // Stars
            var starNodes = [];
            for (var si = 1; si <= 5; si++) {
                var filled = si <= a.ratingValue;
                starNodes.push(el('svg', {
                    key: si, width: a.ratingNumSize, height: a.ratingNumSize, viewBox: '0 0 24 24',
                    style: { fill: filled ? (a.starColor || '#f59e0b') : '#e5e7eb', flexShrink: 0 }
                }, el('path', { d: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z' })));
            }

            var avatarNodes = (a.avatars || []).map(function (av, i) {
                var avStyle = {
                    width: a.avatarSize + 'px', height: a.avatarSize + 'px', borderRadius: '50%',
                    border: '2px solid ' + (a.avatarBorderColor || '#ffffff'),
                    overflow: 'hidden', flexShrink: 0,
                    background: av.imageUrl ? 'transparent' : (a.avatarFallbackBg || '#6c3fb5'),
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: Math.round(a.avatarSize * 0.35) + 'px', fontWeight: 700,
                    marginLeft: i === 0 ? 0 : ('-' + a.avatarOverlap + 'px'),
                    position: 'relative', zIndex: 10 - i
                };
                return el('div', { key: av.id, className: 'bksp-avatar', style: avStyle },
                    av.imageUrl
                        ? el('img', { src: av.imageUrl, alt: av.name || '', style: { width: '100%', height: '100%', objectFit: 'cover' } })
                        : el('span', null, av.initials || '?')
                );
            });

            var logoNodes = (a.logos || []).map(function (logo) {
                var imgStyle = {
                    height: a.logoHeight + 'px', width: 'auto',
                    opacity: (a.logoOpacity || 50) / 100,
                    filter: a.logoGrayscale ? 'grayscale(100%)' : 'none',
                    display: 'block'
                };
                var content = logo.imageUrl
                    ? el('img', { src: logo.imageUrl, alt: logo.name || '', style: imgStyle })
                    : el('div', { style: Object.assign({}, imgStyle, { padding: '0 12px', background: '#e5e7eb', borderRadius: '6px', display: 'flex', alignItems: 'center', fontSize: '12px', color: '#9ca3af', fontWeight: 600, whiteSpace: 'nowrap' }) }, logo.name);
                return logo.url
                    ? el('a', { key: logo.id, href: logo.url, rel: 'noopener noreferrer', target: '_blank', className: 'bksp-logo' }, content)
                    : el('div', { key: logo.id, className: 'bksp-logo' }, content);
            });

            var innerFlex = { display: 'flex', flexWrap: 'wrap', gap: a.gap + 'px', alignItems: 'center', justifyContent: isCenter ? 'center' : (isSpread ? 'space-between' : 'flex-start') };

            return el('div', blockProps,
                el('div', { className: 'bksp-inner', style: innerFlex },

                    // Social cluster (avatars + rating)
                    el('div', { className: 'bksp-social', style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', justifyContent: isCenter ? 'center' : 'flex-start' } },
                        a.showAvatars && avatarNodes.length > 0 && el('div', { className: 'bksp-avatars', style: { display: 'flex', alignItems: 'center' } }, avatarNodes),
                        a.showRating && el('div', { className: 'bksp-rating' },
                            el('div', { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
                                el('div', { style: { display: 'flex', gap: '2px' } }, starNodes),
                                hasTypo
                                    ? el('span', { className: 'bksp-rating-val', style: { color: a.textColor } }, a.ratingValue)
                                    : el('span', { style: { fontSize: a.ratingNumSize + 'px', fontWeight: 700, color: a.textColor } }, a.ratingValue)
                            ),
                            hasTypo
                                ? el('div', { className: 'bksp-review-text', style: { color: a.textColor, opacity: 0.7 } }, a.reviewCount + ' ' + a.ratingLabel)
                                : el('div', { style: { fontSize: a.taglineSize + 'px', color: a.textColor, opacity: 0.7 } }, a.reviewCount + ' ' + a.ratingLabel)
                        )
                    ),

                    a.showTagline && (hasTypo
                        ? el('p', { className: 'bksp-tagline', style: { color: a.textColor, margin: 0 } }, a.tagline)
                        : el('p', { className: 'bksp-tagline', style: { fontSize: a.taglineSize + 'px', color: a.textColor, margin: 0, fontStyle: 'italic' } }, a.tagline)
                    ),

                    a.showLogos && a.dividerStyle !== 'none' && el('div', { className: 'bksp-divider', 'aria-hidden': 'true' }),

                    a.showLogos && el('div', { className: 'bksp-logos', style: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: a.logoGap + 'px', justifyContent: isCenter ? 'center' : 'flex-start' } },
                        a.showLogosLabel && (hasTypo
                            ? el('span', { className: 'bksp-logos-text', style: { color: a.textColor, opacity: 0.5 } }, a.logosLabel)
                            : el('span', { style: { fontSize: a.taglineSize + 'px', color: a.textColor, opacity: 0.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' } }, a.logosLabel)
                        ),
                        logoNodes
                    )
                )
            );
        },

        deprecated: [{
            attributes: {"layout":{"type":"string","default":"centered"},"showAvatars":{"type":"boolean","default":true},"avatars":{"type":"array","default":[{"id":"a1","imageUrl":"","name":"User 1","initials":"JD"},{"id":"a2","imageUrl":"","name":"User 2","initials":"AM"},{"id":"a3","imageUrl":"","name":"User 3","initials":"SK"},{"id":"a4","imageUrl":"","name":"User 4","initials":"RL"}]},"avatarSize":{"type":"number","default":40},"avatarOverlap":{"type":"number","default":10},"avatarBorderColor":{"type":"string","default":"#ffffff"},"avatarFallbackBg":{"type":"string","default":"#6c3fb5"},"showRating":{"type":"boolean","default":true},"ratingValue":{"type":"number","default":4.9},"reviewCount":{"type":"string","default":"2,400+"},"ratingLabel":{"type":"string","default":"reviews"},"starColor":{"type":"string","default":"#f59e0b"},"showTagline":{"type":"boolean","default":true},"tagline":{"type":"string","default":"Trusted by 10,000+ marketers worldwide"},"dividerStyle":{"type":"string","default":"line"},"showLogos":{"type":"boolean","default":true},"logosLabel":{"type":"string","default":"As seen in"},"showLogosLabel":{"type":"boolean","default":true},"logos":{"type":"array","default":[{"id":"l1","imageUrl":"","name":"Forbes","url":""},{"id":"l2","imageUrl":"","name":"TechCrunch","url":""},{"id":"l3","imageUrl":"","name":"Wired","url":""},{"id":"l4","imageUrl":"","name":"Product Hunt","url":""}]},"logoHeight":{"type":"number","default":28},"logoOpacity":{"type":"number","default":50},"logoGrayscale":{"type":"boolean","default":true},"logoGap":{"type":"number","default":40},"gap":{"type":"number","default":32},"borderRadius":{"type":"number","default":0},"borderTop":{"type":"boolean","default":false},"borderBottom":{"type":"boolean","default":false},"taglineSize":{"type":"number","default":14},"ratingNumSize":{"type":"number","default":16},"bgColor":{"type":"string","default":""},"textColor":{"type":"string","default":"#374151"},"dividerColor":{"type":"string","default":"#e5e7eb"},"paddingTop":{"type":"number","default":32},"paddingBottom":{"type":"number","default":32},"ratingNumFontWeight":{"type":"number","default":700},"taglineFontWeight":{"type":"number","default":600}},
            save: function (props) {
                /* delegates to current save — hasTypo will be false for old attrs */
                return wp.blocks.getBlockType('blockenberg/social-proof-bar').save(props);
            }
        }]
    });
}() );

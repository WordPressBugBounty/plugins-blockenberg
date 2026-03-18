( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var InnerBlocks = wp.blockEditor.InnerBlocks;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var Button = wp.components.Button;

    /* ── convert opacity 0-100 → hex alpha ────────────────────────────────── */
    function hexAlpha(opacity) {
        return Math.round(opacity / 100 * 255).toString(16).padStart(2, '0');
    }

    /* ── build section styles ─────────────────────────────────────────────── */
    function buildSectionStyle(a) {
        var style = {
            position: 'relative',
            overflow: 'hidden',
            minHeight: a.minHeight + 'px',
            borderRadius: a.borderRadius + 'px',
        };
        return style;
    }

    function buildBgStyle(a) {
        var style = {
            position: 'absolute',
            inset: '-30% 0',          /* extra room for parallax movement */
            backgroundImage: a.bgImageUrl ? 'url(' + a.bgImageUrl + ')' : 'none',
            backgroundColor: a.bgColor,
            backgroundSize: a.bgSize,
            backgroundPosition: a.bgPosition,
            backgroundRepeat: a.bgRepeat,
            backgroundAttachment: a.fixedBackground ? 'fixed' : 'scroll',
            filter: a.bgBlur ? 'blur(' + a.bgBlur + 'px)' : 'none',
            willChange: a.parallaxEnabled ? 'transform' : 'auto',
        };
        return style;
    }

    function buildOverlayStyle(a) {
        var bg;
        if (a.overlayGradient) {
            var hex1 = (a.overlayGradientStart || '#000000') + hexAlpha(a.overlayOpacity);
            bg = 'linear-gradient(' + a.overlayGradientDir + ', ' + hex1 + ', ' + (a.overlayGradientEnd || 'transparent') + ')';
        } else {
            bg = (a.overlayColor || '#000000') + hexAlpha(a.overlayOpacity);
        }
        return { position: 'absolute', inset: '0', background: bg, pointerEvents: 'none', zIndex: 1 };
    }

    function buildContentStyle(a) {
        var justifyMap = { left: 'flex-start', center: 'center', right: 'flex-end' };
        var alignMap   = { top: 'flex-start', center: 'center', bottom: 'flex-end' };
        return {
            position: 'relative', zIndex: 2,
            display: 'flex', flexDirection: 'column',
            alignItems: justifyMap[a.contentAlign] || 'center',
            justifyContent: alignMap[a.contentVAlign] || 'center',
            minHeight: a.minHeight + 'px',
            paddingTop: a.paddingTop + 'px',
            paddingBottom: a.paddingBottom + 'px',
            paddingLeft: a.paddingLeft + 'px',
            paddingRight: a.paddingRight + 'px',
            color: a.textColor,
        };
    }

    registerBlockType('blockenberg/parallax-section', {
        title: __('Parallax Section', 'blockenberg'),
        icon: 'align-full-width',
        category: 'bkbg-effects',
        description: __('Section with a parallax-scrolling background image.', 'blockenberg'),

        edit: function (props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;
            var a = attributes;

            var bgPosOptions = [
                { label: 'Center Center', value: 'center center' },
                { label: 'Top Center',    value: 'top center' },
                { label: 'Bottom Center', value: 'bottom center' },
                { label: 'Center Left',   value: 'center left' },
                { label: 'Center Right',  value: 'center right' },
            ];
            var bgSizeOptions = [
                { label: 'Cover',   value: 'cover' },
                { label: 'Contain', value: 'contain' },
                { label: 'Auto',    value: 'auto' },
            ];
            var contentAlignOptions = [
                { label: __('Left',   'blockenberg'), value: 'left' },
                { label: __('Center', 'blockenberg'), value: 'center' },
                { label: __('Right',  'blockenberg'), value: 'right' },
            ];
            var contentVAlignOptions = [
                { label: __('Top',    'blockenberg'), value: 'top' },
                { label: __('Middle', 'blockenberg'), value: 'center' },
                { label: __('Bottom', 'blockenberg'), value: 'bottom' },
            ];
            var gradDirOptions = [
                { label: 'Top → Bottom',   value: 'to bottom' },
                { label: 'Bottom → Top',   value: 'to top' },
                { label: 'Left → Right',   value: 'to right' },
                { label: 'Right → Left',   value: 'to left' },
                { label: 'Diagonal ↘',     value: 'to bottom right' },
                { label: 'Diagonal ↗',     value: 'to top right' },
            ];

            var blockProps = useBlockProps({ className: 'bkps-outer', style: buildSectionStyle(a) });

            return el(Fragment, null,
                el(InspectorControls, null,

                    /* — Background — */
                    el(PanelBody, { title: __('Background Image', 'blockenberg'), initialOpen: true },
                        el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect: function (media) {
                                    setAttributes({ bgImageUrl: media.url, bgImageId: media.id, bgImageAlt: media.alt || '' });
                                },
                                allowedTypes: ['image'],
                                value: a.bgImageId,
                                render: function (ref) {
                                    return el('div', null,
                                        a.bgImageUrl && el('img', {
                                            src: a.bgImageUrl, alt: a.bgImageAlt,
                                            style: { width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }
                                        }),
                                        el(Button, { variant: a.bgImageUrl ? 'secondary' : 'primary', onClick: ref.open, style: { width: '100%', marginBottom: '4px' } },
                                            a.bgImageUrl ? __('Replace Image', 'blockenberg') : __('Choose Image', 'blockenberg')
                                        ),
                                        a.bgImageUrl && el(Button, {
                                            variant: 'tertiary', isDestructive: true, onClick: function () { setAttributes({ bgImageUrl: '', bgImageId: 0 }); }
                                        }, __('Remove Image', 'blockenberg'))
                                    );
                                }
                            })
                        ),
                        el(SelectControl, { label: __('Background Size', 'blockenberg'), value: a.bgSize, options: bgSizeOptions, onChange: function (v) { setAttributes({ bgSize: v }); } }),
                        el(SelectControl, { label: __('Background Position', 'blockenberg'), value: a.bgPosition, options: bgPosOptions, onChange: function (v) { setAttributes({ bgPosition: v }); } }),
                        el(RangeControl, { label: __('Background Blur (px)', 'blockenberg'), value: a.bgBlur, min: 0, max: 20, onChange: function (v) { setAttributes({ bgBlur: v }); } }),
                        el(ToggleControl, { label: __('Fixed Background (no parallax)', 'blockenberg'), checked: a.fixedBackground, onChange: function (v) { setAttributes({ fixedBackground: v }); }, __nextHasNoMarginBottom: true })
                    ),

                    /* — Parallax — */
                    el(PanelBody, { title: __('Parallax Effect', 'blockenberg'), initialOpen: false },
                        el(ToggleControl, { label: __('Enable Parallax', 'blockenberg'), checked: a.parallaxEnabled, onChange: function (v) { setAttributes({ parallaxEnabled: v }); }, __nextHasNoMarginBottom: true }),
                        a.parallaxEnabled && el(RangeControl, {
                            label: __('Parallax Speed', 'blockenberg'),
                            value: a.parallaxSpeed, min: 0.05, max: 0.9, step: 0.05,
                            help: __('0.05 = subtle  ·  0.5 = medium  ·  0.9 = strong', 'blockenberg'),
                            onChange: function (v) { setAttributes({ parallaxSpeed: v }); }
                        })
                    ),

                    /* — Overlay — */
                    el(PanelBody, { title: __('Overlay', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Overlay Opacity (%)', 'blockenberg'), value: a.overlayOpacity, min: 0, max: 100, onChange: function (v) { setAttributes({ overlayOpacity: v }); } }),
                        el(ToggleControl, { label: __('Gradient Overlay', 'blockenberg'), checked: a.overlayGradient, onChange: function (v) { setAttributes({ overlayGradient: v }); }, __nextHasNoMarginBottom: true }),
                        a.overlayGradient && el(SelectControl, { label: __('Direction', 'blockenberg'), value: a.overlayGradientDir, options: gradDirOptions, onChange: function (v) { setAttributes({ overlayGradientDir: v }); } })
                    ),

                    /* — Layout — */
                    el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: false },
                        el(RangeControl, { label: __('Min Height (px)', 'blockenberg'), value: a.minHeight, min: 100, max: 1200, onChange: function (v) { setAttributes({ minHeight: v }); } }),
                        el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: a.paddingTop, min: 0, max: 300, onChange: function (v) { setAttributes({ paddingTop: v }); } }),
                        el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: a.paddingBottom, min: 0, max: 300, onChange: function (v) { setAttributes({ paddingBottom: v }); } }),
                        el(RangeControl, { label: __('Padding Left', 'blockenberg'), value: a.paddingLeft, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingLeft: v }); } }),
                        el(RangeControl, { label: __('Padding Right', 'blockenberg'), value: a.paddingRight, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingRight: v }); } }),
                        el(RangeControl, { label: __('Content Max Width (px)', 'blockenberg'), value: a.contentMaxWidth, min: 200, max: 1600, onChange: function (v) { setAttributes({ contentMaxWidth: v }); } }),
                        el(SelectControl, { label: __('Horizontal Align', 'blockenberg'), value: a.contentAlign, options: contentAlignOptions, onChange: function (v) { setAttributes({ contentAlign: v }); } }),
                        el(SelectControl, { label: __('Vertical Align', 'blockenberg'), value: a.contentVAlign, options: contentVAlignOptions, onChange: function (v) { setAttributes({ contentVAlign: v }); } }),
                        el(RangeControl, { label: __('Border Radius (px)', 'blockenberg'), value: a.borderRadius, min: 0, max: 80, onChange: function (v) { setAttributes({ borderRadius: v }); } })
                    ),

                    /* — Colors — */
                    el(PanelColorSettings, {
                        title: __('Colors', 'blockenberg'),
                        initialOpen: false,
                        colorSettings: [
                            { label: __('Background Fallback Color', 'blockenberg'), value: a.bgColor, onChange: function (v) { setAttributes({ bgColor: v || '#1e1e1e' }); } },
                            { label: __('Overlay Color', 'blockenberg'), value: a.overlayColor, onChange: function (v) { setAttributes({ overlayColor: v || '#000000' }); } },
                            { label: __('Overlay Gradient Start', 'blockenberg'), value: a.overlayGradientStart, onChange: function (v) { setAttributes({ overlayGradientStart: v || '#000000' }); } },
                            { label: __('Overlay Gradient End', 'blockenberg'), value: a.overlayGradientEnd, onChange: function (v) { setAttributes({ overlayGradientEnd: v || 'transparent' }); } },
                            { label: __('Content Text Color', 'blockenberg'), value: a.textColor, onChange: function (v) { setAttributes({ textColor: v || '#ffffff' }); } },
                        ]
                    })
                ),

                /* ── Canvas ─────────────────────────────────────────────────── */
                el('div', blockProps,
                    /* background layer */
                    el('div', { className: 'bkps-bg', style: buildBgStyle(a) }),
                    /* overlay */
                    el('div', { className: 'bkps-overlay', style: buildOverlayStyle(a) }),
                    /* content */
                    el('div', { className: 'bkps-content', style: buildContentStyle(a) },
                        el('div', { style: { width: '100%', maxWidth: a.contentMaxWidth + 'px' } },
                            el(InnerBlocks, { templateLock: false })
                        )
                    )
                )
            );
        },

        save: function (props) {
            var a = props.attributes;
            var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkps-outer' });
            return el('div', {
                ...blockProps,
                style: buildSectionStyle(a),
                'data-parallax': a.parallaxEnabled && !a.fixedBackground ? '1' : '0',
                'data-speed': a.parallaxSpeed,
            },
                el('div', { className: 'bkps-bg', style: buildBgStyle(a) }),
                el('div', { className: 'bkps-overlay', style: buildOverlayStyle(a) }),
                el('div', { className: 'bkps-content', style: buildContentStyle(a) },
                    el('div', { style: { width: '100%', maxWidth: a.contentMaxWidth + 'px' } },
                        el(InnerBlocks.Content, null)
                    )
                )
            );
        }
    });
}() );

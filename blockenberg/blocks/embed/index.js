(function () {
        var el = wp.element.createElement;
        var Fragment = wp.element.Fragment;
        var registerBlockType = wp.blocks.registerBlockType;
        var __ = wp.i18n.__;
        var InspectorControls = wp.blockEditor.InspectorControls;
        var PanelColorSettings = wp.blockEditor.PanelColorSettings;
        var useBlockProps = wp.blockEditor.useBlockProps;
        var PanelBody = wp.components.PanelBody;
        var RangeControl = wp.components.RangeControl;
        var ToggleControl = wp.components.ToggleControl;
        var TextControl = wp.components.TextControl;
        var SelectControl = wp.components.SelectControl;
        var Notice = wp.components.Notice;

        var ASPECT_OPTIONS = [
            { label: '16:9 (Widescreen video)', value: '16:9' },
            { label: '4:3 (Classic video)', value: '4:3' },
            { label: '1:1 (Square)', value: '1:1' },
            { label: 'Custom height', value: 'custom' },
        ];

        var SCROLLING_OPTIONS = [
            { label: 'Auto', value: 'auto' },
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
        ];

        var LOADING_OPTIONS = [
            { label: 'Lazy (recommended)', value: 'lazy' },
            { label: 'Eager (load immediately)', value: 'eager' },
        ];

        function getPaddingPercent(ratio) {
            if (ratio === '16:9') return 56.25;
            if (ratio === '4:3') return 75;
            if (ratio === '1:1') return 100;
            return null;
        }

        registerBlockType('blockenberg/embed', {
            edit: function (props) {
                var attributes = props.attributes;
                var setAttributes = props.setAttributes;

                var blockProps = useBlockProps({
                    style: { paddingTop: attributes.paddingTop + 'px', paddingBottom: attributes.paddingBottom + 'px', backgroundColor: attributes.bgColor || undefined }
                });

                var hasUrl = attributes.url && attributes.url.trim().length > 0;
                var isCustom = attributes.aspectRatio === 'custom';
                var paddingPct = getPaddingPercent(attributes.aspectRatio);
                var wrapStyle = {
                    maxWidth: attributes.maxWidth > 0 ? attributes.maxWidth + 'px' : '100%',
                    margin: '0 auto',
                    borderRadius: attributes.borderRadius + 'px',
                    overflow: 'hidden',
                    border: attributes.showBorder ? attributes.borderWidth + 'px solid ' + attributes.borderColor : 'none',
                    boxSizing: 'border-box',
                };
                var ratioWrapStyle = isCustom
                    ? { height: attributes.customHeight + 'px', position: 'relative' }
                    : { position: 'relative', paddingBottom: paddingPct + '%', height: 0 };
                var iframeStyle = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' };

                return el(Fragment, null,
                    el(InspectorControls, null,
                        el(PanelBody, { title: __('Embed URL', 'blockenberg'), initialOpen: true },
                            el(TextControl, {
                                label: __('URL to embed', 'blockenberg'),
                                value: attributes.url,
                                type: 'url',
                                placeholder: 'https://calendly.com/your-link',
                                help: __('Paste a Calendly, Typeform, Google Form, YouTube, or any iframe-embeddable URL.', 'blockenberg'),
                                onChange: function (v) { setAttributes({ url: v }); }
                            }),
                            el(TextControl, { label: __('Accessible title', 'blockenberg'), value: attributes.title, onChange: function (v) { setAttributes({ title: v }); } })
                        ),
                        el(PanelBody, { title: __('Dimensions', 'blockenberg'), initialOpen: true },
                            el(SelectControl, { label: __('Aspect ratio', 'blockenberg'), value: attributes.aspectRatio, options: ASPECT_OPTIONS, onChange: function (v) { setAttributes({ aspectRatio: v }); } }),
                            isCustom && el(RangeControl, { label: __('Height (px)', 'blockenberg'), value: attributes.customHeight, min: 200, max: 2000, onChange: function (v) { setAttributes({ customHeight: v }); } }),
                            el(RangeControl, { label: __('Max width (px, 0 = full)', 'blockenberg'), value: attributes.maxWidth, min: 0, max: 1600, onChange: function (v) { setAttributes({ maxWidth: v }); } }),
                            el(RangeControl, { label: __('Border radius (px)', 'blockenberg'), value: attributes.borderRadius, min: 0, max: 32, onChange: function (v) { setAttributes({ borderRadius: v }); } })
                        ),
                        el(PanelBody, { title: __('Iframe Settings', 'blockenberg'), initialOpen: false },
                            el(SelectControl, { label: __('Scrolling', 'blockenberg'), value: attributes.scrolling, options: SCROLLING_OPTIONS, onChange: function (v) { setAttributes({ scrolling: v }); } }),
                            el(SelectControl, { label: __('Loading', 'blockenberg'), value: attributes.loading, options: LOADING_OPTIONS, onChange: function (v) { setAttributes({ loading: v }); } }),
                            el(ToggleControl, { label: __('Allow fullscreen', 'blockenberg'), checked: attributes.allowFullscreen, onChange: function (v) { setAttributes({ allowFullscreen: v }); }, __nextHasNoMarginBottom: true }),
                            el(TextControl, { label: __('Sandbox permissions', 'blockenberg'), value: attributes.sandbox, placeholder: 'allow-forms allow-scripts allow-same-origin', help: __('Leave blank for no sandbox restriction. Common values: allow-forms allow-scripts allow-same-origin allow-popups', 'blockenberg'), onChange: function (v) { setAttributes({ sandbox: v }); } })
                        ),
                        el(PanelBody, { title: __('Border', 'blockenberg'), initialOpen: false },
                            el(ToggleControl, { label: __('Show border', 'blockenberg'), checked: attributes.showBorder, onChange: function (v) { setAttributes({ showBorder: v }); }, __nextHasNoMarginBottom: true }),
                            attributes.showBorder && el(RangeControl, { label: __('Border width (px)', 'blockenberg'), value: attributes.borderWidth, min: 1, max: 8, onChange: function (v) { setAttributes({ borderWidth: v }); } })
                        ),
                        el(PanelColorSettings, {
                            title: __('Colors', 'blockenberg'),
                            initialOpen: false,
                            colorSettings: [
                                attributes.showBorder && { value: attributes.borderColor, onChange: function (v) { setAttributes({ borderColor: v || '' }); }, label: __('Border color', 'blockenberg') },
                                { value: attributes.bgColor, onChange: function (v) { setAttributes({ bgColor: v || '' }); }, label: __('Section background', 'blockenberg') },
                            ].filter(Boolean)
                        }),
                        el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                            el(RangeControl, { label: __('Padding top (px)', 'blockenberg'), value: attributes.paddingTop, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop: v }); } }),
                            el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: attributes.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                        )
                    ),
                    el('div', blockProps,
                        el('div', { className: 'bkbg-embed-wrap', style: wrapStyle },
                            !hasUrl && el('div', { style: { background: '#f9fafb', borderRadius: attributes.borderRadius + 'px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', gap: '12px', border: '2px dashed #d1d5db', color: '#6b7280', textAlign: 'center', minHeight: isCustom ? attributes.customHeight + 'px' : undefined, aspectRatio: !isCustom ? attributes.aspectRatio.replace(':', '/') : undefined } },
                                el('svg', { width: 40, height: 40, viewBox: '0 0 24 24', fill: 'none', stroke: '#9ca3af', strokeWidth: 1.5 },
                                    el('rect', { x: 3, y: 3, width: 18, height: 18, rx: 2 }),
                                    el('path', { d: 'M3 9h18' }),
                                    el('path', { d: 'M9 21V9' })
                                ),
                                el('p', { style: { margin: 0, fontWeight: 600 } }, __('iFrame / Embed', 'blockenberg')),
                                el('p', { style: { margin: 0, fontSize: '13px' } }, attributes.placeholderText)
                            ),
                            hasUrl && el('div', { className: 'bkbg-embed-ratio', style: ratioWrapStyle },
                                el('iframe', {
                                    src: attributes.url,
                                    title: attributes.title,
                                    style: iframeStyle,
                                    loading: attributes.loading,
                                    scrolling: attributes.scrolling,
                                    allowFullScreen: attributes.allowFullscreen,
                                    sandbox: attributes.sandbox || undefined,
                                })
                            )
                        )
                    )
                );
            },

            save: function (props) {
                var attributes = props.attributes;
                var isCustom = attributes.aspectRatio === 'custom';
                var paddingPct = getPaddingPercent(attributes.aspectRatio);
                var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkbg-embed-block-wrap' });

                if (!attributes.url) return el('div', blockProps);

                var wrapStyle = {
                    maxWidth: attributes.maxWidth > 0 ? attributes.maxWidth + 'px' : '100%',
                    margin: '0 auto',
                    borderRadius: attributes.borderRadius + 'px',
                    overflow: 'hidden',
                    border: attributes.showBorder ? attributes.borderWidth + 'px solid ' + attributes.borderColor : 'none',
                    boxSizing: 'border-box',
                };
                var ratioWrapStyle = isCustom
                    ? { height: attributes.customHeight + 'px', position: 'relative' }
                    : { position: 'relative', paddingBottom: paddingPct + '%', height: 0 };
                var iframeStyle = { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' };

                return el('div', Object.assign({}, blockProps, { style: { paddingTop: attributes.paddingTop + 'px', paddingBottom: attributes.paddingBottom + 'px', backgroundColor: attributes.bgColor || undefined } }),
                    el('div', { className: 'bkbg-embed-wrap', style: wrapStyle },
                        el('div', { className: 'bkbg-embed-ratio', 'data-aspect': attributes.aspectRatio, style: ratioWrapStyle },
                            el('iframe', {
                                src: attributes.url,
                                title: attributes.title,
                                style: iframeStyle,
                                loading: attributes.loading,
                                scrolling: attributes.scrolling,
                                allowFullScreen: attributes.allowFullscreen,
                                sandbox: attributes.sandbox || undefined,
                                className: 'bkbg-embed-iframe',
                            })
                        )
                    )
                );
            }
        });
}());

(function () {
        var el = wp.element.createElement;
        var Fragment = wp.element.Fragment;
        var registerBlockType = wp.blocks.registerBlockType;
        var __ = wp.i18n.__;
        var InspectorControls = wp.blockEditor.InspectorControls;
        var PanelColorSettings = wp.blockEditor.PanelColorSettings;
        var useBlockProps = wp.blockEditor.useBlockProps;
        var PanelBody = wp.components.PanelBody;
        var TextControl = wp.components.TextControl;
        var TextareaControl = wp.components.TextareaControl;
        var ToggleControl = wp.components.ToggleControl;
        var RangeControl = wp.components.RangeControl;
        var SelectControl = wp.components.SelectControl;

        var _tc, _tv;
        function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
        function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

        // ── platform logos (SVG/text marks) ──────────────────────────
        function platformBadge(platform) {
            var styles = {
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                fontSize: '11px', fontWeight: '800', letterSpacing: '0.04em',
                padding: '3px 10px', borderRadius: '20px', userSelect: 'none'
            };
            if (platform === 'twitter') {
                return el('span', { style: Object.assign({}, styles, { background: '#15202b', color: '#1d9bf0' }) }, '𝕏 X / Twitter');
            }
            if (platform === 'facebook') {
                return el('span', { style: Object.assign({}, styles, { background: '#1877f2', color: '#ffffff' }) }, 'f Facebook');
            }
            if (platform === 'linkedin') {
                return el('span', { style: Object.assign({}, styles, { background: '#0a66c2', color: '#ffffff' }) }, 'in LinkedIn');
            }
            if (platform === 'slack') {
                return el('span', { style: Object.assign({}, styles, { background: '#4a154b', color: '#36c5f0' }) }, '# Slack');
            }
            return null;
        }

        // ── image placeholder ────────────────────────────────────────
        function renderImagePlaceholder(a) {
            return el('div', {
                style: {
                    height: a.imageHeight + 'px',
                    background: a.imageBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: Math.floor(a.imageHeight * 0.35) + 'px',
                    userSelect: 'none'
                }
            }, a.imageEmoji || '🖼️');
        }

        // ── card renderers ───────────────────────────────────────────
        function renderTwitterCard(a) {
            var fs = (a.bodyTypo && a.bodyTypo.sizeDesktop) || a.fontSize || 14;
            return el('div', {
                style: {
                    background: a.twitterBg, border: '1px solid ' + a.twitterBorder,
                    borderRadius: '12px', overflow: 'hidden', maxWidth: '504px'
                }
            },
                renderImagePlaceholder(a),
                el('div', { style: { padding: '12px 16px 14px' } },
                    el('div', { style: { color: a.twitterMeta, fontSize: (fs - 2) + 'px', marginBottom: '4px', textTransform: 'lowercase' } },
                        a.pageUrl
                    ),
                    el('div', { style: { color: a.twitterTitle, fontWeight: '700', fontSize: (fs + 1) + 'px', lineHeight: '1.35', marginBottom: '4px' } },
                        a.pageTitle
                    ),
                    a.showDescription ? el('div', { style: { color: a.twitterDesc, fontSize: (fs - 1) + 'px', lineHeight: '1.45', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' } },
                        a.pageDescription
                    ) : null
                )
            );
        }

        function renderFacebookCard(a) {
            var fs = (a.bodyTypo && a.bodyTypo.sizeDesktop) || a.fontSize || 14;
            return el('div', {
                style: {
                    background: a.facebookBg, border: '1px solid ' + a.facebookBorder,
                    borderRadius: '4px', overflow: 'hidden', maxWidth: '504px'
                }
            },
                renderImagePlaceholder(a),
                el('div', { style: { padding: '10px 12px 12px', borderTop: '1px solid ' + a.facebookBorder } },
                    el('div', { style: { color: a.facebookMeta, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px' } },
                        a.pageUrl
                    ),
                    el('div', { style: { color: a.facebookTitle, fontWeight: '700', fontSize: fs + 'px', lineHeight: '1.3', marginBottom: '4px' } },
                        a.pageTitle
                    ),
                    a.showDescription ? el('div', { style: { color: a.facebookDesc, fontSize: (fs - 1) + 'px', lineHeight: '1.45', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden' } },
                        a.pageDescription
                    ) : null,
                    a.showSiteName ? el('div', { style: { color: a.facebookMeta, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '6px' } },
                        a.siteName
                    ) : null
                )
            );
        }

        function renderLinkedInCard(a) {
            var fs = (a.bodyTypo && a.bodyTypo.sizeDesktop) || a.fontSize || 14;
            return el('div', {
                style: {
                    background: a.linkedinBg, border: '1px solid ' + a.linkedinBorder,
                    borderRadius: '2px', overflow: 'hidden', maxWidth: '552px'
                }
            },
                renderImagePlaceholder(a),
                el('div', { style: { padding: '12px 16px 14px' } },
                    el('div', { style: { color: a.linkedinTitle, fontWeight: '700', fontSize: (fs + 1) + 'px', lineHeight: '1.3', marginBottom: '4px' } },
                        a.pageTitle
                    ),
                    a.showSiteName ? el('div', { style: { color: a.linkedinMeta, fontWeight: '600', fontSize: '12px', marginBottom: a.showDescription ? '4px' : '0' } },
                        a.siteName + ' › ' + a.pageUrl
                    ) : null,
                    a.showDescription ? el('div', { style: { color: a.linkedinDesc, fontSize: (fs - 1) + 'px', lineHeight: '1.45', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden' } },
                        a.pageDescription
                    ) : null
                )
            );
        }

        function renderSlackCard(a) {
            var fs = (a.bodyTypo && a.bodyTypo.sizeDesktop) || a.fontSize || 14;
            return el('div', {
                style: {
                    background: a.slackBg, border: '1px solid ' + a.slackBorder,
                    borderRadius: '4px', overflow: 'hidden', maxWidth: '520px',
                    display: 'flex'
                }
            },
                // Colored left strip
                el('div', { style: { width: '4px', background: a.slackAccent, flexShrink: '0' } }),
                el('div', { style: { flex: '1', padding: '10px 12px 12px', display: 'flex', gap: '12px' } },
                    el('div', { style: { flex: '1' } },
                        a.showSiteName ? el('div', { style: { color: a.slackTitle, fontWeight: '700', fontSize: '12px', marginBottom: '4px' } },
                            a.siteName
                        ) : null,
                        el('div', { style: { color: a.slackTitle, fontWeight: '700', fontSize: (fs - 1) + 'px', lineHeight: '1.3', marginBottom: '4px', textDecoration: 'underline', cursor: 'pointer' } },
                            a.pageTitle
                        ),
                        a.showDescription ? el('div', { style: { color: a.slackDesc, fontSize: '12px', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden' } },
                            a.pageDescription
                        ) : null,
                        el('div', { style: { color: a.slackMeta, fontSize: '11px', marginTop: '6px' } }, a.pageUrl)
                    ),
                    // Thumbnail
                    el('div', {
                        style: {
                            width: '80px', height: '80px', flexShrink: '0',
                            background: a.imageBg, borderRadius: '4px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '28px', alignSelf: 'center'
                        }
                    }, a.imageEmoji || '🖼️')
                )
            );
        }

        // ── all platforms ────────────────────────────────────────────
        function renderAllPlatforms(a) {
            var isGrid = a.layout === 'grid';
            var platforms = [
                { key: 'twitter',  label: 'Twitter / X',  render: renderTwitterCard },
                { key: 'facebook', label: 'Facebook',      render: renderFacebookCard },
                { key: 'linkedin', label: 'LinkedIn',      render: renderLinkedInCard },
                { key: 'slack',    label: 'Slack',         render: renderSlackCard },
            ];

            return el('div', {
                style: {
                    display: isGrid ? 'grid' : 'flex',
                    gridTemplateColumns: isGrid ? 'repeat(2, 1fr)' : undefined,
                    flexDirection: isGrid ? undefined : 'column',
                    gap: '20px'
                }
            },
                platforms.map(function (p) {
                    return el('div', { key: p.key },
                        el('div', { style: { marginBottom: '8px' } }, platformBadge(p.key)),
                        p.render(a)
                    );
                })
            );
        }

        // ── edit ─────────────────────────────────────────────────────
        function Edit(props) {
            var a   = props.attributes;
            var set = props.setAttributes;

            var platformOptions = [
                { value: 'all',      label: 'All platforms' },
                { value: 'twitter',  label: 'Twitter / X' },
                { value: 'facebook', label: 'Facebook' },
                { value: 'linkedin', label: 'LinkedIn' },
                { value: 'slack',    label: 'Slack' },
            ];

            var layoutOptions = [
                { value: 'stacked', label: 'Stacked (single column)' },
                { value: 'grid',    label: 'Grid (2 columns)' },
            ];

            function renderPreview() {
                if (a.platform === 'twitter')  return renderTwitterCard(a);
                if (a.platform === 'facebook') return renderFacebookCard(a);
                if (a.platform === 'linkedin') return renderLinkedInCard(a);
                if (a.platform === 'slack')    return renderSlackCard(a);
                return renderAllPlatforms(a);
            }

            var twitterColors = [
                { label: __('Card background'), value: a.twitterBg,     onChange: function (v) { set({ twitterBg: v || '#15202b' }); } },
                { label: __('Border'),          value: a.twitterBorder,  onChange: function (v) { set({ twitterBorder: v || '#38444d' }); } },
                { label: __('Title'),           value: a.twitterTitle,   onChange: function (v) { set({ twitterTitle: v || '#ffffff' }); } },
                { label: __('Description'),     value: a.twitterDesc,    onChange: function (v) { set({ twitterDesc: v || '#8b98a5' }); } },
                { label: __('URL / meta'),      value: a.twitterMeta,    onChange: function (v) { set({ twitterMeta: v || '#6b7280' }); } },
            ];

            var facebookColors = [
                { label: __('Card background'), value: a.facebookBg,     onChange: function (v) { set({ facebookBg: v || '#ffffff' }); } },
                { label: __('Border'),          value: a.facebookBorder,  onChange: function (v) { set({ facebookBorder: v || '#dddfe2' }); } },
                { label: __('Title'),           value: a.facebookTitle,   onChange: function (v) { set({ facebookTitle: v || '#1c1e21' }); } },
                { label: __('Description'),     value: a.facebookDesc,    onChange: function (v) { set({ facebookDesc: v || '#606770' }); } },
                { label: __('URL / meta'),      value: a.facebookMeta,    onChange: function (v) { set({ facebookMeta: v || '#8a8d91' }); } },
            ];

            var linkedinColors = [
                { label: __('Card background'), value: a.linkedinBg,     onChange: function (v) { set({ linkedinBg: v || '#ffffff' }); } },
                { label: __('Border'),          value: a.linkedinBorder,  onChange: function (v) { set({ linkedinBorder: v || '#e0dfde' }); } },
                { label: __('Title'),           value: a.linkedinTitle,   onChange: function (v) { set({ linkedinTitle: v || '#000000' }); } },
                { label: __('Description'),     value: a.linkedinDesc,    onChange: function (v) { set({ linkedinDesc: v || '#434649' }); } },
                { label: __('URL / site name'), value: a.linkedinMeta,    onChange: function (v) { set({ linkedinMeta: v || '#0a66c2' }); } },
            ];

            var slackColors = [
                { label: __('Card background'), value: a.slackBg,     onChange: function (v) { set({ slackBg: v || '#ffffff' }); } },
                { label: __('Border'),          value: a.slackBorder,  onChange: function (v) { set({ slackBorder: v || '#e8e8e8' }); } },
                { label: __('Accent strip'),    value: a.slackAccent,  onChange: function (v) { set({ slackAccent: v || '#36c5f0' }); } },
                { label: __('Title'),           value: a.slackTitle,   onChange: function (v) { set({ slackTitle: v || '#1d1c1d' }); } },
                { label: __('Description'),     value: a.slackDesc,    onChange: function (v) { set({ slackDesc: v || '#616061' }); } },
                { label: __('URL / meta'),      value: a.slackMeta,    onChange: function (v) { set({ slackMeta: v || '#868686' }); } },
            ];

            var TypoCtrl = getTypoControl();
            var blockProps = (function () {
                var bp = useBlockProps();
                var _tvf = getTypoCssVars();
                var s = {
                    background: a.bgColor,
                    borderRadius: a.borderRadius + 'px',
                    padding: '24px',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                };
                if (_tvf) {
                    Object.assign(s, _tvf(a.bodyTypo, '--bkbg-ogp-bd-'));
                }
                bp.style = Object.assign(s, bp.style || {});
                return bp;
            }());

            var inspector = el(InspectorControls, {},
                el(PanelBody, { title: __('Page Info'), initialOpen: true },
                    el(TextControl, {
                        label: __('Page title'), value: a.pageTitle, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ pageTitle: v }); }
                    }),
                    el(TextareaControl, {
                        label: __('Description'), value: a.pageDescription, rows: 3, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ pageDescription: v }); }
                    }),
                    el(TextControl, {
                        label: __('URL (domain)'), value: a.pageUrl, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ pageUrl: v }); }
                    }),
                    el(TextControl, {
                        label: __('Site name'), value: a.siteName, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ siteName: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show description'), checked: a.showDescription, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showDescription: v }); }
                    }),
                    el(ToggleControl, {
                        label: __('Show site name'), checked: a.showSiteName, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ showSiteName: v }); }
                    })
                ),
                el(PanelBody, { title: __('Image Placeholder'), initialOpen: false },
                    el(TextControl, {
                        label: __('Emoji'), value: a.imageEmoji, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ imageEmoji: v }); }
                    }),
                    el(RangeControl, {
                        label: __('Image height'), value: a.imageHeight, min: 80, max: 320, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ imageHeight: v }); }
                    }),
                    el('div', { style: { marginBottom: '8px' } },
                        el('label', { style: { display: 'block', marginBottom: '6px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.04em' } }, __('Image background color')),
                        el('input', {
                            type: 'color', value: a.imageBg,
                            style: { width: '100%', height: '36px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', padding: '2px' },
                            onChange: function (e) { set({ imageBg: e.target.value }); }
                        })
                    )
                ),
                el(PanelBody, { title: __('Display'), initialOpen: false },
                    el(SelectControl, {
                        label: __('Show platform'), value: a.platform, options: platformOptions, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ platform: v }); }
                    }),
                    a.platform === 'all' ? el(SelectControl, {
                        label: __('Layout'), value: a.layout, options: layoutOptions, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ layout: v }); }
                    }) : null,
                    el(RangeControl, {
                        label: __('Wrapper border radius'), value: a.borderRadius, min: 0, max: 32, __nextHasNoMarginBottom: true,
                        onChange: function (v) { set({ borderRadius: v }); }
                    }),
                    el('div', { style: { marginBottom: '8px' } },
                        el('label', { style: { display: 'block', marginBottom: '6px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '.04em' } }, __('Wrapper background')),
                        el('input', {
                            type: 'color', value: a.bgColor,
                            style: { width: '100%', height: '36px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', padding: '2px' },
                            onChange: function (e) { set({ bgColor: e.target.value }); }
                        })
                    )
                ),
                
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    TypoCtrl && el(TypoCtrl, { label: __('Body', 'blockenberg'), value: a.bodyTypo, onChange: function (v) { set({ bodyTypo: v }); } })
                ),
el(PanelColorSettings, { title: __('Twitter / X Colors'), initialOpen: false, colorSettings: twitterColors }),
                el(PanelColorSettings, { title: __('Facebook Colors'),    initialOpen: false, colorSettings: facebookColors }),
                el(PanelColorSettings, { title: __('LinkedIn Colors'),    initialOpen: false, colorSettings: linkedinColors }),
                el(PanelColorSettings, { title: __('Slack Colors'),       initialOpen: false, colorSettings: slackColors })
            );

            return el(Fragment, {},
                inspector,
                el('div', blockProps,
                    renderPreview()
                )
            );
        }

        registerBlockType('blockenberg/open-graph-preview', {
            edit: Edit,
            save: function (props) {
                return el('div', useBlockProps.save(),
                    el('div', { className: 'bkbg-open-graph-preview-app', 'data-opts': JSON.stringify(props.attributes) })
                );
            }
        });
})();

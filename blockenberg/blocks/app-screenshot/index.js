( function () {
    var el = wp.element.createElement;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var PanelBody = wp.components.PanelBody;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;
    var TextareaControl = wp.components.TextareaControl;
    var Button = wp.components.Button;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    registerBlockType('blockenberg/app-screenshot', {
        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;

            function updateCallout(idx, key, val) {
                var callouts = (attr.callouts || []).map(function (c, i) {
                    return i === idx ? Object.assign({}, c, {[key]: val}) : c;
                });
                setAttr({ callouts: callouts });
            }

            var inspector = el(InspectorControls, null,
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Layout', 'blockenberg'),
                        value: attr.layout,
                        options: [
                            { label: 'Centered', value: 'centered' },
                            { label: 'Split (text + screenshot)', value: 'split' }
                        ],
                        onChange: function (v) { setAttr({ layout: v }); }
                    }),
                    el(SelectControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Device Frame', 'blockenberg'),
                        value: attr.deviceFrame,
                        options: [
                            { label: 'Browser', value: 'browser' },
                            { label: 'MacBook', value: 'macbook' },
                            { label: 'No Frame', value: 'none' }
                        ],
                        onChange: function (v) { setAttr({ deviceFrame: v }); }
                    }),
                    el(RangeControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Max Width (px)', 'blockenberg'),
                        value: attr.maxWidth, min: 600, max: 1600,
                        onChange: function (v) { setAttr({ maxWidth: v }); }
                    }),
                    el(RangeControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Padding Top (px)', 'blockenberg'),
                        value: attr.paddingTop, min: 0, max: 200,
                        onChange: function (v) { setAttr({ paddingTop: v }); }
                    }),
                    el(RangeControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Padding Bottom (px)', 'blockenberg'),
                        value: attr.paddingBottom, min: 0, max: 200,
                        onChange: function (v) { setAttr({ paddingBottom: v }); }
                    })
                ),
                el(PanelBody, { title: __('Screenshot Image', 'blockenberg'), initialOpen: false },
                    el(MediaUploadCheck, null,
                        el(MediaUpload, {
                            onSelect: function (media) { setAttr({ screenshotUrl: media.url, screenshotId: media.id }); },
                            allowedTypes: ['image'],
                            value: attr.screenshotId,
                            render: function (ref) {
                                return el('div', null,
                                    attr.screenshotUrl && el('img', { src: attr.screenshotUrl, style: { width: '100%', marginBottom: '8px', borderRadius: '4px' } }),
                                    el(Button, { onClick: ref.open, variant: attr.screenshotUrl ? 'secondary' : 'primary' },
                                        attr.screenshotUrl ? __('Replace Screenshot', 'blockenberg') : __('Upload Screenshot', 'blockenberg')
                                    ),
                                    attr.screenshotUrl && el(Button, { isDestructive: true, variant: 'secondary', style: { marginLeft: '8px' }, onClick: function () { setAttr({ screenshotUrl: '', screenshotId: 0 }); } }, __('Remove', 'blockenberg'))
                                );
                            }
                        })
                    )
                ),
                el(PanelBody, { title: __('Callout Points', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Show Callouts', 'blockenberg'),
                        checked: attr.showCallouts,
                        onChange: function (v) { setAttr({ showCallouts: v }); }
                    }),
                    (attr.callouts || []).map(function (c, idx) {
                        return el(PanelBody, { key: idx, title: (c.label || 'Callout ' + (idx + 1)), initialOpen: false },
                            el(TextControl, { __nextHasNoMarginBottom: true, label: __('Label', 'blockenberg'), value: c.label, onChange: function (v) { updateCallout(idx, 'label', v); } }),
                            el(TextControl, { __nextHasNoMarginBottom: true, label: __('Description', 'blockenberg'), value: c.description, onChange: function (v) { updateCallout(idx, 'description', v); } }),
                            el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Position X (%)', 'blockenberg'), value: c.x, min: 0, max: 100, onChange: function (v) { updateCallout(idx, 'x', v); } }),
                            el(RangeControl, { __nextHasNoMarginBottom: true, label: __('Position Y (%)', 'blockenberg'), value: c.y, min: 0, max: 100, onChange: function (v) { updateCallout(idx, 'y', v); } }),
                            el(Button, { isDestructive: true, variant: 'secondary', onClick: function () { setAttr({ callouts: (attr.callouts || []).filter(function (_, i) { return i !== idx; }) }); } }, __('Remove', 'blockenberg'))
                        );
                    }),
                    el(Button, { isPrimary: true, variant: 'primary', onClick: function () { setAttr({ callouts: (attr.callouts || []).concat([{ label: 'Feature', description: 'Description', x: 50, y: 50 }]) }); } }, __('+ Add Callout', 'blockenberg'))
                ),
                el(PanelBody, { title: __('CTA', 'blockenberg'), initialOpen: false },
                    el(ToggleControl, {
                        __nextHasNoMarginBottom: true,
                        label: __('Show CTA', 'blockenberg'),
                        checked: attr.showCta,
                        onChange: function (v) { setAttr({ showCta: v }); }
                    }),
                    attr.showCta && el(TextControl, { __nextHasNoMarginBottom: true, label: __('CTA Label', 'blockenberg'), value: attr.ctaLabel, onChange: function (v) { setAttr({ ctaLabel: v }); } }),
                    attr.showCta && el(TextControl, { __nextHasNoMarginBottom: true, label: __('CTA URL', 'blockenberg'), value: attr.ctaUrl, onChange: function (v) { setAttr({ ctaUrl: v }); } })
                ),
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    el(getTypographyControl(), { label: __('Eyebrow Typography', 'blockenberg'), value: attr.eyebrowTypo || {}, onChange: function (v) { setAttr({ eyebrowTypo: v }); } }),
                    el(getTypographyControl(), { label: __('Heading Typography', 'blockenberg'), value: attr.headingTypo || {}, onChange: function (v) { setAttr({ headingTypo: v }); } }),
                    el(getTypographyControl(), { label: __('Subtext Typography', 'blockenberg'), value: attr.subtextTypo || {}, onChange: function (v) { setAttr({ subtextTypo: v }); } })
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { label: __('Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { setAttr({ bgColor: v || '#ffffff' }); } },
                        { label: __('Heading', 'blockenberg'), value: attr.headingColor, onChange: function (v) { setAttr({ headingColor: v || '#111827' }); } },
                        { label: __('Subtext', 'blockenberg'), value: attr.subColor, onChange: function (v) { setAttr({ subColor: v || '#6b7280' }); } },
                        { label: __('Eyebrow', 'blockenberg'), value: attr.eyebrowColor, onChange: function (v) { setAttr({ eyebrowColor: v || '#6366f1' }); } },
                        { label: __('Device Frame', 'blockenberg'), value: attr.frameColor, onChange: function (v) { setAttr({ frameColor: v || '#1e293b' }); } },
                        { label: __('Callout BG', 'blockenberg'), value: attr.calloutBg, onChange: function (v) { setAttr({ calloutBg: v || '#6366f1' }); } },
                        { label: __('Callout Text', 'blockenberg'), value: attr.calloutColor, onChange: function (v) { setAttr({ calloutColor: v || '#ffffff' }); } },
                        { label: __('CTA BG', 'blockenberg'), value: attr.ctaBg, onChange: function (v) { setAttr({ ctaBg: v || '#6366f1' }); } },
                        { label: __('CTA Text', 'blockenberg'), value: attr.ctaColor, onChange: function (v) { setAttr({ ctaColor: v || '#ffffff' }); } }
                    ]
                })
            );

            var blockProps = useBlockProps({ className: 'bkbg-aps-editor' });

            return el('div', blockProps,
                inspector,
                el('div', (function () {
                    var _tv = getTypoCssVars();
                    var s = { background: attr.bgColor, padding: '40px', borderRadius: '8px', fontFamily: 'sans-serif' };
                    Object.assign(s, _tv(attr.eyebrowTypo || {}, '--bkbg-aps-eyebrow-'));
                    Object.assign(s, _tv(attr.headingTypo || {}, '--bkbg-aps-heading-'));
                    Object.assign(s, _tv(attr.subtextTypo || {}, '--bkbg-aps-sub-'));
                    if (attr.eyebrowFontSize && attr.eyebrowFontSize !== 13) s['--bkbg-aps-eyebrow-sz'] = attr.eyebrowFontSize + 'px';
                    if (attr.headingFontSize && attr.headingFontSize !== 36) s['--bkbg-aps-heading-sz'] = attr.headingFontSize + 'px';
                    if (attr.subtextFontSize && attr.subtextFontSize !== 18) s['--bkbg-aps-sub-sz'] = attr.subtextFontSize + 'px';
                    return { style: s };
                })(),
                    /* Header text */
                    el('div', { style: { textAlign: 'center', marginBottom: '40px', maxWidth: '700px', margin: '0 auto 40px' } },
                        el(RichText, {
                            tagName: 'p', value: attr.eyebrow,
                            onChange: function (v) { setAttr({ eyebrow: v }); },
                            placeholder: __('Eyebrow…', 'blockenberg'),
                            className: 'bkbg-aps-eyebrow',
                            style: { color: attr.eyebrowColor, margin: '0 0 8px' }
                        }),
                        el(RichText, {
                            tagName: 'h2', value: attr.heading,
                            onChange: function (v) { setAttr({ heading: v }); },
                            placeholder: __('Heading…', 'blockenberg'),
                            className: 'bkbg-aps-heading',
                            style: { color: attr.headingColor, margin: '0 0 14px' }
                        }),
                        el(RichText, {
                            tagName: 'p', value: attr.subtext,
                            onChange: function (v) { setAttr({ subtext: v }); },
                            placeholder: __('Subtext…', 'blockenberg'),
                            className: 'bkbg-aps-sub',
                            style: { color: attr.subColor, margin: '0 auto 24px' }
                        }),
                        attr.showCta && el('a', { href: attr.ctaUrl, style: { display: 'inline-block', background: attr.ctaBg, color: attr.ctaColor, padding: '12px 28px', borderRadius: '8px', fontWeight: 700, textDecoration: 'none' } }, attr.ctaLabel)
                    ),
                    /* Screenshot frame */
                    el('div', { style: { position: 'relative', borderRadius: '12px', overflow: 'hidden', background: attr.screenshotUrl ? 'transparent' : '#f1f5f9', border: attr.deviceFrame !== 'none' ? '4px solid ' + attr.frameColor : 'none', minHeight: '300px', textAlign: 'center', marginTop: '40px' } },
                        attr.deviceFrame === 'browser' && el('div', { style: { background: attr.frameColor, padding: '12px 16px 0', display: 'flex', alignItems: 'center', gap: '6px' } },
                            el('span', { style: { width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' } }),
                            el('span', { style: { width: '10px', height: '10px', borderRadius: '50%', background: '#fbbf24', display: 'inline-block' } }),
                            el('span', { style: { width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' } })
                        ),
                        attr.screenshotUrl
                            ? el('img', { src: attr.screenshotUrl, style: { width: '100%', display: 'block' }, alt: '' })
                            : el('div', { style: { padding: '80px 20px', color: '#94a3b8', fontSize: '14px' } }, '🖼 Upload a screenshot in the sidebar'),
                        /* Callout pins */
                        attr.showCallouts && (attr.callouts || []).map(function (c, i) {
                            return el('div', { key: i, style: { position: 'absolute', left: c.x + '%', top: c.y + '%', transform: 'translate(-50%,-50%)' } },
                                el('div', { style: { background: attr.calloutBg, color: attr.calloutColor, borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' } }, c.label),
                                el('div', { style: { width: '12px', height: '12px', borderRadius: '50%', background: attr.calloutBg, margin: '4px auto 0', boxShadow: '0 0 0 3px rgba(99,102,241,0.3)' } })
                            );
                        })
                    )
                )
            );
        },

        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-aps-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );

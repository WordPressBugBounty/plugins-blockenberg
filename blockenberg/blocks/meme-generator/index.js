( function () {
    var el = wp.element.createElement;
    var Fragment = wp.element.Fragment;
    var registerBlockType = wp.blocks.registerBlockType;
    var __ = wp.i18n.__;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var RichText = wp.blockEditor.RichText;
    var PanelBody = wp.components.PanelBody;
    var RangeControl = wp.components.RangeControl;
    var ToggleControl = wp.components.ToggleControl;
    var SelectControl = wp.components.SelectControl;
    var TextControl = wp.components.TextControl;

    var _tc, _tv;
    function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

    var FONT_OPTIONS = [
        { label: 'Impact (Classic Meme)', value: 'Impact' },
        { label: 'Arial Black', value: 'Arial Black' },
        { label: 'Comic Sans MS', value: 'Comic Sans MS' },
        { label: 'Georgia Bold', value: 'Georgia' },
        { label: 'Courier New', value: 'Courier New' }
    ];

    function EditorPreview(props) {
        var a = props.attributes;
        var setAttributes = props.setAttributes;
        var blockProps = (function(p){
            var v = getTypoCssVars() || function () { return {}; };
            p.style = Object.assign(p.style||{},
                v(a.titleTypo,'--bkbg-mme-tt-'),
                v(a.subtitleTypo,'--bkbg-mme-st-')
            ); return p;
        })(useBlockProps({ style: { background: a.sectionBg || '#f8fafc', padding: '24px 20px' } }));

        // Mock meme preview (static SVG in editor)
        var previewStyle = {
            position: 'relative', width: '100%', maxWidth: a.canvasWidth,
            height: Math.min(a.canvasHeight, 380),
            background: a.canvasBg || '#cccccc',
            borderRadius: 8, overflow: 'hidden', margin: '0 auto',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px dashed ' + a.accentColor + '55'
        };

        var textStyle = function (bottom) { return ({
            position: 'absolute', left: 0, right: 0,
            top: bottom ? 'auto' : 12, bottom: bottom ? 12 : 'auto',
            textAlign: 'center', fontFamily: a.memeFont,
            fontSize: Math.min(a.memeFontSize, 52) + 'px',
            color: a.memeTextColor, fontWeight: 700,
            textShadow: '2px 2px 0 ' + a.memeStrokeColor + ', -2px -2px 0 ' + a.memeStrokeColor + ', 2px -2px 0 ' + a.memeStrokeColor + ', -2px 2px 0 ' + a.memeStrokeColor,
            padding: '0 12px', lineHeight: 1.2,
            pointerEvents: 'none', letterSpacing: '0.04em'
        }); };

        return el(Fragment, null,
            el(InspectorControls, null,
                el(PanelBody, { title: __('Block Content', 'blockenberg'), initialOpen: true },
                    ),
                el(PanelBody, { title: __('Canvas Settings', 'blockenberg'), initialOpen: false },
                    el(TextControl, {
                        label: __('Default Image URL', 'blockenberg'), value: a.defaultImageUrl,
                        help: __('Visitors can change this — leave blank to use a plain background.', 'blockenberg'),
                        onChange: function (v) { setAttributes({ defaultImageUrl: v }); }
                    }),
                    el(TextControl, {
                        label: __('Default Top Text', 'blockenberg'), value: a.defaultTopText,
                        onChange: function (v) { setAttributes({ defaultTopText: v }); }
                    }),
                    el(TextControl, {
                        label: __('Default Bottom Text', 'blockenberg'), value: a.defaultBottomText,
                        onChange: function (v) { setAttributes({ defaultBottomText: v }); }
                    }),
                    el(RangeControl, { label: __('Canvas Width (px)', 'blockenberg'), value: a.canvasWidth, min: 280, max: 900,
                        onChange: function (v) { setAttributes({ canvasWidth: v }); } }),
                    el(RangeControl, { label: __('Canvas Height (px)', 'blockenberg'), value: a.canvasHeight, min: 200, max: 700,
                        onChange: function (v) { setAttributes({ canvasHeight: v }); } })
                ),
                el(PanelBody, { title: __('Meme Text Style', 'blockenberg'), initialOpen: false },
                    el(SelectControl, { label: __('Font', 'blockenberg'), value: a.memeFont, options: FONT_OPTIONS,
                        onChange: function (v) { setAttributes({ memeFont: v }); } }),
                    el(RangeControl, { label: __('Stroke Width (px)', 'blockenberg'), value: a.memeStrokeWidth, min: 0, max: 12,
                        onChange: function (v) { setAttributes({ memeStrokeWidth: v }); } }),
                    el(ToggleControl, { __nextHasNoMarginBottom: true, label: __('Show Download Button', 'blockenberg'), checked: a.showDownload,
                        onChange: function (v) { setAttributes({ showDownload: v }); } })
                ),
                
                el( PanelBody, { title: __( 'Typography', 'blockenberg' ), initialOpen: false },
                    getTypoControl() && el(getTypoControl(), { label: 'Title', value: a.titleTypo || {}, onChange: function(v){ setAttributes({ titleTypo: v }); } }),
                    getTypoControl() && el(getTypoControl(), { label: 'Subtitle', value: a.subtitleTypo || {}, onChange: function(v){ setAttributes({ subtitleTypo: v }); } }),
                    el(RangeControl, { label: __('Meme Font Size (px)', 'blockenberg'), value: a.memeFontSize, min: 20, max: 120,
                                            onChange: function (v) { setAttributes({ memeFontSize: v }); } })
                ),
el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Canvas Background', 'blockenberg'), value: a.canvasBg, onChange: function (v) { setAttributes({ canvasBg: v || '#cccccc' }); } },
                        { label: __('Meme Text Color', 'blockenberg'), value: a.memeTextColor, onChange: function (v) { setAttributes({ memeTextColor: v || '#ffffff' }); } },
                        { label: __('Meme Stroke Color', 'blockenberg'), value: a.memeStrokeColor, onChange: function (v) { setAttributes({ memeStrokeColor: v || '#000000' }); } },
                        { label: __('Section Background', 'blockenberg'), value: a.sectionBg, onChange: function (v) { setAttributes({ sectionBg: v || '#f8fafc' }); } },
                        { label: __('Title Color', 'blockenberg'), value: a.titleColor, onChange: function (v) { setAttributes({ titleColor: v || '#1e1b4b' }); } },
                        { label: __('Accent Color', 'blockenberg'), value: a.accentColor, onChange: function (v) { setAttributes({ accentColor: v || '#6366f1' }); } }
                    ]
                })
            ),
            el('div', blockProps,
                el(RichText, { tagName: 'h3', className: 'bkbg-mme-title', value: a.title,
                    onChange: function (v) { setAttributes({ title: v }); },
                    placeholder: __('Meme Generator', 'blockenberg'),
                    style: { color: a.titleColor, textAlign: 'center' } }),
                el(RichText, { tagName: 'p', className: 'bkbg-mme-subtitle', value: a.subtitle,
                    onChange: function (v) { setAttributes({ subtitle: v }); },
                    placeholder: __('Add your text and download!', 'blockenberg'),
                    style: { color: a.titleColor, textAlign: 'center' } }),
                // Canvas mock preview
                el('div', { style: previewStyle },
                    el('div', { style: { color: a.titleColor, opacity: 0.35, textAlign: 'center', fontSize: 13 } },
                        el('div', { style: { fontSize: 32, marginBottom: 4 } }, '🖼️'),
                        a.defaultImageUrl ? 'Image: ' + a.defaultImageUrl.substring(0, 40) + '…' : 'No image set — plain background'
                    ),
                    el('div', { style: textStyle(false) }, a.defaultTopText || 'TOP TEXT'),
                    el('div', { style: textStyle(true) }, a.defaultBottomText || 'BOTTOM TEXT')
                ),
                // UI controls hint
                el('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 } },
                    el('div', { style: { background: a.accentColor, color: '#fff', borderRadius: 6, padding: '7px 18px', fontSize: 13, fontWeight: 600, opacity: 0.5 } }, '📋 Paste Image URL'),
                    el('div', { style: { background: a.accentColor, color: '#fff', borderRadius: 6, padding: '7px 18px', fontSize: 13, fontWeight: 600, opacity: 0.5 } }, '📝 Edit Text'),
                    a.showDownload && el('div', { style: { background: '#22c55e', color: '#fff', borderRadius: 6, padding: '7px 18px', fontSize: 13, fontWeight: 600, opacity: 0.5 } }, '⬇️ Download PNG')
                )
            )
        );
    }

    registerBlockType('blockenberg/meme-generator', {
        edit: EditorPreview,
        deprecated: [{
            save: function (props) {
                var a = props.attributes;
                return el('div', useBlockProps.save(),
                    el('div', { className: 'bkbg-mme-app', 'data-opts': JSON.stringify(a) },
                        el(RichText.Content, { tagName: 'h3', className: 'bkbg-mme-title', value: a.title }),
                        el(RichText.Content, { tagName: 'p', className: 'bkbg-mme-subtitle', value: a.subtitle })
                    )
                );
            }
        }],
        save: function (props) {
            var a = props.attributes;
            var v = (typeof window.bkbgTypoCssVars === 'function') ? window.bkbgTypoCssVars : function () { return {}; };
            var s = Object.assign({},
                v(a.titleTypo,'--bkbg-mme-tt-'),
                v(a.subtitleTypo,'--bkbg-mme-st-')
            );
            return el('div', (function(p){p.style=Object.assign(p.style||{},s);return p;})(useBlockProps.save()),
                el('div', { className: 'bkbg-mme-app', 'data-opts': JSON.stringify(a) },
                    el(RichText.Content, { tagName: 'h3', className: 'bkbg-mme-title', value: a.title }),
                    el(RichText.Content, { tagName: 'p', className: 'bkbg-mme-subtitle', value: a.subtitle })
                )
            );
        }
    });
}() );

(function () {
        var el = wp.element.createElement;
        var Fragment = wp.element.Fragment;
        var registerBlockType = wp.blocks.registerBlockType;
        var __ = wp.i18n.__;
        var InspectorControls = wp.blockEditor.InspectorControls;
        var PanelColorSettings = wp.blockEditor.PanelColorSettings;
        var useBlockProps = wp.blockEditor.useBlockProps;
        var MediaUpload = wp.blockEditor.MediaUpload;
        var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
        var PanelBody = wp.components.PanelBody;
        var RangeControl = wp.components.RangeControl;
        var ToggleControl = wp.components.ToggleControl;
        var TextControl = wp.components.TextControl;
        var TextareaControl = wp.components.TextareaControl;
        var SelectControl = wp.components.SelectControl;
        var Button = wp.components.Button;

        var _tc, _tv;
        function getTypoControl() { return _tc || (_tc = window.bkbgTypographyControl); }
        function getTypoCssVars() { return _tv || (_tv = window.bkbgTypoCssVars); }

        var BTN_STYLE_OPTIONS = [
            { label: 'Solid fill', value: 'solid' },
            { label: 'Outlined', value: 'outlined' },
            { label: 'Text link', value: 'link' },
        ];

        function makeId() { return 'r' + Math.random().toString(36).substr(2, 6); }

        function renderBtnPreview(row, attrs) {
            if (!attrs.showButton || !row.btnLabel) return null;
            var s = attrs.btnStyle;
            var bg = s === 'solid' ? (row.accentColor || attrs.btnBg) : 'transparent';
            var color = s === 'solid' ? '#ffffff' : (row.accentColor || attrs.btnBg);
            var border = s === 'outlined' ? ('2px solid ' + (row.accentColor || attrs.btnBg)) : 'none';
            return el('span', { style: { display: 'inline-block', marginTop: '14px', padding: s === 'link' ? '0' : '9px 22px', background: bg, color: color, border: border, borderRadius: attrs.btnBorderRadius + 'px', fontSize: '14px', fontWeight: 600, textDecoration: s === 'link' ? 'underline' : 'none' } }, row.btnLabel);
        }

        registerBlockType('blockenberg/media-text', {
            edit: function (props) {
                var attributes = props.attributes;
                var setAttributes = props.setAttributes;
                var rows = attributes.rows;

                var blockProps = (function(p){
                    var vf = getTypoCssVars() || function () { return {}; };
                    p.style = Object.assign(p.style||{},
                        vf(attributes.eyebrowTypo,'--bkbg-mt-ey-'),
                        vf(attributes.titleTypo,'--bkbg-mt-tt-'),
                        vf(attributes.descTypo,'--bkbg-mt-ds-')
                    ); return p;
                })(useBlockProps({
                    style: { paddingTop: attributes.paddingTop + 'px', paddingBottom: attributes.paddingBottom + 'px', backgroundColor: attributes.bgColor || undefined }
                }));

                function setRow(id, patch) {
                    setAttributes({ rows: rows.map(function (r) { return r.id === id ? Object.assign({}, r, patch) : r; }) });
                }
                function addRow() {
                    setAttributes({ rows: rows.concat([{ id: makeId(), eyebrow: 'New', title: 'New section', desc: 'Describe your feature here.', btnLabel: 'Learn more', btnUrl: '', btnNewTab: false, flipRow: rows.length % 2 !== 0, imageUrl: '', imageId: 0, imageAlt: '', accentColor: '#6c3fb5' }]) });
                }
                function removeRow(id) {
                    if (rows.length <= 1) return;
                    setAttributes({ rows: rows.filter(function (r) { return r.id !== id; }) });
                }

                return el(Fragment, null,
                    el(InspectorControls, null,
                        el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                            el(RangeControl, { label: __('Image width (%)', 'blockenberg'), value: attributes.imageWidthPercent, min: 30, max: 70, onChange: function (v) { setAttributes({ imageWidthPercent: v }); } }),
                            el(RangeControl, { label: __('Column gap (px)', 'blockenberg'), value: attributes.columnGap, min: 16, max: 160, onChange: function (v) { setAttributes({ columnGap: v }); } }),
                            el(RangeControl, { label: __('Row gap (px)', 'blockenberg'), value: attributes.rowGap, min: 0, max: 200, onChange: function (v) { setAttributes({ rowGap: v }); } }),
                            el(RangeControl, { label: __('Image border radius (px)', 'blockenberg'), value: attributes.imageRadius, min: 0, max: 48, onChange: function (v) { setAttributes({ imageRadius: v }); } }),
                            el(ToggleControl, { label: __('Image shadow', 'blockenberg'), checked: attributes.imageShadow, onChange: function (v) { setAttributes({ imageShadow: v }); }, __nextHasNoMarginBottom: true }),
                            el(ToggleControl, { label: __('Show eyebrow', 'blockenberg'), checked: attributes.showEyebrow, onChange: function (v) { setAttributes({ showEyebrow: v }); }, __nextHasNoMarginBottom: true }),
                            el(ToggleControl, { label: __('Show button', 'blockenberg'), checked: attributes.showButton, onChange: function (v) { setAttributes({ showButton: v }); }, __nextHasNoMarginBottom: true })
                        ),
                        attributes.showButton && el(PanelBody, { title: __('Button', 'blockenberg'), initialOpen: false },
                            el(SelectControl, { label: __('Button style', 'blockenberg'), value: attributes.btnStyle, options: BTN_STYLE_OPTIONS, onChange: function (v) { setAttributes({ btnStyle: v }); } }),
                            el(RangeControl, { label: __('Button border radius (px)', 'blockenberg'), value: attributes.btnBorderRadius, min: 0, max: 50, onChange: function (v) { setAttributes({ btnBorderRadius: v }); } })
                        ),
                        el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                            getTypoControl() && el(getTypoControl(), { label: __('Eyebrow','blockenberg'), value: attributes.eyebrowTypo || {}, onChange: function(v){ setAttributes({ eyebrowTypo: v }); } }),
                            getTypoControl() && el(getTypoControl(), { label: __('Title','blockenberg'), value: attributes.titleTypo || {}, onChange: function(v){ setAttributes({ titleTypo: v }); } }),
                            getTypoControl() && el(getTypoControl(), { label: __('Description','blockenberg'), value: attributes.descTypo || {}, onChange: function(v){ setAttributes({ descTypo: v }); } })
                        ),
                        el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                            el(RangeControl, { label: __('Padding top (px)', 'blockenberg'), value: attributes.paddingTop, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop: v }); } }),
                            el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: attributes.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                        ),
                        el(PanelColorSettings, {
                            title: __('Colors', 'blockenberg'),
                            initialOpen: false,
                            colorSettings: [
                                { value: attributes.eyebrowColor, onChange: function (v) { setAttributes({ eyebrowColor: v || '' }); }, label: __('Eyebrow', 'blockenberg') },
                                { value: attributes.titleColor, onChange: function (v) { setAttributes({ titleColor: v || '' }); }, label: __('Title', 'blockenberg') },
                                { value: attributes.descColor, onChange: function (v) { setAttributes({ descColor: v || '' }); }, label: __('Description', 'blockenberg') },
                                { value: attributes.btnBg, onChange: function (v) { setAttributes({ btnBg: v || '' }); }, label: __('Button background', 'blockenberg') },
                                { value: attributes.btnColor, onChange: function (v) { setAttributes({ btnColor: v || '' }); }, label: __('Button text', 'blockenberg') },
                                { value: attributes.bgColor, onChange: function (v) { setAttributes({ bgColor: v || '' }); }, label: __('Section background', 'blockenberg') },
                            ]
                        }),
                        el(PanelBody, { title: __('Rows', 'blockenberg'), initialOpen: false },
                            rows.map(function (row, idx) {
                                return el(PanelBody, { key: row.id, title: (row.title || __('Row', 'blockenberg')) + ' #' + (idx + 1), initialOpen: false },
                                    el(ToggleControl, { label: __('Flip (image on right)', 'blockenberg'), checked: row.flipRow, onChange: function (v) { setRow(row.id, { flipRow: v }); }, __nextHasNoMarginBottom: true }),
                                    el(TextControl, { label: __('Eyebrow', 'blockenberg'), value: row.eyebrow, onChange: function (v) { setRow(row.id, { eyebrow: v }); } }),
                                    el(TextControl, { label: __('Title', 'blockenberg'), value: row.title, onChange: function (v) { setRow(row.id, { title: v }); } }),
                                    el(TextareaControl, { label: __('Description', 'blockenberg'), value: row.desc, rows: 3, onChange: function (v) { setRow(row.id, { desc: v }); } }),
                                    attributes.showButton && el(TextControl, { label: __('Button label', 'blockenberg'), value: row.btnLabel, onChange: function (v) { setRow(row.id, { btnLabel: v }); } }),
                                    attributes.showButton && el(TextControl, { label: __('Button URL', 'blockenberg'), value: row.btnUrl, type: 'url', onChange: function (v) { setRow(row.id, { btnUrl: v }); } }),
                                    attributes.showButton && el(ToggleControl, { label: __('Open in new tab', 'blockenberg'), checked: row.btnNewTab, onChange: function (v) { setRow(row.id, { btnNewTab: v }); }, __nextHasNoMarginBottom: true }),
                                    el('p', { style: { margin: '8px 0 4px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' } }, __('Row image', 'blockenberg')),
                                    el(MediaUploadCheck, null,
                                        el(MediaUpload, {
                                            onSelect: function (media) { setRow(row.id, { imageUrl: media.url, imageId: media.id, imageAlt: media.alt || '' }); },
                                            allowedTypes: ['image'],
                                            value: row.imageId,
                                            render: function (ref) {
                                                return el(Button, { onClick: ref.open, variant: 'secondary', size: 'compact', style: { marginBottom: '6px' } },
                                                    row.imageUrl ? __('Change image', 'blockenberg') : __('Add image', 'blockenberg')
                                                );
                                            }
                                        })
                                    ),
                                    row.imageUrl && el(Button, { onClick: function () { setRow(row.id, { imageUrl: '', imageId: 0 }); }, variant: 'tertiary', size: 'compact', isDestructive: true, style: { display: 'block', marginBottom: '6px' } }, __('Remove image', 'blockenberg')),
                                    el(PanelColorSettings, {
                                        title: __('Row accent', 'blockenberg'),
                                        initialOpen: false,
                                        colorSettings: [{ value: row.accentColor, onChange: function (v) { setRow(row.id, { accentColor: v || '' }); }, label: __('Accent / Button color', 'blockenberg') }]
                                    }),
                                    el(Button, { onClick: function () { removeRow(row.id); }, variant: 'tertiary', isDestructive: true, size: 'compact' }, __('Remove row', 'blockenberg'))
                                );
                            }),
                            el(Button, { onClick: addRow, variant: 'primary', style: { marginTop: '8px' } }, __('+ Add Row', 'blockenberg'))
                        )
                    ),
                    el('div', blockProps,
                        el('div', { className: 'bkbg-media-text', style: { display: 'flex', flexDirection: 'column', gap: attributes.rowGap + 'px' } },
                            rows.map(function (row) {
                                var imgW = attributes.imageWidthPercent + '%';
                                var txtW = (100 - attributes.imageWidthPercent) + '%';
                                return el('div', {
                                    key: row.id,
                                    className: 'bkbg-media-text__row' + (row.flipRow ? ' bkbg-media-text__row--flip' : ''),
                                    style: { display: 'flex', flexDirection: row.flipRow ? 'row-reverse' : 'row', alignItems: 'center', gap: attributes.columnGap + 'px', flexWrap: 'wrap' }
                                },
                                    el('div', { className: 'bkbg-media-text__image', style: { flex: '0 0 ' + imgW, maxWidth: imgW } },
                                        row.imageUrl
                                            ? el('img', { src: row.imageUrl, alt: row.imageAlt, style: { width: '100%', height: 'auto', borderRadius: attributes.imageRadius + 'px', display: 'block', boxShadow: attributes.imageShadow ? '0 20px 60px rgba(0,0,0,0.12)' : 'none' } })
                                            : el('div', { style: { background: '#f3f4f6', borderRadius: attributes.imageRadius + 'px', aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '14px', boxShadow: attributes.imageShadow ? '0 20px 60px rgba(0,0,0,0.08)' : 'none' } }, __('Add image ↑', 'blockenberg'))
                                    ),
                                    el('div', { className: 'bkbg-media-text__text', style: { flex: '0 0 ' + txtW, maxWidth: txtW } },
                                        attributes.showEyebrow && row.eyebrow && el('p', { className: 'bkbg-media-text__eyebrow', style: { color: row.accentColor || attributes.eyebrowColor, marginBottom: '10px' } }, row.eyebrow),
                                        el('h2', { className: 'bkbg-media-text__title', style: { color: attributes.titleColor, margin: '0 0 16px' } }, row.title),
                                        el('p', { className: 'bkbg-media-text__desc', style: { color: attributes.descColor, margin: '0' } }, row.desc),
                                        renderBtnPreview(row, attributes)
                                    )
                                );
                            })
                        )
                    )
                );
            },

            deprecated: [{
                save: function (props) {
                    var attributes = props.attributes;
                    var rows = attributes.rows;
                    var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkbg-media-text-wrap' });

                    return el('div', Object.assign({}, blockProps, { style: { paddingTop: attributes.paddingTop + 'px', paddingBottom: attributes.paddingBottom + 'px', backgroundColor: attributes.bgColor || undefined } }),
                        el('div', { className: 'bkbg-media-text', style: { display: 'flex', flexDirection: 'column', gap: attributes.rowGap + 'px' } },
                            rows.map(function (row) {
                                var imgW = attributes.imageWidthPercent + '%';
                                var txtW = (100 - attributes.imageWidthPercent) + '%';
                                var s = attributes.btnStyle;
                                var bg = s === 'solid' ? (row.accentColor || attributes.btnBg) : 'transparent';
                                var color = s === 'solid' ? '#ffffff' : (row.accentColor || attributes.btnBg);
                                var border = s === 'outlined' ? ('2px solid ' + (row.accentColor || attributes.btnBg)) : 'none';
                                return el('div', {
                                    key: row.id,
                                    className: 'bkbg-media-text__row' + (row.flipRow ? ' bkbg-media-text__row--flip' : ''),
                                    style: { display: 'flex', flexDirection: row.flipRow ? 'row-reverse' : 'row', alignItems: 'center', gap: attributes.columnGap + 'px', flexWrap: 'wrap' }
                                },
                                    el('div', { className: 'bkbg-media-text__image', style: { flex: '0 0 ' + imgW, maxWidth: imgW } },
                                        row.imageUrl && el('img', { src: row.imageUrl, alt: row.imageAlt, style: { width: '100%', height: 'auto', borderRadius: attributes.imageRadius + 'px', display: 'block', boxShadow: attributes.imageShadow ? '0 20px 60px rgba(0,0,0,0.12)' : 'none' } })
                                    ),
                                    el('div', { className: 'bkbg-media-text__text', style: { flex: '0 0 ' + txtW, maxWidth: txtW } },
                                        attributes.showEyebrow && row.eyebrow && el('p', { className: 'bkbg-media-text__eyebrow', style: { fontSize: attributes.eyebrowSize + 'px', fontWeight: attributes.eyebrowFontWeight || 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: row.accentColor || attributes.eyebrowColor, marginBottom: '10px' } }, row.eyebrow),
                                        el('h2', { className: 'bkbg-media-text__title', style: { fontSize: attributes.titleSize + 'px', fontWeight: attributes.titleFontWeight || 700, color: attributes.titleColor, margin: '0 0 16px', lineHeight: attributes.titleLineHeight || 1.2 } }, row.title),
                                        el('p', { className: 'bkbg-media-text__desc', style: { fontSize: attributes.descSize + 'px', color: attributes.descColor, lineHeight: attributes.descLineHeight || 1.6, margin: 0 } }, row.desc),
                                        attributes.showButton && row.btnLabel && el('a', { href: row.btnUrl || '#', target: row.btnNewTab ? '_blank' : undefined, rel: row.btnNewTab ? 'noopener noreferrer' : undefined, className: 'bkbg-media-text__btn', style: { display: 'inline-block', marginTop: '14px', padding: s === 'link' ? '0' : '9px 22px', background: bg, color: color, border: border, borderRadius: attributes.btnBorderRadius + 'px', fontSize: attributes.descSize + 'px', fontWeight: 600, textDecoration: s === 'link' ? 'underline' : 'none' } }, row.btnLabel)
                                    )
                                );
                            })
                        )
                    );
                }
            }],

            save: function (props) {
                var a = props.attributes;
                var rows = a.rows;
                var vf = (typeof window.bkbgTypoCssVars === 'function') ? window.bkbgTypoCssVars : function () { return {}; };
                var st = Object.assign({},
                    vf(a.eyebrowTypo,'--bkbg-mt-ey-'),
                    vf(a.titleTypo,'--bkbg-mt-tt-'),
                    vf(a.descTypo,'--bkbg-mt-ds-'),
                    { paddingTop: a.paddingTop + 'px', paddingBottom: a.paddingBottom + 'px', backgroundColor: a.bgColor || undefined }
                );

                return el('div', (function(p){p.style=Object.assign(p.style||{},st);return p;})(wp.blockEditor.useBlockProps.save({className:'bkbg-media-text-wrap'})),
                    el('div', { className: 'bkbg-media-text', style: { display: 'flex', flexDirection: 'column', gap: a.rowGap + 'px' } },
                        rows.map(function (row) {
                            var imgW = a.imageWidthPercent + '%';
                            var txtW = (100 - a.imageWidthPercent) + '%';
                            var s = a.btnStyle;
                            var bg = s === 'solid' ? (row.accentColor || a.btnBg) : 'transparent';
                            var color = s === 'solid' ? '#ffffff' : (row.accentColor || a.btnBg);
                            var border = s === 'outlined' ? ('2px solid ' + (row.accentColor || a.btnBg)) : 'none';
                            return el('div', {
                                key: row.id,
                                className: 'bkbg-media-text__row' + (row.flipRow ? ' bkbg-media-text__row--flip' : ''),
                                style: { display: 'flex', flexDirection: row.flipRow ? 'row-reverse' : 'row', alignItems: 'center', gap: a.columnGap + 'px', flexWrap: 'wrap' }
                            },
                                el('div', { className: 'bkbg-media-text__image', style: { flex: '0 0 ' + imgW, maxWidth: imgW } },
                                    row.imageUrl && el('img', { src: row.imageUrl, alt: row.imageAlt, style: { width: '100%', height: 'auto', borderRadius: a.imageRadius + 'px', display: 'block', boxShadow: a.imageShadow ? '0 20px 60px rgba(0,0,0,0.12)' : 'none' } })
                                ),
                                el('div', { className: 'bkbg-media-text__text', style: { flex: '0 0 ' + txtW, maxWidth: txtW } },
                                    a.showEyebrow && row.eyebrow && el('p', { className: 'bkbg-media-text__eyebrow', style: { color: row.accentColor || a.eyebrowColor, marginBottom: '10px' } }, row.eyebrow),
                                    el('h2', { className: 'bkbg-media-text__title', style: { color: a.titleColor, margin: '0 0 16px' } }, row.title),
                                    el('p', { className: 'bkbg-media-text__desc', style: { color: a.descColor, margin: 0 } }, row.desc),
                                    a.showButton && row.btnLabel && el('a', { href: row.btnUrl || '#', target: row.btnNewTab ? '_blank' : undefined, rel: row.btnNewTab ? 'noopener noreferrer' : undefined, className: 'bkbg-media-text__btn', style: { display: 'inline-block', marginTop: '14px', padding: s === 'link' ? '0' : '9px 22px', background: bg, color: color, border: border, borderRadius: a.btnBorderRadius + 'px', fontSize: a.descSize + 'px', fontWeight: 600, textDecoration: s === 'link' ? 'underline' : 'none' } }, row.btnLabel)
                                )
                            );
                        })
                    )
                );
            }
        });
}());

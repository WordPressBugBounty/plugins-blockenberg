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
    var Button = wp.components.Button;

    var _TypographyControl, _typoCssVars;
    function getTypographyControl() { return _TypographyControl || (_TypographyControl = window.bkbgTypographyControl); }
    function getTypoCssVars() { return _typoCssVars || (_typoCssVars = window.bkbgTypoCssVars); }

    var POSITION_OPTIONS = [
        { value: 'alternate', label: 'Alternate (image switches sides)' },
        { value: 'left',      label: 'Always Left' },
        { value: 'right',     label: 'Always Right' }
    ];
    var RATIO_OPTIONS = [
        { value: '16:9', label: '16:9 Wide' },
        { value: '4:3',  label: '4:3 Standard' },
        { value: '1:1',  label: '1:1 Square' },
        { value: '3:4',  label: '3:4 Portrait' }
    ];
    var VALIGN_OPTIONS = [
        { value: 'flex-start', label: 'Top' },
        { value: 'center',     label: 'Center' },
        { value: 'flex-end',   label: 'Bottom' }
    ];

    var RATIO_PAD = { '16:9': '56.25%', '4:3': '75%', '1:1': '100%', '3:4': '133.333%' };

    function emptyRow() {
        return { title: '', badge: '', description: '', features: [], btnLabel: 'Learn More', btnUrl: '', imageUrl: '', imageId: 0, imageAlt: '' };
    }

    registerBlockType('blockenberg/image-text-rows', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;
            var rows = attr.rows || [emptyRow()];

            var _tv = getTypoCssVars();
            var bpStyle = {
                background: attr.bgColor || undefined,
                paddingTop: attr.paddingTop + 'px',
                paddingBottom: attr.paddingBottom + 'px'
            };
            Object.assign(bpStyle, _tv(attr.headingTypo, '--bkbg-itr-h-'));
            Object.assign(bpStyle, _tv(attr.bodyTypo, '--bkbg-itr-bd-'));
            var blockProps = useBlockProps({ style: bpStyle });

            function updateRow(idx, field, val) {
                var updated = rows.map(function (r, i) {
                    if (i !== idx) return r;
                    var p = {}; p[field] = val;
                    return Object.assign({}, r, p);
                });
                set({ rows: updated });
            }

            function updateFeature(rowIdx, fIdx, val) {
                var updated = rows.map(function (r, i) {
                    if (i !== rowIdx) return r;
                    var newF = r.features.map(function (f, j) { return j === fIdx ? val : f; });
                    return Object.assign({}, r, { features: newF });
                });
                set({ rows: updated });
            }

            var controls = el(InspectorControls, {},
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                    el(SelectControl, { label: __('Image Position', 'blockenberg'), value: attr.imagePosition, options: POSITION_OPTIONS, __nextHasNoMarginBottom: true, onChange: function (v) { set({ imagePosition: v }); } }),
                    el('div', { style: { marginTop: '10px' } },
                        el(SelectControl, { label: __('Image Ratio', 'blockenberg'), value: attr.imageRatio, options: RATIO_OPTIONS, __nextHasNoMarginBottom: true, onChange: function (v) { set({ imageRatio: v }); } })
                    ),
                    el('div', { style: { marginTop: '10px' } },
                        el(RangeControl, { label: __('Image Width %', 'blockenberg'), value: attr.imageWidth, min: 30, max: 65, __nextHasNoMarginBottom: true, onChange: function (v) { set({ imageWidth: v }); } })
                    ),
                    el('div', { style: { marginTop: '10px' } },
                        el(RangeControl, { label: __('Image Radius', 'blockenberg'), value: attr.imageRadius, min: 0, max: 40, __nextHasNoMarginBottom: true, onChange: function (v) { set({ imageRadius: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Image Shadow', 'blockenberg'), checked: attr.imageShadow, __nextHasNoMarginBottom: true, onChange: function (v) { set({ imageShadow: v }); } })
                    ),
                    el('div', { style: { marginTop: '10px' } },
                        el(SelectControl, { label: __('Vertical Alignment', 'blockenberg'), value: attr.verticalAlign, options: VALIGN_OPTIONS, __nextHasNoMarginBottom: true, onChange: function (v) { set({ verticalAlign: v }); } })
                    ),
                    el('div', { style: { marginTop: '10px' } },
                        el(RangeControl, { label: __('Gap Between Rows', 'blockenberg'), value: attr.gap, min: 20, max: 160, __nextHasNoMarginBottom: true, onChange: function (v) { set({ gap: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Badges', 'blockenberg'), checked: attr.showBadges, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showBadges: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Feature List', 'blockenberg'), checked: attr.showFeatures, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showFeatures: v }); } })
                    ),
                    el('div', { style: { marginTop: '8px' } },
                        el(ToggleControl, { label: __('Show Buttons', 'blockenberg'), checked: attr.showBtns, __nextHasNoMarginBottom: true, onChange: function (v) { set({ showBtns: v }); } })
                    ),
                    el('div', { style: { marginTop: '10px' } },
                        el(RangeControl, { label: __('Padding Top', 'blockenberg'), value: attr.paddingTop, min: 0, max: 120, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingTop: v }); } })
                    ),
                    el('div', { style: { marginTop: '10px' } },
                        el(RangeControl, { label: __('Padding Bottom', 'blockenberg'), value: attr.paddingBottom, min: 0, max: 120, __nextHasNoMarginBottom: true, onChange: function (v) { set({ paddingBottom: v }); } })
                    )
                ),
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'), initialOpen: false,
                    colorSettings: [
                        { label: __('Section Background', 'blockenberg'), value: attr.bgColor, onChange: function (v) { set({ bgColor: v || '' }); } },
                        { label: __('Badge Background', 'blockenberg'), value: attr.badgeBg, onChange: function (v) { set({ badgeBg: v || '#ede9fe' }); } },
                        { label: __('Badge Text', 'blockenberg'), value: attr.badgeColor, onChange: function (v) { set({ badgeColor: v || '#7c3aed' }); } },
                        { label: __('Title', 'blockenberg'), value: attr.titleColor, onChange: function (v) { set({ titleColor: v || '#111827' }); } },
                        { label: __('Description', 'blockenberg'), value: attr.descColor, onChange: function (v) { set({ descColor: v || '#374151' }); } },
                        { label: __('Feature Text', 'blockenberg'), value: attr.featureColor, onChange: function (v) { set({ featureColor: v || '#374151' }); } },
                        { label: __('Feature Dot', 'blockenberg'), value: attr.featureDot, onChange: function (v) { set({ featureDot: v || '#7c3aed' }); } },
                        { label: __('Button Background', 'blockenberg'), value: attr.btnBg, onChange: function (v) { set({ btnBg: v || '#7c3aed' }); } },
                        { label: __('Button Text', 'blockenberg'), value: attr.btnColor, onChange: function (v) { set({ btnColor: v || '#ffffff' }); } }
                    ]
                }),
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        el(getTypographyControl(), { label: 'Heading', value: attr.headingTypo, onChange: function(v){ set({ headingTypo: v }); } }),
                        el(getTypographyControl(), { label: 'Body', value: attr.bodyTypo, onChange: function(v){ set({ bodyTypo: v }); } })
                    ),

            );

            return el('div', blockProps,
                controls,
                el('div', { style: { display: 'flex', flexDirection: 'column', gap: attr.gap + 'px' } },
                    rows.map(function (row, idx) {
                        var imgLeft = attr.imagePosition === 'left' || (attr.imagePosition === 'alternate' && idx % 2 === 0);
                        var features = row.features || [];

                        var imgCol = el('div', { style: { flex: '0 0 ' + attr.imageWidth + '%', maxWidth: attr.imageWidth + '%' } },
                            el('div', { style: { position: 'relative', paddingBottom: RATIO_PAD[attr.imageRatio] || '75%', background: '#f3f4f6', borderRadius: attr.imageRadius + 'px', overflow: 'hidden', boxShadow: attr.imageShadow ? '0 8px 30px rgba(0,0,0,0.12)' : 'none' } },
                                row.imageUrl
                                    ? el('img', { src: row.imageUrl, alt: row.imageAlt, style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' } })
                                    : el(MediaUploadCheck, {},
                                        el(MediaUpload, {
                                            onSelect: function (m) { updateRow(idx, 'imageUrl', m.url); updateRow(idx, 'imageId', m.id); updateRow(idx, 'imageAlt', m.alt || ''); },
                                            allowedTypes: ['image'], value: row.imageId,
                                            render: function (r) { return el(Button, { onClick: r.open, style: { position: 'absolute', inset: 0, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '13px' } }, '+ Add Image'); }
                                        })
                                    ),
                                row.imageUrl && el('div', { style: { position: 'absolute', bottom: '8px', right: '8px' } },
                                    el(Button, { isSmall: true, variant: 'secondary', onClick: function () { updateRow(idx, 'imageUrl', ''); updateRow(idx, 'imageId', 0); } }, '✕')
                                )
                            )
                        );

                        var textCol = el('div', { style: { flex: 1, minWidth: 0 } },
                            attr.showBadges && el(TextControl, { value: row.badge, label: '', placeholder: __('Badge text…', 'blockenberg'), __nextHasNoMarginBottom: true, style: { fontSize: '12px', marginBottom: '10px', width: '160px' }, onChange: function (v) { updateRow(idx, 'badge', v); } }),
                            el(RichText, { tagName: 'h2', className: 'bkbg-itr-title', value: row.title, allowedFormats: ['core/bold', 'core/italic'], placeholder: __('Row title…', 'blockenberg'), style: { margin: '0 0 14px', color: attr.titleColor }, onChange: function (v) { updateRow(idx, 'title', v); } }),
                            el(RichText, { tagName: 'p', className: 'bkbg-itr-desc', value: row.description, allowedFormats: ['core/bold', 'core/italic', 'core/link'], placeholder: __('Row description…', 'blockenberg'), style: { margin: '0 0 16px', color: attr.descColor }, onChange: function (v) { updateRow(idx, 'description', v); } }),

                            attr.showFeatures && el('div', { style: { marginBottom: '16px' } },
                                features.map(function (f, fi) {
                                    return el('div', { key: fi, style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' } },
                                        el('span', { style: { width: '8px', height: '8px', borderRadius: '50%', background: attr.featureDot, flexShrink: 0 } }),
                                        el(TextControl, { value: f, label: '', placeholder: __('Feature…', 'blockenberg'), __nextHasNoMarginBottom: true, style: { flex: 1, fontSize: '14px', color: attr.featureColor }, onChange: function (v) { updateFeature(idx, fi, v); } }),
                                        el(Button, { isSmall: true, isDestructive: true, variant: 'tertiary', onClick: function () {
                                            updateRow(idx, 'features', features.filter(function (_, j) { return j !== fi; }));
                                        } }, '×')
                                    );
                                }),
                                el(Button, { variant: 'link', style: { fontSize: '11px' }, onClick: function () { updateRow(idx, 'features', features.concat([''])); } }, '+ Add Feature')
                            ),

                            attr.showBtns && el('div', { style: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' } },
                                el(TextControl, { value: row.btnLabel, label: '', placeholder: __('Button label…', 'blockenberg'), __nextHasNoMarginBottom: true, style: { width: '130px', fontSize: '13px' }, onChange: function (v) { updateRow(idx, 'btnLabel', v); } }),
                                el(TextControl, { value: row.btnUrl, label: '', placeholder: __('https://…', 'blockenberg'), __nextHasNoMarginBottom: true, style: { flex: 1, fontSize: '13px' }, onChange: function (v) { updateRow(idx, 'btnUrl', v); } }),
                                row.btnLabel && el('span', { style: { background: attr.btnBg, color: attr.btnColor, padding: '8px 18px', borderRadius: '6px', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap' } }, row.btnLabel)
                            )
                        );

                        return el('div', { key: idx, style: { display: 'flex', alignItems: attr.verticalAlign, gap: '40px', flexWrap: 'wrap' } },
                            imgLeft ? imgCol : textCol,
                            imgLeft ? textCol : imgCol,
                            el('div', { style: { width: '100%', display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '4px' } },
                                el(Button, { isSmall: true, variant: 'secondary', onClick: function () { set({ rows: rows.concat([Object.assign({}, row)]) }); } }, '⧉ Duplicate Row'),
                                el(Button, { isSmall: true, isDestructive: true, variant: 'tertiary', onClick: function () { set({ rows: rows.filter(function (_, i) { return i !== idx; }) }); } }, '× Remove Row')
                            )
                        );
                    })
                ),
                el('div', { style: { marginTop: '20px', textAlign: 'center' } },
                    el(Button, { variant: 'primary', onClick: function () { set({ rows: rows.concat([emptyRow()]) }); } }, '+ Add Row')
                )
            );
        },
        save: function (props) {
            var attr = props.attributes;
            var useBlockProps = wp.blockEditor.useBlockProps;
            return el('div', useBlockProps.save(),
                el('div', { className: 'bkbg-itr-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );

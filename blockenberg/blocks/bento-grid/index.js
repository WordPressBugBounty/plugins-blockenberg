(function () {
        var el = wp.element.createElement;
        var Fragment = wp.element.Fragment;
        var useState = wp.element.useState;
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
        var Notice = wp.components.Notice;

        function getTypographyControl() { return window.bkbgTypographyControl; }
        function getTypoCssVars() { return window.bkbgTypoCssVars; }

        var builtInIcons = {
            star: el('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'currentColor' }, el('path', { d: 'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z' })),
            bolt: el('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'currentColor' }, el('path', { d: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' })),
            heart: el('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'currentColor' }, el('path', { d: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z' })),
            check: el('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 }, el('polyline', { points: '20 6 9 17 4 12' })),
        };

        var LAYOUT_OPTIONS = [
            { label: 'Classic (1 large + 2 + 2)', value: 'classic' },
            { label: 'Spotlight (1 large + 3 small)', value: 'spotlight' },
            { label: 'Even 2×3 grid', value: 'even' },
        ];

        var SPAN_OPTIONS = [
            { label: 'Large (2 col)', value: 'large' },
            { label: 'Medium (1.5 col)', value: 'medium' },
            { label: 'Small (1 col)', value: 'small' },
        ];

        var TYPE_OPTIONS = [
            { label: 'Text + Button', value: 'text' },
            { label: 'Statistic', value: 'stat' },
            { label: 'Image + Overlay', value: 'image' },
        ];

        function makeId() { return 'c' + Math.random().toString(36).substr(2, 6); }

        function renderCellContent(cell, attributes) {
            var btnRadius   = attributes.btnBorderRadius !== undefined ? attributes.btnBorderRadius : 8;
            return el(Fragment, null,
                cell.imageUrl && cell.type === 'image' && el('div', { style: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', borderRadius: 'inherit' } }),
                el('div', { style: { position: 'relative', zIndex: 1 } },
                    cell.eyebrow && el('p', { className: 'bkbg-bento-eyebrow', style: { margin: '0 0 6px', opacity: 0.8 } }, cell.eyebrow),
                    cell.title && el('h3', { className: 'bkbg-bento-title', style: { margin: '0 0 8px', color: 'inherit' } }, cell.title),
                    cell.desc && cell.type !== 'stat' && el('p', { className: 'bkbg-bento-desc', style: { opacity: 0.85, margin: '0 0 12px' } }, cell.desc),
                    cell.showButton && cell.buttonLabel && el('a', { href: cell.buttonUrl || '#', className: 'bkbg-bento-btn', style: { display: 'inline-block', padding: '7px 16px', background: cell.accentColor || '#6c3fb5', color: '#fff', borderRadius: btnRadius + 'px' } }, cell.buttonLabel)
                )
            );
        }

        registerBlockType('blockenberg/bento-grid', {
            edit: function (props) {
                var attributes = props.attributes;
                var setAttributes = props.setAttributes;
                var cells = attributes.cells;
                var layout = attributes.layout;

                var _tv = getTypoCssVars();
                var bpStyle = { paddingTop: attributes.paddingTop + 'px', paddingBottom: attributes.paddingBottom + 'px', backgroundColor: attributes.bgColor || undefined };
                if (_tv) {
                    Object.assign(bpStyle, _tv(attributes.eyebrowTypo || {}, '--bkbg-bento-eyebrow-'));
                    Object.assign(bpStyle, _tv(attributes.titleTypo || {}, '--bkbg-bento-title-'));
                    Object.assign(bpStyle, _tv(attributes.descTypo || {}, '--bkbg-bento-desc-'));
                }
                var blockProps = useBlockProps({ style: bpStyle });

                var gridStyle = {
                    display: 'grid',
                    gap: attributes.gap + 'px',
                    gridTemplateColumns: layout === 'even' ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
                    gridAutoRows: 'minmax(' + attributes.minRowHeight + 'px, auto)',
                };

                function setCell(id, patch) {
                    setAttributes({ cells: cells.map(function (c) { return c.id === id ? Object.assign({}, c, patch) : c; }) });
                }
                function addCell() {
                    setAttributes({ cells: cells.concat([{ id: makeId(), span: 'small', type: 'text', eyebrow: 'New', title: 'New cell', desc: '', imageUrl: '', imageId: 0, accentColor: '#6c3fb5', bgColor: '#f5f0ff', textColor: '#111827', showButton: false, buttonLabel: 'Learn more', buttonUrl: '' }]) });
                }
                function removeCell(id) {
                    if (cells.length <= 1) return;
                    setAttributes({ cells: cells.filter(function (c) { return c.id !== id; }) });
                }

                function colSpanFor(span, isEven) {
                    if (isEven) return 1;
                    if (span === 'large') return 2;
                    if (span === 'medium') return 2;
                    return 1;
                }
                var isEven = layout === 'even';

                return el(Fragment, null,
                    el(InspectorControls, null,
                        el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                            el(SelectControl, { label: __('Grid Layout', 'blockenberg'), value: layout, options: LAYOUT_OPTIONS, onChange: function (v) { setAttributes({ layout: v }); } }),
                            el(RangeControl, { label: __('Gap (px)', 'blockenberg'), value: attributes.gap, min: 0, max: 48, onChange: function (v) { setAttributes({ gap: v }); } }),
                            el(RangeControl, { label: __('Cell border radius (px)', 'blockenberg'), value: attributes.borderRadius, min: 0, max: 48, onChange: function (v) { setAttributes({ borderRadius: v }); } }),
                            el(RangeControl, { label: __('Min row height (px)', 'blockenberg'), value: attributes.minRowHeight, min: 100, max: 500, onChange: function (v) { setAttributes({ minRowHeight: v }); } }),
                            el(ToggleControl, { label: __('Hover lift effect', 'blockenberg'), checked: attributes.hoverLift, onChange: function (v) { setAttributes({ hoverLift: v }); }, __nextHasNoMarginBottom: true }),
                            el(ToggleControl, { label: __('Animate in on scroll', 'blockenberg'), checked: attributes.animateIn, onChange: function (v) { setAttributes({ animateIn: v }); }, __nextHasNoMarginBottom: true })
                        ),
                        el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                            (function () { var TC = getTypographyControl(); return TC ? el(TC, { label: __('Eyebrow', 'blockenberg'), value: attributes.eyebrowTypo || {}, onChange: function (v) { setAttributes({ eyebrowTypo: v }); } }) : null; })(),
                            (function () { var TC = getTypographyControl(); return TC ? el(TC, { label: __('Title', 'blockenberg'), value: attributes.titleTypo || {}, onChange: function (v) { setAttributes({ titleTypo: v }); } }) : null; })(),
                            (function () { var TC = getTypographyControl(); return TC ? el(TC, { label: __('Description', 'blockenberg'), value: attributes.descTypo || {}, onChange: function (v) { setAttributes({ descTypo: v }); } }) : null; })(),
                            el(RangeControl, { label: __('Button border radius (px)', 'blockenberg'), value: attributes.btnBorderRadius, min: 0, max: 50, onChange: function (v) { setAttributes({ btnBorderRadius: v }); } })
                        ),
                        el(PanelBody, { title: __('Spacing', 'blockenberg'), initialOpen: false },
                            el(RangeControl, { label: __('Padding top (px)', 'blockenberg'), value: attributes.paddingTop, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingTop: v }); } }),
                            el(RangeControl, { label: __('Padding bottom (px)', 'blockenberg'), value: attributes.paddingBottom, min: 0, max: 200, onChange: function (v) { setAttributes({ paddingBottom: v }); } })
                        ),
                        el(PanelColorSettings, {
                            title: __('Section Background', 'blockenberg'),
                            initialOpen: false,
                            colorSettings: [{ value: attributes.bgColor, onChange: function (v) { setAttributes({ bgColor: v || '' }); }, label: __('Background', 'blockenberg') }]
                        }),
                        el(PanelBody, { title: __('Cells', 'blockenberg'), initialOpen: false },
                            cells.map(function (cell, idx) {
                                return el(PanelBody, { key: cell.id, title: (cell.title || __('Cell', 'blockenberg')) + ' #' + (idx + 1), initialOpen: false },
                                    el(SelectControl, { label: __('Size', 'blockenberg'), value: cell.span, options: SPAN_OPTIONS, onChange: function (v) { setCell(cell.id, { span: v }); } }),
                                    el(SelectControl, { label: __('Cell type', 'blockenberg'), value: cell.type, options: TYPE_OPTIONS, onChange: function (v) { setCell(cell.id, { type: v }); } }),
                                    el(TextControl, { label: __('Eyebrow / label', 'blockenberg'), value: cell.eyebrow, onChange: function (v) { setCell(cell.id, { eyebrow: v }); } }),
                                    el(TextControl, { label: __('Title / Value', 'blockenberg'), value: cell.title, onChange: function (v) { setCell(cell.id, { title: v }); } }),
                                    el(TextareaControl, { label: __('Description', 'blockenberg'), value: cell.desc, rows: 2, onChange: function (v) { setCell(cell.id, { desc: v }); } }),
                                    el(ToggleControl, { label: __('Show button', 'blockenberg'), checked: cell.showButton, onChange: function (v) { setCell(cell.id, { showButton: v }); }, __nextHasNoMarginBottom: true }),
                                    cell.showButton && el(TextControl, { label: __('Button label', 'blockenberg'), value: cell.buttonLabel, onChange: function (v) { setCell(cell.id, { buttonLabel: v }); } }),
                                    cell.showButton && el(TextControl, { label: __('Button URL', 'blockenberg'), value: cell.buttonUrl, type: 'url', onChange: function (v) { setCell(cell.id, { buttonUrl: v }); } }),
                                    el('p', { style: { margin: '8px 0 4px', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' } }, __('Image', 'blockenberg')),
                                    el(MediaUploadCheck, null,
                                        el(MediaUpload, {
                                            onSelect: function (media) { setCell(cell.id, { imageUrl: media.url, imageId: media.id }); },
                                            allowedTypes: ['image'],
                                            value: cell.imageId,
                                            render: function (ref) {
                                                return el(Button, { onClick: ref.open, variant: 'secondary', size: 'compact', style: { marginBottom: '8px' } },
                                                    cell.imageUrl ? __('Change image', 'blockenberg') : __('Add image', 'blockenberg')
                                                );
                                            }
                                        })
                                    ),
                                    cell.imageUrl && el(Button, { onClick: function () { setCell(cell.id, { imageUrl: '', imageId: 0 }); }, variant: 'tertiary', size: 'compact', isDestructive: true, style: { marginBottom: '8px', display: 'block' } }, __('Remove image', 'blockenberg')),
                                    el(PanelColorSettings, {
                                        title: __('Cell Colors', 'blockenberg'),
                                        initialOpen: false,
                                        colorSettings: [
                                            { value: cell.bgColor, onChange: function (v) { setCell(cell.id, { bgColor: v || '' }); }, label: __('Background', 'blockenberg') },
                                            { value: cell.textColor, onChange: function (v) { setCell(cell.id, { textColor: v || '' }); }, label: __('Text', 'blockenberg') },
                                            { value: cell.accentColor, onChange: function (v) { setCell(cell.id, { accentColor: v || '' }); }, label: __('Accent / Button', 'blockenberg') },
                                        ]
                                    }),
                                    el(Button, { onClick: function () { removeCell(cell.id); }, variant: 'tertiary', isDestructive: true, size: 'compact' }, __('Remove cell', 'blockenberg'))
                                );
                            }),
                            el(Button, { onClick: addCell, variant: 'primary', style: { marginTop: '8px' } }, __('+ Add Cell', 'blockenberg'))
                        )
                    ),
                    el('div', blockProps,
                        el('div', { className: 'bkbg-bento-grid', 'data-layout': layout, 'data-hover-lift': attributes.hoverLift ? '1' : '0', 'data-animate': attributes.animateIn ? '1' : '0', style: gridStyle },
                            cells.map(function (cell) {
                                var span = colSpanFor(cell.span, isEven);
                                var cellStyle = {
                                    backgroundColor: cell.bgColor || '#f5f0ff',
                                    color: cell.textColor || '#111827',
                                    borderRadius: attributes.borderRadius + 'px',
                                    padding: '2rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: cell.type === 'stat' ? 'center' : 'flex-end',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    gridColumn: 'span ' + span,
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                };
                                if (cell.imageUrl) {
                                    cellStyle.backgroundImage = 'url(' + cell.imageUrl + ')';
                                    cellStyle.backgroundSize = 'cover';
                                    cellStyle.backgroundPosition = 'center';
                                }
                                return el('div', {
                                    key: cell.id,
                                    className: 'bkbg-bento-cell bkbg-bento-cell--' + cell.span,
                                    style: cellStyle
                                },
                                    renderCellContent(cell, attributes)
                                );
                            })
                        )
                    )
                );
            },

            save: function (props) {
                var attributes = props.attributes;
                var cells = attributes.cells;
                var layout = attributes.layout;
                var isEven = layout === 'even';

                function colSpanFor(span) {
                    if (isEven) return 1;
                    if (span === 'large') return 2;
                    if (span === 'medium') return 2;
                    return 1;
                }

                var _tv = getTypoCssVars();
                var saveStyle = { paddingTop: attributes.paddingTop + 'px', paddingBottom: attributes.paddingBottom + 'px', backgroundColor: attributes.bgColor || undefined };
                if (_tv) {
                    Object.assign(saveStyle, _tv(attributes.eyebrowTypo || {}, '--bkbg-bento-eyebrow-'));
                    Object.assign(saveStyle, _tv(attributes.titleTypo || {}, '--bkbg-bento-title-'));
                    Object.assign(saveStyle, _tv(attributes.descTypo || {}, '--bkbg-bento-desc-'));
                }
                var blockProps = wp.blockEditor.useBlockProps.save({ className: 'bkbg-bento-grid-wrap', style: saveStyle });

                return el('div', blockProps,
                    el('div', { className: 'bkbg-bento-grid', 'data-layout': layout, 'data-hover-lift': attributes.hoverLift ? '1' : '0', 'data-animate': attributes.animateIn ? '1' : '0', style: { display: 'grid', gap: attributes.gap + 'px', gridTemplateColumns: isEven ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)', gridAutoRows: 'minmax(' + attributes.minRowHeight + 'px, auto)' } },
                        cells.map(function (cell) {
                            var span = colSpanFor(cell.span);
                            var cellStyle = {
                                backgroundColor: cell.bgColor || '#f5f0ff',
                                color: cell.textColor || '#111827',
                                borderRadius: attributes.borderRadius + 'px',
                                padding: '2rem',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: cell.type === 'stat' ? 'center' : 'flex-end',
                                position: 'relative',
                                overflow: 'hidden',
                                gridColumn: 'span ' + span,
                            };
                            if (cell.imageUrl) {
                                cellStyle.backgroundImage = 'url(' + cell.imageUrl + ')';
                                cellStyle.backgroundSize = 'cover';
                                cellStyle.backgroundPosition = 'center';
                            }
                            return el('div', { key: cell.id, className: 'bkbg-bento-cell bkbg-bento-cell--' + cell.span, style: cellStyle },
                                cell.imageUrl && cell.type === 'image' && el('div', { className: 'bkbg-bento-overlay', style: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' } }),
                                el('div', { className: 'bkbg-bento-content', style: { position: 'relative', zIndex: 1 } },
                                    cell.eyebrow && el('p', { className: 'bkbg-bento-eyebrow', style: { margin: '0 0 6px', opacity: 0.8 } }, cell.eyebrow),
                                    cell.title && el('h3', { className: 'bkbg-bento-title', style: { margin: '0 0 8px', color: 'inherit' } }, cell.title),
                                    cell.desc && cell.type !== 'stat' && el('p', { className: 'bkbg-bento-desc', style: { opacity: 0.85, margin: '0 0 12px' } }, cell.desc),
                                    cell.showButton && cell.buttonLabel && el('a', { href: cell.buttonUrl || '#', className: 'bkbg-bento-btn', style: { display: 'inline-block', padding: '7px 16px', background: cell.accentColor || '#6c3fb5', color: '#fff', borderRadius: attributes.btnBorderRadius + 'px' } }, cell.buttonLabel)
                                )
                            );
                        })
                    )
                );
            }
        });
}());

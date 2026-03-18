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
    var Fragment = wp.element.Fragment;

    var _TC, _tv;
    function getTC() { return _TC || (_TC = window.bkbgTypographyControl); }
    function getTV() { return _tv || (_tv = window.bkbgTypoCssVars); }

    registerBlockType('blockenberg/scrollytelling', {
        edit: function (props) {
            var attr = props.attributes;
            var set = props.setAttributes;
            var chapters = attr.chapters || [];

            function updateChapter(idx, field, val) {
                var updated = chapters.map(function (ch, i) {
                    if (i !== idx) return ch;
                    var patch = {}; patch[field] = val;
                    return Object.assign({}, ch, patch);
                });
                set({ chapters: updated });
            }

            function addChapter() {
                set({
                    chapters: chapters.concat([{
                        title: 'New Chapter', eyebrow: '', text: 'Your story continues here.',
                        imageUrl: '', imageId: 0, imageAlt: '', overlayColor: '#000000', overlayOpacity: 40
                    }])
                });
            }

            function removeChapter(idx) {
                set({ chapters: chapters.filter(function (_, i) { return i !== idx; }) });
            }

            function moveChapter(idx, dir) {
                var arr = chapters.slice();
                var target = idx + dir;
                if (target < 0 || target >= arr.length) return;
                var tmp = arr[idx]; arr[idx] = arr[target]; arr[target] = tmp;
                set({ chapters: arr });
            }

            /* Inspector */
            var inspector = el(InspectorControls, {},
                /* Layout */
                el(PanelBody, { title: __('Layout', 'blockenberg'), initialOpen: true },
                    el(SelectControl, {
                        label: __('Sticky Height', 'blockenberg'),
                        value: attr.stickyHeight,
                        options: [
                            { label: '50vh', value: '50vh' },
                            { label: '70vh', value: '70vh' },
                            { label: '100vh (Fullscreen)', value: '100vh' }
                        ],
                        onChange: function (v) { set({ stickyHeight: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(SelectControl, {
                        label: __('Text Panel Position', 'blockenberg'),
                        value: attr.textPosition,
                        options: [
                            { label: 'Left', value: 'left' },
                            { label: 'Right', value: 'right' },
                            { label: 'Center', value: 'center' }
                        ],
                        onChange: function (v) { set({ textPosition: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(SelectControl, {
                        label: __('Transition Style', 'blockenberg'),
                        value: attr.transitionStyle,
                        options: [
                            { label: 'Fade', value: 'fade' },
                            { label: 'Slide', value: 'slide' }
                        ],
                        onChange: function (v) { set({ transitionStyle: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Panel Width (px)', 'blockenberg'),
                        value: attr.panelWidth, min: 280, max: 700, step: 10,
                        onChange: function (v) { set({ panelWidth: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(ToggleControl, {
                        label: __('Show Chapter Progress', 'blockenberg'),
                        checked: attr.showProgress,
                        onChange: function (v) { set({ showProgress: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Padding Top (px)', 'blockenberg'),
                        value: attr.paddingTop, min: 0, max: 200,
                        onChange: function (v) { set({ paddingTop: v }); },
                        __nextHasNoMarginBottom: true
                    }),
                    el(RangeControl, {
                        label: __('Padding Bottom (px)', 'blockenberg'),
                        value: attr.paddingBottom, min: 0, max: 200,
                        onChange: function (v) { set({ paddingBottom: v }); },
                        __nextHasNoMarginBottom: true
                    })
                ),
                /* Default Background */
                el(PanelBody, { title: __('Default Background', 'blockenberg'), initialOpen: false },
                    el(MediaUploadCheck, {},
                        el(MediaUpload, {
                            onSelect: function (m) { set({ defaultBgUrl: m.url, defaultBgId: m.id }); },
                            allowedTypes: ['image'],
                            value: attr.defaultBgId,
                            render: function (ref) {
                                return el(Fragment, {},
                                    attr.defaultBgUrl && el('img', {
                                        src: attr.defaultBgUrl,
                                        style: { width: '100%', height: '80px', objectFit: 'cover', borderRadius: '6px', marginBottom: '6px' }
                                    }),
                                    el(Button, {
                                        onClick: ref.open,
                                        variant: attr.defaultBgUrl ? 'secondary' : 'primary',
                                        isSmall: true
                                    }, attr.defaultBgUrl ? __('Replace Background', 'blockenberg') : __('Choose Background', 'blockenberg')),
                                    attr.defaultBgUrl && el(Button, {
                                        onClick: function () { set({ defaultBgUrl: '', defaultBgId: 0 }); },
                                        variant: 'link', isDestructive: true, isSmall: true,
                                        style: { marginLeft: '8px' }
                                    }, __('Remove', 'blockenberg'))
                                );
                            }
                        })
                    )
                ),
                /* Colors */
                el(PanelColorSettings, {
                    title: __('Colors', 'blockenberg'),
                    initialOpen: false,
                    colorSettings: [
                        { value: attr.eyebrowColor, onChange: function (v) { set({ eyebrowColor: v || '#a5b4fc' }); }, label: __('Eyebrow', 'blockenberg') },
                        { value: attr.titleColor, onChange: function (v) { set({ titleColor: v || '#ffffff' }); }, label: __('Title', 'blockenberg') },
                        { value: attr.textColor, onChange: function (v) { set({ textColor: v || '#e5e7eb' }); }, label: __('Body Text', 'blockenberg') },
                        { value: attr.textBg, onChange: function (v) { set({ textBg: v || '' }); }, label: __('Panel Background', 'blockenberg') },
                        { value: attr.progressColor, onChange: function (v) { set({ progressColor: v || '#6366f1' }); }, label: __('Progress Indicator', 'blockenberg') },
                        { value: attr.accentColor, onChange: function (v) { set({ accentColor: v || '#6366f1' }); }, label: __('Accent', 'blockenberg') }
                    ]
                }),
                /* Typography */
                el(PanelBody, { title: __('Typography', 'blockenberg'), initialOpen: false },
                    el(getTC(), { label: __('Title', 'blockenberg'), value: attr.titleTypo, onChange: function (v) { set({ titleTypo: v }); } }),
                    el(getTC(), { label: __('Eyebrow', 'blockenberg'), value: attr.eyebrowTypo, onChange: function (v) { set({ eyebrowTypo: v }); } }),
                    el(getTC(), { label: __('Body Text', 'blockenberg'), value: attr.bodyTypo, onChange: function (v) { set({ bodyTypo: v }); } })
                )
            );

            /* Editor Preview */
            var preview = el('div', {
                className: 'bkbg-sty-editor-preview',
                style: { fontFamily: 'sans-serif', padding: '16px 0' }
            },
                chapters.map(function (ch, idx) {
                    return el('div', {
                        key: idx,
                        className: 'bkbg-sty-editor-chapter',
                        style: {
                            display: 'flex', gap: '12px', marginBottom: '16px',
                            background: '#1e1b4b', borderRadius: '10px', overflow: 'hidden'
                        }
                    },
                        /* bg preview */
                        el('div', {
                            style: {
                                width: '160px', flexShrink: 0,
                                background: ch.imageUrl ? ('url(' + ch.imageUrl + ') center/cover') : '#312e81',
                                minHeight: '120px', position: 'relative', display: 'flex',
                                alignItems: 'center', justifyContent: 'center'
                            }
                        },
                            !ch.imageUrl && el('span', { style: { color: '#a5b4fc', fontSize: '12px', textAlign: 'center', padding: '8px' } }, __('No image', 'blockenberg')),
                            el(MediaUploadCheck, {},
                                el(MediaUpload, {
                                    onSelect: function (m) { updateChapter(idx, 'imageUrl', m.url); updateChapter(idx, 'imageId', m.id); updateChapter(idx, 'imageAlt', m.alt || ''); },
                                    allowedTypes: ['image'],
                                    value: ch.imageId,
                                    render: function (ref) {
                                        return el(Button, {
                                            onClick: ref.open,
                                            variant: 'primary', isSmall: true,
                                            style: { position: 'absolute', bottom: '6px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: '11px' }
                                        }, ch.imageUrl ? '↕' : '+');
                                    }
                                })
                            )
                        ),
                        /* text fields */
                        el('div', { style: { flex: 1, padding: '12px', color: '#f3f4f6' } },
                            el(TextControl, {
                                label: __('Eyebrow', 'blockenberg'),
                                value: ch.eyebrow,
                                onChange: function (v) { updateChapter(idx, 'eyebrow', v); },
                                style: { color: '#a5b4fc' },
                                __nextHasNoMarginBottom: true
                            }),
                            el(RichText, {
                                tagName: 'h3',
                                value: ch.title,
                                onChange: function (v) { updateChapter(idx, 'title', v); },
                                placeholder: __('Chapter Title', 'blockenberg'),
                                style: { color: '#ffffff', margin: '6px 0 4px' }
                            }),
                            el(RichText, {
                                tagName: 'p',
                                value: ch.text,
                                onChange: function (v) { updateChapter(idx, 'text', v); },
                                placeholder: __('Chapter text...', 'blockenberg'),
                                style: { color: '#e5e7eb', margin: '0 0 8px' }
                            }),
                            el('div', { style: { display: 'flex', gap: '6px', alignItems: 'center' } },
                                el(RangeControl, {
                                    label: __('Overlay %', 'blockenberg'),
                                    value: ch.overlayOpacity, min: 0, max: 90,
                                    onChange: function (v) { updateChapter(idx, 'overlayOpacity', v); },
                                    style: { flex: 1 },
                                    __nextHasNoMarginBottom: true
                                }),
                                idx > 0 && el(Button, { onClick: function () { moveChapter(idx, -1); }, variant: 'tertiary', isSmall: true }, '↑'),
                                idx < chapters.length - 1 && el(Button, { onClick: function () { moveChapter(idx, 1); }, variant: 'tertiary', isSmall: true }, '↓'),
                                el(Button, {
                                    onClick: function () { removeChapter(idx); },
                                    variant: 'link', isDestructive: true, isSmall: true
                                }, __('Remove', 'blockenberg'))
                            )
                        )
                    );
                }),
                el(Button, {
                    onClick: addChapter, variant: 'primary', isSmall: true,
                    style: { marginTop: '8px' }
                }, __('+ Add Chapter', 'blockenberg'))
            );

            return el(Fragment, {},
                inspector,
                el('div', useBlockProps((function () {
                    var _tvFn = getTV();
                    var s = {};
                    Object.assign(s, _tvFn(attr.titleTypo, '--bksty-tt-'));
                    Object.assign(s, _tvFn(attr.eyebrowTypo, '--bksty-et-'));
                    Object.assign(s, _tvFn(attr.bodyTypo, '--bksty-bt-'));
                    return { style: s };
                })()), preview)
            );
        },

        save: function (props) {
            var attr = props.attributes;
            var _tvFn = getTV();
            var s = {};
            Object.assign(s, _tvFn(attr.titleTypo, '--bksty-tt-'));
            Object.assign(s, _tvFn(attr.eyebrowTypo, '--bksty-et-'));
            Object.assign(s, _tvFn(attr.bodyTypo, '--bksty-bt-'));
            return el('div', useBlockProps.save({ style: s }),
                el('div', { className: 'bkbg-sty-app', 'data-opts': JSON.stringify(attr) })
            );
        }
    });
}() );

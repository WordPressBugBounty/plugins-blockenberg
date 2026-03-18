( function () {
    var el = React.createElement;
    var __ = wp.i18n.__;
    var registerBlockType = wp.blocks.registerBlockType;
    var useBlockProps = wp.blockEditor.useBlockProps;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var MediaUpload = wp.blockEditor.MediaUpload;
    var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
    var PanelBody = wp.components.PanelBody;
    var PanelRow = wp.components.PanelRow;
    var ToggleControl = wp.components.ToggleControl;
    var RangeControl = wp.components.RangeControl;
    var SelectControl = wp.components.SelectControl;
    var Button = wp.components.Button;
    var PanelColorSettings = wp.blockEditor.PanelColorSettings;

    function getTypographyControl() {
        return (window.bkbgTypographyControl || function () { return null; });
    }

    // ── Editor-side k-means palette extractor (simplified) ──────────
    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(function (v) {
            return ('0' + Math.round(v).toString(16)).slice(-2);
        }).join('');
    }

    function hexToRgb(hex) {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
    }

    function rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;
        if (max === min) { h = s = 0; }
        else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                default: h = ((r - g) / d + 4) / 6; break;
            }
        }
        return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    }

    // Sample pixels and run k-means quantization on canvas
    function extractPalette(imgEl, numColors, quality) {
        var canvas = document.createElement('canvas');
        var scale = Math.min(1, 100 / Math.max(imgEl.naturalWidth || imgEl.width, imgEl.naturalHeight || imgEl.height));
        canvas.width  = Math.max(1, Math.floor((imgEl.naturalWidth  || imgEl.width)  * scale));
        canvas.height = Math.max(1, Math.floor((imgEl.naturalHeight || imgEl.height) * scale));
        var ctx = canvas.getContext('2d');
        ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);
        var data;
        try { data = ctx.getImageData(0, 0, canvas.width, canvas.height).data; }
        catch (e) { return null; }

        // Collect sample pixels
        var pixels = [];
        for (var i = 0; i < data.length; i += 4 * quality) {
            var a = data[i + 3];
            if (a < 128) continue;
            pixels.push([data[i], data[i + 1], data[i + 2]]);
        }
        if (pixels.length === 0) return null;

        // Simple k-means (5 iterations)
        var k = Math.min(numColors, pixels.length);
        var centroids = pixels.slice(0, k).map(function (p) { return p.slice(); });
        for (var iter = 0; iter < 5; iter++) {
            var clusters = centroids.map(function () { return []; });
            pixels.forEach(function (p) {
                var best = 0, bestD = Infinity;
                centroids.forEach(function (c, ci) {
                    var d = Math.pow(p[0]-c[0],2)+Math.pow(p[1]-c[1],2)+Math.pow(p[2]-c[2],2);
                    if (d < bestD) { bestD = d; best = ci; }
                });
                clusters[best].push(p);
            });
            clusters.forEach(function (cl, ci) {
                if (cl.length === 0) return;
                centroids[ci] = [
                    cl.reduce(function (s, p) { return s + p[0]; }, 0) / cl.length,
                    cl.reduce(function (s, p) { return s + p[1]; }, 0) / cl.length,
                    cl.reduce(function (s, p) { return s + p[2]; }, 0) / cl.length
                ];
            });
        }
        return centroids.map(function (c) {
            return { r: Math.round(c[0]), g: Math.round(c[1]), b: Math.round(c[2]) };
        });
    }

    // ── Sample swatches for editor preview when no image ────────────
    var SAMPLE_SWATCHES = ['#e74c3c','#3498db','#2ecc71','#f39c12','#9b59b6','#1abc9c'];

    // ── Swatch grid component ────────────────────────────────────────
    function SwatchGrid(props) {
        var attr = props.attr;
        var swatches = props.swatches || SAMPLE_SWATCHES;
        var size = attr.swatchSize;
        var radius = attr.swatchRadius;
        var gap = attr.swatchGap;

        var gridStyle = { display: 'flex', flexWrap: 'wrap', gap: gap + 'px', justifyContent: 'center', padding: '12px 0' };
        if (attr.layout === 'grid') {
            gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(' + attr.swatchColumns + ', 1fr)', gap: gap + 'px', padding: '12px 0' };
        } else if (attr.layout === 'list') {
            gridStyle = { display: 'flex', flexDirection: 'column', gap: gap + 'px', padding: '12px 0' };
        }

        return el('div', { style: gridStyle },
            swatches.map(function (hex, i) {
                var rgb = hexToRgb(hex.length === 7 ? hex : rgbToHex(hex.r || 0, hex.g || 0, hex.b || 0));
                var hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
                var hexVal = hex.length === 7 ? hex : rgbToHex(rgb[0], rgb[1], rgb[2]);
                var label = attr.showHexValues ? hexVal :
                            attr.showRgbValues ? 'rgb(' + rgb.join(',') + ')' :
                            attr.showHslValues ? 'hsl(' + hsl[0] + ',' + hsl[1] + '%,' + hsl[2] + '%)' : '';

                return el('div', { key: i, className: 'bkbg-ct-swatch', style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' } },
                    el('div', { style: { width: size + 'px', height: size + 'px', background: hexVal, borderRadius: radius + 'px', border: '1px solid rgba(0,0,0,.1)', boxShadow: '0 2px 8px rgba(0,0,0,.15)', cursor: attr.showCopyButton ? 'pointer' : 'default' }, title: attr.showCopyButton ? 'Copy: ' + hexVal : hexVal }),
                    (attr.showHexValues || attr.showRgbValues || attr.showHslValues) &&
                        el('span', { className: 'bkbg-ct-swatch-label', style: { color: attr.labelColor, maxWidth: size + 'px' } }, label)
                );
            })
        );
    }

    // ── Register block ───────────────────────────────────────────────
    registerBlockType('blockenberg/color-thief', {
        title: 'Color Thief',
        icon: 'art',
        category: 'bkbg-dev',

        edit: function (props) {
            var attr = props.attributes;
            var setAttr = props.setAttributes;

            var imgRef = React.useRef(null);
            var _state = React.useState(null);
            var swatches = _state[0]; var setSwatches = _state[1];

            // Extract when imageUrl changes
            React.useEffect(function () {
                if (!attr.imageUrl) { setSwatches(null); return; }
                var img = new window.Image();
                img.crossOrigin = 'anonymous';
                img.onload = function () {
                    var palette = extractPalette(img, attr.paletteSize, attr.quality);
                    if (palette) {
                        setSwatches(palette.map(function (c) { return rgbToHex(c.r, c.g, c.b); }));
                    }
                };
                img.onerror = function () { setSwatches(null); };
                img.src = attr.imageUrl;
            }, [attr.imageUrl, attr.paletteSize, attr.quality]);

            var displaySwatches = swatches || SAMPLE_SWATCHES;

            return el(React.Fragment, null,
                el(InspectorControls, null,
                    // Image
                    el(PanelBody, { title: 'Image', initialOpen: true },
                        el(MediaUploadCheck, null,
                            el(MediaUpload, {
                                onSelect: function (media) {
                                    setAttr({ imageUrl: media.url, imageId: media.id, imageAlt: media.alt || '' });
                                },
                                allowedTypes: ['image'],
                                value: attr.imageId,
                                render: function (r) {
                                    return el('div', null,
                                        attr.imageUrl
                                            ? el(Button, { variant: 'secondary', isSmall: true, onClick: r.open }, 'Change Image')
                                            : el(Button, { variant: 'primary', onClick: r.open }, 'Select Image'),
                                        attr.imageUrl && el(Button, { variant: 'tertiary', isSmall: true, isDestructive: true, style: { marginLeft: 8 }, onClick: function () { setAttr({ imageUrl: '', imageId: 0, imageAlt: '' }); setSwatches(null); } }, 'Remove')
                                    );
                                }
                            })
                        ),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Image Preview', checked: attr.showImagePreview, onChange: function (v) { setAttr({ showImagePreview: v }); } }),
                        attr.showImagePreview && el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Preview Height (px)', value: attr.imageHeight, min: 80, max: 600, onChange: function (v) { setAttr({ imageHeight: v }); } }),
                        attr.showImagePreview && el(SelectControl, { __nextHasNoMarginBottom: true, label: 'Object Fit', value: attr.imageObjectFit, options: [{value:'cover',label:'Cover'},{value:'contain',label:'Contain'},{value:'fill',label:'Fill'}], onChange: function (v) { setAttr({ imageObjectFit: v }); } })
                    ),
                    // Palette
                    el(PanelBody, { title: 'Palette Settings', initialOpen: true },
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Number of Colors', value: attr.paletteSize, min: 2, max: 12, onChange: function (v) { setAttr({ paletteSize: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Sampling Quality', help: 'Lower = more accurate, slower', value: attr.quality, min: 1, max: 20, onChange: function (v) { setAttr({ quality: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Dominant Color Banner', checked: attr.showDominant, onChange: function (v) { setAttr({ showDominant: v }); } }),
                        el(SelectControl, { __nextHasNoMarginBottom: true, label: 'Layout', value: attr.layout, options: [{value:'row',label:'Row (flex)'},{value:'grid',label:'Grid'},{value:'list',label:'List'}], onChange: function (v) { setAttr({ layout: v }); } }),
                        attr.layout === 'grid' && el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Grid Columns', value: attr.swatchColumns, min: 2, max: 12, onChange: function (v) { setAttr({ swatchColumns: v }); } })
                    ),
                    // Swatches
                    el(PanelBody, { title: 'Swatch Appearance', initialOpen: false },
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Swatch Size (px)', value: attr.swatchSize, min: 24, max: 150, onChange: function (v) { setAttr({ swatchSize: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Corner Radius (px)', value: attr.swatchRadius, min: 0, max: 60, onChange: function (v) { setAttr({ swatchRadius: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Gap (px)', value: attr.swatchGap, min: 2, max: 40, onChange: function (v) { setAttr({ swatchGap: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show Copy Button', checked: attr.showCopyButton, onChange: function (v) { setAttr({ showCopyButton: v }); } }),
                        attr.showCopyButton && el(SelectControl, { __nextHasNoMarginBottom: true, label: 'Copy Format', value: attr.copyFormat, options: [{value:'hex',label:'HEX (#rrggbb)'},{value:'rgb',label:'RGB'},{value:'hsl',label:'HSL'}], onChange: function (v) { setAttr({ copyFormat: v }); } })
                    ),
                    // Labels
                    el(PanelBody, { title: 'Color Labels', initialOpen: false },
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show HEX Values', checked: attr.showHexValues, onChange: function (v) { setAttr({ showHexValues: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show RGB Values', checked: attr.showRgbValues, onChange: function (v) { setAttr({ showRgbValues: v }); } }),
                        el(ToggleControl, { __nextHasNoMarginBottom: true, label: 'Show HSL Values', checked: attr.showHslValues, onChange: function (v) { setAttr({ showHslValues: v }); } })
                    ),
                    // Typography
                    el(PanelBody, { title: 'Typography', initialOpen: false },
                        (function () {
                            var TC = getTypographyControl();
                            return el(TC, { label: 'Label', value: attr.typoLabel || {}, onChange: function (v) { setAttr({ typoLabel: v }); } });
                        })()
                    ),
                    // Style
                    el(PanelBody, { title: 'Style', initialOpen: false },
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Block Border Radius (px)', value: attr.borderRadius, min: 0, max: 40, onChange: function (v) { setAttr({ borderRadius: v }); } }),
                        el(RangeControl, { __nextHasNoMarginBottom: true, label: 'Padding (px)', value: attr.padding, min: 0, max: 60, onChange: function (v) { setAttr({ padding: v }); } })
                    ),
                    el(PanelColorSettings, {
                        title: 'Colors',
                        initialOpen: false,
                        colorSettings: [
                            { value: attr.bgColor,     onChange: function (v) { setAttr({ bgColor:     v || '#ffffff' }); }, label: 'Background' },
                            { value: attr.labelColor,  onChange: function (v) { setAttr({ labelColor:  v || '#374151' }); }, label: 'Label Text' },
                            { value: attr.borderColor, onChange: function (v) { setAttr({ borderColor: v || '#e5e7eb' }); }, label: 'Border' }
                        ]
                    })
                ),

                // ── Editor preview ───────────────────────────────────
                el('div', useBlockProps({ className: 'bkbg-ct-editor' }),
                    el('div', {
                        style: {
                            backgroundColor: attr.bgColor,
                            borderRadius: attr.borderRadius + 'px',
                            border: '1px solid ' + attr.borderColor,
                            padding: attr.padding + 'px',
                            overflow: 'hidden'
                        }
                    },
                        attr.showImagePreview && el('div', { style: { marginBottom: '12px', borderRadius: (attr.borderRadius > 4 ? attr.borderRadius - 4 : 0) + 'px', overflow: 'hidden' } },
                            attr.imageUrl
                                ? el('img', { src: attr.imageUrl, alt: attr.imageAlt, style: { width: '100%', height: attr.imageHeight + 'px', objectFit: attr.imageObjectFit, display: 'block' } })
                                : el('div', { style: { width: '100%', height: attr.imageHeight + 'px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' } }, '📷 Select an image to extract its palette')
                        ),
                        attr.showDominant && displaySwatches.length > 0 &&
                            el('div', { style: { height: '32px', background: displaySwatches[0], borderRadius: '6px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                                el('span', { style: { color: '#fff', fontSize: '11px', fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,.5)' } }, 'DOMINANT')
                            ),
                        !attr.imageUrl && el('div', { style: { textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginBottom: '8px' } }, 'Sample palette — upload an image to see real colors'),
                        el(SwatchGrid, { attr: attr, swatches: displaySwatches })
                    )
                )
            );
        },

        save: function (props) {
            var attr = props.attributes;
            return el('div', useBlockProps.save(),
                el('div', {
                    className: 'bkbg-ct-app',
                    'data-opts': JSON.stringify(attr)
                })
            );
        }
    });
}() );

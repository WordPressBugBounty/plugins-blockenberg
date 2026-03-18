(function () {
    'use strict';

    var _typoKeys = {
        family:'font-family', weight:'font-weight', style:'font-style',
        transform:'text-transform', decoration:'text-decoration',
        sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
        lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
        letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
        wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
    };
    var _typoUnits = { size:'sizeUnit', lineHeight:'lineHeightUnit', letterSpacing:'letterSpacingUnit', wordSpacing:'wordSpacingUnit' };
    var _typoUnitDefaults = { size:'px', lineHeight:'', letterSpacing:'px', wordSpacing:'px' };
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        Object.keys(_typoKeys).forEach(function (k) {
            var v = obj[k]; if (v === undefined || v === '') return;
            var prop = _typoKeys[k];
            var base = k.replace(/Desktop|Tablet|Mobile/, '');
            var uKey = _typoUnits[base];
            if (uKey && typeof v === 'number') v = v + (obj[uKey] || _typoUnitDefaults[base] || '');
            el.style.setProperty(prefix + prop, v);
        });
    }

    // ── Colour utilities ─────────────────────────────────────────────
    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(function (v) {
            return ('0' + Math.round(v).toString(16)).slice(-2);
        }).join('');
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

    // ── K-means palette extraction ───────────────────────────────────
    function extractPalette(img, numColors, quality) {
        var canvas = document.createElement('canvas');
        var scale = Math.min(1, 150 / Math.max(img.naturalWidth, img.naturalHeight, 1));
        canvas.width  = Math.max(1, Math.floor(img.naturalWidth  * scale));
        canvas.height = Math.max(1, Math.floor(img.naturalHeight * scale));
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        var data;
        try { data = ctx.getImageData(0, 0, canvas.width, canvas.height).data; }
        catch (e) { return null; } // CORS

        var pixels = [];
        for (var i = 0; i < data.length; i += 4 * (quality || 10)) {
            if (data[i + 3] < 128) continue;
            pixels.push([data[i], data[i + 1], data[i + 2]]);
        }
        if (pixels.length < numColors) return null;

        // K-means
        var k = Math.min(numColors, pixels.length);
        var centroids = [];
        for (var ci = 0; ci < k; ci++) {
            var idx = Math.floor((ci / k) * pixels.length);
            centroids.push(pixels[idx].slice());
        }

        for (var iter = 0; iter < 8; iter++) {
            var clusters = centroids.map(function () { return []; });
            pixels.forEach(function (p) {
                var best = 0, bestD = Infinity;
                centroids.forEach(function (c, j) {
                    var d = (p[0]-c[0])*(p[0]-c[0]) + (p[1]-c[1])*(p[1]-c[1]) + (p[2]-c[2])*(p[2]-c[2]);
                    if (d < bestD) { bestD = d; best = j; }
                });
                clusters[best].push(p);
            });
            var changed = false;
            clusters.forEach(function (cl, j) {
                if (!cl.length) return;
                var nr = cl.reduce(function (s, p) { return s + p[0]; }, 0) / cl.length;
                var ng = cl.reduce(function (s, p) { return s + p[1]; }, 0) / cl.length;
                var nb = cl.reduce(function (s, p) { return s + p[2]; }, 0) / cl.length;
                if (Math.abs(nr - centroids[j][0]) + Math.abs(ng - centroids[j][1]) + Math.abs(nb - centroids[j][2]) > 1) changed = true;
                centroids[j] = [nr, ng, nb];
            });
            if (!changed) break;
        }

        return centroids.map(function (c) {
            return { r: Math.round(c[0]), g: Math.round(c[1]), b: Math.round(c[2]) };
        });
    }

    // ── Copy to clipboard helper ─────────────────────────────────────
    function copyText(txt) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(txt).catch(function () {});
        } else {
            var ta = document.createElement('textarea');
            ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
            document.body.appendChild(ta); ta.select();
            try { document.execCommand('copy'); } catch (e) {}
            document.body.removeChild(ta);
        }
    }

    // ── Init one block ───────────────────────────────────────────────
    function initColorThief(appEl) {
        var raw = appEl.dataset.opts;
        if (!raw) return;
        var opts;
        try { opts = JSON.parse(raw); } catch (e) { return; }

        // Set typography CSS vars on the parent wrapper
        var parentWrap = appEl.closest('.wp-block-blockenberg-color-thief') || appEl.parentElement;
        if (parentWrap) {
            typoCssVarsForEl(parentWrap, opts.typoLabel, '--bkbg-cth-lb-');
        }

        var size      = opts.swatchSize   || 60;
        var radius    = opts.swatchRadius || 8;
        var gap       = opts.swatchGap    || 8;
        var numColors = opts.paletteSize  || 6;
        var quality   = opts.quality      || 10;
        var layout    = opts.layout       || 'row';
        var copyFmt   = opts.copyFormat   || 'hex';
        var padding   = opts.padding      || 20;
        var domRadius = opts.borderRadius || 12;

        // Build containing block
        var block = document.createElement('div');
        block.style.backgroundColor = opts.bgColor || '#ffffff';
        block.style.borderRadius = domRadius + 'px';
        block.style.border = '1px solid ' + (opts.borderColor || '#e5e7eb');
        block.style.padding = padding + 'px';
        block.style.overflow = 'hidden';

        // Image preview
        var imgEl = null;
        if (opts.showImagePreview && opts.imageUrl) {
            var imgWrap = document.createElement('div');
            imgWrap.className = 'bkbg-ct-image-wrap';
            imgWrap.style.borderRadius = Math.max(0, domRadius - 4) + 'px';
            imgEl = document.createElement('img');
            imgEl.src = opts.imageUrl;
            imgEl.alt = opts.imageAlt || '';
            imgEl.crossOrigin = 'anonymous';
            imgEl.style.height = (opts.imageHeight || 200) + 'px';
            imgEl.style.objectFit = opts.imageObjectFit || 'cover';
            imgWrap.appendChild(imgEl);
            block.appendChild(imgWrap);
        }

        var placeholderEl = null;
        if (!opts.imageUrl) {
            placeholderEl = document.createElement('div');
            placeholderEl.style.cssText = 'padding:24px;text-align:center;color:#9ca3af;';
            placeholderEl.textContent = 'No image selected.';
            block.appendChild(placeholderEl);
        }

        appEl.parentNode.replaceChild(block, appEl);
        if (!opts.imageUrl) return;

        // Process after image loads
        function process(img) {
            var palette = extractPalette(img, numColors, quality);
            if (!palette || !palette.length) {
                var errEl = document.createElement('div');
                errEl.style.cssText = 'color:#ef4444;font-size:13px;padding:8px;';
                errEl.textContent = '⚠ Could not extract palette. Image may have CORS restrictions.';
                block.appendChild(errEl);
                return;
            }

            // Dominant colour banner
            if (opts.showDominant) {
                var dom = palette[0];
                var domEl = document.createElement('div');
                domEl.className = 'bkbg-ct-dominant';
                domEl.style.background = rgbToHex(dom.r, dom.g, dom.b);
                domEl.textContent = 'DOMINANT: ' + rgbToHex(dom.r, dom.g, dom.b).toUpperCase();
                block.appendChild(domEl);
            }

            // Swatch container
            var swatchesEl = document.createElement('div');
            swatchesEl.className = 'bkbg-ct-swatches' + (layout === 'list' ? ' bkbg-ct-list' : '');
            if (layout === 'grid') {
                swatchesEl.style.display = 'grid';
                swatchesEl.style.gridTemplateColumns = 'repeat(' + (opts.swatchColumns || 6) + ', 1fr)';
                swatchesEl.style.gap = gap + 'px';
            } else if (layout === 'list') {
                swatchesEl.style.display = 'flex';
                swatchesEl.style.flexDirection = 'column';
                swatchesEl.style.gap = gap + 'px';
            } else {
                swatchesEl.style.display = 'flex';
                swatchesEl.style.flexWrap = 'wrap';
                swatchesEl.style.gap = gap + 'px';
                swatchesEl.style.justifyContent = 'center';
            }

            palette.forEach(function (c) {
                var hex = rgbToHex(c.r, c.g, c.b);
                var rgb = [c.r, c.g, c.b];
                var hsl = rgbToHsl(c.r, c.g, c.b);
                var hexLabel  = hex.toUpperCase();
                var rgbLabel  = 'rgb(' + rgb.join(', ') + ')';
                var hslLabel  = 'hsl(' + hsl[0] + ', ' + hsl[1] + '%, ' + hsl[2] + '%)';
                var copyValue = copyFmt === 'rgb' ? rgbLabel : copyFmt === 'hsl' ? hslLabel : hexLabel;
                var displayLabel = opts.showHexValues ? hexLabel : opts.showRgbValues ? rgbLabel : opts.showHslValues ? hslLabel : '';

                if (layout === 'list') {
                    var item = document.createElement('div');
                    item.className = 'bkbg-ct-list-item';

                    var chip = document.createElement('div');
                    chip.className = 'bkbg-ct-swatch-color';
                    chip.style.width = '40px'; chip.style.height = '40px';
                    chip.style.borderRadius = radius + 'px';
                    chip.style.background = hex;
                    chip.style.flexShrink = '0';
                    item.appendChild(chip);

                    var info = document.createElement('div');
                    info.className = 'bkbg-ct-list-info';
                    info.style.color = opts.labelColor || '#374151';
                    if (opts.showHexValues) { var hl = document.createElement('span'); hl.style.fontFamily = 'monospace'; hl.textContent = hexLabel; info.appendChild(hl); }
                    if (opts.showRgbValues) { var rl = document.createElement('span'); rl.style.fontFamily = 'monospace'; rl.textContent = rgbLabel; info.appendChild(rl); }
                    if (opts.showHslValues) { var sl = document.createElement('span'); sl.style.fontFamily = 'monospace'; sl.textContent = hslLabel; info.appendChild(sl); }
                    item.appendChild(info);

                    if (opts.showCopyButton) {
                        var btn = document.createElement('button');
                        btn.className = 'bkbg-ct-copy-btn';
                        btn.style.color = opts.labelColor || '#374151';
                        btn.textContent = 'Copy';
                        btn.addEventListener('click', function () {
                            copyText(copyValue);
                            btn.textContent = 'Copied!';
                            setTimeout(function () { btn.textContent = 'Copy'; }, 1500);
                        });
                        item.appendChild(btn);
                    }

                    swatchesEl.appendChild(item);
                } else {
                    var swatch = document.createElement('div');
                    swatch.className = 'bkbg-ct-swatch';

                    var colorBox = document.createElement('div');
                    colorBox.className = 'bkbg-ct-swatch-color' + (opts.showCopyButton ? ' bkbg-ct-copyable' : '');
                    colorBox.style.width = size + 'px';
                    colorBox.style.height = size + 'px';
                    colorBox.style.borderRadius = radius + 'px';
                    colorBox.style.background = hex;
                    colorBox.title = copyValue;

                    if (opts.showCopyButton) {
                        colorBox.addEventListener('click', function () {
                            copyText(copyValue);
                            colorBox.classList.add('bkbg-ct-copied');
                            setTimeout(function () { colorBox.classList.remove('bkbg-ct-copied'); }, 1200);
                        });
                    }

                    swatch.appendChild(colorBox);

                    if (displayLabel) {
                        var labelEl = document.createElement('span');
                        labelEl.className = 'bkbg-ct-swatch-label';
                        labelEl.style.color = opts.labelColor || '#374151';
                        labelEl.style.maxWidth = size + 'px';
                        labelEl.textContent = displayLabel;
                        swatch.appendChild(labelEl);
                    }

                    swatchesEl.appendChild(swatch);
                }
            });

            block.appendChild(swatchesEl);
        }

        // Load image
        if (imgEl) {
            if (imgEl.complete && imgEl.naturalWidth > 0) {
                process(imgEl);
            } else {
                imgEl.addEventListener('load', function () { process(imgEl); });
                imgEl.addEventListener('error', function () {
                    // Try without crossOrigin for non-CORS servers
                    var img2 = new Image();
                    img2.onload = function () { process(img2); };
                    img2.onerror = function () {};
                    img2.src = opts.imageUrl;
                });
            }
        } else if (opts.imageUrl && !opts.showImagePreview) {
            // Load hidden canvas image for palette extraction only
            var hiddenImg = new Image();
            hiddenImg.crossOrigin = 'anonymous';
            hiddenImg.onload = function () { process(hiddenImg); };
            hiddenImg.onerror = function () {};
            hiddenImg.src = opts.imageUrl;
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.bkbg-ct-app').forEach(initColorThief);
    });

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        document.querySelectorAll('.bkbg-ct-app').forEach(initColorThief);
    }
})();

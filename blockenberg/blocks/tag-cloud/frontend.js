/* Tag Cloud — frontend */
(function () {
    function colorAt(index, multiColors, primary) {
        if (!multiColors) { return primary; }
        var cols = multiColors.split(',').map(function (c) { return c.trim(); }).filter(Boolean);
        return cols[index % cols.length] || primary;
    }

    function buildTagElement(label, url, fontSize, bg, textColor, border, paddingX, paddingY, borderRadius, fontWeight, lineHeight) {
        var a = document.createElement('a');
        a.className = 'bktagcl-tag';
        a.href = url || '#';
        a.textContent = label;
        a.style.cssText = [
            'font-size:' + fontSize + 'px',
            'padding:' + paddingY + 'px ' + paddingX + 'px',
            'border-radius:' + borderRadius + 'px',
            'background:' + bg,
            'color:' + textColor,
            'border:' + border,
            'display:inline-block',
        ].join(';');
        return a;
    }

    function getTagParams(wrap) {
        var cs = getComputedStyle(wrap);
        return {
            source:      wrap.getAttribute('data-source') || 'custom',
            max:         parseInt(wrap.getAttribute('data-max'), 10) || 20,
            sort:        wrap.getAttribute('data-sort') || 'input',
            showCount:   wrap.getAttribute('data-count') === '1',
            hoverBg:     wrap.getAttribute('data-hover-bg') || '',
            hoverText:   wrap.getAttribute('data-hover-text') || '',
            animate:     wrap.getAttribute('data-animate') === '1',
            tagStyle:    wrap.getAttribute('data-tag-style') || 'rounded',
            colorMode:   wrap.getAttribute('data-color-mode') || 'single',
            primary:     wrap.getAttribute('data-primary') || '#6c3fb5',
            secondary:   wrap.getAttribute('data-secondary') || '#a855f7',
            multiColors: wrap.getAttribute('data-multi-colors') || '',
            textColor:   wrap.getAttribute('data-text-color') || '#ffffff',
            borderColor: wrap.getAttribute('data-border-color') || '#6c3fb5',
            borderWidth: parseInt(wrap.getAttribute('data-border-width'), 10) || 1,
            fontSizeMin: parseInt(wrap.getAttribute('data-fs-min'), 10) || 13,
            fontSizeMax: parseInt(wrap.getAttribute('data-fs-max'), 10) || 22,
            fontWeight:  wrap.getAttribute('data-font-weight') || '500',
            lineHeight:  parseFloat(wrap.getAttribute('data-line-height')) || 1.4,
            paddingX:    parseInt(wrap.getAttribute('data-px'), 10) || 14,
            paddingY:    parseInt(wrap.getAttribute('data-py'), 10) || 7,
            bdRadius:    parseInt(wrap.getAttribute('data-br'), 10) || 6,
        };
    }

    function renderTags(wrap, rawTags, params) {
        wrap.innerHTML = '';
        var tags = rawTags.slice(0, params.max);

        // sort
        if (params.sort === 'alpha') {
            tags.sort(function (a, b) { return a.label.localeCompare(b.label); });
        } else if (params.sort === 'size') {
            tags.sort(function (a, b) { return b.weight - a.weight; });
        }

        tags.forEach(function (tag, idx) {
            var weight = tag.weight || 1;
            var fs = Math.round(params.fontSizeMin + ((weight - 1) / 4) * (params.fontSizeMax - params.fontSizeMin));
            var isGrad = params.colorMode === 'gradient';
            var col = params.colorMode === 'multi' ? colorAt(idx, params.multiColors, params.primary) : params.primary;
            var br = params.tagStyle === 'pill' ? 9999 : params.bdRadius;

            var bg, textCol, border;
            if (params.tagStyle === 'flat') {
                bg = 'none'; textCol = col; border = 'none';
            } else if (params.tagStyle === 'outlined') {
                bg = 'transparent'; textCol = col; border = params.borderWidth + 'px solid ' + col;
            } else {
                bg = isGrad ? ('linear-gradient(135deg,' + params.primary + ',' + params.secondary + ')') : col;
                textCol = params.textColor;
                border = 'none';
            }

            var a = buildTagElement(
                params.showCount && tag.count !== undefined ? tag.label + ' (' + tag.count + ')' : tag.label,
                tag.url, fs, bg, textCol, border,
                params.paddingX, params.paddingY, br, params.fontWeight, params.lineHeight
            );

            wrap.appendChild(a);
        });

        // write CSS vars for hover
        if (params.hoverBg) {
            wrap.style.setProperty('--bktagcl-hover-bg', params.hoverBg);
            wrap.style.setProperty('--bktagcl-hover-text', params.hoverText);
        }
    }

    function init() {
        document.querySelectorAll('.bktagcl-wrap').forEach(function (wrap) {
            if (wrap._bktagclInit) { return; }
            wrap._bktagclInit = true;

            var source = wrap.getAttribute('data-source') || 'custom';
            var params = getTagParams(wrap);

            if (source === 'wp-tags') {
                var max = params.max;
                var apiBase = (window.wpApiSettings && window.wpApiSettings.root)
                    ? window.wpApiSettings.root.replace(/\/$/, '')
                    : '/wp-json';
                var url = apiBase + '/wp/v2/tags?per_page=' + max + '&orderby=count&order=desc&_fields=id,name,count,link';

                fetch(url)
                    .then(function (r) { return r.json(); })
                    .then(function (data) {
                        var maxCount = data.reduce(function (m, t) { return Math.max(m, t.count || 1); }, 1);
                        var minCount = data.reduce(function (m, t) { return Math.min(m, t.count || 1); }, maxCount);

                        var tags = data.map(function (t) {
                            // map count → weight 1-5
                            var range = maxCount - minCount || 1;
                            var weight = Math.round(((t.count - minCount) / range) * 4) + 1;
                            return { label: t.name, url: t.link, weight: weight, count: t.count };
                        });

                        renderTags(wrap, tags, params);
                    })
                    .catch(function () {
                        wrap.textContent = 'Could not load tags.';
                    });
            } else {
                // custom: inline styles already set by save(), just apply CSS vars
                if (params.hoverBg) {
                    wrap.style.setProperty('--bktagcl-hover-bg', params.hoverBg);
                    wrap.style.setProperty('--bktagcl-hover-text', params.hoverText);
                }
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());

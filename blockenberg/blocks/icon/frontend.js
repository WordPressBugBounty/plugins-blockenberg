(function () {
    var typoMap = [
        ['family','font-family'],['weight','font-weight'],['style','font-style'],
        ['decoration','text-decoration'],['transform','text-transform'],
        ['sizeDesktop','font-size-d'],['sizeTablet','font-size-t'],['sizeMobile','font-size-m'],
        ['lineHeightDesktop','line-height-d'],['lineHeightTablet','line-height-t'],['lineHeightMobile','line-height-m'],
        ['letterSpacingDesktop','letter-spacing-d'],['letterSpacingTablet','letter-spacing-t'],['letterSpacingMobile','letter-spacing-m'],
        ['wordSpacingDesktop','word-spacing-d'],['wordSpacingTablet','word-spacing-t'],['wordSpacingMobile','word-spacing-m']
    ];
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        for (var i = 0; i < typoMap.length; i++) {
            var v = typo[typoMap[i][0]];
            if (v !== undefined && v !== '' && v !== null) el.style.setProperty(prefix + typoMap[i][1], String(v));
        }
    }

    function init() {
        document.querySelectorAll('.bkbg-icon-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                icon: '⭐',
                shape: 'circle',
                iconSize: 48,
                bgSize: 96,
                showBg: true,
                borderWidth: 0,
                shadow: false,
                animation: 'none',
                align: 'center',
                label: '',
                showLabel: false,
                subLabel: '',
                showSubLabel: false,
                linkUrl: '',
                linkNewTab: false,
                containerBg: '',
                bgColor: '#6366f1',
                borderColor: '#6366f1',
                labelColor: '#111827',
                subLabelColor: '#6b7280',
                containerPadding: 16,
                gap: 10,
                labelSize: 16,
                subLabelSize: 13,
            }, opts);

            var alignItems = o.align === 'left' ? 'flex-start' : o.align === 'right' ? 'flex-end' : 'center';
            var textAlign = o.align;

            var wrap = document.createElement('div');
            wrap.className = 'bkbg-icon-wrap';
            wrap.style.display = 'flex';
            wrap.style.flexDirection = 'column';
            wrap.style.alignItems = alignItems;
            wrap.style.gap = o.gap + 'px';
            wrap.style.padding = o.containerPadding + 'px';
            if (o.containerBg) wrap.style.background = o.containerBg;

            typoCssVarsForEl(o.labelTypo, '--bkbg-ico-lb-', wrap);
            typoCssVarsForEl(o.subLabelTypo, '--bkbg-ico-sl-', wrap);
            wrap.style.setProperty('--bkbg-ico-lb-sz', (o.labelSize || 16) + 'px');
            wrap.style.setProperty('--bkbg-ico-lb-fw', o.labelFontWeight || '600');
            wrap.style.setProperty('--bkbg-ico-lb-lh', String(o.labelLineHeight || 1.3));
            wrap.style.setProperty('--bkbg-ico-sl-sz', (o.subLabelSize || 13) + 'px');
            wrap.style.setProperty('--bkbg-ico-sl-fw', o.subLabelFontWeight || '400');
            wrap.style.setProperty('--bkbg-ico-sl-lh', String(o.subLabelLineHeight || 1.4));

            // Shape styles
            var borderRadius = o.shape === 'circle' ? '50%'
                             : o.shape === 'square' ? '4px'
                             : o.shape === 'rounded' ? '16px'
                             : o.shape === 'pill' ? '999px'
                             : '0';

            var shapeEl = document.createElement('div');
            shapeEl.className = 'bkbg-icon-shape bkbg-icon-anim-' + o.animation;
            shapeEl.style.display = 'inline-flex';
            shapeEl.style.alignItems = 'center';
            shapeEl.style.justifyContent = 'center';
            shapeEl.style.fontSize = o.iconSize + 'px';
            shapeEl.style.lineHeight = '1';

            if (o.shape !== 'none' && o.showBg) {
                shapeEl.style.width = o.bgSize + 'px';
                shapeEl.style.height = o.bgSize + 'px';
                shapeEl.style.borderRadius = borderRadius;
                shapeEl.style.background = o.bgColor;
                if (o.borderWidth > 0) {
                    shapeEl.style.border = o.borderWidth + 'px solid ' + o.borderColor;
                }
                if (o.shadow) {
                    shapeEl.style.boxShadow = '0 8px 24px rgba(0,0,0,0.18)';
                }
            } else if (o.shape !== 'none') {
                shapeEl.style.borderRadius = borderRadius;
                shapeEl.style.padding = '8px';
                if (o.borderWidth > 0) {
                    shapeEl.style.border = o.borderWidth + 'px solid ' + o.borderColor;
                }
            }

            var iconSpan = document.createElement('span');
            iconSpan.textContent = o.icon;
            iconSpan.style.display = 'block';
            iconSpan.style.lineHeight = '1';
            shapeEl.appendChild(iconSpan);

            var iconContainer = shapeEl;

            // Wrap in link if needed
            if (o.linkUrl) {
                var linkEl = document.createElement('a');
                linkEl.href = o.linkUrl;
                linkEl.className = 'bkbg-icon-link';
                if (o.linkNewTab) {
                    linkEl.target = '_blank';
                    linkEl.rel = 'noopener noreferrer';
                }
                linkEl.appendChild(shapeEl);
                iconContainer = linkEl;
            }
            wrap.appendChild(iconContainer);

            // Label
            if (o.showLabel && o.label) {
                var labelEl = document.createElement('div');
                labelEl.className = 'bkbg-icon-label';
                labelEl.textContent = o.label;
                labelEl.style.color = o.labelColor;
                labelEl.style.textAlign = textAlign;
                wrap.appendChild(labelEl);
            }

            // Sub-label
            if (o.showSubLabel && o.subLabel) {
                var subEl = document.createElement('div');
                subEl.className = 'bkbg-icon-sublabel';
                subEl.textContent = o.subLabel;
                subEl.style.color = o.subLabelColor;
                subEl.style.textAlign = textAlign;
                wrap.appendChild(subEl);
            }

            appEl.parentNode.insertBefore(wrap, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();

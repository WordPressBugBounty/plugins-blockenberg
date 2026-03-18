(function () {
    function appleIcon(color) {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '28'); svg.setAttribute('height', '28'); svg.setAttribute('viewBox', '0 0 24 24');
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('fill', color);
        path.setAttribute('d', 'M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z');
        svg.appendChild(path);
        return svg;
    }

    function googleIcon() {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '28'); svg.setAttribute('height', '28'); svg.setAttribute('viewBox', '0 0 24 24');
        var paths = [
            { d: 'M3.18 23.76A2 2 0 0 1 2 22V2A2 2 0 0 1 3.18.24L13.26 10.3l-10.08 13.46z', fill: '#4285F4' },
            { d: 'M16.93 13.97l-3.67-3.67 3.67-3.67 4.1 2.36a2.05 2.05 0 0 1 0 2.62l-4.1 2.36z', fill: '#FBBC04' },
            { d: 'M3.18.24L13.26 10.3l3.67-3.67L4.96.3A2.1 2.1 0 0 0 3.18.24z', fill: '#34A853' },
            { d: 'M3.18 23.76L13.26 13.7l3.67 3.67-11.97 6.33c-.6.31-1.32.27-1.78-.24z', fill: '#EA4335' }
        ];
        paths.forEach(function (p) {
            var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', p.d);
            path.setAttribute('fill', p.fill);
            svg.appendChild(path);
        });
        return svg;
    }

    function buildBadge(href, icon, smallText, bigText, style) {
        var a = document.createElement('a');
        a.href = href;
        a.className = 'bkbg-app-dl-badge ' + style;
        a.target = '_blank';
        a.rel = 'noopener';
        a.appendChild(icon);
        var textDiv = document.createElement('div');
        var s = document.createElement('div');
        s.className = 'bkbg-app-dl-badge-small';
        s.style.color = style === 'black' ? '#fff' : '#555';
        s.textContent = smallText;
        var b = document.createElement('div');
        b.className = 'bkbg-app-dl-badge-big';
        b.style.color = style === 'black' ? '#fff' : '#000';
        b.textContent = bigText;
        textDiv.appendChild(s);
        textDiv.appendChild(b);
        a.appendChild(textDiv);
        return a;
    }

    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var map = {
            family:'font-family', weight:'font-weight', style:'font-style',
            decoration:'text-decoration', transform:'text-transform',
            sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
            lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
            letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
            wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
        };
        Object.keys(map).forEach(function(k) {
            if (typo[k] !== undefined && typo[k] !== '') {
                var v = typo[k];
                if (['sizeDesktop','sizeTablet','sizeMobile'].indexOf(k) !== -1) v = v + (typo.sizeUnit || 'px');
                else if (['lineHeightDesktop','lineHeightTablet','lineHeightMobile'].indexOf(k) !== -1) v = v + (typo.lineHeightUnit || '');
                else if (['letterSpacingDesktop','letterSpacingTablet','letterSpacingMobile'].indexOf(k) !== -1) v = v + (typo.letterSpacingUnit || 'px');
                else if (['wordSpacingDesktop','wordSpacingTablet','wordSpacingMobile'].indexOf(k) !== -1) v = v + (typo.wordSpacingUnit || 'px');
                el.style.setProperty(prefix + map[k], String(v));
            }
        });
    }

    document.querySelectorAll('.bkbg-app-download-app').forEach(function (root) {
        var opts = {};
        try { opts = JSON.parse(root.dataset.opts || '{}'); } catch (e) {}

        var bg = opts.bgGradient || opts.bgColor || '#0f172a';
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-app-download-wrap';
        wrap.style.cssText = 'background:' + bg + ';padding:' + (opts.paddingTop || 80) + 'px 40px ' + (opts.paddingBottom || 80) + 'px;';
        typoCssVarsForEl(opts.headingTypo, '--bkbg-ad-heading-', wrap);
        typoCssVarsForEl(opts.bodyTypo, '--bkbg-ad-body-', wrap);
        if (opts.headingSize && opts.headingSize !== 44) wrap.style.setProperty('--bkbg-ad-heading-sz', opts.headingSize + 'px');
        if (opts.textSize && opts.textSize !== 18) wrap.style.setProperty('--bkbg-ad-body-sz', opts.textSize + 'px');

        var inner = document.createElement('div');
        inner.className = 'bkbg-app-dl-inner';
        inner.style.setProperty('--bkbg-ad-max-width', (opts.maxWidth || 1200) + 'px');

        var grid = document.createElement('div');
        grid.className = 'bkbg-app-dl-grid' + (opts.layout === 'centered' ? ' centered' : '');

        // Text column
        var textCol = document.createElement('div');
        textCol.className = 'bkbg-app-dl-text';
        textCol.style.order = opts.imageLayout === 'right' ? '0' : '1';

        if (opts.showTag !== false && opts.tag) {
            var tag = document.createElement('span');
            tag.className = 'bkbg-app-dl-tag';
            tag.style.cssText = 'background:' + (opts.tagBg || 'rgba(255,255,255,.1)') + ';color:' + (opts.tagColor || '#fff') + ';';
            tag.textContent = opts.tag;
            textCol.appendChild(tag);
        }

        var h2 = document.createElement('h2');
        h2.className = 'bkbg-app-dl-heading';
        h2.style.color = opts.headingColor || '#fff';
        h2.innerHTML = opts.heading || '';
        textCol.appendChild(h2);

        var p = document.createElement('p');
        p.className = 'bkbg-app-dl-body';
        p.style.color = opts.textColor || '#94a3b8';
        p.innerHTML = opts.subtext || '';
        textCol.appendChild(p);

        if (opts.showRating) {
            var ratingRow = document.createElement('div');
            ratingRow.className = 'bkbg-app-dl-rating';
            var stars = document.createElement('div');
            stars.className = 'bkbg-app-dl-stars';
            stars.style.color = opts.starColor || '#f59e0b';
            stars.textContent = '★★★★★';
            var ratingText = document.createElement('div');
            ratingText.className = 'bkbg-app-dl-rating-text';
            ratingText.style.color = opts.textColor || '#94a3b8';
            ratingText.textContent = (opts.rating || '4.9') + ' · ' + (opts.ratingCount || '');
            ratingRow.appendChild(stars);
            ratingRow.appendChild(ratingText);
            textCol.appendChild(ratingRow);
        }

        if (opts.showApple || opts.showGoogle) {
            var badgeRow = document.createElement('div');
            badgeRow.className = 'bkbg-app-dl-badges';
            var bs = opts.badgeStyle || 'black';
            if (opts.showApple) badgeRow.appendChild(buildBadge(opts.appleUrl || '#', appleIcon(bs === 'black' ? '#fff' : '#000'), 'Download on the', 'App Store', bs));
            if (opts.showGoogle) badgeRow.appendChild(buildBadge(opts.googleUrl || '#', googleIcon(), 'GET IT ON', 'Google Play', bs));
            textCol.appendChild(badgeRow);
        }

        grid.appendChild(textCol);

        // Device image column
        if (opts.layout !== 'centered' && opts.deviceImageUrl) {
            var devCol = document.createElement('div');
            devCol.className = 'bkbg-app-dl-device-col';
            devCol.style.order = opts.imageLayout === 'right' ? '1' : '0';
            var img = document.createElement('img');
            img.src = opts.deviceImageUrl;
            img.alt = opts.deviceAlt || '';
            devCol.appendChild(img);
            grid.appendChild(devCol);
        }

        inner.appendChild(grid);
        wrap.appendChild(inner);
        root.parentNode.replaceChild(wrap, root);
    });
})();

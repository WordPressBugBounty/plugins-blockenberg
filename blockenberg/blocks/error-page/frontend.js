(function () {
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var m = {
            family: 'font-family', weight: 'font-weight', transform: 'text-transform',
            style: 'font-style', decoration: 'text-decoration',
            sizeDesktop: 'font-size-d', sizeTablet: 'font-size-t', sizeMobile: 'font-size-m',
            lineHeightDesktop: 'line-height-d', lineHeightTablet: 'line-height-t', lineHeightMobile: 'line-height-m',
            letterSpacingDesktop: 'letter-spacing-d', letterSpacingTablet: 'letter-spacing-t', letterSpacingMobile: 'letter-spacing-m',
            wordSpacingDesktop: 'word-spacing-d', wordSpacingTablet: 'word-spacing-t', wordSpacingMobile: 'word-spacing-m'
        };
        var units = { size: 'sizeUnit', lineHeight: 'lineHeightUnit', letterSpacing: 'letterSpacingUnit', wordSpacing: 'wordSpacingUnit' };
        Object.keys(m).forEach(function (k) {
            var v = typo[k]; if (v === undefined || v === '' || v === null) return;
            var prop = prefix + m[k];
            var base = k.replace(/Desktop|Tablet|Mobile/, '');
            if (units[base] && typeof v === 'number') v = v + (typo[units[base]] || 'px');
            el.style.setProperty(prop, String(v));
        });
    }

    document.querySelectorAll('.bkbg-error-page-app').forEach(function (root) {
        var opts = {};
        try { opts = JSON.parse(root.dataset.opts || '{}'); } catch (e) {}

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-error-page-wrap';
        wrap.style.cssText = 'background:' + (opts.bgColor || '#ffffff') + ';padding:' + (opts.paddingTop || 100) + 'px 40px ' + (opts.paddingBottom || 100) + 'px;';
        wrap.style.setProperty('--bkbg-ep-max', (opts.maxWidth || 700) + 'px');

        typoCssVarsForEl(opts.typoCode || {}, '--bkbg-ep-cd-', wrap);
        typoCssVarsForEl(opts.typoHeading || {}, '--bkbg-ep-hd-', wrap);
        typoCssVarsForEl(opts.typoBody || {}, '--bkbg-ep-bd-', wrap);

        var inner = document.createElement('div');
        inner.className = 'bkbg-ep-inner';

        if (opts.showImage && opts.imageUrl) {
            var illus = document.createElement('div');
            illus.className = 'bkbg-ep-illustration';
            var img = document.createElement('img');
            img.src = opts.imageUrl;
            img.alt = opts.imageAlt || '';
            img.style.width = (opts.imageWidth || 360) + 'px';
            illus.appendChild(img);
            inner.appendChild(illus);
        }

        if (opts.showError !== false && opts.errorCode) {
            var code = document.createElement('div');
            code.className = 'bkbg-ep-code';
            code.style.color = opts.errorCodeColor || '#f3f0ff';
            code.textContent = opts.errorCode;
            inner.appendChild(code);
        }

        var h1 = document.createElement('h1');
        h1.className = 'bkbg-ep-heading';
        h1.style.color = opts.headingColor || '#111827';
        h1.innerHTML = opts.heading || '';
        inner.appendChild(h1);

        var p = document.createElement('p');
        p.className = 'bkbg-ep-body';
        p.style.color = opts.textColor || '#6b7280';
        p.innerHTML = opts.subtext || '';
        inner.appendChild(p);

        if (opts.showSearch) {
            var searchDiv = document.createElement('div');
            searchDiv.className = 'bkbg-ep-search';
            var searchInput = document.createElement('input');
            searchInput.type = 'search';
            searchInput.name = 's';
            searchInput.placeholder = 'Search\u2026';
            var searchBtn = document.createElement('button');
            searchBtn.style.cssText = 'background:' + (opts.primaryBg || '#7c3aed') + ';color:' + (opts.primaryColor || '#fff') + ';';
            searchBtn.textContent = 'Search';
            searchDiv.appendChild(searchInput);
            searchDiv.appendChild(searchBtn);
            var searchForm = document.createElement('form');
            searchForm.action = '/';
            searchForm.method = 'get';
            searchForm.className = 'bkbg-ep-search';
            searchForm.appendChild(searchInput);
            searchForm.appendChild(searchBtn);
            inner.appendChild(searchForm);
        }

        var actions = document.createElement('div');
        actions.className = 'bkbg-ep-actions';

        var primary = document.createElement('a');
        primary.className = 'bkbg-ep-primary';
        primary.href = opts.primaryUrl || '/';
        primary.style.cssText = 'background:' + (opts.primaryBg || '#7c3aed') + ';color:' + (opts.primaryColor || '#fff') + ';';
        primary.textContent = '\u2190 ' + (opts.primaryLabel || 'Go to Homepage');
        actions.appendChild(primary);

        if (opts.showSecondary && opts.secondaryLabel) {
            var secondary = document.createElement('a');
            secondary.className = 'bkbg-ep-secondary';
            secondary.href = opts.secondaryUrl || '/contact';
            secondary.style.color = opts.secondaryColor || '#374151';
            secondary.textContent = opts.secondaryLabel;
            actions.appendChild(secondary);
        }

        inner.appendChild(actions);
        wrap.appendChild(inner);
        root.parentNode.replaceChild(wrap, root);
    });
})();

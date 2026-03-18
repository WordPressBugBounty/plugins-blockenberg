var _typoKeys = { family:'font-family', weight:'font-weight', style:'font-style',
    decoration:'text-decoration', transform:'text-transform',
    sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
    lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
    letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
    wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m' };
function typoCssVarsForEl(el, typo, prefix) {
    if (!typo || typeof typo !== 'object') return;
    Object.keys(_typoKeys).forEach(function (k) {
        if (typo[k] !== undefined && typo[k] !== '') el.style.setProperty(prefix + _typoKeys[k], String(typo[k]));
    });
}

wp.domReady(function () {
    document.querySelectorAll('.bkbg-mdc-app').forEach(function (el) {
        var a = JSON.parse(el.dataset.opts || '{}');
        var logos = a.logos || [];
        var showQuote = a.showFeaturedQuote && a.layout !== 'logos-only';
        var quoteAbove = a.layout === 'quote-logos';

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-mdc-wrap';
        wrap.style.background = a.bgColor || '#ffffff';
        wrap.style.paddingTop = (a.paddingTop || 64) + 'px';
        wrap.style.paddingBottom = (a.paddingBottom || 64) + 'px';

        typoCssVarsForEl(wrap, a.eyebrowTypo, '--bkbg-mdc-ey-');
        typoCssVarsForEl(wrap, a.headingTypo, '--bkbg-mdc-hd-');
        typoCssVarsForEl(wrap, a.quoteTypo, '--bkbg-mdc-qt-');

        var inner = document.createElement('div');
        inner.className = 'bkbg-mdc-inner';
        inner.style.setProperty('--mdc-max-width', (a.maxWidth || 1100) + 'px');
        inner.style.setProperty('--mdc-gap', (a.logoGap || 48) + 'px');

        /* Eyebrow */
        if (a.showEyebrow && a.eyebrow) {
            var eyebrow = document.createElement('p');
            eyebrow.className = 'bkbg-mdc-eyebrow';
            eyebrow.style.color = a.eyebrowColor || '#9ca3af';
            eyebrow.style.marginBottom = a.showHeading ? '8px' : '28px';
            eyebrow.innerHTML = a.eyebrow;
            inner.appendChild(eyebrow);
        }

        if (a.showHeading && a.heading) {
            var heading = document.createElement('p');
            heading.className = 'bkbg-mdc-heading';
            heading.innerHTML = a.heading;
            inner.appendChild(heading);
        }

        /* Quote builder */
        function buildQuote() {
            var qWrap = document.createElement('div');
            qWrap.className = 'bkbg-mdc-quote-wrap';
            qWrap.style.background = a.quoteBg || '#f9fafb';
            qWrap.style.borderLeftColor = a.quoteAccent || '#7c3aed';

            var qText = document.createElement('p');
            qText.className = 'bkbg-mdc-quote-text';
            qText.style.color = a.quoteColor || '#374151';
            qText.innerHTML = a.featuredQuote || '';
            qWrap.appendChild(qText);

            var qAttr = document.createElement('div');
            qAttr.className = 'bkbg-mdc-quote-attribution';
            qAttr.style.color = a.quoteAccent || '#7c3aed';
            if (a.featuredLink && a.featuredLink !== '#') {
                var qLink = document.createElement('a');
                qLink.href = a.featuredLink;
                qLink.textContent = '— ' + (a.featuredPublication || '');
                qAttr.appendChild(qLink);
            } else {
                qAttr.textContent = '— ' + (a.featuredPublication || '');
            }
            qWrap.appendChild(qAttr);
            return qWrap;
        }

        if (quoteAbove && showQuote) {
            inner.appendChild(buildQuote());
        }

        /* Logos */
        var logosEl = document.createElement('div');
        logosEl.className = 'bkbg-mdc-logos';

        logos.forEach(function (logo) {
            var link = document.createElement('a');
            link.className = 'bkbg-mdc-logo-link';
            link.href = logo.url || '#';
            if (logo.url && logo.url !== '#') { link.target = '_blank'; link.rel = 'noopener noreferrer'; }

            if (logo.imageUrl) {
                var img = document.createElement('img');
                img.src = logo.imageUrl;
                img.alt = logo.name || '';
                img.className = 'bkbg-mdc-logo-img';
                img.style.height = (a.logoHeight || 36) + 'px';
                if (a.grayscale) {
                    img.style.filter = 'grayscale(' + (a.grayscaleAmount || 100) + '%) opacity(0.5)';
                }
                img.addEventListener('mouseenter', function () { if (a.grayscale) img.style.filter = 'none'; });
                img.addEventListener('mouseleave', function () { if (a.grayscale) img.style.filter = 'grayscale(' + (a.grayscaleAmount || 100) + '%) opacity(0.5)'; });
                link.appendChild(img);
            } else {
                var logoText = document.createElement('span');
                logoText.className = 'bkbg-mdc-logo-text';
                logoText.style.height = (a.logoHeight || 36) + 'px';
                logoText.style.lineHeight = (a.logoHeight || 36) + 'px';
                logoText.style.color = a.logoColor || '#9ca3af';
                if (a.grayscale) { logoText.style.opacity = '0.5'; }
                logoText.textContent = logo.name || '';
                link.appendChild(logoText);
            }

            logosEl.appendChild(link);
        });
        inner.appendChild(logosEl);

        if (!quoteAbove && showQuote) {
            inner.appendChild(buildQuote());
        }

        wrap.appendChild(inner);
        el.replaceWith(wrap);
    });
});

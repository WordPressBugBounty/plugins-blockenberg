(function () {
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

    document.querySelectorAll('.bkbg-hs-app').forEach(function (app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) {}

        var textAlign = opts.textAlign || 'center';

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-hs-wrap';
        wrap.style.background    = opts.bgColor    || '#fff';
        wrap.style.paddingTop    = (opts.paddingTop    || 100) + 'px';
        wrap.style.paddingBottom = (opts.paddingBottom || 100) + 'px';
        wrap.style.textAlign     = textAlign;

        /* typo CSS vars on wrapper */
        typoCssVarsForEl(opts.headingTypo, '--bkbg-hs-h-', wrap);
        typoCssVarsForEl(opts.subtextTypo, '--bkbg-hs-st-', wrap);
        typoCssVarsForEl(opts.ctaTypo, '--bkbg-hs-cta-', wrap);
        /* legacy fallback */
        if (opts.headingSize && opts.headingSize !== 56) wrap.style.setProperty('--bkbg-hs-h-sz', opts.headingSize + 'px');
        if (opts.headingFontWeight && opts.headingFontWeight !== '800') wrap.style.setProperty('--bkbg-hs-h-fw', opts.headingFontWeight);
        if (opts.headingLineHeight && opts.headingLineHeight !== 1.15) wrap.style.setProperty('--bkbg-hs-h-lh', String(opts.headingLineHeight));
        if (opts.subtextSize && opts.subtextSize !== 20) wrap.style.setProperty('--bkbg-hs-st-sz', opts.subtextSize + 'px');
        if (opts.subtextFontWeight && opts.subtextFontWeight !== '400') wrap.style.setProperty('--bkbg-hs-st-fw', opts.subtextFontWeight);
        if (opts.subtextLineHeight && opts.subtextLineHeight !== 1.6) wrap.style.setProperty('--bkbg-hs-st-lh', String(opts.subtextLineHeight));
        if (opts.ctaFontSize && opts.ctaFontSize !== 16) wrap.style.setProperty('--bkbg-hs-cta-sz', opts.ctaFontSize + 'px');
        if (opts.ctaFontWeight && opts.ctaFontWeight !== '600') wrap.style.setProperty('--bkbg-hs-cta-fw', opts.ctaFontWeight);

        // Background decorative word
        if (opts.showBgWord !== false && opts.bgWord) {
            var bgWord = document.createElement('div');
            bgWord.className   = 'bkbg-hs-bg-word';
            bgWord.textContent = opts.bgWord;
            bgWord.style.fontSize   = (opts.bgWordSize   || 240) + 'px';
            bgWord.style.fontWeight = opts.bgWordWeight   || '900';
            bgWord.style.color      = opts.bgWordColor    || 'rgba(0,0,0,0.05)';
            wrap.appendChild(bgWord);
        }

        var inner = document.createElement('div');
        inner.className = 'bkbg-hs-inner';
        inner.style.maxWidth = (opts.maxWidth || 880) + 'px';

        var heading = document.createElement('h2');
        heading.className = 'bkbg-hs-heading';
        heading.style.color = opts.headingColor || '#111827';
        heading.innerHTML = opts.heading || '';
        inner.appendChild(heading);

        if (opts.showSubtext !== false && opts.subtext) {
            var sub = document.createElement('p');
            sub.className = 'bkbg-hs-subtext';
            sub.style.color = opts.subtextColor || '#4b5563';
            sub.innerHTML = opts.subtext;
            inner.appendChild(sub);
        }

        if (opts.showCta !== false && opts.ctaLabel) {
            var ctaWrap = document.createElement('div');
            ctaWrap.className = 'bkbg-hs-cta-wrap bkbg-hs-cta-wrap--' + textAlign;

            var btn = document.createElement('a');
            btn.className = 'bkbg-hs-cta-btn';
            btn.href        = opts.ctaUrl || '#';
            btn.textContent = opts.ctaLabel;
            btn.style.background = opts.ctaBg    || '#7c3aed';
            btn.style.color      = opts.ctaColor || '#ffffff';

            if (opts.ctaOpenNewTab) {
                btn.target = '_blank';
                btn.rel    = 'noopener noreferrer';
            }

            ctaWrap.appendChild(btn);
            inner.appendChild(ctaWrap);
        }

        wrap.appendChild(inner);
        app.parentNode.replaceChild(wrap, app);
    });
})();

wp.domReady(function () {
    document.querySelectorAll('.bkbg-ctt-app').forEach(function (app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) {}

        function typoCssVarsForEl(typo, prefix, el) {
            if (!typo) return;
            if (typo.family)     el.style.setProperty(prefix + 'font-family', "'" + typo.family + "', sans-serif");
            if (typo.weight)     el.style.setProperty(prefix + 'font-weight', typo.weight);
            if (typo.transform)  el.style.setProperty(prefix + 'text-transform', typo.transform);
            if (typo.style)      el.style.setProperty(prefix + 'font-style', typo.style);
            if (typo.decoration) el.style.setProperty(prefix + 'text-decoration', typo.decoration);
            var su = typo.sizeUnit || 'px';
            if (typo.sizeDesktop !== '' && typo.sizeDesktop != null) el.style.setProperty(prefix + 'font-size-d', typo.sizeDesktop + su);
            if (typo.sizeTablet  !== '' && typo.sizeTablet  != null) el.style.setProperty(prefix + 'font-size-t', typo.sizeTablet + su);
            if (typo.sizeMobile  !== '' && typo.sizeMobile  != null) el.style.setProperty(prefix + 'font-size-m', typo.sizeMobile + su);
            var lhu = typo.lineHeightUnit || '';
            if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) el.style.setProperty(prefix + 'line-height-d', typo.lineHeightDesktop + lhu);
            if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) el.style.setProperty(prefix + 'line-height-t', typo.lineHeightTablet + lhu);
            if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) el.style.setProperty(prefix + 'line-height-m', typo.lineHeightMobile + lhu);
            var lsu = typo.letterSpacingUnit || 'px';
            if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) el.style.setProperty(prefix + 'letter-spacing-d', typo.letterSpacingDesktop + lsu);
            if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) el.style.setProperty(prefix + 'letter-spacing-t', typo.letterSpacingTablet + lsu);
            if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) el.style.setProperty(prefix + 'letter-spacing-m', typo.letterSpacingMobile + lsu);
            var wsu = typo.wordSpacingUnit || 'px';
            if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) el.style.setProperty(prefix + 'word-spacing-d', typo.wordSpacingDesktop + wsu);
            if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) el.style.setProperty(prefix + 'word-spacing-t', typo.wordSpacingTablet + wsu);
            if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) el.style.setProperty(prefix + 'word-spacing-m', typo.wordSpacingMobile + wsu);
        }

        var cardStyle = opts.cardStyle || 'card';

        var outerWrap = document.createElement('div');
        outerWrap.className = 'bkbg-ctt-wrap';
        outerWrap.style.paddingTop    = (opts.paddingTop    || 40) + 'px';
        outerWrap.style.paddingBottom = (opts.paddingBottom || 40) + 'px';
        typoCssVarsForEl(opts.typoQuote, '--bkbg-ctt-q-', outerWrap);

        var inner = document.createElement('div');
        inner.className = 'bkbg-ctt-inner bkbg-ctt-inner--' + cardStyle;
        inner.style.maxWidth = (opts.maxWidth || 700) + 'px';
        inner.style.setProperty('--bkbg-ctt-radius', (opts.borderRadius || 12) + 'px');
        inner.style.setProperty('--bkbg-ctt-border',  opts.borderColor  || '#e5e7eb');
        inner.style.setProperty('--bkbg-ctt-accent',  opts.accentColor  || '#7c3aed');

        if (cardStyle === 'card') {
            inner.style.background = opts.bgColor || '#f9fafb';
        }

        if (opts.showQuoteIcon) {
            var icon = document.createElement('div');
            icon.className = 'bkbg-ctt-quote-icon';
            icon.style.color = opts.accentColor || '#7c3aed';
            icon.textContent = '\u201C'; // left double quotation mark
            inner.appendChild(icon);
        }

        var quote = document.createElement('p');
        quote.className = 'bkbg-ctt-quote';
        quote.style.color    = opts.quoteColor || '#111827';
        quote.innerHTML = opts.quote || '';
        inner.appendChild(quote);

        if (opts.showAttribution && opts.attribution) {
            var attr = document.createElement('p');
            attr.className = 'bkbg-ctt-attribution';
            attr.style.color = opts.attributionColor || '#6b7280';
            attr.textContent = '\u2014 ' + opts.attribution;
            inner.appendChild(attr);
        }

        // Build share URL
        var footer = document.createElement('div');
        footer.className = 'bkbg-ctt-footer';

        var btn = document.createElement('a');
        btn.className = 'bkbg-ctt-btn';
        btn.style.background = opts.buttonBg    || '#000';
        btn.style.color      = opts.buttonColor || '#fff';
        btn.target           = '_blank';
        btn.rel              = 'noopener noreferrer';

        var tweetText = encodeURIComponent((opts.quote || '').replace(/<[^>]*>/g, ''));
        var tweetUrl  = opts.includeUrl !== false ? encodeURIComponent(window.location.href) : '';
        btn.href = 'https://twitter.com/intent/tweet?text=' + tweetText + (tweetUrl ? '&url=' + tweetUrl : '');

        // X (Twitter) logo SVG
        var svgNS = 'http://www.w3.org/2000/svg';
        var svg  = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('width',  '16');
        svg.setAttribute('height', '16');
        svg.setAttribute('fill',   'currentColor');
        svg.style.display        = 'inline-block';
        svg.style.verticalAlign  = 'middle';
        svg.style.flexShrink     = '0';
        var path = document.createElementNS(svgNS, 'path');
        path.setAttribute('d', 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.258 5.63L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z');
        svg.appendChild(path);
        btn.appendChild(svg);

        var btnLabel = document.createTextNode(' ' + (opts.buttonLabel || 'Share on X'));
        btn.appendChild(btnLabel);

        footer.appendChild(btn);
        inner.appendChild(footer);
        outerWrap.appendChild(inner);

        app.parentNode.replaceChild(outerWrap, app);
    });
});

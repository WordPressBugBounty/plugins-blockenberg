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

wp.domReady(function () {
    document.querySelectorAll('.bkbg-chapter-intro-app').forEach(function (app) {
        var opts = {};
        try { opts = JSON.parse(app.getAttribute('data-opts') || '{}'); } catch (e) {}

        var bgColor      = opts.bgColor      || '#ffffff';
        var numberColor  = opts.numberColor  || '#f0eeff';
        var labelColor   = opts.labelColor   || '#7c3aed';
        var headingColor = opts.headingColor || '#111827';
        var textColor    = opts.textColor    || '#4b5563';
        var dividerColor = opts.dividerColor || '#e5e7eb';
        var accentColor  = opts.accentColor  || '#7c3aed';
        var isLeft       = (opts.layout || 'centered') === 'left';
        var align        = isLeft ? 'left' : 'center';

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-ci-wrap';
        wrap.style.background    = bgColor;
        wrap.style.paddingTop    = (opts.paddingTop    || 80) + 'px';
        wrap.style.paddingBottom = (opts.paddingBottom || 80) + 'px';

        var inner = document.createElement('div');
        inner.className = 'bkbg-ci-inner';
        inner.style.maxWidth = (opts.maxWidth || 760) + 'px';
        inner.style.textAlign = align;

        /* Chapter number */
        var numEl = document.createElement('div');
        numEl.className = 'bkbg-ci-number bkbg-ci-number-' + (opts.numberStyle || 'display');
        numEl.style.fontSize = (opts.numberSize || 160) + 'px';
        numEl.style.textAlign = align;
        numEl.style.marginBottom = '8px';
        numEl.style.fontWeight = '900';
        numEl.style.lineHeight = '0.9';
        numEl.style.letterSpacing = '-4px';
        if ((opts.numberStyle || 'display') === 'ghost') {
            numEl.style.color = 'transparent';
            numEl.style.webkitTextStroke = '2px ' + numberColor;
        } else {
            numEl.style.color = numberColor;
        }
        numEl.textContent = opts.chapterNumber || '01';
        inner.appendChild(numEl);

        /* Label row */
        if (opts.showLabel !== false && opts.chapterLabel) {
            var labelRow = document.createElement('div');
            labelRow.className = 'bkbg-ci-label-row';
            labelRow.style.justifyContent = isLeft ? 'flex-start' : 'center';

            function makeLine() {
                var l = document.createElement('span');
                l.className = 'bkbg-ci-label-line';
                l.style.background = labelColor;
                return l;
            }

            var labelSpan = document.createElement('span');
            labelSpan.className = 'bkbg-ci-label';
            labelSpan.style.color = labelColor;
            labelSpan.textContent = opts.chapterLabel;

            labelRow.appendChild(makeLine());
            labelRow.appendChild(labelSpan);
            labelRow.appendChild(makeLine());
            inner.appendChild(labelRow);
        }

        /* Heading */
        var hEl = document.createElement('h2');
        hEl.className = 'bkbg-ci-heading';
        hEl.style.color = headingColor;
        hEl.style.margin = '0 0 16px';
        hEl.innerHTML = opts.heading || 'Introduction';
        inner.appendChild(hEl);

        /* Divider */
        if (opts.showDivider !== false) {
            var div = null;
            var ds = opts.dividerStyle || 'line';
            if (ds === 'dots') {
                div = document.createElement('div');
                div.className = 'bkbg-ci-divider bkbg-ci-divider-dots';
                div.style.color = dividerColor;
                div.style.margin = '24px ' + (isLeft ? '0' : 'auto');
                div.style.letterSpacing = '6px';
                div.style.fontSize = '14px';
                div.textContent = '● ● ●';
            } else if (ds === 'gradient') {
                div = document.createElement('div');
                div.className = 'bkbg-ci-divider bkbg-ci-divider-gradient';
                div.style.height = '3px';
                div.style.width = '80px';
                div.style.borderRadius = '2px';
                div.style.margin = '24px ' + (isLeft ? '0' : 'auto');
                div.style.background = 'linear-gradient(90deg, ' + accentColor + ', transparent)';
            } else {
                div = document.createElement('hr');
                div.className = 'bkbg-ci-divider';
                div.style.border = 'none';
                div.style.borderTop = '2px solid ' + dividerColor;
                div.style.width = '80px';
                div.style.margin = '24px ' + (isLeft ? '0' : 'auto');
            }
            inner.appendChild(div);
        }

        /* Intro text */
        if (opts.introText) {
            var p = document.createElement('p');
            p.className = 'bkbg-ci-text';
            p.style.color = textColor;
            p.style.margin = '16px 0 0';
            p.innerHTML = opts.introText;
            inner.appendChild(p);
        }

        typoCssVarsForEl(opts.typoHeading, '--bkbg-ci-h-', wrap);
        typoCssVarsForEl(opts.typoText, '--bkbg-ci-t-', wrap);
        typoCssVarsForEl(opts.typoLabel, '--bkbg-ci-l-', wrap);

        wrap.appendChild(inner);
        app.parentNode.replaceChild(wrap, app);
    });
});

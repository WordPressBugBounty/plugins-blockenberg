(function () {
    function isBright(hex) {
        if (!hex || hex.length < 7) return true;
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        return (r * 299 + g * 587 + b * 114) / 1000 > 180;
    }

    function copyText(text, btn) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(function () {
                btn.textContent = 'Copied!';
                btn.classList.add('copied');
                setTimeout(function () {
                    btn.textContent = 'copy';
                    btn.classList.remove('copied');
                }, 1400);
            });
        } else {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            btn.textContent = 'Copied!';
            btn.classList.add('copied');
            setTimeout(function () {
                btn.textContent = 'copy';
                btn.classList.remove('copied');
            }, 1400);
        }
    }

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

    function init() {
        document.querySelectorAll('.bkbg-bk-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                sectionTitle: 'Brand Identity',
                showTitle: true,
                showColors: true,
                colorsTitle: 'Colour Palette',
                colors: [],
                showCopyHint: true,
                swatchRadius: 10,
                swatchHeight: 90,
                showColorName: true,
                showColorHex: true,
                showTypography: true,
                typographyTitle: 'Typography',
                fonts: [],
                showLogos: true,
                logosTitle: 'Logo Usage',
                logos: [],
                showValues: true,
                valuesTitle: 'Brand Values',
                values: [],
                maxWidth: 1000,
                containerPadding: 48,
                sectionGap: 56,
                cardRadius: 12,
                cardPadding: 28,
                containerBg: '',
                cardBg: '#ffffff',
                cardBorder: '#e5e7eb',
                headingColor: '#111827',
                textColor: '#374151',
                sectionLabelColor: '#6366f1',
                sectionLabelBg: '#ede9fe',
                valueIconBg: '#f5f3ff',
            }, opts);

            // Build root
            var wrap = document.createElement('div');
            wrap.className = 'bkbg-bk-wrap';
            if (o.containerBg) wrap.style.background = o.containerBg;
            wrap.style.paddingTop = o.containerPadding + 'px';
            wrap.style.paddingBottom = o.containerPadding + 'px';

            var inner = document.createElement('div');
            inner.className = 'bkbg-bk-inner';
            inner.style.maxWidth = o.maxWidth + 'px';
            wrap.appendChild(inner);

            function makeSection(title) {
                var sec = document.createElement('div');
                sec.className = 'bkbg-bk-section';
                sec.style.background = o.cardBg;
                sec.style.borderColor = o.cardBorder;
                sec.style.borderRadius = o.cardRadius + 'px';
                sec.style.padding = o.cardPadding + 'px';
                sec.style.marginBottom = o.sectionGap + 'px';

                var label = document.createElement('div');
                label.className = 'bkbg-bk-label';
                label.style.background = o.sectionLabelBg;
                label.style.color = o.sectionLabelColor;
                label.textContent = title;
                sec.appendChild(label);

                return sec;
            }

            // Main title
            if (o.showTitle && o.sectionTitle) {
                var title = document.createElement('h2');
                title.className = 'bkbg-bk-main-title';
                title.style.color = o.headingColor;
                title.style.marginBottom = o.sectionGap + 'px';
                title.textContent = o.sectionTitle;
                inner.appendChild(title);
            }

            // ── Colour palette ──
            if (o.showColors && o.colors && o.colors.length) {
                var colorSec = makeSection(o.colorsTitle);
                var colorGrid = document.createElement('div');
                colorGrid.className = 'bkbg-bk-colors-grid';

                o.colors.forEach(function (clr) {
                    var bright = isBright(clr.value);

                    var swatchWrap = document.createElement('div');
                    swatchWrap.className = 'bkbg-bk-swatch-wrap';

                    var swatch = document.createElement('div');
                    swatch.className = 'bkbg-bk-swatch';
                    swatch.style.height = o.swatchHeight + 'px';
                    swatch.style.background = clr.value;
                    swatch.style.borderRadius = o.swatchRadius + 'px';
                    if (bright) swatch.style.border = '1px solid #e5e7eb';

                    if (o.showCopyHint) {
                        var copyBtn = document.createElement('span');
                        copyBtn.className = 'bkbg-bk-swatch-copy';
                        copyBtn.textContent = 'copy';
                        copyBtn.style.background = bright ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.25)';
                        copyBtn.style.color = bright ? '#374151' : 'rgba(255,255,255,0.9)';
                        swatch.appendChild(copyBtn);

                        swatch.addEventListener('click', function () {
                            copyText(clr.value, copyBtn);
                        });
                    }

                    swatchWrap.appendChild(swatch);

                    if (o.showColorName) {
                        var nameEl = document.createElement('div');
                        nameEl.className = 'bkbg-bk-color-name';
                        nameEl.style.color = o.headingColor;
                        nameEl.style.marginTop = '6px';
                        nameEl.textContent = clr.name;
                        swatchWrap.appendChild(nameEl);
                    }
                    if (o.showColorHex) {
                        var hexEl = document.createElement('div');
                        hexEl.className = 'bkbg-bk-color-hex';
                        hexEl.style.color = o.textColor;
                        hexEl.textContent = clr.value;
                        swatchWrap.appendChild(hexEl);
                    }

                    colorGrid.appendChild(swatchWrap);
                });

                colorSec.appendChild(colorGrid);
                inner.appendChild(colorSec);
            }

            // ── Typography ──
            if (o.showTypography && o.fonts && o.fonts.length) {
                var typeSec = makeSection(o.typographyTitle);
                var fontsWrap = document.createElement('div');
                fontsWrap.className = 'bkbg-bk-fonts';

                o.fonts.forEach(function (font, i) {
                    var fontItem = document.createElement('div');
                    fontItem.className = 'bkbg-bk-font-item';

                    // Meta row
                    var metaRow = document.createElement('div');
                    metaRow.className = 'bkbg-bk-font-meta';

                    var metaLeft = document.createElement('div');
                    var labelEl = document.createElement('div');
                    labelEl.className = 'bkbg-bk-font-label';
                    labelEl.style.color = o.sectionLabelColor;
                    labelEl.textContent = font.name;
                    var infoEl = document.createElement('div');
                    infoEl.className = 'bkbg-bk-font-info';
                    infoEl.style.color = o.textColor;
                    infoEl.textContent = font.familyName + (font.weights ? ' · ' + font.weights : '');
                    metaLeft.appendChild(labelEl);
                    metaLeft.appendChild(infoEl);
                    metaRow.appendChild(metaLeft);

                    if (font.sourceUrl) {
                        var srcLink = document.createElement('a');
                        srcLink.className = 'bkbg-bk-font-link';
                        srcLink.href = font.sourceUrl;
                        srcLink.target = '_blank';
                        srcLink.rel = 'noopener noreferrer';
                        srcLink.style.color = o.sectionLabelColor;
                        srcLink.textContent = 'View font →';
                        metaRow.appendChild(srcLink);
                    }

                    fontItem.appendChild(metaRow);

                    // Heading specimen
                    if (font.headingText) {
                        var headEl = document.createElement('p');
                        headEl.className = 'bkbg-bk-font-heading';
                        headEl.style.fontFamily = font.cssFamily;
                        headEl.style.color = o.headingColor;
                        headEl.textContent = font.headingText;
                        fontItem.appendChild(headEl);
                    }

                    // Body specimen
                    if (font.bodyText) {
                        var bodyEl = document.createElement('p');
                        bodyEl.className = 'bkbg-bk-font-body';
                        bodyEl.style.fontFamily = font.cssFamily;
                        bodyEl.style.color = o.textColor;
                        bodyEl.textContent = font.bodyText;
                        fontItem.appendChild(bodyEl);
                    }

                    fontsWrap.appendChild(fontItem);
                });

                typeSec.appendChild(fontsWrap);
                inner.appendChild(typeSec);
            }

            // ── Logos ──
            if (o.showLogos && o.logos && o.logos.length) {
                var logoSec = makeSection(o.logosTitle);
                var logosGrid = document.createElement('div');
                logosGrid.className = 'bkbg-bk-logos-grid';

                o.logos.forEach(function (logo) {
                    var logoCard = document.createElement('div');
                    logoCard.className = 'bkbg-bk-logo-card';

                    var logoBg = document.createElement('div');
                    logoBg.className = 'bkbg-bk-logo-bg';

                    var bgColor = logo.bgStyle === 'dark' ? '#0f172a'
                        : logo.bgStyle === 'light' ? '#f8fafc'
                        : 'transparent';

                    if (logo.bgStyle === 'transparent') {
                        logoBg.style.backgroundImage = 'repeating-conic-gradient(#e5e7eb 0% 25%, #fff 0% 50%)';
                        logoBg.style.backgroundSize = '20px 20px';
                    } else {
                        logoBg.style.background = bgColor;
                    }

                    if (logo.imageUrl) {
                        var logoImg = document.createElement('img');
                        logoImg.src = logo.imageUrl;
                        logoImg.alt = logo.imageAlt || '';
                        logoBg.appendChild(logoImg);
                    } else {
                        logoBg.style.color = '#9ca3af';
                        logoBg.style.fontSize = '13px';
                        logoBg.textContent = '(no logo uploaded)';
                    }

                    logoCard.appendChild(logoBg);

                    if (logo.label) {
                        var logoLabel = document.createElement('div');
                        logoLabel.className = 'bkbg-bk-logo-label';
                        logoLabel.style.color = o.headingColor;
                        logoLabel.textContent = logo.label;
                        logoCard.appendChild(logoLabel);
                    }

                    if (logo.description) {
                        var logoDesc = document.createElement('div');
                        logoDesc.className = 'bkbg-bk-logo-desc';
                        logoDesc.style.color = o.textColor;
                        logoDesc.textContent = logo.description;
                        logoCard.appendChild(logoDesc);
                    }

                    logosGrid.appendChild(logoCard);
                });

                logoSec.appendChild(logosGrid);
                inner.appendChild(logoSec);
            }

            // ── Brand Values ──
            if (o.showValues && o.values && o.values.length) {
                var valuesSec = makeSection(o.valuesTitle);
                valuesSec.style.marginBottom = '0';
                var valuesGrid = document.createElement('div');
                valuesGrid.className = 'bkbg-bk-values-grid';

                o.values.forEach(function (val) {
                    var valueEl = document.createElement('div');
                    valueEl.className = 'bkbg-bk-value';

                    var iconEl = document.createElement('div');
                    iconEl.className = 'bkbg-bk-value-icon';
                    iconEl.style.background = o.valueIconBg;
                    var _IP = window.bkbgIconPicker;
                    var _iType = val.iconType || 'custom-char';
                    if (_IP && _iType !== 'custom-char') {
                        var _in = _IP.buildFrontendIcon(_iType, val.icon, val.iconDashicon, val.iconImageUrl, val.iconDashiconColor);
                        if (_in) iconEl.appendChild(_in);
                        else iconEl.textContent = val.icon;
                    } else {
                        iconEl.textContent = val.icon;
                    }
                    valueEl.appendChild(iconEl);

                    var titleEl = document.createElement('h4');
                    titleEl.className = 'bkbg-bk-value-title';
                    titleEl.style.color = o.headingColor;
                    titleEl.textContent = val.title;
                    valueEl.appendChild(titleEl);

                    if (val.description) {
                        var descEl = document.createElement('p');
                        descEl.className = 'bkbg-bk-value-desc';
                        descEl.style.color = o.textColor;
                        descEl.textContent = val.description;
                        valueEl.appendChild(descEl);
                    }

                    valuesGrid.appendChild(valueEl);
                });

                valuesSec.appendChild(valuesGrid);
                inner.appendChild(valuesSec);
            }

            typoCssVarsForEl(opts.typoTitle, '--bkbg-bdk-title-', wrap);
            typoCssVarsForEl(opts.typoBody, '--bkbg-bdk-body-', wrap);

            appEl.parentNode.insertBefore(wrap, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();

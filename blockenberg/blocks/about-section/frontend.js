(function () {
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
            el.style.setProperty('--' + prefix + prop, v);
        });
    }

    document.querySelectorAll('.bkbg-about-section-app').forEach(function (root) {
        var opts = {};
        try { opts = JSON.parse(root.dataset.opts || '{}'); } catch (e) {}

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-about-section-wrap bkbg-as-layout-' + (opts.imageLayout || 'left');
        wrap.style.cssText = 'background:' + (opts.bgColor || '#fff') + ';padding:' + (opts.paddingTop || 80) + 'px 40px ' + (opts.paddingBottom || 80) + 'px;';

        /* Apply typography CSS vars on wrap */
        typoCssVarsForEl(wrap, opts.headingTypo, 'bkas-hd-');
        typoCssVarsForEl(wrap, opts.bodyTypo, 'bkas-bd-');
        typoCssVarsForEl(wrap, opts.labelTypo, 'bkas-lb-');
        typoCssVarsForEl(wrap, opts.statValueTypo, 'bkas-sv-');
        typoCssVarsForEl(wrap, opts.statLabelTypo, 'bkas-sl-');

        var inner = document.createElement('div');
        inner.className = 'bkbg-about-section-inner';
        inner.style.cssText = '--bkbg-as-max-width:' + (opts.maxWidth || 1200) + 'px;--bkbg-as-gap:' + (opts.colGap || 64) + 'px;--bkbg-as-align:' + (opts.verticalAlign || 'center') + ';';

        // Image column
        var imgCol = document.createElement('div');
        imgCol.className = 'bkbg-as-image-col';
        if (opts.imageUrl) {
            var img = document.createElement('img');
            img.src = opts.imageUrl;
            img.alt = opts.imageAlt || '';
            img.className = 'bkbg-as-img-' + (opts.imageStyle || 'rounded') + (opts.imageShadow ? ' bkbg-as-img-shadow' : '');
            imgCol.appendChild(img);
        } else {
            imgCol.style.display = 'none';
            inner.style.gridTemplateColumns = '1fr';
        }

        // Text column
        var txtCol = document.createElement('div');
        txtCol.className = 'bkbg-as-text-col';

        if (opts.showLabel !== false && opts.label) {
            var lbl = document.createElement('span');
            lbl.className = 'bkbg-as-label';
            lbl.style.cssText = 'background:' + (opts.labelBg || '#ede9fe') + ';color:' + (opts.labelColor || '#7c3aed') + ';';
            lbl.textContent = opts.label;
            txtCol.appendChild(lbl);
        }

        if (opts.heading) {
            var h2 = document.createElement('h2');
            h2.className = 'bkbg-as-heading';
            h2.style.cssText = 'color:' + (opts.headingColor || '#111827') + ';';
            h2.innerHTML = opts.heading;
            txtCol.appendChild(h2);
        }

        if (opts.subtext) {
            var p = document.createElement('p');
            p.className = 'bkbg-as-body';
            p.style.cssText = 'color:' + (opts.textColor || '#6b7280') + ';';
            p.innerHTML = opts.subtext;
            txtCol.appendChild(p);
        }

        if (opts.showStats && opts.stats && opts.stats.length) {
            var statsRow = document.createElement('div');
            statsRow.className = 'bkbg-as-stats';
            opts.stats.forEach(function (s) {
                var statEl = document.createElement('div');
                statEl.className = 'bkbg-as-stat';
                var val = document.createElement('div');
                val.className = 'bkbg-as-stat-value';
                val.style.cssText = 'color:' + (opts.statValueColor || '#111827') + ';';
                val.textContent = s.value;
                var lbl2 = document.createElement('div');
                lbl2.className = 'bkbg-as-stat-label';
                lbl2.style.color = opts.statLabelColor || '#6b7280';
                lbl2.textContent = s.label;
                statEl.appendChild(val);
                statEl.appendChild(lbl2);
                statsRow.appendChild(statEl);
            });
            txtCol.appendChild(statsRow);
        }

        var hasActions = opts.showCta || opts.showCta2 || opts.showSignature;
        if (hasActions) {
            var ctaRow = document.createElement('div');
            ctaRow.className = 'bkbg-as-cta-row';

            if (opts.showCta && opts.ctaLabel) {
                var btn = document.createElement('a');
                btn.className = 'bkbg-as-cta-btn ' + (opts.ctaStyle || 'filled');
                btn.href = opts.ctaUrl || '#';
                btn.textContent = opts.ctaLabel + ' →';
                if (opts.ctaStyle === 'filled') {
                    btn.style.cssText = 'background:' + (opts.ctaBg || '#7c3aed') + ';color:' + (opts.ctaColor || '#fff') + ';';
                } else if (opts.ctaStyle === 'outline') {
                    btn.style.cssText = 'border:2px solid ' + (opts.accentColor || '#7c3aed') + ';color:' + (opts.accentColor || '#7c3aed') + ';';
                } else {
                    btn.style.color = opts.accentColor || '#7c3aed';
                }
                ctaRow.appendChild(btn);
            }

            if (opts.showCta2 && opts.cta2Label) {
                var btn2 = document.createElement('a');
                btn2.className = 'bkbg-as-cta2-btn';
                btn2.href = opts.cta2Url || '#';
                btn2.style.color = opts.headingColor || '#111827';
                btn2.textContent = opts.cta2Label;
                ctaRow.appendChild(btn2);
            }

            if (opts.showSignature && opts.signatureName) {
                var sig = document.createElement('span');
                sig.className = 'bkbg-as-signature';
                sig.style.color = opts.textColor || '#6b7280';
                sig.textContent = '— ' + opts.signatureName;
                ctaRow.appendChild(sig);
            }
            txtCol.appendChild(ctaRow);
        }

        inner.appendChild(imgCol);
        inner.appendChild(txtCol);
        wrap.appendChild(inner);
        root.parentNode.replaceChild(wrap, root);
    });
})();

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

    document.querySelectorAll('.bkbg-iot-app').forEach(function (app) {
        var opts = {};
        try { opts = JSON.parse(app.dataset.opts || '{}'); } catch (e) { }

        var imageUrl = opts.imageUrl || '';
        var imageAlt = opts.imageAlt || '';
        var imageRadius = opts.imageRadius !== undefined ? opts.imageRadius : 0;
        var overlapSide = opts.overlapSide || 'left';
        var overlapAmount = opts.overlapAmount !== undefined ? opts.overlapAmount : 48;
        var eyebrow = opts.eyebrow || '';
        var showEyebrow = opts.showEyebrow !== false;
        var heading = opts.heading || '';
        var subtext = opts.subtext || '';
        var bodyText = opts.bodyText || '';
        var ctaEnabled = opts.ctaEnabled !== false;
        var ctaLabel = opts.ctaLabel || 'Learn more →';
        var ctaUrl = opts.ctaUrl || '#';
        var ctaIsExternal = opts.ctaIsExternal || false;
        var decorative = opts.decorative || 'dots';
        var bgColor = opts.bgColor || '#ffffff';
        var panelBg = opts.panelBg || '#f9fafb';
        var eyebrowColor = opts.eyebrowColor || '#7c3aed';
        var headingColor = opts.headingColor || '#111827';
        var headingSize = opts.headingSize || 36;
        var subtextColor = opts.subtextColor || '#6b7280';
        var subtextSize = opts.subtextSize || 18;
        var bodyColor = opts.bodyColor || '#374151';
        var bodySize = opts.bodySize || 16;
        var ctaBg = opts.ctaBg || '#7c3aed';
        var ctaColor = opts.ctaColor || '#ffffff';
        var accentColor = opts.accentColor || '#7c3aed';
        var dotColor = opts.dotColor || '#e5e7eb';
        var maxWidth = opts.maxWidth || 1100;
        var paddingTop = opts.paddingTop !== undefined ? opts.paddingTop : 64;
        var paddingBottom = opts.paddingBottom !== undefined ? opts.paddingBottom : 64;
        var isRight = overlapSide === 'right';

        /* outer wrap */
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-iot-wrap';
        wrap.style.cssText = 'background:' + bgColor + ';padding-top:' + paddingTop + 'px;padding-bottom:' + paddingBottom + 'px;';
        typoCssVarsForEl(opts.eyebrowTypo, '--bkbg-iot-ey-', wrap);
        typoCssVarsForEl(opts.headingTypo, '--bkbg-iot-h-', wrap);
        typoCssVarsForEl(opts.subtextTypo, '--bkbg-iot-st-', wrap);
        typoCssVarsForEl(opts.bodyTypo, '--bkbg-iot-bd-', wrap);

        /* inner */
        var inner = document.createElement('div');
        inner.className = 'bkbg-iot-inner' + (isRight ? ' bkbg-iot-inner--right' : '');
        inner.style.cssText = 'max-width:' + maxWidth + 'px;';
        wrap.appendChild(inner);

        /* image column */
        var imgCol = document.createElement('div');
        imgCol.className = 'bkbg-iot-image-col';

        /* decorative */
        if (decorative !== 'none') {
            var decor = document.createElement('div');
            decor.className = 'bkbg-iot-decor bkbg-iot-decor--' + decorative;
            decor.style.setProperty('--dot-color', dotColor);
            decor.style.setProperty('--accent', accentColor);
            imgCol.appendChild(decor);
        }

        if (imageUrl) {
            var img = document.createElement('img');
            img.className = 'bkbg-iot-img';
            img.src = imageUrl;
            img.alt = imageAlt;
            img.style.borderRadius = imageRadius + 'px';
            imgCol.appendChild(img);
        } else {
            var ph = document.createElement('div');
            ph.className = 'bkbg-iot-img';
            ph.style.cssText = 'background:#f3f4f6;display:flex;align-items:center;justify-content:center;font-size:48px;color:#d1d5db;border-radius:' + imageRadius + 'px;';
            ph.textContent = '🖼️';
            imgCol.appendChild(ph);
        }
        inner.appendChild(imgCol);

        /* text column */
        var textCol = document.createElement('div');
        textCol.className = 'bkbg-iot-text-col';
        textCol.style.cssText = [
            'background:' + panelBg,
            isRight
                ? 'padding:40px ' + overlapAmount + 'px 40px 40px'
                : 'padding:40px 40px 40px ' + overlapAmount + 'px'
        ].join(';');

        if (showEyebrow && eyebrow) {
            var ey = document.createElement('p');
            ey.className = 'bkbg-iot-eyebrow';
            ey.style.color = eyebrowColor;
            ey.textContent = eyebrow;
            textCol.appendChild(ey);
        }

        if (heading) {
            var h = document.createElement('h2');
            h.className = 'bkbg-iot-heading';
            h.style.color = headingColor;
            h.textContent = heading;
            textCol.appendChild(h);
        }

        if (subtext) {
            var sub = document.createElement('p');
            sub.className = 'bkbg-iot-subtext';
            sub.style.color = subtextColor;
            sub.textContent = subtext;
            textCol.appendChild(sub);
        }

        if (bodyText) {
            var bod = document.createElement('p');
            bod.className = 'bkbg-iot-body';
            bod.style.color = bodyColor;
            bod.textContent = bodyText;
            textCol.appendChild(bod);
        }

        if (ctaEnabled && ctaLabel) {
            var cta = document.createElement('a');
            cta.className = 'bkbg-iot-cta';
            cta.href = ctaUrl;
            cta.style.cssText = 'background:' + ctaBg + ';color:' + ctaColor;
            if (ctaIsExternal) { cta.target = '_blank'; cta.rel = 'noopener noreferrer'; }
            cta.textContent = ctaLabel;
            textCol.appendChild(cta);
        }

        inner.appendChild(textCol);
        app.replaceWith(wrap);
    });
})();

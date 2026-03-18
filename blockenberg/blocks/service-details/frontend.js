(function () {
    var _typoKeys = {
        family:'font-family', weight:'font-weight', style:'font-style',
        decoration:'text-decoration', transform:'text-transform',
        sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
        lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
        letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
        wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
    };
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        Object.keys(_typoKeys).forEach(function (k) {
            var v = obj[k];
            if (v === undefined || v === '' || v === null) return;
            if (k === 'sizeDesktop' || k === 'sizeTablet' || k === 'sizeMobile') v = v + (obj.sizeUnit || 'px');
            else if (k === 'lineHeightDesktop' || k === 'lineHeightTablet' || k === 'lineHeightMobile') v = v + (obj.lineHeightUnit || '');
            else if (k === 'letterSpacingDesktop' || k === 'letterSpacingTablet' || k === 'letterSpacingMobile') v = v + (obj.letterSpacingUnit || 'px');
            else if (k === 'wordSpacingDesktop' || k === 'wordSpacingTablet' || k === 'wordSpacingMobile') v = v + (obj.wordSpacingUnit || 'px');
            el.style.setProperty(prefix + _typoKeys[k], String(v));
        });
    }

    document.querySelectorAll('.bkbg-svd-app').forEach(function (app) {
        var opts = {};
        try { opts = JSON.parse(app.dataset.opts || '{}'); } catch (e) { }

        var imageUrl = opts.imageUrl || '';
        var imageAlt = opts.imageAlt || '';
        var imageRadius = opts.imageRadius !== undefined ? opts.imageRadius : 12;
        var layout = opts.layout || 'image-left';
        var eyebrow = opts.eyebrow || '';
        var showEyebrow = opts.showEyebrow !== false;
        var heading = opts.heading || '';
        var subtext = opts.subtext || '';
        var bodyText = opts.bodyText || '';
        var features = opts.features || [];
        var showFeatures = opts.showFeatures !== false;
        var ctaEnabled = opts.ctaEnabled !== false;
        var ctaLabel = opts.ctaLabel || '';
        var ctaUrl = opts.ctaUrl || '#';
        var cta2Enabled = opts.cta2Enabled !== false;
        var cta2Label = opts.cta2Label || '';
        var cta2Url = opts.cta2Url || '#';
        var bgColor = opts.bgColor || '#ffffff';
        var eyebrowColor = opts.eyebrowColor || '#7c3aed';
        var headingColor = opts.headingColor || '#111827';
        var headingSize = opts.headingSize || 36;
        var bodyColor = opts.bodyColor || '#374151';
        var bodySize = opts.bodySize || 16;
        var featureColor = opts.featureColor || '#374151';
        var checkBg = opts.checkBg || '#ede9fe';
        var checkColor = opts.checkColor || '#7c3aed';
        var ctaBg = opts.ctaBg || '#7c3aed';
        var ctaColor = opts.ctaColor || '#ffffff';
        var cta2Color = opts.cta2Color || '#7c3aed';
        var maxWidth = opts.maxWidth || 1060;
        var paddingTop = opts.paddingTop !== undefined ? opts.paddingTop : 64;
        var paddingBottom = opts.paddingBottom !== undefined ? opts.paddingBottom : 64;
        var isRight = layout === 'image-right';
        var isCentered = layout === 'centered';

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-svd-wrap';
        wrap.style.cssText = 'background:' + bgColor + ';padding-top:' + paddingTop + 'px;padding-bottom:' + paddingBottom + 'px;';

        typoCssVarsForEl(wrap, opts.headingTypo, '--bksd-ht-');
        typoCssVarsForEl(wrap, opts.eyebrowTypo, '--bksd-et-');
        typoCssVarsForEl(wrap, opts.bodyTypo, '--bksd-bt-');

        var inner = document.createElement('div');
        inner.className = 'bkbg-svd-inner' + (isCentered ? ' bkbg-svd-inner--centered' : isRight ? ' bkbg-svd-inner--right' : '');
        inner.style.maxWidth = maxWidth + 'px';
        wrap.appendChild(inner);

        /* image column */
        var imgCol = document.createElement('div');
        imgCol.className = 'bkbg-svd-image-col';
        if (imageUrl) {
            var img = document.createElement('img');
            img.className = 'bkbg-svd-img';
            img.src = imageUrl;
            img.alt = imageAlt;
            img.style.borderRadius = imageRadius + 'px';
            imgCol.appendChild(img);
        } else {
            var ph = document.createElement('div');
            ph.className = 'bkbg-svd-img';
            ph.style.cssText = 'background:#f3f4f6;display:flex;align-items:center;justify-content:center;font-size:48px;color:#d1d5db;border-radius:' + imageRadius + 'px;min-height:320px;';
            ph.textContent = '🖼️';
            imgCol.appendChild(ph);
        }
        inner.appendChild(imgCol);

        /* text column */
        var textCol = document.createElement('div');
        textCol.className = 'bkbg-svd-text-col';

        if (showEyebrow && eyebrow) {
            var ey = document.createElement('p');
            ey.className = 'bkbg-svd-eyebrow';
            ey.style.color = eyebrowColor;
            ey.textContent = eyebrow;
            textCol.appendChild(ey);
        }

        if (heading) {
            var h = document.createElement('h2');
            h.className = 'bkbg-svd-heading';
            h.style.color = headingColor;
            h.textContent = heading;
            textCol.appendChild(h);
        }

        if (subtext) {
            var sub = document.createElement('p');
            sub.className = 'bkbg-svd-subtext';
            sub.style.color = bodyColor;
            sub.textContent = subtext;
            textCol.appendChild(sub);
        }

        if (bodyText) {
            var bod = document.createElement('p');
            bod.className = 'bkbg-svd-body';
            bod.style.color = bodyColor;
            bod.textContent = bodyText;
            textCol.appendChild(bod);
        }

        if (showFeatures && features.length) {
            var ul = document.createElement('ul');
            ul.className = 'bkbg-svd-features';
            features.forEach(function (feat) {
                var li = document.createElement('li');
                li.className = 'bkbg-svd-feature';
                var check = document.createElement('span');
                check.className = 'bkbg-svd-check';
                check.style.cssText = 'background:' + checkBg + ';color:' + checkColor;
                check.textContent = feat.icon || '✓';
                li.appendChild(check);
                var txt = document.createElement('span');
                txt.style.color = featureColor;
                txt.textContent = feat.text || '';
                li.appendChild(txt);
                ul.appendChild(li);
            });
            textCol.appendChild(ul);
        }

        if (ctaEnabled || cta2Enabled) {
            var ctaRow = document.createElement('div');
            ctaRow.className = 'bkbg-svd-ctas';
            if (ctaEnabled && ctaLabel) {
                var cta = document.createElement('a');
                cta.className = 'bkbg-svd-cta';
                cta.href = ctaUrl;
                cta.style.cssText = 'background:' + ctaBg + ';color:' + ctaColor;
                cta.textContent = ctaLabel;
                ctaRow.appendChild(cta);
            }
            if (cta2Enabled && cta2Label) {
                var cta2 = document.createElement('a');
                cta2.className = 'bkbg-svd-cta2';
                cta2.href = cta2Url;
                cta2.style.color = cta2Color;
                cta2.textContent = cta2Label;
                ctaRow.appendChild(cta2);
            }
            textCol.appendChild(ctaRow);
        }

        inner.appendChild(textCol);
        app.replaceWith(wrap);
    });
})();

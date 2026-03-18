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
            el.style.setProperty(prefix + prop, v);
        });
    }

    document.querySelectorAll('.bkbg-coms-app').forEach(function (app) {
        var opts = {};
        try { opts = JSON.parse(app.dataset.opts || '{}'); } catch (e) { }

        var avatars = opts.avatars || [];
        var memberCount = opts.memberCount || '12,000+';
        var memberCountLabel = opts.memberCountLabel || 'members';
        var heading = opts.heading || '';
        var subtext = opts.subtext || '';
        var showHeading = opts.showHeading !== false;
        var ctaEnabled = opts.ctaEnabled !== false;
        var ctaLabel = opts.ctaLabel || '';
        var ctaUrl = opts.ctaUrl || '#';
        var ctaIsExternal = opts.ctaIsExternal || false;
        var badgeText = opts.badgeText || '';
        var showBadge = opts.showBadge !== false;
        var trusts = opts.trusts || [];
        var showTrusts = opts.showTrusts !== false;
        var avatarOverlap = opts.avatarOverlap !== undefined ? opts.avatarOverlap : -14;
        var avatarSize = opts.avatarSize || 48;
        var layout = opts.layout || 'centered';
        var bgColor = opts.bgColor || '#ffffff';
        var headingColor = opts.headingColor || '#111827';
        var headingSize = opts.headingSize || 30;
        var textColor = opts.textColor || '#6b7280';
        var countColor = opts.countColor || '#111827';
        var ctaBg = opts.ctaBg || '#7c3aed';
        var ctaColor = opts.ctaColor || '#ffffff';
        var badgeBg = opts.badgeBg || '#f0fdf4';
        var badgeColor = opts.badgeColor || '#15803d';
        var avatarBorderColor = opts.avatarBorderColor || '#ffffff';
        var trustColor = opts.trustColor || '#9ca3af';
        var maxWidth = opts.maxWidth || 700;
        var paddingTop = opts.paddingTop !== undefined ? opts.paddingTop : 80;
        var paddingBottom = opts.paddingBottom !== undefined ? opts.paddingBottom : 80;
        var isSplit = layout === 'split';

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-coms-wrap';
        wrap.style.cssText = 'background:' + bgColor + ';padding-top:' + paddingTop + 'px;padding-bottom:' + paddingBottom + 'px;';
        typoCssVarsForEl(wrap, opts.typoHeading, '--bkcoms-heading-');
        typoCssVarsForEl(wrap, opts.typoBody, '--bkcoms-body-');

        var inner = document.createElement('div');
        inner.className = 'bkbg-coms-inner bkbg-coms-inner--' + (isSplit ? 'split' : 'centered');
        inner.style.maxWidth = maxWidth + 'px';
        wrap.appendChild(inner);

        /* left column (avatars + count) */
        var leftCol = document.createElement('div');
        if (isSplit) leftCol.style.flexShrink = '0';

        /* avatar strip */
        var avRow = document.createElement('div');
        avRow.className = 'bkbg-coms-avatars';
        avatars.forEach(function (av, idx) {
            var aWrap = document.createElement('div');
            aWrap.className = 'bkbg-coms-avatar-wrap';
            aWrap.style.cssText = 'margin-left:' + (idx === 0 ? 0 : avatarOverlap) + 'px;z-index:' + (avatars.length - idx) + ';position:relative;';

            if (av.imageUrl) {
                var img = document.createElement('img');
                img.className = 'bkbg-coms-avatar';
                img.src = av.imageUrl;
                img.alt = av.alt || av.name || '';
                img.style.cssText = 'width:' + avatarSize + 'px;height:' + avatarSize + 'px;border-color:' + avatarBorderColor;
                aWrap.appendChild(img);
            } else {
                var ph = document.createElement('div');
                ph.className = 'bkbg-coms-avatar-placeholder';
                ph.style.cssText = 'width:' + avatarSize + 'px;height:' + avatarSize + 'px;border-color:' + avatarBorderColor;
                ph.textContent = '👤';
                aWrap.appendChild(ph);
            }
            avRow.appendChild(aWrap);
        });
        leftCol.appendChild(avRow);

        /* count */
        var countRow = document.createElement('div');
        countRow.className = 'bkbg-coms-count-row';
        var countEl = document.createElement('span');
        countEl.className = 'bkbg-coms-count';
        countEl.style.color = countColor;
        countEl.textContent = memberCount;
        countRow.appendChild(countEl);
        var countLbl = document.createElement('span');
        countLbl.className = 'bkbg-coms-count-label';
        countLbl.style.color = textColor;
        countLbl.textContent = memberCountLabel;
        countRow.appendChild(countLbl);
        leftCol.appendChild(countRow);

        inner.appendChild(leftCol);

        /* right column (heading + CTA + trusts) */
        var rightCol = document.createElement('div');
        rightCol.style.flex = '1';

        if (showHeading) {
            if (heading) {
                var h = document.createElement('h2');
                h.className = 'bkbg-coms-heading';
                h.style.color = headingColor;
                h.textContent = heading;
                rightCol.appendChild(h);
            }
            if (subtext) {
                var sub = document.createElement('p');
                sub.className = 'bkbg-coms-sub';
                sub.style.color = textColor;
                sub.textContent = subtext;
                rightCol.appendChild(sub);
            }
        }

        if (ctaEnabled || showBadge) {
            var ctaRow = document.createElement('div');
            ctaRow.className = 'bkbg-coms-cta-row';
            if (ctaEnabled && ctaLabel) {
                var cta = document.createElement('a');
                cta.className = 'bkbg-coms-cta';
                cta.href = ctaUrl;
                cta.style.cssText = 'background:' + ctaBg + ';color:' + ctaColor;
                if (ctaIsExternal) { cta.target = '_blank'; cta.rel = 'noopener noreferrer'; }
                cta.textContent = ctaLabel;
                ctaRow.appendChild(cta);
            }
            if (showBadge && badgeText) {
                var badge = document.createElement('span');
                badge.className = 'bkbg-coms-badge';
                badge.style.cssText = 'background:' + badgeBg + ';color:' + badgeColor;
                badge.textContent = badgeText;
                ctaRow.appendChild(badge);
            }
            rightCol.appendChild(ctaRow);
        }

        if (showTrusts && trusts.length) {
            var trustRow = document.createElement('div');
            trustRow.className = 'bkbg-coms-trusts';
            trusts.forEach(function (t) {
                var ts = document.createElement('span');
                ts.className = 'bkbg-coms-trust';
                ts.style.color = trustColor;
                ts.textContent = '✓ ' + t.text;
                trustRow.appendChild(ts);
            });
            rightCol.appendChild(trustRow);
        }

        inner.appendChild(rightCol);
        app.replaceWith(wrap);
    });
})();

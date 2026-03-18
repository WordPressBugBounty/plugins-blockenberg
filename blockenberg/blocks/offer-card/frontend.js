wp.domReady(function () {
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

    document.querySelectorAll('.bkbg-ofr-app').forEach(function (el) {
        var attr = JSON.parse(el.dataset.opts || '{}');
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-ofr-wrap';
        wrap.style.background = attr.bgColor || '#ffffff';
        wrap.style.paddingTop = (attr.paddingTop || 64) + 'px';
        wrap.style.paddingBottom = (attr.paddingBottom || 64) + 'px';
        typoCssVarsForEl(wrap, attr.headingTypo, '--bkbg-ofr-hd-');
        typoCssVarsForEl(wrap, attr.descTypo, '--bkbg-ofr-ds-');
        typoCssVarsForEl(wrap, attr.ctaTypo, '--bkbg-ofr-ct-');

        var card = document.createElement('div');
        var layoutClass = attr.layout === 'banner' ? ' bkbg-ofr-card--banner' : attr.layout === 'minimal' ? ' bkbg-ofr-card--minimal' : '';
        card.className = 'bkbg-ofr-card' + layoutClass;
        card.style.setProperty('--ofr-card-bg', attr.cardBg || '#ffffff');
        card.style.setProperty('--ofr-border', attr.borderColor || '#e5e7eb');
        card.style.setProperty('--ofr-radius', (attr.borderRadius || 16) + 'px');
        card.style.maxWidth = (attr.maxWidth || 540) + 'px';

        var isBanner = attr.layout === 'banner';

        /* ---- MAIN section ---- */
        var main = document.createElement('div');
        main.className = 'bkbg-ofr-main';

        if (attr.showBadge && attr.badge) {
            var badge = document.createElement('div');
            badge.style.marginBottom = '16px';
            var badgePill = document.createElement('span');
            badgePill.className = 'bkbg-ofr-badge bkbg-ofr-badge--' + (attr.badgeStyle || 'hot');
            badgePill.style.background = attr.badgeBg || '#fef2f2';
            badgePill.style.color = attr.badgeColor || '#b91c1c';
            badgePill.innerHTML = attr.badge;
            badge.appendChild(badgePill);
            main.appendChild(badge);
        }

        var heading = document.createElement('h3');
        heading.className = 'bkbg-ofr-heading';
        heading.style.color = attr.headingColor || '#111827';
        heading.innerHTML = attr.heading || '';
        main.appendChild(heading);

        if (attr.description) {
            var desc = document.createElement('p');
            desc.className = 'bkbg-ofr-desc';
            desc.style.color = attr.descColor || '#6b7280';
            desc.innerHTML = attr.description;
            main.appendChild(desc);
        }

        if (attr.showPrice) {
            var priceRow = document.createElement('div');
            priceRow.className = 'bkbg-ofr-price-row';

            var salePrice = document.createElement('span');
            salePrice.className = 'bkbg-ofr-sale-price';
            salePrice.style.color = attr.priceColor || '#111827';
            salePrice.textContent = (attr.currency || '$') + (attr.salePrice || '0');
            priceRow.appendChild(salePrice);

            if (attr.originalPrice) {
                var orig = document.createElement('span');
                orig.className = 'bkbg-ofr-original-price';
                orig.style.color = attr.strikethroughColor || '#9ca3af';
                orig.textContent = (attr.currency || '$') + attr.originalPrice;
                priceRow.appendChild(orig);
            }

            main.appendChild(priceRow);
        }

        /* If banner, append main now, action comes separately */
        if (isBanner) {
            card.appendChild(main);
        }

        /* ---- ACTION section ---- */
        var action = document.createElement('div');
        action.className = 'bkbg-ofr-action';

        /* Countdown */
        if (attr.showCountdown && attr.countdownEnd) {
            var endDate = new Date(attr.countdownEnd).getTime();
            var cdWrap = document.createElement('div');
            cdWrap.className = 'bkbg-ofr-countdown';

            var units = [
                { key: 'd', label: 'Days',    ms: 86400000 },
                { key: 'h', label: 'Hrs',     ms: 3600000  },
                { key: 'm', label: 'Min',     ms: 60000    },
                { key: 's', label: 'Sec',     ms: 1000     }
            ];

            var numSpans = {};
            units.forEach(function (unit) {
                var box = document.createElement('div');
                box.className = 'bkbg-ofr-countdown-unit';
                var num = document.createElement('span');
                num.className = 'bkbg-ofr-countdown-num';
                num.textContent = '00';
                numSpans[unit.key] = num;
                var lbl = document.createElement('span');
                lbl.className = 'bkbg-ofr-countdown-lbl';
                lbl.textContent = unit.label;
                box.appendChild(num);
                box.appendChild(lbl);
                cdWrap.appendChild(box);
            });

            function updateTimer() {
                var diff = endDate - Date.now();
                if (diff <= 0) {
                    units.forEach(function (u) { numSpans[u.key].textContent = '00'; });
                    return;
                }
                var d = Math.floor(diff / 86400000);
                var h = Math.floor((diff % 86400000) / 3600000);
                var m = Math.floor((diff % 3600000) / 60000);
                var s = Math.floor((diff % 60000) / 1000);
                numSpans.d.textContent = String(d).padStart(2, '0');
                numSpans.h.textContent = String(h).padStart(2, '0');
                numSpans.m.textContent = String(m).padStart(2, '0');
                numSpans.s.textContent = String(s).padStart(2, '0');
            }

            updateTimer();
            setInterval(updateTimer, 1000);
            action.appendChild(cdWrap);
        }

        /* Includes */
        if (attr.showIncludes && attr.includes && attr.includes.length) {
            var ul = document.createElement('ul');
            ul.className = 'bkbg-ofr-includes';
            attr.includes.forEach(function (item) {
                if (!item.text) return;
                var li = document.createElement('li');
                li.className = 'bkbg-ofr-include-item';
                li.style.color = attr.includeColor || '#374151';

                var chk = document.createElement('span');
                chk.className = 'bkbg-ofr-check';
                chk.style.color = attr.checkColor || '#16a34a';
                chk.textContent = '✓';

                var txt = document.createElement('span');
                txt.textContent = item.text;

                li.appendChild(chk);
                li.appendChild(txt);
                ul.appendChild(li);
            });
            action.appendChild(ul);
        }

        /* CTA */
        var cta = document.createElement('a');
        cta.className = 'bkbg-ofr-cta';
        cta.href = attr.ctaUrl || '#';
        cta.style.background = attr.ctaBg || '#7c3aed';
        cta.style.color = attr.ctaColor || '#ffffff';
        if (attr.ctaOpenNewTab) {
            cta.target = '_blank';
            cta.rel = 'noopener noreferrer';
        }
        cta.textContent = attr.ctaLabel || 'Get access';
        action.appendChild(cta);

        /* Disclaimer */
        if (attr.showDisclaimer && attr.disclaimer) {
            var disc = document.createElement('p');
            disc.className = 'bkbg-ofr-disclaimer';
            disc.style.color = attr.disclaimerColor || '#9ca3af';
            disc.innerHTML = attr.disclaimer;
            action.appendChild(disc);
        }

        if (isBanner) {
            card.appendChild(action);
        } else {
            /* stacked: main content then action */
            card.appendChild(main);
            card.appendChild(action);
        }

        wrap.appendChild(card);
        el.replaceWith(wrap);
    });
});

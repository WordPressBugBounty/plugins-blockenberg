wp.domReady(function () {
    var _typoKeys = {
        family: 'font-family', weight: 'font-weight', style: 'font-style',
        decoration: 'text-decoration', transform: 'text-transform',
        sizeDesktop: 'font-size-d', sizeTablet: 'font-size-t', sizeMobile: 'font-size-m',
        lineHeightDesktop: 'line-height-d', lineHeightTablet: 'line-height-t', lineHeightMobile: 'line-height-m',
        letterSpacing: 'letter-spacing', wordSpacing: 'word-spacing'
    };
    function typoCssVarsForEl(el, typo, prefix) {
        if (!typo || typeof typo !== 'object') return;
        Object.keys(typo).forEach(function (k) {
            var v = typo[k]; if (v === '' || v == null) return;
            var css = _typoKeys[k]; if (!css) return;
            if ((k === 'letterSpacing' || k === 'wordSpacing') && typeof v === 'number') v = v + 'px';
            if ((/^(sizeDesktop|sizeTablet|sizeMobile)$/).test(k) && typeof v === 'number') v = v + 'px';
            el.style.setProperty(prefix + css, '' + v);
        });
    }

    document.querySelectorAll('.bkbg-lgm-app').forEach(function (el) {
        var a = JSON.parse(el.dataset.opts || '{}');
        var isCentered = a.layout === 'centered';
        var isLeft = a.layout === 'image-left';

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-lgm-wrap';
        wrap.style.background = a.bgColor || '#f8f5ff';
        wrap.style.paddingTop = (a.paddingTop || 80) + 'px';
        wrap.style.paddingBottom = (a.paddingBottom || 80) + 'px';

        var inner = document.createElement('div');
        inner.className = 'bkbg-lgm-inner bkbg-lgm-inner--' + (isCentered ? 'centered' : isLeft ? 'left' : 'right');
        inner.style.maxWidth = (a.maxWidth || 1060) + 'px';
        inner.style.setProperty('--lgm-accent', a.accentColor || '#7c3aed');

        typoCssVarsForEl(inner, a.headingTypo, '--bkbg-lgm-h-');
        typoCssVarsForEl(inner, a.subtextTypo, '--bkbg-lgm-st-');
        typoCssVarsForEl(inner, a.buttonTypo, '--bkbg-lgm-bt-');

        /* === Mockup image === */
        var mockupWrap = document.createElement('div');
        mockupWrap.className = 'bkbg-lgm-mockup-wrap';

        if (a.imageUrl) {
            var img = document.createElement('img');
            img.src = a.imageUrl;
            img.alt = a.imageAlt || '';
            img.className = 'bkbg-lgm-mockup-img bkbg-lgm-mockup-img--' + (a.imageStyle || 'floating');
            mockupWrap.appendChild(img);
        } else {
            var ph = document.createElement('div');
            ph.className = 'bkbg-lgm-mockup-placeholder';
            ph.textContent = '📥';
            mockupWrap.appendChild(ph);
        }
        inner.appendChild(mockupWrap);

        /* === Text panel === */
        var textEl = document.createElement('div');
        textEl.className = 'bkbg-lgm-text';
        textEl.style.flex = '1';

        if (a.showBadge && a.badge) {
            var badge = document.createElement('div');
            var badgePill = document.createElement('span');
            badgePill.className = 'bkbg-lgm-badge';
            badgePill.style.background = a.badgeBg || '#dcfce7';
            badgePill.style.color = a.badgeColor || '#166534';
            badgePill.innerHTML = a.badge;
            badge.appendChild(badgePill);
            textEl.appendChild(badge);
        }

        var heading = document.createElement('h2');
        heading.className = 'bkbg-lgm-heading';
        heading.style.color = a.headingColor || '#111827';
        heading.innerHTML = a.heading || '';
        textEl.appendChild(heading);

        if (a.subtext) {
            var sub = document.createElement('p');
            sub.className = 'bkbg-lgm-subtext';
            sub.style.color = a.subtextColor || '#4b5563';
            sub.innerHTML = a.subtext;
            textEl.appendChild(sub);
        }

        if (a.showBenefits && a.benefits && a.benefits.length) {
            var ul = document.createElement('ul');
            ul.className = 'bkbg-lgm-benefits';
            a.benefits.forEach(function (b) {
                if (!b.text) return;
                var li = document.createElement('li');
                li.className = 'bkbg-lgm-benefit';
                li.style.color = a.benefitColor || '#374151';
                var chk = document.createElement('span');
                chk.className = 'bkbg-lgm-check';
                chk.style.color = a.checkColor || '#7c3aed';
                chk.textContent = '✓';
                var txt = document.createElement('span');
                txt.innerHTML = b.text;
                li.appendChild(chk);
                li.appendChild(txt);
                ul.appendChild(li);
            });
            textEl.appendChild(ul);
        }

        if (a.formEnabled) {
            var form = document.createElement('form');
            form.className = 'bkbg-lgm-form';
            if (a.formAction) { form.action = a.formAction; form.method = 'post'; }
            form.addEventListener('submit', function (e) {
                if (!a.formAction) {
                    e.preventDefault();
                    form.style.display = 'none';
                    successDiv.classList.add('bkbg-lgm-success--visible');
                }
            });

            var row = document.createElement('div');
            row.className = 'bkbg-lgm-form-row';

            var input = document.createElement('input');
            input.type = 'email';
            input.name = 'email';
            input.required = true;
            input.placeholder = a.formPlaceholder || 'Enter your email address';
            input.className = 'bkbg-lgm-input';

            var submit = document.createElement('button');
            submit.type = 'submit';
            submit.className = 'bkbg-lgm-submit';
            submit.style.background = a.ctaBg || '#7c3aed';
            submit.style.color = a.ctaColor || '#ffffff';
            submit.innerHTML = a.formSubmitLabel || 'Get instant access →';

            row.appendChild(input);
            row.appendChild(submit);
            form.appendChild(row);

            if (a.showPrivacy && a.privacyNote) {
                var privacy = document.createElement('p');
                privacy.className = 'bkbg-lgm-privacy';
                privacy.style.color = a.privacyColor || '#9ca3af';
                privacy.style.textAlign = isCentered ? 'center' : 'left';
                privacy.innerHTML = a.privacyNote;
                form.appendChild(privacy);
            }

            textEl.appendChild(form);

            var successDiv = document.createElement('div');
            successDiv.className = 'bkbg-lgm-success';
            successDiv.innerHTML = '🎉 You\'re in! Check your email for the download link.';
            textEl.appendChild(successDiv);
        }

        inner.appendChild(textEl);
        wrap.appendChild(inner);
        el.replaceWith(wrap);
    });
});

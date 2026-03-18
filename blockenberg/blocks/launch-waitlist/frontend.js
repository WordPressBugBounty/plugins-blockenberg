(function () {
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

    function init() {
        document.querySelectorAll('.bkbg-lwl-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                badge: '🚀 Coming Soon',
                heading: 'Something Big Is Coming',
                subtext: 'Join the waitlist to get early access and an exclusive discount.',
                launchDate: '',
                showCountdown: true,
                formPlaceholder: 'Enter your email address',
                formSubmitLabel: 'Join the Waitlist',
                formAction: '',
                successMessage: '🎉 You\'re on the list! We\'ll be in touch soon.',
                benefits: [
                    { text: 'Early access before public launch' },
                    { text: 'Exclusive founding member discount' },
                    { text: 'Shape the product with your feedback' }
                ],
                showBenefits: true,
                socialProof: 'Join 1,200+ people already on the list',
                showSocialProof: true,
                layout: 'centered',
                bgColor: '#0f172a',
                accentColor: '#6366f1',
                headingColor: '#f8fafc',
                subColor: '#94a3b8',
                badgeBg: 'rgba(99,102,241,0.2)',
                badgeColor: '#a5b4fc',
                countdownBg: '#1e293b',
                countdownNumColor: '#f8fafc',
                countdownLabelColor: '#64748b',
                inputBg: '#1e293b',
                inputColor: '#f1f5f9',
                inputBorder: '#334155',
                submitBg: '#6366f1',
                submitColor: '#ffffff',
                benefitColor: '#cbd5e1',
                socialProofColor: '#64748b',
                maxWidth: 680,
                paddingTop: 100,
                paddingBottom: 100
            }, opts);

            el.parentElement && (el.parentElement.style.background = o.bgColor);

            var isSplit = o.layout === 'split';

            var inner = document.createElement('div');
            inner.className = 'bkbg-lwl-inner layout-' + o.layout;
            inner.style.cssText = 'max-width:' + o.maxWidth + 'px;margin:0 auto;padding:' + o.paddingTop + 'px 24px ' + o.paddingBottom + 'px;';

            typoCssVarsForEl(inner, o.headingTypo, '--bkbg-lwl-h-');
            typoCssVarsForEl(inner, o.subtextTypo, '--bkbg-lwl-st-');
            typoCssVarsForEl(inner, o.buttonTypo, '--bkbg-lwl-bt-');

            /* Split grid wrapper */
            var contentTarget = inner;
            var leftCol, rightCol;
            if (isSplit) {
                var splitGrid = document.createElement('div');
                splitGrid.className = 'bkbg-lwl-split-grid';

                leftCol = document.createElement('div');
                rightCol = document.createElement('div');
                splitGrid.appendChild(leftCol);
                splitGrid.appendChild(rightCol);
                inner.appendChild(splitGrid);
            }

            /* Badge */
            var badge = document.createElement('div');
            badge.className = 'bkbg-lwl-badge';
            badge.style.cssText = 'background:' + o.badgeBg + ';color:' + o.badgeColor;
            badge.innerHTML = o.badge;
            (isSplit ? leftCol : inner).appendChild(badge);

            /* Heading */
            var heading = document.createElement('h2');
            heading.className = 'bkbg-lwl-heading';
            heading.style.color = o.headingColor;
            heading.innerHTML = o.heading;
            (isSplit ? leftCol : inner).appendChild(heading);

            /* Subtext */
            var sub = document.createElement('p');
            sub.className = 'bkbg-lwl-sub';
            sub.style.color = o.subColor;
            sub.innerHTML = o.subtext;
            (isSplit ? leftCol : inner).appendChild(sub);

            /* Countdown */
            if (o.showCountdown) {
                var countdown = document.createElement('div');
                countdown.className = 'bkbg-lwl-countdown';

                var units = ['days', 'hours', 'mins', 'secs'];
                var unitEls = {};

                units.forEach(function (u) {
                    var box = document.createElement('div');
                    box.className = 'bkbg-lwl-unit';
                    box.style.background = o.countdownBg;

                    var num = document.createElement('div');
                    num.className = 'bkbg-lwl-num';
                    num.style.color = o.countdownNumColor;
                    num.textContent = '00';

                    var lbl = document.createElement('div');
                    lbl.className = 'bkbg-lwl-label';
                    lbl.style.color = o.countdownLabelColor;
                    lbl.textContent = u.toUpperCase();

                    box.appendChild(num);
                    box.appendChild(lbl);
                    countdown.appendChild(box);
                    unitEls[u] = num;
                });

                /* Tick */
                var endTime = o.launchDate ? new Date(o.launchDate).getTime() : (Date.now() + 14 * 86400000);

                function tick() {
                    var now = Date.now();
                    var diff = Math.max(0, endTime - now);
                    var d = Math.floor(diff / 86400000);
                    var h = Math.floor((diff % 86400000) / 3600000);
                    var m = Math.floor((diff % 3600000) / 60000);
                    var s = Math.floor((diff % 60000) / 1000);
                    unitEls.days.textContent = String(d).padStart(2, '0');
                    unitEls.hours.textContent = String(h).padStart(2, '0');
                    unitEls.mins.textContent = String(m).padStart(2, '0');
                    unitEls.secs.textContent = String(s).padStart(2, '0');
                }
                tick();
                setInterval(tick, 1000);

                (isSplit ? rightCol : inner).appendChild(countdown);
            }

            /* Form */
            var formWrap = document.createElement('div');
            formWrap.className = 'bkbg-lwl-form-wrap';
            formWrap.style.borderColor = o.inputBorder;

            var input = document.createElement('input');
            input.type = 'email';
            input.className = 'bkbg-lwl-input';
            input.placeholder = o.formPlaceholder;
            input.required = true;
            input.style.cssText = 'background:' + o.inputBg + ';color:' + o.inputColor;

            var submit = document.createElement('button');
            submit.className = 'bkbg-lwl-submit';
            submit.type = 'submit';
            submit.style.cssText = 'background:' + o.submitBg + ';color:' + o.submitColor;
            submit.textContent = o.formSubmitLabel;

            var successDiv = document.createElement('div');
            successDiv.className = 'bkbg-lwl-success';
            successDiv.style.cssText = 'display:none;background:rgba(34,197,94,0.1);color:#86efac;border:1px solid rgba(34,197,94,0.2)';
            successDiv.innerHTML = o.successMessage;

            submit.addEventListener('click', function (e) {
                e.preventDefault();
                if (!input.value || !input.validity.valid) {
                    input.style.outline = '2px solid #ef4444';
                    setTimeout(function () { input.style.outline = 'none'; }, 2000);
                    return;
                }
                if (o.formAction) {
                    var formData = new FormData();
                    formData.append('email', input.value);
                    fetch(o.formAction, { method: 'POST', body: formData }).catch(function () {});
                }
                formWrap.style.display = 'none';
                successDiv.style.display = 'block';
            });

            formWrap.appendChild(input);
            formWrap.appendChild(submit);
            (isSplit ? rightCol : inner).appendChild(formWrap);
            (isSplit ? rightCol : inner).appendChild(successDiv);

            /* Benefits */
            if (o.showBenefits && o.benefits && o.benefits.length) {
                var benefits = document.createElement('div');
                benefits.className = 'bkbg-lwl-benefits';

                o.benefits.forEach(function (b) {
                    var item = document.createElement('span');
                    item.className = 'bkbg-lwl-benefit';
                    item.style.color = o.benefitColor;

                    var check = document.createElement('em');
                    check.style.cssText = 'color:' + o.accentColor + ';font-style:normal;font-weight:700';
                    check.textContent = '✓';

                    item.appendChild(check);
                    item.appendChild(document.createTextNode(' ' + b.text));
                    benefits.appendChild(item);
                });

                (isSplit ? rightCol : inner).appendChild(benefits);
            }

            /* Social proof */
            if (o.showSocialProof && o.socialProof) {
                var sp = document.createElement('p');
                sp.className = 'bkbg-lwl-social-proof';
                sp.style.color = o.socialProofColor;
                sp.textContent = o.socialProof;
                (isSplit ? rightCol : inner).appendChild(sp);
            }

            el.appendChild(inner);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();

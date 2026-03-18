(function () {
    'use strict';

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

    var STORE_PREFIX = 'bkbg-nlpop-';

    /* ── helpers ── */
    function hexAlpha(hex, pct) {
        var r = parseInt(hex.slice(1, 3), 16);
        var g = parseInt(hex.slice(3, 5), 16);
        var b = parseInt(hex.slice(5, 7), 16);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + (pct / 100).toFixed(2) + ')';
    }

    function validEmail(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
    }

    function storageKey(cookieName) {
        return STORE_PREFIX + (cookieName || 'default');
    }

    function isSuppressed(key, days) {
        if (!days) return false;
        try {
            var raw = localStorage.getItem(key);
            if (!raw) return false;
            var data = JSON.parse(raw);
            var elapsed = (Date.now() - data.ts) / 86400000; // days
            return elapsed < days;
        } catch (e) {
            return false;
        }
    }

    function saveLocal(key, action) {
        try {
            localStorage.setItem(key, JSON.stringify({ ts: Date.now(), action: action }));
        } catch (e) {}
    }

    /* ── build overlay DOM ── */
    function buildOverlay(o) {
        var overlay = document.createElement('div');
        overlay.className = 'bkbg-nlpop-overlay';
        overlay.style.backgroundColor = hexAlpha(o.overlayBg, o.overlayOpacity);

        var box = document.createElement('div');
        box.className = 'bkbg-nlpop-box';
        box.style.maxWidth = o.maxWidth + 'px';
        box.style.borderRadius = o.borderRadius + 'px';
        box.style.background = o.popupBg;
        box.style.boxShadow = '0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10)';

        var hasImage = o.imageUrl && o.imagePosition !== 'none';
        var isSide = hasImage && (o.imagePosition === 'left' || o.imagePosition === 'right');
        var isTop  = hasImage && o.imagePosition === 'top';

        /* inner wrapper */
        var inner = document.createElement('div');
        inner.className = 'bkbg-nlpop-inner' + (isSide ? ' layout-' + o.imagePosition : '');

        /* close button */
        if (o.showClose) {
            var closeBtn = document.createElement('button');
            closeBtn.className = 'bkbg-nlpop-close';
            closeBtn.setAttribute('aria-label', 'Close');
            closeBtn.innerHTML = '&times;';
            closeBtn.style.background = o.closeBg;
            closeBtn.style.color = o.closeColor;
            box.appendChild(closeBtn);
        }

        /* top image */
        if (isTop) {
            var topImg = document.createElement('div');
            topImg.className = 'bkbg-nlpop-top-img';
            topImg.style.backgroundImage = 'url(' + o.imageUrl + ')';
            inner.appendChild(topImg);
        }

        /* left side image */
        if (isSide && o.imagePosition === 'left') {
            var sideL = document.createElement('div');
            sideL.className = 'bkbg-nlpop-side-img';
            sideL.style.backgroundImage = 'url(' + o.imageUrl + ')';
            inner.appendChild(sideL);
        }

        /* content block */
        var contentWrap = document.createElement('div');
        contentWrap.className = 'bkbg-nlpop-content';
        contentWrap.style.padding = o.padding + 'px';
        /* compress top padding if top image exists */
        if (isTop) {
            contentWrap.style.paddingTop = Math.round(o.padding * 0.7) + 'px';
        }

        var heading = document.createElement('h2');
        heading.className = 'bkbg-nlpop-heading';
        heading.textContent = o.heading;
        heading.style.color = o.headingColor;

        var subtext = document.createElement('p');
        subtext.className = 'bkbg-nlpop-subtext';
        subtext.textContent = o.subtext;
        subtext.style.color = o.textColor;

        typoCssVarsForEl(box, o.headingTypo, '--bkbg-nlpop-ht-');
        typoCssVarsForEl(box, o.subtextTypo, '--bkbg-nlpop-st-');

        /* form */
        var form = document.createElement('form');
        form.className = 'bkbg-nlpop-form';
        form.setAttribute('novalidate', '');

        var emailRow = document.createElement('div');
        emailRow.className = 'bkbg-nlpop-email-row';

        var input = document.createElement('input');
        input.type = 'email';
        input.className = 'bkbg-nlpop-input';
        input.placeholder = o.emailPlaceholder;
        input.style.background = o.inputBg;
        input.style.borderColor = o.inputBorder;
        input.style.color = o.inputColor;

        var submit = document.createElement('button');
        submit.type = 'submit';
        submit.className = 'bkbg-nlpop-submit';
        submit.textContent = o.buttonLabel;
        submit.style.background = o.buttonBg;
        submit.style.color = o.buttonColor;
        submit.style.fontSize = o.ctaSize + 'px';

        var errorMsg = document.createElement('div');
        errorMsg.className = 'bkbg-nlpop-error';

        emailRow.appendChild(input);
        emailRow.appendChild(submit);
        form.appendChild(emailRow);
        form.appendChild(errorMsg);

        /* success state */
        var successDiv = document.createElement('div');
        successDiv.className = 'bkbg-nlpop-success';
        successDiv.style.color = o.headingColor;

        var successIcon = document.createElement('div');
        successIcon.className = 'bkbg-nlpop-success-icon';
        successIcon.textContent = '🎉';

        var successMsg = document.createElement('p');
        successMsg.className = 'bkbg-nlpop-success-msg';
        successMsg.textContent = o.successMessage;

        var successSub = document.createElement('p');
        successSub.className = 'bkbg-nlpop-success-sub';
        successSub.textContent = o.successSubtext;
        successSub.style.color = o.textColor;

        successDiv.appendChild(successIcon);
        successDiv.appendChild(successMsg);
        successDiv.appendChild(successSub);

        contentWrap.appendChild(heading);
        contentWrap.appendChild(subtext);
        contentWrap.appendChild(form);
        contentWrap.appendChild(successDiv);

        inner.appendChild(contentWrap);

        /* right side image */
        if (isSide && o.imagePosition === 'right') {
            var sideR = document.createElement('div');
            sideR.className = 'bkbg-nlpop-side-img';
            sideR.style.backgroundImage = 'url(' + o.imageUrl + ')';
            inner.appendChild(sideR);
        }

        box.appendChild(inner);
        overlay.appendChild(box);

        return { overlay: overlay, box: box, closeBtn: box.querySelector('.bkbg-nlpop-close'), form: form, input: input, errorMsg: errorMsg, successDiv: successDiv };
    }

    /* ── open / close ── */
    function openPopup(els, key, days) {
        document.body.appendChild(els.overlay);
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                els.overlay.classList.add('is-visible');
            });
        });
    }

    function closePopup(els, key, action) {
        saveLocal(key, action || 'dismissed');
        els.overlay.classList.remove('is-visible');
        setTimeout(function () {
            if (els.overlay.parentNode) {
                els.overlay.parentNode.removeChild(els.overlay);
            }
        }, 380);
    }

    /* ── wires events ── */
    function wireEvents(els, o, key) {
        /* close button */
        if (els.closeBtn) {
            els.closeBtn.addEventListener('click', function () {
                closePopup(els, key, 'dismissed');
            });
        }

        /* overlay click */
        if (o.overlayClickClose) {
            els.overlay.addEventListener('click', function (e) {
                if (e.target === els.overlay) {
                    closePopup(els, key, 'dismissed');
                }
            });
        }

        /* escape key */
        var onKey = function (e) {
            if (e.key === 'Escape') {
                closePopup(els, key, 'dismissed');
                document.removeEventListener('keydown', onKey);
            }
        };
        document.addEventListener('keydown', onKey);

        /* form submit */
        els.form.addEventListener('submit', function (e) {
            e.preventDefault();
            var val = els.input.value.trim();
            if (!validEmail(val)) {
                els.errorMsg.textContent = 'Please enter a valid email address.';
                els.input.focus();
                return;
            }
            els.errorMsg.textContent = '';
            /* show success */
            els.form.style.display = 'none';
            els.successDiv.classList.add('is-visible');
            saveLocal(key, 'subscribed');
            /* auto-close after 3s */
            setTimeout(function () {
                closePopup(els, key, 'subscribed');
            }, 3000);
        });

        /* clear error on input */
        els.input.addEventListener('input', function () {
            els.errorMsg.textContent = '';
        });
    }

    /* ── setup triggers ── */
    function setupTriggers(o, key, cb) {
        var fired = false;
        function fire() {
            if (fired) return;
            fired = true;
            cb();
        }

        var type = o.triggerType;

        /* delay trigger */
        if (type === 'delay' || type === 'both') {
            setTimeout(fire, (o.delaySeconds || 5) * 1000);
        }

        /* scroll trigger */
        if (type === 'scroll' || type === 'both') {
            function onScroll() {
                var scrolled = (window.scrollY || document.documentElement.scrollTop);
                var total = document.documentElement.scrollHeight - window.innerHeight;
                if (total > 0 && (scrolled / total) * 100 >= (o.scrollPercent || 40)) {
                    window.removeEventListener('scroll', onScroll);
                    fire();
                }
            }
            window.addEventListener('scroll', onScroll, { passive: true });
        }

        /* exit intent (desktop: cursor leaves window top; mobile: timeout fallback) */
        if (o.exitIntent) {
            var isMobile = /Mobi|Android/i.test(navigator.userAgent);
            if (isMobile) {
                setTimeout(fire, 15000);
            } else {
                var onMouse = function (e) {
                    if (e.clientY < 10) {
                        document.removeEventListener('mouseleave', onMouse);
                        fire();
                    }
                };
                document.addEventListener('mouseleave', onMouse);
            }
        }
    }

    /* ── main init ── */
    function init() {
        document.querySelectorAll('.bkbg-nlpop-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                heading: "Don't miss out! 🎁",
                subtext: 'Join 10,000+ readers. Get the best content delivered to your inbox every week.',
                emailPlaceholder: 'Enter your email address',
                buttonLabel: 'Subscribe Now',
                successMessage: "🎉 You're in! Check your inbox for a welcome email.",
                successSubtext: 'You can unsubscribe at any time.',
                imageUrl: '',
                imageId: 0,
                imagePosition: 'none',
                triggerType: 'delay',
                delaySeconds: 5,
                scrollPercent: 40,
                exitIntent: false,
                cookieName: 'bkbg-nlpop',
                cookieDays: 7,
                showClose: true,
                overlayClickClose: true,
                maxWidth: 520,
                borderRadius: 16,
                padding: 40,
                headingSize: 26,
                textSize: 15,
                ctaSize: 15,
                overlayOpacity: 60,
                overlayBg: '#000000',
                popupBg: '#ffffff',
                headingColor: '#111827',
                textColor: '#6b7280',
                inputBg: '#f9fafb',
                inputBorder: '#d1d5db',
                inputColor: '#374151',
                buttonBg: '#6366f1',
                buttonColor: '#ffffff',
                closeBg: '#f3f4f6',
                closeColor: '#6b7280',
                successMessage: "🎉 You're in! Check your inbox for a welcome email.",
                successSubtext: 'You can unsubscribe at any time.'
            }, opts);

            var key = storageKey(o.cookieName);

            /* check suppression */
            if (isSuppressed(key, o.cookieDays)) return;

            setupTriggers(o, key, function () {
                var els = buildOverlay(o);
                wireEvents(els, o, key);
                openPopup(els, key, o.cookieDays);
            });
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();

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

    function init() {
        document.querySelectorAll('.bkbg-pop-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                triggerLabel: 'Open Popup', triggerStyle: 'filled', triggerSize: 'md',
                triggerAlign: 'center', triggerType: 'click', scrollDepth: 40, timeDelay: 3,
                showOnce: 'always', popupPosition: 'center', popupSize: 'md', popupWidth: 560,
                popupAnimation: 'scale', borderRadius: 16, closeOnOverlay: true, showCloseBtn: true,
                imageUrl: '', imageAlt: '', imagePosition: 'top',
                heading: 'Get 20% Off Today',
                subtext: 'Subscribe to our newsletter and get your exclusive discount code instantly.',
                ctaLabel: 'Claim Your Discount', ctaUrl: '#', ctaNewTab: false,
                showCta: true, ctaStyle: 'filled', dismissLabel: 'No thanks', showDismiss: true,
                paddingTop: 0, paddingBottom: 0,
                overlayColor: '#000000', overlayOpacity: 60, popupBg: '#ffffff',
                headingColor: '#111827', textColor: '#4b5563',
                btnBg: '#6366f1', btnColor: '#ffffff',
                triggerBg: '#6366f1', triggerColor: '#ffffff', dismissColor: '#9ca3af',
                headingTypo: {}, bodyTypo: {}
            }, opts);

            /* Unique ID for frequency tracking */
            var uid = 'bkbg-pop-' + (appEl.dataset.uid || Math.random().toString(36).slice(2));
            appEl.dataset.uid = uid;

            /* Check show frequency */
            function canShow() {
                if (o.showOnce === 'session') return !sessionStorage.getItem(uid);
                if (o.showOnce === 'once') return !localStorage.getItem(uid);
                return true;
            }
            function markShown() {
                if (o.showOnce === 'session') sessionStorage.setItem(uid, '1');
                if (o.showOnce === 'once') localStorage.setItem(uid, '1');
            }

            /* Build overlay */
            var overlay = document.createElement('div');
            overlay.className = 'bkbg-pop-overlay pos-' + o.popupPosition;
            overlay.style.background = hexToRgba(o.overlayColor, o.overlayOpacity / 100);

            var pwMap = { sm: '400px', md: '560px', lg: '760px', custom: o.popupWidth + 'px' };
            var pw = pwMap[o.popupSize] || '560px';

            var box = document.createElement('div');
            box.className = 'bkbg-pop-box anim-' + o.popupAnimation;
            box.style.cssText = 'max-width:' + pw + ';border-radius:' + o.borderRadius + 'px;background:' + o.popupBg;
            box.setAttribute('role', 'dialog');
            box.setAttribute('aria-modal', 'true');

            typoCssVarsForEl(box, o.headingTypo, '--bkbg-pop-hd-');
            typoCssVarsForEl(box, o.bodyTypo, '--bkbg-pop-bd-');

            /* Close button */
            if (o.showCloseBtn) {
                var closeBtn = document.createElement('button');
                closeBtn.className = 'bkbg-pop-close';
                closeBtn.innerHTML = '&times;';
                closeBtn.setAttribute('aria-label', 'Close');
                closeBtn.addEventListener('click', closePopup);
                box.appendChild(closeBtn);
            }

            /* Inner layout */
            var inner = document.createElement('div');
            inner.className = 'bkbg-pop-inner img-' + (o.imageUrl ? o.imagePosition : 'none');

            if (o.imageUrl && o.imagePosition === 'top') {
                inner.appendChild(makeImage(true));
            }

            var rowWrap = document.createElement('div');
            rowWrap.style.display = 'flex';
            rowWrap.style.flex = '1';

            if (o.imageUrl && o.imagePosition === 'left') rowWrap.appendChild(makeImage(false));

            var body = document.createElement('div');
            body.className = 'bkbg-pop-body';

            var h = document.createElement('p');
            h.className = 'bkbg-pop-heading';
            h.innerHTML = o.heading;
            h.style.color = o.headingColor;
            body.appendChild(h);

            var txt = document.createElement('p');
            txt.className = 'bkbg-pop-text';
            txt.innerHTML = o.subtext;
            txt.style.color = o.textColor;
            body.appendChild(txt);

            if (o.showCta) {
                var cta = document.createElement('a');
                cta.className = 'bkbg-pop-cta';
                cta.href = o.ctaUrl || '#';
                if (o.ctaNewTab) { cta.target = '_blank'; cta.rel = 'noopener noreferrer'; }
                cta.textContent = o.ctaLabel;
                cta.style.cssText = [
                    o.ctaStyle === 'filled' ? 'background:' + o.btnBg + ';color:' + o.btnColor + ';border:none' : 'background:transparent;color:' + o.btnBg + ';border:2px solid ' + o.btnBg
                ].join(';');
                body.appendChild(cta);
            }

            if (o.showDismiss) {
                var dis = document.createElement('button');
                dis.className = 'bkbg-pop-dismiss';
                dis.textContent = o.dismissLabel;
                dis.style.color = o.dismissColor;
                dis.addEventListener('click', closePopup);
                body.appendChild(dis);
            }

            rowWrap.appendChild(body);
            if (o.imageUrl && o.imagePosition === 'right') rowWrap.appendChild(makeImage(false));

            inner.appendChild(rowWrap);
            box.appendChild(inner);
            overlay.appendChild(box);

            if (o.closeOnOverlay) {
                overlay.addEventListener('click', function (e) {
                    if (e.target === overlay) closePopup();
                });
            }

            document.body.appendChild(overlay);

            /* Open / close */
            function openPopup() {
                if (!canShow()) return;
                overlay.classList.add('is-open');
                document.body.style.overflow = 'hidden';
                markShown();
                box.focus && box.focus();
            }
            function closePopup() {
                overlay.classList.remove('is-open');
                document.body.style.overflow = '';
            }

            /* ESC key */
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') closePopup();
            });

            /* Trigger wrapper */
            var triggerWrap = document.createElement('div');
            triggerWrap.className = 'bkbg-pop-trigger-wrap align-' + o.triggerAlign;
            triggerWrap.style.cssText = 'padding-top:' + o.paddingTop + 'px;padding-bottom:' + o.paddingBottom + 'px';

            /* Build trigger button for 'click' (or show it even for auto triggers so user can also click) */
            if (o.triggerType === 'click') {
                var btn = buildTriggerBtn();
                btn.addEventListener('click', openPopup);
                triggerWrap.appendChild(btn);
            }

            /* Auto triggers */
            if (o.triggerType === 'scroll') {
                /* show button + listen */
                triggerWrap.appendChild(buildTriggerBtn()).addEventListener('click', openPopup);
                window.addEventListener('scroll', function onScroll() {
                    var pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
                    if (pct >= o.scrollDepth) { window.removeEventListener('scroll', onScroll); openPopup(); }
                }, { passive: true });
            }

            if (o.triggerType === 'delay') {
                triggerWrap.appendChild(buildTriggerBtn()).addEventListener('click', openPopup);
                setTimeout(openPopup, o.timeDelay * 1000);
            }

            if (o.triggerType === 'exit') {
                triggerWrap.appendChild(buildTriggerBtn()).addEventListener('click', openPopup);
                document.addEventListener('mouseleave', function onExit(e) {
                    if (e.clientY < 5) { document.removeEventListener('mouseleave', onExit); openPopup(); }
                });
            }

            appEl.parentNode.insertBefore(triggerWrap, appEl);

            /* Helpers */
            function buildTriggerBtn() {
                var b = document.createElement('button');
                b.className = 'bkbg-pop-btn size-' + o.triggerSize;
                b.textContent = o.triggerLabel;
                var s = [];
                if (o.triggerStyle === 'filled') {
                    s.push('background:' + o.triggerBg, 'color:' + o.triggerColor, 'border:none');
                } else if (o.triggerStyle === 'outline') {
                    s.push('background:transparent', 'color:' + o.triggerBg, 'border:2px solid ' + o.triggerBg);
                } else {
                    s.push('background:transparent', 'color:' + o.triggerBg, 'border:none');
                }
                b.style.cssText = s.join(';');
                return b;
            }

            function makeImage(isTop) {
                var img = document.createElement('img');
                img.className = 'bkbg-pop-img';
                img.src = o.imageUrl;
                img.alt = o.imageAlt || '';
                if (isTop) {
                    img.style.cssText = 'width:100%;max-height:220px;object-fit:cover;display:block;border-radius:' + o.borderRadius + 'px ' + o.borderRadius + 'px 0 0';
                } else {
                    img.style.cssText = 'width:42%;flex-shrink:0;object-fit:cover;display:block;min-height:200px';
                }
                return img;
            }

            function hexToRgba(hex, alpha) {
                var r = parseInt(hex.slice(1, 3), 16);
                var g = parseInt(hex.slice(3, 5), 16);
                var b = parseInt(hex.slice(5, 7), 16);
                return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
            }
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();

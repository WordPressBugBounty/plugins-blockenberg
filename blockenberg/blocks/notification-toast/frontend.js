(function () {
    var STATE_KEY = 'bkbg-ntst-shown';

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

    function initials(name) {
        return (name || 'U').split(' ').map(function (w) { return w[0] || ''; }).join('').slice(0, 2).toUpperCase();
    }

    function buildToastEl(notif, o) {
        var toast = document.createElement('div');
        toast.className = 'bkbg-ntst-toast anim-' + (o.animateType || 'slide') +
            ' ' + ((o.position || '').indexOf('left') > -1 ? 'pos-left' : 'pos-right');
        toast.style.maxWidth    = (o.maxWidth || 320) + 'px';
        toast.style.borderRadius = (o.borderRadius || 12) + 'px';
        toast.style.background  = o.toastBg || '#ffffff';
        if ((o.toastStyle || 'shadow') === 'bordered') {
            toast.style.border = '1px solid ' + (o.toastBorder || '#e5e7eb');
        } else if (o.toastStyle === 'shadow') {
            toast.style.boxShadow = '0 4px 20px rgba(0,0,0,0.13)';
        }

        if (o.showAvatar) {
            var avatar = document.createElement('div');
            avatar.className = 'bkbg-ntst-avatar';
            avatar.style.width    = (o.avatarSize || 40) + 'px';
            avatar.style.height   = (o.avatarSize || 40) + 'px';
            avatar.style.fontSize = Math.round((o.avatarSize || 40) * 0.35) + 'px';
            avatar.style.background = notif.avatarBg || '#6366f1';
            avatar.textContent = initials(notif.name);
            toast.appendChild(avatar);
        }

        var content = document.createElement('div');
        content.className = 'bkbg-ntst-content';

        var nameRow = document.createElement('div');
        nameRow.className = 'bkbg-ntst-name-row';

        if (o.showIcon) {
            var iconEl = document.createElement('span');
            iconEl.className = 'bkbg-ntst-icon';
            iconEl.style.fontSize = (o.iconSize || 20) + 'px';
            var _IP = window.bkbgIconPicker;
            var _iType = notif.iconType || 'custom-char';
            if (_IP && _iType !== 'custom-char') {
                var _in = _IP.buildFrontendIcon(_iType, notif.icon, notif.iconDashicon, notif.iconImageUrl, notif.iconDashiconColor);
                if (_in) iconEl.appendChild(_in); else iconEl.textContent = notif.icon || '🔔';
            } else { iconEl.textContent = notif.icon || '🔔'; }
            nameRow.appendChild(iconEl);
        }

        var nameEl = document.createElement('span');
        nameEl.className = 'bkbg-ntst-name';
        nameEl.style.color    = o.nameColor || '#111827';
        nameEl.textContent    = notif.name || '';
        nameRow.appendChild(nameEl);
        content.appendChild(nameRow);

        var msgEl = document.createElement('div');
        msgEl.className   = 'bkbg-ntst-msg';
        msgEl.style.color    = o.textColor || '#6b7280';
        msgEl.textContent    = notif.text || '';
        content.appendChild(msgEl);

        if (o.showTimeAgo && notif.timeAgo) {
            var timeEl = document.createElement('div');
            timeEl.className   = 'bkbg-ntst-time';
            timeEl.style.fontSize = (o.timeSize || 11) + 'px';
            timeEl.style.color    = o.timeColor || '#9ca3af';
            timeEl.textContent    = notif.timeAgo;
            content.appendChild(timeEl);
        }

        toast.appendChild(content);
        return toast;
    }

    function init() {
        document.querySelectorAll('.bkbg-ntst-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';
            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                notifications: [],
                position: 'bottom-left',
                interval: 4,
                displayDuration: 3,
                animateType: 'slide',
                showOnce: false,
                loop: true,
                showAvatar: true,
                showTimeAgo: true,
                showIcon: true,
                toastStyle: 'shadow',
                maxWidth: 320,
                borderRadius: 12,
                avatarSize: 40,
                iconSize: 20,
                nameSize: 13,
                textSize: 12,
                timeSize: 11,
                toastBg: '#ffffff',
                toastBorder: '#e5e7eb',
                toastShadow: true,
                nameColor: '#111827',
                textColor: '#6b7280',
                timeColor: '#9ca3af',
            }, opts);

            if (!o.notifications || !o.notifications.length) return;

            // showOnce check
            if (o.showOnce) {
                try {
                    if (sessionStorage.getItem(STATE_KEY + '-' + (appEl.id || ''))) return;
                } catch (e) {}
            }

            // Create fixed container (attached to body, outside content flow)
            var fixed = document.createElement('div');
            fixed.className = 'bkbg-ntst-fixed pos-' + (o.position || 'bottom-left');

            var pos = o.position || 'bottom-left';
            fixed.style.position = 'fixed';
            fixed.style.zIndex   = '99999';
            fixed.style.bottom   = pos.indexOf('bottom') > -1 ? '24px' : 'auto';
            fixed.style.top      = pos.indexOf('top') > -1 ? '24px' : 'auto';
            fixed.style.left     = pos.indexOf('left') > -1 ? '24px' : 'auto';
            fixed.style.right    = pos.indexOf('right') > -1 ? '24px' : 'auto';
            document.body.appendChild(fixed);

            /* Typography CSS vars */
            typoCssVarsForEl(fixed, opts.nameTypo, '--bkbg-ntst-nm-');
            typoCssVarsForEl(fixed, opts.textTypo, '--bkbg-ntst-tx-');

            var idx = 0;
            var currentToast = null;
            var showTimer = null;
            var hideTimer = null;

            function showNext() {
                if (idx >= o.notifications.length) {
                    if (!o.loop) return;
                    idx = 0;
                }
                var notif = o.notifications[idx];
                idx++;

                // Remove previous
                if (currentToast) {
                    currentToast.classList.remove('is-visible');
                    var ct = currentToast;
                    setTimeout(function () { if (ct.parentNode) ct.parentNode.removeChild(ct); }, 400);
                    currentToast = null;
                }

                var toast = buildToastEl(notif, o);
                fixed.appendChild(toast);
                currentToast = toast;

                // Trigger enter animation
                requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                        toast.classList.add('is-visible');
                    });
                });

                // Schedule hide after displayDuration
                clearTimeout(hideTimer);
                hideTimer = setTimeout(function () {
                    if (toast.parentNode) {
                        toast.classList.remove('is-visible');
                        setTimeout(function () {
                            if (toast.parentNode) toast.parentNode.removeChild(toast);
                            if (currentToast === toast) currentToast = null;
                        }, 400);
                    }
                }, (o.displayDuration || 3) * 1000);

                // Schedule next
                clearTimeout(showTimer);
                if (o.loop || idx < o.notifications.length) {
                    showTimer = setTimeout(showNext, ((o.displayDuration || 3) + (o.interval || 4)) * 1000);
                }
            }

            // Start after first interval
            var startTimer = setTimeout(function () {
                showNext();
                if (o.showOnce) {
                    try { sessionStorage.setItem(STATE_KEY + '-' + (appEl.id || ''), '1'); } catch (e) {}
                }
            }, (o.interval || 4) * 1000);

            appEl.style.display = 'none';

            // Clean up if the source element leaves DOM
            var observer = new MutationObserver(function () {
                if (!document.body.contains(appEl)) {
                    clearTimeout(startTimer);
                    clearTimeout(showTimer);
                    clearTimeout(hideTimer);
                    if (fixed.parentNode) fixed.parentNode.removeChild(fixed);
                    observer.disconnect();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();

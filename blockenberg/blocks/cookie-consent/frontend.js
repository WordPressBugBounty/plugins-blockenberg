(function () {
    function toArray(nl) {
        return Array.prototype.slice.call(nl || []);
    }

    function setCookie(name, value, days) {
        var expires = '';
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/; SameSite=Lax';
    }

    function getCookie(name) {
        var match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[()[\]{}*+?^$|#\\]/g, '\\$&') + '=([^;]*)'));
        return match ? decodeURIComponent(match[1]) : null;
    }

    function pushGTM(categories) {
        if (typeof window.dataLayer !== 'undefined') {
            window.dataLayer.push({
                event: 'bkbg_cookie_consent',
                cookie_consent: categories
            });
        }
    }

    function initCookieConsent(banner) {
        var cookieName = banner.getAttribute('data-cookie-name') || 'bkbg_cookie_consent';
        var cookieDays = parseInt(banner.getAttribute('data-cookie-days'), 10) || 365;
        var position = banner.getAttribute('data-position') || 'bottom';
        var animation = banner.getAttribute('data-animation') || 'slide';

        // Already consented? Skip.
        if (getCookie(cookieName) || localStorage.getItem(cookieName)) {
            return;
        }

        var acceptBtn = banner.querySelector('[data-bkbg-cc-accept]');
        var declineBtn = banner.querySelector('[data-bkbg-cc-decline]');
        var customizeBtn = banner.querySelector('[data-bkbg-cc-customize]');
        var saveBtn = banner.querySelector('[data-bkbg-cc-save]');
        var categoriesPanel = banner.querySelector('.bkbg-cc-categories');

        function hideBanner() {
            banner.classList.remove('is-visible');
            banner.addEventListener('transitionend', function handler() {
                banner.remove();
                banner.removeEventListener('transitionend', handler);
            });
        }

        function acceptAll() {
            var categories = {
                necessary: true,
                analytics: true,
                marketing: true,
                functional: true
            };
            var value = JSON.stringify(categories);
            setCookie(cookieName, value, cookieDays);
            localStorage.setItem(cookieName, value);
            pushGTM(categories);
            hideBanner();
        }

        function declineAll() {
            var categories = {
                necessary: true,
                analytics: false,
                marketing: false,
                functional: false
            };
            var value = JSON.stringify(categories);
            setCookie(cookieName, value, cookieDays);
            localStorage.setItem(cookieName, value);
            pushGTM(categories);
            hideBanner();
        }

        function savePreferences() {
            var checkboxes = toArray((categoriesPanel || banner).querySelectorAll('[data-bkbg-cc-category]'));
            var categories = { necessary: true };
            checkboxes.forEach(function (cb) {
                categories[cb.getAttribute('data-bkbg-cc-category')] = cb.checked;
            });
            var value = JSON.stringify(categories);
            setCookie(cookieName, value, cookieDays);
            localStorage.setItem(cookieName, value);
            pushGTM(categories);
            hideBanner();
        }

        if (acceptBtn) acceptBtn.addEventListener('click', acceptAll);
        if (declineBtn) declineBtn.addEventListener('click', declineAll);

        if (customizeBtn && categoriesPanel) {
            customizeBtn.addEventListener('click', function () {
                var isHidden = categoriesPanel.hidden;
                categoriesPanel.hidden = !isHidden;
            });
        }

        if (saveBtn) saveBtn.addEventListener('click', savePreferences);

        // Show banner after short delay
        setTimeout(function () {
            banner.classList.add('is-visible');
        }, 400);
    }

    function init() {
        // Only run on frontend (not in block editor)
        if (document.body.classList.contains('block-editor-page')) return;

        toArray(document.querySelectorAll('.bkbg-cc-banner')).forEach(initCookieConsent);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

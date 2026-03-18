(function () {
    'use strict';

    function initNewsletter(wrapper) {
        var form    = wrapper.querySelector('.bkbg-nl-form');
        var btn     = wrapper.querySelector('.bkbg-nl-btn');
        var status  = wrapper.querySelector('.bkbg-nl-status');
        if (!form || !btn || !status) return;

        var successMsg = wrapper.dataset.success || '🎉 You\'re subscribed!';
        var errorMsg   = wrapper.dataset.error   || 'Please enter a valid email address.';

        var endpoint = (window.wpApiSettings && window.wpApiSettings.root)
            ? window.wpApiSettings.root.replace(/\/?$/, '/') + 'blockenberg/v1/subscribe'
            : '/wp-json/blockenberg/v1/subscribe';

        function showStatus(msg, type) {
            status.textContent = msg;
            status.className   = 'bkbg-nl-status bkbg-nl-' + type;
        }

        function clearStatus() {
            status.className   = 'bkbg-nl-status';
            status.textContent = '';
        }

        function setLoading(active) {
            btn.disabled = active;
            btn.classList.toggle('is-loading', active);
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            clearStatus();

            var emailField   = form.querySelector('[name="email"]');
            var nameField    = form.querySelector('[name="name"]');
            var websiteField = form.querySelector('[name="website"]'); // honeypot

            var email   = emailField   ? emailField.value.trim()   : '';
            var name    = nameField    ? nameField.value.trim()     : '';
            var website = websiteField ? websiteField.value.trim()  : '';

            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                showStatus(errorMsg, 'error');
                return;
            }

            setLoading(true);

            fetch(endpoint, {
                method : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body   : JSON.stringify({ email: email, name: name, website: website })
            })
            .then(function (res) {
                return res.json().then(function (body) { return { ok: res.ok, body: body }; });
            })
            .then(function (result) {
                setLoading(false);
                if (result.ok && result.body && result.body.ok) {
                    showStatus(successMsg, 'success');
                    form.reset();
                } else {
                    var msg = (result.body && result.body.message) ? result.body.message : errorMsg;
                    showStatus(msg, 'error');
                }
            })
            .catch(function () {
                setLoading(false);
                showStatus(errorMsg, 'error');
            });
        });
    }

    function init() {
        document.querySelectorAll('.bkbg-nl-wrapper').forEach(initNewsletter);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

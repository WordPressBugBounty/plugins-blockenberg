(function () {
    'use strict';

    function initContactForm(wrapper) {
        var form   = wrapper.querySelector('.bkbg-cf-form');
        var btn    = wrapper.querySelector('.bkbg-cf-submit');
        var status = wrapper.querySelector('.bkbg-cf-status');
        if (!form || !btn || !status) return;

        var recipient = wrapper.dataset.recipient || '';
        var subject   = wrapper.dataset.subject   || 'New message from your website';
        var successMsg = wrapper.dataset.success  || 'Thank you! Your message has been sent.';
        var errorMsg   = wrapper.dataset.error    || 'Something went wrong. Please try again.';

        var endpoint = (window.wpApiSettings && window.wpApiSettings.root)
            ? window.wpApiSettings.root.replace(/\/?$/, '/') + 'blockenberg/v1/contact'
            : '/wp-json/blockenberg/v1/contact';

        function showStatus(msg, type) {
            status.textContent  = msg;
            status.className    = 'bkbg-cf-status bkbg-cf-' + type;
        }

        function clearStatus() {
            status.className = 'bkbg-cf-status';
            status.textContent = '';
        }

        function setLoading(active) {
            btn.disabled = active;
            if (active) {
                btn.classList.add('is-loading');
            } else {
                btn.classList.remove('is-loading');
            }
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            clearStatus();

            // Native HTML5 validation
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            var data = {
                name    : (form.querySelector('[name="name"]')    || {}).value || '',
                email   : (form.querySelector('[name="email"]')   || {}).value || '',
                phone   : (form.querySelector('[name="phone"]')   || {}).value || '',
                message : (form.querySelector('[name="message"]') || {}).value || '',
                website : (form.querySelector('[name="website"]') || {}).value || '', // honeypot
                recipient: recipient,
                subject  : subject
            };

            // Basic client-side email check
            if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
                showStatus('Please enter a valid email address.', 'error');
                return;
            }

            setLoading(true);

            fetch(endpoint, {
                method : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body   : JSON.stringify(data)
            })
            .then(function (res) {
                return res.json().then(function (body) {
                    return { ok: res.ok, body: body };
                });
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
        document.querySelectorAll('.bkbg-cf-wrapper').forEach(initContactForm);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

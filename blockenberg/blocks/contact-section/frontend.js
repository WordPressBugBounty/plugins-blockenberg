(function () {
    'use strict';

    document.querySelectorAll('.bkbg-cs-wrapper form.bkbg-cs-form').forEach(function (form) {
        var msgEl     = form.querySelector('.bkbg-cs-form-msg');
        var submitBtn = form.querySelector('.bkbg-cs-submit');
        var recipient = form.getAttribute('data-recipient') || '';
        var successMsg= form.getAttribute('data-success') || 'Thank you! Your message has been sent.';

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var data = new FormData(form);
            data.append('action',    'bkbg_contact_form');
            data.append('recipient', recipient);
            data.append('nonce',     (window.bkbgContactData && window.bkbgContactData.nonce) || '');

            if (submitBtn) { submitBtn.disabled = true; submitBtn.style.opacity = '0.6'; }
            if (msgEl) { msgEl.textContent = ''; msgEl.className = 'bkbg-cs-form-msg'; }

            var ajaxUrl = (window.bkbgContactData && window.bkbgContactData.ajaxUrl)
                || (window.wpAjaxUrl)
                || '/wp-admin/admin-ajax.php';

            fetch(ajaxUrl, { method: 'POST', body: data })
                .then(function (res) { return res.json(); })
                .then(function (json) {
                    if (json && json.success) {
                        if (msgEl) { msgEl.textContent = successMsg; msgEl.classList.add('is-success'); }
                        form.reset();
                    } else {
                        var err = (json && json.data && json.data.message) || 'Something went wrong. Please try again.';
                        if (msgEl) { msgEl.textContent = err; msgEl.classList.add('is-error'); }
                    }
                })
                .catch(function () {
                    if (msgEl) { msgEl.textContent = 'Network error. Please try again.'; msgEl.classList.add('is-error'); }
                })
                .finally(function () {
                    if (submitBtn) { submitBtn.disabled = false; submitBtn.style.opacity = ''; }
                });
        });
    });
})();

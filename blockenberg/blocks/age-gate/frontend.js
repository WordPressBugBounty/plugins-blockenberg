(function () {
    'use strict';

    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo) return;
        if (typo.family)     el.style.setProperty(prefix + 'font-family', "'" + typo.family + "', sans-serif");
        if (typo.weight)     el.style.setProperty(prefix + 'font-weight', typo.weight);
        if (typo.transform)  el.style.setProperty(prefix + 'text-transform', typo.transform);
        if (typo.style)      el.style.setProperty(prefix + 'font-style', typo.style);
        if (typo.decoration) el.style.setProperty(prefix + 'text-decoration', typo.decoration);
        var su = typo.sizeUnit || 'px';
        if (typo.sizeDesktop !== '' && typo.sizeDesktop != null) el.style.setProperty(prefix + 'font-size-d', typo.sizeDesktop + su);
        if (typo.sizeTablet  !== '' && typo.sizeTablet  != null) el.style.setProperty(prefix + 'font-size-t', typo.sizeTablet + su);
        if (typo.sizeMobile  !== '' && typo.sizeMobile  != null) el.style.setProperty(prefix + 'font-size-m', typo.sizeMobile + su);
        var lhu = typo.lineHeightUnit || 'px';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) el.style.setProperty(prefix + 'line-height-d', typo.lineHeightDesktop + lhu);
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) el.style.setProperty(prefix + 'line-height-t', typo.lineHeightTablet + lhu);
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) el.style.setProperty(prefix + 'line-height-m', typo.lineHeightMobile + lhu);
        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) { el.style.setProperty(prefix + 'letter-spacing-d', typo.letterSpacingDesktop + lsu); el.style.setProperty(prefix + 'letter-spacing', typo.letterSpacingDesktop + lsu); }
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) el.style.setProperty(prefix + 'letter-spacing-t', typo.letterSpacingTablet + lsu);
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) el.style.setProperty(prefix + 'letter-spacing-m', typo.letterSpacingMobile + lsu);
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) { el.style.setProperty(prefix + 'word-spacing-d', typo.wordSpacingDesktop + wsu); el.style.setProperty(prefix + 'word-spacing', typo.wordSpacingDesktop + wsu); }
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) el.style.setProperty(prefix + 'word-spacing-t', typo.wordSpacingTablet + wsu);
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) el.style.setProperty(prefix + 'word-spacing-m', typo.wordSpacingMobile + wsu);
    }

    function initBlock(root) {
        var optsRaw = root.getAttribute('data-opts');
        var opts;
        try { opts = JSON.parse(optsRaw); } catch (e) { opts = {}; }

        var minAge    = opts.minimumAge        || 18;
        var mode      = opts.verificationMode  || 'yesno';
        var logoUrl   = opts.logoUrl           || '';
        var confirmTx = opts.confirmText       || 'Yes, I am old enough';
        var denyTx    = opts.denyText          || 'No, take me back';
        var denyUrl   = opts.denyRedirectUrl   || '';
        var remDays   = opts.rememberDays >= 0 ? opts.rememberDays : 30;
        var disclaimer = opts.disclaimer       || '';

        var STORAGE_KEY = 'bkbg_age_gate_' + (window.location.hostname || 'site');

        // Check if already verified
        if (remDays > 0) {
            try {
                var stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    var exp = parseInt(stored, 10);
                    if (exp > Date.now()) {
                        root.style.display = 'none'; // already verified
                        return;
                    }
                }
            } catch (e) {}
        }

        // Get content from saved rich text elements
        var titleSrc   = root.querySelector('.bkbg-ag-title-src');
        var messageSrc = root.querySelector('.bkbg-ag-message-src');
        var titleHTML   = titleSrc   ? titleSrc.innerHTML   : 'Age Verification Required';
        var messageHTML = messageSrc ? messageSrc.innerHTML : '';
        root.innerHTML = ''; // clear

        // Build overlay
        var overlay = document.createElement('div');
        overlay.className = 'bkbg-ag-overlay';
        overlay.style.background = opts.overlayBg || 'rgba(0,0,0,0.75)';

        var card = document.createElement('div');
        card.className = 'bkbg-ag-card';
        card.style.cssText = [
            'background:' + (opts.cardBg || '#ffffff'),
            'border-radius:' + (opts.cardRadius || 16) + 'px',
            'padding:' + (opts.cardPadding || 48) + 'px',
            'max-width:' + (opts.cardMaxWidth || 480) + 'px',
            'box-shadow:0 24px 64px rgba(0,0,0,0.3)',
            'width:100%',
            'box-sizing:border-box'
        ].join(';');

        overlay.appendChild(card);

        /* Typography CSS vars on card */
        card.style.setProperty('--bkbg-ag-title-sz', (opts.titleSize || 26) + 'px');
        card.style.setProperty('--bkbg-ag-message-sz', (opts.messageSize || 15) + 'px');
        typoCssVarsForEl(opts.titleTypo, '--bkbg-ag-title-', card);
        typoCssVarsForEl(opts.messageTypo, '--bkbg-ag-message-', card);

        // Logo
        if (logoUrl) {
            var logo = document.createElement('img');
            logo.src = logoUrl;
            logo.alt = 'Logo';
            logo.className = 'bkbg-ag-logo';
            logo.style.cssText = 'max-height:' + (opts.logoSize || 80) + 'px;margin:0 auto 20px;display:block;';
            card.appendChild(logo);
        }

        // Title
        var titleEl = document.createElement('h3');
        titleEl.className = 'bkbg-ag-title';
        titleEl.innerHTML = titleHTML;
        titleEl.style.cssText = 'color:' + (opts.titleColor || '#1e1b4b') + ';margin:0 0 16px;';
        card.appendChild(titleEl);

        // Message
        var msgEl = document.createElement('div');
        msgEl.className = 'bkbg-ag-message';
        msgEl.innerHTML = messageHTML;
        msgEl.style.cssText = 'color:' + (opts.messageColor || '#64748b') + ';margin:0 0 28px;line-height:1.6;';
        card.appendChild(msgEl);

        // DOB input (if mode = dob)
        var dobInput = null;
        var dobError = null;
        if (mode === 'dob') {
            var dobWrap = document.createElement('div');
            dobWrap.className = 'bkbg-ag-dob-wrap';
            var dobLabel = document.createElement('label');
            dobLabel.className = 'bkbg-ag-dob-label';
            dobLabel.textContent = 'Date of Birth';
            dobLabel.style.color = opts.messageColor || '#64748b';
            dobInput = document.createElement('input');
            dobInput.type = 'date';
            dobInput.className = 'bkbg-ag-dob-input';
            // Max date = today
            var today = new Date();
            dobInput.max = today.toISOString().split('T')[0];
            dobError = document.createElement('div');
            dobError.className = 'bkbg-ag-dob-error';
            dobError.textContent = 'You must be at least ' + minAge + ' years old to continue.';
            dobWrap.appendChild(dobLabel);
            dobWrap.appendChild(dobInput);
            dobWrap.appendChild(dobError);
            card.appendChild(dobWrap);
        }

        // Buttons
        var btns = document.createElement('div');
        btns.className = 'bkbg-ag-btns';

        var confirmBtn = document.createElement('button');
        confirmBtn.className = 'bkbg-ag-confirm-btn';
        confirmBtn.textContent = confirmTx;
        confirmBtn.style.cssText = 'background:' + (opts.confirmBg || '#6366f1') + ';color:' + (opts.confirmColor || '#ffffff') + ';';

        var denyBtn = document.createElement('button');
        denyBtn.className = 'bkbg-ag-deny-btn';
        denyBtn.textContent = denyTx;
        denyBtn.style.cssText = 'background:' + (opts.denyBg || '#f1f5f9') + ';color:' + (opts.denyColor || '#64748b') + ';';

        btns.appendChild(confirmBtn);
        btns.appendChild(denyBtn);
        card.appendChild(btns);

        // Disclaimer
        if (disclaimer) {
            var discEl = document.createElement('p');
            discEl.className = 'bkbg-ag-disclaimer';
            discEl.textContent = disclaimer;
            discEl.style.color = opts.messageColor || '#64748b';
            card.appendChild(discEl);
        }

        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        function grantAccess() {
            if (remDays > 0) {
                try {
                    var exp = Date.now() + remDays * 24 * 60 * 60 * 1000;
                    localStorage.setItem(STORAGE_KEY, String(exp));
                } catch (e) {}
            }
            overlay.style.animation = 'bkbg-ag-fade-out 0.25s ease forwards';
            setTimeout(function () {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                document.body.style.overflow = '';
                root.style.display = 'none';
            }, 250);
        }

        function denyAccess() {
            if (denyUrl) {
                window.location.href = denyUrl;
            } else {
                window.history.back();
            }
        }

        function checkAge() {
            if (mode === 'dob' && dobInput) {
                var dob = new Date(dobInput.value);
                if (!dobInput.value || isNaN(dob.getTime())) {
                    if (dobError) {
                        dobError.textContent = 'Please enter your date of birth.';
                        dobError.classList.add('bkbg-ag-visible');
                    }
                    return;
                }
                var ageMs = Date.now() - dob.getTime();
                var ageYears = ageMs / (365.25 * 24 * 60 * 60 * 1000);
                if (ageYears < minAge) {
                    if (dobError) {
                        dobError.textContent = 'You must be at least ' + minAge + ' years old to continue.';
                        dobError.classList.add('bkbg-ag-visible');
                    }
                    return;
                }
                if (dobError) dobError.classList.remove('bkbg-ag-visible');
            }
            grantAccess();
        }

        confirmBtn.addEventListener('click', checkAge);
        denyBtn.addEventListener('click', denyAccess);
        if (dobInput) {
            dobInput.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') checkAge();
            });
        }

        // Inject fade-out keyframe if needed  
        var styleEl = document.getElementById('bkbg-ag-keyframes');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'bkbg-ag-keyframes';
            styleEl.textContent = '@keyframes bkbg-ag-fade-out{from{opacity:1}to{opacity:0}}';
            document.head.appendChild(styleEl);
        }
    }

    document.querySelectorAll('.bkbg-ag-app').forEach(function (root) {
        initBlock(root);
    });
})();

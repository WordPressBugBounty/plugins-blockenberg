(function () {
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;

        // Non-responsive
        if (typo.family)     el.style.setProperty(prefix + 'font-family', "'" + typo.family + "', sans-serif");
        if (typo.weight)     el.style.setProperty(prefix + 'font-weight', typo.weight);
        if (typo.transform)  el.style.setProperty(prefix + 'text-transform', typo.transform);
        if (typo.style)      el.style.setProperty(prefix + 'font-style', typo.style);
        if (typo.decoration) el.style.setProperty(prefix + 'text-decoration', typo.decoration);

        // Responsive
        var su = typo.sizeUnit || 'px';
        if (typo.sizeDesktop !== '' && typo.sizeDesktop !== undefined && typo.sizeDesktop !== null) el.style.setProperty(prefix + 'font-size-d', typo.sizeDesktop + su);
        if (typo.sizeTablet  !== '' && typo.sizeTablet  !== undefined && typo.sizeTablet  !== null) el.style.setProperty(prefix + 'font-size-t', typo.sizeTablet + su);
        if (typo.sizeMobile  !== '' && typo.sizeMobile  !== undefined && typo.sizeMobile  !== null) el.style.setProperty(prefix + 'font-size-m', typo.sizeMobile + su);

        var lhu = typo.lineHeightUnit || 'px';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop !== undefined && typo.lineHeightDesktop !== null) el.style.setProperty(prefix + 'line-height-d', typo.lineHeightDesktop + lhu);
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  !== undefined && typo.lineHeightTablet  !== null) el.style.setProperty(prefix + 'line-height-t', typo.lineHeightTablet + lhu);
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  !== undefined && typo.lineHeightMobile  !== null) el.style.setProperty(prefix + 'line-height-m', typo.lineHeightMobile + lhu);

        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop !== undefined && typo.letterSpacingDesktop !== null) {
            el.style.setProperty(prefix + 'letter-spacing-d', typo.letterSpacingDesktop + lsu);
            el.style.setProperty(prefix + 'letter-spacing',   typo.letterSpacingDesktop + lsu);
        }
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  !== undefined && typo.letterSpacingTablet  !== null) el.style.setProperty(prefix + 'letter-spacing-t', typo.letterSpacingTablet + lsu);
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  !== undefined && typo.letterSpacingMobile  !== null) el.style.setProperty(prefix + 'letter-spacing-m', typo.letterSpacingMobile + lsu);

        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop !== undefined && typo.wordSpacingDesktop !== null) {
            el.style.setProperty(prefix + 'word-spacing-d', typo.wordSpacingDesktop + wsu);
            el.style.setProperty(prefix + 'word-spacing',   typo.wordSpacingDesktop + wsu);
        }
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  !== undefined && typo.wordSpacingTablet  !== null) el.style.setProperty(prefix + 'word-spacing-t', typo.wordSpacingTablet + wsu);
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  !== undefined && typo.wordSpacingMobile  !== null) el.style.setProperty(prefix + 'word-spacing-m', typo.wordSpacingMobile + wsu);
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    }

    function getStorageKey(o) {
        return 'bkbg-cl-' + (o.storageKey || window.location.pathname);
    }

    function init() {
        document.querySelectorAll('.bkbg-cl-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                lockType: 'email',
                lockedContent: '',
                lockStyle: 'blur',
                blurAmount: 6,
                teaserLines: 3,
                icon: '🔒',
                showIcon: true,
                eyebrow: 'Members Only',
                showEyebrow: true,
                heading: 'Unlock this content',
                subText: 'Enter your email to get instant access.',
                emailPlaceholder: 'Enter your email address',
                submitLabel: 'Unlock Now',
                privacyNote: 'We respect your privacy. No spam, ever.',
                showPrivacy: true,
                successHeading: 'You\'re in! 🎉',
                successText: 'Enjoy your exclusive content below.',
                rememberUnlock: true,
                storageKey: '',
                password: '',
                passwordPlaceholder: 'Enter password',
                passwordSubmitLabel: 'Unlock',
                passwordErrorMsg: 'Incorrect password. Please try again.',
                clickButtonLabel: 'Reveal Content',
                clickButtonIcon: '👁',
                webhookUrl: '',
                borderRadius: 16,
                padding: 40,
                maxWidth: 560,
                inputRadius: 8,
                gateBg: '#ffffff',
                eyebrowColor: '#6366f1',
                headingColor: '#111827',
                textColor: '#6b7280',
                inputBg: '#f9fafb',
                inputBorder: '#e5e7eb',
                inputFocusBorder: '#6366f1',
                inputColor: '#111827',
                btnBg: '#6366f1',
                btnColor: '#ffffff',
                privacyColor: '#9ca3af',
            }, opts);

            var storageKey = getStorageKey(o);
            var alreadyUnlocked = o.rememberUnlock && localStorage.getItem(storageKey) === '1';

            // Outer wrap
            var wrap = document.createElement('div');
            wrap.className = 'bkbg-cl-wrap';
            wrap.style.position = 'relative';

            // Success banner (above content)
            var successBanner = document.createElement('div');
            successBanner.className = 'bkbg-cl-success' + (alreadyUnlocked ? ' is-visible' : '');
            successBanner.style.background = '#f0fdf4';
            successBanner.style.border = '1px solid #86efac';
            successBanner.style.borderRadius = '8px';
            successBanner.style.padding = '10px 16px';
            successBanner.style.marginBottom = '16px';
            var sh = document.createElement('p');
            sh.className = 'bkbg-cl-success-heading';
            sh.textContent = o.successHeading;
            sh.style.fontWeight = '700';
            sh.style.color = '#166534';
            sh.style.margin = '0 0 2px';
            sh.style.fontSize = '15px';
            var st = document.createElement('p');
            st.className = 'bkbg-cl-success-text';
            st.textContent = o.successText;
            st.style.color = '#15803d';
            st.style.margin = '0';
            st.style.fontSize = '13px';
            successBanner.appendChild(sh);
            successBanner.appendChild(st);
            wrap.appendChild(successBanner);

            // Unlocked content container
            var unlockedDiv = document.createElement('div');
            unlockedDiv.className = 'bkbg-cl-unlocked-content' + (alreadyUnlocked ? ' is-revealed' : '');
            unlockedDiv.style.lineHeight = '1.7';
            if (alreadyUnlocked) { unlockedDiv.style.display = 'block'; }
            else { unlockedDiv.style.display = 'none'; }
            unlockedDiv.innerHTML = o.lockedContent;
            wrap.appendChild(unlockedDiv);

            // Gate section (hidden when unlocked)
            var gateWrap = document.createElement('div');
            gateWrap.style.display = alreadyUnlocked ? 'none' : 'block';

            // Content preview (blurred)
            if (o.lockStyle !== 'hide' && o.lockedContent && !alreadyUnlocked) {
                var contentPreview = document.createElement('div');
                contentPreview.className = 'bkbg-cl-content';
                contentPreview.innerHTML = o.lockedContent;
                if (o.lockStyle === 'blur') {
                    var lineH = 1.7;
                    var fSize = 16; // approx
                    contentPreview.style.maxHeight = (o.teaserLines * lineH * fSize) + 'px';
                    contentPreview.style.overflow = 'hidden';
                    contentPreview.style.filter = 'blur(' + o.blurAmount + 'px)';
                } else if (o.lockStyle === 'fade') {
                    contentPreview.style.maxHeight = '120px';
                    contentPreview.style.overflow = 'hidden';
                }
                contentPreview.style.pointerEvents = 'none';
                contentPreview.style.userSelect = 'none';
                gateWrap.appendChild(contentPreview);

                // Fade overlay
                if (o.lockStyle === 'blur' || o.lockStyle === 'fade') {
                    var fadeOverlay = document.createElement('div');
                    fadeOverlay.className = 'bkbg-cl-fade-overlay';
                    fadeOverlay.style.position = 'absolute';
                    fadeOverlay.style.bottom = 'auto';
                    fadeOverlay.style.left = '0';
                    fadeOverlay.style.right = '0';
                    fadeOverlay.style.height = '80px';
                    fadeOverlay.style.background = 'linear-gradient(transparent 0%, rgba(255,255,255,0.97) 100%)';
                    fadeOverlay.style.pointerEvents = 'none';
                    fadeOverlay.style.marginTop = '-80px';
                    fadeOverlay.style.position = 'relative';
                    gateWrap.appendChild(fadeOverlay);
                }
            }

            // Gate card
            var gate = document.createElement('div');
            gate.className = 'bkbg-cl-gate';
            gate.style.background = o.gateBg;
            gate.style.borderRadius = o.borderRadius + 'px';
            gate.style.padding = o.padding + 'px';
            gate.style.maxWidth = o.maxWidth + 'px';
            gate.style.margin = '24px auto 0';
            gate.style.display = 'flex';
            gate.style.flexDirection = 'column';
            gate.style.alignItems = 'center';
            gate.style.gap = '16px';
            gate.style.textAlign = 'center';
            gate.style.boxShadow = '0 4px 24px rgba(0,0,0,0.10)';

            // Icon
            if (o.showIcon && o.icon) {
                var iconEl = document.createElement('div');
                iconEl.className = 'bkbg-cl-icon';
                iconEl.textContent = o.icon;
                iconEl.style.fontSize = '40px';
                iconEl.style.lineHeight = '1';
                gate.appendChild(iconEl);
            }

            // Eyebrow
            if (o.showEyebrow && o.eyebrow) {
                var eyebrowEl = document.createElement('div');
                eyebrowEl.className = 'bkbg-cl-eyebrow';
                eyebrowEl.textContent = o.eyebrow;
                eyebrowEl.style.fontSize = '11px';
                eyebrowEl.style.fontWeight = '700';
                eyebrowEl.style.letterSpacing = '0.08em';
                eyebrowEl.style.textTransform = 'uppercase';
                eyebrowEl.style.color = o.eyebrowColor;
                gate.appendChild(eyebrowEl);
            }

            // Heading
            var headingEl = document.createElement('h3');
            headingEl.className = 'bkbg-cl-heading';
            headingEl.textContent = o.heading;
            headingEl.style.margin = '0';
            headingEl.style.color = o.headingColor;
            gate.appendChild(headingEl);

            // Sub-text
            if (o.subText) {
                var subEl = document.createElement('p');
                subEl.className = 'bkbg-cl-subtext';
                subEl.textContent = o.subText;
                subEl.style.margin = '0';
                subEl.style.fontSize = '14px';
                subEl.style.color = o.textColor;
                subEl.style.lineHeight = '1.6';
                gate.appendChild(subEl);
            }

            var errorEl = document.createElement('div');
            errorEl.className = 'bkbg-cl-error';
            errorEl.style.fontSize = '13px';
            errorEl.style.color = '#dc2626';
            errorEl.style.display = 'none';
            errorEl.style.fontWeight = '500';
            errorEl.style.width = '100%';
            errorEl.style.textAlign = 'left';
            gate.appendChild(errorEl);

            function unlockContent() {
                gateWrap.style.display = 'none';
                unlockedDiv.style.display = 'block';
                successBanner.style.display = 'block';
                if (o.rememberUnlock) {
                    try { localStorage.setItem(storageKey, '1'); } catch (e) {}
                }
            }

            function showError(msg) {
                errorEl.textContent = msg;
                errorEl.style.display = 'block';
                setTimeout(function () { errorEl.style.display = 'none'; }, 4000);
            }

            // Form
            var formEl = document.createElement('div');
            formEl.className = 'bkbg-cl-form';
            formEl.style.width = '100%';
            formEl.style.display = 'flex';
            formEl.style.flexDirection = 'column';
            formEl.style.gap = '10px';

            if (o.lockType === 'email') {
                var emailInput = document.createElement('input');
                emailInput.type = 'email';
                emailInput.placeholder = o.emailPlaceholder;
                emailInput.className = 'bkbg-cl-input';
                emailInput.style.width = '100%';
                emailInput.style.padding = '12px 16px';
                emailInput.style.borderRadius = o.inputRadius + 'px';
                emailInput.style.border = '1px solid ' + o.inputBorder;
                emailInput.style.background = o.inputBg;
                emailInput.style.color = o.inputColor;
                emailInput.style.fontSize = '15px';
                emailInput.style.boxSizing = 'border-box';
                emailInput.style.outline = 'none';
                emailInput.style.transition = 'border-color 0.2s';
                emailInput.addEventListener('focus', function () {
                    emailInput.style.borderColor = o.inputFocusBorder;
                });
                emailInput.addEventListener('blur', function () {
                    emailInput.style.borderColor = o.inputBorder;
                });
                formEl.appendChild(emailInput);

                var submitBtn = document.createElement('button');
                submitBtn.className = 'bkbg-cl-btn';
                submitBtn.textContent = o.submitLabel;
                submitBtn.style.padding = '12px 24px';
                submitBtn.style.borderRadius = o.inputRadius + 'px';
                submitBtn.style.background = o.btnBg;
                submitBtn.style.color = o.btnColor;
                submitBtn.style.border = 'none';
                submitBtn.style.cursor = 'pointer';
                submitBtn.style.transition = 'opacity 0.2s, transform 0.15s';
                submitBtn.addEventListener('click', function () {
                    var email = emailInput.value.trim();
                    if (!isValidEmail(email)) {
                        showError('Please enter a valid email address.');
                        emailInput.focus();
                        return;
                    }
                    // Webhook POST (optional)
                    if (o.webhookUrl) {
                        fetch(o.webhookUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: email, source: window.location.href }),
                        }).catch(function () {});
                    }
                    unlockContent();
                });
                formEl.appendChild(submitBtn);

                if (o.showPrivacy && o.privacyNote) {
                    var privEl = document.createElement('p');
                    privEl.className = 'bkbg-cl-privacy';
                    privEl.textContent = o.privacyNote;
                    privEl.style.margin = '0';
                    privEl.style.fontSize = '12px';
                    privEl.style.color = o.privacyColor;
                    formEl.appendChild(privEl);
                }

            } else if (o.lockType === 'password') {
                var pwInput = document.createElement('input');
                pwInput.type = 'password';
                pwInput.placeholder = o.passwordPlaceholder;
                pwInput.className = 'bkbg-cl-input';
                pwInput.style.width = '100%';
                pwInput.style.padding = '12px 16px';
                pwInput.style.borderRadius = o.inputRadius + 'px';
                pwInput.style.border = '1px solid ' + o.inputBorder;
                pwInput.style.background = o.inputBg;
                pwInput.style.color = o.inputColor;
                pwInput.style.fontSize = '15px';
                pwInput.style.boxSizing = 'border-box';
                pwInput.style.outline = 'none';
                pwInput.style.transition = 'border-color 0.2s';
                pwInput.addEventListener('focus', function () { pwInput.style.borderColor = o.inputFocusBorder; });
                pwInput.addEventListener('blur', function () { pwInput.style.borderColor = o.inputBorder; });
                pwInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') { pwBtn.click(); } });
                formEl.appendChild(pwInput);

                var pwBtn = document.createElement('button');
                pwBtn.className = 'bkbg-cl-btn';
                pwBtn.textContent = o.passwordSubmitLabel;
                pwBtn.style.padding = '12px 24px';
                pwBtn.style.borderRadius = o.inputRadius + 'px';
                pwBtn.style.background = o.btnBg;
                pwBtn.style.color = o.btnColor;
                pwBtn.style.border = 'none';
                pwBtn.style.cursor = 'pointer';
                pwBtn.addEventListener('click', function () {
                    if (pwInput.value === o.password) {
                        unlockContent();
                    } else {
                        showError(o.passwordErrorMsg);
                        pwInput.value = '';
                        pwInput.focus();
                    }
                });
                formEl.appendChild(pwBtn);

            } else if (o.lockType === 'click') {
                var revealBtn = document.createElement('button');
                revealBtn.className = 'bkbg-cl-btn';
                revealBtn.style.padding = '14px 28px';
                revealBtn.style.borderRadius = o.inputRadius + 'px';
                revealBtn.style.background = o.btnBg;
                revealBtn.style.color = o.btnColor;
                revealBtn.style.border = 'none';
                revealBtn.style.cursor = 'pointer';
                revealBtn.style.display = 'flex';
                revealBtn.style.alignItems = 'center';
                revealBtn.style.gap = '8px';
                revealBtn.style.margin = '0 auto';
                revealBtn.textContent = (o.clickButtonIcon ? o.clickButtonIcon + ' ' : '') + o.clickButtonLabel;
                revealBtn.addEventListener('click', unlockContent);
                formEl.appendChild(revealBtn);
            }

            gate.appendChild(formEl);
            typoCssVarsForEl(o.typoHeading, '--bkcl-head-', gate);
            typoCssVarsForEl(o.typoButton, '--bkcl-btn-', gate);
            gateWrap.appendChild(gate);
            wrap.appendChild(gateWrap);

            appEl.parentNode.insertBefore(wrap, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();

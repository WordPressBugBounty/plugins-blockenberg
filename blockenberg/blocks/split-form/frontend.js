(function () {
    var RATIO_MAP = { '50-50': [50, 50], '55-45': [55, 45], '45-55': [45, 55], '60-40': [60, 40], '40-60': [40, 60] };

    /* ── Typography CSS-var helper ──────────────────── */
    var _typoKeys = [
        ['family','font-family'],['weight','font-weight'],['style','font-style'],
        ['decoration','text-decoration'],['transform','text-transform']
    ];
    var _sizeKeys = [['sizeDesktop','font-size-d'],['sizeTablet','font-size-t'],['sizeMobile','font-size-m']];
    var _lhKeys   = [['lineHeightDesktop','line-height-d'],['lineHeightTablet','line-height-t'],['lineHeightMobile','line-height-m']];
    var _lsKeys   = [['letterSpacingDesktop','letter-spacing-d'],['letterSpacingTablet','letter-spacing-t'],['letterSpacingMobile','letter-spacing-m']];
    var _wsKeys   = [['wordSpacingDesktop','word-spacing-d'],['wordSpacingTablet','word-spacing-t'],['wordSpacingMobile','word-spacing-m']];
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        _typoKeys.forEach(function(p) { if (obj[p[0]]) el.style.setProperty(prefix + p[1], obj[p[0]]); });
        var unit = obj.sizeUnit || 'px';
        _sizeKeys.forEach(function(p) { if (obj[p[0]]) el.style.setProperty(prefix + p[1], obj[p[0]] + unit); });
        _lhKeys.forEach(function(p)   { if (obj[p[0]]) el.style.setProperty(prefix + p[1], String(obj[p[0]])); });
        _lsKeys.forEach(function(p)   { if (obj[p[0]]) el.style.setProperty(prefix + p[1], obj[p[0]] + 'px'); });
        _wsKeys.forEach(function(p)   { if (obj[p[0]]) el.style.setProperty(prefix + p[1], obj[p[0]] + 'px'); });
    }

    function init() {
        document.querySelectorAll('.bkbg-sf-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                contentSide: 'left', splitRatio: '50-50',
                icon: '✉️', showIcon: true,
                eyebrow: '', showEyebrow: true,
                heading: 'Get weekly insights straight to your inbox',
                subtext: '', bullets: [], showBullets: true, bulletIcon: '✓',
                useImage: false, imageUrl: '', imageAlt: '', imageOverlay: true,
                formTitle: 'Subscribe for free', showFormTitle: true, formSubtext: '',
                showName: true, namePlaceholder: 'Your name',
                emailPlaceholder: 'Your email address',
                showPhone: false, phonePlaceholder: 'Phone (optional)',
                submitLabel: 'Subscribe now →', formAction: '#', formMethod: 'post',
                privacyNote: 'We respect your privacy. Unsubscribe anytime.',
                showPrivacy: true, successMsg: '🎉 You\'re in! Check your inbox.',
                inputRadius: 8, btnRadius: 8, borderRadius: 0,
                paddingTop: 60, paddingBottom: 60,
                bgColor: '#1e1b4b', contentBg: '', formBg: '#ffffff',
                eyebrowColor: '#a5b4fc', headingColor: '#ffffff', subtextColor: '#c7d2fe',
                bulletColor: '#c7d2fe', bulletIconColor: '#818cf8',
                formHeadingColor: '#111827', formSubtextColor: '#6b7280',
                inputBorder: '#d1d5db', inputFocusBorder: '#6366f1',
                inputBg: '#f9fafb', inputColor: '#111827',
                btnBg: '#6366f1', btnColor: '#ffffff', privacyColor: '#9ca3af'
            }, opts);

            var ratio = RATIO_MAP[o.splitRatio] || [50, 50];
            var contentFlex = o.contentSide === 'left' ? ratio[0] : ratio[1];
            var formFlex    = o.contentSide === 'left' ? ratio[1] : ratio[0];

            /* Outer section */
            var section = document.createElement('section');
            section.className = 'bkbg-sf-section';
            section.style.cssText = [
                'background:' + o.bgColor,
                'padding-top:' + o.paddingTop + 'px',
                'padding-bottom:' + o.paddingBottom + 'px',
                'border-radius:' + o.borderRadius + 'px'
            ].join(';');

            /* Legacy CSS vars */
            if (o.eyebrowFontSize)    section.style.setProperty('--bksf-eb-sz', o.eyebrowFontSize + 'px');
            if (o.eyebrowFontWeight)  section.style.setProperty('--bksf-eb-w', String(o.eyebrowFontWeight));
            if (o.headingFontSize)    section.style.setProperty('--bksf-hd-sz', o.headingFontSize + 'px');
            if (o.headingFontWeight)  section.style.setProperty('--bksf-hd-w', String(o.headingFontWeight));
            if (o.subtextFontSize)    section.style.setProperty('--bksf-st-sz', o.subtextFontSize + 'px');
            if (o.formTitleFontSize)  section.style.setProperty('--bksf-ft-sz', o.formTitleFontSize + 'px');
            if (o.formTitleFontWeight) section.style.setProperty('--bksf-ft-w', String(o.formTitleFontWeight));
            /* Typo CSS vars */
            typoCssVarsForEl(section, o.eyebrowTypo, '--bksf-eb-');
            typoCssVarsForEl(section, o.headingTypo, '--bksf-hd-');
            typoCssVarsForEl(section, o.subtextTypo, '--bksf-st-');
            typoCssVarsForEl(section, o.formTitleTypo, '--bksf-ft-');
            typoCssVarsForEl(section, o.bulletTypo, '--bksf-bl-');

            var panels = document.createElement('div');
            panels.className = 'bkbg-sf-panels';

            /* ── Content panel ─────────────────────────────── */
            var contentPanel = document.createElement('div');
            contentPanel.className = 'bkbg-sf-content';
            contentPanel.style.cssText = 'flex:' + contentFlex + ';' + (o.contentBg ? 'background:' + o.contentBg : '');

            if (o.useImage && o.imageUrl) {
                contentPanel.style.backgroundImage = 'url(' + o.imageUrl + ')';
                contentPanel.style.backgroundSize = 'cover';
                contentPanel.style.backgroundPosition = 'center';
                if (o.imageOverlay) {
                    var ov = document.createElement('div');
                    ov.className = 'bkbg-sf-overlay';
                    ov.style.background = 'rgba(0,0,0,.45)';
                    contentPanel.appendChild(ov);
                }
            }

            var contentInner = document.createElement('div');
            contentInner.className = 'bkbg-sf-content-inner';

            if (o.showIcon && o.icon) {
                var iconEl = document.createElement('div');
                iconEl.className = 'bkbg-sf-icon';
                var _IP = window.bkbgIconPicker;
                var _iType = o.iconType || 'custom-char';
                if (_IP && _iType !== 'custom-char') {
                    var _in = _IP.buildFrontendIcon(_iType, o.icon, o.iconDashicon, o.iconImageUrl, o.iconDashiconColor);
                    if (_in) iconEl.appendChild(_in);
                    else iconEl.textContent = o.icon;
                } else {
                    iconEl.textContent = o.icon;
                }
                contentInner.appendChild(iconEl);
            }
            if (o.showEyebrow && o.eyebrow) {
                var ey = document.createElement('p');
                ey.className = 'bkbg-sf-eyebrow';
                ey.innerHTML = o.eyebrow;
                ey.style.color = o.eyebrowColor;
                contentInner.appendChild(ey);
            }

            var h = document.createElement('h2');
            h.className = 'bkbg-sf-heading';
            h.innerHTML = o.heading;
            h.style.color = o.headingColor;
            contentInner.appendChild(h);

            if (o.subtext) {
                var sub = document.createElement('p');
                sub.className = 'bkbg-sf-text';
                sub.innerHTML = o.subtext;
                sub.style.color = o.subtextColor;
                contentInner.appendChild(sub);
            }

            if (o.showBullets && o.bullets && o.bullets.length) {
                var ul = document.createElement('ul');
                ul.className = 'bkbg-sf-bullets';
                o.bullets.forEach(function (b) {
                    var li = document.createElement('li');
                    li.className = 'bkbg-sf-bullet';
                    li.style.color = o.bulletColor;
                    var ico = document.createElement('span');
                    ico.className = 'bkbg-sf-bullet-icon';
                    var _bIP = window.bkbgIconPicker;
                    var _bType = o.bulletIconType || 'custom-char';
                    if (_bIP && _bType !== 'custom-char') {
                        var _bn = _bIP.buildFrontendIcon(_bType, o.bulletIcon, o.bulletIconDashicon, o.bulletIconImageUrl, o.bulletIconDashiconColor);
                        if (_bn) ico.appendChild(_bn);
                        else ico.textContent = o.bulletIcon;
                    } else {
                        ico.textContent = o.bulletIcon;
                    }
                    ico.style.color = o.bulletIconColor;
                    li.appendChild(ico);
                    var txt = document.createElement('span');
                    txt.textContent = b.text;
                    li.appendChild(txt);
                    ul.appendChild(li);
                });
                contentInner.appendChild(ul);
            }

            contentPanel.appendChild(contentInner);

            /* ── Form panel ────────────────────────────────── */
            var formPanel = document.createElement('div');
            formPanel.className = 'bkbg-sf-form-panel';
            formPanel.style.cssText = 'flex:' + formFlex + ';background:' + o.formBg;

            if (o.showFormTitle && o.formTitle) {
                var ft = document.createElement('h3');
                ft.className = 'bkbg-sf-form-title';
                ft.textContent = o.formTitle;
                ft.style.color = o.formHeadingColor;
                formPanel.appendChild(ft);
            }
            if (o.formSubtext) {
                var fs = document.createElement('p');
                fs.className = 'bkbg-sf-form-subtext';
                fs.textContent = o.formSubtext;
                fs.style.color = o.formHeadingColor;
                formPanel.appendChild(fs);
            }

            /* Success message (hidden) */
            var successEl = document.createElement('div');
            successEl.className = 'bkbg-sf-success';
            successEl.style.color = o.formHeadingColor;
            successEl.textContent = o.successMsg;
            formPanel.appendChild(successEl);

            /* Form */
            var form = document.createElement('form');
            form.className = 'bkbg-sf-form';
            form.action = o.formAction || '#';
            form.method = o.formMethod || 'post';

            var inputCss = 'border-radius:' + o.inputRadius + 'px;background:' + o.inputBg + ';border-color:' + o.inputBorder + ';color:' + o.inputColor;

            if (o.showName) {
                form.appendChild(makeInput('text', o.namePlaceholder, 'name', inputCss, o.inputFocusBorder, o.inputBorder));
            }

            form.appendChild(makeInput('email', o.emailPlaceholder, 'email', inputCss, o.inputFocusBorder, o.inputBorder));

            if (o.showPhone) {
                form.appendChild(makeInput('tel', o.phonePlaceholder, 'phone', inputCss, o.inputFocusBorder, o.inputBorder));
            }

            var btn = document.createElement('button');
            btn.type = 'submit';
            btn.className = 'bkbg-sf-submit';
            btn.textContent = o.submitLabel;
            btn.style.cssText = 'background:' + o.btnBg + ';color:' + o.btnColor + ';border-radius:' + o.btnRadius + 'px';
            form.appendChild(btn);

            if (o.showPrivacy && o.privacyNote) {
                var priv = document.createElement('p');
                priv.className = 'bkbg-sf-privacy';
                priv.textContent = o.privacyNote;
                priv.style.color = o.privacyColor;
                form.appendChild(priv);
            }

            /* Submit handler (prevent default, show success) */
            form.addEventListener('submit', function (e) {
                if (!o.formAction || o.formAction === '#') {
                    e.preventDefault();
                    form.style.display = 'none';
                    successEl.classList.add('is-visible');
                }
            });

            formPanel.appendChild(form);

            /* ── Assemble ──────────────────────────────────── */
            if (o.contentSide === 'left') {
                panels.appendChild(contentPanel);
                panels.appendChild(formPanel);
            } else {
                panels.appendChild(formPanel);
                panels.appendChild(contentPanel);
            }

            section.appendChild(panels);
            appEl.parentNode.insertBefore(section, appEl);
        });
    }

    function makeInput(type, placeholder, name, css, focusBorder, defaultBorder) {
        var inp = document.createElement('input');
        inp.type = type;
        inp.placeholder = placeholder;
        inp.name = name;
        inp.style.cssText = css;
        inp.addEventListener('focus', function () { inp.style.borderColor = focusBorder; inp.style.borderWidth = '2px'; });
        inp.addEventListener('blur',  function () { inp.style.borderColor = defaultBorder; inp.style.borderWidth = '1px'; });
        return inp;
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();

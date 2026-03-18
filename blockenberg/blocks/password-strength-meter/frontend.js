(function () {
    'use strict';

    var _typoKeys = {
        family: '-ff', sizeDesktop: '-fs', sizeTablet: '-fs-tab', sizeMobile: '-fs-mob',
        weight: '-fw', style: '-fst', decoration: '-td', transform: '-tt',
        letterSpacing: '-ls', lineHeight: '-lh'
    };
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj) return;
        Object.keys(_typoKeys).forEach(function (k) {
            var v = obj[k]; if (v === undefined || v === '') return;
            var u = (k === 'sizeDesktop' || k === 'sizeTablet' || k === 'sizeMobile')
                ? (String(v).match(/[a-z%]/i) ? v : v + 'px')
                : (k === 'lineHeight' ? String(v) : v);
            el.style.setProperty(prefix + _typoKeys[k], u);
        });
    }

    function scorePassword(pw, minLen) {
        if (!pw) return 0;
        var score = 0;
        if (pw.length >= minLen) score++;
        if (/[A-Z]/.test(pw)) score++;
        if (/[a-z]/.test(pw)) score++;
        if (/[0-9]/.test(pw)) score++;
        if (/[^a-zA-Z0-9]/.test(pw)) score++;
        return score; // 0-5
    }

    var LEVEL_COLORS = [null, '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

    function init(app) {
        var a;
        try { a = JSON.parse(app.getAttribute('data-opts')); } catch(e) { return; }

        var minLen = a.minLength || 8;
        var strengthColors = [null, a.colorWeak||'#ef4444', a.colorFair||'#f59e0b', a.colorGood||'#3b82f6', a.colorStrong||'#10b981'];
        var strengthLabels = [null, a.labelWeak||'Weak', a.labelFair||'Fair', a.labelGood||'Good', a.labelStrong||'Strong'];

        // Section wrappers
        app.style.paddingTop    = (a.paddingTop || 60) + 'px';
        app.style.paddingBottom = (a.paddingBottom || 60) + 'px';
        if (a.sectionBg) app.style.background = a.sectionBg;
        app.innerHTML = '';

        var wrap = document.createElement('div');
        wrap.className = 'bkbg-psm-wrap';
        wrap.style.maxWidth     = (a.maxWidth || 480) + 'px';
        wrap.style.borderRadius = (a.cardRadius || 16) + 'px';
        wrap.style.background   = a.cardBg || '#fff';
        app.appendChild(wrap);

        // Header
        if (a.showTitle || a.showSubtitle) {
            var header = document.createElement('div');
            header.className = 'bkbg-psm-header';
            if (a.showTitle && a.title) {
                var title = document.createElement('div');
                title.className = 'bkbg-psm-title';
                title.textContent = a.title;
                if (a.titleColor) title.style.color = a.titleColor;
                typoCssVarsForEl(title, a.titleTypo, '--bkbg-psm-title');
                header.appendChild(title);
            }
            if (a.showSubtitle && a.subtitle) {
                var sub = document.createElement('div');
                sub.className = 'bkbg-psm-subtitle';
                sub.textContent = a.subtitle;
                if (a.subtitleColor) sub.style.color = a.subtitleColor;
                typoCssVarsForEl(sub, a.subtitleTypo, '--bkbg-psm-subtitle');
                header.appendChild(sub);
            }
            wrap.appendChild(header);
        }

        // Input row
        var inputWrap = document.createElement('div');
        inputWrap.className = 'bkbg-psm-input-wrap';

        var input = document.createElement('input');
        input.type = 'password';
        input.className = 'bkbg-psm-input';
        input.placeholder = a.placeholder || 'Enter a password…';
        input.style.borderRadius = (a.inputRadius || 10) + 'px';
        input.style.border    = '1.5px solid ' + (a.inputBorder || '#e5e7eb');
        input.style.background = a.inputBg || '#f9fafb';
        if (!a.showToggleVisibility) input.style.paddingRight = '16px';
        inputWrap.appendChild(input);

        if (a.showToggleVisibility) {
            var toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.className = 'bkbg-psm-toggle-vis';
            toggleBtn.textContent = '👁️';
            var visible = false;
            toggleBtn.addEventListener('click', function() {
                visible = !visible;
                input.type = visible ? 'text' : 'password';
                toggleBtn.textContent = visible ? '🙈' : '👁️';
            });
            inputWrap.appendChild(toggleBtn);
        }
        wrap.appendChild(inputWrap);

        // Strength bar
        var bar = document.createElement('div');
        bar.className = 'bkbg-psm-bar';
        var segments = [1,2,3,4].map(function(i) {
            var seg = document.createElement('div');
            seg.className = 'bkbg-psm-bar-seg';
            seg.style.background = a.barBg || '#e5e7eb';
            bar.appendChild(seg);
            return seg;
        });
        wrap.appendChild(bar);

        // Strength label row
        var strengthRow = document.createElement('div');
        strengthRow.className = 'bkbg-psm-strength-row';
        var strengthHint = document.createElement('span');
        strengthHint.className = 'bkbg-psm-strength-hint';
        strengthHint.style.color = a.labelColor || '#6b7280';
        strengthHint.textContent = '';
        var strengthLabel = document.createElement('span');
        strengthLabel.className = 'bkbg-psm-strength-label';
        strengthRow.appendChild(strengthHint);
        strengthRow.appendChild(strengthLabel);
        wrap.appendChild(strengthRow);

        // Requirements
        var reqs = [
            { key:'showLengthReq',    test: function(pw){ return pw.length >= minLen; },    label: 'At least ' + minLen + ' characters' },
            { key:'showUppercaseReq', test: function(pw){ return /[A-Z]/.test(pw); },       label: 'Uppercase letter (A-Z)' },
            { key:'showLowercaseReq', test: function(pw){ return /[a-z]/.test(pw); },       label: 'Lowercase letter (a-z)' },
            { key:'showNumberReq',    test: function(pw){ return /[0-9]/.test(pw); },        label: 'Number (0-9)' },
            { key:'showSymbolReq',    test: function(pw){ return /[^a-zA-Z0-9]/.test(pw); }, label: 'Special character (!@#…)' }
        ].filter(function(r){ return a[r.key]; });

        var reqEls = [];
        if (reqs.length) {
            var reqContainer = document.createElement('div');
            reqContainer.className = 'bkbg-psm-reqs';
            reqs.forEach(function(r) {
                var row = document.createElement('div');
                row.className = 'bkbg-psm-req';
                var icon = document.createElement('span');
                icon.className = 'bkbg-psm-req-icon';
                icon.textContent = '○';
                var txt = document.createElement('span');
                txt.textContent = r.label;
                row.appendChild(icon);
                row.appendChild(txt);
                reqContainer.appendChild(row);
                reqEls.push({ el: row, icon: icon, test: r.test });
            });
            wrap.appendChild(reqContainer);
        }

        function update() {
            var pw = input.value;
            var score = scorePassword(pw, minLen);
            var level = pw.length === 0 ? 0 : (score <= 2 ? score <= 1 ? 1 : 2 : score <= 3 ? 3 : 4);

            segments.forEach(function(seg, i) {
                seg.style.background = (pw.length > 0 && i < level)
                    ? (strengthColors[level] || '#10b981')
                    : (a.barBg || '#e5e7eb');
            });

            if (pw.length > 0) {
                strengthHint.textContent  = 'Password strength:';
                strengthLabel.textContent = strengthLabels[level] || '';
                strengthLabel.style.color = strengthColors[level] || '#10b981';
            } else {
                strengthHint.textContent  = '';
                strengthLabel.textContent = '';
            }

            reqEls.forEach(function(r) {
                var met = pw.length > 0 && r.test(pw);
                r.el.classList.toggle('met', met);
                r.icon.textContent = met ? '✓' : '○';
                r.el.style.color = met ? (a.reqMetColor || '#10b981') : (a.reqUnmetColor || '#9ca3af');
            });
        }

        input.addEventListener('input', update);
        update();
    }

    document.querySelectorAll('.bkbg-psm-app').forEach(init);
})();

(function () {
    'use strict';

    function applyCSS(el, styles) {
        Object.keys(styles).forEach(function (k) { el.style[k] = styles[k]; });
    }

    function makeEl(tag, className, styles) {
        var el = document.createElement(tag);
        if (className) el.className = className;
        if (styles) applyCSS(el, styles);
        return el;
    }

    function makeText(tag, className, text, styles) {
        var el = makeEl(tag, className, styles);
        el.textContent = text;
        return el;
    }

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
        var lhu = typo.lineHeightUnit || '';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) el.style.setProperty(prefix + 'line-height-d', typo.lineHeightDesktop + lhu);
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) el.style.setProperty(prefix + 'line-height-t', typo.lineHeightTablet + lhu);
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) el.style.setProperty(prefix + 'line-height-m', typo.lineHeightMobile + lhu);
        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) el.style.setProperty(prefix + 'letter-spacing-d', typo.letterSpacingDesktop + lsu);
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) el.style.setProperty(prefix + 'letter-spacing-t', typo.letterSpacingTablet + lsu);
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) el.style.setProperty(prefix + 'letter-spacing-m', typo.letterSpacingMobile + lsu);
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) el.style.setProperty(prefix + 'word-spacing-d', typo.wordSpacingDesktop + wsu);
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) el.style.setProperty(prefix + 'word-spacing-t', typo.wordSpacingTablet + wsu);
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) el.style.setProperty(prefix + 'word-spacing-m', typo.wordSpacingMobile + wsu);
    }

    function init() {
        document.querySelectorAll('.bkbg-cert-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                style: 'classic',
                badgeEmoji: '🏆',
                showBadge: true,
                preTitle: 'Certificate of Completion',
                awardedTo: 'This certifies that',
                recipientName: 'Jane Doe',
                courseTitle: 'Advanced Web Development',
                courseDesc: 'has successfully completed the full course curriculum.',
                issuerName: 'Blockenberg Academy',
                issuerLogoUrl: '',
                completionDate: '',
                credentialId: '',
                showCredentialId: true,
                showDate: true,
                showSignature1: true,
                signature1Name: 'Alex Johnson',
                signature1Title: 'Course Director',
                showSignature2: false,
                signature2Name: '',
                signature2Title: '',
                fontFamily: 'serif',
                maxWidth: 800,
                bgColor: '#fffef7',
                borderColor: '#c9a84c',
                accentColor: '#8b6914',
                preTitleColor: '#8b6914',
                recipientColor: '#1e293b',
                courseTitleColor: '#1a3a6b',
                descColor: '#475569',
                issuerColor: '#1e293b',
                metaColor: '#64748b',
                borderWidth: 6,
                borderRadius: 4,
                innerBorder: true,
                shadowSize: 2
            }, opts);

            var fontFamily = o.fontFamily === 'serif'
                ? 'Georgia, "Times New Roman", serif'
                : 'system-ui, -apple-system, sans-serif';

            var shadowVal = o.shadowSize > 0
                ? '0 ' + (o.shadowSize * 4) + 'px ' + (o.shadowSize * 16) + 'px rgba(0,0,0,.' + (o.shadowSize * 4) + ')'
                : 'none';

            // Outer wrap
            var wrap = makeEl('div', 'bkbg-cert-wrap bkbg-cert-style-' + o.style);
            applyCSS(wrap, {
                background: o.bgColor,
                border: o.borderWidth + 'px solid ' + o.borderColor,
                borderRadius: o.borderRadius + 'px',
                maxWidth: o.maxWidth + 'px',
                margin: '0 auto',
                padding: '48px 56px',
                position: 'relative',
                fontFamily: fontFamily,
                boxShadow: shadowVal,
                boxSizing: 'border-box',
                textAlign: 'center'
            });

            typoCssVarsForEl(o.typoRecipient, '--bkbg-cert-r-', wrap);
            typoCssVarsForEl(o.typoCourseTitle, '--bkbg-cert-ct-', wrap);
            typoCssVarsForEl(o.typoBody, '--bkbg-cert-bd-', wrap);

            // Inner border
            if (o.innerBorder) {
                var ib = makeEl('div', 'bkbg-cert-inner-border');
                applyCSS(ib, {
                    position: 'absolute',
                    inset: '10px',
                    border: '1px solid ' + o.borderColor,
                    pointerEvents: 'none',
                    borderRadius: o.borderRadius + 'px'
                });
                wrap.appendChild(ib);
            }

            // Corner decorations (classic only)
            if (o.style === 'classic') {
                var cornerPositions = ['tl', 'tr', 'bl', 'br'];
                cornerPositions.forEach(function (pos) {
                    var c = makeEl('span', 'bkbg-cert-corner ' + pos);
                    c.textContent = '✦';
                    c.style.color = o.accentColor;
                    wrap.appendChild(c);
                });
            }

            // Body
            var body = makeEl('div', 'bkbg-cert-body');
            body.style.position = 'relative';
            body.style.zIndex = '1';

            // Badge
            if (o.showBadge) {
                var badge = makeEl('div', 'bkbg-cert-badge');
                applyCSS(badge, {
                    borderColor: o.accentColor,
                    color: o.accentColor,
                    margin: '0 auto 16px'
                });
                badge.textContent = o.badgeEmoji;
                body.appendChild(badge);
            }

            // Pre-title
            body.appendChild(makeText('div', 'bkbg-cert-pretitle', o.preTitle, { color: o.preTitleColor }));

            // Awarded to
            body.appendChild(makeText('div', 'bkbg-cert-awarded-to', o.awardedTo, { color: o.descColor }));

            // Recipient name
            body.appendChild(makeText('div', 'bkbg-cert-recipient', o.recipientName, { color: o.recipientColor }));

            // Course title
            body.appendChild(makeText('div', 'bkbg-cert-course', o.courseTitle, { color: o.courseTitleColor }));

            // Description
            if (o.courseDesc) {
                body.appendChild(makeText('div', 'bkbg-cert-desc', o.courseDesc, { color: o.descColor }));
            }

            // Divider
            var mkDivider = function () {
                var d = makeEl('div', 'bkbg-cert-divider');
                d.style.setProperty('--bkbg-cert-accent', o.accentColor);
                d.style.background = o.accentColor;
                return d;
            };
            body.appendChild(mkDivider());

            // Signatures
            if (o.showSignature1 || o.showSignature2) {
                var sigsRow = makeEl('div', 'bkbg-cert-sigs-row');

                function makeSig(name, title) {
                    var sig = makeEl('div', 'bkbg-cert-sig');
                    var line = makeEl('div', 'bkbg-cert-sig-line');
                    line.style.borderColor = o.metaColor;
                    sig.appendChild(line);
                    sig.appendChild(makeText('div', 'bkbg-cert-sig-name', name, { color: o.issuerColor }));
                    sig.appendChild(makeText('div', 'bkbg-cert-sig-title', title, { color: o.metaColor }));
                    return sig;
                }

                if (o.showSignature1) sigsRow.appendChild(makeSig(o.signature1Name, o.signature1Title));
                if (o.showSignature2) sigsRow.appendChild(makeSig(o.signature2Name, o.signature2Title));
                body.appendChild(sigsRow);
            }

            body.appendChild(mkDivider());

            // Issuer row
            var issuerRow = makeEl('div', 'bkbg-cert-issuer-row');
            if (o.issuerLogoUrl) {
                var logo = document.createElement('img');
                logo.src = o.issuerLogoUrl;
                logo.alt = o.issuerName;
                logo.className = 'bkbg-cert-logo';
                issuerRow.appendChild(logo);
            }
            issuerRow.appendChild(makeText('div', 'bkbg-cert-issuer-name', o.issuerName, { color: o.issuerColor }));
            body.appendChild(issuerRow);

            // Meta row
            if (o.showDate || o.showCredentialId) {
                var metaRow = makeEl('div', 'bkbg-cert-meta');
                metaRow.style.color = o.metaColor;

                if (o.showDate && o.completionDate) {
                    var dateSpan = document.createElement('span');
                    dateSpan.className = 'bkbg-cert-date';
                    var dateLabel = makeText('span', 'bkbg-cert-meta-label', 'Date: ');
                    var dateVal = document.createElement('span');
                    dateVal.textContent = o.completionDate;
                    dateSpan.appendChild(dateLabel);
                    dateSpan.appendChild(dateVal);
                    metaRow.appendChild(dateSpan);
                }

                if (o.showCredentialId && o.credentialId) {
                    var credSpan = document.createElement('span');
                    credSpan.className = 'bkbg-cert-cred';
                    var credLabel = makeText('span', 'bkbg-cert-meta-label', 'Credential ID: ');
                    var credVal = document.createElement('span');
                    credVal.textContent = o.credentialId;
                    credSpan.appendChild(credLabel);
                    credSpan.appendChild(credVal);
                    metaRow.appendChild(credSpan);
                }

                body.appendChild(metaRow);
            }

            wrap.appendChild(body);

            appEl.parentNode.insertBefore(wrap, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();

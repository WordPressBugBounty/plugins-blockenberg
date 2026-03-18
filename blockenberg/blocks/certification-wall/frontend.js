(function () {
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
        document.querySelectorAll('.bkbg-crt-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                eyebrow: 'Trusted & Verified',
                heading: 'Our Certifications & Accreditations',
                subtext: 'Industry-recognised credentials that demonstrate our commitment to excellence.',
                certs: [
                    { name: 'ISO 9001:2015', issuer: 'ISO', year: '2023', imageUrl: '', verifyUrl: '#' },
                    { name: 'AWS Certified', issuer: 'Amazon', year: '2023', imageUrl: '', verifyUrl: '#' }
                ],
                layout: 'grid', columns: 3, showYear: true, showIssuer: true, showVerify: true,
                verifyLabel: 'Verify Certificate',
                maxWidth: 1100, paddingTop: 80, paddingBottom: 80,
                bgColor: '#f8fafc', headingColor: '#111827', subColor: '#6b7280', eyebrowColor: '#6366f1',
                cardBg: '#ffffff', cardBorder: '#e2e8f0', nameColor: '#111827', issuerColor: '#6b7280',
                accentColor: '#6366f1', verifyColor: '#6366f1'
            }, opts);

            el.parentElement && (el.parentElement.style.background = o.bgColor);

            if (el.parentElement) {
                typoCssVarsForEl(o.typoHeading, '--bkbg-crt-h-', el.parentElement);
                typoCssVarsForEl(o.typoSubtext, '--bkbg-crt-s-', el.parentElement);
                typoCssVarsForEl(o.typoCertName, '--bkbg-crt-cn-', el.parentElement);
            }

            var inner = document.createElement('div');
            inner.className = 'bkbg-crt-inner';
            inner.style.cssText = 'max-width:' + o.maxWidth + 'px;margin:0 auto;padding:' + o.paddingTop + 'px 24px ' + o.paddingBottom + 'px;';

            /* Header */
            var header = document.createElement('div');
            header.className = 'bkbg-crt-header';
            header.style.cssText = 'text-align:center;margin-bottom:48px;';

            var ey = document.createElement('p');
            ey.className = 'bkbg-crt-eyebrow';
            ey.style.color = o.eyebrowColor;
            ey.innerHTML = o.eyebrow;

            var h2 = document.createElement('h2');
            h2.className = 'bkbg-crt-heading';
            h2.style.color = o.headingColor;
            h2.innerHTML = o.heading;

            var sub = document.createElement('p');
            sub.className = 'bkbg-crt-sub';
            sub.style.color = o.subColor;
            sub.innerHTML = o.subtext;

            header.appendChild(ey);
            header.appendChild(h2);
            header.appendChild(sub);
            inner.appendChild(header);

            /* Grid */
            var grid = document.createElement('div');
            grid.className = 'bkbg-crt-grid layout-' + o.layout;
            if (o.layout !== 'list') {
                grid.style.gridTemplateColumns = 'repeat(' + o.columns + ',1fr)';
            }

            (o.certs || []).forEach(function (cert) {
                var card = document.createElement('div');
                card.className = 'bkbg-crt-card';
                card.style.cssText = 'background:' + o.cardBg + ';border-color:' + o.cardBorder;

                /* Badge */
                if (cert.imageUrl) {
                    var img = document.createElement('img');
                    img.className = 'bkbg-crt-badge';
                    img.src = cert.imageUrl;
                    img.alt = cert.name;
                    card.appendChild(img);
                } else {
                    var ph = document.createElement('div');
                    ph.className = 'bkbg-crt-badge-placeholder';
                    ph.style.cssText = 'background:' + o.accentColor + '22;color:' + o.accentColor;
                    ph.textContent = '🏆';
                    card.appendChild(ph);
                }

                /* Body */
                var body = document.createElement('div');
                body.className = 'bkbg-crt-card-body';

                var name = document.createElement('div');
                name.className = 'bkbg-crt-name';
                name.style.color = o.nameColor;
                name.textContent = cert.name;
                body.appendChild(name);

                if (o.showIssuer && cert.issuer) {
                    var issuer = document.createElement('div');
                    issuer.className = 'bkbg-crt-issuer';
                    issuer.style.color = o.issuerColor;
                    issuer.textContent = cert.issuer;
                    body.appendChild(issuer);
                }

                if (o.showYear && cert.year) {
                    var year = document.createElement('div');
                    year.className = 'bkbg-crt-year';
                    year.style.color = o.issuerColor;
                    year.textContent = cert.year;
                    body.appendChild(year);
                }

                if (o.showVerify && cert.verifyUrl) {
                    var verify = document.createElement('a');
                    verify.className = 'bkbg-crt-verify';
                    verify.href = cert.verifyUrl;
                    verify.target = '_blank';
                    verify.rel = 'noopener noreferrer';
                    verify.style.color = o.verifyColor;
                    verify.textContent = o.verifyLabel;
                    body.appendChild(verify);
                }

                card.appendChild(body);
                grid.appendChild(card);
            });

            inner.appendChild(grid);
            el.appendChild(inner);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();

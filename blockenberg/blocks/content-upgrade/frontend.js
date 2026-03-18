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
        var lhu = typo.lineHeightUnit || 'px';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) el.style.setProperty(prefix + 'line-height-d', typo.lineHeightDesktop + lhu);
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) el.style.setProperty(prefix + 'line-height-t', typo.lineHeightTablet + lhu);
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) el.style.setProperty(prefix + 'line-height-m', typo.lineHeightMobile + lhu);
        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) {
            el.style.setProperty(prefix + 'letter-spacing-d', typo.letterSpacingDesktop + lsu);
            el.style.setProperty(prefix + 'letter-spacing',   typo.letterSpacingDesktop + lsu);
        }
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) el.style.setProperty(prefix + 'letter-spacing-t', typo.letterSpacingTablet + lsu);
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) el.style.setProperty(prefix + 'letter-spacing-m', typo.letterSpacingMobile + lsu);
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) {
            el.style.setProperty(prefix + 'word-spacing-d', typo.wordSpacingDesktop + wsu);
            el.style.setProperty(prefix + 'word-spacing',   typo.wordSpacingDesktop + wsu);
        }
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) el.style.setProperty(prefix + 'word-spacing-t', typo.wordSpacingTablet + wsu);
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) el.style.setProperty(prefix + 'word-spacing-m', typo.wordSpacingMobile + wsu);
    }

    function init() {
        document.querySelectorAll('.bkbg-cup-app').forEach(function (el) {
            if (el.dataset.rendered) return;
            el.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(el.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                heading: '🎁 Free Bonus: Download the Checklist',
                description: 'Get the complete step-by-step checklist we use to implement everything covered in this article. Instant download, no spam.',
                imageUrl: '', imageAlt: '', style: 'boxed',
                formPlaceholder: 'Enter your email address', formSubmitLabel: 'Send Me the Checklist',
                formAction: '#', successMessage: '🎉 Check your inbox! The download is on its way.',
                paddingTop: 40, paddingBottom: 40, borderRadius: 12,
                accentColor: '#6366f1', bgColor: '#f5f3ff', borderColor: '#ddd6fe',
                headingColor: '#1e1b4b', descColor: '#4b5563', inputBg: '#ffffff',
                inputBorder: '#d1d5db', inputColor: '#111827',
                submitBg: '#6366f1', submitColor: '#ffffff'
            }, opts);

            var wrap = document.createElement('div');
            wrap.className = 'bkbg-cup-wrap style-' + o.style;
            wrap.style.cssText =
                'padding:' + o.paddingTop + 'px 32px ' + o.paddingBottom + 'px;' +
                'background:' + (o.style === 'minimal' ? 'transparent' : o.bgColor) + ';' +
                'border-color:' + o.borderColor + ';' +
                'border-radius:' + (o.style === 'minimal' ? '0' : o.borderRadius + 'px') + ';' +
                (o.style === 'minimal' ? 'border-left-color:' + o.accentColor + ';' : '');

            typoCssVarsForEl(o.typoHeading, '--bkcup-head-', wrap);
            typoCssVarsForEl(o.typoDesc, '--bkcup-desc-', wrap);

            /* Image column */
            var imgCol;
            if (o.imageUrl) {
                imgCol = document.createElement('div');
                imgCol.className = 'bkbg-cup-image-col';
                var img = document.createElement('img');
                img.src = o.imageUrl; img.alt = o.imageAlt;
                imgCol.appendChild(img);
            } else {
                imgCol = document.createElement('div');
                imgCol.className = 'bkbg-cup-image-placeholder';
                imgCol.style.background = o.accentColor + '22';
                imgCol.textContent = '🎁';
            }
            wrap.appendChild(imgCol);

            /* Content column */
            var content = document.createElement('div');
            content.className = 'bkbg-cup-content';

            var heading = document.createElement('p');
            heading.className = 'bkbg-cup-heading'; heading.style.color = o.headingColor;
            heading.innerHTML = o.heading;
            content.appendChild(heading);

            var desc = document.createElement('p');
            desc.className = 'bkbg-cup-desc'; desc.style.color = o.descColor;
            desc.innerHTML = o.description;
            content.appendChild(desc);

            /* Form */
            var form = document.createElement('form');
            form.className = 'bkbg-cup-form';
            form.action = o.formAction; form.method = 'post';

            var input = document.createElement('input');
            input.type = 'email'; input.name = 'email'; input.required = true;
            input.className = 'bkbg-cup-input'; input.placeholder = o.formPlaceholder;
            input.style.cssText = 'background:' + o.inputBg + ';border-color:' + o.inputBorder + ';color:' + o.inputColor;

            var submit = document.createElement('button');
            submit.type = 'submit'; submit.className = 'bkbg-cup-submit';
            submit.style.cssText = 'background:' + o.submitBg + ';color:' + o.submitColor;
            submit.textContent = o.formSubmitLabel;

            form.appendChild(input); form.appendChild(submit);
            content.appendChild(form);

            /* Success message */
            var success = document.createElement('p');
            success.className = 'bkbg-cup-success';
            success.style.cssText = 'background:' + o.accentColor + '22;color:' + o.headingColor;
            success.textContent = o.successMessage;
            content.appendChild(success);

            form.addEventListener('submit', function (e) {
                if (o.formAction === '#' || o.formAction === '') {
                    e.preventDefault();
                    form.style.display = 'none';
                    success.classList.add('visible');
                }
            });

            wrap.appendChild(content);
            el.appendChild(wrap);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();

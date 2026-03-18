wp.domReady(function () {
    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo || typeof typo !== 'object') return;
        var m = {
            family: 'font-family', weight: 'font-weight',
            transform: 'text-transform', style: 'font-style', decoration: 'text-decoration'
        };
        Object.keys(m).forEach(function (k) {
            if (typo[k]) el.style.setProperty(prefix + m[k], typo[k]);
        });
        var r = {
            size: 'font-size', lineHeight: 'line-height',
            letterSpacing: 'letter-spacing', wordSpacing: 'word-spacing'
        };
        Object.keys(r).forEach(function (k) {
            ['Desktop', 'Tablet', 'Mobile'].forEach(function (d, i) {
                var v = typo[k + d];
                if (v === undefined || v === '') return;
                var suffix = ['-d', '-t', '-m'][i];
                var unit = typo[k + 'Unit'] || ('size' === k ? 'px' : (k === 'lineHeight' ? '' : 'px'));
                el.style.setProperty(prefix + r[k] + suffix, v + unit);
            });
        });
    }

    document.querySelectorAll('.bkbg-faqs-app').forEach(function (el) {
        var a = JSON.parse(el.dataset.opts || '{}');
        var items = a.items || [];
        var isSplit = a.layout === 'split';
        var isTwoCol = a.layout === 'two-column';
        var openItems = a.expandFirst ? [0] : [];

        /* === Wrap === */
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-faqs-wrap';
        wrap.style.background = a.bgColor || '#ffffff';
        wrap.style.paddingTop = (a.paddingTop || 80) + 'px';
        wrap.style.paddingBottom = (a.paddingBottom || 80) + 'px';
        typoCssVarsForEl(a.typoEyebrow, '--bkbg-fsec-eb-', wrap);
        typoCssVarsForEl(a.typoHeading, '--bkbg-fsec-hd-', wrap);
        typoCssVarsForEl(a.typoSubtext, '--bkbg-fsec-st-', wrap);
        typoCssVarsForEl(a.typoQuestion, '--bkbg-fsec-qt-', wrap);
        typoCssVarsForEl(a.typoAnswer, '--bkbg-fsec-an-', wrap);

        /* === Inner === */
        var inner = document.createElement('div');
        inner.style.maxWidth = (a.maxWidth || 800) + 'px';
        inner.style.margin = '0 auto';
        inner.style.padding = '0 20px';
        if (isSplit) { inner.className = 'bkbg-faqs-inner--split'; inner.style.maxWidth = '1100px'; }
        if (isTwoCol) { inner.className = 'bkbg-faqs-inner--two-column'; }

        /* === Header === */
        var header = document.createElement('div');
        header.className = 'bkbg-faqs-header';
        if (!isSplit) { header.style.textAlign = 'center'; }

        if (a.showEyebrow && a.eyebrow) {
            var eyebrow = document.createElement('span');
            eyebrow.className = 'bkbg-faqs-eyebrow';
            eyebrow.style.cssText = 'display:inline-block;background:' + (a.eyebrowBg || '#f3f0ff') + ';color:' + (a.eyebrowColor || '#7c3aed') + ';padding:4px 14px;border-radius:999px;margin-bottom:16px;';
            eyebrow.innerHTML = a.eyebrow;
            header.appendChild(eyebrow);
        }

        var heading = document.createElement('h2');
        heading.className = 'bkbg-faqs-heading';
        heading.style.cssText = 'color:' + (a.headingColor || '#111827') + ';margin:0 0 16px;';
        heading.innerHTML = a.heading || 'Frequently Asked Questions';
        header.appendChild(heading);

        if (a.showSubtext && a.subtext) {
            var sub = document.createElement('p');
            sub.className = 'bkbg-faqs-subtext';
            sub.style.cssText = 'color:' + (a.subtextColor || '#6b7280') + ';max-width:560px;margin:' + (isSplit ? '0' : '0 auto') + ';';
            sub.innerHTML = a.subtext;
            header.appendChild(sub);
        }

        /* === Accordion === */
        var accordion = document.createElement('div');
        accordion.className = 'bkbg-faqs-accordion';

        /* Icon helper */
        function makeIcon(open) {
            var span = document.createElement('span');
            span.className = 'bkbg-faqs-icon bkbg-faqs-icon--' + (a.iconType || 'chevron');
            span.style.color = a.iconColor || '#7c3aed';
            if (a.iconType === 'plus') {
                span.textContent = open ? '−' : '+';
                span.style.fontSize = '20px';
            } else if (a.iconType === 'arrow') {
                span.textContent = '→';
                span.style.fontSize = '14px';
                if (open) { span.style.transform = 'rotate(90deg)'; }
            } else {
                span.textContent = '▾';
                span.style.fontSize = '14px';
                if (open) { span.style.transform = 'rotate(180deg)'; }
            }
            return span;
        }

        var itemEls = [];

        items.forEach(function (item, idx) {
            var isOpen = openItems.indexOf(idx) !== -1;

            var itemEl = document.createElement('div');
            itemEl.className = 'bkbg-faqs-item' + (isOpen ? ' bkbg-faqs-item--open' : '');
            itemEl.style.borderBottom = (a.showDividers !== false) ? '1px solid ' + (a.dividerColor || '#e5e7eb') : 'none';
            itemEl.style.borderRadius = (a.itemRadius || 10) + 'px';

            var row = document.createElement('div');
            row.className = 'bkbg-faqs-question-row';

            var qSpan = document.createElement('span');
            qSpan.className = 'bkbg-faqs-question';
            qSpan.style.color = isOpen ? (a.activeAccent || '#7c3aed') : (a.questionColor || '#111827');
            qSpan.innerHTML = item.question || '';

            var icon = makeIcon(isOpen);

            row.appendChild(qSpan);
            row.appendChild(icon);

            var answerWrap = document.createElement('div');
            answerWrap.className = 'bkbg-faqs-answer';
            var answerP = document.createElement('p');
            answerP.style.color = a.answerColor || '#4b5563';
            answerP.innerHTML = item.answer || '';
            answerWrap.appendChild(answerP);

            /* Set initial open state */
            if (isOpen) { itemEl.classList.add('bkbg-faqs-item--open'); }

            row.addEventListener('click', function () {
                var wasOpen = itemEl.classList.contains('bkbg-faqs-item--open');

                if (!a.allowMultiple) {
                    itemEls.forEach(function (otherEl, i) {
                        otherEl.classList.remove('bkbg-faqs-item--open');
                        var otherQ = otherEl.querySelector('.bkbg-faqs-question');
                        if (otherQ) { otherQ.style.color = a.questionColor || '#111827'; }
                        var otherIcon = otherEl.querySelector('.bkbg-faqs-icon');
                        if (otherIcon) {
                            if (a.iconType === 'plus') { otherIcon.textContent = '+'; }
                            else { otherIcon.style.transform = 'none'; }
                        }
                    });
                }

                if (!wasOpen) {
                    itemEl.classList.add('bkbg-faqs-item--open');
                    qSpan.style.color = a.activeAccent || '#7c3aed';
                    if (a.iconType === 'plus') { icon.textContent = '−'; }
                    else { icon.style.transform = a.iconType === 'arrow' ? 'rotate(90deg)' : 'rotate(180deg)'; }
                } else {
                    itemEl.classList.remove('bkbg-faqs-item--open');
                    qSpan.style.color = a.questionColor || '#111827';
                    if (a.iconType === 'plus') { icon.textContent = '+'; }
                    else { icon.style.transform = 'none'; }
                }
            });

            itemEl.appendChild(row);
            itemEl.appendChild(answerWrap);
            accordion.appendChild(itemEl);
            itemEls.push(itemEl);
        });

        /* === CTA row === */
        var body = document.createElement('div');
        body.className = 'bkbg-faqs-body';
        body.appendChild(accordion);

        if (a.showCta && (a.ctaText || a.ctaLabel)) {
            var ctaRow = document.createElement('div');
            ctaRow.className = 'bkbg-faqs-cta-row';
            ctaRow.style.borderTopColor = a.dividerColor || '#e5e7eb';
            ctaRow.style.borderTopStyle = 'solid';
            ctaRow.style.borderTopWidth = '1px';

            if (a.ctaText) {
                var ctaText = document.createElement('span');
                ctaText.className = 'bkbg-faqs-cta-text';
                ctaText.style.cssText = 'color:' + (a.subtextColor || '#6b7280') + ';margin-right:8px;';
                ctaText.innerHTML = a.ctaText;
                ctaRow.appendChild(ctaText);
            }
            if (a.ctaLabel) {
                var ctaLink = document.createElement('a');
                ctaLink.href = a.ctaUrl || '#';
                ctaLink.className = 'bkbg-faqs-cta-link';
                ctaLink.style.cssText = 'color:' + (a.ctaLinkColor || '#7c3aed') + ';text-decoration:underline;';
                ctaLink.innerHTML = a.ctaLabel;
                ctaRow.appendChild(ctaLink);
            }
            body.appendChild(ctaRow);
        }

        /* === Assemble === */
        if (isSplit) {
            inner.appendChild(header);
            inner.appendChild(body);
        } else {
            inner.appendChild(header);
            inner.appendChild(body);
        }
        wrap.appendChild(inner);
        el.replaceWith(wrap);
    });
});

(function () {
    'use strict';

    var _typoKeys = {
        family:'font-family', weight:'font-weight', style:'font-style',
        decoration:'text-decoration', transform:'text-transform',
        sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
        lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
        letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
        wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m'
    };
    function typoCssVarsForEl(el, obj, prefix) {
        if (!obj || typeof obj !== 'object') return;
        Object.keys(_typoKeys).forEach(function (k) {
            var v = obj[k];
            if (v === undefined || v === '' || v === null) return;
            if (k === 'sizeDesktop' || k === 'sizeTablet' || k === 'sizeMobile') v = v + (obj.sizeUnit || 'px');
            else if (k === 'lineHeightDesktop' || k === 'lineHeightTablet' || k === 'lineHeightMobile') v = v + (obj.lineHeightUnit || '');
            else if (k === 'letterSpacingDesktop' || k === 'letterSpacingTablet' || k === 'letterSpacingMobile') v = v + (obj.letterSpacingUnit || 'px');
            else if (k === 'wordSpacingDesktop' || k === 'wordSpacingTablet' || k === 'wordSpacingMobile') v = v + (obj.wordSpacingUnit || 'px');
            el.style.setProperty(prefix + _typoKeys[k], String(v));
        });
    }

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

    function init() {
        document.querySelectorAll('.bkbg-stry-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                layout: 'photo-left',
                headline: 'Our Story',
                subheadline: 'How it all started — and where we\'re headed.',
                bodyText: 'We started with a simple idea: make the web more beautiful and accessible for everyone.',
                founderName: 'Alex Johnson',
                founderTitle: 'Founder & CEO',
                founderPhotoUrl: '',
                showPhoto: true,
                photoCaption: true,
                pullQuote: '"We didn\'t just build a product — we built something we\'re proud of."',
                showPullQuote: true,
                showMilestones: true,
                milestones: [
                    { year: '2018', title: 'Founded', description: 'Started as a one-person project in a home office.' },
                    { year: '2020', title: 'First 1,000 Users', description: 'Reached our first major milestone through word of mouth.' },
                    { year: '2022', title: 'Series A', description: 'Raised funding to grow the team and expand the product.' },
                    { year: '2024', title: 'Global Launch', description: 'Expanded to 40+ countries and 100,000+ active users.' }
                ],
                showCta: true,
                ctaLabel: 'Join Our Journey',
                ctaUrl: '#',
                ctaNewTab: false,
                bgColor: '#ffffff',
                accentColor: '#6366f1',
                headlineColor: '#0f172a',
                subColor: '#475569',
                bodyColor: '#334155',
                quoteColor: '#1e293b',
                yearColor: '#6366f1',
                milestoneTitleColor: '#0f172a',
                milestoneTextColor: '#475569',
                ctaBg: '#6366f1',
                ctaColor: '#ffffff',
                headlineSize: 40,
                subSize: 18,
                quoteSize: 22,
                bodySize: 16,
                borderRadius: 12,
                photoBorderRadius: 12
            }, opts);

            // ── outer block ──────────────────────────────────────────────────────
            var block = makeEl('div', 'bkbg-stry-block', { background: o.bgColor });

            // Typography vars on block wrapper
            typoCssVarsForEl(block, o.headlineTypo,    '--bkstry-hl-');
            typoCssVarsForEl(block, o.subheadlineTypo, '--bkstry-sh-');
            typoCssVarsForEl(block, o.bodyTypo,        '--bkstry-bd-');
            typoCssVarsForEl(block, o.quoteTypo,       '--bkstry-qt-');

            // ── main row ────────────────────────────────────────────────────────
            var mainClass = 'bkbg-stry-main bkbg-stry-layout-' + o.layout;
            var main = makeEl('div', mainClass);

            // ── photo column ─────────────────────────────────────────────────────
            function buildPhotoCol() {
                var photoCol = makeEl('div', 'bkbg-stry-photo-col');
                var photoWrap = makeEl('div', 'bkbg-stry-photo-wrap', {
                    borderRadius: o.photoBorderRadius + 'px'
                });

                if (o.founderPhotoUrl) {
                    var img = document.createElement('img');
                    img.src = o.founderPhotoUrl;
                    img.alt = o.founderName;
                    img.className = 'bkbg-stry-photo';
                    img.style.borderRadius = o.photoBorderRadius + 'px';
                    photoWrap.appendChild(img);

                    if (o.photoCaption) {
                        var caption = makeEl('div', 'bkbg-stry-founder-caption', { color: o.subColor });
                        var nameStrong = document.createElement('strong');
                        nameStrong.textContent = o.founderName;
                        nameStrong.style.color = o.headlineColor;
                        caption.appendChild(nameStrong);
                        if (o.founderTitle) {
                            caption.appendChild(document.createTextNode(', ' + o.founderTitle));
                        }
                        photoWrap.appendChild(caption);
                    }
                }

                photoCol.appendChild(photoWrap);
                return photoCol;
            }

            // ── content column ───────────────────────────────────────────────────
            function buildContentCol() {
                var col = makeEl('div', 'bkbg-stry-content-col');

                col.appendChild(makeText('h2', 'bkbg-stry-headline', o.headline, {
                    color: o.headlineColor
                }));

                col.appendChild(makeText('p', 'bkbg-stry-subheadline', o.subheadline, {
                    color: o.subColor
                }));

                col.appendChild(makeText('p', 'bkbg-stry-body', o.bodyText, {
                    color: o.bodyColor
                }));

                if (o.showPullQuote && o.pullQuote) {
                    var quote = makeText('blockquote', 'bkbg-stry-quote', o.pullQuote, {
                        color: o.quoteColor,
                        borderLeftColor: o.accentColor
                    });
                    // centered layout: switch to border-top
                    if (o.layout === 'centered') {
                        quote.style.borderLeft = 'none';
                        quote.style.borderTop = '4px solid ' + o.accentColor;
                    }
                    col.appendChild(quote);
                }

                if (o.showCta && o.ctaLabel) {
                    var ctaRow = makeEl('div', 'bkbg-stry-cta-row');
                    var ctaLink = document.createElement('a');
                    ctaLink.href = o.ctaUrl || '#';
                    if (o.ctaNewTab) { ctaLink.target = '_blank'; ctaLink.rel = 'noopener noreferrer'; }
                    ctaLink.className = 'bkbg-stry-cta-btn';
                    ctaLink.textContent = o.ctaLabel;
                    applyCSS(ctaLink, {
                        background: o.ctaBg,
                        color: o.ctaColor,
                        borderRadius: o.borderRadius + 'px'
                    });
                    ctaRow.appendChild(ctaLink);
                    col.appendChild(ctaRow);
                }

                return col;
            }

            // Build columns in correct order per layout
            if (o.layout === 'centered') {
                if (o.showPhoto && o.founderPhotoUrl) main.appendChild(buildPhotoCol());
                main.appendChild(buildContentCol());
            } else if (o.layout === 'photo-right') {
                main.appendChild(buildContentCol());
                if (o.showPhoto) main.appendChild(buildPhotoCol());
            } else {
                // photo-left (default)
                if (o.showPhoto) main.appendChild(buildPhotoCol());
                main.appendChild(buildContentCol());
            }

            block.appendChild(main);

            // ── milestones ───────────────────────────────────────────────────────
            if (o.showMilestones && o.milestones && o.milestones.length) {
                var msSection = makeEl('div', 'bkbg-stry-milestones');

                var msLine = makeEl('div', 'bkbg-stry-milestone-line', {
                    background: o.accentColor
                });
                msSection.appendChild(msLine);

                var msList = makeEl('div', 'bkbg-stry-milestone-list');

                o.milestones.forEach(function (m) {
                    var ms = makeEl('div', 'bkbg-stry-milestone');

                    var dot = makeEl('div', 'bkbg-stry-milestone-dot', {
                        background: o.accentColor
                    });
                    ms.appendChild(dot);

                    var mInner = makeEl('div', 'bkbg-stry-milestone-inner');
                    mInner.appendChild(makeText('div', 'bkbg-stry-milestone-year', m.year, { color: o.yearColor }));
                    mInner.appendChild(makeText('div', 'bkbg-stry-milestone-title', m.title, { color: o.milestoneTitleColor }));
                    mInner.appendChild(makeText('div', 'bkbg-stry-milestone-desc', m.description, { color: o.milestoneTextColor }));

                    ms.appendChild(mInner);
                    msList.appendChild(ms);
                });

                msSection.appendChild(msList);
                block.appendChild(msSection);
            }

            appEl.parentNode.insertBefore(block, appEl);
            appEl.style.display = 'none';
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();

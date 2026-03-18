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

    function mk(tag, cls, styles) {
        var d = document.createElement(tag);
        if (cls) d.className = cls;
        if (styles) Object.keys(styles).forEach(function (k) { d.style[k] = styles[k]; });
        return d;
    }
    function mkText(tag, cls, text, styles) {
        var d = mk(tag, cls, styles);
        d.textContent = text;
        return d;
    }

    function init() {
        document.querySelectorAll('.bkbg-press-release-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts; try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = {
                releaseLabel:          opts.releaseLabel          || 'FOR IMMEDIATE RELEASE',
                showReleaseLabel:      opts.showReleaseLabel      !== false,
                city:                  opts.city                  || '',
                releaseDate:           opts.releaseDate           || '',
                showDateline:          opts.showDateline          !== false,
                headline:              opts.headline              || '',
                subheadline:           opts.subheadline           || '',
                showSubheadline:       opts.showSubheadline       !== false,
                introParagraph:        opts.introParagraph        || '',
                bodyParagraphs:        opts.bodyParagraphs        || [],
                endMarker:             opts.endMarker             || '###',
                showEndMarker:         opts.showEndMarker         !== false,
                boilerplateTitle:      opts.boilerplateTitle      || 'About',
                boilerplateText:       opts.boilerplateText       || '',
                showBoilerplate:       opts.showBoilerplate       !== false,
                mediaContactName:      opts.mediaContactName      || '',
                mediaContactTitle:     opts.mediaContactTitle     || '',
                mediaContactCompany:   opts.mediaContactCompany   || '',
                mediaContactEmail:     opts.mediaContactEmail     || '',
                mediaContactPhone:     opts.mediaContactPhone     || '',
                showMediaContact:      opts.showMediaContact      !== false,
                headlineTypo:          opts.headlineTypo          || {},
                bodyTypo:              opts.bodyTypo              || {},
                maxWidth:              opts.maxWidth              !== undefined ? opts.maxWidth         : 760,
                borderRadius:          opts.borderRadius          !== undefined ? opts.borderRadius     : 8,
                bgColor:               opts.bgColor               || '#ffffff',
                textColor:             opts.textColor             || '#1a1a2e',
                headlineColor:         opts.headlineColor         || '#0f172a',
                subheadlineColor:      opts.subheadlineColor      || '#475569',
                dateBorderColor:       opts.dateBorderColor       || '#e2e8f0',
                releaseLabelColor:     opts.releaseLabelColor     || '#dc2626',
                boilerplateBg:         opts.boilerplateBg         || '#f8fafc',
                boilerplateBorderColor:opts.boilerplateBorderColor|| '#e2e8f0',
                boilerplateTextColor:  opts.boilerplateTextColor  || '#64748b',
                contactBg:             opts.contactBg             || '#f1f5f9',
                contactBorderColor:    opts.contactBorderColor    || '#cbd5e1',
                contactColor:          opts.contactColor          || '#334155',
                accentColor:           opts.accentColor           || '#2563eb'
            };

            /* ── Outer block ─────────────────────────────────── */
            var block = mk('div', 'bkbg-pr-block', {
                background: o.bgColor,
                maxWidth: o.maxWidth + 'px',
                margin: '0 auto',
                color: o.textColor,
                padding: '40px 48px',
                border: '1px solid ' + o.dateBorderColor,
                borderRadius: o.borderRadius + 'px',
                boxSizing: 'border-box'
            });

            /* Release label */
            if (o.showReleaseLabel && o.releaseLabel) {
                block.appendChild(mkText('div', 'bkbg-pr-release-label', o.releaseLabel, {
                    fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
                    letterSpacing: '.12em', color: o.releaseLabelColor, marginBottom: '8px'
                }));
            }

            /* Dateline */
            if (o.showDateline) {
                var dateline = [];
                if (o.city) dateline.push(o.city);
                if (o.releaseDate) dateline.push(o.releaseDate);
                if (dateline.length) {
                    block.appendChild(mkText('div', 'bkbg-pr-dateline', dateline.join(', '), {
                        fontSize: '13px', color: o.subheadlineColor,
                        marginBottom: '24px', paddingBottom: '16px',
                        borderBottom: '1px solid ' + o.dateBorderColor
                    }));
                }
            }

            /* Headline */
            if (o.headline) {
                block.appendChild(mkText('h1', 'bkbg-pr-headline', o.headline, {
                    color: o.headlineColor,
                    margin: '0 0 12px'
                }));
            }

            /* Subheadline */
            if (o.showSubheadline && o.subheadline) {
                block.appendChild(mkText('h2', 'bkbg-pr-subheadline', o.subheadline, {
                    color: o.subheadlineColor,
                    margin: '0 0 28px'
                }));
            }

            /* Intro paragraph */
            if (o.introParagraph) {
                block.appendChild(mkText('p', 'bkbg-pr-intro', o.introParagraph, {
                    margin: '0 0 18px', color: o.textColor
                }));
            }

            /* Body paragraphs */
            o.bodyParagraphs.forEach(function (para) {
                if (para) {
                    block.appendChild(mkText('p', 'bkbg-pr-para', para, {
                        margin: '0 0 18px', color: o.textColor
                    }));
                }
            });

            /* End marker */
            if (o.showEndMarker && o.endMarker) {
                block.appendChild(mkText('p', 'bkbg-pr-end', o.endMarker, {
                    textAlign: 'center', color: o.textColor, margin: '24px 0'
                }));
            }

            /* Boilerplate */
            if (o.showBoilerplate && o.boilerplateText) {
                var boiler = mk('div', 'bkbg-pr-boilerplate', {
                    background: o.boilerplateBg, border: '1px solid ' + o.boilerplateBorderColor,
                    borderRadius: (o.borderRadius > 2 ? o.borderRadius - 2 : o.borderRadius) + 'px',
                    padding: '18px 20px', marginBottom: '16px', fontFamily: 'Arial, sans-serif'
                });
                boiler.appendChild(mkText('strong', 'bkbg-pr-boilerplate-title', o.boilerplateTitle, {
                    fontSize: '13px', fontWeight: '700', display: 'block', marginBottom: '6px', color: o.textColor
                }));
                boiler.appendChild(mkText('p', 'bkbg-pr-boilerplate-text', o.boilerplateText, {
                    margin: '0', color: o.boilerplateTextColor
                }));
                block.appendChild(boiler);
            }

            /* Media contact */
            if (o.showMediaContact && o.mediaContactName) {
                var contact = mk('div', 'bkbg-pr-contact', {
                    background: o.contactBg, border: '1px solid ' + o.contactBorderColor,
                    borderRadius: (o.borderRadius > 2 ? o.borderRadius - 2 : o.borderRadius) + 'px',
                    padding: '14px 20px', fontSize: '13px', fontFamily: 'Arial, sans-serif',
                    lineHeight: '1.65'
                });

                contact.appendChild(mkText('div', 'bkbg-pr-contact-heading', 'Media Contact', {
                    fontWeight: '700', marginBottom: '4px', color: o.contactColor
                }));

                var nameTitle = o.mediaContactName + (o.mediaContactTitle ? ', ' + o.mediaContactTitle : '');
                contact.appendChild(mkText('div', '', nameTitle, { color: o.contactColor }));

                if (o.mediaContactCompany) {
                    contact.appendChild(mkText('div', '', o.mediaContactCompany, { color: o.contactColor, opacity: '.85' }));
                }

                if (o.mediaContactEmail) {
                    var emailWrap = mk('div', '', { marginTop: '4px' });
                    var emailLink = mk('a', '', { color: o.accentColor, textDecoration: 'none' });
                    emailLink.href = 'mailto:' + o.mediaContactEmail;
                    emailLink.textContent = o.mediaContactEmail;
                    emailWrap.appendChild(emailLink);
                    contact.appendChild(emailWrap);
                }

                if (o.mediaContactPhone) {
                    contact.appendChild(mkText('div', '', o.mediaContactPhone, { color: o.contactColor }));
                }

                block.appendChild(contact);
            }

            /* ── Insert ──────────────────────────────────────── */
            appEl.parentNode.insertBefore(block, appEl);
            appEl.style.display = 'none';

            /* Apply typography CSS vars to the block wrapper */
            var wrapper = appEl.parentElement;
            if (wrapper) {
                typoCssVarsForEl(wrapper, o.headlineTypo, '--bkbg-pr-hl-');
                typoCssVarsForEl(wrapper, o.bodyTypo, '--bkbg-pr-bd-');
            }
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();

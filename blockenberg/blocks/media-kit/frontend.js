(function () {
    'use strict';

    var _typoKeys = { family:'font-family', weight:'font-weight', style:'font-style',
        decoration:'text-decoration', transform:'text-transform',
        sizeDesktop:'font-size-d', sizeTablet:'font-size-t', sizeMobile:'font-size-m',
        lineHeightDesktop:'line-height-d', lineHeightTablet:'line-height-t', lineHeightMobile:'line-height-m',
        letterSpacingDesktop:'letter-spacing-d', letterSpacingTablet:'letter-spacing-t', letterSpacingMobile:'letter-spacing-m',
        wordSpacingDesktop:'word-spacing-d', wordSpacingTablet:'word-spacing-t', wordSpacingMobile:'word-spacing-m' };
    function typoCssVarsForEl(el, typo, prefix) {
        if (!typo || typeof typo !== 'object') return;
        Object.keys(_typoKeys).forEach(function (k) {
            if (typo[k] !== undefined && typo[k] !== '') el.style.setProperty(prefix + _typoKeys[k], String(typo[k]));
        });
    }

    function ce(tag, attrs, children) {
        var el = document.createElement(tag);
        if (attrs) {
            Object.keys(attrs).forEach(function (k) {
                if (k === 'className') { el.className = attrs[k]; }
                else if (k === 'style') { Object.assign(el.style, attrs[k]); }
                else if (k === 'textContent') { el.textContent = attrs[k]; }
                else if (k === 'innerHTML') { el.innerHTML = attrs[k]; }
                else { el.setAttribute(k, attrs[k]); }
            });
        }
        if (children) {
            (Array.isArray(children) ? children : [children]).forEach(function (child) {
                if (!child) return;
                if (typeof child === 'string') el.appendChild(document.createTextNode(child));
                else el.appendChild(child);
            });
        }
        return el;
    }

    function section(o, titleText, content) {
        var sec = ce('div', {
            className: 'bkbg-mkit-section',
            style: {
                background: o.sectionBg || '#fff',
                borderColor: o.borderColor || '#e5e7eb',
                borderRadius: (o.sectionBorderRadius || 12) + 'px'
            }
        });
        var title = ce('div', {
            className: 'bkbg-mkit-section-title',
            style: { color: o.accentColor || '#6366f1' },
            textContent: titleText
        });
        sec.appendChild(title);
        if (Array.isArray(content)) content.forEach(function (c) { if (c) sec.appendChild(c); });
        else if (content) sec.appendChild(content);
        return sec;
    }

    function buildMediaKit(appEl, o) {

        /* ── Google Fonts ── */
        (o.fonts || []).forEach(function (font) {
            if (font.googleFontUrl) {
                var link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = font.googleFontUrl;
                document.head.appendChild(link);
            }
        });

        var wrap = ce('div', {
            className: 'bkbg-mkit-wrap',
            style: {
                background: o.bgColor || '#f8fafc',
                paddingTop: (o.paddingTop || 40) + 'px',
                paddingBottom: (o.paddingBottom || 40) + 'px'
            }
        });

        typoCssVarsForEl(wrap, o.brandNameTypo, '--bkbg-mkit-bn-');
        typoCssVarsForEl(wrap, o.taglineTypo, '--bkbg-mkit-tl-');
        typoCssVarsForEl(wrap, o.sectionTitleTypo, '--bkbg-mkit-st-');
        typoCssVarsForEl(wrap, o.bodyTypo, '--bkbg-mkit-bd-');
        typoCssVarsForEl(wrap, o.labelTypo, '--bkbg-mkit-lb-');
        typoCssVarsForEl(wrap, o.metaTypo, '--bkbg-mkit-mt-');

        var inner = ce('div', {
            className: 'bkbg-mkit-inner',
            style: { maxWidth: (o.maxWidth || 900) + 'px' }
        });

        /* ── header ── */
        var header = ce('div', {
            className: 'bkbg-mkit-section bkbg-mkit-header',
            style: {
                background: o.sectionBg || '#fff',
                borderColor: o.borderColor || '#e5e7eb',
                borderRadius: (o.sectionBorderRadius || 12) + 'px'
            }
        }, [
            ce('div', { className: 'bkbg-mkit-brand-name', style: { color: o.headingColor || '#111827' }, textContent: o.brandName || '' }),
            o.brandTagline ? ce('div', { className: 'bkbg-mkit-brand-tagline', style: { color: o.textColor || '#374151' }, textContent: o.brandTagline }) : null
        ]);
        inner.appendChild(header);

        /* ── logos ── */
        if (o.showLogos && (o.logoVariants || []).length) {
            var logosGrid = ce('div', { className: 'bkbg-mkit-logos-grid' });
            (o.logoVariants || []).forEach(function (lv) {
                var card = ce('div', {
                    className: 'bkbg-mkit-logo-card',
                    style: {
                        background: o.cardBg || '#f9fafb',
                        borderColor: o.borderColor || '#e5e7eb'
                    }
                });

                var preview = ce('div', {
                    className: 'bkbg-mkit-logo-preview',
                    style: { background: lv.format === 'Dark' ? '#1f2937' : '#fff' }
                });
                if (lv.url) {
                    var img = document.createElement('img');
                    img.src = lv.url;
                    img.alt = lv.label || '';
                    img.style.maxWidth = '100%';
                    img.style.maxHeight = '72px';
                    img.style.objectFit = 'contain';
                    preview.appendChild(img);
                } else {
                    preview.appendChild(ce('div', { className: 'bkbg-mkit-logo-placeholder', textContent: '[ ' + (lv.format || 'Logo') + ' ]' }));
                }
                card.appendChild(preview);
                card.appendChild(ce('div', { className: 'bkbg-mkit-logo-label', style: { color: o.headingColor || '#111827' }, textContent: lv.label || '' }));
                card.appendChild(ce('div', { className: 'bkbg-mkit-logo-format', style: { color: o.labelColor || '#6b7280' }, textContent: lv.format || '' }));

                if (lv.downloadUrl) {
                    var dl = document.createElement('a');
                    dl.className = 'bkbg-mkit-logo-dl';
                    dl.href = lv.downloadUrl;
                    dl.download = '';
                    dl.textContent = '↓ Download';
                    dl.style.color = o.accentColor || '#6366f1';
                    card.appendChild(dl);
                }
                logosGrid.appendChild(card);
            });
            inner.appendChild(section(o, 'Logo Variants', logosGrid));
        }

        /* ── colors ── */
        if (o.showColors && (o.brandColors || []).length) {
            var colsPerRow = o.colorsPerRow || 5;
            var colorsGrid = ce('div', {
                className: 'bkbg-mkit-colors-grid',
                style: { gridTemplateColumns: 'repeat(' + colsPerRow + ', 1fr)' }
            });
            (o.brandColors || []).forEach(function (color) {
                var swatchWrap = ce('div', { className: 'bkbg-mkit-color-swatch-wrap' });
                var swatch = ce('div', {
                    className: 'bkbg-mkit-color-swatch',
                    style: { background: color.hex || '#ccc' }
                });

                /* tooltip */
                var tooltip = ce('div', { className: 'bkbg-mkit-color-tooltip', textContent: 'Copied!' });
                swatch.appendChild(tooltip);

                /* click to copy */
                swatch.setAttribute('title', color.hex || '');
                swatch.style.cursor = 'pointer';
                swatch.addEventListener('click', function () {
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(color.hex || '').then(function () {
                            tooltip.style.opacity = '1';
                            setTimeout(function () { tooltip.style.opacity = '0'; }, 1500);
                        });
                    }
                });

                swatchWrap.appendChild(swatch);
                swatchWrap.appendChild(ce('div', { className: 'bkbg-mkit-color-info' }, [
                    ce('div', { className: 'bkbg-mkit-color-name', style: { color: o.headingColor || '#111827' }, textContent: color.name || '' }),
                    ce('div', { className: 'bkbg-mkit-color-hex', style: { color: o.labelColor || '#6b7280' }, textContent: color.hex || '' })
                ]));
                colorsGrid.appendChild(swatchWrap);
            });
            inner.appendChild(section(o, 'Brand Colors', colorsGrid));
        }

        /* ── fonts ── */
        if (o.showFonts && (o.fonts || []).length) {
            var fontsList = ce('div', { className: 'bkbg-mkit-fonts-list' });
            (o.fonts || []).forEach(function (font) {
                var card = ce('div', {
                    className: 'bkbg-mkit-font-card',
                    style: {
                        background: o.cardBg || '#f9fafb',
                        borderColor: o.borderColor || '#e5e7eb'
                    }
                });
                var header2 = ce('div', { className: 'bkbg-mkit-font-header' }, [
                    ce('div', { className: 'bkbg-mkit-font-name', style: { color: o.headingColor || '#111827', fontFamily: font.name || 'inherit' }, textContent: font.name || '' }),
                    ce('div', { className: 'bkbg-mkit-font-role', style: { color: o.accentColor || '#6366f1' }, textContent: font.role || '' })
                ]);
                var preview = ce('div', {
                    className: 'bkbg-mkit-font-preview',
                    style: {
                        fontFamily: font.name || 'inherit',
                        color: o.textColor || '#374151'
                    },
                    textContent: font.previewText || 'The quick brown fox jumps over the lazy dog'
                });
                card.appendChild(header2);
                card.appendChild(preview);
                fontsList.appendChild(card);
            });
            inner.appendChild(section(o, 'Typography', fontsList));
        }

        /* ── downloads ── */
        if (o.showDownloads && (o.downloadAllUrl || o.guidelinesDownloadUrl)) {
            var dlContainer = ce('div', { className: 'bkbg-mkit-downloads' });

            if (o.downloadAllUrl) {
                var dlAll = document.createElement('a');
                dlAll.className = 'bkbg-mkit-dl-btn';
                dlAll.href = o.downloadAllUrl;
                dlAll.download = '';
                dlAll.textContent = '⬇ ' + (o.downloadAllLabel || 'Download All Assets (ZIP)');
                dlAll.style.background = o.downloadBg || '#6366f1';
                dlAll.style.color = o.downloadColor || '#fff';
                dlContainer.appendChild(dlAll);
            }

            if (o.guidelinesDownloadUrl) {
                var dlGuide = document.createElement('a');
                dlGuide.className = 'bkbg-mkit-dl-btn is-outline';
                dlGuide.href = o.guidelinesDownloadUrl;
                dlGuide.download = '';
                dlGuide.textContent = '📄 ' + (o.guidelinesLabel || 'Download Brand Guidelines');
                dlGuide.style.color = o.accentColor || '#6366f1';
                dlGuide.style.borderColor = o.accentColor || '#6366f1';
                dlContainer.appendChild(dlGuide);
            }

            inner.appendChild(section(o, 'Asset Downloads', dlContainer));
        }

        /* ── contact ── */
        if (o.showContact && (o.pressEmail || o.websiteUrl)) {
            var contactRow = ce('div', { className: 'bkbg-mkit-contact' });

            if (o.pressEmail) {
                var grp1 = ce('div', { className: 'bkbg-mkit-contact-group' }, [
                    ce('div', { className: 'bkbg-mkit-contact-label', style: { color: o.labelColor || '#6b7280' }, textContent: 'Press Inquiries' }),
                    (function () {
                        var a = document.createElement('a');
                        a.className = 'bkbg-mkit-contact-link';
                        a.href = 'mailto:' + o.pressEmail;
                        a.textContent = o.pressEmail;
                        a.style.color = o.accentColor || '#6366f1';
                        return a;
                    })()
                ]);
                contactRow.appendChild(grp1);
            }

            if (o.websiteUrl) {
                var grp2 = ce('div', { className: 'bkbg-mkit-contact-group' }, [
                    ce('div', { className: 'bkbg-mkit-contact-label', style: { color: o.labelColor || '#6b7280' }, textContent: 'Website' }),
                    (function () {
                        var a = document.createElement('a');
                        a.className = 'bkbg-mkit-contact-link';
                        a.href = o.websiteUrl;
                        a.target = '_blank';
                        a.rel = 'noopener';
                        a.textContent = o.websiteUrl;
                        a.style.color = o.accentColor || '#6366f1';
                        return a;
                    })()
                ]);
                contactRow.appendChild(grp2);
            }

            var contactSec = section(o, 'Media Contact', contactRow);
            contactSec.style.background = o.cardBg || '#f9fafb';
            inner.appendChild(contactSec);
        }

        wrap.appendChild(inner);
        appEl.parentNode.insertBefore(wrap, appEl);
        appEl.style.display = 'none';
    }

    function init() {
        document.querySelectorAll('.bkbg-mkit-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';

            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }

            var o = Object.assign({
                brandName: '',
                brandTagline: '',
                logoVariants: [],
                brandColors: [],
                fonts: [],
                guidelinesLabel: 'Download Brand Guidelines',
                guidelinesDownloadUrl: '',
                downloadAllLabel: 'Download All Assets (ZIP)',
                downloadAllUrl: '',
                pressEmail: '',
                websiteUrl: '',
                showLogos: true,
                showColors: true,
                showFonts: true,
                showDownloads: true,
                showContact: true,
                colorsPerRow: 5,
                maxWidth: 900,
                paddingTop: 40,
                paddingBottom: 40,
                bgColor: '#f8fafc',
                sectionBg: '#ffffff',
                cardBg: '#f9fafb',
                headingColor: '#111827',
                textColor: '#374151',
                labelColor: '#6b7280',
                borderColor: '#e5e7eb',
                accentColor: '#6366f1',
                downloadBg: '#6366f1',
                downloadColor: '#ffffff',
                sectionBorderRadius: 12
            }, opts);

            buildMediaKit(appEl, o);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();

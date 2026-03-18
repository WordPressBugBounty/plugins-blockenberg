(function () {
    'use strict';

    function mk(tag, cls, styles) {
        var d = document.createElement(tag);
        if (cls) d.className = cls;
        if (styles) Object.keys(styles).forEach(function (k) { d.style[k] = styles[k]; });
        return d;
    }
    function tx(tag, cls, text, styles) {
        var d = mk(tag, cls, styles);
        d.textContent = text;
        return d;
    }
    function ap(p) {
        Array.prototype.slice.call(arguments, 1).forEach(function (c) { if (c) p.appendChild(c); });
        return p;
    }

    function sectionIcon(type) {
        if (type === 'nav')     return '\u2630';
        if (type === 'hero')    return '\u2605';
        if (type === 'feature') return '\u25C8';
        if (type === 'content') return '\u00B6';
        if (type === 'cta')     return '\u25B6';
        if (type === 'footer')  return '\u25FB';
        return '\u25AA';
    }

    function buildBlock(appEl) {
        if (appEl.dataset.rendered) return;
        appEl.dataset.rendered = '1';

        var a;
        try { a = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { a = {}; }

        var isDark    = a.browserStyle === 'dark';
        var isMinimal = a.browserStyle === 'minimal';

        var frameBg   = isDark ? '#1e1e1e' : (a.frameBg || '#e8e8e8');
        var frameText = isDark ? '#d4d4d4' : (a.frameText || '#3c3c3c');
        var fontSize  = a.fontSize || 13;
        var radius    = a.borderRadius || 12;

        // Outer frame
        var frame = mk('div', '', {
            borderRadius: radius + 'px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px ' + (a.frameShadow || '#00000033') + ', 0 4px 12px ' + (a.frameShadow || '#00000033'),
            border: '1px solid ' + (isDark ? '#444' : '#d1d5db'),
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        });

        // ── Tab bar ──────────────────────────────────────────────────
        if (!isMinimal && a.showTabs) {
            var tabRow = mk('div', '', {
                display: 'flex', alignItems: 'flex-end', gap: '2px',
                padding: '8px 12px 0', background: frameBg
            });

            // Traffic lights
            var dots = mk('div', '', { display: 'flex', gap: '6px', alignItems: 'center', flexShrink: '0' });
            [['#ef4444'],['#f59e0b'],['#22c55e']].forEach(function (c) {
                ap(dots, mk('span', '', { width: '12px', height: '12px', borderRadius: '50%', background: c[0], display: 'block' }));
            });
            ap(tabRow, dots);
            ap(tabRow, mk('div', '', { width: '16px' }));

            // Active tab
            var activeTab = mk('div', '', {
                display: 'flex', alignItems: 'center', gap: '6px',
                background: a.tabActiveBg || '#ffffff', color: a.tabActiveText || '#111827',
                borderRadius: '6px 6px 0 0', padding: '6px 14px',
                fontSize: (a.titleFontSize || 13) + 'px', fontWeight: '500',
                maxWidth: '160px', whiteSpace: 'nowrap', overflow: 'hidden'
            });
            ap(activeTab, tx('span', '', '\u25C9', { fontSize: '10px' }), tx('span', '', a.tabTitle || 'Tab', {}));
            ap(tabRow, activeTab);

            // Inactive tabs
            [a.tabTitle ? 'New Tab' : 'Tab 2', '+'].forEach(function (t) {
                ap(tabRow, tx('div', '', t, {
                    background: a.tabInactiveBg || '#d1d5db', color: a.tabInactiveText || '#6b7280',
                    borderRadius: '6px 6px 0 0', padding: '6px 10px', fontSize: (fontSize - 1) + 'px'
                }));
            });
            ap(frame, tabRow);
        }

        // Minimal-only dots header
        if (isMinimal) {
            var minHead = mk('div', '', { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', background: frameBg });
            [['#ef4444'],['#f59e0b'],['#22c55e']].forEach(function (c) {
                ap(minHead, mk('span', '', { width: '12px', height: '12px', borderRadius: '50%', background: c[0], display: 'block' }));
            });
            ap(frame, minHead);
        }

        // ── URL bar ──────────────────────────────────────────────────
        if (a.showURL) {
            var urlRow = mk('div', '', {
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: isMinimal ? '0 14px 6px' : '8px 12px',
                background: frameBg
            });

            // Dots when no tab bar
            if (!a.showTabs && !isMinimal) {
                var dotsInline = mk('div', '', { display: 'flex', gap: '6px', alignItems: 'center', marginRight: '8px' });
                [['#ef4444'],['#f59e0b'],['#22c55e']].forEach(function (c) {
                    ap(dotsInline, mk('span', '', { width: '12px', height: '12px', borderRadius: '50%', background: c[0], display: 'block' }));
                });
                ap(urlRow, dotsInline);
            }

            // Nav arrows
            ap(urlRow, tx('div', '', '\u25C0 \u25B6 \u21BB', {
                color: frameText, fontSize: (fontSize - 1) + 'px', opacity: '.7', cursor: 'default', whiteSpace: 'nowrap'
            }));

            // URL pill
            var urlPill = mk('div', '', {
                flex: '1', background: a.urlBarBg || '#ffffff',
                border: '1px solid ' + (a.urlBarBorder || '#d1d5db'),
                borderRadius: '20px', padding: '4px 14px',
                display: 'flex', alignItems: 'center', gap: '6px'
            });
            ap(urlPill, tx('span', '', '\uD83D\uDD12', { fontSize: '10px', color: '#22c55e' }));
            ap(urlPill, tx('span', '', a.url || 'https://yoursite.com', {
                color: a.urlBarText || '#374151', fontSize: fontSize + 'px', userSelect: 'none'
            }));
            ap(urlRow, urlPill);

            ap(urlRow, tx('div', '', '\u22EF \u2606 \u2B07', {
                color: frameText, fontSize: (fontSize - 1) + 'px', opacity: '.7', whiteSpace: 'nowrap'
            }));
            ap(frame, urlRow);
        }

        // ── Bookmarks bar ─────────────────────────────────────────────
        if (a.showBookmarks && a.bookmarks && a.bookmarks.length) {
            var bmRow = mk('div', '', {
                display: 'flex', alignItems: 'center', gap: '2px',
                padding: '4px 14px', background: frameBg,
                borderBottom: '1px solid ' + (isDark ? '#333' : '#d1d5db')
            });
            a.bookmarks.forEach(function (bk) {
                ap(bmRow, tx('div', '', '\uD83D\uDCC4 ' + bk.label, {
                    padding: '2px 10px', borderRadius: '4px', cursor: 'pointer',
                    color: frameText, fontSize: (fontSize - 1) + 'px', opacity: '.8'
                }));
            });
            ap(frame, bmRow);
        }

        // ── Page sections ─────────────────────────────────────────────
        var pageWrap = mk('div', '', { overflow: 'hidden' });
        (a.sections || []).forEach(function (sec) {
            var row = mk('div', '', {
                height: sec.height + 'px', background: sec.bg,
                color: sec.textColor, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: fontSize + 'px',
                fontWeight: sec.type === 'hero' ? '700' : '400',
                overflow: 'hidden', gap: '10px'
            });
            ap(row, tx('span', '', sectionIcon(sec.type), { fontSize: '18px', opacity: '.6' }));
            ap(row, tx('span', '', sec.label || '', {
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%'
            }));
            ap(pageWrap, row);
        });
        ap(frame, pageWrap);
        ap(appEl, frame);
    }

    function init() {
        document.querySelectorAll('.bkbg-browser-mockup-app').forEach(buildBlock);
    }
    if (document.readyState !== 'loading') { init(); } else { document.addEventListener('DOMContentLoaded', init); }
})();

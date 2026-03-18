(function () {
    'use strict';

    function reducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function initToggle(wrap) {
        var cfg = {
            toggleStyle:   wrap.dataset.toggleStyle   || 'switch',
            position:      wrap.dataset.position       || 'inline',
            floatCorner:   wrap.dataset.floatCorner    || 'bottom-right',
            floatX:        parseInt(wrap.dataset.floatX, 10)  || 24,
            floatY:        parseInt(wrap.dataset.floatY, 10)  || 24,
            storageKey:    wrap.dataset.storageKey     || 'bkdm-theme',
            attr:          wrap.dataset.attr           || 'data-theme',
            darkVal:       wrap.dataset.darkVal        || 'dark',
            lightVal:      wrap.dataset.lightVal       || 'light',
            defaultTheme:  wrap.dataset.default        || 'light',
            respectSystem: wrap.dataset.respectSystem  !== 'false',
            buttonSize:    parseInt(wrap.dataset.buttonSize, 10)   || 44,
            borderRadius:  parseInt(wrap.dataset.borderRadius, 10) || 50,
            duration:      reducedMotion() ? 0 : (parseInt(wrap.dataset.duration, 10) || 300),
            showIcon:      wrap.dataset.showIcon       !== 'false',
            showLabel:     wrap.dataset.showLabel      === 'true',
            lightIcon:     wrap.dataset.lightIcon      || '☀️',
            darkIcon:      wrap.dataset.darkIcon       || '🌙',
            lightLabel:    wrap.dataset.lightLabel     || 'Light',
            darkLabel:     wrap.dataset.darkLabel      || 'Dark',
            hoverScale:    wrap.dataset.hoverScale     !== 'false',
            shadow:        wrap.dataset.shadow         !== 'false',
            lightBg:       wrap.dataset.lightBg        || '#f3f4f6',
            lightColor:    wrap.dataset.lightColor     || '#111827',
            darkBg:        wrap.dataset.darkBg         || '#1f2937',
            darkColor:     wrap.dataset.darkColor      || '#f9fafb',
            trackLight:    wrap.dataset.trackLight     || '#d1d5db',
            trackDark:     wrap.dataset.trackDark      || '#4f46e5',
            thumb:         wrap.dataset.thumb          || '#ffffff',
        };

        // Set CSS vars for floating offsets
        wrap.style.setProperty('--bkdm-offset-x', cfg.floatX + 'px');
        wrap.style.setProperty('--bkdm-offset-y', cfg.floatY + 'px');

        // Determine initial theme
        var saved = null;
        try { saved = localStorage.getItem(cfg.storageKey); } catch (e) {}

        var sysDark = cfg.respectSystem
            ? window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
            : false;

        var current = saved || (sysDark ? cfg.darkVal : cfg.lightVal);
        if (!saved && !sysDark) current = cfg.defaultTheme === 'dark' ? cfg.darkVal : cfg.lightVal;

        // Build button
        var btn = wrap.querySelector('.bkdm-btn');
        if (!btn) return;

        var thumbSize = Math.round(cfg.buttonSize * 0.5);

        btn.style.minWidth      = cfg.buttonSize + 'px';
        btn.style.height        = cfg.buttonSize + 'px';
        btn.style.padding       = '0 12px';
        btn.style.borderRadius  = cfg.borderRadius + 'px';
        btn.style.fontSize      = Math.round(cfg.buttonSize * 0.42) + 'px';
        btn.style.transition    = 'background ' + cfg.duration + 'ms ease, color ' + cfg.duration + 'ms ease, transform 0.15s ease';
        if (cfg.shadow) btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.18)';

        if (cfg.hoverScale) {
            btn.addEventListener('mouseenter', function () { btn.style.transform = 'scale(1.08)'; });
            btn.addEventListener('mouseleave', function () { btn.style.transform = 'scale(1)'; });
        }

        // Build inner HTML for switch style
        var iconEl, trackEl, thumbEl, labelEl;

        if (cfg.toggleStyle === 'switch') {
            btn.style.background  = 'none';
            btn.style.boxShadow   = 'none';
            btn.style.padding     = '0';
            btn.style.minWidth    = 'unset';
            btn.style.height      = 'unset';

            if (cfg.showIcon) {
                iconEl = document.createElement('span');
                iconEl.className = 'bkdm-icon';
                iconEl.style.fontSize = Math.round(cfg.buttonSize * 0.42) + 'px';
                iconEl.style.transition = 'opacity ' + cfg.duration + 'ms ease';
                btn.appendChild(iconEl);
            }

            trackEl = document.createElement('div');
            trackEl.className = 'bkdm-track';
            trackEl.style.width         = (cfg.buttonSize + 4) + 'px';
            trackEl.style.height        = Math.round(cfg.buttonSize * 0.6) + 'px';
            trackEl.style.borderRadius  = cfg.borderRadius + 'px';
            trackEl.style.transition    = 'background ' + cfg.duration + 'ms ease';

            thumbEl = document.createElement('div');
            thumbEl.className = 'bkdm-thumb';
            thumbSize = Math.round(cfg.buttonSize * 0.6) - 4;
            thumbEl.style.width      = thumbSize + 'px';
            thumbEl.style.height     = thumbSize + 'px';
            thumbEl.style.background = cfg.thumb;
            thumbEl.style.transition = 'transform ' + cfg.duration + 'ms ease';

            trackEl.appendChild(thumbEl);
            btn.appendChild(trackEl);

            if (cfg.showLabel) {
                labelEl = document.createElement('span');
                labelEl.className = 'bkdm-label';
                btn.appendChild(labelEl);
            }
        } else {
            // icon/button style
            if (cfg.showIcon) {
                iconEl = document.createElement('span');
                iconEl.className = 'bkdm-icon';
                iconEl.style.transition = 'opacity ' + cfg.duration + 'ms ease';
                btn.appendChild(iconEl);
            }
            if (cfg.showLabel) {
                labelEl = document.createElement('span');
                labelEl.className = 'bkdm-label';
                btn.appendChild(labelEl);
            }
        }

        function apply(theme) {
            var isDark = (theme === cfg.darkVal);
            current = theme;

            // Apply attribute to html element
            document.documentElement.setAttribute(cfg.attr.replace(/^data-/, ''), isDark ? cfg.darkVal : cfg.lightVal);
            // Also set the full data attribute
            document.documentElement.setAttribute(cfg.attr, isDark ? cfg.darkVal : cfg.lightVal);

            try { localStorage.setItem(cfg.storageKey, theme); } catch (e) {}

            btn.setAttribute('aria-pressed', String(isDark));

            if (iconEl)  iconEl.textContent  = isDark ? cfg.darkIcon  : cfg.lightIcon;
            if (labelEl) labelEl.textContent  = isDark ? cfg.darkLabel : cfg.lightLabel;

            if (cfg.toggleStyle === 'switch') {
                trackEl.style.background = isDark ? cfg.trackDark : cfg.trackLight;
                var travelX = trackEl.offsetWidth - thumbSize - 4;
                thumbEl.style.transform = isDark ? 'translateX(' + travelX + 'px)' : 'translateX(0)';
            } else {
                btn.style.background = isDark ? cfg.darkBg    : cfg.lightBg;
                btn.style.color      = isDark ? cfg.darkColor : cfg.lightColor;
            }
        }

        btn.addEventListener('click', function () {
            var next = (current === cfg.darkVal) ? cfg.lightVal : cfg.darkVal;
            apply(next);
        });

        // Initial paint (defer one tick so track has layout)
        requestAnimationFrame(function () { apply(current); });

        // Listen to system pref changes
        if (cfg.respectSystem && window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
                try { if (localStorage.getItem(cfg.storageKey)) return; } catch (ex) {}
                apply(e.matches ? cfg.darkVal : cfg.lightVal);
            });
        }
    }

    function init() {
        var wraps = document.querySelectorAll('.bkdm-wrap[data-toggle-style]');
        wraps.forEach(function (wrap) { initToggle(wrap); });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

}());

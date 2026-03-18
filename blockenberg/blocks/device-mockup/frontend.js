(function () {
    'use strict';

    var ASPECTS = { phone: 9 / 19.5, tablet: 4 / 3, laptop: 16 / 10, browser: 16 / 10 };

    var FRAME_COLORS = {
        'silver':     '#d4d4d8',
        'space-gray': '#374151',
        'gold':       '#d4a853',
        'white':      '#f9fafb',
        'black':      '#111827',
    };

    var PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="300" height="200" fill="%23e5e7eb"/><text x="50%25" y="50%25" font-family="sans-serif" font-size="14" fill="%239ca3af" text-anchor="middle" dy=".3em">No Image</text></svg>';

    function reducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function el(tag, attrs, children) {
        var node = document.createElement(tag);
        if (attrs) {
            Object.keys(attrs).forEach(function (k) {
                if (k === 'style' && typeof attrs[k] === 'object') {
                    Object.assign(node.style, attrs[k]);
                } else {
                    node.setAttribute(k, attrs[k]);
                }
            });
        }
        if (children) {
            (Array.isArray(children) ? children : [children]).forEach(function (c) {
                if (c) node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
            });
        }
        return node;
    }

    function buildDevice(wrap) {
        var cfg = {
            device:       wrap.dataset.device      || 'phone',
            frameColor:   wrap.dataset.frameColor  || 'silver',
            frameCustom:  wrap.dataset.frameCustom || '#d4d4d8',
            maxWidth:     parseInt(wrap.dataset.maxWidth, 10)    || 380,
            scale:        parseFloat(wrap.dataset.scale)         || 100,
            tiltX:        parseFloat(wrap.dataset.tiltX)         || 0,
            tiltY:        parseFloat(wrap.dataset.tiltY)         || 0,
            shadow:       wrap.dataset.shadow      !== 'false',
            shadowInt:    parseInt(wrap.dataset.shadowInt, 10)   || 30,
            reflection:   wrap.dataset.reflection  === 'true',
            hoverLift:    wrap.dataset.hoverLift   !== 'false',
            scrollAnim:   wrap.dataset.scrollAnim  === 'true',
            frameStroke:  parseInt(wrap.dataset.frameStroke, 10) || 12,
            screenRadius: parseInt(wrap.dataset.screenRadius, 10)|| 8,
            outerRadius:  parseInt(wrap.dataset.outerRadius, 10) || 40,
            notch:        wrap.dataset.notch       !== 'false',
            homeInd:      wrap.dataset.homeInd     !== 'false',
            browserChrome:wrap.dataset.browserChrome !== 'false',
            browserUrl:   wrap.dataset.browserUrl  || 'https://example.com',
            imgUrl:       wrap.dataset.imgUrl      || PLACEHOLDER,
            imgAlt:       wrap.dataset.imgAlt      || '',
            align:        wrap.dataset.align       || 'center',
        };

        var frameColor = cfg.frameColor === 'custom' ? cfg.frameCustom : (FRAME_COLORS[cfg.frameColor] || '#d4d4d8');
        var aspect = ASPECTS[cfg.device] || (9 / 19.5);
        var sw = cfg.maxWidth;
        var fs = cfg.frameStroke;
        var or = cfg.outerRadius;
        var sr = cfg.screenRadius;
        var scale = cfg.scale / 100;

        var shadowVal = cfg.shadow
            ? '0 ' + Math.round(sw * 0.06) + 'px ' + Math.round(sw * 0.14) + 'px rgba(0,0,0,' + (cfg.shadowInt / 100) + ')'
            : 'none';

        var tform = '';
        if (cfg.tiltX !== 0 || cfg.tiltY !== 0) {
            tform = 'perspective(1200px) rotateX(' + cfg.tiltY + 'deg) rotateY(' + cfg.tiltX + 'deg)';
        }
        if (scale !== 1) tform += (tform ? ' ' : '') + 'scale(' + scale + ')';

        wrap.style.textAlign = cfg.align === 'right' ? 'right' : cfg.align === 'center' ? 'center' : 'left';

        var outer = el('div', { class: 'bkdv-device-outer' });
        if (tform && !reducedMotion()) outer.style.transform = tform;

        function makeImg() {
            var img = el('img');
            img.src = cfg.imgUrl;
            img.alt = cfg.imgAlt;
            img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;';
            return img;
        }

        function makeReflection() {
            var r = el('div');
            r.style.cssText = 'position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.2) 0%,transparent 55%);pointer-events:none;z-index:2;';
            return r;
        }

        /* ── Phone / Tablet ── */
        if (cfg.device === 'phone' || cfg.device === 'tablet') {
            var device = el('div');
            device.style.cssText = 'position:relative;width:' + sw + 'px;box-sizing:border-box;background:' + frameColor + ';border-radius:' + or + 'px;padding:' + fs + 'px;box-shadow:' + shadowVal + ';display:inline-block;';

            var screen = el('div');
            screen.style.cssText = 'position:relative;width:100%;padding-bottom:' + (100 / aspect) + '%;border-radius:' + sr + 'px;overflow:hidden;background:#000;';

            screen.appendChild(makeImg());

            if (cfg.reflection) screen.appendChild(makeReflection());

            if (cfg.notch && cfg.device === 'phone') {
                var notch = el('div', { class: 'bkdv-notch' });
                notch.style.cssText = 'position:absolute;top:0;left:50%;transform:translateX(-50%);width:28%;height:20px;background:' + frameColor + ';border-bottom-left-radius:12px;border-bottom-right-radius:12px;z-index:3;';
                screen.appendChild(notch);
            }

            device.appendChild(screen);

            if (cfg.homeInd && cfg.device === 'phone') {
                var hi = el('div');
                hi.style.cssText = 'position:absolute;bottom:' + Math.round(fs / 2) + 'px;left:50%;transform:translateX(-50%);width:35%;height:4px;border-radius:2px;background:rgba(255,255,255,0.6);';
                device.appendChild(hi);
            }

            outer.appendChild(device);
        }

        /* ── Laptop ── */
        else if (cfg.device === 'laptop') {
            var lidW = sw;
            var lid = el('div');
            lid.style.cssText = 'width:' + lidW + 'px;height:' + Math.round(lidW * 0.6) + 'px;background:' + frameColor + ';border-radius:12px 12px 0 0;padding:10px 10px 6px;box-sizing:border-box;position:relative;box-shadow:' + shadowVal + ';margin:0 auto;display:block;';

            var screenArea = el('div');
            screenArea.style.cssText = 'width:100%;height:100%;background:#000;border-radius:' + sr + 'px;overflow:hidden;position:relative;';
            screenArea.appendChild(makeImg());
            if (cfg.reflection) screenArea.appendChild(makeReflection());
            lid.appendChild(screenArea);

            var hinge = el('div');
            hinge.style.cssText = 'width:' + Math.round(lidW * 0.15) + 'px;height:4px;background:' + frameColor + ';filter:brightness(0.7);margin:0 auto;display:block;';

            var keyW = Math.round(lidW * 1.15);
            var keybase = el('div');
            keybase.style.cssText = 'width:' + keyW + 'px;height:' + Math.round(lidW * 0.08) + 'px;background:' + frameColor + ';filter:brightness(0.88);border-radius:0 0 8px 8px;margin:0 auto;display:block;position:relative;';

            outer.appendChild(lid);
            outer.appendChild(hinge);
            outer.appendChild(keybase);
        }

        /* ── Browser ── */
        else if (cfg.device === 'browser') {
            var chromeH = cfg.browserChrome ? 38 : 0;
            var container = el('div');
            container.style.cssText = 'width:' + sw + 'px;border-radius:' + or + 'px;overflow:hidden;box-shadow:' + shadowVal + ';display:flex;flex-direction:column;border:1px solid rgba(0,0,0,0.12);';

            if (cfg.browserChrome) {
                var bar = el('div');
                bar.style.cssText = 'display:flex;align-items:center;gap:6px;padding:0 12px;height:' + chromeH + 'px;background:' + (cfg.frameColor === 'black' ? '#1f2937' : '#f3f4f6') + ';border-bottom:1px solid rgba(0,0,0,0.1);flex-shrink:0;';

                function dot(color) {
                    var d = el('div');
                    d.style.cssText = 'width:12px;height:12px;border-radius:50%;background:' + color + ';flex-shrink:0;';
                    return d;
                }
                bar.appendChild(dot('#ef4444'));
                bar.appendChild(dot('#f59e0b'));
                bar.appendChild(dot('#22c55e'));

                var urlBar = el('div');
                urlBar.style.cssText = 'flex:1;height:22px;background:#fff;border-radius:4px;border:1px solid rgba(0,0,0,0.1);display:flex;align-items:center;padding-left:8px;font-size:11px;color:#6b7280;overflow:hidden;white-space:nowrap;font-family:monospace;';
                urlBar.textContent = cfg.browserUrl;
                bar.appendChild(urlBar);
                container.appendChild(bar);
            }

            var viewport = el('div');
            viewport.style.cssText = 'width:100%;padding-bottom:' + (100 / ASPECTS.browser) + '%;position:relative;background:#fff;';
            viewport.appendChild(makeImg());
            if (cfg.reflection) viewport.appendChild(makeReflection());
            container.appendChild(viewport);

            outer.appendChild(container);
        }

        /* Hover lift handled by CSS (.bkdv-wrap[data-hover-lift="true"]) */

        /* Scroll animation */
        if (cfg.scrollAnim && !reducedMotion()) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        wrap.classList.add('bkdv-visible');
                        io.unobserve(wrap);
                    }
                });
            }, { threshold: 0.15 });
            io.observe(wrap);
        } else {
            wrap.classList.add('bkdv-visible');
        }

        wrap.appendChild(outer);
    }

    function init() {
        var wraps = document.querySelectorAll('.bkdv-wrap[data-device]');
        wraps.forEach(function (wrap) { buildDevice(wrap); });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

}());

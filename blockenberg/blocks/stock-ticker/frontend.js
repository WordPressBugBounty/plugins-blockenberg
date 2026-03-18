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

    var CGBASE = 'https://api.coingecko.com/api/v3';

    function fmt(n, sym) {
        if (n === undefined || n === null) return sym + '?';
        if (n >= 1000) return sym + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        if (n >= 1)    return sym + n.toFixed(2);
        return sym + n.toFixed(4);
    }

    function fmtBig(n) {
        if (!n) return 'N/A';
        if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T';
        if (n >= 1e9)  return '$' + (n / 1e9).toFixed(2) + 'B';
        if (n >= 1e6)  return '$' + (n / 1e6).toFixed(2) + 'M';
        return '$' + n.toLocaleString();
    }

    function initTicker(appEl) {
        var raw = appEl.dataset.opts;
        if (!raw) return;
        var opts;
        try { opts = JSON.parse(raw); } catch (e) { return; }

        var sym    = opts.currencySymbol || '$';
        var css    = opts.currency || 'usd';
        var coins  = (opts.coins || 'bitcoin,ethereum,solana').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
        var layout = opts.layout || 'ticker';

        // ── Build outer wrapper ──────────────────────────────────────
        var wrap = document.createElement('div');
        wrap.className = 'bkbg-st-wrap';
        wrap.style.borderRadius = (opts.borderRadius || 12) + 'px';
        wrap.style.overflow = 'hidden';
        wrap.style.backgroundColor = opts.bgColor || '#0f172a';
        wrap.style.color = opts.textColor || '#e2e8f0';
        typoCssVarsForEl(wrap, opts.textTypo, '--bkstk-tx-');
        wrap.style.setProperty('--bkstk-tx-fw', String(opts.fontWeight || 600));
        wrap.style.setProperty('--bkstk-tx-lh', String(opts.lineHeight || 1.4));

        var contentEl = document.createElement('div');
        contentEl.innerHTML = '<div class="bkbg-st-loading">Loading live prices…</div>';
        wrap.appendChild(contentEl);

        var footer = document.createElement('div');
        footer.className = 'bkbg-st-footer';
        footer.style.color = opts.textColor || '#e2e8f0';
        footer.textContent = 'Data: CoinGecko API · Updates every ' + (opts.refreshInterval || 60) + 's';
        wrap.appendChild(footer);

        appEl.parentNode.replaceChild(wrap, appEl);

        // ── Fetch from CoinGecko ─────────────────────────────────────
        function fetchData() {
            var url = CGBASE + '/coins/markets?vs_currency=' + css +
                '&ids=' + coins.join(',') +
                '&order=market_cap_desc&per_page=50&page=1' +
                '&sparkline=false&price_change_percentage=24h';

            fetch(url)
                .then(function (r) {
                    if (!r.ok) throw new Error('HTTP ' + r.status);
                    return r.json();
                })
                .then(function (data) { render(data); })
                .catch(function (err) {
                    contentEl.innerHTML = '<div class="bkbg-st-error">⚠ Unable to load prices. (' + err.message + ')</div>';
                });
        }

        // ── Render ───────────────────────────────────────────────────
        function render(data) {
            if (layout === 'ticker') renderTicker(data);
            else if (layout === 'cards') renderCards(data);
            else renderTable(data);
        }

        function renderTicker(data) {
            var outer = document.createElement('div');
            outer.className = 'bkbg-st-ticker-outer';
            outer.style.backgroundColor = opts.bgColor || '#0f172a';
            outer.style.minHeight = '44px';

            if (opts.showLabel) {
                var badge = document.createElement('div');
                badge.className = 'bkbg-st-live-badge';
                badge.style.backgroundColor = opts.accentColor || '#38bdf8';
                badge.style.color = '#fff';
                var dot = document.createElement('span');
                dot.className = 'bkbg-st-live-dot';
                badge.appendChild(dot);
                badge.appendChild(document.createTextNode(opts.labelText || 'LIVE'));
                outer.appendChild(badge);
            }

            var track = document.createElement('div');
            track.className = 'bkbg-st-ticker-track';
            track.style.animationDuration = (opts.tickerSpeed || 40) + 's';

            function buildItems(arr) {
                var frag = document.createDocumentFragment();
                arr.forEach(function (coin) {
                    var item = document.createElement('span');
                    item.className = 'bkbg-st-item';

                    if (opts.showIcons && coin.image) {
                        var img = document.createElement('img');
                        img.src = coin.image;
                        img.alt = coin.symbol;
                        img.className = 'bkbg-st-img-icon';
                        item.appendChild(img);
                    }

                    if (opts.showSymbol) {
                        var sym2 = document.createElement('span');
                        sym2.className = 'bkbg-st-symbol';
                        sym2.textContent = coin.symbol.toUpperCase();
                        item.appendChild(sym2);
                    }

                    var priceEl = document.createElement('span');
                    priceEl.className = 'bkbg-st-price';
                    priceEl.textContent = fmt(coin.current_price, sym);
                    item.appendChild(priceEl);

                    if (opts.showChange) {
                        var ch = coin.price_change_percentage_24h;
                        var chEl = document.createElement('span');
                        chEl.className = ch >= 0 ? 'bkbg-st-change-up' : 'bkbg-st-change-down';
                        chEl.style.color = ch >= 0 ? (opts.upColor || '#22c55e') : (opts.downColor || '#ef4444');
                        chEl.textContent = (ch >= 0 ? '▲ +' : '▼ ') + (ch ? ch.toFixed(2) : '0.00') + '%';
                        item.appendChild(chEl);
                    }

                    var sep = document.createElement('span');
                    sep.className = 'bkbg-st-sep';
                    sep.textContent = '|';
                    item.appendChild(sep);

                    frag.appendChild(item);
                });
                return frag;
            }

            // Duplicate for seamless loop
            track.appendChild(buildItems(data));
            track.appendChild(buildItems(data));

            if (opts.pauseOnHover) {
                outer.addEventListener('mouseenter', function () { track.classList.add('bkbg-st-paused'); });
                outer.addEventListener('mouseleave', function () { track.classList.remove('bkbg-st-paused'); });
            }

            outer.appendChild(track);
            contentEl.innerHTML = '';
            contentEl.appendChild(outer);
        }

        function renderCards(data) {
            var grid = document.createElement('div');
            grid.className = 'bkbg-st-cards';
            grid.style.gridTemplateColumns = 'repeat(' + (opts.cardColumns || 3) + ', 1fr)';
            grid.style.borderRadius = (opts.borderRadius || 12) + 'px';
            grid.style.padding = '16px';

            data.forEach(function (coin) {
                var card = document.createElement('div');
                card.className = 'bkbg-st-card';
                card.style.backgroundColor = opts.cardBg || '#1e293b';
                card.style.borderRadius = (opts.borderRadius || 12) + 'px';
                card.style.border = '1px solid ' + (opts.borderColor || '#334155');
                card.style.color  = opts.textColor || '#e2e8f0';

                var header = document.createElement('div');
                header.className = 'bkbg-st-card-header';

                if (opts.showIcons && coin.image) {
                    var img = document.createElement('img');
                    img.src = coin.image; img.alt = coin.symbol;
                    img.className = 'bkbg-st-card-icon';
                    header.appendChild(img);
                }

                var nameWrap = document.createElement('div');
                var nameEl = document.createElement('div');
                nameEl.className = 'bkbg-st-card-name';
                nameEl.textContent = coin.name;
                nameWrap.appendChild(nameEl);
                if (opts.showSymbol) {
                    var symEl = document.createElement('div');
                    symEl.className = 'bkbg-st-card-sym';
                    symEl.textContent = coin.symbol.toUpperCase();
                    nameWrap.appendChild(symEl);
                }
                header.appendChild(nameWrap);
                card.appendChild(header);

                var priceEl = document.createElement('div');
                priceEl.className = 'bkbg-st-card-price';
                priceEl.style.fontSize = (opts.fontSize + 2 || 16) + 'px';
                priceEl.textContent = fmt(coin.current_price, sym);
                card.appendChild(priceEl);

                if (opts.showChange) {
                    var ch = coin.price_change_percentage_24h;
                    var chEl = document.createElement('div');
                    chEl.className = 'bkbg-st-card-change';
                    chEl.style.color = ch >= 0 ? (opts.upColor || '#22c55e') : (opts.downColor || '#ef4444');
                    chEl.textContent = (ch >= 0 ? '▲ +' : '▼ ') + (ch ? ch.toFixed(2) : '0.00') + '%';
                    card.appendChild(chEl);
                }

                if (opts.showMarketCap || opts.showVolume) {
                    var meta = document.createElement('div');
                    meta.className = 'bkbg-st-card-meta';
                    meta.style.color = opts.textColor || '#e2e8f0';
                    if (opts.showMarketCap) { var mc = document.createElement('span'); mc.textContent = 'MCap: ' + fmtBig(coin.market_cap); meta.appendChild(mc); }
                    if (opts.showVolume)    { var vol = document.createElement('span'); vol.textContent = 'Vol: ' + fmtBig(coin.total_volume); meta.appendChild(vol); }
                    card.appendChild(meta);
                }

                grid.appendChild(card);
            });

            contentEl.innerHTML = '';
            contentEl.appendChild(grid);
        }

        function renderTable(data) {
            var tableWrap = document.createElement('div');
            tableWrap.className = 'bkbg-st-table-wrap';
            tableWrap.style.borderRadius = (opts.borderRadius || 12) + 'px';

            var table = document.createElement('table');
            table.className = 'bkbg-st-table';
            table.style.color = opts.textColor || '#e2e8f0';
            table.style.backgroundColor = opts.bgColor || '#0f172a';

            var thead = document.createElement('thead');
            var hrow = document.createElement('tr');
            hrow.style.borderBottom = '1px solid ' + (opts.borderColor || '#334155');
            hrow.style.opacity = '0.7';

            function th(txt) {
                var td = document.createElement('th');
                td.textContent = txt;
                td.style.fontWeight = 600;
                td.style.padding = '10px 14px';
                return td;
            }

            hrow.appendChild(th('Asset'));
            hrow.appendChild(th('Price'));
            if (opts.showChange)    hrow.appendChild(th('24h'));
            if (opts.showMarketCap) hrow.appendChild(th('Mkt Cap'));
            if (opts.showVolume)    hrow.appendChild(th('Volume'));
            thead.appendChild(hrow);
            table.appendChild(thead);

            var tbody = document.createElement('tbody');
            data.forEach(function (coin, i) {
                var row = document.createElement('tr');
                row.style.borderBottom = '1px solid ' + (opts.borderColor || '#334155');
                if (i % 2) row.style.background = 'rgba(255,255,255,0.02)';

                function td(inner) {
                    var cell = document.createElement('td');
                    cell.style.padding = '10px 14px';
                    if (typeof inner === 'string') cell.textContent = inner;
                    else cell.appendChild(inner);
                    return cell;
                }

                var assetWrap = document.createElement('div');
                assetWrap.style.display = 'flex';
                assetWrap.style.alignItems = 'center';
                assetWrap.style.gap = '8px';
                if (opts.showIcons && coin.image) {
                    var img = document.createElement('img'); img.src = coin.image; img.alt = coin.symbol;
                    img.style.width = '20px'; img.style.height = '20px'; img.style.borderRadius = '50%';
                    assetWrap.appendChild(img);
                }
                var n = document.createElement('strong'); n.textContent = coin.name; assetWrap.appendChild(n);
                if (opts.showSymbol) {
                    var sp = document.createElement('span'); sp.textContent = coin.symbol.toUpperCase();
                    sp.style.opacity = '0.5'; sp.style.fontSize = '11px'; assetWrap.appendChild(sp);
                }
                row.appendChild(td(assetWrap));

                var priceCell = td(fmt(coin.current_price, sym));
                priceCell.style.textAlign = 'right';
                priceCell.style.fontWeight = '700';
                row.appendChild(priceCell);

                if (opts.showChange) {
                    var ch = coin.price_change_percentage_24h;
                    var chTd = td((ch >= 0 ? '▲ +' : '▼ ') + (ch ? ch.toFixed(2) : '0.00') + '%');
                    chTd.style.textAlign = 'right';
                    chTd.style.color = ch >= 0 ? (opts.upColor || '#22c55e') : (opts.downColor || '#ef4444');
                    row.appendChild(chTd);
                }

                if (opts.showMarketCap) {
                    var mct = td(fmtBig(coin.market_cap)); mct.style.textAlign = 'right'; mct.style.opacity = '0.7'; row.appendChild(mct);
                }
                if (opts.showVolume) {
                    var vt = td(fmtBig(coin.total_volume)); vt.style.textAlign = 'right'; vt.style.opacity = '0.7'; row.appendChild(vt);
                }
                tbody.appendChild(row);
            });

            table.appendChild(tbody);
            tableWrap.appendChild(table);
            contentEl.innerHTML = '';
            contentEl.appendChild(tableWrap);
        }

        // ── Init & refresh ───────────────────────────────────────────
        fetchData();
        var interval = parseInt(opts.refreshInterval, 10) || 60;
        setInterval(fetchData, interval * 1000);
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.bkbg-st-app').forEach(initTicker);
    });

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        document.querySelectorAll('.bkbg-st-app').forEach(initTicker);
    }
})();

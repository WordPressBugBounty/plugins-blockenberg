(function () {
    'use strict';

    var homeIconSVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>';

    function getSep(separator, custom) {
        if (separator === 'chevron') return '›';
        if (separator === 'arrow')   return '→';
        if (separator === 'slash')   return '/';
        if (separator === 'dot')     return '·';
        if (separator === 'dash')    return '–';
        return custom || '/';
    }

    function escHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function buildCrumbHTML(crumbs, sep, showHomeIcon, showCurrent, withSchema) {
        var listItems = crumbs.map(function (c, i) {
            var isLast = i === crumbs.length - 1;
            var schema = withSchema ? ' itemscope itemprop="itemListElement" itemtype="https://schema.org/ListItem"' : '';
            var posAttr = withSchema ? ' itemprop="position" content="' + (i + 1) + '"' : '';

            var inner;
            if (isLast && !showCurrent) return '';
            if (isLast) {
                var label = isLast ? '<span class="bkbg-bc-text"' + (withSchema ? ' itemprop="name"' : '') + '>' + escHtml(c.label) + '</span>' : '';
                inner = label;
            } else {
                var iconHtml = (c.isHome && showHomeIcon) ? '<span class="bkbg-bc-home-icon">' + homeIconSVG + '</span>' : '';
                var nameAttr = withSchema ? ' itemprop="name"' : '';
                var itemId   = withSchema ? ' itemprop="item"' : '';
                inner = '<a href="' + escHtml(c.url) + '" class="bkbg-bc-link"' + itemId + '>' +
                    iconHtml + '<span' + nameAttr + '>' + (c.isHome && showHomeIcon ? '' : escHtml(c.label)) + '</span>' +
                    '</a>';
                if (withSchema) inner += '<meta' + posAttr + '/>';
            }

            var sepHtml = !isLast ? '<span class="bkbg-bc-sep" aria-hidden="true">' + sep + '</span>' : '';

            return '<li class="bkbg-bc-item' + (isLast ? ' bkbg-bc-item--current' : '') + '"' + schema + '>' + inner + '</li>' + sepHtml;
        }).join('');

        var schemaList = withSchema
            ? ' itemscope itemtype="https://schema.org/BreadcrumbList"'
            : '';
        return '<ol class="bkbg-bc-list"' + schemaList + '>' + listItems + '</ol>';
    }

    function initBreadcrumbs(nav) {
        var d = nav.dataset;
        var showHome    = d.showHome    !== '0';
        var showCurrent = d.showCurrent !== '0';
        var showIcon    = d.showIcon    !== '0';
        var withSchema  = d.schema      !== '0';
        var separator   = d.separator   || 'chevron';
        var custom      = d.sepCustom   || '/';
        var homeLabel   = d.homeLabel   || 'Home';
        var homeUrl     = d.homeUrl     || '/';
        var sep         = getSep(separator, custom);

        /* Build crumb trail from current path */
        var crumbs = [];
        if (showHome) {
            crumbs.push({ label: homeLabel, url: homeUrl, isHome: true });
        }

        /* Parse current path segments */
        var path = window.location.pathname;
        var parts = path.replace(/^\/|\/$/g, '').split('/').filter(Boolean);

        /* Try to use document title for current page */
        var pageTitle = document.title.split(/[|\-–—]/)[0].trim();

        /* Build intermediate crumbs from URL segments (heuristic) */
        var accumulated = '';
        parts.forEach(function (part, idx) {
            accumulated += '/' + part;
            var label = part.replace(/[-_]/g, ' ').replace(/\b\w/g, function(c){ return c.toUpperCase(); });
            var isLast = idx === parts.length - 1;
            if (isLast && pageTitle) label = pageTitle;
            crumbs.push({
                label: label,
                url:   isLast ? '' : accumulated + '/'
            });
        });

        /* Fallback: no path parts found, just show Home + Page Title */
        if (!parts.length && pageTitle) {
            crumbs.push({ label: pageTitle, url: '' });
        }

        if (crumbs.length === 0) return;

        nav.innerHTML = buildCrumbHTML(crumbs, sep, showIcon, showCurrent, withSchema);
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.bkbg-bc-wrap[data-separator]').forEach(initBreadcrumbs);
    });
})();

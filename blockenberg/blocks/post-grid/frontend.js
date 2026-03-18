(function () {
    'use strict';

    function escHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function buildCardHTML(post, cfg) {
        var thumbHTML = '';
        if (cfg.showImage && post.image) {
            thumbHTML = '<div class="bkbg-pg-thumb bkbg-pg-hover--' + escHtml(cfg.hover) + '">' +
                '<div class="bkbg-pg-thumb-inner">' +
                '<img src="' + escHtml(post.image) + '" alt="' + escHtml(post.title) + '" loading="lazy">' +
                '</div></div>';
        }

        var metaHTML = '';
        if (cfg.showMeta && post.meta) {
            metaHTML = '<div class="bkbg-pg-meta">' + escHtml(post.meta) + '</div>';
        }

        var titleHTML = '<h3 class="bkbg-pg-title"><a href="' + escHtml(post.link) + '">' + escHtml(post.title) + '</a></h3>';

        var excerptHTML = '';
        if (cfg.showExcerpt && post.excerpt) {
            excerptHTML = '<p class="bkbg-pg-excerpt">' + escHtml(post.excerpt) + '</p>';
        }

        var rmHTML = '';
        if (cfg.showReadMore) {
            var rmLabel = escHtml(cfg.rmLabel) + (cfg.rmStyle === 'arrow' ? ' &rarr;' : '');
            rmHTML = '<a href="' + escHtml(post.link) + '" class="bkbg-pg-readmore bkbg-pg-readmore--' + escHtml(cfg.rmStyle) + '">' + rmLabel + '</a>';
        }

        return '<article class="bkbg-pg-card">' +
            thumbHTML +
            '<div class="bkbg-pg-body">' +
            metaHTML + titleHTML + excerptHTML + rmHTML +
            '</div></article>';
    }

    function renderGrid(wrap, posts, cfg) {
        var grid = wrap.querySelector('.bkbg-pg-grid');
        if (!grid) {
            grid = document.createElement('div');
            grid.className = 'bkbg-pg-grid';
            wrap.appendChild(grid);
        }
        if (!posts || !posts.length) {
            grid.innerHTML = '<p class="bkbg-pg-empty">' + escHtml(cfg.noPosts) + '</p>';
            return;
        }
        grid.innerHTML = posts.map(function (p) { return buildCardHTML(p, cfg); }).join('');
    }

    function initPostGrid(wrap) {
        var d = wrap.dataset;
        var cfg = {
            postType:   d.postType   || 'post',
            orderby:    d.orderby    || 'date',
            order:      d.order      || 'desc',
            perPage:    parseInt(d.perPage,   10) || 6,
            offset:     parseInt(d.offset,    10) || 0,
            excerptLen: parseInt(d.excerptLen,10) || 20,
            showImage:  d.showImage  !== '0',
            showMeta:   d.showMeta   !== '0',
            showExcerpt:d.showExcerpt!== '0',
            showReadMore:d.showRm    !== '0',
            rmLabel:    d.rmLabel    || 'Read More',
            rmStyle:    d.rmStyle    || 'link',
            noPosts:    d.noPosts    || 'No posts found.',
            hover:      d.hover      || 'zoom'
        };

        var path = (window.blockenbergData && window.blockenbergData.restUrl)
            ? window.blockenbergData.restUrl + 'blockenberg/v1/post-grid'
            : '/wp-json/blockenberg/v1/post-grid';

        var url = path + '?type=' + encodeURIComponent(cfg.postType)
            + '&orderby=' + encodeURIComponent(cfg.orderby)
            + '&order='   + encodeURIComponent(cfg.order)
            + '&per_page='+ cfg.perPage
            + '&offset='  + cfg.offset
            + '&excerpt_len=' + cfg.excerptLen;

        var grid = wrap.querySelector('.bkbg-pg-grid');
        if (!grid) {
            grid = document.createElement('div');
            grid.className = 'bkbg-pg-grid';
            wrap.appendChild(grid);
        }
        grid.innerHTML = '<div class="bkbg-pg-loading"><span>Loading…</span></div>';

        fetch(url, { credentials: 'same-origin' })
            .then(function (r) { return r.json(); })
            .then(function (res) { renderGrid(wrap, res.posts, cfg); })
            .catch(function () {
                grid.innerHTML = '<p class="bkbg-pg-empty" style="color:#ef4444">Failed to load posts.</p>';
            });
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.bkbg-pg-wrap').forEach(initPostGrid);
    });
})();

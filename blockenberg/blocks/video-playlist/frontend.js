(function () {
    function init() {
        document.querySelectorAll('.bkbg-vp-app').forEach(function (appEl) {
            if (appEl.dataset.rendered) return;
            appEl.dataset.rendered = '1';
            var opts;
            try { opts = JSON.parse(appEl.dataset.opts || '{}'); } catch (e) { opts = {}; }
            var o = Object.assign({
                playlistTitle: 'Watch the Series', showPlaylistTitle: true,
                episodes: [], layout: 'side', listPosition: 'right',
                showNumbers: true, showDuration: true, showDescription: true, showThumbnails: true,
                listWidth: 340, borderRadius: 12, paddingTop: 0, paddingBottom: 0,
                bgColor: '#0f0f1a', playerBg: '#000000', listBg: '#1a1a2e', activeBg: '#2d2b55',
                titleColor: '#ffffff', metaColor: '#a0aec0', epTitleColor: '#f0f0f0',
                epMetaColor: '#718096', activeColor: '#6366f1', accentColor: '#6366f1'
            }, opts);

            var episodes = o.episodes || [];
            if (!episodes.length) { appEl.style.display = 'none'; return; }

            function mk(tag, cls, style) {
                var n = document.createElement(tag);
                if (cls) n.className = cls;
                if (style) Object.assign(n.style, style);
                return n;
            }

            function embedSrc(ep) {
                if (ep.videoType === 'youtube' && ep.videoId) return 'https://www.youtube.com/embed/' + ep.videoId + '?rel=0&enablejsapi=1';
                if (ep.videoType === 'vimeo' && ep.videoId) return 'https://player.vimeo.com/video/' + ep.videoId;
                return ep.videoUrl || '';
            }

            var isSide = o.layout === 'side';
            var isListLeft = o.listPosition === 'left';
            var activeIdx = 0;

            /* Section */
            var section = mk('div', 'bkbg-vp-section', {
                background: o.bgColor,
                paddingTop: o.paddingTop + 'px',
                paddingBottom: o.paddingBottom + 'px',
                borderRadius: o.borderRadius + 'px',
                overflow: 'hidden'
            });

            /* Shell */
            var shell = mk('div', 'bkbg-vp-shell' + (isSide ? '' : ' vp-stack') + (isSide && isListLeft ? ' vp-list-left' : ''));

            /* Player pane */
            var playerPane = mk('div', 'bkbg-vp-player-pane', { background: o.playerBg });

            var ratio = mk('div', 'bkbg-vp-player-ratio');
            var iframe = document.createElement('iframe');
            iframe.allowFullscreen = true;
            iframe.allow = 'autoplay; encrypted-media';
            ratio.appendChild(iframe);
            playerPane.appendChild(ratio);

            var playerInfo = mk('div', 'bkbg-vp-player-info');
            var nowTitle = mk('h3', 'bkbg-vp-now-title', { color: o.titleColor });
            var nowDesc = mk('p', 'bkbg-vp-now-desc', { color: o.metaColor });
            playerInfo.appendChild(nowTitle);
            if (o.showDescription) playerInfo.appendChild(nowDesc);
            playerPane.appendChild(playerInfo);

            /* List pane */
            var listPane = mk('div', 'bkbg-vp-list-pane', {
                width: isSide ? o.listWidth + 'px' : '100%',
                background: o.listBg
            });

            if (o.showPlaylistTitle) {
                var header = mk('div', 'bkbg-vp-list-header', { color: o.titleColor });
                header.textContent = o.playlistTitle;
                listPane.appendChild(header);
            }

            var scroll = mk('div', 'bkbg-vp-list-scroll', {
                maxHeight: isSide ? '480px' : '280px'
            });
            listPane.appendChild(scroll);

            var epEls = [];

            function goTo(idx) {
                activeIdx = idx;
                var ep = episodes[idx];

                /* update player */
                var src = embedSrc(ep);
                if (ep.videoType === 'file' && ep.videoUrl) {
                    /* swap to video element if needed */
                    if (iframe.parentNode) {
                        var vid = document.createElement('video');
                        vid.src = ep.videoUrl;
                        vid.controls = true;
                        vid.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%';
                        ratio.replaceChild(vid, iframe);
                    }
                } else {
                    iframe.src = src;
                }

                /* update info */
                nowTitle.innerHTML = ep.title || '';
                nowDesc.innerHTML = ep.description || '';

                /* update episode list items */
                epEls.forEach(function (info, i) {
                    var isAct = i === idx;
                    info.el.style.background = isAct ? o.activeBg : 'transparent';
                    info.el.style.borderLeftColor = isAct ? o.activeColor : 'transparent';
                    if (info.num) {
                        info.num.style.background = isAct ? o.activeColor : 'rgba(255,255,255,0.1)';
                        info.num.style.color = isAct ? '#ffffff' : o.epMetaColor;
                    }
                    if (info.playingTag) info.playingTag.style.display = isAct ? 'block' : 'none';
                });
            }

            episodes.forEach(function (ep, idx) {
                var epEl = mk('div', 'bkbg-vp-ep');
                epEl.addEventListener('click', function () { goTo(idx); });

                var num = null;
                if (o.showNumbers) {
                    num = mk('div', 'bkbg-vp-ep-num');
                    num.textContent = idx + 1;
                    epEl.appendChild(num);
                }

                if (o.showThumbnails) {
                    var thumb = mk('div', 'bkbg-vp-ep-thumb');
                    if (ep.thumbnailUrl) {
                        var img = document.createElement('img');
                        img.src = ep.thumbnailUrl;
                        img.alt = ep.thumbnailAlt || ep.title || '';
                        thumb.appendChild(img);
                    } else {
                        var ph = mk('div', 'bkbg-vp-ep-thumb-placeholder');
                        ph.textContent = '▶';
                        thumb.appendChild(ph);
                    }
                    epEl.appendChild(thumb);
                }

                var body = mk('div', 'bkbg-vp-ep-body');
                var titleEl = mk('div', 'bkbg-vp-ep-title', { color: o.epTitleColor });
                titleEl.textContent = ep.title || '';
                body.appendChild(titleEl);

                var meta = mk('div', 'bkbg-vp-ep-meta', { color: o.epMetaColor });
                if (o.showDuration && ep.duration) {
                    var dur = mk('span', '');
                    dur.textContent = ep.duration;
                    meta.appendChild(dur);
                }
                var playingTag = mk('span', 'bkbg-vp-ep-playing', { color: o.activeColor, display: 'none' });
                playingTag.textContent = '▶ Playing';
                meta.appendChild(playingTag);
                body.appendChild(meta);
                epEl.appendChild(body);

                scroll.appendChild(epEl);
                epEls.push({ el: epEl, num: num, playingTag: playingTag });
            });

            if (isSide && !isListLeft) {
                shell.appendChild(playerPane);
                shell.appendChild(listPane);
            } else if (isSide && isListLeft) {
                shell.appendChild(listPane);
                shell.appendChild(playerPane);
            } else {
                shell.appendChild(playerPane);
                shell.appendChild(listPane);
            }

            section.appendChild(shell);
            goTo(0);

            appEl.parentNode.insertBefore(section, appEl);
        });
    }

    if (document.readyState !== 'loading') { init(); }
    else { document.addEventListener('DOMContentLoaded', init); }
})();

(function () {
    'use strict';
    function mk(tag, cls, styles) { var d = document.createElement(tag); if (cls) d.className = cls; if (styles) Object.keys(styles).forEach(function (k) { d.style[k] = styles[k]; }); return d; }
    function tx(tag, cls, text, styles) { var d = mk(tag, cls, styles); d.textContent = text; return d; }
    function ap(p) { Array.prototype.slice.call(arguments, 1).forEach(function (c) { if (c) p.appendChild(c); }); return p; }

    function typoCssVarsForEl(typo, prefix, el) {
        if (!typo) return;
        if (typo.family)     el.style.setProperty(prefix + 'font-family', "'" + typo.family + "', monospace");
        if (typo.weight)     el.style.setProperty(prefix + 'font-weight', typo.weight);
        if (typo.transform)  el.style.setProperty(prefix + 'text-transform', typo.transform);
        if (typo.style)      el.style.setProperty(prefix + 'font-style', typo.style);
        if (typo.decoration) el.style.setProperty(prefix + 'text-decoration', typo.decoration);
        var su = typo.sizeUnit || 'px';
        if (typo.sizeDesktop !== '' && typo.sizeDesktop != null) el.style.setProperty(prefix + 'font-size-d', typo.sizeDesktop + su);
        if (typo.sizeTablet  !== '' && typo.sizeTablet  != null) el.style.setProperty(prefix + 'font-size-t', typo.sizeTablet + su);
        if (typo.sizeMobile  !== '' && typo.sizeMobile  != null) el.style.setProperty(prefix + 'font-size-m', typo.sizeMobile + su);
        var lhu = typo.lineHeightUnit || '';
        if (typo.lineHeightDesktop !== '' && typo.lineHeightDesktop != null) el.style.setProperty(prefix + 'line-height-d', typo.lineHeightDesktop + lhu);
        if (typo.lineHeightTablet  !== '' && typo.lineHeightTablet  != null) el.style.setProperty(prefix + 'line-height-t', typo.lineHeightTablet + lhu);
        if (typo.lineHeightMobile  !== '' && typo.lineHeightMobile  != null) el.style.setProperty(prefix + 'line-height-m', typo.lineHeightMobile + lhu);
        var lsu = typo.letterSpacingUnit || 'px';
        if (typo.letterSpacingDesktop !== '' && typo.letterSpacingDesktop != null) el.style.setProperty(prefix + 'letter-spacing-d', typo.letterSpacingDesktop + lsu);
        if (typo.letterSpacingTablet  !== '' && typo.letterSpacingTablet  != null) el.style.setProperty(prefix + 'letter-spacing-t', typo.letterSpacingTablet + lsu);
        if (typo.letterSpacingMobile  !== '' && typo.letterSpacingMobile  != null) el.style.setProperty(prefix + 'letter-spacing-m', typo.letterSpacingMobile + lsu);
        var wsu = typo.wordSpacingUnit || 'px';
        if (typo.wordSpacingDesktop !== '' && typo.wordSpacingDesktop != null) el.style.setProperty(prefix + 'word-spacing-d', typo.wordSpacingDesktop + wsu);
        if (typo.wordSpacingTablet  !== '' && typo.wordSpacingTablet  != null) el.style.setProperty(prefix + 'word-spacing-t', typo.wordSpacingTablet + wsu);
        if (typo.wordSpacingMobile  !== '' && typo.wordSpacingMobile  != null) el.style.setProperty(prefix + 'word-spacing-m', typo.wordSpacingMobile + wsu);
    }

    function getExtension(name) {
        var parts = name.split('.');
        return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
    }

    function getExtColor(ext, a) {
        if (ext === 'js' || ext === 'jsx' || ext === 'mjs') return a.jsColor;
        if (ext === 'ts' || ext === 'tsx') return a.tsColor;
        if (ext === 'css' || ext === 'scss' || ext === 'sass') return a.cssColor;
        if (ext === 'html' || ext === 'htm') return a.htmlColor;
        if (ext === 'json' || ext === 'jsonc') return a.jsonColor;
        if (ext === 'md' || ext === 'mdx') return a.mdColor;
        if (ext === 'py') return a.pyColor;
        if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'svg' || ext === 'gif' || ext === 'ico' || ext === 'webp') return a.imgColor;
        return a.fileColor;
    }

    function getFileIcon(item) {
        if (item.type === 'folder') return item.isOpen ? '📂' : '📁';
        var ext = getExtension(item.name);
        if (ext === 'js' || ext === 'jsx') return '⬡';
        if (ext === 'ts' || ext === 'tsx') return '⬡';
        if (ext === 'css' || ext === 'scss') return '#';
        if (ext === 'html') return '◈';
        if (ext === 'json') return '{}';
        if (ext === 'md' || ext === 'mdx') return '✎';
        if (ext === 'py') return '🐍';
        if (ext === 'svg' || ext === 'png' || ext === 'jpg' || ext === 'ico') return '🖼';
        return '◻';
    }

    function buildBlock(appEl) {
        if (appEl.dataset.rendered) return;
        appEl.dataset.rendered = '1';

        var a = Object.assign({
            treeTitle: 'Project Structure', showTitle: true, showIcons: true, showLines: true, showExtensionColors: true,
            files: [], fontSize: 14, titleFontSize: 18, lineHeight: 180, borderRadius: 10,
            bgColor: '#0f172a', borderColor: '#1e293b', titleColor: '#f8fafc',
            folderColor: '#60a5fa', folderIconColor: '#fbbf24', fileColor: '#cbd5e1', lineColor: '#334155',
            headerBg: '#1e293b', dotRed: '#ef4444', dotYellow: '#f59e0b', dotGreen: '#22c55e',
            jsColor: '#f59e0b', tsColor: '#3b82f6', cssColor: '#a78bfa', htmlColor: '#f97316',
            jsonColor: '#6ee7b7', mdColor: '#94a3b8', pyColor: '#4ade80', imgColor: '#fb7185'
        }, JSON.parse(appEl.dataset.opts || '{}'));

        var wrap = mk('div', 'bkbg-ft-wrap');
        wrap.style.cssText = 'background:' + a.bgColor + ';border-radius:' + a.borderRadius + 'px;border:1px solid ' + a.borderColor + ';overflow:hidden';

        typoCssVarsForEl(a.typoTitle, '--bkbg-ft-tt-', wrap);
        typoCssVarsForEl(a.typoItem, '--bkbg-ft-ti-', wrap);

        // Titlebar (macOS-style traffic lights)
        var titlebar = mk('div', 'bkbg-ft-titlebar');
        titlebar.style.cssText = 'background:' + a.headerBg + ';display:flex;align-items:center;gap:8px;padding:10px 16px;border-bottom:1px solid ' + a.borderColor;
        var dotR = mk('span'); dotR.style.cssText = 'width:12px;height:12px;border-radius:50%;background:' + a.dotRed + ';display:inline-block;flex-shrink:0';
        var dotY = mk('span'); dotY.style.cssText = 'width:12px;height:12px;border-radius:50%;background:' + a.dotYellow + ';display:inline-block;flex-shrink:0';
        var dotG = mk('span'); dotG.style.cssText = 'width:12px;height:12px;border-radius:50%;background:' + a.dotGreen + ';display:inline-block;flex-shrink:0';
        ap(titlebar, dotR, dotY, dotG);
        if (a.showTitle && a.treeTitle) {
            var titleEl = tx('span', 'bkbg-ft-title', a.treeTitle);
            titleEl.style.cssText = 'margin-left:8px;color:' + a.titleColor;
            ap(titlebar, titleEl);
        }
        ap(wrap, titlebar);

        // File rows
        var body = mk('div', 'bkbg-ft-body');
        body.style.padding = '12px 0';

        a.files.forEach(function (item) {
            var ext = getExtension(item.name);
            var isFolder = item.type === 'folder';
            var nameColor = isFolder ? a.folderColor : (a.showExtensionColors ? getExtColor(ext, a) : a.fileColor);
            var indent = (item.indent || 0) * 20;

            var row = mk('div', 'bkbg-ft-row');
            row.style.cssText = 'display:flex;align-items:center;gap:6px;padding:2px 16px 2px ' + (16 + indent) + 'px;transition:background 0.1s';
            row.addEventListener('mouseenter', function () { row.style.background = 'rgba(255,255,255,0.04)'; });
            row.addEventListener('mouseleave', function () { row.style.background = 'transparent'; });

            if (a.showLines && item.indent > 0) {
                var line = mk('span', 'bkbg-ft-indent-line');
                line.style.cssText = 'display:inline-block;width:1px;height:1.4em;background:' + a.lineColor + ';flex-shrink:0;margin-right:4px';
                ap(row, line);
            }

            if (a.showIcons) {
                var icon = tx('span', 'bkbg-ft-icon', getFileIcon(item));
                icon.style.cssText = 'color:' + (isFolder ? a.folderIconColor : nameColor) + ';flex-shrink:0;font-style:normal;width:16px;text-align:center;display:inline-block';
                ap(row, icon);
            }

            var name = tx('span', 'bkbg-ft-name', item.name);
            name.style.cssText = 'color:' + nameColor + ';font-weight:' + (isFolder ? 600 : 400) + ';white-space:nowrap;overflow:hidden;text-overflow:ellipsis';
            ap(row, name);
            ap(body, row);
        });

        ap(wrap, body);
        appEl.innerHTML = '';
        appEl.appendChild(wrap);
    }

    function init() { document.querySelectorAll('.bkbg-file-tree-app').forEach(buildBlock); }
    if (document.readyState !== 'loading') { init(); } else { document.addEventListener('DOMContentLoaded', init); }
})();

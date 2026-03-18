( function () {
  document.addEventListener('DOMContentLoaded', function () {
    var wraps = document.querySelectorAll('.bkrt-wrap[data-wpm]');
    if (!wraps.length) return;

    // Count words from the article/post content on the page
    var contentEl = document.querySelector('article .entry-content, .post-content, .wp-block-post-content, main article, .site-main .hentry, body');
    var rawText = contentEl ? contentEl.innerText || contentEl.textContent : document.body.innerText;
    var wordCount = rawText.trim().split(/\s+/).filter(Boolean).length;

    wraps.forEach(function (wrap) {
      var wpm    = parseInt(wrap.dataset.wpm, 10) || 200;
      var prefix = wrap.dataset.prefix || '';
      var suffix = wrap.dataset.suffix || 'min read';
      var mins   = Math.max(1, Math.ceil(wordCount / wpm));
      var textEl = wrap.querySelector('.bkrt-text');
      if (textEl) {
        textEl.textContent = (prefix ? prefix + ' ' : '') + mins + ' ' + suffix;
      }
    });
  });
}() );

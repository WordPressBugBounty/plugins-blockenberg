(function(){
    'use strict';
    function boot(){
        if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
        var observer=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.classList.remove('bkbg-motion-pending');if(e.target.dataset.bkbgOnce!=='0')observer.unobserve(e.target);}else if(e.target.dataset.bkbgOnce==='0')e.target.classList.add('bkbg-motion-pending');});},{threshold:0.08});
        document.querySelectorAll('[data-bkbg-entrance]').forEach(function(e){e.classList.add('bkbg-motion-ready','bkbg-motion-pending');observer.observe(e);});
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

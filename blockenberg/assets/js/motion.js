(function(){
    'use strict';
    var bounceEase='cubic-bezier(.215,.61,.355,1)';
    function frames(values,offsets,easing){return values.map(function(value,i){return {transform:value,offset:offsets[i],easing:easing||'ease'};});}
    var presets={
        bounceIn:frames(['scale(.3)','scale(1.1)','scale(.9)','scale(1.03)','scale(.97)','scale(1)'],[0,.2,.4,.6,.8,1],bounceEase),
        bounceInRight:frames(['translateX(3000px)','translateX(-25px)','translateX(10px)','translateX(-5px)','translateX(0)'],[0,.6,.75,.9,1],bounceEase),
        bounceInUp:frames(['translateY(3000px)','translateY(-20px)','translateY(10px)','translateY(-5px)','translateY(0)'],[0,.6,.75,.9,1],bounceEase),
        tada:frames(['scale(1) rotate(0deg)','scale(.9) rotate(-3deg)','scale(.9) rotate(-3deg)','scale(1.1) rotate(3deg)','scale(1.1) rotate(-3deg)','scale(1.1) rotate(3deg)','scale(1.1) rotate(-3deg)','scale(1.1) rotate(3deg)','scale(1.1) rotate(-3deg)','scale(1.1) rotate(3deg)','scale(1) rotate(0deg)'],[0,.1,.2,.3,.4,.5,.6,.7,.8,.9,1]),
        slideInUp:frames(['translateY(100%)','translateY(0)'],[0,1]),
        slideInDown:frames(['translateY(-100%)','translateY(0)'],[0,1]),
        slideInLeft:frames(['translateX(-100%)','translateX(0)'],[0,1]),
        slideInRight:frames(['translateX(100%)','translateX(0)'],[0,1])
    };
    var basic=['fadeIn','fadeInUp','fadeInDown','fadeInLeft','fadeInRight','zoomIn'];
    function boot(){
        var media=window.matchMedia('(prefers-reduced-motion: reduce)');
        if(media.matches||!('IntersectionObserver' in window))return;
        var states=new WeakMap(),elements=[];
        function cancel(state){state.serial++;state.running=false;state.animations.forEach(function(a){a.cancel();});state.animations=[];}
        function reveal(e,state){
            e.classList.remove('bkbg-motion-pending');
            var name=e.dataset.bkbgEntrance;
            if(!presets[name]||!e.animate)return;
            cancel(state);
            var style=getComputedStyle(e),duration=parseFloat(style.getPropertyValue('--bkbg-enter-duration'))||.8;
            var delay=parseFloat(style.getPropertyValue('--bkbg-enter-delay'))||0;
            var timing={duration:duration*1000,delay:delay*1000,fill:'backwards',composite:'add'};
            // Add the entrance transform to the existing layout/floating animation.
            state.animations.push(e.animate(presets[name],timing));
            if(name.indexOf('bounceIn')===0){
                state.animations.push(e.animate([{opacity:0,offset:0},{opacity:1,offset:.6},{opacity:1,offset:1}],{duration:duration*1000,delay:delay*1000,fill:'backwards',easing:bounceEase}));
            }
            state.running=true;
            var serial=state.serial;
            Promise.all(state.animations.map(function(a){return a.finished.catch(function(){});})).then(function(){
                if(serial!==state.serial||media.matches)return;
                state.running=false;
                // A bounce temporarily moves its target outside the viewport.
                // Rearm only after it finishes and its settled position is outside.
                if(e.dataset.bkbgOnce==='0'){
                    var rect=e.getBoundingClientRect();
                    if(rect.bottom<=0||rect.top>=innerHeight||rect.right<=0||rect.left>=innerWidth){state.visible=false;e.classList.add('bkbg-motion-pending');}
                }
            });
        }
        var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){
            var e=entry.target,state=states.get(e);
            if(media.matches||!state)return;
            if(entry.isIntersecting){
                if(state.visible)return;
                state.visible=true;reveal(e,state);
                if(e.dataset.bkbgOnce!=='0')observer.unobserve(e);
            }else if(e.dataset.bkbgOnce==='0'){
                if(state.running)return;
                state.visible=false;cancel(state);e.classList.add('bkbg-motion-pending');
            }
        });},{threshold:.08});
        document.querySelectorAll('[data-bkbg-entrance]').forEach(function(e){
            var name=e.dataset.bkbgEntrance;
            if(window.innerWidth<=1024&&e.dataset.bkbgEntranceTablet)name=e.dataset.bkbgEntranceTablet;
            if(window.innerWidth<=767&&e.dataset.bkbgEntranceMobile)name=e.dataset.bkbgEntranceMobile;
            if(basic.indexOf(name)<0&&!presets[name])return;
            e.dataset.bkbgEntrance=name;
            states.set(e,{visible:false,animations:[],serial:0,running:false});elements.push(e);
            e.classList.add('bkbg-motion-ready','bkbg-motion-pending');
        });
        // Paint the initial state before observing initially visible elements.
        requestAnimationFrame(function(){requestAnimationFrame(function(){
            if(!media.matches)elements.forEach(function(e){observer.observe(e);});
        });});
        function reduce(event){if(!event.matches)return;observer.disconnect();elements.forEach(function(e){cancel(states.get(e));e.classList.remove('bkbg-motion-ready','bkbg-motion-pending');});}
        if(media.addEventListener)media.addEventListener('change',reduce);else if(media.addListener)media.addListener(reduce);
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

// light / dark mode
// the choice is saved in the browser, the first time it follows the computer's setting
// this file goes in the <head> so the right colors show before the page is drawn
(function(){
    var saved = null;
    try{
        saved = localStorage.getItem('costodian-theme');
    } catch(e){
        saved = null;
    }

    var theme = saved;
    if(theme != 'light' && theme != 'dark'){
        theme = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);

    // the toggle button switches the mode and remembers it
    document.addEventListener('DOMContentLoaded', function(){
        var button = document.getElementById('theme-toggle');
        if(!button){
            return;
        }
        function refreshLabel(){
            var now = document.documentElement.getAttribute('data-theme');
            button.setAttribute('aria-label', now == 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        }
        refreshLabel();
        button.addEventListener('click', function(){
            var now = document.documentElement.getAttribute('data-theme');
            var next = (now == 'dark') ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            try{
                localStorage.setItem('costodian-theme', next);
            } catch(e){
                // private mode: it still works, it just is not remembered
            }
            refreshLabel();
        });
    });
})();

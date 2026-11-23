(function(){
    if(window.parent !== window || /(?:^|&)app-embed=1(?:&|$)/.test(window.location.search.slice(1))){
        return;
    }

    var main = document.querySelector('.main');
    var topbar = main && main.querySelector('.topbar');
    var hostContent = main && main.querySelector('.content');
    var sidebar = document.querySelector('.sidebar');
    var sideNav = document.querySelector('.side-nav');
    if(!main || !topbar || !hostContent || !sidebar || !sideNav){
        return;
    }

    var tabs = document.createElement('div');
    tabs.className = 'app-tabs';
    tabs.hidden = true;
    main.appendChild(tabs);

    var hostRoute = window.location.pathname;
    var hostTitle = document.title;
    var activeFrame = null;
    var frames = Object.create(null);
    var searchBox = topbar.querySelector('.search');
    var searchInput = searchBox && searchBox.querySelector('input');
    var initialSearch = searchInput ? {
        placeholder: searchInput.placeholder,
        label: searchInput.getAttribute('aria-label')
    } : null;

    function routeUrl(value){
        var url = new URL(value, window.location.href);
        if(url.origin !== window.location.origin || !/\/pages\/(dashboard|inventory|recipes|movements|staff|profile)\.html$/i.test(url.pathname)){
            return null;
        }
        url.searchParams.delete('app-embed');
        return url;
    }

    function updateSidebar(path){
        sideNav.querySelectorAll('a[href]').forEach(function(link){
            var url = routeUrl(link.href);
            if(url && url.pathname === path){
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    function updateSearch(frame){
        if(!searchBox || !searchInput){
            return;
        }
        if(!frame){
            searchBox.hidden = false;
            searchInput.placeholder = initialSearch.placeholder;
            if(initialSearch.label){
                searchInput.setAttribute('aria-label', initialSearch.label);
            }
            return;
        }

        var childInput = frame.contentDocument && frame.contentDocument.querySelector('.topbar .search input');
        searchBox.hidden = !childInput;
        if(childInput){
            searchInput.placeholder = childInput.placeholder;
            searchInput.setAttribute('aria-label', childInput.getAttribute('aria-label') || '');
            searchInput.value = childInput.value;
        }
    }

    function closeHostDialogs(){
        main.querySelectorAll('dialog[open]').forEach(function(dialog){
            dialog.close();
        });
    }

    function activateHost(){
        closeHostDialogs();
        if(activeFrame){
            activeFrame.classList.remove('active');
        }
        activeFrame = null;
        main.classList.remove('app-tabs-open');
        hostContent.hidden = false;
        tabs.hidden = true;
        document.title = hostTitle;
        updateSearch(null);
        updateSidebar(hostRoute);
    }

    function getFrame(url){
        var frame = frames[url.pathname];
        var requested = url.pathname + url.search;
        if(frame && frame.dataset.route !== requested){
            frame.src = embeddedUrl(url);
            frame.dataset.route = requested;
        }
        if(!frame){
            frame = document.createElement('iframe');
            frame.title = 'Costodian page';
            frame.dataset.route = requested;
            frame.addEventListener('load', function(){
                if(activeFrame === frame){
                    updateSearch(frame);
                    if(frame.contentDocument){
                        frame.title = frame.contentDocument.title || 'Costodian page';
                        document.title = frame.contentDocument.title || 'Costodian';
                    }
                }
            });
            frame.src = embeddedUrl(url);
            frames[url.pathname] = frame;
            tabs.appendChild(frame);
        }
        return frame;
    }

    function embeddedUrl(url){
        var embedded = new URL(url.href);
        embedded.searchParams.set('app-embed', '1');
        return embedded.href;
    }

    function activateFrame(frame, url){
        closeHostDialogs();
        main.classList.add('app-tabs-open');
        hostContent.hidden = true;
        tabs.hidden = false;
        if(activeFrame){
            activeFrame.classList.remove('active');
        }
        activeFrame = frame;
        activeFrame.classList.add('active');
        updateSearch(frame);
        updateSidebar(url.pathname);
        if(frame.contentDocument && frame.contentDocument.title){
            document.title = frame.contentDocument.title;
        }
    }

    function navigate(value, pushState){
        var url = routeUrl(value);
        if(!url){
            return false;
        }

        if(pushState){
            var current = window.location.pathname + window.location.search + window.location.hash;
            var next = url.pathname + url.search + url.hash;
            if(current !== next){
                window.history.pushState({}, '', url.href);
            }
        }

        if(url.pathname === hostRoute){
            activateHost();
        } else {
            activateFrame(getFrame(url), url);
        }
        return true;
    }

    sidebar.addEventListener('click', function(event){
        if(event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey){
            return;
        }
        var link = event.target.closest('a[href]');
        if(!link || !sidebar.contains(link) || link.target || link.hasAttribute('download')){
            return;
        }
        var url = routeUrl(link.href);
        if(url){
            event.preventDefault();
            if(typeof setSidebar === 'function'){
                setSidebar(false);
            }
            navigate(url.href, true);
        }
    });

    window.addEventListener('popstate', function(){
        navigate(window.location.href, false);
    });

    window.addEventListener('message', function(event){
        if(event.origin === window.location.origin && event.data && event.data.type === 'costodian-refresh-alerts' && typeof refreshAlerts === 'function'){
            refreshAlerts();
        }
    });

    if(searchInput){
        searchInput.addEventListener('input', function(){
            if(!activeFrame || !activeFrame.contentDocument){
                return;
            }
            var childInput = activeFrame.contentDocument.querySelector('.topbar .search input');
            if(childInput){
                childInput.value = searchInput.value;
                childInput.dispatchEvent(new Event('input', {bubbles: true}));
            }
        });
    }

    window.navigateApp = function(value){
        if(!navigate(value, true)){
            window.location.href = value;
        }
    };

    updateSidebar(hostRoute);
})();

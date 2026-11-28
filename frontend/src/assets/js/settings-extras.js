// extra items in the Settings popover (the gear at the bottom of the left panel):
//   My Profile, Mute alerts, Export data (CSV, administrator only), Help / User guide,
//   a line above Log out and the version at the bottom
// needs client.js and auth.js loaded first. Load it on every page that has the settings popover.

var APP_VERSION = 'v1.0';
var MUTE_ALERTS_KEY = 'costodian-mute-alerts';

(function(){
    var menu = document.getElementById('settings-menu');
    var themeButton = document.getElementById('theme-toggle');
    var logoutButton = document.getElementById('logout-btn');
    if(!menu || !themeButton || !logoutButton){
        return;
    }

    // the little style file for this
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '../assets/css/settings-extras.css';
    document.head.appendChild(link);

    // ---------- small helpers ----------

    function el(tag, className, text){
        var node = document.createElement(tag);
        if(className){
            node.className = className;
        }
        if(text !== undefined && text !== null){
            node.textContent = text;
        }
        return node;
    }

    // the icons are fixed pictures written here, never text from the server
    function menuItem(id, iconPath, label){
        var button = el('button', 'menu-item');
        button.type = 'button';
        button.id = id;
        button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + iconPath + '</svg>';
        var text = el('span', '', label);
        text.className = 'menu-label';
        button.appendChild(text);
        return button;
    }

    function closePopover(){
        menu.classList.remove('open');
        var gear = document.getElementById('settings-btn');
        if(gear){
            gear.setAttribute('aria-expanded', 'false');
        }
    }

    function goTo(page){
        if(typeof window.navigateApp == 'function'){
            window.navigateApp(page);
        } else {
            window.location.href = page;
        }
    }

    function makeDialog(title){
        var dialog = el('dialog', 'sx-dialog');
        var head = el('div', 'sx-head');
        head.appendChild(el('h2', '', title));
        var close = el('button', 'sx-close', '×');
        close.type = 'button';
        close.setAttribute('aria-label', 'Close');
        close.addEventListener('click', function(){ dialog.close(); });
        head.appendChild(close);
        var body = el('div', 'sx-body');
        var foot = el('div', 'sx-foot');
        var done = el('button', 'sx-btn', 'Close');
        done.type = 'button';
        done.addEventListener('click', function(){ dialog.close(); });
        foot.appendChild(done);
        dialog.appendChild(head);
        dialog.appendChild(body);
        dialog.appendChild(foot);
        // a click on the dark area around the window closes it
        dialog.addEventListener('click', function(event){
            if(event.target === dialog){
                dialog.close();
            }
        });
        document.body.appendChild(dialog);
        return {dialog: dialog, body: body};
    }

    // ---------- My Profile ----------

    var profileItem = menuItem('profile-menu-btn', '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>', 'My Profile');
    profileItem.addEventListener('click', function(){
        closePopover();
        goTo('profile.html');
    });

    // ---------- Mute alerts ----------
    // only hides the red dot on the bell: the list in the bell stays. It is remembered in this browser.

    function isMuted(){
        try {
            return localStorage.getItem(MUTE_ALERTS_KEY) == '1';
        } catch(e){
            return document.documentElement.classList.contains('alerts-muted');
        }
    }

    var muteItem = menuItem('mute-menu-btn', '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/><path class="mute-slash" d="M3 3l18 18"/>', 'Mute alerts');

    function drawMute(){
        var muted = document.documentElement.classList.contains('alerts-muted');
        muteItem.querySelector('.menu-label').textContent = muted ? 'Unmute alerts' : 'Mute alerts';
        muteItem.querySelector('.mute-slash').style.display = muted ? 'none' : '';
        muteItem.setAttribute('aria-pressed', muted ? 'true' : 'false');
    }

    document.documentElement.classList.toggle('alerts-muted', isMuted());
    drawMute();

    muteItem.addEventListener('click', function(){
        var muted = !document.documentElement.classList.contains('alerts-muted');
        document.documentElement.classList.toggle('alerts-muted', muted);
        try {
            localStorage.setItem(MUTE_ALERTS_KEY, muted ? '1' : '0');
        } catch(e){
            // private mode: it only lasts until the page is closed
        }
        drawMute();
    });

    // muting in one browser tab shows in the others
    window.addEventListener('storage', function(event){
        if(event.key == MUTE_ALERTS_KEY){
            document.documentElement.classList.toggle('alerts-muted', isMuted());
            drawMute();
        }
    });

    // ---------- Help / User guide ----------

    var helpItem = menuItem('help-menu-btn', '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>', 'Help / User guide');
    var helpWindow = null;

    function buildHelp(){
        var made = makeDialog('How Costodian works');
        var b = made.body;

        function heading(text){
            b.appendChild(el('h3', '', text));
        }
        function para(text){
            b.appendChild(el('p', '', text));
        }
        function list(items){
            var ul = el('ul');
            items.forEach(function(text){
                ul.appendChild(el('li', '', text));
            });
            b.appendChild(ul);
        }

        heading('Units and quantities');
        para('You can type quantities as 1/2, 3/4, 1 1/2 or 0.5, always with a unit. The units are kg, g, L, ml, pcs and dozen.');
        list([
            'Stock is kept in grams (g), milliliters (ml) or pieces (pcs).',
            '1 kg = 1000 g, 1 L = 1000 ml, 1 dozen = 12 pcs.',
            'Prices are shown per kg, per L or per piece. So 1/2 kg of chicken is used as 500 g.'
        ]);

        heading('How a recipe is costed');
        list([
            'Unit cost = price paid ÷ quantity bought. ₱360 for 2 kg (2000 g) is ₱0.18 per g.',
            'Ingredient cost = quantity used × unit cost.',
            'Total cost = all ingredient costs + other costs (packaging, labor, gas).',
            'Cost per serving = total cost ÷ number of servings.'
        ]);

        heading('Serving scaling and cooking batches');
        para('The cost of a recipe is for the whole batch. Change the number of servings and the cost per serving changes with it. When you press Cook batch, the ingredients are taken out of your inventory: one batch uses the quantities of the recipe, 2 batches use double, and so on.');

        heading('Suggested price');
        list([
            'By target food cost %: suggested price = cost per serving ÷ (target % ÷ 100). A cost of ₱36.55 with a 35% target gives ₱104.43.',
            'By markup (when you set one on the recipe): suggested price = cost per serving × (1 + markup % ÷ 100). A 50% markup on ₱40 gives ₱60.',
            'Food cost % of any price = cost per serving ÷ selling price × 100.',
            'Profit per serving = selling price − cost per serving.'
        ]);

        heading('Restocking');
        para('When you buy more of an ingredient, its unit cost becomes the weighted average of what you had and what you just bought, so your recipe costs follow the real prices.');

        heading('Alerts');
        list([
            'Low stock: the stock is at or below the reorder level you set.',
            'Expiring: the ingredient expires in 3 days or less.',
            'The bell shows these. "Mute alerts" in Settings hides the red dot but keeps the list.'
        ]);

        return made;
    }

    helpItem.addEventListener('click', function(){
        closePopover();
        if(!helpWindow){
            helpWindow = buildHelp();
        }
        helpWindow.dialog.showModal();
        helpWindow.body.scrollTop = 0;
    });

    // ---------- Export data (CSV) ----------
    // recipes with their costing, the inventory, and the stock history, built in the browser from what the pages already use

    // a cell for a CSV file: quotes when needed, and a leading ' so a spreadsheet never runs text as a formula
    function csvCell(value){
        if(value === null || value === undefined){
            return '';
        }
        var text = String(value);
        if(typeof value != 'number' && /^[=+\-@\t\r]/.test(text)){
            text = "'" + text;
        }
        if(/[",\n\r]/.test(text)){
            text = '"' + text.replace(/"/g, '""') + '"';
        }
        return text;
    }

    function csvText(header, rows){
        var lines = [header].concat(rows).map(function(row){
            return row.map(csvCell).join(',');
        });
        return lines.join('\r\n') + '\r\n';
    }

    function today(){
        var d = new Date();
        function two(n){ return (n < 10 ? '0' : '') + n; }
        return d.getFullYear() + '-' + two(d.getMonth() + 1) + '-' + two(d.getDate());
    }

    // the "﻿" at the start makes Excel read the file as UTF-8 (so the peso sign and accents stay right)
    function downloadCsv(name, text){
        var blob = new Blob(['﻿' + text], {type: 'text/csv;charset=utf-8'});
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'costodian-' + name + '-' + today() + '.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function(){ URL.revokeObjectURL(url); }, 2000);
    }

    function failed(reply){
        return reply && reply.message ? reply.message : 'Something went wrong.';
    }

    function exportRecipes(){
        return apiGet('recipes/list').then(function(reply){
            if(!reply.success){
                throw new Error(failed(reply));
            }
            var rows = reply.data.map(function(r){
                var c = r.costing;
                return [r.name, r.category_name, c.servings, c.ingredient_cost, c.other_costs, c.total_cost,
                        c.cost_per_serving, c.target_food_cost_pct, c.suggested_price, c.profit_per_serving];
            });
            downloadCsv('recipes', csvText(
                ['Recipe', 'Category', 'Servings', 'Ingredient cost', 'Other costs', 'Total cost',
                 'Cost per serving', 'Target food cost %', 'Suggested price', 'Profit per serving'], rows));
            return rows.length;
        });
    }

    function stockStatus(item){
        var s = item.status || {};
        if(s.expired){ return 'Expired'; }
        if(s.out){ return 'Out of stock'; }
        if(s.low){ return 'Low stock'; }
        if(s.expiring){ return 'Expiring soon'; }
        return 'OK';
    }

    function exportIngredients(){
        return apiGet('inventory/list').then(function(reply){
            if(!reply.success){
                throw new Error(failed(reply));
            }
            var rows = reply.data.map(function(i){
                return [i.name, i.category_name, i.base_unit, i.stock_qty, i.stock_text, i.cost_per, 'per ' + i.cost_per_unit,
                        i.stock_value, i.reorder_text, i.expiry_date, stockStatus(i)];
            });
            downloadCsv('ingredients', csvText(
                ['Ingredient', 'Category', 'Base unit', 'Stock (base unit)', 'Stock', 'Price', 'Price per',
                 'Stock value', 'Reorder level', 'Expiry date', 'Status'], rows));
            return rows.length;
        });
    }

    // the stock history comes in pages of 100
    function exportMovements(){
        var all = [];
        function nextPage(page){
            return apiGet('stock/movements', {page: page, per_page: 100}).then(function(reply){
                if(!reply.success){
                    throw new Error(failed(reply));
                }
                all = all.concat(reply.data.items);
                if(page < reply.data.pages && page < 500){
                    return nextPage(page + 1);
                }
            });
        }
        return nextPage(1).then(function(){
            var rows = all.map(function(m){
                return [m.created_at, m.ingredient_name, m.type, m.qty_text, m.unit_cost, m.reference, m.user_name];
            });
            downloadCsv('stock-history', csvText(
                ['Date', 'Ingredient', 'Type', 'Quantity', 'Unit cost', 'Reference', 'By'], rows));
            return rows.length;
        });
    }

    var exportItem = menuItem('export-menu-btn', '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>', 'Export data');
    exportItem.hidden = true;   // only the administrator sees it (shown below when the server says so)
    var exportWindow = null;

    function buildExport(){
        var made = makeDialog('Export your data');
        var b = made.body;
        b.appendChild(el('p', '', 'Download your data as .csv files. They open in Excel, Google Sheets or any spreadsheet app, and work as a backup.'));

        var message = el('p', 'sx-note');
        message.hidden = true;

        var list = el('div', 'sx-export-list');
        [
            ['Recipes', 'Every recipe with its costing and suggested price', exportRecipes],
            ['Ingredients', 'Inventory with stock, prices, reorder levels and expiry', exportIngredients],
            ['Stock history', 'Every restock, use, waste and adjustment', exportMovements]
        ].forEach(function(entry){
            var row = el('div', 'sx-export-row');
            var info = el('div');
            info.appendChild(el('strong', '', entry[0]));
            info.appendChild(el('small', '', entry[1]));
            var button = el('button', 'sx-btn sx-btn-fill', 'Download');
            button.type = 'button';
            button.addEventListener('click', function(){
                button.disabled = true;
                message.hidden = true;
                entry[2]().then(function(count){
                    message.className = 'sx-note sx-note-ok';
                    message.textContent = entry[0] + ' downloaded (' + count + (count == 1 ? ' row).' : ' rows).');
                    message.hidden = false;
                }).catch(function(error){
                    message.className = 'sx-note sx-note-error';
                    message.textContent = error.message || 'Could not export. Please try again.';
                    message.hidden = false;
                }).then(function(){
                    button.disabled = false;
                });
            });
            row.appendChild(info);
            row.appendChild(button);
            list.appendChild(row);
        });
        b.appendChild(list);
        b.appendChild(message);
        return made;
    }

    exportItem.addEventListener('click', function(){
        closePopover();
        if(!exportWindow){
            exportWindow = buildExport();
        }
        exportWindow.dialog.showModal();
    });

    // the administrator (who can manage recipes) is the one who exports
    getMe().then(function(reply){
        if(reply && reply.success && reply.data.permissions && reply.data.permissions.manage_recipes){
            exportItem.hidden = false;
        }
    });

    // ---------- put it all in the popover ----------

    [profileItem, muteItem, exportItem, helpItem].forEach(function(item){
        menu.insertBefore(item, themeButton);
    });

    // a line above Log out, so ending the session is apart from the preferences
    menu.insertBefore(el('div', 'menu-divider'), logoutButton);

    // the version at the bottom
    menu.appendChild(el('div', 'menu-version', 'Costodian ' + APP_VERSION));
})();

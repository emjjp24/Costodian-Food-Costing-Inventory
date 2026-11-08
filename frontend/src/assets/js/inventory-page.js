// inventory page: loads the data, search and filters, and starts everything (loads last)

// the whole inventory is fetched for the four cards. When no filter is used it is also the table
function refreshInventory(){
    var search = searchBox.value.trim();
    var categoryId = categoryFilter.value;
    var status = statusFilter.value;
    var filtering = search != "" || categoryId != "" || status != "";

    getInventory('', '', '').then(function(all){
        if(!all.success){
            showMessage(all.message, false);
            inventoryRows.innerHTML = '';
            return;
        }
        drawSummary(all.data);
        if(!filtering){
            drawTable(all.data, false);
            return;
        }
        getInventory(search, categoryId, status).then(function(found){
            if(!found.success){
                showMessage(found.message, false);
                return;
            }
            drawTable(found.data, true);
        });
    });
}

// search while typing (waits a moment so it does not ask the server for every letter)
var searchTimer = null;
searchBox.addEventListener('input', function(){
    clearTimeout(searchTimer);
    searchTimer = setTimeout(refreshInventory, 300);
});

statusFilter.addEventListener('change', refreshInventory);
categoryFilter.addEventListener('change', refreshInventory);

// the close buttons, and a click on the dark area, close the windows
document.getElementById('detail-close').addEventListener('click', function(){
    detailDialog.close();
});

[stockDialog, detailDialog].forEach(function(dialog){
    dialog.addEventListener('click', function(event){
        if(event.target === dialog){
            dialog.close();
        }
    });
});

// ---------- start ----------

startShell().then(function(user){
    if(!user){
        return;
    }
    currentUser = user;
    getIngredientCategories().then(function(reply){
        if(reply.success){
            ingredientCategories = reply.data;
            fillCategorySelect(categoryFilter, ingredientCategories, 'All categories');
        }
    });
    refreshInventory();
});
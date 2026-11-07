// recipes page: loading the lists, the search box, the buttons and the start of the page
// (needs to load last)

var searchTimer = null;

// the recipes (with the search words and the chosen category)
function loadRecipes(){
    var words = searchBox.value.trim();
    var category = categoryFilter.value;

    return getRecipes(words, category).then(function(reply){
        if(reply.success){
            drawCards(reply.data, words != "" || category != "");
        } else {
            recipesBox.innerHTML = '';
            showMessage(reply.message, false);
        }
    });
}

// the names of the ingredients that are in the inventory (for the suggestions in the form)
function loadIngredientNames(){
    return getIngredientList().then(function(reply){
        if(!reply.success){
            return;
        }
        inventoryByName = {};
        var list = document.getElementById('ingredient-names');
        list.innerHTML = '';
        reply.data.forEach(function(item){
            inventoryByName[item.name.toLowerCase()] = item;
            var option = document.createElement('option');
            option.value = item.name;
            list.appendChild(option);
        });
    });
}

// the search box waits a moment after the last key before it asks the backend
searchBox.addEventListener('input', function(){
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadRecipes, 300);
});

categoryFilter.addEventListener('change', loadRecipes);

document.getElementById('add-recipe').addEventListener('click', function(){
    clearMessage();
    openForm(null);
});

// the close buttons, and a click on the dark area, close the windows
document.getElementById('view-close').addEventListener('click', function(){
    viewDialog.close();
});

[viewDialog, formDialog].forEach(function(dialog){
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
    getCategories().then(function(reply){
        if(reply.success){
            recipeCategories = reply.data.filter(function(c){ return c.type == 'recipe'; });
            ingredientCategories = reply.data.filter(function(c){ return c.type == 'ingredient'; });
            fillCategorySelect(categoryFilter, recipeCategories, 'All categories');
        }
    });
    loadIngredientNames();
    loadRecipes();
});
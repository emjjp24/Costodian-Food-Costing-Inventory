// inventory page: a "Record waste" button in every row, next to Use (on a computer; on a phone it stays in the details window)
// needs inventory-draw.js and inventory-forms.js loaded first

var drawTableWithoutWaste = drawTable;
drawTable = function(list, filtering){
    drawTableWithoutWaste(list, filtering);

    var rows = inventoryRows.querySelectorAll('.inv-row');
    list.forEach(function(item, i){
        var row = rows[i];
        if(!row){
            return;
        }
        var use = null;
        var buttons = row.querySelectorAll('.row-actions button');
        for(var b = 0; b < buttons.length; b++){
            if(buttons[b].textContent.trim() == 'Use'){
                use = buttons[b];
            }
        }
        if(!use){
            return;
        }
        var waste = h('button', 'btn btn-line btn-sm row-waste', 'Record waste');
        waste.type = 'button';
        waste.addEventListener('click', function(event){
            event.stopPropagation();
            openStock('waste', item);
        });
        use.insertAdjacentElement('afterend', waste);
    });
};

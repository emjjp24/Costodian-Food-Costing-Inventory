// dashboard: draws the numbers, the alerts list and the recent changes table
// loaded by pages/dashboard.html, after client.js, auth.js and dashboard.js (in the api folder)

// ---------- draw the page ----------

function drawChanges(list){
    changesBody.innerHTML = '';

    if(list.length == 0){
        var emptyRow = document.createElement('tr');
        var emptyCell = document.createElement('td');
        emptyCell.className = 'empty';
        emptyCell.colSpan = 4;
        emptyCell.textContent = 'No stock changes yet.';
        emptyRow.appendChild(emptyCell);
        changesBody.appendChild(emptyRow);
        return;
    }

    list.forEach(function(move){
        var tagInfo = TAGS[move.type] || [move.type, 'tag-adjust'];
        var row = document.createElement('tr');

        var statusCell = document.createElement('td');
        var tag = document.createElement('span');
        tag.className = 'tag ' + tagInfo[1];
        tag.textContent = tagInfo[0];
        statusCell.appendChild(tag);

        var itemCell = document.createElement('td');
        itemCell.className = 'item';
        var name = document.createElement('strong');
        name.textContent = move.ingredient_name;
        itemCell.appendChild(name);
        if(move.reference){
            var reference = document.createElement('small');
            reference.textContent = move.reference;
            itemCell.appendChild(reference);
        }

        var qtyCell = document.createElement('td');
        qtyCell.textContent = move.qty_text;

        var whenCell = document.createElement('td');
        whenCell.className = 'when';
        whenCell.textContent = timeAgo(move.created_at);

        row.appendChild(statusCell);
        row.appendChild(itemCell);
        row.appendChild(qtyCell);
        row.appendChild(whenCell);
        changesBody.appendChild(row);
    });
}

function drawAlerts(alerts){
    var list = document.getElementById('notif-list');
    list.innerHTML = '';

    if(alerts.length == 0){
        var none = document.createElement('li');
        none.className = 'notif-empty';
        none.textContent = 'Everything looks good.';
        list.appendChild(none);
        return;
    }
    alerts.forEach(function(item){
        var li = document.createElement('li');
        li.textContent = item.name;
        var why = document.createElement('small');
        why.textContent = reasonText(item);
        li.appendChild(why);
        list.appendChild(li);
    });
    document.getElementById('notif-dot').hidden = false;
}

function drawSummary(data){
    document.getElementById('stat-total').textContent = data.total_ingredients;
    // low-stock card: low and out of stock, near-expiry card: close to expiring and already expired
    document.getElementById('stat-low').textContent = data.low_stock + data.out_of_stock;
    document.getElementById('stat-expiry').textContent = data.expiring_soon + data.expired;
    drawAlerts(data.alerts);
    drawChanges(data.recent_movements);
}

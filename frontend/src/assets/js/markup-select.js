// in the add / edit recipe window: ONE box for the markup
//   press the little arrow to pick 25%, 50%, 75% or 100%, or just type your own number (for example 33)
// it also hides the target food cost box while a markup is there (the price then comes from the markup)
// load this after recipes-form.js. It takes the place of markup-target.js (do not load both)

var markupBox = null;

function setupMarkupBox(){
    var targetInput = document.getElementById('f-target');
    var CHOICES = ['25', '50', '75', '100'];

    // the old quick-pick buttons are not needed any more
    var oldPicks = document.getElementById('markup-picks');
    if(oldPicks){
        oldPicks.style.display = 'none';
    }

    // the target food cost goes under the markup, the same width
    var markupField = document.getElementById('markup-field');
    var targetLabel = targetInput.closest('label');
    targetLabel.classList.add('span-2');
    markupField.parentNode.insertBefore(targetLabel, markupField.nextSibling);

    // a small "?" next to the target food cost: it opens a short explanation
    var helpButton = document.createElement('button');
    helpButton.type = 'button';
    helpButton.className = 'help-btn';
    helpButton.textContent = '?';
    helpButton.setAttribute('aria-label', 'What is the target food cost?');
    helpButton.setAttribute('aria-expanded', 'false');
    helpButton.setAttribute('aria-controls', 'target-help');

    var helpBox = document.createElement('div');
    helpBox.className = 'help-box';
    helpBox.id = 'target-help';
    helpBox.setAttribute('role', 'dialog');
    helpBox.setAttribute('aria-label', 'About the target food cost');
    helpBox.hidden = true;
    helpBox.innerHTML = '<button type="button" class="help-close" aria-label="Close">&times;</button>' +
        '<p><strong>Target food cost</strong> is the share of your selling price that you want to spend on ingredients and other costs.</p>' +
        '<p>Example: 35% means that out of every \u20b1100 you sell, \u20b135 goes to costs and \u20b165 stays with you. Costodian uses it to suggest a price: cost per serving \u00f7 35%. Many restaurants aim for about 28% to 35%.</p>' +
        '<p class="help-note"><strong>If you choose a markup above, this box disappears and is not used.</strong> The price then comes from your markup instead.</p>';

    // the "?" sits at the end of the label text, the pop up floats just under it
    targetInput.parentNode.style.position = 'relative';
    targetInput.parentNode.insertBefore(helpButton, targetInput);
    targetInput.parentNode.appendChild(helpBox);

    function closeHelp(){
        helpBox.hidden = true;
        helpButton.setAttribute('aria-expanded', 'false');
    }

    helpButton.addEventListener('click', function(event){
        // the button is inside the label, so a click must not jump into the box
        event.preventDefault();
        helpBox.hidden = !helpBox.hidden;
        helpButton.setAttribute('aria-expanded', helpBox.hidden ? 'false' : 'true');
    });
    helpBox.querySelector('.help-close').addEventListener('click', function(event){
        event.preventDefault();
        closeHelp();
        helpButton.focus();
    });
    // Esc closes only the pop up, not the whole window
    helpBox.addEventListener('keydown', function(event){
        if(event.key == 'Escape'){
            event.stopPropagation();
            event.preventDefault();
            closeHelp();
            helpButton.focus();
        }
    });
    helpButton.addEventListener('keydown', function(event){
        if(event.key == 'Escape' && !helpBox.hidden){
            event.stopPropagation();
            event.preventDefault();
            closeHelp();
        }
    });
    // a click anywhere else closes it
    document.addEventListener('click', function(event){
        if(!helpBox.hidden && !helpBox.contains(event.target) && event.target !== helpButton){
            closeHelp();
        }
    });

    // the only placeholder of the markup
    markupBox.placeholder = 'Pick or type your markup, e.g. 33';

    // the box and its arrow sit together
    var wrap = document.createElement('div');
    wrap.className = 'markup-combo';
    markupBox.parentNode.insertBefore(wrap, markupBox);
    wrap.appendChild(markupBox);

    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'combo-toggle';
    toggle.setAttribute('aria-label', 'Show the markup choices');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
    wrap.appendChild(toggle);

    var list = document.createElement('ul');
    list.className = 'combo-list';
    list.hidden = true;
    list.setAttribute('role', 'listbox');
    wrap.appendChild(list);

    var buttons = [];
    CHOICES.forEach(function(value){
        var item = document.createElement('li');
        var button = document.createElement('button');
        button.type = 'button';
        button.textContent = value + '%';
        button.setAttribute('role', 'option');
        button.addEventListener('click', function(){
            markupBox.value = value;
            closeList();
            showHideTarget();
            markupBox.focus();
        });
        item.appendChild(button);
        list.appendChild(item);
        buttons.push({value: value, button: button});
    });

    // the target food cost box is hidden while there is a markup
    // 0, empty or something that is not a number is NOT a markup, so the target stays
    function hasMarkup(){
        var typed = markupBox.value.trim();
        return typed != "" && !isNaN(typed) && parseFloat(typed) > 0;
    }

    function showHideTarget(){
        targetLabel.style.display = hasMarkup() ? 'none' : '';
        if(hasMarkup()){
            closeHelp();
        }
    }

    function openList(){
        // the choice that is already in the box is marked
        buttons.forEach(function(entry){
            var same = markupBox.value.trim() == entry.value;
            entry.button.classList.toggle('on', same);
            entry.button.setAttribute('aria-selected', same ? 'true' : 'false');
        });
        list.hidden = false;
        toggle.setAttribute('aria-expanded', 'true');
    }

    function closeList(){
        list.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function(){
        if(list.hidden){
            openList();
        } else {
            closeList();
        }
    });

    // the arrow key opens the list and goes into it
    markupBox.addEventListener('keydown', function(event){
        if(event.key == 'ArrowDown'){
            event.preventDefault();
            openList();
            buttons[0].button.focus();
        } else if(event.key == 'Escape' && !list.hidden){
            // only closes the list, not the whole window
            event.stopPropagation();
            event.preventDefault();
            closeList();
        }
    });
    list.addEventListener('keydown', function(event){
        var index = buttons.map(function(entry){ return entry.button; }).indexOf(document.activeElement);
        if(event.key == 'ArrowDown' && index < buttons.length - 1){
            event.preventDefault();
            buttons[index + 1].button.focus();
        } else if(event.key == 'ArrowUp'){
            event.preventDefault();
            if(index > 0){
                buttons[index - 1].button.focus();
            } else {
                markupBox.focus();
            }
        } else if(event.key == 'Escape'){
            event.stopPropagation();
            event.preventDefault();
            closeList();
            markupBox.focus();
        }
    });

    // a click anywhere else closes the list
    document.addEventListener('click', function(event){
        if(!wrap.contains(event.target)){
            closeList();
        }
    });

    markupBox.addEventListener('input', showHideTarget);

    // typing 0 means no markup: the box is emptied before the form reads it
    var formWindow = markupBox.closest('dialog');
    if(formWindow){
        formWindow.addEventListener('submit', function(){
            if(/^0+(\.0*)?$/.test(markupBox.value.trim())){
                markupBox.value = '';
                showHideTarget();
            }
        }, true);
    }

    // the form code fills the box (and calls markFilledPick) when it opens a recipe, so the target box is updated from there
    var markFilledPickBefore = (typeof markFilledPick == 'function') ? markFilledPick : function(){};
    markFilledPick = function(){
        markFilledPickBefore();
        closeList();
        showHideTarget();
    };

    // and every time the window opens or closes
    var markupDialog = markupBox.closest('dialog');
    if(markupDialog){
        new MutationObserver(function(){
            closeList();
            showHideTarget();
        }).observe(markupDialog, {attributes: true, attributeFilter: ['open']});
    }

    showHideTarget();
}

// it waits until the whole page and all the other scripts are loaded, so it does not matter where the script line is
function startMarkupBox(){
    markupBox = document.getElementById('f-markup');
    // a page without the markup box (for example the dashboard): nothing to do
    if(markupBox){
        setupMarkupBox();
    }
}

if(document.readyState == 'loading'){
    document.addEventListener('DOMContentLoaded', startMarkupBox);
} else {
    startMarkupBox();
}
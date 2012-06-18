function extendElementPrototype(name, func) {
    //Check if it is possible to extend the Element prototype
    Element.prototype['_' + name] = Element.prototype[name];
    Element.prototype[name] = function () { return 'unique' };

    var simpelExtend = false;
    try {
        if (document.createElement('span')[name]() == 'unique') {
            simpelExtend = true;
        }
    } catch (err) { }

    //Roll back
    Element.prototype[name] = Element.prototype['_' + name];
    delete Element.prototype['_' + name];

    //Extend the DocumentFragment prototype, with is need anyway
    DocumentFragment.prototype['_' + name] = DocumentFragment.prototype[name];
    DocumentFragment.prototype[name] = func;

    //If it is possible to extend the Element prototype
    if (simpelExtend) {
        Element.prototype['_' + name] = Element.prototype[name];
        Element.prototype[name] = func;
    }

    //Else extend every single Element prototype one by one
    else {

        //All elements except object and embed
        var elements = "unkownElement a abbr address area article aside audio b base bdi bdo blockquote body br button caption cite code col colgroup command datalist dd del details device dfn div dl dt em fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd keygen label legend li link map mark menu meta meter nav noscript ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track ul var video wbr".split(" ");

        //Variabel to make sure the same Element prototype won't be extended twice
        var dubbelControl = [];

        //Go through all elements
        for (var i = 0; i < elements.length; i++) {

            //Find the constructor object
            var constructorObject = document.createElement(elements[i]).constructor;

            //Make sure the constructor pototype hasn't been extended before
            var repeat = false;
            for (var c = 0; c < dubbelControl.length; c++) {

                if (constructorObject == dubbelControl[c]) {
                    repeat = true;
                    break;
                }

            }

            //If the constructor pototype has been extended before, go to next element
            if (repeat) {
                continue;
            }
            //If not when add the constructor to the dubbelControl array
            dubbelControl.push(constructorObject);

            //And extend the prototype
            constructorObject.prototype['_' + name] = constructorObject.prototype[name];
            constructorObject.prototype[name] = func;
        }
    }
}

function notifyNodesBeforeRemoving($node) {
	/// <summary>
	/// Notifies nodes that they are about to be removed.
	/// </summary>
	/// <param name="$node">Node to notify.</param>

    $node.triggerHandler('removing').children().each(function() {
		notifyNodesBeforeRemoving($(this));
	});
}

function notifyNodesAfterRemoving(node) {
	/// <summary>
	/// Notifies nodes that they have been removed.
	/// </summary>
	/// <param name="node">Node to notify.</param>

    $(node).triggerHandler('removed').children().each(function() {
		notifyNodesAfterRemoving($(this));
	});
}

extendElementPrototype('removeChild', function (node) {
	/// <summary>
    /// Method called every time element has been removed from DOM.
	/// Notifes this element and all children about this event.
	/// </summary>
	/// <param name="node">Removed node instance.</param>
    /// <returns>Result</returns>

	var $node = $(node);
    notifyNodesBeforeRemoving($node);
    var result = this._removeChild.apply(this, arguments);
    notifyNodesAfterRemoving($node);
    return result;
});
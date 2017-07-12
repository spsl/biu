
let checkIsDirective = function( element ) {
    if (element.nodeType === 3  ) {
        if (element.nodeValue && element.nodeValue.indexOf('{{') != -1) {
            return true;
        }
    }
    return false;
};

export { checkIsDirective };
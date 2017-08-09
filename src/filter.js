

class Filter {

    constructor( ) {
        this.filters = {};
    }

    filter( filterName, filterCall ) {

        if ( filterName && filterCall ) {
            this.filters[filterName] = {
                call: undefined,
                originalCall: filterCall
            };
        }
        return this;
    }


    calculate( input, filterName, otherInput ) {

        otherInput = otherInput || [];
        otherInput.unshift( input );
        filterName = filterName ? filterName.trim() : '';

        var filterProcess = this.filters[filterName];

        if( filterProcess ) {
            if( filterProcess.call && typeof filterProcess.call == 'function' ) {
                return filterProcess.call.apply( {}, otherInput );
            } else if ( filterProcess.originalCall && typeof filterProcess.originalCall == 'function' ) {
                filterProcess.call = filterProcess.originalCall();
                return filterProcess.call.apply( {}, otherInput );
            } 
        }

        return input;
    }


}

const filter = new Filter();

filter.filter('currency', function( ) {    
    return function( input ) {
        return '¥' + input;
    }
}).filter( 'date', function( ) {
    return function( input ) {
        return 'date' + input;
    };
});

export default filter;




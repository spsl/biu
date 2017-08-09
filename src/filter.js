

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


    calculate( input, filterName ) {
        filterName = filterName ? filterName.trim() : '';

        var filterProcess = this.filters[filterName];

        if( filterProcess ) {
            if( filterProcess.call && typeof filterProcess.call == 'function' ) {
                return filterProcess.call( input );
            } else if ( filterProcess.originalCall && typeof filterProcess.originalCall == 'function' ) {
                filterProcess.call = filterProcess.originalCall();
                return filterProcess.call( input );
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




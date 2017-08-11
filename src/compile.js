
import { splitExpersionAttr, evalExpersion } from './util';

import filter from './filter';

 export default class Parse{ 

    evalValue( expr, scope ) {
        expr = expr.replace('||', 'or_replace');
        var filters = expr.split('|');
        expr = filters[0];
        filters = filters.slice(1);


        var tmpResult = evalExpersion( expr, scope );

        let exeFilters = function( input, filters ) {
        
            var result = input;
            
            filters.forEach( function( filterName ) {
                let filtExpr = filterName.split(':');
                filterName = filtExpr[0];
                let filterInputs = filtExpr.slice(1);

                filterInputs = filterInputs.map( function( inputExpr ) {
                    return new Parse().compile( inputExpr, scope );
                });
                result = filter.calculate( result, filterName, filterInputs );
            });
            

            return result;
        }

        return exeFilters( tmpResult, filters ) ;
    }
}



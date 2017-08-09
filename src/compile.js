
import { splitExpersionAttr } from './util';

import filter from './filter';

 export default class Parse{ 

    constructor(  ) {
    
    }
    
    getValue( attr, scope ) {
        return scope[attr];
    }

    parseSubPath( lastPath ) {
        let result = '';

        let stack = [];
        let length = lastPath.length;

        for( let i = 0; i < length; i ++ ) {
            let current = lastPath[i];
            
            if( current == '[') {
                stack.push('[');
                result = result + current;
            } else if ( current == ']') {
                var ls = stack.pop();
                if ( ls == undefined ) {
                    return result;
                } else {
                    result = result + current;
                }
            } else {
                result = result + current;
            } 
        }
        return result;
    }





    compile( expr, scope ) {

        expr = expr.replace('||', 'or_replace');
        var filters = expr.split('|');
        expr = filters[0];
        filters = filters.slice(1);

        let self = this;

        var stack = [];

        var subPath = [];

        var result = undefined;

        let _this = this;
        let addSubPath = function( attr ) {
            subPath.push( attr );
        }

        const operatorVal = {
            '':0,
            '+':1,
            '-':1,
            '*':2,
            '/': 2,
            '%': 2,
            '(': 3,
            ')': 3
        };

        

        let compareOper = function( oper, otherOper ) {
            return operatorVal[oper] - operatorVal[otherOper];
        }

        let calculationExpression = function( firstValue, oper, lastValue  ) {

            if ( oper == '+' ) {
                return firstValue + lastValue;
            } else if( oper == '-' ) {
                return firstValue - lastValue;
            } else if( oper == '*' ) {
                return firstValue * lastValue;
            } else if( oper == '/' ) {
                return firstValue / lastValue;
            } else if( oper == '%') {
                return firstValue % lastValue;
            }
        }

        let processExpression = function( oper ) {
            
            let path = subPath.join('');
            subPath = [];
            var value = splitExpersionAttr( path, scope );
            let lastOper = stack.pop();

            if( lastOper ) {

                // + b * 
                if ( compareOper( lastOper, oper ) < 0 ) {
                    stack.push( value );
                    stack.push( oper );
                } else {
                    var lastVal = stack.pop();
                    
                    stack.push( calculationExpression( lastVal, lastOper, value ) );
                   
                    stack.push( oper );
                }
            } else {
                stack.push( value );
                stack.push( oper );
            }
        }

        for( let index = 0; index < expr.length; index++) {

            let operOrAttr = expr[index];

            switch( operOrAttr ) {
                case '+' :
                case '-' :
                case '*' :
                case '/' :
                case '%' : processExpression( operOrAttr ) ;break;
                default: addSubPath( operOrAttr ); break;
            }
        }

        // 这里强制算一次
        processExpression('+');

        stack.pop();

        let exeFilters = function( input, filters ) {
        
            var result = input;
            
            filters.forEach( function( filterName ) {
                let filtExpr = filterName.split(':');
                filterName = filtExpr[0];
                let filterInputs = filtExpr.slice(1);
                result = filter.calculate( result, filterName, filterInputs );
            });
            

            return result;
        }


        var tmpFinalResult = stack.pop();




        return exeFilters( tmpFinalResult, filters ) ;
    }

    parseSubExpr( lastPath ) {

        let result = '';

        let stack = [];
        let length = lastPath.length;

        for( let i = 0; i < length; i ++ ) {
            let current = lastPath[i];
            
            if( current == '+' || current == '-' || current == '*' || current == '/' ) {
                return result;
            }  else {
                result = result + current;
            } 
        }
        return result;
    }


}




 export default class Parse{ 

    constructor( ) {
        
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
            var value = _this.compilePath( path, scope );
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
        return stack.pop();
    }

    parseSubExpr( lastPath ) {

        let result = '';

        let stack = [];
        let length = lastPath.length;

        for( let i = 0; i < length; i ++ ) {
            let current = lastPath[i];
            
            if( current == '+' || current == '-' || current == '*' ||current == '/' ) {
                return result;
            }  else {
                result = result + current;
            } 
        }
        return result;
    }


    compilePath( path , scope ) {
        let length = path.length;

        let stack = [];
        let tmpAttr = '';
        
        let tmpScope = scope;

        let isConstValue = true;
        let exprStack = [];

        let _this = this;

        let processDot = function( currentWord  ) {
            // 如果是. 那么需要拿到前面的word, 进行取值操作
            let lastStr = stack.pop();
            if ( lastStr == '"' || lastStr == "'") {
                tmpAttr = tmpAttr + currentWord;
            } else {
                if ( tmpAttr.trim() != '' ) {
                    tmpScope = _this.getValue(tmpAttr, tmpScope);

                    tmpAttr = '';
                    isConstValue = false;
                }
            }
        };

        let processLeftBracket = function( currentWord  ) {
            tmpScope = _this.getValue(tmpAttr, tmpScope);
            tmpAttr = '';
            stack.push('[');
            isConstValue = false;
        };

        let processRightBracket = function( currentWord ) {
            var lastStr = stack.pop();

            if ( lastStr == '[' ) {
                tmpScope = _this.getValue(tmpAttr, tmpScope);
                tmpAttr = '';
                isConstValue = false;
            }
        };

        let processSingleQuote = function( currentWord  ) {
            var lastStr = stack.pop();

            if ( lastStr == "'") {
                if( isConstValue ) {
                    tmpScope = tmpAttr;
                    tmpAttr = '';
                }
            } else {
                stack.push(lastStr);
                stack.push("'");
            }
            
        };

        let processDoubleQuote = function( currentWord  ) {
            var lastStr = stack.pop();

            if ( lastStr != '"') {
                stack.push(lastStr);
                stack.push('"');
            } else {
                if( isConstValue ) {
                    tmpScope = tmpAttr;
                    tmpAttr = '';
                }
            }
        }

        let processBlack = function( currentWord ) {};


        let processDefaultWord = function( currentWord, index ) {
            var lastStr = stack.pop();

            if ( lastStr === '[' ) {
                var subPath = _this.parseSubPath( path.substr(index) );
                var value = _this.parsePath( subPath, scope );
                tmpScope = _this.getValue(value, tmpScope);
                index = index + subPath.length;
                isConstValue = false;
                return index;
            } else {
                tmpAttr = tmpAttr + currentWord;
                stack.push( lastStr );
            }
        }

        let processExpr = function( currentWord, index ) {

            _this.exprStack.push( tmpScope );
            _this.exprStack.push( currentWord );


            var subExpr = _this.parseSubExpr( path.substr(index + 1) );
            var value = _this.parsePath( subExpr, scope );
            
            if ( currentWord == '+') {
                tmpScope = tmpScope + value;
            }
            isConstValue = false;
            return index + subExpr.length + 1;;
        };

        

        for(let index = 0; index < length; index ++ ) {
            let currentWord = path[index];

            switch( currentWord ) {
                case '.': processDot( currentWord ); break;
                case '[': processLeftBracket( currentWord ); break;
                case ']': processRightBracket( currentWord ); break;
                case '"': processDoubleQuote( currentWord ); break;
                case "'": processSingleQuote( currentWord ); break;
                case ' ': processBlack( currentWord ); break;
                case '+':  
                case '-': 
                case '*': 
                case '/': break;
                case "|": break;
                case "&": break;
                default: index = processDefaultWord( currentWord, index ) || index; break;
            }
        }
        
        
        if ( tmpAttr.trim() != '' ) {
                tmpScope = this.getValue( tmpAttr, tmpScope );
        }
        return tmpScope;
    }

}


export class Filter{ 



    constructor() {
        this.filters = {};
    }

    createFilter( name, cb ) {
        var filterCb = cb();
        this.filters[name] = filterCb;
    }

}
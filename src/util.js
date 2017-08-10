
let checkIsDirective = function( element ) {
    if (element.nodeType === 3  ) {
        if (element.nodeValue && element.nodeValue.indexOf('{{') != -1) {
            return true;
        }
    }
    return false;
};



let evalExpersion = function( expr, scope ) {

    let preExpr = "";

    scope = scope || {};

    for( var attr in scope ) {
         let oneVar = " var " + attr + " = scope['"+ attr +"'];\n";
        preExpr = preExpr + oneVar;
    }

    let exeFun = new Function( 'scope', preExpr + " return " + expr + ";" );

    return exeFun.call( scope, scope );
}





let randomAttrReplace = function( ) {
    let preStr = '__$__';
    let randInt = parseInt( Math.random() * 100000000 );
    return preStr + randInt;
}


let splitExpersionAttr = function( expr, context ) {
    var attrResult = splitMultiDepFromOneExpersion( expr );

    let checkIsReplace = function( attrName ) {
            
        return ('' + attrName).indexOf('__$__') > -1;
    }

    let deepGetValue = function( resObj, scope ) {
        let tmpValue = scope;

        if ( resObj.isConst === true ) {
            return resObj.mainAttrArr[0];
        }

        resObj.mainAttrArr.forEach( function( attrName ) {
            
            if ( attrName != '' ) {

                if ( checkIsReplace(attrName) ) {
                    tmpValue = tmpValue[deepGetValue( resObj.parentAttr[attrName].result, context )];
                } else {
                    tmpValue = tmpValue[attrName];
                }
            }
        });

        return tmpValue;
    }


    return deepGetValue( attrResult, context );
}


// 根据一个表达式里面, 拆分出多个依赖像, 比如 user.addrs[currentAddrId].sheng, 这里面其实是有了个依赖的, 一个是currentAddrId, 另外一个就是 user.addrs[].sheng,
// 这种情况其实有一个问题, 就是如果currentAddrId 改变了之后, 对应的那个sheng 当时是没有添加到依赖的, 这时候, 如果变了的话, 就检测不到了, 
// TODO 可以先忽略这种情况, 以后有更好的思路了再做
let splitMultiDepFromOneExpersion = function( expr ) {
    let parseSubPath = function( lastPath ) {
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

    // 检查是否是数字常量
    let checkIsNumberConst = function( expr ) {
        expr = expr.trim();
        if ( expr.indexOf('"') > -1 || expr.indexOf("'") > -1 ) {
            return false;
        }
        return !isNaN( expr );
    }

    let checkIsStrConst = function( expr ) {
        
        expr = expr.trim();
        var length = expr.length;
        if( expr[0] == '"' && expr[length - 1 ] == '"'  || expr[0] == "'" && expr[length - 1] == "'" ) {
            return true;
        }
        return false;
    }

    let compilePath = function( path ) {

        path = path.trim().replace('||', '__or__operate__');
        let tmpPathExp = path.split('|');

        tmpPathExp = tmpPathExp.map( function( exp ) {
            return exp.replace("__or__operate__", "||");
        });

        path = tmpPathExp[0];
        let length = path.length;

        let stack = [];
        let tmpAttr = '';
        let attrArr = [];

        let otherPath = {};


        let resetTmpAttr = function( ) {

            if ( tmpAttr != '' ) {
                attrArr.push( tmpAttr );
            }
            
            tmpAttr = '';
        }

        let processDot = function( currentChar  ) {
            // 如果是. 那么需要拿到前面的word, 进行取值操作
            let lastStr = stack.pop();
            if ( lastStr == '"' || lastStr == "'") {
                tmpAttr = tmpAttr + currentChar;
            } else {
                if ( tmpAttr.trim() != '' ) {
                    resetTmpAttr();
                }
            }
        };

        let processLeftBracket = function( currentWord  ) {
            resetTmpAttr();
            stack.push('[');
        };

        let processRightBracket = function( currentWord ) {
            var lastStr = stack.pop();
            if ( lastStr == '[' ) {
                resetTmpAttr();
            } else {
                throw new Error('非法的表达式');
            }

        };

        let processSingleQuote = function( currentWord  ) {
            var lastStr = stack.pop();

            if ( lastStr == "'") {
                resetTmpAttr();
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
                resetTmpAttr();
            }
        }

        let processBlack = function( currentWord ) {};


        let processDefaultWord = function( currentWord, index ) {
            var lastStr = stack.pop();

            if ( lastStr === '[' ) {
                var subPath = parseSubPath( path.substr(index) );
                
                tmpAttr = randomAttrReplace();

                otherPath[tmpAttr] = {
                    path: subPath,
                    result: compilePath( subPath )
                };
                resetTmpAttr();

                index = index + subPath.length;

                return index;
            } else {
                tmpAttr = tmpAttr + currentWord;
                stack.push( lastStr );
            }
        }
        


        // 先检查是否是数字常量, 如果是的话, 那么就需要直接返回这个数字常量了
        

        if( checkIsNumberConst( path ) ) {
            return {
                isConst: true,
                mainAttrArr: [parseFloat(path)],
                parentAttr: otherPath
            }
        }

        if( checkIsStrConst( path ) ) {
            path = path.trim();
            let length = path.length;
            return {
                isConst: true,
                mainAttrArr:[path.substr(1, path.length - 2)],
                parentAttr: otherPath
            }
        }




        


        for(let index = 0; index < length; index ++ ) {
            let currehtChar = path[index];

            switch( currehtChar ) {
                case '.': processDot( currehtChar ); break;
                case '[': processLeftBracket( currehtChar ); break;
                case ']': processRightBracket( currehtChar ); break;
                case '"': processDoubleQuote( currehtChar ); break;
                case "'": processSingleQuote( currehtChar ); break;
                case ' ': processBlack( currehtChar ); break;
                default: index = processDefaultWord( currehtChar, index ) || index; break;
            }
        }
        
        
        if ( tmpAttr.trim() != '' ) {
            resetTmpAttr();
        }

        return {
            mainAttrArr: attrArr,
            parentAttr: otherPath 
        };
    }

    return compilePath( expr );
}

export { checkIsDirective, splitMultiDepFromOneExpersion, splitExpersionAttr, evalExpersion };
var biu =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return checkIsDirective; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return splitMultiDepFromOneExpersion; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return splitExpersionAttr; });

let checkIsDirective = function (element) {
    if (element.nodeType === 3) {
        if (element.nodeValue && element.nodeValue.indexOf('{{') != -1) {
            return true;
        }
    }
    return false;
};

let randomAttrReplace = function () {
    let preStr = '__$__';
    let randInt = parseInt(Math.random() * 100000000);
    return preStr + randInt;
};

let splitExpersionAttr = function (expr, context) {
    var attrResult = splitMultiDepFromOneExpersion(expr);

    let checkIsReplace = function (attrName) {

        return ('' + attrName).indexOf('__$__') > -1;
    };

    let deepGetValue = function (resObj, scope) {
        let tmpValue = scope;

        if (resObj.isConst === true) {
            return resObj.mainAttrArr[0];
        }

        resObj.mainAttrArr.forEach(function (attrName) {

            if (attrName != '') {

                if (checkIsReplace(attrName)) {
                    tmpValue = tmpValue[deepGetValue(resObj.parentAttr[attrName].result, context)];
                } else {
                    tmpValue = tmpValue[attrName];
                }
            }
        });

        return tmpValue;
    };

    return deepGetValue(attrResult, context);
};

// 根据一个表达式里面, 拆分出多个依赖像, 比如 user.addrs[currentAddrId].sheng, 这里面其实是有了个依赖的, 一个是currentAddrId, 另外一个就是 user.addrs[].sheng,
// 这种情况其实有一个问题, 就是如果currentAddrId 改变了之后, 对应的那个sheng 当时是没有添加到依赖的, 这时候, 如果变了的话, 就检测不到了, 
// TODO 可以先忽略这种情况, 以后有更好的思路了再做
let splitMultiDepFromOneExpersion = function (expr) {
    let parseSubPath = function (lastPath) {
        let result = '';
        let stack = [];
        let length = lastPath.length;

        for (let i = 0; i < length; i++) {
            let current = lastPath[i];

            if (current == '[') {
                stack.push('[');
                result = result + current;
            } else if (current == ']') {
                var ls = stack.pop();
                if (ls == undefined) {
                    return result;
                } else {
                    result = result + current;
                }
            } else {
                result = result + current;
            }
        }
        return result;
    };

    // 检查是否是数字常量
    let checkIsNumberConst = function (expr) {
        expr = expr.trim();
        if (expr.indexOf('"') > -1 || expr.indexOf("'") > -1) {
            return false;
        }
        return !isNaN(expr);
    };

    let checkIsStrConst = function (expr) {

        expr = expr.trim();
        var length = expr.length;
        if (expr[0] == '"' && expr[length - 1] == '"' || expr[0] == "'" && expr[length - 1] == "'") {
            return true;
        }
        return false;
    };

    let compilePath = function (path) {
        let length = path.length;

        let stack = [];
        let tmpAttr = '';
        let attrArr = [];

        let otherPath = {};

        let resetTmpAttr = function () {

            if (tmpAttr != '') {
                attrArr.push(tmpAttr);
            }

            tmpAttr = '';
        };

        let processDot = function (currentChar) {
            // 如果是. 那么需要拿到前面的word, 进行取值操作
            let lastStr = stack.pop();
            if (lastStr == '"' || lastStr == "'") {
                tmpAttr = tmpAttr + currentChar;
            } else {
                if (tmpAttr.trim() != '') {
                    resetTmpAttr();
                }
            }
        };

        let processLeftBracket = function (currentWord) {
            resetTmpAttr();
            stack.push('[');
        };

        let processRightBracket = function (currentWord) {
            var lastStr = stack.pop();
            if (lastStr == '[') {
                resetTmpAttr();
            } else {
                throw new Error('非法的表达式');
            }
        };

        let processSingleQuote = function (currentWord) {
            var lastStr = stack.pop();

            if (lastStr == "'") {
                resetTmpAttr();
            } else {
                stack.push(lastStr);
                stack.push("'");
            }
        };

        let processDoubleQuote = function (currentWord) {
            var lastStr = stack.pop();

            if (lastStr != '"') {
                stack.push(lastStr);
                stack.push('"');
            } else {
                resetTmpAttr();
            }
        };

        let processBlack = function (currentWord) {};

        let processDefaultWord = function (currentWord, index) {
            var lastStr = stack.pop();

            if (lastStr === '[') {
                var subPath = parseSubPath(path.substr(index));

                tmpAttr = randomAttrReplace();

                otherPath[tmpAttr] = {
                    path: subPath,
                    result: compilePath(subPath)
                };
                resetTmpAttr();

                index = index + subPath.length;

                return index;
            } else {
                tmpAttr = tmpAttr + currentWord;
                stack.push(lastStr);
            }
        };

        // 先检查是否是数字常量, 如果是的话, 那么就需要直接返回这个数字常量了


        if (checkIsNumberConst(path)) {
            return {
                isConst: true,
                mainAttrArr: [parseFloat(path)],
                parentAttr: otherPath
            };
        }

        if (checkIsStrConst(path)) {
            path = path.trim();
            let length = path.length;
            return {
                isConst: true,
                mainAttrArr: [path.substr(1, path.length - 2)],
                parentAttr: otherPath
            };
        }

        for (let index = 0; index < length; index++) {
            let currehtChar = path[index];

            switch (currehtChar) {
                case '.':
                    processDot(currehtChar);break;
                case '[':
                    processLeftBracket(currehtChar);break;
                case ']':
                    processRightBracket(currehtChar);break;
                case '"':
                    processDoubleQuote(currehtChar);break;
                case "'":
                    processSingleQuote(currehtChar);break;
                case ' ':
                    processBlack(currehtChar);break;
                default:
                    index = processDefaultWord(currehtChar, index) || index;break;
            }
        }

        if (tmpAttr.trim() != '') {
            resetTmpAttr();
        }

        return {
            mainAttrArr: attrArr,
            parentAttr: otherPath
        };
    };

    return compilePath(expr);
};



/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__biu__ = __webpack_require__(2);


console.log(__WEBPACK_IMPORTED_MODULE_0__biu__["a" /* default */]);
console.log(window);
window.Biu = __WEBPACK_IMPORTED_MODULE_0__biu__["a" /* default */];
window.biu = __WEBPACK_IMPORTED_MODULE_0__biu__["a" /* default */];

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__observer__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__compile__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__util__ = __webpack_require__(0);







class Biu {

    constructor(data) {
        this.element = document.querySelector(data.el);
        //依赖对象
        var observer = new __WEBPACK_IMPORTED_MODULE_0__observer__["a" /* default */](data.data);

        this.data = observer.data;

        this.$watch = function (watchKey, cb) {
            observer.$watch(watchKey, cb);
        };

        this.directives = [];

        // 解析节点元素, 解析到directive
        this._parseToDirective(this.element);

        // 调用directive 的render方法, 使directive 渲染自己
        this.render();
    }

    // 目前只支持解析{{value}} 这样的文本节点的渲染
    _parseToDirective(element) {

        // 如果是需要渲染的文本节点, 则生成一个新的Directive, 等待渲染
        if (Object(__WEBPACK_IMPORTED_MODULE_2__util__["a" /* checkIsDirective */])(element)) {
            this.directives.push(new Directive(this, element));
        }

        // 递归的遍历所有的子节点, 找到所有的文本节点
        if (!element.hasChildNodes()) {
            return;
        }

        var self = this;
        element.childNodes.forEach(function (childNode) {
            self._parseToDirective(childNode);
        });
    }

    render() {
        this.directives.forEach(function (directive) {
            directive.render();
        });
    }

}
/* harmony export (immutable) */ __webpack_exports__["a"] = Biu;


class Directive {
    constructor(vue, element) {
        this.element = element;
        this.type = 'text';
        this.vue = vue;
        this.nodeValue = this.element.nodeValue;

        //TODO 对于表达式的支持, 一个语句依赖多个值, 其实也是计算属性的依赖, 可以先完成计算属性的依赖,
        // 看来是需要重构这个结构了 
        this.depAttrs = this.parseDeps(element.nodeValue);

        this.registerWatcher();
    }

    // 渲染节点, 根据依赖列表, 替换{{user.name}} 等这种文本
    render() {

        var self = this;
        var templateNodeValue = self.nodeValue;
        Object.keys(self.depAttrs).forEach(function (attr) {
            var item = self.depAttrs[attr];
            var value = self.getValue(self.vue.data, item.key);
            templateNodeValue = templateNodeValue.split(attr).join(value);
        });
        this.element.nodeValue = templateNodeValue;
    }

    // 查找值, 把字符串形式的 user.name 绑定到 context 上面
    getValue(context, key) {
        return new __WEBPACK_IMPORTED_MODULE_1__compile__["a" /* default */]().compile(key, context);
    }

    parseDeps(tpl) {
        var result = {};
        var reg = /\{\{([^\}]*)\}\}/g;;
        tpl.replace(reg, function (raw, key, offset, str) {
            key = key.trim();

            if (key.indexOf('+') > -1) {
                var subKeys = key.split('+');

                var depsList = subKeys.map(function (item) {
                    return item.trim();
                });

                result[raw] = {
                    key: key,
                    depsList: depsList
                };
            } else {
                result[raw] = {
                    key: key
                };
            }
        });
        return result;
    }

    // 对所有的需要的依赖项, 注册监听, 动态更新视图
    registerWatcher() {
        var self = this;
        Object.keys(this.depAttrs).forEach(function (rs) {
            var val = self.depAttrs[rs];

            if (val.depsList) {

                val.depsList.forEach(function (item) {
                    self.vue.$watch(item, function () {
                        self.render();
                    });
                });
            } else {
                self.vue.$watch(val.key, function () {
                    self.render();
                });
            }
        });
    }

}
/* unused harmony export Directive */


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util__ = __webpack_require__(0);


class Observer {

    constructor(data, parentDep, attr) {

        if (!data || typeof data !== 'object') {
            return;
        }
        this.parent = parentDep;
        this.data = data;
        this.observerObject(data);
    }

    convert(attr, value, dep) {
        const self = this;

        Object.defineProperty(this.data, attr, {
            enumerable: true,
            configurable: false,
            get: function () {
                console.log('get ' + attr + ' : ' + value);
                if (Dep.target) {
                    dep.addWatchers();
                }
                return value;
            },
            set: function (newVal) {
                // 目前这里存在一个bug, 就是如果设置的是新的对象, 那么这之前的老的对象上面的事件会丢失
                console.log('set ' + attr + ' : ' + newVal);
                value = newVal;
                if (typeof newVal === 'object') {
                    var childOb = new Observer(value, dep, attr);
                }
                dep.notify(newVal, attr);
            }
        });
    }

    $watch(event, cb, context) {
        new Watcher(this, event, cb, context);
    }

    observerObject(obj) {
        const self = this;
        Object.keys(obj).forEach(function (attr) {
            var val = obj[attr];
            var dep = new Dep(self.parent, attr);
            new Observer(val, dep, attr);
            self.convert(attr, val, dep);
        });
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Observer;


class Dep {

    constructor(parent, attr) {
        this.parent = parent;
        this.watchers = [];
        this.attr = attr;
    }

    notify(newVal, attr) {
        this.watchers.forEach(function (watcher) {
            watcher.update(newVal);
        });

        if (this.parent) {
            this.parent.notify(newVal);
        }
    }

    addWatchers() {
        this.watchers.push(Dep.target);
    }
}

class Watcher {

    constructor(ob, event, cb, context) {
        this.cb = cb;
        this.ob = ob;
        this.context = context;
        this.calculateDep(event);
    }

    // 计算依赖, 找到最小的依赖值(即最后面的属性), 然后设置监听
    calculateDep(event) {

        var compileResult = Object(__WEBPACK_IMPORTED_MODULE_0__util__["c" /* splitMultiDepFromOneExpersion */])(event);

        if (compileResult.isConst) {
            return;
        }

        var attrList = compileResult.mainAttrArr;

        function getDeepVal(_data, isLastDeep) {

            for (let i = 0; i < attrList.length - 1; i++) {
                let attrName = attrList[i];
                _data = _data[attrName];
            }
            return { obj: _data, attr: attrList[attrList.length - 1] };
        }

        let regiObj = getDeepVal(this.ob.data);
        this.register(regiObj.obj, regiObj.attr);
    }

    register(data, attr) {
        Dep.target = this;
        data[attr];
        Dep.target = undefined;
    }

    update(newVal) {
        if (this.cb) {
            this.cb.call(this.context, newVal);
        }
    }

}

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__util__ = __webpack_require__(0);



class Parse {

    constructor() {}

    getValue(attr, scope) {
        return scope[attr];
    }

    parseSubPath(lastPath) {
        let result = '';

        let stack = [];
        let length = lastPath.length;

        for (let i = 0; i < length; i++) {
            let current = lastPath[i];

            if (current == '[') {
                stack.push('[');
                result = result + current;
            } else if (current == ']') {
                var ls = stack.pop();
                if (ls == undefined) {
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

    compile(expr, scope) {
        var stack = [];

        var subPath = [];

        var result = undefined;

        let _this = this;
        let addSubPath = function (attr) {
            subPath.push(attr);
        };

        const operatorVal = {
            '': 0,
            '+': 1,
            '-': 1,
            '*': 2,
            '/': 2,
            '%': 2,
            '(': 3,
            ')': 3
        };

        let compareOper = function (oper, otherOper) {
            return operatorVal[oper] - operatorVal[otherOper];
        };

        let calculationExpression = function (firstValue, oper, lastValue) {

            if (oper == '+') {
                return firstValue + lastValue;
            } else if (oper == '-') {
                return firstValue - lastValue;
            } else if (oper == '*') {
                return firstValue * lastValue;
            } else if (oper == '/') {
                return firstValue / lastValue;
            } else if (oper == '%') {
                return firstValue % lastValue;
            }
        };

        let processExpression = function (oper) {

            let path = subPath.join('');
            subPath = [];
            var value = Object(__WEBPACK_IMPORTED_MODULE_0__util__["b" /* splitExpersionAttr */])(path, scope);
            let lastOper = stack.pop();

            if (lastOper) {

                // + b * 
                if (compareOper(lastOper, oper) < 0) {
                    stack.push(value);
                    stack.push(oper);
                } else {
                    var lastVal = stack.pop();

                    stack.push(calculationExpression(lastVal, lastOper, value));

                    stack.push(oper);
                }
            } else {
                stack.push(value);
                stack.push(oper);
            }
        };

        for (let index = 0; index < expr.length; index++) {

            let operOrAttr = expr[index];

            switch (operOrAttr) {
                case '+':
                case '-':
                case '*':
                case '/':
                case '%':
                    processExpression(operOrAttr);break;
                default:
                    addSubPath(operOrAttr);break;
            }
        }

        // 这里强制算一次
        processExpression('+');

        stack.pop();
        return stack.pop();
    }

    parseSubExpr(lastPath) {

        let result = '';

        let stack = [];
        let length = lastPath.length;

        for (let i = 0; i < length; i++) {
            let current = lastPath[i];

            if (current == '+' || current == '-' || current == '*' || current == '/') {
                return result;
            } else {
                result = result + current;
            }
        }
        return result;
    }

}
/* harmony export (immutable) */ __webpack_exports__["a"] = Parse;


class Filter {

    constructor() {
        this.filters = {};
    }

    createFilter(name, cb) {
        var filterCb = cb();
        this.filters[name] = filterCb;
    }

}
/* unused harmony export Filter */


/***/ })
/******/ ]);
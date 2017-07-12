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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__biu__ = __webpack_require__(1);


window.Biu = __WEBPACK_IMPORTED_MODULE_0__biu__["a" /* default */];

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__observer__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__util__ = __webpack_require__(3);





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
        if (Object(__WEBPACK_IMPORTED_MODULE_1__util__["a" /* checkIsDirective */])(element)) {
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

    // 目前只支持解析{{value}} 这样的文本节点的渲染
    _parseToDirective(element) {
        // 如果是需要渲染的文本节点, 则生成一个新的Directive, 等待渲染
        if (Object(__WEBPACK_IMPORTED_MODULE_1__util__["a" /* checkIsDirective */])(element)) {
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

        // 这个指令的依赖列表, 比如是{{user.name}} {{user.age}} 一个指令里面又两个带渲染的文本, 那么会有两个依赖, 待优化
        // TODO
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
        // 目前只支持 以 .  分割的获取属性的方式
        var events = key.split('.');
        var i = 1;
        var value = context[events[0]];
        try {
            while (value && i < events.length) {
                value = value[events[i]];
                i++;
            }
            return value;
        } catch (err) {
            return undefined;
        }
    }

    parseDeps(tpl) {
        var result = {};
        var reg = /{{([a-zA-Z_$][a-zA-Z_$0-9\.]*)}}/g;
        tpl.replace(reg, function (raw, key, offset, str) {
            result[raw] = {
                key: key
            };
        });
        return result;
    }

    // 对所有的需要的依赖项, 注册监听, 动态更新视图
    registerWatcher() {
        var self = this;

        Object.keys(this.depAttrs).forEach(function (rs) {
            var val = self.depAttrs[rs];
            self.vue.$watch(val.key, function () {
                self.render();
            });
        });
    }

}
/* unused harmony export Directive */


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";


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

    calculateDep(event) {
        var events = event.split('.');

        if (events.length == 1) {
            this.register(this.ob.data, event);
        } else {
            var i = 1;
            var dat = this.ob.data[events[0]];
            while (dat && i < events.length - 1) {
                dat = dat[events[i]];
                i++;
            }
            this.register(dat, events[i]);
        }
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
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return checkIsDirective; });

let checkIsDirective = function (element) {
    if (element.nodeType === 3) {
        if (element.nodeValue && element.nodeValue.indexOf('{{') != -1) {
            return true;
        }
    }
    return false;
};



/***/ })
/******/ ]);
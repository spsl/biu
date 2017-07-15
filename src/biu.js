
import Observer from './observer';

import Parse from './compile';

import {checkIsDirective} from './util';

export default class Biu {

    constructor( data ) {
        this.element = document.querySelector(data.el);
        //依赖对象
        var observer = new Observer(data.data);

        this.data = observer.data;

        this.$watch = function( watchKey, cb ) {
            observer.$watch( watchKey, cb );
        }

        this.directives = [];

        // 解析节点元素, 解析到directive
        this._parseToDirective( this.element );

        // 调用directive 的render方法, 使directive 渲染自己
        this.render();
    }


    // 目前只支持解析{{value}} 这样的文本节点的渲染
    _parseToDirective ( element ) {

        // 如果是需要渲染的文本节点, 则生成一个新的Directive, 等待渲染
        if ( checkIsDirective( element ) ) {
            this.directives.push( new Directive(this, element ) );
        }

        // 递归的遍历所有的子节点, 找到所有的文本节点
        if (!element.hasChildNodes()) {
            return;
        }
        var self = this;
        element.childNodes.forEach(function( childNode ) {
            self._parseToDirective( childNode );
        });
    }



    // 目前只支持解析{{value}} 这样的文本节点的渲染
    _parseToDirective (element) {
        // 如果是需要渲染的文本节点, 则生成一个新的Directive, 等待渲染
        if ( checkIsDirective( element ) ) {
            this.directives.push( new Directive(this, element ) );
        }

        // 递归的遍历所有的子节点, 找到所有的文本节点
        if (!element.hasChildNodes()) {
            return;
        }
        var self = this;
        element.childNodes.forEach(function( childNode ) {
            self._parseToDirective( childNode );
        });
    }



    render() {
       this.directives.forEach(function(directive) {
           directive.render();
       });
    }

}




 export class Directive {
    constructor( vue, element ) {
        this.element = element;
        this.type = 'text';
        this.vue = vue;
        this.nodeValue = this.element.nodeValue;

        //TODO 对于表达式的支持, 一个语句依赖多个值, 其实也是计算属性的依赖, 可以先完成计算属性的依赖,
        // 看来是需要重构这个结构了 
        this.depAttrs = this.parseDeps( element.nodeValue );

        this.registerWatcher();
    }

    // 渲染节点, 根据依赖列表, 替换{{user.name}} 等这种文本
    render() {

        var self = this;
        var templateNodeValue = self.nodeValue;
        Object.keys( self.depAttrs ).forEach(function(attr) {
            var item = self.depAttrs[attr];
            var value = self.getValue( self.vue.data, item.key );
            templateNodeValue = templateNodeValue.split(attr).join(value);
        });
        this.element.nodeValue = templateNodeValue;
    }


    // 查找值, 把字符串形式的 user.name 绑定到 context 上面
    getValue( context, key ) {
        return new Parse().compile(key, context);
    }


    parseDeps(tpl) {
        var result = {};
        var reg = /\{\{([^\}]*)\}\}/g;;
        tpl.replace(reg, function (raw, key, offset, str) {
            key = key.trim();

            if ( key.indexOf('+') > -1 ) {
                var subKeys = key.split('+');

                var depsList = subKeys.map( function( item ) {
                    return item.trim();
                } );

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
        Object.keys( this.depAttrs ).forEach(function (rs) {
            var val = self.depAttrs[rs];

            if( val.depsList ) {
                
                val.depsList.forEach( function( item ) {
                    self.vue.$watch(item, function() {
                        self.render();
                    });
                });

            } else {
                self.vue.$watch(val.key, function() {
                    self.render();
                });
            }
           
        });
    }

}


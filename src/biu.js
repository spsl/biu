
import Observer from './observer';

import {checkIsDirective} from './util';

export default class Biu {

    constructor( data ) {
        this.element = document.querySelector(data.el);
        //依赖对象
        var observer = new Observer(data.data);

        this.data = observer.data;

        this.$watch = function( watchKey, cb ) {
            observer.$watch(watchKey, cb);
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

        // 这个指令的依赖列表, 比如是{{user.name}} {{user.age}} 一个指令里面又两个带渲染的文本, 那么会有两个依赖, 待优化
        // TODO
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
        // 目前只支持 以 .  分割的获取属性的方式
        var events = key.split('.');
        var i = 1;
        var value = context[events[0]];
        try {
            while( value && i < events.length ) {
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

        Object.keys( this.depAttrs ).forEach(function (rs) {
            var val = self.depAttrs[rs];
            self.vue.$watch(val.key, function() {
                self.render();
            });
        });
    }

}


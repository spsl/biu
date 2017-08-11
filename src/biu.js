
import Observer from './observer';

import Parse from './compile';

import { checkIsDirective } from './util';

import filter from './filter';

import Directive from './directive';

export default class Biu {

    constructor( data ) {
        this.element = document.querySelector( data.el );
        //依赖对象
        var observer = new Observer( data.data );

        this.data = observer.data;

        this.$watch = function( watchKey, cb ) {
            observer.$watch( watchKey, cb );
        }

        this.directives = [];

        // 解析节点元素, 解析到directive
        this._parseToDirective( this.element );

        // 调用directive 的render方法, 使directive 渲染自己
        this.render();

        this.filter = filter;
    }

    filter( filterName, cb ) {
        filter.filter( filterName, cb );
    } 


    // 目前只支持解析{{value}} 这样的文本节点的渲染
    // 添加对属性的渲染, 所有的属性都是biu 开头
    // 应该整理一下概念, 就是 所谓的directive, 比如文本是一个directive, 同样的一个属性或者一个元素也可能是一个指令, 
    // 然后剥离出来的指令, 应该交由指令自己去渲染数据, 会提供一些默认的指令, 比如文本指令, biu-bind, biu-show 等等这些
    // 所以这里面的东西都需要重写了
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

    render() {
       this.directives.forEach( function( directive ) {
           directive.render();
       });
    }

    
}


Biu.filter = function( filterName, filterCall ) {
    filter.filter( filterName, filterCall );
}



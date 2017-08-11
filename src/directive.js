
import Parse from './compile';


 export default class Directive {
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
        return new Parse().evalValue(key, context);
    }


    parseDeps(tpl) {
        var result = {};
        var reg = /\{\{([^\}]*)\}\}/g;;
        tpl.replace(reg, function (raw, key, offset, str) {
            key = key.trim();
            key = key.replace('||', 'or_replace');

            // 处理filter, 需要先把|| 操作符替换掉, 然后取出其他的都是filter
            // 目前先处理不带另外输入的filter, 之后再处理可以另外传参数
            var filters = key.split('|');

            for( let i = 0 ; i < filters.length; i ++ ) {
                filters[i] = filters[i].replace('or_replace', '||');
            }

            var mainExpr = filters[0];

            if ( mainExpr.indexOf('+') > -1 ) {
                var subKeys =mainExpr.split('+');

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


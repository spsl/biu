import { splitMultiDepFromOneExpersion } from './util';

export default class Observer {

    constructor( data, parentDep, attr ) {

        if( !data || typeof data !== 'object' ) {
            return;
        }
        this.parent = parentDep;
        this.data = data;
        this.observerObject( data );
    }

    convert( attr, value, dep ) {
        const self = this;
        
        Object.defineProperty(this.data, attr, {
            enumerable: true,
            configurable: false,
            get: function() {
                console.log('get ' + attr + ' : ' + value);
                if (Dep.target) {
                    dep.addWatchers();
                }
                return value;
            },
            set: function( newVal ) {
                // 目前这里存在一个bug, 就是如果设置的是新的对象, 那么这之前的老的对象上面的事件会丢失
                console.log('set ' + attr + ' : ' + newVal );
                value = newVal;
                if ( typeof newVal === 'object' ) {
                    var childOb = new Observer( value, dep, attr);
                }
                dep.notify( newVal, attr );
            }
        });
    }

    $watch(event, cb, context ) {
        new Watcher( this, event, cb, context);
    }


     observerObject( obj ) {
        const self = this;
        Object.keys( obj ).forEach(function( attr ) {
            var val = obj[attr];
            var dep = new Dep( self.parent, attr );
            new Observer( val, dep, attr);
            self.convert( attr, val, dep );
        });
    };

}

class Dep {

    constructor( parent, attr ) {
        this.parent = parent;
        this.watchers = [];
        this.attr = attr;
    }

    notify( newVal, attr ) {
        this.watchers.forEach(function(watcher) {
            watcher.update(newVal);
        });
    
        if (this.parent) {
            this.parent.notify(newVal);
        }
    }

    addWatchers( ) {
        this.watchers.push(Dep.target);
    }
}

class Watcher {

    constructor( ob, event, cb, context ) {
        this.cb = cb;
        this.ob = ob;
        this.context = context;
        this.calculateDep(event);
    }

    // 计算依赖, 找到最小的依赖值(即最后面的属性), 然后设置监听
    calculateDep( event ) {


        var attrList = splitMultiDepFromOneExpersion( event ).mainAttrArr;


        

        function getDeepVal( _data ) {

            for( let i = 0 ; i < attrList.length - 1; i ++ ) {
                let attrName = attrList[i];
                _data = _data[attrName];
            }

            return {obj:  _data, attr: attrList[attrList.length - 1] };
        }


        let regiObj = getDeepVal( this.ob.data );
        this.register( regiObj.obj , regiObj.attr );


        // var events = event.split('.');
        // if (events.length == 1) {
        //     this.register( this.ob.data, event);
        // } else {
        //     var i = 1;
        //     var dat = this.ob.data[events[0]];
        //     while(dat && i < events.length - 1) {
        //         dat = dat[events[i]];
        //         i++;
        //     }
        //     this.register( dat, events[i] );
        // }
    }

     register( data, attr ) {
        Dep.target = this;
        data[attr];
        Dep.target = undefined;
    }

    update( newVal ) {
        if (this.cb) {
            this.cb.call(this.context, newVal);
        }
    }
    
}


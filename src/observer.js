
(function( global ) {
    function Observer( data, parentDep, attr ) {

        if( !data || typeof data !== 'object' ) {
            return;
        }
        this.parent = parentDep;
        this.data = data;
        this.observerObject( data );
    }

    Observer.prototype.observerObject = function( obj ) {
        const self = this;
        Object.keys( obj ).forEach(function( attr ) {
            var val = obj[attr];
            var dep = new Dep( self.parent, attr );
            new Observer( val, dep, attr);
            self.convert( attr, val, dep );
        });
    };

    Observer.prototype.convert = function( attr, value , dep ) {
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
    };


    Observer.prototype.$watch = function(event, cb, context) {
        new Watcher( this, event, cb, context);
    };


    function Dep(parent, attr) {
        this.parent = parent;
        this.watchers = [];
        this.attr = attr;
    }

    Dep.prototype.notify = function(newVal, attr) {
        this.watchers.forEach(function(watcher) {
            watcher.update(newVal);
        });
    
        if (this.parent) {
            this.parent.notify(newVal);
        }
    };

    Dep.prototype.addWatchers = function() {
        this.watchers.push(Dep.target);
    };

    function Watcher(ob, event, cb, context) {
        this.cb = cb;
        this.ob = ob;
        this.context = context;
        this.calculateDep(event);
    }

    Watcher.prototype.register = function(data, attr) {
        Dep.target = this;
        data[attr];
        Dep.target = undefined;
    }

    Watcher.prototype.calculateDep = function(event) {
        var events = event.split('.');

        if (events.length == 1) {
            this.register( this.ob.data, event);
        } else {
            var i = 1;
            var dat = this.ob.data[events[0]];
            while(dat && i < events.length - 1) {
                dat = dat[events[i]];
                i++;
            }
            this.register( dat, events[i]);
        }
    };


    Watcher.prototype.update = function(newVal) {
        if (this.cb) {
            this.cb.call(this.context, newVal);
        }
    }

    global.Observer = Observer;



}(window));


const a = {
    id: 1,
    age: 12,
    name: {
        first: 'sai',
        last: 'sun'
    }
}


const b = new Observer(a);


/*
 *  The current Proxy behavior is skipped entirely for Duktape internal keys.
 *  Any property read/write/delete operations on internal keys behave as if the
 *  proxy handler did not exist, so that the operations are applied to the target
 *  object instead.
 *
 *  Duktape accesses internal properties like _Finalizer with ordinary
 *  property reads and writes, which causes some side effects when combining
 *  proxies and finalizers.  In essence, you can only set a finalizer to the
 *  target object.
 */

/*===
get for key: "foo"
target finalized (2)
===*/

function fin1() {
    print('target finalized (1)');
}

function fin2() {
    print('target finalized (2)');
}

function test1() {
    var target = {};
    var proxy = new Proxy(target, {
        get: function(targ, key, receiver) {
            print('get for key:', Duktape.enc('jx', key));
            return targ[key];
        }
    });

    Duktape.fin(target, fin1);

    // Because there is no 'set' handler, the _Finalizer write will go into
    // the target object and overwrites the previous finalizer.
    Duktape.fin(proxy, fin2);

    // When proxy is made unreachable, there is no _Finalizer read because
    // the *proxy* does not have a finalizer property from Duktape's perspective
    // (there is no proxy handler for property existence check now, and the
    // current finalizer code uses duk_hobject_hasprop_raw() which ignores proxies).
    target = null;  // reachable through proxy
    void proxy.foo;
    proxy = null;  // now proxy also unreachable (at least after function exits)
}

try {
    test1();
} catch (e) {
    print(e);
}

/*===
target finalized (2)
===*/

function test2() {
    var target = {};
    var proxy = new Proxy(target, {
        set: function(targ, key, val, receiver) {
            print('set for key:', Duktape.enc('jx', key));
            targ[key] = val;
            return true;
        }
    });

    Duktape.fin(target, fin1);

    // The 'set' handler is skipped for internal keys, so the finalizer is set
    // into the target again, overwriting the previous finalizer.  Nothing is
    // logged by the 'set' handler.
    Duktape.fin(proxy, fin2);

    // Like in test1(), no finalizer read for proxy.
    target = null;  // reachable through proxy
    void proxy.foo;
    proxy = null;  // now proxy also unreachable (at least after function exits)
}

try {
    test2();
} catch (e) {
    print(e);
}

/*===
finished
===*/

print('finished');

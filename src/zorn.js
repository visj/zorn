/**
 * @typedef {function(boolean): void}
 */
var Cleanup;

/**
 * @typedef {function(*): void}
 */
var Recover;

/** 
 * @abstract
 * @constructor 
 */
function Nil() { }

/**
 * @interface
 */
function Op() { }

/**
 * @package
 * @type {number}
 */
Op.prototype._state;

/**
 * @package
 * @returns {void}
 */
Op.prototype._update = function () { }

/**
 * @package
 * @returns {void}
 */
Op.prototype._dispose = function () { }

/**
 * @interface
 * @template T
 * @extends {Op}
 */
function React() { }

/**
 * @package
 * @type {T}
 */
React.prototype._value;

/**
 * @template T
 * @interface
 * @extends {Op}
 */
function Scope() { }

/**
 * @package
 * @type {?Array<!React>}
 */
Scope.prototype._owned;

/**
 * @package
 * @type {?Array<!Cleanup>}
 */
Scope.prototype._cleanups;

/**
 * @package
 * @type {?Array<!Recover>}
 */
Scope.prototype._recovers;

/**
 * @template T
 * @interface
 */
function Signal() { }

/**
 * @public
 * @export
 * @type {T}
 */
Signal.prototype.val;

/**
 * @public
 * @export
 * @type {T}
 */
Signal.prototype.peek;

/**
 * @const 
 * @enum {number}
 */
export var State = {
    Static: 1,
    DisposeFlags: 6,
    Disposed: 2,
    Dispose: 4,
    UpdateFlags: 24,
    Updated: 8,
    Update: 16,
    Send: 32,
    Error: 64,
    Respond: 128,
}

/**
 * @const
 * @enum
 */
export var Stage = {
    Idle: 0,
    Started: 1,
    Disposes: 2,
    Changes: 3,
    Computes: 4,
    Effects: 5,
}

/* START_OF_FILE */

/**
 * 
 * @returns {Nil}
 */
function nil() {
    return NIL;
}

/**
 * 
 * @returns {?Scope}
 */
function owner() {
    return OWNER;
}

/**
 * @template T
 * @constructor
 * @implements {Signal<T>}
 * @param {function(): T} fn
 */
function Val(fn) {
    this._fn = fn;
}

setValProto(Val.prototype, {
    /**
     * @template T 
     * @this {!Val<T>}
     * @returns {T}
     */
    get: function () {
        return this._fn();
    }
}, {
    /**
     * @template T 
     * @this {!Val<T>}
     * @returns {T}
     */
    get: function () {
        var listen = LISTEN;
        LISTEN = false;
        var val = this._fn();
        LISTEN = listen;
        return val;
    }
});

/**
 * @template T
 * @param {function(): T} fn 
 * @returns {!Signal<T>}
 */
function val(fn) {
    return new Val(fn);
}

/**
 * @param {!Op} node 
 */
function dispose(node) {
    var state = node._state;
    if ((state & State.DisposeFlags) === 0) {
        if (STAGE === Stage.Idle) {
            node._dispose();
        } else {
            node._state = (state & ~State.Update) | State.Dispose;
            DISPOSES._add(node);
        }
    }
}

/**
 * @template S, T
 * @param {!Signal<S> | !Array<!Signal>} src 
 * @param {function((S | !Array<S>), T, (S | undefined)): T} fn 
 * @param {boolean=} defer
 * @returns {function(T): T}
 */
function when(src, fn, defer) {
    /**
     * @type {S | !Array<S>}
     */
    var prev;
    /**
     * @type {number}
     */
    var ln;
    /**
     * @type {S | !Array<S>}
     */
    var next;
    /**
     * @const
     * @type {boolean}
     */
    var isArray = Array.isArray(src);
    if (isArray) {
        ln = /** @type {!Array<S>} */(src).length;
        prev = new Array(ln);
        next = new Array(ln);
    }

    return function (seed) {
        if (isArray) {
            for (var i = 0; i < ln; i++) {
                next[i] = /** @type {!Array<!Signal>} */(src)[i].val;
            }
        } else {
            next = /** @type {!Signal<S>} */(src).val;
        }
        if (defer) {
            defer = false;
        } else {
            var listen = LISTEN;
            LISTEN = false;
            seed = fn(next, seed, prev);
            LISTEN = listen;
        }
        var temp = next;
        next = prev;
        prev = temp;
        return seed;
    };
}

/**
 * @template T
 * @param {function(T): T} fn 
 * @param {T=} seed 
 * @param {boolean | (function(T, T): boolean)=} eq
 * @returns {!Signal<T>}
 */
function compute(fn, seed, eq) {
    return new Computation(fn, seed, State.Static, eq);
}

/**
 * @template T
 * @param {function(T): T} fn 
 * @param {T=} seed 
 * @param {boolean | (function(T, T): boolean)=} eq
 * @returns {!Signal<T>}
 */
function $compute(fn, seed, eq) {
    return new Computation(fn, seed, 0, eq);
}

/**
 * @template T
 * @param {function(): T} fn 
 * @returns {!Scope<T>}
 */
function root(fn) {
    var node = new Owner();
    var owner = OWNER;
    var listen = LISTEN;
    OWNER = node;
    LISTEN = false;
    if (STAGE === Stage.Idle) {
        try {
            fn();
        } finally {
            OWNER = owner;
            LISTEN = listen;
        }
    } else {
        fn();
        OWNER = owner;
        LISTEN = listen;
    }
    return node;
}

/**
 * @template T
 * @param {T} value 
 * @returns {!Signal<T>}
 */
function data(value) {
    return new Data(value);
}

/**
 * @template T
 * @param {T} value 
 * @param {function(T, T): boolean=} eq
 * @returns {!Signal<T>}
 */
function value(value, eq) {
    return new Value(value, eq);
}

/**
 * @template T
 * @param {function(): T} fn 
 * @returns {T}
 */
function freeze(fn) {
    var result;
    if (STAGE === Stage.Idle) {
        reset();
        STAGE = Stage.Started;
        try {
            result = fn();
            exec();
        } finally {
            STAGE = Stage.Idle;
        }
    } else {
        result = fn();
    }
    return result;
}

/**
 * 
 * @param {Cleanup} fn 
 *
 */
function cleanup(fn) {
    var owner = OWNER;
    if (owner !== null) {
        if (owner._cleanups === null) {
            owner._cleanups = [fn];
        } else {
            owner._cleanups.push(fn);
        }
    }
}

/**
 * 
 * @param {!Recover} fn
 */
function recover(fn) {
    var owner = OWNER;
    if (owner !== null) {
        if (owner._recovers === null) {
            owner._recovers = [fn];
        } else {
            owner._recovers.push(fn);
        }
    }
}

/**
 * @noinline
 * @param {Object} obj 
 * @param {!ObjectPropertyDescriptor<?Object>} val 
 * @param {!ObjectPropertyDescriptor<?Object>} peek
 */
function setValProto(obj, val, peek) {
    Object.defineProperties(obj, { val: val, peek: peek });
}

/**
 * @template T
 * @this {React}
 * @returns {T}
 */
function getValue() {
    return this._value;
}

/**
 * @template T
 * @abstract
 * @constructor
 * @implements {React}
 * @param {Scope | null} owner 
 * @param {number | undefined} state 
 * @param {T} value 
 */
function Send(owner, state, value) {
    /**
     * @package
     * @type {number}
     */
    this._state = 0 | state;
    /**
     * @package
     * @type {T}
     */
    this._value = value;
    /**
     * @package
     * @type {?Receive}
     */
    this._node1 = null;
    /**
     * @package
     * @type {number}
     */
    this._node1slot = -1;
    /**
     * @package
     * @type {?Array<!Receive>}
     */
    this._nodes = null;
    /**
     * @package
     * @type {?Array<number>}
     */
    this._nodeslots = null;
    if (owner !== null) {
        if (owner._owned === null) {
            owner._owned = [this];
        } else {
            owner._owned.push(this);
        }
    }
}

/**
 * 
 * @param {!Send} node 
 *
 */
function sendUpdate(node) {
    /** @type {number} */
    var ln;
    var node1 = node._node1;
    var nodes = node._nodes;
    if (node1 !== null) {
        receiveUpdate(node1);
    }
    if (nodes !== null && (ln = nodes.length) > 0) {
        for (var i = 0; i < ln; i++) {
            receiveUpdate(nodes[i]);
        }
    }
}

/**
 * 
 * @param {!Send} node 
 *
 */
function disposeSender(node) {
    node._state = State.Disposed;
    node._value = void 0;
    node._node1 = null;
    node._nodes = null;
    node._nodeslots = null;
    cleanupSender(node);
}

/**
 * @template T
 * @constructor
 * @implements {Scope<T>}
 */
function Owner() {
    /**
     * @package
     * @type {number}
     */
    this._state = 0;
    /**
     * @package
     * @type {?Array<!Op>}
     */
    this._owned = null;
    /**
     * @package
     * @type {?Array<!Cleanup>}
     */
    this._cleanups = null;
    /**
     * @package
     * @type {?Array<!Recover>}
     */
    this._recovers = null;
}

/**
 * @template T 
 * @this {Scope<T>}
 */
function disposeOwner() {
    this._state = State.Disposed;
    this._value = /** @type {T} */(void 0);
    /** @type {number} */
    var i;
    /** @type {number} */
    var ln;
    var owned = this._owned;
    var cleanups = this._cleanups;
    if (owned !== null && (ln = owned.length) !== 0) {
        for (i = 0; i < ln; i++) {
            owned[i]._dispose();
        }
    }
    this._owned = null;
    if (cleanups !== null && (ln = cleanups.length) !== 0) {
        for (i = 0; i < ln; i++) {
            cleanups[i](true);
        }
    }
    this._cleanups = null;
}

Owner.prototype._update = function () { };

Owner.prototype._dispose = disposeOwner;

/**
 * 
 * @param {!Receive} node 
 */
function receiveUpdate(node) {
    var state = node._state;
    if ((state & State.DisposeFlags) === 0) {
        node._state |= State.Update;
        if ((state & (State.Respond | State.Send)) === State.Send) {
            PENDINGS._add(node);
        } else {
            UPDATES._add(node);
        }
        if (node._owned !== null) {
            receiveDispose(node._owned);
        }
        if ((state & State.Send) !== 0) {
            sendUpdate(node);
        }
    }
}

/**
 * 
 * @param {!Array<!Receive>} nodes 
 */
function receiveDispose(nodes) {
    var ln = nodes.length;
    for (var i = 0; i < ln; i++) {
        var node = nodes[i];
        node._state = State.Dispose;
        DISPOSES._add(node);
        var owned = node._owned;
        if (owned !== null) {
            receiveDispose(owned);
            owned.length = 0;
        }
    }
}

/**
 * @template T
 * @abstract
 * @constructor
 * @extends {Send<T>}
 * @implements {Scope<T>}
 * @param {?Scope} owner 
 * @param {number=} state 
 * @param {T=} value 
 */
function Receive(owner, state, value) {
    Send.call(this, owner, state, value);
    /**
     * @package
     * @type {?Send}
     */
    this._source1 = null;
    /**
     * @package
     * @type {number}
     */
    this._source1slot = 0;
    /**
     * @package
     * @type {?Array<!Send>}
     */
    this._sources = null;
    /**
     * @package
     * @type {?Array<number>}
     */
    this._sourceslots = null;
    /**
     * @package
     * @type {?Array<!React>}
     */
    this._owned = null;
    /**
     * @package
     * @type {?Array<!Cleanup>}
     */
    this._cleanups = null;
    /**
     * @package
     * @type {?Array<!Recover>}
     */
    this._recovers = null;
}

/**
 * @template T
 * @constructor
 * @param {T} value
 * @extends {Send<T>}
 * @implements {Signal<T>}
 */
function Data(value) {
    Send.call(this, OWNER, 0, value);
    /**
     * @type {T | Nil}
     */
    this._pending = NIL;
}

/**
 * @template T
 * @this {!Data<T>}
 * @returns {T}
 */
function getData() {
    if ((this._state & State.DisposeFlags) === 0) {
        if (LISTEN) {
            logRead(this, /** @type {!Receive} */(OWNER));
        }
    }
    return this._value;
}

/**
 * @template T
 * @this {!Data<T>}
 * @param {T} value
 * @returns {T}
 */
function setData(value) {
    var state = this._state;
    if ((state & State.DisposeFlags) === 0) {
        if (STAGE === Stage.Idle) {
            if ((state & State.Send) !== 0) {
                reset();
                this._value = value;
                sendUpdate(this);
                exec();
            } else {
                this._value = value;
            }
        } else {
            if (this._pending === NIL) {
                this._pending = value;
                this._state |= State.Update;
                CHANGES._add(this);
            } else if (value !== this._pending) {
                throw new Error("Zorn: Conflict");
            }
        }
    }
    return value;
}

/**
 * @template T
 * @this {!Data<T>}
 *
 */
function updateData() {
    this._value = this._pending;
    this._pending = NIL;
    this._state &= ~State.Update;
    if ((this._state & State.Send) !== 0) {
        sendUpdate(this);
    }
}

/**
 * @template T
 * @this {!Data<T>}
 *
 */
function disposeData() {
    disposeSender(this);
    this._pending = void 0;
}

setValProto(Data.prototype, { get: getData, set: setData }, { get: getValue });

/**
 * @this {!Data<T>}
 *
 */
Data.prototype._update = updateData;

/**
 * @this {!Data<T>}
 */
Data.prototype._dispose = disposeData;

/**
 * @template T
 * @constructor
 * @extends {Data<T>}
 * @param {T} value 
 * @param {(function(T, T): boolean)=} eq
 */
function Value(value, eq) {
    Data.call(this, value);
    /**
     * @package
     * @type {(function(T, T): boolean) | undefined | null}
     */
    this._eq = eq;
}

/**
 * @template T
 * @this {!Value<T>}
 * @param {T} value 
 * @returns {T} 
 */
function setValue(value) {
    if ((this._state & State.DisposeFlags) === 0) {
        if (this._eq === void 0 ? value !== this._value : !this._eq(value, this._value)) {
            setData.call(this, value);
        }
    }
    return value;
}

setValProto(Value.prototype, { get: getData, set: setValue }, { get: getValue });

/**
 * @this {!Value<T>}
 *
 */
Value.prototype._update = updateData;

/**
 * @this {!Value<T>}
 *
 */
Value.prototype._dispose = function () {
    this._eq = null;
    disposeData.call(this);
};

/**
 * @template T 
 * @constructor
 * @extends {Receive<T>}
 * @implements {Signal<T>}
 * @param {function(T): T} fn 
 * @param {T} value 
 * @param {(function(T,T): boolean)|boolean=} eq
 * @param {number} state
 */
function Computation(fn, value, state, eq) {
    var owner = OWNER;
    var listen = LISTEN;
    Receive.call(this, owner, state);
    /**
     * @package
     * @type {(function(T,T): boolean)|boolean|undefined}
     */
    this._eq = eq;
    if (eq === false) {
        this._state |= State.Respond;
    }
    /**
     * @package
     * @type {?function(T): T}
     */
    this._fn = fn;
    OWNER = this;
    LISTEN = true;
    if (STAGE === Stage.Idle) {
        reset();
        STAGE = Stage.Started;
        try {
            this._value = fn(value);
            if (CHANGES._count !== 0 || DISPOSES._count !== 0) {
                start();
            }
        } finally {
            STAGE = Stage.Idle;
            OWNER = null;
            LISTEN = false;
        }
    } else {
        this._value = fn(value);
    }
    OWNER = owner;
    LISTEN = listen;
};

setValProto(Computation.prototype, {
    /**
     * @template T
     * @this {Computation<T>}
     * @returns {T}
     */
    get: function () {
        var state = this._state;
        if ((state & State.DisposeFlags) === 0 && STAGE !== Stage.Idle) {
            if ((state & State.Update) !== 0) {
                if ((state & State.Updated) !== 0) {
                    throw new Error();
                }
                this._update();
            }
            if (LISTEN) {
                logRead(this, /** @type {!Receive} */(OWNER));
            }
        }
        return this._value;
    }
}, { get: getValue });

/**
 *
 */
Computation.prototype._update = function () {
    /** @type {number} */
    var i;
    /** @type {number} */
    var ln;
    var owner = OWNER;
    var listen = LISTEN;
    OWNER = null;
    LISTEN = false;
    var state = this._state;
    var cleanups = this._cleanups;
    if (cleanups !== null && (ln = cleanups.length) !== 0) {
        for (i = 0; i < ln; i++) {
            cleanups[i](false);
        }
        cleanups.length = 0;
    }
    OWNER = this;
    if (LISTEN = (state & State.Static) === 0) {
        cleanupReceiver(this);
    }
    this._state |= State.Updated;
    var recovers = this._recovers;
    if (recovers !== null) {
        try {
            this._value = this._fn(this._value);
        } catch (err) {
            ln = recovers.length;
            for (i = 0; i < ln; i++) {
                recovers[i](err);
            }
            recovers.length = 0;
        }
    } else {
        this._value = this._fn(this._value);
    }
    this._state &= ~State.UpdateFlags;
    OWNER = owner;
    LISTEN = listen;
};

/**
 * 
 */
Computation.prototype._dispose = function () {
    this._fn = null;
    disposeOwner.call(this);
    disposeSender(this);
    cleanupReceiver(this);
};

/**
 * @constructor
 * @param {number} stage 
 */
function Queue(stage) {
    /**
     * @package
     * @type {number}
     */
    this._stage = stage;
    /**
     * @package
     * @type {!Array<?Op>}
     */
    this._items = [];
    /**
     * @package
     * @type {number}
     */
    this._count = 0;
}

/**
 * @package
 * @param {!Op} item
 */
Queue.prototype._add = function (item) {
    this._items[this._count++] = item;
};

/**
 * @package
 * @returns {number}
 */
Queue.prototype._run = function () {
    STAGE = this._stage;
    var error = 0;
    for (var i = 0; i < this._count; i++) {
        var item = this._items[i];
        var state = item._state;
        if ((state & (State.Update | State.Dispose)) !== 0) {
            try {
                if ((state & State.Update) !== 0) {
                    item._update();
                } else {
                    item._dispose();
                }
            } catch (err) {
                error = 1;
                if ((state & State.Update) !== 0) {
                    item._value = err;
                    item._state |= State.Error;
                }
                item._state &= ~State.UpdateFlags;
            }
        }
        this._items[i] = null;
    }
    this._count = 0;
    return error;
};

// Constants
/**
 * @const {!Nil}
 */
var NIL = /** @type {!Nil} */({});
/**
 * @type {number}
 */
var STAGE = Stage.Idle;
/**
 * @const {!Queue}
 */
var DISPOSES = new Queue(Stage.Disposes);
/**
 * @const {!Queue}
 */
var CHANGES = new Queue(Stage.Changes);
/**
 * @const {!Queue}
 */
var PENDINGS = new Queue(Stage.Computes);
/**
 * @const {!Queue}
 */
var UPDATES = new Queue(Stage.Effects);
/**
 * @type {Scope | null}
 */
var OWNER = null;
/**
 * @type {boolean}
 */
var LISTEN = false;

/**
 *
 */
function reset() {
    DISPOSES._count = CHANGES._count = PENDINGS._count = UPDATES._count = 0;
}

/**
 * 
 * @param {!Send} from 
 * @param {!Receive} to
 */
function logRead(from, to) {
    from._state |= State.Send;
    /** @type {number} */
    var fromslot;
    var toslot = to._source1 === null ? -1 : to._sources === null ? 0 : to._sources.length;
    if (from._node1 === null) {
        from._node1 = to;
        from._node1slot = toslot;
        fromslot = -1;
    } else if (from._nodes === null) {
        from._nodes = [to];
        from._nodeslots = [toslot];
        fromslot = 0;
    } else {
        fromslot = from._nodes.length;
        from._nodes.push(to);
        from._nodeslots.push(toslot);
    }
    if (to._source1 === null) {
        to._source1 = from;
        to._source1slot = fromslot;
    } else if (to._sources === null) {
        to._sources = [from];
        to._sourceslots = [fromslot];
    } else {
        to._sources.push(from);
        to._sourceslots.push(fromslot);
    }
}

/**
 *
 */
function exec() {
    var owner = OWNER;
    try {
        start();
    } finally {
        STAGE = Stage.Idle;
        OWNER = owner;
        LISTEN = false;
    }
}

/**
 *
 */
function start() {
    var cycle = 0;
    var errors = 0;
    var disposes = DISPOSES;
    var changes = CHANGES;
    var computes = PENDINGS;
    var effects = UPDATES;
    do {
        if (disposes._count !== 0) {
            errors += disposes._run();
        }
        if (changes._count !== 0) {
            errors += changes._run();
        }
        if (disposes._count !== 0) {
            errors += disposes._run();
        }
        if (computes._count !== 0) {
            errors += computes._run();
        }
        if (effects._count !== 0) {
            errors += effects._run();
        }
        if (errors !== 0) {
            throw new Error("Zorn: Error");
        }
        if (cycle++ > 1e5) {
            throw new Error("Zorn: Cycle");
        }
    } while (changes._count !== 0 || disposes._count !== 0 || computes._count !== 0 || effects._count !== 0);
}

/**
 * 
 * @param {!Receive} node
 *
 */
function cleanupReceiver(node) {
    /** @type {number} */
    var ln;
    var source1 = node._source1;
    var sources = node._sources;
    if (source1 !== null) {
        forgetReceiver(source1, node._source1slot);
        node._source1 = null;
    }
    if (sources !== null && (ln = sources.length) !== 0) {
        var sourceslots = node._sourceslots;
        for (; ln-- !== 0;) {
            forgetReceiver(sources.pop(), sourceslots.pop());
        }
    }
}

/**
 * 
 * @param {!Send} send 
 * @param {number} slot
 *
 */
function forgetReceiver(send, slot) {
    if ((send._state & State.DisposeFlags) === 0) {
        if (slot === -1) {
            send._node1 = null;
        } else {
            var nodes = send._nodes;
            var nodeslots = send._nodeslots;
            var last = nodes.pop();
            var lastslot = nodeslots.pop();
            if (slot !== nodes.length) {
                nodes[slot] = last;
                nodeslots[slot] = lastslot;
                if (lastslot === -1) {
                    last._source1slot = slot;
                } else {
                    last._sourceslots[lastslot] = slot;
                }
            }
        }
    }
}

/**
 * 
 * @param {!Send} send
 *
 */
function cleanupSender(send) {
    /** @type {number} */
    var ln;
    var node1 = send._node1;
    var nodes = send._nodes;
    if (node1 !== null) {
        forgetSender(node1, send._node1slot);
        send._node1 = null;
    }
    if (nodes !== null && (ln = nodes.length) !== 0) {
        var nodeslots = send._nodeslots;
        for (; ln-- !== 0;) {
            forgetSender(nodes.pop(), nodeslots.pop());
        }
    }
}

/**
 * 
 * @param {!Receive} receive 
 * @param {number} slot
 *
 */
function forgetSender(receive, slot) {
    if ((receive._state & State.DisposeFlags) === 0) {
        if (slot === -1) {
            receive._source1 = null;
        } else {
            var sources = receive._sources;
            var sourceslots = receive._sourceslots;
            var last = sources.pop();
            var lastslot = sourceslots.pop();
            if (slot !== sources.length) {
                sources[slot] = last;
                sourceslots[slot] = lastslot;
                if (lastslot === -1) {
                    last._node1slot = slot;
                } else {
                    last._nodeslots[lastslot] = slot;
                }
            }
        }
    }
}

export {
    root, dispose, val, owner,
    compute, $compute, when,
    data, value, nil, freeze, recover,
    cleanup, Data, Value, Computation
};
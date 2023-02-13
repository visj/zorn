var { root, compute, effect, data } = require('./helper/zorn');;

var assert = require('assert');

describe("Computations which modify data", function () {
    it("freeze data while executing computation", function () {
        root(function () {
            var a = data(false);
            var b = data(0);
            var cb;
            effect(function () {
                if (a.val) {
                    b.val = 1;
                    cb = b.val;
                    a.val = false;
                }
            });

            b.val = 0;
            a.val = true;

            assert.equal(b.val, 1);
            assert.equal(cb, 0);
        });
    });

    it("freeze data while propagating", function () {
        root(function () {
            var seq = "";
            var a = data(false);
            var b = data(0);
            var db;
            effect(function () {
                if (a.val) {
                    seq += "c";
                    b.val = 1;
                    a.val = false;
                }
            });
            effect(function () {
                if (a.val) {
                    seq += "d";
                    db = b.val;
                }
            });

            b.val = 0;
            seq = "";
            a.val = true;

            assert.equal(seq, "cd");
            assert.equal(b.val, 1);
            assert.equal(db, 0); // d saw b(0) even though it ran after c whcih modified b() to b(1)
        });
    });

    it("continue running until changes stop", function () {
        root(function () {
            var seq = "";
            var a = data(0);

            effect(function () {
                seq += a.val;
                if (a.val < 10) {
                    a.val++;
                }
            });

            assert.equal(seq, "012345678910");
            assert.equal(a.val, 10);
        });
    });

    it("propagate changes topologically", function () {
        root(function () {
            //
            //    d1      d2
            //    |  \  /  |
            //    |   c1   |
            //    |   ^    |
            //    |   :    |
            //    b1  b2  b3 
            //      \ | /
            //        a1
            //
            var seq = "",
                a1 = data(0),
                c1 = data(0),
                b1 = compute(function () { a1.val; }),
                b2 = compute(function () { c1.val = a1.val; }),
                b3 = compute(function () { a1.val; }),
                d1 = compute(function () { b1.val; seq += "c4(" + c1.val + ")"; }),
                d2 = compute(function () { b3.val; seq += "c5(" + c1.val + ")"; });

            seq = "";
            a1.val = 1;

            assert.equal(seq, "c4(0)c5(0)c4(1)c5(1)");
        });
    });
})

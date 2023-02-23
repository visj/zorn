import { test, root, batch, array, dispose, cleanup, effect, compute, value, Mut } from './helper/zorn.js';

describe("array", function () {

    describe("mutations", function() {
        describe("set", function() {
            it("should set an array value", function() {
                var a = array([1, 2, 3]);
                a.set([4, 5, 6]);
                test.equals(a.val, [4, 5, 6]);
            });

            it("should set a value at index", function() {
                var a = array([1, 2, 3]);
                a.set(0, 4);
                test.equals(a.val, [4, 2, 3]);
            });

            it("works at the end of the array", function() {
                var a = array([1, 2, 3]);
                a.set(2, 4);
                test.equals(a.val, [1, 2, 4]);
            });

            it("sets beyond the end of the array", function() {
                var a = array([1, 2, 3]);
                a.set(3, 4);
                test.equals(a.val, [1, 2, 3, 4]);
            });

            it("sets at index larger than length and creates gaps in array", function() {
                var a = array([1, 2, 3]);
                a.set(5, 4);
                test.equals(a.val, [1, 2, 3, undefined, undefined, 4]);
            });

            it("throws if mutation is set", function() {
                var a = array([1,2,3]);
                test.throws(function() {
                    batch(function() {
                        a.set([1]);
                        a.set([1]);
                    });
                });
            });

            it("ignores set if no arguments are provided", function() {
                var a = array([1, 2, 3]);
                var count = 0;
                effect(function() {
                    count++;
                    a.val;
                })
                a.set();
                test.equals(count , 1);
            });
        });

        describe("pop", function() {
            it("should remove an element", function() {
                var a = array([1, 2, 3]);
                a.pop();
                test.equals(a.val, [1, 2]);
            });

            it("should not send update if empty", function() {
                var a = array([]);
                var count = 0;
                effect(function() {
                    count++;
                    a.val;
                })
                a.pop();
                test.equals(count , 1);
            });

            it("throws if mutation is set", function() {
                var a = array([1,2,3]);
                test.throws(function() {
                    batch(function() {
                        a.pop();
                        a.pop();
                    });
                });
            });
        });

        describe("push", function() {
            it("should add a new element", function() {
                var a = array([1, 2, 3]);
                a.push(4);
                test.equals(a.val, [1, 2, 3, 4]);
            });

            it("should add multiple elements", function() {
                var a = array([1, 2, 3]);
                a.push(4, 5, 6);
                test.equals(a.val, [1, 2, 3, 4, 5, 6]);
            });

            it("should not push undefined when no arguments are provided", function() {
                var a = array([1, 2, 3]);
                a.push();
                test.equals(a.val, [1, 2, 3]);
            });

            it("throws if mutation is set", function() {
                var a = array([1,2,3]);
                test.throws(function() {
                    batch(function() {
                        a.push(1);
                        a.push(1);
                    });
                });
            });

            it("works for empty arrays", function() {
                var a = array([]);
                a.push(1);
                test.equals(a.val, [1]);
            });

            it("works with multiple items for empty arrays", function() {
                var a = array([]);
                a.push(1, 2, 3);
                test.equals(a.val, [1, 2, 3]);
            });
        });

        describe("splice", function() {

            it("should remove an element", function() {
                var a = array([1, 2, 3]);
                a.splice(1, 1);
                test.equals(a.val, [1, 3]);
                test.equals(a.mut()[0], Mut.RemoveOne);
            });

            it("should insert an element", function() {
                var a = array([1, 2, 3]);
                a.splice(1, 0, 4);
                test.equals(a.val, [1, 4, 2, 3]);
                test.equals(a.mut()[0], Mut.InsertOne);
            });

            it("should replace an element", function() {
                var a = array([1, 2, 3]);
                a.splice(1, 1, 4);
                test.equals(a.val, [1, 4, 3]);
                test.equals(a.mut()[0], Mut.ReplaceOne);
            });

            it("converts insertion at index 0 as unshift", function() {
                var a = array([1, 2, 3]);
                a.splice(0, 0, 4);
                test.equals(a.val, [4, 1, 2, 3]);
                test.equals(a.mut()[0], Mut.InsertOne | Mut.Head);
            });

            it("converts insertion at index length as push", function() {
                var a = array([1, 2, 3]);
                a.splice(3, 0, 4);
                test.equals(a.val, [1, 2, 3, 4]);
                test.equals(a.mut()[0], Mut.InsertOne | Mut.Tail);
            });

            it("should insert multiple elements", function() {
                var a = array([1, 2, 3]);
                a.splice(1, 0, 4, 5, 6);
                test.equals(a.val, [1, 4, 5, 6, 2, 3]);
                test.equals(a.mut()[0], Mut.InsertRange);
            });

            it("should remove multiple elements and replace with one", function() {
                var a = array([1, 2, 3, 4, 5]);
                a.splice(1, 3, 6);
                test.equals(a.val, [1, 6, 5]);
                test.equals(a.mut()[0], Mut.ReplaceOne | Mut.RemoveRange);
            });

            it("correctly infers replace insert params", function() {
                var a = array([1, 2, 3]);
                a.splice(1, 1, 4, 5);
                test.equals(a.val, [1, 4, 5, 3]);
                test.equals(a.mut()[0], Mut.ReplaceOne | Mut.InsertOne);
            });
        });
    });
});
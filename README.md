# Promise Pool Manager

The idea is to realize the same API of `Promise.all`, something like `PromisePool.all`. While `Promise.all` takes a iterable of Promises as an argument, `PromisePoll.all` will take a iterable of _Promise Factory_: function objects, each returning a Promise.

    Promise.all: (promiseList: Promise<T>[]) => Promise<T[]>;
    PromisePool.all: (promiseFactoryList: (() => Promise<T>)[]) => Promise<T[]>;

The implementation is in `pool.ts`.

The example usage is in `App.tsx`.
